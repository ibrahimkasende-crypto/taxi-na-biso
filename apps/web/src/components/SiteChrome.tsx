'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Shield, X } from 'lucide-react';

import { brand, publicNav } from '@/config/brand';
import { socialLinks, footerWhatsAppUrl } from '@/config/social';
import { useScrollProgress } from '@/lib/motion';
import { WhatsAppIcon } from '@/components/WhatsAppFloat';

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
          <Link href="/#reservation" className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Réserver
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
          <Link href="/#reservation" className="btn-primary" onClick={() => setOpen(false)}>
            Réserver
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function FooterSocialRow() {
  return (
    <div className="flex flex-wrap gap-2">
      <SocialCircle label="Facebook" href={socialLinks.facebook.href}>
        <FacebookMark />
      </SocialCircle>
      <SocialCircle label="Instagram" href={socialLinks.instagram.href}>
        <InstagramMark />
      </SocialCircle>
      <a
        href={footerWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:scale-105 hover:bg-[#25D366]"
      >
        <WhatsAppIcon className="h-5 w-5" />
      </a>
      <SocialCircle label="TikTok" href={socialLinks.tiktok.href}>
        <TikTokMark />
      </SocialCircle>
    </div>
  );
}

function FooterContactList() {
  return (
    <ul className="space-y-2 text-sm text-white/70">
      <li>{brand.defaultCity}, RDC</li>
      <li>
        <a href={footerWhatsAppUrl()} target="_blank" rel="noreferrer" className="hover:text-white">
          WhatsApp : +243 974 543 860
        </a>
      </li>
      <li>
        <a href={`mailto:${brand.supportEmail}`} className="hover:text-white">
          {brand.supportEmail}
        </a>
      </li>
    </ul>
  );
}

function FooterNavList() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/70 sm:grid-cols-1 sm:space-y-2">
      <li><Link href="/" className="hover:text-white">Accueil</Link></li>
      <li><Link href="/#services" className="hover:text-white">Services</Link></li>
      <li><Link href="/#flotte" className="hover:text-white">Notre flotte</Link></li>
      <li><Link href="/#tarifs" className="hover:text-white">Tarifs</Link></li>
      <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
      <li><Link href="/#reservation" className="hover:text-white">Réserver</Link></li>
    </ul>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-0 bg-navy text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-navy" />
      <div className="tnb-shell relative py-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:hidden">
          <div>
            <Link href="/" className="inline-block">
              <BrandLogo inverted className="h-11 w-auto max-w-[260px] object-contain object-left" />
            </Link>
            <p className="mt-3 text-sm font-medium text-taxi">Transport fiable · Service rapide · Disponible 24/7</p>
            <p className="mt-2 max-w-sm text-sm text-white/65">
              {brand.tagline} — déplacements à {brand.defaultCity}.
            </p>
            <div className="mt-4">
              <FooterSocialRow />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Contact</p>
            <FooterContactList />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Navigation</p>
            <FooterNavList />
          </div>
        </div>
        <div className="hidden gap-10 lg:grid lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block">
              <BrandLogo inverted className="h-12 w-auto max-w-[280px] object-contain object-left sm:h-14" />
            </Link>
            <p className="mt-4 text-sm font-medium text-taxi">Transport fiable · Service rapide · Disponible 24/7</p>
            <p className="mt-3 max-w-xs text-sm text-white/65">
              {brand.tagline} — déplacements à {brand.defaultCity}.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Navigation</p>
            <FooterNavList />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Contact</p>
            <FooterContactList />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Suivez-nous</p>
            <FooterSocialRow />
          </div>
        </div>
      </div>
      <div className="tnb-shell flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} TAXI NA BISO. Tous droits réservés.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/conditions" className="hover:text-white">Conditions d’utilisation</Link>
          <Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link>
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <AdminFooterLink />
        </div>
      </div>
    </footer>
  );
}

function FooterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 pb-3 lg:border-0 lg:pb-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold lg:hidden"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      <p className="mb-3 hidden text-sm font-semibold lg:block">{title}</p>
      <div className={open ? 'block' : 'hidden lg:block'}>{children}</div>
    </div>
  );
}

function SocialCircle({
  label,
  href,
  children,
}: {
  label: string;
  href: string | null;
  children: React.ReactNode;
}) {
  const cls =
    'grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:scale-105 hover:bg-taxi hover:text-navy';
  if (!href) {
    return (
      <span className={`${cls} cursor-default opacity-40`} title={`${label} — bientôt`} aria-label={`${label} (bientôt)`}>
        {children}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={cls}>
      {children}
    </a>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.4-3 3v2H9v3h2v7h3v-7h2.6l.4-3H14V9z" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M14.2 4c.4 2.4 1.8 4 4.3 4.2v3c-1.5 0-2.9-.5-4.2-1.4v6.6c0 3.2-2.5 5.6-5.7 5.6S2.9 19.6 2.9 16.4c0-3.1 2.4-5.6 5.5-5.7v3.1c-1.4.1-2.5 1.3-2.5 2.6 0 1.5 1.2 2.6 2.7 2.6s2.6-1.2 2.6-2.6V4h3z" />
    </svg>
  );
}

function AdminFooterLink() {
  return (
    <Link
      href="/admin/login"
      aria-label="Administration"
      title="Administration"
      className="group inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-white/35 transition hover:bg-white/5 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Shield className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="text-[11px] font-medium tracking-wide text-white/40 transition group-hover:text-white/70 group-focus-visible:text-white/70">
        Administration
      </span>
    </Link>
  );
}

export function Soon({ children }: { children: string }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-brand">
      {children}
    </span>
  );
}
