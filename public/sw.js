// Service Worker for PWA functionality
const CACHE_NAME = 'gamified-todo-v1';
const STATIC_CACHE = 'gamified-todo-static-v1';
const DYNAMIC_CACHE = 'gamified-todo-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/login',
  '/signup',
  // Don't cache favicon.ico to avoid errors
  // '/icon-192x192.png',
  // '/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        // Add each asset individually to avoid failing the entire cache operation
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(error => {
              console.warn(`Failed to cache ${asset}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests and chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip requests for extensions, devtools, etc.
  if (event.request.url.includes('chrome-extension') || 
      event.request.url.includes('moz-extension') || 
      event.request.url.includes('safari-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching (only for same-origin requests)
            const responseToCache = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                // Only cache certain file types
                const url = new URL(event.request.url);
                if (url.pathname.match(/\.(js|css|html|png|jpg|jpeg|svg|ico|woff|woff2)$/)) {
                  cache.put(event.request, responseToCache);
                }
              })
              .catch((error) => {
                console.log('Cache put error:', error);
              });

            return response;
          })
          .catch((error) => {
            console.log('Fetch failed:', error);
            
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline').then((offlineResponse) => {
                if (offlineResponse) {
                  return offlineResponse;
                }
                // Fallback response if offline page is not cached
                return new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                  {
                    headers: { 'Content-Type': 'text/html' },
                    status: 200,
                    statusText: 'OK'
                  }
                );
              });
            }

            // For other requests, return a generic offline response
            if (event.request.destination === 'image') {
              // Return a placeholder for images
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }

            // For API requests, return empty response
            if (event.request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503,
                  statusText: 'Service Unavailable'
                }
              );
            }

            // Default fallback
            return new Response('Offline', { 
              status: 503, 
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
      .catch((error) => {
        console.log('Cache match error:', error);
        
        // Fallback for cache errors
        return new Response('Cache Error', { 
          status: 500, 
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Handle background sync for when user comes back online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any pending operations
      handleBackgroundSync()
    );
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

async function handleBackgroundSync() {
  // This could be used to sync pending todos or other data
  console.log('Service Worker: Handling background sync');
  // Implementation would depend on your specific needs
}
