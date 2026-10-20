import React, { useState, useEffect } from 'react';
import type { StoryQuest } from '../types';
import { STORY_QUESTS } from '../data/stories';
import { TodayStoryStrip } from './TodayStoryStrip';
import { soundEngine } from '../utils/audio';
import { 
  Flame, 
  Award, 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Play, 
  Pause, 
  Settings,
  RotateCw,
  Check,
  CheckCircle2,
  BookMarked,
  Users,
  ShieldCheck,
  Sparkles,
  Compass
} from 'lucide-react';
import { SeriesPickerModal } from './SeriesPickerModal';
import { getActiveSeriesState, getSeriesDayNumber, type ActiveSeriesState } from '../utils/weeklySeriesEngine';
import { getWeeklySeriesById } from '../data/weeklySeries';
import type { UserCalibrationProfile } from './OnboardingModal';
import { useLanguage } from '../context/LanguageContext';
import type { DailyCampaignStep } from '../data/dailyCampaigns';
import { getComposedDailyMission } from '../utils/missionComposer';
import { 
  getTodayFormatted, 
  getTodayBattlefieldId,
  getTodayDateKey,
} from '../utils/dailyEngine';
import { getDueFSRSCards, getDueFSRSCount } from '../utils/fsrsEngine';
import { loadReadingPlace } from '../utils/readingPlace';
import { 
  getDailyMissionSync, 
  getDailyMission, 
  type GeneratedDailyMission 
} from '../utils/dailyMissionPipeline';
import { 
  getYesterdayRecallVerse, 
  markYesterdayRecallComplete, 
  type MemoryVerseData 
} from '../utils/memoryVerseEngine';
import { CalendarRemindersModal } from './CalendarRemindersModal';
import { CHARACTER_ARCS } from '../data/characterArcs';
import { ReciterModal } from './ReciterModal';
import { StorytellerModal } from './StorytellerModal';
import { 
  loadLearnerModesState, 
  getOrInitReciterVerse 
} from '../utils/learnerModes';
import { formatSpaced } from '../utils/textUtils';
import type { LearnerModesState } from '../types/learnerModes';
import { APP_VERSION } from '../config/version';

interface DashboardProps {
  onSelectQuest: (quest: StoryQuest) => void;
  onStartDailyMission?: (mission: GeneratedDailyMission) => void;
  onPlayStory?: (storyId: string) => void;
  onOpenWordForge: (verseId?: string) => void;
  onOpenArsenal?: () => void;
  onOpenDilemmas?: () => void;
  onOpenProverbs?: () => void;
  onOpenPsalms?: () => void;
  onOpenLibrary?: () => void;
  onContinueReading?: () => void;
  completedActs: string[];
  memorizedVerses: string[];
  unlockedRelics?: string[];
  streakCount: number;
  xp: number;
  currentAmbience?: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience?: (type: 'campfire' | 'wind' | 'sanctuary') => void;
  userProfile?: UserCalibrationProfile | null;
  onOpenOnboarding?: () => void;
  onOpenWhatsNew?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenSettings?: () => void;
  onRewardXP?: (points: number) => void;
  onLaunchCampaignStep?: (step: DailyCampaignStep) => void;
}

const RELIC_ICONS: Record<string, string> = {
  basin: '🥣',
  stones: '🪨',
  staff: '🪵',
  mantle: '🧥',
  signet: '💍',
  brazier: '🔥',
  stocks: '⛓️',
  scepter: '🪄',
  trowel: '🔨',
  torch: '🏺',
  anchor: '⚓',
  sheaf: '🌾',
  trumpet: '📯',
  belt: '🥋',
};

