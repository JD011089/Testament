// PWA Notification & Deep-Linking Worker Script
// Alarm scheduling uses IndexedDB-persisted timestamps so alarms survive SW restarts.

const DB_NAME = 'testament-notifications-db';
const DB_VERSION = 1;
const STORE_NAME = 'state';

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function idbDelete(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Core: check IDB for a pending alarm and fire if its time has come ────────

async function checkAndFirePendingAlarm() {
  let db;
  try {
    db = await openDB();
    const alarm = await idbGet(db, 'pendingAlarm');
    if (!alarm) return;

    const now = Date.now();
    if (now < alarm.targetTimestamp) return; // Not time yet

    // Time has passed — show the notification
    await self.registration.showNotification(alarm.title, alarm.options).catch(() => {});

    // Record that this slot fired
    await idbPut(db, {
      id: 'lastFired',
      slot: alarm.slot,
      todayKey: alarm.todayKey,
      timestamp: now
    });

    // Clear the pending alarm so it doesn't double-fire
    await idbDelete(db, 'pendingAlarm');

    // Notify any open app windows that the alarm fired
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'TESTAMENT_ALARM_FIRED', slot: alarm.slot, todayKey: alarm.todayKey });
      }
    });
  } catch {
    // Silently ignore — we'll try again on next wakeup
  } finally {
    if (db) db.close();
  }
}

// ─── Lifecycle: install ───────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  // Notify users of an available update
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
          data: { type: 'APP_UPDATE', url: '/' },
          actions: [
            { action: 'update', title: '🔄 Update & Open' },
            { action: 'dismiss', title: 'Later' }
          ]
        }).catch(() => {})
      );
    }
  }
});

// ─── Lifecycle: activate — check alarm on every SW activation ────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(checkAndFirePendingAlarm());
});

// ─── Lifecycle: fetch — check alarm on every intercepted network request ──────
// This provides a low-overhead wakeup hook. We don't intercept caching here —
// the main sw.js handles that. We just piggyback the alarm check.

self.addEventListener('fetch', (event) => {
  event.waitUntil(checkAndFirePendingAlarm());
});

// ─── Notification click handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Also check for any pending alarms while we have the SW awake
  checkAndFirePendingAlarm();

  // 1. Handle App Update Notification Click
  if (event.notification.data?.type === 'APP_UPDATE' || event.action === 'update') {
    if (typeof self.skipWaiting === 'function') {
      self.skipWaiting();
    }
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'TESTAMENT_APPLY_UPDATE' });
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('/?updated=true');
      })
    );
    return;
  }

  if (event.action === 'dismiss') return;

  // 2. Handle Memory Verse recall click
  const verseId = event.notification.data?.verseId;
  const targetUrl = verseId ? `/?action=wordforge&verseId=${encodeURIComponent(verseId)}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (verseId) client.postMessage({ type: 'TESTAMENT_NAVIGATE_VERSE', verseId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', () => {
  // Notification dismissed by user — no action needed
});

// ─── Message handler (from app window) ───────────────────────────────────────

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    if (typeof self.skipWaiting === 'function') self.skipWaiting();

  } else if (event.data?.type === 'CHECK_FOR_UPDATE') {
    if (self.registration && typeof self.registration.update === 'function') {
      self.registration.update().catch(() => {});
    }

  } else if (event.data?.type === 'SCHEDULE_ALARM') {
    // Store the alarm as an absolute timestamp in IDB instead of a setTimeout.
    // This survives SW termination — the alarm will fire on next SW wakeup.
    const { delayMs, title, options, slot, todayKey } = event.data;
    if (typeof delayMs === 'number' && delayMs > 0 && delayMs < 48 * 60 * 60 * 1000) {
      const targetTimestamp = Date.now() + delayMs;
      let db;
      try {
        db = await openDB();
        await idbPut(db, {
          id: 'pendingAlarm',
          targetTimestamp,
          title,
          options,
          slot: slot || null,
          todayKey: todayKey || ''
        });
      } catch {
        // Ignore IDB failures
      } finally {
        if (db) db.close();
      }
    }

  } else if (event.data?.type === 'CANCEL_ALARM') {
    let db;
    try {
      db = await openDB();
      await idbDelete(db, 'pendingAlarm');
    } catch {
      // Ignore
    } finally {
      if (db) db.close();
    }
  }
});

// ─── Periodic background sync (Android Chrome PWA) ───────────────────────────

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'testament-update-check') {
    if (self.registration && typeof self.registration.update === 'function') {
      event.waitUntil(self.registration.update().catch(() => {}));
    }
  } else if (event.tag === 'testament-memory-pulse') {
    // Check IDB alarm first (primary path), then also notify any open window
    event.waitUntil(
      checkAndFirePendingAlarm().then(() =>
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: 'TESTAMENT_TRIGGER_CHECK' });
          }
        })
      )
    );
  }
});

// ─── Web Push payload handler (for server push compatibility) ─────────────────

self.addEventListener('push', (event) => {
  // Use the SW wakeup from the push to also check our local IDB alarm
  checkAndFirePendingAlarm();

  let data = {
    title: '⚔️ Testament Memory Pulse',
    body: 'Time for your memory verse practice! Can you recite it?',
    data: {}
  };

  try {
    if (event.data) data = event.data.json();
  } catch {
    if (event.data) data.body = event.data.text();
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

  event.waitUntil(self.registration.showNotification(data.title, options));
});
