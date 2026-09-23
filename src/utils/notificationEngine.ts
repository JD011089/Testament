import type { MemoryVerse, NotificationSettings, RecallPromptStyle } from '../types';
import { getVerseById, getAllVerses } from './verseRegistry';
import { getTodayDateKey } from './dailyEngine';

const STORAGE_KEY = 'testament_notification_settings';

/**
 * Default notification configuration
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  activeVerseId: 'verse-1', // Default: Joshua 1:9
  frequencyPerDay: 3, // 3 times a day (Morning, Afternoon, Evening)
  startHour: 8, // 8:00 AM
  endHour: 21, // 9:00 PM
  recallStyle: 'cue',
  lastNotifiedDate: '',
  notificationsSentToday: 0,
  scheduledSlots: ['09:00', '14:00', '19:30'],
  firedSlotsToday: [],
  lastNotifiedTimestamp: 0
};

/**
 * Converts a "HH:mm" time string to total minutes from midnight
 */
export const timeStringToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Formats minutes from midnight to 12-hour AM/PM label
 */
export const formatMinutesTo12h = (totalMinutes: number): string => {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mStr = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `${h12}${mStr} ${ampm}`;
};

/**
 * Evenly calculates daily time slots across waking hours
 */
export const calculateDailySlots = (frequency: number, startHour: number, endHour: number): string[] => {
  const count = Math.max(1, Math.min(5, frequency));
  const spanHours = Math.max(2, endHour - startHour);
  const slots: string[] = [];

  for (let i = 0; i < count; i++) {
    const fraction = (i + 0.5) / count;
    const totalMinutes = Math.round((startHour + fraction * spanHours) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    slots.push(formatted);
  }

  return slots;
};

/**
 * Retrieves saved notification settings from localStorage
 */
export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    const parsed = JSON.parse(raw);
    const slots = parsed.scheduledSlots?.length 
      ? parsed.scheduledSlots 
      : calculateDailySlots(parsed.frequencyPerDay || 3, parsed.startHour || 8, parsed.endHour || 21);

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      scheduledSlots: slots,
      firedSlotsToday: Array.isArray(parsed.firedSlotsToday) ? parsed.firedSlotsToday : []
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const formatSlot12h = (timeStr: string): string => {
  return formatMinutesTo12h(timeStringToMinutes(timeStr));
};

/**
 * Persists notification settings to localStorage and notifies listening components
 */
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('testament-notifications-updated', { detail: settings }));
    }
  } catch (err) {
    console.error('Failed to save notification settings', err);
  }
};

/**
 * Checks if Web Notifications are supported in this browser/PWA environment
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Returns current permission status: 'granted' | 'denied' | 'default'
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Requests permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    const isGranted = permission === 'granted';
    if (isGranted) {
      const current = getNotificationSettings();
      saveNotificationSettings({ ...current, enabled: true });
      syncNextAlarmToServiceWorker();
    }
    return isGranted;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
};

/**
 * Generates an active-recall cloze string (first letters of words)
 */
const generateClozeHint = (text: string): string => {
  const words = text.split(/\s+/);
  return words
    .slice(0, 10)
    .map(w => {
      const clean = w.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length <= 1) return w;
      return `${clean[0]}${'_'.repeat(Math.min(3, clean.length - 1))}`;
    })
    .join(' ') + '...';
};

/**
 * Formats gentle active-recall notification content
 */
export const formatRecallNotification = (
  verse: MemoryVerse,
  style: RecallPromptStyle = 'cue',
  promptIndex = 1,
  totalPrompts = 3
): { title: string; body: string } => {
  const originHero = verse.heroName ? `[${verse.heroName}] ` : '';
  const title = `⚔️ Recite Check • ${originHero}${verse.reference}`;
  
  if (style === 'cloze') {
    const hint = generateClozeHint(verse.text);
    return {
      title,
      body: `Prompt ${promptIndex} of ${totalPrompts}: "${hint}" Can you recite the rest from memory? Tap to test!`
    };
  }

  if (style === 'stealth') {
    return {
      title,
      body: `Prompt ${promptIndex} of ${totalPrompts}: Pause 10 seconds. Say ${verse.reference} aloud or in your mind before tapping.`
    };
  }

  // Default: 'cue' (opening words)
  const words = verse.text.split(/\s+/);
  const opening = words.slice(0, 7).join(' ');
  return {
    title,
    body: `Prompt ${promptIndex} of ${totalPrompts}: "${opening}..." Can you finish the rest? Tap to practice in Word Forge.`
  };
};

