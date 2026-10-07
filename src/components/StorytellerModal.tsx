import React, { useState } from 'react';
import { 
  X, 
  Check, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { useModalLock } from '../utils/useModalLock';
import { soundEngine } from '../utils/audio';
import { saveStorytellerEntry } from '../utils/learnerModes';

interface StorytellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  passageReference: string;
  heroName: string;
  faithfulRetelling: string[]; // Faithful story retelling from the daily mission
  onCompleted?: () => void;
  todayDateKey: string;
}

export const StorytellerModal: React.FC<StorytellerModalProps> = ({
  isOpen,
  onClose,
  passageReference,
  heroName,
  faithfulRetelling,
  onCompleted,
  todayDateKey
}) => {
  const modalRef = useModalLock(isOpen);
  const [userText, setUserText] = useState<string>('');
  const [step, setStep] = useState<'prompt' | 'compare'>('prompt');
  const [capturedTags, setCapturedTags] = useState<Record<number, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const faithfulFullText = faithfulRetelling.join(' ');

  const handleAdvanceToCompare = () => {
    if (!userText.trim()) return;
    soundEngine.playSnap();
    setStep('compare');
  };

  const toggleTag = (index: number) => {
    soundEngine.playClick();
    setCapturedTags(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSaveAndFinish = () => {
    const captured: string[] = [];
    const missed: string[] = [];

    faithfulRetelling.forEach((paragraph, idx) => {
      if (capturedTags[idx]) {
        captured.push(paragraph);
      } else {
        missed.push(paragraph);
      }
    });

    saveStorytellerEntry({
      dateKey: todayDateKey,
      passageReference,
      heroName,
      userRetelling: userText.trim(),
      faithfulRetelling: faithfulFullText,
      capturedPoints: captured,
      missedPoints: missed
    });

    soundEngine.playVictory();
    setSavedSuccess(true);
    if (onCompleted) onCompleted();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storyteller-modal-title"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 my-auto text-left relative flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-800/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                Storyteller Mode • Retell & Teach
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                {step === 'prompt' ? 'Step 1 of 2: In Your Words' : 'Step 2 of 2: Side-by-Side'}
              </span>
            </div>
            <h2 id="storyteller-modal-title" className="text-xl font-serif font-black text-stone-900 dark:text-parchment-50 mt-0.5">
              Tell {heroName}'s story back in your own words
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-parchment-50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close storyteller modal"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4">
          {step === 'prompt' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200">
                <span className="font-bold block mb-1">Teaching is how the story sticks.</span>
                Imagine you are explaining what just happened in {passageReference} to a friend or coworker who has never opened a Bible. Don't worry about sounding religious—use your own raw, honest voice.
              </div>

              <div>
                <label 
                  htmlFor="user-retelling-input"
                  className="block text-xs font-serif font-bold text-stone-900 dark:text-parchment-100 mb-1.5"
                >
                  Your retelling:
                </label>
                <textarea
                  id="user-retelling-input"
                  rows={6}
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Start with the conflict: where was he, what backed him into a corner, and what did he actually do?..."
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-parchment-100 placeholder-stone-400 focus:ring-1 focus:ring-amber-500 outline-hidden transition-all"
                />
              </div>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your words are saved private to this device only.</span>
              </p>
            </div>
          ) : (
            /* Compare Side-by-Side Step */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-850/60 text-xs">
                <span className="font-serif font-bold text-stone-900 dark:text-parchment-50 block mb-0.5">
                  Side-by-Side Review
                </span>
                <span className="text-stone-600 dark:text-stone-300">
                  Compare your spoken recall with the app's faithful retelling. Tap each beat you captured.
                </span>
              </div>

              {/* Side by side columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Column 1: User's Words */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                      Your Retelling
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      Verbatim input
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif text-stone-800 dark:text-parchment-100 leading-relaxed italic whitespace-pre-wrap flex-1">
                    "{userText}"
                  </p>
                </div>

                {/* Column 2: App's Faithful Retelling with Reflection Badge */}
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 dark:text-amber-300 font-bold">
                      Faithful Retelling
                    </span>
                    {/* Non-negotiable AI reflection badge */}
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400" role="note" aria-label="AI reflection, Not Scripture">
                      <span aria-hidden="true">✨ </span>AI reflection • Not Scripture
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {faithfulRetelling.map((paragraph, idx) => {
                      const isCaptured = Boolean(capturedTags[idx]);
                      return (
                        <div 
                          key={idx}
                          onClick={() => toggleTag(idx)}
                          className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            isCaptured
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-stone-900 dark:text-parchment-50 font-medium'
                              : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="leading-snug">{paragraph}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 font-bold ${
                              isCaptured ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                            }`}>
                              {isCaptured ? 'Captured ✓' : 'Tap if captured'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0" />
                  <span>Your retelling has been saved to your personal storytelling log on this device.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 mt-1 border-t border-stone-200/70 dark:border-stone-800/70 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {step === 'prompt' ? 'Step 1: Write in your natural voice' : 'Step 2: Mark beats you captured'}
          </span>

          <div className="flex items-center gap-2">
            {step === 'prompt' ? (
              <button
                type="button"
                disabled={!userText.trim()}
                onClick={handleAdvanceToCompare}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  userText.trim()
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Compare Side-by-Side</span>
              </button>
            ) : !savedSuccess ? (
              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save Retelling</span>
                <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
