import { useState } from 'react';
import { celebrate } from '../../utils/feedback';
import { markFirstRunDone, saveReminderTime } from '../../utils/firstRun';
import { useModalLock } from '../../utils/useModalLock';
import { Play, Layers, Bell, Sparkles } from 'lucide-react';

interface FirstRunProps {
  onDone: () => void;
}

const SCREENS = [
  {
    icon: <Play className="w-8 h-8" />,
    title: 'Play a Bible story in 3 minutes a day',
    body: 'Swipe through the story, make a choice, and see what really happened — no walls of text.'
  },
  {
    icon: <Layers className="w-8 h-8" />,
    title: 'Collect the verses you learn',
    body: 'Every finished story adds a card to My Deck. Watch your collection grow.'
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: 'Pick a daily reminder time',
    body: 'A gentle nudge each day keeps your streak kind and easy.'
  }
];

export function FirstRun({ onDone }: FirstRunProps) {
  const [index, setIndex] = useState(0);
  const [reminder, setReminder] = useState('08:00');
  const rootRef = useModalLock(true);
  const isLast = index === SCREENS.length - 1;
  const screen = SCREENS[index];

  const finish = () => {
    if (isLast) {
      saveReminderTime(reminder);
    }
    celebrate('tap');
    if (isLast) {
      markFirstRunDone();
      onDone();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 bg-bg text-fg flex flex-col overscroll-none touch-pan-y">
      <div className="flex-1 max-w-md mx-auto w-full px-6 flex flex-col justify-center gap-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
          {screen.icon}
        </div>
        <h1 className="text-title-1 font-serif text-fg">{screen.title}</h1>
        <p className="text-body text-fg-muted">{screen.body}</p>

        {isLast && (
          <label className="space-y-2 text-left">
            <span className="text-small text-fg-muted">Daily reminder time</span>
            <input
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-line bg-surface-raised px-3 text-body text-fg"
            />
          </label>
        )}
      </div>

      <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-w-md mx-auto w-full space-y-4">
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          {SCREENS.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === index ? 'bg-accent' : 'bg-line'}`} />
          ))}
        </div>
        <button type="button" onClick={finish} className="btn-primary w-full inline-flex items-center justify-center gap-2">
          {isLast ? <><Sparkles className="w-4 h-4" /> Start with David and Goliath</> : 'Next'}
        </button>
        <button type="button" onClick={() => { markFirstRunDone(); onDone(); }} className="btn-quiet w-full">
          Skip
        </button>
      </div>
    </div>
  );
}