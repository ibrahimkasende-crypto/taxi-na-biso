import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/components/SignOutButton';
import { homeForRole, isStaffRole } from '@/lib/roles';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const nav = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/dispatch', label: 'Dispatch' },
  { href: '/admin/drivers', label: 'Chauffeurs' },
  { href: '/admin/vehicles', label: 'Véhicules' },
  { href: '/admin/fares', label: 'Tarifs' },
  { href: '/admin/payments', label: 'Paiements' },
  { href: '/admin/compliance', label: 'Conformité' },
  { href: '/admin/incidents', label: 'Incidents' },
  { href: '/admin/audit', label: 'Journal d’audit' },
];

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (!isStaffRole(role)) {
    redirect(homeForRole(role));
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] text-[#1f2328]">
      <aside className="flex w-56 flex-col border-r border-black/10 bg-white p-4">
        <Link href="/admin" className="mb-6 text-lg font-semibold text-brand">
          Taxi Na Biso
        </Link>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Administration</p>
        <nav className="flex flex-col gap-1" aria-label="Navigation administration">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-3 py-2 text-sm hover:bg-gray-100">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-black/10 pt-4">
          <div className="mb-1 truncate text-xs text-gray-500" title={user.email ?? ''}>
            {user.email}
          </div>
          <SignOutButton href="/admin/login" />
          <Link href="/" className="mt-2 block text-xs text-muted hover:text-brand">
            Retour au site
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
