import { test, expect } from '@playwright/test';
import {
  recordReview,
  getDueVerses,
  getMemoryState,
  isMastered,
  reviewIntervalDays,
  REVIEW_INTERVALS,
  MEMORY_STATE_KEY,
  type StorageLike
} from '../src/utils/spacedRepetition';

function fakeStorage(): StorageLike & { dump(): Record<string, string> } {
  const map: Record<string, string> = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => { map[k] = v; },
    dump: () => map
  };
}

test.describe('spaced repetition scheduler', () => {
  test('intervals follow 1, 3, 7, 14, 30', () => {
    expect(REVIEW_INTERVALS).toEqual([1, 3, 7, 14, 30]);
    expect(reviewIntervalDays(0)).toBe(1);
    expect(reviewIntervalDays(1)).toBe(3);
    expect(reviewIntervalDays(4)).toBe(30);
    expect(reviewIntervalDays(99)).toBe(30);
  });

  test('a correct answer advances the level and schedules the next interval', () => {
    const s = fakeStorage();
    const state = recordReview('1SA.17.47', 1, true, s, '2026-01-01');
    expect(state.level).toBe(2);
    expect(state.reps).toBe(1);
    expect(state.dueDate).toBe('2026-01-02');
    expect(s.dump()[MEMORY_STATE_KEY]).toContain('1SA.17.47');
  });

  test('a miss drops a level and comes back due today', () => {
    const s = fakeStorage();
    recordReview('x', 1, true, s, '2026-01-01');
    recordReview('x', 2, true, s, '2026-01-04');
    const missed = recordReview('x', 3, false, s, '2026-01-05');
    expect(missed.level).toBe(2);
    expect(missed.lapses).toBe(1);
    expect(missed.dueDate).toBe('2026-01-05');
  });

  test('mastered only after level 4 on three separate days', () => {
    const s = fakeStorage();
    recordReview('m', 4, true, s, '2026-01-01');
    expect(isMastered(getMemoryState('m', s))).toBe(false);
    recordReview('m', 4, true, s, '2026-01-02');
    expect(isMastered(getMemoryState('m', s))).toBe(false);
    const third = recordReview('m', 4, true, s, '2026-01-03');
    expect(isMastered(third)).toBe(true);
    // same-day repeat does not count twice
    recordReview('m', 4, true, s, '2026-01-03');
    expect(getMemoryState('m', s).masteredDays).toHaveLength(3);
  });

  test('getDueVerses returns only reviews due on or before today', () => {
    const s = fakeStorage();
    recordReview('a', 1, true, s, '2026-01-01'); // due 2026-01-02
    recordReview('b', 1, true, s, '2026-01-10'); // due 2026-01-11
    const due = getDueVerses(s, '2026-01-05');
    expect(due.map((v) => v.ref)).toEqual(['a']);
  });
});