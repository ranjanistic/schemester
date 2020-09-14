const CACHE_NAME = 'schemester-cache-v1';
const urlsToCache = [
  //routes
  '/', '', '/home', '/offline',
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

  //graphics
  '/graphic/schemester512.svg',

  //stylesheets
  '/css/main.css',
  '/css/fmt.css',

  //fonts
  '/font/Jost.css',
  '/font/Questrial.css',

  //scripts
  //common
  '/script/codes.js',
  '/script/main.js',
  '/script/homepage.js',
  //admin
  '/script/admin/admin.js',
  '/script/admin/adminDash.js',
  '/script/admin/adminlogin.js',
  '/script/admin/management.js',
  '/script/admin/users.js',
  '/script/admin/schedule.js',
  //teacher
  '/script/teacher/teacher.js',
  '/script/teacher/teacherdash.js',
  '/script/teacher/teacherlogin.js',
  '/script/teacher/fragment/about.js',
  '/script/teacher/fragment/classroom.js',
  '/script/teacher/fragment/fullweek.js',
  '/script/teacher/fragment/today.js',
  //student
  '/script/student/student.js',
  '/script/student/studentdash.js',
  '/script/student/studentlogin.js',
  '/script/student/fragment/about.js',
  '/script/student/fragment/classroom.js',
  '/script/student/fragment/fullweek.js',
  '/script/student/fragment/today.js',
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
        console.log('Fetch failed, returning offline page instead.', error);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/offline');
        return cachedResponse;
      }
    })());
  }

});