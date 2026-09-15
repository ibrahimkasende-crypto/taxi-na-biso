import Link from 'next/link';

import { SignOutButton } from '@/components/SignOutButton';
import { requireRider } from '@/lib/session';

const links = [
  { href: '/client', label: 'Accueil' },
  { href: '/client/demandes', label: 'Demandes' },
  { href: '/client/courses', label: 'Courses' },
  { href: '/client/paiements', label: 'Paiements' },
  { href: '/client/profil', label: 'Profil' },
  { href: '/client/securite', label: 'Sécurité' },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRider();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/client" className="font-semibold text-brand">
            Espace client
          </Link>
          <p className="truncate text-sm text-muted">{profile.display_name ?? profile.email}</p>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-4 pb-3 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full border px-3 py-2">
              {l.label}
            </Link>
          ))}
          <SignOutButton href="/connexion" />
        </nav>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