const ALL_RELICS = STORY_QUESTS.filter(q => q.relicReward).map(q => ({
  id: q.relicReward!.id,
  name: q.relicReward!.name,
  character: q.heroName,
  icon: RELIC_ICONS[q.relicReward!.iconName] || '⚔️',
  desc: q.relicReward!.lesson,
}));

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectQuest,
  onOpenWordForge,
  onOpenLibrary,
  onContinueReading,
  completedActs,
  unlockedRelics = [],
  streakCount,
  xp: _xp,
  onOpenWhatsNew,
  onOpenOnboarding,
  onOpenHowItWorks,
  onOpenSettings,
  onStartDailyMission,
  onPlayStory,
  onRewardXP
}) => {
  const { language, t } = useLanguage();

  const [readingPlace, setReadingPlace] = useState(() => loadReadingPlace());
  const [activeBattlefieldId, setActiveBattlefieldId] = useState<string | null>(() => getTodayBattlefieldId());
  const [dailyMission, setDailyMission] = useState<GeneratedDailyMission>(() => 
    getDailyMissionSync(getTodayDateKey(), 0, activeBattlefieldId)
  );
  const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);
  const [showRelics, setShowRelics] = useState<boolean>(false);

  // Part 7: Memory verse unification — Yesterday's recall card
  const [yesterdayVerse, setYesterdayVerse] = useState<MemoryVerseData | null>(() => getYesterdayRecallVerse());
  const [isYesterdayFlipped, setIsYesterdayFlipped] = useState<boolean>(false);
  const [yesterdayRecalled, setYesterdayRecalled] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Learner Modes State (Builder, Reciter, Storyteller)
  const [learnerModesState, setLearnerModesState] = useState<LearnerModesState>(() => loadLearnerModesState());
  const [showReciterModal, setShowReciterModal] = useState<boolean>(false);
  const [showStorytellerModal, setShowStorytellerModal] = useState<boolean>(false);

  // Weekly Series State
  const [activeSeriesState, setActiveSeriesState] = useState<ActiveSeriesState | null>(() => getActiveSeriesState());
  const [showSeriesPicker, setShowSeriesPicker] = useState<boolean>(false);

  useEffect(() => {
    const handleSeriesChange = () => {
      const state = getActiveSeriesState();
      setActiveSeriesState(state);
      const dateKey = getTodayDateKey();
      try {
        localStorage.removeItem(`testament_daily_generated_mission_${dateKey}`);
      } catch {
        // ignore
      }
      setDailyMission(getDailyMissionSync(dateKey, 0, activeBattlefieldId));
    };
    window.addEventListener('testament-series-changed', handleSeriesChange);
    return () => window.removeEventListener('testament-series-changed', handleSeriesChange);
  }, [activeBattlefieldId]);

  useEffect(() => {
    const handleModeUpdate = () => {
      setLearnerModesState(loadLearnerModesState());
    };
    const handleOpenReminders = () => setShowCalendarModal(true);
    const handleOpenRelics = () => setShowRelics(true);

    window.addEventListener('testament-mode-changed', handleModeUpdate);
    window.addEventListener('testament-open-reminders', handleOpenReminders);
    window.addEventListener('testament-open-relics', handleOpenRelics);

    return () => {
      window.removeEventListener('testament-mode-changed', handleModeUpdate);
      window.removeEventListener('testament-open-reminders', handleOpenReminders);
      window.removeEventListener('testament-open-relics', handleOpenRelics);
    };
  }, []);

  const [currentDateKey, setCurrentDateKey] = useState<string>(() => getTodayDateKey());

  useEffect(() => {
    let isMounted = true;
    getDailyMission(currentDateKey, 0, activeBattlefieldId).then((m) => {
      if (isMounted) setDailyMission(m);
    });
    return () => {
      isMounted = false;
    };
  }, [currentDateKey, activeBattlefieldId]);

  // Midnight rollover listener: automatically refreshes mission when rolling over to a new day
  useEffect(() => {
    const checkDateRollover = () => {
      const today = getTodayDateKey();
      if (today !== currentDateKey) {
        setCurrentDateKey(today);
        setDailyMission(getDailyMissionSync(today, 0, activeBattlefieldId));
        getDailyMission(today, 0, activeBattlefieldId).then((m) => setDailyMission(m));
        setYesterdayVerse(getYesterdayRecallVerse());
      }
    };

    const interval = setInterval(checkDateRollover, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDateRollover();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkDateRollover);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkDateRollover);
    };
  }, [currentDateKey, activeBattlefieldId]);

  useEffect(() => {
    const handleRecallUpdate = () => {
      setYesterdayVerse(getYesterdayRecallVerse());
    };
    window.addEventListener('testament-yesterday-recalled-updated', handleRecallUpdate);
    window.addEventListener('testament-memory-verse-locked', handleRecallUpdate);
    return () => {
      window.removeEventListener('testament-yesterday-recalled-updated', handleRecallUpdate);
      window.removeEventListener('testament-memory-verse-locked', handleRecallUpdate);
    };
  }, []);

  useEffect(() => {
    const refresh = () => setReadingPlace(loadReadingPlace());
    window.addEventListener('testament-reading-place', refresh);
    refresh();
    return () => window.removeEventListener('testament-reading-place', refresh);
  }, []);

  useEffect(() => {
    const handleBattlefieldChanged = (e: Event) => {
      const custom = e as CustomEvent;
      setActiveBattlefieldId(custom.detail?.battlefieldId ?? getTodayBattlefieldId());
    };
    window.addEventListener('testament-battlefield-changed', handleBattlefieldChanged);
    return () => window.removeEventListener('testament-battlefield-changed', handleBattlefieldChanged);
  }, []);

  const todayFormatted = getTodayFormatted(language);
  const dueFSRSCount = getDueFSRSCount();
  const composedMission = getComposedDailyMission();

  // Find the target quest and act for fallback or explore drawer
  const featuredQuest = STORY_QUESTS.find(q => q.id === (composedMission.questId || 'david-journey')) 
    || STORY_QUESTS.find(q => q.id === 'david-journey') 
    || STORY_QUESTS[0];

  const isTodayMissionDone = completedActs.includes(dailyMission.id);

  // Weekly Series resolution
  const activeSeries = activeSeriesState ? getWeeklySeriesById(activeSeriesState.seriesId) : null;
  const activeSeriesDay = activeSeriesState ? getSeriesDayNumber(activeSeriesState) : 1;

  // Feature 6: Cross-link today's mission with character arcs
  const matchedCharacterArc = CHARACTER_ARCS.find(arc => 
    arc.name.toLowerCase() === dailyMission.heroName.toLowerCase() ||
    dailyMission.heroName.toLowerCase().includes(arc.name.toLowerCase()) ||
    arc.moments.some(m => m.passageReference.toLowerCase().includes(dailyMission.passageReference.toLowerCase()) || dailyMission.passageReference.toLowerCase().includes(m.passageReference.toLowerCase()))
  );
  const matchedMomentIndex = matchedCharacterArc 
    ? matchedCharacterArc.moments.findIndex(m => m.passageReference.toLowerCase().includes(dailyMission.passageReference.toLowerCase()) || dailyMission.passageReference.toLowerCase().includes(m.passageReference.toLowerCase()))
    : -1;

  const handleStartMission = () => {
    soundEngine.playClick();
    if (onStartDailyMission) {
      onStartDailyMission(dailyMission);
    } else {
      onSelectQuest(featuredQuest);
    }
  };

  const handlePlayBriefing = () => {
    soundEngine.playClick();
    if (isPlayingBriefing) {
      soundEngine.stopSpeaking();
      setIsPlayingBriefing(false);
      return;
    }
    setIsPlayingBriefing(true);
    // Read the actual card on screen: Hero, scenario question, story retelling, key verse
    const storyExcerpt = dailyMission.storyRetelling?.slice(0, 2).join(' ') || '';
    const textToRead = `${dailyMission.heroName}. ${dailyMission.scenarioQuestion}. ${storyExcerpt} Scripture anchor from ${dailyMission.keyVerseReference}: "${dailyMission.keyVerseText}". Today's move: ${dailyMission.actionLine}`;
    soundEngine.speakVerse(textToRead, () => {
      setIsPlayingBriefing(false);
    });
  };

  const handleYesterdayRecallResponse = (rating: 'got_it' | 'need_review') => {
    if (!yesterdayVerse) return;
    soundEngine.playSnap();
    markYesterdayRecallComplete(yesterdayVerse.reference, rating);
    setYesterdayRecalled(true);
    if (rating === 'got_it') {
      soundEngine.playVictory();
      onRewardXP?.(10);
    } else {
      onOpenWordForge(yesterdayVerse.reference);
    }
  };

  return (
    <div className="max-w-2xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-2 md:pb-12 text-left transition-colors relative">
      
      {/* Subtle Desktop Background Intent */}
      <div aria-hidden="true" className="hidden lg:block absolute -top-8 right-8 text-[11rem] font-serif font-black text-amber-500/[0.03] dark:text-amber-400/[0.02] pointer-events-none select-none tracking-tighter leading-none -z-10">
        TESTAMENT
      </div>
      <div aria-hidden="true" className="hidden lg:block absolute top-16 left-12 w-96 h-96 bg-amber-400/[0.035] dark:bg-amber-500/[0.025] rounded-full blur-3xl pointer-events-none -z-10" />

      <TodayStoryStrip onPlay={onPlayStory} />

      {/* =========================================================================
          TOP BAR: Mobile Status Bar (Hidden on md/lg desktop where top nav is unified)
          ========================================================================= */}
      <div className="flex xl:hidden items-center justify-between gap-3 mb-5">
        {/* Left: Emblem & Brand Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs bg-stone-100 dark:bg-stone-900 shrink-0">
            <img
              src="/icons/icon-64.webp"
              srcSet="/icons/icon-64.webp 64w, /icons/icon-128.webp 128w"
              width={40}
              height={40}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-label font-bold text-amber-800 dark:text-amber-400">
                Testament
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenWhatsNew?.();
                }}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -my-2 px-1.5 rounded-full text-[11px] font-mono text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-amber-300 transition-colors"
                title={t('dashboard.versionTooltip')}
                aria-label={t('dashboard.versionTooltip')}
              >
                {APP_VERSION}
              </button>
            </div>
            <h1 className="text-title-1 text-stone-900 dark:text-parchment-100 leading-tight mt-0.5">
              {t('nav.home')}
            </h1>
            {/* N-1: No truncated kicker on 390px screens */}
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              <span className="text-amber-700 dark:text-amber-400 font-medium">{todayFormatted}</span>
              {' '}•{' '}
              <span>Daily mission</span>
            </p>
          </div>
        </div>

        {/* Right: Streak, Single Settings Entry */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          {streakCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowCalendarModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/60 hover:bg-stone-300/70 dark:bg-stone-900 dark:hover:bg-stone-850 text-xs font-mono font-bold text-orange-700 dark:text-orange-300 transition-colors cursor-pointer"
              title="Daily Streak • Tap to set daily reminder"
              role="status"
              aria-label={`${streakCount} day streak`}
            >
              <Flame aria-hidden="true" className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
              <span>{streakCount}d</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowCalendarModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/40 hover:bg-stone-200/70 dark:bg-stone-900/60 dark:hover:bg-stone-850 text-xs font-mono font-medium text-stone-500 dark:text-stone-400 transition-colors cursor-pointer"
              title="Start your streak today • Tap to set daily reminder"
              role="status"
              aria-label="Fresh start"
            >
              <Flame aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span>Fresh start</span>
            </button>
          )}

          {/* XP/rank display removed: progress is the deck and the map. */}

          {/* Settings Entry (44x44 touch target) */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                window.dispatchEvent(new CustomEvent('testament-open-settings'));
              }
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer bg-stone-200/60 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-parchment-50"
            title="Settings"
            aria-label="Settings"
          >
            <Settings aria-hidden="true" className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Responsive Desktop 2-Column Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* Left Column: Hero Mission, Weekly Series Showcase, Key Features Hub */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 lg:space-y-6">
          {/* =========================================================================
              PART 1 — HOMEPAGE: HERO MISSION CARD
              ========================================================================= */}
          <div className="p-6 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-stone-100/50 dark:to-stone-900/40 shadow-xs transition-colors">
            {/* Micro-tag with AI Reflection Badge */}
            <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
              <span className="text-[11px] lg:text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                {formatSpaced(["Today's Mission", "•", `${dailyMission.heroName} (${dailyMission.passageReference})`])}
              </span>
              <span className="text-[10px] lg:text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full shrink-0" role="note" aria-label="AI reflection, Not Scripture">
                <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
              </span>
            </div>

            {/* The Decision-First Scenario Question */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-snug lg:leading-tight mb-3.5">
              "{dailyMission.scenarioQuestion}"
            </h2>

            {/* Plain, encouraging subtext or Done card */}
            {isTodayMissionDone ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-fg space-y-2 mb-5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                  <CheckCircle2 aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Done for today • {dailyMission.keyVerseReference}</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-700 dark:text-parchment-100 font-serif font-medium leading-relaxed">
                  <strong className="font-mono text-[10px] uppercase tracking-wide text-emerald-800 dark:text-emerald-300 block mb-0.5">Today's Move:</strong>
                  {dailyMission.actionLine}
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-5 max-w-xl">
                No 40-minute reading plans. Just today's decision: what would you do before seeing what {dailyMission.heroName} did?
              </p>
            )}

            {/* Action Row: Start mission CTA + 45s audio story */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleStartMission}
                className="btn-gold flex-1 sm:flex-initial px-7 lg:px-8 py-3.5 lg:py-4 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isTodayMissionDone ? 'Review today\'s mission' : t('dashboard.startTodayMission')}</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </button>

              {/* Mode-specific primary lens CTA */}
              {learnerModesState.activeMode === 'reciter' && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setShowReciterModal(true);
                  }}
                  className="px-5 py-3.5 lg:py-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Recite Verse (Day {getOrInitReciterVerse(getTodayDateKey()).dayNumber})</span>
                </button>
              )}

              {learnerModesState.activeMode === 'storyteller' && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setShowStorytellerModal(true);
                  }}
                  className="px-5 py-3.5 lg:py-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Tell story in your words</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePlayBriefing}
                className="px-5 py-3.5 lg:py-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                aria-label={isPlayingBriefing ? "Pause 45-second audio story" : "Listen to today's 45-second audio story"}
              >
                {isPlayingBriefing ? (
                  <>
                    <Pause aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t('dashboard.pauseStory')}</span>
                  </>
                ) : (
                  <>
                    <Play aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t('dashboard.listen45s')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Feature 6: Cross-link to character arc if matched */}
            {matchedCharacterArc && (
              <div className="mt-4 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    window.dispatchEvent(new CustomEvent('testament-open-people', {
                      detail: {
                        characterId: matchedCharacterArc.id,
                        momentIndex: matchedMomentIndex >= 0 ? matchedMomentIndex : 0
                      }
                    }));
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-300 hover:underline font-medium cursor-pointer"
                >
                  <span>
                    Part of {matchedCharacterArc.name}'s story arc {matchedMomentIndex >= 0 ? `(Moment ${matchedMomentIndex + 1} of ${matchedCharacterArc.moments.length})` : ''} →
                  </span>
                </button>
              </div>
            )}
          </div>

          {activeSeries ? (
            <div className="rounded-2xl border border-accent/35 bg-accent/5 p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-accent-text font-bold">
                    {t('dashboard.activeSeries')}
                  </p>
                  <h3 className="text-base font-serif font-bold text-fg leading-tight mt-0.5 truncate">
                    {activeSeries.heroName}
                  </h3>
                  <p className="text-xs text-fg-muted mt-1 line-clamp-2">{activeSeries.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setShowSeriesPicker(true);
                  }}
                  className="shrink-0 text-xs font-semibold text-accent-text min-h-[40px] px-2.5 rounded-lg hover:bg-accent/10"
                >
                  {t('dashboard.changeSeries')}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-fg-muted">
                  <span className="font-medium">{t('series.dayOfSeven', { day: activeSeriesDay })}</span>
                </div>
                <div className="flex items-center gap-1" aria-hidden>
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                    <div
                      key={dayNum}
                      className={`h-1.5 flex-1 rounded-full ${
                        dayNum <= activeSeriesDay ? 'bg-accent' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartMission}
                className="btn-primary w-full !max-w-none text-sm"
              >
                {isTodayMissionDone
                  ? t('series.reviewDay', { day: activeSeriesDay })
                  : t('series.jumpDay', { day: activeSeriesDay })}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playSnap();
                setShowSeriesPicker(true);
              }}
              className="w-full flex items-center gap-3 rounded-2xl border border-line bg-surface-raised dark:bg-stone-900 px-4 py-3.5 text-left hover:border-accent/40 transition-colors min-h-[60px]"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-text font-bold">
                  {t('library.seriesBadge')}
                </div>
                <div className="text-sm font-semibold text-fg">{t('series.pickWeek')}</div>
                <p className="text-[11px] text-fg-muted mt-0.5 line-clamp-1">{t('series.pickWeekHint')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent shrink-0" />
            </button>
          )}

      {/* =========================================================================
          MORE SECTION: Collapsed by default for a simpler, calmer home
          ========================================================================= */}
      <details className="mt-4 rounded-2xl bg-stone-100/50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60 group transition-all">
        <summary className="p-3.5 sm:p-4 text-xs font-mono font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer list-none flex items-center justify-between select-none">
          <span className="flex items-center gap-2">
            <span>More tools & reflections</span>
          </span>
          <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 group-open:rotate-90 transition-transform">▸</span>
        </summary>
        <div className="p-3.5 sm:p-4 pt-0 border-t border-stone-200/40 dark:border-stone-800/40 space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-3">
            {/* Card 1: Decision Journal */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                window.dispatchEvent(new CustomEvent('testament-open-journal'));
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookMarked aria-hidden="true" className="w-4 h-4" />
                </div>
                <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 block leading-tight mb-0.5">
                  Decision Journal
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                  Your private reflections
                </span>
              </div>
            </button>

            {/* Card 2: Character Arcs */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                window.dispatchEvent(new CustomEvent('testament-open-people'));
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users aria-hidden="true" className="w-4 h-4" />
                </div>
                <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 block leading-tight mb-0.5">
                  Character Arcs
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                  Follow biblical journeys
                </span>
              </div>
            </button>

            {/* Card 3: Collection */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSnap();
                setShowRelics(prev => !prev);
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                showRelics 
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-xs' 
                  : 'bg-white dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-850 border-stone-200/70 dark:border-stone-800/70 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Award aria-hidden="true" className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-500/10">
                  {unlockedRelics.length}/{ALL_RELICS.length}
                </span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 block leading-tight mb-0.5">
                  Collection
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                  {showRelics ? 'Hide milestones' : 'Milestone rewards'}
                </span>
              </div>
            </button>

            {/* Card 4: How Testament Works */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                if (onOpenHowItWorks) onOpenHowItWorks();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck aria-hidden="true" className="w-4 h-4" />
                </div>
                <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 block leading-tight mb-0.5">
                  How It Works
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                  Translations & privacy
                </span>
              </div>
            </button>

            {/* Card 5: Calibration / Onboarding */}
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenOnboarding();
                }}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Compass aria-hidden="true" className="w-4 h-4" />
                  </div>
                  <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 block leading-tight mb-0.5">
                    Calibration
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                    Re-tune preferences
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Relics / Collection Drawer (Expands right below the grid when tapped) */}
          {showRelics && (
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-amber-500/30 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block">
                  Unlocked Collection ({unlockedRelics.length}/{ALL_RELICS.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowRelics(false)}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -my-2 -mr-1 px-2 rounded-lg text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Milestones you unlock as you complete daily missions.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {ALL_RELICS.map((relic) => {
                  const isUnlocked = unlockedRelics.includes(relic.id);
                  return (
                    <div
                      key={relic.id}
                      className={`p-2.5 rounded-xl text-xs transition-colors ${
                        isUnlocked
                          ? 'bg-amber-500/15 text-stone-900 dark:text-parchment-50 font-medium'
                          : 'bg-stone-200/40 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 opacity-60'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{relic.icon}</div>
                      <span className="font-bold block truncate">{relic.name}</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">{relic.character}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </details>
    </div>

        {/* =========================================================================
            RIGHT RAIL (Desktop lg:col-span-5) / Stacked Below on Mobile:
            PART 7: YESTERDAY'S VERSE RECALL CARD
            ========================================================================= */}
        <div className="mt-6 lg:mt-0 lg:col-span-5 xl:col-span-5 space-y-5">
        {yesterdayVerse && !yesterdayRecalled && (
          <div className="p-5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
                <RotateCw aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Remember yesterday's verse?</span>
              </span>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                1-tap recall
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-parchment-50">
                {yesterdayVerse.reference}
              </h3>
              {yesterdayVerse.heroName && (
                <span className="text-xs text-stone-500 dark:text-stone-400 font-serif">
                  ({yesterdayVerse.heroName})
                </span>
              )}
            </div>

            {!isYesterdayFlipped ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSnap();
                  setIsYesterdayFlipped(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Tap to reveal & check your recall</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-3 pt-1">
                <blockquote className="text-xs sm:text-sm font-serif italic text-stone-800 dark:text-parchment-100 leading-relaxed border-l-2 border-amber-500/60 pl-3">
                  "{yesterdayVerse.text}"
                </blockquote>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleYesterdayRecallResponse('got_it')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Got it!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleYesterdayRecallResponse('need_review')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <span>Need review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plain Language Review Banner: "X verses to review" (Framed as Optional Bonus) */}
        {dueFSRSCount > 0 && (
          <button
            type="button"
            onClick={() => onOpenWordForge(getDueFSRSCards()[0]?.verseId)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-850/80 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-parchment-50 block">
                  {dueFSRSCount} {dueFSRSCount === 1 ? 'verse' : 'verses'} to review
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Optional bonus • Quick retrieval before memory fades
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
          </button>
        )}

        {/* Continue Reading Shortcut (if in progress) */}
        {readingPlace && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playSnap();
              if (onContinueReading) onContinueReading();
              else onOpenLibrary?.();
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-850/80 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold block">
                  Continue Reading
                </span>
                <span className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-50">
                  {readingPlace.bookName} {readingPlace.chapter}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
          </button>
        )}

        {/* Starter Toolkit: keeps the desktop right rail balanced and meaningful
            whenever there is no recall/review/continue content to show yet. */}
        {!(yesterdayVerse && !yesterdayRecalled) && dueFSRSCount === 0 && !readingPlace && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-stone-100/60 to-stone-100/30 dark:from-amber-500/10 dark:via-stone-900/60 dark:to-stone-900/40 border border-stone-200/80 dark:border-stone-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Your toolkit</span>
            </span>
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-parchment-50 mt-2 mb-1.5">
              Start anywhere, no pressure
            </h3>
            <p className="text-xs lg:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Pick a path below. Missed a day? Fresh start is always one tap away — no streaks to lose.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenLibrary?.()}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-850/80 text-left transition-all"
              >
                <span className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-parchment-100">
                  <BookOpen aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Browse the 66-book library
                </span>
                <ArrowRight aria-hidden="true" className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onOpenWordForge()}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-850/80 text-left transition-all"
              >
                <span className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-parchment-100">
                  <Brain aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Practice a verse in Memorize
                </span>
                <ArrowRight aria-hidden="true" className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onOpenHowItWorks?.()}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-850/80 text-left transition-all"
              >
                <span className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-parchment-100">
                  <Sparkles aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  How Testament works
                </span>
                <ArrowRight aria-hidden="true" className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Feature 8: Calendar Reminders Modal */}
      <CalendarRemindersModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      {/* Mode B: Reciter Modal */}
      <ReciterModal
        isOpen={showReciterModal}
        onClose={() => setShowReciterModal(false)}
        verseState={getOrInitReciterVerse(getTodayDateKey())}
        knownVerses={learnerModesState.reciter.knownVerses}
        onProgressUpdated={() => setLearnerModesState(loadLearnerModesState())}
        onRewardXP={onRewardXP}
        todayDateStr={getTodayDateKey()}
      />

      {/* Mode C: Storyteller Modal */}
      <StorytellerModal
        isOpen={showStorytellerModal}
        onClose={() => setShowStorytellerModal(false)}
        passageReference={dailyMission.passageReference}
        heroName={dailyMission.heroName}
        faithfulRetelling={dailyMission.storyRetelling}
        todayDateKey={getTodayDateKey()}
      />

      {/* Weekly Series Picker Modal */}
      <SeriesPickerModal
        isOpen={showSeriesPicker}
        onClose={() => setShowSeriesPicker(false)}
        onSeriesSelected={(_seriesId) => {
          const state = getActiveSeriesState();
          setActiveSeriesState(state);
          const dateKey = getTodayDateKey();
          const nextMission = getDailyMissionSync(dateKey, 0, activeBattlefieldId);
          setDailyMission(nextMission);
          // Mission launch is handled by App via testament-launch-series-day
        }}
      />
    </div>
  );
};
