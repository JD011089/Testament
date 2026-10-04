import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryQuest, StoryAct } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  BookOpen, 
  ChevronDown, 
  ShieldAlert, 
  HelpCircle, 
  Lock,
  Share2
} from 'lucide-react';
import { 
  getLocalPersonalization, 
  fetchGeminiPersonalization, 
  type MissionPersonalization 
} from '../utils/geminiMissionPersonalizer';
import { 
  type GeneratedDailyMission, 
  getLocalDecisionPersonalization, 
  fetchPersonalizedMirrorBack 
} from '../utils/dailyMissionPipeline';
import { 
  lockInMemoryVerse, 
  checkRankPromotion 
} from '../utils/memoryVerseEngine';
import { getTodayDateKey } from '../utils/dailyEngine';
import { paraphraseVerseSimpler } from '../utils/geminiFeatures';
import { ReportIssueModal } from './ReportIssueModal';

interface StoryViewerProps {
  quest?: StoryQuest | null;
  dailyMission?: GeneratedDailyMission | null;
  onBack: () => void;
  onCompleteAct: (actId: string, questId: string, relicId?: string) => void;
  completedActs: string[];
  onOpenWordForge?: (verseId: string) => void;
  onOpenNexus?: (type: string, id: string) => void;
  onOpenBibleChapter?: (target: { book: string; chapter: number; verseStart: number; verseEnd: number }) => void;
  onRewardXP?: (amount: number) => void;
  currentXp?: number;
}

// Built-in dictionary of challenging biblical & translation vocabulary for instant 1-tap definition (M-3)
const HARD_WORDS_DICTIONARY: Record<string, string> = {
  rebuked: 'sternly ordered or commanded to stop',
  rebuke: 'sternly order or command to stop',
  squall: 'a sudden, violent gust of wind and storm',
  flogged: 'beaten harshly with wooden rods or whips',
  magistrates: 'local Roman government officials and judges',
  stocks: 'heavy wooden blocks locking a prisoner’s feet and legs',
  cistern: 'a deep underground stone pit used to hold water',
  discontented: 'deeply unhappy and dissatisfied with life',
  distress: 'great suffering, panic, or extreme pressure',
  fugitive: 'a person who is running away from capture',
  zealous: 'fiercely devoted, impassioned, and enthusiastic',
  perish: 'to die, be lost, or be completely destroyed',
  unquenchable: 'impossible to extinguish or put out',
  stronghold: 'a fortified stone fortress of protection',
  counsel: 'wise advice and deliberate guidance',
  chariots: 'horse-drawn ancient battle wagons',
  sovereign: 'holding supreme, ultimate power over all things'
};

function cleanWordKey(word: string): string {
  return word.toLowerCase().replace(/[^a-z]/g, '');
}

