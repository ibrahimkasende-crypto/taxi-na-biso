import { fleetCategories, type FleetCategory } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';

export async function overlayFleetRates(client: unknown): Promise<FleetCategory[]> {
  const { data } = await bookingDb(client).from('fleet_rates').select('category, hourly_usd, daily_usd');
  const map = new Map(
    ((data as { category: string; hourly_usd: number; daily_usd: number }[]) ?? []).map((r) => [
      r.category,
      { hourly: Number(r.hourly_usd), daily: Number(r.daily_usd) },
    ]),
  );
  return fleetCategories.map((c) => {
    const live = map.get(c.id);
    return live ? { ...c, hourlyUsd: live.hourly, dailyUsd: live.daily } : { ...c };
  });
}
