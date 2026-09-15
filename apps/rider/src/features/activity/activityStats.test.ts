import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computeActivityStats, filterActivityRides } from './activityStats';
import { DEMO_ACTIVITY_RIDES } from './demoActivity';
import type { ActivityRide } from './activityTypes';

test('filtre programmées uniquement', () => {
  const scheduled = filterActivityRides(DEMO_ACTIVITY_RIDES, 'scheduled');
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0]?.pickupLabel, 'Mont-Ngafula');
});

test('stats réelles depuis les courses, pas le fallback', () => {
  const rides: ActivityRide[] = DEMO_ACTIVITY_RIDES.filter((ride) => ride.status === 'completed');
  const stats = computeActivityStats(rides, false);
  assert.equal(stats.trips, 3);
  assert.equal(stats.spendCents, 1_850_000 + 3_200_000 + 800_000);
});

test('fallback démo seulement si demandé', () => {
  const stats = computeActivityStats([], true);
  assert.equal(stats.trips, 12);
  assert.equal(stats.distanceKm, 74);
});
