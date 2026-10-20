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
  if (!value) {
    try {
      soundEngine.stopAmbience();
    } catch {
      /* ignore */
    }
  }
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

export type SuccessTone =
  | 'tap'
  | 'snap'
  | 'victory'
  | 'reveal'
  | 'settle'
  | 'whoosh'
  | 'choice'
  | 'payoff'
  | 'hold';

/** Success sound + haptic. Use on every successful action. */
export function celebrate(tone: SuccessTone = 'snap'): void {
  if (isSoundEnabled()) {
    switch (tone) {
      case 'victory':
        soundEngine.playVictory();
        break;
      case 'tap':
        soundEngine.playClick();
        break;
      case 'reveal':
        soundEngine.playReveal();
        break;
      case 'settle':
        soundEngine.playSettle();
        break;
      case 'whoosh':
        soundEngine.playWhoosh();
        break;
      case 'choice':
        soundEngine.playChoiceSelect();
        break;
      case 'payoff':
        soundEngine.playPayoff();
        break;
      case 'hold':
        soundEngine.playHoldPulse();
        break;
      default:
        soundEngine.playSnap();
        break;
    }
  }

  if (tone === 'victory' || tone === 'payoff') haptic([14, 40, 18]);
  else if (tone === 'whoosh' || tone === 'hold') haptic(8);
  else if (tone === 'settle') haptic(16);
  else haptic();
}

/** A gentler nudge for a wrong try — no failure state, no negative sound. */
export function nudge(): void {
  if (isSoundEnabled()) soundEngine.playClick();
  haptic(8);
}
