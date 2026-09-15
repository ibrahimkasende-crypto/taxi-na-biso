/**
 * TEMPORAIRE — données Rider fictives lorsque source === 'demo-local'.
 * N’écrit rien dans Supabase. Voir docs/REMOVE_HARDCODED_DEMO_AUTH.md.
 */

import type { FareEstimateResponse } from '@openride/api-client';

import { vehicleCategoryById, type VehicleCategory } from '../../../config/brand';

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function estimateDemoFare(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  categoryId: VehicleCategory['id'],
): FareEstimateResponse {
  const category = vehicleCategoryById(categoryId);
  const distance_m = Math.max(400, Math.round(haversineMeters(pickup, dropoff)));
  const duration_s = Math.max(180, Math.round((distance_m / 1000) * 180));
  const km = distance_m / 1000;
  const minutes = duration_s / 60;
  const raw =
    category.fare.baseCents + km * category.fare.perKmCents + minutes * category.fare.perMinCents;
  const total_cents = Math.max(category.fare.minimumCents, Math.round(raw));
  return {
    estimate_id: `demo-est-${Date.now()}`,
    distance_m,
    duration_s,
    subtotal_cents: total_cents,
    surcharges_cents: 0,
    total_cents,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}
