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

    // Update app badge if supported
    if (self.navigator && 'setAppBadge' in self.navigator) {
      self.navigator.setAppBadge().catch(() => {});
    }

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

// ─── Lifecycle: activate — check alarm on every SW activation ────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(checkAndFirePendingAlarm());
});

// ─── Notification click handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};

  event.waitUntil((async () => {
    await checkAndFirePendingAlarm();

    if (data.type === 'APP_UPDATE' || action === 'update') {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        client.postMessage({ type: 'TESTAMENT_APPLY_UPDATE' });
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
      return;
    }

    if (action === 'dismiss') return;

    const verseId = data.verseId;
    const targetUrl = verseId
      ? `/memorize?verseId=${encodeURIComponent(verseId)}`
      : (typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/');
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      if ('focus' in client) {
        if (verseId) client.postMessage({ type: 'TESTAMENT_NAVIGATE_VERSE', verseId });
        else if (data.type === 'DAILY_MISSION' || data.type === 'MEMORY_PULSE') {
          client.postMessage({ type: 'TESTAMENT_NAVIGATE', url: targetUrl });
        }
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener('notificationclose', () => {
  // Notification dismissed by user — no action needed
});

// ─── Message handler (from app window) ───────────────────────────────────────

self.addEventListener('message', (event) => {
  event.waitUntil((async () => {
  if (event.data?.type === 'SKIP_WAITING') {
    if (typeof self.skipWaiting === 'function') self.skipWaiting();

  } else if (event.data?.type === 'CHECK_FOR_UPDATE') {
    if (self.registration && typeof self.registration.update === 'function') {
      await self.registration.update().catch(() => {});
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
  })());
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
  event.waitUntil((async () => {
    await checkAndFirePendingAlarm();

    let data = {
      title: 'Testament Memory Pulse',
      body: 'Time for your memory verse practice. Can you recite it?',
      data: {}
    };

    try {
      if (event.data) data = event.data.json();
    } catch {
      if (event.data) data.body = event.data.text();
    }

    const isUpdate = data.data?.type === 'APP_UPDATE';
    const options = isUpdate
      ? {
          body: data.body || 'A new version of Testament is ready. Open the app to update.',
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-96.png',
          tag: 'testament-app-update',
          renotify: true,
          data: { type: 'APP_UPDATE', url: '/' }
        }
      : {
          body: data.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-96.png',
          tag: data.data?.verseId ? `testament-verse-${data.data.verseId}` : 'testament-pulse',
          renotify: true,
          data: data.data || {}
        };

    if (!isUpdate && self.navigator && 'setAppBadge' in self.navigator) {
      self.navigator.setAppBadge().catch(() => {});
    }
    await self.registration.showNotification(data.title, options);
  })());
});
