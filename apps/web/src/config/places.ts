export interface KinshasaPlace {
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  category?: string;
  aliases: string[];
}

export const kinshasaPlaces: readonly KinshasaPlace[] = [
  {
    label: 'Université de Kinshasa',
    address: 'UNIKIN, Lemba, Kinshasa',
    lat: -4.422,
    lng: 15.31,
    place_id: 'unikin',
    category: 'université',
    aliases: ['unik', 'unikin', 'uni kin', 'lemba universite', 'universite de kinshasa'],
  },
  {
    label: 'Aéroport International de N’djili',
    address: 'Aéroport N’djili, Kinshasa',
    lat: -4.3856,
    lng: 15.4446,
    place_id: 'ndjili',
    category: 'aéroport',
    aliases: ['aero', 'aeroport', 'ndjili', "n'djili", 'n djili', 'fia', 'airport'],
  },
  {
    label: 'Place Victoire',
    address: 'Kalamu, Kinshasa',
    lat: -4.331,
    lng: 15.312,
    place_id: 'victoire',
    category: 'place',
    aliases: ['vic', 'victoire', 'place victoire', 'rond point victoire'],
  },
  {
    label: 'Gombe',
    address: 'Gombe, Kinshasa',
    lat: -4.305,
    lng: 15.313,
    place_id: 'gombe',
    category: 'commune',
    aliases: ['gom', 'gombe', 'centre ville', 'centre-ville'],
  },
  {
    label: 'Boulevard du 30 Juin',
    address: 'Gombe, Kinshasa',
    lat: -4.3055,
    lng: 15.3132,
    place_id: 'b30juin',
    aliases: ['30 juin', 'boulevard', 'b30'],
  },
  {
    label: 'Limete',
    address: 'Limete, Kinshasa',
    lat: -4.378,
    lng: 15.338,
    place_id: 'limete',
    aliases: ['lim', 'limete', 'echangeur'],
  },
  {
    label: 'Échangeur de Limete',
    address: 'Tour de l’Échangeur, Limete, Kinshasa',
    lat: -4.377,
    lng: 15.3385,
    place_id: 'echangeur',
    aliases: ['echangeur', 'tour limete'],
  },
  {
    label: 'Ngaba',
    address: 'Rond-point Ngaba, Kinshasa',
    lat: -4.378,
    lng: 15.326,
    place_id: 'ngaba',
    aliases: ['nga', 'ngaba', 'rond point ngaba'],
  },
  {
    label: 'Ngaliema',
    address: 'Ngaliema, Kinshasa',
    lat: -4.327,
    lng: 15.249,
    place_id: 'ngaliema',
    aliases: ['nga liema', 'ngaliema'],
  },
  {
    label: 'Kintambo Magasin',
    address: 'Kintambo, Kinshasa',
    lat: -4.327,
    lng: 15.266,
    place_id: 'kintambo',
    aliases: ['kintambo', 'magasin'],
  },
  {
    label: 'Matonge',
    address: 'Matonge, Kinshasa',
    lat: -4.332,
    lng: 15.307,
    place_id: 'matonge',
    aliases: ['matonge', 'matongé'],
  },
  {
    label: 'Masina',
    address: 'Masina, Kinshasa',
    lat: -4.365,
    lng: 15.4,
    place_id: 'masina',
    aliases: ['masina', 'sans fil'],
  },
  {
    label: 'N’djili commune',
    address: 'Commune de N’djili, Kinshasa',
    lat: -4.398,
    lng: 15.432,
    place_id: 'ndjili-commune',
    aliases: ['ndjili commune', 'commune ndjili'],
  },
  {
    label: 'Bandalungwa',
    address: 'Bandalungwa, Kinshasa',
    lat: -4.345,
    lng: 15.28,
    place_id: 'bandal',
    aliases: ['bandal', 'bandalungwa'],
  },
  {
    label: 'Lemba',
    address: 'Lemba, Kinshasa',
    lat: -4.392,
    lng: 15.322,
    place_id: 'lemba',
    aliases: ['lemba'],
  },
  {
    label: 'Kimbanseke',
    address: 'Kimbanseke, Kinshasa',
    lat: -4.45,
    lng: 15.4,
    place_id: 'kimbanseke',
    aliases: ['kimbanseke', 'kimb'],
  },
  {
    label: 'Hôpital Général de Kinshasa',
    address: 'Gombe, Kinshasa',
    lat: -4.319,
    lng: 15.297,
    place_id: 'hgk',
    aliases: ['hopital', 'mama yemo', 'general'],
  },
  {
    label: 'Marché central de Kinshasa',
    address: 'Gombe, Kinshasa',
    lat: -4.312,
    lng: 15.308,
    place_id: 'marche-central',
    aliases: ['marche', 'marche central', 'zando'],
  },
  {
    label: 'Utexafrica',
    address: 'Limete, Kinshasa',
    lat: -4.365,
    lng: 15.35,
    place_id: 'utex',
    aliases: ['utex', 'utexafrica'],
  },
  {
    label: 'Palais du Peuple',
    address: 'Lingwala, Kinshasa',
    lat: -4.331,
    lng: 15.297,
    place_id: 'palais',
    aliases: ['palais', 'parlement'],
  },
];

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function scorePlace(place: KinshasaPlace, q: string): number {
  if (!q) return 0;
  const hay = fold([place.label, place.address, ...place.aliases].join(' '));
  const needle = fold(q);
  if (!needle) return 0;
  if (hay.includes(needle)) return needle.length * 4;
  const parts = needle.split(' ').filter(Boolean);
  let n = 0;
  for (const p of parts) {
    if (hay.includes(p)) n += p.length * 2;
    else if ([place.label, ...place.aliases].some((a) => fold(a).startsWith(p))) n += p.length;
  }
  return n;
}

const RECENT_KEY = 'tnb_recent_places';

export function readRecentPlaces(): KinshasaPlace[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as KinshasaPlace[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function rememberPlace(place: KinshasaPlace): void {
  if (typeof window === 'undefined') return;
  const rest = readRecentPlaces().filter((p) => p.place_id !== place.place_id);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify([place, ...rest].slice(0, 5)));
}

export function searchKinshasaPlaces(query: string): KinshasaPlace[] {
  const q = query.trim();
  const recent = readRecentPlaces();
  if (!q) {
    const popular = kinshasaPlaces.slice(0, 6);
    const merged = [...recent, ...popular.filter((p) => !recent.some((r) => r.place_id === p.place_id))];
    return merged.slice(0, 8);
  }
  return [...kinshasaPlaces]
    .map((p) => ({ p, s: scorePlace(p, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((x) => x.p);
}

export function nearestPlace(lat: number, lng: number): KinshasaPlace | null {
  let best: KinshasaPlace | null = null;
  let bestD = Infinity;
  for (const p of kinshasaPlaces) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
