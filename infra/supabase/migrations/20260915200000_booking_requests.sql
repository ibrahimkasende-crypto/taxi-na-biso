-- Demandes de courses publiques / WhatsApp, sans affaiblir RLS des bookings authentifiés.

create type public.booking_request_status as enum ('pending', 'approved', 'rejected');

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  operator_id uuid not null references public.operators(id),
  rider_id uuid references public.users(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  pickup_label text not null,
  pickup_address text,
  pickup_lat double precision not null,
  pickup_lng double precision not null,
  pickup_place_id text,
  dropoff_label text not null,
  dropoff_address text,
  dropoff_lat double precision not null,
  dropoff_lng double precision not null,
  dropoff_place_id text,
  scheduled_for timestamptz not null,
  is_now boolean not null default true,
  category text not null,
  hourly_rate_usd numeric,
  daily_rate_usd numeric,
  status public.booking_request_status not null default 'pending',
  reject_reason text,
  approved_at timestamptz,
  approved_by uuid references public.users(id),
  rejected_at timestamptz,
  rejected_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index booking_requests_status_idx on public.booking_requests(status, created_at desc);
create index booking_requests_rider_idx on public.booking_requests(rider_id, created_at desc);
create trigger trg_booking_requests_updated_at
  before update on public.booking_requests
  for each row execute function public.set_updated_at();

alter table public.booking_requests enable row level security;
alter table public.booking_requests replica identity full;

revoke all on public.booking_requests from anon, authenticated, public;
grant select on public.booking_requests to authenticated;

-- Mutations uniquement via RPC security definer (pas d’UPDATE de statut depuis le navigateur).
create policy booking_requests_self_read on public.booking_requests
  for select to authenticated
  using (rider_id = auth.uid() or public.is_staff());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'booking_requests'
  ) then
    execute 'alter publication supabase_realtime add table public.booking_requests';
  end if;
end $$;

create or replace function public.submit_booking_request(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_op uuid := '00000000-0000-0000-0000-000000000001';
  v_role public.user_role;
  v_rider uuid;
  v_cat text;
  v_hourly numeric;
  v_daily numeric;
  v_ref text;
  v_row public.booking_requests;
begin
  v_cat := coalesce(payload->>'category', '');
  if v_cat not in ('basic', 'confort', 'premium', 'familiale', 'familiale_premium', '4x4') then
    raise exception 'invalid_category';
  end if;
  if coalesce(payload->>'customer_name', '') = '' or coalesce(payload->>'customer_phone', '') = '' then
    raise exception 'invalid_customer';
  end if;
  if coalesce(payload->>'pickup_label', '') = '' or coalesce(payload->>'dropoff_label', '') = '' then
    raise exception 'invalid_places';
  end if;
  if payload->>'pickup_lat' is null or payload->>'pickup_lng' is null
     or payload->>'dropoff_lat' is null or payload->>'dropoff_lng' is null then
    raise exception 'invalid_places';
  end if;

  v_hourly := case v_cat
    when 'basic' then 7 when 'confort' then 8 when 'premium' then 11
    when 'familiale' then 11 when 'familiale_premium' then 12 when '4x4' then 20
  end;
  v_daily := case v_cat
    when 'basic' then 60 when 'confort' then 60 when 'premium' then 80
    when 'familiale' then 80 when 'familiale_premium' then 100 when '4x4' then 160
  end;

  if auth.uid() is not null then
    select role into v_role from public.users where id = auth.uid();
    if v_role = 'rider' then
      v_rider := auth.uid();
    end if;
  end if;

  v_ref := 'TNB-' || to_char((now() at time zone 'Africa/Kinshasa'), 'YYYYMMDD') || '-' ||
           upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));

  insert into public.booking_requests (
    reference, operator_id, rider_id, customer_name, customer_phone,
    pickup_label, pickup_address, pickup_lat, pickup_lng, pickup_place_id,
    dropoff_label, dropoff_address, dropoff_lat, dropoff_lng, dropoff_place_id,
    scheduled_for, is_now, category, hourly_rate_usd, daily_rate_usd, status
  ) values (
    v_ref, v_op, v_rider,
    payload->>'customer_name', payload->>'customer_phone',
    payload->>'pickup_label', payload->>'pickup_address',
    (payload->>'pickup_lat')::double precision, (payload->>'pickup_lng')::double precision,
    payload->>'pickup_place_id',
    payload->>'dropoff_label', payload->>'dropoff_address',
    (payload->>'dropoff_lat')::double precision, (payload->>'dropoff_lng')::double precision,
    payload->>'dropoff_place_id',
    coalesce((payload->>'scheduled_for')::timestamptz, now()),
    coalesce((payload->>'is_now')::boolean, true),
    v_cat, v_hourly, v_daily, 'pending'
  ) returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'reference', v_row.reference, 'status', v_row.status);
