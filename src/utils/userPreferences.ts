const SHOW_XP_KEY = 'testament_show_xp';

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
    window.dispatchEvent(new CustomEvent('testament-show-xp-changed', { detail: { show } }));
  } catch {
    // ignore
  }
}
