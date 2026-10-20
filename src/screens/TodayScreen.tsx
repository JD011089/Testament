import { useMemo, useState } from 'react';
import { getStoryById } from '../content/stories';
import { getDailyStoryId, nextStoryIdAfter } from '../utils/dailyStory';
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

/** Painted plate for each map stop. David keeps the valley where he faces Goliath. */
const STORY_SCENES: Record<string, string> = {
  creation: '/images/stories/finished/creation.jpg',
  noah: '/images/stories/finished/noah.jpg',
  'abrahams-call': '/images/stories/finished/abrahams-call.jpg',
  joseph: '/images/stories/finished/joseph.jpg',
  'moses-burning-bush': '/images/stories/finished/moses-burning-bush.jpg',
  'red-sea': '/images/stories/finished/red-sea.jpg',
  ruth: '/images/stories/finished/ruth.jpg',
  'david-and-goliath': '/images/stories/finished/david-and-goliath.jpg',
  'elijah-carmel': '/images/stories/finished/elijah-carmel.jpg',
  'elijah-still-small-voice': '/images/stories/finished/elijah-still-small-voice.jpg',
  'daniel-lions-den': '/images/stories/finished/daniel-lions-den.jpg',
  jonah: '/images/stories/finished/jonah.jpg',
  esther: '/images/stories/finished/esther.jpg',
  'birth-of-jesus': '/images/stories/finished/birth-of-jesus.jpg',
  'jesus-calms-the-storm': '/images/stories/finished/jesus-calms-the-storm.jpg',
  'feeding-the-5000': '/images/stories/finished/feeding-the-5000.jpg',
  'peter-walks-on-water': '/images/stories/finished/peter-walks-on-water.jpg',
  'prodigal-son': '/images/stories/finished/prodigal-son.jpg',
  'good-samaritan': '/images/stories/finished/good-samaritan.jpg',
  zacchaeus: '/images/stories/finished/zacchaeus.jpg',
  'the-cross': '/images/stories/finished/the-cross.jpg',
  'the-resurrection': '/images/stories/finished/the-resurrection.jpg',
  pentecost: '/images/stories/finished/pentecost.jpg',
  'road-to-damascus': '/images/stories/finished/road-to-damascus.jpg',
};

interface TodayScreenProps {
  streakCount?: number;
  onOpenMap?: () => void;
  onOpenDeck?: () => void;
  onReadChapter: (passage: string) => void;
}

function readStepIndex(storyId: string): number {
  try {
    const raw = localStorage.getItem(`testament_today_loop_${todayKey()}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { step?: number; storyId?: string };
    if (parsed?.storyId && parsed.storyId !== storyId) return 0;
    // Older saves had no story id and always belonged to David and Goliath.
    if (!parsed?.storyId && storyId !== 'david-and-goliath') return 0;
    return typeof parsed?.step === 'number' ? parsed.step : 0;
  } catch {
    return 0;
  }
}

export function TodayScreen({ streakCount = 0, onOpenMap, onOpenDeck, onReadChapter }: TodayScreenProps) {
  const { t } = useLanguage();
  const [storyId] = useState(() => getDailyStoryId());
  const story = getStoryById(storyId);
  const steps = useMemo(
    () => [t('today.step.swipe'), t('today.step.play'), t('today.step.lockIn'), t('today.step.collect')] as const,
    [t]
  );
  const [step, setStep] = useState(() => Math.min(readStepIndex(storyId), 4));
  const [playing, setPlaying] = useState(false);

  const tomorrow = useMemo(() => getStoryById(nextStoryIdAfter(storyId)) ?? null, [storyId]);

  if (!story) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-fg-muted">{t('today.noStory')}</div>;
  }

  const persist = (next: number) => {
    try { localStorage.setItem(`testament_today_loop_${todayKey()}`, JSON.stringify({ step: next, storyId })); } catch { /* ignore */ }
    setStep(next);
  };

  const done = step >= steps.length;
  const scene = STORY_SCENES[story.id] ?? '/images/valley_battlefield-1376.webp';

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-1 pb-1">
      <PageHeader
        className="!mb-3"
        title={t('today.title')}
        subtitle={streakCount > 0
          ? t('today.streak', { count: streakCount })
          : t('today.freshStart')}
      />

      <div className="flex flex-1 flex-col rounded-3xl border border-line bg-surface-raised p-4 sm:p-5 shadow-[0_1px_0_rgba(178,123,63,0.08),0_8px_28px_rgba(31,35,48,0.05)]">
        <div className="mb-4 flex items-start justify-between gap-1">
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
          <div className="flex flex-1 flex-col items-center justify-center space-y-3 text-center">
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
          <div className="flex flex-1 flex-col">
            <p className="text-small text-fg-muted">{t('today.estMinutes', { passage: story.passage, minutes: story.estMinutes })}</p>
            <h2 className="mt-1 font-serif text-title-1 text-fg">{story.title}</h2>
            <div className="relative mt-3 min-h-40 flex-1 overflow-hidden rounded-2xl bg-stone-900">
              <img
                src={scene}
                alt={story.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="pt-3">
              <p className="text-body text-fg-muted">{t('today.swipeIntro')}</p>
              {tomorrow && (
                <p className="mt-2 text-small text-fg-muted">
                  {t('today.tomorrow', { title: tomorrow.title, passage: tomorrow.passage })}
                </p>
              )}
              <button type="button" className="btn-primary mt-3 w-full inline-flex items-center justify-center gap-2" onClick={() => { celebrate('tap'); setPlaying(true); }}>
                <Play className="w-4 h-4" /> {isStoryCompleted(story.id) ? t('today.playAgain') : t('today.playStory')}
              </button>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="flex flex-1 flex-col">
            <StoryQuiz story={story} onDone={() => { persist(2); }} />
          </div>
        ) : step === 2 ? (
          <div className="flex flex-1 flex-col">
            <LockInStep verse={story.verse} onDone={() => { persist(3); }} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
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
