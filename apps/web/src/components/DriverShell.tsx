'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SignOutButton } from '@/components/SignOutButton';
import { driverAppNav } from '@/config/brand';
import { getPublicEnv } from '@/lib/env';

export function DriverShell({
  name,
  children,
}: {
  name: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const env = getPublicEnv();

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:flex">
      <aside className="hidden md:flex w-56 flex-col border-r bg-white p-4">
        <p className="font-semibold text-brand">Taxi Na Biso</p>
        <p className="text-xs text-muted">Espace chauffeur</p>
        <p className="mt-1 truncate text-xs text-muted">{name}</p>
        <nav className="mt-6 flex flex-col gap-1">
          {driverAppNav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-3 py-2 text-sm ${pathname === l.href ? 'bg-brand text-white' : 'hover:bg-canvas'}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/chauffeur/revenus" className="rounded-xl px-3 py-2 text-sm hover:bg-canvas">
            Revenus
          </Link>
          <Link href="/chauffeur/documents" className="rounded-xl px-3 py-2 text-sm hover:bg-canvas">
            Documents
          </Link>
          <Link href="/chauffeur/vehicule" className="rounded-xl px-3 py-2 text-sm hover:bg-canvas">
            Véhicule
          </Link>
          <Link href="/chauffeur/assistance" className="rounded-xl px-3 py-2 text-sm hover:bg-canvas">
            Assistance
          </Link>
        </nav>
        <div className="mt-auto pt-4">
          <SignOutButton href="/chauffeur/connexion" />
        </div>
      </aside>
      <div className="flex-1 px-4 py-4 md:p-8">
        <p className="mb-4 rounded-xl bg-orange-50 p-3 text-sm text-ink">
          Pour recevoir et réaliser correctement les courses en arrière-plan, utilisez l’application Taxi Na Biso
          Chauffeur.
          {env.driverAppUrl ? (
            <>
              {' '}
              <a className="font-semibold text-brand" href={env.driverAppUrl}>
                Télécharger l’application chauffeur
              </a>
            </>
          ) : (
            <span className="text-muted"> (URL d’installation à configurer : NEXT_PUBLIC_DRIVER_APP_URL)</span>
          )}
        </p>
        {children}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t bg-white md:hidden">
        {driverAppNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 px-1 py-3 text-center text-xs ${pathname === l.href ? 'font-semibold text-brand' : 'text-muted'}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
