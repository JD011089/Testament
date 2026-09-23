import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DAILY_CAMPAIGNS, 
  getTodayDailyCampaign, 
  getDailyCampaignProgress,
  markCampaignStepCompleted,
  claimCampaignCompletionBonus
} from '../data/dailyCampaigns';
import type { DailyCampaign, DailyCampaignStep, DailyCampaignProgress } from '../data/dailyCampaigns';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  ChevronRight, 
  Compass, 
  X,
  Flame
} from 'lucide-react';

interface DailyCampaignCardProps {
  onLaunchStep: (step: DailyCampaignStep) => void;
  onRewardXP: (amount: number) => void;
}

export const DailyCampaignCard: React.FC<DailyCampaignCardProps> = ({
  onLaunchStep,
  onRewardXP
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => {
    return getTodayDailyCampaign().id;
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [progress, setProgress] = useState<DailyCampaignProgress>(() => {
    return getDailyCampaignProgress(selectedCampaignId);
  });

  const activeCampaign: DailyCampaign = DAILY_CAMPAIGNS.find(c => c.id === selectedCampaignId) || getTodayDailyCampaign();

  // Sync progress when selected campaign changes or window triggers update
  useEffect(() => {
    const handleProgressUpdate = () => {
      setProgress(getDailyCampaignProgress(selectedCampaignId));
    };

    handleProgressUpdate();
    window.addEventListener('testament-campaign-updated', handleProgressUpdate);
    return () => window.removeEventListener('testament-campaign-updated', handleProgressUpdate);
  }, [selectedCampaignId]);

  // Handle victory confetti and bonus XP when 4/4 completed
  useEffect(() => {
    if (progress.isFullyCompleted && !progress.bonusClaimed) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
      soundEngine.playVictory();
      onRewardXP(activeCampaign.bonusXP);
      claimCampaignCompletionBonus(selectedCampaignId);
      window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
    }
  }, [progress.isFullyCompleted, progress.bonusClaimed, activeCampaign.bonusXP, selectedCampaignId, onRewardXP]);

  const completedCount = progress.completedSteps.length;
  const percent = Math.round((completedCount / 4) * 100);

  // Determine current active step (first uncompleted step)
  const currentActiveStepNumber = [1, 2, 3, 4].find(num => !progress.completedSteps.includes(num)) || 4;

  const handleStepClick = (step: DailyCampaignStep) => {
    soundEngine.playClick();
    onLaunchStep(step);
  };

  const handleManualMarkStep = (stepNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playSnap();
    const updated = markCampaignStepCompleted(selectedCampaignId, stepNumber);
    setProgress(updated);
    onRewardXP(30);
    window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#171b24] via-[#10131b] to-[#0c0e14] border-2 border-amber-500/50 shadow-2xl p-5 sm:p-7 text-left overflow-hidden">
      {/* Ambient background gold glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-stone-800/90">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-950/80 to-stone-900 border-2 border-amber-500/60 flex items-center justify-center text-3xl shadow-glow-amber shrink-0">
            {activeCampaign.heroIcon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center gap-1">
                <Target className="w-3 h-3 text-amber-400" />
                <span>Today’s Tactical Campaign</span>
              </span>
              <span className="text-xs font-mono text-stone-400">
                • {activeCampaign.heroName} Track
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-black text-parchment-50 leading-tight">
              {activeCampaign.title}
            </h3>

            <p className="text-xs sm:text-sm text-amber-300/90 font-medium italic mt-0.5">
              Virtue: {activeCampaign.virtueTheme}
            </p>
          </div>
        </div>

        {/* Right Action: Track Selector & Reward Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsSelectorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-amber-300 transition-all text-xs font-semibold"
            title="Choose a different hero's campaign track"
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Switch Track (14)</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>+{activeCampaign.bonusXP} XP</span>
          </div>
        </div>
      </div>

      {/* MISSION BRIEFING TEASER */}
      <p className="relative z-10 text-xs sm:text-sm text-stone-300/90 leading-relaxed mt-4 mb-5">
        {activeCampaign.summary}
      </p>

      {/* PROGRESS TRACKER BAR */}
      <div className="relative z-10 bg-black/40 p-4 rounded-2xl border border-stone-800/80 mb-6">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              Mission Progression
            </span>
            <span className="text-stone-400">
              ({completedCount} of 4 Objectives Completed)
            </span>
          </div>
          <span className="font-bold text-parchment-100">{percent}%</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-stone-900 overflow-hidden border border-stone-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full shadow-glow-amber"
          />
        </div>

        {/* 4 Interactive Step Nodes */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-2">
          {activeCampaign.steps.map((step) => {
            const isDone = progress.completedSteps.includes(step.stepNumber);
            const isCurrent = step.stepNumber === currentActiveStepNumber && !isDone;

            return (
              <button
                key={step.stepNumber}
                onClick={() => handleStepClick(step)}
                className={`flex flex-col items-center gap-1 text-center py-1.5 px-1 rounded-xl transition-all ${
                  isDone 
                    ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-800/40' 
                    : isCurrent 
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/50 shadow-glow-amber' 
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  isDone 
                    ? 'bg-emerald-500 text-black' 
                    : isCurrent 
                    ? 'bg-amber-500 text-black animate-pulse' 
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {isDone ? '✓' : step.stepNumber}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider truncate w-full">
                  {step.type === 'quest' ? '1. Story' : step.type === 'dilemma' ? '2. Dilemma' : step.type === 'wordforge' ? '3. Forge' : '4. Codex'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ALL 4 MISSION STEP CARDS */}
      <div className="relative z-10 space-y-3.5">
        {activeCampaign.steps.map((step) => {
          const isDone = progress.completedSteps.includes(step.stepNumber);
          const isCurrent = step.stepNumber === currentActiveStepNumber && !isDone;

          return (
            <div 
              key={step.stepNumber}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDone 
                  ? 'bg-[#101614]/80 border-emerald-900/40 opacity-85' 
                  : isCurrent 
                  ? 'bg-gradient-to-r from-[#1c2230] via-[#141926] to-[#121622] border-amber-500/70 shadow-glow-amber ring-1 ring-amber-500/30' 
                  : 'bg-stone-900/60 border-stone-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5 ${
                    isDone 
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60' 
                      : isCurrent 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60' 
                      : 'bg-stone-850 text-stone-400 border border-stone-800'
                  }`}>
                    {isDone ? '✓' : step.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isDone 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                          : isCurrent 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-stone-800 text-stone-400'
                      }`}>
                        {step.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold animate-pulse flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          <span>Current Objective</span>
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          Completed (+30 XP)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-serif font-bold text-parchment-50">
                      {step.subtitle}
                    </h4>

                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      {step.intel}
                    </p>
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isDone 
                        ? 'bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700' 
                        : isCurrent 
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-glow-gold' 
                        : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <span>{isDone ? 'Review' : step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {!isDone && (
                    <button
                      onClick={(e) => handleManualMarkStep(step.stepNumber, e)}
                      className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-emerald-400 border border-stone-800 transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CELEBRATION BANNER (All 4 Steps Conquered) */}
      {progress.isFullyCompleted && (
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-amber-950/50 border border-emerald-500/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Daily Campaign Conquered!
              </div>
              <p className="text-xs text-parchment-100">
                You executed all 4 tactical phases of {activeCampaign.heroName}'s campaign today (+{activeCampaign.bonusXP} XP).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsSelectorOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Choose Next Campaign</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TRACK SELECTOR MODAL */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#12151d] border border-amber-500/40 shadow-2xl p-6 flex flex-col text-left overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-lg font-serif font-bold text-parchment-100">
                    Select Tactical Campaign Track
                  </h3>
                  <p className="text-xs text-stone-400">
                    Choose from 14 curated multi-step battle tracks
                  </p>
                </div>
                <button
                  onClick={() => setIsSelectorOpen(false)}
                  className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-2.5 scrollbar-thin">
                {DAILY_CAMPAIGNS.map((c) => {
                  const isSelected = c.id === selectedCampaignId;
                  const cProgress = getDailyCampaignProgress(c.id);

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedCampaignId(c.id);
                        setIsSelectorOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                        isSelected 
                          ? 'bg-amber-500/15 border-amber-500 text-parchment-50 shadow-glow-amber' 
                          : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl w-10 h-10 rounded-xl bg-stone-950 flex items-center justify-center border border-stone-800 shrink-0">
                          {c.heroIcon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-serif font-bold text-parchment-100 truncate">
                              {c.title}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400">
                              • {c.heroName}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate">
                            {c.virtueTheme}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cProgress.isFullyCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 font-bold">
                            ✓ Mastered
                          </span>
                        )}
                        <span className="text-xs font-mono text-stone-400">
                          {cProgress.completedSteps.length}/4
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end">
                <button
                  onClick={() => setIsSelectorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
