import { createBrowserClient, type OpenrideClient } from '@openride/db';

import { secureStorage } from './secure-storage';
import { readSupabasePublicEnv } from './supabase-env';

const { url, anonKey } = readSupabasePublicEnv();

export const supabase: OpenrideClient = createBrowserClient({
  url,
  anonKey,
  storage: secureStorage,
});
