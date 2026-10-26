import { useMemo, useState } from 'react';
import type { TapSequenceConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate, nudge } from '../../../utils/feedback';

/** Deterministic shuffle so the order is stable across renders (no fail state). */
function seededShuffle<T>(items: T[], seed = 7): T[] {
  const out = [...items];
  let state = seed;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Tap the steps in the right order. Wrong taps nudge; they never fail you. */
export function TapSequence({ config, disabled, onComplete }: InteractionProps<TapSequenceConfig>) {
  const shuffled = useMemo(() => seededShuffle(config.steps), [config.steps]);
  const [progress, setProgress] = useState(0);
  const [shake, setShake] = useState<string | null>(null);

  const tap = (step: string) => {
    if (disabled) return;
    if (step === config.steps[progress]) {
      const next = progress + 1;
      setProgress(next);
      celebrate('reveal');
      if (next >= config.steps.length) {
        window.setTimeout(() => { celebrate('victory'); onComplete(); }, 250);
      }
    } else {
      nudge();
      setShake(step);
      window.setTimeout(() => setShake(null), 400);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1" aria-hidden="true">
        {config.steps.map((_, i) => (
          <span key={i} className={`h-1.5 w-6 rounded-full ${i < progress ? 'bg-accent' : 'bg-white/25'}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {shuffled.map((step) => {
          const done = config.steps.indexOf(step) < progress;
          return (
            <button
              key={step}
              type="button"
              disabled={disabled || done}
              onClick={() => tap(step)}
              className={[
                'min-h-[44px] rounded-xl border px-4 text-small font-semibold text-left transition-transform',
                done ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200' : 'border-white/20 bg-white/10 text-white',
                shake === step ? 'animate-pulse border-rose-300 bg-rose-400/15 text-white' : ''
              ].join(' ')}
            >
              {step}
            </button>
          );
        })}
      </div>
      <p className="text-center text-small text-white/70">
        Step {Math.min(progress + 1, config.steps.length)} of {config.steps.length}
      </p>
    </div>
  );
}
