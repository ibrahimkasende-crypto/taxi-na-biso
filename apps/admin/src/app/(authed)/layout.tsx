import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/components/SignOutButton';
import { isStaffRole } from '@/lib/roles';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const nav = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dispatch', label: 'Dispatch' },
  { href: '/drivers', label: 'Chauffeurs' },
  { href: '/vehicles', label: 'Véhicules' },
  { href: '/fares', label: 'Tarifs' },
  { href: '/payments', label: 'Paiements' },
  { href: '/compliance', label: 'Conformité' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/audit', label: 'Journal d’audit' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (!isStaffRole((profile as { role?: string } | null)?.role)) {
    redirect('/login?denied=1');
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r p-4 flex flex-col">
        <div className="mb-6 text-lg font-semibold text-brand">Taxi Na Biso</div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded text-sm hover:bg-gray-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t">
          <div className="text-xs text-gray-500 truncate mb-1" title={user.email ?? ''}>
            {user.email}
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
