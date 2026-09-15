export const brand = {
  appName: 'Taxi Na Biso',
  shortName: 'Taxi Na Biso',
  tagline: 'Votre trajet, notre priorité',
  countryCode: 'CD',
  callingCode: '+243',
  defaultCountry: 'République démocratique du Congo',
  defaultCity: 'Kinshasa',
  currencyCode: 'CDF',
  currencySymbol: 'FC',
  timezone: 'Africa/Kinshasa',
  locale: 'fr-CD',
  supportEmail: 'support@example.com',
  heroKicker: 'La mobilité pensée pour Kinshasa',
  heroTitle: 'Votre trajet. Votre ville. Na Biso.',
  heroLead: 'Votre trajet commence ici.',
  heroAltTitle: 'Kinshasa avance avec Taxi Na Biso.',
  heroDescription: 'Le VTC de Kinshasa. Indiquez votre trajet et commandez en quelques secondes.',
} as const;

export function toE164Cd(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('243')) return `+${digits}`;
  if (digits.startsWith('0')) return `+243${digits.slice(1)}`;
  return `+243${digits}`;
}

export const kinshasaCenter = { lat: -4.3276, lng: 15.3136 } as const;

export interface VehicleCategory {
  id: 'economy' | 'comfort' | 'moto';
  label: string;
  description: string;
  vehicleType: 'sedan';
  fare: {
    baseCents: number;
    perKmCents: number;
    perMinCents: number;
    minimumCents: number;
    platformCommissionPct: number;
  };
}

export const vehicleCategories: readonly VehicleCategory[] = [
  {
    id: 'economy',
    label: 'Économie',
    description: 'Course abordable en ville',
    vehicleType: 'sedan',
    fare: {
      baseCents: 150_000,
      perKmCents: 80_000,
      perMinCents: 15_000,
      minimumCents: 300_000,
      platformCommissionPct: 15,
    },
  },
  {
    id: 'comfort',
    label: 'Confort',
    description: 'Berline climatisée',
    vehicleType: 'sedan',
    fare: {
      baseCents: 250_000,
      perKmCents: 110_000,
      perMinCents: 20_000,
      minimumCents: 500_000,
      platformCommissionPct: 15,
    },
  },
  {
    id: 'moto',
    label: 'Moto',
    description: 'Rapide dans le trafic',
    vehicleType: 'sedan',
    fare: {
      baseCents: 80_000,
      perKmCents: 50_000,
      perMinCents: 10_000,
      minimumCents: 150_000,
      platformCommissionPct: 12,
    },
  },
];

export function vehicleCategoryById(id: VehicleCategory['id']): VehicleCategory {
  const found = vehicleCategories.find((c) => c.id === id);
  if (found) return found;
  const economy = vehicleCategories.find((c) => c.id === 'economy');
  if (!economy) throw new Error('vehicleCategories is empty');
  return economy;
}

export interface ExamplePlace {
  label: string;
  lat: number;
  lng: number;
}

export const examplePlaces: readonly ExamplePlace[] = [
  { label: 'Gombe, Kinshasa', lat: -4.305, lng: 15.303 },
  { label: 'Limete, Kinshasa', lat: -4.375, lng: 15.345 },
  { label: 'Ngaliema, Kinshasa', lat: -4.327, lng: 15.249 },
  { label: 'UNIKIN, Kinshasa', lat: -4.396, lng: 15.309 },
  { label: 'Aéroport international de N’djili', lat: -4.3856, lng: 15.4446 },
];

export const publicNav = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/securite', label: 'Sécurité' },
  { href: '/chauffeurs', label: 'Chauffeurs' },
  { href: '/a-propos', label: 'À propos' },
] as const;

export const driverAppNav = [
  { href: '/chauffeur', label: 'Accueil' },
  { href: '/chauffeur/offres', label: 'Offres' },
  { href: '/chauffeur/course/en-cours', label: 'En cours' },
  { href: '/chauffeur/historique', label: 'Historique' },
  { href: '/chauffeur/profil', label: 'Profil' },
] as const;
