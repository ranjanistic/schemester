const CACHE_NAME = 'schemester-cache-v1';

const urlsToCache = [
  //routes
  '/', '/home', '/offline','/manifest.json',
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
  '/graphic/onethreeload.svg',
  '/graphic/blueLoader.svg',
  '/graphic/leftArrow.svg',
  '/graphic/menudotsvertical.svg',
  '/graphic/searchicon.svg',
  '/graphic/elements/bellicon.svg',
  '/graphic/elements/classicon.svg',
  '/graphic/elements/editicon.svg',
  '/graphic/elements/okicon.svg',
  '/graphic/elements/reloadicon.svg',
  '/graphic/elements/settingicon.svg',
  '/graphic/elements/settings.svg',
  '/graphic/elements/todayicon.svg',
  '/graphic/elements/warnicon.svg',
  '/graphic/elements/weekicon.svg',
  '/graphic/icons/schemester128.png',
  '/graphic/icons/schemester192.png',
  '/graphic/icons/schemester256.png',
  '/graphic/icons/schemester512.png',
  '/graphic/icons/schemester512.svg',
  '/graphic/illustrations/adminloginview.svg',
  '/graphic/illustrations/teacherloginview.svg',
  '/graphic/illustrations/studentloginview.svg',
  '/graphic/illustrations/adminview.svg',
  '/graphic/illustrations/teacherview.svg',
  '/graphic/illustrations/studentview.svg',
  '/graphic/illustrations/homebg.svg',
  
  //stylesheets
  '/css/main.css',
  '/css/fmt.css',
  '/css/switch.css',

  //fonts
  '/font/Jost.css',
  '/font/Questrial.css',

  //scripts
  //common
  '/script/codes.js',
  '/script/main.js',
  '/script/homepage.js',
  '/script/pwacompat.js',

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

self.addEventListener('message', (message) => {
  if (message.data === 'skipWaiting') {
    caches.keys().then((cacheNames)=> {
      Promise.all(
        cacheNames.filter((cacheName)=>{}).map((cacheName)=> {
          caches.delete(cacheName);
        })
      );
    }).finally(()=>{
      self.skipWaiting();
    })
  }
});

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
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log('Fetch failed', error);
        const cache = await caches.open(CACHE_NAME);
        const resp =  await cache.match(event.request.url);
        return resp?resp:await cache.match('/offline');;
      }
    })());
  }
});