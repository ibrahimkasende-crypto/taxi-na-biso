/**
 * TEMPORAIRE — courses locales. N’écrit jamais dans Supabase.
 */

import { secureStorage } from '../../lib/secure-storage';
import type { DemoTrip } from './types';

const KEY = 'taxi_na_biso_demo_trips';

export async function readDemoTrips(): Promise<DemoTrip[]> {
  const raw = await secureStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoTrip[]) : [];
  } catch {
    return [];
  }
}

export async function writeDemoTrips(trips: DemoTrip[]): Promise<void> {
  await secureStorage.setItem(KEY, JSON.stringify(trips.slice(0, 20)));
}
