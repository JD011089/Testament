import { useState } from 'react';
import type { StoryQuest } from './types';
import { STORY_QUESTS } from './data/stories';
import { Dashboard } from './components/Dashboard';
import { StoryViewer } from './components/StoryViewer';
import { WordForge } from './components/WordForge';
import { ArsenalView } from './components/ArsenalView';
import { DilemmaSimulator } from './components/DilemmaSimulator';
import { Navigation } from './components/Navigation';
import type { NavTab } from './components/Navigation';
import { TimelineModal } from './components/TimelineModal';
import { DossierModal } from './components/DossierModal';
import { StreetTranslatorModal } from './components/StreetTranslatorModal';
import { DriveModePlayer } from './components/DriveModePlayer';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OnboardingModal, type UserCalibrationProfile } from './components/OnboardingModal';
import { soundEngine } from './utils/audio';
import { recordVerseMasteryDate } from './utils/dailyEngine';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeQuest, setActiveQuest] = useState<StoryQuest | null>(null);
  const [currentAmbience, setCurrentAmbience] = useState<'none' | 'campfire' | 'wind' | 'sanctuary'>('none');

  // Modals state
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isStreetTranslatorOpen, setIsStreetTranslatorOpen] = useState(false);
  const [isDriveModeOpen, setIsDriveModeOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('testament_onboarding_completed');
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
    return JSON.parse(localStorage.getItem('testament_completed_acts') || '[]');
  });

  const [memorizedVerses, setMemorizedVerses] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('testament_memorized_verses') || '[]');
  });

  const [unlockedRelics, setUnlockedRelics] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('testament_unlocked_relics') || '[]');
  });

  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('testament_bookmarked_verses') || '[]');
  });

  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('testament_xp')) || 0;
  });

  const [targetWordForgeVerseId, setTargetWordForgeVerseId] = useState<string | null>(null);

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

  const handleCompleteOnboarding = (profile: UserCalibrationProfile, startRecommendedQuest?: boolean) => {
    setUserProfile(profile);
    setIsOnboardingOpen(false);

    const onboardingXpAwarded = localStorage.getItem('testament_onboarding_xp_awarded');
    if (!onboardingXpAwarded) {
      const newXp = xp + 50;
      setXp(newXp);
      localStorage.setItem('testament_xp', String(newXp));
      localStorage.setItem('testament_onboarding_xp_awarded', 'true');
    }

    if (startRecommendedQuest && profile.recommendedQuestId) {
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
    <div className="min-h-screen bg-iron-950 text-parchment-100 w-full relative">
      <main className="w-full">
        {activeQuest ? (
          <StoryViewer 
            quest={activeQuest}
            onBack={handleBackFromQuest}
            onCompleteAct={handleCompleteAct}
            completedActs={completedActs}
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
                onOpenTimeline={() => setIsTimelineOpen(true)}
                onOpenDossiers={() => setIsDossierOpen(true)}
                onOpenStreetTranslator={() => setIsStreetTranslatorOpen(true)}
                onOpenDilemmas={() => {
                  soundEngine.stopSpeaking();
                  setCurrentTab('dilemmas');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDriveMode={() => setIsDriveModeOpen(true)}
                completedActs={completedActs}
                memorizedVerses={memorizedVerses}
                unlockedRelics={unlockedRelics}
                streakCount={streakCount}
                xp={xp}
                currentAmbience={currentAmbience}
                onToggleAmbience={handleToggleAmbience}
                userProfile={userProfile}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                onRewardXP={handleRewardXP}
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

      {/* Persistent Bottom Nav */}
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
        />
      )}

      {/* MODALS */}
      <TimelineModal 
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        onSelectEraQuest={handleSelectQuestById}
      />

      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onSelectCharacterQuest={handleSelectQuestById}
      />

      <StreetTranslatorModal
        isOpen={isStreetTranslatorOpen}
        onClose={() => setIsStreetTranslatorOpen(false)}
      />

      <DriveModePlayer
        isOpen={isDriveModeOpen}
        onClose={() => setIsDriveModeOpen(false)}
        currentAmbience={currentAmbience}
        onToggleAmbience={handleToggleAmbience}
      />

      {/* Onboarding Battle Plan Calibration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onClose={() => setIsOnboardingOpen(false)}
        initialProfile={userProfile}
      />

      {/* PWA Home-Screen Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
