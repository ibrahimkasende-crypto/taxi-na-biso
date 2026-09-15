/** Empêche les redirections ouvertes (//evil, https://…, chemins relatifs hors site). */
export function safeInternalPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//')) return fallback;
  if (raw.includes('\\')) return fallback;
  if (raw.includes('://')) return fallback;
  return raw;
}

export function destinationForRole(
  role: string | null | undefined,
  next: string | null | undefined,
  home: string,
): string {
  const dest = safeInternalPath(next, home);
  if (dest.startsWith('/chauffeur') && role !== 'driver') return home;
  if (dest.startsWith('/client') && role !== 'rider') return home;
  return dest;
}
