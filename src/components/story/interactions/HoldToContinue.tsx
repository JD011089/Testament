import { useEffect, useRef, useState } from 'react';
import type { HoldConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate, nudge } from '../../../utils/feedback';

/** Press and hold until the ring fills. Releasing early just nudges — no fail. */
export function HoldToContinue({ config, disabled, onComplete }: InteractionProps<HoldConfig>) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const lastPulse = useRef(0);

  useEffect(() => {
    if (!holding || disabled || done) return;
    const tick = () => {
      if (start.current === null) return;
      const elapsed = performance.now() - start.current;
      const pct = Math.min(1, elapsed / config.durationMs);
      setProgress(pct);
      // Soft rising ticks while holding (~every 220ms)
      if (elapsed - lastPulse.current >= 220) {
        lastPulse.current = elapsed;
        celebrate('hold');
      }
      if (pct >= 1) {
        setDone(true);
        setHolding(false);
        celebrate('victory');
        onComplete();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    lastPulse.current = 0;
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [holding, disabled, done, config.durationMs, onComplete]);

  const begin = () => {
    if (disabled || done) return;
    start.current = performance.now();
    setHolding(true);
  };
  const release = () => {
    if (done) return;
    if (holding && progress < 1) nudge();
    setHolding(false);
    setProgress(0);
    start.current = null;
  };

  const circumference = 2 * Math.PI * 44;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        disabled={disabled || done}
        onPointerDown={begin}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        className="relative w-28 h-28 rounded-full border-2 border-accent/50 bg-surface-raised flex items-center justify-center select-none touch-none"
        aria-label={config.holdLabel}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
          <circle cx="48" cy="48" r="44" fill="none" strokeWidth="6" className="stroke-line" />
          <circle
            cx="48" cy="48" r="44" fill="none" strokeWidth="6" strokeLinecap="round"
            className="stroke-accent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <span className="text-small font-semibold text-fg">{done ? 'Done' : config.holdLabel}</span>
      </button>
      <p className="text-small text-fg-muted text-center">
        {holding ? 'Keep holding…' : 'Press and hold to swing.'}
      </p>
    </div>
  );
}