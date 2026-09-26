import { useState, useEffect } from 'react';
import type { StoryQuest } from './types';
import { STORY_QUESTS } from './data/stories';
import { Dashboard } from './components/Dashboard';
import { StoryViewer } from './components/StoryViewer';
import { WordForge } from './components/WordForge';
import { ArsenalView } from './components/ArsenalView';
import { DilemmaSimulator } from './components/DilemmaSimulator';
import { Navigation } from './components/Navigation';
import type { NavTab } from './components/Navigation';
import { DossierModal } from './components/DossierModal';
import { ProverbsCodexModal } from './components/ProverbsCodexModal';
import { PsalmsFieldMedicModal } from './components/PsalmsFieldMedicModal';
import { DriveModePlayer } from './components/DriveModePlayer';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OnboardingModal, type UserCalibrationProfile } from './components/OnboardingModal';
import { WhatsNewModal } from './components/WhatsNewModal';
import { CanonLibraryPage } from './components/CanonLibraryPage';
import { UpdateNotificationBanner } from './components/UpdateNotificationBanner';
import { CampaignNextTaskPrompt } from './components/CampaignNextTaskPrompt';
import { soundEngine } from './utils/audio';
import { recordVerseMasteryDate, setTodayBattlefieldId } from './utils/dailyEngine';
import { initNotificationScheduler, setActiveMemoryVerse } from './utils/notificationEngine';
import { markCampaignStepCompleted } from './data/dailyCampaigns';
import type { DailyCampaignStep } from './data/dailyCampaigns';
import { getComposedDailyMission } from './utils/missionComposer';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'wordforge') return 'wordforge';
      if (params.get('action') === 'library' || params.get('tab') === 'library') return 'library';
    }
    return 'dashboard';
  });
  const [activeQuest, setActiveQuest] = useState<StoryQuest | null>(null);
  const [libraryPassage, setLibraryPassage] = useState<{
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd: number;
  } | null>(null);
  const [currentAmbience, setCurrentAmbience] = useState<'none' | 'campfire' | 'wind' | 'sanctuary'>('none');

  // Modals state (owned at App so Library deep-links work when Dashboard is unmounted)
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isProverbsOpen, setIsProverbsOpen] = useState(false);
  const [isPsalmsOpen, setIsPsalmsOpen] = useState(false);
  const [isDriveModeOpen, setIsDriveModeOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('testament_onboarding_completed');
    } catch {
      return false;
    }
  });

  const [userProfile, setUserProfile] = useState<UserCalibrationProfile | null>(() => {
    try {
      const stored = localStorage.getItem('testament_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persistence for user progress
  const [completedActs, setCompletedActs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('testament_completed_acts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [memorizedVerses, setMemorizedVerses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('testament_memorized_verses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [unlockedRelics, setUnlockedRelics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('testament_unlocked_relics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('testament_bookmarked_verses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('testament_xp')) || 0;
  });

  const [targetWordForgeVerseId, setTargetWordForgeVerseId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'wordforge' && params.get('verseId')) {
        return params.get('verseId');
      }
    }
    return null;
  });

  const [targetDilemmaId, setTargetDilemmaId] = useState<string | null>(null);
  const [campaignPrompt, setCampaignPrompt] = useState<{ completedStep: number; nextStep: DailyCampaignStep } | null>(null);

  const [streakCount] = useState<number>(() => {
    const storedStreak = Number(localStorage.getItem('testament_streak')) || 1;
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('testament_last_active');

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = storedStreak + 1;
        localStorage.setItem('testament_streak', String(newStreak));
        localStorage.setItem('testament_last_active', today);
        return newStreak;
      } else if (diffDays > 1) {
        localStorage.setItem('testament_streak', '1');
        localStorage.setItem('testament_last_active', today);
        return 1;
      }
    }
    localStorage.setItem('testament_last_active', today);
    return storedStreak;
  });

  // Initialize client-side notification scheduler
  useEffect(() => {
    const cleanup = initNotificationScheduler();
    return () => cleanup();
  }, []);

  // Handle URL deep links cleanup and listen for Service Worker messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'wordforge') {
      window.history.replaceState({}, '', window.location.pathname);
    }

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TESTAMENT_NAVIGATE_VERSE' && event.data.verseId) {
        setTargetWordForgeVerseId(event.data.verseId);
        setCurrentTab('wordforge');
        setActiveQuest(null);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  useEffect(() => {
    const handleOpenLibrary = () => {
      soundEngine.stopSpeaking();
      setActiveQuest(null);
      setCurrentTab('library');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Mark the library step only when today's mission actually closes in the library
      const todayCampaign = getComposedDailyMission();
      const canonStep = todayCampaign.steps.find(step => step.type === 'canon');
      if (canonStep) {
        markCampaignStepCompleted(todayCampaign.id, canonStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
      }
    };

    const handleOpenProverbs = () => setIsProverbsOpen(true);
    const handleOpenPsalms = () => setIsPsalmsOpen(true);

    window.addEventListener('open-canon-library', handleOpenLibrary);
    window.addEventListener('open-canon-codex', handleOpenLibrary);
    window.addEventListener('open-proverbs-codex', handleOpenProverbs);
    window.addEventListener('open-psalms-medic', handleOpenPsalms);
    return () => {
      window.removeEventListener('open-canon-library', handleOpenLibrary);
      window.removeEventListener('open-canon-codex', handleOpenLibrary);
      window.removeEventListener('open-proverbs-codex', handleOpenProverbs);
      window.removeEventListener('open-psalms-medic', handleOpenPsalms);
    };
  }, []);

  // Listen for dilemma completions from DilemmaSimulator to advance Daily Campaign
  useEffect(() => {
    const handleDilemmaCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ dilemmaId: string }>;
      const todayCampaign = getComposedDailyMission();
      const dilemmaStep = todayCampaign.steps.find(step => step.type === 'dilemma');
      if (dilemmaStep && dilemmaStep.targetId === customEvent.detail?.dilemmaId) {
        markCampaignStepCompleted(todayCampaign.id, dilemmaStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
        const nextStep = todayCampaign.steps.find(step => step.stepNumber === dilemmaStep.stepNumber + 1);
        if (nextStep) setCampaignPrompt({ completedStep: dilemmaStep.stepNumber, nextStep });
      }
    };

    window.addEventListener('testament-dilemma-completed', handleDilemmaCompleted);
    return () => window.removeEventListener('testament-dilemma-completed', handleDilemmaCompleted);
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
      const todayCampaign = getComposedDailyMission();
      markCampaignStepCompleted(todayCampaign.id, step.stepNumber, undefined, todayCampaign.steps.length);
      window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
    } else if (step.type === 'proverb') {
      setIsProverbsOpen(true);
      const todayCampaign = getComposedDailyMission();
      markCampaignStepCompleted(todayCampaign.id, step.stepNumber, undefined, todayCampaign.steps.length);
      window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
    } else if (step.type === 'psalm') {
      setIsPsalmsOpen(true);
      const todayCampaign = getComposedDailyMission();
      markCampaignStepCompleted(todayCampaign.id, step.stepNumber, undefined, todayCampaign.steps.length);
      window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
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
      setIsPsalmsOpen(true);
      return;
    }
    if (type === 'proverb') {
      setIsProverbsOpen(true);
      return;
    }
    if (type === 'dossier') {
      setIsDossierOpen(true);
    }
  };

  const handleProceedCampaignPrompt = (nextStep: DailyCampaignStep) => {
    setCampaignPrompt(null);
    handleLaunchCampaignStep(nextStep);
  };

  const handleSelectQuest = (quest: StoryQuest) => {
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
    setActiveQuest(null);
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
      localStorage.setItem('testament_xp', String(newXp));

      const todayCampaign = getComposedDailyMission();
      const questStep = todayCampaign.steps.find(step => step.type === 'quest');
      if (questStep && (questStep.targetId === _questId || questStep.targetSecondaryId === actId)) {
        markCampaignStepCompleted(todayCampaign.id, questStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
        const nextStep = todayCampaign.steps.find(step => step.stepNumber === questStep.stepNumber + 1);
        if (nextStep) setCampaignPrompt({ completedStep: questStep.stepNumber, nextStep });
      }
    }
  };

  const handleVerseMastered = (verseId: string) => {
    recordVerseMasteryDate(verseId);
    if (!memorizedVerses.includes(verseId)) {
      const updated = [...memorizedVerses, verseId];
      setMemorizedVerses(updated);
      localStorage.setItem('testament_memorized_verses', JSON.stringify(updated));

      const newXp = xp + 40;
      setXp(newXp);
      localStorage.setItem('testament_xp', String(newXp));

      const todayCampaign = getComposedDailyMission();
      const forgeStep = todayCampaign.steps.find(step => step.type === 'wordforge');
      if (forgeStep && (forgeStep.targetId === verseId || verseId.includes(forgeStep.targetId.replace('story-', '')))) {
        markCampaignStepCompleted(todayCampaign.id, forgeStep.stepNumber, undefined, todayCampaign.steps.length);
        window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
        const nextStep = todayCampaign.steps.find(step => step.stepNumber === forgeStep.stepNumber + 1);
        if (nextStep) setCampaignPrompt({ completedStep: forgeStep.stepNumber, nextStep });
      }
    }
  };

  const handleRewardXP = (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem('testament_xp', String(newXp));
  };

  const handleToggleBookmark = (verseId: string) => {
    const updated = bookmarkedVerses.includes(verseId)
      ? bookmarkedVerses.filter(id => id !== verseId)
      : [...bookmarkedVerses, verseId];
    setBookmarkedVerses(updated);
    localStorage.setItem('testament_bookmarked_verses', JSON.stringify(updated));
  };

  const handleCompleteOnboarding = (
    profile: UserCalibrationProfile, 
    startRecommendedQuest?: boolean
  ) => {
    setUserProfile(profile);
    setIsOnboardingOpen(false);

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
      localStorage.setItem('testament_xp', String(newXp));
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
    <div className="min-h-screen bg-[#fcfbfa] dark:bg-iron-950 text-stone-900 dark:text-parchment-100 transition-colors duration-200 w-full relative">
      <main className="w-full pt-3 sm:pt-4 md:pt-16 pb-28 sm:pb-32 md:pb-12">
        {activeQuest ? (
          <StoryViewer 
            quest={activeQuest}
            onBack={handleBackFromQuest}
            onCompleteAct={handleCompleteAct}
            completedActs={completedActs}
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
                completedActs={completedActs}
                memorizedVerses={memorizedVerses}
                unlockedRelics={unlockedRelics}
                streakCount={streakCount}
                xp={xp}
                currentAmbience={currentAmbience}
                onToggleAmbience={handleToggleAmbience}
                userProfile={userProfile}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
                onRewardXP={handleRewardXP}
                onLaunchCampaignStep={handleLaunchCampaignStep}
              />
            )}

            {currentTab === 'library' && (
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
                  handleVerseMastered(verseId);
                }}
                onSelectStoryQuest={(questId) => {
                  handleSelectQuestById(questId);
                }}
                passageTarget={libraryPassage}
                onPassageOpened={() => setLibraryPassage(null)}
              />
            )}

            {currentTab === 'wordforge' && (
              <WordForge 
                memorizedVerses={memorizedVerses}
                onVerseMastered={handleVerseMastered}
                targetVerseId={targetWordForgeVerseId}
                onClearTargetVerse={() => setTargetWordForgeVerseId(null)}
              />
            )}

            {currentTab === 'dilemmas' && (
              <DilemmaSimulator 
                onRewardXP={handleRewardXP}
                targetDilemmaId={targetDilemmaId}
                onClearTargetDilemma={() => setTargetDilemmaId(null)}
                onOpenNexus={handleOpenNexus}
              />
            )}

            {currentTab === 'arsenal' && (
              <ArsenalView 
                memorizedVerses={memorizedVerses}
                bookmarkedVerses={bookmarkedVerses}
                onToggleBookmark={handleToggleBookmark}
                onPracticeVerse={handlePracticeVerseFromArsenal}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Responsive Nav (Desktop Top Nav & Mobile Bottom Nav) */}
      {!activeQuest && (
        <Navigation 
          currentTab={currentTab}
          onSelectTab={(tab) => {
            soundEngine.stopSpeaking();
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentAmbience={currentAmbience}
          onToggleAmbience={handleCycleAmbience}
          onOpenDriveMode={() => setIsDriveModeOpen(true)}
          streakCount={streakCount}
          xp={xp}
        />
      )}

      {/* MODALS */}
      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onSelectCharacterQuest={handleSelectQuestById}
      />

      <ProverbsCodexModal
        isOpen={isProverbsOpen}
        onClose={() => setIsProverbsOpen(false)}
        onOpenWordForge={(verseId) => {
          setIsProverbsOpen(false);
          setTargetWordForgeVerseId(verseId);
          setCurrentTab('wordforge');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSetMemoryVerse={(verseId) => {
          setActiveMemoryVerse(verseId);
        }}
        onRewardXP={handleRewardXP}
      />

      <PsalmsFieldMedicModal
        isOpen={isPsalmsOpen}
        onClose={() => setIsPsalmsOpen(false)}
        onOpenWordForge={(verseId) => {
          setIsPsalmsOpen(false);
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
      />

      <DriveModePlayer
        isOpen={isDriveModeOpen}
        onClose={() => setIsDriveModeOpen(false)}
        currentAmbience={currentAmbience}
        onToggleAmbience={handleToggleAmbience}
      />

      {/* Onboarding Battle Plan Calibration Modal */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onClose={() => setIsOnboardingOpen(false)}
        initialProfile={userProfile}
      />

      {/* PWA Home-Screen Install Prompt */}
      <PWAInstallPrompt />

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
