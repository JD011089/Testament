export type AppTheme = 'light' | 'dark';

export const DAYBREAK_STATUS_COLOR = '#F8F1E0';
export const VESPERS_STATUS_COLOR = '#131722';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem('testament_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // ignore
  }
  // Decision: Daybreak (light) is default unless the user has saved a choice.
  // Do not follow prefers-color-scheme when no choice is saved.
  return 'light';
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }

  // Update EVERY meta[name=theme-color] tag so the mobile status bar keeps the correct color
  const targetColor = theme === 'dark' ? VESPERS_STATUS_COLOR : DAYBREAK_STATUS_COLOR;
  const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
  if (metaThemeColors.length > 0) {
    metaThemeColors.forEach((meta) => {
      meta.setAttribute('content', targetColor);
    });
  } else {
    const newMeta = document.createElement('meta');
    newMeta.name = 'theme-color';
    newMeta.content = targetColor;
    document.head.appendChild(newMeta);
  }

  try {
    localStorage.setItem('testament_theme', theme);
  } catch {
    // ignore
  }

  window.dispatchEvent(new CustomEvent('testament-theme-changed', { detail: { theme } }));
}

export function toggleTheme(): AppTheme {
  const current = getStoredTheme();
  const next: AppTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
