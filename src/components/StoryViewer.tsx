import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryQuest, StoryAct, TermExplainer } from '../types';
import { SceneIllustration } from './SceneIllustration';
import { soundEngine, type NarratorProfile, NARRATOR_VOICES } from '../utils/audio';
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
import { getStoryVerseForAct, getStoryVerseForQuest } from '../utils/verseRegistry';
import { parseScriptureReference, passageWindow } from '../utils/scriptureRef';
import { fetchBibleChapter, getDefaultTranslationForLanguage, type BibleVerse } from '../utils/bibleService';
import { deriveConsequenceRipple, generateAfterActionReport } from '../utils/narrativeMomentum';
import { TacticalNexusCard } from './TacticalNexusCard';
import { useLanguage } from '../context/LanguageContext';
import type { QuestCustomEvaluation } from '../utils/questInstinctEngine';
import { evaluateQuestCustomResponseWithGemini } from '../utils/geminiDilemmaService';

const UNIVERSAL_BIBLICAL_TERMS: TermExplainer[] = [
  {
    term: 'Covenant',
    ancientMeaning: 'A sacred, binding life-and-death commitment sealed in blood, pledging total faithfulness between parties.',
    modernAnalogy: 'Far deeper than a legal contract — like marriage vows where two become one family forever.'
  },
  {
    term: 'Righteousness',
    ancientMeaning: 'Living in correct, harmonious relationship with God and fellow humans; ethical integrity and justice.',
    modernAnalogy: 'Walking in alignment with your true design, where your inner heart matches your outward actions.'
  },
  {
    term: 'Atonement',
    ancientMeaning: 'The covering, reconciliation, or cleansing of guilt and relational rupture through sacrificial substitute.',
    modernAnalogy: 'Wiping a crippling debt completely off the books so two estranged parties can embrace in peace.'
  },
  {
    term: 'Sheol',
    ancientMeaning: 'The Hebrew concept of the realm of the dead or the grave, the place of silence awaiting resurrection.',
    modernAnalogy: 'The unseen realm of rest for those who have departed this earthly life.'
  },
  {
    term: 'Yahweh (The LORD)',
    ancientMeaning: 'The personal, uncreated, covenant name of God revealed to Moses: "I AM WHO I AM".',
    modernAnalogy: "God's intimate personal name, showing He is not an impersonal force but a living relational Father."
  },
  {
    term: 'Grace',
    ancientMeaning: 'Unmerited royal favor freely bestowed on an inferior who had zero claim to it.',
    modernAnalogy: 'Receiving an unconditional full scholarship and royal adoption after failing the entrance exam.'
  }
];

