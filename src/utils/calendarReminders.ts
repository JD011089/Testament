/**
 * Calendar Reminders Engine for Testament
 * 
 * Generates recurring daily calendar events (Google Calendar web links and RFC 5545 .ics files)
 * replacing unreliable web push notifications with zero-guilt, native calendar reminders.
 */

export type ReminderType = 'morning' | 'recall';

export interface CalendarReminderPrefs {
  morningTime: string; // HH:MM in 24h format, default "07:00"
  recallTime: string;  // HH:MM in 24h format, default "12:30"
}

const STORAGE_KEY = 'testament_calendar_reminders';
const ACTIVE_VERSE_KEY = 'testament_active_memory_verse';
const APP_URL = 'https://testament-bible-learning.vercel.app/';

export const DEFAULT_REMINDER_PREFS: CalendarReminderPrefs = {
  morningTime: '07:00',
  recallTime: '12:30'
};

export function getCalendarReminderPrefs(): CalendarReminderPrefs {
  if (typeof window === 'undefined') return { ...DEFAULT_REMINDER_PREFS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_REMINDER_PREFS };
    const parsed = JSON.parse(raw);
    return {
      morningTime: typeof parsed.morningTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.morningTime) 
        ? parsed.morningTime 
        : DEFAULT_REMINDER_PREFS.morningTime,
      recallTime: typeof parsed.recallTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.recallTime) 
        ? parsed.recallTime 
        : DEFAULT_REMINDER_PREFS.recallTime,
    };
  } catch {
    return { ...DEFAULT_REMINDER_PREFS };
  }
}

