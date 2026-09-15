/**
 * Identité et paramètres de démonstration — application passager Taxi Na Biso.
 * Les montants internes restent en centimes (1 FC = 100 centimes), comme le backend.
 */

export const brand = {
  appName: 'Taxi Na Biso',
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
  /** Numéro d’urgence national RDC — aucun numéro dédié n’est encore configuré. */
  emergencyPhone: '112',
  /** Vide = WhatsApp assistance non configuré, le bouton n’est pas affiché. */
  whatsappSupport: '',
  supportPhone: '',
  scheme: 'taxinabiso',
  /** TODO: remplacer par les vraies URLs juridiques Taxi Na Biso. */
  termsUrl: '',
  privacyUrl: '',
} as const;

export const colors = {
  brand: '#F04A18',
  brandDark: '#D83E10',
  ink: '#111827',
  text: '#111827',
  textMuted: '#6B7280',
  background: '#F8F9FB',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAF8',
  border: '#E5E7EB',
  white: '#FFFFFF',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D83E10',
  online: '#16A34A',
  offline: '#667085',
  onTrip: '#D83E10',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Centre de fallback Kinshasa (Gombe / plateau). */
export const kinshasaCenter = { lat: -4.325, lng: 15.3222 } as const;

export interface VehicleCategory {
  id: 'economy' | 'comfort' | 'moto';
  label: string;
  description: string;
  /**
   * Valeur envoyée à l’API (`vehicle_type` enum Postgres).
   * Phase 1 : `sedan` pour les trois catégories afin que l’estimation
   * fonctionne avec la règle tarifaire déjà seedée. Les types dédiés
   * (suv / moto) viendront avec une migration ultérieure.
   */
  vehicleType: 'sedan';
  /** Grille prévue pour plus tard — non appliquée côté client. */
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
    description: 'Abordable et pratique',
    vehicleType: 'sedan',
    fare: {
      baseCents: 300_000,
      perKmCents: 100_000,
      perMinCents: 10_000,
      minimumCents: 500_000,
      platformCommissionPct: 15,
    },
  },
  {
    id: 'comfort',
    label: 'Confort',
    description: 'Plus d’espace et de confort',
    vehicleType: 'sedan',
    fare: {
      baseCents: 500_000,
      perKmCents: 150_000,
      perMinCents: 15_000,
      minimumCents: 800_000,
      platformCommissionPct: 15,
    },
  },
  {
    id: 'moto',
    label: 'Moto',
    description: 'Rapide dans la circulation',
    vehicleType: 'sedan',
    fare: {
      baseCents: 150_000,
      perKmCents: 70_000,
      perMinCents: 7_500,
      minimumCents: 300_000,
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

/** Lieux de démonstration à Kinshasa (coordonnées publiques approximatives). */
export const examplePlaces: readonly ExamplePlace[] = [
  { label: 'Gombe, Kinshasa', lat: -4.305, lng: 15.303 },
  { label: 'Limete, Kinshasa', lat: -4.375, lng: 15.345 },
  { label: 'Ngaliema, Kinshasa', lat: -4.327, lng: 15.249 },
  { label: 'UNIKIN, Kinshasa', lat: -4.396, lng: 15.309 },
  { label: 'Aéroport international de N’djili', lat: -4.3856, lng: 15.4446 },
] as const;

/** Affiche 15 000 FC à partir de centimes (1 500 000 → 15 000 FC). */
export function formatFare(cents: number): string {
  const amount = Math.round(cents / 100);
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} ${brand.currencySymbol}`;
}

/** Normalise un numéro saisi vers E.164 (+243…). Évite +243081… */
export function toE164(raw: string): string {
  const digits = raw.trim().replace(/\D/g, '');
  let national: string;
  if (digits.startsWith('243')) {
    national = digits.slice(3);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  } else {
    national = digits;
  }
  if (national.startsWith('0')) national = national.slice(1);
  return `${brand.callingCode}${national}`;
}
