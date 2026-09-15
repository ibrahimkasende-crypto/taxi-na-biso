/** Bouton démo : développement local ou staging. Jamais en production publique. */

export const isDevDemo =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'staging';

export const demoClient = {
  email: 'taxinabiso@client.com',
  password: '123456',
} as const;

export const demoDriver = {
  email: 'taxinabiso@chauffeur.com',
  password: '123456',
} as const;
