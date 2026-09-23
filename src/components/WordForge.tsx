import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryVerse } from '../types';
import { getAllVerses } from '../utils/verseRegistry';
import { soundEngine } from '../utils/audio';
import { getDailyVerse } from '../utils/dailyEngine';
import { MemoryPulseModal } from './MemoryPulseModal';
import confetti from 'canvas-confetti';
import { recordFSRSReview, getFSRSCard } from '../utils/fsrsEngine';
import { 
  RotateCcw, 
  Eye, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Bell,
  Layers,
  Brain,
  Clock
} from 'lucide-react';

interface WordItem {
  id: string;
  word: string;
  originalIndex: number;
}

interface WordForgeProps {
  memorizedVerses: string[];
  onVerseMastered: (verseId: string) => void;
  targetVerseId?: string | null;
  onClearTargetVerse?: () => void;
}

interface PuzzleWorkbenchProps {
  verse: MemoryVerse;
  isMastered: boolean;
  onVerseMastered: (verseId: string) => void;
  onNextVerse: () => void;
}

const shuffleWords = (verse: MemoryVerse): WordItem[] => {
  const words: WordItem[] = verse.text.split(/\s+/).map((word, idx) => ({ 
    id: `${verse.id}-${word}-${idx}`, 
    word,
    originalIndex: idx
  }));
  return [...words].sort(() => Math.random() - 0.5);
};

