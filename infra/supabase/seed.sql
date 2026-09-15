-- Taxi Na Biso demo seed.
-- Run automatically by `supabase db reset` (and via `make reset`).
-- Idempotent: safe to re-run.
-- Comptes principaux (dev uniquement) : mot de passe 123456
--   taxinabiso@client.com      rôle rider
--   taxinabiso@chauffeur.com   rôle driver
--   admin@taxinabiso.com       rôle admin

-- ============================================================================
-- Operator
-- ============================================================================
insert into public.operators (id, name, legal_name, abn, contact_email, support_phone,
                              branding_primary_color, timezone, currency, country, state)
values
  ('00000000-0000-0000-0000-000000000001',
   'Ridge Co-op',
   'Ridge Cooperative Transport Pty Ltd',
   '12 345 678 901',
   'hello@taxinabiso.com',
   '+61 2 5555 0100',
   '#1f6feb',
   'Australia/Sydney',
   'AUD',
   'AU',
   'NSW')
on conflict (id) do nothing;

-- ============================================================================
-- App config defaults
-- ============================================================================
-- app_config is per-operator since the Phase 9 multitenant migration
-- (PK is (operator_id, key), operator_id NOT NULL), so stamp the default operator.
insert into public.app_config (operator_id, key, value, description)
select '00000000-0000-0000-0000-000000000001', key, value, description
from (values
  ('dispatch.offer_timeout_s', '15'::jsonb, 'Seconds a driver has to respond to an offer'),
  ('dispatch.max_attempts', '5'::jsonb, 'Max consecutive offers before manual fallback'),
  ('dispatch.search_radius_m', '10000'::jsonb, 'Initial driver search radius in metres'),
  ('fatigue.max_drive_time_s', '43200'::jsonb, '12h hard cap on rolling drive time'),
  ('fatigue.rest_after_lockout_s', '36000'::jsonb, '10h required rest after lockout'),
  ('retention.trip_locations_days', '90'::jsonb, 'How long to keep raw GPS trail'),
  ('retention.records_years', '7'::jsonb, 'How long to keep trip/payment/incident records'),
  ('booking.scheduled_lookahead_min', '15'::jsonb, 'Promote scheduled trips this many minutes before pickup')
) as t(key, value, description)
on conflict (operator_id, key) do update set value = excluded.value;

-- ============================================================================
-- Compliance rules — AU baseline
-- ============================================================================
insert into public.compliance_rules (country, state, applies_to, doc_type, is_required, validity_window_days, notes) values
  ('AU', null, 'driver',  'licence_front', true, null, 'Australian driver licence — front'),
  ('AU', null, 'driver',  'licence_back',  true, null, 'Australian driver licence — back'),
  ('AU', null, 'driver',  'authority',     true, 365, 'Driver authority — typically renewed annually'),
  ('AU', null, 'driver',  'photo',         true, null, 'Recent ID photo'),
  ('AU', null, 'vehicle', 'ctp',           true, 365, 'Compulsory Third Party insurance'),
  ('AU', null, 'vehicle', 'insurance',     true, 365, 'Comprehensive insurance certificate'),
  ('AU', null, 'vehicle', 'authority',     true, 365, 'Vehicle authorisation / booked-hire licence'),
  ('AU', null, 'vehicle', 'coi',           true, 365, 'Certificate of Inspection')
on conflict (country, coalesce(state, ''), applies_to, doc_type) do update
  set is_required = excluded.is_required,
      validity_window_days = excluded.validity_window_days,
      notes = excluded.notes;

-- ============================================================================
-- Fare rules
-- ============================================================================
insert into public.fare_rules (id, name, vehicle_type, base_cents, per_km_cents, per_min_cents,
                               minimum_cents, booking_fee_cents, cancellation_fee_cents,
                               night_surcharge_pct, airport_surcharge_cents, is_active)
values
  ('11111111-1111-1111-1111-111111111101',
   'Sedan — standard', 'sedan', 350, 220, 65, 1200, 150, 800, 20, 500, true),
  ('11111111-1111-1111-1111-111111111102',
   'Wheelchair accessible — standard', 'wheelchair_accessible', 400, 250, 65, 1500, 0, 800, 20, 500, true)
