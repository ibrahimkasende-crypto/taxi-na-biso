export type LatLng = { lat: number; lng: number };

export function haversineMeters(a: LatLng, b: LatLng): number {
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

export function estimateDurationSeconds(distanceM: number): number {
  const hours = distanceM / 1000 / 22;
  return Math.max(180, Math.round(hours * 3600));
}

export function destinationPoint(from: LatLng, bearingDeg: number, distanceM: number): LatLng {
  const r = 6371000;
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lng1 = (from.lng * Math.PI) / 180;
  const ang = distanceM / r;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(ang) + Math.cos(lat1) * Math.sin(ang) * Math.cos(br));
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(ang) * Math.cos(lat1),
      Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

export function bearingDegrees(a: LatLng, b: LatLng): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Route de démonstration : courbe entre deux points, pas un moteur Valhalla. */
export function demoRouteLine(from: LatLng, to: LatLng, steps = 24): LatLng[] {
  const mid = {
    lat: (from.lat + to.lat) / 2 + (to.lng - from.lng) * 0.18,
    lng: (from.lng + to.lng) / 2 - (to.lat - from.lat) * 0.18,
  };
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    points.push({
      lat: u * u * from.lat + 2 * u * t * mid.lat + t * t * to.lat,
      lng: u * u * from.lng + 2 * u * t * mid.lng + t * t * to.lng,
    });
  }
  return points;
}

export function greetingForHour(hour: number): 'Bonjour' | 'Bonsoir' {
  return hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
}

export function kinshasaHour(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Kinshasa',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  return Number(parts.find((p) => p.type === 'hour')?.value ?? now.getHours());
}
