/**
 * Story Swipes content registry.
 *
 * Full stories live in their own JSON file. The remaining map stops are stubs
 * (title / passage / arc / order) until they are authored. Full stories always
 * win over a stub with the same id.
 */

import type { Story, StoryEntry, StoryStub } from '../../types/story';
import { validateStory } from '../../utils/storySchema';
import davidAndGoliathRaw from './david-and-goliath.json' with { type: 'json' };
import stubsRaw from './stubs.json' with { type: 'json' };

export const STORY_STUBS: StoryStub[] = (stubsRaw as StoryStub[]).slice().sort((a, b) => a.order - b.order);

const fullStoryResult = validateStory(davidAndGoliathRaw);
export const STORY_VALIDATION_ERRORS: string[] = fullStoryResult.ok ? [] : fullStoryResult.errors;

export const STORIES: Story[] = fullStoryResult.ok ? [fullStoryResult.story] : [];

const fullStoryById = new Map(STORIES.map((story) => [story.id, story]));

/** Every stop on the map, in order: full stories where authored, stubs elsewhere. */
export const STORY_STOPS: StoryEntry[] = STORY_STUBS
  .map((stub) => fullStoryById.get(stub.id) ?? stub)
  .sort((a, b) => a.order - b.order);

// Include any full story that is missing from the stub list so nothing is lost.
for (const story of STORIES) {
  if (!STORY_STOPS.some((entry) => entry.id === story.id)) STORY_STOPS.push(story);
}

export function getStoryById(id: string): Story | null {
  return fullStoryById.get(id) ?? null;
}

export function getStoryStop(id: string): StoryEntry | null {
  return STORY_STOPS.find((entry) => entry.id === id) ?? null;
}

export function getStoriesForArc(arc: StoryEntry['arc']): StoryEntry[] {
  return STORY_STOPS.filter((entry) => entry.arc === arc);
}
