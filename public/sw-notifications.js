// PWA Notification & Deep-Linking Worker Script
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
