/* Service worker Taxi Na Biso — cache statique uniquement.
   Jamais : auth, GPS, paiements, confirmations de commande. */
const CACHE = 'tnb-static-v1';
const OFFLINE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE, '/manifest.json'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (
    url.pathname.startsWith('/client') ||
    url.pathname.startsWith('/chauffeur') ||
    url.pathname.startsWith('/commander') ||
    url.pathname.startsWith('/connexion') ||
    url.pathname.startsWith('/inscription')
  ) {
    return;
  }
  if (url.hostname.includes('supabase')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE).then((r) => r || Response.error())),
    );
    return;
  }

  if (url.origin === self.location.origin && (url.pathname.startsWith('/branding') || url.pathname === '/manifest.json')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        void caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })),
    );
  }
});
