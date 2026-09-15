/** Règles du service worker : ne jamais mettre en cache auth, GPS, paiement, commande. */
export function shouldBypassServiceWorkerCache(pathname: string): boolean {
  return (
    pathname.startsWith('/client') ||
    pathname.startsWith('/chauffeur') ||
    pathname.startsWith('/commander') ||
    pathname.startsWith('/connexion') ||
    pathname.startsWith('/inscription')
  );
}