on conflict (id) do nothing;

-- ============================================================================
-- Demo accounts
--
-- These insert directly into auth.users to keep the seed self-contained.
-- Passwords are bcrypt-hashed. Local-dev only — rotate before any real deploy.
-- ============================================================================

-- Helper: insert auth user idempotently
do $$
declare
  v_pwd text := crypt('123456', gen_salt('bf'));
begin
  -- Admin Taxi Na Biso (rôle réel `admin`, pas un if e-mail)
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                          created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222201',
     'authenticated', 'authenticated',
     'admin@taxinabiso.com', v_pwd, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"admin","display_name":"Taxi Na Biso Administrateur"}'::jsonb,
     now(), now())
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    raw_user_meta_data = excluded.raw_user_meta_data,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now();

  -- Dispatcher
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                          created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222202',
     'authenticated', 'authenticated',
     'dispatcher@demo.openride', v_pwd, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"dispatcher","display_name":"Dani Disp"}'::jsonb,
     now(), now())
  on conflict (id) do update set
    encrypted_password = excluded.encrypted_password,
    updated_at = now();

  -- Drivers (le chauffeur TNB a e-mail + téléphone)
  insert into auth.users (instance_id, id, aud, role, email, phone, encrypted_password,
                          email_confirmed_at, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                          created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222210',
     'authenticated', 'authenticated',
     'taxinabiso@chauffeur.com', '61400000010', v_pwd, now(), now(),
     '{"provider":"email","providers":["email","phone"]}'::jsonb,
     '{"role":"driver","display_name":"Taxi Na Biso Chauffeur Demo"}'::jsonb,
     now(), now()),
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222211',
     'authenticated', 'authenticated',
     'daria@demo.openride', '61400000011', v_pwd, now(), now(),
     '{"provider":"email","providers":["email","phone"]}'::jsonb,
     '{"role":"driver","display_name":"Daria Driver"}'::jsonb,
     now(), now()),
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222212',
     'authenticated', 'authenticated',
     'devin@demo.openride', '61400000012', v_pwd, now(), now(),
     '{"provider":"email","providers":["email","phone"]}'::jsonb,
     '{"role":"driver","display_name":"Devin Driver"}'::jsonb,
     now(), now())
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now();

  -- Riders (le client TNB a e-mail + téléphone)
  insert into auth.users (instance_id, id, aud, role, email, phone, encrypted_password,
                          email_confirmed_at, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                          created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222220',
     'authenticated', 'authenticated',
     'taxinabiso@client.com', '61400000020', v_pwd, now(), now(),
     '{"provider":"email","providers":["email","phone"]}'::jsonb,
     '{"role":"rider","display_name":"Taxi Na Biso Client Demo"}'::jsonb,
     now(), now()),
    ('00000000-0000-0000-0000-000000000000',
     '22222222-2222-2222-2222-222222222221',
     'authenticated', 'authenticated',
     'roman@demo.openride', '61400000021', v_pwd, now(), now(),
     '{"provider":"email","providers":["email","phone"]}'::jsonb,
     '{"role":"rider","display_name":"Roman Rider"}'::jsonb,
     now(), now())
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now();

  -- GoTrue (the auth server) scans these columns into Go strings on login and
  -- errors with "Database error querying schema" if any are NULL. Inserting
  -- auth.users rows directly via SQL leaves them NULL, so normalise to ''.
  update auth.users set
    confirmation_token         = coalesce(confirmation_token, ''),
    recovery_token             = coalesce(recovery_token, ''),
    email_change               = coalesce(email_change, ''),
    email_change_token_new     = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change               = coalesce(phone_change, ''),
    phone_change_token         = coalesce(phone_change_token, ''),
    reauthentication_token     = coalesce(reauthentication_token, '')
  where id in (
    '22222222-2222-2222-2222-222222222201',
    '22222222-2222-2222-2222-222222222202',
    '22222222-2222-2222-2222-222222222210',
    '22222222-2222-2222-2222-222222222211',
    '22222222-2222-2222-2222-222222222212',
    '22222222-2222-2222-2222-222222222220',
    '22222222-2222-2222-2222-222222222221'
  );
