#!/usr/bin/env bash
# Mise à jour d'une installation VPS déjà configurée.
# Ne réinitialise JAMAIS la base. À lancer depuis la racine du dépôt, en production.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== git pull =="
git pull --ff-only

echo "== install =="
corepack pnpm install --frozen-lockfile

echo "== build web (site + client + chauffeur + admin) =="
corepack pnpm --filter @openride/web build

echo "== pack standalone =="
node infra/deploy/pack.mjs web --skip-build

if command -v pm2 >/dev/null 2>&1; then
  echo "== restart PM2 =="
  pm2 restart taxinabiso-web --update-env
  pm2 save
else
  echo "PM2 introuvable — redémarrer manuellement le processus Node."
fi

echo "OK. Logs : pm2 logs taxinabiso-web"
