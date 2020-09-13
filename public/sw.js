var CACHE_NAME = 'schemester-cache-v1';
var urlsToCache = [
  '/',
  // '/home',
  // '/offline.html',
  // '/views/admin/admin_login.ejs',
  // '/views/admin/admin_dash.ejs',
  // '/script/main.js',
  // '/css/fmt.css',
  // '/css/main.css',
  // ''
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
  if (event.request.mode === 'navigate') {
    event.respondWith((async _=> {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log('Fetch failed; returning offline page instead.', error);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/offline.ejs');
        return cachedResponse;
      }
    })());
  }

});