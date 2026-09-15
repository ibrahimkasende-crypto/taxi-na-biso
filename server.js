#!/usr/bin/env node
/**
 * Point d'entrée Hostinger : le runtime Node.js du panel lance ce fichier.
 * Le build Next standalone vit sous apps/web/.next/standalone.
 */
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const server = path.join(__dirname, 'apps', 'web', '.next', 'standalone', 'apps', 'web', 'server.js');

if (!existsSync(server)) {
  console.error('Standalone server introuvable :', server);
  process.exit(1);
}

const child = spawn(process.execPath, [server], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
    PORT: process.env.PORT || '3000',
  },
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
