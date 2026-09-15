/**
 * TEMPORAIRE — persist une DemoSession locale. Jamais une Session Supabase.
 */

import { isDevAuthBypass } from './demoAuthEnabled';
import { buildDirectDemoUser } from './demoAuthLogic';
import { clearDemoSession, writeDemoSession, type DemoSession } from './demoSession';

export async function saveDemoUser(phone: string): Promise<DemoSession> {
  if (!isDevAuthBypass()) {
    throw new Error('Le profil local n’est disponible qu’en développement.');
  }
  const session = buildDirectDemoUser(phone);
  await writeDemoSession(session);
  return session;
}

export async function signOutDemo(): Promise<void> {
  await clearDemoSession();
}
