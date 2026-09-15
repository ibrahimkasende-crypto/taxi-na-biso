import { notFound } from 'next/navigation';

import { DriverTripActions } from '@/components/DriverTripActions';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';

export default async function DriverTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('trips')
    .select('id, status, pickup_address, dropoff_address, estimated_fare_cents, rider_id')
    .eq('id', id)
    .eq('driver_id', profile.id)
    .maybeSingle();
  if (!data) notFound();

  const { data: rider } = await supabase.from('users').select('phone').eq('id', data.rider_id).maybeSingle();

  return <DriverTripActions trip={data} riderPhone={(rider as { phone?: string } | null)?.phone ?? null} />;
}
