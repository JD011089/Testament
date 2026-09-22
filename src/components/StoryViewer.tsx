import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryQuest, StoryAct } from '../types';
import { SceneIllustration } from './SceneIllustration';
import { soundEngine } from '../utils/audio';
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
  Pause
} from 'lucide-react';

interface StoryViewerProps {
  quest: StoryQuest;
  onBack: () => void;
  onCompleteAct: (actId: string, questId: string, relicId?: string) => void;
  completedActs: string[];
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  quest, 
  onBack, 
  onCompleteAct, 
  completedActs 
}) => {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [activeTermIndex, setActiveTermIndex] = useState<number | null>(null);
  const [isSpeakingScripture, setIsSpeakingScripture] = useState(false);
  const [isNarratingFullStory, setIsNarratingFullStory] = useState(false);
  const [journalNote, setJournalNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

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

  const handleNextAct = () => {
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
    const existing = JSON.parse(localStorage.getItem('testament_notes') || '{}');
    existing[act.id] = journalNote;
    localStorage.setItem('testament_notes', JSON.stringify(existing));
    setIsNoteSaved(true);
    soundEngine.playSnap();
    setTimeout(() => setShowNoteInput(false), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-40 sm:pb-48 text-left">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-800/80">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors text-xs md:text-sm font-semibold py-2 px-3.5 rounded-xl bg-stone-900/90 border border-stone-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quests</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleNarrateFullStory}
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

      {/* DUAL-PANE DESKTOP SPREAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: VISUAL ARTWORK & CHOICE ENGINE */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scene Illustration Visual */}
          <div>
            <SceneIllustration theme={act.visualTheme} />
            <div className="mt-2.5 text-xs text-stone-400 italic px-1 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{act.sceneAtmosphere}</span>
            </div>
          </div>

          {/* Historical Reality / Stage Setter */}
          <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800/90 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>The Historical Reality</span>
            </div>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
              {act.historicalContext}
            </p>
          </div>

          {/* Perspective Check ("Step Into Their Shoes") */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1a1511] to-[#100d0a] border-2 border-amber-600/40 shadow-glow-gold">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Perspective Check: What Would You Do?</span>
            </div>
            <h3 className="text-base md:text-lg font-serif font-bold text-parchment-50 mb-3">
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
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-amber-600/25 border-amber-500 text-parchment-50 ring-1 ring-amber-500 shadow-glow-ember' 
                        : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                      <span className="text-xs md:text-sm font-medium">{choice.text}</span>
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
                  className="mt-3 pt-3 border-t border-amber-900/40 space-y-2"
                >
                  <div className="text-xs text-stone-300">
                    <strong className="text-amber-400">The Human Instinct: </strong> 
                    {selectedChoice.reaction}
                  </div>
                  <div className="text-xs text-parchment-200 bg-amber-950/40 p-3 rounded-lg border border-amber-800/40">
                    <strong className="text-amber-300">The Historical Pivot: </strong> 
                    {selectedChoice.historicalPivot}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: CONVERSATIONAL NARRATIVE & SCRIPTURE SCROLL */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quest Title Card */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500/80 mb-1">
              <span>{quest.testament}</span>
              <span>•</span>
              <span>{quest.historicalPeriod}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-black tracking-tight text-parchment-50 mb-1">
              {act.actTitle}
            </h1>
            <p className="text-sm md:text-base text-stone-400 font-medium">
              {quest.title} — {quest.characterTitle}
            </p>
          </div>

          {/* Graphic Novel Narrative Paragraphs */}
          <div className="space-y-4">
            {act.narrativeParagraphs.map((paragraph, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 md:p-5 rounded-xl bg-[#13161c] border border-stone-800/80 shadow-md"
              >
                <p className="font-reading text-base md:text-lg text-parchment-100 leading-relaxed">
                  {paragraph}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tap-to-Explain Ancient Customs & Terms */}
          {act.glossary.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800">
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
                    className="p-3.5 rounded-lg bg-stone-950/90 border border-amber-900/30 text-xs text-stone-300 space-y-1.5"
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

          {/* Unlocked Scripture Card */}
          <div className="p-5 md:p-6 rounded-2xl bg-[#161a22] border border-amber-500/40 shadow-glow-gold relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Scripture Unlocked • {act.unlockedScripture.translation}
                </span>
              </div>

              <button
                onClick={handleToggleSpeakScripture}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 bg-stone-800 hover:bg-amber-600 hover:text-black transition-colors"
              >
                {isSpeakingScripture ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>

            <h4 className="text-sm font-semibold text-amber-300 mb-1">
              {act.unlockedScripture.reference}
            </h4>

            <blockquote className="font-reading text-lg md:text-xl text-parchment-50 italic my-3 pl-4 border-l-2 border-amber-500/70 leading-relaxed">
              "{act.unlockedScripture.text}"
            </blockquote>

            <p className="text-sm text-stone-300 mt-3 pt-3 border-t border-stone-800">
              <strong className="text-amber-400">Context: </strong>
              {act.unlockedScripture.deepDive}
            </p>
          </div>

          {/* Real Talk for Today (Takeaway for Adults) */}
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#18191d] to-[#0e1013] border border-stone-700 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Real Talk For Today</span>
            </div>
            
            <h4 className="text-base md:text-lg font-serif font-bold text-parchment-100 mb-2">
              Dealing With: {act.realTalkTakeaway.coreChallenge}
            </h4>

            <p className="text-sm text-stone-300 leading-relaxed mb-3">
              {act.realTalkTakeaway.practicalLesson}
            </p>

            <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-800/40 text-xs text-amber-200 font-medium">
              <strong>Today's Challenge: </strong> {act.realTalkTakeaway.dailyAction}
            </div>

            {/* Quick Journal / Personal Reflection Note */}
            <div className="mt-4 pt-3 border-t border-stone-800">
              {!showNoteInput ? (
                <button 
                  onClick={() => setShowNoteInput(true)}
                  className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Jot a personal takeaway or reflection</span>
                </button>
              ) : (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    placeholder="How does this story hit you personally? What's your own battle right now?"
                    className="w-full text-xs p-3 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
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
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      {isNoteSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : null}
                      <span>{isNoteSaved ? 'Saved to Arsenal' : 'Save Note'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INTERACTIVE WISDOM CHECK QUIZ */}
          {act.wisdomQuiz && (
            <div className="p-5 md:p-6 rounded-2xl bg-[#141822] border-2 border-stone-700 shadow-md">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Wisdom Check Drill (+30 XP)</span>
              </div>

              <h4 className="text-base font-serif font-bold text-parchment-50 mb-3">
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
                  className="mt-3 p-3 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300"
                >
                  <strong className={act.wisdomQuiz.options[selectedQuizOption].isCorrect ? "text-emerald-400" : "text-amber-400"}>
                    {act.wisdomQuiz.options[selectedQuizOption].isCorrect ? "Spot on! " : "Good try! "}
                  </strong>
                  {act.wisdomQuiz.options[selectedQuizOption].explanation}
                </motion.div>
              )}
            </div>
          )}

          {/* NEXT ACT TEASER */}
          {act.teaserForNext && currentActIndex < quest.acts.length - 1 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200/90 italic">
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
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-glow-gold transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Act (+50 XP)</span>
                </button>
              ) : currentActIndex < quest.acts.length - 1 ? (
                <button
                  onClick={handleNextAct}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-black transition-all flex items-center justify-center gap-2 shadow-glow-gold"
                >
                  <span>Next Act</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onBack}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Quest Finished • Return to Map</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
