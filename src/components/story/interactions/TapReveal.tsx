import { useRef, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import type { TapRevealConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate } from '../../../utils/feedback';
import { getStoryScene } from '../sceneModel';
import { StoryWorld } from './StoryScene';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * Reveal steps in order. Each tap zooms the picture to that step, marks it with
 * its number, and names it on the picture. Revealed steps stay lit; tapping one
 * again brings the picture back to it.
 */
export function TapReveal({ config, disabled, onComplete, compact = false, veryCompact = false }: InteractionProps<TapRevealConfig> & { compact?: boolean; veryCompact?: boolean }) {
  const { t } = useLanguage();
  const [focusIndex, setFocusIndex] = useState(-1);
  const [revealedCount, setRevealedCount] = useState(0);
  const finished = useRef(false);
  const scene = config.scene;
  const illustrated = Boolean(scene && getStoryScene(scene));
  const focused = focusIndex >= 0 ? config.reveals[focusIndex] : undefined;

  const choose = (index: number) => {
    if (disabled || index > revealedCount) return;
    if (index === focusIndex) return;
    const isNew = index === revealedCount;
    setFocusIndex(index);
    if (!isNew) return;
    setRevealedCount(index + 1);
    celebrate('reveal');
    if (!finished.current && index >= config.reveals.length - 1) {
      finished.current = true;
      window.setTimeout(() => { celebrate('victory'); onComplete(); }, 250);
    }
  };

  const textSize = veryCompact ? 'text-[11px]' : compact ? 'text-xs' : 'text-small';

  return (
    <div className={illustrated ? 'flex min-h-0 w-full flex-1 flex-col gap-3' : 'w-full'}>
      {illustrated && scene && (
        <StoryWorld
          scene={scene}
          reveals={config.reveals}
          revealedCount={revealedCount}
          focusIndex={focusIndex}
          compact={compact}
          veryCompact={veryCompact}
        />
      )}
      <p className="sr-only" aria-live="polite">
        {focused ? `${focusIndex + 1} of ${config.reveals.length}: ${focused.label}${focused.detail ? `. ${focused.detail}` : ''}` : ''}
      </p>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {config.reveals.map((item, index) => {
          const isRevealed = index < revealedCount;
          const isFocused = index === focusIndex;
          const isNext = index === revealedCount;
          const isCenteredLast = config.reveals.length % 2 === 1 && index === config.reveals.length - 1;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled || index > revealedCount}
              onClick={() => choose(index)}
              aria-pressed={isRevealed}
              aria-label={isRevealed ? `${index + 1}. ${item.label}` : isNext ? `${index + 1}. ${t('story.revealNext')}` : `${index + 1}. ${t('story.revealLocked')}`}
              className={[
                `flex items-start gap-2 rounded-2xl border text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed ${veryCompact ? 'min-h-[44px] p-1.5' : compact ? 'min-h-[48px] p-2' : 'min-h-[60px] p-2.5'}`,
                isCenteredLast ? 'col-span-2 w-[calc(50%-0.3125rem)] justify-self-center' : '',
                isFocused
                  ? 'border-[#F6D79B] bg-[#F6D79B]/25 shadow-[0_0_0_1px_rgba(246,215,155,0.6),0_0_18px_rgba(246,215,155,0.25)]'
                  : isRevealed
                    ? 'border-[#F6D79B]/50 bg-[#F6D79B]/10 hover:bg-[#F6D79B]/15'
                    : isNext
                      ? 'border-white/70 bg-white text-stone-900 shadow-sm'
                      : 'border-white/15 bg-white/5 text-white/50'
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 grid shrink-0 place-items-center rounded-full font-bold ${veryCompact ? 'h-4 w-4 text-[9px]' : 'h-5 w-5 text-[10px]'} ${
                  isFocused
                    ? 'bg-[#F6D79B] text-stone-950'
                    : isRevealed
                      ? 'bg-black/40 text-[#F6D79B] ring-1 ring-[#F6D79B]/70'
                      : isNext
                        ? 'bg-stone-900 text-white'
                        : 'bg-white/10 text-white/50'
                }`}
              >
                {isRevealed && !isFocused ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
              </span>
              <span className="min-w-0">
                {isRevealed ? (
                  <>
                    <span className={`block font-bold leading-tight text-[#FBEBC8] ${textSize}`}>{item.label}</span>
                    {item.detail && !veryCompact && (
                      <span className={`mt-0.5 block leading-snug text-white/70 ${veryCompact ? 'text-[10px]' : 'text-[11px]'}`}>{item.detail}</span>
                    )}
                  </>
                ) : (
                  <span className={`flex items-center gap-1 font-semibold ${textSize} ${isNext ? 'text-stone-800' : 'text-white/50'}`}>
                    {!isNext && <Lock className="h-3 w-3" aria-hidden="true" />}
                    {isNext ? t('story.revealNext') : t('story.revealLocked')}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
