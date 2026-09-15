-- Démo web Taxi Na Biso — à exécuter APRÈS infra/supabase/seed.sql si besoin.
-- Idempotent. Les comptes principaux sont déjà dans seed.sql :
--   taxinabiso@client.com / taxinabiso@chauffeur.com / admin@taxinabiso.com
-- Mot de passe local : 123456
-- NE PAS appliquer tel quel en production.

update auth.users
set email = 'taxinabiso@client.com',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222220';

update auth.users
set email = 'taxinabiso@chauffeur.com',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222210';

update auth.users
set email = 'admin@taxinabiso.com',
    email_confirmed_at = coalesce(email_confirmed_at, now())
where id = '22222222-2222-2222-2222-222222222201';

update public.users set email = 'taxinabiso@client.com' where id = '22222222-2222-2222-2222-222222222220';
update public.users set email = 'taxinabiso@chauffeur.com' where id = '22222222-2222-2222-2222-222222222210';
update public.users set email = 'admin@taxinabiso.com' where id = '22222222-2222-2222-2222-222222222201';
