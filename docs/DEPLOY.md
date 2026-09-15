# Déploiement production — Taxi Na Biso

Porte d’entrée : **https://taxinabiso.newsystemcorps.com**

Les ports `3000` / `3001` restent **internes**. Le visiteur ne les voit jamais.

## Architecture retenue

Deux applications Next.js distinctes (ne pas les fusionner) :

| App | Processus | URL publique |
|---|---|---|
| Site + Client + Chauffeur (`apps/web`) | `taxinabiso-web` | https://taxinabiso.newsystemcorps.com |
| Dashboard Admin (`apps/admin`) | `taxinabiso-admin` | https://admin.taxinabiso.newsystemcorps.com |

Pourquoi pas `/admin` sur le même hôte Node ?

- Hostinger Node.js = **un processus Node par site**.
- Next.js expose `/_next/*` : deux apps sur le même hôte sans reverse proxy cassent les assets.
- Un `basePath: '/admin'` + Nginx est possible **uniquement sur VPS**. Sur l’hébergement Node Hostinger, c’est instable.

Compromis URL unique : en production, `https://taxinabiso.newsystemcorps.com/admin` **redirige** vers le sous-domaine admin (voir `apps/web/next.config.mjs`).

Backend : **Supabase** (Auth, Postgres+PostGIS, Realtime, Storage, Edge Functions).  
Hostinger shared / Node **ne peut pas** héberger Docker Supabase. Créer un projet [Supabase Cloud](https://supabase.com) (ou un VPS Docker séparé).

Cartes : MapLibre. Pas de clé secrète dans le frontend. Défaut = tuiles CARTO publiques. Option : `NEXT_PUBLIC_MAP_STYLE_URL` (style JSON public, ex. MapTiler).

## Séparation demo / production

| Environnement | `NEXT_PUBLIC_APP_ENV` | Seed `infra/supabase/seed.sql` | Bouton « compte de démonstration » |
|---|---|---|---|
| Local | `development` | oui (`make reset`) | oui |
| Staging / démo publique | `staging` | oui, base **dédiée** | oui |
| Production réelle | `production` | **non** — ne jamais `db reset` | non |

Les comptes `taxinabiso@client.com` / `123456` sont des **données de démonstration**.  
Les administrateurs de production doivent utiliser des mots de passe forts, créés dans Supabase Auth, rôle `admin` dans `public.users`.

## DNS (newsystemcorps.com)

Ne pas modifier `@`, `www`, ni les autres sous-domaines existants.

Créer **uniquement** :

| Type | Host | Valeur | TTL |
|---|---|---|---|
| CNAME | `taxinabiso` | **VALEUR À RENSEIGNER : cible fournie par Hostinger** (souvent le même hostname que le site principal, ou `newsystemcorps.com` si hPanel le propose) | 3600 |
| CNAME | `admin.taxinabiso` | **VALEUR À RENSEIGNER : même cible Hostinger** | 3600 |

Si hPanel n’accepte pas un CNAME et demande un enregistrement A :

| Type | Host | Valeur | TTL |
|---|---|---|---|
| A | `taxinabiso` | **VALEUR À RENSEIGNER : IP A de newsystemcorps.com recopiée depuis hPanel → DNS** | 3600 |
| A | `admin.taxinabiso` | **VALEUR À RENSEIGNER : même IP** | 3600 |

Ne pas inventer l’IP. La recopier dans **hPanel → Domaines → newsystemcorps.com → DNS**.

Méthode Hostinger la plus sûre : **Sites web → Ajouter un site / sous-domaine** `taxinabiso.newsystemcorps.com` et `admin.taxinabiso.newsystemcorps.com` sur le **même compte** que `newsystemcorps.com`. Hostinger crée alors le DNS tout seul.

SSL : activer **SSL gratuit** sur chaque site dans hPanel (Let’s Encrypt). Forcer HTTPS.

## Variables (aucun secret dans Git)

Fichiers : `apps/web/.env.local` et `apps/admin/.env.local` en local.  
En production : variables du site Node Hostinger, ou fichiers sur le VPS (non versionnés).

### Web (`apps/web`)

```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://taxinabiso.newsystemcorps.com
NEXT_PUBLIC_ADMIN_URL=https://admin.taxinabiso.newsystemcorps.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_SUPPORT_PHONE=+243800000000
NEXT_PUBLIC_SUPPORT_WHATSAPP=243800000000
```

`NEXT_PUBLIC_*` est **inliné au build**. Après un changement, **rebuild** obligatoire.

### Admin (`apps/admin`)

```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_WEB_URL=https://taxinabiso.newsystemcorps.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Jamais `SUPABASE_SERVICE_ROLE_KEY` dans ces apps.

### Supabase Cloud (dashboard)

Authentication → URL configuration :

- Site URL : `https://taxinabiso.newsystemcorps.com`
- Redirect URLs :
  - `https://taxinabiso.newsystemcorps.com/**`
  - `https://admin.taxinabiso.newsystemcorps.com/**`

CORS : origines des deux hôtes HTTPS.

Appliquer les **migrations** (`infra/supabase/migrations`) via `supabase db push` ou le SQL Editor.  
**Ne pas** lancer `make reset` / `supabase db reset` sur la production.

Pour un **staging** de démo : projet Supabase séparé + `supabase db reset` (seed).

## Hostinger Node.js (recommandé si pas de VPS)

1. Créer deux sites Node.js :
   - `taxinabiso.newsystemcorps.com`
   - `admin.taxinabiso.newsystemcorps.com`
2. Node **20** ou **22**, gestionnaire **pnpm** si proposé, sinon déployer le **paquet standalone** (plus simple).
3. Sur la machine de build (avec les variables de production exportées) :

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm --filter @openride/web build
corepack pnpm --filter @openride/admin build
node infra/deploy/pack.mjs web --skip-build --require-prod-urls
node infra/deploy/pack.mjs admin --skip-build
```

4. Zipper `infra/deploy/dist/web` et `infra/deploy/dist/admin` (sans `node_modules` du monorepo source — le standalone les contient déjà).
5. Dans hPanel Node.js :
   - Type : application Node personnalisée (`other`)
   - Fichier d’entrée web : `apps/web/server.js`
   - Fichier d’entrée admin : `apps/admin/server.js`
   - Script start : `npm start` (le `package.json` généré lance `node apps/…/server.js`)
   - `PORT` est fourni par Hostinger — ne pas exposer 3000/3001
6. Coller les variables d’environnement **avant** le premier démarrage. Si `NEXT_PUBLIC_*` change : **rebuild local + re-upload**.

## VPS + Nginx + PM2

```bash
sudo cp infra/deploy/nginx/taxinabiso.conf /etc/nginx/sites-available/taxinabiso
sudo ln -s /etc/nginx/sites-available/taxinabiso /etc/nginx/sites-enabled/taxinabiso
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d taxinabiso.newsystemcorps.com -d admin.taxinabiso.newsystemcorps.com
bash infra/deploy/update.sh
pm2 start infra/deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

Logs :

```bash
pm2 logs taxinabiso-web
pm2 logs taxinabiso-admin
sudo tail -f /var/log/nginx/error.log
```

Redémarrage :

```bash
pm2 restart taxinabiso-web taxinabiso-admin
```

Mise à jour suivante :

```bash
bash infra/deploy/update.sh
```

(`git pull` → install → build → pack → `pm2 restart`)

## Migrations backend

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --workdir infra
npx supabase functions deploy --workdir infra
```

Uniquement si le projet Supabase Cloud est créé. Ne jamais écraser une base prod avec le seed démo.

## Checklist après DNS + SSL

- [ ] https://taxinabiso.newsystemcorps.com (site public, HTTPS, pas de port)
- [ ] /connexion — client
- [ ] /chauffeur/connexion — chauffeur
- [ ] /admin et /admin/login redirigent vers le sous-domaine admin
- [ ] https://admin.taxinabiso.newsystemcorps.com/login
- [ ] Hero, images, carte, formulaires
- [ ] Login / logout / rôles
- [ ] Un client ne voit pas l’admin
- [ ] Console navigateur sans erreurs bloquantes
