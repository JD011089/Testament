/**
 * Picks the story for a local day.
 *
 * A first visit still opens David and Goliath. After that, each new local day
 * advances one stop on the map so yesterday's story is not presented as new.
 */

import { STORY_STOPS, getStoryById } from '../content/stories';
import type { Story } from '../types/story';
import { todayKey } from './spacedRepetition';
import { listStoryProgress, type StorageLike } from './storyProgress';

export const DAILY_STORY_ASSIGNMENTS_KEY = 'testament_daily_story_assignments';
export const LEGACY_FEATURED_STORY_ID = 'david-and-goliath';

export interface DailyStoryOptions {
  date?: Date;
  assignments?: Record<string, string>;
  /** Stories the person already met before today (completed, played, or the old daily story). */
  seenIds?: string[];
  storyIds?: string[];
}

export interface ResolvedDailyStory {
  storyId: string;
  assignments: Record<string, string>;
}

function storyIdsInOrder(storyIds?: string[]): string[] {
  return storyIds ?? STORY_STOPS.map((stop) => stop.id);
}

export function nextStoryIdAfter(storyId: string, storyIds?: string[]): string {
  const ids = storyIdsInOrder(storyIds);
  const index = ids.indexOf(storyId);
  if (index < 0) return ids[0] ?? LEGACY_FEATURED_STORY_ID;
  return ids[(index + 1) % ids.length];
}

export function resolveDailyStoryId(options: DailyStoryOptions = {}): ResolvedDailyStory {
  const date = options.date ?? new Date();
  const dateKey = todayKey(date);
  const ids = storyIdsInOrder(options.storyIds);
  const assignments = { ...(options.assignments ?? {}) };

  const saved = assignments[dateKey];
  if (saved && ids.includes(saved)) return { storyId: saved, assignments };

  const earlier = Object.keys(assignments).filter((key) => key < dateKey).sort();
  let previous: string | null = null;
  if (earlier.length > 0) {
    const prevId = assignments[earlier[earlier.length - 1]];
    if (ids.includes(prevId)) previous = prevId;
  }

  if (!previous) {
    const seen = new Set((options.seenIds ?? []).filter((id) => ids.includes(id)));
    if (seen.size > 0) {
      for (const id of ids) {
        if (seen.has(id)) previous = id;
      }
    }
  }

  const fallback = ids.includes(LEGACY_FEATURED_STORY_ID) ? LEGACY_FEATURED_STORY_ID : ids[0];
  const storyId = previous ? nextStoryIdAfter(previous, ids) : fallback;
  assignments[dateKey] = storyId;
  return { storyId, assignments };
}

function defaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // ignore
  }
  return null;
}

function readAssignments(storage: StorageLike | null): Record<string, string> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(DAILY_STORY_ASSIGNMENTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const assignments: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') assignments[key] = value;
    }
    return assignments;
  } catch {
    return {};
  }
}

function writeAssignments(storage: StorageLike | null, assignments: Record<string, string>): void {
  if (!storage) return;
  try {
    storage.setItem(DAILY_STORY_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch {
    // ignore quota failures
  }
}

function legacyLoopDates(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const dates: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const match = key?.match(/^testament_today_loop_(\d{4}-\d{2}-\d{2})$/);
      if (match) dates.push(match[1]);
    }
  } catch {
    // ignore
  }
  return dates;
}

export function seenStoryIds(date: Date, storage: StorageLike | null): string[] {
  const dateKey = todayKey(date);
  const seen = new Set<string>();
  const progress = listStoryProgress(storage);
  for (const [id, entry] of Object.entries(progress)) {
    if (entry.completed) seen.add(id);
    if (entry.updatedAt) {
      const updated = new Date(entry.updatedAt);
      if (!Number.isNaN(updated.getTime()) && todayKey(updated) < dateKey) seen.add(id);
    }
  }
  for (const legacy of legacyLoopDates()) {
    if (legacy < dateKey) seen.add(LEGACY_FEATURED_STORY_ID);
  }
  if (storage) {
    const streak = Number(storage.getItem('testament_streak') || 0);
    const lastActive = storage.getItem('testament_last_active');
    if (streak >= 2 || (lastActive && lastActive !== date.toDateString())) {
      seen.add(LEGACY_FEATURED_STORY_ID);
    }
  }
  return [...seen];
}

export function getDailyStoryId(date = new Date(), storage: StorageLike | null = defaultStorage()): string {
  const result = resolveDailyStoryId({
    date,
    assignments: readAssignments(storage),
    seenIds: seenStoryIds(date, storage)
  });
  if (storage) writeAssignments(storage, result.assignments);
  return result.storyId;
}

export function getDailyStory(date = new Date(), storage: StorageLike | null = defaultStorage()): Story | null {
  return getStoryById(getDailyStoryId(date, storage));
}

export function getTomorrowStoryId(date = new Date(), storage: StorageLike | null = defaultStorage()): string {
  return nextStoryIdAfter(getDailyStoryId(date, storage));
}
