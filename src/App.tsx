import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import type { StoryQuest } from './types';
import { STORY_QUESTS } from './data/stories';
import { Dashboard } from './components/Dashboard';
import { StoryViewer } from './components/StoryViewer';
import { ArsenalView } from './components/ArsenalView';
import { Navigation } from './components/Navigation';
import type { NavTab } from './components/Navigation';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import type { UserCalibrationProfile } from './components/OnboardingModal';
import { UpdateNotificationBanner } from './components/UpdateNotificationBanner';
import { CampaignNextTaskPrompt } from './components/CampaignNextTaskPrompt';
import { soundEngine } from './utils/audio';
import { 
  recordVerseMasteryDate, 
  setTodayBattlefieldId,
  getDailyStreakCount,
  recordDailyActivityStreak,
  getTodayDateKey 
} from './utils/dailyEngine';
import { setActiveMemoryVerse } from './utils/calendarReminders';
import { markCampaignStepCompleted } from './data/dailyCampaigns';
import type { DailyCampaignStep } from './data/dailyCampaigns';
import { getComposedDailyMission } from './utils/missionComposer';
import { pathForTab, tabFromPath, type AppTab } from './utils/routes';
import { loadReadingPlace } from './utils/readingPlace';
import { addBookmark, removeBookmark } from './utils/bookmarks';
import { getDailyMission, type GeneratedDailyMission } from './utils/dailyMissionPipeline';
import { isVerseMastered } from './utils/fsrsEngine';

