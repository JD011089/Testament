import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DailyCampaignStep } from '../data/dailyCampaigns';
import { CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

interface CampaignNextTaskPromptProps {
  completedStepNumber: number;
  nextStep: DailyCampaignStep | null;
  onProceed: (step: DailyCampaignStep) => void;
  onDismiss: () => void;
}

export const CampaignNextTaskPrompt: React.FC<CampaignNextTaskPromptProps> = ({
  completedStepNumber,
  nextStep,
  onProceed,
  onDismiss
}) => {
  const { t } = useLanguage();
  if (!nextStep) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="pointer-events-auto w-full max-w-lg rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#171a24] dark:via-[#12151e] dark:to-[#0d0f16] border-2 border-amber-400 dark:border-amber-500/70 shadow-2xl p-4 sm:p-5 text-left text-stone-900 dark:text-white overflow-hidden relative"
        >
          {/* Subtle gold ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          {/* Top header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                <span>{t('nextTask.stepCompleted', { step: completedStepNumber })}</span>
              </span>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onDismiss();
              }}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Next Mission Details */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50 flex items-center justify-center text-2xl shadow-sm shrink-0">
              {nextStep.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300">
                  {nextStep.badge}
                </span>
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  {t('nextTask.stepOf', { step: nextStep.stepNumber })}
                </span>
              </div>

              <p className="text-sm sm:text-base font-serif font-bold text-stone-900 dark:text-parchment-50 truncate">
                {nextStep.title}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 truncate mt-0.5">
                {nextStep.subtitle}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onProceed(nextStep);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-98 cursor-pointer"
            >
              <span>{t('nextTask.goNext')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onDismiss();
              }}
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 text-xs font-medium transition-colors"
            >
              {t('nextTask.later')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
