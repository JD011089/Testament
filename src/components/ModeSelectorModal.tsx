import React from 'react';
import { 
  Check, 
  Hammer, 
  Repeat, 
  Mic2, 
  ShieldCheck 
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { FullPage } from './FullPage';
import type { LearnerMode } from '../types/learnerModes';

interface ModeSelectorModalProps {
  onClose: () => void;
  currentMode: LearnerMode;
  onSelectMode: (mode: LearnerMode) => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  onClose,
  currentMode,
  onSelectMode,
}) => {

  const MODES: {
    id: LearnerMode;
    title: string;
    badge: string;
    oneLiner: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'builder',
      title: 'Builder',
      badge: 'Default',
      oneLiner: 'For thinkers who test what they believe through daily decisions.',
      description: 'Make today\'s call first, discover what unfolded in scripture, and take away one concrete move.',
      icon: <Hammer aria-hidden="true" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    {
      id: 'reciter',
      title: 'Reciter',
      badge: 'Chaining Method',
      oneLiner: 'For out-loud learners who memorize through cumulative spoken reps.',
      description: 'One verse per week. Daily cumulative phrase chaining, self-grading, and instant loop-backs into your known collection.',
      icon: <Repeat aria-hidden="true" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    {
      id: 'storyteller',
      title: 'Storyteller',
      badge: 'Retell & Teach',
      oneLiner: 'For performers who retain scripture best by telling it back in their own words.',
      description: 'Decide first, view the story, then teach it back. Compare side-by-side with faithful reflection to spot what you captured.',
      icon: <Mic2 aria-hidden="true" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    }
  ];

  const handleSelect = (mode: LearnerMode) => {
    soundEngine.playSnap();
    onSelectMode(mode);
  };

  return (
    <FullPage title="Learner mode" titleId="mode-selector-title" onBack={onClose}>
      <div className="space-y-6">
        <p className="text-base text-stone-600 dark:text-stone-300">
          Choose your practice lens. You can change this anytime.
        </p>

        {/* Mode cards list */}
        <div className="mt-4 space-y-3">
          {MODES.map((mode) => {
            const isSelected = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelect(mode.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-500'
                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-500/40 bg-stone-50/70 dark:bg-stone-850/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                      {mode.icon}
                    </div>
                    <div>
                      <span className="font-serif font-bold text-base text-stone-900 dark:text-parchment-50">
                        {mode.title}
                      </span>
                      <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15">
                        {mode.badge}
                      </span>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                      <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-stone-300 dark:border-stone-700 shrink-0" />
                  )}
                </div>

                <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                  {mode.oneLiner}
                </p>

                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer reassurance */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck aria-hidden="true" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Progress in every mode is saved on this device.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-parchment-50 py-1 px-2 cursor-pointer"
          >
            Keep current
          </button>
        </div>
      </div>
    </FullPage>
  );
};
