import { STORY_ARCS, isFullStory, type StoryArc } from '../types/story';
import { STORY_STOPS } from '../content/stories';
import { isStoryCompleted } from '../utils/storyProgress';
import { celebrate } from '../utils/feedback';
import { Lock, Play, Sparkles } from 'lucide-react';

interface MapScreenProps {
  onPlayStory: (storyId: string) => void;
  onQuickPlay?: () => void;
}

export function MapScreen({ onPlayStory, onQuickPlay }: MapScreenProps) {
  const completedIds = STORY_STOPS.filter((stop) => isStoryCompleted(stop.id)).map((stop) => stop.id);
  const nextStop = STORY_STOPS.find((stop) => !completedIds.includes(stop.id)) ?? null;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-title-1 font-serif text-fg">Story Map</h1>
        {onQuickPlay && (
          <button type="button" className="btn-secondary" onClick={() => { celebrate('tap'); onQuickPlay(); }}>
            Quick play
          </button>
        )}
      </header>

      {STORY_ARCS.map((arc: StoryArc) => {
        const stops = STORY_STOPS.filter((stop) => stop.arc === arc);
        if (stops.length === 0) return null;
        return (
          <section key={arc} className="space-y-3">
            <h2 className="text-title-3 font-serif text-fg">{arc}</h2>
            <div className="relative border-l-2 border-line pl-4 space-y-3">
              {stops.map((stop) => {
                const completed = isStoryCompleted(stop.id);
                const isNext = nextStop?.id === stop.id;
                const playable = isFullStory(stop);
                const locked = !completed && !isNext && !playable;
                return (
                  <div
                    key={stop.id}
                    className={[
                      'relative rounded-2xl border p-3 transition-all',
                      completed ? 'border-accent bg-accent/10 shadow-glow-gold'
                        : isNext ? 'border-accent animate-pulse'
                          : 'border-line bg-surface-raised opacity-70'
                    ].join(' ')}
                  >
                    <span className={[
                      'absolute -left-[1.65rem] top-4 w-3 h-3 rounded-full',
                      completed ? 'bg-accent' : isNext ? 'bg-accent/70' : 'bg-line'
                    ].join(' ')} aria-hidden="true" />
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-title-4 text-fg truncate">{stop.title}</h3>
                        {(completed || isNext) && <p className="text-small text-fg-muted">{stop.passage}</p>}
                        {locked && (
                          <p className="text-small text-fg-muted inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Coming soon</p>
                        )}
                      </div>
                      {completed && (
                        <button type="button" className="btn-secondary shrink-0" onClick={() => { celebrate('tap'); onPlayStory(stop.id); }}>
                          <Play className="w-4 h-4" /> Replay
                        </button>
                      )}
                      {isNext && playable && (
                        <button type="button" className="btn-primary shrink-0" onClick={() => { celebrate('tap'); onPlayStory(stop.id); }}>
                          <Sparkles className="w-4 h-4" /> Play
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