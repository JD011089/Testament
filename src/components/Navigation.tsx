import React from 'react';
import { Flame, UserRound } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import { TodayIcon, JourneyIcon, BibleIcon, CollectionIcon } from './NavIcons';

export type NavTab = 'today' | 'dashboard' | 'map' | 'library' | 'game' | 'practice' | 'arsenal' | 'wordforge' | 'deck';

interface NavigationProps {
  currentTab: NavTab | 'not-found';
  onSelectTab: (tab: NavTab) => void;
  /** Kept for API compatibility: ambience and Drive Mode now live in Settings. */
  currentAmbience?: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience?: () => void;
  onOpenDriveMode?: () => void;
  streakCount?: number;
  xp?: number;
  onOpenSettings?: () => void;
  onOpenWhatsNew?: () => void;
}

type IconComponent = React.FC<{ active?: boolean; className?: string }>;

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  streakCount = 0,
  onOpenSettings,
}) => {
  const { t } = useLanguage();

  const isTabActive = (itemTab: NavTab) => {
    if (itemTab === 'practice') {
      return currentTab === 'practice' || currentTab === 'wordforge';
    }
    if (itemTab === 'deck') {
      return currentTab === 'deck' || currentTab === 'arsenal';
    }
    return currentTab === itemTab;
  };

  const navItems: { tab: NavTab; label: string; tooltip: string; Icon: IconComponent }[] = [
    { tab: 'today', label: t('nav.home'), tooltip: t('nav.homeTooltip'), Icon: TodayIcon },
    { tab: 'map', label: t('nav.map'), tooltip: t('nav.mapTooltip'), Icon: JourneyIcon },
    { tab: 'library', label: t('nav.library'), tooltip: t('nav.libraryTooltip'), Icon: BibleIcon },
    { tab: 'deck', label: t('nav.deck'), tooltip: t('nav.deckTooltip'), Icon: CollectionIcon },
  ];

  const openSettings = () => {
    soundEngine.playClick();
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      window.dispatchEvent(new CustomEvent('testament-open-settings'));
    }
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP TOP BAR (xl and up): brand · tabs · streak + profile */}
      {/* ============================================================ */}
      <header className="hidden xl:block fixed top-0 left-0 right-0 z-40 bg-surface-raised/90 dark:bg-ink/90 backdrop-blur-md border-b border-line transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('today');
            }}
            className="flex items-center gap-3 cursor-pointer group justify-self-start"
          >
            <span className="w-9 h-9 rounded-xl bg-accent text-accent-on flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <TodayIcon active className="w-5 h-5" />
            </span>
            <span className="font-display font-bold text-sm tracking-[0.2em] text-fg">
              {t('nav.brand')}
            </span>
          </button>

          <nav className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-full border border-line">
            {navItems.map(({ tab, label, tooltip, Icon }) => {
              const isActive = isTabActive(tab);
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectTab(tab);
                  }}
                  title={tooltip}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 rounded-full text-sm font-semibold transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-surface-raised dark:bg-stone-800 text-accent-text shadow-sm'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  <Icon active={isActive} className="w-[18px] h-[18px]" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <div
              title={t('nav.dailyStreak')}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-full border border-line bg-surface-raised dark:bg-stone-900 text-sm font-bold ${
                streakCount > 0 ? 'text-secondary-text' : 'text-fg-muted font-medium'
              }`}
            >
              <Flame className={`w-4 h-4 ${streakCount > 0 ? 'fill-current' : ''}`} />
              <span>{streakCount > 0 ? streakCount : t('nav.freshStart')}</span>
            </div>
            <button
              type="button"
              onClick={openSettings}
              title={t('nav.settingsTooltip')}
              aria-label={t('nav.settings')}
              className="w-10 h-10 min-h-0 rounded-full bg-amber-100 dark:bg-amber-500/15 text-accent-text border border-line flex items-center justify-center hover:ring-2 hover:ring-accent/40 transition-all cursor-pointer"
            >
              <UserRound className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BOTTOM NAV (below xl): always docked, never hides on scroll */}
      {/* ============================================================ */}
      <nav
        role="navigation"
        aria-label={t('nav.mobileAria')}
        className={`xl:hidden fixed z-40 left-1/2 -translate-x-1/2 bottom-[max(0.75rem,env(safe-area-inset-bottom))] w-[calc(100%-1.5rem)] max-w-sm rounded-full bg-surface-raised/90 dark:bg-stone-900/90 backdrop-blur-xl border border-line p-1.5 shadow-[0_12px_34px_-10px_rgba(10,15,30,0.25),0_2px_6px_rgba(10,15,30,0.06)]`}
      >
        <div className="grid grid-cols-4 items-stretch w-full gap-0.5">
          {navItems.map(({ tab, label, Icon }) => {
            const isActive = isTabActive(tab);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectTab(tab);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center min-h-[52px] py-1 px-0.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-accent w-full min-w-0 active:scale-95 ${
                  isActive
                    ? 'text-accent-text bg-amber-100 dark:bg-amber-500/15 font-bold'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                <Icon active={isActive} className="w-6 h-6 shrink-0" />
                <span className="text-[10.5px] leading-tight font-semibold w-full text-center block mt-0.5 truncate">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