end;
$$;

grant execute on function public.submit_booking_request(jsonb) to anon, authenticated;

create or replace function public.approve_booking_request(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.booking_requests;
  v_booking_id uuid;
  v_trip_id uuid;
  v_kind public.booking_kind;
  v_trip_status public.trip_status;
  v_vehicle public.vehicle_type;
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;
  select * into v_req from public.booking_requests where id = p_id for update;
  if not found then raise exception 'not_found'; end if;
  if v_req.status <> 'pending' then raise exception 'invalid_status'; end if;

  v_vehicle := case v_req.category
    when '4x4' then 'suv'::public.vehicle_type
    when 'familiale' then 'van'::public.vehicle_type
    when 'familiale_premium' then 'van'::public.vehicle_type
    else 'sedan'::public.vehicle_type
  end;
  v_kind := case when v_req.is_now then 'now'::public.booking_kind else 'scheduled'::public.booking_kind end;
  v_trip_status := case when v_req.is_now then 'requested'::public.trip_status else 'scheduled'::public.trip_status end;

  if v_req.rider_id is not null then
    insert into public.bookings (
      rider_id, operator_id, type, pickup_label, pickup_point, dropoff_label, dropoff_point,
      vehicle_type_requested, scheduled_pickup_at, status, notes
    ) values (
      v_req.rider_id, v_req.operator_id, v_kind, v_req.pickup_label,
      st_setsrid(st_makepoint(v_req.pickup_lng, v_req.pickup_lat), 4326)::geography,
      v_req.dropoff_label,
      st_setsrid(st_makepoint(v_req.dropoff_lng, v_req.dropoff_lat), 4326)::geography,
      v_vehicle,
      case when v_req.is_now then null else v_req.scheduled_for end,
      'active',
      v_req.reference
    ) returning id into v_booking_id;

    insert into public.trips (
      booking_id, rider_id, operator_id, status, pickup_point, dropoff_point,
      pickup_address, dropoff_address, requested_at
    ) values (
      v_booking_id, v_req.rider_id, v_req.operator_id, v_trip_status,
      st_setsrid(st_makepoint(v_req.pickup_lng, v_req.pickup_lat), 4326)::geography,
      st_setsrid(st_makepoint(v_req.dropoff_lng, v_req.dropoff_lat), 4326)::geography,
      v_req.pickup_label, v_req.dropoff_label, now()
    ) returning id into v_trip_id;
  end if;

  update public.booking_requests
  set status = 'approved',
      approved_at = now(),
      approved_by = auth.uid(),
      booking_id = v_booking_id,
      trip_id = v_trip_id,
      updated_at = now()
  where id = p_id
  returning * into v_req;

  return jsonb_build_object(
    'id', v_req.id, 'reference', v_req.reference, 'status', v_req.status,
    'booking_id', v_req.booking_id, 'trip_id', v_req.trip_id
  );
end;
$$;

grant execute on function public.approve_booking_request(uuid) to authenticated;

create or replace function public.reject_booking_request(p_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.booking_requests;
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;
  update public.booking_requests
  set status = 'rejected',
      reject_reason = nullif(p_reason, ''),
      rejected_at = now(),
      rejected_by = auth.uid(),
      updated_at = now()
  where id = p_id and status = 'pending'
  returning * into v_req;
  if not found then raise exception 'not_found'; end if;
  return jsonb_build_object('id' , v_req.id, 'reference', v_req.reference, 'status', v_req.status);
end;
$$;

grant execute on function public.reject_booking_request(uuid, text) to authenticated;
