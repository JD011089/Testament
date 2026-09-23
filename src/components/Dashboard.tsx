import React, { useState, useEffect } from 'react';
import type { StoryQuest } from '../types';
import { STORY_QUESTS } from '../data/stories';
import { soundEngine, type NarratorProfile } from '../utils/audio';
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
  Car,
  Download,
  Play,
  Pause,
  SlidersHorizontal,
  Mic,
  Bell,
  Send,
  HeartHandshake
} from 'lucide-react';
import type { UserCalibrationProfile } from './OnboardingModal';
import { MemoryPulseModal } from './MemoryPulseModal';
import { ProverbsCodexModal } from './ProverbsCodexModal';
import { PsalmsFieldMedicModal } from './PsalmsFieldMedicModal';
import { CanonCodexModal } from './CanonCodexModal';
import { 
  getNotificationSettings, 
  sendTestMemoryNotification, 
  requestNotificationPermission, 
  getNotificationPermission,
  getNextScheduledReminder,
  checkAndDispatchDueReminders,
  formatSlot12h,
  setActiveMemoryVerse
} from '../utils/notificationEngine';
import { getVerseById, getAllVerses } from '../utils/verseRegistry';
import { 
  getTodayFormatted, 
  getDailyVerse, 
  getDailyBriefing, 
  getAdaptiveNextObjective, 
  isDailyBonusClaimed, 
  claimDailyBonus 
} from '../utils/dailyEngine';

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
  onOpenDriveMode = () => {},
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
  onRewardXP
}) => {
  const [activeTrack, setActiveTrack] = useState<string>('All');
  const [showMorningBriefing, setShowMorningBriefing] = useState<boolean>(false);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);
  const [narratorProfile, setNarratorProfile] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [isMemoryPulseModalOpen, setIsMemoryPulseModalOpen] = useState<boolean>(false);
  const [isProverbsModalOpen, setIsProverbsModalOpen] = useState<boolean>(false);
  const [isPsalmsMedicModalOpen, setIsPsalmsMedicModalOpen] = useState<boolean>(false);
  const [isCanonModalOpen, setIsCanonModalOpen] = useState<boolean>(false);
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

    window.addEventListener('testament-notifications-updated', handleSettingsUpdated);
    window.addEventListener('open-proverbs-codex', handleOpenProverbs);
    window.addEventListener('open-psalms-medic', handleOpenPsalms);
    window.addEventListener('open-canon-codex', handleOpenCanon);

    const timer = setInterval(() => {
      setPulseRefreshTrigger(t => t + 1);
    }, 60000);

    return () => {
      window.removeEventListener('testament-notifications-updated', handleSettingsUpdated);
      window.removeEventListener('open-proverbs-codex', handleOpenProverbs);
      window.removeEventListener('open-psalms-medic', handleOpenPsalms);
      window.removeEventListener('open-canon-codex', handleOpenCanon);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-36 sm:pb-40 md:pb-48 text-left">
      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-[#11141a] border border-stone-800 shadow-md mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-glow-gold bg-stone-950 shrink-0">
            <img 
              src="/icons/icon-192.png" 
              alt="Testament Emblem" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-parchment-100">Testament</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono font-bold">
                {getRankTitle(xp)}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              <span className="text-amber-400 font-medium">{todayFormatted}</span> • The Living Word
            </p>
          </div>
        </div>

        {/* Action Controls & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMorningBriefing(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold hover:bg-amber-600 hover:text-black transition-all shadow-glow-ember"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>3-Min Morning Briefing</span>
            {!isBriefingBonusClaimed && (
              <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                +50 XP
              </span>
            )}
          </button>

          <button
            onClick={onOpenDriveMode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold hover:border-amber-500/60 hover:text-amber-400 transition-all"
          >
            <Car className="w-3.5 h-3.5 text-amber-500" />
            <span>Drive Audio</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              if (onOpenLibrary) onOpenLibrary();
              else setIsCanonModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-500 hover:text-amber-200 transition-all shadow-glow-amber"
            title="Browse all 66 books in the Scripture Field Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>66-Book Library</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsMemoryPulseModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-500 hover:text-amber-200 transition-all shadow-glow-amber"
            title="Configure multi-daily memory verse notifications"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Memory Pulse ({notificationSettings.frequencyPerDay}x)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              window.dispatchEvent(new CustomEvent('open-pwa-install'));
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold hover:border-amber-500/60 hover:text-amber-400 transition-all"
            title="Install Testament App"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Install App</span>
          </button>

          {onOpenOnboarding && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenOnboarding();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold hover:border-amber-500/60 hover:text-amber-400 transition-all"
              title="Calibrate your battle plan and learning style"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>{userProfile ? 'My Battle Plan' : 'Calibrate'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
            <span className="text-xs font-mono font-bold text-parchment-100">{streakCount} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* WIDESCREEN DESKTOP GRID: MAIN STAGE (col 8) + SIDEBAR (col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN STAGE (65-70% on Desktop) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Cinematic Hero Study Table Banner */}
          <div className="rounded-2xl overflow-hidden border-2 border-amber-700/40 shadow-2xl relative bg-[#0e1117]">
            <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-stone-950">
              <img 
                src="/images/hero_banner.jpg" 
                alt="Ancient study table with scripture and shield" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117] via-stone-950/50 to-transparent" />
            </div>

            <div className="p-5 md:p-6 relative">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Daily Truth For The Trenches</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/90 px-2.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
                  {todayFormatted}
                </span>
              </div>

              <h3 className="text-xl md:text-3xl font-serif font-black text-parchment-50 mb-2">
                "{dailyVerse.text}"
              </h3>

              <p className="text-xs md:text-sm text-parchment-200/90 leading-relaxed mb-4 max-w-2xl">
                {dailyVerse.plainEnglishSummary}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-500 font-semibold">{dailyVerse.reference}</span>
                  <span className="text-[10px] font-mono text-stone-400 px-2 py-0.5 rounded bg-stone-900 border border-stone-800 hidden sm:inline-block">
                    {dailyVerse.category}
                  </span>
                </div>
                <button
                  onClick={() => onOpenWordForge(dailyVerse.id)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
                >
                  <span>Lock this into memory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SPACED MEMORY PULSE CARD */}
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#151922] via-[#10131a] to-[#141822] border-2 border-amber-500/40 shadow-glow-gold relative overflow-hidden text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Bell className="w-4 h-4 animate-pulse" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                      Spaced Memory Pulse
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                      notificationSettings.enabled 
                        ? 'bg-amber-950/60 border-amber-800/60 text-amber-300' 
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}>
                      {notificationSettings.enabled ? `${notificationSettings.frequencyPerDay}x / Day` : 'Paused'}
                    </span>
                    {nextReminder && notificationSettings.enabled && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Next: {nextReminder.label} ({nextReminder.remainingFormatted})</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {testNoticeStatus && (
                  <span className="text-[11px] font-mono text-amber-400 animate-pulse">
                    {testNoticeStatus}
                  </span>
                )}
                <button
                  onClick={handleCheckAndSyncReminders}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700 text-xs font-medium transition-colors"
                  title="Check current schedule and trigger any due reminder"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Sync Schedule</span>
                </button>
                <button
                  onClick={handleQuickTestNotification}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700 text-xs font-medium transition-colors"
                  title="Sends an instant recall prompt to this device"
                >
                  <Send className="w-3 h-3 text-amber-400" />
                  <span>Test Prompt</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMemoryPulseModalOpen(true);
                  }}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-1"
                >
                  Configure
                </button>
              </div>
            </div>

            <div className="bg-black/35 p-3.5 rounded-xl border border-stone-800/90 mb-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-serif font-bold text-amber-300">
                    {activeMemoryVerse.reference}
                  </span>
                  {activeMemoryVerse.heroName && (
                    <span className="text-[10px] font-mono text-stone-400">
                      • Story: {activeMemoryVerse.heroName}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  {notificationSettings.notificationsSentToday} of {notificationSettings.frequencyPerDay} prompts today
                </span>
              </div>
              <p className="text-xs md:text-sm text-parchment-100 italic line-clamp-2 leading-relaxed">
                "{activeMemoryVerse.text}"
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-stone-400">Scheduled:</span>
                {notificationSettings.scheduledSlots.map((slot, idx) => {
                  const isFired = notificationSettings.firedSlotsToday?.includes(slot);
                  const isNext = nextReminder && nextReminder.slot === slot && !nextReminder.isTomorrow;
                  return (
                    <span
                      key={idx}
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-all ${
                        isFired
                          ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 font-bold'
                          : isNext
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-glow-amber'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                      title={isFired ? 'Already delivered today' : isNext ? `Next upcoming reminder (${nextReminder?.remainingFormatted})` : 'Upcoming slot'}
                    >
                      {isFired ? '✓ ' : isNext ? '⏳ ' : ''}{formatSlot12h(slot)}
                      {isNext ? ` (Next)` : isFired ? ` Sent` : ''}
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenWordForge(activeMemoryVerse.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-glow-amber transition-all"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Practice in Word Forge</span>
                </button>
              </div>
            </div>
          </div>

          {/* THE CANON CODEX BANNER (66-BOOK FIELD LIBRARY) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#151926] to-stone-900 border border-amber-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
                📜
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                    The Complete Canon • 66 Books
                  </span>
                  <span className="text-xs text-stone-400">All Scriptures Unlocked</span>
                </div>
                <h4 className="text-sm sm:text-base font-serif font-bold text-parchment-50">
                  The Scripture Field Library
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Every book from Genesis to Revelation translated into real-world Monday morning tactical intelligence.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playSnap();
                if (onOpenLibrary) onOpenLibrary();
                else setIsCanonModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-glow-amber transition-all shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore 66 Books</span>
            </button>
          </div>

          {/* LEARNER'S TOOLKIT (Visual & Non-Academic Learning Accelerators) */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 mb-3">
              The Learner’s Toolkit • Anti-Textbook Accelerators
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenTimeline();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <Clock className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">60-Sec Timeline</div>
                <div className="text-[10px] text-stone-400 mt-0.5">The Bible in 6 eras</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenDossiers();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <Zap className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">Character Dossiers</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Superpowers & flaws</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenStreetTranslator();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <BookA className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">Street Translator</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Zero religious jargon</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  onOpenDilemmas();
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <ShieldAlert className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">"What’s the Play?"</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Real-life simulator</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setIsProverbsModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-amber-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <Shield className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">Proverbs Codex</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Solomon's playbook</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setIsPsalmsMedicModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-[#141822] border border-stone-800 hover:border-rose-500/70 hover:bg-[#181d2a] transition-all text-left group shadow-sm"
              >
                <HeartHandshake className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-serif font-bold text-parchment-50">Psalms Medic</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Emergency triage</div>
              </button>
            </div>
          </div>

          {/* ADAPTIVE NEXT OBJECTIVE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#131722] to-stone-900 border border-amber-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                {adaptiveObjective.type === 'retention_drill' ? '🧠' : adaptiveObjective.type === 'next_act' ? '⚔️' : '👑'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                    {adaptiveObjective.badge}
                  </span>
                  <span className="text-xs text-stone-400">Adaptive Objective</span>
                </div>
                <h4 className="text-sm sm:text-base font-serif font-bold text-parchment-50">
                  {adaptiveObjective.title}
                </h4>
                <p className="text-xs text-stone-400 line-clamp-1 max-w-xl">
                  {adaptiveObjective.subtitle}
                </p>
              </div>
            </div>

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
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-gold focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span>{adaptiveObjective.type === 'retention_drill' ? 'Start Retention Drill' : 'Resume Mission'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Curated Starter Tracks (Recommendation Filters) */}
          <div>
            {userProfile && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#141822] to-stone-900 border border-amber-600/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                    🎯
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      Your Calibrated Battle Plan
                    </div>
                    <div className="text-xs sm:text-sm font-serif font-bold text-parchment-100">
                      Targeting: {userProfile.battleTitle}
                    </div>
                    <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>Mode: <strong className="text-amber-300 uppercase">{userProfile.learningStyle}</strong></span>
                      <span>•</span>
                      <span>Cadence: <strong className="text-amber-300">{userProfile.dailyCadence === '3min' ? '3 Min/Day' : userProfile.dailyCadence === '10min' ? '7-10 Min/Day' : 'Deep Study'}</strong></span>
                    </div>
                  </div>
                </div>

                {onOpenOnboarding && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenOnboarding();
                    }}
                    className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors whitespace-nowrap"
                  >
                    Re-Calibrate
                  </button>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-500 mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Curated Paths & Deep Dives</span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-black text-parchment-50">
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
                        ? 'bg-amber-600 text-black font-bold shadow-sm'
                        : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-COLUMN GRID OF ILLUSTRATED QUEST CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="flex flex-col justify-between rounded-2xl bg-[#12151b] border border-stone-800 hover:border-amber-500/70 transition-all shadow-lg overflow-hidden group cursor-pointer hover:shadow-glow-gold/10"
                  >
                    {/* Visual Illustration Thumbnail */}
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-stone-950">
                      <img 
                        src={questImage} 
                        alt={quest.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12151b] via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-amber-600/30 text-[10px] font-mono text-amber-400 uppercase">
                        {quest.heroName}
                      </div>

                      {userProfile?.recommendedQuestId === quest.id && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider shadow-glow-gold flex items-center gap-1">
                          <span>🎯</span>
                          <span>Your Battle Plan</span>
                        </div>
                      )}

                      {!userProfile && quest.id === 'david-journey' && completedCount === 0 && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          Recommended First
                        </div>
                      )}

                      {quest.starterTrack && !((userProfile?.recommendedQuestId === quest.id) || (!userProfile && quest.id === 'david-journey' && completedCount === 0)) && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded bg-amber-950/80 backdrop-blur-md border border-amber-800/40 text-[9px] font-mono text-amber-300 uppercase">
                          {quest.starterTrack}
                        </div>
                      )}
                    </div>

                    {/* Quest Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                          <span>{quest.testament}</span>
                          <span>•</span>
                          <span>{quest.historicalPeriod}</span>
                        </div>

                        <h4 className="text-lg font-serif font-bold text-parchment-50 group-hover:text-amber-400 transition-colors">
                          {quest.title}
                        </h4>

                        <p className="text-xs text-stone-400 font-medium">
                          {quest.subtitle}
                        </p>

                        <p className="text-xs text-stone-300 italic pt-2 line-clamp-2">
                          "{quest.summary}"
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>{quest.estimatedMinutes} min</span>
                          <span>•</span>
                          <span>{completedCount}/{quest.acts.length} Acts</span>
                        </div>

                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectQuest(quest);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1 transition-all shadow-glow-gold"
                        >
                          <span>{completedCount === 0 ? 'Start' : isFullyComplete ? 'Replay' : 'Continue'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1 px-5 pb-3">
                      {quest.acts.map((act) => (
                        <div
                          key={act.id}
                          className={`h-1.5 rounded-full flex-1 transition-colors ${
                            completedActs.includes(act.id) ? 'bg-amber-500' : 'bg-stone-800'
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

        {/* RIGHT SIDEBAR (30-35% on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* THE ARMORY: RELICS OF FAITH */}
          <div className="p-5 rounded-2xl bg-[#13161c] border border-stone-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-serif font-bold text-parchment-50">
                  The Armory • Relics of Faith
                </h4>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {unlockedRelics.length}/{ALL_RELICS.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Tangible trophies earned by completing the legendary trials.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {ALL_RELICS.map((relic) => {
                const isUnlocked = unlockedRelics.includes(relic.id);
                return (
                  <div
                    key={relic.id}
                    title={isUnlocked ? `${relic.name}: ${relic.desc}` : `Locked (Complete ${relic.character}'s journey)`}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isUnlocked
                        ? 'bg-amber-950/30 border-amber-600/50 text-parchment-100 shadow-sm'
                        : 'bg-stone-900/50 border-stone-800/80 text-stone-600 opacity-60'
                    }`}
                  >
                    <div className="text-xl mb-1">{relic.icon}</div>
                    <div className="text-xs font-bold truncate text-parchment-100">
                      {isUnlocked ? relic.name : '??? Locked'}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {relic.character}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WORD FORGE FAST-LAUNCH CARD */}
          <div className="p-5 rounded-2xl bg-[#12151b] border border-stone-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-serif font-bold text-parchment-50">
                The Word Forge
              </h4>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              Tactile scripture memory with word tiles. Practice verses for stress, anger, and purpose.
            </p>
            <div className="text-xs font-mono text-amber-400 mb-3">
              {memorizedVerses.length} Scriptures Mastered
            </div>
            <button
              onClick={() => onOpenWordForge()}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-parchment-100 flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span>Launch Word Forge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SCRIPTURE ARSENAL CARD */}
          <div className="p-5 rounded-2xl bg-[#12151b] border border-stone-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-stone-400" />
              <h4 className="text-sm font-serif font-bold text-parchment-50">
                The Scripture Arsenal
              </h4>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              Curated verses with plain-English breakdowns and personal reflection journal.
            </p>
            <button
              onClick={onOpenArsenal}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-parchment-100 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ATMOSPHERIC AUDIO SOUNDSCAPE */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-300">
                <Music className="w-4 h-4 text-amber-500" />
                <span>Ambient Soundscape</span>
              </div>
              {currentAmbience !== 'none' && (
                <span className="text-[10px] font-mono text-amber-400 uppercase">
                  Playing: {currentAmbience}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onToggleAmbience('campfire')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'campfire'
                    ? 'bg-amber-600 border-amber-500 text-black font-bold'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Campfire</span>
              </button>

              <button
                onClick={() => onToggleAmbience('wind')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'wind'
                    ? 'bg-amber-600 border-amber-500 text-black font-bold'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Breeze</span>
              </button>

              <button
                onClick={() => onToggleAmbience('sanctuary')}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  currentAmbience === 'sanctuary'
                    ? 'bg-amber-600 border-amber-500 text-black font-bold'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Drone</span>
              </button>
            </div>

            {/* DRAMATIZED NARRATOR PERSONA */}
            <div className="mt-3 pt-3 border-t border-stone-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-amber-500" />
                  Voice Persona
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {narratorProfile === 'cinematic' ? 'Christopher' : narratorProfile === 'brotherhood' ? 'Guy' : 'Ryan (UK)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cinematic', label: '🎬 Cinematic' },
                  { id: 'brotherhood', label: '🤝 Grounded' },
                  { id: 'scholar', label: '📜 Scholar' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const newProfile = p.id as NarratorProfile;
                      soundEngine.setNarratorProfile(newProfile);
                      setNarratorProfile(newProfile);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all text-center border ${
                      narratorProfile === p.id
                        ? 'bg-amber-600 border-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-800/70 border-stone-750 text-stone-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-MINUTE MORNING BRIEFING MODAL */}
      {showMorningBriefing && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-start sm:items-center justify-center p-4"
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
            className="max-w-lg w-full p-6 rounded-2xl bg-[#141820] border-2 border-amber-600/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-lg">
                  <Coffee className="w-5 h-5" />
                  <span id="morning-briefing-title">{dailyBriefing.title}</span>
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {dailyBriefing.hero} • <span className="text-amber-500/90">{dailyBriefing.themeTag}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  soundEngine.stopSpeaking();
                  setIsPlayingBriefing(false);
                  setShowMorningBriefing(false);
                }}
                aria-label="Close morning briefing"
                className="p-1 rounded-lg text-stone-400 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <strong className="text-amber-400">1. Real Moment: </strong>
                {dailyBriefing.moment}
              </div>

              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-900/40">
                <strong className="text-amber-300">2. Truth for the Pocket: </strong>
                "{dailyBriefing.scriptureText}" — {dailyBriefing.scriptureReference}
              </div>

              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <strong className="text-amber-400">3. Your Call Today: </strong>
                {dailyBriefing.dailyCall}
              </div>
            </div>

            {/* Narrator Persona Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-stone-900/90 rounded-xl border border-stone-800">
              <div className="flex items-center gap-1.5 text-xs font-mono text-stone-400">
                <Mic className="w-3.5 h-3.5 text-amber-500" />
                <span>Narrator Persona:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'cinematic', label: '🎬 Cinematic' },
                  { id: 'brotherhood', label: '🤝 Grounded' },
                  { id: 'scholar', label: '📜 Scholar' }
                ].map(p => (
                  <button
                    key={p.id}
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
                        ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                        : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-850'
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
                    ? 'bg-amber-600 text-stone-950 font-extrabold border-amber-500 shadow-glow-gold'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
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
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow-glow-gold"
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
    </div>
  );
};
