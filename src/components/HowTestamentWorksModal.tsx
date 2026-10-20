import React from 'react';
import { ShieldCheck, BookOpen, Sparkles, Lock, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { FullPage } from './FullPage';

interface HowTestamentWorksModalProps {
  onClose: () => void;
}

export const HowTestamentWorksModal: React.FC<HowTestamentWorksModalProps> = ({
  onClose,
}) => {
  const handleClose = () => {
    soundEngine.playClick();
    onClose();
  };

  return (
    <FullPage title="How Testament works" titleId="how-it-works-title" onBack={handleClose}>
      <p className="text-sm font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
        Trust and transparency
      </p>
      <div className="space-y-8">

        {/* Pillar 1: Scripture Translation Default */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold leading-7 text-stone-900 dark:text-parchment-100">
              1. Scripture Translation Default
            </h3>
          </div>
          <p className="text-base text-stone-600 dark:text-stone-300 leading-7 pl-10">
            Scripture in the reader defaults to the <strong className="text-stone-900 dark:text-stone-100">World English Bible (WEB)</strong> for clear, copyright-free modern English, with seamless switching to the classic <strong className="text-stone-900 dark:text-stone-100">King James Version (KJV)</strong> and curated plain-English reflections. Reina-Valera (RVR1960) and Louis Segond (LSG) power our Spanish and French experiences.
          </p>
        </div>

        {/* Pillar 2: AI Guardrails & Verbatim Scripture */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold leading-7 text-stone-900 dark:text-parchment-100">
              2. Strict AI Guardrails
            </h3>
          </div>
          <div className="text-base text-stone-600 dark:text-stone-300 leading-7 pl-10 space-y-3">
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
            <h3 className="text-lg font-bold leading-7 text-stone-900 dark:text-parchment-100">
              3. Curated Passage Vetting
            </h3>
          </div>
          <p className="text-base text-stone-600 dark:text-stone-300 leading-7 pl-10">
            Passages are not randomly scraped from the internet. Every story journey and daily mission passage is hand-curated from historical biblical narratives across the Old and New Testaments, verified for historical context, and grounded in core Christian orthodoxy.
          </p>
        </div>

        {/* Pillar 4: Privacy Note */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Lock aria-hidden="true" className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold leading-7 text-stone-900 dark:text-parchment-100">
              4. Privacy & Your Data
            </h3>
          </div>
          <p className="text-base text-stone-600 dark:text-stone-300 leading-7 pl-10">
            Your decision responses, reflections, notes, and progress stay stored on your local device. We do not sell personal data, profile your beliefs, or share your private spiritual journey.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={handleClose}
            className="btn-primary w-full text-xs sm:text-sm cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </FullPage>
  );
};