end $$;

-- The handle_new_auth_user trigger has already created the public.users + profile rows.
-- We still finalise role + display_name and approve the demo drivers.

update public.users set
  role = 'admin', display_name = 'Taxi Na Biso Administrateur', email = 'admin@taxinabiso.com'
where id = '22222222-2222-2222-2222-222222222201';

update public.users set
  role = 'dispatcher', display_name = 'Dani Disp'
where id = '22222222-2222-2222-2222-222222222202';

-- Drivers + driver_profiles (ensure profile row exists; trigger may have created based on metadata)
insert into public.driver_profiles (user_id, status, licence_number, licence_class,
                                    licence_expiry, authority_number, authority_expiry)
values
  ('22222222-2222-2222-2222-222222222210', 'approved', 'DL10000010', 'C', current_date + interval '3 years', 'AUTH-2210', current_date + interval '11 months'),
  ('22222222-2222-2222-2222-222222222211', 'approved', 'DL10000011', 'C', current_date + interval '2 years', 'AUTH-2211', current_date + interval '8 months'),
  ('22222222-2222-2222-2222-222222222212', 'pending_review', 'DL10000012', 'C', current_date + interval '4 years', 'AUTH-2212', current_date + interval '6 months')
on conflict (user_id) do update set
  status = excluded.status,
  licence_number = excluded.licence_number,
  licence_class = excluded.licence_class,
  licence_expiry = excluded.licence_expiry,
  authority_number = excluded.authority_number,
  authority_expiry = excluded.authority_expiry;

update public.users set role = 'driver', display_name = 'Taxi Na Biso Chauffeur Demo', email = 'taxinabiso@chauffeur.com'
where id = '22222222-2222-2222-2222-222222222210';
update public.users set role = 'driver' where id in (
  '22222222-2222-2222-2222-222222222211',
  '22222222-2222-2222-2222-222222222212'
);

-- Riders
insert into public.rider_profiles (user_id, home_label, home_point)
values
  ('22222222-2222-2222-2222-222222222220', 'Gombe — Kinshasa', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography),
  ('22222222-2222-2222-2222-222222222221', 'Limete — Kinshasa', st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography)
on conflict (user_id) do update set home_label = excluded.home_label, home_point = excluded.home_point;

update public.users set
  role = 'rider',
  display_name = 'Taxi Na Biso Client Demo',
  email = 'taxinabiso@client.com'
where id = '22222222-2222-2222-2222-222222222220';

-- ============================================================================
-- Vehicles
-- ============================================================================
insert into public.vehicles (id, rego, make, model, year, color, vehicle_type, seat_capacity, fuel_type, status, default_driver_id)
values
  ('33333333-3333-3333-3333-333333333301', 'DEMO-TNB-01', 'Toyota', 'Corolla', 2023, 'Noir',  'sedan', 4, 'petrol', 'active', '22222222-2222-2222-2222-222222222210'),
  ('33333333-3333-3333-3333-333333333302', 'EV-002',  'BYD',    'Atto 3',       2024, 'Blue',   'sedan', 4, 'bev',    'active', '22222222-2222-2222-2222-222222222211'),
  ('33333333-3333-3333-3333-333333333303', 'WAV-003', 'Toyota', 'HiAce WAV',    2022, 'Silver', 'wheelchair_accessible', 6, 'diesel', 'active', null)
on conflict (id) do update set
  rego = excluded.rego,
  make = excluded.make,
  model = excluded.model,
  color = excluded.color,
  fuel_type = excluded.fuel_type,
  status = excluded.status;

