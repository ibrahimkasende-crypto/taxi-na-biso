/**
 * TEMPORAIRE — notifications de développement uniquement.
 * Jamais affichées si des notifications réelles existent.
 */

import type { RiderNotification } from './types';

export const DEMO_NOTIFICATIONS: RiderNotification[] = [
  {
    id: 'demo-n-welcome',
    title: 'Bienvenue sur Taxi Na Biso',
    body: 'Votre compte est prêt. Commandez votre prochaine course à Kinshasa.',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'demo-n-gombe',
    title: 'Votre course vers Gombe a été confirmée',
    body: 'Patrick Nzambe arrive. Préparez-vous près de l’entrée.',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'demo-n-eta',
    title: 'Patrick arrive dans 4 minutes',
    body: 'Toyota Corolla noire · TNB 001',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'demo-n-thanks',
    title: 'Merci d’avoir voyagé avec Taxi Na Biso',
    body: 'Nous espérons vous revoir bientôt.',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];
