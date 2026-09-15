# Déploiement production — Taxi Na Biso

Porte d’entrée : **https://taxinabiso.newsystemcorps.com**

Un seul runtime Next.js (`apps/web`) sert :

| Surface | URL |
|---|---|
| Site public | https://taxinabiso.newsystemcorps.com |
| Client | https://taxinabiso.newsystemcorps.com/client |
| Chauffeur | https://taxinabiso.newsystemcorps.com/chauffeur |
| Administration | https://taxinabiso.newsystemcorps.com/admin |
| Connexion Admin | https://taxinabiso.newsystemcorps.com/admin/login |

`apps/admin` est **legacy** : ne plus le déployer. Le sous-domaine `admin.taxinabiso.newsystemcorps.com` n’est plus nécessaire.

Backend : **Supabase** (Auth, Postgres+PostGIS, Realtime, Storage, Edge Functions).  
Hostinger Node **ne peut pas** héberger Docker Supabase.

Cartes : MapLibre. Pas de clé secrète dans le frontend.

## Séparation demo / production

| Environnement | `NEXT_PUBLIC_APP_ENV` | Seed `infra/supabase/seed.sql` | Bouton « compte de démonstration » |
|---|---|---|---|
| Local | `development` | oui (`make reset`) | oui |
| Staging / démo publique | `staging` | oui, base **dédiée** | oui |
| Production réelle | `production` | **non** — ne jamais `db reset` | non |

Les comptes `taxinabiso@client.com` / `admin@taxinabiso.com` / `123456` sont des **données de démonstration**.

## DNS (newsystemcorps.com)

Ne pas modifier `@`, `www`, ni les autres sous-domaines existants.

Créer **uniquement** :

| Type | Host | Valeur | TTL |
|---|---|---|---|
| CNAME | `taxinabiso` | **VALEUR À RENSEIGNER : cible fournie par Hostinger** | 3600 |

SSL : activer **SSL gratuit** sur `taxinabiso.newsystemcorps.com` dans hPanel. Forcer HTTPS.

## Variables (aucun secret dans Git)

Fichier local : `apps/web/.env.local`.  
En production : variables du site Node Hostinger.

```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://taxinabiso.newsystemcorps.com
NEXT_PUBLIC_WEB_URL=https://taxinabiso.newsystemcorps.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_SUPPORT_PHONE=+243800000000
NEXT_PUBLIC_SUPPORT_WHATSAPP=243800000000
```

Jamais `SUPABASE_SERVICE_ROLE_KEY` dans cette app.  
`NEXT_PUBLIC_*` est **inliné au build**. Après un changement : **rebuild** obligatoire.

### Supabase Cloud

Authentication → URL configuration :

- Site URL : `https://taxinabiso.newsystemcorps.com`
- Redirect URLs : `https://taxinabiso.newsystemcorps.com/**`

CORS : origine `https://taxinabiso.newsystemcorps.com`.

Appliquer les **migrations** (`infra/supabase/migrations`) via `supabase db push` ou le SQL Editor.  
**Ne pas** lancer `make reset` / `supabase db reset` sur la production.

## Hostinger Node.js (un seul site)

1. Un site Node.js : `taxinabiso.newsystemcorps.com`
2. Source GitHub : `ibrahimkasende-crypto/taxi-na-biso`, branche `main`
3. Node **20** ou **22**, application : `apps/web`
4. Build :

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm --filter @openride/web build
```

Ou paquet standalone :

```bash
node infra/deploy/pack.mjs web --require-prod-urls
```

5. Entrée : `apps/web/server.js` (standalone). `PORT` fourni par Hostinger.
6. Coller les variables **avant** le premier démarrage.

## VPS + Nginx + PM2

Un seul processus Node (`taxinabiso-web`).

```bash
sudo cp infra/deploy/nginx/taxinabiso.conf /etc/nginx/sites-available/taxinabiso
sudo ln -s /etc/nginx/sites-available/taxinabiso /etc/nginx/sites-enabled/taxinabiso
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d taxinabiso.newsystemcorps.com
bash infra/deploy/update.sh
pm2 start infra/deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

Logs : `pm2 logs taxinabiso-web`

Mise à jour : `bash infra/deploy/update.sh`

## Migrations backend

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --workdir infra
npx supabase functions deploy --workdir infra
```

## Checklist après DNS + SSL

- [ ] https://taxinabiso.newsystemcorps.com
- [ ] /connexion — client
- [ ] /chauffeur/connexion — chauffeur
- [ ] /admin/login et /admin — même domaine
- [ ] Footer : icône Administration → /admin
- [ ] Un client / chauffeur n’accède pas à /admin
- [ ] Hero, images, carte, formulaires
- [ ] Login / logout / rôles
