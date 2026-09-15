'use client';

import { OpenrideApi } from '@openride/api-client';

import { getSupabaseBrowser } from './supabase-browser';

let cached: OpenrideApi | null = null;

export function getApi(): OpenrideApi {
  if (!cached) cached = new OpenrideApi(getSupabaseBrowser());
  return cached;
}
