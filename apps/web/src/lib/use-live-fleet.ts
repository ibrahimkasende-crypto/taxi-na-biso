'use client';

import { useEffect, useState } from 'react';

import { fleetCategories, type FleetCategory } from '@/config/fleet';
import { overlayFleetRates } from '@/lib/live-fleet';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function useLiveFleet(): FleetCategory[] {
  const [cats, setCats] = useState<FleetCategory[]>([...fleetCategories]);
  useEffect(() => {
    void overlayFleetRates(getSupabaseBrowser()).then(setCats);
  }, []);
  return cats;
}
