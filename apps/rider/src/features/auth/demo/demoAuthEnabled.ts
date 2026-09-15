/**
 * TEMPORAIRE — contournement local uniquement en développement.
 * Production : __DEV__ false et extra.embeddedDebugDemo false → flux Supabase.
 *
 * L’APK debug embarque le JS (debuggableVariants = []), donc __DEV__ y est
 * souvent false. extra.embeddedDebugDemo couvre uniquement ce cas debug.
 */

type Extra = {
  embeddedDebugDemo?: boolean;
};

export function resolveDevAuthBypass(isDev: boolean, embeddedDebugDemo?: boolean): boolean {
  return isDev || embeddedDebugDemo === true;
}

function readEmbeddedDebugDemo(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default as { expoConfig?: { extra?: Extra } };
    return Constants.expoConfig?.extra?.embeddedDebugDemo === true;
  } catch {
    return false;
  }
}

export function isDevAuthBypass(): boolean {
  return resolveDevAuthBypass(typeof __DEV__ !== 'undefined' && Boolean(__DEV__), readEmbeddedDebugDemo());
}

/** Alias historique — même règle que isDevAuthBypass. */
export function getIsDemoAuthEnabled(): boolean {
  return isDevAuthBypass();
}
