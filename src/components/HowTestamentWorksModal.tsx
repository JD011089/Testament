import React from 'react';
import { X, ShieldCheck, BookOpen, Sparkles, Lock, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HowTestamentWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowTestamentWorksModal: React.FC<HowTestamentWorksModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playClick();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div 
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 text-left transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                Trust & Transparency
              </span>
            </div>
            <h2 id="how-it-works-title" className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-parchment-50">
              How Testament Works
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Pillar 1: Scripture Translation Default */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-parchment-100">
              1. Scripture Translation Default
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed pl-10">
            Scripture defaults to the <strong className="text-stone-900 dark:text-stone-100">Christian Standard Bible (CSB)</strong> for faithful accuracy in clear modern English. Every verse card includes a 1-tap toggle to compare directly with the <strong className="text-stone-900 dark:text-stone-100">King James Version (KJV)</strong>.
          </p>
        </div>

        {/* Pillar 2: AI Guardrails & Verbatim Scripture */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-parchment-100">
              2. Strict AI Guardrails
            </h3>
          </div>
          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed pl-10 space-y-1.5">
            <p>
              AI is strictly governed by non-negotiable rules designed with pastoral oversight:
            </p>
            <ul className="space-y-1 list-none pl-0">
              <li className="flex items-start gap-2">
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Scripture is never invented or paraphrased as text.</strong> Biblical verses are presented verbatim from approved translations.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Every AI sentence is clearly badged</strong> with <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400">"✨ AI reflection • Not Scripture"</span> so there is never ambiguity.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Verbatim user reflection:</strong> The app quotes your exact words without paraphrasing or twisting what you chose.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No preaching or guilt-tripping:</strong> Tone is invitational, observational, and grounded in biblical history.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 3: Passage Vetting Process */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-parchment-100">
              3. Curated Passage Vetting
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed pl-10">
            Passages are not randomly scraped from the internet. Every story journey and daily mission passage is hand-curated from historical biblical narratives across the Old and New Testaments, verified for historical context, and grounded in core Christian orthodoxy.
          </p>
        </div>

        {/* Pillar 4: Privacy Note */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Lock aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-parchment-100">
              4. Privacy & Your Data
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed pl-10">
            Your decision responses, reflections, notes, and progress stay stored on your local device. We do not sell personal data, profile your beliefs, or share your private spiritual journey.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
