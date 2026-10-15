import { useState } from 'react';
import type { DragConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate, nudge } from '../../../utils/feedback';

/**
 * Drag (or tap-then-tap-target) items into a target. No fail state: wrong items
 * simply bounce back with a gentle nudge.
 */
export function DragToTarget({ config, disabled, onComplete }: InteractionProps<DragConfig>) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const targetIds = config.items
    .filter((item) => item.accept === true || /stone/i.test(item.label))
    .map((item) => item.id);

  const accept = (itemId: string) => {
    if (disabled || placed.includes(itemId)) return;
    const isCorrect = targetIds.includes(itemId);
    if (!isCorrect) {
      nudge();
      setWrongId(itemId);
      window.setTimeout(() => setWrongId(null), 450);
      return;
    }
    const next = [...placed, itemId];
    setPlaced(next);
    setSelected(null);
    celebrate('tap');
    if (next.length >= config.requiredCount) {
      window.setTimeout(() => { celebrate('victory'); onComplete(); }, 250);
    }
  };

  const remaining = targetIds.filter((id) => !placed.includes(id));

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2 justify-center" aria-label="Items">
        {config.items.map((item) => {
          const isPlaced = placed.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled || isPlaced}
              draggable={!disabled && !isPlaced}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
              onClick={() => {
                if (selected === item.id) accept(item.id);
                else setSelected(item.id);
              }}
              aria-pressed={selected === item.id}
              className={[
                'min-h-[44px] min-w-[44px] px-3 rounded-xl border text-small font-semibold transition-transform',
                isPlaced
                  ? 'opacity-30 border-line'
                  : selected === item.id
                    ? 'border-accent bg-accent/15 scale-105'
                    : 'border-line bg-surface-raised',
                wrongId === item.id ? 'animate-pulse border-danger' : ''
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          accept(e.dataTransfer.getData('text/plain'));
        }}
        onClick={() => { if (selected) accept(selected); }}
        className="mx-auto w-full max-w-xs min-h-[96px] rounded-2xl border-2 border-dashed border-accent/60 bg-accent/5 flex flex-col items-center justify-center gap-1 p-3"
      >
        <span className="text-label uppercase text-fg-muted">{config.targetLabel}</span>
        <span className="text-title-3 text-accent">{placed.length} / {config.requiredCount}</span>
        <span className="text-small text-fg-muted">
          {selected ? 'Tap the bag to drop it' : 'Drag a stone here'}
        </span>
      </div>

      {remaining.length === 0 && (
        <p className="text-center text-small text-success font-semibold">All five stones are in the bag.</p>
      )}
    </div>
  );
}