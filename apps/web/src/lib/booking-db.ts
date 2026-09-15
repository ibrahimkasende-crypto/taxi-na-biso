import type { SupabaseClient } from '@supabase/supabase-js';

/** Client non typé pour booking_requests / RPC jusqu’à régénération de Database. */
export function bookingDb(client: unknown): SupabaseClient {
  return client as SupabaseClient;
}
