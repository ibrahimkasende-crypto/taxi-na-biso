export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans apps/web/.env.local.',
    );
  }
  return { url, anonKey };
}

export function getPublicEnv() {
  return {
    mapStyleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? '',
    driverAppUrl: process.env.NEXT_PUBLIC_DRIVER_APP_URL ?? '',
    riderAppUrl: process.env.NEXT_PUBLIC_RIDER_APP_URL ?? '',
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '+243974543860',
    supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '243974543860',
  };
}