/**
 * Triggers a native notification via Service Worker (or fallback)
 */
export const dispatchNotification = async (
  title: string,
  body: string,
  verseId: string
): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const targetUrl = `/?action=wordforge&verseId=${encodeURIComponent(verseId)}`;

  interface ExtendedNotificationOptions extends NotificationOptions {
    renotify?: boolean;
    vibrate?: number[];
    actions?: Array<{ action: string; title: string }>;
  }

  const notificationOptions: ExtendedNotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: `testament-verse-${verseId}-${Date.now()}`,
    renotify: true,
    vibrate: [120, 60, 120],
    data: {
      verseId,
      url: targetUrl,
      action: 'wordforge'
    },
    actions: [
      { action: 'recite', title: '⚔️ Recite Now' },
      { action: 'dismiss', title: '✓ Got It' }
    ]
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Fallback for environments where serviceWorker.ready is pending
    new Notification(title, notificationOptions as NotificationOptions);
    return true;
  } catch (err) {
    console.warn('Failed to dispatch notification:', err);
    return false;
  }
};

/**
 * Calculates next upcoming scheduled reminder information
 */
export interface NextReminderInfo {
  slot: string;
  label: string;
  isTomorrow: boolean;
  delayMs: number;
  remainingFormatted: string;
}

export const getNextScheduledReminder = (): NextReminderInfo | null => {
  const settings = getNotificationSettings();
  if (!settings.scheduledSlots?.length) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next slot today that hasn't fired yet
  for (const slot of settings.scheduledSlots) {
    const slotM = timeStringToMinutes(slot);
    if (slotM > currentMinutes && !settings.firedSlotsToday.includes(slot)) {
      const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(slotM / 60), slotM % 60, 0, 0);
      const delayMs = Math.max(1000, targetTime.getTime() - now.getTime());
      const remainingMinutes = Math.round(delayMs / (1000 * 60));
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      const remainingFormatted = hours > 0 
        ? `in ${hours}h ${mins}m`
        : `in ${mins}m`;

      return {
        slot,
        label: formatMinutesTo12h(slotM),
        isTomorrow: false,
        delayMs,
        remainingFormatted
      };
    }
  }

  // If all today's slots have passed, schedule for first slot tomorrow
  const firstSlot = settings.scheduledSlots[0];
  const firstSlotM = timeStringToMinutes(firstSlot);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, Math.floor(firstSlotM / 60), firstSlotM % 60, 0, 0);
  const delayMs = Math.max(1000, tomorrow.getTime() - now.getTime());
  const remainingHours = Math.round(delayMs / (1000 * 60 * 60));

  return {
    slot: firstSlot,
    label: `${formatMinutesTo12h(firstSlotM)} Tomorrow`,
    isTomorrow: true,
    delayMs,
    remainingFormatted: `in ~${remainingHours} hours`
  };
};

const IDB_NAME = 'testament-notifications-db';
const IDB_VERSION = 1;
const IDB_STORE = 'state';

/**
 * Opens the shared IndexedDB database used by both the app and the Service Worker
 */
const openNotificationsDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not available'));
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e: Event) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });

/**
 * Records an alarm event into IndexedDB (accessible by both Window and ServiceWorker)
 */
export const recordAlarmFiredInIDB = (slot: string, todayKey: string, timestamp: number): Promise<boolean> =>
  openNotificationsDB()
    .then(
      (db) =>
        new Promise<boolean>((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put({ id: 'lastFired', slot, todayKey, timestamp });
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => { db.close(); resolve(false); };
          } catch { db.close(); resolve(false); }
        })
    )
    .catch(() => false);

