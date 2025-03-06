
// Service Worker for Smart Caching

const CACHE_NAME = 'smart-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http')) {
    return;
  }
  
  // API requests - use network-first strategy
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a clone of the response if it's valid
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Don't cache responses with auth headers
              if (!event.request.headers.has('Authorization')) {
                cache.put(event.request, responseClone);
              }
            });
          }
          return response;
        })
        .catch(() => {
          console.log('Service Worker: Falling back to cache for', event.request.url);
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For static assets, check cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('Service Worker: Serving from cache', event.request.url);
        return response;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache if not successful
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Cache the response for future
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ result: 'Cache cleared successfully' });
    });
  }
});
