import React, { useState, useEffect } from 'react';
import type { StoryQuest } from '../types';
import { STORY_QUESTS } from '../data/stories';
import { soundEngine, type NarratorProfile, NARRATOR_VOICES } from '../utils/audio';
import { 
  Flame, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Clock, 
  BookOpen, 
  Brain, 
  Wind, 
  Music,
  Shield,
  Coffee,
  X,
  BookA,
  Zap,
  ShieldAlert,
  Play,
  Pause,
  SlidersHorizontal,
  Mic,
  Bell,
  Send,
  HeartHandshake,
  Target,
  CheckCircle2,
  Swords,
  HelpCircle
} from 'lucide-react';
import type { UserCalibrationProfile } from './OnboardingModal';
import { MemoryPulseModal } from './MemoryPulseModal';
import { ProverbsCodexModal } from './ProverbsCodexModal';
import { PsalmsFieldMedicModal } from './PsalmsFieldMedicModal';
import { CanonCodexModal } from './CanonCodexModal';
import { DailyCampaignCard } from './DailyCampaignCard';
import { BattlefieldCheckInModal, BATTLEFIELD_OPTIONS } from './BattlefieldCheckInModal';
import { VoiceSelectorModal } from './VoiceSelectorModal';
import { ThemeToggle } from './ThemeToggle';
import { useModalLock } from '../utils/useModalLock';
import type { DailyCampaignStep } from '../data/dailyCampaigns';
import { 
  getNotificationSettings, 
  sendTestMemoryNotification, 
  requestNotificationPermission, 
  getNotificationPermission,
  getNextScheduledReminder,
  checkAndDispatchDueReminders,
  setActiveMemoryVerse
} from '../utils/notificationEngine';
import { getVerseById, getAllVerses } from '../utils/verseRegistry';
import { 
  getTodayFormatted, 
  getDailyVerse, 
  getDailyBriefing, 
  getAdaptiveNextObjective, 
  isDailyBonusClaimed, 
  claimDailyBonus,
  getTodayBattlefieldId,
  setTodayBattlefieldId
} from '../utils/dailyEngine';
import { getDueFSRSCount } from '../utils/fsrsEngine';

interface DashboardProps {
  onSelectQuest: (quest: StoryQuest) => void;
  onOpenWordForge: (verseId?: string) => void;
  onOpenArsenal: () => void;
  onOpenTimeline: () => void;
  onOpenDossiers: () => void;
  onOpenStreetTranslator: () => void;
  onOpenDilemmas: () => void;
  onOpenDriveMode: () => void;
  onOpenLibrary?: () => void;
  completedActs: string[];
  memorizedVerses: string[];
  unlockedRelics?: string[];
  streakCount: number;
  xp: number;
  currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience: (type: 'campfire' | 'wind' | 'sanctuary') => void;
  userProfile?: UserCalibrationProfile | null;
  onOpenOnboarding?: () => void;
  onRewardXP?: (points: number) => void;
  onOpenWhatsNew?: () => void;
  onLaunchCampaignStep?: (step: DailyCampaignStep) => void;
  onOpenTour?: () => void;
}

const QUEST_IMAGES: Record<string, string> = {
  'david-journey': '/images/valley_battlefield.jpg',
  'joseph-journey': '/images/desert_canyon.jpg',
  'peter-journey': '/images/courtyard_fire.jpg',
  'paul-journey': '/images/prison_cell.jpg',
  'moses-journey': '/images/red_sea.jpg',
  'elijah-journey': '/images/mount_carmel.jpg',
  'daniel-journey': '/images/palace_hall.jpg',
  'esther-journey': '/images/palace_hall.jpg',
  'nehemiah-journey': '/images/valley_battlefield.jpg',
  'gideon-journey': '/images/desert_canyon.jpg',
  'jonah-journey': '/images/sea_storm.jpg',
  'ruth-journey': '/images/desert_canyon.jpg',
  'joshua-journey': '/images/valley_battlefield.jpg',
  'john-baptist-journey': '/images/desert_canyon.jpg',
};

