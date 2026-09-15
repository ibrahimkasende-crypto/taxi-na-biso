/**
 * Aides d’affichage pour la démonstration Taxi Na Biso.
 * Cette variable ne change pas l’autorisation : Supabase vérifie toujours l’OTP.
 */
export const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

/**
 * Contrainte Supabase hébergé : l’OTP SMS fait 6 chiffres (pas 4).
 * Le code demandé (1234) n’est pas accepté par Auth cloud.
 */
export const DEMO_OTP = '123456';
export const DEMO_OTP_LENGTH = DEMO_OTP.length;

/** Numéros fictifs RDC — jamais un numéro personnel. */
export const DEMO_PHONES = [
  '+243810000001',
  '+243810000002',
  '+243810000003',
  '+243810000004',
  '+243810000005',
] as const;

export type DemoPhone = (typeof DEMO_PHONES)[number];

export function isDemoPhone(phone: string): boolean {
  return (DEMO_PHONES as readonly string[]).includes(phone);
}
