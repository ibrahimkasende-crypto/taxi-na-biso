# apps/admin — LEGACY

Cette application Next.js **n’est plus utilisée en production**.

L’administration est intégrée à `apps/web` sous :

- `/admin`
- `/admin/login`

Ne pas déployer `@openride/admin`. Le build et le runtime de production sont uniquement :

```bash
corepack pnpm --filter @openride/web build
```

Conservé temporairement pour comparaison jusqu’à validation complète, puis suppression dans un commit séparé.
