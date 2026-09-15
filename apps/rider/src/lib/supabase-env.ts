export const EXPECTED_SUPABASE_URL = 'https://yfrvppolwkyuzqvbbrai.supabase.co';

type Extra = { embeddedDebugDemo?: boolean };

function isEmbeddedDebugDemo(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default as { expoConfig?: { extra?: Extra } };
    return Constants.expoConfig?.extra?.embeddedDebugDemo === true;
  } catch {
    return false;
  }
}

export function readSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!url || !anonKey) {
    throw new Error(
      'Variables EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY manquantes. ' +
        'Copiez apps/rider/.env.example vers .env.local puis relancez le build.',
    );
  }

  const allowLocal =
    (typeof __DEV__ !== 'undefined' && Boolean(__DEV__)) || isEmbeddedDebugDemo();
  if (/localhost|127\.0\.0\.1/i.test(url) && !allowLocal) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL ne doit pas pointer vers localhost.');
  }

  if (__DEV__) {
    console.warn('[Auth] Supabase URL:', url);
    console.warn('[Auth] Anon key present:', anonKey.length > 8);
    console.warn('[Auth] Env file attendu: apps/rider/.env.local');
    if (url !== EXPECTED_SUPABASE_URL) {
      console.warn('[Auth] URL inattendue. Projet attendu:', EXPECTED_SUPABASE_URL);
    }
  }

  return { url, anonKey };
}