-- Driver documents (all approved + future expiry)
insert into public.driver_documents (driver_id, doc_type, storage_path, issued_on, expires_on, status)
values
  ('22222222-2222-2222-2222-222222222210', 'licence_front', 'demo/drivers/2210/licence-front.jpg', current_date - interval '1 year', current_date + interval '3 years', 'approved'),
  ('22222222-2222-2222-2222-222222222210', 'licence_back',  'demo/drivers/2210/licence-back.jpg',  current_date - interval '1 year', current_date + interval '3 years', 'approved'),
  ('22222222-2222-2222-2222-222222222210', 'authority',     'demo/drivers/2210/authority.pdf',     current_date - interval '1 month', current_date + interval '11 months', 'approved'),
  ('22222222-2222-2222-2222-222222222210', 'photo',         'demo/drivers/2210/photo.jpg',         current_date - interval '1 month', null, 'approved'),
  ('22222222-2222-2222-2222-222222222211', 'licence_front', 'demo/drivers/2211/licence-front.jpg', current_date - interval '2 years', current_date + interval '2 years', 'approved'),
  ('22222222-2222-2222-2222-222222222211', 'licence_back',  'demo/drivers/2211/licence-back.jpg',  current_date - interval '2 years', current_date + interval '2 years', 'approved'),
  ('22222222-2222-2222-2222-222222222211', 'authority',     'demo/drivers/2211/authority.pdf',     current_date - interval '4 months', current_date + interval '8 months', 'approved'),
  ('22222222-2222-2222-2222-222222222211', 'photo',         'demo/drivers/2211/photo.jpg',         current_date - interval '4 months', null, 'approved')
on conflict do nothing;

-- Vehicle documents
insert into public.vehicle_documents (vehicle_id, doc_type, storage_path, issued_on, expires_on, status)
values
  ('33333333-3333-3333-3333-333333333301', 'ctp',       'demo/vehicles/3301/ctp.pdf',       current_date - interval '6 months', current_date + interval '6 months', 'approved'),
  ('33333333-3333-3333-3333-333333333301', 'insurance', 'demo/vehicles/3301/insurance.pdf', current_date - interval '6 months', current_date + interval '6 months', 'approved'),
  ('33333333-3333-3333-3333-333333333301', 'authority', 'demo/vehicles/3301/authority.pdf', current_date - interval '2 months', current_date + interval '10 months', 'approved'),
  ('33333333-3333-3333-3333-333333333301', 'coi',       'demo/vehicles/3301/coi.pdf',       current_date - interval '2 months', current_date + interval '10 months', 'approved'),
  ('33333333-3333-3333-3333-333333333302', 'ctp',       'demo/vehicles/3302/ctp.pdf',       current_date - interval '3 months', current_date + interval '9 months', 'approved'),
  ('33333333-3333-3333-3333-333333333302', 'insurance', 'demo/vehicles/3302/insurance.pdf', current_date - interval '3 months', current_date + interval '9 months', 'approved'),
  ('33333333-3333-3333-3333-333333333302', 'authority', 'demo/vehicles/3302/authority.pdf', current_date - interval '3 months', current_date + interval '9 months', 'approved'),
  ('33333333-3333-3333-3333-333333333302', 'coi',       'demo/vehicles/3302/coi.pdf',       current_date - interval '3 months', current_date + interval '9 months', 'approved')
on conflict do nothing;

-- Vehicle inspection records
insert into public.vehicle_inspections (vehicle_id, inspection_type, performed_on, performed_by, result, next_due_on)
values
  ('33333333-3333-3333-3333-333333333301', 'coi', current_date - interval '2 months', 'AAA Auto', 'pass', current_date + interval '10 months'),
  ('33333333-3333-3333-3333-333333333302', 'coi', current_date - interval '3 months', 'AAA Auto', 'pass', current_date + interval '9 months')
on conflict do nothing;

-- ============================================================================
-- Courses de démonstration Kinshasa (client TNB + chauffeur TNB liés)
-- ============================================================================
insert into public.bookings (id, rider_id, type, pickup_label, pickup_point, dropoff_label, dropoff_point,
                             vehicle_type_requested, scheduled_pickup_at, status, created_at)
