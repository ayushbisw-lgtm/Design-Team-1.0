const CACHE_NAME = 'design-team-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/member.html',
  '/style.css',
  '/script.js',
  '/member-script.js',
  '/BLACK LOGO.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