const DossierModal = lazy(() => import('./components/DossierModal').then(m => ({ default: m.DossierModal })));
const ProverbsCodexModal = lazy(() => import('./components/ProverbsCodexModal').then(m => ({ default: m.ProverbsCodexModal })));
const PsalmsFieldMedicModal = lazy(() => import('./components/PsalmsFieldMedicModal').then(m => ({ default: m.PsalmsFieldMedicModal })));
const OnboardingModal = lazy(() => import('./components/OnboardingModal').then(m => ({ default: m.OnboardingModal })));
const WhatsNewModal = lazy(() => import('./components/WhatsNewModal').then(m => ({ default: m.WhatsNewModal })));
const HowTestamentWorksModal = lazy(() => import('./components/HowTestamentWorksModal').then(m => ({ default: m.HowTestamentWorksModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const PracticeView = lazy(() => import('./components/PracticeView').then((m) => ({ default: m.PracticeView })));
const CanonLibraryPage = lazy(() => import('./components/CanonLibraryPage').then((m) => ({ default: m.CanonLibraryPage })));
const TriviaGauntlet = lazy(() => import('./components/TriviaGauntlet').then((m) => ({ default: m.TriviaGauntlet })));
const DriveModePlayer = lazy(() => import('./components/DriveModePlayer').then((m) => ({ default: m.DriveModePlayer })));

function ViewFallback() {
  return <div className="max-w-7xl mx-auto px-6 py-16 text-sm text-stone-500">Loading...</div>;
}

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'null') return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function persistNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore quota failures
  }
}

export function App() {
  const [currentTab, setCurrentTabState] = useState<AppTab>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'wordforge' || params.get('verseId')) return 'wordforge';
    if (params.get('action') === 'library' || params.get('tab') === 'library') return 'library';
    return tabFromPath(window.location.pathname);
  });

  const setCurrentTab = (tab: AppTab) => {
    setCurrentTabState(tab);
    const next = pathForTab(tab);
    if (window.location.pathname !== next) {
      window.history.replaceState({ tab }, '', next);
    }
  };
  const [activeQuest, setActiveQuest] = useState<StoryQuest | null>(null);
  const [activeDailyMission, setActiveDailyMission] = useState<GeneratedDailyMission | null>(null);
  const [libraryPassage, setLibraryPassage] = useState<{
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd: number;
  } | null>(null);
  const [currentAmbience, setCurrentAmbience] = useState<'none' | 'campfire' | 'wind' | 'sanctuary'>('none');

  // Modals state (owned at App so Library deep-links work when Dashboard is unmounted)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isProverbsOpen, setIsProverbsOpen] = useState(false);
  const [isPsalmsOpen, setIsPsalmsOpen] = useState(false);
  const [isDriveModeOpen, setIsDriveModeOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  // Part 9: First-run experience drops the user straight into the mission with zero popup modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Keep modal states in refs so the single window popstate listener closes modals before exiting the app
  const modalsRef = useRef({    isSettingsOpen,
    isDossierOpen,
    isProverbsOpen,
    isPsalmsOpen,
    isDriveModeOpen,
    isWhatsNewOpen,
    isHowItWorksOpen,
    isOnboardingOpen
  });

  useEffect(() => {
    modalsRef.current = {
      isSettingsOpen,
      isDossierOpen,
      isProverbsOpen,
      isPsalmsOpen,
      isDriveModeOpen,
      isWhatsNewOpen,
      isHowItWorksOpen,
      isOnboardingOpen
    };
  }, [
    isSettingsOpen,
    isDossierOpen,
    isProverbsOpen,
    isPsalmsOpen,
    isDriveModeOpen,
    isWhatsNewOpen,
    isHowItWorksOpen,
    isOnboardingOpen
  ]);

  const [userProfile, setUserProfile] = useState<UserCalibrationProfile | null>(() => {
    try {
      const stored = localStorage.getItem('testament_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persistence for user progress
  const [completedActs, setCompletedActs] = useState<string[]>(() => readStringArray('testament_completed_acts'));

  const [memorizedVerses, setMemorizedVerses] = useState<string[]>(() => readStringArray('testament_memorized_verses'));

  const [unlockedRelics, setUnlockedRelics] = useState<string[]>(() => readStringArray('testament_unlocked_relics'));

  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>(() => readStringArray('testament_bookmarked_verses'));

  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('testament_xp')) || 0;
  });

  const [targetWordForgeVerseId, setTargetWordForgeVerseId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('verseId') || null;
  });

  const [targetDilemmaId, setTargetDilemmaId] = useState<string | null>(null);
  const [targetPsalmId, setTargetPsalmId] = useState<string | null>(null);
  const [targetProverbId, setTargetProverbId] = useState<string | null>(null);
  const [targetDossierId, setTargetDossierId] = useState<string | null>(null);
  const [campaignPrompt, setCampaignPrompt] = useState<{ completedStep: number; nextStep: DailyCampaignStep } | null>(null);

  const [streakCount, setStreakCount] = useState<number>(() => {
    // One-time cleanup for dead legacy checkin key
    try {
      localStorage.removeItem('testament_daily_checkin');
    } catch {
      // ignore
    }
    return getDailyStreakCount();
  });

  const recordActivityStreak = () => {
    const next = recordDailyActivityStreak();
    setStreakCount(next);
  };

  const openModalWithHistory = (name: string, open: () => void) => {
    open();
    try {
      if (window.history.state?.modal !== name) {
        window.history.pushState({ modal: name, tab: currentTabRef.current }, '', window.location.pathname + window.location.search);
      }
    } catch {
      // ignore
    }
  };

  // Keep activeQuestRef & activeDailyMissionRef in sync with state for popstate listener closure
  const activeQuestRef = useRef(activeQuest);
  useEffect(() => {
    activeQuestRef.current = activeQuest;
  }, [activeQuest]);

  const currentTabRef = useRef(currentTab);
  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  const activeDailyMissionRef = useRef(activeDailyMission);
  useEffect(() => {
    activeDailyMissionRef.current = activeDailyMission;
  }, [activeDailyMission]);


  // M-10: Restore in-progress daily mission on return if user was interrupted mid-mission
  useEffect(() => {
    try {
      const raw = localStorage.getItem('testament_in_progress_mission');
      if (raw) {
        const inProg = JSON.parse(raw);
        if (inProg && inProg.dateKey === getTodayDateKey() && inProg.missionId && !completedActs.includes(inProg.missionId)) {
          getDailyMission(getTodayDateKey()).then((m) => {
            if (m && m.id === inProg.missionId) {
              setActiveDailyMission(m);
            }
          });
        }
      }
    } catch {
      // ignore
    }
  }, [completedActs]);

  // Handle URL deep links cleanup and listen for Service Worker messages
  useEffect(() => {
    const closeTopModalFromHistory = (): boolean => {
      const m = modalsRef.current;
      if (m.isSettingsOpen) { setIsSettingsOpen(false); return true; }
      if (m.isProverbsOpen) { setIsProverbsOpen(false); return true; }
      if (m.isPsalmsOpen) { setIsPsalmsOpen(false); return true; }
      if (m.isDossierOpen) { setIsDossierOpen(false); return true; }
      if (m.isDriveModeOpen) { setIsDriveModeOpen(false); return true; }
      if (m.isWhatsNewOpen) { setIsWhatsNewOpen(false); return true; }
      if (m.isHowItWorksOpen) { setIsHowItWorksOpen(false); return true; }
      if (m.isOnboardingOpen) { setIsOnboardingOpen(false); return true; }
      return false;
    };

    const onPop = (e: PopStateEvent) => {
      // 1. Close open modals first on Back button
      if (closeTopModalFromHistory()) return;

      // 2. Close active mission or quest
      if (activeDailyMissionRef.current) {
        setActiveDailyMission(null);
        return;
      }
      if (activeQuestRef.current) {
        setActiveQuest(null);
        return;
      }

      // 3. Navigate tab
      const nextTab = (e.state as { tab?: string } | null)?.tab || tabFromPath(window.location.pathname);
      setCurrentTabState(nextTab as NavTab);
    };
    window.addEventListener('popstate', onPop);

    const next = pathForTab(currentTab);
    const search = window.location.search;
    if (window.location.pathname !== next) {
      window.history.replaceState({ tab: currentTab }, '', next + search);
    }

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TESTAMENT_NAVIGATE_VERSE' && event.data.verseId) {
        setTargetWordForgeVerseId(event.data.verseId);
        setCurrentTab('wordforge');
        setActiveDailyMission(null);
        setActiveQuest(null);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.removeEventListener('popstate', onPop);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [currentTab]);

  useEffect(() => {
    const onBookmark = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (typeof id !== 'string') return;
      setBookmarkedVerses((prev) => {
        if (prev.includes(id)) return prev;
        return addBookmark(id);
      });
    };
    window.addEventListener('testament-verse-bookmarked', onBookmark);
    return () => window.removeEventListener('testament-verse-bookmarked', onBookmark);
  }, []);

  useEffect(() => {
    const handleOpenLibrary = () => {
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setCurrentTab('library');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenProverbs = () => openModalWithHistory('proverbs', () => setIsProverbsOpen(true));
    const handleOpenPsalms = () => openModalWithHistory('psalms', () => setIsPsalmsOpen(true));

    window.addEventListener('open-canon-library', handleOpenLibrary);
    window.addEventListener('open-canon-codex', handleOpenLibrary);
    window.addEventListener('open-proverbs-codex', handleOpenProverbs);
    window.addEventListener('open-psalms-medic', handleOpenPsalms);

    const handleOpenSettings = () => openModalWithHistory('settings', () => setIsSettingsOpen(true));
    window.addEventListener('testament-open-settings', handleOpenSettings);

    return () => {
      window.removeEventListener('open-canon-library', handleOpenLibrary);
      window.removeEventListener('open-canon-codex', handleOpenLibrary);
      window.removeEventListener('open-proverbs-codex', handleOpenProverbs);
      window.removeEventListener('open-psalms-medic', handleOpenPsalms);
      window.removeEventListener('testament-open-settings', handleOpenSettings);
    };
  }, []);

  // Listen for dilemma completions from DilemmaSimulator to advance Daily Campaign
  useEffect(() => {
    const handleDilemmaCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ dilemmaId: string }>;
      const todayCampaign = getComposedDailyMission();
      const dilemmaStep = todayCampaign.steps.find(step => step.type === 'dilemma');
      if (dilemmaStep && dilemmaStep.targetId === customEvent.detail?.dilemmaId) {
        recordActivityStreak();
        markCampaignStepCompleted(todayCampaign.id, dilemmaStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
        const nextStep = todayCampaign.steps.find(step => step.stepNumber === dilemmaStep.stepNumber + 1);
        if (nextStep) setCampaignPrompt({ completedStep: dilemmaStep.stepNumber, nextStep });
      }
    };

    window.addEventListener('testament-dilemma-completed', handleDilemmaCompleted);
    return () => window.removeEventListener('testament-dilemma-completed', handleDilemmaCompleted);
  }, []);

  useEffect(() => {
    const markStep = (type: DailyCampaignStep['type']) => {
      const todayCampaign = getComposedDailyMission();
      const step = todayCampaign.steps.find((item) => item.type === type);
      if (!step) return;
      markCampaignStepCompleted(todayCampaign.id, step.stepNumber, undefined, todayCampaign.steps.length);
      window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
    };
    const onChapter = () => markStep('canon');
    const onProverb = () => markStep('proverb');
    const onPsalm = () => markStep('psalm');
    window.addEventListener('testament-scripture-read', onChapter);
    window.addEventListener('testament-proverb-applied', onProverb);
    window.addEventListener('testament-psalm-applied', onPsalm);
    return () => {
      window.removeEventListener('testament-scripture-read', onChapter);
      window.removeEventListener('testament-proverb-applied', onProverb);
      window.removeEventListener('testament-psalm-applied', onPsalm);
    };
  }, []);

  const handleLaunchCampaignStep = (step: DailyCampaignStep) => {
    soundEngine.playClick();
    if (step.type === 'quest') {
      const targetQuest = STORY_QUESTS.find(q => q.id === step.targetId);
      if (targetQuest) {
        setActiveQuest(targetQuest);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (step.type === 'dilemma') {
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setTargetDilemmaId(step.targetId);
      setCurrentTab('dilemmas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step.type === 'wordforge') {
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setTargetWordForgeVerseId(step.targetId);
      setCurrentTab('wordforge');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step.type === 'canon') {
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setCurrentTab('library');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step.type === 'proverb') {
      openModalWithHistory('proverbs', () => setIsProverbsOpen(true));
    } else if (step.type === 'psalm') {
      openModalWithHistory('psalms', () => setIsPsalmsOpen(true));
    }
  };

  const handleOpenNexus = (type: string, id: string) => {
    soundEngine.playClick();
    if (type === 'quest') {
      handleSelectQuestById(id);
      return;
    }
    if (type === 'dilemma') {
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setTargetDilemmaId(id);
      setCurrentTab('dilemmas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (type === 'psalm') {
      setTargetPsalmId(id);
      openModalWithHistory('psalms', () => setIsPsalmsOpen(true));
      return;
    }
    if (type === 'proverb') {
      setTargetProverbId(id);
      openModalWithHistory('proverbs', () => setIsProverbsOpen(true));
      return;
    }
    if (type === 'dossier') {
      setTargetDossierId(id);
      openModalWithHistory('dossier', () => setIsDossierOpen(true));
    }
  };

  const handleProceedCampaignPrompt = (nextStep: DailyCampaignStep) => {
    setCampaignPrompt(null);
    handleLaunchCampaignStep(nextStep);
  };

  const handleStartDailyMission = (mission: GeneratedDailyMission) => {
    try {
      window.history.pushState({ modal: 'mission', missionId: mission.id, tab: currentTab }, '', window.location.pathname + window.location.search);
    } catch {
      // ignore
    }
    setActiveQuest(null);
    setActiveDailyMission(mission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDailyMission = () => {
    soundEngine.playClick();
    if (window.history.state?.modal === 'mission') {
      window.history.back();
    } else {
      setActiveDailyMission(null);
    }
  };

  const handleSelectQuest = (quest: StoryQuest) => {
    try {
      window.history.pushState({ modal: 'quest', questId: quest.id, tab: currentTab }, '', window.location.pathname + window.location.search);
    } catch {
      // ignore
    }
    setActiveDailyMission(null);
    setActiveQuest(quest);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuestById = (questId: string) => {
    const target = STORY_QUESTS.find(q => q.id === questId);
    if (target) {
      handleSelectQuest(target);
    }
  };

  const handleBackFromQuest = () => {
    soundEngine.playClick();
    if (window.history.state?.modal === 'quest') {
      window.history.back();
    } else {
      setActiveQuest(null);
    }
  };

  const handleCompleteAct = (actId: string, _questId: string, relicId?: string) => {
    if (!completedActs.includes(actId)) {
      const updated = [...completedActs, actId];
      setCompletedActs(updated);
      localStorage.setItem('testament_completed_acts', JSON.stringify(updated));

      let bonusXp = 50;
      if (relicId && !unlockedRelics.includes(relicId)) {
        const updatedRelics = [...unlockedRelics, relicId];
        setUnlockedRelics(updatedRelics);
        localStorage.setItem('testament_unlocked_relics', JSON.stringify(updatedRelics));
        bonusXp += 100;
      }

      const newXp = xp + bonusXp;
      setXp(newXp);
      persistNumber('testament_xp', newXp);
      recordActivityStreak();

      const todayCampaign = getComposedDailyMission();
      const questStep = todayCampaign.steps.find(step => step.type === 'quest');
      if (questStep && (questStep.targetId === _questId || questStep.targetSecondaryId === actId)) {
        markCampaignStepCompleted(todayCampaign.id, questStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
        // Do not auto-pop campaignPrompt here: StoryViewer handles act progression and next-step choices cleanly
      }
    }
  };

  const handleVerseMastered = (verseId: string) => {
    recordActivityStreak();
    const creditForgeStep = () => {
      const todayCampaign = getComposedDailyMission();
      const forgeStep = todayCampaign.steps.find(step => step.type === 'wordforge');
      if (forgeStep && (forgeStep.targetId === verseId || verseId.includes(forgeStep.targetId.replace('story-', '')))) {
        markCampaignStepCompleted(todayCampaign.id, forgeStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
        const nextStep = todayCampaign.steps.find(step => step.stepNumber === forgeStep.stepNumber + 1);
        if (nextStep) setCampaignPrompt({ completedStep: forgeStep.stepNumber, nextStep });
      }
    };

    if (isVerseMastered(verseId)) {
      recordVerseMasteryDate(verseId);
      if (!memorizedVerses.includes(verseId)) {
        const updated = [...memorizedVerses, verseId];
        setMemorizedVerses(updated);
        try {
          localStorage.setItem('testament_memorized_verses', JSON.stringify(updated));
        } catch {
          // ignore
        }

        const newXp = xp + 40;
        setXp(newXp);
        persistNumber('testament_xp', newXp);
      }
    }
    creditForgeStep();
  };

  const handleRewardXP = (amount: number) => {
    // Read the persisted total so rapid awards cannot clobber each other via a stale closure.
    let current = xp;
    try {
      const stored = localStorage.getItem('testament_xp');
      if (stored !== null) current = Number(stored) || 0;
    } catch {
      // ignore storage failures
    }
    const newXp = current + amount;
    setXp(newXp);
    persistNumber('testament_xp', newXp);
  };

  const handleToggleBookmark = (verseId: string) => {
    const updated = bookmarkedVerses.includes(verseId)
      ? removeBookmark(verseId)
      : addBookmark(verseId);
    setBookmarkedVerses(updated);
  };

  const handleSaveBookmark = (verseId: string) => {
    if (bookmarkedVerses.includes(verseId)) return false;
    setBookmarkedVerses(addBookmark(verseId));
    return true;
  };

  const handleCompleteOnboarding = (
    profile: UserCalibrationProfile, 
    startRecommendedQuest?: boolean
  ) => {
    setUserProfile(profile);
    setIsOnboardingOpen(false);
    window.dispatchEvent(new Event('testament-onboarding-settled'));

    // Wire calibration into real session behavior
    try {
      localStorage.setItem('testament_dashboard_mode', 'guided');
      // Map battle → today's battlefield focus
      const battleToBattlefield: Record<string, string> = {
        responsibility: 'workplace-politics',
        betrayal: 'betrayal-relational',
        regret: 'anxiety-overwhelm',
        purpose: 'high-stakes-decision',
        discipline: 'anxiety-overwhelm',
      };
      const bfId = battleToBattlefield[profile.battleId];
      if (bfId) setTodayBattlefieldId(bfId);

      // Audio-first learners get a one-shot flag to auto-play the 45s briefing
      if (profile.learningStyle === 'audio') {
        localStorage.setItem('testament_prefer_audio_briefing', 'true');
      } else {
        localStorage.removeItem('testament_prefer_audio_briefing');
      }

      // Cadence shapes how Explore surfaces stories (short vs deep)
      localStorage.setItem('testament_daily_cadence', profile.dailyCadence);
    } catch {
      // ignore storage failures
    }

    const onboardingXpAwarded = localStorage.getItem('testament_onboarding_xp_awarded');
    if (!onboardingXpAwarded) {
      const newXp = xp + 50;
      setXp(newXp);
      persistNumber('testament_xp', newXp);
      localStorage.setItem('testament_onboarding_xp_awarded', 'true');
    }

    if (profile.learningStyle === 'tactical') {
      // Tactical learners jump into a dilemma after calibration
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setCurrentTab('dilemmas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (startRecommendedQuest && profile.recommendedQuestId) {
      handleSelectQuestById(profile.recommendedQuestId);
    }
  };

  const handlePracticeVerseFromArsenal = (verseId: string) => {
    soundEngine.stopSpeaking();
    setTargetWordForgeVerseId(verseId);
    setCurrentTab('wordforge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAmbience = (type: 'campfire' | 'wind' | 'sanctuary') => {
    soundEngine.toggleAmbience(type);
    setCurrentAmbience(soundEngine.getCurrentAmbience());
  };

  const handleCycleAmbience = () => {
    soundEngine.playSnap();
    if (currentAmbience === 'none') {
      soundEngine.startAmbience('campfire');
      setCurrentAmbience('campfire');
    } else if (currentAmbience === 'campfire') {
      soundEngine.startAmbience('wind');
      setCurrentAmbience('wind');
    } else if (currentAmbience === 'wind') {
      soundEngine.startAmbience('sanctuary');
      setCurrentAmbience('sanctuary');
    } else {
      soundEngine.stopAmbience();
      setCurrentAmbience('none');
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-iron-950 text-stone-900 dark:text-parchment-100 transition-colors duration-200 w-full relative">
      <main className={`w-full pt-3 sm:pt-4 xl:pt-16 ${
        activeQuest || activeDailyMission
          ? 'pb-4 xl:pb-8'
          : 'pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] xl:pb-10'
      }`}>
        {activeDailyMission ? (
          <StoryViewer 
            key={activeDailyMission.id}
            dailyMission={activeDailyMission}
            onBack={handleBackFromDailyMission}
            onCompleteAct={handleCompleteAct}
            completedActs={completedActs}
            onRewardXP={handleRewardXP}
            currentXp={xp}
            onOpenWordForge={handlePracticeVerseFromArsenal}
            onOpenNexus={handleOpenNexus}
            onOpenBibleChapter={(target) => {
              soundEngine.stopSpeaking();
              setLibraryPassage(target);
              setActiveDailyMission(null);
              setCurrentTab('library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeQuest ? (
          <StoryViewer 
            key={activeQuest.id}
            quest={activeQuest}
            onBack={handleBackFromQuest}
            onCompleteAct={handleCompleteAct}
            completedActs={completedActs}
            onRewardXP={handleRewardXP}
            currentXp={xp}
            onOpenWordForge={handlePracticeVerseFromArsenal}
            onOpenNexus={handleOpenNexus}
            onOpenBibleChapter={(target) => {
              soundEngine.stopSpeaking();
              setLibraryPassage(target);
              setActiveQuest(null);
              setCurrentTab('library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard 
                onSelectQuest={handleSelectQuest}
                onStartDailyMission={handleStartDailyMission}
                onOpenWordForge={(verseId?: string) => {
                  soundEngine.stopSpeaking();
                  if (verseId) setTargetWordForgeVerseId(verseId);
                  setCurrentTab('wordforge');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenArsenal={() => {
                  soundEngine.stopSpeaking();
                  setCurrentTab('arsenal');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDilemmas={() => {
                  soundEngine.stopSpeaking();
                  setCurrentTab('dilemmas');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenProverbs={() => setIsProverbsOpen(true)}
                onOpenPsalms={() => setIsPsalmsOpen(true)}
                onOpenLibrary={() => {
                  soundEngine.stopSpeaking();
                  setCurrentTab('library');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onContinueReading={() => {
                  const place = loadReadingPlace();
                  soundEngine.stopSpeaking();
                  if (place) {
                    setLibraryPassage({
                      book: place.bookName,
                      chapter: place.chapter,
                      verseStart: 0,
                      verseEnd: 0,
                    });
                  }
                  setCurrentTab('library');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                completedActs={completedActs}
                memorizedVerses={memorizedVerses}
                unlockedRelics={unlockedRelics}
                streakCount={streakCount}
                xp={xp}
                currentAmbience={currentAmbience}
                onToggleAmbience={handleToggleAmbience}
                userProfile={userProfile}
                onOpenOnboarding={() => openModalWithHistory('onboarding', () => setIsOnboardingOpen(true))}
                onOpenWhatsNew={() => openModalWithHistory('whatsnew', () => setIsWhatsNewOpen(true))}
                onOpenHowItWorks={() => openModalWithHistory('howitworks', () => setIsHowItWorksOpen(true))}
                onOpenSettings={() => openModalWithHistory('settings', () => setIsSettingsOpen(true))}
                onRewardXP={handleRewardXP}
                onLaunchCampaignStep={handleLaunchCampaignStep}
              />
            )}

            {currentTab === 'library' && (
              <Suspense fallback={<ViewFallback />}>
              <CanonLibraryPage 
                onBackToDashboard={() => {
                  soundEngine.playClick();
                  setCurrentTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenWordForge={(verseId) => {
                  soundEngine.stopSpeaking();
                  setTargetWordForgeVerseId(verseId);
                  setCurrentTab('wordforge');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSetMemoryVerse={(verseId) => {
                  setActiveMemoryVerse(verseId);
                }}
                onSelectStoryQuest={(questId) => {
                  handleSelectQuestById(questId);
                }}
                onSaveBookmark={handleSaveBookmark}
                onOpenDilemma={(dilemmaId) => {
                  soundEngine.stopSpeaking();
                  setTargetDilemmaId(dilemmaId);
                  setCurrentTab('dilemmas');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                passageTarget={libraryPassage}
                onPassageOpened={() => setLibraryPassage(null)}
              />
              </Suspense>
            )}

            {currentTab === 'game' && (
              <Suspense fallback={<ViewFallback />}>
                <TriviaGauntlet onRewardXP={handleRewardXP} onStudyVerse={handlePracticeVerseFromArsenal} />
              </Suspense>
            )}

            {(currentTab === 'practice' || currentTab === 'wordforge' || currentTab === 'dilemmas') && (
              <Suspense fallback={<ViewFallback />}>
                <PracticeView
                  initialSubTab={currentTab === 'dilemmas' ? 'dilemmas' : 'memorize'}
                  memorizedVerses={memorizedVerses}
                  onVerseMastered={handleVerseMastered}
                  targetVerseId={targetWordForgeVerseId}
                  onClearTargetVerse={() => setTargetWordForgeVerseId(null)}
                  onRewardXP={handleRewardXP}
                  targetDilemmaId={targetDilemmaId}
                  onClearTargetDilemma={() => setTargetDilemmaId(null)}
                  onOpenNexus={handleOpenNexus}
                />
              </Suspense>
            )}

            {currentTab === 'arsenal' && (
              <ArsenalView 
                memorizedVerses={memorizedVerses}
                bookmarkedVerses={bookmarkedVerses}
                onToggleBookmark={handleToggleBookmark}
                onPracticeVerse={handlePracticeVerseFromArsenal}
              />
            )}

            {currentTab === 'not-found' && (
              <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl font-serif font-black text-amber-500">
                  404
                </div>
                <h1 className="text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  Page Not Found
                </h1>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  The path you navigated to doesn't exist in the canon or dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCurrentTab('dashboard');
                  }}
                  className="btn-primary text-xs shadow-md transition-all cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Persistent Responsive Nav (Desktop Top Nav & Mobile Bottom Nav) */}
      {!activeQuest && !activeDailyMission && (
        <Navigation 
          currentTab={currentTab}
          onSelectTab={(tab) => {
            soundEngine.stopSpeaking();
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentAmbience={currentAmbience}
          onToggleAmbience={handleCycleAmbience}
          onOpenDriveMode={() => openModalWithHistory('drivemode', () => setIsDriveModeOpen(true))}
          streakCount={streakCount}
          xp={xp}
          onOpenSettings={() => openModalWithHistory('settings', () => setIsSettingsOpen(true))}
          onOpenWhatsNew={() => openModalWithHistory('whatsnew', () => setIsWhatsNewOpen(true))}
        />
      )}

      {/* MODALS */}
      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => {
          setIsDossierOpen(false);
          setTargetDossierId(null);
          if (window.history.state?.modal === 'dossier') {
            try { window.history.back(); } catch { /* ignore */ }
          }
        }}
        onSelectCharacterQuest={handleSelectQuestById}
        initialCharacterId={targetDossierId}
      />

      <ProverbsCodexModal
        isOpen={isProverbsOpen}
        onClose={() => {
          setIsProverbsOpen(false);
          setTargetProverbId(null);
          if (window.history.state?.modal === 'proverbs') {
            try { window.history.back(); } catch { /* ignore */ }
          }
        }}
        onOpenWordForge={(verseId) => {
          setIsProverbsOpen(false);
          setTargetProverbId(null);
          setTargetWordForgeVerseId(verseId);
          setCurrentTab('wordforge');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSetMemoryVerse={(verseId) => {
          setActiveMemoryVerse(verseId);
        }}
        onRewardXP={handleRewardXP}
        initialScenarioId={targetProverbId}
      />

      <PsalmsFieldMedicModal
        isOpen={isPsalmsOpen}
        onClose={() => {
          setIsPsalmsOpen(false);
          setTargetPsalmId(null);
          if (window.history.state?.modal === 'psalms') {
            try { window.history.back(); } catch { /* ignore */ }
          }
        }}
        onOpenWordForge={(verseId) => {
          setIsPsalmsOpen(false);
          setTargetPsalmId(null);
          setTargetWordForgeVerseId(verseId);
          setCurrentTab('wordforge');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSetMemoryVerse={(verseId) => {
          setActiveMemoryVerse(verseId);
        }}
        currentAmbience={currentAmbience}
        onToggleAmbience={handleToggleAmbience}
        onRewardXP={handleRewardXP}
        initialPsalmId={targetPsalmId}
      />

      {isDriveModeOpen && (
        <Suspense fallback={null}>
          <DriveModePlayer
            isOpen={isDriveModeOpen}
            onClose={() => {
              setIsDriveModeOpen(false);
              if (window.history.state?.modal === 'drivemode') {
                try { window.history.back(); } catch { /* ignore */ }
              }
            }}
            currentAmbience={currentAmbience}
            onToggleAmbience={handleToggleAmbience}
          />
        </Suspense>
      )}

      {/* Onboarding Battle Plan Calibration Modal */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => {
          setIsWhatsNewOpen(false);
          if (window.history.state?.modal === 'whatsnew') {
            try { window.history.back(); } catch { /* ignore */ }
          }
        }}
      />

      {/* M-8: How Testament Works Transparency Modal */}
      <HowTestamentWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => {
          setIsHowItWorksOpen(false);
          if (window.history.state?.modal === 'howitworks') {
            try { window.history.back(); } catch { /* ignore */ }
          }
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onClose={() => {
          try {
            sessionStorage.setItem('testament_onboarding_snoozed', '1');
          } catch {
            // ignore
          }
          setIsOnboardingOpen(false);
          if (window.history.state?.modal === 'onboarding') {
            try { window.history.back(); } catch { /* ignore */ }
          }
          window.dispatchEvent(new Event('testament-onboarding-settled'));
        }}
        initialProfile={userProfile}
      />

      {/* Global Lifted Settings Modal */}
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => {
              setIsSettingsOpen(false);
              if (window.history.state?.modal === 'settings') {
                try { window.history.back(); } catch { /* ignore */ }
              }
            }}
            onOpenOnboarding={() => {
              setIsSettingsOpen(false);
              openModalWithHistory('onboarding', () => setIsOnboardingOpen(true));
            }}
            onOpenReminders={() => {
              setIsSettingsOpen(false);
              window.dispatchEvent(new CustomEvent('testament-open-reminders'));
            }}
            onOpenJournal={() => {
              setIsSettingsOpen(false);
              window.dispatchEvent(new CustomEvent('testament-open-journal'));
            }}
            onOpenPeople={() => {
              setIsSettingsOpen(false);
              window.dispatchEvent(new CustomEvent('testament-open-people'));
            }}
            onOpenRelics={() => {
              setIsSettingsOpen(false);
              window.dispatchEvent(new CustomEvent('testament-open-relics'));
            }}
            onOpenHowItWorks={() => {
              setIsSettingsOpen(false);
              openModalWithHistory('howitworks', () => setIsHowItWorksOpen(true));
            }}
            onOpenLearnerMode={() => {
              setIsSettingsOpen(false);
              window.dispatchEvent(new CustomEvent('testament-open-modes'));
            }}
            activeLearnerMode="builder"
          />
        </Suspense>
      )}

      {/* PWA Home-Screen Install Prompt (Mutually exclusive with CampaignNextTaskPrompt and readers/modals) */}
      {!campaignPrompt && !activeQuest && !activeDailyMission && !isDossierOpen && !isProverbsOpen && !isPsalmsOpen && !isDriveModeOpen && !isOnboardingOpen && (
        <PWAInstallPrompt />
      )}

      {/* PWA Update & Restart Floating Notification Banner */}
      <UpdateNotificationBanner />

      {/* Campaign Next Task Prompt Modal / Banner (Requirement 5) */}
      <CampaignNextTaskPrompt
        completedStepNumber={campaignPrompt?.completedStep || 1}
        nextStep={campaignPrompt?.nextStep || null}
        onProceed={handleProceedCampaignPrompt}
        onDismiss={() => setCampaignPrompt(null)}
      />
    </div>
  );
}

export default App;
