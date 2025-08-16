const CACHE_NAME = 'portfolio-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/portfolio.html',
  '/assets/css/main.css',
  '/assets/css/portfolio.css',
  '/assets/css/portfolio-section.css',
  '/assets/js/main.js',
  '/assets/js/portfolio.js',
  '/assets/js/app.js',
  '/assets/js/utils/animations.js',
  '/assets/js/utils/api.js',
  '/assets/js/utils/cookies.js',
  '/assets/js/utils/events.js',
  '/assets/js/utils/feature-detection.js',
  '/assets/js/utils/forms.js',
  '/assets/js/utils/helpers.js',
  '/assets/js/utils/navigation.js',
  '/assets/js/utils/responsive.js',
  '/assets/js/utils/storage.js',
  '/assets/images/icon-192x192.png',
  '/favicon.ico',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://valid-links.digitname.com/valid-links.js'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Cache addAll error:', error);
      })
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
