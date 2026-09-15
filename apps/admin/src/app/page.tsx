import { redirect } from 'next/navigation';

import { isStaffRole } from '@/lib/roles';
import { getSupabaseServer } from '@/lib/supabase-server';

export default async function Page() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (!isStaffRole((profile as { role?: string } | null)?.role)) {
    redirect('/login?denied=1');
  }
  redirect('/dashboard');
}
