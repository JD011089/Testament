import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { DragConfig } from '../../../types/story';
import type { InteractionProps } from './types';
import { celebrate, nudge } from '../../../utils/feedback';
import { useLanguage } from '../../../context/LanguageContext';

const DRAG_THRESHOLD_PX = 8;

type DragState = {
  itemId: string;
  label: string;
  pointerId: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  active: boolean;
};

/**
 * Drag (or tap-then-tap-target) items into a target. No fail state: wrong items
 * simply bounce back with a gentle nudge.
 */
export function DragToTarget({ config, disabled, onComplete }: InteractionProps<DragConfig>) {
  const { t } = useLanguage();
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [overTarget, setOverTarget] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const targetIds = config.items
    .filter((item) => item.accept === true || /stone/i.test(item.label))
    .map((item) => item.id);

  const accept = useCallback((itemId: string) => {
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
  }, [config.requiredCount, disabled, onComplete, placed, targetIds]);

  const clearDrag = () => {
    dragRef.current = null;
    setDrag(null);
    setOverTarget(false);
  };

  const pointInTarget = (clientX: number, clientY: number) => {
    const el = targetRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  const onItemPointerDown = (itemId: string, label: string, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || placed.includes(itemId)) return;
    // Only primary button / touch / pen
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.currentTarget.setPointerCapture(e.pointerId);
    // Stop StoryPlayer swipe navigation from claiming this gesture.
    e.stopPropagation();

    const next: DragState = {
      itemId,
      label,
      pointerId: e.pointerId,
      originX: e.clientX,
      originY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      active: false,
    };
    dragRef.current = next;
    setDrag(next);
  };

  const onItemPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    e.stopPropagation();
    if (current.active) {
      e.preventDefault();
    }

    const dx = e.clientX - current.originX;
    const dy = e.clientY - current.originY;
    const moved = Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX;
    const active = current.active || moved;
    const next: DragState = {
      ...current,
      x: e.clientX,
      y: e.clientY,
      active,
    };
    dragRef.current = next;
    setDrag(next);
    setOverTarget(active && pointInTarget(e.clientX, e.clientY));
  };

  const onItemPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    e.stopPropagation();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Capture may already be released.
    }

    if (current.active) {
      suppressClickRef.current = true;
      if (pointInTarget(e.clientX, e.clientY)) {
        accept(current.itemId);
      }
      clearDrag();
      return;
    }

    // Tap path: select (or place if already selected).
    clearDrag();
    if (selected === current.itemId) accept(current.itemId);
    else setSelected(current.itemId);
  };

  const onItemPointerCancel = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    e.stopPropagation();
    clearDrag();
  };

  const remaining = targetIds.filter((id) => !placed.includes(id));

  return (
    <div
      className="w-full space-y-4"
      onTouchStart={(e) => {
        if (dragRef.current) e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        if (dragRef.current || suppressClickRef.current) e.stopPropagation();
      }}
    >
      <div className="flex flex-wrap gap-2 justify-center" aria-label="Items">
        {config.items.map((item) => {
          const isPlaced = placed.includes(item.id);
          const isDragging = drag?.itemId === item.id && drag.active;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled || isPlaced}
              onPointerDown={(e) => onItemPointerDown(item.id, item.label, e)}
              onPointerMove={onItemPointerMove}
              onPointerUp={onItemPointerUp}
              onPointerCancel={onItemPointerCancel}
              onClick={(e) => {
                // Pointer-up already handled select/drag; block synthetic click after a drag.
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
              }}
              aria-pressed={selected === item.id}
              className={[
                'min-h-[44px] min-w-[44px] px-3 rounded-xl border text-small font-semibold transition-transform touch-none select-none',
                isPlaced
                  ? 'opacity-30 border-line'
                  : selected === item.id || isDragging
                    ? 'border-accent bg-accent/15 scale-105'
                    : 'border-line bg-surface-raised',
                wrongId === item.id ? 'animate-pulse border-danger' : '',
                isDragging ? 'opacity-40' : '',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        ref={targetRef}
        onClick={() => { if (selected) accept(selected); }}
        className={[
          'mx-auto w-full max-w-xs min-h-[96px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 p-3 transition-colors',
          overTarget
            ? 'border-accent bg-accent/20'
            : 'border-accent/60 bg-accent/5',
        ].join(' ')}
      >
        <span className="text-label uppercase text-fg-muted">{config.targetLabel}</span>
        <span className="text-title-3 text-accent">{placed.length} / {config.requiredCount}</span>
        <span className="text-small text-fg-muted">
          {selected ? t('story.tapBag') : t('story.dragHint')}
        </span>
      </div>

      {remaining.length === 0 && (
        <p className="text-center text-small text-success font-semibold">{t('story.allStones')}</p>
      )}

      {drag?.active && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 min-h-[44px] min-w-[44px] px-3 rounded-xl border border-accent bg-accent/20 text-small font-semibold shadow-md flex items-center justify-center"
          style={{
            left: drag.x,
            top: drag.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {drag.label}
        </div>
      )}
    </div>
  );
}