values
  ('44444444-4444-4444-4444-444444444401',
   '22222222-2222-2222-2222-222222222220', 'now',
   'Gombe', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   'Victoire', st_setsrid(st_makepoint(15.312, -4.331), 4326)::geography,
   'sedan', null, 'completed', now() - interval '3 days'),
  ('44444444-4444-4444-4444-444444444402',
   '22222222-2222-2222-2222-222222222221', 'now',
   'Limete', st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
   'Rond-point Ngaba', st_setsrid(st_makepoint(15.326, -4.378), 4326)::geography,
   'sedan', null, 'completed', now() - interval '1 day'),
  ('44444444-4444-4444-4444-444444444403',
   '22222222-2222-2222-2222-222222222220', 'now',
   'UNIKIN', st_setsrid(st_makepoint(15.310, -4.422), 4326)::geography,
   'Rond-point Ngaba', st_setsrid(st_makepoint(15.326, -4.378), 4326)::geography,
   'sedan', null, 'cancelled', now() - interval '2 days'),
  ('44444444-4444-4444-4444-444444444404',
   '22222222-2222-2222-2222-222222222220', 'scheduled',
   'Limete', st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
   'Gombe', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   'sedan', now() + interval '4 hours', 'pending', now() - interval '2 hours'),
  ('44444444-4444-4444-4444-444444444405',
   '22222222-2222-2222-2222-222222222220', 'now',
   'Victoire', st_setsrid(st_makepoint(15.312, -4.331), 4326)::geography,
   'Gombe', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   'sedan', null, 'completed', now() - interval '6 hours'),
  ('44444444-4444-4444-4444-444444444406',
   '22222222-2222-2222-2222-222222222220', 'now',
   'Gombe', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   'Limete', st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
   'sedan', null, 'active', now() - interval '20 minutes')
on conflict (id) do update set
  pickup_label = excluded.pickup_label,
  pickup_point = excluded.pickup_point,
  dropoff_label = excluded.dropoff_label,
  dropoff_point = excluded.dropoff_point,
  scheduled_pickup_at = excluded.scheduled_pickup_at,
  status = excluded.status;

insert into public.trips (id, booking_id, rider_id, driver_id, vehicle_id, status,
                          pickup_point, dropoff_point, pickup_address, dropoff_address,
                          requested_at, assigned_at, started_at, completed_at, cancelled_at, cancelled_by,
                          estimated_fare_cents, final_fare_cents, distance_m, duration_s, payment_status)
values
  ('55555555-5555-5555-5555-555555555501',
   '44444444-4444-4444-4444-444444444401',
   '22222222-2222-2222-2222-222222222220',
   '22222222-2222-2222-2222-222222222210',
   '33333333-3333-3333-3333-333333333301',
   'completed',
   st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   st_setsrid(st_makepoint(15.312, -4.331), 4326)::geography,
   'Gombe', 'Victoire',
   now() - interval '3 days',
   now() - interval '3 days' + interval '2 minutes',
   now() - interval '3 days' + interval '8 minutes',
   now() - interval '3 days' + interval '32 minutes',
   null, null,
   850000, 920000, 6200, 1440, 'paid'),
  ('55555555-5555-5555-5555-555555555502',
   '44444444-4444-4444-4444-444444444402',
   '22222222-2222-2222-2222-222222222221',
   '22222222-2222-2222-2222-222222222211',
   '33333333-3333-3333-3333-333333333303',
   'completed',
   st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
   st_setsrid(st_makepoint(15.326, -4.378), 4326)::geography,
   'Limete', 'Rond-point Ngaba',
   now() - interval '1 day',
   now() - interval '1 day' + interval '1 minute',
   now() - interval '1 day' + interval '4 minutes',
   now() - interval '1 day' + interval '14 minutes',
   null, null,
   420000, 450000, 2300, 540, 'paid'),
  ('55555555-5555-5555-5555-555555555503',
   '44444444-4444-4444-4444-444444444403',
   '22222222-2222-2222-2222-222222222220',
   '22222222-2222-2222-2222-222222222210',
   '33333333-3333-3333-3333-333333333301',
   'cancelled',
   st_setsrid(st_makepoint(15.310, -4.422), 4326)::geography,
   st_setsrid(st_makepoint(15.326, -4.378), 4326)::geography,
   'UNIKIN', 'Rond-point Ngaba',
   now() - interval '2 days',
   now() - interval '2 days' + interval '1 minute',
   null, null,
   now() - interval '2 days' + interval '6 minutes', 'rider',
   780000, null, 9100, null, 'waived'),
  ('55555555-5555-5555-5555-555555555504',
   '44444444-4444-4444-4444-444444444404',
   '22222222-2222-2222-2222-222222222220',
   null, null,
   'scheduled',
   st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
   st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   'Limete', 'Gombe',
   now() + interval '4 hours',
   null, null, null, null, null,
   900000, null, 7800, null, 'pending'),
  ('55555555-5555-5555-5555-555555555505',
   '44444444-4444-4444-4444-444444444405',
   '22222222-2222-2222-2222-222222222220',
   '22222222-2222-2222-2222-222222222210',
   '33333333-3333-3333-3333-333333333301',
   'completed',
   st_setsrid(st_makepoint(15.312, -4.331), 4326)::geography,
   st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   'Victoire', 'Gombe',
   now() - interval '6 hours',
   now() - interval '6 hours' + interval '3 minutes',
   now() - interval '6 hours' + interval '8 minutes',
   now() - interval '5 hours' + interval '40 minutes',
   null, null,
   520000, 540000, 4100, 1920, 'paid'),
  ('55555555-5555-5555-5555-555555555506',
   '44444444-4444-4444-4444-444444444406',
   '22222222-2222-2222-2222-222222222220',
   '22222222-2222-2222-2222-222222222210',
   '33333333-3333-3333-3333-333333333301',
   'assigned',
   st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
   'Gombe', 'Limete',
   now() - interval '20 minutes',
   now() - interval '12 minutes',
   null, null, null, null,
   880000, null, 7500, null, 'pending')
