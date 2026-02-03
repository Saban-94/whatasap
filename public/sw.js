const CACHE = 'saban-v4'; // שדרוג גרסה לניקוי קאש ישן
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // טעינת קבצים אחד-אחד כדי ששגיאה באחד לא תפיל את הכל
    await Promise.allSettled(
      PRECACHE_URLS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.ok) await cache.put(url, res);
        } catch (err) {
          console.warn('[SW] Skip precache:', url);
        }
      })
    );
    self.skipWaiting();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // התעלמות מוחלטת מ-Firestore ומ-API של הצאט
  if (
    url.origin !== self.location.origin ||
    url.href.includes('googleapis.com') ||
    url.pathname.startsWith('/api/chat')
  ) {
    return;
  }

  if (event.request.method === 'GET') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(event.request);
      return cached || fetch(event.request).then(res => {
        if (res && res.ok) cache.put(event.request, res.clone());
        return res;
      });
    })());
  }
});
