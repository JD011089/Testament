import { useState } from 'react';
import type { ChoiceCard, WhatHappened } from '../../types/story';
import { VerseLine } from './VerseLine';
import { celebrate } from '../../utils/feedback';

interface ChoiceMomentProps {
  card: ChoiceCard;
  /** Option picked earlier (restored from the ledger after a reload). */
  initialPick?: number | null;
  onPick?: (optionIndex: number) => void;
  onComplete: () => void;
  compact?: boolean;
  veryCompact?: boolean;
}

/**
 * A choice moment: the learner picks. An option with a branch plays its cards
 * next and ends in a reveal. An option without one shows its legacy scene (if any),
 * then what really happened with the actual verse.
 */
export function ChoiceMoment({ card, initialPick = null, onPick, onComplete, compact = false, veryCompact = false }: ChoiceMomentProps) {
  const [picked, setPicked] = useState<number | null>(initialPick);
  const [sceneSeen, setSceneSeen] = useState(false);

  if (picked === null) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p className={`text-white ${veryCompact ? 'text-base' : compact ? 'text-lg' : 'text-title-3'}`}>{card.prompt}</p>
        <div className={compact ? 'grid gap-2' : 'grid gap-3'}>
          {card.options.map((option, i) => (
            <button
              key={option.id ?? option.label}
              type="button"
              onClick={() => { celebrate('choice'); setPicked(i); onPick?.(i); }}
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
  if (option.branch && option.branch.length > 0) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        <p className="text-small text-white/75">{option.response}</p>
        <button type="button" onClick={() => { celebrate('snap'); onComplete(); }} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }

  if (option.scene && !sceneSeen) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        <span className="text-label uppercase text-amber-100">{option.label}</span>
        <p className={`font-serif leading-snug text-white ${veryCompact ? 'text-base' : compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>{option.scene}</p>
        <button type="button" onClick={() => { celebrate('snap'); setSceneSeen(true); }} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }
  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      <p className="text-small text-white/75">{option.response}</p>
      <WhatHappenedBlock what={card.whatHappened} compact={compact} veryCompact={veryCompact} />
      <button type="button" onClick={() => { celebrate('snap'); onComplete(); }} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}

export function WhatHappenedBlock({ what, compact = false, veryCompact = false }: { what: WhatHappened; compact?: boolean; veryCompact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface-raised p-3 sm:p-4 ${compact ? 'space-y-2' : 'space-y-3'}`}>
      <span className="text-label uppercase text-fg-muted">What really happened</span>
      <p className={`text-fg ${veryCompact ? 'text-xs' : compact ? 'text-sm' : 'text-body'}`}>{what.text}</p>
      <VerseLine compact={compact} veryCompact={veryCompact} line={{ ref: what.ref, translation: what.translation as 'WEB' | 'KJV', text: what.scriptureText }} />
    </div>
  );
}
