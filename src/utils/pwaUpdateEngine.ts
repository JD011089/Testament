/**
 * PWA Update Engine
 * Detects background & foreground updates, dispatches system push notifications
 * ("Update Available: Tap to update and open"), and manages 1-tap reloads.
 */

let swRegistration: ServiceWorkerRegistration | null = null;
let updateAvailableState = false;
let updateCheckTimer: number | null = null;

export interface AppUpdateEventDetail {
  registration: ServiceWorkerRegistration | null;
}

/**
 * Sends the OS-level system push notification when an update is ready
 */
export async function sendUpdatePushNotification(reg?: ServiceWorkerRegistration | null): Promise<boolean> {
  const targetReg = reg || swRegistration;
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const title = '🚀 Testament Update Available';
  const options: NotificationOptions & {
    renotify?: boolean;
    requireInteraction?: boolean;
    vibrate?: number[];
    actions?: Array<{ action: string; title: string }>;
  } = {
    body: 'A new version of Testament is ready! Tap to update and open the latest features.',
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
  };

  try {
    if (targetReg && 'showNotification' in targetReg) {
      await targetReg.showNotification(title, options);
      return true;
    } else {
      new Notification(title, options);
      return true;
    }
  } catch (err) {
    console.warn('Failed to display update push notification:', err);
    return false;
  }
}

/**
 * Handles the moment a new service worker is installed and waiting
 */
function handleUpdateFound(registration: ServiceWorkerRegistration) {
  updateAvailableState = true;

  // 1. Dispatch custom event for in-app floating banner
  window.dispatchEvent(
    new CustomEvent<AppUpdateEventDetail>('testament-update-available', {
      detail: { registration }
    })
  );

  // 2. Dispatch OS-level push notification if notifications are enabled
  if ('Notification' in window && Notification.permission === 'granted') {
    sendUpdatePushNotification(registration);
  }
}

/**
 * Check the server for a newer service worker
 */
export async function checkForUpdates(): Promise<void> {
  if (!swRegistration) return;
  try {
    await swRegistration.update();
  } catch (err) {
    // Harmless offline network error
    console.debug('Update check skipped (offline or network error):', err);
  }
}

/**
 * Apply the update: tells waiting service worker to skipWaiting & activates the new version
 */
export function applyAppUpdate(): void {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }

  // Brief delay to let the worker activate before page refresh
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

/**
 * Test trigger: simulates the update push notification & in-app banner for instant verification
 */
export async function sendTestUpdateNotification(): Promise<boolean> {
  updateAvailableState = true;
  window.dispatchEvent(
    new CustomEvent<AppUpdateEventDetail>('testament-update-available', {
      detail: { registration: swRegistration }
    })
  );

  return sendUpdatePushNotification(swRegistration);
}

/**
 * Returns whether an update is currently waiting
 */
export function isUpdateAvailable(): boolean {
  return updateAvailableState || Boolean(swRegistration?.waiting);
}

/**
 * Initializes the PWA update detection engine
 */
export function initPwaUpdateEngine(): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }

  // Prevent dev boot loops: unregister any rogue service workers on localhost (dev mode)
  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
  if (isDev) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    });
    return () => {};
  }

  // Prevent infinite reload loops on controller change
  let refreshing = false;
  const handleControllerChange = () => {
    if (refreshing) return;
    const lastReload = sessionStorage.getItem('testament_sw_reloaded');
    if (lastReload && Date.now() - Number(lastReload) < 15000) {
      console.warn('PWA: Preventing reload loop.');
      return;
    }
    refreshing = true;
    sessionStorage.setItem('testament_sw_reloaded', String(Date.now()));
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

  // Listen for message from service worker when notification was clicked
  const handleSwMessage = (event: MessageEvent) => {
    if (event.data?.type === 'TESTAMENT_APPLY_UPDATE') {
      applyAppUpdate();
    }
  };
  navigator.serviceWorker.addEventListener('message', handleSwMessage);

  // Register service worker and hook lifecycle
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    swRegistration = registration;

    // Check if an update is already waiting from a previous background install
    if (registration.waiting) {
      handleUpdateFound(registration);
    }

    // Listen for new service worker installation
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        // If state is installed AND there is an existing controller, this is an update!
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          handleUpdateFound(registration);
        }
      });
    });

    // Register Periodic Background Sync if supported (Android Chrome PWAs)
    if ('periodicSync' in registration) {
      try {
        const periodicSync = (registration as unknown as { periodicSync: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } }).periodicSync;
        periodicSync.register('testament-update-check', {
          minInterval: 60 * 60 * 1000 // 1 hour
        }).catch(() => {});
      } catch {
        // Periodic sync not permitted or supported
      }
    }

    // Check for updates immediately when app is opened
    checkForUpdates();
  }).catch((err) => {
    console.warn('PWA Update Engine: Service worker registration failed:', err);
  });

  // Check for updates when app tab becomes visible again
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Check for updates every 15 minutes while running
  updateCheckTimer = window.setInterval(() => {
    checkForUpdates();
  }, 15 * 60 * 1000);

  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (updateCheckTimer) {
      clearInterval(updateCheckTimer);
      updateCheckTimer = null;
    }
  };
}
