import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryVerse } from '../types';
import { getAllVerses } from '../utils/verseRegistry';
import { soundEngine } from '../utils/audio';
import { getDailyVerse } from '../utils/dailyEngine';
import { CalendarRemindersModal } from './CalendarRemindersModal';
import confetti from 'canvas-confetti';
import { recordFSRSReview, getFSRSCard, previewFSRSDays } from '../utils/fsrsEngine';
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
  Brain,
  Clock,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

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

export const splitIntoPhrases = (text: string): string[] => {
  const parts = text.split(/(?<=[,;:!?.\u2014])\s+/);
  const phrases: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const words = trimmed.split(/\s+/);
    if (words.length <= 7) {
      phrases.push(trimmed);
    } else {
      // Chunk long clauses into segments of <= 6 words (≤8 taps)
      for (let i = 0; i < words.length; i += 6) {
        phrases.push(words.slice(i, i + 6).join(' '));
      }
    }
  }

  return phrases.length > 0 ? phrases : [text];
};

const shuffleWordsForPhrase = (phraseText: string, verseId: string, phraseIdx: number): WordItem[] => {
  const words: WordItem[] = phraseText.split(/\s+/).map((word, idx) => ({ 
    id: `${verseId}-p${phraseIdx}-${word}-${idx}`, 
    word,
    originalIndex: idx
  }));
  return [...words].sort(() => Math.random() - 0.5);
};

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
  const { t, language } = useLanguage();
  const [forgeMode, setForgeMode] = useState<'recall' | 'phrases' | 'reveal' | 'full'>('recall');

  // Part 7: Simplified drill — 1 quick fill-in-the-blank recall round per session
  const verseWords = useMemo(() => verse.text.split(/\s+/), [verse.text]);
  const blankIndices = useMemo(() => {
    const STOP_WORDS = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'he', 'she', 'it', 'they', 'we', 'you', 'his', 'her', 'their', 'my', 'your', 'our', 'that', 'this', 'then', 'so', 'as', 'but', 'or', 'if']);
    const eligible: number[] = [];
    verseWords.forEach((w, idx) => {
      const clean = w.replace(/[^\w]/g, '').toLowerCase();
      if (clean.length >= 4 && !STOP_WORDS.has(clean)) {
        eligible.push(idx);
      }
    });
    if (eligible.length <= 2) return eligible.length > 0 ? eligible : [0];
    const half = Math.floor(eligible.length / 2);
    return [eligible[Math.floor(half / 2)], eligible[half + Math.floor((eligible.length - half) / 2)]];
  }, [verseWords]);

  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [activeBlankStep, setActiveBlankStep] = useState<number>(0);
  const [recallError, setRecallError] = useState<string | null>(null);

  const candidateChips = useMemo(() => {
    const missing = blankIndices.map(idx => verseWords[idx]?.replace(/[^\w]/g, '')).filter(Boolean);
    const pool = ['strength', 'courage', 'peace', 'grace', 'wisdom', 'heart', 'light', 'truth'];
    const distractors = pool.filter(p => !missing.some(m => m.toLowerCase() === p.toLowerCase()));
    const combined = [...missing, ...distractors.slice(0, Math.max(0, 4 - missing.length))];
    return combined.sort(() => 0.5 - Math.random());
  }, [blankIndices, verseWords]);

  const phrases = useMemo(() => splitIntoPhrases(verse.text), [verse.text]);
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState<number>(0);
  const [completedPhrases, setCompletedPhrases] = useState<string[]>([]);
  const [revealedPhraseCount, setRevealedPhraseCount] = useState<number>(1);

  const targetWords = useMemo(() => {
    if (forgeMode === 'phrases') {
      return phrases[currentPhraseIdx] ? phrases[currentPhraseIdx].split(/\s+/) : [];
    }
    return verse.text.split(/\s+/);
  }, [forgeMode, phrases, currentPhraseIdx, verse.text]);

  const [assembledWords, setAssembledWords] = useState<WordItem[]>([]);
  const [availableWords, setAvailableWords] = useState<WordItem[]>(() => {
    const firstPhrase = splitIntoPhrases(verse.text)[0] || verse.text;
    return shuffleWordsForPhrase(firstPhrase, verse.id, 0);
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [hasPeeked, setHasPeeked] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fsrsRated, setFsrsRated] = useState<boolean>(false);
  const [scheduledNextDays, setScheduledNextDays] = useState<number | null>(null);

  const handleSelectRecallChip = (word: string) => {
    const targetIdx = blankIndices[activeBlankStep];
    const expectedWord = verseWords[targetIdx]?.replace(/[^\w]/g, '').toLowerCase();
    if (word.toLowerCase() === expectedWord) {
      soundEngine.playSnap();
      const nextFilled = { ...filledBlanks, [targetIdx]: verseWords[targetIdx] };
      setFilledBlanks(nextFilled);
      setRecallError(null);
      if (activeBlankStep + 1 < blankIndices.length) {
        setActiveBlankStep(prev => prev + 1);
      } else {
        // All blanks filled! 1 round, done!
        setIsCompleted(true);
        soundEngine.playVictory();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 }
        });
        if (!fsrsRated) {
          const updated = recordFSRSReview(verse.id, 3);
          setFsrsRated(true);
          setScheduledNextDays(updated.stability);
        }
        onVerseMastered(verse.id);
      }
    } else {
      soundEngine.playClick();
      setRecallError(`Try again for blank #${activeBlankStep + 1}`);
      setTimeout(() => setRecallError(null), 2000);
    }
  };

  const currentFsrs = getFSRSCard(verse.id);
  const [useFirstLetters] = useState(() => getFSRSCard(verse.id).reps === 0);

  const firstLetterOf = (word: string) => {
    const match = word.match(/[A-Za-z0-9]/);
    return match ? match[0] : word.charAt(0);
  };

  const getGhostDisplay = (word: string) => {
    if (word.length <= 1) return word;
    return firstLetterOf(word) + '•'.repeat(Math.min(3, word.length - 1));
  };

  const handleRateFSRS = (rating: 1 | 2 | 3 | 4) => {
    if (fsrsRated) return;
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

  const resetPuzzle = () => {
    soundEngine.playSnap();
    setCurrentPhraseIdx(0);
    setCompletedPhrases([]);
    setRevealedPhraseCount(1);
    setAssembledWords([]);
    setIsCompleted(false);
    setFilledBlanks({});
    setActiveBlankStep(0);
    setRecallError(null);
    setHintLevel(0);
    setIsPeeking(false);
    setHasPeeked(false);
    setFsrsRated(false);
    setScheduledNextDays(null);

    if (forgeMode === 'phrases') {
      const firstPhrase = phrases[0] || verse.text;
      setAvailableWords(shuffleWordsForPhrase(firstPhrase, verse.id, 0));
    } else {
      setAvailableWords(shuffleWords(verse));
    }
  };

  useEffect(() => {
    resetPuzzle();
  }, [verse.id, verse.text, forgeMode]);

  const nextWord = targetWords[assembledWords.length];

  const handleHint = () => {
    if (!nextWord || isCompleted) return;
    soundEngine.playSnap();
    setHintLevel(level => (level >= 2 ? 2 : ((level + 1) as 1 | 2)));
  };

  const handlePeek = () => {
    if (isCompleted) return;
    soundEngine.playClick();
    if (isPeeking) {
      setIsPeeking(false);
      return;
    }
    setIsPeeking(true);
    if (!hasPeeked) {
      const updated = recordFSRSReview(verse.id, 1);
      setHasPeeked(true);
      setFsrsRated(true);
      setScheduledNextDays(updated.stability);
    }
  };

  const handleSelectWord = (item: WordItem) => {
    soundEngine.playSnap();
    const newAssembled = [...assembledWords, item];
    setAssembledWords(newAssembled);
    setAvailableWords(prev => prev.filter(w => w.id !== item.id));
    setHintLevel(0);

    if (forgeMode === 'phrases') {
      if (newAssembled.length === targetWords.length) {
        const isCorrect = newAssembled.map(w => w.word).join(' ') === targetWords.join(' ');
        if (isCorrect) {
          soundEngine.playVictory();
          const nextCompleted = [...completedPhrases, phrases[currentPhraseIdx]];
          setCompletedPhrases(nextCompleted);

          if (currentPhraseIdx < phrases.length - 1) {
            const nextIdx = currentPhraseIdx + 1;
            setCurrentPhraseIdx(nextIdx);
            setAssembledWords([]);
            setAvailableWords(shuffleWordsForPhrase(phrases[nextIdx], verse.id, nextIdx));
          } else {
            // Completed all phrases!
            setIsCompleted(true);
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.75 },
              colors: ['#ea580c', '#f59e0b', '#10b981', '#fbbf24']
            });
            if (!hasPeeked) {
              if (!fsrsRated) {
                const updated = recordFSRSReview(verse.id, 3);
                setFsrsRated(true);
                setScheduledNextDays(updated.stability);
              }
              onVerseMastered(verse.id);
            }
          }
        }
      }
    } else {
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
          if (!hasPeeked) {
            if (!fsrsRated) {
              const updated = recordFSRSReview(verse.id, 3);
              setFsrsRated(true);
              setScheduledNextDays(updated.stability);
            }
            onVerseMastered(verse.id);
          }
        }
      }
    }
  };

  const handleRevealNext = () => {
    soundEngine.playSnap();
    if (revealedPhraseCount < phrases.length) {
      setRevealedPhraseCount(prev => prev + 1);
    } else {
      setIsCompleted(true);
      soundEngine.playVictory();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#ea580c', '#f59e0b', '#10b981', '#fbbf24']
      });
      if (!hasPeeked) {
        if (!fsrsRated) {
          const updated = recordFSRSReview(verse.id, 3);
          setFsrsRated(true);
          setScheduledNextDays(updated.stability);
        }
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
      const spoken = isCompleted
        ? `${verse.reference}. ${verse.text}`
        : `${verse.reference}. ${verse.plainEnglishSummary}`;
      soundEngine.speakVerse(spoken, () => setIsSpeaking(false));
    }
  };

  const isWordCorrectAtIndex = (idx: number) => {
    return assembledWords[idx]?.word === targetWords[idx];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: VERSE CARD & SUMMARY */}
      <div className="lg:col-span-5 space-y-5">
        <div className="p-5 md:p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif font-bold text-amber-800 dark:text-amber-400">
                {verse.reference}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                {verse.translation}
              </span>
              {isMastered && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('forge.mastered')}</span>
                </span>
              )}
              {verse.id === getDailyVerse(0, language).id && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                  <span>{t('forge.dailyTruth')}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSpeak}
                title={isSpeaking ? t('forge.stopSpeech') : t('forge.listen')}
                aria-label={isSpeaking ? t('forge.stopSpeech') : t('forge.listen')}
                className="p-2 rounded-lg bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-amber-600 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-800 dark:text-amber-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleHint}
                disabled={!nextWord || isCompleted || hintLevel >= 2}
                title={t('forge.nudgeHint')}
                aria-label={t('forge.nudgeHint')}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-40 ${
                  hintLevel > 0
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300' 
                    : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{t('forge.hint')}</span>
              </button>
              <button
                onClick={resetPuzzle}
                title={t('forge.resetWords')}
                aria-label={t('forge.resetWords')}
                className="p-2 rounded-lg bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-stone-200/50 dark:bg-stone-950/70 rounded-xl text-xs md:text-sm text-stone-700 dark:text-stone-300 italic">
            "{verse.plainEnglishSummary}"
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-3">
            {useFirstLetters ? t('forge.tilesFirstLetter') : t('forge.tilesMeaning')}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: WORKBENCH & WORD BANK */}
      <div className="lg:col-span-7 space-y-6 relative">
        {/* Memorization Mode Selector (Part 7: 1 quick fill-in-the-blank round by default) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-200/60 dark:bg-stone-900 self-start text-xs font-medium">
          <button
            type="button"
            onClick={() => setForgeMode('recall')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              forgeMode === 'recall' 
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            ⚡ Quick Recall (1 Round)
          </button>
          <button
            type="button"
            onClick={() => setForgeMode('phrases')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              forgeMode === 'phrases' 
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            By Phrase
          </button>
          <button
            type="button"
            onClick={() => setForgeMode('reveal')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              forgeMode === 'reveal' 
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Progressive Reveal
          </button>
          <button
            type="button"
            onClick={() => setForgeMode('full')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              forgeMode === 'full' 
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Full Verse
          </button>
        </div>

        {forgeMode === 'recall' ? (
          /* QUICK RECALL DRILL (1 ROUND MAX, FILL-IN-THE-BLANK) */
          <div className="space-y-4">
            <div className="p-5 md:p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 space-y-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase font-bold text-amber-800 dark:text-amber-400">
                  Quick Recall Drill • 1 Round
                </span>
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  {isCompleted ? '✓ Complete' : `Blank ${activeBlankStep + 1} of ${blankIndices.length}`}
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-ink min-h-[120px] flex items-center">
                <p className="font-reading text-base sm:text-lg leading-relaxed text-stone-900 dark:text-parchment-50">
                  {verseWords.map((w, idx) => {
                    const isBlank = blankIndices.includes(idx);
                    const isLast = idx === verseWords.length - 1;
                    if (!isBlank) {
                      return (
                        <React.Fragment key={idx}>
                          <span>{w}</span>
                          {!isLast && ' '}
                        </React.Fragment>
                      );
                    }
                    const filled = filledBlanks[idx];
                    const isCurrent = blankIndices[activeBlankStep] === idx && !isCompleted;
                    if (filled) {
                      return (
                        <React.Fragment key={idx}>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold underline decoration-emerald-500 underline-offset-4">
                            {filled}
                          </span>
                          {!isLast && ' '}
                        </React.Fragment>
                      );
                    }
                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={`inline-block px-3 py-0.5 rounded-lg font-mono text-xs sm:text-sm transition-all ${
                            isCurrent
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500 animate-pulse'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                          }`}
                        >
                          [ ______ ]
                        </span>
                        {!isLast && ' '}
                      </React.Fragment>
                    );
                  })}
                </p>
              </div>

              {/* Word Bank Chips */}
              {!isCompleted ? (
                <div className="space-y-2.5">
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">
                    Tap the missing word for the highlighted blank:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {candidateChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectRecallChip(chip)}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 dark:hover:bg-amber-400 dark:hover:text-stone-950 text-stone-900 dark:text-parchment-100 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  {recallError && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                      {recallError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/15 text-stone-900 dark:text-parchment-50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono uppercase font-bold text-emerald-800 dark:text-emerald-400 block">
                      ✓ Recall round complete
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      +20 XP • Verse memory locked in.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNextVerse}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Next Verse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : forgeMode === 'reveal' ? (
          /* PROGRESSIVE REVEAL MODE */
          <div className="space-y-4">
            <div className="p-5 md:p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400">
                <span>Phrase {Math.min(revealedPhraseCount, phrases.length)} of {phrases.length}</span>
                <span>{Math.round((Math.min(revealedPhraseCount, phrases.length) / phrases.length) * 100)}%</span>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-ink min-h-[140px] flex flex-col justify-center">
                <p className="font-reading text-lg md:text-xl leading-relaxed text-stone-900 dark:text-parchment-50">
                  {phrases.slice(0, revealedPhraseCount).map((phrase: string, idx: number) => (
                    <span key={idx} className="mr-1.5 animate-fadeIn">
                      {phrase}{' '}
                    </span>
                  ))}
                  {revealedPhraseCount < phrases.length && (
                    <span className="text-stone-400 dark:text-stone-600 select-none">
                      ... [{phrases.length - revealedPhraseCount} more phrase{phrases.length - revealedPhraseCount > 1 ? 's' : ''}]
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevealedPhraseCount(1)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
                >
                  Start Over
                </button>
                <button
                  type="button"
                  onClick={handleRevealNext}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>{revealedPhraseCount < phrases.length ? `Reveal Next Phrase (${revealedPhraseCount + 1}/${phrases.length})` : 'Confirm Mastered'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TILE ASSEMBLY MODE (PHRASES OR FULL) */
          <>
            {nextWord && !isCompleted && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-stone-600 dark:text-stone-300 min-h-[1.25rem]">
                  {hintLevel === 0 && (forgeMode === 'phrases' ? `Assembling phrase ${currentPhraseIdx + 1} of ${phrases.length}` : t('forge.stuckHint'))}
                  {hintLevel === 1 && t('forge.nextLetter', { letter: firstLetterOf(nextWord) })}
                  {hintLevel === 2 && t('forge.nextWordIs', { word: nextWord })}
                </p>
                <button
                  onClick={handlePeek}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    isPeeking
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  {isPeeking ? t('forge.hideVerse') : t('forge.showMe')}
                </button>
              </div>
            )}

            {/* Assembly Work Area */}
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-stone-600 dark:text-stone-400 mb-2 flex items-center justify-between">
                <span>
                  {forgeMode === 'phrases'
                    ? `Phrase ${currentPhraseIdx + 1} of ${phrases.length} (${assembledWords.length}/${targetWords.length} words)`
                    : t('forge.yourForgedVerse', { count: assembledWords.length, total: targetWords.length })}
                </span>
                {assembledWords.length > 0 && (
                  <span className="text-xs text-stone-500 italic">{t('forge.tapToReturn')}</span>
                )}
              </div>

              <div className="min-h-[140px] md:min-h-[160px] p-4 md:p-5 rounded-2xl bg-stone-100/50 dark:bg-ink border border-dashed border-stone-300/70 dark:border-stone-800/70 flex flex-wrap items-center content-start gap-2.5 transition-colors">
                {isPeeking ? (
                  <div className="w-full rounded-xl bg-stone-900 text-white p-4 md:p-5">
                    <p className="text-xs font-mono uppercase tracking-widest text-amber-300 mb-2">{t('forge.showingVerseAgain')}</p>
                    <p className="font-reading text-base md:text-lg italic leading-relaxed text-white">&ldquo;{verse.text}&rdquo;</p>
                  </div>
                ) : (
                  <>
                    {/* Previously completed phrases in phrase mode */}
                    {forgeMode === 'phrases' && completedPhrases.length > 0 && (
                      <div className="w-full pb-2 mb-2 border-b border-stone-200 dark:border-stone-800 flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold mr-1">✓ Completed:</span>
                        {completedPhrases.map((phrase, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-reading">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    )}

                    {assembledWords.length === 0 ? (
                      <div className="w-full text-center text-stone-400 dark:text-stone-500 text-sm py-8 font-reading italic">
                        {forgeMode === 'phrases' 
                          ? `Tap tiles below to assemble phrase ${currentPhraseIdx + 1} (${targetWords.length} words)`
                          : t('forge.tapTilesInOrder')}
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
                            title={t('forge.tapToReturn')}
                            className={`px-3.5 py-2 rounded-xl text-sm md:text-base font-reading font-medium transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
                              isCorrect
                                ? 'bg-amber-100 dark:bg-amber-600/25 text-amber-950 dark:text-parchment-50 hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-900 dark:hover:text-red-200'
                                : 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {item.word}
                          </motion.button>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Available Words Bank (≤8 tiles in phrase mode!) */}
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-stone-600 dark:text-stone-400 mb-2 flex items-center justify-between">
                <span>{useFirstLetters ? t('forge.firstLetterTiles') : t('forge.wordTiles')}</span>
                {forgeMode === 'phrases' && (
                  <span className="text-xs font-mono text-amber-800 dark:text-amber-400">
                    {availableWords.length} words in this phrase
                  </span>
                )}
              </div>
              <div className="p-4 md:p-5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 flex flex-wrap gap-2.5 min-h-[100px] transition-colors">
                {availableWords.map((item) => (
                  <motion.button
                    key={item.id}
                    layout
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectWord(item)}
                    className="px-4 py-2.5 rounded-xl text-sm md:text-base font-reading font-medium bg-white dark:bg-ink-overlay text-stone-900 dark:text-parchment-200 hover:bg-amber-100 dark:hover:bg-stone-800 active:bg-amber-600 active:text-stone-950 focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors shadow-xs"
                  >
                    {useFirstLetters ? getGhostDisplay(item.word) : item.word}
                  </motion.button>
                ))}
                {availableWords.length === 0 && !isCompleted && (
                  <div className="text-xs text-stone-500 dark:text-stone-400 italic py-2">
                    {t('forge.allWordsPlaced')}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Success Card with FSRS Evaluation */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-100/90 via-emerald-50 to-stone-50 dark:from-emerald-950/90 dark:to-stone-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-2">
                <CheckCircle className="w-5 h-5" />
                <span>{hasPeeked || isMastered ? t('forge.verseAssembled') : t('forge.scriptureLocked')}</span>
              </div>
              <p className="text-base md:text-lg font-reading text-stone-900 dark:text-emerald-100 italic mb-3">
                "{verse.text}"
              </p>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mb-3">
                <strong>{t('forge.takeaway')}</strong> {verse.keyTakeaway}
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] text-emerald-900/80 dark:text-emerald-200/80">
                <span className="inline-flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" />
                  {t('forge.stability', { days: currentFsrs.stability })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {t('forge.nextReview', { time: scheduledNextDays ? `in ${scheduledNextDays} days` : currentFsrs.nextReviewDate })}
                </span>
              </div>

              {hasPeeked ? (
                <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                  {t('forge.peekNotice')}
                </p>
              ) : (
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/40 mb-3">
                <div className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300 mb-2 flex items-center justify-between">
                  <span>{t('forge.howEasily')} {fsrsRated && <strong className="text-emerald-600 dark:text-emerald-400">{t('forge.retentionLogged')}</strong>}</span>
                  {scheduledNextDays && (
                    <span className="text-amber-800 dark:text-amber-400 font-bold">{t('forge.scheduledIn', { days: scheduledNextDays })}</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRateFSRS(1)}
                    disabled={fsrsRated}
                    className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-red-500/20 text-[11px] font-medium text-red-700 dark:text-red-300 text-center transition-all disabled:opacity-50"
                  >
                    <div className="font-bold">{t('forge.again')}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{previewFSRSDays(verse.id, 1)}d</div>
                  </button>
                  <button
                    onClick={() => handleRateFSRS(2)}
                    disabled={fsrsRated}
                    className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-amber-500/20 text-[11px] font-medium text-amber-800 dark:text-amber-300 text-center transition-all disabled:opacity-50"
                  >
                    <div className="font-bold">{t('forge.hard')}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{previewFSRSDays(verse.id, 2)}d</div>
                  </button>
                  <button
                    onClick={() => handleRateFSRS(3)}
                    disabled={fsrsRated}
                    className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 text-center transition-all disabled:opacity-50"
                  >
                    <div className="font-bold">{t('forge.good')}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{previewFSRSDays(verse.id, 3)}d</div>
                  </button>
                  <button
                    onClick={() => handleRateFSRS(4)}
                    disabled={fsrsRated}
                    className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-cyan-500/20 text-[11px] font-medium text-cyan-800 dark:text-cyan-300 text-center transition-all disabled:opacity-50"
                  >
                    <div className="font-bold">{t('forge.easy')}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{previewFSRSDays(verse.id, 4)}d</div>
                  </button>
                </div>
              </div>
              )}

              <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/40 flex justify-end">
                <button
                  onClick={onNextVerse}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>{t('forge.next')} →</span>
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
  const { t, language } = useLanguage();
  const allVerses = getAllVerses(language);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);

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
  const [verseNotice, setVerseNotice] = useState<string | null>(null);

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

  const [prevTargetId, setPrevTargetId] = useState<string | null | undefined>(null);

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
      } else {
        setVerseNotice('That verse is not available. Showing the first verse instead.');
        setActiveVerseIndex(0);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-2 md:pb-6 text-left">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">
            <Flame className="w-4 h-4" />
            <span>{t('forge.badge')}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50">
            {t('forge.title')}
          </h1>
          <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1">
            {t('forge.subtitle')}
          </p>
          {verseNotice && (
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-2">{verseNotice}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Quick Controls */}
          <div className="flex md:hidden items-center gap-1.5 mr-1">
            <LanguageToggle compact />
            <ThemeToggle compact />
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsCalendarModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500 hover:text-stone-950 transition-all cursor-pointer"
            title="Daily reminders"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>Daily Reminders</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none" role="tablist" aria-label={t('dilemma.category')}>
        {categories.map(cat => {
          const catLabel = cat === 'All' ? t('forge.all')
            : cat === 'Courage & Facing Giants' ? t('forge.courage')
            : cat === 'Pressure & Anxiety' ? t('forge.pressure')
            : cat === 'Anger & Self-Control' ? t('forge.anger')
            : cat === 'Restoration After Failure' ? t('forge.restoration')
            : cat === 'Endurance & Brotherhood' ? t('forge.endurance')
            : cat;

          return (
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
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {catLabel}
            </button>
          );
        })}
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
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-200/60 dark:border-stone-800/60">
        <button
          onClick={handlePrevVerse}
          className="text-xs font-medium text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200 px-3.5 py-2 rounded-lg bg-stone-200/70 dark:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {t('forge.previousVerse')}
        </button>

        <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-medium">
          {t('forge.verseCount', { current: safeIndex + 1, total: filteredVerses.length })}
        </span>

        <button
          onClick={handleNextVerse}
          className="text-xs font-medium text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {t('forge.nextVerse')}
        </button>
      </div>

      {/* Calendar Reminders Modal */}
      <CalendarRemindersModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        initialType="recall"
        targetVerse={currentVerse}
      />
    </div>
  );
};
