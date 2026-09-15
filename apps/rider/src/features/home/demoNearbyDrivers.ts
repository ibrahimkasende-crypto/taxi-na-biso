/**
 * TEMPORAIRE — voitures proches fictives. Ce ne sont pas des chauffeurs réels.
 */

import { destinationPoint, type LatLng } from './geo';

export type DemoNearbyCar = {
  id: string;
  lat: number;
  lng: number;
  heading: number;
};

const OFFSETS: { bearing: number; meters: number; heading: number }[] = [
  { bearing: 18, meters: 180, heading: 210 },
  { bearing: 72, meters: 260, heading: 140 },
  { bearing: 128, meters: 210, heading: 300 },
  { bearing: 195, meters: 290, heading: 20 },
  { bearing: 248, meters: 170, heading: 85 },
  { bearing: 312, meters: 240, heading: 165 },
];

export function createDemoNearbyDrivers(origin: LatLng): DemoNearbyCar[] {
  return OFFSETS.map((item, index) => {
    const point = destinationPoint(origin, item.bearing, item.meters);
    return {
      id: `demo-car-${index + 1}`,
      lat: point.lat,
      lng: point.lng,
      heading: item.heading,
    };
  });
}

export function nudgeDemoCars(cars: DemoNearbyCar[]): DemoNearbyCar[] {
  return cars.map((car, index) => {
    const step = destinationPoint(car, car.heading, 8 + (index % 3) * 2);
    return { ...car, lat: step.lat, lng: step.lng, heading: (car.heading + 4) % 360 };
  });
}
