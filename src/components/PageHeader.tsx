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
    <div className={`mb-6 space-y-2 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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

        <div className="flex items-center gap-1.5 shrink-0 xl:hidden pt-0.5">
          <div
            title={streak > 0 ? 'Daily streak' : 'Fresh start'}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-full bg-surface-raised border border-line text-label font-bold text-accent-text"
          >
            <Flame className="w-3.5 h-3.5 fill-accent/25 text-accent" aria-hidden="true" />
            <span>{streak > 0 ? `${streak}d` : 'New'}</span>
          </div>
          <button
            type="button"
            onClick={openSettings}
            title="Settings & Preferences"
            aria-label="Settings"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-surface-raised hover:bg-stone-100 dark:hover:bg-stone-850 border border-line text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 xl:hidden">
          {actions}
        </div>
      )}
    </div>
  );
};
