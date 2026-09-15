'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { demoAdmin, isDevDemo } from '@/config/demoAccounts';
import { destinationForRole } from '@/lib/redirect';
import { homeForRole, isStaffRole } from '@/lib/roles';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next');
  const denied = params.get('denied') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(
    denied ? 'Cet espace est réservé à l’équipe Taxi Na Biso.' : null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { data: signed, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) throw signErr;
      if (!signed.session || !signed.user) throw new Error('Session Supabase introuvable après connexion.');

      const { data: profile } = await supabase.from('users').select('role').eq('id', signed.user.id).maybeSingle();
      const role = (profile as { role?: string } | null)?.role;
      const home = homeForRole(role);
      if (!isStaffRole(role)) {
        window.location.assign(home);
        return;
      }
      window.location.assign(destinationForRole(role, next, '/admin'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#161b27] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="tnb-halo absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#F04A18]/25 blur-3xl" />
        <div className="tnb-halo-slow absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <svg className="absolute left-[8%] top-[22%] h-12 w-12 opacity-15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 13h18l-2-6H5l-2 6Z" />
          <path d="M5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm14 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
        <svg className="tnb-marker-soft absolute bottom-[24%] left-[16%] h-8 w-8 text-[#F04A18] opacity-30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Zm0-9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
        </svg>
        <svg className="absolute right-[12%] top-[28%] h-10 w-10 opacity-15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_minmax(360px,440px)]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/logo-on-dark.png" alt="Taxi Na Biso" className="h-11 w-auto max-w-[240px] object-contain" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Taxi Na Biso</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Administration</h1>
          <p className="mt-3 max-w-md text-sm text-white/70">Accès réservé à l’équipe Taxi Na Biso.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full rounded-[1.75rem] bg-white p-6 text-[#111827] shadow-[0_18px_50px_rgba(17,24,39,0.18)] sm:p-7"
        >
          <h2 className="text-xl font-semibold">Connexion</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Console opérateur</p>
          <label className="mt-5 block text-sm font-medium">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-black/10 bg-[#f7f5f2] px-3 outline-none transition focus:border-[#F04A18]/40 focus:ring-2 focus:ring-[#F04A18]/20"
              autoComplete="username"
              required
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            Mot de passe
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-black/10 bg-[#f7f5f2] px-3 outline-none transition focus:border-[#F04A18]/40 focus:ring-2 focus:ring-[#F04A18]/20"
              autoComplete="current-password"
              required
            />
            <button type="button" className="mt-1 text-xs text-[#F04A18]" onClick={() => setShow((v) => !v)}>
              {show ? 'Masquer' : 'Afficher'} le mot de passe
            </button>
          </label>
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-[#DC2626]" role="alert">
              {error}
            </p>
          ) : null}
          {isDevDemo ? (
            <button
              type="button"
              className="mt-4 min-h-11 w-full rounded-xl border border-black/10 text-sm font-medium"
              onClick={() => {
                setEmail(demoAdmin.email);
                setPassword(demoAdmin.password);
              }}
            >
              Utiliser le compte de démonstration
            </button>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 min-h-12 w-full rounded-xl bg-[#F04A18] font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
          <p className="mt-4 text-center text-sm text-[#6b7280]">
            <Link href="/" className="text-[#F04A18]">
              Retour au site public
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
