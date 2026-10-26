import { useRef, useState } from 'react';
import type { TapRevealConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate } from '../../../utils/feedback';
import { getStoryScene } from '../sceneModel';
import { StoryWorld } from './StoryScene';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * Tap a step to show every layer up through that step.
 * Tapping an earlier step peels the later layers back off.
 */
export function TapReveal({ config, disabled, onComplete, compact = false, veryCompact = false }: InteractionProps<TapRevealConfig> & { compact?: boolean; veryCompact?: boolean }) {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(-1);
  const [highestRevealedIndex, setHighestRevealedIndex] = useState(-1);
  const finished = useRef(false);
  const scene = config.scene;
  const illustrated = Boolean(scene && getStoryScene(scene));
  const latest = stepIndex >= 0 ? config.reveals[stepIndex] : undefined;
  const choose = (index: number) => {
    if (disabled || index > highestRevealedIndex + 1 || index === stepIndex) return;
    setStepIndex(index);
    setHighestRevealedIndex((highest) => Math.max(highest, index));
    celebrate('reveal');
    if (!finished.current && index >= config.reveals.length - 1) {
      finished.current = true;
      window.setTimeout(() => { celebrate('victory'); onComplete(); }, 250);
    }
  };

  return (
    <div className={illustrated ? 'flex min-h-0 w-full flex-1 flex-col gap-3' : 'w-full'}>
      {illustrated && scene && <StoryWorld scene={scene} stepIndex={stepIndex} compact={compact} veryCompact={veryCompact} />}
      <p className="sr-only" aria-live="polite">
        {illustrated && latest ? `${latest.label} filled in.` : ''}
      </p>
      <div className="grid w-full grid-cols-2 gap-3">
        {config.reveals.map((item, index) => {
          const isRevealed = index <= highestRevealedIndex;
          const isNext = index === highestRevealedIndex + 1;
          const isCenteredLast = config.reveals.length % 2 === 1 && index === config.reveals.length - 1;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled || index > highestRevealedIndex + 1}
              onClick={() => choose(index)}
              aria-pressed={isRevealed}
              className={[
                `rounded-2xl border text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed ${veryCompact ? 'min-h-[44px] p-1.5' : compact ? 'min-h-[48px] p-2' : 'min-h-[64px] p-3'}`,
                isCenteredLast ? 'col-span-2 w-[calc(50%-0.375rem)] justify-self-center' : '',
                isRevealed
                  ? 'border-amber-200/50 bg-amber-200/15'
                  : isNext
                    ? 'border-white/60 bg-white text-stone-900 shadow-sm'
                    : 'border-white/15 bg-white/10 text-white/55'
              ].join(' ')}
            >
              {isRevealed ? (
                <span className={`block font-bold text-amber-50 animate-fadeIn ${veryCompact ? 'text-[11px]' : compact ? 'text-xs' : 'text-small'}`}>{item.label}</span>
              ) : (
                <span className={`block font-semibold ${veryCompact ? 'text-[11px]' : compact ? 'text-xs' : 'text-small'} ${isNext ? 'text-stone-800' : 'text-white/55'}`}>{isNext ? t('story.revealNext') : t('story.revealLocked')}</span>
              )}
              {isRevealed && item.detail && (
                <span className={`mt-1 block text-white/70 ${veryCompact ? 'text-[10px]' : compact ? 'text-[11px]' : 'text-small'}`}>{item.detail}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
