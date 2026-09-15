import { notFound } from 'next/navigation';

import { TripLive } from '@/components/TripLive';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireRider } from '@/lib/session';

export default async function ClientTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRider();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('trips')
    .select(
      'id, status, pickup_address, dropoff_address, estimated_fare_cents, final_fare_cents, driver_id, booking_id',
    )
    .eq('id', id)
    .eq('rider_id', profile.id)
    .maybeSingle();

  if (!data) notFound();

  return <TripLive initial={data} />;
}
