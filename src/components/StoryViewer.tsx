import React, { useState, useEffect, useRef } from 'react';
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
  Lock 
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
  isVerseLockedIn, 
  checkRankPromotion 
} from '../utils/memoryVerseEngine';
import { getTodayDateKey } from '../utils/dailyEngine';
import { Share2 } from 'lucide-react';

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

  // Screen 1: Decide | Screen 2: Story | Screen 3: Live It
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);

  // Decision state
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [isSkipped, setIsSkipped] = useState<boolean>(false);

  // Translation toggle: default modern (CSB), KJV behind toggle
  const [useKjv, setUseKjv] = useState<boolean>(false);

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

  // Track previous mission to prevent resetting currentScreen on parent re-renders/completedActs updates
  const prevMissionIdRef = useRef(missionIdentifier);

  const [hasCompletedCurrentAct, setHasCompletedCurrentAct] = useState<boolean>(() => completedActs.includes(missionIdentifier));
  const [isVerseLocked, setIsVerseLocked] = useState<boolean>(() => isVerseLockedIn(keyVerseRef));
  const [rankPromotion, setRankPromotion] = useState<string | null>(null);
  const [copiedShareCard, setCopiedShareCard] = useState<boolean>(false);

  // Only reset screen & decision state if the actual mission/act changes
  useEffect(() => {
    if (prevMissionIdRef.current !== missionIdentifier) {
      prevMissionIdRef.current = missionIdentifier;
      setCurrentScreen(1);
      setIsSkipped(false);
      setIsCustomMode(false);
      setCustomText('');
      setQuizSubmitted(false);
      setSelectedQuizIndex(null);
      setShowGoDeeper(false);
      setIsPlayingAudio(false);
      soundEngine.stopSpeaking();
      setRankPromotion(null);
      setCopiedShareCard(false);
      setIsVerseLocked(isVerseLockedIn(keyVerseRef));
      setHasCompletedCurrentAct(completedActs.includes(missionIdentifier));

      try {
        const storedChoices = localStorage.getItem('testament_act_choices');
        if (storedChoices) {
          const parsed = JSON.parse(storedChoices);
          setSelectedChoiceId(parsed[missionIdentifier] || null);
        } else {
          setSelectedChoiceId(null);
        }
      } catch {
        setSelectedChoiceId(null);
      }

      // Default initialization
      if (dailyMission) {
        const p = getLocalDecisionPersonalization(null, dailyMission);
        setPersonalization({
          mirrorBack: p.mirrorBack,
          actionLine: p.actionLine,
          verseReference: dailyMission.keyVerseReference,
          verseText: dailyMission.keyVerseText,
          kjvVerseText: dailyMission.kjvVerseText,
          source: 'default'
        });
      } else if (act && quest) {
        setPersonalization(getLocalPersonalization(null, act, quest));
      }
    }
  }, [missionIdentifier, completedActs, quest, dailyMission, keyVerseRef, act]);

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

    // Save decision to localStorage and record as today's daily check-in (Part 6)
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

    // 2. Asynchronously request Gemini refinement if user provided an answer
    if (decisionString) {
      if (dailyMission) {
        fetchPersonalizedMirrorBack(decisionString, dailyMission)
          .then((geminiRes) => {
            if (geminiRes?.mirrorBack) {
              setPersonalization((prev) => ({
                ...prev,
                mirrorBack: geminiRes.mirrorBack,
                actionLine: geminiRes.actionLine || prev.actionLine,
                source: 'gemini'
              }));
            }
          })
          .catch(() => {});
      } else if (act && quest) {
        fetchGeminiPersonalization(decisionString, act, quest)
          .then((geminiRes) => {
            if (geminiRes?.mirrorBack) {
              setPersonalization((prev) => ({
                ...prev,
                mirrorBack: geminiRes.mirrorBack || prev.mirrorBack,
                actionLine: geminiRes.actionLine || prev.actionLine,
                source: 'gemini'
              }));
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleAdvanceToLiveIt = () => {
    soundEngine.playClick();
    setCurrentScreen(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. One verse system: mission key verse auto-becomes today's memory verse (Part 7)
    lockInMemoryVerse({
      id: keyVerseRef,
      reference: keyVerseRef,
      text: keyVerseText,
      heroName
    });
    setIsVerseLocked(true);

    // 2. Check rank promotion (Part 8)
    const prevPoints = currentXp ?? 0;
    const promotion = checkRankPromotion(prevPoints, prevPoints + 50);
    if (promotion.promoted) {
      setRankPromotion(promotion.newRank);
    }

    // Trigger celebration state
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback if confetti worker encounters restrictions
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

  const handleLockInVerse = () => {
    soundEngine.playSnap();
    lockInMemoryVerse({
      id: keyVerseRef,
      reference: keyVerseRef,
      text: keyVerseText,
      heroName
    });
    setIsVerseLocked(true);
  };

  const handleShareCard = async () => {
    soundEngine.playSnap();
    const userChoiceText = getDecisionString() || 'Faced today\'s crossroad';
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

  const handleQuizAnswer = (idx: number) => {
    soundEngine.playSnap();
    setSelectedQuizIndex(idx);
    setQuizSubmitted(true);
    if (act?.wisdomQuiz?.options[idx]?.isCorrect) {
      soundEngine.playVictory();
      onRewardXP?.(20);
    }
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
              onBack();
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 py-1.5 px-2.5 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentScreen === 1 ? 'Exit' : 'Back'}</span>
        </button>

        {/* 3-Step Pill Tracker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
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
          <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider ml-1">
            {currentScreen === 1 ? '1. Decide' : currentScreen === 2 ? '2. Story' : '3. Live It'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* =========================================================================
            SCREEN 1 — DECIDE: The Scenario Question & Nuanced Preset Answers
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
            {/* Context Micro-Tag & Reflection Badge */}
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                  {missionTitle}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  ✨ Reflection, not Scripture
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-snug mt-1">
                "{scenarioQuestion}"
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5">
                Pick your instinct before seeing what {heroName} actually did.
              </p>
            </div>

            {/* Nuanced Preset Choices (Never a binary right/wrong pair) */}
            <div className="space-y-2.5">
              {presetChoices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id && !isCustomMode;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleSelectPresetChoice(choice.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 dark:bg-amber-500/20 text-stone-950 dark:text-parchment-50 ring-2 ring-amber-500/60 shadow-xs'
                        : 'bg-stone-100/70 hover:bg-stone-200/60 dark:bg-stone-900/60 dark:hover:bg-stone-850/80 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-amber-500 text-stone-950 font-bold' 
                          : 'border border-stone-400 dark:border-stone-600'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 bg-stone-950 rounded-full" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {choice.text}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* First-class Option: "In your own words" */}
              <div
                onClick={handleSelectCustomMode}
                className={`w-full p-4 rounded-2xl transition-all cursor-pointer ${
                  isCustomMode
                    ? 'bg-amber-500/15 dark:bg-amber-500/20 text-stone-950 dark:text-parchment-50 ring-2 ring-amber-500/60 shadow-xs'
                    : 'bg-stone-100/70 hover:bg-stone-200/60 dark:bg-stone-900/60 dark:hover:bg-stone-850/80 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                    isCustomMode 
                      ? 'bg-amber-500 text-stone-950 font-bold' 
                      : 'border border-stone-400 dark:border-stone-600'
                  }`}>
                    {isCustomMode && <span className="w-1.5 h-1.5 bg-stone-950 rounded-full" />}
                  </div>
                  <div className="w-full">
                    <span className="text-xs sm:text-sm font-medium leading-relaxed block mb-2">
                      In your own words:
                    </span>
                    <input
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
                      maxLength={140}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-ink text-stone-900 dark:text-parchment-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    {/* Privacy Note */}
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>Responses stay private and are only used to shape today's mission.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 space-y-3">
              <button
                type="button"
                disabled={!isDecisionReady}
                onClick={() => handleAdvanceToStory(false)}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  isDecisionReady
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span>See what happened</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleAdvanceToStory(true)}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-amber-400 transition-colors py-1 px-3"
                >
                  Skip decision & see what happened →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            SCREEN 2 — STORY: What actually happened, ≤150 words, key verse verbatim
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
            {/* Gemini Personalization Mirror-back Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-left">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Your Call Connected
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                      ✨ AI reflection • Not Scripture
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                    {personalization.mirrorBack}
                  </p>
                </div>
              </div>
            </div>

            {/* Story Header */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                  {heroName}'s Story
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200/50 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  ✨ Plain modern retelling • Not Scripture
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                What Actually Happened
              </h2>
            </div>

            {/* Modern Plain English Story Narrative (≤150 words, short paragraphs) */}
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-800 dark:text-parchment-100 leading-relaxed font-reading">
              {storyRetelling.map((para, i) => (
                <p key={i}>
                  {para}
                </p>
              ))}
            </div>

            {/* Key Verse Verbatim (VERBATIM SCRIPTURE) */}
            <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                    {keyVerseRef}
                  </span>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
                    Scripture (Verbatim)
                  </span>
                </div>

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

              <blockquote className="text-xs sm:text-sm font-serif italic text-stone-900 dark:text-parchment-50 leading-relaxed border-l-2 border-amber-500/60 pl-3">
                "{useKjv ? personalization.kjvVerseText : keyVerseText}"
              </blockquote>
            </div>

            {/* Secondary Option: Listen Instead Audio Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-amber-300 py-1.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-900 transition-colors"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>Stop audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Listen instead</span>
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
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGoDeeper ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Deeper Material Accordion (for acts with historical notes & glossary) */}
            {showGoDeeper && act && (
              <div className="p-4 rounded-2xl bg-stone-100/50 dark:bg-stone-900/40 space-y-4 pt-3 text-xs">
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-parchment-100 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Historical Reality</span>
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {act.historicalContext}
                  </p>
                </div>

                {act.glossary && act.glossary.length > 0 && (
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-parchment-100 flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            SCREEN 3 — LIVE IT: One verse + One action line + Done state (zero modals!)
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
            {/* Header */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                Today's Takeaway
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight mt-0.5">
                Take This Into Your Day
              </h2>
            </div>

            {/* The Verse verbatim */}
            <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  {keyVerseRef}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  Scripture (Verbatim)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-stone-900 dark:text-parchment-50 leading-relaxed mb-3">
                "{keyVerseText}"
              </p>

              {/* One-tap Lock-in Button (Part 7: Memory Verse Unification) */}
              <button
                type="button"
                onClick={handleLockInVerse}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isVerseLocked
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isVerseLocked ? "✓ Locked in as today's memory verse" : "Lock it in as memory verse"}</span>
              </button>
            </div>

            {/* The Tailored Concrete Action Line */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Today's Move</span>
                </span>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                  ✨ AI reflection • Not Scripture
                </span>
              </div>
              <p className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                {personalization.actionLine}
              </p>
            </div>

            {/* Rank Promotion Announcement (Part 8: Rank changes announced, never silent) */}
            {rankPromotion && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-amber-500/5 text-stone-900 dark:text-parchment-50 flex items-center gap-3.5 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                  👑
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold block">
                    Rank Promotion Earned!
                  </span>
                  <p className="text-sm font-serif font-black text-stone-900 dark:text-parchment-50">
                    You advanced to {rankPromotion}!
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    Your tactical discipline and scripture retention are leveling up.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Inline Completion & Reward State (ZERO MODALS) */}
            <div className="p-4 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/40 text-stone-900 dark:text-parchment-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
                    Mission Complete
                  </div>
                  <p className="text-xs text-stone-700 dark:text-parchment-200 mt-0.5">
                    +50 Scripture XP earned • Streak updated!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs shrink-0">
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>+50 XP</span>
              </div>
            </div>

            {/* Relic Unlocked if last act of a journey */}
            {quest && currentActIndex === quest.acts.length - 1 && quest.relicReward && (
              <div className="p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 flex items-center gap-3">
                <span className="text-3xl shrink-0">🏆</span>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block">
                    Relic Unlocked: {quest.relicReward.name}
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    {quest.relicReward.lesson}
                  </p>
                </div>
              </div>
            )}

            {/* Shareable Completion Card Button (Part 9) */}
            <div>
              <button
                type="button"
                onClick={handleShareCard}
                className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-800 dark:text-parchment-200 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
                <span>Finish today's mission</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
