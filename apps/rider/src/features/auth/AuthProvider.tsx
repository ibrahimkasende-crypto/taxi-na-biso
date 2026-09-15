/**
 * TEMPORAIRE + production : distingue session Supabase, session demo-local, et absence.
 * La branche demo-local est morte dès que isDemoAuthEnabled est false.
 */

import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Profile } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getIsDemoAuthEnabled } from './demo/demoAuthEnabled';
import { clearDemoSession, readDemoSession, subscribeDemoSession, type DemoSession } from './demo/demoSession';

export type AppAuthState =
  | { status: 'authenticated'; source: 'supabase'; session: Session }
  | { status: 'authenticated'; source: 'demo-local'; session: DemoSession }
  | { status: 'unauthenticated' }
  | { status: 'loading' };

interface AuthContextValue {
  state: AppAuthState;
  profile: Profile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function demoProfile(session: DemoSession): Profile {
  return {
    id: session.user.id,
    display_name: session.user.displayName,
    email: null,
    phone: session.user.phone,
    avatar_url: session.avatarKey === 'default' ? 'local:default-client-avatar' : null,
    onboarding_completed_at: session.createdAt,
    source: 'demo-local',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppAuthState>({ status: 'loading' });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (state.status !== 'authenticated') {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    if (state.source === 'demo-local') {
      setProfile(demoProfile(state.session));
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const withAvatar = await supabase
      .from('users')
      .select('id, display_name, email, phone, onboarding_completed_at, avatar_url')
      .eq('id', state.session.user.id)
      .maybeSingle();
    if (!withAvatar.error) {
      setProfile((withAvatar.data as unknown as Profile) ?? null);
      setProfileLoading(false);
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('id, display_name, email, phone, onboarding_completed_at')
      .eq('id', state.session.user.id)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
    setProfileLoading(false);
  }, [state]);

  useEffect(() => {
    let mounted = true;

    async function hydrate(): Promise<void> {
      if (!getIsDemoAuthEnabled()) {
        await clearDemoSession();
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        setState({ status: 'authenticated', source: 'supabase', session: data.session });
        return;
      }

      if (getIsDemoAuthEnabled()) {
        const demo = await readDemoSession();
        if (!mounted) return;
        if (demo) {
          setState({ status: 'authenticated', source: 'demo-local', session: demo });
          return;
        }
      }

      setState({ status: 'unauthenticated' });
    }

    void hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setState({ status: 'authenticated', source: 'supabase', session });
        return;
      }
      void readDemoSession().then((demo) => {
        if (!mounted) return;
        if (getIsDemoAuthEnabled() && demo) {
          setState({ status: 'authenticated', source: 'demo-local', session: demo });
        } else {
          setState({ status: 'unauthenticated' });
        }
      });
    });

    const unsubscribeDemo = subscribeDemoSession(() => {
      void readDemoSession().then((demo) => {
        if (!mounted) return;
        if (getIsDemoAuthEnabled() && demo) {
          setState({ status: 'authenticated', source: 'demo-local', session: demo });
        } else if (mounted) {
          setState((current) =>
            current.status === 'authenticated' && current.source === 'demo-local'
              ? { status: 'unauthenticated' }
              : current,
          );
        }
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      unsubscribeDemo();
    };
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({ state, profile, profileLoading, refreshProfile }),
    [state, profile, profileLoading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAppAuth must be used within AuthProvider');
  }
  return ctx;
}
