// Subir la versión en cada deploy importante: obliga a los clientes con la PWA
// instalada a detectar el SW nuevo → controllerchange → recarga automática.
const CACHE_VERSION = 'orionix-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpiar todos los cachés anteriores
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
