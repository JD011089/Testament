import React, { useState } from 'react';
import { Flame, Settings } from 'lucide-react';
import { getDailyStreakCount } from '../utils/dailyEngine';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * One shared page header used by every non-Today tab so the title scale,
 * spacing, streak and settings entry are consistent everywhere.
 * The streak + settings cluster only appears below xl, where the desktop
 * top nav (which already carries them) is hidden.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  eyebrowIcon,
  actions,
  className = '',
}) => {
  const [streak] = useState<number>(() => getDailyStreakCount());

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent('testament-open-settings'));
  };

  return (
    <div className={`mb-6 flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-2 text-label font-semibold text-accent-text mb-1">
            {eyebrowIcon}
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-title-1 text-fg">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-small sm:text-body text-fg-secondary">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 xl:hidden">
        {actions}
        <div
          title={streak > 0 ? 'Daily streak' : 'Fresh start'}
          className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-label font-bold text-orange-800 dark:text-orange-300"
        >
          <Flame className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" aria-hidden="true" />
          <span>{streak > 0 ? `${streak}d` : 'New'}</span>
        </div>
        <button
          type="button"
          onClick={openSettings}
          title="Settings & Preferences"
          aria-label="Settings"
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
