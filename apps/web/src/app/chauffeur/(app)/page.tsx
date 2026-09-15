import { DriverConsole } from '@/components/DriverConsole';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';

export default async function DriverHomePage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('driver_profiles')
    .select('status')
    .eq('user_id', profile.id)
    .maybeSingle();
  const approved = (data as { status?: string } | null)?.status === 'approved';

  return <DriverConsole driverId={profile.id} approved={approved} />;
}
