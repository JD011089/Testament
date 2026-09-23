import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RotateCcw,
  BookOpen,
  Zap,
  SlidersHorizontal,
  Flame,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PROVERB_SCENARIOS, 
  PROVERB_CATEGORIES, 
  type ProverbCategory 
} from '../data/proverbs';
import { soundEngine } from '../utils/audio';

interface ProverbsCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onRewardXP?: (xp: number) => void;
}

export const ProverbsCodexModal: React.FC<ProverbsCodexModalProps> = ({
  isOpen,
  onClose,
  onOpenWordForge,
  onSetMemoryVerse,
  onRewardXP
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'vault'>('simulator');
  const [selectedCategory, setSelectedCategory] = useState<ProverbCategory | 'all'>('all');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Record<string, boolean>>({});
  const [translationMode, setTranslationMode] = useState<Record<string, 'street' | 'formal'>>({});

  const scenarios = selectedCategory === 'all' 
    ? PROVERB_SCENARIOS 
    : PROVERB_SCENARIOS.filter(s => s.category === selectedCategory);

  const currentScenario = scenarios[currentScenarioIndex] || scenarios[0];
  const isOptionSelected = selectedOptionId !== null;
  const chosenOption = currentScenario.dilemma.options.find(o => o.id === selectedOptionId);

  const handleSelectOption = (optionId: string, isWise: boolean) => {
    if (selectedOptionId) return; // Prevent double pick
    setSelectedOptionId(optionId);

    if (isWise) {
      soundEngine.playVictory();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (!completedScenarios[currentScenario.id]) {
        setCompletedScenarios(prev => ({ ...prev, [currentScenario.id]: true }));
        onRewardXP?.(currentScenario.xpReward);
      }
    } else {
      soundEngine.playSnap();
    }
  };

  const handleNextScenario = () => {
    soundEngine.playClick();
    setSelectedOptionId(null);
    setCurrentScenarioIndex(prev => (prev + 1) % scenarios.length);
  };

  const handlePrevScenario = () => {
    soundEngine.playClick();
    setSelectedOptionId(null);
    setCurrentScenarioIndex(prev => (prev - 1 + scenarios.length) % scenarios.length);
  };

  const toggleTranslation = (scenarioId: string) => {
    soundEngine.playClick();
    setTranslationMode(prev => ({
      ...prev,
      [scenarioId]: prev[scenarioId] === 'formal' ? 'street' : 'formal'
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#0b0e14] border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-glow-gold overflow-hidden my-auto max-h-[94vh] flex flex-col text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-[#121620] to-stone-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-serif font-black text-parchment-50 leading-tight">
                    Proverbs Tactical Codex
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold uppercase tracking-wider">
                    Solomon's Playbook
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400">
                  Street-smart intelligence for money, meetings, ego, and high-stakes dilemmas
                </p>
              </div>
            </div>

            {/* Mode Switcher & Close */}
            <div className="flex items-center gap-2">
              <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('simulator');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'simulator'
                      ? 'bg-amber-500 text-black shadow-glow-amber'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Dilemma Simulator</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('vault');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'vault'
                      ? 'bg-amber-500 text-black shadow-glow-amber'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tactical Vault ({PROVERB_SCENARIOS.length})</span>
                </button>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Category Selector */}
          <div className="px-4 py-2.5 border-b border-stone-800/80 bg-stone-950/70 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[11px] font-mono text-stone-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-500" />
              <span>Arena:</span>
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory('all');
                setCurrentScenarioIndex(0);
                setSelectedOptionId(null);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              All Arenas
            </button>
            {(Object.keys(PROVERB_CATEGORIES) as ProverbCategory[]).map((cat) => {
              const info = PROVERB_CATEGORIES[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory(cat);
                    setCurrentScenarioIndex(0);
                    setSelectedOptionId(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {activeTab === 'simulator' ? (
              /* MODE 1: THE TACTICAL DILEMMA SIMULATOR */
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Scenario Navigation Header */}
                <div className="flex items-center justify-between text-xs font-mono text-stone-400 border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">
                      Case #{currentScenarioIndex + 1} of {scenarios.length}
                    </span>
                    <span>•</span>
                    <span className="text-stone-300 font-semibold flex items-center gap-1">
                      {PROVERB_CATEGORIES[currentScenario.category]?.icon} {PROVERB_CATEGORIES[currentScenario.category]?.label}
                    </span>
                  </div>
                  {completedScenarios[currentScenario.id] && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Solved (+{currentScenario.xpReward} XP)</span>
                    </span>
                  )}
                </div>

                {/* Scenario Card */}
                <div className="p-5 rounded-2xl bg-[#121620] border border-amber-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold">
                      Real-World Battlefield Situation
                    </span>
                    <span className="text-xs font-serif font-bold text-amber-300">
                      {currentScenario.reference}
                    </span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-serif font-black text-parchment-50 mb-3 leading-snug">
                    {currentScenario.title}
                  </h4>

                  <p className="text-sm text-parchment-200 leading-relaxed mb-4 bg-black/40 p-3.5 rounded-xl border border-stone-800">
                    "{currentScenario.dilemma.situation}"
                  </p>

                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>{currentScenario.dilemma.question}</span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentScenario.dilemma.options.map((opt, idx) => {
                      const isPicked = selectedOptionId === opt.id;
                      let optionClasses = 'bg-stone-900/90 border-stone-800 text-stone-200 hover:border-amber-500/60';
                      if (isPicked) {
                        optionClasses = opt.isWise
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40 shadow-glow-gold'
                          : 'bg-rose-950/70 border-rose-500 text-rose-100 ring-2 ring-rose-500/40';
                      } else if (isOptionSelected && opt.isWise) {
                        optionClasses = 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300';
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id, opt.isWise)}
                          disabled={isOptionSelected}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm font-medium leading-snug flex items-start gap-3 ${optionClasses}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-black/40 border border-stone-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{opt.label}</span>
                          {isPicked && (
                            opt.isWise 
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Solomon Intelligence Debrief (Revealed after selection) */}
                  <AnimatePresence>
                    {isOptionSelected && chosenOption && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-5 pt-4 border-t border-stone-800 space-y-3"
                      >
                        {/* Option Feedback */}
                        <div className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                          chosenOption.isWise
                            ? 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                            : 'bg-rose-950/50 border-rose-700 text-rose-200'
                        }`}>
                          <strong className="block mb-1 font-mono uppercase tracking-wider text-[11px]">
                            {chosenOption.isWise ? '⚔️ Tactical Victory' : '⚠️ Tactical Misstep'}
                          </strong>
                          {chosenOption.feedback}
                        </div>

                        {/* Scripture Anchor & Solomon's Briefing */}
                        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-left space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                            <span className="font-bold flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Solomon’s Intelligence Briefing</span>
                            </span>
                            <span className="text-[11px] underline cursor-pointer" onClick={() => toggleTranslation(currentScenario.id)}>
                              {translationMode[currentScenario.id] === 'formal' ? 'View Street Breakdown' : 'View Formal Text'}
                            </span>
                          </div>

                          <blockquote className="text-xs sm:text-sm font-serif italic text-parchment-100 border-l-2 border-amber-500 pl-3 my-2">
                            "{translationMode[currentScenario.id] === 'formal' ? currentScenario.formalText : currentScenario.streetTranslation}"
                          </blockquote>

                          <p className="text-xs text-parchment-200/90 leading-relaxed">
                            {currentScenario.solomonBriefing}
                          </p>

                          <div className="text-[11px] font-mono text-amber-300 font-semibold pt-1">
                            Rule of Thumb: {currentScenario.keyTakeaway}
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-2">
                            {onOpenWordForge && (
                              <button
                                onClick={() => {
                                  soundEngine.playClick();
                                  onClose();
                                  onOpenWordForge(currentScenario.id);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-amber-400 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Brain className="w-3.5 h-3.5 text-amber-400" />
                                <span>Lock in Word Forge</span>
                              </button>
                            )}

                            {onSetMemoryVerse && (
                              <button
                                onClick={() => {
                                  soundEngine.playClick();
                                  onSetMemoryVerse(currentScenario.id);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-amber-400 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Bell className="w-3.5 h-3.5 text-amber-400" />
                                <span>Train with Daily Pulse</span>
                              </button>
                            )}
                          </div>

                          <button
                            onClick={handleNextScenario}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-glow-amber ml-auto transition-all"
                          >
                            <span>Next Scenario</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Scenario Prev/Next Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevScenario}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
                  >
                    ← Previous Case
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedOptionId(null);
                    }}
                    className="text-xs text-stone-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Choice</span>
                  </button>

                  <button
                    onClick={handleNextScenario}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
                  >
                    Next Case →
                  </button>
                </div>
              </div>
            ) : (
              /* MODE 2: THE TACTICAL VAULT (ALL PROVERBS) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map((item) => {
                    const isFormal = translationMode[item.id] === 'formal';
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#121620] border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between text-left space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-amber-400 border border-stone-800 font-bold">
                              {PROVERB_CATEGORIES[item.category]?.icon} {PROVERB_CATEGORIES[item.category]?.label}
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-500">
                              {item.reference}
                            </span>
                          </div>

                          <h4 className="text-sm font-serif font-black text-parchment-50 mb-2">
                            {item.title}
                          </h4>

                          <blockquote className="text-xs font-serif italic text-parchment-100/95 bg-black/40 p-2.5 rounded-xl border border-stone-850 mb-2 leading-relaxed">
                            "{isFormal ? item.formalText : item.streetTranslation}"
                          </blockquote>

                          <p className="text-[11px] text-stone-400 leading-snug">
                            {item.solomonBriefing}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-850 flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() => toggleTranslation(item.id)}
                            className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline"
                          >
                            {isFormal ? '⚡ Street Translation' : '📖 Formal Text'}
                          </button>

                          <div className="flex items-center gap-1.5 ml-auto">
                            {onOpenWordForge && (
                              <button
                                onClick={() => {
                                  soundEngine.playClick();
                                  onClose();
                                  onOpenWordForge(item.id);
                                }}
                                className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-700 transition-colors"
                                title="Practice in Word Forge"
                              >
                                <Brain className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {onSetMemoryVerse && (
                              <button
                                onClick={() => {
                                  soundEngine.playClick();
                                  onSetMemoryVerse(item.id);
                                  onClose();
                                }}
                                className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-700 transition-colors"
                                title="Train in Spaced Memory Pulse"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                const idx = scenarios.findIndex(s => s.id === item.id);
                                if (idx !== -1) setCurrentScenarioIndex(idx);
                                setSelectedOptionId(null);
                                setActiveTab('simulator');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-glow-amber flex items-center gap-1"
                            >
                              <span>Play Dilemma</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-stone-800 bg-[#090b10] flex items-center justify-between text-xs text-stone-400 shrink-0">
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Ancient wisdom stress-tested for modern high stakes</span>
            </span>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 text-xs font-semibold border border-stone-700"
            >
              Close Codex
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
