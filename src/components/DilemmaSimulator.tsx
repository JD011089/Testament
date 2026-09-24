import React, { useState } from 'react';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import type { RealLifeDilemma } from '../data/dilemmas';
import { evaluateUserPlay, evaluateSocraticTurn2 } from '../utils/heartEvaluation';
import type { HeartEvaluationResult, TemperamentProfile } from '../utils/heartEvaluation';
import { soundEngine } from '../utils/audio';
import { getDailyDilemma } from '../utils/dailyEngine';
import confetti from 'canvas-confetti';
import { TacticalNexusCard } from './TacticalNexusCard';
import { 
  ShieldAlert, 
  ArrowRight, 
  Award, 
  Volume2, 
  Sparkles, 
  Flame, 
  Shield, 
  CheckCircle2, 
  RotateCcw, 
  PenTool, 
  BookOpen,
  Filter
} from 'lucide-react';

interface DilemmaSimulatorProps {
  onRewardXP: (amount: number) => void;
  targetDilemmaId?: string | null;
  onClearTargetDilemma?: () => void;
}

export const DilemmaSimulator: React.FC<DilemmaSimulatorProps> = ({ 
  onRewardXP,
  targetDilemmaId,
  onClearTargetDilemma
}) => {
  const dailyDilemma = getDailyDilemma();
  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string>(() => {
    return targetDilemmaId || dailyDilemma.id;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMode, setActiveMode] = useState<'heart_check' | 'playbook'>('heart_check');
  const [isCampaignFocus, setIsCampaignFocus] = useState<boolean>(() => !!targetDilemmaId);
  
  // Heart Check interactive state
  const [userText, setUserText] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<HeartEvaluationResult | null>(null);
  const [isSpeakingScripture, setIsSpeakingScripture] = useState<boolean>(false);

  // Persistence
  const [completedDilemmas, setCompletedDilemmas] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('testament_completed_dilemmas');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Playbook mode state
  const [revealedPlayId, setRevealedPlayId] = useState<string | null>(null);
  const [prevTargetDilemmaId, setPrevTargetDilemmaId] = useState<string | null | undefined>(targetDilemmaId);

  // Multi-Turn Socratic AI state
  const [turn2Text, setTurn2Text] = useState<string>('');
  const [turn2Feedback, setTurn2Feedback] = useState<string | null>(null);
  const [temperamentProfile, setTemperamentProfile] = useState<TemperamentProfile | null>(null);

  // Load saved answers for the current dilemma on mount or when switching
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('testament_dilemma_answers');
      if (stored) {
        const answers = JSON.parse(stored);
        if (answers[selectedDilemmaId]) {
          setUserText(answers[selectedDilemmaId].userText || '');
          setSelectedFeeling(answers[selectedDilemmaId].selectedFeeling || null);
          setEvaluationResult(answers[selectedDilemmaId].evaluationResult || null);
          setTurn2Text(answers[selectedDilemmaId].turn2Text || '');
          setTurn2Feedback(answers[selectedDilemmaId].turn2Feedback || null);
          setTemperamentProfile(answers[selectedDilemmaId].temperamentProfile || null);
          return;
        }
      }
    } catch {
      // ignore
    }
    setUserText('');
    setSelectedFeeling(null);
    setEvaluationResult(null);
    setTurn2Text('');
    setTurn2Feedback(null);
    setTemperamentProfile(null);
  }, [selectedDilemmaId]);

  if (targetDilemmaId && targetDilemmaId !== prevTargetDilemmaId) {
    setPrevTargetDilemmaId(targetDilemmaId);
    setSelectedDilemmaId(targetDilemmaId);
    setIsCampaignFocus(true);
    setSelectedCategory('All');
    setRevealedPlayId(null);
    if (onClearTargetDilemma) {
      onClearTargetDilemma();
    }
  }

  const categories = [
    'All',
    'Workplace & Ambition',
    'Family & Relationships',
    'Stress & Burnout',
    'Betrayal & Integrity'
  ];

  const filteredDilemmas = REAL_LIFE_DILEMMAS.filter(d => 
    selectedCategory === 'All' || d.category === selectedCategory
  );

  const dilemma: RealLifeDilemma = REAL_LIFE_DILEMMAS.find(d => d.id === selectedDilemmaId) || dailyDilemma;

  // Reset inputs when switching dilemmas
  const handleSelectDilemma = (dilemmaId: string) => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    soundEngine.playClick();
    setSelectedDilemmaId(dilemmaId);
    setRevealedPlayId(null);
  };

  // Stop audio on unmount
  React.useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const handleQuickFeelingSelect = (feeling: string) => {
    soundEngine.playSnap();
    setSelectedFeeling(prev => prev === feeling ? null : feeling);
  };

  const handleSubmitHeartCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim() && !selectedFeeling) return;

    soundEngine.playSnap();
    const result = evaluateUserPlay(userText, selectedFeeling, dilemma);
    setEvaluationResult(result);

    // Save user's answer and evaluation so it's preserved on review (Requirement 3 & 4)
    try {
      const stored = localStorage.getItem('testament_dilemma_answers');
      const answers = stored ? JSON.parse(stored) : {};
      answers[dilemma.id] = { userText, selectedFeeling, evaluationResult: result };
      localStorage.setItem('testament_dilemma_answers', JSON.stringify(answers));
    } catch (err) {
      console.warn('Failed to save dilemma answer', err);
    }

    if (!completedDilemmas.includes(dilemma.id)) {
      soundEngine.playVictory();
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#6366f1']
      });
      const updated = [...completedDilemmas, dilemma.id];
      setCompletedDilemmas(updated);
      localStorage.setItem('testament_completed_dilemmas', JSON.stringify(updated));
      onRewardXP(50);
    }

    // Dispatch event to advance Daily Campaign and trigger Next Task prompt (Requirement 5)
    window.dispatchEvent(new CustomEvent('testament-dilemma-completed', { detail: { dilemmaId: dilemma.id } }));
  };

  const handleSubmitSocraticTurn2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turn2Text.trim()) return;

    soundEngine.playSnap();
    const { followUpFeedback, temperament } = evaluateSocraticTurn2(userText, turn2Text, dilemma);
    setTurn2Feedback(followUpFeedback);
    setTemperamentProfile(temperament);

    try {
      const stored = localStorage.getItem('testament_dilemma_answers');
      const answers = stored ? JSON.parse(stored) : {};
      answers[dilemma.id] = {
        ...(answers[dilemma.id] || {}),
        userText,
        selectedFeeling,
        evaluationResult,
        turn2Text,
        turn2Feedback: followUpFeedback,
        temperamentProfile: temperament
      };
      localStorage.setItem('testament_dilemma_answers', JSON.stringify(answers));
    } catch (err) {
      console.warn('Failed to save turn 2 answer', err);
    }

    soundEngine.playVictory();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#fbbf24', '#34d399']
    });
    onRewardXP(40);
  };

  const handleSpeakScripture = () => {
    if (isSpeakingScripture) {
      soundEngine.stopSpeaking();
      setIsSpeakingScripture(false);
      return;
    }

    setIsSpeakingScripture(true);
    const audioText = `${dilemma.anchorScripture.reference}. ${dilemma.anchorScripture.text}. The takeaway: ${dilemma.anchorScripture.streetMeaning}`;
    soundEngine.speakVerse(audioText, () => {
      setIsSpeakingScripture(false);
    });
  };

  const handleSelectPlaybookCard = (playId: string, isRecommended: boolean) => {
    soundEngine.playSnap();
    setRevealedPlayId(playId);

    if (isRecommended && !completedDilemmas.includes(dilemma.id)) {
      soundEngine.playVictory();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#ea580c', '#f59e0b', '#10b981']
      });
      const updated = [...completedDilemmas, dilemma.id];
      setCompletedDilemmas(updated);
      localStorage.setItem('testament_completed_dilemmas', JSON.stringify(updated));
      onRewardXP(40);
      window.dispatchEvent(new CustomEvent('testament-dilemma-completed', { detail: { dilemmaId: dilemma.id } }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-36 sm:pb-40 md:pb-48 text-left">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Real-Life Tactical Simulator</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50">
          "What’s the Play?"
        </h1>
        <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
          High-pressure moments adults face every week. Write your honest gut reaction, uncover where your heart is really at, and redirect your energy with the King’s Playbook.
        </p>
      </div>

      {/* Category Filter Pills & Single Campaign Dilemma Focus (Requirement 6) */}
      {isCampaignFocus ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-stone-50 dark:from-amber-950/60 dark:to-stone-900 border border-amber-300 dark:border-amber-500/50 mb-6 shadow-sm dark:shadow-md transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎯</span>
            <div>
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Today's Daily Campaign Dilemma • 1 of 1 Daily Scenario
              </span>
              <span className="text-xs text-stone-600 dark:text-stone-400">
                Sharpening your real-world wisdom for today's assignment.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCampaignFocus(false)}
            className="text-xs text-amber-700 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2 transition-colors font-semibold"
          >
            Browse All Scenarios (Free Roam)
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Dilemma categories">
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1 pl-1">
                <Filter className="w-3 h-3 text-amber-600 dark:text-amber-500" /> Category:
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory(cat);
                    const firstInCat = REAL_LIFE_DILEMMAS.find(d => cat === 'All' || d.category === cat);
                    if (firstInCat) handleSelectDilemma(firstInCat.id);
                  }}
                  className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-amber-500 shadow-xs ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {cat} {cat === 'All' ? `(${REAL_LIFE_DILEMMAS.length})` : ''}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                handleSelectDilemma(dailyDilemma.id);
                setIsCampaignFocus(true);
              }}
              className="text-xs font-mono text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-bold shrink-0 ml-auto pb-2"
            >
              Focus on Daily Campaign (1 Dilemma)
            </button>
          </div>

          {/* Scenario Horizontal Selector */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {filteredDilemmas.map(d => {
              const isSelected = dilemma.id === d.id;
              const isDone = completedDilemmas.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => handleSelectDilemma(d.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-xs ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-400 border-amber-400 dark:border-amber-500/60 font-bold shadow-sm'
                      : 'bg-white dark:bg-[#12151c] border-stone-200 dark:border-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  {d.id === dailyDilemma.id && <span className="text-amber-600 dark:text-amber-400 text-xs shrink-0" title="Today's Featured Scenario">★</span>}
                  <span>{d.title}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Main Dilemma Briefing Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#12151c] border-2 border-stone-200 dark:border-stone-800 mb-6 shadow-md dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/50 px-2.5 py-0.5 rounded-full">
              {dilemma.category}
            </span>
            {dilemma.id === getDailyDilemma().id && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/60 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Today's Daily Dilemma</span>
              </span>
            )}
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Scenario #{REAL_LIFE_DILEMMAS.findIndex(x => x.id === dilemma.id) + 1} of {REAL_LIFE_DILEMMAS.length}
            </span>
          </div>

          {completedDilemmas.includes(dilemma.id) && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/50 px-3 py-1 rounded-full shadow-xs">
              <Award className="w-3.5 h-3.5" />
              <span>Dilemma Completed (+50 XP)</span>
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-3xl font-serif font-black text-stone-900 dark:text-parchment-50 mb-3">
          {dilemma.title}
        </h2>

        {/* The Situation */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800/90 text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-reading mb-4 shadow-xs">
          <strong className="text-amber-700 dark:text-amber-400 block font-sans font-bold text-xs uppercase tracking-wider mb-1">
            The Incident:
          </strong>
          {dilemma.situationSetup}
        </div>

        {/* Stakes & Ancient Parallel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-stone-600 dark:text-stone-400 font-bold block mb-1">⚠️ What’s On The Line:</span>
            <p className="text-stone-700 dark:text-stone-300">{dilemma.whatIsAtStake}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 shadow-xs">
            <span className="text-amber-800 dark:text-amber-400 font-bold block mb-1">
              📜 Ancient Precedent: {dilemma.biblicalParallel.hero}
            </span>
            <p className="text-amber-950/90 dark:text-amber-200/90">{dilemma.biblicalParallel.event}</p>
          </div>
        </div>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="flex items-center gap-3 mb-6 p-1.5 bg-stone-100 dark:bg-stone-900/90 rounded-2xl border border-stone-200 dark:border-stone-800 max-w-md shadow-xs">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveMode('heart_check');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'heart_check'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>My Real Answer (Heart Check)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveMode('playbook');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'playbook'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>The Playbook (Compare)</span>
        </button>
      </div>

      {/* MODE 1: HEART CHECK (FREE TEXT ANSWER) */}
      {activeMode === 'heart_check' && (
        <div className="space-y-6">
          {/* Question / Input Form */}
          <form onSubmit={handleSubmitHeartCheck} className="p-6 rounded-2xl bg-white dark:bg-[#141822] border-2 border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-lg transition-colors">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>What Would YOU Honestly Do?</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Be 100% authentic. No church answers or polite filters required. How would you actually react in this exact moment?
              </p>
            </div>

            {/* Quick Feeling Selector */}
            <div className="mb-4">
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
                Quick Emotional Gut Reaction:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Furious / Want Payback', color: 'border-red-300 dark:border-red-600/60 bg-red-100/70 dark:bg-red-950/40 text-red-800 dark:text-red-300' },
                  { label: 'Walk Away / Ghost', color: 'border-amber-300 dark:border-amber-600/60 bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' },
                  { label: 'Shut Down / Bottle It', color: 'border-blue-300 dark:border-blue-600/60 bg-blue-100/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' },
                  { label: 'Panicking / Tempted', color: 'border-purple-300 dark:border-purple-600/60 bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300' },
                  { label: 'Calm & Strategic', color: 'border-emerald-300 dark:border-emerald-600/60 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' }
                ].map(feeling => (
                  <button
                    type="button"
                    key={feeling.label}
                    onClick={() => handleQuickFeelingSelect(feeling.label)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      selectedFeeling === feeling.label
                        ? `${feeling.color} ring-2 ring-amber-500 font-bold scale-105 shadow-xs`
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {feeling.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Freeform Textarea */}
            <div className="mb-4">
              <label htmlFor="gut-reaction-input" className="sr-only">
                Your authentic gut reaction
              </label>
              <textarea
                id="gut-reaction-input"
                value={userText}
                onChange={e => setUserText(e.target.value)}
                placeholder="Type your unvarnished reaction here... (e.g. 'I’d be furious. I’d corner him after the meeting, call him a liar, or pull the VP aside and show the email receipts...')"
                rows={4}
                className="w-full p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 transition-all font-sans leading-relaxed shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {userText.length > 0 ? `${userText.length} characters typed` : 'Write a sentence or pick a gut reaction'}
              </span>

              <button
                type="submit"
                disabled={!userText.trim() && !selectedFeeling}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  userText.trim() || selectedFeeling
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm cursor-pointer font-extrabold'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>Submit My Play & Check My Heart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>


          {/* Heart Check Evaluation Results Card */}
          {evaluationResult && (
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#12151c] border-2 border-amber-400 dark:border-amber-500/50 shadow-xl space-y-6 transition-colors">
              {/* Stance Badge & Motivation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-widest font-bold">
                    Diagnostic Heart Check
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${evaluationResult.badgeColor}`}>
                    {evaluationResult.stanceTitle}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                  Where Your Heart Is Driving You:
                </h3>
                <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 mt-1 italic">
                  "{evaluationResult.coreMotive}"
                </p>
              </div>

              {/* Dynamic Analysis of User's Typed Words (Requirement 4) */}
              {evaluationResult.userWordsAnalysis && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/30 dark:from-amber-950/40 dark:via-stone-900 dark:to-black/60 border border-amber-300 dark:border-amber-500/50 shadow-xs dark:shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Analysis of Your Proposed Play
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold">
                        Tactic: {evaluationResult.userWordsAnalysis.primaryTactic}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                        {evaluationResult.userWordsAnalysis.detectedTone}
                      </span>
                    </div>
                  </div>

                  {evaluationResult.userWordsAnalysis.userQuoteSummary && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-stone-100 dark:bg-black/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
                      <span className="text-stone-500 dark:text-stone-400 text-[10px] font-mono uppercase tracking-wider block mb-0.5">Your Words:</span>
                      <span className="text-amber-800 dark:text-amber-200 italic font-reading">{evaluationResult.userWordsAnalysis.userQuoteSummary}</span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans mb-3">
                    {evaluationResult.directAnswerToUser}
                  </p>

                  {/* Tactical Pros & Cons */}
                  {evaluationResult.tacticalProsCons && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800/80 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
                        <strong className="text-emerald-700 dark:text-emerald-400 block mb-1 font-mono uppercase text-[10px] tracking-wider">
                          ✓ Tactical Strength
                        </strong>
                        <span className="text-stone-700 dark:text-stone-300 leading-relaxed">{evaluationResult.tacticalProsCons.strength}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-xs">
                        <strong className="text-red-700 dark:text-red-400 block mb-1 font-mono uppercase text-[10px] tracking-wider">
                          ⚠️ Critical Vulnerability
                        </strong>
                        <span className="text-stone-700 dark:text-stone-300 leading-relaxed">{evaluationResult.tacticalProsCons.vulnerability}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MULTI-TURN SOCRATIC AI: THE MENTOR'S COUNTER-CHALLENGE */}
              {evaluationResult.socraticChallenge && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-stone-50 dark:from-indigo-950/50 dark:via-[#10141f] dark:to-stone-900 border-2 border-indigo-200 dark:border-indigo-500/40 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs sm:text-sm font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                        The Mentor's Socratic Counter-Challenge (Turn 2)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/50 font-bold">
                      Discipleship Drill
                    </span>
                  </div>

                  {/* Socratic Probe */}
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-black/40 border border-indigo-200 dark:border-indigo-900/40 text-xs sm:text-sm text-stone-800 dark:text-indigo-100 font-reading leading-relaxed italic shadow-xs">
                    "{evaluationResult.socraticChallenge}"
                  </div>

                  {/* Turn 2 Interactive Form */}
                  <form onSubmit={handleSubmitSocraticTurn2} className="space-y-3">
                    <label htmlFor="turn2-input" className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
                      Your Response To This Counter-Challenge:
                    </label>
                    <textarea
                      id="turn2-input"
                      value={turn2Text}
                      onChange={e => setTurn2Text(e.target.value)}
                      placeholder="Address the challenge directly... (e.g., 'I will meet him privately at 8:30 AM before the team call. I will say: I noticed you presented the slides without mentioning our joint work...')"
                      rows={3}
                      className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all font-sans leading-relaxed shadow-inner"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-500 font-mono">
                        {turn2Text.length > 0 ? `${turn2Text.length} chars` : 'Test your tactical maturity'}
                      </span>
                      <button
                        type="submit"
                        disabled={!turn2Text.trim()}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          turn2Text.trim()
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer font-bold'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Lock In Play & Evaluate Temperament (+40 XP)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  {/* Temperament Profile Results */}
                  {temperamentProfile && (
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-black/50 border border-indigo-200 dark:border-indigo-500/50 mt-3 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider block font-bold">
                            Biblical Tactical Temperament:
                          </span>
                          <span className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-50">
                            {temperamentProfile.archetypeTitle}
                          </span>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold font-mono">
                          {temperamentProfile.archetype}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        {temperamentProfile.archetypeDescription}
                      </p>

                      {turn2Feedback && (
                        <div className="p-2.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 italic">
                          {turn2Feedback}
                        </div>
                      )}

                      {/* 4 Virtue Spectrum Bars */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px] font-mono">
                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Grace / Mercy:</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{temperamentProfile.graceScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${temperamentProfile.graceScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Truth / Steel:</span>
                            <span className="text-red-700 dark:text-red-400 font-bold">{temperamentProfile.truthScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${temperamentProfile.truthScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Prudence / Strategy:</span>
                            <span className="text-amber-700 dark:text-amber-400 font-bold">{temperamentProfile.prudenceScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${temperamentProfile.prudenceScore}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-stone-400 mb-1">
                            <span>Courage / Action:</span>
                            <span className="text-cyan-700 dark:text-cyan-400 font-bold">{temperamentProfile.courageScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${temperamentProfile.courageScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grid: Human Validation vs The Flesh Trap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Human Validation */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-xs md:text-sm shadow-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Why This Reaction Is 100% Human:</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {evaluationResult.humanValidation}
                  </p>
                </div>

                {/* The Trap */}
                <div className="p-4 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs md:text-sm shadow-xs">
                  <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>The Hidden Trap If You Pull This Trigger:</span>
                  </div>
                  <p className="text-red-900 dark:text-red-200/90 leading-relaxed">
                    {evaluationResult.theFleshTrap}
                  </p>
                </div>
              </div>

              {/* The Biblical Redirection (High Road Play) */}
              <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">
                  <Shield className="w-4 h-4" />
                  <span>The Biblical Pivot (Restrained Power):</span>
                </div>
                <p className="text-xs md:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed mb-4">
                  {evaluationResult.biblicalPlayRedirect}
                </p>

                {/* Scripture Anchor Card with Audio Button */}
                <div className="p-4 rounded-xl bg-white dark:bg-stone-950/90 border border-amber-200 dark:border-amber-900/50 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400">
                      📖 {evaluationResult.scriptureReference}
                    </span>

                    <button
                      onClick={handleSpeakScripture}
                      className="flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-amber-400 transition-all bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeakingScripture ? 'Stop Audio' : 'Listen'}</span>
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-stone-900 dark:text-stone-200 font-reading italic leading-relaxed mb-2">
                    "{evaluationResult.scriptureText}"
                  </p>

                  <p className="text-xs text-amber-800 dark:text-amber-300/90 font-sans">
                    <strong className="text-amber-700 dark:text-amber-400">Street Meaning: </strong>
                    {evaluationResult.scriptureStreetMeaning}
                  </p>
                </div>
              </div>

              {/* LIVING CANON: TACTICAL NEXUS KNOWLEDGE GRAPH */}
              <TacticalNexusCard entityId={dilemma.id} />

              {/* 3 Tactical Moves For Tomorrow */}
              <div>
                <h4 className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                  🎯 3 Tactical Battle Moves For Tomorrow Morning:
                </h4>
                <div className="space-y-2">
                  {evaluationResult.tacticalMoves.map((move, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800/80 flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed shadow-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {i + 1}
                      </span>
                      <span>{move}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setEvaluationResult(null);
                    setUserText('');
                    setSelectedFeeling(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Answering Again</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveMode('playbook');
                    }}
                    className="text-xs px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 font-bold transition-all shadow-xs"
                  >
                    Compare In Playbook
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      // pick next dilemma
                      const currentIndex = filteredDilemmas.findIndex(d => d.id === dilemma.id);
                      const nextIndex = (currentIndex + 1) % filteredDilemmas.length;
                      handleSelectDilemma(filteredDilemmas[nextIndex].id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="text-xs px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>Next Dilemma</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: THE PLAYBOOK (SIDE-BY-SIDE ANALYSIS) */}
      {activeMode === 'playbook' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Inspect The Two Playbook Options:
            </h4>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Click either play to inspect the tactical outcome
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dilemma.plays.map(play => {
              const isSelected = revealedPlayId === play.id;
              return (
                <div
                  key={play.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? play.isRecommended
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-md dark:shadow-glow-gold'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-500 shadow-md'
                      : 'bg-white dark:bg-[#141822] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        play.playType === 'The Biblical Play' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                      }`}>
                        {play.playType}
                      </span>
                      {play.isRecommended && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                          ★ Recommended
                        </span>
                      )}
                    </div>

                    <h5 className="text-base font-serif font-bold text-stone-900 dark:text-parchment-50 mb-2">
                      {play.name}
                    </h5>

                    <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                      {play.action}
                    </p>

                    {/* Revealed outcome */}
                    {isSelected && (
                      <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                        <div className="p-3 bg-stone-100 dark:bg-stone-950/80 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                          <strong className="text-stone-900 dark:text-stone-300 block mb-1">Expected Outcome: </strong>
                          <p className="text-stone-600 dark:text-stone-400">{play.outcome}</p>
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 font-reading">
                          <strong className="text-amber-800 dark:text-amber-400 block mb-1">Biblical Foundation: </strong>
                          "{play.biblicalRoot}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-200 dark:border-stone-800/60">
                    <button
                      onClick={() => handleSelectPlaybookCard(play.id, play.isRecommended)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300'
                          : play.isRecommended
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md font-bold'
                            : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span>{isSelected ? 'Analyzed' : `Select ${play.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
