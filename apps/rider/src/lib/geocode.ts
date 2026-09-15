import { brand, examplePlaces, kinshasaCenter, type ExamplePlace } from '../config/brand';

const KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export function hasGeocoder(): boolean {
  return Boolean(KEY);
}

function matchDemoPlaces(query: string): Place[] {
  const q = query.trim().toLocaleLowerCase('fr');
  if (!q) return [...examplePlaces];
  return examplePlaces.filter((p) => p.label.toLocaleLowerCase('fr').includes(q));
}

export async function searchPlaces(
  query: string,
  proximity?: { lat: number; lng: number },
): Promise<Place[]> {
  const demo = matchDemoPlaces(query);
  if (!KEY) return demo;

  if (query.trim().length < 3) return demo;

  const near = proximity ?? kinshasaCenter;
  const params = new URLSearchParams({
    key: KEY,
    country: brand.countryCode.toLowerCase(),
    language: 'fr',
    limit: '6',
    autocomplete: 'true',
    proximity: `${near.lng},${near.lat}`,
  });

  const res = await fetch(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?${params.toString()}`,
  );
  if (!res.ok) return demo;
  const data = (await res.json()) as { features?: GeocodeFeature[] };
  const remote = (data.features ?? [])
    .filter((f) => Array.isArray(f.center) && f.center.length === 2)
    .map((f) => ({ label: f.place_name ?? f.text ?? 'Lieu', lng: f.center[0], lat: f.center[1] }));

  const seen = new Set(demo.map((p) => p.label.toLocaleLowerCase('fr')));
  return [...demo, ...remote.filter((p) => !seen.has(p.label.toLocaleLowerCase('fr')))];
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!KEY) {
    const nearest = nearestDemo({ lat, lng });
    return nearest?.label ?? `${brand.defaultCity}`;
  }
  const res = await fetch(
    `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${KEY}&language=fr`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { features?: GeocodeFeature[] };
  return data.features?.[0]?.place_name ?? null;
}

function nearestDemo(point: { lat: number; lng: number }): ExamplePlace | undefined {
  let best: ExamplePlace | undefined;
  let bestD = Number.POSITIVE_INFINITY;
  for (const place of examplePlaces) {
    const d = (place.lat - point.lat) ** 2 + (place.lng - point.lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = place;
    }
  }
  return best;
}

interface GeocodeFeature {
  center: [number, number];
  place_name?: string;
  text?: string;
}
