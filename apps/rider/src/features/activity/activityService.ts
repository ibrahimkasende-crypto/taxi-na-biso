import { isDevAuthBypass } from '../auth/demo/demoAuthEnabled';
import { supabase } from '../../lib/supabase';
import { DEMO_ACTIVITY_RIDES } from './demoActivity';
import { mapLocalTrip } from './mapLocalTrip';
import type { ActivityRide } from './activityTypes';
import type { DemoTrip } from '../home/types';

type TripRow = {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  requested_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  status: string;
  estimated_fare_cents: number | null;
  final_fare_cents: number | null;
  distance_m: number | null;
  payment_status: string;
};

function mapRemoteTrip(row: TripRow): ActivityRide {
  const status: ActivityRide['status'] =
    row.status === 'cancelled'
      ? 'cancelled'
      : row.status === 'completed'
        ? 'completed'
        : row.status === 'requested'
          ? 'scheduled'
          : 'active';
  return {
    id: row.id,
    pickupLabel: row.pickup_address,
    dropoffLabel: row.dropoff_address,
    occurredAt: row.completed_at ?? row.cancelled_at ?? row.requested_at,
    driverName: null,
    vehicle: null,
    plate: null,
    categoryId: 'economy',
    fareCents: row.final_fare_cents ?? row.estimated_fare_cents ?? 0,
    estimated: row.final_fare_cents == null,
    status,
    payment: row.payment_status === 'paid' ? 'Payé' : 'Espèces',
    reference: row.id.slice(0, 8).toUpperCase(),
    distanceKm: row.distance_m ? row.distance_m / 1000 : 0,
  };
}

export async function loadActivityRides(input: {
  userId: string | null;
  source: 'supabase' | 'demo-local' | null;
  localTrips: DemoTrip[];
}): Promise<{ rides: ActivityRide[]; usingDemoCatalog: boolean }> {
  if (input.source === 'supabase' && input.userId) {
    const { data, error } = await supabase
      .from('trips')
      .select(
        'id, pickup_address, dropoff_address, requested_at, completed_at, cancelled_at, status, estimated_fare_cents, final_fare_cents, distance_m, payment_status',
      )
      .eq('rider_id', input.userId)
      .order('requested_at', { ascending: false })
      .limit(40);
    if (!error && data && data.length > 0) {
      return { rides: (data as TripRow[]).map(mapRemoteTrip), usingDemoCatalog: false };
    }
  }

  if (input.localTrips.length > 0) {
    return { rides: input.localTrips.map(mapLocalTrip), usingDemoCatalog: false };
  }

  if (isDevAuthBypass()) {
    return { rides: DEMO_ACTIVITY_RIDES, usingDemoCatalog: true };
  }

  return { rides: [], usingDemoCatalog: false };
}
