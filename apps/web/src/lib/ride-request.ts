import { fleetCategoryById, type FleetCategoryId } from '@/config/fleet';
import type { KinshasaPlace } from '@/config/places';

export const BOOKING_DRAFT_KEY = 'tnb_booking_draft';

export interface RidePlace {
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

export interface RideDraft {
  name: string;
  phone: string;
  pickup: RidePlace | null;
  dropoff: RidePlace | null;
  date: string;
  timeMode: 'now' | 'scheduled';
  time: string;
  categoryId: FleetCategoryId;
}

export function placeFromKinshasa(p: KinshasaPlace): RidePlace {
  return {
    label: p.label,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    place_id: p.place_id,
  };
}

export function isPlausiblePhone(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function todayISODate(timeZone = 'Africa/Kinshasa'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function nowHHMM(timeZone = 'Africa/Kinshasa'): string {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const h = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export function combineKinshasaDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+01:00`);
}

export function formatLongDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function isImmediate(draft: Pick<RideDraft, 'date' | 'timeMode'>): boolean {
  return draft.date === todayISODate() && draft.timeMode === 'now';
}

export function validateRideDraft(draft: RideDraft): string | null {
  if (!draft.name.trim()) return 'Indiquez votre nom.';
  if (!isPlausiblePhone(draft.phone)) return 'Indiquez un numéro de téléphone joignable.';
  if (!draft.pickup) return 'Choisissez un point de départ.';
  if (!draft.dropoff) return 'Choisissez une destination.';
  if (draft.pickup.place_id && draft.dropoff.place_id && draft.pickup.place_id === draft.dropoff.place_id) {
    return 'Le départ et la destination doivent être différents.';
  }
  if (!draft.date) return 'Choisissez une date.';
  if (draft.date < todayISODate()) return 'La date ne peut pas être dans le passé.';
  if (draft.timeMode === 'scheduled') {
    if (!draft.time) return 'Choisissez une heure.';
    const when = combineKinshasaDateTime(draft.date, draft.time);
    if (Number.isNaN(when.getTime())) return 'L’heure n’est pas valide.';
    if (when.getTime() < Date.now() - 60_000) {
      return 'Pour aujourd’hui, choisissez une heure encore à venir, ou « Maintenant ».';
    }
  }
  if (!draft.categoryId) return 'Choisissez une catégorie de véhicule.';
  return null;
}

export function buildWhatsAppMessage(input: {
  reference: string;
  name: string;
  phone: string;
  pickup: RidePlace;
  dropoff: RidePlace;
  date: string;
  timeLabel: string;
  categoryId: FleetCategoryId;
}): string {
  const cat = fleetCategoryById(input.categoryId);
  return [
    'Bonjour TAXI NA BISO 👋',
    '',
    'Je souhaite commander une course.',
    '',
    `Référence : ${input.reference}`,
    `Nom : ${input.name}`,
    `Téléphone : ${input.phone}`,
    `Départ : ${input.pickup.label}${input.pickup.address ? `, ${input.pickup.address}` : ''}`,
    `Destination : ${input.dropoff.label}${input.dropoff.address ? `, ${input.dropoff.address}` : ''}`,
    `Date : ${formatShortDate(input.date)}`,
    `Heure : ${input.timeLabel}`,
    `Catégorie : ${cat.label}`,
    `Tarif de référence : ${cat.hourlyUsd} $/heure — ${cat.dailyUsd} $/journée`,
    '',
    'Merci de confirmer ma réservation.',
  ].join('\n');
}

export function readDraft(): Partial<RideDraft> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(BOOKING_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<RideDraft>) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: RideDraft): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}
