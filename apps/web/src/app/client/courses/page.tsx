import Link from 'next/link';
import { formatFareCdf } from '@openride/ui';

import { getSupabaseServer } from '@/lib/supabase-server';
import { requireRider } from '@/lib/session';
import { tripStatusLabel } from '@/lib/trip-status';

export default async function CoursesPage() {
  const profile = await requireRider();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('trips')
    .select('id, status, pickup_address, dropoff_address, estimated_fare_cents, final_fare_cents, requested_at')
    .eq('rider_id', profile.id)
    .order('requested_at', { ascending: false })
    .limit(50);

  const trips = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Courses</h1>
      {trips.length === 0 ? (
        <p className="mt-4 text-muted">Pas encore de courses.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {trips.map((t) => {
            const fare = t.final_fare_cents ?? t.estimated_fare_cents;
            return (
              <li key={t.id}>
                <Link href={`/client/course/${t.id}`} className="block rounded-2xl bg-white p-4 shadow-card">
                  <p className="text-sm text-muted">{tripStatusLabel(t.status)}</p>
                  <p className="font-medium">
                    {t.pickup_address} → {t.dropoff_address}
                  </p>
                  <p className="text-sm">{fare != null ? formatFareCdf(fare) : '—'}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
