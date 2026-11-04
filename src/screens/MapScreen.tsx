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
import { ArrowLeft, Check, Lock, Play, Sparkles, X } from 'lucide-react';

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
  const totalPlayable = STORY_STOPS.filter(isFullStory).length;
  const currentArc = nextPlayable?.arc ?? null;
  const journeyArcs: JourneyArc[] = STORY_ARCS.flatMap((arc) => {
    const stops = STORY_STOPS.filter((stop) => stop.arc === arc);
    if (stops.length === 0) return [];
    const playable = stops.filter(isFullStory);
    const done = playable.filter((stop) => completedIds.includes(stop.id)).length;
    const cover = stops.find((stop) => stop.id === todayId) ?? stops.find((stop) => completedIds.includes(stop.id)) ?? stops[0];
    let status: JourneyArc['status'] = 'open';
    if (playable.length === 0) status = 'locked';
    else if (done === playable.length) status = 'complete';
    else if (arc === currentArc) status = 'current';
    return [{
      arc,
      cover: getStoryIllustrationUrl(cover.id),
      status,
      label:
        status === 'complete' ? t('map.storyComplete')
        : status === 'current' ? (stops.some((stop) => stop.id === todayId) ? t('map.today') : t('map.upNext'))
        : status === 'locked' ? t('map.comingSoon')
        : t('map.progressCount', { done, total: playable.length }),
    }];
  });

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
      <div className="w-full min-w-0 max-w-2xl mx-auto px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:pb-8">
        <PageHeader
          className="!mb-3"
          eyebrow={t('map.eyebrow')}
          title={t('map.title')}
          subtitle={t('map.walked', { done: completedIds.length, total: totalPlayable })}
        />
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70" aria-hidden="true">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-hover to-accent transition-all"
              style={{ width: `${totalPlayable ? Math.round((completedIds.length / totalPlayable) * 100) : 0}%` }}
            />
          </div>
          {(onQuickPlay || nextPlayable) && (
            <button
              type="button"
              className="inline-flex !min-h-9 items-center gap-1.5 rounded-full bg-fg px-3.5 text-xs font-bold text-surface transition hover:opacity-90 active:scale-95"
              onClick={() => {
                celebrate('tap');
                if (nextPlayable) {
                  onPlayStory(nextPlayable.id);
                  return;
                }
                onQuickPlay?.();
              }}
            >
              {t('map.continue')} <Play className="h-3 w-3 fill-current" aria-hidden="true" />
            </button>
          )}
        </div>

        <JourneyRoad
          arcs={journeyArcs}
          onOpenArc={(arc) => {
            celebrate('tap');
            setActiveArc(arc);
          }}
        />
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

interface JourneyArc {
  arc: StoryArc;
  cover: string;
  status: 'complete' | 'current' | 'open' | 'locked';
  label: string;
}

const ROW_HEIGHT = 128;
/** Horizontal node positions (percent) so the road snakes down the page. */
const SNAKE = [50, 24, 74, 30, 70, 26, 50];

function JourneyRoad({ arcs, onOpenArc }: { arcs: JourneyArc[]; onOpenArc: (arc: StoryArc) => void }) {
  const height = arcs.length * ROW_HEIGHT;
  const points = arcs.map((_, i) => ({ x: SNAKE[i % SNAKE.length], y: i * ROW_HEIGHT + ROW_HEIGHT / 2 }));
  const segment = (i: number) => {
    const a = points[i];
    const b = points[i + 1];
    const mid = (b.y - a.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + mid}, ${b.x} ${b.y - mid}, ${b.x} ${b.y}`;
  };
  // A stretch of road turns gold once the era it leaves from is finished.
  const gilded = (i: number) => arcs[i].status === 'complete';

  return (
    <div className="relative mx-auto mt-6 w-full max-w-md" style={{ height }}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {points.slice(0, -1).map((_, i) => (
          <path
            key={i}
            d={segment(i)}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            className={gilded(i) ? 'stroke-accent' : 'stroke-line-strong'}
            strokeWidth={gilded(i) ? 3 : 2.5}
            strokeDasharray={gilded(i) ? undefined : '1 9'}
          />
        ))}
      </svg>

      {arcs.map((item, i) => {
        const { x, y } = points[i];
        const big = item.status === 'current';
        const size = big ? 84 : 62;
        const labelOnRight = x <= 50;
        return (
          <button
            key={item.arc}
            type="button"
            onClick={() => onOpenArc(item.arc)}
            aria-label={`${item.arc}, ${item.label}`}
            className="group absolute !min-h-0"
            style={{ left: `${x}%`, top: y }}
          >
            <span
              className={`absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full transition group-hover:scale-105 group-active:scale-95 ${
                item.status === 'locked'
                  ? 'grid place-items-center border-2 border-dashed border-line-strong bg-surface text-fg-muted'
                  : big
                    ? 'border-4 border-accent bg-surface shadow-[0_0_0_6px_rgb(var(--color-accent)/0.3),0_0_26px_rgb(var(--color-accent)/0.75)]'
                    : 'border-[3px] border-accent-border bg-surface shadow-md'
              }`}
              style={{ width: size, height: size }}
            >
              {item.status === 'locked' ? (
                <Lock className="h-5 w-5" aria-hidden="true" />
              ) : (
                <img src={item.cover} alt="" className="h-full w-full object-cover" />
              )}
              {item.status === 'complete' && (
                <span className="absolute inset-x-0 bottom-0 grid h-5 place-items-center bg-accent/90 text-accent-on">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
              )}
            </span>
            <span
              className={`absolute top-0 block w-32 -translate-y-1/2 ${labelOnRight ? 'text-left' : 'text-right'}`}
              style={labelOnRight ? { left: size / 2 + 12 } : { right: size / 2 + 12 }}
            >
              <span className={`block font-serif text-[0.95rem] font-semibold leading-tight ${item.status === 'locked' ? 'text-fg-muted' : 'text-fg'}`}>{item.arc}</span>
              <span
                className={`mt-0.5 block text-[11px] ${
                  item.status === 'current'
                    ? 'font-display font-bold uppercase tracking-[0.14em] text-accent-text'
                    : item.status === 'complete'
                      ? 'font-semibold text-accent-text'
                      : 'text-fg-muted'
                }`}
              >
                {item.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
