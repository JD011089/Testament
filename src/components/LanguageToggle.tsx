import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { soundEngine } from '../utils/audio';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', compact = false }) => {
  const { language, toggleLanguage, t } = useLanguage();

  const handleToggle = () => {
    soundEngine.playClick();
    toggleLanguage();
  };

  const flag = language === 'fr' ? '🇫🇷' : language === 'es' ? '🇪🇸' : '🇺🇸';
  const label = language.toUpperCase();

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={t('lang.tooltip')}
      aria-label={`Language: ${language === 'en' ? 'English' : language === 'es' ? 'Español' : 'Français'}`}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer select-none shrink-0 min-h-[32px] ${
        compact
          ? 'px-2 py-1 gap-1 text-xs font-mono font-bold text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
          : 'px-2.5 py-1.5 gap-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-parchment-100 border border-stone-200 dark:border-stone-800 shadow-sm'
      } ${className}`}
    >
      <span className="text-sm leading-none" role="img" aria-hidden="true">
        {flag}
      </span>
      <span className="font-mono text-[11px] font-bold tracking-tight">
        {label}
      </span>
    </button>
  );
};
