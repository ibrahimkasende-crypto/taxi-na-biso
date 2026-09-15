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
