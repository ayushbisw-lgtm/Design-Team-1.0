const CACHE_NAME = 'design-team-v3';
const STATIC_ASSETS = [
  '/style.css',
  '/script.js',
  '/member-script.js',
  '/BLACK LOGO.png',
  '/manifest.json'
];

const HTML_ASSETS = [
  '/',
  '/index.html',
  '/member.html'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use a more lenient approach for initial caching
      return Promise.allSettled(
        [...STATIC_ASSETS, ...HTML_ASSETS].map(url => 
          fetch(url).then(response => {
            if (response.ok) return cache.put(url, response);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests or non-GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Strategy for Navigation (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If it's a redirect, we return it directly and let the browser handle it.
          // We don't cache redirected responses for navigation to avoid the "redirect mode" error.
          if (response.redirected) {
            return response;
          }
          
          // Cache a clean copy of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // Strategy for Static Assets: Cache First, Fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});
