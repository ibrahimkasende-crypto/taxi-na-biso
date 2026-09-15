import { haversineM } from '@openride/domain';

export function previewRoute(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
): { distance_m: number; duration_s: number } {
  const distance_m = Math.round(haversineM(pickup, dropoff));
  const duration_s = Math.max(60, Math.round(distance_m / 11));
  return { distance_m, duration_s };
}
