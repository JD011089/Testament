import React, { useState, useEffect } from 'react';
import { STORY_QUESTS } from '../data/stories';
import { getStoryVerseForQuest } from '../utils/verseRegistry';
import { soundEngine, NARRATOR_VOICES } from '../utils/audio';
import type { NarratorProfile } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { ArtImage } from './ArtImage';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Car, 
  Flame, 
  Wind, 
  Sparkles,
  Mic
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getDailyCuratedPassage } from '../data/dailyPassages';
import { getTodayBattlefieldId } from '../utils/battlefield';
import { getDailyMissionSync } from '../utils/dailyMissionPipeline';
import { getTodayDateKey } from '../utils/dailyEngine';

interface DriveModePlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary';
  onToggleAmbience: (type: 'campfire' | 'wind' | 'sanctuary') => void;
}

export const DriveModePlayer: React.FC<DriveModePlayerProps> = ({
  isOpen,
  onClose,
  currentAmbience,
  onToggleAmbience
}) => {
  const { t, language } = useLanguage();
  const modalRef = useModalLock(isOpen);

  // Track Mode: 'mission' (Today's Mission Briefing) vs 'quest' (Full Quest Audio)
  const [activeMode, setActiveMode] = useState<'mission' | 'quest'>('mission');
  const [currentQuestIndex, setCurrentQuestIndex] = useState<number>(0);
  const [currentActIndex, setCurrentActIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [narratorProfile, setNarratorProfile] = useState<NarratorProfile>(soundEngine.getNarratorProfile());

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.stopSpeaking();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  if (!isOpen) return null;

  // Resolve today's mission
  const activeBattlefieldId = getTodayBattlefieldId();
  const todayPassage = getDailyCuratedPassage(0, activeBattlefieldId);
  const todayMission = getDailyMissionSync(getTodayDateKey(), 0, activeBattlefieldId);

  const quest = STORY_QUESTS[currentQuestIndex];
  const act = quest.acts[currentActIndex];

  const getThemeImage = (theme: string) => {
    switch (theme) {
      case 'palace_hall': return '/images/palace_hall.jpg';
      case 'sea_storm': return '/images/sea_storm.jpg';
      case 'red_sea': return '/images/red_sea.jpg';
      case 'mount_carmel': return '/images/mount_carmel.jpg';
      case 'valley_battlefield': return '/images/valley_battlefield.jpg';
      case 'cave_refuge': return '/images/cave_refuge.jpg';
      case 'desert_canyon': return '/images/desert_canyon.jpg';
      case 'courtyard_fire': return '/images/courtyard_fire.jpg';
      case 'prison_cell': default: return '/images/prison_cell.jpg';
    }
  };

  const playMissionBriefing = () => {
    soundEngine.stopSpeaking();
    setIsPlaying(true);
    setActiveMode('mission');

    const hero = todayMission.heroName || todayPassage.heroName;
    const ref = todayMission.passageReference || todayPassage.reference;
    const scenario = todayMission.scenarioQuestion;
    const story = todayMission.storyRetelling.join(' ');
    const scripture = `${todayMission.keyVerseReference}. ${todayMission.keyVerseText}`;
    const action = todayMission.actionLine;

    const briefingText = language === 'en'
      ? `Today's Mission Briefing. ${hero}. Scripture reference: ${ref}. The Decision: ${scenario}. What unfolded: ${story}. Verbatim Scripture: ${scripture}. Your move today: ${action}`
      : `Misión de hoy. ${hero}. ${ref}. ${scenario}. ${scripture}`;

    soundEngine.speakVerse(briefingText, () => {
      setIsPlaying(false);
    });
  };

  const playAct = (qIdx: number, aIdx: number) => {
    const targetQuest = STORY_QUESTS[qIdx];
    if (!targetQuest) return;
    const targetAct = targetQuest.acts[aIdx];
    if (!targetAct) return;

    soundEngine.stopSpeaking();
    setIsPlaying(true);
    setActiveMode('quest');
    setCurrentQuestIndex(qIdx);
    setCurrentActIndex(aIdx);

    const storyVerse = getStoryVerseForQuest(targetQuest.id, language);
    const scriptureText = storyVerse ? `${storyVerse.reference}: ${storyVerse.text}` : `${targetAct.unlockedScripture.reference}: ${targetAct.unlockedScripture.text}`;
    const narrationText = language === 'en'
      ? `${targetQuest.title}. Act ${targetAct.actNumber}: ${targetAct.actTitle}. ${targetAct.historicalContext}. ${targetAct.narrativeParagraphs.join(' ')}. Scripture: ${targetAct.unlockedScripture.reference}: ${targetAct.unlockedScripture.text}. Life application: ${targetAct.realTalkTakeaway.practicalLesson}`
      : `${targetQuest.title}. ${targetAct.actTitle}. ${scriptureText}`;
    const studioAssetUrl = language === 'en' ? `/audio/stories/${targetQuest.id}_${targetAct.id}.mp3` : undefined;
    soundEngine.speakVerse(narrationText, () => {
      // Auto-advance to next act or next quest seamlessly
      if (aIdx < targetQuest.acts.length - 1) {
        playAct(qIdx, aIdx + 1);
      } else if (qIdx < STORY_QUESTS.length - 1) {
        playAct(qIdx + 1, 0);
      } else {
        setIsPlaying(false);
      }
    }, studioAssetUrl);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.stopSpeaking();
      setIsPlaying(false);
    } else {
      if (activeMode === 'mission') {
        playMissionBriefing();
      } else {
        playAct(currentQuestIndex, currentActIndex);
      }
    }
  };

  const handleNext = () => {
    soundEngine.playSnap();
    if (activeMode === 'mission') {
      setActiveMode('quest');
      playAct(0, 0);
      return;
    }
    let nextQIdx = currentQuestIndex;
    let nextAIdx = currentActIndex + 1;
    if (nextAIdx >= quest.acts.length) {
      nextQIdx = (currentQuestIndex + 1) % STORY_QUESTS.length;
      nextAIdx = 0;
    }
    setCurrentQuestIndex(nextQIdx);
    setCurrentActIndex(nextAIdx);
    if (isPlaying) {
      playAct(nextQIdx, nextAIdx);
    }
  };

  const handlePrev = () => {
    soundEngine.playSnap();
    if (activeMode === 'mission') {
      setActiveMode('quest');
      const lastQ = STORY_QUESTS.length - 1;
      const lastA = STORY_QUESTS[lastQ].acts.length - 1;
      setCurrentQuestIndex(lastQ);
      setCurrentActIndex(lastA);
      if (isPlaying) playAct(lastQ, lastA);
      return;
    }
    let prevQIdx = currentQuestIndex;
    let prevAIdx = currentActIndex - 1;
    if (prevAIdx < 0) {
      if (currentQuestIndex === 0) {
        setActiveMode('mission');
        if (isPlaying) playMissionBriefing();
        return;
      }
      prevQIdx = (currentQuestIndex - 1 + STORY_QUESTS.length) % STORY_QUESTS.length;
      prevAIdx = STORY_QUESTS[prevQIdx].acts.length - 1;
    }
    setCurrentQuestIndex(prevQIdx);
    setCurrentActIndex(prevAIdx);
    if (isPlaying) {
      playAct(prevQIdx, prevAIdx);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 dark:bg-black/95 backdrop-blur-xl overflow-y-auto overscroll-contain p-4 sm:p-8 flex items-start sm:items-center justify-center"
      onClick={() => {
        soundEngine.stopSpeaking();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-mode-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="max-w-2xl w-full mx-auto my-auto flex flex-col justify-between max-h-[90vh] bg-white dark:bg-ink-raised border-2 border-amber-400 dark:border-amber-600/40 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto space-y-6 outline-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
            <Car className="w-4 h-4" />
            <span id="drive-mode-title">{t('drive.title')}</span>
          </div>
          <button 
            type="button"
            onClick={() => {
              soundEngine.stopSpeaking();
              onClose();
            }}
            aria-label={t('drive.close')}
            className="p-2 rounded-xl bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Artwork / Visual */}
        <div className="my-auto space-y-5 text-center">
          <div className="w-36 h-36 sm:w-48 sm:h-48 mx-auto rounded-3xl overflow-hidden border-2 border-amber-400 dark:border-amber-500/40 shadow-md dark:shadow-glow bg-stone-100 dark:bg-stone-950">
            <ArtImage
              src={activeMode === 'mission' ? '/images/valley_battlefield.jpg' : getThemeImage(act.visualTheme)}
              alt={activeMode === 'mission' ? todayMission.heroName : quest.title}
              width={1376}
              height={768}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-800 dark:text-amber-500 uppercase tracking-widest font-bold">
              {activeMode === 'mission'
                ? `Today's Mission • ${todayMission.passageReference}`
                : `${quest.heroName} • Act ${act.actNumber} of ${quest.acts.length}`}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50">
              {activeMode === 'mission' ? todayMission.heroName : act.actTitle}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
              {activeMode === 'mission' ? `Briefing: "${todayMission.scenarioQuestion}"` : quest.title}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 dark:text-parchment-200/90 italic max-w-lg mx-auto font-reading">
            {activeMode === 'mission'
              ? `"${todayMission.keyVerseText}" — ${todayMission.keyVerseReference}`
              : `"${act.sceneAtmosphere}"`}
          </p>
        </div>

        {/* Big Touch Controls for Hands-Free Driving */}
        <div className="space-y-6 pt-4 border-t border-stone-200 dark:border-stone-800">
          {/* Main Transport Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              title={t('drive.prevAct')}
              aria-label={t('drive.prevAct')}
              className="p-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={handleTogglePlay}
              aria-label={isPlaying ? t('drive.pause') : t('drive.play')}
              className={`p-6 rounded-3xl transition-all shadow-md active:scale-95 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isPlaying 
                  ? 'bg-amber-500 text-stone-950 animate-pulse' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950'
              }`}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>

            <button
              onClick={handleNext}
              title={t('drive.nextAct')}
              aria-label={t('drive.nextAct')}
              className="p-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Dramatized Voice Style Selector */}
          <div className="flex items-center justify-between gap-2 p-3 bg-stone-50 dark:bg-stone-950/70 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400">
              <Mic className="w-4 h-4 text-amber-800 dark:text-amber-500" />
              <span>{t('drive.narrator')}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'cinematic', label: '🎬 Adam' },
                { id: 'brotherhood', label: '🤝 Antoni' },
                { id: 'scholar', label: '📜 George' },
                { id: 'grace', label: '🙏 Rachel' }
              ].map(p => (
                <button
                  key={p.id}
                  title={NARRATOR_VOICES[p.id as NarratorProfile]?.description}
                  onClick={() => {
                    soundEngine.setNarratorProfile(p.id as NarratorProfile);
                    setNarratorProfile(p.id as NarratorProfile);
                    if (isPlaying) {
                      playAct(currentQuestIndex, currentActIndex);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    narratorProfile === p.id
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Ambience Quick Selector */}
          <div className="flex items-center justify-between gap-2 p-3 bg-stone-50 dark:bg-stone-950/70 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400">
              <Volume2 className="w-4 h-4 text-amber-800 dark:text-amber-500" />
              <span>{t('drive.soundscape')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleAmbience('campfire')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentAmbience === 'campfire'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-800'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{t('drive.campfire')}</span>
              </button>

              <button
                onClick={() => onToggleAmbience('wind')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentAmbience === 'wind'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-800'
                }`}
              >
                <Wind className="w-3 h-3" />
                <span>{t('drive.wind')}</span>
              </button>

              <button
                onClick={() => onToggleAmbience('sanctuary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentAmbience === 'sanctuary'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-800'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{t('drive.sanctuary')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
