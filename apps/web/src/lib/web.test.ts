import { describe, expect, it } from 'vitest';

import { brand, kinshasaCenter, vehicleCategories } from '@/config/brand';
import { previewRoute } from '@/lib/booking-preview';
import { shouldBypassServiceWorkerCache } from '@/lib/pwa-cache';

describe('vitrine et commande', () => {
  it('expose l’identité Taxi Na Biso', () => {
    expect(brand.appName).toBe('Taxi Na Biso');
    expect(brand.heroTitle).toBe('Votre trajet. Votre ville. Na Biso.');
    expect(brand.heroLead).toBe('Votre trajet commence ici.');
    expect(brand.currencyCode).toBe('CDF');
    expect(kinshasaCenter.lat).toBeCloseTo(-4.3276, 3);
  });

  it('propose trois catégories d’affichage', () => {
    expect(vehicleCategories.map((c) => c.id)).toEqual(['economy', 'comfort', 'moto']);
  });

  it('calcule une distance et une durée indicatives', () => {
    const preview = previewRoute({ lat: -4.305, lng: 15.303 }, { lat: -4.3856, lng: 15.4446 });
    expect(preview.distance_m).toBeGreaterThan(1000);
    expect(preview.duration_s).toBeGreaterThan(60);
  });
});

describe('PWA hors ligne', () => {
  it('ne met pas en cache auth, commande, client, chauffeur', () => {
    expect(shouldBypassServiceWorkerCache('/commander')).toBe(true);
    expect(shouldBypassServiceWorkerCache('/connexion')).toBe(true);
    expect(shouldBypassServiceWorkerCache('/client/courses')).toBe(true);
    expect(shouldBypassServiceWorkerCache('/')).toBe(false);
  });
});
