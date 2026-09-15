export function timeAgoFr(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'À l’instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.round(h / 24);
  return `Il y a ${d} j`;
}

export function moneyUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value)} $`;
}

const TRIP_SHORT: Record<string, string> = {
  "Aéroport International de N'djili": "Aéroport N'djili",
  'Université de Kinshasa': 'UNIKIN',
};

export function compactPlaceLabel(label: string): string {
  return TRIP_SHORT[label] ?? (label.length > 22 ? `${label.slice(0, 20)}…` : label);
}

export function compactTrip(pickup: string, dropoff: string): { short: string; full: string } {
  const full = `${pickup} → ${dropoff}`;
  const short = `${compactPlaceLabel(pickup)} → ${compactPlaceLabel(dropoff)}`;
  return { short, full };
}

export function compactReference(ref: string): { display: string; full: string } {
  if (ref.length <= 18) return { display: ref, full: ref };
  const parts = ref.split('-');
  if (parts.length >= 3) {
    return { display: `${parts[0]}-…-${parts[parts.length - 1]}`, full: ref };
  }
  return { display: ref, full: ref };
}

export function formatScheduleShort(iso: string): { line1: string; line2: string } {
  const d = new Date(iso);
  return {
    line1: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    line2: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}
