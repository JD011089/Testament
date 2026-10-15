/**
 * Spaced repetition for verse memory.
 *
 * One fade-out ladder per verse (levels 1-4). Reviews come due on the
 * 1 / 3 / 7 / 14 / 30 day intervals. A verse is "mastered" only after a correct
 * Level 4 recall on 3 separate days.
 */

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export interface MemoryState {
  ref: string;
  level: 1 | 2 | 3 | 4;
  reps: number;
  lapses: number;
  dueDate: string;
  lastReviewed: string;
  masteredDays: string[];
}

export type MemoryStateMap = Record<string, MemoryState>;

export const MEMORY_STATE_KEY = 'testament_memory_ladder';

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

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

function readMap(storage: StorageLike | null = defaultStorage()): MemoryStateMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(MEMORY_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as MemoryStateMap;
  } catch {
    return {};
  }
}

function writeMap(map: MemoryStateMap, storage: StorageLike | null = defaultStorage()): MemoryStateMap {
  if (storage) {
    try {
      storage.setItem(MEMORY_STATE_KEY, JSON.stringify(map));
    } catch {
      // ignore quota failures
    }
  }
  return map;
}

export function getMemoryState(ref: string, storage: StorageLike | null = defaultStorage()): MemoryState {
  return readMap(storage)[ref] ?? {
    ref,
    level: 1,
    reps: 0,
    lapses: 0,
    dueDate: todayKey(),
    lastReviewed: '',
    masteredDays: []
  };
}

export function isMastered(state: MemoryState): boolean {
  return state.masteredDays.length >= 3;
}

export function reviewIntervalDays(reps: number): number {
  return REVIEW_INTERVALS[Math.min(reps, REVIEW_INTERVALS.length - 1)];
}

/**
 * Record a review outcome. A correct answer advances the level (up to 4) and
 * pushes the next due date out. A miss drops one level and brings it back sooner.
 */
export function recordReview(
  ref: string,
  level: 1 | 2 | 3 | 4,
  correct: boolean,
  storage: StorageLike | null = defaultStorage(),
  dateKey: string = todayKey()
): MemoryState {
  const map = readMap(storage);
  const current = map[ref] ?? getMemoryState(ref, storage);
  let next: MemoryState;

  if (correct) {
    const nextLevel = Math.min(4, level + 1) as 1 | 2 | 3 | 4;
    const reps = current.reps + 1;
    const masteredDays = level === 4 && !current.masteredDays.includes(dateKey)
      ? [...current.masteredDays, dateKey]
      : current.masteredDays;
    next = {
      ...current,
      level: nextLevel,
      reps,
      dueDate: addDays(dateKey, reviewIntervalDays(reps - 1)),
      lastReviewed: dateKey,
      masteredDays
    };
  } else {
    next = {
      ...current,
      level: Math.max(1, current.level - 1) as 1 | 2 | 3 | 4,
      lapses: current.lapses + 1,
      dueDate: dateKey,
      lastReviewed: dateKey
    };
  }

  map[ref] = next;
  writeMap(map, storage);
  return next;
}

/** Verses whose review is due on or before today. */
export function getDueVerses(storage: StorageLike | null = defaultStorage(), dateKey: string = todayKey()): MemoryState[] {
  return Object.values(readMap(storage))
    .filter((state) => !isMastered(state) && state.dueDate <= dateKey)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}