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

function msUntilNextTime(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return Math.max(60_000, target.getTime() - now.getTime());
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
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

/** Schedule the soonest enabled daily slot into the SW IndexedDB alarm. */
export async function rescheduleNotificationAlarms(prefs = getNotificationPrefs()): Promise<void> {
  await postToServiceWorker({ type: 'CANCEL_ALARM' });

  if (getNotificationPermission() !== 'granted') return;

  type Slot = { id: 'morning' | 'recall'; time: string; title: string; body: string };
  const candidates: Slot[] = [];
  if (prefs.dailyMission) {
    candidates.push({
      id: 'morning',
      time: prefs.morningTime,
      title: 'Testament — Morning mission',
      body: `Your daily story is ready (${formatTime12h(prefs.morningTime)}). Open Today to begin.`,
    });
  }
  if (prefs.memoryPulse) {
    candidates.push({
      id: 'recall',
      time: prefs.recallTime,
      title: 'Testament — Memory pulse',
      body: `Quick verse recall (${formatTime12h(prefs.recallTime)}). Can you still say it?`,
    });
  }
  if (candidates.length === 0) return;

  let soonest = candidates[0];
  let soonestMs = msUntilNextTime(soonest.time);
  for (const slot of candidates.slice(1)) {
    const ms = msUntilNextTime(slot.time);
    if (ms < soonestMs) {
      soonest = slot;
      soonestMs = ms;
    }
  }

  await postToServiceWorker({
    type: 'SCHEDULE_ALARM',
    delayMs: soonestMs,
    slot: soonest.id,
    todayKey: todayKey(),
    title: soonest.title,
    options: {
      body: soonest.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: `testament-${soonest.id}`,
      renotify: true,
      data: {
        type: soonest.id === 'morning' ? 'DAILY_MISSION' : 'MEMORY_PULSE',
        url: soonest.id === 'morning' ? '/' : '/practice',
      },
    },
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
