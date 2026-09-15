import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateFare, fareForTrip } from './calculateFare';
import { greetingForHour, haversineMeters } from './geo';

test('économie applique le minimum 5 000 FC', () => {
  const fare = calculateFare({ category: 'economy', distanceKm: 0.4, durationMinutes: 2 });
  assert.equal(fare.totalFc, 5000);
  assert.equal(fare.totalCents, 500_000);
});

test('confort calcule base + km + minutes', () => {
  const fare = calculateFare({ category: 'comfort', distanceKm: 10, durationMinutes: 20 });
  assert.equal(fare.totalFc, 5000 + 10 * 1500 + 20 * 150);
});

test('moto reste au-dessus du minimum', () => {
  const fare = calculateFare({ category: 'moto', distanceKm: 1, durationMinutes: 3 });
  assert.equal(fare.totalFc, 3000);
});

test('trajet Gombe → N’djili produit une estimation', () => {
  const fare = fareForTrip({ lat: -4.305, lng: 15.303 }, { lat: -4.3856, lng: 15.4446 }, 'economy');
  assert.ok(fare.totalFc >= 5000);
  assert.ok(haversineMeters({ lat: -4.305, lng: 15.303 }, { lat: -4.3856, lng: 15.4446 }) > 1000);
});

test('bonjour / bonsoir', () => {
  assert.equal(greetingForHour(9), 'Bonjour');
  assert.equal(greetingForHour(19), 'Bonsoir');
  assert.equal(greetingForHour(3), 'Bonsoir');
});
