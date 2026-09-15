import { describe, expect, it } from 'vitest';

import { destinationForRole, safeInternalPath } from './redirect';

describe('redirections', () => {
  it('rejette les URLs ouvertes', () => {
    expect(safeInternalPath('https://evil.test', '/client')).toBe('/client');
    expect(safeInternalPath('//evil.test', '/client')).toBe('/client');
    expect(safeInternalPath('\\evil', '/client')).toBe('/client');
    expect(safeInternalPath('/client/courses', '/client')).toBe('/client/courses');
  });

  it('empêche un client d’atterrir sur l’espace chauffeur', () => {
    expect(destinationForRole('rider', '/chauffeur', '/client')).toBe('/client');
    expect(destinationForRole('driver', '/client', '/chauffeur')).toBe('/chauffeur');
    expect(destinationForRole('driver', '/chauffeur/offres', '/chauffeur')).toBe('/chauffeur/offres');
  });
});
