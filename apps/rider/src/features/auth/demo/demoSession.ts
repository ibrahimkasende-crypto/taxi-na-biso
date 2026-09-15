/**
 * TEMPORAIRE — session locale distincte de Supabase Session.
 * Aucun access_token / refresh_token. Voir docs/REMOVE_HARDCODED_DEMO_AUTH.md.
 */

import { secureStorage } from '../../../lib/secure-storage';
import { getIsDemoAuthEnabled } from './demoAuthEnabled';
import type { DemoSession } from './demoTypes';

export type { DemoSession };

export const DEMO_SESSION_STORAGE_KEY = 'taxi_na_biso_demo_rider_session';

type DemoSessionListener = () => void;

const listeners = new Set<DemoSessionListener>();

export function subscribeDemoSession(listener: DemoSessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitDemoSessionChange(): void {
  listeners.forEach((listener) => listener());
}

function isDemoSession(value: unknown): value is DemoSession {
  if (!value || typeof value !== 'object') return false;
  const row = value as DemoSession;
  return (
    row.mode === 'demo-local' &&
    typeof row.createdAt === 'string' &&
    typeof row.user?.id === 'string' &&
    typeof row.user?.phone === 'string' &&
    row.user.role === 'rider' &&
    typeof row.user.displayName === 'string'
  );
}

export async function readDemoSession(): Promise<DemoSession | null> {
  if (!getIsDemoAuthEnabled()) {
    await clearDemoSession();
    return null;
  }
  const raw = await secureStorage.getItem(DEMO_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isDemoSession(parsed)) {
      await clearDemoSession();
      return null;
    }
    return parsed;
  } catch {
    await clearDemoSession();
    return null;
  }
}

export async function writeDemoSession(session: DemoSession): Promise<void> {
  if (!getIsDemoAuthEnabled()) {
    throw new Error('La session locale de démonstration est désactivée.');
  }
  await secureStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
  emitDemoSessionChange();
}

export async function clearDemoSession(): Promise<void> {
  await secureStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  emitDemoSessionChange();
}
