#!/usr/bin/env node
/**
 * Empaquette une app Next.js standalone pour Hostinger / VPS.
 * Usage (depuis la racine du monorepo, après un build) :
 *   node infra/deploy/pack.mjs web
 *   node infra/deploy/pack.mjs admin
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const appName = process.argv[2];
if (appName !== 'web' && appName !== 'admin') {
  console.error('Usage: node infra/deploy/pack.mjs <web|admin>');
  process.exit(1);
}

const filter = appName === 'web' ? '@openride/web' : '@openride/admin';
const appDir = path.join(root, 'apps', appName);
const standaloneDir = path.join(appDir, '.next', 'standalone');
const outDir = path.join(root, 'infra', 'deploy', 'dist', appName);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
if (process.argv.includes('--require-prod-urls')) {
  if (!siteUrl.startsWith('https://') || siteUrl.includes('localhost')) {
    console.error('Refus : NEXT_PUBLIC_SITE_URL doit être une URL HTTPS de production (pas localhost).');
    process.exit(1);
  }
}

const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  console.log(`Build ${filter}…`);
  const build = spawnSync('corepack', ['pnpm', '--filter', filter, 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

if (!existsSync(standaloneDir)) {
  console.error(`Standalone introuvable : ${standaloneDir}`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(standaloneDir, outDir, { recursive: true });

const nestedApp = path.join(outDir, 'apps', appName);
const staticSrc = path.join(appDir, '.next', 'static');
const publicSrc = path.join(appDir, 'public');
if (existsSync(staticSrc)) {
  mkdirSync(path.join(nestedApp, '.next'), { recursive: true });
  cpSync(staticSrc, path.join(nestedApp, '.next', 'static'), { recursive: true });
}
if (existsSync(publicSrc)) {
  cpSync(publicSrc, path.join(nestedApp, 'public'), { recursive: true });
}

const startRel = path.posix.join('apps', appName, 'server.js');
writeFileSync(
  path.join(outDir, 'package.json'),
  JSON.stringify(
    {
      name: `taxinabiso-${appName}`,
      private: true,
      scripts: {
        start: `node ${startRel}`,
      },
    },
    null,
    2,
  ),
);
writeFileSync(
  path.join(outDir, 'README.deploy.txt'),
  [
    `Taxi Na Biso — ${appName}`,
    `Démarrage : node ${startRel}`,
    'Le processus écoute PORT (Hostinger le fournit).',
    '',
  ].join('\n'),
);

console.log(`Paquet prêt : ${outDir}`);
console.log(`Commande de démarrage : node ${startRel}`);
