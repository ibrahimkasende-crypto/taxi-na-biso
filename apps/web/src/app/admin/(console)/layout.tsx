import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/AdminShell';
import { homeForRole, isStaffRole } from '@/lib/roles';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role, display_name, email')
    .eq('id', user.id)
    .maybeSingle();
  const row = profile as { role?: string; display_name?: string | null; email?: string | null } | null;
  if (!isStaffRole(row?.role)) {
    redirect(homeForRole(row?.role));
  }

  return (
    <AdminShell email={row?.email || user.email || ''} name={row?.display_name || 'Admin'}>
      {children}
    </AdminShell>
  );
}
