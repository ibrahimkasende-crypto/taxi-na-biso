import { DriverProfileForm } from '@/components/DriverProfileForm';
import { requireDriver } from '@/lib/session';
import { getSupabaseServer } from '@/lib/supabase-server';

export default async function DriverProfilPage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase.from('driver_profiles').select('status, licence_number').eq('user_id', profile.id).maybeSingle();
  const row = data as { status?: string; licence_number?: string | null } | null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <h1 className="text-2xl font-bold">Profil</h1>
      <p className="mt-3 text-sm text-muted">{profile.email}</p>
      <p className="mt-2 text-sm">Statut : {row?.status ?? '—'}</p>
      <DriverProfileForm
        driverId={profile.id}
        initialName={profile.display_name}
        initialLicence={row?.licence_number ?? null}
      />
    </div>
  );
}
