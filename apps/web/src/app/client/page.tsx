import Link from 'next/link';

import { getSupabaseServer } from '@/lib/supabase-server';
import { requireRider } from '@/lib/session';
import { ACTIVE_RIDER_STATUSES, tripStatusLabel } from '@/lib/trip-status';

export default async function ClientHomePage() {
  const profile = await requireRider();
  const supabase = await getSupabaseServer();
  const { data: trip } = await supabase
    .from('trips')
    .select('id, status, pickup_address, dropoff_address')
    .eq('rider_id', profile.id)
    .in('status', [...ACTIVE_RIDER_STATUSES])
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bonjour {profile.display_name ?? ''}</h1>
      <Link href="/commander" className="inline-flex min-h-12 items-center rounded-xl bg-brand px-5 font-semibold text-white">
        Nouvelle course
      </Link>
      {trip ? (
        <Link href={`/client/course/${trip.id}`} className="block rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-muted">{tripStatusLabel(trip.status)}</p>
          <p className="font-medium">
            {trip.pickup_address} → {trip.dropoff_address}
          </p>
        </Link>
      ) : (
        <p className="text-muted">Aucune course en cours.</p>
      )}
    </div>
  );
}
