import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@openride/db/types';

import { withAuthCookieOptions } from './auth-cookies';
import { getSupabaseEnv } from './env';

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, withAuthCookieOptions(options ?? {}));
          });
        } catch {
          // Server Component render — middleware refreshes the session.
        }
      },
    },
  });
}
