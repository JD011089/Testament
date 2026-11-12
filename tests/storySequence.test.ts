import { test, expect } from '@playwright/test';
import { readChoiceLedger, recordChoicePick, STORY_CHOICES_KEY, type ChoiceLedger } from '../src/utils/storyChoices';
import { callbackReferenceErrors, narrationUnitsForStory, resolveSequence, storyHookFor } from '../src/utils/storySequence';
import { STORIES, getStoryById } from '../src/content/stories';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
  };
}

function pick(storyId: string, choiceId: string, optionId: string): ChoiceLedger {
  return { [`${storyId}:${choiceId}`]: { optionId, pickedAt: '2026-01-01T00:00:00.000Z' } };
}

test.describe('Choice ledger', () => {
  test('records a pick and reads it back', () => {
    const storage = memoryStorage();
    recordChoicePick('david-and-goliath', 'david-choice', 'go', storage);
    expect(readChoiceLedger(storage)['david-and-goliath:david-choice'].optionId).toBe('go');
  });

  test('latest pick wins on replay', () => {
    const storage = memoryStorage();
    recordChoicePick('david-and-goliath', 'david-choice', 'go', storage);
    recordChoicePick('david-and-goliath', 'david-choice', 'wait', storage);
    expect(readChoiceLedger(storage)['david-and-goliath:david-choice'].optionId).toBe('wait');
  });

  test('corrupt or missing storage reads as empty and never throws', () => {
    expect(readChoiceLedger(memoryStorage())).toEqual({});
    const storage = memoryStorage();
    storage.setItem(STORY_CHOICES_KEY, '{not json');
    expect(readChoiceLedger(storage)).toEqual({});
    expect(readChoiceLedger(null)).toEqual({});
  });
});

test.describe('Sequence resolver', () => {
  const david = getStoryById('david-and-goliath')!;

  test('with no picks, the choice has no branch or reveal and narration gets clip keys', () => {
    const seq = resolveSequence(david, {});
    expect(seq.some((c) => c.type === 'reveal')).toBe(false);
    expect(seq.find((c) => c.type === 'narration')).toMatchObject({ id: 'dg-valley' });
  });

  test('a pick inserts that branch right after the choice, followed by the reveal', () => {
    const seq = resolveSequence(david, pick('david-and-goliath', 'david-choice', 'go'));
    const choiceAt = seq.findIndex((c) => c.type === 'choice');
    expect(seq[choiceAt + 1]).toMatchObject({ type: 'narration', id: 'dg-go-scene' });
    expect(seq[choiceAt + 2]).toMatchObject({ type: 'reveal', optionIndex: 0 });
  });

  test('the other pick leads to its own branch', () => {
    const seq = resolveSequence(david, pick('david-and-goliath', 'david-choice', 'wait'));
    expect(seq.some((c) => c.type === 'narration' && c.id === 'dg-wait-scene')).toBe(true);
    expect(seq.some((c) => c.type === 'narration' && c.id === 'dg-go-scene')).toBe(false);
  });

  test('a callback in a later story resolves to the variant for the pick, or the fallback', () => {
    const elijah = getStoryById('elijah-carmel')!;
    const withPick = resolveSequence(elijah, pick('david-and-goliath', 'david-choice', 'go'));
    expect(withPick[0]).toMatchObject({ type: 'narration', id: 'ec-callback:go' });
    expect(withPick[0]).toMatchObject({ text: expect.stringContaining('stepped forward') });

    const without = resolveSequence(elijah, {});
    expect(without[0]).toMatchObject({ type: 'narration', id: 'ec-callback:fallback' });
  });

  test('every callback points at an earlier story and a real choice', () => {
    expect(callbackReferenceErrors(STORIES)).toEqual([]);
  });

  test('each narrated unit has a key, so every card can be recorded', () => {
    for (const story of STORIES) {
      for (const unit of narrationUnitsForStory(story)) expect(unit.key).not.toBe('');
    }
  });

  test('the Today teaser follows the pick made in the story', () => {
    expect(storyHookFor(david, pick('david-and-goliath', 'david-choice', 'go'))).toContain('Elijah');
    expect(storyHookFor(david, {})).toBeNull();
  });
});
