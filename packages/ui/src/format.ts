/** Display helpers shared across apps. */

export function formatMoney(cents: number, currency = 'AUD', locale = 'en-AU'): string {
  if (currency === 'CDF') {
    return formatFareCdf(cents);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Affiche 15 000 FC à partir de centimes (1 500 000 → 15 000 FC). */
export function formatFareCdf(cents: number): string {
  const amount = Math.round(cents / 100);
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} FC`;
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(metres < 10_000 ? 1 : 0)} km`;
}

export function formatDurationS(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}
