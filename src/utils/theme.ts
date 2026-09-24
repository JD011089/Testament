export type AppTheme = 'light' | 'dark';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem('testament_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Check system preference if no saved preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // ignore
  }
  return 'dark';
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

  // Update theme meta color for mobile browser bars
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#090b0e' : '#fcfbfa');
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
