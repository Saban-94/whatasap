// public/sw.js
const CACHE = 'saban-v5'; // שדרוג גרסה לניקוי קאש ועדכון הגדרות

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.jpg',
  '/favicon.ico', // וודא שקיים ב-public או החלף בנתיב הנכון
  '/whatsapp.mp3'
];

// התקנה ושמירת קבצים בסיסיים
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // טעינת קבצים אחד-אחד כדי ששגיאה באחד (כמו 404) לא תפיל את כל הרישום
    await Promise.allSettled(
      PRECACHE_URLS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.status === 200) await cache.put(url, res);
        } catch (err) {
          console.warn('[SW] Skip precache:', url);
        }
      })
    );
    self.skipWaiting();
  })());
});

// ניקוי קאש ישן
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // חוקי החרגה - אל תעבור דרך ה-SW עבור שירותים חיים
  if (
    url.origin !== self.location.origin || // אתרים חיצוניים
    url.href.includes('googleapis.com') || // Gemini API
    url.href.includes('supabase.co') ||     // Supabase DB & Realtime
    url.pathname.startsWith('/api/')        // כל ה-Routes של השרת
  ) {
    return;
  }

  if (event.request.method === 'GET') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(event.request);
      
      if (cached) return cached;

      try {
        const response = await fetch(event.request);

        // תיקון קריטי: אל תבצע cache.put אם הסטטוס הוא 206 (Partial Content)
        // שגיאה זו קורית לרוב בקבצי אודיו (MP3) וגורמת לקריסה שראית
        if (response && response.status === 200) {
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        // במקרה של ניתוק אינטרנט, ננסה להחזיר דף אופליין אם קיים
        return cached;
      }
    })());
  }
});
