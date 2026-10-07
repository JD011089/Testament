import React, { useState } from 'react';
import { Lock, Clock, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { getTomorrowTeaser, type TomorrowTeaserData } from '../utils/tomorrowTeaser';

export const TomorrowTeaserCard: React.FC = () => {
  const [teaser] = useState<TomorrowTeaserData>(() => getTomorrowTeaser());
  const [showLockedMessage, setShowLockedMessage] = useState<boolean>(false);

  const handleCardTap = () => {
    soundEngine.playSnap();
    setShowLockedMessage(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardTap();
    }
  };

  return (
    <div
      onClick={handleCardTap}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Tomorrow's mission preview"
      className="group relative p-5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 transition-all hover:border-amber-500/40 cursor-pointer overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-amber-500/60"
    >
      {/* Top row: Lock indicator, unlock time, AI reflection badge */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lock aria-hidden="true" className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-700 dark:text-stone-300 font-bold">
            Tomorrow • {teaser.heroName}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded-full">
            <Clock aria-hidden="true" className="w-2.5 h-2.5" />
            <span>{teaser.unlockLabel}</span>
          </span>
        </div>

        <span
          className="text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800/70 px-2 py-0.5 rounded-full shrink-0"
          role="note"
          aria-label="AI reflection, Not Scripture"
        >
          <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
        </span>
      </div>

      {/* The Hook: Tension without spoiler */}
      <p className="text-xs sm:text-sm font-serif italic text-stone-800 dark:text-parchment-100 leading-relaxed pr-2">
        "{teaser.hook}"
      </p>

      {/* Inline friendly locked notice (Zero Modals!) */}
      {showLockedMessage && (
        <div 
          role="status" 
          aria-live="polite"
          className="mt-3.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowLockedMessage(false);
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Not yet — this one's still being prepared. See you tomorrow!</span>
          </div>
          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Dismiss
          </span>
        </div>
      )}

      {/* Subtle lock footer hint */}
      {!showLockedMessage && (
        <div className="mt-3 pt-2 border-t border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span>Unlocks at local midnight</span>
          <span className="font-mono text-[10px] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            Locked until tomorrow →
          </span>
        </div>
      )}
    </div>
  );
};
