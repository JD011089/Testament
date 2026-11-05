import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import { buildTriviaBank, pickRunFromBank, type TriviaQuestion } from '../utils/triviaEngine';
import { getVerseById } from '../utils/verseRegistry';
import { getDailyVerse } from '../utils/dailyEngine';
import { getDueFSRSCards, recordFSRSReview } from '../utils/fsrsEngine';
import { usePracticeStrings } from './practice/strings';
import {
  Gamepad2,
  Heart,
  Trophy,
  Flame,
  Timer,
  Zap,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Crown,
  Sparkles,
  ChevronLeft,
  Play,
  BookOpen
} from 'lucide-react';

const QUESTIONS_PER_RUN = 10;
const STARTING_LIVES = 3;
const HIGH_SCORE_KEY = 'testament_trivia_highscore';
const BEST_COMBO_KEY = 'testament_trivia_best_combo';
const MISSED_KEY = 'testament_trivia_missed';
const DAILY_XP_KEY_PREFIX = 'testament_trivia_xp_';
const MAX_DAILY_GAME_XP = 300;
const RUN_KEY = 'testament_trivia_run';
const MODE_KEY = 'testament_trivia_mode';
const RELAXED_SECONDS = 20;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readDailyGameXp(): number {
  try {
    return Number(localStorage.getItem(`${DAILY_XP_KEY_PREFIX}${todayKey()}`)) || 0;
  } catch {
    return 0;
  }
}

function addDailyGameXp(amount: number): void {
  try {
    localStorage.setItem(`${DAILY_XP_KEY_PREFIX}${todayKey()}`, String(readDailyGameXp() + amount));
  } catch {
    // ignore quota failures
  }
}

type Phase = 'intro' | 'playing' | 'result';
type Outcome = 'victory' | 'defeat' | null;
type GameMode = 'relaxed' | 'arcade';

interface Answered {
  pickedIndex: number | null;
  correct: boolean;
  earned: number;
}

interface SavedRun {
  questions: TriviaQuestion[];
  index: number;
  score: number;
  lives: number;
  combo: number;
  bestCombo: number;
  correctCount: number;
  attempted: number;
  runMissed: string[];
  thisRunMissed: string[];
  mode: GameMode;
}

interface TriviaGauntletProps {
  onRewardXP?: (amount: number) => void;
  onStudyVerse?: (reference: string) => void;
  /** Leave the game (back to Practice). */
  onExit?: () => void;
}

function timeForIndex(index: number, mode: GameMode): number {
  if (mode === 'relaxed') return RELAXED_SECONDS;
  const base = Math.max(6, 13 - index);
  const isBoss = index === QUESTIONS_PER_RUN - 1;
  return isBoss ? base + 5 : base;
}

function readMode(): GameMode {
  try {
    return localStorage.getItem(MODE_KEY) === 'arcade' ? 'arcade' : 'relaxed';
  } catch {
    return 'relaxed';
  }
}

