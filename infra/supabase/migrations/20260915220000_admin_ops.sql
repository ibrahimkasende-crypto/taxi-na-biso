-- Centre de pilotage Admin : tarifs publics, notifications, messagerie, attribution.

create table if not exists public.fleet_rates (
  operator_id uuid not null references public.operators(id) on delete cascade,
  category text not null,
  hourly_usd numeric not null,
  daily_usd numeric not null,
  updated_at timestamptz not null default now(),
  primary key (operator_id, category),
  constraint fleet_rates_category_chk check (
    category in ('basic', 'confort', 'premium', 'familiale', 'familiale_premium', '4x4')
  )
);

alter table public.vehicles add column if not exists fleet_category text;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'vehicles_fleet_category_chk') then
    alter table public.vehicles add constraint vehicles_fleet_category_chk
      check (fleet_category is null or fleet_category in ('basic', 'confort', 'premium', 'familiale', 'familiale_premium', '4x4'));
  end if;
end $$;

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (operator_id, created_at desc)
  where read_at is null;

create table if not exists public.ops_conversations (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  party_name text not null,
  party_role text not null default 'rider',
  party_phone text,
  subject text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.ops_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ops_conversations(id) on delete cascade,
  sender text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists ops_messages_conv_idx on public.ops_messages (conversation_id, created_at);

alter table public.fleet_rates enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.ops_conversations enable row level security;
alter table public.ops_messages enable row level security;
alter table public.admin_notifications replica identity full;
alter table public.booking_requests replica identity full;

grant select on public.fleet_rates to anon, authenticated;
grant select, insert, update, delete on public.fleet_rates to authenticated;
grant select, insert, update on public.admin_notifications to authenticated;
grant select, insert, update on public.ops_conversations to authenticated;
grant select, insert on public.ops_messages to authenticated;

drop policy if exists fleet_rates_public_read on public.fleet_rates;
drop policy if exists fleet_rates_staff_write on public.fleet_rates;
drop policy if exists admin_notifications_staff on public.admin_notifications;
drop policy if exists ops_conversations_staff on public.ops_conversations;
drop policy if exists ops_messages_staff on public.ops_messages;

create policy fleet_rates_public_read on public.fleet_rates
  for select to anon, authenticated using (true);
create policy fleet_rates_staff_write on public.fleet_rates
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy admin_notifications_staff on public.admin_notifications
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy ops_conversations_staff on public.ops_conversations
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy ops_messages_staff on public.ops_messages
  for all to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.ops_conversations c
      where c.id = conversation_id and c.operator_id = public.auth_operator()
    )
  )
  with check (public.is_staff());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'admin_notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.admin_notifications';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'ops_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.ops_messages';
  end if;
end $$;

insert into public.fleet_rates (operator_id, category, hourly_usd, daily_usd) values
  ('00000000-0000-0000-0000-000000000001', 'basic', 7, 60),
  ('00000000-0000-0000-0000-000000000001', 'confort', 8, 60),
  ('00000000-0000-0000-0000-000000000001', 'premium', 11, 80),
  ('00000000-0000-0000-0000-000000000001', 'familiale', 11, 80),
  ('00000000-0000-0000-0000-000000000001', 'familiale_premium', 12, 100),
  ('00000000-0000-0000-0000-000000000001', '4x4', 20, 160)
on conflict (operator_id, category) do update set
  hourly_usd = excluded.hourly_usd,
  daily_usd = excluded.daily_usd,
  updated_at = now();

update public.operators
set support_phone = '+243974543860',
    contact_phone = coalesce(nullif(contact_phone, ''), '+243974543860'),
    contact_email = coalesce(nullif(contact_email, ''), 'hello@taxinabiso.com'),
    branding_primary_color = coalesce(branding_primary_color, '#F5C518'),
    updated_at = now()
where id = '00000000-0000-0000-0000-000000000001';

create or replace function public.notify_admin_booking_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (operator_id, kind, title, body, href)
  values (
    new.operator_id,
    'booking_request',
    'Nouvelle demande de course',
    new.reference || ' — ' || new.customer_name,
    '/admin/demandes/' || new.id::text
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_admin_booking_request on public.booking_requests;
create trigger trg_notify_admin_booking_request
  after insert on public.booking_requests
  for each row execute function public.notify_admin_booking_request();

create or replace function public.admin_assign_trip(p_trip_id uuid, p_driver_id uuid, p_force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip public.trips;
  v_driver public.driver_profiles;
  v_online boolean;
  v_busy boolean;
  v_vehicle uuid;
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;
  select * into v_trip from public.trips where id = p_trip_id for update;
  if not found then raise exception 'not_found'; end if;
  if v_trip.status not in ('requested', 'scheduled', 'requires_manual_dispatch', 'assigned') then
    raise exception 'invalid_status';
  end if;
  select * into v_driver from public.driver_profiles where user_id = p_driver_id;
  if not found then raise exception 'driver_not_found'; end if;
  if v_driver.status = 'suspended' then raise exception 'driver_suspended'; end if;

  select exists (
    select 1 from public.driver_status
    where driver_id = p_driver_id and ended_at is null and status <> 'offline'
  ) into v_online;
  select exists (
    select 1 from public.trips
    where driver_id = p_driver_id
      and id <> p_trip_id
      and status in ('assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress')
  ) into v_busy;
  if (not v_online or v_busy) and not p_force then
    return jsonb_build_object(
      'ok', false,
      'warning', case
        when v_busy then 'Ce chauffeur a déjà une course en cours.'
        else 'Ce chauffeur n’est pas en ligne.'
      end
    );
  end if;

  v_vehicle := v_driver.last_known_vehicle_id;
  update public.trips
  set driver_id = p_driver_id,
      vehicle_id = coalesce(v_vehicle, vehicle_id),
      status = 'assigned',
      assigned_at = now(),
      updated_at = now()
  where id = p_trip_id
  returning * into v_trip;

  insert into public.admin_notifications (operator_id, kind, title, body, href)
  values (
    v_trip.operator_id,
    'trip_assigned',
    'Chauffeur attribué',
    'Course attribuée',
    '/admin/courses/' || v_trip.id::text
  );

  return jsonb_build_object('ok', true, 'trip_id', v_trip.id, 'driver_id', p_driver_id, 'status', v_trip.status);
end;
$$;

grant execute on function public.admin_assign_trip(uuid, uuid, boolean) to authenticated;

create or replace function public.admin_mark_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;
  update public.admin_notifications
  set read_at = now()
  where operator_id = public.auth_operator() and read_at is null;
end;
$$;

grant execute on function public.admin_mark_notifications_read() to authenticated;

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

  select hourly_usd, daily_usd into v_hourly, v_daily
  from public.fleet_rates
  where operator_id = v_op and category = v_cat;
  if v_hourly is null then
    v_hourly := case v_cat
      when 'basic' then 7 when 'confort' then 8 when 'premium' then 11
      when 'familiale' then 11 when 'familiale_premium' then 12 when '4x4' then 20
    end;
    v_daily := case v_cat
      when 'basic' then 60 when 'confort' then 60 when 'premium' then 80
      when 'familiale' then 80 when 'familiale_premium' then 100 when '4x4' then 160
    end;
  end if;

  if auth.uid() is not null then
    select role into v_role from public.users where id = auth.uid();
    if v_role = 'rider' then
      v_rider := auth.uid();
    end if;
  end if;

  v_ref := coalesce(nullif(payload->>'reference', ''),
    'TNB-' || to_char((now() at time zone 'Africa/Kinshasa'), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)));

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
