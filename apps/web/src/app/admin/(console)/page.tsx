import { getSupabaseServer } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();

  const [{ count: driverCount }, { count: vehicleCount }, { count: tripCount }] = await Promise.all([
    supabase.from('driver_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('trips').select('*', { count: 'exact', head: true }),
  ]);

  const kpis = [
    { label: 'Chauffeurs', value: driverCount ?? 0 },
    { label: 'Véhicules', value: vehicleCount ?? 0 },
    { label: 'Courses (total)', value: tripCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tableau de bord</h1>
      <div className="grid grid-cols-3 gap-4 max-w-3xl">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-3xl font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Compteurs issus de la base. La carte live et la file d’attente restent dans le module Dispatch.
      </p>
    </div>
  );
}
