import type { VehicleCategory } from '../../config/brand';
import { estimateDurationSeconds, haversineMeters, type LatLng } from './geo';

export type FareCategory = VehicleCategory['id'];

export const FARE_TABLE: Record<
  FareCategory,
  { baseFc: number; perKmFc: number; perMinFc: number; minimumFc: number }
> = {
  economy: { baseFc: 3000, perKmFc: 1000, perMinFc: 100, minimumFc: 5000 },
  comfort: { baseFc: 5000, perKmFc: 1500, perMinFc: 150, minimumFc: 8000 },
  moto: { baseFc: 1500, perKmFc: 700, perMinFc: 75, minimumFc: 3000 },
};

export type FareInput = {
  category: FareCategory;
  distanceKm: number;
  durationMinutes: number;
};

export type FareResult = {
  category: FareCategory;
  distanceKm: number;
  durationMinutes: number;
  totalFc: number;
  totalCents: number;
};

export function calculateFare(input: FareInput): FareResult {
  const table = FARE_TABLE[input.category];
  const raw = table.baseFc + input.distanceKm * table.perKmFc + input.durationMinutes * table.perMinFc;
  const totalFc = Math.max(table.minimumFc, Math.round(raw));
  return {
    category: input.category,
    distanceKm: input.distanceKm,
    durationMinutes: input.durationMinutes,
    totalFc,
    totalCents: totalFc * 100,
  };
}

export function fareForTrip(pickup: LatLng, dropoff: LatLng, category: FareCategory): FareResult {
  const distanceM = Math.max(400, haversineMeters(pickup, dropoff));
  const durationS = estimateDurationSeconds(distanceM);
  return calculateFare({
    category,
    distanceKm: distanceM / 1000,
    durationMinutes: durationS / 60,
  });
}
