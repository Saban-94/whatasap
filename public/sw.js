const CACHE_NAME = 'saban-pwa-v1';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: pre-cache critical assets (manifest, icons, core JSON)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS.filter(Boolean)))
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Simple fetch handler:
// - For saban_master_brain.json (or any path that matches), use cache-first with network fallback and update cache
// - For navigation requests, try network-first (so user gets latest pages) with fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Cache-first for engineering brain JSON files (fast offline)
  if (pathname.endsWith('saban_master_brain.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((networkResp) => {
              // put a clone in cache
              cache.put(event.request, networkResp.clone());
              return networkResp;
            })
            .catch(() => cached || Response.error());
        })
      )
    );
    return;
  }

  // Navigation requests: network-first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // optionally store navigation pages
          return res;
        })
        .catch(() =>
          caches.match('/').then((resp) => resp || Response.error())
        )
    );
    return;
  }

  // Default: try cache, otherwise network
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
