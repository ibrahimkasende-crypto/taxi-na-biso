-- Profils TAXI NA BISO pour les utilisateurs Auth déjà créés dans le dashboard.
-- Ne touche pas auth.users (pas d'insert / delete / changement d'UUID).
-- Idempotent : relancer ne duplique pas les profils ni le véhicule démo.

insert into public.operators (
  id, name, legal_name, contact_email, support_phone,
  branding_primary_color, timezone, currency, country, state
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Taxi Na Biso',
  'Taxi Na Biso',
  'hello@taxinabiso.com',
  '+243800000000',
  '#F04A18',
  'Africa/Kinshasa',
  'CDF',
  'CD',
  'Kinshasa'
)
on conflict (id) do update set
  name = excluded.name,
  legal_name = excluded.legal_name,
  updated_at = now();

do $$
declare
  v_op uuid := '00000000-0000-0000-0000-000000000001';
  v_client uuid;
  v_driver uuid;
  v_admin uuid;
  v_vehicle uuid := '33333333-3333-3333-3333-333333333301';
begin
  select id into v_client from auth.users where lower(email) = 'taxinabiso@client.com' limit 1;
  select id into v_driver from auth.users where lower(email) = 'taxinabiso@chauffeur.com' limit 1;
  select id into v_admin from auth.users where lower(email) = 'admin@taxinabiso.com' limit 1;

  if v_client is not null then
    insert into public.users (id, email, display_name, role, is_active, operator_id)
    values (v_client, 'taxinabiso@client.com', 'Taxi Na Biso Client Demo', 'rider', true, v_op)
    on conflict (id) do update set
      email = excluded.email,
      display_name = excluded.display_name,
      role = 'rider',
      is_active = true,
      operator_id = v_op,
      updated_at = now();

    insert into public.rider_profiles (user_id, operator_id, home_label, home_point)
    values (
      v_client, v_op, 'Gombe — Kinshasa',
      st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography
    )
    on conflict (user_id) do update set
      operator_id = excluded.operator_id,
      home_label = excluded.home_label,
      home_point = excluded.home_point,
      updated_at = now();

    insert into public.notification_preferences (user_id, operator_id)
    values (v_client, v_op)
    on conflict (user_id) do nothing;
  end if;

  if v_driver is not null then
    insert into public.users (id, email, display_name, role, is_active, operator_id)
    values (v_driver, 'taxinabiso@chauffeur.com', 'Taxi Na Biso Chauffeur Demo', 'driver', true, v_op)
    on conflict (id) do update set
      email = excluded.email,
      display_name = excluded.display_name,
      role = 'driver',
      is_active = true,
      operator_id = v_op,
      updated_at = now();

    insert into public.driver_profiles (
      user_id, operator_id, status, licence_number, licence_class,
      licence_expiry, authority_number, authority_expiry
    )
    values (
      v_driver, v_op, 'approved', 'DL-TNB-01', 'C',
      current_date + interval '3 years', 'AUTH-TNB-01', current_date + interval '11 months'
    )
    on conflict (user_id) do update set
      operator_id = excluded.operator_id,
      status = 'approved',
      licence_number = excluded.licence_number,
      licence_class = excluded.licence_class,
      licence_expiry = excluded.licence_expiry,
      authority_number = excluded.authority_number,
      authority_expiry = excluded.authority_expiry,
      updated_at = now();

    insert into public.notification_preferences (user_id, operator_id)
    values (v_driver, v_op)
    on conflict (user_id) do nothing;

    insert into public.vehicles (
      id, operator_id, rego, make, model, year, color, vehicle_type,
      seat_capacity, fuel_type, status, default_driver_id
    )
    values (
      v_vehicle, v_op, 'DEMO-TNB-01', 'Toyota', 'Corolla', 2023, 'Noir',
      'sedan', 4, 'petrol', 'active', v_driver
    )
    on conflict (id) do update set
      operator_id = excluded.operator_id,
      rego = excluded.rego,
      make = excluded.make,
      model = excluded.model,
      color = excluded.color,
      status = 'active',
      default_driver_id = v_driver,
      updated_at = now();

    update public.driver_profiles
    set last_known_vehicle_id = v_vehicle, updated_at = now()
    where user_id = v_driver;
  end if;

  if v_admin is not null then
    insert into public.users (id, email, display_name, role, is_active, operator_id)
    values (v_admin, 'admin@taxinabiso.com', 'Taxi Na Biso Administrateur', 'admin', true, v_op)
    on conflict (id) do update set
      email = excluded.email,
      display_name = excluded.display_name,
      role = 'admin',
      is_active = true,
      operator_id = v_op,
      updated_at = now();

    insert into public.notification_preferences (user_id, operator_id)
    values (v_admin, v_op)
    on conflict (user_id) do nothing;
  end if;
end $$;