const PuzzleWorkbench: React.FC<PuzzleWorkbenchProps> = ({
  verse,
  isMastered,
  onVerseMastered,
  onNextVerse
}) => {
  const targetWords = verse.text.split(/\s+/);
  const [assembledWords, setAssembledWords] = useState<WordItem[]>([]);
  const [availableWords, setAvailableWords] = useState<WordItem[]>(() => shuffleWords(verse));
  // Scaffolding mode: 'builder' | 'ghost' | 'blind'
  const [scaffoldMode, setScaffoldMode] = useState<'builder' | 'ghost' | 'blind'>('builder');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fsrsRated, setFsrsRated] = useState<boolean>(false);
  const [scheduledNextDays, setScheduledNextDays] = useState<number | null>(null);

  // Helper to get ghost representation of a word
  const getGhostDisplay = (w: string) => {
    if (w.length <= 1) return w;
    return w[0] + '•'.repeat(Math.min(3, w.length - 1));
  };

  const handleRateFSRS = (rating: 1 | 2 | 3 | 4) => {
    soundEngine.playSnap();
    const updated = recordFSRSReview(verse.id, rating);
    setScheduledNextDays(updated.stability);
    setFsrsRated(true);
  };

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const currentFsrs = getFSRSCard(verse.id);

  useEffect(() => {
    resetPuzzle();
  }, [verse.id]);

  const resetPuzzle = () => {
    soundEngine.playSnap();
    setAvailableWords(shuffleWords(verse));
    setAssembledWords([]);
    setIsCompleted(false);
    setShowHint(false);
    setFsrsRated(false);
    setScheduledNextDays(null);
  };

  const getTileLabel = (word: string, isAvailable = false) => {
    if (scaffoldMode === 'builder') return word;
    if (scaffoldMode === 'ghost') return isAvailable ? word : getGhostDisplay(word);
    if (scaffoldMode === 'blind') return isAvailable ? word : '???';
    return word;
  };

  const handleSelectWord = (item: WordItem) => {
    soundEngine.playSnap();
    const newAssembled = [...assembledWords, item];
    setAssembledWords(newAssembled);
    setAvailableWords(prev => prev.filter(w => w.id !== item.id));

    if (newAssembled.length === targetWords.length) {
      const isCorrect = newAssembled.map(w => w.word).join(' ') === targetWords.join(' ');
      if (isCorrect) {
        setIsCompleted(true);
        soundEngine.playVictory();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#ea580c', '#f59e0b', '#10b981', '#fbbf24']
        });
        onVerseMastered(verse.id);
      }
    }
  };

  const handleRemoveWord = (indexToRemove: number) => {
    soundEngine.playClick();
    const itemToRemove = assembledWords[indexToRemove];
    const newAssembled = assembledWords.filter((_, idx) => idx !== indexToRemove);
    setAssembledWords(newAssembled);
    setAvailableWords(prev => [...prev, itemToRemove]);
    setIsCompleted(false);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      soundEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundEngine.speakVerse(
        `${verse.reference}. ${verse.text}. ${verse.plainEnglishSummary}`,
        () => setIsSpeaking(false)
      );
    }
  };

  const isWordCorrectAtIndex = (idx: number) => {
    return assembledWords[idx]?.word === targetWords[idx];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: VERSE CARD & SUMMARY */}
      <div className="lg:col-span-5 space-y-5">
        <div className="p-5 md:p-6 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif font-bold text-amber-400">
                {verse.reference}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">
                {verse.translation}
              </span>
              {isMastered && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Mastered</span>
                </span>
              )}
              {verse.id === getDailyVerse().id && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Daily Truth</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSpeak}
                title={isSpeaking ? "Stop speech" : "Listen to verse"}
                aria-label={isSpeaking ? "Stop speech" : "Listen to verse"}
                className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setShowHint(!showHint);
                }}
                title={showHint ? "Hide full verse hint" : "Show full verse hint"}
                aria-label={showHint ? "Hide full verse hint" : "Show full verse hint"}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  showHint 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                    : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Hint</span>
              </button>
              <button
                onClick={resetPuzzle}
                title="Reset puzzle words"
                aria-label="Reset puzzle words"
                className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800 text-xs md:text-sm text-stone-300 italic mb-3">
            "{verse.plainEnglishSummary}"
          </div>

          <div className="text-xs text-stone-400 mb-3">
            <strong className="text-amber-400">Takeaway for Today: </strong>
            {verse.keyTakeaway}
          </div>

          {/* FSRS Retention Stats Widget */}
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>Cognitive Stability: <strong className="text-stone-200">{currentFsrs.stability} days</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next Review: <strong className="text-stone-200">{currentFsrs.nextReviewDate}</strong></span>
            </div>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 text-xs text-amber-200 font-reading leading-relaxed"
              >
                <strong>Full Verse Reference: </strong> {verse.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT COLUMN: WORKBENCH & WORD BANK */}
      <div className="lg:col-span-7 space-y-6">
        {/* Scaffolding Mode Selector */}
        <div className="flex items-center justify-between bg-stone-900/80 p-1.5 rounded-xl border border-stone-800">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-400 px-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScaffoldMode('builder')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                scaffoldMode === 'builder'
                  ? 'bg-amber-600 text-black font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              1. Builder
            </button>
            <button
              onClick={() => setScaffoldMode('ghost')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                scaffoldMode === 'ghost'
                  ? 'bg-amber-600 text-black font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              2. Ghost Letters
            </button>
            <button
              onClick={() => setScaffoldMode('blind')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                scaffoldMode === 'blind'
                  ? 'bg-amber-600 text-black font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              3. Blind Recall
            </button>
          </div>
        </div>

        {/* Assembly Work Area */}
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2 flex items-center justify-between">
            <span>Your Forged Verse ({assembledWords.length}/{targetWords.length} words)</span>
            {assembledWords.length > 0 && (
              <span className="text-[11px] text-stone-500 italic">Tap any word to return it</span>
            )}
          </div>

          <div className="min-h-[140px] md:min-h-[160px] p-4 md:p-5 rounded-2xl bg-[#0b0e12] border-2 border-dashed border-stone-800 flex flex-wrap items-center content-start gap-2.5 shadow-inner">
            {assembledWords.length === 0 ? (
              <div className="w-full text-center text-stone-500 text-sm py-10 font-reading italic">
                {scaffoldMode === 'builder' && 'Tap the word tiles below to forge the scripture...'}
                {scaffoldMode === 'ghost' && 'Assemble the verse using first-letter anchors...'}
                {scaffoldMode === 'blind' && 'Blind reconstruction active: test pure recall...'}
              </div>
            ) : (
              assembledWords.map((item, idx) => {
                const isCorrect = isWordCorrectAtIndex(idx);
                return (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => handleRemoveWord(idx)}
                    title="Tap to return word to bank"
                    className={`px-3.5 py-2 rounded-xl text-sm md:text-base font-reading font-medium transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isCorrect
                        ? 'bg-amber-600/25 border border-amber-500/80 text-parchment-50 hover:bg-red-950/40 hover:border-red-500'
                        : 'bg-red-950/40 border border-red-500 text-red-200'
                    }`}
                  >
                    {item.word}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Available Words Bank */}
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-2">
            Available Words ({scaffoldMode})
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-wrap gap-2.5 min-h-[120px]">
            {availableWords.map((item) => (
              <motion.button
                key={item.id}
                layout
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectWord(item)}
                className="px-4 py-2.5 rounded-xl text-sm md:text-base font-reading font-medium bg-[#1a1f29] border border-stone-700 text-parchment-200 hover:border-amber-500 hover:bg-stone-800 shadow-sm active:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {getTileLabel(item.word, true)}
              </motion.button>
            ))}
            {availableWords.length === 0 && !isCompleted && (
              <div className="text-xs text-stone-400 italic py-2">
                All words placed. Check the sequence above!
              </div>
            )}
          </div>
        </div>

        {/* Success Card with FSRS Evaluation */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-stone-900 border-2 border-emerald-500/50 shadow-glow-gold text-left"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <CheckCircle className="w-5 h-5" />
                <span>Scripture Locked in Memory! (+40 XP)</span>
              </div>
              <p className="text-base md:text-lg font-reading text-emerald-100 italic mb-3">
                "{verse.text}"
              </p>
              <div className="text-xs text-emerald-300 font-medium mb-4">
                <strong>Takeaway for Today: </strong> {verse.keyTakeaway}
              </div>

              {/* FSRS Self-Assessment */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-800/40 mb-3">
                <div className="text-xs font-mono font-medium text-emerald-300 mb-2 flex items-center justify-between">
                  <span>How easily did you recall this verse? {fsrsRated && <strong className="text-emerald-400">✓ Retention Logged</strong>}</span>
                  {scheduledNextDays && (
                    <span className="text-amber-400 font-bold">Scheduled in {scheduledNextDays} days</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRateFSRS(1)}
                    className="p-2 rounded-lg bg-stone-900 border border-red-800/60 hover:border-red-500 text-[11px] font-medium text-red-300 text-center transition-all"
                  >
                    <div className="font-bold">Again</div>
                    <div className="text-[10px] text-stone-400">1 day</div>
                  </button>
                  <button
                    onClick={() => handleRateFSRS(2)}
                    className="p-2 rounded-lg bg-stone-900 border border-amber-800/60 hover:border-amber-500 text-[11px] font-medium text-amber-300 text-center transition-all"
                  >
                    <div className="font-bold">Hard</div>
                    <div className="text-[10px] text-stone-400">2-3 days</div>
                  </button>
                  <button
                    onClick={() => handleRateFSRS(3)}
                    className="p-2 rounded-lg bg-stone-900 border border-emerald-800/60 hover:border-emerald-500 text-[11px] font-medium text-emerald-300 text-center transition-all"
                  >
                    <div className="font-bold">Good</div>
                    <div className="text-[10px] text-stone-400">4-7 days</div>
                  </button>
                  <button
                    onClick={() => handleRateFSRS(4)}
                    className="p-2 rounded-lg bg-stone-900 border border-cyan-800/60 hover:border-cyan-500 text-[11px] font-medium text-cyan-300 text-center transition-all"
                  >
                    <div className="font-bold">Easy</div>
                    <div className="text-[10px] text-stone-400">14+ days</div>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/40 flex justify-end">
                <button
                  onClick={onNextVerse}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Next Verse</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const WordForge: React.FC<WordForgeProps> = ({ 
  memorizedVerses, 
  onVerseMastered,
  targetVerseId,
  onClearTargetVerse
}) => {
  const allVerses = getAllVerses();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMemoryPulseOpen, setIsMemoryPulseOpen] = useState<boolean>(false);

  const findVerseIndex = (targetId: string | null | undefined, list: MemoryVerse[]): number => {
    if (!targetId) return -1;
    return list.findIndex(v => 
      v.id === targetId || 
      v.actId === targetId || 
      v.id === `story-${targetId}`
    );
  };

  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(() => {
    if (targetVerseId) {
      const idx = findVerseIndex(targetVerseId, allVerses);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const categories = [
    'All',
    'Courage & Facing Giants',
    'Pressure & Anxiety',
    'Anger & Self-Control',
    'Restoration After Failure',
    'Endurance & Brotherhood'
  ];

  const filteredVerses = selectedCategory === 'All' 
    ? allVerses 
    : allVerses.filter(v => v.category === selectedCategory);

  const safeIndex = activeVerseIndex >= filteredVerses.length ? 0 : activeVerseIndex;
  const currentVerse: MemoryVerse = filteredVerses[safeIndex] || allVerses[0];

  const [prevTargetId, setPrevTargetId] = useState<string | null | undefined>(targetVerseId);

  if (targetVerseId && targetVerseId !== prevTargetId) {
    setPrevTargetId(targetVerseId);
    const verseIdx = findVerseIndex(targetVerseId, filteredVerses);
    if (verseIdx !== -1) {
      setActiveVerseIndex(verseIdx);
      if (onClearTargetVerse) onClearTargetVerse();
    } else {
      const allIdx = findVerseIndex(targetVerseId, allVerses);
      if (allIdx !== -1) {
        setSelectedCategory('All');
        setActiveVerseIndex(allIdx);
        if (onClearTargetVerse) onClearTargetVerse();
      }
    }
  }

  const handleNextVerse = () => {
    soundEngine.playClick();
    soundEngine.stopSpeaking();
    setActiveVerseIndex(prev => (prev + 1) % filteredVerses.length);
  };

  const handlePrevVerse = () => {
    soundEngine.playClick();
    soundEngine.stopSpeaking();
    setActiveVerseIndex(prev => (prev - 1 + filteredVerses.length) % filteredVerses.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-36 sm:pb-40 md:pb-48 text-left">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-500 mb-1">
            <Flame className="w-4 h-4" />
            <span>The Word Forge • Scripture Retention</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-black text-parchment-50">
            Lock Truth Into Memory
          </h1>
          <p className="text-xs md:text-sm text-stone-400 mt-1">
            Tactile word assembly designed for adult retention. Assemble the verse by tapping words in sequence.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsMemoryPulseOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-600 hover:text-black transition-all shadow-glow-amber"
          title="Set this verse as your daily memory challenge"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Train This Verse (Reminders)</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none" role="tablist" aria-label="Verse categories">
        {categories.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory(cat);
              setActiveVerseIndex(0);
            }}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
              selectedCategory === cat
                ? 'bg-amber-600 text-black font-bold shadow-sm'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Keyed Workbench that resets cleanly on verse change */}
      <PuzzleWorkbench 
        key={currentVerse.id}
        verse={currentVerse}
        isMastered={memorizedVerses.includes(currentVerse.id)}
        onVerseMastered={onVerseMastered}
        onNextVerse={handleNextVerse}
      />

      {/* Pager Controls */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-800">
        <button
          onClick={handlePrevVerse}
          className="text-xs font-medium text-stone-400 hover:text-stone-200 px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Previous Verse
        </button>

        <span className="text-xs font-mono text-stone-400">
          Verse {safeIndex + 1} of {filteredVerses.length}
        </span>

        <button
          onClick={handleNextVerse}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 px-3.5 py-2 rounded-lg bg-stone-900 border border-amber-900/40 focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Next Verse
        </button>
      </div>

      {/* Memory Pulse Modal */}
      <MemoryPulseModal
        isOpen={isMemoryPulseOpen}
        onClose={() => setIsMemoryPulseOpen(false)}
        targetVerse={currentVerse}
      />
    </div>
  );
};
