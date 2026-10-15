/**
 * Shared success feedback: one place for haptics + a short success sound,
 * honoring the user's Sound and Haptics settings.
 */

import { soundEngine } from './audio';

export const SOUND_ENABLED_KEY = 'testament_sound_enabled';
export const HAPTICS_ENABLED_KEY = 'testament_haptics_enabled';

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch {
    return fallback;
  }
}

export function isSoundEnabled(): boolean {
  return readFlag(SOUND_ENABLED_KEY, true);
}

export function isHapticsEnabled(): boolean {
  return readFlag(HAPTICS_ENABLED_KEY, true);
}

function writeFlag(key: string, value: boolean, event: string) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore quota failures
  }
  try {
    window.dispatchEvent(new CustomEvent(event, { detail: value }));
  } catch {
    // ignore non-browser environments
  }
}

export function setSoundEnabled(value: boolean) {
  writeFlag(SOUND_ENABLED_KEY, value, 'testament-sound-changed');
}

export function setHapticsEnabled(value: boolean) {
  writeFlag(HAPTICS_ENABLED_KEY, value, 'testament-haptics-changed');
}

/** Fire the device vibration API when available and enabled. */
export function haptic(pattern: number | number[] = 12): void {
  if (!isHapticsEnabled()) return;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // vibration is best-effort
  }
}

export type SuccessTone = 'tap' | 'snap' | 'victory';

/** Success sound + haptic. Use on every successful action. */
export function celebrate(tone: SuccessTone = 'snap'): void {
  if (isSoundEnabled()) {
    if (tone === 'victory') soundEngine.playVictory();
    else if (tone === 'tap') soundEngine.playClick();
    else soundEngine.playSnap();
  }
  haptic();
}

/** A gentler nudge for a wrong try — no failure state, no negative sound. */
export function nudge(): void {
  if (isSoundEnabled()) soundEngine.playClick();
  haptic(8);
}
