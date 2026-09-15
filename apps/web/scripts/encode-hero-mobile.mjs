/**
 * Génère hero_taxi_mobile.mp4 (720p, H.264, sans audio, faststart).
 * Usage: node scripts/encode-hero-mobile.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const input = path.join(root, 'public/images/hero/hero_taxi.mp4');
const output = path.join(root, 'public/images/hero/hero_taxi_mobile.mp4');

async function findFfmpeg() {
  try {
    const pkg = await import('@ffmpeg-installer/ffmpeg');
    if (pkg?.path && fs.existsSync(pkg.path)) return pkg.path;
  } catch {
    /* optional devDependency */
  }
  const which = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  if (which.status === 0) return 'ffmpeg';
  return null;
}

async function main() {
  if (!fs.existsSync(input)) {
    console.error('Missing input:', input);
    process.exit(1);
  }
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) {
    console.error('ffmpeg not found. Install @ffmpeg-installer/ffmpeg or system ffmpeg.');
    process.exit(1);
  }
  const args = [
    '-y',
    '-i',
    input,
    '-an',
    '-vf',
    'scale=-2:720',
    '-c:v',
    'libx264',
    '-profile:v',
    'baseline',
    '-level',
    '3.1',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-crf',
    '28',
    '-preset',
    'fast',
    output,
  ];
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const stat = fs.statSync(output);
  console.log(`Wrote ${output} (${(stat.size / 1024 / 1024).toFixed(2)} MiB)`);
}

main();