/**
 * Writes a pending alarm record to IDB so the Service Worker can fire it even
 * if the SW was terminated and restarted between now and the target time.
 */
export const writePendingAlarmToIDB = (
  targetTimestamp: number,
  title: string,
  options: object,
  slot: string | null,
  todayKey: string
): Promise<boolean> =>
  openNotificationsDB()
    .then(
      (db) =>
        new Promise<boolean>((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put({ id: 'pendingAlarm', targetTimestamp, title, options, slot, todayKey });
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => { db.close(); resolve(false); };
          } catch { db.close(); resolve(false); }
        })
    )
    .catch(() => false);

/**
 * Retrieves the pending alarm record from IDB (written by the app or the SW)
 */
export const getIDBPendingAlarm = (): Promise<{
  targetTimestamp: number;
  slot: string | null;
  todayKey: string;
} | null> =>
  openNotificationsDB()
    .then(
      (db) =>
        new Promise<{ targetTimestamp: number; slot: string | null; todayKey: string } | null>((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get('pendingAlarm');
            req.onsuccess = () => { db.close(); resolve(req.result || null); };
            req.onerror = () => { db.close(); resolve(null); };
          } catch { db.close(); resolve(null); }
        })
    )
    .catch(() => null);

/**
 * Retrieves the last background alarm event from IndexedDB
 */
export const getIDBLastFired = (): Promise<{ slot: string; todayKey: string; timestamp: number } | null> =>
  openNotificationsDB()
    .then(
      (db) =>
        new Promise<{ slot: string; todayKey: string; timestamp: number } | null>((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get('lastFired');
            req.onsuccess = () => { db.close(); resolve(req.result || null); };
            req.onerror = () => { db.close(); resolve(null); };
          } catch { db.close(); resolve(null); }
        })
    )
    .catch(() => null);

/**
 * Synchronizes the exact next upcoming alarm timer with the Service Worker.
 * Writes the alarm to IDB directly as well so it survives SW restarts.
 */
export const syncNextAlarmToServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== 'granted') return;

  const nextReminder = getNextScheduledReminder();
  if (!nextReminder) return;

  const verse = getVerseById(settings.activeVerseId) || getAllVerses()[0];
  const promptIdx = (settings.notificationsSentToday % settings.frequencyPerDay) + 1;
  const { title, body } = formatRecallNotification(verse, settings.recallStyle, promptIdx, settings.frequencyPerDay);

  const targetUrl = `/?action=wordforge&verseId=${encodeURIComponent(verse.id)}`;
  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: `testament-verse-${verse.id}`,
    renotify: true,
    vibrate: [120, 60, 120],
    data: {
      verseId: verse.id,
      url: targetUrl,
      action: 'wordforge'
    },
    actions: [
      { action: 'recite', title: '⚔️ Recite Now' },
      { action: 'dismiss', title: '✓ Got It' }
    ]
  };

  const targetTimestamp = Date.now() + nextReminder.delayMs;
  const todayKey = getTodayDateKey();

  // 1. Write directly to IDB — this is the primary persistence path.
  //    The SW will read this on its next wakeup and fire the notification.
  await writePendingAlarmToIDB(targetTimestamp, title, options, nextReminder.slot, todayKey);

  // 2. Also send a message to the SW as a secondary path (works while SW is alive).
  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg.active) {
      reg.active.postMessage({
        type: 'SCHEDULE_ALARM',
        delayMs: nextReminder.delayMs,
        title,
        options,
        slot: nextReminder.slot,
        todayKey
      });
    }
  } catch (err) {
    console.warn('Could not sync alarm with service worker:', err);
  }
};

/**
 * Checks all scheduled slots resiliently, catches up on any passed slot, and prevents spam.
 * Reads both `lastFired` and `pendingAlarm` from IDB so app-open catch-up never
 * duplicates a notification the Service Worker already fired or is about to fire.
 */
