# Demo guide

After `make reset`, the Taxi Na Biso demo dataset includes:

| Account | Email | Role |
|---|---|---|
| Administrateur Taxi Na Biso | `admin@taxinabiso.com` | `admin` |
| Client Demo | `taxinabiso@client.com` | `rider` |
| Chauffeur Demo | `taxinabiso@chauffeur.com` | `driver`, approved, online |
| Dispatcher (fixture RLS) | `dispatcher@demo.openride` | `dispatcher` |
| Autres fixtures | daria / devin / roman | non proposés à l’écran |

Mot de passe **local uniquement** pour les trois comptes principaux : `123456`.

Connexions web **locales** :

- Client : http://localhost:3001/connexion
- Chauffeur : http://localhost:3001/chauffeur/connexion
- Admin : http://localhost:3001/admin/login

Production : https://taxinabiso.newsystemcorps.com — voir `docs/DEPLOY.md`.
Les comptes ci-dessus restent des comptes de **démonstration** ; ne pas les utiliser comme administrateurs réels de production.

OTP téléphone local (apps mobiles) : `123456` (voir `infra/supabase/config.toml`).

## Walkthrough

1. Ouvrir http://localhost:3001/admin/login — `admin@taxinabiso.com` / `123456`. Tableau de bord avec chauffeurs, véhicules, courses Kinshasa.
2. Ouvrir http://localhost:3001/connexion — `taxinabiso@client.com` / `123456`. Historique Gombe / Victoire / UNIKIN / Limete / Ngaba.
3. Ouvrir http://localhost:3001/chauffeur/connexion — `taxinabiso@chauffeur.com` / `123456`. Véhicule Toyota Corolla `DEMO-TNB-01`, courses liées au client.

## Demo data

Les lignes sont dans `infra/supabase/seed.sql`. Recréer :

```bash
make reset   # wipe DB, migrations, seed
```
