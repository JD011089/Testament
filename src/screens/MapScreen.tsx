import { useState } from 'react';
import { STORY_ARCS, isFullStory, type StoryArc } from '../types/story';
import { STORY_STOPS } from '../content/stories';
import { getDailyStoryId } from '../utils/dailyStory';
import { isStoryCompleted } from '../utils/storyProgress';
import { celebrate } from '../utils/feedback';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { Lock, Play, Sparkles } from 'lucide-react';

interface MapScreenProps {
  onPlayStory: (storyId: string) => void;
  onQuickPlay?: () => void;
}

export function MapScreen({ onPlayStory, onQuickPlay }: MapScreenProps) {
  const { t } = useLanguage();
  const [todayId] = useState(() => getDailyStoryId());
  const completedIds = STORY_STOPS.filter((stop) => isStoryCompleted(stop.id)).map((stop) => stop.id);
  const todayStop = STORY_STOPS.find((stop) => stop.id === todayId) ?? null;
  const nextPlayable =
    (todayStop && isFullStory(todayStop) ? todayStop : null) ??
    STORY_STOPS.find((stop) => isFullStory(stop) && !completedIds.includes(stop.id)) ??
    null;

  return (
    <div className="w-full min-w-0 max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-6">
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

      {STORY_ARCS.map((arc: StoryArc) => {
        const stops = STORY_STOPS.filter((stop) => stop.arc === arc);
        if (stops.length === 0) return null;
        const arcDone =
          stops.length > 0 &&
          stops.every((stop) => !isFullStory(stop) || isStoryCompleted(stop.id)) &&
          stops.some((stop) => isFullStory(stop));
        return (
          <section key={arc} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-title-3 font-serif text-fg">{arc}</h2>
              {arcDone && (
                <span className="inline-flex items-center gap-1 text-label uppercase rounded-full border border-accent/50 bg-accent/10 text-accent px-2 py-0.5">
                  <Sparkles className="w-3 h-3" /> {t('map.arcComplete')}
                </span>
              )}
            </div>
            <div className="relative border-l-2 border-line pl-4 space-y-3">
              {stops.map((stop) => {
                const completed = isStoryCompleted(stop.id);
                const playable = isFullStory(stop);
                const isToday = stop.id === todayId;
                const isNext = isToday;
                const locked = !playable;
                return (
                  <div
                    key={stop.id}
                    className={[
                      'relative border px-4 py-3 transition-all',
                      'rounded-3xl',
                      completed
                        ? 'border-accent/60 bg-accent/10'
                        : isNext
                          ? 'border-accent bg-surface-raised shadow-[0_0_0_1px_rgba(212,157,95,0.2),0_6px_20px_rgba(212,157,95,0.12)]'
                          : 'border-line bg-surface-raised',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute -left-[1.65rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full',
                        completed ? 'bg-accent' : isNext ? 'bg-accent/70' : 'bg-line',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between gap-3 min-h-[44px]">
                      <div className="min-w-0 pl-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-title-4 text-fg truncate">{stop.title}</h3>
                          {isToday && (
                            <span className="shrink-0 text-label uppercase rounded-full border border-accent/50 bg-accent/10 text-accent px-2 py-0.5">
                              {t('map.today')}
                            </span>
                          )}
                        </div>
                        {playable && (
                          <p className="text-small text-fg-muted">{stop.passage}</p>
                        )}
                        {locked && (
                          <p className="text-small text-fg-muted inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> {t('map.comingSoon')}
                          </p>
                        )}
                      </div>
                      {playable && completed && (
                        <button
                          type="button"
                          className="btn-secondary shrink-0 !min-h-10 !rounded-full px-3 text-xs"
                          onClick={() => {
                            celebrate('tap');
                            onPlayStory(stop.id);
                          }}
                        >
                          <Play className="w-3.5 h-3.5" /> {t('common.replay')}
                        </button>
                      )}
                      {playable && !completed && (
                        <button
                          type="button"
                          className={
                            isNext
                              ? 'btn-primary shrink-0 !min-h-10 !max-w-none px-4 text-xs'
                              : 'btn-secondary shrink-0 !min-h-10 !rounded-full px-3 text-xs'
                          }
                          onClick={() => {
                            celebrate('tap');
                            onPlayStory(stop.id);
                          }}
                        >
                          {isNext ? <Sparkles className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} {t('common.play')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
