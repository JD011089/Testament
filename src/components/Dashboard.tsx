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
  ShieldCheck
} from 'lucide-react';
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
import { CHARACTER_ARCS } from '../data/characterArcs';

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
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [showPeopleModal, setShowPeopleModal] = useState<boolean>(false);
  const [selectedCharacterArcId, setSelectedCharacterArcId] = useState<string | undefined>(undefined);
  const [selectedMomentIndex, setSelectedMomentIndex] = useState<number | undefined>(undefined);

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-2 md:pb-6 text-left transition-colors">
      
      {/* =========================================================================
          TOP BAR: Streamlined Brand & Status (Seamless, borderless)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3 mb-5">
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
                v1.21.0
              </button>
            </div>
            {/* N-1: No truncated kicker on 390px screens */}
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              <span className="text-amber-700 dark:text-amber-400 font-medium">{todayFormatted}</span> • Daily mission
            </p>
          </div>
        </div>

        {/* Right: Streak, XP, Single Settings Entry (N-8: Accessible labels and roles) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          <div 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/60 dark:bg-stone-900 text-xs font-mono font-bold text-orange-700 dark:text-orange-300"
            title="Daily Streak"
            role="status"
            aria-label={`${streakCount} day streak`}
          >
            <Flame aria-hidden="true" className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
            <span>{streakCount}d</span>
          </div>

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

      {/* =========================================================================
          PART 1 — HOMEPAGE: EXACTLY ONE CARD ABOVE THE FOLD
          No competing mission buttons, no triple-named confusion.
          One scenario question, one clear CTA ("Make today's call").
          ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-stone-100/50 dark:to-stone-900/40 shadow-xs transition-colors">
        {/* Micro-tag with AI Reflection Badge (N-1: wrap instead of truncate) */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
            Today's Mission • {dailyMission.heroName} ({dailyMission.passageReference})
          </span>
          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0" role="note" aria-label="AI reflection, Not Scripture">
            <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
          </span>
        </div>

        {/* The Decision-First Scenario Question */}
        <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-snug mb-3">
          "{dailyMission.scenarioQuestion}"
        </h2>

        {/* Plain, encouraging subtext (M-1) */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-6 max-w-lg">
          No 40-minute reading plans. Just today's decision: what would you do before seeing what {dailyMission.heroName} did?
        </p>

        {/* Action Row: Start mission CTA + 45s audio story */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={handleStartMission}
            className="flex-1 sm:flex-initial px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{isTodayMissionDone ? "Review today's mission" : "Start today's mission"}</span>
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePlayBriefing}
            className="px-5 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            aria-label={isPlayingBriefing ? "Pause 45-second audio story" : "Listen to today's 45-second audio story"}
          >
            {isPlayingBriefing ? (
              <>
                <Pause aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Pause story</span>
              </>
            ) : (
              <>
                <Play aria-hidden="true" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Listen (45 sec)</span>
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
              <span>Part of {matchedCharacterArc.name}'s story arc {matchedMomentIndex >= 0 ? `(Moment ${matchedMomentIndex + 1} of ${matchedCharacterArc.moments.length})` : ''} →</span>
            </button>
          </div>
        )}
      </div>

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

      {/* =========================================================================
          BELOW THE FOLD: Progression & Retention Cards
          ========================================================================= */}
      <div className="mt-6 space-y-5">

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
    </div>
  );
};
