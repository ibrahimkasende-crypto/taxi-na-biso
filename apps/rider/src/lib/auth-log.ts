type AuthLikeError = {
  message?: string;
  code?: string;
  status?: number;
};

/** Logs de développement uniquement — jamais de clé, token ou OTP. */
export function logAuthDev(step: string, details: Record<string, unknown>): void {
  if (!__DEV__) return;
  console.warn('[Auth]', step, details);
}

export function logAuthError(step: string, phone: string, error: unknown): void {
  if (!__DEV__) return;
  const err = error as AuthLikeError;
  console.warn('[Auth]', step, {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    phone,
    message: err.message ?? String(error),
    code: err.code ?? null,
    status: err.status ?? null,
  });
}