function writeMode(mode: GameMode): void {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function readSavedRun(): SavedRun | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedRun;
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
    if (typeof parsed.index !== 'number' || parsed.index < 0 || parsed.index >= parsed.questions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearSavedRun(): void {
  try {
    localStorage.removeItem(RUN_KEY);
  } catch {
    // ignore
  }
}

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

function readMissed(): string[] {
  try {
    const raw = localStorage.getItem(MISSED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export const TriviaGauntlet: React.FC<TriviaGauntletProps> = ({ onRewardXP, onStudyVerse, onExit }) => {
  const { language } = useLanguage();
  const s = usePracticeStrings();

  const bank = useMemo(() => buildTriviaBank(language), [language]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeTotal, setTimeTotal] = useState(1);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [newBest, setNewBest] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => readNumber(HIGH_SCORE_KEY));
  const [bestComboEver, setBestComboEver] = useState<number>(() => readNumber(BEST_COMBO_KEY));
  const [missedIds, setMissedIds] = useState<string[]>(() => readMissed());
  const [attempted, setAttempted] = useState(0);
  const [runMissed, setRunMissed] = useState<string[]>([]);
  const [thisRunMissed, setThisRunMissed] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<GameMode>(() => readMode());
  const [savedRun, setSavedRun] = useState<SavedRun | null>(() => readSavedRun());
  const answerLock = useRef(false);
  const revealRef = useRef<HTMLDivElement | null>(null);

  const question = questions[index];
  // Only offer the Practice link when the reference resolves to a verse we actually have.
  const practiceReference = useMemo(() => {
    if (!question?.scripture) return null;
    return getVerseById(question.scripture.reference, language)?.reference ?? null;
  }, [question, language]);
  const isBoss = index === questions.length - 1 && questions.length > 0;
  // The badge marks a question that came back from an earlier run, not one just missed.
  const isReviewQuestion = Boolean(question && runMissed.includes(question.id));

  // Question ids tied to today's mission verse and to verses currently due for review,
  // so a run always mixes in what the player is working on right now.
  const todayQuestionIds = useMemo(() => {
    const references = new Set<string>();
    try {
      references.add(getDailyVerse(0, language).reference);
    } catch {
      // ignore
    }
    try {
      for (const card of getDueFSRSCards()) references.add(card.verseId);
    } catch {
      // ignore
    }
    if (references.size === 0) return [];
    return bank
      .filter((q) => {
        const reference = q.scripture?.reference;
        if (reference && references.has(reference)) return true;
        return Array.from(references).some((value) => q.id.endsWith(`:${value}`));
      })
      .map((q) => q.id);
  }, [bank, language]);

  const missedThisRun = useMemo(() => {
    const byId = new Map(bank.map((q) => [q.id, q]));
    return thisRunMissed
      .map((id) => byId.get(id))
      .filter((q): q is TriviaQuestion => Boolean(q));
  }, [bank, thisRunMissed]);

  useEffect(() => {
    try {
      localStorage.setItem(MISSED_KEY, JSON.stringify(missedIds));
    } catch {
      // ignore storage failures
    }
  }, [missedIds]);

  // Persist the live run so Back, tab switch or a reload pauses instead of destroying it.
  useEffect(() => {
    if (phase !== 'playing' || questions.length === 0) return;
    const payload: SavedRun = {
      questions,
      index,
      score,
      lives,
      combo,
      bestCombo,
      correctCount,
      attempted,
      runMissed,
      thisRunMissed,
      mode,
    };
    try {
      localStorage.setItem(RUN_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota failures
    }
  }, [phase, questions, index, score, lives, combo, bestCombo, correctCount, attempted, runMissed, thisRunMissed, mode]);

  // Warn before a reload/close while a run is live.
  useEffect(() => {
    if (phase !== 'playing') return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [phase]);

  // Keep the reveal and Next button on screen once an answer lands.
  useEffect(() => {
    if (answered && revealRef.current) {
      revealRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [answered]);

  const finish = useCallback((result: Exclude<Outcome, null>, finalScore: number, finalBestCombo: number) => {
    setOutcome(result);
    setPhase('result');
    clearSavedRun();
    setSavedRun(null);
    // Replays cannot farm unlimited XP: each day is capped across all runs.
    const rawXp = Math.min(300, Math.round(finalScore / 6));
    const remaining = Math.max(0, MAX_DAILY_GAME_XP - readDailyGameXp());
    const xp = Math.min(rawXp, remaining);
    if (xp > 0) {
      addDailyGameXp(xp);
      onRewardXP?.(xp);
    }

    if (finalScore > highScore) {
      setHighScore(finalScore);
      setNewBest(true);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
      } catch {
        // ignore
      }
    }
    if (finalBestCombo > bestComboEver) {
      setBestComboEver(finalBestCombo);
      try {
        localStorage.setItem(BEST_COMBO_KEY, String(finalBestCombo));
      } catch {
        // ignore
      }
    }

    if (result === 'victory') {
      soundEngine.playVictory();
    } else {
      soundEngine.playClick();
    }
  }, [highScore, bestComboEver, onRewardXP]);

  const handleAnswer = useCallback((pickedIndex: number | null) => {
    // A ref lock closes the race where a scripted double-click (or a click racing
    // the countdown) dispatches two answers before `answered` re-renders.
    if (answerLock.current || answered || !question) return;
    answerLock.current = true;
    setAttempted((n) => n + 1);

    const correct = pickedIndex !== null && pickedIndex === question.correctIndex;
    const boss = index === questions.length - 1;

    if (correct) {
      const speed = Math.round(120 * Math.max(0, timeLeft) / Math.max(1, timeTotal));
      const comboMultiplier = 1 + Math.min(combo, 5) * 0.2;
      const earned = Math.round((100 + speed) * comboMultiplier * (boss ? 2 : 1));
      const nextCombo = combo + 1;
      setScore((s) => s + earned);
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setCorrectCount((c) => c + 1);
      setMissedIds((prev) => (prev.includes(question.id) ? prev.filter((id) => id !== question.id) : prev));
      if (boss) {
        soundEngine.playVictory();
      } else {
        soundEngine.playSnap();
      }
      setAnswered({ pickedIndex, correct: true, earned });
    } else {
      setCombo(0);
      setLives((l) => Math.max(0, l - 1));
      setMissedIds((prev) => (prev.includes(question.id) ? prev : [...prev, question.id]));
      setThisRunMissed((prev) => (prev.includes(question.id) ? prev : [...prev, question.id]));
      // Feed the miss into the Practice review schedule so it comes back in Practice.
      const verse = question.scripture ? getVerseById(question.scripture.reference, language) : null;
      if (verse) {
        try {
          recordFSRSReview(verse.id, 1);
        } catch {
          // ignore storage failures
        }
      }
      soundEngine.playClick();
      setAnswered({ pickedIndex, correct: false, earned: 0 });
    }
  }, [answered, question, index, questions.length, timeLeft, timeTotal, combo, language]);

  const handleNext = useCallback(() => {
    if (lives <= 0) {
      finish('defeat', score, bestCombo);
      return;
    }
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      finish('victory', score, bestCombo);
      return;
    }
    setIndex(nextIndex);
    setAnswered(null);
    answerLock.current = false;
    const total = timeForIndex(nextIndex, mode);
    setTimeTotal(total);
    setTimeLeft(total);
  }, [lives, score, bestCombo, index, questions.length, finish, mode]);

  const startGame = useCallback(() => {
    soundEngine.playSnap();
    const run = pickRunFromBank(bank, QUESTIONS_PER_RUN, [...todayQuestionIds, ...missedIds]);
    if (run.length === 0) return;
    clearSavedRun();
    setSavedRun(null);
    setQuestions(run);
    setIndex(0);
    setScore(0);
    setLives(STARTING_LIVES);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setAttempted(0);
    setRunMissed(missedIds);
    setThisRunMissed([]);
    setAnswered(null);
    answerLock.current = false;
    setOutcome(null);
    setNewBest(false);
    setPaused(false);
    const total = timeForIndex(0, mode);
    setTimeTotal(total);
    setTimeLeft(total);
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bank, missedIds, mode, todayQuestionIds]);

  const resumeRun = useCallback(() => {
    if (!savedRun) return;
    soundEngine.playSnap();
    setQuestions(savedRun.questions);
    setIndex(savedRun.index);
    setScore(savedRun.score);
    setLives(savedRun.lives);
    setCombo(savedRun.combo);
    setBestCombo(savedRun.bestCombo);
    setCorrectCount(savedRun.correctCount);
    setAttempted(savedRun.attempted);
    setRunMissed(savedRun.runMissed);
    setThisRunMissed(savedRun.thisRunMissed ?? []);
    setMode(savedRun.mode);
    setAnswered(null);
    answerLock.current = false;
    setOutcome(null);
    setNewBest(false);
    setPaused(false);
    const total = timeForIndex(savedRun.index, savedRun.mode);
    setTimeTotal(total);
    setTimeLeft(total);
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [savedRun]);

  const quitToIntro = useCallback(() => {
    if (phase === 'playing' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Quit this run? Your current score and combo will be lost.');
      if (!confirmed) return;
    }
    soundEngine.playClick();
    clearSavedRun();
    setSavedRun(null);
    setPhase('intro');
    setAnswered(null);
    setQuestions([]);
  }, [phase]);

  // Countdown timer — stops while the app is hidden so players cannot look up answers
  useEffect(() => {
    if (phase !== 'playing' || answered || paused) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const id = setTimeout(() => setTimeLeft((v) => Math.max(0, Number((v - 0.1).toFixed(1)))), 100);
    return () => clearTimeout(id);
  }, [phase, answered, paused, timeLeft, handleAnswer]);

  // Pause the run whenever the tab/app is hidden (switching apps, tab change, lock screen).
  useEffect(() => {
    if (phase !== 'playing') return;
    const onVisibility = () => {
      const hidden = typeof document !== 'undefined' && document.hidden;
      setPaused(hidden);
    };
    const onPageHide = () => setPaused(true);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [phase]);

  // Keyboard controls: 1-4 to answer, Enter/Space to advance
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (answered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      const digit = Number(e.key);
      if (digit >= 1 && digit <= 4 && question && digit <= question.options.length) {
        handleAnswer(digit - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, answered, handleNext, handleAnswer, question]);

  const timePct = Math.max(0, Math.min(100, (timeLeft / Math.max(1, timeTotal)) * 100));
  const timerColor = timePct > 50 ? 'bg-emerald-500' : timePct > 25 ? 'bg-amber-500' : 'bg-red-500';

  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-3 md:pt-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] text-left">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {onExit && (
              <button
                type="button"
                onClick={() => { soundEngine.playClick(); onExit(); }}
                className="inline-flex items-center gap-1 min-h-[44px] -ml-1 pl-1 pr-3 rounded-full text-[15px] font-semibold text-fg-secondary hover:bg-stone-100 dark:hover:bg-stone-850"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                {s.practice}
              </button>
            )}

            <section className="rounded-3xl p-5 text-center text-white bg-[linear-gradient(150deg,#23408E,#16295C)] dark:bg-[linear-gradient(150deg,#1D2A4A,#121A2E)] dark:text-fg shadow-[0_16px_34px_-16px_rgba(10,15,30,0.6)]">
              <span className="mx-auto mb-2.5 w-16 h-16 rounded-[20px] bg-white/15 flex items-center justify-center">
                <Gamepad2 className="w-8 h-8" aria-hidden="true" />
              </span>
              <h1 className="font-serif text-[1.7rem] font-semibold">{s.trivia}</h1>
              <p className="text-[13.5px] leading-snug opacity-90 mt-1">{s.triviaIntro}</p>
            </section>

            {savedRun && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-line">
                <span className="text-xs text-fg-secondary">
                  Paused run — question {savedRun.index + 1} of {savedRun.questions.length}, {savedRun.score} points.
                </span>
                <button type="button" onClick={resumeRun} className="btn-primary !min-h-10 px-4 text-xs">
                  Resume run
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {(['relaxed', 'arcade'] as GameMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={mode === option}
                  onClick={() => {
                    setMode(option);
                    writeMode(option);
                  }}
                  className={`rounded-2xl border-[1.5px] px-3 py-2.5 text-left transition-colors ${
                    mode === option ? 'border-accent bg-amber-100 dark:bg-amber-500/15' : 'border-line bg-surface-raised'
                  }`}
                >
                  <span className="block text-[14px] font-bold text-fg">{option === 'relaxed' ? s.relaxed : s.quickFire}</span>
                  <span className="block text-[12px] text-fg-muted">{option === 'relaxed' ? s.relaxedHint : s.quickFireHint}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                [String(QUESTIONS_PER_RUN), s.questions],
                [String(STARTING_LIVES), s.lives],
                ['2×', s.comboBonus],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-line bg-surface-raised px-2 py-2.5">
                  <b className="block font-serif text-lg text-fg">{value}</b>
                  <span className="text-[11px] font-semibold text-fg-muted">{label}</span>
                </div>
              ))}
            </div>

            {missedIds.length > 0 && (
              <p className="flex items-center gap-2 rounded-2xl bg-stone-100 dark:bg-stone-900 px-3.5 py-2.5 text-xs text-fg-secondary">
                <BookOpen className="w-4 h-4 shrink-0 text-accent-text" aria-hidden="true" />
                {s.missedQueued(missedIds.length)}
              </p>
            )}

            <button
              type="button"
              onClick={startGame}
              className="btn-primary w-full !max-w-none flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>{s.startQuiz}</span>
            </button>
            <p className="text-center text-xs font-semibold text-fg-muted">{s.best(highScore, bestComboEver)}</p>
          </motion.div>
        )}

        {phase === 'playing' && question && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* HUD */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={quitToIntro}
                className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 py-1.5 px-2.5 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {s.quit}
              </button>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-900 text-xs font-sans tabular-nums font-bold text-amber-800 dark:text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {score}
                </span>
                {combo >= 2 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/15 text-xs font-sans tabular-nums font-bold text-orange-700 dark:text-orange-300">
                    <Flame className="w-3.5 h-3.5" />
                    {combo}× combo
                  </span>
                )}
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-900">
                  {Array.from({ length: STARTING_LIVES }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-3.5 h-3.5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-stone-300 dark:text-stone-700'}`}
                    />
                  ))}
                </span>
              </div>
            </div>

            {/* Progress + timer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-sans tabular-nums text-stone-500 dark:text-stone-400">
                <span>Question {index + 1} of {questions.length}</span>
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {Math.ceil(timeLeft)}s
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200/70 dark:bg-stone-800 overflow-hidden">
                <div className={`h-full rounded-full transition-[width] duration-100 ease-linear ${timerColor}`} style={{ width: `${timePct}%` }} />
              </div>
            </div>

            {/* Question card */}
            <div className={`p-5 sm:p-6 rounded-3xl border ${
              isBoss
                ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-stone-100/60 dark:to-stone-900/60 border-amber-500/50'
                : 'bg-stone-100/70 dark:bg-stone-900/50 border-stone-200/70 dark:border-stone-800/70'
            }`}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {isBoss && (
                  <span className="flex items-center gap-1 text-[10px] font-sans tabular-nums font-bold uppercase tracking-widest text-accent-on bg-amber-500 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" />
                    {s.finalQuestion}
                  </span>
                )}
                {isReviewQuestion && (
                  <span className="flex items-center gap-1 text-[10px] font-sans tabular-nums font-bold uppercase tracking-widest text-accent-text bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-full">
                    <RotateCcw className="w-3 h-3" />
                    Review round
                  </span>
                )}
                <span className="text-[10px] font-sans tabular-nums font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {question.tag}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug mb-3">
                {question.prompt}
              </h2>

              {question.context && (
                <blockquote className="p-4 rounded-2xl bg-white/80 dark:bg-stone-950/60 border-l-4 border-amber-500/70 text-sm sm:text-base font-reading text-stone-800 dark:text-parchment-100 italic leading-relaxed mb-4">
                  {question.context}
                </blockquote>
              )}

              {/* Options */}
              <div className="space-y-2.5">
                {question.options.map((option, i) => {
                  const isCorrectOption = i === question.correctIndex;
                  const isPicked = answered?.pickedIndex === i;
                  let style = 'bg-white/80 dark:bg-stone-900/60 hover:bg-amber-500/15 dark:hover:bg-stone-800 text-stone-800 dark:text-parchment-100 border-stone-200 dark:border-stone-800';
                  if (answered) {
                    if (isCorrectOption) {
                      style = 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border-emerald-500/60';
                    } else if (isPicked) {
                      style = 'bg-rose-500/15 text-rose-900 dark:text-rose-200 border-rose-500/60';
                    } else {
                      style = 'bg-stone-100/60 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600 border-stone-200/60 dark:border-stone-800/60';
                    }
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => handleAnswer(i)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${style} ${
                        !answered ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-sans tabular-nums font-bold ${
                        answered && isCorrectOption
                          ? 'bg-emerald-500 text-stone-950'
                          : answered && isPicked
                          ? 'bg-rose-500 text-white'
                          : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}>
                        {answered && isCorrectOption ? <Check className="w-3.5 h-3.5" /> : answered && isPicked ? <X className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                      <span className="text-sm font-medium leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reveal / next */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  ref={revealRef}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 sm:p-5 rounded-3xl border ${
                    answered.correct
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className={`flex items-center gap-1.5 text-sm font-bold ${
                      answered.correct ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
                    }`}>
                      {answered.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {answered.correct ? 'Correct!' : answered.pickedIndex === null ? 'Time up!' : 'Not quite'}
                    </span>
                    {answered.correct ? (
                      <span className="text-xs font-sans tabular-nums font-bold text-amber-800 dark:text-amber-400">+{answered.earned} pts</span>
                    ) : (
                      <span className="text-[10px] font-sans tabular-nums font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full">
                        Will return to study
                      </span>
                    )}
                  </div>

                  {answered.correct ? (
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-parchment-100 leading-relaxed mb-3">
                      <Sparkles className="w-3.5 h-3.5 inline text-amber-500 mr-1 -mt-0.5" />
                      {question.explain}
                    </p>
                  ) : (
                    <div className="mb-3 p-4 rounded-2xl bg-white/80 dark:bg-stone-950/60 border border-amber-500/30">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[11px] font-sans tabular-nums font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                          <BookOpen className="w-3.5 h-3.5" />
                          Learn this Scripture
                        </span>
                        {question.scripture && (
                          <span className="text-xs font-sans tabular-nums font-bold text-stone-900 dark:text-parchment-50">
                            {question.scripture.reference}
                            {question.scripture.translation ? ` • ${question.scripture.translation}` : ''}
                          </span>
                        )}
                      </div>

                      {question.scripture && (
                        <blockquote className="text-sm sm:text-base font-reading italic text-stone-800 dark:text-parchment-100 leading-relaxed border-l-4 border-amber-500/70 pl-3 mb-3">
                          “{question.scripture.text}”
                        </blockquote>
                      )}

                      <p className="text-xs sm:text-sm text-stone-700 dark:text-parchment-100 leading-relaxed">
                        <Sparkles className="w-3.5 h-3.5 inline text-amber-500 mr-1 -mt-0.5" />
                        {question.explain}
                      </p>

                      {onStudyVerse && practiceReference && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playSnap();
                            onStudyVerse(practiceReference);
                          }}
                          className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Practice this verse in Memorize</span>
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary w-full !max-w-none flex items-center justify-center gap-2"
                  >
                    <span>{lives <= 0 ? 'See results' : index + 1 >= questions.length ? 'Finish run' : 'Next question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={`p-6 sm:p-8 rounded-3xl text-center border ${
              outcome === 'victory'
                ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-stone-100/60 dark:to-stone-900/60 border-amber-500/40'
                : 'bg-stone-100/70 dark:bg-stone-900/50 border-stone-200/70 dark:border-stone-800/70'
            }`}>
              <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 ${
                outcome === 'victory' ? 'bg-amber-500 text-accent-on shadow-glow' : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }`}>
                {outcome === 'victory' ? <Trophy className="w-8 h-8" /> : <Heart className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50">
                {outcome === 'victory' ? 'You did it!' : 'Quiz over'}
              </h2>
              {newBest && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-sans tabular-nums font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  New high score!
                </span>
              )}

              <div className="text-5xl font-serif font-black text-amber-800 dark:text-amber-400 mt-4 mb-1">
                {score}
              </div>
              <div className="text-xs font-sans tabular-nums uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-5">
                Points
              </div>

              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3`}>
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/60">
                  <div className="text-lg font-serif font-black text-stone-900 dark:text-parchment-50">{correctCount}/{attempted}</div>
                  <div className="text-[10px] font-sans tabular-nums uppercase tracking-wider text-stone-500 dark:text-stone-400">Correct / answered</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/60">
                  <div className="text-lg font-serif font-black text-stone-900 dark:text-parchment-50">{accuracy}%</div>
                  <div className="text-[10px] font-sans tabular-nums uppercase tracking-wider text-stone-500 dark:text-stone-400">Accuracy</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/60">
                  <div className="text-lg font-serif font-black text-stone-900 dark:text-parchment-50">{bestCombo}×</div>
                  <div className="text-[10px] font-sans tabular-nums uppercase tracking-wider text-stone-500 dark:text-stone-400">Best combo</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs font-sans tabular-nums text-stone-500 dark:text-stone-400 mt-4">
                <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-500" /> High: <strong className="text-stone-900 dark:text-parchment-50">{highScore}</strong></span>
                <span className="text-stone-400">•</span>
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> Best combo: <strong className="text-stone-900 dark:text-parchment-50">{bestComboEver}×</strong></span>
              </div>

              {missedThisRun.length > 0 && (
                <div className="mt-5 text-left">
                  <div className="flex items-center gap-2 text-[11px] font-sans tabular-nums uppercase tracking-wider text-accent-text mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    {missedThisRun.length} missed this run — added to your review
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missedThisRun.map((q) => {
                      const reference = q.scripture?.reference;
                      const resolvable = Boolean(reference && getVerseById(reference, language));
                      if (reference && resolvable && onStudyVerse) {
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              soundEngine.playSnap();
                              onStudyVerse(reference);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-accent-text text-xs font-sans tabular-nums cursor-pointer"
                          >
                            {reference}
                          </button>
                        );
                      }
                      return (
                        <span
                          key={q.id}
                          className="px-3 py-1.5 rounded-xl bg-stone-200/60 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 text-xs font-sans tabular-nums"
                        >
                          {reference ?? q.tag}
                        </span>
                      );
                    })}
                  </div>
                  {missedIds.length > missedThisRun.length && (
                    <p className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                      {missedIds.length} questions total are queued to come back until you get them right.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={startGame}
                className="btn-primary flex-1 !max-w-none flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{s.playAgain}</span>
              </button>
              <button
                type="button"
                onClick={() => { if (onExit) { clearSavedRun(); onExit(); } else { quitToIntro(); } }}
                className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full text-sm font-bold border border-line bg-surface-raised text-fg-secondary transition-colors cursor-pointer"
              >
                <span>{s.done}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TriviaGauntlet;
