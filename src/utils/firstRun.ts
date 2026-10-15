export const FIRST_RUN_KEY = 'testament_first_run_done';
export const REMINDER_TIME_KEY = 'testament_reminder_time';

export function hasCompletedFirstRun(): boolean {
  try {
    return localStorage.getItem(FIRST_RUN_KEY) === 'true';
  } catch {
    return true;
  }
}

export function markFirstRunDone(): void {
  try {
    localStorage.setItem(FIRST_RUN_KEY, 'true');
  } catch {
    // ignore
  }
}

export function readReminderTime(): string {
  try {
    return localStorage.getItem(REMINDER_TIME_KEY) || '08:00';
  } catch {
    return '08:00';
  }
}

export function saveReminderTime(time: string): void {
  try {
    localStorage.setItem(REMINDER_TIME_KEY, time);
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent('testament-reminder-changed', { detail: time }));
  } catch {
    // ignore
  }
}