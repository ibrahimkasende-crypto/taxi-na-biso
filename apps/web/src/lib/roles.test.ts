import { describe, expect, it } from 'vitest';

import { canAccessClient, canAccessDriver, canAccessStaff, homeForRole } from './roles';

describe('rôles', () => {
  it('autorise uniquement rider sur l’espace client', () => {
    expect(canAccessClient('rider')).toBe(true);
    expect(canAccessClient('driver')).toBe(false);
    expect(canAccessClient('admin')).toBe(false);
  });

  it('autorise uniquement driver sur l’espace chauffeur', () => {
    expect(canAccessDriver('driver')).toBe(true);
    expect(canAccessDriver('rider')).toBe(false);
  });

  it('réserve l’admin au personnel', () => {
    expect(canAccessStaff('admin')).toBe(true);
    expect(canAccessStaff('operator_owner')).toBe(true);
    expect(canAccessStaff('rider')).toBe(false);
    expect(canAccessStaff('driver')).toBe(false);
  });

  it('renvoie un accueil par rôle sans boucle', () => {
    expect(homeForRole('rider')).toBe('/client');
    expect(homeForRole('driver')).toBe('/chauffeur');
    expect(homeForRole('admin')).toBe('/admin');
    expect(homeForRole('rider')).not.toBe('/chauffeur');
  });
});