function getAiConnectionText(mirrorBack: string, heroName: string): string {
  if (!mirrorBack) return `${heroName} faced a similar pivotal moment.`;
  const dashParts = mirrorBack.split(/\s*—\s*|\s*--\s*/);
  if (dashParts.length > 1 && dashParts[1].trim()) {
    return dashParts[1].trim();
  }
  const cleaned = mirrorBack.replace(/^You (?:said you'd|chose to|said)\s+[^—-]+[—–-]\s*/i, '');
  if (cleaned && cleaned !== mirrorBack) {
    return cleaned.trim();
  }
  return mirrorBack.trim();
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  quest, 
  dailyMission,
  onBack, 
  onCompleteAct, 
  completedActs,
  onRewardXP,
  currentXp
}) => {
  const currentActIndex = (() => {
    if (!quest) return 0;
    const nextIndex = quest.acts.findIndex((item) => !completedActs.includes(item.id));
    return nextIndex === -1 ? 0 : nextIndex;
  })();

  const act: StoryAct | undefined = quest ? (quest.acts[currentActIndex] || quest.acts[0]) : undefined;

  // Unified mission content fields
  const heroName = dailyMission ? dailyMission.heroName : (quest?.heroName || 'Bible Hero');
  const missionTitle = dailyMission 
    ? `${dailyMission.heroName} • ${dailyMission.passageReference}` 
    : (act ? `${quest?.heroName} • Act ${act.actNumber} of ${quest?.acts.length}` : 'Today\'s Mission');

  const scenarioQuestion = dailyMission ? dailyMission.scenarioQuestion : (act?.perspectivePrompt || '');
  const presetChoices = dailyMission 
    ? dailyMission.presetChoices 
    : (act?.choices || []);
  const storyRetelling = dailyMission 
    ? dailyMission.storyRetelling 
    : (act?.narrativeParagraphs || []);
  const keyVerseRef = dailyMission ? dailyMission.keyVerseReference : (act?.unlockedScripture.reference || '');
  const keyVerseText = dailyMission ? dailyMission.keyVerseText : (act?.unlockedScripture.text || '');
  const kjvVerseText = dailyMission 
    ? dailyMission.kjvVerseText 
    : `${keyVerseText} — ${keyVerseRef} (KJV)`;

  const missionIdentifier = dailyMission ? dailyMission.id : (act?.id || 'mission-act');

  // M-10: Retrieve in-progress mission state from localStorage so interruptions resume exact step
  const inProgressInitial = (() => {
    try {
      const raw = localStorage.getItem('testament_in_progress_mission');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.missionId === missionIdentifier) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  })();

  // Screen 1: Decide | Screen 2: Story | Screen 3: Live It
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(() => {
    if (inProgressInitial && inProgressInitial.currentScreen) {
      return inProgressInitial.currentScreen as 1 | 2 | 3;
    }
    return 1;
  });

  // Decision state
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(() => {
    if (inProgressInitial?.selectedChoiceId !== undefined) {
      return inProgressInitial.selectedChoiceId;
    }
    try {
      const storedChoices = localStorage.getItem('testament_act_choices');
      if (storedChoices) {
        const parsed = JSON.parse(storedChoices);
        return parsed[missionIdentifier] || null;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => inProgressInitial?.isCustomMode ?? false);
  const [customText, setCustomText] = useState<string>(() => inProgressInitial?.customText ?? '');
  const [isSkipped, setIsSkipped] = useState<boolean>(() => inProgressInitial?.isSkipped ?? false);
  const [recordedDecisionText, setRecordedDecisionText] = useState<string | null>(() => inProgressInitial?.recordedDecisionText ?? null);

  // Translation toggle: default modern (CSB), KJV behind toggle
  const [useKjv, setUseKjv] = useState<boolean>(false);

  // M-3: Say it simpler & tap-to-define state
  const [showSimplerVerse, setShowSimplerVerse] = useState<boolean>(false);
  const [simplerVerseText, setSimplerVerseText] = useState<string>('');
  const [isLoadingSimplerVerse, setIsLoadingSimplerVerse] = useState<boolean>(false);
  const [selectedHardWord, setSelectedHardWord] = useState<{ word: string; definition: string } | null>(null);

  // M-6: Slow network loading state
  const [isRefiningAi, setIsRefiningAi] = useState<boolean>(false);
  const [refinementExceeded, setRefinementExceeded] = useState<boolean>(false);

  // M-9: Content issue report modal state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Audio narrator state (secondary option)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Optional "Go deeper" drawer state
  const [showGoDeeper, setShowGoDeeper] = useState<boolean>(false);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Personalization state
  const [personalization, setPersonalization] = useState<MissionPersonalization>(() => {
    if (dailyMission) {
      const init = getLocalDecisionPersonalization(null, dailyMission);
      return {
        mirrorBack: init.mirrorBack,
        actionLine: init.actionLine,
        verseReference: dailyMission.keyVerseReference,
        verseText: dailyMission.keyVerseText,
        kjvVerseText: dailyMission.kjvVerseText,
        source: 'default'
      };
    }
    if (act && quest) {
      return getLocalPersonalization(null, act, quest);
    }
    return {
      mirrorBack: 'Here is what unfolded in this pivotal moment.',
      actionLine: 'Take 60 seconds of quiet before your next move today.',
      verseReference: keyVerseRef,
      verseText: keyVerseText,
      kjvVerseText: kjvVerseText,
      source: 'default'
    };
  });

  const [hasCompletedCurrentAct, setHasCompletedCurrentAct] = useState<boolean>(() => completedActs.includes(missionIdentifier));
  const [rankPromotion, setRankPromotion] = useState<string | null>(null);
  const [copiedShareCard, setCopiedShareCard] = useState<boolean>(false);

  // M-10: Save in-progress mission state to localStorage on any state modification
  useEffect(() => {
    if (currentScreen <= 3 && !hasCompletedCurrentAct) {
      try {
        const stateToSave = {
          missionId: missionIdentifier,
          currentScreen,
          selectedChoiceId,
          customText,
          isCustomMode,
          isSkipped,
          recordedDecisionText,
          dateKey: getTodayDateKey(),
          updatedAt: Date.now()
        };
        localStorage.setItem('testament_in_progress_mission', JSON.stringify(stateToSave));
      } catch {
        // ignore storage errors
      }
    }
  }, [missionIdentifier, currentScreen, selectedChoiceId, customText, isCustomMode, isSkipped, recordedDecisionText, hasCompletedCurrentAct]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const handleSelectPresetChoice = (choiceId: string) => {
    soundEngine.playSnap();
    setSelectedChoiceId(choiceId);
    setIsCustomMode(false);
    setIsSkipped(false);
  };

  const handleSelectCustomMode = () => {
    soundEngine.playSnap();
    setIsCustomMode(true);
    setSelectedChoiceId(null);
    setIsSkipped(false);
  };

  const getDecisionString = (): string | null => {
    if (isSkipped) return null;
    if (isCustomMode && customText.trim()) return customText.trim();
    if (selectedChoiceId) {
      const choice = presetChoices.find(c => c.id === selectedChoiceId);
      return choice ? choice.text : selectedChoiceId;
    }
    return null;
  };

  const handleAdvanceToStory = (skip = false) => {
    soundEngine.playClick();
    const decisionString = skip ? null : getDecisionString();
    setIsSkipped(skip);
    setRecordedDecisionText(decisionString);

    // 1. Immediately apply fast local personalization (0ms latency, never blocks)
    if (dailyMission) {
      const localResult = getLocalDecisionPersonalization(decisionString, dailyMission);
      setPersonalization({
        mirrorBack: localResult.mirrorBack,
        actionLine: localResult.actionLine,
        verseReference: dailyMission.keyVerseReference,
        verseText: dailyMission.keyVerseText,
        kjvVerseText: dailyMission.kjvVerseText,
        source: localResult.source
      });
    } else if (act && quest) {
      const localResult = getLocalPersonalization(decisionString, act, quest);
      setPersonalization(localResult);
    }

    // Save decision to localStorage
    if (decisionString) {
      try {
        const checkInRecord = {
          dateKey: getTodayDateKey(),
          decision: decisionString,
          heroName,
          scenarioQuestion,
          timestamp: Date.now()
        };
        localStorage.setItem('testament_daily_checkin', JSON.stringify(checkInRecord));
      } catch {
        // ignore
      }
    }

    if (selectedChoiceId) {
      try {
        const stored = localStorage.getItem('testament_act_choices');
        const map = stored ? JSON.parse(stored) : {};
        map[missionIdentifier] = selectedChoiceId;
        localStorage.setItem('testament_act_choices', JSON.stringify(map));
      } catch {
        // ignore
      }
    }

    setCurrentScreen(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. M-6: Slow network handling for Gemini refinement
    if (decisionString) {
      setIsRefiningAi(true);
      setRefinementExceeded(false);

      // Exceeded timer after ~8s
      const fallbackTimer = setTimeout(() => {
        setIsRefiningAi(false);
        setRefinementExceeded(true);
      }, 8000);

      if (dailyMission) {
        fetchPersonalizedMirrorBack(decisionString, dailyMission)
          .then((geminiRes) => {
            clearTimeout(fallbackTimer);
            setIsRefiningAi(false);
            if (geminiRes?.mirrorBack) {
              setPersonalization((prev) => ({
                ...prev,
                mirrorBack: geminiRes.mirrorBack,
                actionLine: geminiRes.actionLine || prev.actionLine,
                source: 'gemini'
              }));
            }
          })
          .catch(() => {
            clearTimeout(fallbackTimer);
            setIsRefiningAi(false);
          });
      } else if (act && quest) {
        fetchGeminiPersonalization(decisionString, act, quest)
          .then((geminiRes) => {
            clearTimeout(fallbackTimer);
            setIsRefiningAi(false);
            if (geminiRes?.mirrorBack) {
              setPersonalization((prev) => ({
                ...prev,
                mirrorBack: geminiRes.mirrorBack || prev.mirrorBack,
                actionLine: geminiRes.actionLine || prev.actionLine,
                source: 'gemini'
              }));
            }
          })
          .catch(() => {
            clearTimeout(fallbackTimer);
            setIsRefiningAi(false);
          });
      }
    }
  };

  const handleAdvanceToLiveIt = () => {
    soundEngine.playClick();
    setCurrentScreen(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. One verse system: mission key verse auto-becomes today's memory verse
    lockInMemoryVerse({
      id: keyVerseRef,
      reference: keyVerseRef,
      text: keyVerseText,
      heroName
    });

    // 2. Check rank promotion
    const prevPoints = currentXp ?? 0;
    const promotion = checkRankPromotion(prevPoints, prevPoints + 50);
    if (promotion.promoted) {
      setRankPromotion(promotion.newRank);
    }

    // N-10: Trigger celebration state honoring prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // safe fallback
      }
    }
    soundEngine.playVictory();

    // Reward XP & mark progress if not already completed
    if (!completedActs.includes(missionIdentifier) && !hasCompletedCurrentAct) {
      setHasCompletedCurrentAct(true);
      const isLastAct = quest && currentActIndex === quest.acts.length - 1;
      const relicId = isLastAct ? quest.relicReward?.id : undefined;
      onCompleteAct(missionIdentifier, quest ? quest.id : 'daily-campaign', relicId);
      onRewardXP?.(50);
    }
  };

  const handleShareCard = async () => {
    soundEngine.playSnap();
    const userChoiceText = recordedDecisionText || getDecisionString() || 'Faced today\'s crossroad';
    const shareText = `✝️ TESTAMENT — TODAY'S MISSION COMPLETE\n\nScenario: "${scenarioQuestion}"\nMy Move: "${userChoiceText}"\n\nScripture: ${keyVerseRef}\n"${keyVerseText}"\n\nToday's Move: ${personalization.actionLine}\n\nNo 40-minute reading plans. Just today's mission.\ntestament-bible-learning.vercel.app`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "Today's Mission Complete — Testament",
          text: shareText,
          url: 'https://testament-bible-learning.vercel.app'
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to copy
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShareCard(true);
        setTimeout(() => setCopiedShareCard(false), 3000);
      }
    } catch {
      // ignore
    }
  };

  const handleFinishMission = () => {
    soundEngine.playClick();
    soundEngine.stopSpeaking();
    try {
      localStorage.removeItem('testament_in_progress_mission');
    } catch {
      // ignore
    }
    onBack();
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      soundEngine.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      soundEngine.playClick();
      setIsPlayingAudio(true);
      const textToRead = `${missionTitle}. ${storyRetelling.join(' ')} Key Verse: ${keyVerseText}. Action: ${personalization.actionLine}`;
      soundEngine.speakVerse(textToRead, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // M-3: Say it simpler one-tap paraphrase handler
  const handleToggleSimplerVerse = async () => {
    soundEngine.playSnap();
    if (showSimplerVerse) {
      setShowSimplerVerse(false);
      return;
    }
    setShowSimplerVerse(true);
    if (!simplerVerseText) {
      setIsLoadingSimplerVerse(true);
      try {
        const result = await paraphraseVerseSimpler({
          verseText: keyVerseText,
          reference: keyVerseRef
        });
        setSimplerVerseText(result);
      } catch {
        setSimplerVerseText(keyVerseText);
      } finally {
        setIsLoadingSimplerVerse(false);
      }
    }
  };

  const handleQuizAnswer = (idx: number) => {
    soundEngine.playSnap();
    setSelectedQuizIndex(idx);
    setQuizSubmitted(true);
    if (act?.wisdomQuiz?.options[idx]?.isCorrect) {
      soundEngine.playVictory();
      onRewardXP?.(20);
    }
  };

  // M-3: Helper to render text with tap-to-define hard words
  const renderTextWithHardWords = (text: string) => {
    const tokens = text.split(/(\s+|[.,;!?"()]+)/);
    return tokens.map((token, idx) => {
      const clean = cleanWordKey(token);
      if (clean && HARD_WORDS_DICTIONARY[clean]) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              soundEngine.playSnap();
              setSelectedHardWord({
                word: clean,
                definition: HARD_WORDS_DICTIONARY[clean]
              });
            }}
            className="underline decoration-amber-500/70 decoration-dotted underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400 font-inherit inline cursor-pointer text-inherit p-0 bg-transparent border-0"
            title={`Tap to define "${clean}"`}
          >
            {token}
          </button>
        );
      }
      return <React.Fragment key={idx}>{token}</React.Fragment>;
    });
  };

  const isDecisionReady = Boolean(selectedChoiceId || (isCustomMode && customText.trim().length > 0));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-28 md:pb-16 text-left transition-colors">
      
      {/* TOP STREAMLINED NAVIGATION / PROGRESS BAR */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            soundEngine.stopSpeaking();
            if (currentScreen > 1) {
              setCurrentScreen((prev) => (prev - 1) as 1 | 2);
            } else {
              handleFinishMission();
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 py-1.5 px-2.5 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft aria-hidden="true" className="w-4 h-4" />
          <span>{currentScreen === 1 ? 'Exit' : 'Back'}</span>
        </button>

        {/* N-6: 3-Step Pill Tracker with accessible text */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentScreen === stepNum
                    ? 'w-7 bg-amber-500'
                    : currentScreen > stepNum
                    ? 'w-3 bg-amber-600/70 dark:bg-amber-600'
                    : 'w-2 bg-stone-300 dark:bg-stone-800'
                }`}
              />
            ))}
          </div>
          <span className="sr-only">
            {currentScreen === 1 ? 'Step 1 of 3: Decide' : currentScreen === 2 ? 'Step 2 of 3: Story' : 'Step 3 of 3: Live It'}
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider ml-1" aria-hidden="true">
            {currentScreen === 1 ? '1. Decide' : currentScreen === 2 ? '2. Story' : '3. Live It'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* =========================================================================
            SCREEN 1 — DECIDE: Real fieldset, labels, explained disabled state (C-1, C-2)
            ========================================================================= */}
        {currentScreen === 1 && (
          <motion.div
            key="screen-decide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <fieldset className="space-y-6 border-0 p-0 m-0">
              {/* Context Micro-Tag & Reflection Badge (M-4: aria-hidden decorative icons) */}
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                    {missionTitle}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300" role="note" aria-label="AI reflection, Not Scripture">
                    <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
                  </span>
                </div>
                <legend className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-snug mt-1 block">
                  "{scenarioQuestion}"
                </legend>
                <p id="decide-instructions" className="text-xs text-stone-600 dark:text-stone-400 mt-1.5">
                  Pick your instinct before seeing what {heroName} actually did.
                </p>
              </div>

              {/* Nuanced Preset Choices with real radio accessibility (C-1) */}
              <div role="radiogroup" aria-labelledby="decide-instructions" className="space-y-2.5">
                {presetChoices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id && !isCustomMode;
                  return (
                    <label
                      key={choice.id}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 dark:bg-amber-500/20 text-stone-950 dark:text-parchment-50 ring-2 ring-amber-500/60 shadow-xs'
                          : 'bg-stone-100/70 hover:bg-stone-200/60 dark:bg-stone-900/60 dark:hover:bg-stone-850/80 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mission-decision"
                        value={choice.id}
                        checked={isSelected}
                        onChange={() => handleSelectPresetChoice(choice.id)}
                        className="sr-only"
                        aria-label={choice.text}
                      />
                      <div aria-hidden="true" className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-amber-500 text-stone-950 font-bold' 
                          : 'border border-stone-400 dark:border-stone-600'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 bg-stone-950 rounded-full" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {choice.text}
                      </span>
                    </label>
                  );
                })}

                {/* First-class Option: "In your own words" (C-1, N-11) */}
                <div
                  onClick={handleSelectCustomMode}
                  className={`w-full p-4 rounded-2xl transition-all cursor-pointer ${
                    isCustomMode
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 text-stone-950 dark:text-parchment-50 ring-2 ring-amber-500/60 shadow-xs'
                      : 'bg-stone-100/70 hover:bg-stone-200/60 dark:bg-stone-900/60 dark:hover:bg-stone-850/80 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="mission-decision"
                      value="custom"
                      checked={isCustomMode}
                      onChange={handleSelectCustomMode}
                      className="sr-only"
                      aria-label="In your own words option"
                    />
                    <div aria-hidden="true" className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                      isCustomMode 
                        ? 'bg-amber-500 text-stone-950 font-bold' 
                        : 'border border-stone-400 dark:border-stone-600'
                    }`}>
                      {isCustomMode && <span className="w-1.5 h-1.5 bg-stone-950 rounded-full" />}
                    </div>
                    <div className="w-full">
                      <label 
                        htmlFor="custom-decision-input" 
                        className="text-xs sm:text-sm font-medium leading-relaxed block mb-2 cursor-pointer"
                      >
                        In your own words:
                      </label>
                      <input
                        id="custom-decision-input"
                        type="text"
                        value={customText}
                        onChange={(e) => {
                          setCustomText(e.target.value);
                          if (!isCustomMode) setIsCustomMode(true);
                        }}
                        onFocus={() => {
                          if (!isCustomMode) setIsCustomMode(true);
                        }}
                        placeholder="What would you honestly do right now?"
                        aria-label="In your own words: What would you honestly do right now?"
                        aria-describedby="custom-decision-privacy"
                        maxLength={140}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-ink text-stone-900 dark:text-parchment-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      {/* Privacy Note */}
                      <p id="custom-decision-privacy" className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-1.5">
                        <Lock aria-hidden="true" className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>Responses stay private and are only used to shape today's mission.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAs & Explained Disabled State (C-2) */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  disabled={!isDecisionReady}
                  aria-describedby={!isDecisionReady ? "decision-disabled-hint" : undefined}
                  onClick={() => handleAdvanceToStory(false)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    isDecisionReady
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>See what happened</span>
                  <ArrowRight aria-hidden="true" className="w-4 h-4" />
                </button>
                {!isDecisionReady && (
                  <p id="decision-disabled-hint" className="text-center text-xs text-amber-800 dark:text-amber-400 font-medium">
                    Choose an option above to continue
                  </p>
                )}

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdvanceToStory(true)}
                    className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-amber-400 transition-colors py-1 px-3"
                  >
                    Skip decision & see what happened →
                  </button>
                </div>
              </div>
            </fieldset>

            {/* M-9: Report Issue Link */}
            <div className="pt-2 text-center border-t border-stone-200/50 dark:border-stone-800/50">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors underline-offset-2 hover:underline"
              >
                Report an issue with today's reflection
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            SCREEN 2 — STORY: Verbatim quote, badged AI connection, tap-to-define
            ========================================================================= */}
        {currentScreen === 2 && (
          <motion.div
            key="screen-story"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* M-5: Verbatim User Choice Quoted + Separately Badged AI Connection */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-left space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Sparkles aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                      Here's how your answer connects
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400" role="note" aria-label="AI reflection, Not Scripture">
                      <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
                    </span>
                  </div>

                  {recordedDecisionText ? (
                    <div className="space-y-2">
                      {/* Exact words quoted (M-5) */}
                      <p className="text-xs sm:text-sm font-serif text-stone-900 dark:text-parchment-50 leading-snug">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">You chose: </span>
                        <span className="font-bold text-amber-950 dark:text-amber-200">"{recordedDecisionText}"</span>
                      </p>

                      {/* AI connection as a separate, badged sentence (M-5) */}
                      <div className="pt-2 border-t border-amber-500/20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold" role="note">
                            <span aria-hidden="true">✨ </span>AI connection
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-serif text-stone-800 dark:text-parchment-100 leading-snug">
                          {getAiConnectionText(personalization.mirrorBack, heroName)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                      {personalization.mirrorBack}
                    </p>
                  )}

                  {/* M-6: Slow network progress indication */}
                  {isRefiningAi && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic animate-pulse">
                      Writing today's story connection…
                    </p>
                  )}
                  {refinementExceeded && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                      Still working — showing you today's backup version instead.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Story Header */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  What actually happened
                </h2>
                <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400" role="note" aria-label="AI reflection, Not Scripture">
                  <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
                </span>
              </div>
            </div>

            {/* Modern Plain English Story Narrative with Tap-to-define hard words (M-3) */}
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-800 dark:text-parchment-100 leading-relaxed font-reading">
              {storyRetelling.map((para, i) => (
                <p key={i}>
                  {renderTextWithHardWords(para)}
                </p>
              ))}
            </div>

            {/* Key Verse Verbatim (VERBATIM SCRIPTURE) with "Say it simpler" toggle (M-3) */}
            <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                    {keyVerseRef}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-900 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-bold">
                    Scripture (Verbatim)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* M-3: Say it simpler toggle */}
                  <button
                    type="button"
                    onClick={handleToggleSimplerVerse}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 transition-colors"
                  >
                    {showSimplerVerse ? 'Hide simpler' : 'Say it simpler'}
                  </button>

                  {/* KJV Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSnap();
                      setUseKjv((prev) => !prev);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    {useKjv ? 'Showing KJV' : 'CSB (Tap for KJV)'}
                  </button>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm font-serif italic text-stone-900 dark:text-parchment-50 leading-relaxed border-l-2 border-amber-500/60 pl-3">
                "{renderTextWithHardWords(useKjv ? personalization.kjvVerseText : keyVerseText)}"
              </blockquote>

              {/* M-3: Inline Say It Simpler translation */}
              {showSimplerVerse && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-500 text-xs text-stone-800 dark:text-parchment-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold" role="note" aria-label="AI reflection, Not Scripture">
                      <span aria-hidden="true">✨ </span>Plain English • AI reflection
                    </span>
                  </div>
                  <p className="font-reading leading-relaxed">
                    {isLoadingSimplerVerse ? 'Translating into plain everyday words…' : simplerVerseText}
                  </p>
                </div>
              )}
            </div>

            {/* M-3: Word Definition Card if hard word tapped */}
            {selectedHardWord && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                    "{selectedHardWord.word}":{' '}
                  </span>
                  <span className="text-stone-800 dark:text-stone-200">{selectedHardWord.definition}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHardWord(null)}
                  className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs px-2 py-0.5 rounded-lg hover:bg-amber-500/20"
                  aria-label="Close definition"
                >
                  ✕
                </button>
              </div>
            )}

            {/* N-9: Audio Button with explicit explanatory text */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-amber-300 py-1.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-900 transition-colors"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX aria-hidden="true" className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>Stop audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 aria-hidden="true" className="w-3.5 h-3.5 text-amber-500" />
                    <span>Listen to this story instead of reading</span>
                  </>
                )}
              </button>

              {/* Optional "Go deeper" link */}
              {act && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setShowGoDeeper((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 py-1.5 px-2"
                >
                  <span>Go deeper</span>
                  <ChevronDown aria-hidden="true" className={`w-3.5 h-3.5 transition-transform ${showGoDeeper ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Deeper Material Accordion */}
            {showGoDeeper && act && (
              <div className="p-4 rounded-2xl bg-stone-100/50 dark:bg-stone-900/40 space-y-4 pt-3 text-xs">
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-parchment-100 flex items-center gap-1.5 mb-1">
                    <ShieldAlert aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Historical Reality</span>
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {act.historicalContext}
                  </p>
                </div>

                {act.glossary && act.glossary.length > 0 && (
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-parchment-100 flex items-center gap-1.5 mb-1.5">
                      <BookOpen aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Scripture Terms Explained</span>
                    </h4>
                    <div className="space-y-1.5">
                      {act.glossary.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/60 dark:bg-black/40">
                          <span className="font-bold text-amber-800 dark:text-amber-400">{item.term}: </span>
                          <span className="text-stone-700 dark:text-stone-300">{item.ancientMeaning}</span>
                          <span className="block text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">Analogy: {item.modernAnalogy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {act.wisdomQuiz && (
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-parchment-100 flex items-center gap-1.5 mb-2">
                      <HelpCircle aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Quick Wisdom Drill</span>
                    </h4>
                    <p className="text-stone-700 dark:text-stone-300 mb-2">{act.wisdomQuiz.question}</p>
                    <div className="space-y-1.5">
                      {act.wisdomQuiz.options.map((opt, i) => {
                        const isChosen = selectedQuizIndex === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleQuizAnswer(i)}
                            className={`w-full text-left p-2.5 rounded-xl transition-all ${
                              quizSubmitted && opt.isCorrect
                                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold'
                                : quizSubmitted && isChosen && !opt.isCorrect
                                ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                                : 'bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {quizSubmitted && isChosen && (
                              <p className="text-[11px] mt-1 text-stone-600 dark:text-stone-400 font-normal">
                                {opt.explanation}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary CTA */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleAdvanceToLiveIt}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Live it today</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>

            {/* M-9: Report Issue Link */}
            <div className="pt-2 text-center border-t border-stone-200/50 dark:border-stone-800/50">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors underline-offset-2 hover:underline"
              >
                Report an issue with today's reflection
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            SCREEN 3 — LIVE IT: One verse + One action line + Done state (zero modals)
            ========================================================================= */}
        {currentScreen === 3 && (
          <motion.div
            key="screen-live-it"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* N-5: Clear, plain header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-parchment-50 leading-tight">
                Your one thing today
              </h2>
            </div>

            {/* The Verse verbatim */}
            <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono font-bold text-amber-800 dark:text-amber-400 text-xs">
                  {keyVerseRef}
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-900 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-bold">
                  Scripture (Verbatim)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-stone-900 dark:text-parchment-50 leading-relaxed">
                "{keyVerseText}"
              </p>
            </div>

            {/* The Tailored Concrete Action Line */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Today's Move</span>
                </span>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400" role="note" aria-label="AI reflection, Not Scripture">
                  <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
                </span>
              </div>
              <p className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                {personalization.actionLine}
              </p>
            </div>

            {/* Rank Promotion Announcement */}
            {rankPromotion && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-amber-500/5 text-stone-900 dark:text-parchment-50 flex items-center gap-3.5 shadow-sm"
              >
                <div aria-hidden="true" className="w-11 h-11 rounded-xl bg-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                  👑
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold block">
                    Rank Promotion Earned!
                  </span>
                  <p className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                    You advanced to {rankPromotion}!
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    Your tactical discipline and scripture retention are leveling up.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Inline Consolidated Celebration Card (ZERO MODALS) */}
            <div className="p-4 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/40 text-stone-900 dark:text-parchment-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                  <CheckCircle2 aria-hidden="true" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
                    Mission Complete
                  </div>
                  <p className="text-xs text-stone-700 dark:text-parchment-200 mt-0.5">
                    +50 Scripture XP earned • Streak updated!
                  </p>
                  {/* N-3: Plain language saved memory verse */}
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
                    {keyVerseRef} saved as today's memory verse
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs shrink-0">
                <Award aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>+50 XP</span>
              </div>
            </div>

            {/* Relic Unlocked if last act of a journey */}
            {quest && currentActIndex === quest.acts.length - 1 && quest.relicReward && (
              <div className="p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 flex items-center gap-3">
                <span aria-hidden="true" className="text-3xl shrink-0">🏆</span>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block">
                    Collection Unlocked: {quest.relicReward.name}
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    {quest.relicReward.lesson}
                  </p>
                </div>
              </div>
            )}

            {/* Shareable Completion Card Button */}
            <div>
              <button
                type="button"
                onClick={handleShareCard}
                className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-800 dark:text-parchment-200 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{copiedShareCard ? "✓ Mission card copied to clipboard!" : "Share today's mission card"}</span>
              </button>
            </div>

            {/* Exit CTA */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFinishMission}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Done</span>
                <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>

            {/* M-9: Report Issue Link */}
            <div className="pt-2 text-center border-t border-stone-200/50 dark:border-stone-800/50">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors underline-offset-2 hover:underline"
              >
                Report an issue with today's reflection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* M-9: Report Reflection Issue Modal */}
      <ReportIssueModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        contextInfo={{
          passageRef: keyVerseRef,
          heroName,
          screenName: currentScreen === 1 ? 'Decide' : currentScreen === 2 ? 'Story' : 'Live It'
        }}
      />
    </div>
  );
};
