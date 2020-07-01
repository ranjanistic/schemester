var CACHE_NAME = 'schemester-cache-v3';
var urlsToCache = [
  '/loader.hbs',
  '/home.hbs',
  '/offline.html',
  '/admin/admin_login.hbs',
  '/admin/admin_dash.hbs',
  '/static/script/main.js',
  '/static/css/fmt.css',
  '/static/css/main.css',
  ''
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});



self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
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
        const cachedResponse = await cache.match('/offline.html');
        return cachedResponse;
      }
    })());
  }

});