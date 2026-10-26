import { useState } from 'react';
import type { ChoiceCard } from '../../types/story';
import { VerseLine } from './VerseLine';
import { celebrate } from '../../utils/feedback';

/**
 * A choice moment: the learner picks, then sees what really happened with the
 * actual verse. This replaces the old Dilemmas.
 */
export function ChoiceMoment({ card, onComplete, compact = false, veryCompact = false }: { card: ChoiceCard; onComplete: () => void; compact?: boolean; veryCompact?: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);

  if (picked === null) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p className={`text-white ${veryCompact ? 'text-base' : compact ? 'text-lg' : 'text-title-3'}`}>{card.prompt}</p>
        <div className={compact ? 'grid gap-2' : 'grid gap-3'}>
          {card.options.map((option, i) => (
            <button
              key={option.label}
              type="button"
              onClick={() => { celebrate('choice'); setPicked(i); }}
              className={`btn-secondary !border-white/25 !bg-white/10 !text-white hover:!bg-white/15 text-left justify-start ${compact ? '!min-h-11 !py-2 !px-3' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const option = card.options[picked];
  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      <p className="text-small text-white/75">{option.response}</p>
      <div className={`rounded-2xl border border-line bg-surface-raised p-3 sm:p-4 ${compact ? 'space-y-2' : 'space-y-3'}`}>
        <span className="text-label uppercase text-fg-muted">What really happened</span>
        <p className={`text-fg ${veryCompact ? 'text-xs' : compact ? 'text-sm' : 'text-body'}`}>{card.whatHappened.text}</p>
        <VerseLine compact={compact} veryCompact={veryCompact} line={{ ref: card.whatHappened.ref, translation: card.whatHappened.translation as 'WEB' | 'KJV', text: card.whatHappened.scriptureText }} />
      </div>
      <button type="button" onClick={() => { celebrate('snap'); onComplete(); }} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}
