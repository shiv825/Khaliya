const CACHE_NAME = 'khaliya-restaurant-v19';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './pwa-icon-192.png',
    './pwa-icon-512.png'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching static assets');
            // Use Promise.all with catch to ignore missing files
            return Promise.all(
                STATIC_ASSETS.map(url => {
                    return cache.add(url).catch(err => console.log('[SW] Cache add failed for', url, err));
                })
            );
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event (Network first, fallback to cache for HTML. Cache first for assets)
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Network-First strategy for API requests to always get the latest data (e.g. menu photos)
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    return caches.match(event.request).then(response => {
                        return response || caches.match('./index.html');
                    });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                return networkResponse;
            }).catch(() => {
                // Offline handling
            });
            return cachedResponse || fetchPromise;
        })
    );
});
