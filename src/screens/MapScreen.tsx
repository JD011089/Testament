import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { STORY_ARCS, isFullStory, type StoryArc } from '../types/story';
import { STORY_STOPS } from '../content/stories';
import { getDailyStoryId } from '../utils/dailyStory';
import { isStoryCompleted } from '../utils/storyProgress';
import { celebrate } from '../utils/feedback';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { getStoryIllustrationUrl } from '../utils/storyIllustrations';
import { ArrowLeft, ArrowUpRight, Check, Lock, Play, Sparkles, X } from 'lucide-react';

interface MapScreenProps {
  onPlayStory: (storyId: string) => void;
  onQuickPlay?: () => void;
}

export function MapScreen({ onPlayStory, onQuickPlay }: MapScreenProps) {
  const { t } = useLanguage();
  const [todayId] = useState(() => getDailyStoryId());
  const [activeArc, setActiveArc] = useState<StoryArc | null>(null);
  const completedIds = STORY_STOPS.filter((stop) => isStoryCompleted(stop.id)).map((stop) => stop.id);
  const todayStop = STORY_STOPS.find((stop) => stop.id === todayId) ?? null;
  const nextPlayable =
    (todayStop && isFullStory(todayStop) ? todayStop : null) ??
    STORY_STOPS.find((stop) => isFullStory(stop) && !completedIds.includes(stop.id)) ??
    null;
  const activeStops = activeArc ? STORY_STOPS.filter((stop) => stop.arc === activeArc) : [];

  useEffect(() => {
    if (!activeArc) return;
    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveArc(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activeArc]);

  const playStory = (storyId: string) => {
    celebrate('tap');
    setActiveArc(null);
    onPlayStory(storyId);
  };

  return (
    <>
      <div className="w-full min-w-0 max-w-2xl mx-auto px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:pb-8 space-y-6">
        <PageHeader
          title={t('map.title')}
          subtitle={t('map.subtitle')}
          actions={(onQuickPlay || nextPlayable) && (
            <button
              type="button"
              className="btn-quiet text-accent-text font-semibold px-0"
              onClick={() => {
                celebrate('tap');
                if (nextPlayable) {
                  onPlayStory(nextPlayable.id);
                  return;
                }
                onQuickPlay?.();
              }}
            >
              {t('map.quickPlay')}
            </button>
          )}
        />

        <div className="space-y-3">
          {STORY_ARCS.map((arc: StoryArc, index) => {
            const stops = STORY_STOPS.filter((stop) => stop.arc === arc);
            if (stops.length === 0) return null;
            const arcDone =
              stops.some((stop) => isFullStory(stop)) &&
              stops.every((stop) => !isFullStory(stop) || isStoryCompleted(stop.id));
            const availableCount = stops.filter(isFullStory).length;
            return (
              <button
                key={arc}
                type="button"
                onClick={() => {
                  celebrate('tap');
                  setActiveArc(arc);
                }}
                className="group flex min-h-[76px] w-full items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface-raised px-4 py-3 text-left shadow-sm transition hover:border-accent/60 hover:shadow-md active:scale-[0.99]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/10 font-serif text-lg text-accent-text">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-title-3 font-serif text-fg">{arc}</span>
                    {arcDone && <span className="text-label uppercase text-accent-text">Complete</span>}
                  </span>
                  <span className="mt-0.5 block text-small text-fg-muted">
                    {stops.length} stories{availableCount < stops.length ? ` · ${t('map.readyCount', { count: availableCount })}` : ''}
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-fg-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {activeArc && createPortal((
        <div
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-surface text-fg animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-picker-title"
        >
          <header className="relative isolate shrink-0 overflow-hidden border-b border-line bg-gradient-to-br from-accent/20 via-surface-raised to-surface px-5 pb-5 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-16 -z-10 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
            <div className="mx-auto w-full max-w-2xl">
              <button
                type="button"
                className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface/80 px-3 text-small font-semibold text-fg-muted transition hover:text-fg"
                onClick={() => setActiveArc(null)}
                aria-label={t('map.backToMap')}
              >
                <ArrowLeft className="h-4 w-4" /> {t('map.backToMap')}
              </button>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-label uppercase tracking-[0.2em] text-accent-text">{t('map.storyCollection')}</p>
                  <h2 id="story-picker-title" className="font-serif text-3xl leading-tight text-fg sm:text-4xl">{activeArc}</h2>
                  <p className="mt-1 text-small text-fg-muted">{t('map.chooseStory')}</p>
                </div>
                <button
                  type="button"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface/80 text-fg-muted transition hover:bg-surface-raised hover:text-fg"
                  onClick={() => setActiveArc(null)}
                  aria-label={t('common.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto w-full max-w-2xl divide-y divide-line">
              {activeStops.map((stop, index) => {
                const completed = isStoryCompleted(stop.id);
                const playable = isFullStory(stop);
                const isToday = stop.id === todayId;
                return (
                  <article
                    key={stop.id}
                    className={`relative flex min-h-[112px] items-center gap-4 px-5 py-4 transition-colors sm:px-8 ${isToday ? 'bg-accent/10' : 'hover:bg-surface-raised/70'}`}
                  >
                    <span className="w-7 shrink-0 font-serif text-lg text-fg-muted/70">{String(index + 1).padStart(2, '0')}</span>
                    <img
                      src={getStoryIllustrationUrl(stop.id)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      style={{ width: 76, height: 76 }}
                      className="h-[76px] w-[76px] shrink-0 rounded-2xl object-cover shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-title-4 text-fg">{stop.title}</h3>
                        {isToday && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-label uppercase text-accent-text">{t('map.today')}</span>}
                        {completed && <span className="inline-flex items-center gap-1 text-label uppercase text-accent-text"><Check className="h-3 w-3" /> {t('map.storyComplete')}</span>}
                      </div>
                      <p className="mt-1 text-small text-fg-muted">
                        {playable ? stop.passage : <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> {t('map.comingSoon')}</span>}
                      </p>
                    </div>
                    {playable && (
                      <button
                        type="button"
                        className={isToday ? 'btn-primary shrink-0 !min-h-10 !max-w-none px-3 text-xs' : 'btn-secondary shrink-0 !min-h-10 !rounded-full px-3 text-xs'}
                        onClick={() => playStory(stop.id)}
                      >
                        {isToday ? <Sparkles className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        {completed ? t('common.replay') : t('common.play')}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ), document.body)}
    </>
  );
}