const ALL_RELICS = [
  { id: 'david-stones', name: '5 Smooth Stones', character: 'David', icon: '🪨', desc: 'Courage with your authentic tools.' },
  { id: 'joseph-ring', name: 'Pharaoh’s Signet Ring', character: 'Joseph', icon: '💍', desc: 'Quiet integrity turns into authority.' },
  { id: 'moses-staff', name: 'The Shepherd’s Staff', character: 'Moses', icon: '🪵', desc: 'Standing firm when panic surrounds you.' },
  { id: 'elijah-mantle', name: 'Weathered Mantle', character: 'Elijah', icon: '🧥', desc: 'Hearing the gentle whisper in burnout.' },
  { id: 'peter-brazier', name: 'Charcoal Brazier', character: 'Peter', icon: '🔥', desc: 'Grace transforms failure into mission.' },
  { id: 'paul-stocks', name: 'Broken Stocks', character: 'Paul', icon: '⛓️', desc: 'An unshakable soul in chains.' },
  { id: 'daniel-signet', name: 'Babylonian Signet Ring', character: 'Daniel', icon: '💍', desc: 'Zero moral compromise in the imperial den.' },
  { id: 'esther-scepter', name: 'The Golden Scepter', character: 'Esther', icon: '🪄', desc: 'Courage to step into danger for others.' },
  { id: 'nehemiah-trowel', name: 'Mason’s Chisel & Trowel', character: 'Nehemiah', icon: '🔨', desc: 'Building with one hand, weapon in the other.' },
  { id: 'gideon-torch', name: 'Clay Jar & Torch', character: 'Gideon', icon: '🏺', desc: 'Breaking self-reliance so light can shine.' },
  { id: 'jonah-anchor', name: 'The Sea Anchor', character: 'Jonah', icon: '⚓', desc: 'Surrendering your flight to God’s mercy.' },
  { id: 'ruth-sheaf', name: 'Golden Barley Sheaf', character: 'Ruth', icon: '🌾', desc: 'Radical loyalty in seasons of grief.' },
  { id: 'joshua-trumpet', name: 'The Jericho Shofar', character: 'Joshua', icon: '📯', desc: 'Bold obedience bringing down high walls.' },
  { id: 'john-belt', name: 'Leather Belt & Locust Honey', character: 'John the Baptist', icon: '🥋', desc: 'Radical humility pointing all eyes to Christ.' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectQuest,
  onOpenWordForge,
  onOpenArsenal,
  onOpenTimeline = () => {},
  onOpenDossiers = () => {},
  onOpenStreetTranslator = () => {},
  onOpenDilemmas = () => {},
  onOpenDriveMode: _onOpenDriveMode = () => {},
  onOpenLibrary = () => {},
  completedActs,
  memorizedVerses,
  unlockedRelics = [],
  streakCount,
  xp,
  currentAmbience,
  onToggleAmbience,
  userProfile,
  onOpenOnboarding,
  onRewardXP,
  onOpenWhatsNew,
  onLaunchCampaignStep,
  onOpenTour
}) => {
  const [dashboardMode, setDashboardMode] = useState<'guided' | 'freeroam'>(() => {
    try {
      return (localStorage.getItem('testament_dashboard_mode') as 'guided' | 'freeroam') || 'guided';
    } catch {
      return 'guided';
    }
  });



  const handleToggleDashboardMode = (mode: 'guided' | 'freeroam') => {
    soundEngine.playSnap();
    setDashboardMode(mode);
    try {
      localStorage.setItem('testament_dashboard_mode', mode);
    } catch {
      // ignore
    }
  };

  const [activeTrack, setActiveTrack] = useState<string>('All');
  const [showMorningBriefing, setShowMorningBriefing] = useState<boolean>(false);
  const briefingModalRef = useModalLock(showMorningBriefing);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);
  const [narratorProfile, setNarratorProfile] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [isMemoryPulseModalOpen, setIsMemoryPulseModalOpen] = useState<boolean>(false);
  const [isProverbsModalOpen, setIsProverbsModalOpen] = useState<boolean>(false);
  const [isPsalmsMedicModalOpen, setIsPsalmsMedicModalOpen] = useState<boolean>(false);
  const [isCanonModalOpen, setIsCanonModalOpen] = useState<boolean>(false);
  const [isBattlefieldModalOpen, setIsBattlefieldModalOpen] = useState<boolean>(false);
  const [isVoiceSelectorOpen, setIsVoiceSelectorOpen] = useState<boolean>(false);
  const [activeBattlefieldId, setActiveBattlefieldId] = useState<string | null>(() => getTodayBattlefieldId());
  const [isPlayingMorningTacticalAudio, setIsPlayingMorningTacticalAudio] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] = useState(() => getNotificationSettings());
  const [testNoticeStatus, setTestNoticeStatus] = useState<string | null>(null);
  const [, setPulseRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      setNotificationSettings(getNotificationSettings());
      setPulseRefreshTrigger(t => t + 1);
    };

    const handleOpenProverbs = () => setIsProverbsModalOpen(true);
    const handleOpenPsalms = () => setIsPsalmsMedicModalOpen(true);
    const handleOpenCanon = () => setIsCanonModalOpen(true);
    const handleBattlefieldChanged = (e: Event) => {
      const custom = e as CustomEvent;
      setActiveBattlefieldId(custom.detail?.battlefieldId ?? getTodayBattlefieldId());
    };
    const handleVoiceChanged = (e: Event) => {
      const custom = e as CustomEvent<NarratorProfile>;
      if (custom.detail) {
        setNarratorProfile(custom.detail);
      }
    };

    window.addEventListener('testament-notifications-updated', handleSettingsUpdated);
    window.addEventListener('open-proverbs-codex', handleOpenProverbs);
    window.addEventListener('open-psalms-medic', handleOpenPsalms);
    window.addEventListener('open-canon-codex', handleOpenCanon);
    window.addEventListener('testament-battlefield-changed', handleBattlefieldChanged);
    window.addEventListener('testament-voice-changed', handleVoiceChanged);

    const timer = setInterval(() => {
      setPulseRefreshTrigger(t => t + 1);
    }, 60000);

    return () => {
      window.removeEventListener('testament-notifications-updated', handleSettingsUpdated);
      window.removeEventListener('open-proverbs-codex', handleOpenProverbs);
      window.removeEventListener('open-psalms-medic', handleOpenPsalms);
      window.removeEventListener('open-canon-codex', handleOpenCanon);
      window.removeEventListener('testament-battlefield-changed', handleBattlefieldChanged);
      window.removeEventListener('testament-voice-changed', handleVoiceChanged);
      clearInterval(timer);
    };
  }, []);

  const nextReminder = getNextScheduledReminder();

  const dailyVerse = getDailyVerse();
  const dailyBriefing = getDailyBriefing();
  const todayFormatted = getTodayFormatted();
  const adaptiveObjective = getAdaptiveNextObjective(completedActs, userProfile, memorizedVerses);
  const isBriefingBonusClaimed = isDailyBonusClaimed('briefing');
  const activeMemoryVerse = getVerseById(notificationSettings.activeVerseId) || getAllVerses()[0];
  const activeBattlefield = BATTLEFIELD_OPTIONS.find(b => b.id === activeBattlefieldId);
  const dueFSRSCount = getDueFSRSCount();

  const handlePlayMorningTacticalAudio = () => {
    if (isPlayingMorningTacticalAudio) {
      soundEngine.stopSpeaking();
      setIsPlayingMorningTacticalAudio(false);
      return;
    }
    setIsPlayingMorningTacticalAudio(true);
    soundEngine.playMorningTacticalBriefing({
      title: dailyBriefing.title,
      battlefieldFocus: activeBattlefield ? activeBattlefield.title : 'Daily Focus & Spiritual Resilience',
      memoryVerse: `${dailyVerse.reference}: ${dailyVerse.text}`,
      proverb: 'Proverbs 15:1: A gentle answer turns away wrath.'
    }, () => {
      setIsPlayingMorningTacticalAudio(false);
    });
  };

  const handleCheckAndSyncReminders = async () => {
    soundEngine.playClick();
    setTestNoticeStatus('Checking schedule...');
    const fired = await checkAndDispatchDueReminders();
    setNotificationSettings(getNotificationSettings());
    setPulseRefreshTrigger(t => t + 1);
    if (fired) {
      soundEngine.playVictory();
      setTestNoticeStatus('Reminder sent to device!');
    } else {
      setTestNoticeStatus('Schedule synchronized!');
    }
    setTimeout(() => setTestNoticeStatus(null), 3000);
  };

  const handleQuickTestNotification = async () => {
    soundEngine.playClick();
    if (getNotificationPermission() !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setTestNoticeStatus('Please enable notifications');
        setIsMemoryPulseModalOpen(true);
        return;
      }
    }
    setTestNoticeStatus('Dispatched to device!');
    const ok = await sendTestMemoryNotification(0);
    if (ok) {
      soundEngine.playVictory();
    } else {
      setTestNoticeStatus('Check permissions');
    }
    setTimeout(() => setTestNoticeStatus(null), 3500);
  };

  useEffect(() => {
    if (!showMorningBriefing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.stopSpeaking();
        setIsPlayingBriefing(false);
        setShowMorningBriefing(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMorningBriefing]);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const getRankTitle = (points: number) => {
    if (points >= 500) return 'Iron Pillar';
    if (points >= 300) return 'Mighty Man of Adullam';
    if (points >= 150) return 'Story Explorer';
    return 'Seeker';
  };

  const tracks = ['All', 'Underdog & Courage', 'Career & High Stakes', 'Burnout & Pressure', 'Restoration & Brotherhood'];

  const filteredQuests = activeTrack === 'All'
    ? STORY_QUESTS
    : STORY_QUESTS.filter(q => q.starterTrack === activeTrack);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 pb-28 md:pb-12 text-left transition-colors">
      {/* Top Banner Status - Streamlined Header */}
      <div className="pb-3.5 mb-5 border-b border-stone-200/60 dark:border-stone-800/60 transition-colors w-full">
        {/* Row 1: Brand & Status Header */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left: Emblem, Title & Subtle Version Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-500/50 shadow-xs bg-stone-100 dark:bg-stone-950 shrink-0">
              <img 
                src="/icons/icon-192.png" 
                alt="Testament Emblem" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-100 tracking-wide">
                  Testament
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-100/70 dark:bg-amber-950/80 border border-amber-300/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-bold">
                  {getRankTitle(xp)}
                </span>
                {onOpenWhatsNew && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenWhatsNew();
                    }}
                    className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-amber-300 border border-stone-250 dark:border-stone-750 transition-colors flex items-center gap-1"
                    title="View field update notes (v1.9.2)"
                  >
                    <span>v1.9.2</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                <span className="text-amber-700 dark:text-amber-400 font-medium">{todayFormatted}</span> • The Living Word
              </p>
            </div>
          </div>

          {/* Right: Guide & Theme Toggle + Universal Streak / XP */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenTour && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenTour();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                title="Field Guide & Tour"
                aria-label="Field Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
            <ThemeToggle compact />

            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/50 dark:bg-stone-800 text-xs font-mono font-bold text-orange-600 dark:text-orange-400" title="Daily streak">
              <Flame className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500" />
              <span>{streakCount}d</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-200/50 dark:bg-stone-800 text-xs font-mono font-bold text-amber-700 dark:text-amber-300" title="Scripture XP">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{xp}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Streamlined Horizontal Action Bar */}
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-stone-200/60 dark:border-stone-800/60 overflow-x-auto scrollbar-none w-full">
          {/* Battlefield Quick Check-in */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsBattlefieldModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeBattlefield
                ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-200'
                : 'bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 text-cyan-700 dark:text-cyan-400'
            }`}
            title="Declare today's trial"
          >
            <Swords className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{activeBattlefield ? `Battlefield: ${activeBattlefield.title.split('&')[0].trim()}` : 'Declare Battlefield'}</span>
          </button>

          {/* 45-Second Briefing Audio */}
          <button
            onClick={handlePlayMorningTacticalAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isPlayingMorningTacticalAudio
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 text-amber-700 dark:text-amber-300'
            }`}
            title="Listen to 45s audio briefing"
          >
            {isPlayingMorningTacticalAudio ? (
              <Pause className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Play className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>45s Audio</span>
          </button>

          {/* Reading Voice Selector */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsVoiceSelectorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 hover:dark:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-semibold whitespace-nowrap transition-colors"
            title="Choose app-wide reading voice"
          >
            <Mic className="w-3.5 h-3.5 text-amber-500" />
            <span>Voice: {NARRATOR_VOICES[narratorProfile]?.name.split(' ')[0] || 'Adam'}</span>
          </button>

          {/* Due for Review (if any) */}
          {dueFSRSCount > 0 && (
            <button
              onClick={() => onOpenWordForge()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold whitespace-nowrap"
              title="Scriptures due for memory review"
            >
              <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>{dueFSRSCount} Due</span>
            </button>
          )}

          {/* 3-Min Morning Briefing */}
          <button
            onClick={() => setShowMorningBriefing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium whitespace-nowrap transition-colors"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>3-Min Briefing</span>
            {!isBriefingBonusClaimed && (
              <span className="text-[9px] bg-amber-500 text-stone-950 font-extrabold px-1 py-0.2 rounded-full">
                +50 XP
              </span>
            )}
          </button>

          {/* Auntie-Friendly App Guide & Tour Button */}
          {onOpenTour && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenTour();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold whitespace-nowrap transition-all"
              title="How to navigate and use Testament"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>App Guide</span>
            </button>
          )}

          {onOpenOnboarding && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenOnboarding();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium whitespace-nowrap transition-colors"
              title="Calibrate your battle plan"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>{userProfile ? 'My Battle Plan' : 'Calibrate'}</span>
            </button>
          )}
        </div>
      </div>



      {/* GUIDED CAMPAIGN vs FREE ROAM MODE SELECTOR - Single Sleek Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="w-full sm:w-auto inline-flex p-1 rounded-xl bg-stone-200/60 dark:bg-stone-900 transition-colors">
          <button
            onClick={() => handleToggleDashboardMode('guided')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              dashboardMode === 'guided'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>🎯 Daily Mission</span>
          </button>

          <button
            onClick={() => handleToggleDashboardMode('freeroam')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              dashboardMode === 'freeroam'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🗺️ Free Roam</span>
          </button>
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 italic hidden md:block">
          {dashboardMode === 'guided'
            ? 'Structured daily path: Story Quest → Dilemma Sim → Word Forge → Library Codex'
            : 'Unrestricted open exploration across all 14 quests, 66 books, and drills'}
        </div>
      </div>

      {dashboardMode === 'guided' ? (
        /* GUIDED MODE: Clean, dedicated focus view with ONLY the Daily Campaign Card */
        <div className="max-w-4xl mx-auto space-y-6">
          <DailyCampaignCard 
            onLaunchStep={onLaunchCampaignStep || (() => {})} 
            onRewardXP={onRewardXP || (() => {})} 
          />
        </div>
      ) : (
        /* WIDESCREEN DESKTOP GRID: MAIN STAGE (col 8) + SIDEBAR (col 4) (FREE ROAM / SANDBOX MODE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN STAGE (65-70% on Desktop) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Cinematic Hero Study Table Banner */}
          <div className="rounded-2xl overflow-hidden relative bg-stone-100 dark:bg-[#0e1117] transition-colors">
            <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-stone-950">
              <img 
                src="/images/hero_banner.jpg" 
                alt="Ancient study table with scripture and shield" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-[#0e1117] via-stone-950/40 to-transparent" />
            </div>

            <div className="p-4 sm:p-6 relative">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Daily Truth For The Trenches</span>
                </div>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400/90 px-2.5 py-0.5 rounded bg-amber-500/10">
                  {todayFormatted}
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl md:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50 mb-2 leading-tight">
                "{dailyVerse.text}"
              </h3>

              <p className="text-xs md:text-sm text-stone-600 dark:text-parchment-200/90 leading-relaxed mb-4 max-w-2xl">
                {dailyVerse.plainEnglishSummary}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 dark:border-stone-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-600 dark:text-amber-500 font-semibold">{dailyVerse.reference}</span>
                  <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded bg-stone-200/60 dark:bg-stone-900 hidden sm:inline-block">
                    {dailyVerse.category}
                  </span>
                </div>
                <button
                  onClick={() => onOpenWordForge(dailyVerse.id)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
                >
                  <span>Lock into memory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Curated Starter Tracks & Quests Grid (Directly Below Hero Banner) */}
          <div>
            {userProfile && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-stone-900 dark:text-amber-300 flex items-center justify-center text-lg shrink-0">
                    🎯
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                      Your Calibrated Battle Plan
                    </div>
                    <div className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-100">
                      Targeting: {userProfile.battleTitle}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>Mode: <strong className="text-amber-700 dark:text-amber-300 uppercase">{userProfile.learningStyle}</strong></span>
                      <span>•</span>
                      <span>Cadence: <strong className="text-amber-700 dark:text-amber-300">{userProfile.dailyCadence === '3min' ? '3 Min/Day' : userProfile.dailyCadence === '10min' ? '7-10 Min/Day' : 'Deep Study'}</strong></span>
                    </div>
                  </div>
                </div>

                {onOpenOnboarding && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenOnboarding();
                    }}
                    className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 transition-colors whitespace-nowrap"
                  >
                    Re-Calibrate
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Curated Paths & Deep Dives</span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50">
                  Choose Your Journey
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {tracks.map(track => (
                  <button
                    key={track}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveTrack(track);
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                      activeTrack === track
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-COLUMN GRID OF ILLUSTRATED QUEST CARDS (Stretches full-width on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredQuests.map((quest) => {
                const completedCount = quest.acts.filter(a => completedActs.includes(a.id)).length;
                const isFullyComplete = completedCount === quest.acts.length;
                const questImage = QUEST_IMAGES[quest.id] || '/images/valley_battlefield.jpg';

                return (
                  <div
                    key={quest.id}
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectQuest(quest);
                    }}
                    className="flex flex-col justify-between rounded-2xl bg-stone-100/70 hover:bg-stone-100 dark:bg-stone-900/60 dark:hover:bg-stone-850 transition-all overflow-hidden group cursor-pointer"
                  >
                    {/* Visual Illustration Thumbnail */}
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-stone-950">
                      <img 
                        src={questImage} 
                        alt={quest.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-[#12151b] via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-amber-400 uppercase">
                        {quest.heroName}
                      </div>

                      {isFullyComplete ? (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Completed</span>
                        </div>
                      ) : userProfile?.recommendedQuestId === quest.id ? (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>🎯</span>
                          <span>Your Battle Plan</span>
                        </div>
                      ) : !userProfile && quest.id === 'david-journey' && completedCount === 0 ? (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider">
                          Recommended First
                        </div>
                      ) : quest.starterTrack ? (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded bg-amber-950/80 backdrop-blur-md text-[9px] font-mono text-amber-300 uppercase">
                          {quest.starterTrack}
                        </div>
                      ) : null}
                    </div>

                    {/* Quest Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">
                          <span>{quest.testament}</span>
                          <span>•</span>
                          <span>{quest.historicalPeriod}</span>
                        </div>

                        <h4 className="text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {quest.title}
                        </h4>

                        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                          {quest.subtitle}
                        </p>

                        <p className="text-xs text-stone-600 dark:text-stone-300 italic pt-2 line-clamp-2">
                          "{quest.summary}"
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                          <span>{quest.estimatedMinutes} min</span>
                          <span>•</span>
                          <span>{completedCount}/{quest.acts.length} Acts</span>
                        </div>

                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectQuest(quest);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                        >
                          <span>{completedCount === 0 ? 'Start' : isFullyComplete ? 'Review' : 'Continue'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1 px-4 sm:px-5 pb-3">
                      {quest.acts.map((act) => (
                        <div
                          key={act.id}
                          className={`h-1.5 rounded-full flex-1 transition-colors ${
                            completedActs.includes(act.id) ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (30-35% on Desktop - Hidden on Mobile to remove compact cards & modals) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          
          {/* ADAPTIVE NEXT OBJECTIVE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-stone-900 dark:text-amber-300 flex items-center justify-center text-lg shrink-0">
                {adaptiveObjective.type === 'retention_drill' ? '🧠' : adaptiveObjective.type === 'next_act' ? '⚔️' : '👑'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10">
                    {adaptiveObjective.badge}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Next Objective</span>
                </div>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 truncate">
                  {adaptiveObjective.title}
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
              {adaptiveObjective.subtitle}
            </p>
            <button
              onClick={() => {
                soundEngine.playSnap();
                if (adaptiveObjective.type === 'retention_drill' && adaptiveObjective.targetVerseId) {
                  onOpenWordForge(adaptiveObjective.targetVerseId);
                } else if (adaptiveObjective.targetQuest) {
                  onSelectQuest(adaptiveObjective.targetQuest);
                } else {
                  onOpenWordForge();
                }
              }}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>{adaptiveObjective.type === 'retention_drill' ? 'Start Retention Drill' : 'Resume Mission'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LEARNER'S TACTICAL TOOLKIT (Anti-Textbook Accelerators) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                  Learner's Tactical Toolkit
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                HUD
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
              Visual, non-academic field manuals for rapid clarity.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenTimeline();
                }}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-[#181d2a] transition-all text-left group"
              >
                <Clock className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">60s Timeline</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">6 Bible eras</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenDossiers();
                }}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-[#181d2a] transition-all text-left group"
              >
                <Zap className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">Character Dossiers</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Powers & flaws</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenStreetTranslator();
                }}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-[#181d2a] transition-all text-left group"
              >
                <BookA className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">Street Translator</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">No church jargon</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenDilemmas();
                }}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-[#181d2a] transition-all text-left group"
              >
                <ShieldAlert className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">"What’s the Play?"</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Life simulator</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setIsProverbsModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-[#181d2a] transition-all text-left group"
              >
                <Shield className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">Proverbs Codex</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Solomon's playbook</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setIsPsalmsMedicModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 dark:bg-stone-900/80 dark:hover:bg-[#181d2a] transition-all text-left group"
              >
                <HeartHandshake className="w-4 h-4 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">Psalms Medic</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Emergency triage</div>
              </button>
            </div>
          </div>

          {/* SPACED MEMORY PULSE CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40 relative overflow-hidden text-left">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Bell className="w-3.5 h-3.5 animate-pulse" />
                </span>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Spaced Memory Pulse
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">
                    {notificationSettings.notificationsSentToday} of {notificationSettings.frequencyPerDay} prompts today
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {testNoticeStatus && (
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 animate-pulse">
                    {testNoticeStatus}
                  </span>
                )}
                <button
                  onClick={handleCheckAndSyncReminders}
                  className="p-1.5 rounded-lg bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-amber-300 transition-colors"
                  title="Check and sync reminder schedule"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleQuickTestNotification}
                  className="p-1.5 rounded-lg bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-amber-600 dark:text-amber-400 transition-colors"
                  title="Sends an instant recall prompt to this device"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMemoryPulseModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
                >
                  Config
                </button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-black/30 p-3 rounded-xl mb-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-300">
                  {activeMemoryVerse.reference}
                </span>
                {activeMemoryVerse.heroName && (
                  <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    {activeMemoryVerse.heroName}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-800 dark:text-parchment-100 italic line-clamp-2 leading-relaxed">
                "{activeMemoryVerse.text}"
              </p>
            </div>

            {nextReminder && notificationSettings.enabled && (
              <div className="text-[10px] font-mono text-amber-800 dark:text-amber-300/90 mb-3 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Next slot: {nextReminder.label} ({nextReminder.remainingFormatted})</span>
              </div>
            )}

            <button
              onClick={() => onOpenWordForge(activeMemoryVerse.id)}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Practice in Word Forge</span>
            </button>
          </div>

          {/* THE CANON CODEX BANNER (66-BOOK FIELD LIBRARY & ARSENAL) */}
          <div className="p-4 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-lg shrink-0 flex items-center justify-center">
                📜
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 inline-block mb-0.5">
                  Complete Canon • 66 Books
                </span>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                  Scripture Field Library
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
              Every book from Genesis to Revelation translated into Monday morning tactical intelligence.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  if (onOpenLibrary) onOpenLibrary();
                  else setIsCanonModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>66 Books</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenArsenal();
                }}
                className="py-2 px-3 rounded-xl bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                title="Open Scripture Arsenal Journal"
              >
                <span>Arsenal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* THE ARMORY: RELICS OF FAITH */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                  The Armory • Relics of Faith
                </h4>
              </div>
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                {unlockedRelics.length}/{ALL_RELICS.length} Unlocked
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
              Tangible trophies earned by completing the legendary trials.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {ALL_RELICS.map((relic) => {
                const isUnlocked = unlockedRelics.includes(relic.id);
                return (
                  <div
                    key={relic.id}
                    title={isUnlocked ? `${relic.name}: ${relic.desc}` : `Locked (Complete ${relic.character}'s journey)`}
                    className={`p-2.5 rounded-xl text-left transition-all ${
                      isUnlocked
                        ? 'bg-amber-500/15 text-stone-900 dark:text-parchment-100 shadow-sm'
                        : 'bg-stone-200/50 dark:bg-stone-900/50 text-stone-400 dark:text-stone-600 opacity-60'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{relic.icon}</div>
                    <div className="text-xs font-bold truncate text-stone-900 dark:text-parchment-100">
                      {isUnlocked ? relic.name : '??? Locked'}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      {relic.character}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ATMOSPHERIC AUDIO SOUNDSCAPE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
                <Music className="w-4 h-4 text-amber-500" />
                <span>Ambient Soundscape</span>
              </div>
              {currentAmbience !== 'none' && (
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase">
                  Playing: {currentAmbience}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onToggleAmbience('campfire')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'campfire'
                    ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold'
                    : 'bg-white dark:bg-stone-800/80 border-stone-250 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Campfire</span>
              </button>

              <button
                onClick={() => onToggleAmbience('wind')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'wind'
                    ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold'
                    : 'bg-white dark:bg-stone-800/80 border-stone-250 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Breeze</span>
              </button>

              <button
                onClick={() => onToggleAmbience('sanctuary')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'sanctuary'
                    ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold'
                    : 'bg-white dark:bg-stone-800/80 border-stone-250 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Drone</span>
              </button>
            </div>

            {/* DRAMATIZED NARRATOR PERSONA */}
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-amber-500" />
                  ElevenLabs Voice
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                  {NARRATOR_VOICES[narratorProfile]?.actor || 'Adam (ElevenLabs)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cinematic', label: '🎬 Adam', sub: 'Cinematic' },
                  { id: 'brotherhood', label: '🤝 Antoni', sub: 'Grounded' },
                  { id: 'scholar', label: '📜 George', sub: 'Scholar' }
                ].map(p => (
                  <button
                    key={p.id}
                    title={NARRATOR_VOICES[p.id as NarratorProfile]?.description}
                    onClick={() => {
                      const newProfile = p.id as NarratorProfile;
                      soundEngine.setNarratorProfile(newProfile);
                      setNarratorProfile(newProfile);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all text-center border flex flex-col items-center justify-center ${
                      narratorProfile === p.id
                        ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold shadow-sm'
                        : 'bg-white dark:bg-stone-800/70 border-stone-250 dark:border-stone-750 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[9px] opacity-80 font-normal">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* 3-MINUTE MORNING BRIEFING MODAL */}
      {showMorningBriefing && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-4"
          onClick={() => {
            soundEngine.stopSpeaking();
            setIsPlayingBriefing(false);
            setShowMorningBriefing(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="morning-briefing-title"
        >
          <div 
            ref={briefingModalRef}
            tabIndex={-1}
            className="max-w-lg w-full p-6 rounded-2xl bg-white dark:bg-[#141820] border-2 border-amber-500 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto text-stone-900 dark:text-parchment-100 focus:outline-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-serif font-bold text-lg">
                  <Coffee className="w-5 h-5" />
                  <span id="morning-briefing-title">{dailyBriefing.title}</span>
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {dailyBriefing.hero} • <span className="text-amber-600 dark:text-amber-500/90">{dailyBriefing.themeTag}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  soundEngine.stopSpeaking();
                  setIsPlayingBriefing(false);
                  setShowMorningBriefing(false);
                }}
                aria-label="Close morning briefing"
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                <strong className="text-amber-700 dark:text-amber-400">1. Real Moment: </strong>
                {dailyBriefing.moment}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <strong className="text-amber-800 dark:text-amber-300">2. Truth for the Pocket: </strong>
                "{dailyBriefing.scriptureText}" — {dailyBriefing.scriptureReference}
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                <strong className="text-amber-700 dark:text-amber-400">3. Your Call Today: </strong>
                {dailyBriefing.dailyCall}
              </div>
            </div>

            {/* Narrator Persona Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-stone-100 dark:bg-stone-900/90 rounded-xl border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-xs font-mono text-stone-600 dark:text-stone-400">
                <Mic className="w-3.5 h-3.5 text-amber-500" />
                <span>ElevenLabs Voice:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'cinematic', label: '🎬 Adam' },
                  { id: 'brotherhood', label: '🤝 Antoni' },
                  { id: 'scholar', label: '📜 George' }
                ].map(p => (
                  <button
                    key={p.id}
                    title={NARRATOR_VOICES[p.id as NarratorProfile]?.description}
                    onClick={() => {
                      const newProfile = p.id as NarratorProfile;
                      soundEngine.setNarratorProfile(newProfile);
                      setNarratorProfile(newProfile);
                      if (isPlayingBriefing) {
                        soundEngine.stopSpeaking();
                        soundEngine.speakVerse(
                          dailyBriefing.narrationScript,
                          () => setIsPlayingBriefing(false)
                        );
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      narratorProfile === p.id
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-850'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (isPlayingBriefing) {
                    soundEngine.stopSpeaking();
                    setIsPlayingBriefing(false);
                  } else {
                    setIsPlayingBriefing(true);
                    soundEngine.speakVerse(
                      dailyBriefing.narrationScript,
                      () => setIsPlayingBriefing(false)
                    );
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isPlayingBriefing
                    ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-500 shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {isPlayingBriefing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
                <span>{isPlayingBriefing ? 'Pause Audio' : 'Listen Narration'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.stopSpeaking();
                  setIsPlayingBriefing(false);
                  soundEngine.playVictory();
                  if (!isBriefingBonusClaimed && onRewardXP) {
                    claimDailyBonus('briefing');
                    onRewardXP(50);
                  }
                  setShowMorningBriefing(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm"
              >
                Anchor Set {!isBriefingBonusClaimed ? '(+50 XP)' : ''} • Let's Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spaced Memory Pulse & Notification Modal */}
      <MemoryPulseModal
        isOpen={isMemoryPulseModalOpen}
        onClose={() => {
          setIsMemoryPulseModalOpen(false);
          setNotificationSettings(getNotificationSettings());
        }}
        targetVerse={activeMemoryVerse}
        onOpenWordForge={(verseId) => {
          setIsMemoryPulseModalOpen(false);
          onOpenWordForge(verseId);
        }}
      />

      {/* Proverbs Tactical Codex Modal */}
      <ProverbsCodexModal
        isOpen={isProverbsModalOpen}
        onClose={() => setIsProverbsModalOpen(false)}
        onOpenWordForge={(verseId) => {
          setIsProverbsModalOpen(false);
          onOpenWordForge(verseId);
        }}
        onSetMemoryVerse={(verseId) => {
          setActiveMemoryVerse(verseId);
          setPulseRefreshTrigger(t => t + 1);
        }}
        onRewardXP={onRewardXP}
      />

      {/* Psalms Field Medic Modal */}
      <PsalmsFieldMedicModal
        isOpen={isPsalmsMedicModalOpen}
        onClose={() => setIsPsalmsMedicModalOpen(false)}
        onOpenWordForge={(verseId) => {
          setIsPsalmsMedicModalOpen(false);
          onOpenWordForge(verseId);
        }}
        onSetMemoryVerse={(verseId) => {
          setActiveMemoryVerse(verseId);
          setPulseRefreshTrigger(t => t + 1);
        }}
        currentAmbience={currentAmbience}
        onToggleAmbience={onToggleAmbience}
        onRewardXP={onRewardXP}
      />

      {/* Canon Codex (66-Book Field Library) Modal */}
      <CanonCodexModal
        isOpen={isCanonModalOpen}
        onClose={() => setIsCanonModalOpen(false)}
        onOpenWordForge={(verseId) => {
          setIsCanonModalOpen(false);
          onOpenWordForge(verseId);
        }}
        onSetMemoryVerse={(verseId) => {
          setActiveMemoryVerse(verseId);
          setPulseRefreshTrigger(t => t + 1);
        }}
        onSelectStoryQuest={(questId) => {
          setIsCanonModalOpen(false);
          const quest = STORY_QUESTS.find(q => q.id === questId);
          if (quest) {
            onSelectQuest(quest);
          }
        }}
      />

      {/* 5-Second Battlefield Check-In Modal */}
      <BattlefieldCheckInModal
        isOpen={isBattlefieldModalOpen}
        onClose={() => setIsBattlefieldModalOpen(false)}
        activeBattlefieldId={activeBattlefieldId}
        onSelectBattlefield={(id) => {
          setTodayBattlefieldId(id);
          setActiveBattlefieldId(id);
        }}
      />

      {/* App-Wide Reading Voice Selector Modal */}
      <VoiceSelectorModal
        isOpen={isVoiceSelectorOpen}
        onClose={() => setIsVoiceSelectorOpen(false)}
      />
    </div>
  );
};
