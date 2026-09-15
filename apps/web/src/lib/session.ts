import { redirect } from 'next/navigation';

import { getSupabaseServer } from './supabase-server';
import { canAccessClient, canAccessDriver, homeForRole } from './roles';

export interface SessionProfile {
  id: string;
  role: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('id, role, display_name, email, phone')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      role: (user.user_metadata?.role as string | undefined) ?? 'rider',
      display_name: (user.user_metadata?.display_name as string | undefined) ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
    };
  }
  return data as SessionProfile;
}

export async function requireRider(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) redirect('/connexion?next=/client');
  if (!canAccessClient(profile.role)) redirect(homeForRole(profile.role));
  return profile;
}

export async function requireDriver(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) redirect('/chauffeur/connexion?next=/chauffeur');
  if (!canAccessDriver(profile.role)) redirect(homeForRole(profile.role));
  return profile;
}
