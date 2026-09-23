import React from 'react';
import { 
  Compass, 
  BookOpen, 
  Brain, 
  Shield, 
  ShieldAlert, 
  Car, 
  Volume2, 
  VolumeX, 
  Flame, 
  Award,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

export type NavTab = 'dashboard' | 'library' | 'wordforge' | 'dilemmas' | 'arsenal';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience: () => void;
  onOpenDriveMode: () => void;
  streakCount?: number;
  xp?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currentAmbience,
  onToggleAmbience,
  onOpenDriveMode,
  streakCount = 0,
  xp = 0
}) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Quests', icon: <Compass className="w-4 h-4 md:w-4 md:h-4" /> },
    { tab: 'library', label: 'Library', icon: <BookOpen className="w-4 h-4 md:w-4 md:h-4" /> },
    { tab: 'wordforge', label: 'Word Forge', icon: <Brain className="w-4 h-4 md:w-4 md:h-4" /> },
    { tab: 'dilemmas', label: 'The Play?', icon: <ShieldAlert className="w-4 h-4 md:w-4 md:h-4" /> },
    { tab: 'arsenal', label: 'Arsenal', icon: <Shield className="w-4 h-4 md:w-4 md:h-4" /> },
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP TOP NAVIGATION BAR (Visible on md: screens & up) */}
      {/* ============================================================ */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-[#0a0d13]/90 backdrop-blur-md border-b border-stone-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-glow-amber border border-amber-400/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-base tracking-widest text-parchment-50 group-hover:text-amber-300 transition-colors">
                  TESTAMENT
                </span>
                <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-bold">
                  Tactical
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block -mt-0.5 font-reading">
                Scripture Training Simulator
              </span>
            </div>
          </div>

          {/* Central Nav Tabs */}
          <nav className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-2xl border border-stone-800 shadow-inner">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectTab(item.tab);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Audio, Streak & XP */}
          <div className="flex items-center gap-2.5">
            {/* Drive Mode Button */}
            <button
              onClick={onOpenDriveMode}
              title="Drive & Commute Audio"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 text-xs font-medium transition-all"
            >
              <Car className="w-3.5 h-3.5 text-amber-500" />
              <span>Drive Mode</span>
            </button>

            {/* Ambient Audio Toggle */}
            <button
              onClick={onToggleAmbience}
              title={currentAmbience !== 'none' ? `Playing ${currentAmbience} ambience` : 'Ambient Soundscape'}
              className={`p-2 rounded-xl border text-xs transition-all ${
                currentAmbience !== 'none'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {currentAmbience !== 'none' ? (
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Streak Pill */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono font-bold text-orange-400">
              <Flame className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
              <span>{streakCount}d</span>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono font-bold text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{xp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (Visible only on < md screens) */}
      {/* ============================================================ */}
      <nav 
        role="navigation" 
        aria-label="Mobile Navigation" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f14]/95 backdrop-blur-lg border-t border-stone-800/90 px-3 py-2"
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectTab(item.tab);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {item.icon}
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}

          {/* Mobile Drive Audio button */}
          <button
            onClick={onOpenDriveMode}
            title="Drive & Commute Audio"
            aria-label="Drive and Commute Audio"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 py-1 px-2 rounded-xl text-stone-400 hover:text-amber-400 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Car className="w-4 h-4" />
            <span className="text-[10px]">Drive</span>
          </button>
        </div>
      </nav>
    </>
  );
};
