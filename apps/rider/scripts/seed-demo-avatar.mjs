/**
 * Seed développement : téléverse assets/ikas-profile.jpeg vers Storage `avatars`.
 *
 * Ne jamais exécuter depuis l’app Rider. La clé service_role reste hors du bundle.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DEMO_RIDER_USER_ID=<uuid> node scripts/seed-demo-avatar.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const file = join(root, '..', 'assets', 'ikas-profile.jpeg');
const url = process.env.SUPABASE_URL?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const userId = process.env.DEMO_RIDER_USER_ID?.trim();

if (!url || !service || !userId) {
  console.error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et DEMO_RIDER_USER_ID sont requis.');
  process.exit(1);
}
if (/service_role/.test(service) === false && service.length < 20) {
  console.error('Clé service invalide.');
  process.exit(1);
}

const supabase = createClient(url, service, { auth: { persistSession: false } });
const bytes = readFileSync(file);
const path = `${userId}/profile.jpeg`;
const { error: uploadError } = await supabase.storage.from('avatars').upload(path, bytes, {
  upsert: true,
  contentType: 'image/jpeg',
});
if (uploadError) {
  console.error(uploadError);
  process.exit(1);
}
const { data } = supabase.storage.from('avatars').getPublicUrl(path);
const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
const { error: updateError } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', userId);
if (updateError) {
  console.error(updateError);
  process.exit(1);
}
console.warn('avatar_url enregistré (chemin)', `avatars/${path}`);
