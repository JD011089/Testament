import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Flag } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import type { CuratedPassageBackstory } from '../data/dailyPassages';

interface BackstoryCardProps {
  backstory?: CuratedPassageBackstory;
  passageReference: string;
  heroName: string;
  onReportIssue?: () => void;
}

export const BackstoryCard: React.FC<BackstoryCardProps> = ({
  backstory,
  passageReference,
  heroName,
  onReportIssue
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!backstory) return null;

  const getCategoryLabel = (category: CuratedPassageBackstory['category']) => {
    switch (category) {
      case 'Author':
        return 'Who wrote this?';
      case 'People':
        return 'Who were these people?';
      case 'Culture':
        return 'Why this mattered then';
      case 'Parable':
        return 'What hearers understood';
      default:
        return 'Historical backstory';
    }
  };

  const handleToggle = () => {
    soundEngine.playSnap();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 transition-all text-left">
      {/* Header / Expand trigger button (Collapsed by default, never blocking) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between gap-3 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen aria-hidden="true" className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                {getCategoryLabel(backstory.category)}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 truncate mt-0.5">
              {backstory.title}
            </h4>
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

      {/* Expanded Content: 3-5 sentences, plain language, historically grounded */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 space-y-3 animate-in fade-in duration-200">
          <p className="text-xs sm:text-sm font-reading text-stone-800 dark:text-parchment-100 leading-relaxed">
            {backstory.content}
          </p>

          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1">
            <span>Historical context for {heroName} • {passageReference}</span>
            {onReportIssue && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReportIssue();
                }}
                className="inline-flex items-center gap-1 hover:text-stone-800 dark:hover:text-stone-200 underline-offset-2 hover:underline transition-colors"
              >
                <Flag aria-hidden="true" className="w-3 h-3" />
                <span>Report an issue</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
