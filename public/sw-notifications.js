// PWA Notification & Deep-Linking Worker Script
let activeAlarmTimer = null;

// Listen for install event to detect background updates over an existing active worker
self.addEventListener('install', (event) => {
  if (self.registration && self.registration.active) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      event.waitUntil(
        self.registration.showNotification('🚀 Testament Update Available', {
          body: 'A new version of Testament is ready! Tap to update and open.',
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-96.png',
          tag: 'testament-app-update',
          renotify: true,
          requireInteraction: true,
          vibrate: [150, 80, 150],
          data: {
            type: 'APP_UPDATE',
            url: '/'
          },
          actions: [
            { action: 'update', title: '🔄 Update & Open' },
            { action: 'dismiss', title: 'Later' }
          ]
        }).catch(() => {})
      );
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // 1. Handle App Update Notification Click
  if (event.notification.data?.type === 'APP_UPDATE' || event.action === 'update') {
    if (typeof self.skipWaiting === 'function') {
      self.skipWaiting();
    }

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'TESTAMENT_APPLY_UPDATE' });
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/?updated=true');
        }
      })
    );
    return;
  }

  if (event.action === 'dismiss') {
    return;
  }

  // 2. Handle Memory Verse recall click
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

function recordAlarmFiredInIDB(slot, todayKey, timestamp) {
  try {
    const request = indexedDB.open('testament-notifications-db', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      try {
        const tx = db.transaction('state', 'readwrite');
        const store = tx.objectStore('state');
        store.put({ id: 'lastFired', slot, todayKey, timestamp });
        tx.oncomplete = () => db.close();
      } catch {
        db.close();
      }
    };
  } catch {
    // Ignore IndexedDB failures in restricted environments
  }
}

// Service Worker Alarm scheduler for background timer execution & update messages
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    if (typeof self.skipWaiting === 'function') {
      self.skipWaiting();
    }
  } else if (event.data?.type === 'CHECK_FOR_UPDATE') {
    if (self.registration && typeof self.registration.update === 'function') {
      self.registration.update().catch(() => {});
    }
  } else if (event.data?.type === 'SCHEDULE_ALARM') {
    if (activeAlarmTimer) {
      clearTimeout(activeAlarmTimer);
      activeAlarmTimer = null;
    }
    const { delayMs, title, options, slot, todayKey } = event.data;
    if (typeof delayMs === 'number' && delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) {
      activeAlarmTimer = setTimeout(() => {
        self.registration.showNotification(title, options);
        if (slot) {
          recordAlarmFiredInIDB(slot, todayKey || '', Date.now());
        }
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: 'TESTAMENT_ALARM_FIRED', slot, todayKey });
          }
        });
        activeAlarmTimer = null;
      }, delayMs);
    }
  } else if (event.data?.type === 'CANCEL_ALARM') {
    if (activeAlarmTimer) {
      clearTimeout(activeAlarmTimer);
      activeAlarmTimer = null;
    }
  }
});

// Periodic background sync listener (supported in Android Chrome PWAs)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'testament-update-check') {
    if (self.registration && typeof self.registration.update === 'function') {
      event.waitUntil(self.registration.update().catch(() => {}));
    }
  } else if (event.tag === 'testament-memory-pulse') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'TESTAMENT_TRIGGER_CHECK' });
        }
      })
    );
  }
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

  // If push payload is an app update
  if (data.data?.type === 'APP_UPDATE') {
    const options = {
      body: data.body || 'A new version of Testament is ready! Tap to update and open.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: 'testament-app-update',
      renotify: true,
      requireInteraction: true,
      vibrate: [150, 80, 150],
      data: { type: 'APP_UPDATE', url: '/' },
      actions: [
        { action: 'update', title: '🔄 Update & Open' },
        { action: 'dismiss', title: 'Later' }
      ]
    };
    event.waitUntil(self.registration.showNotification(data.title || '🚀 Testament Update Available', options));
    return;
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
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
