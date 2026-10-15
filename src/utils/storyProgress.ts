/**
 * Story progress, keyed by storyId (never by date). Switching stories can never
 * show another story's answers because every entry is namespaced by story id.
 */

export const STORY_PROGRESS_KEY = 'testament_story_progress';

export interface StoryProgressEntry {
  cardIndex: number;
  completed: boolean;
  completedAt?: string;
  updatedAt: string;
}

export type StoryProgressMap = Record<string, StoryProgressEntry>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // ignore
  }
  return null;
}

function readMap(storage: StorageLike | null = defaultStorage()): StoryProgressMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORY_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as StoryProgressMap;
  } catch {
    return {};
  }
}

function writeMap(map: StoryProgressMap, storage: StorageLike | null = defaultStorage()): StoryProgressMap {
  if (storage) {
    try {
      storage.setItem(STORY_PROGRESS_KEY, JSON.stringify(map));
    } catch {
      // ignore quota failures
    }
  }
  return map;
}

export function getStoryProgress(storyId: string, storage: StorageLike | null = defaultStorage()): StoryProgressEntry | null {
  return readMap(storage)[storyId] ?? null;
}

export function getStoryCardIndex(storyId: string, storage: StorageLike | null = defaultStorage()): number {
  return getStoryProgress(storyId, storage)?.cardIndex ?? 0;
}

export function isStoryCompleted(storyId: string, storage: StorageLike | null = defaultStorage()): boolean {
  return getStoryProgress(storyId, storage)?.completed ?? false;
}

/** Persist the current card cursor for a story, resuming exactly where left off. */
export function saveStoryCursor(storyId: string, cardIndex: number, storage: StorageLike | null = defaultStorage()): StoryProgressEntry {
  const map = readMap(storage);
  const existing = map[storyId];
  const entry: StoryProgressEntry = {
    cardIndex,
    completed: existing?.completed ?? false,
    ...(existing?.completedAt ? { completedAt: existing.completedAt } : {}),
    updatedAt: new Date().toISOString()
  };
  map[storyId] = entry;
  writeMap(map, storage);
  return entry;
}

export function markStoryComplete(storyId: string, storage: StorageLike | null = defaultStorage()): StoryProgressEntry {
  const map = readMap(storage);
  const entry: StoryProgressEntry = {
    cardIndex: getStoryProgress(storyId, storage)?.cardIndex ?? 0,
    completed: true,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  map[storyId] = entry;
  writeMap(map, storage);
  return entry;
}

export function resetStoryProgress(storyId: string, storage: StorageLike | null = defaultStorage()): StoryProgressMap {
  const map = readMap(storage);
  delete map[storyId];
  return writeMap(map, storage);
}

export function getCompletedStoryIds(storage: StorageLike | null = defaultStorage()): string[] {
  const map = readMap(storage);
  return Object.entries(map).filter(([, entry]) => entry.completed).map(([id]) => id);
}
