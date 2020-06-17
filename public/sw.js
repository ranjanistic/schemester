var CACHE_NAME = 'schemester-cache-v2';
var urlsToCache = [
  '/index.html',
  '/home.html',
  '/offline.html',
  '/admin/admin_login.html',
  '/admin/admin_dash.html',
  '/static/script/main.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return fetch(event.request)||response;
    }).catch(function() {
      return caches.match('/offline.html');
    })
  );
});