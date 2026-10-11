import React, { useState, useEffect } from 'react';
import type { StoryQuest } from '../types';
import { STORY_QUESTS } from '../data/stories';
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
  BookMarked,
  Users,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { SeriesPickerModal } from './SeriesPickerModal';
import { getActiveSeriesState, getSeriesDayNumber, type ActiveSeriesState } from '../utils/weeklySeriesEngine';
import { getWeeklySeriesById } from '../data/weeklySeries';
import type { UserCalibrationProfile } from './OnboardingModal';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import type { DailyCampaignStep } from '../data/dailyCampaigns';
import { getComposedDailyMission } from '../utils/missionComposer';
import { 
  getTodayFormatted, 
  getDailyVerse, 
  getDailyBriefing,
  getTodayBattlefieldId,
  getTodayDateKey,
} from '../utils/dailyEngine';
import { getDueFSRSCards, getDueFSRSCount } from '../utils/fsrsEngine';
import { loadReadingPlace } from '../utils/readingPlace';
import { BATTLEFIELD_OPTIONS } from './BattlefieldCheckInModal';
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
import { TomorrowTeaserCard } from './TomorrowTeaserCard';
import { DecisionJournalModal } from './DecisionJournalModal';
import { WeeklyRecapCard } from './WeeklyRecapCard';
import { CharacterArcModal } from './CharacterArcModal';
import { CalendarRemindersModal } from './CalendarRemindersModal';
import { SettingsModal } from './SettingsModal';
import { CHARACTER_ARCS } from '../data/characterArcs';
import { ModeSelectorModal } from './ModeSelectorModal';
import { ReciterModal } from './ReciterModal';
import { StorytellerModal } from './StorytellerModal';
import { 
  loadLearnerModesState, 
  setLearnerMode, 
  getOrInitReciterVerse 
} from '../utils/learnerModes';
import { formatSpaced } from '../utils/textUtils';
import type { LearnerModesState } from '../types/learnerModes';

interface DashboardProps {
  onSelectQuest: (quest: StoryQuest) => void;
  onStartDailyMission?: (mission: GeneratedDailyMission) => void;
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
  xp,
  onOpenWhatsNew,
  onOpenOnboarding,
  onOpenHowItWorks,
  onOpenSettings,
  onStartDailyMission,
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
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [showPeopleModal, setShowPeopleModal] = useState<boolean>(false);
  const [selectedCharacterArcId, setSelectedCharacterArcId] = useState<string | undefined>(undefined);
  const [selectedMomentIndex, setSelectedMomentIndex] = useState<number | undefined>(undefined);

  // Learner Modes State (Builder, Reciter, Storyteller)
  const [learnerModesState, setLearnerModesState] = useState<LearnerModesState>(() => loadLearnerModesState());
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
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
    const handleOpenSettings = () => {
      setShowSettingsModal(true);
    };
    const handleOpenReminders = () => setShowCalendarModal(true);
    const handleOpenJournal = () => setShowJournalModal(true);
    const handleOpenPeople = () => {
      setSelectedCharacterArcId(undefined);
      setSelectedMomentIndex(undefined);
      setShowPeopleModal(true);
    };
    const handleOpenRelics = () => setShowRelics(true);
    const handleOpenModes = () => setShowModeModal(true);

    window.addEventListener('testament-mode-changed', handleModeUpdate);
    window.addEventListener('testament-open-settings', handleOpenSettings);
    window.addEventListener('testament-open-reminders', handleOpenReminders);
    window.addEventListener('testament-open-journal', handleOpenJournal);
    window.addEventListener('testament-open-people', handleOpenPeople);
    window.addEventListener('testament-open-relics', handleOpenRelics);
    window.addEventListener('testament-open-modes', handleOpenModes);