export function saveCalendarReminderPrefs(prefs: Partial<CalendarReminderPrefs>): CalendarReminderPrefs {
  const current = getCalendarReminderPrefs();
  const updated: CalendarReminderPrefs = {
    morningTime: prefs.morningTime || current.morningTime,
    recallTime: prefs.recallTime || current.recallTime,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
  return updated;
}

export function setActiveMemoryVerse(verseId: string): void {
  try {
    localStorage.setItem(ACTIVE_VERSE_KEY, verseId);
  } catch {
    // ignore
  }
}

export function getActiveMemoryVerse(): string | null {
  try {
    return localStorage.getItem(ACTIVE_VERSE_KEY);
  } catch {
    return null;
  }
}

export function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return '7:00 AM';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export interface ReminderEventConfig {
  title: string;
  description: string;
  url: string;
  time24: string;
  durationMinutes: number;
}

export function getReminderConfig(
  type: ReminderType, 
  timeOverride?: string, 
  verseContext?: { reference?: string }
): ReminderEventConfig {
  const prefs = getCalendarReminderPrefs();

  if (type === 'morning') {
    return {
      title: "Today's Mission — Testament",
      description: "No 40-minute reading plans. Just today's mission.\n\nOpen Testament: " + APP_URL,
      url: APP_URL,
      time24: timeOverride || prefs.morningTime,
      durationMinutes: 15,
    };
  }

  // Verse recall
  const verseRefText = verseContext?.reference ? ` (${verseContext.reference})` : '';
  return {
    title: `Still got yesterday's verse?${verseRefText} — Testament`,
    description: "Take 30 seconds to recall yesterday's verse.\n\nOpen Testament: " + APP_URL,
    url: APP_URL,
    time24: timeOverride || prefs.recallTime,
    durationMinutes: 15,
  };
}

/**
 * Calculates the next start & end Date for this recurring event.
 * If today's time hasn't passed, uses today; otherwise starts tomorrow.
 */
function calculateNextEventDates(time24: string, durationMinutes: number): { start: Date; end: Date } {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '7', 10);
  const m = parseInt(mStr || '0', 10);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

  // If already past today, schedule starting tomorrow
  if (start.getTime() <= now.getTime()) {
    start.setDate(start.getDate() + 1);
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDateToIsoBasic(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function formatDateToUtcBasic(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generates a one-click Google Calendar web link.
 */
export function getGoogleCalendarUrl(
  type: ReminderType, 
  options?: { time?: string; verseRef?: string }
): string {
  const config = getReminderConfig(type, options?.time, options?.verseRef ? { reference: options.verseRef } : undefined);
  const { start, end } = calculateNextEventDates(config.time24, config.durationMinutes);
  
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const startIso = formatDateToIsoBasic(start);
  const endIso = formatDateToIsoBasic(end);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: config.title,
    details: config.description,
    location: config.url,
    dates: `${startIso}/${endIso}`,
    recur: 'RRULE:FREQ=DAILY',
    ctz: timeZone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an RFC 5545 standard .ics file string.
 */
export function generateIcsContent(
  type: ReminderType, 
  options?: { time?: string; verseRef?: string }
): string {
  const config = getReminderConfig(type, options?.time, options?.verseRef ? { reference: options.verseRef } : undefined);
  const { start, end } = calculateNextEventDates(config.time24, config.durationMinutes);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  const uid = `testament-${type}-${Date.now()}@testament-bible-learning`;
  const dtstamp = formatDateToUtcBasic(new Date());
  const dtstart = formatDateToIsoBasic(start);
  const dtend = formatDateToIsoBasic(end);
  const escapedSummary = escapeIcsText(config.title);
  const escapedDesc = escapeIcsText(config.description);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Testament//Bible Learning//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${timeZone}:${dtstart}`,
    `DTEND;TZID=${timeZone}:${dtend}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${escapedSummary}`,
    `DESCRIPTION:${escapedDesc}`,
    `URL:${config.url}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapedSummary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}

/**
 * Detects if current environment is Android.
 */
export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
}

/**
 * Detects if current environment is iOS (iPhone/iPad/iPod).
 */
export function isIOS(): boolean {
  return typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Builds an Android Calendar Intent URL using the Android intent:#Intent syntax.
 * Directly targets CalendarContract.Events with ACTION_INSERT.
 * Opens the device's default calendar app (Samsung Calendar, Google Calendar, etc.)
 * with the new event pre-filled (title, description, dates, RRULE:FREQ=DAILY).
 */
export function getAndroidCalendarIntentUrl(
  type: ReminderType, 
  options?: { time?: string; verseRef?: string }
): string {
  const config = getReminderConfig(type, options?.time, options?.verseRef ? { reference: options.verseRef } : undefined);
  const { start, end } = calculateNextEventDates(config.time24, config.durationMinutes);
  
  const title = encodeURIComponent(config.title);
  const description = encodeURIComponent(config.description);
  const location = encodeURIComponent(config.url);
  const beginTime = start.getTime();
  const endTime = end.getTime();

  return `intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.item/event;S.title=${title};S.description=${description};S.eventLocation=${location};l.beginTime=${beginTime};l.endTime=${endTime};S.rrule=FREQ%3DDAILY;end`;
}

/**
 * Adds recurring event directly to the device's native calendar app without opening a browser:
 * - Android (primary): Fires Android Calendar Intent (ACTION_INSERT) opening default calendar app prefilled
 * - Universal fallback (iOS, desktop): Generates client-side .ics file download with RRULE:FREQ=DAILY
 */
export function addEventToNativeCalendar(
  type: ReminderType, 
  options?: { time?: string; verseRef?: string }
): 'android_intent' | 'ics' {
  if (isAndroid()) {
    try {
      const intentUrl = getAndroidCalendarIntentUrl(type, options);
      window.location.href = intentUrl;
      return 'android_intent';
    } catch {
      downloadCalendarIcs(type, options);
      return 'ics';
    }
  } else {
    downloadCalendarIcs(type, options);
    return 'ics';
  }
}

/**
 * Triggers a download of the .ics file in the browser.
 */
export function downloadCalendarIcs(
  type: ReminderType, 
  options?: { time?: string; verseRef?: string }
): void {
  const ics = generateIcsContent(type, options);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const filename = type === 'morning' ? 'testament-morning-mission.ics' : 'testament-verse-recall.ics';
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

