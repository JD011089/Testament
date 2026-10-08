import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  X, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import { 
  WEEKLY_SERIES 
} from '../data/weeklySeries';
import { 
  getActiveSeriesState, 
  startWeeklySeries, 
  clearActiveSeries, 
  getSeriesDayNumber,
  type ActiveSeriesState 
} from '../utils/weeklySeriesEngine';
import { soundEngine } from '../utils/audio';

interface SeriesPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeriesSelected?: (seriesId: string) => void;
}

export const SeriesPickerModal: React.FC<SeriesPickerModalProps> = ({
  isOpen,
  onClose,
  onSeriesSelected
}) => {
  const [activeState, setActiveState] = useState<ActiveSeriesState | null>(() => getActiveSeriesState());
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const state = getActiveSeriesState();
      setActiveState(state);
      setExpandedSeriesId(state?.seriesId || WEEKLY_SERIES[0].id);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSeries = (seriesId: string) => {
    soundEngine.playClick();
    const newState = startWeeklySeries(seriesId);
    setActiveState(newState);
    if (onSeriesSelected) {
      onSeriesSelected(seriesId);
    }
    onClose();
  };

  const handleClearSeries = () => {
    soundEngine.playSnap();
    clearActiveSeries();
    setActiveState(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="series-picker-title"
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-surface dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Weekly Study Series
                </span>
              </div>
              <h2 id="series-picker-title" className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-100 mt-0.5">
                Go Deep on One Story
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSnap();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle / Anti-Overwhelm Explanation */}
        <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/40 dark:border-amber-900/40 text-xs text-stone-700 dark:text-stone-300">
          Trace one biblical figure across 7 daily decision-moments (Monday to Sunday). Low daily load (one decision a day), high depth through repetition.
        </div>

        {/* Series List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {WEEKLY_SERIES.map((s) => {
            const isCurrentActive = activeState?.seriesId === s.id;
            const isExpanded = expandedSeriesId === s.id;
            const currentDay = isCurrentActive && activeState ? getSeriesDayNumber(activeState) : 1;
            const completedCount = isCurrentActive && activeState ? activeState.completedMomentIds.length : 0;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border transition-all text-left ${
                  isCurrentActive
                    ? 'border-amber-500/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {/* Series Banner Card */}
                <div 
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  onClick={() => {
                    soundEngine.playSnap();
                    setExpandedSeriesId(isExpanded ? null : s.id);
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-stone-100 dark:bg-stone-800 shrink-0">
                      {s.avatarIcon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-parchment-100">
                          {s.title}
                        </h3>
                        {isCurrentActive && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active • Day {currentDay} of 7
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                        {s.hook}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                        <span>7 Moments</span>
                        <span>•</span>
                        <span>{s.weekTheme}</span>
                        {isCurrentActive && (
                          <>
                            <span>•</span>
                            <span className="text-amber-700 dark:text-amber-400 font-bold">
                              {completedCount} completed
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isCurrentActive ? (
                      <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl">
                        In Progress
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSeries(s.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all cursor-pointer shadow-sm"
                      >
                        {activeState ? "Switch to this Series" : "Start Series"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details / 7-Day Timeline */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 space-y-3 animate-in fade-in duration-150">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold block">
                      The 7 Decision Moments
                    </span>
                    <div className="space-y-1.5">
                      {s.moments.map((m) => {
                        const isDone = isCurrentActive && activeState?.completedMomentIds.includes(m.id);
                        const isToday = isCurrentActive && m.dayNumber === currentDay;

                        return (
                          <div 
                            key={m.id}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs ${
                              isToday 
                                ? 'bg-amber-500/15 border border-amber-500/30 font-semibold' 
                                : 'bg-stone-50/70 dark:bg-stone-800/40'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                            )}
                            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
                              Day {m.dayNumber}:
                            </span>
                            <span className="font-reading text-stone-900 dark:text-stone-100 flex-1 truncate">
                              {m.momentTitle}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 shrink-0">
                              {m.reference}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {!isCurrentActive && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSelectSeries(s.id)}
                          className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{activeState ? `Restart with ${s.heroName} (Day 1)` : `Begin Week with ${s.heroName}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Return to Standard Rotation */}
        {activeState && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>Currently studying a weekly series.</span>
            <button
              type="button"
              onClick={handleClearSeries}
              className="text-amber-800 dark:text-amber-400 hover:underline font-mono text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Return to standard daily rotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
