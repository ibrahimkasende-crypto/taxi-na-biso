/**
 * TEMPORAIRE — chauffeur fictif pour le parcours de démonstration Rider.
 * Isolé de la production. Aucun numéro personnel.
 */

export const DEMO_ASSIGNED_DRIVER = {
  id: 'demo-driver-patrick',
  displayName: 'Patrick Nzambe',
  rating: 4.8,
  vehicle: 'Toyota Corolla',
  color: 'Noir',
  plate: 'TNB 001',
  etaMinutes: 4,
  phone: '+243810000099',
} as const;

export type DemoAssignedDriver = typeof DEMO_ASSIGNED_DRIVER;
