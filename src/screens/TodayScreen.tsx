import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getStoryById } from '../content/stories';
import { getDailyStoryId, nextStoryIdAfter } from '../utils/dailyStory';
import { isStoryCompleted } from '../utils/storyProgress';
import { todayKey } from '../utils/spacedRepetition';
import { celebrate } from '../utils/feedback';
import { useLanguage } from '../context/LanguageContext';
import { StoryPlayer } from '../components/story/StoryPlayer';
import { PageHeader } from '../components/PageHeader';
import { getStoryIllustrationUrl } from '../utils/storyIllustrations';
import { Check, Flame, Map as MapIcon, Layers, Play, Settings } from 'lucide-react';

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
  const [step, setStep] = useState(() => readStepIndex(storyId) >= 1 ? 4 : 0);
  const [playing, setPlaying] = useState(false);

  const tomorrow = useMemo(() => getStoryById(nextStoryIdAfter(storyId)) ?? null, [storyId]);

  if (!story) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-fg-muted">{t('today.noStory')}</div>;
  }

  const persist = (next: number) => {
    try { localStorage.setItem(`testament_today_loop_${todayKey()}`, JSON.stringify({ step: next, storyId })); } catch { /* ignore */ }
    setStep(next);
  };

  const done = step >= 4;
  const scene = getStoryIllustrationUrl(story.id);
  const immersive = step === 0 && !done;

  return (
    <div className={immersive
      ? 'fixed inset-0 z-30 flex flex-col overflow-hidden bg-stone-950 text-white'
      : 'mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:pb-8'}>
      {immersive && (
        <>
          <img
            src={scene}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[36%_center]"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.58)_0%,rgba(12,10,8,0.06)_34%,rgba(12,10,8,0.12)_48%,rgba(12,10,8,0.94)_100%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden="true" />
          <header className="relative z-10 flex items-start justify-between gap-3 px-5 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-8 xl:pt-8">
            <div className="min-w-0">
              <h1 className="font-serif text-3xl leading-none text-white drop-shadow">{t('today.title')}</h1>
              <p className="mt-2 text-small text-white/75">
                {streakCount > 0 ? t('today.streak', { count: streakCount }) : t('today.freshStart')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3 text-label font-semibold text-white backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 text-amber-300" /> {streakCount > 0 ? `${streakCount}d` : 'New'}
              </span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('testament-open-settings'))}
                aria-label={t('nav.settings')}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-md transition hover:bg-black/40"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </header>
        </>
      )}

      {!immersive && (
        <PageHeader
          className="!mb-4"
          title={t('today.title')}
          subtitle={streakCount > 0
            ? t('today.streak', { count: streakCount })
            : t('today.freshStart')}
        />
      )}

        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 rounded-[2rem] border border-line bg-surface-raised px-6 py-10 text-center shadow-sm">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent-text"><Check className="h-7 w-7" /></span>
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
        ) : (
          <div className="relative z-10 mt-auto px-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-8 sm:px-8 xl:pb-12">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex items-end justify-between gap-5">
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">{t('today.storyEyebrow')}</p>
                  <p className="text-small font-medium text-white/75">{story.passage} <span className="mx-1 text-amber-200/70">·</span> {t('today.duration', { minutes: story.estMinutes })}</p>
                  <h2 className="mt-2 max-w-2xl font-serif text-4xl leading-[1.02] text-white drop-shadow sm:text-6xl">{story.title}</h2>
                </div>
                <button
                  type="button"
                  aria-label={isStoryCompleted(story.id) ? t('today.playAgain') : t('today.playStory')}
                  className="mb-1 grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full border border-white/40 bg-accent text-accent-on shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-accent/90 active:scale-95 sm:h-20 sm:w-20"
                  onClick={() => { celebrate('tap'); setPlaying(true); }}
                >
                  <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
                </button>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">{t('today.swipeIntro')}</p>
              {tomorrow && (
                <p className="mt-2 max-w-xl text-xs text-white/60">{t('today.tomorrow', { title: tomorrow.title, passage: tomorrow.passage })}</p>
              )}
            </div>
          </div>
        )}

      {playing && (
        createPortal(
          <StoryPlayer
            story={story}
            onExit={() => setPlaying(false)}
            onReadChapter={onReadChapter}
            onCompleted={() => {
              setPlaying(false);
              persist(4);
            }}
          />,
          document.body
        )
      )}
    </div>
  );
}
