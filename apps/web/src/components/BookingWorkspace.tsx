'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { KinshasaMap, type MapPoint } from '@/components/KinshasaMap';
import { QuickBook, type Place } from '@/components/QuickBook';
import { examplePlaces } from '@/config/brand';

function placeFromLabel(label: string | null): Place | null {
  if (!label) return null;
  return examplePlaces.find((x) => x.label === label) ?? null;
}

function asPlace(point: MapPoint, fallbackLabel: string, previous?: Place | null): Place {
  const keep =
    previous &&
    Math.abs(previous.lat - point.lat) < 1e-6 &&
    Math.abs(previous.lng - point.lng) < 1e-6;
  return { lat: point.lat, lng: point.lng, label: keep ? previous.label : fallbackLabel };
}

export function BookingWorkspace() {
  const params = useSearchParams();
  const [pickup, setPickup] = useState<Place | null>(() => placeFromLabel(params.get('from')));
  const [dropoff, setDropoff] = useState<Place | null>(() => placeFromLabel(params.get('to')));

  const onPickupChange = useCallback((point: MapPoint) => {
    setPickup((prev) => asPlace(point, 'Départ sur la carte', prev));
  }, []);

  const onDropoffChange = useCallback((point: MapPoint) => {
    setDropoff((prev) => asPlace(point, 'Destination sur la carte', prev));
  }, []);

  return (
    <div className="space-y-6">
      <KinshasaMap
        pickup={pickup}
        dropoff={dropoff}
        interactive
        onPickupChange={onPickupChange}
        onDropoffChange={onDropoffChange}
      />
      <QuickBook pickup={pickup} dropoff={dropoff} onPickupChange={setPickup} onDropoffChange={setDropoff} />
    </div>
  );
}
