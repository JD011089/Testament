/**
 * Device notification preferences + local scheduling via the service worker.
 * Uses the browser/OS Notification API (no server push required for daily slots).
 */

import { getCalendarReminderPrefs, formatTime12h } from './calendarReminders';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export interface NotificationPrefs {
  /** OS notifications when a new app version is ready */
  appUpdates: boolean;
  /** Daily morning mission nudge */
  dailyMission: boolean;
  /** Midday memory / verse recall nudge */
  memoryPulse: boolean;
  morningTime: string;
  recallTime: string;
}

const STORAGE_KEY = 'testament_notification_prefs';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  appUpdates: true,
  dailyMission: false,
  memoryPulse: false,
  morningTime: '07:00',
  recallTime: '12:30',
};

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export function getNotificationPrefs(): NotificationPrefs {
  const cal = getCalendarReminderPrefs();
  const defaults: NotificationPrefs = {
    ...DEFAULT_NOTIFICATION_PREFS,
    morningTime: cal.morningTime,
    recallTime: cal.recallTime,
  };
  if (typeof window === 'undefined') return { ...defaults };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      appUpdates: typeof parsed.appUpdates === 'boolean' ? parsed.appUpdates : defaults.appUpdates,
      dailyMission: typeof parsed.dailyMission === 'boolean' ? parsed.dailyMission : defaults.dailyMission,
      memoryPulse: typeof parsed.memoryPulse === 'boolean' ? parsed.memoryPulse : defaults.memoryPulse,
      morningTime:
        typeof parsed.morningTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.morningTime)
          ? parsed.morningTime
          : defaults.morningTime,
      recallTime:
        typeof parsed.recallTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.recallTime)
          ? parsed.recallTime
          : defaults.recallTime,
    };
  } catch {
    return { ...defaults };
  }
}

export function saveNotificationPrefs(patch: Partial<NotificationPrefs>): NotificationPrefs {
  const next = { ...getNotificationPrefs(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('testament-notification-prefs', { detail: next }));
  return next;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }
  return output;
}

let pushSyncCache: { key: string; ok: boolean; at: number } | null = null;

/**
 * Registers the device with Web Push and syncs the chosen reminder times.
 * Server-side dispatch is what makes delivery reliable when the app is closed.
 */
export async function syncPushSubscription(prefs = getNotificationPrefs(), force = false): Promise<boolean> {
  const cacheKey = `${prefs.dailyMission}:${prefs.morningTime}:${prefs.memoryPulse}:${prefs.recallTime}:${getNotificationPermission()}`;
  if (!force && pushSyncCache && pushSyncCache.key === cacheKey && (pushSyncCache.ok || Date.now() - pushSyncCache.at < 60_000)) {
    return pushSyncCache.ok;
  }

  const result = await subscribeToPush(prefs);
  pushSyncCache = { key: cacheKey, ok: result, at: Date.now() };
  return result;
}

async function subscribeToPush(prefs: NotificationPrefs): Promise<boolean> {
  if (typeof window === 'undefined' || getNotificationPermission() !== 'granted') return false;
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!publicKey || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const raw = subscription.toJSON();
    if (!raw.endpoint || !raw.keys?.p256dh || !raw.keys?.auth) return false;

    const slots: string[] = [];
    if (prefs.dailyMission) slots.push(`morning:${prefs.morningTime}`);
    if (prefs.memoryPulse) slots.push(`recall:${prefs.recallTime}`);

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: { endpoint: raw.endpoint, keys: raw.keys },
        slots,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        enabled: slots.length > 0,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Cancels the server push registration when the user turns every reminder off. */
export async function disablePushSubscription(): Promise<void> {
  pushSyncCache = null;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        slots: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        enabled: false,
      }),
    });
  } catch {
    /* ignore */
  }
}

/** Sends a real Web Push message so the user can verify closed-app delivery. */
export async function sendTestPush(): Promise<boolean> {
  if (typeof window === 'undefined' || getNotificationPermission() !== 'granted') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;
    const raw = subscription.toJSON();
    if (!raw.endpoint || !raw.keys?.p256dh || !raw.keys?.auth) return false;
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: { endpoint: raw.endpoint, keys: raw.keys } }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function postToServiceWorker(message: Record<string, unknown>): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const worker = reg.active || navigator.serviceWorker.controller;
    if (!worker) return false;
    worker.postMessage(message);
    return true;
  } catch {
    return false;
  }
}

/** Syncs server push, or schedules on-device alarms when push is unavailable. */
export async function rescheduleNotificationAlarms(prefs = getNotificationPrefs()): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    await postToServiceWorker({ type: 'CANCEL_ALARM' });
    return;
  }

  // Web Push is the reliable path when the PWA/browser is closed.
  const pushReady = await syncPushSubscription(prefs);
  if (pushReady) {
    await postToServiceWorker({ type: 'CANCEL_ALARM' });
    return;
  }

  type Slot = { id: 'morning' | 'recall'; time: string; title: string; body: string; url: string };
  const slots: Slot[] = [];
  if (prefs.dailyMission) {
    slots.push({
      id: 'morning',
      time: prefs.morningTime,
      title: 'Testament — Morning mission',
      body: `Your daily story is ready (${formatTime12h(prefs.morningTime)}). Open Today to begin.`,
      url: '/',
    });
  }
  if (prefs.memoryPulse) {
    slots.push({
      id: 'recall',
      time: prefs.recallTime,
      title: 'Testament — Memory pulse',
      body: `Quick verse recall (${formatTime12h(prefs.recallTime)}). Can you still say it?`,
      url: '/practice',
    });
  }

  if (slots.length === 0) {
    await postToServiceWorker({ type: 'CANCEL_ALARM' });
    return;
  }

  await postToServiceWorker({
    type: 'SET_NOTIFICATION_PLAN',
    todayKey: todayKey(),
    slots: slots.map((slot) => ({
      id: slot.id,
      time: slot.time,
      title: slot.title,
      options: {
        body: slot.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        tag: `testament-${slot.id}`,
        renotify: false,
        data: {
          type: slot.id === 'morning' ? 'DAILY_MISSION' : 'MEMORY_PULSE',
          url: slot.url,
        },
      },
    })),
  });
}

export async function sendTestDeviceNotification(): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') return false;
  const title = 'Testament notifications are on';
  const options: NotificationOptions = {
    body: 'You will get alerts for the categories you enable in Notification Settings.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: 'testament-test-notification',
  };
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export function shouldNotifyAppUpdates(prefs = getNotificationPrefs()): boolean {
  return prefs.appUpdates && getNotificationPermission() === 'granted';
}
