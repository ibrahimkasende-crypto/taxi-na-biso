'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@openride/db/types';

import { getSupabaseEnv } from './env';
import { withAuthCookieOptions } from './auth-cookies';

export function getSupabaseBrowser() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions: withAuthCookieOptions({}),
  });
}
