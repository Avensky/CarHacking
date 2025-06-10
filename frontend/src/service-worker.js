const CACHE_NAME = 'v1';
const resourcesToCache = [
  '/',
  '/index.html',
  '/styles.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        resourcesToCache.map((resource) =>
          fetch(resource)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${resource}: ${response.statusText}`);
              }
              return cache.put(resource, response);
            })
            .catch((error) => {
              console.warn(`Skipping resource: ${resource}`, error);
            })
        )
      );
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