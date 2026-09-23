import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryQuest, StoryAct } from '../types';
import { SceneIllustration } from './SceneIllustration';
import { soundEngine, type NarratorProfile } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Compass, 
  BookOpen,
  BookmarkCheck,
  Edit3,
  Award,
  Play,
  Pause,
  ListOrdered,
  Mic,
  Bell
} from 'lucide-react';
import { MemoryPulseModal } from './MemoryPulseModal';
import { getStoryVerseForAct } from '../utils/verseRegistry';

interface StoryViewerProps {
  quest: StoryQuest;
  onBack: () => void;
  onCompleteAct: (actId: string, questId: string, relicId?: string) => void;
  completedActs: string[];
  onOpenWordForge?: (verseId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  quest, 
  onBack, 
  onCompleteAct, 
  completedActs,
  onOpenWordForge
}) => {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [activeTermIndex, setActiveTermIndex] = useState<number | null>(null);
  const [isSpeakingScripture, setIsSpeakingScripture] = useState(false);
  const [isNarratingFullStory, setIsNarratingFullStory] = useState(false);
  const [narratorProfile, setNarratorProfile] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [journalNote, setJournalNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isMemoryPulseOpen, setIsMemoryPulseOpen] = useState(false);

  // Wisdom Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState<boolean>(false);

  const act: StoryAct = quest.acts[currentActIndex];
  const isActFinished = completedActs.includes(act.id);
  const selectedChoice = act.choices.find(c => c.id === selectedChoiceId);

  const handleSelectChoice = (choiceId: string) => {
    soundEngine.playSnap();
    setSelectedChoiceId(choiceId);
  };

  const handleToggleSpeakScripture = () => {
    if (isSpeakingScripture) {
      soundEngine.stopSpeaking();
      setIsSpeakingScripture(false);
    } else {
      soundEngine.stopSpeaking();
      setIsNarratingFullStory(false);
      setIsSpeakingScripture(true);
      soundEngine.speakVerse(
        `${act.unlockedScripture.reference}. ${act.unlockedScripture.text}. Deep reflection: ${act.unlockedScripture.deepDive}`,
        () => setIsSpeakingScripture(false)
      );
    }
  };

  const handleToggleNarrateFullStory = () => {
    if (isNarratingFullStory) {
      soundEngine.stopSpeaking();
      setIsNarratingFullStory(false);
    } else {
      soundEngine.stopSpeaking();
      setIsSpeakingScripture(false);
      setIsNarratingFullStory(true);
      const fullText = `${act.actTitle}. ${act.historicalContext}. ${act.narrativeParagraphs.join(' ')}. Scripture: ${act.unlockedScripture.text}. Takeaway: ${act.realTalkTakeaway.practicalLesson}`;
      const studioAssetUrl = `/audio/stories/${quest.id}_${act.id}.mp3`;
      soundEngine.speakVerse(fullText, () => setIsNarratingFullStory(false), studioAssetUrl);
    }
  };

  const handleSelectNarratorProfile = (newProfile: NarratorProfile) => {
    soundEngine.setNarratorProfile(newProfile);
    setNarratorProfile(newProfile);
    if (isNarratingFullStory) {
      soundEngine.stopSpeaking();
      setIsNarratingFullStory(true);
      const fullText = `${act.actTitle}. ${act.historicalContext}. ${act.narrativeParagraphs.join(' ')}. Scripture: ${act.unlockedScripture.text}. Takeaway: ${act.realTalkTakeaway.practicalLesson}`;
      const studioAssetUrl = `/audio/stories/${quest.id}_${act.id}.mp3`;
      soundEngine.speakVerse(fullText, () => setIsNarratingFullStory(false), studioAssetUrl);
    } else if (isSpeakingScripture) {
      soundEngine.stopSpeaking();
      setIsSpeakingScripture(true);
      soundEngine.speakVerse(
        `${act.unlockedScripture.reference}. ${act.unlockedScripture.text}. Deep reflection: ${act.unlockedScripture.deepDive}`,
        () => setIsSpeakingScripture(false)
      );
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    soundEngine.playSnap();
    setSelectedQuizOption(optionIndex);
    setHasSubmittedQuiz(true);
    if (act.wisdomQuiz?.options[optionIndex].isCorrect) {
      soundEngine.playVictory();
    }
  };

  const handleFinishAct = () => {
    soundEngine.playVictory();
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.7 },
      colors: ['#ea580c', '#f59e0b', '#fbbf24', '#d97706', '#10b981']
    });

    const isLastAct = currentActIndex === quest.acts.length - 1;
    const relicId = isLastAct ? quest.relicReward?.id : undefined;
    onCompleteAct(act.id, quest.id, relicId);
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const handleBack = () => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    setIsNarratingFullStory(false);
    onBack();
  };

  const handleNextAct = () => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    setIsNarratingFullStory(false);
    if (currentActIndex < quest.acts.length - 1) {
      soundEngine.playClick();
      setCurrentActIndex(prev => prev + 1);
      setSelectedChoiceId(null);
      setActiveTermIndex(null);
      setShowNoteInput(false);
      setIsNoteSaved(false);
      setSelectedQuizOption(null);
      setHasSubmittedQuiz(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevAct = () => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    setIsNarratingFullStory(false);
    if (currentActIndex > 0) {
      soundEngine.playClick();
      setCurrentActIndex(prev => prev - 1);
      setSelectedChoiceId(null);
      setActiveTermIndex(null);
      setShowNoteInput(false);
      setIsNoteSaved(false);
      setSelectedQuizOption(null);
      setHasSubmittedQuiz(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveNote = () => {
    if (!journalNote.trim()) return;
    let existing: Record<string, string> = {};
    try {
      const stored = localStorage.getItem('testament_notes');
      if (stored) existing = JSON.parse(stored);
    } catch {
      existing = {};
    }
    existing[act.id] = journalNote;
    try {
      localStorage.setItem('testament_notes', JSON.stringify(existing));
    } catch (err) {
      console.warn('Failed to save note to localStorage:', err);
    }
    setIsNoteSaved(true);
    soundEngine.playSnap();
    setTimeout(() => setShowNoteInput(false), 1200);
  };

  const scrollToSection = (elementId: string) => {
    soundEngine.playClick();
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-36 sm:pb-40 md:pb-48 text-left">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-800/80">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors text-xs md:text-sm font-semibold py-2 px-3.5 rounded-xl bg-stone-900/90 border border-stone-800 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quests</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Narrator Persona Picker */}
          <div className="flex items-center gap-1 p-1 bg-stone-900/90 rounded-xl border border-stone-800">
            <Mic className="w-3.5 h-3.5 text-amber-500 ml-1.5 hidden md:inline" />
            {[
              { id: 'cinematic', label: '🎬 Cinematic' },
              { id: 'brotherhood', label: '🤝 Grounded' },
              { id: 'scholar', label: '📜 Scholar' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectNarratorProfile(p.id as NarratorProfile)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  narratorProfile === p.id
                    ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleNarrateFullStory}
            aria-label={isNarratingFullStory ? 'Pause Story Audio' : 'Listen to Full Story Audio'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isNarratingFullStory
                ? 'bg-amber-600 border-amber-500 text-black font-bold shadow-glow-gold'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
            }`}
          >
            {isNarratingFullStory ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
            <span>{isNarratingFullStory ? 'Pause Story' : 'Listen to Full Story'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-mono hidden sm:inline">
              Act {act.actNumber} of {quest.acts.length}
            </span>
            <div className="flex gap-1.5">
              {quest.acts.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentActIndex 
                      ? 'w-6 bg-amber-500' 
                      : idx < currentActIndex || completedActs.includes(quest.acts[idx].id)
                        ? 'w-2 bg-amber-700/60'
                        : 'w-2 bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GUIDED DESKTOP SPREAD: STICKY STAGE (Col 4) + CHRONOLOGICAL READING STREAM (Col 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: STICKY VISUAL & CONTEXT STAGE (Pins in view as you read) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-5">
          
          {/* Act Badge & Era Card */}
          <div className="p-4 rounded-2xl bg-[#11141a] border border-stone-800 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-500">
              <span>{quest.testament} • {quest.historicalPeriod}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/50 text-amber-300">
                Act {act.actNumber}/{quest.acts.length}
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-parchment-100">
              {quest.title}
            </h2>
            <p className="text-xs text-stone-400">
              {quest.characterTitle}
            </p>
          </div>

          {/* Scene Illustration Visual Artwork */}
          <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-lg bg-stone-950">
            <SceneIllustration theme={act.visualTheme} />
            <div className="p-3 text-xs text-stone-400 italic bg-[#0f1217] flex items-center gap-2 border-t border-stone-850">
              <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{act.sceneAtmosphere}</span>
            </div>
          </div>

          {/* Historical Reality Intel Card */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>The Historical Reality</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {act.historicalContext}
            </p>
          </div>

          {/* Guided Reading Roadmap (Milestone Tracker) */}
          <div className="p-4 rounded-2xl bg-[#12151b] border border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-stone-400 mb-3">
              <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
              <span>Reading Roadmap</span>
            </div>
            <nav className="space-y-1 text-xs">
              <button
                onClick={() => scrollToSection('section-narrative')}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-stone-300 hover:text-amber-400 hover:bg-stone-850/60 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-stone-800 text-[11px] font-mono flex items-center justify-center font-bold text-amber-400 shrink-0">1</span>
                <span>The Story Narrative</span>
              </button>

              <button
                onClick={() => scrollToSection('section-crossroads')}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-stone-300 hover:text-amber-400 hover:bg-stone-850/60 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-stone-800 text-[11px] font-mono flex items-center justify-center font-bold text-amber-400 shrink-0">2</span>
                <span>The Decision Point (What would you do?)</span>
              </button>

              <button
                onClick={() => scrollToSection('section-scripture')}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-stone-300 hover:text-amber-400 hover:bg-stone-850/60 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-stone-800 text-[11px] font-mono flex items-center justify-center font-bold text-amber-400 shrink-0">3</span>
                <span>Scripture Unlocked</span>
              </button>

              <button
                onClick={() => scrollToSection('section-realtalk')}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-stone-300 hover:text-amber-400 hover:bg-stone-850/60 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-stone-800 text-[11px] font-mono flex items-center justify-center font-bold text-amber-400 shrink-0">4</span>
                <span>Real Talk For Today</span>
              </button>

              <button
                onClick={() => scrollToSection('section-quiz')}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-stone-300 hover:text-amber-400 hover:bg-stone-850/60 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-stone-800 text-[11px] font-mono flex items-center justify-center font-bold text-amber-400 shrink-0">5</span>
                <span>Wisdom Check Drill</span>
              </button>
            </nav>
          </div>

        </div>

        {/* RIGHT COLUMN: CHRONOLOGICAL GUIDED READING STREAM */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Main Story Header */}
          <div className="border-b border-stone-800/80 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-500 mb-1.5">
              <span>Act {act.actNumber} of {quest.acts.length}</span>
              <span>•</span>
              <span>{quest.historicalPeriod}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-parchment-50 mb-2">
              {act.actTitle}
            </h1>
            <p className="text-sm md:text-base text-stone-400">
              {quest.title} — {quest.characterTitle}
            </p>
          </div>

          {/* STEP 1: THE GRAPHIC NOVEL NARRATIVE */}
          <section id="section-narrative" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Step 1 of 5</span>
              <span>The Narrative</span>
            </div>

            {/* Paragraph Cards */}
            <div className="space-y-4">
              {act.narrativeParagraphs.map((paragraph, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="p-5 md:p-6 rounded-2xl bg-[#13161c] border border-stone-800/90 shadow-md hover:border-stone-700 transition-colors"
                >
                  <p className="font-reading text-base md:text-lg text-parchment-100 leading-relaxed">
                    {paragraph}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tap-to-Explain Ancient Customs & Terms */}
            {act.glossary.length > 0 && (
              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300 mb-3">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Explain Like I'm 5: Tap Ancient Terms</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {act.glossary.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundEngine.playSnap();
                        setActiveTermIndex(activeTermIndex === idx ? null : idx);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        activeTermIndex === idx
                          ? 'bg-amber-500 text-black font-bold shadow-sm'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {item.term} ℹ️
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {activeTermIndex !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="p-3.5 rounded-xl bg-stone-950/90 border border-amber-900/30 text-xs text-stone-300 space-y-1.5"
                    >
                      <div>
                        <strong className="text-amber-400">Ancient Context: </strong>
                        {act.glossary[activeTermIndex].ancientMeaning}
                      </div>
                      <div className="text-parchment-200">
                        <strong className="text-amber-300">Everyday Translation: </strong>
                        {act.glossary[activeTermIndex].modernAnalogy}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* STEP 2: THE CROSSROADS DECISION (PLACED DIRECTLY AFTER THE STORY TENSION) */}
          <section id="section-crossroads" className="p-5 md:p-6 rounded-2xl bg-gradient-to-b from-[#1c1612] to-[#120f0d] border-2 border-amber-600/60 shadow-glow-gold scroll-mt-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Step 2 of 5</span>
                <span>The Crossroads Decision</span>
              </div>
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>

            <h3 className="text-base md:text-xl font-serif font-bold text-parchment-50 mb-4 leading-snug">
              {act.perspectivePrompt}
            </h3>

            {/* Choice Buttons */}
            <div className="space-y-2.5 mb-3">
              {act.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-amber-600/25 border-amber-500 text-parchment-50 ring-1 ring-amber-500 shadow-glow-ember' 
                        : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                      <span className="text-sm md:text-base font-medium leading-relaxed">{choice.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reaction & Biblical Reality Reveal */}
            <AnimatePresence>
              {selectedChoice && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-amber-900/50 space-y-3"
                >
                  <div className="text-xs md:text-sm text-stone-300">
                    <strong className="text-amber-400 font-bold">The Human Instinct: </strong> 
                    {selectedChoice.reaction}
                  </div>
                  <div className="text-xs md:text-sm text-parchment-100 bg-amber-950/40 p-4 rounded-xl border border-amber-800/50 leading-relaxed">
                    <strong className="text-amber-300 font-bold">The Historical Pivot: </strong> 
                    {selectedChoice.historicalPivot}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* STEP 3: UNLOCKED SCRIPTURE CARD */}
          <section id="section-scripture" className="p-5 md:p-6 rounded-2xl bg-[#151922] border-2 border-amber-500/50 shadow-glow-gold relative overflow-hidden scroll-mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  Step 3 of 5
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Scripture Unlocked • {act.unlockedScripture.translation}</span>
                </div>
              </div>

              <button
                onClick={handleToggleSpeakScripture}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 bg-stone-850 hover:bg-amber-600 hover:text-black transition-colors"
              >
                {isSpeakingScripture ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>

            <h4 className="text-base font-serif font-bold text-amber-300 mb-2">
              {act.unlockedScripture.reference}
            </h4>

            <blockquote className="font-reading text-lg md:text-xl text-parchment-50 italic my-3 pl-4 border-l-2 border-amber-500 leading-relaxed">
              "{act.unlockedScripture.text}"
            </blockquote>

            <p className="text-xs md:text-sm text-stone-300 mt-4 pt-3 border-t border-stone-800 leading-relaxed">
              <strong className="text-amber-400">Context: </strong>
              {act.unlockedScripture.deepDive}
            </p>

            {/* Memory Pulse Reminders Call to Action */}
            <div className="mt-4 pt-3 border-t border-amber-900/30 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Bell className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Want to lock this story verse into memory?</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMemoryPulseOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-amber transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Train This Verse (Reminders)</span>
                </button>
              </div>
            </div>
          </section>

          {/* STEP 4: REAL TALK FOR TODAY (TAKEAWAY FOR ADULTS) */}
          <section id="section-realtalk" className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#17191e] to-[#0e1014] border border-stone-700 shadow-lg scroll-mt-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Step 4 of 5</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Real Talk For Today</span>
            </div>
            
            <h4 className="text-lg md:text-xl font-serif font-bold text-parchment-100 mb-2">
              Dealing With: {act.realTalkTakeaway.coreChallenge}
            </h4>

            <p className="text-sm md:text-base text-stone-300 leading-relaxed mb-4">
              {act.realTalkTakeaway.practicalLesson}
            </p>

            <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-800/40 text-xs md:text-sm text-amber-200 font-medium leading-relaxed">
              <strong className="text-amber-300">Today's Tactical Action: </strong> 
              {act.realTalkTakeaway.dailyAction}
            </div>

            {/* Quick Journal / Personal Reflection Note */}
            <div className="mt-4 pt-3 border-t border-stone-800">
              {!showNoteInput ? (
                <button 
                  onClick={() => setShowNoteInput(true)}
                  className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Jot a personal takeaway or battle reflection</span>
                </button>
              ) : (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    placeholder="How does this story hit you personally? What's your own battle right now?"
                    className="w-full text-xs md:text-sm p-3 rounded-xl bg-stone-950 border border-stone-700 text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowNoteInput(false)}
                      className="text-xs text-stone-500 hover:text-stone-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      {isNoteSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : null}
                      <span>{isNoteSaved ? 'Saved to Arsenal' : 'Save Note'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* STEP 5: INTERACTIVE WISDOM CHECK DRILL */}
          {act.wisdomQuiz && (
            <section id="section-quiz" className="p-5 md:p-6 rounded-2xl bg-[#141822] border-2 border-stone-700 shadow-md scroll-mt-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Step 5 of 5</span>
                <Award className="w-4 h-4 text-amber-500" />
                <span>Wisdom Check Drill (+30 XP)</span>
              </div>

              <h4 className="text-base md:text-lg font-serif font-bold text-parchment-50 mb-3">
                {act.wisdomQuiz.question}
              </h4>

              <div className="space-y-2.5">
                {act.wisdomQuiz.options.map((option, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={hasSubmittedQuiz}
                      className={`w-full text-left p-3.5 rounded-xl text-xs md:text-sm font-medium transition-all border ${
                        hasSubmittedQuiz
                          ? option.isCorrect
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                            : isSelected
                              ? 'bg-red-950/70 border-red-500 text-red-200'
                              : 'bg-stone-900/60 border-stone-800 text-stone-500 opacity-60'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/60 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono font-bold text-stone-500">{String.fromCharCode(65 + idx)}.</span>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasSubmittedQuiz && selectedQuizOption !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs md:text-sm text-stone-300 leading-relaxed"
                >
                  <strong className={act.wisdomQuiz.options[selectedQuizOption].isCorrect ? "text-emerald-400" : "text-amber-400"}>
                    {act.wisdomQuiz.options[selectedQuizOption].isCorrect ? "Spot on! " : "Good try! "}
                  </strong>
                  {act.wisdomQuiz.options[selectedQuizOption].explanation}
                </motion.div>
              )}
            </section>
          )}

          {/* NEXT ACT TEASER */}
          {act.teaserForNext && currentActIndex < quest.acts.length - 1 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs md:text-sm text-amber-200/90 italic">
              <strong>Coming Up in Act {currentActIndex + 2}: </strong>
              "{act.teaserForNext}"
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-6 border-t border-stone-800">
            <button
              onClick={handlePrevAct}
              disabled={currentActIndex === 0}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentActIndex === 0 
                  ? 'opacity-30 cursor-not-allowed text-stone-600' 
                  : 'text-stone-300 hover:text-white bg-stone-900 border border-stone-800'
              }`}
            >
              Previous Act
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isActFinished ? (
                <button
                  onClick={handleFinishAct}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-glow-gold transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Act (+50 XP)</span>
                </button>
              ) : currentActIndex < quest.acts.length - 1 ? (
                <button
                  onClick={handleNextAct}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-black transition-all flex items-center justify-center gap-2 shadow-glow-gold cursor-pointer"
                >
                  <span>Advance to Act {currentActIndex + 2}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleBack}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Quest Finished • Return to Quests</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Memory Verse Pulse & Notification Modal */}
      <MemoryPulseModal
        isOpen={isMemoryPulseOpen}
        onClose={() => setIsMemoryPulseOpen(false)}
        targetVerse={getStoryVerseForAct(quest.id, act.id)}
        onOpenWordForge={(verseId) => {
          if (onOpenWordForge) {
            onBack();
            onOpenWordForge(verseId);
          }
        }}
      />
    </div>
  );
};
