/** Messages utilisateur. Les détails techniques restent dans la console en développement. */

export function authErrorMessage(err: unknown): string {
  const raw =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: string }).message ?? '')
      : String(err ?? '');
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined;
  const lower = raw.toLowerCase();

  if (process.env.NODE_ENV === 'development') {
    console.error('[auth]', raw, err);
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('fetch failed') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  ) {
    return 'Impossible de joindre le service. Vérifiez votre connexion et réessayez.';
  }

  if (
    lower.includes('invalid login') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('email not confirmed')
  ) {
    return 'Email ou mot de passe incorrect.';
  }

  if (status === 429 || lower.includes('rate limit')) {
    return 'Le service est temporairement indisponible.';
  }

  if (status && status >= 500) {
    return 'Le service est temporairement indisponible.';
  }

  if (raw.trim()) return raw;
  return 'Connexion impossible. Réessayez.';
}
