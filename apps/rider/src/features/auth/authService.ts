/**
 * Dev : profil local immédiat. Production : signInWithOtp / verifyOtp inchangés.
 */

import { sendOtp, signOut as signOutSupabase, verifyOtp } from '../../lib/auth';
import { saveDemoUser, signOutDemo } from './demo/demoAuthAdapter';
import { isDevAuthBypass } from './demo/demoAuthEnabled';

export async function continueWithPhone(phone: string): Promise<'demo-home' | 'otp'> {
  if (isDevAuthBypass()) {
    await saveDemoUser(phone);
    return 'demo-home';
  }
  await sendOtp(phone);
  return 'otp';
}

export async function confirmPhoneCode(phone: string, token: string): Promise<void> {
  await verifyOtp(phone, token);
}

export async function signOutApp(source: 'supabase' | 'demo-local' | null): Promise<void> {
  if (source === 'demo-local') {
    await signOutDemo();
    return;
  }
  await signOutSupabase();
}
