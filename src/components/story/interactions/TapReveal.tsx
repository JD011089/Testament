import { useEffect, useRef, useState } from 'react';
import type { TapRevealConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate } from '../../../utils/feedback';
import { getStoryScene, type SceneStep } from '../sceneModel';
import { StoryWorld } from './StoryScene';
import { getStoryIllustrationUrl } from '../../../utils/storyIllustrations';
import { useLanguage } from '../../../context/LanguageContext';

function focalPoint(step: SceneStep | undefined) {
  const layer = step?.layers[0];
  if (!layer) return { x: 50, y: 50, zoom: 1.8 };
  const percent = (value: string | undefined, fallback: number) => {
    if (!value) return fallback;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const x = layer.position.left != null
    ? percent(layer.position.left, 0) + percent(layer.size.width, 0) / 2
    : layer.position.right != null
      ? 100 - percent(layer.position.right, 0) - percent(layer.size.width, 0) / 2
      : 50;
  const y = layer.position.top != null
    ? percent(layer.position.top, 0) + percent(layer.size.height, 0) / 2
    : layer.position.bottom != null
      ? 100 - percent(layer.position.bottom, 0) - percent(layer.size.height, 0) / 2
      : 50;
  const targetSize = Math.max(percent(layer.size.width, 0), percent(layer.size.height, 0));
  const zoom = Math.max(1.5, Math.min(3.2, 58 / Math.max(targetSize, 1)));
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
    zoom
  };
}

/**
 * Tap a step to show every layer up through that step.
 * Tapping an earlier step peels the later layers back off.
 */
export function TapReveal({ config, disabled, onComplete }: InteractionProps<TapRevealConfig>) {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(-1);
  const [highestRevealedIndex, setHighestRevealedIndex] = useState(-1);
  const finished = useRef(false);
  const detailCardRef = useRef<HTMLElement>(null);
  const scene = config.scene;
  const sceneConfig = scene ? getStoryScene(scene) : undefined;
  const illustrated = sceneConfig != null;
  const latest = stepIndex >= 0 ? config.reveals[stepIndex] : undefined;
  const latestStep = stepIndex >= 0 ? sceneConfig?.steps[stepIndex] : undefined;
  const focus = focalPoint(latestStep);
  const translateX = Math.max(100 - focus.zoom * 100, Math.min(0, 50 - focus.x * focus.zoom));
  const translateY = Math.max(100 - focus.zoom * 100, Math.min(0, 50 - focus.y * focus.zoom));

  useEffect(() => {
    if (stepIndex < 0) return;
    detailCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [stepIndex]);

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
      {illustrated && scene && <StoryWorld scene={scene} stepIndex={stepIndex} />}
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
                'min-h-[88px] rounded-2xl border p-3 text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65',
                isCenteredLast ? 'col-span-2 w-[calc(50%-0.375rem)] justify-self-center' : '',
                isRevealed ? 'border-accent bg-accent/15' : 'border-line bg-surface-raised'
              ].join(' ')}
            >
              {isRevealed ? (
                <span className="block text-small font-bold text-fg animate-fadeIn">{item.label}</span>
              ) : (
                <span className="block text-small font-semibold text-fg-muted">{isNext ? t('story.revealNext') : t('story.revealLocked')}</span>
              )}
              {isRevealed && item.detail && (
                <span className="mt-1 block text-small text-fg-muted">{item.detail}</span>
              )}
            </button>
          );
        })}
      </div>
      {illustrated && latest && scene && (
        <section
          ref={detailCardRef}
          key={latest.id}
          aria-live="polite"
          aria-label={`${latest.label} story detail`}
          className="overflow-hidden rounded-3xl border border-line bg-surface-raised shadow-lg animate-fadeIn"
        >
          <div className="relative aspect-[16/8] overflow-hidden bg-stone-950">
            <img
              src={getStoryIllustrationUrl(scene)}
              alt={latestStep?.layers[0]?.alt ?? `${latest.label} in the ${sceneConfig?.title} story`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out"
              style={{
                objectPosition: '50% 50%',
                transformOrigin: '0 0',
                transform: `translate(${translateX}%, ${translateY}%) scale(${focus.zoom})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute bottom-3 left-4 rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Story detail · {stepIndex + 1} of {config.reveals.length}
            </span>
          </div>
          <div className="p-4">
            <h3 className="text-title-3 font-semibold text-fg">{latest.label}</h3>
            {latest.detail && <p className="mt-1 text-body leading-relaxed text-fg-muted">{latest.detail}</p>}
            {latestStep?.verse && <p className="mt-3 text-small font-semibold text-accent">{latestStep.verse}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