on conflict (id) do update set
  pickup_address = excluded.pickup_address,
  dropoff_address = excluded.dropoff_address,
  status = excluded.status,
  driver_id = excluded.driver_id,
  vehicle_id = excluded.vehicle_id,
  estimated_fare_cents = excluded.estimated_fare_cents,
  final_fare_cents = excluded.final_fare_cents,
  payment_status = excluded.payment_status,
  cancelled_at = excluded.cancelled_at,
  cancelled_by = excluded.cancelled_by;

insert into public.payments (id, trip_id, rider_id, driver_id, amount_cents, currency, status, captured_at)
values
  ('66666666-6666-6666-6666-666666666601',
   '55555555-5555-5555-5555-555555555501',
   '22222222-2222-2222-2222-222222222220',
   '22222222-2222-2222-2222-222222222210',
   920000, 'CDF', 'captured', now() - interval '3 days' + interval '32 minutes'),
  ('66666666-6666-6666-6666-666666666605',
   '55555555-5555-5555-5555-555555555505',
   '22222222-2222-2222-2222-222222222220',
   '22222222-2222-2222-2222-222222222210',
   540000, 'CDF', 'captured', now() - interval '5 hours' + interval '40 minutes')
on conflict (id) do nothing;

update public.driver_status
set ended_at = now()
where driver_id = '22222222-2222-2222-2222-222222222210'
  and ended_at is null
  and id <> '77777777-7777-7777-7777-777777777701';

insert into public.driver_status (id, driver_id, status, vehicle_id, started_at, last_heartbeat_at)
values
  ('77777777-7777-7777-7777-777777777701',
   '22222222-2222-2222-2222-222222222210',
   'online',
   '33333333-3333-3333-3333-333333333301',
   now() - interval '1 hour',
   now())
on conflict (id) do update set
  status = excluded.status,
  vehicle_id = excluded.vehicle_id,
  ended_at = null,
  last_heartbeat_at = now();

insert into public.driver_location_latest (driver_id, point, recorded_at, heading_deg)
values
  ('22222222-2222-2222-2222-222222222210',
   st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
   now(), 90)
on conflict (driver_id) do update set
  point = excluded.point,
  recorded_at = excluded.recorded_at;

