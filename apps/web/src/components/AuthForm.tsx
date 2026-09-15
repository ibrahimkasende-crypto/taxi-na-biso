'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Mail, UserRound } from 'lucide-react';

import { brand } from '@/config/brand';
import { demoClient, demoDriver, isDevDemo } from '@/config/demoAccounts';
import { destinationForRole } from '@/lib/redirect';
import { homeForRole } from '@/lib/roles';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function AuthForm({
  mode,
  intendedRole,
}: {
  mode: 'signin' | 'signup';
  intendedRole: 'rider' | 'driver';
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const heading =
    mode === 'signup'
      ? intendedRole === 'driver'
        ? 'Créer un compte chauffeur'
        : 'Créer un compte passager'
      : intendedRole === 'driver'
        ? 'Connexion chauffeur'
        : 'Connexion';
  const hint =
    mode === 'signup'
      ? `${brand.appName} · ${brand.defaultCity}`
      : intendedRole === 'driver'
        ? 'Accédez à votre espace de conduite'
        : 'Espace passager';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    try {
      if (mode === 'signup') {
        const { error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: intendedRole, display_name: name || undefined },
          },
        });
        if (signErr) throw signErr;
      } else {
        const { data: signed, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signErr) throw signErr;
        if (!signed.session) throw new Error('Session Supabase introuvable après connexion.');
      }

      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id;
      if (!id) {
        router.replace(intendedRole === 'driver' ? '/chauffeur/verification' : '/verification');
        return;
      }
      const { data: profile } = await supabase.from('users').select('role').eq('id', id).maybeSingle();
      const role = (profile as { role?: string } | null)?.role ?? intendedRole;
      const home = homeForRole(role);
      const dest = mode === 'signin' ? destinationForRole(role, next, home) : home;
      if (dest.startsWith('http://') || dest.startsWith('https://')) {
        window.location.href = dest;
        return;
      }
      router.replace(dest);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const field =
    'mt-1 min-h-12 w-full rounded-xl border border-black/10 bg-[#f7f5f2] px-10 text-ink outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/20';

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-[1.75rem] bg-white/95 p-6 shadow-[0_18px_50px_rgba(17,24,39,0.12)] backdrop-blur-md sm:p-7"
    >
      <h2 className="text-xl font-semibold text-ink">{heading}</h2>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      {mode === 'signup' ? (
        <label className="mt-5 block text-sm font-medium text-ink">
          Prénom
          <span className="relative mt-1 block">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </span>
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-medium text-ink">
        E-mail
        <span className="relative mt-1 block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
          <input
            type="email"
            required
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </span>
      </label>
      <label className="mt-3 block text-sm font-medium text-ink">
        Mot de passe
        <span className="relative mt-1 block">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            className={field}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </span>
        <button type="button" className="mt-1 text-xs text-brand" onClick={() => setShowPassword((v) => !v)}>
          {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
        </button>
      </label>
      {mode === 'signin' ? (
        <label className="mt-3 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Se souvenir de moi sur cet appareil
        </label>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {isDevDemo && mode === 'signin' ? (
        <button
          type="button"
          className="mt-4 w-full min-h-11 rounded-xl border border-black/10 text-sm font-medium text-ink"
          onClick={() => {
            const demo = intendedRole === 'driver' ? demoDriver : demoClient;
            setEmail(demo.email);
            setPassword(demo.password);
          }}
        >
          Utiliser le compte de démonstration
        </button>
      ) : null}
      <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'signin' ? 'Se connecter' : 'S’inscrire'}
      </button>
    </form>
  );
}
