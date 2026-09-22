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
  scheduledSlots: ['09:00', '14:00', '19:30']
};

/**
 * Evenly calculates daily time slots across waking hours
 */
export const calculateDailySlots = (frequency: number, startHour: number, endHour: number): string[] => {
  const count = Math.max(1, Math.min(5, frequency));
  const spanHours = Math.max(2, endHour - startHour);
  const slots: string[] = [];

  for (let i = 0; i < count; i++) {
    // Distribute evenly: e.g. for count=3, fractions at 0.15, 0.5, 0.85 of waking span
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
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      scheduledSlots: parsed.scheduledSlots?.length 
        ? parsed.scheduledSlots 
        : calculateDailySlots(parsed.frequencyPerDay || 3, parsed.startHour || 8, parsed.endHour || 21)
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

/**
 * Persists notification settings to localStorage
 */
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
    badge: '/favicon.png',
    tag: `testament-verse-${verseId}`,
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

  const updated: NotificationSettings = {
    ...current,
    activeVerseId: verseId,
    frequencyPerDay: frequency,
    startHour,
    endHour,
    recallStyle,
    scheduledSlots
  };

  saveNotificationSettings(updated);
  return updated;
};

/**
 * Initializes the client-side background timer and scheduler
 * Checks once a minute or on app focus/visibilitychange if a reminder slot is due
 */
export const initNotificationScheduler = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const checkSchedule = async () => {
    const settings = getNotificationSettings();
    if (!settings.enabled || Notification.permission !== 'granted') return;

    const todayKey = getTodayDateKey();
    let sentToday = settings.notificationsSentToday;

    // Reset counter if calendar date rolled over
    if (settings.lastNotifiedDate !== todayKey) {
      sentToday = 0;
      settings.lastNotifiedDate = todayKey;
      settings.notificationsSentToday = 0;
      saveNotificationSettings(settings);
    }

    if (sentToday >= settings.frequencyPerDay) {
      return; // All daily reminders for today have already fired
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check which slot matches right now (within a 5-minute window)
    const slotIdx = sentToday; // Next pending slot index
    const targetSlot = settings.scheduledSlots[slotIdx];
    if (!targetSlot) return;

    const [slotH, slotM] = targetSlot.split(':').map(Number);
    const targetMinutes = slotH * 60 + slotM;

    // If current time has reached or just passed the target slot (and within 30 min of it)
    if (currentMinutes >= targetMinutes && currentMinutes <= targetMinutes + 30) {
      const verse = getVerseById(settings.activeVerseId) || getAllVerses()[0];
      const { title, body } = formatRecallNotification(
        verse, 
        settings.recallStyle, 
        sentToday + 1, 
        settings.frequencyPerDay
      );

      const sent = await dispatchNotification(title, body, verse.id);
      if (sent) {
        settings.notificationsSentToday = sentToday + 1;
        settings.lastNotifiedDate = todayKey;
        saveNotificationSettings(settings);
      }
    }
  };

  // Run on initial load
  checkSchedule();

  // Run on visibility change (when user unlocks phone or switches back to tab)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      checkSchedule();
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  // Periodic heartbeat every 60 seconds
  const interval = setInterval(checkSchedule, 60 * 1000);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibility);
  };
};