interface StoryViewerProps {
  quest: StoryQuest;
  onBack: () => void;
  onCompleteAct: (actId: string, questId: string, relicId?: string) => void;
  completedActs: string[];
  onOpenWordForge?: (verseId: string) => void;
  onOpenNexus?: (type: string, id: string) => void;
  onOpenBibleChapter?: (target: { book: string; chapter: number; verseStart: number; verseEnd: number }) => void;
  onRewardXP?: (amount: number) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  quest, 
  onBack, 
  onCompleteAct, 
  completedActs,
  onOpenWordForge,
  onOpenNexus,
  onOpenBibleChapter,
  onRewardXP
}) => {
  const { language } = useLanguage();
  const [currentActIndex, setCurrentActIndex] = useState(() => {
    const nextIndex = quest.acts.findIndex((item) => !completedActs.includes(item.id));
    return nextIndex === -1 ? 0 : nextIndex;
  });
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [choiceMode, setChoiceMode] = useState<'options' | 'custom'>('options');
  const [customResponseText, setCustomResponseText] = useState<string>('');
  const [customEvaluation, setCustomEvaluation] = useState<QuestCustomEvaluation | null>(null);
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);
  const [activeTermIndex, setActiveTermIndex] = useState<number | null>(null);
  const [isSpeakingScripture, setIsSpeakingScripture] = useState(false);
  const [isNarratingFullStory, setIsNarratingFullStory] = useState(false);
  const [narratorProfile, setNarratorProfile] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());
  const [journalNote, setJournalNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isMemoryPulseOpen, setIsMemoryPulseOpen] = useState(false);
  const [passageVerses, setPassageVerses] = useState<BibleVerse[] | null>(null);
  const [passageStatus, setPassageStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');

  // Wisdom Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const [actCompletionData, setActCompletionData] = useState<{ actNumber: number; isLastAct: boolean; relicName?: string } | null>(null);

  const act: StoryAct = quest.acts[currentActIndex];
  const actGlossary: TermExplainer[] = [
    ...(act.glossary || []),
    ...UNIVERSAL_BIBLICAL_TERMS.filter(
      u => !(act.glossary || []).some(g => g.term.toLowerCase() === u.term.toLowerCase())
    )
  ];
  const isActFinished = completedActs.includes(act.id);
  const isQuestFullyCompleted = quest.acts.every(a => completedActs.includes(a.id));
  const questAnchorVerse = getStoryVerseForQuest(quest.id, language) || getStoryVerseForAct(quest.id, act.id, language);
  const scriptureRef = parseScriptureReference(act.unlockedScripture.reference);

  useEffect(() => {
    if (!selectedChoiceId || !scriptureRef) {
      setPassageVerses(null);
      setPassageStatus(selectedChoiceId ? 'fallback' : 'idle');
      return;
    }
    let cancelled = false;
    setPassageStatus('loading');
    setPassageVerses(null);
    const activeTranslation = getDefaultTranslationForLanguage(language);
    fetchBibleChapter(scriptureRef.book, scriptureRef.chapter, activeTranslation)
      .then((data) => {
        if (cancelled) return;
        const window = passageWindow(scriptureRef.verseStart, scriptureRef.verseEnd, data.verses.length);
        const slice = data.verses.filter(v => v.verse >= window.from && v.verse <= window.to);
        if (slice.length === 0) {
          setPassageStatus('fallback');
          return;
        }
        setPassageVerses(slice);
        setPassageStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setPassageStatus('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, [act.id, selectedChoiceId, act.unlockedScripture.reference, language, scriptureRef]);

  // Load saved choices, quizzes, and reflection notes for the current act (Requirement 3)
  useEffect(() => {
    try {
      const storedChoices = localStorage.getItem('testament_act_choices');
      if (storedChoices) {
        const choices = JSON.parse(storedChoices);
        if (choices[act.id]) {
          setSelectedChoiceId(choices[act.id]);
          if (choices[act.id] === 'custom') {
            setChoiceMode('custom');
          }
        } else {
          setSelectedChoiceId(null);
        }
      } else {
        setSelectedChoiceId(null);
      }
    } catch {
      setSelectedChoiceId(null);
    }

    try {
      const storedCustom = localStorage.getItem('testament_act_custom_responses');
      if (storedCustom) {
        const customMap = JSON.parse(storedCustom);
        if (customMap[act.id]) {
          setCustomResponseText(customMap[act.id].text || '');
          setCustomEvaluation(customMap[act.id].evaluation || null);
        } else {
          setCustomResponseText('');
          setCustomEvaluation(null);
        }
      } else {
        setCustomResponseText('');
        setCustomEvaluation(null);
      }
    } catch {
      setCustomResponseText('');
      setCustomEvaluation(null);
    }

    try {
      const storedQuizzes = localStorage.getItem('testament_act_quizzes');
      if (storedQuizzes) {
        const quizzes = JSON.parse(storedQuizzes);
        if (quizzes[act.id] !== undefined) {
          setSelectedQuizOption(quizzes[act.id].optionIndex);
          setHasSubmittedQuiz(true);
        } else {
          setSelectedQuizOption(null);
          setHasSubmittedQuiz(false);
        }
      } else {
        setSelectedQuizOption(null);
        setHasSubmittedQuiz(false);
      }
    } catch {
      setSelectedQuizOption(null);
      setHasSubmittedQuiz(false);
    }

    try {
      const storedNotes = localStorage.getItem('testament_notes');
      if (storedNotes) {
        const notes = JSON.parse(storedNotes);
        if (notes[act.id]) {
          setJournalNote(notes[act.id]);
          setIsNoteSaved(true);
          setShowNoteInput(true);
        } else {
          setJournalNote('');
          setIsNoteSaved(false);
          setShowNoteInput(false);
        }
      } else {
        setJournalNote('');
        setIsNoteSaved(false);
        setShowNoteInput(false);
      }
    } catch {
      setJournalNote('');
      setIsNoteSaved(false);
      setShowNoteInput(false);
    }
    setActiveStepIndex(1);
  }, [act.id]);

  const selectedChoice = act.choices.find(c => c.id === selectedChoiceId);

  const handleSelectChoice = (choiceId: string) => {
    soundEngine.playSnap();
    setSelectedChoiceId(choiceId);
    setActiveStepIndex(2);
    try {
      const stored = localStorage.getItem('testament_act_choices');
      const choices = stored ? JSON.parse(stored) : {};
      choices[act.id] = choiceId;
      localStorage.setItem('testament_act_choices', JSON.stringify(choices));
    } catch (err) {
      console.warn('Failed to save choice to localStorage:', err);
    }
  };

  const handleSubmitCustomResponse = async () => {
    if (!customResponseText.trim() || isAnalyzingCustom) return;
    soundEngine.playSnap();
    setIsAnalyzingCustom(true);
    try {
      const evaluation = await evaluateQuestCustomResponseWithGemini(customResponseText, act, quest);
      setCustomEvaluation(evaluation);
      setSelectedChoiceId('custom');
      setActiveStepIndex(2);

      try {
        const storedChoices = localStorage.getItem('testament_act_choices');
        const choices = storedChoices ? JSON.parse(storedChoices) : {};
        choices[act.id] = 'custom';
        localStorage.setItem('testament_act_choices', JSON.stringify(choices));

        const storedCustom = localStorage.getItem('testament_act_custom_responses');
        const customMap = storedCustom ? JSON.parse(storedCustom) : {};
        customMap[act.id] = { text: customResponseText, evaluation };
        localStorage.setItem('testament_act_custom_responses', JSON.stringify(customMap));
      } catch (err) {
        console.warn('Failed to save custom act response:', err);
      }
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const scriptureSpeech = () => {
    const body = passageStatus === 'ready' && passageVerses
      ? passageVerses.map(v => v.text).join(' ')
      : (questAnchorVerse?.text || act.unlockedScripture.text);
    return `${questAnchorVerse?.reference || act.unlockedScripture.reference}. ${body}. ${act.unlockedScripture.deepDive}`;
  };

  const handleToggleSpeakScripture = () => {
    if (isSpeakingScripture) {
      soundEngine.stopSpeaking();
      setIsSpeakingScripture(false);
    } else {
      soundEngine.stopSpeaking();
      setIsNarratingFullStory(false);
      setIsSpeakingScripture(true);
      soundEngine.speakVerse(scriptureSpeech(), () => setIsSpeakingScripture(false));
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
      soundEngine.speakVerse(scriptureSpeech(), () => setIsSpeakingScripture(false));
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    soundEngine.playSnap();
    setSelectedQuizOption(optionIndex);
    setHasSubmittedQuiz(true);
    if (act.wisdomQuiz?.options[optionIndex].isCorrect) {
      soundEngine.playVictory();
      try {
        const stored = localStorage.getItem('testament_quiz_rewards');
        const rewarded: string[] = stored ? JSON.parse(stored) : [];
        if (Array.isArray(rewarded) && !rewarded.includes(act.id)) {
          rewarded.push(act.id);
          localStorage.setItem('testament_quiz_rewards', JSON.stringify(rewarded));
          onRewardXP?.(30);
        }
      } catch {
        // ignore
      }
    }
    try {
      const stored = localStorage.getItem('testament_act_quizzes');
      const quizzes = stored ? JSON.parse(stored) : {};
      quizzes[act.id] = { optionIndex, isCorrect: !!act.wisdomQuiz?.options[optionIndex]?.isCorrect };
      localStorage.setItem('testament_act_quizzes', JSON.stringify(quizzes));
    } catch (err) {
      console.warn('Failed to save quiz answer to localStorage:', err);
    }
  };

  // Present celebration screen with explicit choices upon completing an act
  const handleFinishAct = () => {
    if (!selectedChoiceId) return;
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

    setActCompletionData({
      actNumber: currentActIndex + 1,
      isLastAct,
      relicName: quest.relicReward?.name
    });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    onBack();
  };

  const handleNextAct = () => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    setIsNarratingFullStory(false);
    if (currentActIndex < quest.acts.length - 1) {
      soundEngine.playClick();
      setCurrentActIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const handlePrevAct = () => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    setIsNarratingFullStory(false);
    if (currentActIndex > 0) {
      soundEngine.playClick();
      setCurrentActIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200 dark:border-stone-800/80">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-xs md:text-sm font-semibold py-2 px-3.5 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quests</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Narrator Persona Picker */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900/90 rounded-xl border border-stone-200 dark:border-stone-800">
            <Mic className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 ml-1.5 hidden md:inline" />
            {[
              { id: 'cinematic', label: '🎬 Adam' },
              { id: 'brotherhood', label: '🤝 Antoni' },
              { id: 'scholar', label: '📜 George' },
              { id: 'grace', label: '🙏 Rachel' }
            ].map(p => (
              <button
                key={p.id}
                title={NARRATOR_VOICES[p.id as NarratorProfile]?.description}
                onClick={() => handleSelectNarratorProfile(p.id as NarratorProfile)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  narratorProfile === p.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
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
                ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold shadow-glow'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            {isNarratingFullStory ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500" />}
            <span>{isNarratingFullStory ? 'Pause Story' : 'Listen to Full Story'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-500 font-mono hidden sm:inline">
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
                        ? 'w-2 bg-amber-600/70 dark:bg-amber-700/60'
                        : 'w-2 bg-stone-300 dark:bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consequence Ripple Banner (Narrative Momentum from Prior Acts) */}
      {(() => {
        const ripple = deriveConsequenceRipple(quest.id, currentActIndex);
        if (!ripple) return null;
        return (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 dark:from-amber-950/40 via-stone-50 dark:via-stone-900 to-stone-100 dark:to-stone-950 border border-amber-300 dark:border-amber-500/40 flex items-start gap-3 text-xs shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block text-[11px]">
                Consequence Ripple • {ripple.rippleTitle}
              </span>
              <span className="text-stone-700 dark:text-stone-300 leading-relaxed">{ripple.rippleDescription}</span>
            </div>
          </div>
        );
      })()}

      {/* Review Mode Banner & After-Action Report (Requirement 3: Never starts over when reviewed) */}
      {isQuestFullyCompleted && (
        <div className="mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/60 via-stone-50 dark:via-[#10141d] to-emerald-50/50 dark:to-stone-900 border border-emerald-300 dark:border-emerald-500/50 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200 block">
                  Quest Completed • Review Mode
                </span>
                <span className="text-stone-600 dark:text-stone-300 text-xs">
                  All your chosen answers, quiz drills, and reflections are preserved exactly as you answered them.
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50 px-2.5 py-1 rounded-full shrink-0">
              ✓ 100% Completed
            </span>
          </div>

          {/* After-Action Report (AAR) Card */}
          {(() => {
            const aar = generateAfterActionReport(quest.title, quest.heroName, quest.acts.length);
            return (
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/50 border border-emerald-300 dark:border-emerald-800/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  <span>After-Action Report (AAR)</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{aar.battlefieldHonor}</span>
                </div>
                <div className="text-sm font-serif font-bold text-stone-900 dark:text-stone-200">
                  Tactical Path: <span className="text-amber-800 dark:text-amber-300">{aar.tacticalPath}</span>
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                  {aar.afterActionSummary}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* GUIDED DESKTOP SPREAD: STICKY STAGE (Col 4) + CHRONOLOGICAL READING STREAM (Col 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: STICKY VISUAL & CONTEXT STAGE (Pins in view as you read) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-5">
          
          {/* Act Badge & Era Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-ink-raised border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-500">
              <span>{quest.testament} • {quest.historicalPeriod}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/50 text-amber-800 dark:text-amber-300">
                Act {act.actNumber}/{quest.acts.length}
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-parchment-100">
              {quest.title}
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {quest.characterTitle}
            </p>
          </div>

          {/* Scene Illustration Visual Artwork */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md bg-stone-100 dark:bg-stone-950 max-h-48 sm:max-h-56 lg:max-h-none">
            <SceneIllustration theme={act.visualTheme} />
            <div className="p-3 text-xs text-stone-600 dark:text-stone-400 italic bg-stone-50 dark:bg-ink-raised flex items-center gap-2 border-t border-stone-200 dark:border-stone-850">
              <Compass className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 shrink-0" />
              <span>{act.sceneAtmosphere}</span>
            </div>
          </div>

          {/* Historical Reality Intel Card (Collapsible on mobile) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 shadow-sm">
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  <ShieldAlert className="w-4 h-4 text-amber-800 dark:text-amber-500" />
                  <span>The Historical Reality</span>
                </div>
                <span className="lg:hidden text-xs text-stone-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mt-2">
                {act.historicalContext}
              </p>
            </details>
          </div>

          {/* Guided Reading Roadmap (Milestone Tracker - Desktop only) */}
          <div className="hidden lg:block p-4 rounded-2xl bg-white dark:bg-ink-raised border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
              <ListOrdered className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500" />
              <span>Reading Roadmap</span>
            </div>
            <nav className="space-y-1 text-xs">
              {[
                { step: 1, id: 'section-crossroads', label: 'Decide First (What would you do?)' },
                { step: 2, id: 'section-narrative', label: 'What Actually Unfolded' },
                { step: 3, id: 'section-scripture', label: 'Scripture Unlocked' },
                { step: 4, id: 'section-realtalk', label: 'Why This Matters Today' },
                { step: 5, id: 'section-quiz', label: 'Wisdom Check Drill' }
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(item.step);
                    scrollToSection(item.id);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    activeStepIndex === item.step
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800/60'
                      : 'text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-850/60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-xs font-mono flex items-center justify-center font-bold shrink-0 ${
                    activeStepIndex === item.step
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-100 dark:bg-stone-800 text-amber-800 dark:text-amber-400'
                  }`}>{item.step}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

        </div>

        {/* RIGHT COLUMN: CHRONOLOGICAL GUIDED READING STREAM */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Main Story Header */}
          <div className="border-b border-stone-200 dark:border-stone-800/80 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1.5">
              <span>Act {act.actNumber} of {quest.acts.length}</span>
              <span>•</span>
              <span>{quest.historicalPeriod}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-stone-900 dark:text-parchment-50 mb-2">
              {act.actTitle}
            </h1>
            <p className="text-sm md:text-base text-stone-600 dark:text-stone-400">
              {quest.title} — {quest.characterTitle}
            </p>
          </div>

          {/* PROGRESSIVE STEPPER NAVIGATOR */}
          <div className="sticky top-2 sm:top-4 z-20 p-1.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-500/40 shadow-md">
            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { step: 1, label: 'Decide' },
                { step: 2, label: 'Story' },
                { step: 3, label: 'Scripture' },
                { step: 4, label: 'Why It Matters' },
                { step: 5, label: 'Wisdom Drill' }
              ].map((s) => {
                const isCurrent = activeStepIndex === s.step;
                const isPast = activeStepIndex > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveStepIndex(s.step);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-mono transition-all flex flex-col items-center justify-center min-h-[44px] ${
                      isCurrent
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : isPast
                          ? 'text-amber-800 dark:text-amber-300 hover:bg-amber-500/10'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold">
                      {isPast ? '✓' : `Step ${s.step}`}
                    </span>
                    <span className="text-[10px] sm:text-xs truncate w-full">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: DECIDE FIRST (BEFORE THE LONG READ) */}
          {activeStepIndex === 1 && (
            <section id="section-crossroads" className="p-5 md:p-6 rounded-2xl bg-stone-50 dark:bg-gradient-to-b dark:from-[#1c1612] dark:to-[#120f0d] border-2 border-amber-300 dark:border-amber-600/60 shadow-sm dark:shadow-glow scroll-mt-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">Step 1 of 5</span>
                <span>Decide First</span>
              </div>
              <Flame className="w-4 h-4 text-amber-800 dark:text-amber-500 animate-pulse" />
            </div>

            <h3 className="text-base md:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50 mb-3 leading-snug">
              {act.perspectivePrompt}
            </h3>

            {/* Mode Switcher: Predefined Options vs Type Your Own */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-stone-100 dark:bg-stone-900/90 rounded-xl border border-stone-200 dark:border-stone-800 w-fit">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setChoiceMode('options');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  choiceMode === 'options'
                    ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-parchment-50 shadow-sm border border-stone-200/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Choose Scenario ({act.choices.length} Paths)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setChoiceMode('custom');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  choiceMode === 'custom'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Type What You'd Do</span>
              </button>
            </div>

            {choiceMode === 'options' ? (
              <>
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
                            ? 'bg-amber-100/70 dark:bg-amber-600/25 border-amber-500 text-stone-950 dark:text-parchment-50 ring-1 ring-amber-500 shadow-sm dark:shadow-glow' 
                            : 'bg-white dark:bg-stone-900/90 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <span className="text-sm md:text-base font-medium leading-relaxed">{choice.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Reaction & Biblical Reality Reveal for Options */}
                <AnimatePresence>
                  {selectedChoice && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/50 space-y-3"
                    >
                      <div className="text-xs md:text-sm text-stone-700 dark:text-stone-300">
                        <strong className="text-amber-800 dark:text-amber-400 font-bold">The Human Instinct: </strong> 
                        {selectedChoice.reaction}
                      </div>
                      <div className="text-xs md:text-sm text-stone-900 dark:text-parchment-100 bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 leading-relaxed">
                        <strong className="text-amber-800 dark:text-amber-300 font-bold">The Historical Pivot: </strong> 
                        {selectedChoice.historicalPivot}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              /* Custom Typed Response Mode */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 space-y-3">
                  <label htmlFor="quest-custom-input" className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                    Put yourself in their boots. In your honest words, what would you do in this exact situation?
                  </label>
                  <textarea
                    id="quest-custom-input"
                    rows={3}
                    value={customResponseText}
                    onChange={(e) => setCustomResponseText(e.target.value)}
                    placeholder="E.g. I would keep my head down and not get involved / I'd grab a sword and challenge him / I'd pray and confront him using what I know / I'd negotiate a truce..."
                    className="w-full p-3 text-sm rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-parchment-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                      Be authentic. We will evaluate your gut instinct against what Scripture recorded.
                    </span>
                    <button
                      type="button"
                      disabled={!customResponseText.trim() || isAnalyzingCustom}
                      onClick={handleSubmitCustomResponse}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                        isAnalyzingCustom
                          ? 'bg-amber-500/80 text-stone-950 cursor-wait animate-pulse'
                          : customResponseText.trim()
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer active:scale-95'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingCustom ? 'animate-spin' : ''}`} />
                      <span>{isAnalyzingCustom ? 'Discerning in Scripture...' : selectedChoiceId === 'custom' ? 'Update & Re-evaluate' : 'Evaluate My Instinct'}</span>
                    </button>
                  </div>
                </div>

                {/* Custom Evaluation Dynamic Result */}
                <AnimatePresence>
                  {selectedChoiceId === 'custom' && customEvaluation && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="p-4 sm:p-5 rounded-xl bg-amber-50 dark:bg-gradient-to-b dark:from-amber-950/40 dark:to-stone-950 border border-amber-300 dark:border-amber-600/50 space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900/50 pb-2.5">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                          {customEvaluation.stanceBadge}
                        </span>
                        <span className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
                          {customEvaluation.stanceTitle}
                        </span>
                      </div>

                      <div className="text-xs md:text-sm text-stone-700 dark:text-stone-300 italic bg-white/70 dark:bg-stone-900/60 p-3 rounded-lg border border-amber-200/60 dark:border-stone-800">
                        {customEvaluation.userSummary}
                      </div>

                      <div className="text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                        <strong className="text-amber-800 dark:text-amber-400 font-bold block mb-0.5">The Human Instinct:</strong>
                        {customEvaluation.humanInstinct}
                      </div>

                      <div className="text-xs md:text-sm text-stone-900 dark:text-parchment-100 bg-amber-100/70 dark:bg-amber-950/60 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/60 leading-relaxed">
                        <strong className="text-amber-900 dark:text-amber-300 font-bold block mb-0.5">The Historical Pivot:</strong>
                        {customEvaluation.historicalPivot}
                      </div>

                      <div className="text-xs md:text-sm text-stone-800 dark:text-stone-300">
                        <strong className="text-amber-800 dark:text-amber-400 font-bold block mb-0.5">Tactical Takeaway For Today:</strong>
                        {customEvaluation.practicalLesson}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {selectedChoiceId && (
              <div className="pt-4 mt-4 border-t border-amber-200 dark:border-amber-900/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(2);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Step 2: What Actually Unfolded</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
          )}

          {/* STEP 2: WHAT ACTUALLY UNFOLDED */}
          {activeStepIndex === 2 && (
            <section id="section-narrative" className="space-y-4 scroll-mt-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">Step 2 of 5</span>
                <span>What Actually Unfolded</span>
              </div>

              {!selectedChoiceId ? (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-dashed border-amber-300 dark:border-amber-700/50 text-center space-y-3">
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Make your call in Step 1 first — then see how the story actually unfolded.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveStepIndex(1);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all"
                  >
                    ← Go to Step 1: Make Your Call
                  </button>
                </div>
              ) : (
                <>
                  {/* Paragraph Cards */}
                  <div className="space-y-4">
                    {act.narrativeParagraphs.map((paragraph, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="p-5 md:p-6 rounded-2xl bg-white dark:bg-ink-raised border border-stone-200 dark:border-stone-800/90 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                      >
                        <p className="font-reading text-base md:text-lg text-stone-800 dark:text-parchment-100 leading-relaxed">
                          {paragraph}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tap-to-Explain Ancient Customs & Terms */}
                  {actGlossary.length > 0 && (
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 mt-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                        <HelpCircle className="w-4 h-4 text-amber-800 dark:text-amber-500" />
                        <span>Explain Like I'm 5: Tap Ancient Terms</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {actGlossary.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              soundEngine.playSnap();
                              setActiveTermIndex(activeTermIndex === idx ? null : idx);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                              activeTermIndex === idx
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                            }`}
                          >
                            {item.term} ℹ️
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {activeTermIndex !== null && actGlossary[activeTermIndex] && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-950/90 border border-amber-300/40 dark:border-amber-900/30 text-xs text-stone-800 dark:text-stone-300 space-y-1.5"
                          >
                            <div>
                              <strong className="text-amber-800 dark:text-amber-400">Ancient Context: </strong>
                              {actGlossary[activeTermIndex].ancientMeaning}
                            </div>
                            <div className="text-stone-800 dark:text-parchment-200">
                              <strong className="text-amber-800 dark:text-amber-300">Everyday Translation: </strong>
                              {actGlossary[activeTermIndex].modernAnalogy}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Step 2 Bottom Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveStepIndex(1);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-colors"
                    >
                      ← Step 1: Decision
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveStepIndex(3);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Continue to Step 3: Scripture</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* STEP 3: UNLOCKED SCRIPTURE CARD (Requirement 1: 1 memory verse applies to the quest) */}
          {activeStepIndex === 3 && (
            <section id="section-scripture" className="p-5 md:p-6 rounded-2xl bg-white dark:bg-ink-overlay border-2 border-amber-300 dark:border-amber-500/50 shadow-sm dark:shadow-glow relative overflow-hidden scroll-mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-mono font-bold">
                    Step 3 of 5
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                    <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                    <span>
                      {act.actNumber === 1 
                        ? `Quest Anchor Scripture • 1 Memory Verse For This Quest`
                        : `Scene Scripture • Reinforces Quest Anchor: ${questAnchorVerse?.reference || quest.acts[0].unlockedScripture.reference}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleSpeakScripture}
                  disabled={!selectedChoiceId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-850 hover:bg-amber-500 dark:hover:bg-amber-600 hover:text-stone-950 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isSpeakingScripture ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 animate-pulse" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base font-serif font-bold text-amber-800 dark:text-amber-300 mb-2">
                {questAnchorVerse?.reference || act.unlockedScripture.reference}
              </h3>

              {!selectedChoiceId ? (
                <p className="text-sm text-stone-600 dark:text-stone-400 italic">
                  Make your call in Step 1 first — then this passage opens from the Bible.
                </p>
              ) : passageStatus === 'loading' ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">Opening the passage…</p>
              ) : passageStatus === 'ready' && passageVerses && scriptureRef ? (
                <div className="space-y-2 my-3 pl-4 border-l-2 border-amber-500">
                  {passageVerses.map((v) => {
                    const cited = v.verse >= scriptureRef.verseStart && v.verse <= scriptureRef.verseEnd;
                    return (
                      <p
                        key={v.verse}
                        className={`font-reading text-base md:text-lg leading-relaxed ${
                          cited
                            ? 'text-stone-950 dark:text-parchment-50 font-medium'
                            : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 mr-2">{v.verse}</span>
                        {v.text}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <blockquote className="font-reading text-lg md:text-xl text-stone-900 dark:text-parchment-50 italic my-3 pl-4 border-l-2 border-amber-500 leading-relaxed">
                  "{questAnchorVerse?.text || act.unlockedScripture.text}"
                </blockquote>
              )}

              {selectedChoiceId && scriptureRef && onOpenBibleChapter && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenBibleChapter(scriptureRef);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-500 hover:text-stone-950 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read this chapter
                </button>
              )}

              {selectedChoiceId && (
                <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 leading-relaxed">
                  <strong className="text-amber-800 dark:text-amber-400">Context: </strong>
                  {act.unlockedScripture.deepDive}
                </p>
              )}

              {/* Memory Pulse Reminders Call to Action */}
              <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/30 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <Bell className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 animate-pulse" />
                  <span>
                    {act.actNumber === 1
                      ? "Lock this quest's definitive memory verse into your daily recall:"
                      : `Reinforce the quest's memory verse (${questAnchorVerse?.reference}):`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsMemoryPulseOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Train Quest Verse: {questAnchorVerse?.reference || act.unlockedScripture.reference}</span>
                  </button>
                </div>
              </div>

              {/* Step 3 Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-stone-200 dark:border-stone-800 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(2);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-colors"
                >
                  ← Step 2: Story
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(4);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Step 4: Why This Matters</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {/* STEP 4: WHY THIS MATTERS TODAY (TAKEAWAY FOR ALL AGES) */}
          {activeStepIndex === 4 && (
            <section id="section-realtalk" className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#17191e] dark:to-[#0e1014] border border-stone-200 dark:border-stone-700 shadow-sm scroll-mt-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">Step 4 of 5</span>
                <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-500" />
                <span>Why This Matters Today</span>
              </div>
              
              <h3 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-parchment-100 mb-2">
                Dealing With: {act.realTalkTakeaway.coreChallenge}
              </h3>

              <p className="text-sm md:text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                {act.realTalkTakeaway.practicalLesson}
              </p>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs md:text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                <strong className="text-amber-800 dark:text-amber-300">Today's Tactical Action: </strong> 
                {act.realTalkTakeaway.dailyAction}
              </div>

              {/* Quick Journal / Personal Reflection Note */}
              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
                {!showNoteInput ? (
                  <button 
                    onClick={() => setShowNoteInput(true)}
                    className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500" />
                    <span>Jot a personal takeaway or battle reflection</span>
                  </button>
                ) : (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={journalNote}
                      onChange={(e) => setJournalNote(e.target.value)}
                      placeholder="How does this story hit you personally? What's your own battle right now?"
                      className="w-full text-xs md:text-sm p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowNoteInput(false)}
                        className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                      >
                        {isNoteSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : null}
                        <span>{isNoteSaved ? 'Saved to Arsenal' : 'Save Note'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4 Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-stone-200 dark:border-stone-800 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(3);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-colors"
                >
                  ← Step 3: Scripture
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(5);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Step 5: Wisdom Drill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {/* STEP 5: INTERACTIVE WISDOM CHECK DRILL & ACT FINISH */}
          {activeStepIndex === 5 && (
            <div className="space-y-6">
              {act.wisdomQuiz && (
                <section id="section-quiz" className="p-5 md:p-6 rounded-2xl bg-white dark:bg-ink-overlay border-2 border-stone-200 dark:border-stone-700 shadow-sm scroll-mt-6">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">Step 5 of 5</span>
                    <Award className="w-4 h-4 text-amber-800 dark:text-amber-500" />
                    <span>Wisdom Check Drill (+30 XP)</span>
                  </div>

                  <h3 className="text-base md:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 mb-3">
                    {act.wisdomQuiz.question}
                  </h3>

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
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                                : isSelected
                                  ? 'bg-red-50 dark:bg-red-950/70 border-red-500 text-red-900 dark:text-red-200'
                                  : 'bg-stone-100 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 opacity-60'
                              : 'bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-300 hover:border-amber-500/60 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono font-bold text-stone-400 dark:text-stone-500">{String.fromCharCode(65 + idx)}.</span>
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
                      className="mt-3 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed"
                    >
                      <strong className={act.wisdomQuiz.options[selectedQuizOption].isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}>
                        {act.wisdomQuiz.options[selectedQuizOption].isCorrect ? "Spot on! " : "Good try! "}
                      </strong>
                      {act.wisdomQuiz.options[selectedQuizOption].explanation}
                    </motion.div>
                  )}
                </section>
              )}

              {/* NEXT ACT TEASER */}
              {act.teaserForNext && currentActIndex < quest.acts.length - 1 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs md:text-sm text-amber-900 dark:text-amber-200/90 italic">
                  <strong>Coming Up in Act {currentActIndex + 2}: </strong>
                  "{act.teaserForNext}"
                </div>
              )}

              {/* LIVING CANON: TACTICAL NEXUS KNOWLEDGE GRAPH */}
              <TacticalNexusCard entityId={quest.id} onOpenEntity={onOpenNexus} />

              {/* Bottom Action Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-6 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveStepIndex(4);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-colors"
                >
                  ← Back to Step 4: Why This Matters
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {currentActIndex > 0 && (
                    <button
                      onClick={handlePrevAct}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-colors"
                    >
                      Previous Act
                    </button>
                  )}

                  {!isActFinished ? (
                    <button
                      onClick={handleFinishAct}
                      disabled={!selectedChoiceId}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                        selectedChoiceId
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer'
                          : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedChoiceId ? 'Complete Act (+50 XP)' : 'Choose a response first'}</span>
                    </button>
                  ) : currentActIndex < quest.acts.length - 1 ? (
                    <button
                      onClick={handleNextAct}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Advance to Act {currentActIndex + 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleBack}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isQuestFullyCompleted ? '✓ Completed • Return to Quests' : 'Quest Finished • Return to Quests'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Act & Story Completion Celebration Overlay (M-5: explicit related choices, no hijacking) */}
      {actCompletionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-ink-raised border-2 border-amber-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-glow">
              🎉
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {actCompletionData.isLastAct ? 'Story Completed!' : `Act ${actCompletionData.actNumber} Completed!`}
              </div>
              <h2 className="text-2xl font-serif font-extrabold text-stone-900 dark:text-white mt-1">
                {actCompletionData.isLastAct ? quest.title : act.actTitle}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
                {actCompletionData.isLastAct
                  ? `You mastered all ${quest.acts.length} acts and unlocked ${actCompletionData.relicName || 'the story relic'}!`
                  : `Great job! You earned +50 XP and finished this part of the story.`}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {!actCompletionData.isLastAct ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSnap();
                      setActCompletionData(null);
                      setCurrentActIndex(prev => prev + 1);
                      setActiveStepIndex(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      document.documentElement.scrollTop = 0;
                      document.body.scrollTop = 0;
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue Story: Act {actCompletionData.actNumber + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setActCompletionData(null);
                      onBack();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-sm border border-stone-200 dark:border-stone-750 transition-colors"
                  >
                    Return to Today's Plan
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActCompletionData(null);
                    onBack();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Return to Today's Plan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Memory Verse Pulse & Notification Modal (Passes quest's single anchor memory verse) */}
      <MemoryPulseModal
        isOpen={isMemoryPulseOpen}
        onClose={() => setIsMemoryPulseOpen(false)}
        targetVerse={questAnchorVerse || getStoryVerseForAct(quest.id, act.id)}
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
