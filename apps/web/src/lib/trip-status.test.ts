import { describe, expect, it } from 'vitest';

import { ACTIVE_DRIVER_STATUSES, ACTIVE_RIDER_STATUSES, tripStatusLabel } from './trip-status';

describe('statuts de course', () => {
  it('mappe les statuts OpenRide existants', () => {
    expect(tripStatusLabel('requested')).toContain('Recherche');
    expect(tripStatusLabel('assigned')).toContain('assigné');
    expect(tripStatusLabel('driver_en_route')).toContain('approche');
    expect(tripStatusLabel('arrived_at_pickup')).toContain('arrivé');
    expect(tripStatusLabel('in_progress')).toContain('cours');
    expect(tripStatusLabel('completed')).toBe('Terminée');
    expect(tripStatusLabel('cancelled')).toBe('Annulée');
  });

  it('inclut le cycle principal côté passager et chauffeur', () => {
    expect(ACTIVE_RIDER_STATUSES).toContain('requested');
    expect(ACTIVE_DRIVER_STATUSES).toContain('assigned');
    expect(ACTIVE_DRIVER_STATUSES).not.toContain('requested');
  });
});
