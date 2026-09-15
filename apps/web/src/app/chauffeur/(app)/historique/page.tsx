import Link from 'next/link';
import { formatFareCdf } from '@openride/ui';

import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';
import { tripStatusLabel } from '@/lib/trip-status';

export default async function DriverHistoryPage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('trips')
    .select('id, status, pickup_address, dropoff_address, estimated_fare_cents, final_fare_cents')
    .eq('driver_id', profile.id)
    .order('requested_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold">Historique</h1>
      <ul className="mt-4 space-y-3">
        {(data ?? []).map((t) => {
          const fare = t.final_fare_cents ?? t.estimated_fare_cents;
          return (
            <li key={t.id}>
              <Link href={`/chauffeur/course/${t.id}`} className="block rounded-2xl bg-white p-4 shadow-card">
                <p className="text-sm text-muted">{tripStatusLabel(t.status)}</p>
                <p>{t.pickup_address} → {t.dropoff_address}</p>
                <p className="text-sm">{fare != null ? formatFareCdf(fare) : '—'}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
