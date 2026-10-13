import React, { useEffect } from 'react';
import { 
  X, 
  Check, 
  Hammer, 
  Repeat, 
  Mic2, 
  ShieldCheck 
} from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';
import { soundEngine } from '../utils/audio';
import type { LearnerMode } from '../types/learnerModes';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: LearnerMode;
  onSelectMode: (mode: LearnerMode) => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  const modalRef = useModalLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-selector-title"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 my-auto text-left relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/70 dark:border-stone-800/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                Learner Modes
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Changeable anytime
              </span>
            </div>
            <h2 id="mode-selector-title" className="text-xl font-serif font-black text-stone-900 dark:text-parchment-50 mt-0.5">
              Choose your practice lens
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-parchment-50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close learner modes"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

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
    </div>
  );
};
