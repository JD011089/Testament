import { useEffect, useState } from 'react';

const SHOW_XP_KEY = 'testament_show_xp';

export const SHOW_XP_CHANGED_EVENT = 'testament-show-xp-changed';

/**
 * React hook form of {@link getShowXpPreference} so any surface can hide XP
 * and stay in sync when the setting toggles.
 */
export function useShowXpPreference(): boolean {
  const [showXp, setShowXp] = useState(() => getShowXpPreference());

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ show?: boolean }>).detail;
      setShowXp(typeof detail?.show === 'boolean' ? detail.show : getShowXpPreference());
    };
    window.addEventListener(SHOW_XP_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(SHOW_XP_CHANGED_EVENT, onChange);
  }, []);

  return showXp;
}

/**
 * Returns whether XP and ranks should be shown in the UI.
 * Default is FALSE (OFF) for all new users.
 */
export function getShowXpPreference(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const stored = localStorage.getItem(SHOW_XP_KEY);
    if (stored === null) return false; // Default OFF
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setShowXpPreference(show: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SHOW_XP_KEY, String(show));
    window.dispatchEvent(new CustomEvent(SHOW_XP_CHANGED_EVENT, { detail: { show } }));
  } catch {
    // ignore
  }
}
