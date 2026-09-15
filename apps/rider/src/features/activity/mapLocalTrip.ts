import type { DemoTrip } from '../home/types';
import type { ActivityRide } from './activityTypes';

export function mapLocalTrip(trip: DemoTrip): ActivityRide {
  const status =
    trip.status === 'cancelled' ? 'cancelled' : trip.status === 'completed' ? 'completed' : 'active';
  return {
    id: trip.id,
    pickupLabel: trip.pickup.label,
    dropoffLabel: trip.dropoff.label,
    pickupLat: trip.pickup.lat,
    pickupLng: trip.pickup.lng,
    dropoffLat: trip.dropoff.lat,
    dropoffLng: trip.dropoff.lng,
    occurredAt: trip.completedAt ?? trip.createdAt,
    driverName: trip.driver?.displayName ?? null,
    vehicle: trip.driver?.vehicle ?? null,
    plate: trip.driver?.plate ?? null,
    categoryId: trip.categoryId,
    fareCents: trip.fare.totalCents,
    estimated: trip.status !== 'completed',
    status,
    payment: 'Espèces',
    reference: trip.id.replace('demo-trip-', 'TNB-'),
    distanceKm: trip.fare.distanceKm,
  };
}
