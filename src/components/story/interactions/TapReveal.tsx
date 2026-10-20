import { useRef, useState } from 'react';
import type { TapRevealConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate } from '../../../utils/feedback';
import { getStoryScene } from '../sceneModel';
import { StoryWorld } from './StoryScene';

/**
 * Tap a step to show every layer up through that step.
 * Tapping an earlier step peels the later layers back off.
 */
export function TapReveal({ config, disabled, onComplete }: InteractionProps<TapRevealConfig>) {
  const [stepIndex, setStepIndex] = useState(-1);
  const finished = useRef(false);
  const scene = config.scene;
  const sceneConfig = scene ? getStoryScene(scene) : undefined;
  const illustrated = sceneConfig != null;
  const latest = stepIndex >= 0 ? config.reveals[stepIndex] : undefined;

  const choose = (index: number) => {
    if (disabled || index === stepIndex) return;
    setStepIndex(index);
    celebrate('reveal');
    if (!finished.current && index >= config.reveals.length - 1) {
      finished.current = true;
      window.setTimeout(() => { celebrate('victory'); onComplete(); }, 250);
    }
  };

  return (
    <div className={illustrated ? 'flex min-h-0 w-full flex-1 flex-col gap-3' : 'w-full'}>
      {illustrated && scene && <StoryWorld scene={scene} stepIndex={stepIndex} />}
      <p className="sr-only" aria-live="polite">
        {illustrated && latest ? `${latest.label} filled in.` : ''}
      </p>
      <div className="grid w-full grid-cols-2 gap-3">
        {config.reveals.map((item, index) => {
          const isRevealed = index <= stepIndex;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => choose(index)}
              aria-pressed={isRevealed}
              className={[
                'min-h-[88px] rounded-2xl border p-3 text-left transition-all active:scale-[0.98]',
                isRevealed ? 'border-accent bg-accent/15' : 'border-line bg-surface-raised'
              ].join(' ')}
            >
              {isRevealed ? (
                <span className="block text-small font-bold text-fg animate-fadeIn">{item.label}</span>
              ) : (
                <span className="block text-small font-semibold text-fg-muted">Tap to reveal</span>
              )}
              {isRevealed && item.detail && (
                <span className="mt-1 block text-small text-fg-muted">{item.detail}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
