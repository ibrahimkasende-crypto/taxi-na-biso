import { describe, expect, it } from 'vitest';

describe('disponibilité chauffeur', () => {
  function canGoOnline(approved: boolean, vehicleId: string | null): boolean {
    return approved && Boolean(vehicleId);
  }

  it('refuse un chauffeur non validé', () => {
    expect(canGoOnline(false, 'veh-1')).toBe(false);
  });

  it('refuse sans véhicule', () => {
    expect(canGoOnline(true, null)).toBe(false);
  });

  it('autorise un chauffeur validé avec véhicule', () => {
    expect(canGoOnline(true, 'veh-1')).toBe(true);
  });
});
