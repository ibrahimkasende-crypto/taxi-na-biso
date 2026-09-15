/** Bouton démo : développement local ou staging. Jamais en production publique. */

export const isDevDemo =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'staging';

export const demoAdmin = {
  email: 'admin@taxinabiso.com',
  password: '123456',
} as const;