export const checkAndDispatchDueReminders = async (): Promise<boolean> => {
  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== 'granted') return false;

  const todayKey = getTodayDateKey();
  let firedSlots = [...settings.firedSlotsToday];

  // Rollover on new calendar day
  if (settings.lastNotifiedDate !== todayKey) {
    firedSlots = [];
    settings.lastNotifiedDate = todayKey;
    settings.notificationsSentToday = 0;
    settings.firedSlotsToday = [];
    saveNotificationSettings(settings);
  }

  // ── IDB sync: absorb any slots the SW fired in the background ────────────
  const [lastBackgroundFired, pendingAlarm] = await Promise.all([
    getIDBLastFired(),
    getIDBPendingAlarm()
  ]);

  if (lastBackgroundFired && lastBackgroundFired.todayKey === todayKey && lastBackgroundFired.slot) {
    if (!firedSlots.includes(lastBackgroundFired.slot)) {
      firedSlots.push(lastBackgroundFired.slot);
      settings.firedSlotsToday = firedSlots;
      settings.notificationsSentToday = Math.max(settings.notificationsSentToday, firedSlots.length);
      settings.lastNotifiedTimestamp = Math.max(settings.lastNotifiedTimestamp || 0, lastBackgroundFired.timestamp);
      saveNotificationSettings(settings);
    }
  }

  // ── IDB sync: if there is a pendingAlarm for today that is already past,
  //    the SW will fire it on its next wakeup. Mark its slot as handled so we
  //    don't accidentally send a second notification from the app side.
  if (pendingAlarm && pendingAlarm.todayKey === todayKey && pendingAlarm.slot) {
    const alarmPast = Date.now() >= pendingAlarm.targetTimestamp;
    if (alarmPast && !firedSlots.includes(pendingAlarm.slot)) {
      // SW will fire this; treat as handled on the app side
      firedSlots.push(pendingAlarm.slot);
      settings.firedSlotsToday = firedSlots;
      settings.notificationsSentToday = Math.max(settings.notificationsSentToday, firedSlots.length);
      saveNotificationSettings(settings);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (settings.notificationsSentToday >= settings.frequencyPerDay) {
    syncNextAlarmToServiceWorker();
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowMs = Date.now();

  // Find all slots that were scheduled at or before current time
  const pastSlots = settings.scheduledSlots.filter(s => timeStringToMinutes(s) <= currentMinutes);

  // Find which of these past slots haven't been fired today
  const pendingDueSlots = pastSlots.filter(s => !firedSlots.includes(s));

  if (pendingDueSlots.length === 0) {
    syncNextAlarmToServiceWorker();
    return false;
  }

  // Prevent back-to-back spam: ensure at least 25 minutes have elapsed since the last notification
  const cooldownMs = 25 * 60 * 1000;
  if (settings.lastNotifiedTimestamp && (nowMs - settings.lastNotifiedTimestamp) < cooldownMs) {
    syncNextAlarmToServiceWorker();
    return false;
  }

  // Deliver a reminder for the most recent due slot only
  const dueSlot = pendingDueSlots[pendingDueSlots.length - 1];
  const verse = getVerseById(settings.activeVerseId) || getAllVerses()[0];
  const nextPromptIndex = settings.notificationsSentToday + 1;
  const { title, body } = formatRecallNotification(
    verse,
    settings.recallStyle,
    nextPromptIndex,
    settings.frequencyPerDay
  );

  const sent = await dispatchNotification(title, body, verse.id);
  if (sent) {
    // Record into IDB as well for sync with SW
    await recordAlarmFiredInIDB(dueSlot, todayKey, nowMs);

    // Mark ALL pending past slots up to now as resolved so the user is never spammed with missed morning slots
    const updatedFired = Array.from(new Set([...firedSlots, ...pastSlots]));
    const updatedSettings: NotificationSettings = {
      ...settings,
      notificationsSentToday: nextPromptIndex,
      lastNotifiedDate: todayKey,
      firedSlotsToday: updatedFired,
      lastNotifiedTimestamp: nowMs
    };
    saveNotificationSettings(updatedSettings);

    // Schedule the next slot
    syncNextAlarmToServiceWorker();
    return true;
  }

  return false;
};

/**
 * Sends a test notification immediately or with a countdown delay
 */
export const sendTestMemoryNotification = async (delaySeconds = 0): Promise<boolean> => {
  const settings = getNotificationSettings();
  const verse = getVerseById(settings.activeVerseId) || getAllVerses()[0];
  const { title, body } = formatRecallNotification(verse, settings.recallStyle, 1, settings.frequencyPerDay);

  if (delaySeconds <= 0) {
    return dispatchNotification(title, body, verse.id);
  }

  return new Promise((resolve) => {
    setTimeout(async () => {
      const success = await dispatchNotification(title, body, verse.id);
      resolve(success);
    }, delaySeconds * 1000);
  });
};

/**
 * Sets a verse as today's active memory target with optional frequency/hours overrides
 */
export const setActiveMemoryVerse = (
  verseId: string,
  options?: Partial<{ frequencyPerDay: number; startHour: number; endHour: number; recallStyle: RecallPromptStyle }>
): NotificationSettings => {
  const current = getNotificationSettings();
  const frequency = options?.frequencyPerDay ?? current.frequencyPerDay;
  const startHour = options?.startHour ?? current.startHour;
  const endHour = options?.endHour ?? current.endHour;
  const recallStyle = options?.recallStyle ?? current.recallStyle;
  const scheduledSlots = calculateDailySlots(frequency, startHour, endHour);

  // If changing mid-day, mark slots that passed more than 20 minutes ago as handled so upcoming slots trigger cleanly
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const alreadyPassed = scheduledSlots.filter(s => timeStringToMinutes(s) < currentMinutes - 20);

  const updated: NotificationSettings = {
    ...current,
    activeVerseId: verseId,
    frequencyPerDay: frequency,
    startHour,
    endHour,
    recallStyle,
    scheduledSlots,
    firedSlotsToday: alreadyPassed,
    notificationsSentToday: alreadyPassed.length
  };

  saveNotificationSettings(updated);
  syncNextAlarmToServiceWorker();
  return updated;
};

/**
 * Initializes the client-side background timer, heartbeat, and Service Worker alarm synchronization
 */
export const initNotificationScheduler = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  // Check immediately upon init
  checkAndDispatchDueReminders();
  syncNextAlarmToServiceWorker();

  // Listen for messages from Service Worker (e.g. background alarm fired, periodic sync)
  const onServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data?.type === 'TESTAMENT_TRIGGER_CHECK' || event.data?.type === 'TESTAMENT_ALARM_FIRED') {
      checkAndDispatchDueReminders();
      syncNextAlarmToServiceWorker();
    }
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', onServiceWorkerMessage);

    navigator.serviceWorker.ready.then((reg) => {
      // @ts-expect-error periodicSync is an experimental web platform feature
      if (reg.periodicSync && typeof reg.periodicSync.register === 'function') {
        // @ts-expect-error periodicSync registration
        reg.periodicSync.register('testament-memory-pulse', {
          minInterval: 60 * 60 * 1000 // 1 hour
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  // Catch up whenever user unlocks their phone or resumes the app
  const onVisibilityOrFocus = () => {
    if (document.visibilityState === 'visible' || document.hasFocus()) {
      checkAndDispatchDueReminders();
      syncNextAlarmToServiceWorker();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityOrFocus);
  window.addEventListener('focus', onVisibilityOrFocus);
  window.addEventListener('pageshow', onVisibilityOrFocus);

  // Heartbeat check every 60 seconds while open
  const interval = setInterval(() => {
    checkAndDispatchDueReminders();
  }, 60 * 1000);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    window.removeEventListener('focus', onVisibilityOrFocus);
    window.removeEventListener('pageshow', onVisibilityOrFocus);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', onServiceWorkerMessage);
    }
  };
};
