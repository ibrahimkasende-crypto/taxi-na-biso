import { DEMO_ACTIVITY_FALLBACK_STATS } from './demoActivity';
import type { ActivityRide } from './activityTypes';

export function computeActivityStats(rides: ActivityRide[], useFallback: boolean) {
  if (useFallback) return { ...DEMO_ACTIVITY_FALLBACK_STATS };
  const countable = rides.filter((ride) => ride.status !== 'cancelled');
  return {
    trips: countable.length,
    spendCents: countable.reduce((sum, ride) => sum + ride.fareCents, 0),
    distanceKm: Math.round(countable.reduce((sum, ride) => sum + ride.distanceKm, 0)),
  };
}

export function filterActivityRides(rides: ActivityRide[], filter: 'all' | 'completed' | 'scheduled' | 'cancelled') {
  if (filter === 'all') return rides;
  return rides.filter((ride) => ride.status === filter);
}
