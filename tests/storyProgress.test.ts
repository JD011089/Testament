import { test, expect } from '@playwright/test';
import {
  getStoryProgress,
  saveStoryCursor,
  markStoryComplete,
  isStoryCompleted,
  getStoryCardIndex,
  resetStoryProgress,
  getCompletedStoryIds,
  STORY_PROGRESS_KEY,
  type StorageLike
} from '../src/utils/storyProgress';

function fakeStorage(): StorageLike & { dump(): Record<string, string> } {
  const map: Record<string, string> = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => { map[k] = v; },
    dump: () => map
  };
}

test.describe('story progress keyed by storyId', () => {
  test('advancing one story never affects another', () => {
    const s = fakeStorage();
    saveStoryCursor('david-and-goliath', 4, s);
    saveStoryCursor('jonah', 1, s);
    expect(getStoryCardIndex('david-and-goliath', s)).toBe(4);
    expect(getStoryCardIndex('jonah', s)).toBe(1);
    expect(getStoryCardIndex('creation', s)).toBe(0);
  });

  test('exact resume persists the cursor across a reload', () => {
    const s = fakeStorage();
    saveStoryCursor('david-and-goliath', 3, s);
    expect(s.dump()[STORY_PROGRESS_KEY]).toContain('david-and-goliath');
    // fresh read = reload
    expect(getStoryProgress('david-and-goliath', s)?.cardIndex).toBe(3);
  });

  test('completion is sticky and does not reset the cursor', () => {
    const s = fakeStorage();
    saveStoryCursor('david-and-goliath', 7, s);
    markStoryComplete('david-and-goliath', s);
    expect(isStoryCompleted('david-and-goliath', s)).toBe(true);
    expect(getStoryCardIndex('david-and-goliath', s)).toBe(7);
    // moving the cursor does not clear completion
    saveStoryCursor('david-and-goliath', 2, s);
    expect(isStoryCompleted('david-and-goliath', s)).toBe(true);
  });

  test('completed ids are listed', () => {
    const s = fakeStorage();
    markStoryComplete('jonah', s);
    markStoryComplete('ruth', s);
    saveStoryCursor('creation', 1, s);
    expect(getCompletedStoryIds(s).sort()).toEqual(['jonah', 'ruth']);
  });

  test('reset clears a single story only', () => {
    const s = fakeStorage();
    saveStoryCursor('jonah', 2, s);
    saveStoryCursor('ruth', 2, s);
    resetStoryProgress('jonah', s);
    expect(getStoryProgress('jonah', s)).toBeNull();
    expect(getStoryCardIndex('ruth', s)).toBe(2);
  });
});