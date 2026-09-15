import { redirect } from 'next/navigation';

import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';
import { ACTIVE_DRIVER_STATUSES } from '@/lib/trip-status';

export default async function EnCoursRedirectPage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('trips')
    .select('id')
    .eq('driver_id', profile.id)
    .in('status', [...ACTIVE_DRIVER_STATUSES])
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data?.id) redirect(`/chauffeur/course/${data.id}`);
  return <p className="text-muted">Aucune course en cours.</p>;
}
