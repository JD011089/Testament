import { useMemo, useState } from 'react';
import { STORY_STOPS, getStoryById } from '../content/stories';
import { isStoryCompleted } from '../utils/storyProgress';
import { addVerseCard, hasCard } from '../utils/deck';
import { todayKey } from '../utils/spacedRepetition';
import { celebrate } from '../utils/feedback';
import { useLanguage } from '../context/LanguageContext';
import { StoryPlayer } from '../components/story/StoryPlayer';
import { StoryQuiz } from '../components/daily/StoryQuiz';
import { LockInStep } from '../components/daily/LockInStep';
import { VerseLine } from '../components/story/VerseLine';
import { PageHeader } from '../components/PageHeader';
import { Check, Map as MapIcon, Layers, Play } from 'lucide-react';

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
  const { t } = useLanguage();
  const story = getStoryById('david-and-goliath');
  const steps = useMemo(
    () => [t('today.step.swipe'), t('today.step.play'), t('today.step.lockIn'), t('today.step.collect')] as const,
    [t]
  );
  const [step, setStep] = useState(() => Math.min(readStepIndex(), 4));
  const [playing, setPlaying] = useState(false);

  const tomorrow = useMemo(() => STORY_STOPS.find((stop) => stop.order === (story?.order ?? 0) + 1) ?? null, [story]);

  if (!story) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-fg-muted">{t('today.noStory')}</div>;
  }

  const persist = (next: number) => {
    try { localStorage.setItem(`testament_today_loop_${todayKey()}`, JSON.stringify({ step: next })); } catch { /* ignore */ }
    setStep(next);
  };

  const done = step >= steps.length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5">
      <PageHeader
        title={t('today.title')}
        subtitle={streakCount > 0
          ? t('today.streak', { count: streakCount })
          : t('today.freshStart')}
      />

      <div className="rounded-3xl border border-line bg-surface-raised p-4 sm:p-5 shadow-[0_1px_0_rgba(178,123,63,0.08),0_8px_28px_rgba(31,35,48,0.05)]">
        <div className="flex items-start justify-between gap-1 mb-4">
          {steps.map((label, i) => (
            <div key={label} className="flex-1 min-w-0 flex flex-col items-center gap-1 px-0.5">
              <span
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-small font-bold border shrink-0',
                  i < step ? 'bg-accent text-accent-on border-accent' : i === step ? 'border-accent text-accent' : 'border-line text-fg-muted'
                ].join(' ')}
                aria-hidden="true"
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span className={`text-[10px] leading-tight text-center uppercase tracking-wide ${i === step ? 'text-accent font-semibold' : 'text-fg-muted'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {done ? (
          <div className="space-y-3 text-center">
            <h2 className="text-title-2 font-serif text-fg">{t('today.done')}</h2>
            <p className="text-body text-fg-muted">
              {tomorrow
                ? t('today.tomorrow', { title: tomorrow.title, passage: tomorrow.passage })
                : t('today.mapFinished')}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {onOpenMap && (
                <button type="button" className="btn-secondary" onClick={() => { celebrate('tap'); onOpenMap(); }}>
                  <MapIcon className="w-4 h-4" /> {t('today.openMap')}
                </button>
              )}
              {onOpenDeck && (
                <button type="button" className="btn-secondary" onClick={() => { celebrate('tap'); onOpenDeck(); }}>
                  <Layers className="w-4 h-4" /> {t('today.myDeck')}
                </button>
              )}
            </div>
          </div>
        ) : step === 0 ? (
          <div className="space-y-3">
            <h2 className="text-title-2 font-serif text-fg">{story.title}</h2>
            <p className="text-small text-fg-muted">{t('today.estMinutes', { passage: story.passage, minutes: story.estMinutes })}</p>
            <p className="text-body text-fg">{t('today.swipeIntro')}</p>
            <button type="button" className="btn-primary w-full inline-flex items-center justify-center gap-2" onClick={() => { celebrate('tap'); setPlaying(true); }}>
              <Play className="w-4 h-4" /> {isStoryCompleted(story.id) ? t('today.playAgain') : t('today.playStory')}
            </button>
          </div>
        ) : step === 1 ? (
          <StoryQuiz story={story} onDone={() => { persist(2); }} />
        ) : step === 2 ? (
          <LockInStep verse={story.verse} onDone={() => { persist(3); }} />
        ) : (
          <div className="space-y-4 text-center">
            <span className="text-label uppercase text-accent">{t('today.verseCollected')}</span>
            <div className="animate-fadeIn"><VerseLine line={story.verse} /></div>
            <p className="text-small text-fg-muted">{hasCard(`verse:${story.verse.ref}`) ? t('today.inDeck') : t('today.addingDeck')}</p>
            <button type="button" className="btn-primary w-full" onClick={() => { persist(4); }}>
              {t('today.done')}
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
