import { describe, expect, it } from 'vitest';

import { fleetCategories } from '@/config/fleet';
import { searchKinshasaPlaces } from '@/config/places';
import { officialWhatsAppUrl } from '@/lib/whatsapp';
import { buildWhatsAppMessage, isPlausiblePhone, normalizePhone, validateRideDraft } from '@/lib/ride-request';

describe('flotte officielle', () => {
  it('expose 6 catégories avec tarifs heure et journée', () => {
    expect(fleetCategories).toHaveLength(6);
    expect(fleetCategories.map((c) => c.id)).toEqual([
      'basic',
      'confort',
      'premium',
      'familiale',
      'familiale_premium',
      '4x4',
    ]);
    expect(fleetCategories.find((c) => c.id === 'confort')?.hourlyUsd).toBe(8);
    expect(fleetCategories.find((c) => c.id === '4x4')?.dailyUsd).toBe(160);
  });
});

describe('recherche Kinshasa', () => {
  it('trouve UNIKIN, aéroport et Victoire par préfixe', () => {
    expect(searchKinshasaPlaces('unik')[0]?.label).toMatch(/Université/i);
    expect(searchKinshasaPlaces('aero')[0]?.label).toMatch(/Aéroport/i);
    expect(searchKinshasaPlaces('vic')[0]?.label).toMatch(/Victoire/i);
    expect(searchKinshasaPlaces('gom')[0]?.label).toMatch(/Gombe/i);
    expect(searchKinshasaPlaces('lem')[0]?.label).toMatch(/Lemba/i);
  });
});

describe('WhatsApp et validation', () => {
  it('encode le message wa.me', () => {
    const url = officialWhatsAppUrl('Bonjour TAXI NA BISO 👋');
    expect(url.startsWith('https://wa.me/243974543860?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Bonjour TAXI NA BISO 👋'));
    expect(url).not.toContain(' ');
  });

  it('valide une demande complète', () => {
    expect(isPlausiblePhone('+243974543860')).toBe(true);
    expect(normalizePhone('0974543860')).toBe('+243974543860');
    const msg = buildWhatsAppMessage({
      reference: 'TNB-20260915-TEST',
      name: 'Client Test',
      phone: '+243900000000',
      pickup: { label: 'Université de Kinshasa', address: 'Lemba', lat: -4.42, lng: 15.31, place_id: 'unikin' },
      dropoff: { label: 'Gombe', address: 'Gombe', lat: -4.3, lng: 15.31, place_id: 'gombe' },
      date: '2026-09-16',
      timeLabel: '20:30',
      categoryId: 'confort',
    });
    expect(msg).toContain('Référence : TNB-20260915-TEST');
    expect(msg).toContain('Catégorie : Confort');
    expect(
      validateRideDraft({
        name: 'Client Test',
        phone: '+243900000000',
        pickup: { label: 'UNIKIN', address: 'Lemba', lat: -4.42, lng: 15.31, place_id: 'a' },
        dropoff: { label: 'Gombe', address: 'Gombe', lat: -4.3, lng: 15.31, place_id: 'b' },
        date: '2099-01-01',
        timeMode: 'scheduled',
        time: '10:00',
        categoryId: 'confort',
      }),
    ).toBeNull();
  });
});