insert into public.trip_offers (id, trip_id, driver_id, sent_at, responds_by, status, pickup_eta_s, distance_to_pickup_m)
values
  ('88888888-8888-8888-8888-888888888801',
   '55555555-5555-5555-5555-555555555506',
   '22222222-2222-2222-2222-222222222210',
   now() - interval '12 minutes',
   now() + interval '30 days',
   'accepted',
   240,
   900)
on conflict (id) do nothing;

-- ============================================================================
-- Comptes e-mail web (mot de passe local : 123456)
-- ============================================================================
update auth.users
set email = 'taxinabiso@client.com',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222220';

update auth.users
set email = 'roman@demo.openride',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222221';

update auth.users
set email = 'taxinabiso@chauffeur.com',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222210';

update auth.users
set email = 'daria@demo.openride',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222211';

update auth.users
set email = 'devin@demo.openride',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222212';

update auth.users
set email = 'admin@taxinabiso.com',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222201';

update public.users set email = 'taxinabiso@client.com' where id = '22222222-2222-2222-2222-222222222220';
update public.users set email = 'roman@demo.openride' where id = '22222222-2222-2222-2222-222222222221';
update public.users set email = 'taxinabiso@chauffeur.com' where id = '22222222-2222-2222-2222-222222222210';
update public.users set email = 'daria@demo.openride' where id = '22222222-2222-2222-2222-222222222211';
update public.users set email = 'devin@demo.openride' where id = '22222222-2222-2222-2222-222222222212';
update public.users set email = 'admin@taxinabiso.com' where id = '22222222-2222-2222-2222-222222222201';

-- GoTrue refuse signInWithPassword sans ligne auth.identities.
insert into auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
values
  ('22222222-2222-2222-2222-222222222301', '22222222-2222-2222-2222-222222222201', 'email', '22222222-2222-2222-2222-222222222201',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222201', 'email', 'admin@taxinabiso.com', 'email_verified', true), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222302', '22222222-2222-2222-2222-222222222202', 'email', '22222222-2222-2222-2222-222222222202',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222202', 'email', 'dispatcher@demo.openride', 'email_verified', true), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222310', '22222222-2222-2222-2222-222222222210', 'email', '22222222-2222-2222-2222-222222222210',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222210', 'email', 'taxinabiso@chauffeur.com', 'email_verified', true), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222311', '22222222-2222-2222-2222-222222222211', 'email', '22222222-2222-2222-2222-222222222211',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222211', 'email', 'daria@demo.openride', 'email_verified', true), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222312', '22222222-2222-2222-2222-222222222212', 'email', '22222222-2222-2222-2222-222222222212',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222212', 'email', 'devin@demo.openride', 'email_verified', true), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222320', '22222222-2222-2222-2222-222222222220', 'email', '22222222-2222-2222-2222-222222222220',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222220', 'email', 'taxinabiso@client.com', 'email_verified', true), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222321', '22222222-2222-2222-2222-222222222221', 'email', '22222222-2222-2222-2222-222222222221',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222221', 'email', 'roman@demo.openride', 'email_verified', true), now(), now(), now())
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

-- ============================================================================
-- Stamp operator_id on directly-seeded rows.
--
-- The Phase 9 multitenant migration (0008) added a nullable operator_id to
-- these tables and backfilled EXISTING rows to the default operator. Rows
-- inserted afterwards by this seed default to NULL, which makes them invisible
-- to operator-scoped staff under RLS (the migration's documented "safe failure
-- mode"). Trigger-created rows (users / *_profiles / notification_preferences)
-- already carry operator_id; the direct inserts above do not, so backfill them
-- to the single demo operator here. Idempotent.
-- ============================================================================
do $$
declare
  v_op uuid := '00000000-0000-0000-0000-000000000001';
  t text;
  tables text[] := array[
    'compliance_rules', 'fare_rules', 'vehicles', 'driver_documents',
    'vehicle_documents', 'vehicle_inspections', 'bookings', 'trips',
    'payments', 'driver_status', 'trip_offers'
  ];
begin
  foreach t in array tables loop
    execute format('update public.%I set operator_id = %L where operator_id is null', t, v_op);
  end loop;
end $$;
