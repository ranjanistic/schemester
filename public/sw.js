self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('static-pages').then(function(cache) {
      return cache.addAll(
        [
          'https://fonts.googleapis.com/css2?family=Jost&display=swap',
          'https://fonts.googleapis.com/css2?family=Questrial&display=swap',
          '/static/css/fmt.css',
          '/static/css/main.css',
          '/index.html',
          '/404.html',
          '/offline.html',
          '/admin/admin_dash.html',
          '/admin/current_schedule.html',
          '/admin/week_schedule.html'
        ]
      );
    }).catch(function(){
      console.log("uncached");
    })
  );
});
  self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
  });