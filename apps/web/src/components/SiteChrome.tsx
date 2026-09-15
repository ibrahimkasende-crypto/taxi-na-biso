'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { brand, publicNav } from '@/config/brand';
import { getPublicEnv } from '@/lib/env';
import { useScrollProgress } from '@/lib/motion';

export function BrandLogo({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={inverted ? '/branding/logo-on-dark.png' : '/branding/monochrome-icon.png'}
      alt={brand.appName}
      className={className ?? 'h-12 w-auto max-w-[240px] object-contain object-left sm:h-14 sm:max-w-[300px] lg:h-16 lg:max-w-[340px]'}
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const overlay = pathname === '/';
  const [open, setOpen] = useState(false);
  const rawProgress = useScrollProgress(160, overlay);
  const progress = open ? 1 : rawProgress;
  const light = !overlay || progress > 0.42 || open;

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const linkCls = light ? 'text-ink/80 hover:text-brand' : 'text-white/90 hover:text-white';
  const padY = 14 - progress * 6;
  const logoScale = 1 - progress * 0.14;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        backgroundColor: `rgba(250, 250, 248, ${progress * 0.92})`,
        backdropFilter: progress > 0.04 ? `blur(${progress * 16}px)` : 'none',
        WebkitBackdropFilter: progress > 0.04 ? `blur(${progress * 16}px)` : 'none',
        boxShadow:
          progress > 0.12
            ? `0 1px 0 rgba(17,24,39,${progress * 0.06}), 0 10px 28px rgba(17,24,39,${progress * 0.06})`
            : 'none',
      }}
    >
      <div
        className="tnb-shell flex items-center justify-between gap-3"
        style={{ paddingTop: padY, paddingBottom: padY }}
      >
        <Link href="/" className="animate-logo-in flex min-w-0 items-center">
          <span
            className={`flex min-w-0 rounded-2xl px-1.5 py-1 ${light ? '' : 'bg-ink/25 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm'}`}
            style={{ transform: `scale(${logoScale})`, transformOrigin: 'left center' }}
          >
            <BrandLogo inverted={!light} />
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm lg:flex" aria-label="Navigation principale">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/chauffeur/connexion"
            className={`rounded-xl px-3 py-2 text-sm font-medium ${light ? 'text-ink/80 hover:bg-white' : 'text-white/90 hover:bg-white/10'}`}
          >
            Espace chauffeur
          </Link>
          <Link
            href="/connexion"
            className={`rounded-xl px-3 py-2 text-sm font-medium ${light ? 'text-ink hover:bg-white' : 'text-white hover:bg-white/10'}`}
          >
            Se connecter
          </Link>
          <Link href="/commander" className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Commander une course
          </Link>
        </div>
        <button
          type="button"
          className={`min-h-11 rounded-xl border px-3 lg:hidden ${light ? 'border-black/10' : 'border-white/30 text-white'}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="flex max-h-[calc(100dvh-64px)] flex-col gap-2 overflow-y-auto border-t bg-white px-4 py-4 lg:hidden">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="min-h-11 py-2" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/chauffeur/connexion" className="min-h-11 py-2" onClick={() => setOpen(false)}>
            Espace chauffeur
          </Link>
          <Link href="/connexion" className="min-h-11 py-2" onClick={() => setOpen(false)}>
            Se connecter
          </Link>
          <Link href="/commander" className="btn-primary" onClick={() => setOpen(false)}>
            Commander une course
          </Link>
          <a
            href={`${getPublicEnv().adminUrl}/login`}
            className="mt-3 min-h-11 border-t border-black/5 pt-3 text-sm text-ink/45"
            onClick={() => setOpen(false)}
          >
            Administration
          </a>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-0 bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-ink" />
      <div className="tnb-shell relative grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <Link href="/" className="inline-block">
            <BrandLogo inverted className="h-12 w-auto max-w-[280px] object-contain object-left sm:h-14" />
          </Link>
          <p className="mt-3 text-white/70">{brand.tagline}</p>
          <p className="mt-2 text-white/60">
            {brand.defaultCity}, {brand.defaultCountry}
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold">Passagers</p>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/commander" className="hover:text-white">Commander une course</Link></li>
            <li><Link href="/connexion" className="hover:text-white">Se connecter</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold">Chauffeurs</p>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/chauffeurs" className="hover:text-white">Devenir chauffeur</Link></li>
            <li><Link href="/chauffeur/connexion" className="hover:text-white">Espace chauffeur</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold">Taxi Na Biso</p>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
            <li><Link href="/securite" className="hover:text-white">Sécurité</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} {brand.appName}.{' '}
        <a href={`${getPublicEnv().adminUrl}/login`} className="text-white/35 underline-offset-2 hover:text-white/60 hover:underline">
          Administration
        </a>
      </div>
    </footer>
  );
}

export function Soon({ children }: { children: string }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-brand">
      {children}
    </span>
  );
}
