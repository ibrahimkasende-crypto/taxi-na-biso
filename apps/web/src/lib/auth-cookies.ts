/** Cookies de session : Secure en HTTPS production, Lax, jamais de domaine partagé. */

export function withAuthCookieOptions<T extends Record<string, unknown>>(options: T) {
  return {
    ...options,
    path: typeof options.path === 'string' ? options.path : '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}
