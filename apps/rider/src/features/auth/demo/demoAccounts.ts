/**
 * TEMPORAIRE — comptes Rider de démonstration locale.
 * À supprimer avant production. Voir docs/REMOVE_HARDCODED_DEMO_AUTH.md.
 * N’est jamais une source de vérité Auth Supabase.
 */

export const DEMO_OTP = '123456';

export const DEMO_RIDER_ACCOUNTS = [
  {
    id: 'demo-rider-001',
    phone: '+243810000001',
    role: 'rider',
    displayName: 'Client Démo 1',
  },
  {
    id: 'demo-rider-002',
    phone: '+243810000002',
    role: 'rider',
    displayName: 'Client Démo 2',
  },
  {
    id: 'demo-rider-003',
    phone: '+243810000003',
    role: 'rider',
    displayName: 'Client Démo 3',
  },
  {
    id: 'demo-rider-004',
    phone: '+243810000004',
    role: 'rider',
    displayName: 'Client Démo 4',
  },
  {
    id: 'demo-rider-005',
    phone: '+243810000005',
    role: 'rider',
    displayName: 'Client Démo 5',
  },
] as const;

export type DemoRiderAccount = (typeof DEMO_RIDER_ACCOUNTS)[number];

export function findDemoRiderAccount(phone: string): DemoRiderAccount | undefined {
  return DEMO_RIDER_ACCOUNTS.find((account) => account.phone === phone);
}
