import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Eye, 
  EyeOff, 
  Calendar, 
  BookMarked,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';
import { soundEngine } from '../utils/audio';
import type { ReciterVerseState, KnownVerseEntry } from '../types/learnerModes';
import { completeReciterDay } from '../utils/learnerModes';
import { CalendarRemindersModal } from './CalendarRemindersModal';

interface ReciterModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseState: ReciterVerseState;
  knownVerses: KnownVerseEntry[];
  onProgressUpdated: () => void;
  onRewardXP?: (xp: number) => void;
  todayDateStr: string;
}

export const ReciterModal: React.FC<ReciterModalProps> = ({
  isOpen,
  onClose,
  verseState,
  knownVerses,
  onProgressUpdated,
  onRewardXP,
  todayDateStr
}) => {
  const modalRef = useModalLock(isOpen);
  const [activeTab, setActiveTab] = useState<'practice' | 'known'>('practice');
  const [revealedPhrases, setRevealedPhrases] = useState<Record<number, boolean>>({});
  const [ratings, setRatings] = useState<Record<number, 'got_it' | 'missed_it'>>({});
  const [isDayCompleted, setIsDayCompleted] = useState<boolean>(() => {
    return Boolean(verseState.completedDays[verseState.dayNumber]);
  });
  const [justMastered, setJustMastered] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const dayNumber = verseState.dayNumber; // 1 to 7
  const phrases = verseState.phrases;
  const loopBacks = verseState.loopBackPhraseIndices || [];

  // Determine which phrases are tested today based on cumulative chaining
  // Day 1: full verse read out loud (phrases 0..all)
  // Day 2: phrase 0
  // Day 3: phrases 0..1
  // Day 4: phrases 0..2
  // Day 5: phrases 0..3
  // Day 6: phrases 0..min(4, total - 1)
  // Day 7: full test (phrases 0..total - 1)
  const phrasesToReciteIndices: number[] = [];
  if (dayNumber === 1 || dayNumber === 7) {
    for (let i = 0; i < phrases.length; i++) phrasesToReciteIndices.push(i);
  } else {
    const count = Math.min(phrases.length, dayNumber - 1);
    for (let i = 0; i < count; i++) phrasesToReciteIndices.push(i);
  }

  // Include any loop-back phrases from previous days if not already in list
  loopBacks.forEach(idx => {
    if (idx < phrases.length && !phrasesToReciteIndices.includes(idx)) {
      phrasesToReciteIndices.push(idx);
    }
  });
  phrasesToReciteIndices.sort((a, b) => a - b);

  const toggleReveal = (idx: number) => {
    soundEngine.playSnap();
    setRevealedPhrases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const setPhraseRating = (idx: number, rating: 'got_it' | 'missed_it') => {
    if (rating === 'got_it') soundEngine.playClick();
    else soundEngine.playSnap();
    setRatings(prev => ({ ...prev, [idx]: rating }));
  };

  const handleFinishDay = () => {
    const reps = phrasesToReciteIndices.map(idx => ({
      phraseIndex: idx,
      rating: ratings[idx] || 'got_it'
    }));

    const result = completeReciterDay(dayNumber, reps, todayDateStr);
    setIsDayCompleted(true);
    onProgressUpdated();
    
    if (result.verseCompleted) {
      soundEngine.playVictory();
      setJustMastered(true);
      onRewardXP?.(100);
    } else {
      soundEngine.playClick();
      onRewardXP?.(25);
    }
  };

  const allRated = dayNumber === 1 || phrasesToReciteIndices.every(idx => ratings[idx] !== undefined);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reciter-modal-title"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 my-auto text-left relative flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-800/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                Reciter Mode • Verse of the Week
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Day {dayNumber} of 7
              </span>
            </div>
            <h2 id="reciter-modal-title" className="text-xl font-serif font-black text-stone-900 dark:text-parchment-50 mt-0.5">
              {verseState.reference}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-parchment-50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close reciter"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Today's Reps vs Known Verses */}
        <div className="flex items-center gap-2 my-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Today's Practice (Day {dayNumber})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('known')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'known'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <BookMarked aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Known Verses ({knownVerses.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'practice' ? (
            <>
              {/* Day 1: Verbatim Read Prompt */}
              {dayNumber === 1 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        Day 1 Mission: Read it out loud
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md font-bold">
                        Scripture (Verbatim)
                      </span>
                    </div>
                    <p className="text-base font-serif italic text-stone-900 dark:text-parchment-50 leading-relaxed">
                      "{verseState.text}"
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-3">
                      Recite this entire verse aloud 2 or 3 times right now. Get the cadence, rhythm, and breath into your mouth before chaining tomorrow.
                    </p>
                  </div>
                </div>
              )}

              {/* Days 2-7: Cumulative Chaining */}
              {dayNumber > 1 && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-850/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-50 block">
                        {dayNumber === 7 ? 'Full Recitation Test' : `Cumulative Chain (Lines 1 to ${phrasesToReciteIndices.length})`}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Recite from memory, tap to check, then grade your rep.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-bold">
                      Scripture (Verbatim)
                    </span>
                  </div>

                  {/* Loop-back notice if any phrases were queued */}
                  {loopBacks.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-2 text-xs text-orange-900 dark:text-orange-300">
                      <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0 text-orange-500" />
                      <span>Loop-back active: We inserted previous missed phrases for an extra rep.</span>
                    </div>
                  )}

                  {/* Phrases List with Self-Grading */}
                  <div className="space-y-2.5">
                    {phrasesToReciteIndices.map((phraseIndex, position) => {
                      const phrase = phrases[phraseIndex];
                      const isRevealed = revealedPhrases[phraseIndex];
                      const rating = ratings[phraseIndex];
                      const isLoopBack = loopBacks.includes(phraseIndex);

                      return (
                        <div 
                          key={phraseIndex}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            rating === 'got_it'
                              ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                              : rating === 'missed_it'
                              ? 'border-orange-500/40 bg-orange-500/5 dark:bg-orange-950/20'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono font-bold text-stone-500 dark:text-stone-400">
                              Phrase {position + 1} of {phrasesToReciteIndices.length} {isLoopBack ? '(Loop-back)' : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleReveal(phraseIndex)}
                              className="text-[11px] font-serif font-medium text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {isRevealed ? (
                                <>
                                  <EyeOff aria-hidden="true" className="w-3.5 h-3.5" />
                                  <span>Hide text</span>
                                </>
                              ) : (
                                <>
                                  <Eye aria-hidden="true" className="w-3.5 h-3.5" />
                                  <span>Tap to reveal</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Reveal Area */}
                          <div className="min-h-[38px] flex items-center">
                            {isRevealed ? (
                              <p className="text-sm sm:text-base font-serif italic text-stone-900 dark:text-parchment-50 leading-snug">
                                "{phrase}"
                              </p>
                            ) : (
                              <p className="text-xs text-stone-400 dark:text-stone-500 italic">
                                [Recite this phrase aloud from memory, then tap reveal]
                              </p>
                            )}
                          </div>

                          {/* Self-Grade Actions */}
                          <div className="mt-3 pt-2.5 border-t border-stone-200/50 dark:border-stone-800/50 flex items-center justify-end gap-2">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 mr-auto">
                              Self-grade:
                            </span>
                            <button
                              type="button"
                              onClick={() => setPhraseRating(phraseIndex, 'missed_it')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                rating === 'missed_it'
                                  ? 'bg-orange-500 text-stone-950 font-bold'
                                  : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-500/20'
                              }`}
                            >
                              Missed it
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhraseRating(phraseIndex, 'got_it')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                rating === 'got_it'
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-600/20'
                              }`}
                            >
                              Got it
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Just Mastered Celebration (Day 7) */}
              {justMastered && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/40 text-stone-900 dark:text-parchment-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                    <CheckCircle2 aria-hidden="true" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold block">
                      Verse Mastered & Retired to Known Verses!
                    </span>
                    <p className="text-xs text-stone-700 dark:text-parchment-200 mt-0.5">
                      {verseState.reference} is permanently in your retention vault. Your next weekly verse is unlocked.
                    </p>
                  </div>
                </div>
              )}

              {/* Calendar Reminder Link */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 flex items-center justify-between gap-3 text-xs">
                <span className="text-stone-700 dark:text-stone-300">
                  Keep your ritual sharp with a daily recitation calendar reminder.
                </span>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="btn-primary shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Calendar aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Set time</span>
                </button>
              </div>
            </>
          ) : (
            /* Known Verses Collection View */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-850/60">
                <span className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-50 block">
                  Known Verses Vault ({knownVerses.length})
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Scripture committed to memory through full 7-day recitation cycles.
                </span>
              </div>

              {knownVerses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-500 text-xs">
                  No retired verses yet. Complete Day 7 of your first weekly verse to move it here!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {knownVerses.map((v) => (
                    <div 
                      key={v.verseId}
                      className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-stone-900 dark:text-parchment-50 text-sm">
                          {v.reference}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                          Mastered
                        </span>
                      </div>
                      <p className="text-xs font-serif italic text-stone-700 dark:text-parchment-200 leading-relaxed">
                        "{v.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-2 border-t border-stone-200/70 dark:border-stone-800/70 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {isDayCompleted ? '✓ Today\'s rep saved on-device' : 'Zero guilt: a pause never resets your week.'}
          </span>
          <div className="flex items-center gap-2">
            {!isDayCompleted ? (
              <button
                type="button"
                disabled={!allRated}
                onClick={handleFinishDay}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  allRated
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Complete Day {dayNumber} Rep</span>
                <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      <CalendarRemindersModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        initialType="recall"
      />
    </div>
  );
};