    return () => {
      window.removeEventListener('testament-mode-changed', handleModeUpdate);
      window.removeEventListener('testament-open-settings', handleOpenSettings);
      window.removeEventListener('testament-open-reminders', handleOpenReminders);
      window.removeEventListener('testament-open-journal', handleOpenJournal);
      window.removeEventListener('testament-open-people', handleOpenPeople);
      window.removeEventListener('testament-open-relics', handleOpenRelics);
      window.removeEventListener('testament-open-modes', handleOpenModes);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const dateKey = getTodayDateKey();
    getDailyMission(dateKey, 0, activeBattlefieldId).then((m) => {
      if (isMounted) setDailyMission(m);
    });
    return () => {
      isMounted = false;
    };
  }, [activeBattlefieldId]);

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

  const featuredAct = featuredQuest.acts.find(a => a.id === (composedMission.actId || 'david-act-2')) 
    || featuredQuest.acts.find(a => !completedActs.includes(a.id))
    || featuredQuest.acts[0];

  const isTodayMissionDone = completedActs.includes(dailyMission.id) || completedActs.includes(featuredAct.id);

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
    const dailyVerse = getDailyVerse(0, language);
    const briefing = getDailyBriefing();
    const activeBattlefield = BATTLEFIELD_OPTIONS.find(b => b.id === activeBattlefieldId);
    soundEngine.playMorningTacticalBriefing({
      title: briefing.title,
      battlefieldFocus: activeBattlefield ? activeBattlefield.title : 'Daily Focus & Spiritual Resilience',
      memoryVerse: `${dailyVerse.reference}: ${dailyVerse.text}`,
      proverb: language === 'es' ? 'Proverbios 15:1: La blanda respuesta quita la ira.' : language === 'fr' ? 'Proverbes 15:1: Une réponse douce calme la fureur.' : 'Proverbs 15:1: A gentle answer turns away wrath.'
    }, () => {
      setIsPlayingBriefing(false);
    });
  };

  const getRankTitle = (points: number) => {
    if (points >= 500) return 'Iron Pillar';
    if (points >= 300) return 'Mighty Man of Adullam';
    if (points >= 150) return 'Story Explorer';
    return 'Profile';
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

      {/* =========================================================================
          TOP BAR: Mobile Status Bar (Hidden on md/lg desktop where top nav is unified)
          ========================================================================= */}
      <div className="flex md:hidden items-center justify-between gap-3 mb-5">
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
              <h1 className="text-base font-serif font-bold text-stone-900 dark:text-parchment-100 tracking-wide">
                Testament
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold">
                {getRankTitle(xp)}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenWhatsNew?.();
                }}
                className="text-[11px] font-mono px-1.5 py-0.2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-amber-300 transition-colors"
                title={t('dashboard.versionTooltip')}
              >
                v1.23.0
              </button>
            </div>
            {/* N-1: No truncated kicker on 390px screens */}
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              <span className="text-amber-700 dark:text-amber-400 font-medium">{todayFormatted}</span>
              {' '}•{' '}
              <span>Daily mission</span>
            </p>
          </div>
        </div>

        {/* Right: Streak, XP, Single Settings Entry (N-8: Accessible labels and roles) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          {streakCount > 0 ? (
            <div 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/60 dark:bg-stone-900 text-xs font-mono font-bold text-orange-700 dark:text-orange-300"
              title="Daily Streak"
              role="status"
              aria-label={`${streakCount} day streak`}
            >
              <Flame aria-hidden="true" className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
              <span>{streakCount}d</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/40 dark:bg-stone-900/60 text-xs font-mono font-medium text-stone-500 dark:text-stone-400"
              title="Start your streak today"
              role="status"
              aria-label="Fresh start"
            >
              <Flame aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span>Fresh start</span>
            </div>
          )}

          <div 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/60 dark:bg-stone-900 text-xs font-mono font-bold text-amber-800 dark:text-amber-300"
            title="Scripture XP"
            role="status"
            aria-label={`${xp} Scripture XP`}
          >
            <Award aria-hidden="true" className="w-3.5 h-3.5 text-amber-500" />
            <span>{xp}</span>
          </div>

          {/* Single Settings Entry */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowSettings(!showSettings);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                showSettings 
                  ? 'bg-amber-500 text-stone-950 font-bold' 
                  : 'bg-stone-200/60 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-parchment-50'
              }`}
              title="Settings"
              aria-label="Settings"
            >
              <Settings aria-hidden="true" className="w-4 h-4" />
            </button>

            {showSettings && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowSettings(false)} 
                />
                <div className="absolute right-0 top-full mt-2 z-40 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl flex flex-col gap-2 min-w-[180px]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 font-bold px-1">
                    Settings
                  </div>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">Language</span>
                    <LanguageToggle compact />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">Theme</span>
                    <ThemeToggle compact />
                  </div>
                  <div className="pt-1 border-t border-stone-200 dark:border-stone-800 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowSettings(false);
                        if (onOpenSettings) {
                          onOpenSettings();
                        } else {
                          window.dispatchEvent(new CustomEvent('testament-open-settings'));
                        }
                      }}
                      className="w-full text-left text-xs px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 dark:text-amber-200 font-bold transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>Text size & voice</span>
                      <span className="text-[10px] font-mono">⚙</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowSettings(false);
                        setShowModeModal(true);
                      }}
                      className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>Learner mode</span>
                      <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-800 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded-md">
                        {learnerModesState.activeMode}
                      </span>
                    </button>
                    {onOpenOnboarding && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setShowSettings(false);
                          onOpenOnboarding();
                        }}
                        className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                      >
                        Set up my plan
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowSettings(false);
                        setShowCalendarModal(true);
                      }}
                      className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                    >
                      Reminders
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowSettings(false);
                        setShowJournalModal(true);
                      }}
                      className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                    >
                      Decision journal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowSettings(false);
                        setSelectedCharacterArcId(undefined);
                        setSelectedMomentIndex(undefined);
                        setShowPeopleModal(true);
                      }}
                      className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                    >
                      People & character arcs
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowSettings(false);
                        setShowSeriesPicker(true);
                      }}
                      className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>Weekly study series</span>
                      {activeSeries && (
                        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {activeSeries.heroName}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSnap();
                        setShowSettings(false);
                        setShowRelics(true);
                      }}
                      className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                    >
                      Collection ({unlockedRelics.length}/{ALL_RELICS.length})
                    </button>
                    {/* M-8: Transparency Page link */}
                    {onOpenHowItWorks && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setShowSettings(false);
                          onOpenHowItWorks();
                        }}
                        className="w-full text-left text-xs px-1 py-1 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                      >
                        How Testament works
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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

            {/* Plain, encouraging subtext (M-1) */}
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-5 max-w-xl">
              No 40-minute reading plans. Just today's decision: what would you do before seeing what {dailyMission.heroName} did?
            </p>

            {/* Action Row: Start mission CTA + 45s audio story */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleStartMission}
                className="flex-1 sm:flex-initial px-7 lg:px-8 py-3.5 lg:py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{isTodayMissionDone ? t('dashboard.reviewTodayMission') : t('dashboard.startTodayMission')}</span>
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
                    setSelectedCharacterArcId(matchedCharacterArc.id);
                    if (matchedMomentIndex >= 0) setSelectedMomentIndex(matchedMomentIndex);
                    setShowPeopleModal(true);
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

          {/* =========================================================================
              FLAGSHIP WEEKLY SERIES SHOWCASE (Fix 5)
              ========================================================================= */}
          {activeSeries ? (
            <div className="p-5 lg:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-stone-100/60 dark:to-stone-900/60 border border-amber-500/30 transition-all">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 rounded-2xl bg-amber-500/20">{activeSeries.avatarIcon}</span>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold block">
                      {t('dashboard.activeSeries')}
                    </span>
                    <h3 className="text-base lg:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-tight">
                      {activeSeries.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setShowSeriesPicker(true);
                  }}
                  className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 py-1 px-2.5 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  {t('dashboard.changeSeries')}
                </button>
              </div>

              {/* 7-Day Arc Progress Pill Bar */}
              <div className="space-y-1.5 mb-3.5">
                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-medium">
                  <span>Day {activeSeriesDay} of 7</span>
                  <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">{Math.round((activeSeriesDay / 7) * 100)}%</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5" aria-label={`Day ${activeSeriesDay} of 7`}>
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                    <div
                      key={dayNum}
                      className={`h-2 rounded-full transition-all ${
                        dayNum === activeSeriesDay
                          ? 'bg-amber-500 ring-2 ring-amber-500/40 animate-pulse'
                          : dayNum < activeSeriesDay
                          ? 'bg-amber-600 dark:bg-amber-500'
                          : 'bg-stone-200 dark:bg-stone-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs lg:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
                {activeSeries.tagline}
              </p>

              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-amber-500/20">
                <span className="text-[11px] font-serif italic text-stone-500 dark:text-stone-400 truncate">
                  Theme: {activeSeries.weekTheme}
                </span>
                <button
                  type="button"
                  onClick={handleStartMission}
                  className="text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>{isTodayMissionDone ? `Review Day ${activeSeriesDay}` : `Jump into Day ${activeSeriesDay}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 lg:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-100/70 to-stone-100/40 dark:from-amber-500/10 dark:via-stone-900/60 dark:to-stone-900/40 border border-stone-200/80 dark:border-stone-800/80 hover:border-amber-500/40 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                    Weekly Study Series • 7-Day Guided Arcs
                  </span>
                </div>
              </div>

              <h3 className="text-base lg:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 mb-1.5 leading-snug">
                Walk 7 Days with Biblical Leaders
              </h3>
              <p className="text-xs lg:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                Theme your daily walk with high-tension decisions and enduring wisdom from Scripture's greatest character arcs.
              </p>

              {/* Character Arc Pills Preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-200/60 dark:bg-stone-800/70 text-xs text-stone-800 dark:text-stone-200 font-medium">
                  <span>👑</span> David (7 Decisions)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-200/60 dark:bg-stone-800/70 text-xs text-stone-800 dark:text-stone-200 font-medium">
                  <span>✨</span> Esther (For Such a Time)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-200/60 dark:bg-stone-800/70 text-xs text-stone-800 dark:text-stone-200 font-medium">
                  <span>🌊</span> Moses (Deliverer)
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playSnap();
                  setShowSeriesPicker(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Explore all 6 weekly series</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

      {/* =========================================================================
          KEY FEATURES HUB: High-visibility 2x2 grid (Impossible to miss)
          ========================================================================= */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Card 1: Decision Journal */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setShowJournalModal(true);
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-850/80 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
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
            setSelectedCharacterArcId(undefined);
            setSelectedMomentIndex(undefined);
            setShowPeopleModal(true);
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-850/80 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
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
              : 'bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-850/80 border-stone-200/70 dark:border-stone-800/70 hover:border-amber-500/40'
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
          className="p-3.5 sm:p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-850/80 border border-stone-200/70 dark:border-stone-800/70 transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-amber-500/40"
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
      </div>

          {/* Relics / Collection Drawer (Expands right below the grid when tapped) */}
          {showRelics && (
            <div className="mt-3 p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-amber-500/30 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold block">
                  Unlocked Collection ({unlockedRelics.length}/{ALL_RELICS.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowRelics(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
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

        {/* =========================================================================
            RIGHT RAIL (Desktop lg:col-span-5) / Stacked Below on Mobile:
            Progression & Retention Supporting Cards
            ========================================================================= */}
        <div className="mt-6 lg:mt-0 lg:col-span-5 xl:col-span-5 space-y-5">

        {/* Feature 1: Locked Tomorrow Teaser Card ("Can't peek") */}
        <TomorrowTeaserCard />

        {/* Feature 5: "Previously On..." Weekly Recap Card */}
        <WeeklyRecapCard />

        {/* =========================================================================
            PART 7: YESTERDAY'S VERSE RECALL CARD (N-2: "Remember yesterday's verse?")
            ========================================================================= */}
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
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Got it! (+10 XP)</span>
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
        </div>
      </div>

      {/* Feature 3: Decision Journal Modal */}
      <DecisionJournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
      />

      {/* Feature 6: Character Arcs Modal */}
      <CharacterArcModal
        isOpen={showPeopleModal}
        onClose={() => setShowPeopleModal(false)}
        initialCharacterId={selectedCharacterArcId}
        initialMomentIndex={selectedMomentIndex}
      />

      {/* Feature 8: Calendar Reminders Modal */}
      <CalendarRemindersModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      {/* Learner Modes: Mode Selector Modal */}
      <ModeSelectorModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        currentMode={learnerModesState.activeMode}
        onSelectMode={(mode) => {
          const updated = setLearnerMode(mode);
          setLearnerModesState(updated);
        }}
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
          try {
            localStorage.removeItem(`testament_daily_generated_mission_${dateKey}`);
          } catch {
            // ignore
          }
          setDailyMission(getDailyMissionSync(dateKey, 0, activeBattlefieldId));
        }}
      />

      {/* Settings Modal (Text Size Scale, Voice Preview & Selection, Quick Nav) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenOnboarding={onOpenOnboarding}
        onOpenReminders={() => setShowCalendarModal(true)}
        onOpenJournal={() => setShowJournalModal(true)}
        onOpenPeople={() => {
          setSelectedCharacterArcId(undefined);
          setSelectedMomentIndex(undefined);
          setShowPeopleModal(true);
        }}
        onOpenRelics={() => setShowRelics(true)}
        onOpenHowItWorks={onOpenHowItWorks}
        onOpenLearnerMode={() => setShowModeModal(true)}
        activeLearnerMode={learnerModesState.activeMode}
        relicsCount={{ unlocked: unlockedRelics.length, total: ALL_RELICS.length }}
      />
    </div>
  );
};
