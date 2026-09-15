/**
 * TEMPORAIRE — création directe d’un profil local (pas de Session Supabase).
 */

import { parseCdPhone } from '../../../lib/phone';
import type { DemoSession } from './demoTypes';

export function buildDirectDemoUser(phone: string, createdAt = new Date().toISOString()): DemoSession {
  const parsed = parseCdPhone(phone);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  return {
    mode: 'demo-local',
    user: {
      id: 'demo-rider-local',
      phone: parsed.phone,
      role: 'rider',
      displayName: 'Client Taxi Na Biso',
    },
    createdAt,
  };
}
