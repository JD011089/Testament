import React, { useState, useEffect } from 'react';
import { STORY_QUESTS } from '../data/stories';
import { soundEngine } from '../utils/audio';
import type { NarratorProfile } from '../utils/audio';
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
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const playAct = (qIdx: number, aIdx: number) => {
    const targetQuest = STORY_QUESTS[qIdx];
    if (!targetQuest) return;
    const targetAct = targetQuest.acts[aIdx];
    if (!targetAct) return;

    soundEngine.stopSpeaking();
    setIsPlaying(true);
    setCurrentQuestIndex(qIdx);
    setCurrentActIndex(aIdx);

    const narrationText = `${targetQuest.title}. Act ${targetAct.actNumber}: ${targetAct.actTitle}. ${targetAct.historicalContext}. ${targetAct.narrativeParagraphs.join(' ')}. Scripture: ${targetAct.unlockedScripture.reference}: ${targetAct.unlockedScripture.text}. Life application: ${targetAct.realTalkTakeaway.practicalLesson}`;
    const studioAssetUrl = `/audio/stories/${targetQuest.id}_${targetAct.id}.mp3`;
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
      playAct(currentQuestIndex, currentActIndex);
    }
  };

  const handleNext = () => {
    soundEngine.playSnap();
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
    let prevQIdx = currentQuestIndex;
    let prevAIdx = currentActIndex - 1;
    if (prevAIdx < 0) {
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
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto p-4 sm:p-8 flex items-start sm:items-center justify-center"
      onClick={() => {
        soundEngine.stopSpeaking();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-mode-title"
    >
      <div 
        className="max-w-2xl w-full mx-auto my-auto flex flex-col justify-between max-h-[90vh] bg-[#11141b] border-2 border-amber-600/40 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            <Car className="w-4 h-4" />
            <span id="drive-mode-title">Hands-Free Drive & Commute Mode</span>
          </div>
          <button 
            onClick={() => {
              soundEngine.stopSpeaking();
              onClose();
            }}
            aria-label="Close Drive Mode"
            className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Artwork / Visual */}
        <div className="my-auto space-y-5 text-center">
          <div className="w-36 h-36 sm:w-48 sm:h-48 mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-glow-gold bg-stone-950">
            <img 
              src={getThemeImage(act.visualTheme)}
              alt={quest.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">
              {quest.heroName} • Act {act.actNumber} of {quest.acts.length}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-parchment-50">
              {act.actTitle}
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 font-medium">
              {quest.title}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-parchment-200/90 italic max-w-lg mx-auto font-reading">
            "{act.sceneAtmosphere}"
          </p>
        </div>

        {/* Big Touch Controls for Hands-Free Driving */}
        <div className="space-y-6 pt-4 border-t border-stone-800">
          {/* Main Transport Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              title="Previous Act"
              aria-label="Previous Act"
              className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
              className={`p-6 rounded-3xl transition-all shadow-glow-gold active:scale-95 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isPlaying 
                  ? 'bg-amber-500 text-black animate-pulse' 
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 text-black'
              }`}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>

            <button
              onClick={handleNext}
              title="Next Act"
              aria-label="Next Act"
              className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Dramatized Voice Style Selector */}
          <div className="flex items-center justify-between gap-2 p-3 bg-stone-950/70 rounded-2xl border border-stone-800">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <Mic className="w-4 h-4 text-amber-500" />
              <span>Voice Dramatization:</span>
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
                    soundEngine.setNarratorProfile(p.id as NarratorProfile);
                    setNarratorProfile(p.id as NarratorProfile);
                    if (isPlaying) {
                      playAct(currentQuestIndex, currentActIndex);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    narratorProfile === p.id
                      ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Ambience Quick Selector */}
          <div className="flex items-center justify-between gap-2 p-3 bg-stone-950/70 rounded-2xl border border-stone-800">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Background Soundscape:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleAmbience('campfire')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentAmbience === 'campfire'
                    ? 'bg-amber-600 text-black font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Campfire</span>
              </button>

              <button
                onClick={() => onToggleAmbience('wind')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentAmbience === 'wind'
                    ? 'bg-amber-600 text-black font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                <Wind className="w-3 h-3" />
                <span>Wind</span>
              </button>

              <button
                onClick={() => onToggleAmbience('sanctuary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentAmbience === 'sanctuary'
                    ? 'bg-amber-600 text-black font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Sanctuary</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
