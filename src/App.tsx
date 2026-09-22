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
import { TimelineModal } from './components/TimelineModal';
import { DossierModal } from './components/DossierModal';
import { StreetTranslatorModal } from './components/StreetTranslatorModal';
import { DriveModePlayer } from './components/DriveModePlayer';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { soundEngine } from './utils/audio';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeQuest, setActiveQuest] = useState<StoryQuest | null>(null);
  const [currentAmbience, setCurrentAmbience] = useState<'none' | 'campfire' | 'wind' | 'sanctuary'>('none');

  // Modals state
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isStreetTranslatorOpen, setIsStreetTranslatorOpen] = useState(false);
  const [isDriveModeOpen, setIsDriveModeOpen] = useState(false);

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

  const [streakCount, setStreakCount] = useState<number>(() => {
    return Number(localStorage.getItem('testament_streak')) || 1;
  });

  // Calculate streak logic on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('testament_last_active');

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = streakCount + 1;
        setStreakCount(newStreak);
        localStorage.setItem('testament_streak', String(newStreak));
      } else if (diffDays > 1) {
        setStreakCount(1);
        localStorage.setItem('testament_streak', '1');
      }
    }
    localStorage.setItem('testament_last_active', today);
  }, []);

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

  const handlePracticeVerseFromArsenal = () => {
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
                onOpenWordForge={() => setCurrentTab('wordforge')}
                onOpenArsenal={() => setCurrentTab('arsenal')}
                onOpenTimeline={() => setIsTimelineOpen(true)}
                onOpenDossiers={() => setIsDossierOpen(true)}
                onOpenStreetTranslator={() => setIsStreetTranslatorOpen(true)}
                onOpenDilemmas={() => setCurrentTab('dilemmas')}
                onOpenDriveMode={() => setIsDriveModeOpen(true)}
                completedActs={completedActs}
                memorizedVerses={memorizedVerses}
                unlockedRelics={unlockedRelics}
                streakCount={streakCount}
                xp={xp}
                currentAmbience={currentAmbience}
                onToggleAmbience={handleToggleAmbience}
              />
            )}

            {currentTab === 'wordforge' && (
              <WordForge 
                memorizedVerses={memorizedVerses}
                onVerseMastered={handleVerseMastered}
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

      {/* PWA Home-Screen Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
