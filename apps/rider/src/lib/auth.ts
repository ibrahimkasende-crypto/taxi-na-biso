import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { isDemoMode, isDemoPhone } from '../config/demo';
import { logAuthDev, logAuthError } from './auth-log';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
  onboarding_completed_at: string | null;
  /** Présent uniquement pour le profil local temporaire. */
  source?: 'demo-local';
}

/** Loads the signed-in user's row from public.users (RLS: own row only). */
export function useProfile(session: Session | null): {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const withAvatar = await supabase
      .from('users')
      .select('id, display_name, email, phone, onboarding_completed_at, avatar_url')
      .eq('id', session.user.id)
      .maybeSingle();
    if (withAvatar.error) {
      const { data } = await supabase
        .from('users')
        .select('id, display_name, email, phone, onboarding_completed_at')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile((data as Profile) ?? null);
    } else {
      setProfile((withAvatar.data as unknown as Profile) ?? null);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}

export async function completeProfile(displayName: string, email?: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const id = userData.user?.id;
  if (!id) throw new Error('Vous n’êtes pas connecté');
  const { error } = await supabase
    .from('users')
    .update({
      display_name: displayName.trim(),
      email: email?.trim() || null,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

export class DemoPhoneRequiredError extends Error {
  constructor() {
    super('Ce numéro ne peut pas être utilisé pour le moment. Veuillez réessayer.');
    this.name = 'DemoPhoneRequiredError';
  }
}

export async function sendOtp(phone: string): Promise<void> {
  if (isDemoMode && !isDemoPhone(phone)) {
    logAuthDev('sendOtp blocked (demo allow-list)', { phone });
    throw new DemoPhoneRequiredError();
  }

  logAuthDev('signInWithOtp start', { phone, step: 'signInWithOtp' });
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true,
      data: { role: 'rider' },
    },
  });
  if (error) {
    logAuthError('signInWithOtp', phone, error);
    throw error;
  }
  logAuthDev('signInWithOtp ok', { phone, step: 'signInWithOtp' });
}

export async function verifyOtp(phone: string, token: string): Promise<Session> {
  logAuthDev('verifyOtp start', { phone, step: 'verifyOtp', tokenLength: token.length });
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) {
    logAuthError('verifyOtp', phone, error);
    throw error;
  }
  if (!data.session || !data.user) {
    logAuthDev('verifyOtp missing session', { phone, step: 'verifyOtp' });
    throw new Error('Supabase n’a pas renvoyé de session authentifiée.');
  }
  await ensureRiderProfile(data.user.id, data.user.phone ?? phone);
  logAuthDev('verifyOtp ok', { phone, step: 'verifyOtp', userId: data.user.id });
  return data.session;
}

/** Confirme le profil client créé par le trigger Auth. Ne change jamais le rôle. */
async function ensureRiderProfile(userId: string, phone: string): Promise<void> {
  let row: { id: string; role: string } | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    row = data;
    if (row) break;
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 250);
    });
  }
  if (!row) {
    throw new Error('Le profil client n’a pas été créé. Réessayez dans un instant.');
  }
  if (row.role !== 'rider') {
    throw new Error('Ce compte n’est pas un compte passager.');
  }
  const { error: phoneError } = await supabase.from('users').update({ phone }).eq('id', userId);
  if (phoneError) throw phoneError;

  const { error: riderError } = await supabase.from('rider_profiles').upsert(
    { user_id: userId },
    { onConflict: 'user_id', ignoreDuplicates: true },
  );
  if (riderError) throw riderError;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
