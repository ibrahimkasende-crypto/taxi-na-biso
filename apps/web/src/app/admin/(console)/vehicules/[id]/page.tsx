import Link from 'next/link';

import { fleetCategoryById } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseServer } from '@/lib/supabase-server';
import { StatusPill } from '@/components/admin/AdminUi';

export default async function VehiculeFiche({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = bookingDb(await getSupabaseServer());
  const { data } = await supabase.from('vehicles').select('*').eq('id', id).maybeSingle();
  const v = data as {
    make?: string;
    model?: string;
    rego?: string;
    status?: string;
    color?: string | null;
    fleet_category?: string | null;
  } | null;
  if (!v) return <p>Véhicule introuvable.</p>;
  const cat = fleetCategoryById(v.fleet_category);

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/admin/vehicules" className="text-sm text-muted">← Véhicules</Link>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/admin/taxi-car.png" alt="" className="h-56 w-full rounded-2xl object-cover" />
      <h1 className="text-2xl font-bold">{v.make} {v.model}</h1>
      <p className="text-muted">{cat.label} · {v.rego} · {v.color}</p>
      <StatusPill status={v.status ?? 'active'} />
      <p className="text-sm">{cat.hourlyUsd} $ / heure · {cat.dailyUsd} $ / journée</p>
    </div>
  );
}
