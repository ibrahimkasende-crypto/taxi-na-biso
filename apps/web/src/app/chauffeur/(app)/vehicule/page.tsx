import { VehicleForm } from '@/components/VehicleForm';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';

export default async function VehiculePage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('vehicles')
    .select('rego, make, model, year, color, status, vehicle_type')
    .eq('default_driver_id', profile.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Véhicule</h1>
      <ul className="mt-4 space-y-3">
        {(data ?? []).map((v) => (
          <li key={v.rego} className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-semibold">{v.rego}</p>
            <p className="text-sm text-muted">
              {v.make} {v.model} ({v.year}) · {v.color} · {v.vehicle_type} · {v.status}
            </p>
          </li>
        ))}
      </ul>
      <VehicleForm driverId={profile.id} />
    </div>
  );
}
