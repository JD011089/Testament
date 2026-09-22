const CACHE_NAME = 'testament-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic API and TTS streams
  if (event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => cachedResponse);
    })
  );
});

// PWA Push Notification Clicks: Focus app or open Word Forge for active recall
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const verseId = event.notification.data?.verseId;
  const targetUrl = verseId ? `/?action=wordforge&verseId=${encodeURIComponent(verseId)}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (verseId) {
            client.postMessage({ type: 'TESTAMENT_NAVIGATE_VERSE', verseId });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', () => {
  // Notification dismissed by user
});

// Web Push payload handler (for server push compatibility)
self.addEventListener('push', (event) => {
  let data = {
    title: '⚔️ Testament Memory Pulse',
    body: 'Time for your memory verse practice! Can you recite it?',
    data: {}
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/favicon.png',
    tag: data.data?.verseId ? `testament-verse-${data.data.verseId}` : 'testament-pulse',
    renotify: true,
    vibrate: [120, 60, 120],
    data: data.data || {},
    actions: [
      { action: 'recite', title: '⚔️ Recite Now' },
      { action: 'dismiss', title: '✓ Got It' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
