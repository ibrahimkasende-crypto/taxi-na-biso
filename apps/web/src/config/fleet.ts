export type FleetCategoryId =
  | 'basic'
  | 'confort'
  | 'premium'
  | 'familiale'
  | 'familiale_premium'
  | '4x4';

export interface FleetCategory {
  id: FleetCategoryId;
  label: string;
  positioning: string;
  vehicles: string[];
  hourlyUsd: number;
  dailyUsd: number;
  vehicleType: 'sedan' | 'suv' | 'van';
}

export const WHATSAPP_E164 = '243974543860' as const;
export const WHATSAPP_DISPLAY = '+243974543860' as const;

export const fleetCategories: readonly FleetCategory[] = [
  {
    id: 'basic',
    label: 'Basic',
    positioning: 'Simple et économique.',
    vehicles: ['Toyota IST', 'Vitz', 'Suzuki Swift'],
    hourlyUsd: 7,
    dailyUsd: 60,
    vehicleType: 'sedan',
  },
  {
    id: 'confort',
    label: 'Confort',
    positioning: 'Plus confortable.',
    vehicles: ['Toyota Blade', 'New IST'],
    hourlyUsd: 8,
    dailyUsd: 60,
    vehicleType: 'sedan',
  },
  {
    id: 'premium',
    label: 'Premium',
    positioning: 'Plus haut de gamme.',
    vehicles: ['Toyota Crown', 'Mark X'],
    hourlyUsd: 11,
    dailyUsd: 80,
    vehicleType: 'sedan',
  },
  {
    id: 'familiale',
    label: 'Familiale',
    positioning: 'Adaptée à davantage de passagers et de bagages.',
    vehicles: ['Toyota Ipsum', 'Mark X Zio'],
    hourlyUsd: 11,
    dailyUsd: 80,
    vehicleType: 'van',
  },
  {
    id: 'familiale_premium',
    label: 'Familiale Premium',
    positioning: 'Grand véhicule premium.',
    vehicles: ['Toyota Alphard'],
    hourlyUsd: 12,
    dailyUsd: 100,
    vehicleType: 'van',
  },
  {
    id: '4x4',
    label: '4x4',
    positioning: 'Véhicule robuste / premium.',
    vehicles: ['Prado TXL'],
    hourlyUsd: 20,
    dailyUsd: 160,
    vehicleType: 'suv',
  },
] as const;

export function fleetImageForCategory(id: FleetCategoryId): string {
  switch (id) {
    case 'basic':
      return '/images/fleet/basic.jpg';
    case 'confort':
      return '/images/fleet/confort.jpg';
    case 'premium':
      return '/images/fleet/premium.webp';
    case 'familiale':
    case 'familiale_premium':
      return '/images/fleet/familiale.jpg';
    case '4x4':
      return '/admin/taxi-car.png';
  }
}

export function fleetCategoryById(id: string | null | undefined): FleetCategory {
  const found = fleetCategories.find((c) => c.id === id);
  if (found) return found;
  const fallback = fleetCategories[0];
  if (!fallback) throw new Error('fleetCategories is empty');
  return fallback;
}

export interface FleetShowcaseItem {
  id: string;
  name: string;
  categoryId: FleetCategoryId;
  image: string;
  alt: string;
}

/** Alphard : l’ancien site le rangeait en « Familiale » ; le tarif officiel est Familiale Premium. */
export const fleetShowcase: readonly FleetShowcaseItem[] = [
  {
    id: 'ist',
    name: 'Toyota IST',
    categoryId: 'basic',
    image: '/images/fleet/basic.jpg',
    alt: 'Toyota IST, catégorie Basic',
  },
  {
    id: 'blade',
    name: 'Toyota Blade',
    categoryId: 'confort',
    image: '/images/fleet/confort.jpg',
    alt: 'Toyota Blade, catégorie Confort',
  },
  {
    id: 'crown',
    name: 'Toyota Crown',
    categoryId: 'premium',
    image: '/images/fleet/premium.webp',
    alt: 'Toyota Crown, catégorie Premium',
  },
  {
    id: 'alphard',
    name: 'Toyota Alphard',
    categoryId: 'familiale_premium',
    image: '/images/fleet/familiale.jpg',
    alt: 'Toyota Alphard, catégorie Familiale Premium',
  },
] as const;
