import React, { useState } from 'react';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import type { RealLifeDilemma } from '../data/dilemmas';
import { evaluateUserPlay } from '../utils/heartEvaluation';
import type { HeartEvaluationResult } from '../utils/heartEvaluation';
import { soundEngine } from '../utils/audio';
import { getDailyDilemma } from '../utils/dailyEngine';
import confetti from 'canvas-confetti';
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
}

export const DilemmaSimulator: React.FC<DilemmaSimulatorProps> = ({ onRewardXP }) => {
  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string>(REAL_LIFE_DILEMMAS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMode, setActiveMode] = useState<'heart_check' | 'playbook'>('heart_check');
  
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

  const dilemma: RealLifeDilemma = REAL_LIFE_DILEMMAS.find(d => d.id === selectedDilemmaId) || REAL_LIFE_DILEMMAS[0];

  // Reset inputs when switching dilemmas
  const handleSelectDilemma = (dilemmaId: string) => {
    soundEngine.stopSpeaking();
    setIsSpeakingScripture(false);
    soundEngine.playClick();
    setSelectedDilemmaId(dilemmaId);
    setUserText('');
    setSelectedFeeling(null);
    setEvaluationResult(null);
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-36 sm:pb-40 md:pb-48 text-left">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-500 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Real-Life Tactical Simulator</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-serif font-black text-parchment-50">
          "What’s the Play?"
        </h1>
        <p className="text-xs md:text-sm text-stone-400 mt-1 max-w-2xl">
          High-pressure moments adults face every week. Write your honest gut reaction, uncover where your heart is really at, and redirect your energy with the King’s Playbook.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none" role="tablist" aria-label="Dilemma categories">
        <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1 pl-1">
          <Filter className="w-3 h-3 text-amber-500" /> Category:
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
            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-amber-500 ${
              selectedCategory === cat
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {cat} {cat === 'All' ? `(${REAL_LIFE_DILEMMAS.length})` : ''}
          </button>
        ))}
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
              className={`text-xs px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-stone-800 text-amber-400 border-amber-500/60 font-bold shadow-md'
                  : 'bg-[#12151c] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {d.id === getDailyDilemma().id && <span className="text-amber-400 text-xs shrink-0" title="Today's Featured Scenario">★</span>}
              <span>{d.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dilemma Briefing Card */}
      <div className="p-6 rounded-2xl bg-[#12151c] border-2 border-stone-800 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded-full">
              {dilemma.category}
            </span>
            {dilemma.id === getDailyDilemma().id && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/60 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Today's Daily Dilemma</span>
              </span>
            )}
            <span className="text-xs text-stone-400 font-mono">
              Scenario #{REAL_LIFE_DILEMMAS.findIndex(x => x.id === dilemma.id) + 1} of {REAL_LIFE_DILEMMAS.length}
            </span>
          </div>

          {completedDilemmas.includes(dilemma.id) && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-3 py-1 rounded-full shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>Dilemma Completed (+50 XP)</span>
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-3xl font-serif font-black text-parchment-50 mb-3">
          {dilemma.title}
        </h2>

        {/* The Situation */}
        <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 text-sm text-stone-200 leading-relaxed font-reading mb-4">
          <strong className="text-amber-400 block font-sans font-bold text-xs uppercase tracking-wider mb-1">
            The Incident:
          </strong>
          {dilemma.situationSetup}
        </div>

        {/* Stakes & Ancient Parallel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800">
            <span className="text-stone-400 font-bold block mb-1">⚠️ What’s On The Line:</span>
            <p className="text-stone-300">{dilemma.whatIsAtStake}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
            <span className="text-amber-400 font-bold block mb-1">
              📜 Ancient Precedent: {dilemma.biblicalParallel.hero}
            </span>
            <p className="text-amber-200/90">{dilemma.biblicalParallel.event}</p>
          </div>
        </div>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="flex items-center gap-3 mb-6 p-1.5 bg-stone-900/90 rounded-2xl border border-stone-800 max-w-md">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveMode('heart_check');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'heart_check'
              ? 'bg-amber-600 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-stone-200'
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
              ? 'bg-amber-600 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-stone-200'
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
          <form onSubmit={handleSubmitHeartCheck} className="p-6 rounded-2xl bg-[#141822] border-2 border-stone-800 shadow-lg">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-serif font-bold text-parchment-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>What Would YOU Honestly Do?</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Be 100% authentic. No church answers or polite filters required. How would you actually react in this exact moment?
              </p>
            </div>

            {/* Quick Feeling Selector */}
            <div className="mb-4">
              <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
                Quick Emotional Gut Reaction:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Furious / Want Payback', color: 'border-red-600/60 bg-red-950/40 text-red-300' },
                  { label: 'Walk Away / Ghost', color: 'border-amber-600/60 bg-amber-950/40 text-amber-300' },
                  { label: 'Shut Down / Bottle It', color: 'border-blue-600/60 bg-blue-950/40 text-blue-300' },
                  { label: 'Panicking / Tempted', color: 'border-purple-600/60 bg-purple-950/40 text-purple-300' },
                  { label: 'Calm & Strategic', color: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300' }
                ].map(feeling => (
                  <button
                    type="button"
                    key={feeling.label}
                    onClick={() => handleQuickFeelingSelect(feeling.label)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      selectedFeeling === feeling.label
                        ? `${feeling.color} ring-2 ring-amber-400 font-bold scale-105`
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
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
                className="w-full p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 transition-all font-sans leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-mono">
                {userText.length > 0 ? `${userText.length} characters typed` : 'Write a sentence or pick a gut reaction'}
              </span>

              <button
                type="submit"
                disabled={!userText.trim() && !selectedFeeling}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  userText.trim() || selectedFeeling
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-glow-gold cursor-pointer font-extrabold'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>Submit My Play & Check My Heart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Heart Check Evaluation Results Card */}
          {evaluationResult && (
            <div className="p-6 md:p-8 rounded-2xl bg-[#12151c] border-2 border-amber-500/50 shadow-2xl space-y-6">
              {/* Stance Badge & Motivation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">
                    Diagnostic Heart Check
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${evaluationResult.badgeColor}`}>
                    {evaluationResult.stanceTitle}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-serif font-bold text-parchment-50">
                  Where Your Heart Is Driving You:
                </h3>
                <p className="text-xs md:text-sm text-stone-300 mt-1 italic">
                  "{evaluationResult.coreMotive}"
                </p>
              </div>

              {/* Grid: Human Validation vs The Flesh Trap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Human Validation */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Why This Reaction Is 100% Human:</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    {evaluationResult.humanValidation}
                  </p>
                </div>

                {/* The Trap */}
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>The Hidden Trap If You Pull This Trigger:</span>
                  </div>
                  <p className="text-red-200/90 leading-relaxed">
                    {evaluationResult.theFleshTrap}
                  </p>
                </div>
              </div>

              {/* The Biblical Redirection (High Road Play) */}
              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">
                  <Shield className="w-4 h-4" />
                  <span>The Biblical Pivot (Restrained Power):</span>
                </div>
                <p className="text-xs md:text-sm text-emerald-200 leading-relaxed mb-4">
                  {evaluationResult.biblicalPlayRedirect}
                </p>

                {/* Scripture Anchor Card with Audio Button */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-900/50 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      📖 {evaluationResult.scriptureReference}
                    </span>

                    <button
                      onClick={handleSpeakScripture}
                      className="flex items-center gap-1 text-[11px] font-bold text-stone-400 hover:text-amber-400 transition-all bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeakingScripture ? 'Stop Audio' : 'Listen'}</span>
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-stone-200 font-reading italic leading-relaxed mb-2">
                    "{evaluationResult.scriptureText}"
                  </p>

                  <p className="text-xs text-amber-300/90 font-sans">
                    <strong className="text-amber-400">Street Meaning: </strong>
                    {evaluationResult.scriptureStreetMeaning}
                  </p>
                </div>
              </div>

              {/* 3 Tactical Moves For Tomorrow */}
              <div>
                <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">
                  🎯 3 Tactical Battle Moves For Tomorrow Morning:
                </h4>
                <div className="space-y-2">
                  {evaluationResult.tacticalMoves.map((move, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-lg bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5 text-xs text-stone-300 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {i + 1}
                      </span>
                      <span>{move}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setEvaluationResult(null);
                    setUserText('');
                    setSelectedFeeling(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-200 transition-all"
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
                    className="text-xs px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 font-bold transition-all"
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
                    className="text-xs px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-all flex items-center gap-1 shadow-glow-gold"
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
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-400">
              Inspect The Two Playbook Options:
            </h4>
            <span className="text-xs text-stone-500">
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
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-glow-gold'
                        : 'bg-red-950/30 border-red-500 shadow-md'
                      : 'bg-[#141822] border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        play.playType === 'The Biblical Play' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {play.playType}
                      </span>
                      {play.isRecommended && (
                        <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                          ★ Recommended
                        </span>
                      )}
                    </div>

                    <h5 className="text-base font-serif font-bold text-parchment-50 mb-2">
                      {play.name}
                    </h5>

                    <p className="text-xs md:text-sm text-stone-300 leading-relaxed mb-4">
                      {play.action}
                    </p>

                    {/* Revealed outcome */}
                    {isSelected && (
                      <div className="space-y-3 pt-3 border-t border-stone-800">
                        <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs">
                          <strong className="text-stone-300 block mb-1">Expected Outcome: </strong>
                          <p className="text-stone-400">{play.outcome}</p>
                        </div>

                        <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-900/40 text-xs text-amber-200 font-reading">
                          <strong className="text-amber-400 block mb-1">Biblical Foundation: </strong>
                          "{play.biblicalRoot}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-800/60">
                    <button
                      onClick={() => handleSelectPlaybookCard(play.id, play.isRecommended)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-800 text-stone-300'
                          : play.isRecommended
                            ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-glow-gold'
                            : 'bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300'
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
