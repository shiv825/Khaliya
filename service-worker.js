const CACHE_NAME = 'khaliya-restaurant-v16';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-icon-192.png',
    '/pwa-icon-512.png'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching static assets');
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

// Fetch Event
self.addEventListener('fetch', event => {
    // Only handle GET requests and skip API calls entirely
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;
    // Skip Vite dev server internals to prevent HMR issues on localhost
    if (event.request.url.includes('/@vite') || 
        event.request.url.includes('/@fs') || 
        event.request.url.includes('hot-update') || 
        event.request.url.includes('node_modules')) return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const resClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then(response => {
                        return response || caches.match('/index.html');
                    });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const resClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                }
                return networkResponse;
            }).catch(() => {
                // Offline handling
            });
            return cachedResponse || fetchPromise;
        })
    );
});
