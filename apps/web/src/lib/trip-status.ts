/** Statuts Postgres `trip_status` → libellés français. */

export const TRIP_STATUS_LABEL: Record<string, string> = {
  scheduled: 'Programmée',
  requested: 'Recherche d’un chauffeur',
  requires_manual_dispatch: 'Recherche d’un chauffeur',
  assigned: 'Chauffeur assigné',
  driver_en_route: 'Chauffeur en approche',
  arrived_at_pickup: 'Chauffeur arrivé',
  in_progress: 'Course en cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'Absence au départ',
};

export const ACTIVE_RIDER_STATUSES = [
  'scheduled',
  'requested',
  'requires_manual_dispatch',
  'assigned',
  'driver_en_route',
  'arrived_at_pickup',
  'in_progress',
] as const;

export const ACTIVE_DRIVER_STATUSES = [
  'assigned',
  'driver_en_route',
  'arrived_at_pickup',
  'in_progress',
] as const;

export function tripStatusLabel(status: string): string {
  return TRIP_STATUS_LABEL[status] ?? status;
}

export function isActiveRiderTrip(status: string): boolean {
  return (ACTIVE_RIDER_STATUSES as readonly string[]).includes(status);
}
