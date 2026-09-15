-- Courses démo Kinshasa liées aux UUID Auth existants (lookup par email).
-- Ne touche pas auth.users. Idempotent.

do $$
declare
  v_op uuid := '00000000-0000-0000-0000-000000000001';
  v_client uuid;
  v_driver uuid;
  v_vehicle uuid := '33333333-3333-3333-3333-333333333301';
  v_booking_done uuid := '44444444-4444-4444-4444-444444444401';
  v_booking_cancel uuid := '44444444-4444-4444-4444-444444444403';
  v_booking_pending uuid := '44444444-4444-4444-4444-444444444404';
  v_trip_done uuid := '55555555-5555-5555-5555-555555555501';
  v_trip_cancel uuid := '55555555-5555-5555-5555-555555555503';
begin
  select id into v_client from auth.users where lower(email) = 'taxinabiso@client.com' limit 1;
  select id into v_driver from auth.users where lower(email) = 'taxinabiso@chauffeur.com' limit 1;
  if v_client is null or v_driver is null then
    raise notice 'Demo trips skipped: auth users missing';
    return;
  end if;

  insert into public.fare_rules (
    id, operator_id, name, vehicle_type, base_cents, per_km_cents, per_min_cents,
    minimum_cents, booking_fee_cents, cancellation_fee_cents, is_active
  )
  values (
    '11111111-1111-1111-1111-111111111101',
    v_op, 'Berline — standard', 'sedan', 350, 220, 65, 1200, 150, 800, true
  )
  on conflict (id) do update set
    operator_id = excluded.operator_id,
    name = excluded.name,
    is_active = true,
    updated_at = now();

  insert into public.bookings (
    id, operator_id, rider_id, type, pickup_label, pickup_point, dropoff_label, dropoff_point,
    vehicle_type_requested, scheduled_pickup_at, status, created_at
  )
  values
    (
      v_booking_done, v_op, v_client, 'now',
      'Gombe', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
      'Victoire', st_setsrid(st_makepoint(15.312, -4.331), 4326)::geography,
      'sedan', null, 'completed', now() - interval '3 days'
    ),
    (
      v_booking_cancel, v_op, v_client, 'now',
      'UNIKIN', st_setsrid(st_makepoint(15.310, -4.422), 4326)::geography,
      'Rond-point Ngaba', st_setsrid(st_makepoint(15.326, -4.378), 4326)::geography,
      'sedan', null, 'cancelled', now() - interval '2 days'
    ),
    (
      v_booking_pending, v_op, v_client, 'scheduled',
      'Limete', st_setsrid(st_makepoint(15.338, -4.378), 4326)::geography,
      'Gombe', st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
      'sedan', now() + interval '4 hours', 'pending', now() - interval '2 hours'
    )
  on conflict (id) do update set
    operator_id = excluded.operator_id,
    rider_id = excluded.rider_id,
    pickup_label = excluded.pickup_label,
    dropoff_label = excluded.dropoff_label,
    status = excluded.status,
    scheduled_pickup_at = excluded.scheduled_pickup_at,
    updated_at = now();

  insert into public.trips (
    id, operator_id, booking_id, rider_id, driver_id, vehicle_id, status,
    pickup_point, dropoff_point, pickup_address, dropoff_address,
    requested_at, assigned_at, started_at, completed_at, cancelled_at, cancelled_by,
    estimated_fare_cents, final_fare_cents, distance_m, duration_s, payment_status
  )
  values
    (
      v_trip_done, v_op, v_booking_done, v_client, v_driver, v_vehicle, 'completed',
      st_setsrid(st_makepoint(15.313, -4.305), 4326)::geography,
      st_setsrid(st_makepoint(15.312, -4.331), 4326)::geography,
      'Gombe', 'Victoire',
      now() - interval '3 days',
      now() - interval '3 days' + interval '2 minutes',
      now() - interval '3 days' + interval '8 minutes',
      now() - interval '3 days' + interval '32 minutes',
      null, null,
      850000, 920000, 6200, 1440, 'paid'
    ),
    (
      v_trip_cancel, v_op, v_booking_cancel, v_client, v_driver, v_vehicle, 'cancelled',
      st_setsrid(st_makepoint(15.310, -4.422), 4326)::geography,
      st_setsrid(st_makepoint(15.326, -4.378), 4326)::geography,
      'UNIKIN', 'Rond-point Ngaba',
      now() - interval '2 days',
      now() - interval '2 days' + interval '1 minute',
      null, null,
      now() - interval '2 days' + interval '6 minutes', 'rider',
      780000, null, 9100, null, 'waived'
    )
  on conflict (id) do update set
    operator_id = excluded.operator_id,
    rider_id = excluded.rider_id,
    driver_id = excluded.driver_id,
    vehicle_id = excluded.vehicle_id,
    status = excluded.status,
    pickup_address = excluded.pickup_address,
    dropoff_address = excluded.dropoff_address,
    updated_at = now();
end $$;
