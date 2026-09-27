import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getDailyCampaignProgress,
  claimCampaignCompletionBonus
} from '../data/dailyCampaigns';
import type { DailyCampaignStep, DailyCampaignProgress } from '../data/dailyCampaigns';
import { getComposedDailyMission } from '../utils/missionComposer';
import type { ComposedDailyMission } from '../utils/missionComposer';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Target, 
  ArrowRight, 
  Award, 
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
  const [composedMission, setComposedMission] = useState<ComposedDailyMission>(() => getComposedDailyMission());
  const [progress, setProgress] = useState<DailyCampaignProgress>(() => {
    return getDailyCampaignProgress(composedMission.id);
  });

  const activeCampaign = composedMission;
  const stepTotal = activeCampaign.steps.length;

  // Sync progress when selected campaign changes or window triggers update
  useEffect(() => {
    const handleProgressUpdate = () => {
      const nextMission = getComposedDailyMission();
      setComposedMission(nextMission);
      setProgress(getDailyCampaignProgress(nextMission.id));
    };

    handleProgressUpdate();
    window.addEventListener('testament-campaign-updated', handleProgressUpdate);
    window.addEventListener('testament-battlefield-changed', handleProgressUpdate);
    return () => {
      window.removeEventListener('testament-campaign-updated', handleProgressUpdate);
      window.removeEventListener('testament-battlefield-changed', handleProgressUpdate);
    };
  }, []);

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
      claimCampaignCompletionBonus(composedMission.id);
      window.dispatchEvent(new CustomEvent('testament-campaign-updated'));
    }
  }, [progress.isFullyCompleted, progress.bonusClaimed, activeCampaign.bonusXP, composedMission.id, onRewardXP]);

  const completedCount = progress.completedSteps.length;
  const percent = Math.round((completedCount / stepTotal) * 100);

  const currentActiveStepNumber = activeCampaign.steps
    .map(step => step.stepNumber)
    .find(num => !progress.completedSteps.includes(num)) || activeCampaign.steps[activeCampaign.steps.length - 1].stepNumber;

  const handleStepClick = (step: DailyCampaignStep) => {
    soundEngine.playClick();
    onLaunchStep(step);
  };

  return (
    <div className="relative text-left transition-colors w-full">
      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 pb-4 sm:pb-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-stone-900 dark:text-amber-300 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
            {activeCampaign.heroIcon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 flex items-center gap-1">
                <Target className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                <span>Today's Tactical Campaign</span>
              </span>
              <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                • {activeCampaign.heroName} Track
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight">
              {activeCampaign.title}
            </h2>

            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 font-medium italic mt-0.5">
              Virtue: {activeCampaign.virtueTheme}
            </p>
            <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-1">
              {composedMission.reason}
            </p>
          </div>
        </div>

        {/* Right Action: Track Selector & Reward Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>+{activeCampaign.bonusXP} XP</span>
          </div>
        </div>
      </div>

      {/* MISSION BRIEFING TEASER */}
      <p className="relative z-10 text-xs sm:text-sm text-stone-600 dark:text-stone-300/90 leading-relaxed mt-3 sm:mt-4 mb-4 sm:mb-5">
        {activeCampaign.summary}
      </p>

      {/* PROGRESS TRACKER SECTION - Clean and Unboxed */}
      <div className="relative z-10 mb-5 sm:mb-6">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
              Mission Progression
            </span>
            <span className="text-stone-500 dark:text-stone-400 text-[11px] sm:text-xs">
              ({completedCount} of {stepTotal} Objectives)
            </span>
          </div>
          <span className="font-bold text-stone-900 dark:text-parchment-100 text-xs sm:text-sm">{percent}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-stone-200/70 dark:bg-stone-800 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full"
          />
        </div>

        {/* 4 Interactive Step Nodes - Clean Stepper */}
        <div className={`grid gap-1.5 sm:gap-2 mt-3 ${stepTotal === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {activeCampaign.steps.map((step) => {
            const isDone = progress.completedSteps.includes(step.stepNumber);
            const isCurrent = step.stepNumber === currentActiveStepNumber && !isDone;

            return (
              <button
                key={step.stepNumber}
                onClick={() => handleStepClick(step)}
                className={`flex flex-col items-center gap-1 text-center py-2 px-1 rounded-xl transition-all ${
                  isDone 
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30' 
                    : isCurrent 
                    ? 'text-amber-800 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 font-bold' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100/50 dark:bg-stone-900/30'
                }`}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold ${
                  isDone 
                    ? 'bg-emerald-500 text-black' 
                    : isCurrent 
                    ? 'bg-amber-500 text-black' 
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}>
                  {isDone ? '✓' : step.stepNumber}
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider truncate w-full">
                  {step.type === 'quest' ? 'Story' : step.type === 'dilemma' ? 'Dilemma' : step.type === 'wordforge' ? 'Forge' : step.type === 'proverb' ? 'Proverb' : step.type === 'psalm' ? 'Psalm' : 'Library'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ALL 4 MISSION STEP ROWS - Flat, Seamless Native List */}
      <div className="relative z-10 divide-y divide-stone-200/60 dark:divide-stone-800/60">
        {activeCampaign.steps.map((step) => {
          const isDone = progress.completedSteps.includes(step.stepNumber);
          const isCurrent = step.stepNumber === currentActiveStepNumber && !isDone;

          return (
            <div 
              key={step.stepNumber}
              className={`py-3.5 px-2 sm:px-3.5 transition-colors ${
                isCurrent 
                  ? 'bg-amber-500/10 dark:bg-amber-500/15' 
                  : isDone
                  ? 'bg-transparent opacity-85'
                  : 'bg-transparent'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-base sm:text-lg shrink-0 mt-0.5 ${
                    isDone 
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                      : isCurrent 
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold' 
                      : 'bg-stone-200/80 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}>
                    {isDone ? '✓' : step.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isDone 
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' 
                          : isCurrent 
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300' 
                          : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}>
                        {step.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-amber-800 dark:text-amber-400" />
                          <span>Current Objective</span>
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                          Completed
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-parchment-50 truncate">
                      {step.subtitle}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {step.intel}
                    </p>
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isDone 
                        ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300' 
                        : isCurrent 
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold' 
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>{isDone ? 'Review' : step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CELEBRATION BANNER (All 4 Steps Conquered) */}
      {progress.isFullyCompleted && (
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
                Daily Campaign Conquered!
              </div>
              <p className="text-xs text-stone-700 dark:text-parchment-100">
                You finished today's {stepTotal}-step mission on {activeCampaign.heroName} (+{activeCampaign.bonusXP} XP).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
