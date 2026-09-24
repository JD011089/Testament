import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getStoredTheme, toggleTheme, type AppTheme } from '../utils/theme';
import { soundEngine } from '../utils/audio';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', compact = false }) => {
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: AppTheme }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      } else {
        setTheme(getStoredTheme());
      }
    };

    window.addEventListener('testament-theme-changed', handleThemeChange);
    return () => window.removeEventListener('testament-theme-changed', handleThemeChange);
  }, []);

  const handleToggle = () => {
    soundEngine.playClick();
    const next = toggleTheme();
    setTheme(next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 ${
        compact
          ? 'p-2 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 bg-stone-100 dark:bg-stone-900 border border-stone-250 dark:border-stone-800'
          : 'px-2.5 py-1.5 gap-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-parchment-100 border border-stone-200 dark:border-stone-800 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
          {!compact && <span className="hidden sm:inline">Light</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-amber-600 animate-fadeIn" />
          {!compact && <span className="hidden sm:inline">Dark</span>}
        </>
      )}
    </button>
  );
};
