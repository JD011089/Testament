import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { getWeeklyRecap, type WeeklyRecapData } from '../utils/weeklyRecap';

interface WeeklyRecapCardProps {
  forceExpanded?: boolean;
}

export const WeeklyRecapCard: React.FC<WeeklyRecapCardProps> = ({ forceExpanded = false }) => {
  const [recap] = useState<WeeklyRecapData>(() => getWeeklyRecap());
  const [isExpanded, setIsExpanded] = useState<boolean>(forceExpanded || recap.isMonday);

  const handleToggle = () => {
    soundEngine.playSnap();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      role="region"
      aria-label="Your week in the story recap"
      className="p-5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 transition-all text-left"
    >
      {/* Header / Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between gap-3 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar aria-hidden="true" className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                {recap.seriesHeroName
                  ? (recap.isMonday ? `Monday Recap • Your Week with ${recap.seriesHeroName}` : `Your Week with ${recap.seriesHeroName}`)
                  : (recap.isMonday ? "Monday Recap • Your Week in the Story" : "Your Week in the Story")}
              </span>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                60-sec read
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              The story so far: 7 days connected in 60 seconds
            </p>
          </div>
        </div>

        <div className="p-1 rounded-lg text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors shrink-0">
          {isExpanded ? (
            <ChevronUp aria-hidden="true" className="w-4 h-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded 60-Second Story Arc */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 space-y-4 animate-in fade-in duration-200">
          {/* Narrative Thread (2-3 sentences) */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border-l-2 border-amber-500 text-xs sm:text-sm font-reading text-stone-800 dark:text-parchment-100 leading-relaxed">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block mb-1">
              The Narrative Thread
            </span>
            {recap.narrativeThread}
          </div>

          {/* 7-Day Timeline: Zero Guilt Language */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 font-bold block">
              The 7-Day Arc
            </span>
            <div className="space-y-1.5">
              {recap.days.map((d) => (
                <div
                  key={d.dateKey}
                  className="flex items-center gap-2.5 text-xs py-1.5 px-2.5 rounded-lg bg-white/60 dark:bg-black/30"
                >
                  {d.isCompleted ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    />
                  ) : (
                    <Circle
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0"
                    />
                  )}
                  <span className="font-reading text-stone-800 dark:text-stone-200 leading-tight flex-1">
                    {d.summaryLine}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Next: Teaser Handoff */}
          <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span className="italic flex items-center gap-1.5">
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-amber-500" />
              <span>Where the story goes next</span>
            </span>
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <span>Tomorrow teaser ready</span>
              <ArrowRight aria-hidden="true" className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
