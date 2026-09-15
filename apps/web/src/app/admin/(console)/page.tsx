import { bookingDb } from '@/lib/booking-db';
import { getSupabaseServer } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = bookingDb(await getSupabaseServer());

  const [{ count: driverCount }, { count: vehicleCount }, { count: tripCount }, { count: pendingCount }] = await Promise.all([
    supabase.from('driver_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('trips').select('*', { count: 'exact', head: true }),
    supabase.from('booking_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const kpis = [
    { label: 'Demandes en attente', value: pendingCount ?? 0, href: '/admin/demandes' },
    { label: 'Chauffeurs', value: driverCount ?? 0, href: '/admin/drivers' },
    { label: 'Véhicules', value: vehicleCount ?? 0, href: '/admin/vehicles' },
    { label: 'Courses (total)', value: tripCount ?? 0, href: '/admin/dispatch' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tableau de bord</h1>
      <div className="grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <a key={k.label} href={k.href} className="rounded-lg border bg-white p-4 hover:border-brand">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="mt-1 text-3xl font-semibold">{k.value}</div>
          </a>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Les nouvelles demandes apparaissent dans Demandes de courses, puis le dispatch après approbation.
      </p>
    </div>
  );
}
