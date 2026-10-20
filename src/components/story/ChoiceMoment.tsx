import { useState } from 'react';
import type { ChoiceCard } from '../../types/story';
import { VerseLine } from './VerseLine';
import { celebrate } from '../../utils/feedback';

/**
 * A choice moment: the learner picks, then sees what really happened with the
 * actual verse. This replaces the old Dilemmas.
 */
export function ChoiceMoment({ card, onComplete }: { card: ChoiceCard; onComplete: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);

  if (picked === null) {
    return (
      <div className="space-y-3">
        <p className="text-title-3 text-fg">{card.prompt}</p>
        <div className="grid gap-3">
          {card.options.map((option, i) => (
            <button
              key={option.label}
              type="button"
              onClick={() => { celebrate('choice'); setPicked(i); }}
              className="btn-secondary text-left justify-start"
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
    <div className="space-y-4">
      <p className="text-small text-fg-muted">{option.response}</p>
      <div className="rounded-2xl border border-line bg-surface-raised p-3 sm:p-4 space-y-3">
        <span className="text-label uppercase text-fg-muted">What really happened</span>
        <p className="text-body text-fg">{card.whatHappened.text}</p>
        <VerseLine line={{ ref: card.whatHappened.ref, translation: card.whatHappened.translation as 'WEB' | 'KJV', text: card.whatHappened.scriptureText }} />
      </div>
      <button type="button" onClick={() => { celebrate('snap'); onComplete(); }} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}