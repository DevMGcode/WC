// Subir la versión en cada deploy importante: obliga a los clientes con la PWA
// instalada a detectar el SW nuevo → controllerchange → recarga automática.
const CACHE_VERSION = 'orionix-v6';

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

// ── Web Push: muestra la notificación que envía el backend ──
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: 'Orionix Gol', body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'Orionix Gol';
  const options = {
    body: data.body || '',
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/manifest-icon-192.maskable.png',
    data: { url: data.url || '/' },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Al tocar la notificación: enfoca la pestaña abierta o abre la URL ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(target); return client.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
