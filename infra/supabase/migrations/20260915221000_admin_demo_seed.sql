-- Seed démo Admin idempotent (références TNB-20260915-042x).

insert into public.booking_requests (
  id, reference, operator_id, customer_name, customer_phone,
  pickup_label, pickup_address, pickup_lat, pickup_lng, pickup_place_id,
  dropoff_label, dropoff_address, dropoff_lat, dropoff_lng, dropoff_place_id,
  scheduled_for, is_now, category, hourly_rate_usd, daily_rate_usd, status, created_at
) values
  (
    'aaaaaaaa-0000-4000-8000-000000000427', 'TNB-20260915-0427',
    '00000000-0000-0000-0000-000000000001',
    'Ibrahim K.', '+243974543860',
    'Université de Kinshasa', 'UNIKIN, Lemba, Kinshasa', -4.422, 15.31, 'unikin',
    'Gombe', 'Gombe, Kinshasa', -4.305, 15.313, 'gombe',
    timestamptz '2026-09-15 20:30:00+01', false, 'confort', 8, 60, 'pending',
    now() - interval '10 minutes'
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000426', 'TNB-20260915-0426',
    '00000000-0000-0000-0000-000000000001',
    'Sarah M.', '+243810000026',
    'Lemba', 'Lemba, Kinshasa', -4.392, 15.322, 'lemba',
    'Aéroport International de N’djili', 'N’djili, Kinshasa', -4.3856, 15.4446, 'ndjili',
    timestamptz '2026-09-15 18:00:00+01', false, 'premium', 11, 80, 'pending',
    now() - interval '35 minutes'
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000425', 'TNB-20260915-0425',
    '00000000-0000-0000-0000-000000000001',
    'Patrick D.', '+243810000025',
    'Ngaliema', 'Ngaliema, Kinshasa', -4.327, 15.249, 'ngaliema',
    'Limete', 'Limete, Kinshasa', -4.378, 15.338, 'limete',
    timestamptz '2026-09-15 16:15:00+01', false, 'basic', 7, 60, 'pending',
    now() - interval '1 hour'
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000424', 'TNB-20260915-0424',
    '00000000-0000-0000-0000-000000000001',
    'Marie T.', '+243810000024',
    'Gombe', 'Gombe, Kinshasa', -4.305, 15.313, 'gombe',
    'Kintambo', 'Kintambo, Kinshasa', -4.327, 15.27, 'kintambo',
    timestamptz '2026-09-15 14:00:00+01', false, 'familiale', 11, 80, 'approved',
    now() - interval '2 hours'
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000423', 'TNB-20260915-0423',
    '00000000-0000-0000-0000-000000000001',
    'Jean P.', '+243810000023',
    'Lemba', 'Lemba, Kinshasa', -4.392, 15.322, 'lemba',
    'Université de Kinshasa', 'UNIKIN, Lemba', -4.422, 15.31, 'unikin',
    timestamptz '2026-09-15 12:00:00+01', false, '4x4', 20, 160, 'rejected',
    now() - interval '3 hours'
  )
on conflict (reference) do update set
  customer_name = excluded.customer_name,
  customer_phone = excluded.customer_phone,
  pickup_label = excluded.pickup_label,
  dropoff_label = excluded.dropoff_label,
  category = excluded.category,
  hourly_rate_usd = excluded.hourly_rate_usd,
  daily_rate_usd = excluded.daily_rate_usd,
  updated_at = now();

update public.booking_requests
set approved_at = created_at + interval '8 minutes',
    reject_reason = null
where reference = 'TNB-20260915-0424' and approved_at is null;

update public.booking_requests
set rejected_at = created_at + interval '12 minutes',
    reject_reason = 'Aucun chauffeur disponible'
where reference = 'TNB-20260915-0423' and rejected_at is null;

insert into public.ops_conversations (id, operator_id, party_name, party_role, party_phone, subject, last_message_at)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ibrahim K.', 'rider', '+243974543860', 'Course TNB-20260915-0427', now() - interval '8 minutes'),
  ('bbbbbbbb-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Taxi Na Biso Chauffeur Demo', 'driver', '+243810000010', 'Disponibilité soir', now() - interval '40 minutes')
on conflict (id) do nothing;

insert into public.ops_messages (id, conversation_id, sender, body, created_at)
values
  ('cccccccc-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', 'rider', 'Bonjour, je confirme UNIKIN vers Gombe vers 20h30.', now() - interval '12 minutes'),
  ('cccccccc-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000001', 'admin', 'Bien reçu Ibrahim, nous traitons votre demande Confort.', now() - interval '8 minutes'),
  ('cccccccc-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-000000000002', 'driver', 'Je suis disponible ce soir après 19h.', now() - interval '40 minutes')
on conflict (id) do nothing;

update public.vehicles
set fleet_category = 'confort',
    make = coalesce(nullif(make, ''), 'Toyota'),
    model = case when model in ('Camry', '') then 'Blade' else model end
where id = '33333333-3333-3333-3333-333333333301';
