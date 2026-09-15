/**
 * PM2 — VPS uniquement. Hostinger Node.js gère son propre processus.
 * Démarrage : pm2 start infra/deploy/pm2/ecosystem.config.cjs
 *
 * Production = un seul runtime (`taxinabiso-web`) : site + client + chauffeur + admin.
 */
const path = require('node:path');

const dist = path.resolve(__dirname, '../dist');

module.exports = {
  apps: [
    {
      name: 'taxinabiso-web',
      cwd: path.join(dist, 'web'),
      script: 'apps/web/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 20,
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};
