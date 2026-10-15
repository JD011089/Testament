import { useMemo, useState } from 'react';
import { STORY_STOPS, getStoryById } from '../content/stories';
import { isStoryCompleted } from '../utils/storyProgress';
import { addVerseCard, hasCard } from '../utils/deck';
import { todayKey } from '../utils/spacedRepetition';
import { celebrate } from '../utils/feedback';
import { StoryPlayer } from '../components/story/StoryPlayer';
import { StoryQuiz } from '../components/daily/StoryQuiz';
import { LockInStep } from '../components/daily/LockInStep';
import { VerseLine } from '../components/story/VerseLine';
import { Check, Flame, Map as MapIcon, Layers, Play } from 'lucide-react';

const STEPS = ['Swipe', 'Play', 'Lock in', 'Collect'] as const;

interface TodayScreenProps {
  streakCount?: number;
  onOpenMap?: () => void;
  onOpenDeck?: () => void;
  onReadChapter: (passage: string) => void;
}

function readStepIndex(): number {
  try {
    const raw = localStorage.getItem(`testament_today_loop_${todayKey()}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { step?: number };
    return typeof parsed?.step === 'number' ? parsed.step : 0;
  } catch {
    return 0;
  }
}

export function TodayScreen({ streakCount = 0, onOpenMap, onOpenDeck, onReadChapter }: TodayScreenProps) {
  const story = getStoryById('david-and-goliath');
  const [step, setStep] = useState(() => Math.min(readStepIndex(), STEPS.length));
  const [playing, setPlaying] = useState(false);

  const tomorrow = useMemo(() => STORY_STOPS.find((stop) => stop.order === (story?.order ?? 0) + 1) ?? null, [story]);

  if (!story) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-fg-muted">No story available.</div>;
  }

  const persist = (next: number) => {
    try { localStorage.setItem(`testament_today_loop_${todayKey()}`, JSON.stringify({ step: next })); } catch { /* ignore */ }
    setStep(next);
  };

  const done = step >= STEPS.length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-title-1 font-serif text-fg">Today</h1>
        <div className="flex items-center gap-2 text-small text-fg-muted">
          <Flame className="w-4 h-4 text-accent" />
          <span>{streakCount} day{streakCount === 1 ? '' : 's'}</span>
        </div>
      </header>

      {/* Progress ring / step dots */}
      <div className="rounded-3xl border border-accent/40 bg-surface-raised p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-small font-bold border',
                  i < step ? 'bg-accent text-accent-on border-accent' : i === step ? 'border-accent text-accent' : 'border-line text-fg-muted'
                ].join(' ')}
                aria-hidden="true"
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span className={`text-label uppercase ${i === step ? 'text-accent' : 'text-fg-muted'}`}>{label}</span>
            </div>
          ))}
        </div>

        {done ? (
          <div className="space-y-3 text-center">
            <h2 className="text-title-2 font-serif text-fg">Done for today</h2>
            <p className="text-body text-fg-muted">
              {tomorrow ? <>Tomorrow: <span className="text-fg font-semibold">{tomorrow.title}</span> ({tomorrow.passage}).</> : 'You finished the map.'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {onOpenMap && <button type="button" className="btn-secondary" onClick={() => { celebrate('tap'); onOpenMap(); }}><MapIcon className="w-4 h-4" /> Open the map</button>}
              {onOpenDeck && <button type="button" className="btn-secondary" onClick={() => { celebrate('tap'); onOpenDeck(); }}><Layers className="w-4 h-4" /> My Deck</button>}
            </div>
          </div>
        ) : step === 0 ? (
          <div className="space-y-3">
            <h2 className="text-title-2 font-serif text-fg">{story.title}</h2>
            <p className="text-small text-fg-muted">{story.passage} • about {story.estMinutes} minutes</p>
            <p className="text-body text-fg">Swipe through the story. Then answer three quick questions.</p>
            <button type="button" className="btn-primary w-full inline-flex items-center justify-center gap-2" onClick={() => { celebrate('tap'); setPlaying(true); }}>
              <Play className="w-4 h-4" /> {isStoryCompleted(story.id) ? 'Play again' : 'Play the story'}
            </button>
          </div>
        ) : step === 1 ? (
          <StoryQuiz story={story} onDone={() => { persist(2); }} />
        ) : step === 2 ? (
          <LockInStep verse={story.verse} onDone={() => { persist(3); }} />
        ) : (
          <div className="space-y-4 text-center">
            <span className="text-label uppercase text-accent">Verse collected</span>
            <div className="animate-fadeIn"><VerseLine line={story.verse} /></div>
            <p className="text-small text-fg-muted">{hasCard(`verse:${story.verse.ref}`) ? 'This verse is in My Deck.' : 'Adding to My Deck…'}</p>
            <button type="button" className="btn-primary w-full" onClick={() => { persist(4); }}>
              Done for today
            </button>
          </div>
        )}
      </div>

      {playing && (
        <StoryPlayer
          story={story}
          onExit={() => setPlaying(false)}
          onReadChapter={onReadChapter}
          onCompleted={() => {
            addVerseCard({ ref: story.verse.ref, translation: story.verse.translation, text: story.verse.text, storyId: story.id, storyTitle: story.title });
            setPlaying(false);
            persist(1);
          }}
        />
      )}
    </div>
  );
}