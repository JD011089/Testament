import React from 'react';
import { 
  Compass, 
  BookOpen, 
  Brain, 
  Shield, 
  Car, 
  Volume2, 
  VolumeX, 
  Flame, 
  Award, 
  Sparkles,
  Settings
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { APP_VERSION } from '../config/version';

export type NavTab = 'dashboard' | 'library' | 'practice' | 'arsenal' | 'wordforge' | 'dilemmas';

interface NavigationProps {
  currentTab: NavTab | 'not-found';
  onSelectTab: (tab: NavTab) => void;
  currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience: () => void;
  onOpenDriveMode: () => void;
  streakCount?: number;
  xp?: number;
  onOpenSettings?: () => void;
  onOpenWhatsNew?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currentAmbience,
  onToggleAmbience,
  onOpenDriveMode,
  streakCount = 0,
  xp = 0,
  onOpenSettings,
  onOpenWhatsNew
}) => {
  const { t, language } = useLanguage();

  const isTabActive = (itemTab: NavTab) => {
    if (itemTab === 'practice') {
      return currentTab === 'practice' || currentTab === 'wordforge' || currentTab === 'dilemmas';
    }
    return currentTab === itemTab;
  };

  const navItems: { tab: NavTab; label: string; mobileLabel?: string; tooltip: string; icon: React.ReactNode }[] = [
    { 
      tab: 'dashboard', 
      label: t('nav.home'), 
      mobileLabel: language === 'fr' ? 'Aujourd\'hui' : language === 'es' ? 'Hoy' : t('nav.home'),
      tooltip: t('nav.homeTooltip'), 
      icon: <Compass className="w-4 h-4 md:w-4 md:h-4" /> 
    },
    { 
      tab: 'library', 
      label: t('nav.library'), 
      mobileLabel: language === 'fr' ? 'Bible' : language === 'es' ? 'Biblia' : t('nav.library'),
      tooltip: t('nav.libraryTooltip'), 
      icon: <BookOpen className="w-4 h-4 md:w-4 md:h-4" /> 
    },
    { 
      tab: 'practice', 
      label: t('nav.practice'), 
      mobileLabel: language === 'fr' ? 'Pratique' : language === 'es' ? 'Práctica' : t('nav.practice'),
      tooltip: t('nav.practiceTooltip'), 
      icon: <Brain className="w-4 h-4 md:w-4 md:h-4" /> 
    },
    { 
      tab: 'arsenal', 
      label: t('nav.saved'), 
      mobileLabel: language === 'fr' ? 'Favoris' : language === 'es' ? 'Guardados' : t('nav.saved'),
      tooltip: t('nav.savedTooltip'), 
      icon: <Shield className="w-4 h-4 md:w-4 md:h-4" /> 
    },
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP TOP NAVIGATION BAR (Visible on md: screens & up) */}
      {/* ============================================================ */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-ink/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-glow border border-amber-400/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-widest text-stone-900 dark:text-parchment-50 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {t('nav.brand')}
                </span>
                <span className="text-xs font-serif italic text-amber-800 dark:text-amber-400 font-medium">
                  • {t('nav.tagline')}
                </span>
                {onOpenWhatsNew && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playClick();
                      onOpenWhatsNew();
                    }}
                    title={`What's new in ${APP_VERSION}`}
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {APP_VERSION}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Central Nav Tabs */}
          <nav className="flex items-center gap-1 bg-stone-100 dark:bg-stone-950/80 p-1 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner">
            {navItems.map((item) => {
              const isActive = isTabActive(item.tab);
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectTab(item.tab);
                  }}
                  title={item.tooltip}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Guide, Audio, Streak, XP, Language Toggle & Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDriveMode}
              title={t('nav.driveModeTooltip')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 text-xs font-medium transition-all"
            >
              <Car className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('nav.driveMode')}</span>
            </button>

            {/* Ambient Audio Toggle */}
            <button
              onClick={onToggleAmbience}
              title={currentAmbience !== 'none' ? t('nav.ambientPlaying', { ambience: currentAmbience }) : t('nav.ambientTooltip')}
              className={`p-2 rounded-xl border text-xs transition-all ${
                currentAmbience !== 'none'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {currentAmbience !== 'none' ? (
                <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Streak Pill */}
            {streakCount > 0 ? (
              <div 
                title={t('nav.dailyStreak')} 
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold text-orange-800 dark:text-orange-300"
              >
                <Flame className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
                <span>{streakCount}d</span>
              </div>
            ) : (
              <div 
                title={t('nav.dailyStreak')} 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono font-medium text-stone-500 dark:text-stone-400"
              >
                <Flame className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                <span>Fresh start</span>
              </div>
            )}

            {/* XP Badge */}
            <div 
              title={t('nav.scriptureXp')} 
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold text-amber-800 dark:text-amber-300"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{xp} XP</span>
            </div>

            {/* Language Switcher Button */}
            <LanguageToggle />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Desktop Settings Menu Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                if (onOpenSettings) {
                  onOpenSettings();
                } else {
                  window.dispatchEvent(new CustomEvent('testament-open-settings'));
                }
              }}
              title="Settings & Preferences"
              aria-label="Settings"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Visible only on < md screens) */}
      {/* ============================================================ */}
      <nav 
        role="navigation" 
        aria-label="Mobile Navigation" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-ink/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800/90 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg"
      >
        <div className="grid grid-cols-4 items-center w-full max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = isTabActive(item.tab);
            return (
              <button
                key={item.tab}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectTab(item.tab);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-amber-500 w-full min-w-0 ${
                  isActive
                    ? 'text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <div className="shrink-0">
                  {item.icon}
                </div>
                <span className="text-[10px] leading-tight font-medium truncate w-full text-center block mt-0.5">
                  {item.mobileLabel || item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

