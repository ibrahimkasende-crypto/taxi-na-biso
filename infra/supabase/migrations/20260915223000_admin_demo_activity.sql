-- Décale les timestamps demo des notifications admin pour une timeline plus réaliste.

update public.admin_notifications n
set created_at = sub.new_at
from (
  select
    id,
    now() - (row_number() over (order by created_at desc) - 1) * interval '14 minutes' as new_at
  from public.admin_notifications
  where title ilike '%demo%' or body ilike '%TNB-20260915%'
) sub
where n.id = sub.id
  and n.created_at > now() - interval '6 hours';

-- Notifications génériques récentes : étaler sur 1h si créées en rafale.
update public.admin_notifications n
set created_at = sub.new_at
from (
  select
    id,
    now() - (row_number() over (order by created_at desc) - 1) * interval '12 minutes' as new_at
  from public.admin_notifications
  where created_at > now() - interval '2 hours'
) sub
where n.id = sub.id
  and (
    select count(*) from public.admin_notifications
    where created_at > now() - interval '2 hours'
  ) >= 3;
