const CACHE_NAME = 'schemester-path-cache-v5';

const urlsToCache = [
  //routes
  '/', '/home', '/offline',
  //admin
  '/admin/auth/login',
  '/admin/session',
  //teacher
  '/teacher/auth/login',
  '/teacher/session',
  '/teacher/fragment',
  //student
  '/student/auth/login',
  '/student/session',
  '/student/fragment',
];

self.addEventListener('install', (event)=> {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache)=>{
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async _=> {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith((async _=> {
      try {
        const networkResponse = await fetch(event.request);
        if(networkResponse)
          return networkResponse
        const preloadResponse = await event.preloadResponse;
        return preloadResponse;
      } catch (error) {
        console.log('Fetch failed', error);
        const cache = await caches.open(CACHE_NAME);
        const resp =  await cache.match(event.request.url);
        return resp?resp:await cache.match('/offline');;
      }
    })());
  }
});