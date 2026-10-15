import { useState } from 'react';
import type { TapRevealConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate } from '../../../utils/feedback';

/** Tap each tile to reveal it. Revealing them all advances the card. */
export function TapReveal({ config, disabled, onComplete }: InteractionProps<TapRevealConfig>) {
  const [revealed, setRevealed] = useState<string[]>([]);

  const reveal = (id: string) => {
    if (disabled || revealed.includes(id)) return;
    const next = [...revealed, id];
    setRevealed(next);
    celebrate('tap');
    if (next.length >= config.reveals.length) {
      window.setTimeout(() => { celebrate('victory'); onComplete(); }, 250);
    }
  };

  return (
    <div className="w-full grid grid-cols-2 gap-3">
      {config.reveals.map((item) => {
        const isRevealed = revealed.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled || isRevealed}
            onClick={() => reveal(item.id)}
            aria-pressed={isRevealed}
            className={[
              'min-h-[88px] rounded-2xl border p-3 text-left transition-all',
              isRevealed ? 'border-accent bg-accent/15' : 'border-line bg-surface-raised'
            ].join(' ')}
          >
            {isRevealed ? (
              <>
                <span className="block text-small font-bold text-fg">{item.label}</span>
                {item.detail && <span className="block text-small text-fg-muted mt-1">{item.detail}</span>}
              </>
            ) : (
              <span className="block text-small font-semibold text-fg-muted">Tap to reveal</span>
            )}
          </button>
        );
      })}
    </div>
  );
}