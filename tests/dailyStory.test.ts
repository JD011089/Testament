import { test, expect } from '@playwright/test';
import { nextStoryIdAfter, resolveDailyStoryId } from '../src/utils/dailyStory';

const ids = [
  'creation',
  'noah',
  'david-and-goliath',
  'elijah-carmel',
  'road-to-damascus'
];

test('a first visit still opens David and Goliath', () => {
  const resolved = resolveDailyStoryId({
    date: new Date(2026, 9, 20),
    seenIds: [],
    storyIds: ids
  });
  expect(resolved.storyId).toBe('david-and-goliath');
});

test('the next day advances past a story the person already had', () => {
  const yesterday = resolveDailyStoryId({
    date: new Date(2026, 9, 19),
    seenIds: ['david-and-goliath'],
    storyIds: ids
  });
  expect(yesterday.storyId).toBe('elijah-carmel');

  const today = resolveDailyStoryId({
    date: new Date(2026, 9, 20),
    assignments: yesterday.assignments,
    seenIds: ['david-and-goliath'],
    storyIds: ids
  });
  expect(today.storyId).toBe('road-to-damascus');
  expect(today.storyId).not.toBe(yesterday.storyId);
});

test('the same local day keeps the story that was already chosen', () => {
  const first = resolveDailyStoryId({
    date: new Date(2026, 9, 20),
    seenIds: ['david-and-goliath'],
    storyIds: ids
  });
  const again = resolveDailyStoryId({
    date: new Date(2026, 9, 20),
    assignments: first.assignments,
    seenIds: [],
    storyIds: ids
  });
  expect(again.storyId).toBe(first.storyId);
});

test('the cycle wraps to the first stop after the last one', () => {
  expect(nextStoryIdAfter('road-to-damascus', ids)).toBe('creation');
});
