import { getStoryById, STORY_STOPS } from '../content/stories';
import { isFullStory } from '../types/story';
import { getStoryCardIndex, isStoryCompleted } from '../utils/storyProgress';
import { soundEngine } from '../utils/audio';
import { Play, Sparkles } from 'lucide-react';

/**
 * Phase 2 entry point: a compact "today's story" strip until the full Today
 * loop screen (Phase 3) replaces it.
 */
export function TodayStoryStrip({ onPlay }: { onPlay?: (storyId: string) => void }) {
  const featured = getStoryById('david-and-goliath');
  if (!featured) return null;

  const completed = isStoryCompleted(featured.id);
  const cardIndex = getStoryCardIndex(featured.id);
  const total = featured.cards.length;
  const playedStops = STORY_STOPS.filter((stop) => isFullStory(stop) && isStoryCompleted(stop.id)).length;

  return (
    <section className="mb-6 rounded-3xl border border-accent/40 bg-surface-raised p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 text-label uppercase text-accent mb-2">
        <Sparkles className="w-3.5 h-3.5" /> Today&apos;s story
      </div>
      <h2 className="text-title-2 font-serif text-fg">{featured.title}</h2>
      <p className="text-small text-fg-muted mt-1">
        {featured.passage} • about {featured.estMinutes} minutes
      </p>
      {cardIndex > 0 && !completed && (
        <p className="text-small text-fg-muted mt-1">You left off on card {cardIndex + 1} of {total}.</p>
      )}
      <button
        type="button"
        onClick={() => { soundEngine.playClick(); onPlay?.(featured.id); }}
        className="btn-primary w-full mt-4 inline-flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" /> {completed ? 'Play again' : cardIndex > 0 ? 'Resume story' : 'Play the story'}
      </button>
      {playedStops > 0 && (
        <p className="text-small text-fg-muted mt-2 text-center">{playedStops} story stop{playedStops === 1 ? '' : 's'} finished</p>
      )}
    </section>
  );
}