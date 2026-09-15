#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const appDir = path.join(root, 'apps', 'web');
const nested = path.join(appDir, '.next', 'standalone', 'apps', 'web');

if (!existsSync(nested)) {
  console.error('Standalone introuvable :', nested);
  process.exit(1);
}

const staticSrc = path.join(appDir, '.next', 'static');
const publicSrc = path.join(appDir, 'public');
if (existsSync(staticSrc)) {
  mkdirSync(path.join(nested, '.next'), { recursive: true });
  cpSync(staticSrc, path.join(nested, '.next', 'static'), { recursive: true });
}
if (existsSync(publicSrc)) {
  cpSync(publicSrc, path.join(nested, 'public'), { recursive: true });
}
console.log('Assets standalone copiés.');
