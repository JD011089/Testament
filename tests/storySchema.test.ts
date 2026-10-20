import { test, expect } from '@playwright/test';
import { validateStory } from '../src/utils/storySchema';
import { STORIES, STORY_STOPS, STORY_VALIDATION_ERRORS, getStoryById } from '../src/content/stories';
import { isFullStory } from '../src/types/story';
import { SCENE_REVEAL_IDS } from '../src/utils/storyScenes';
import { parseScriptureReference } from '../src/utils/scriptureRef';
import { getQuizIssues } from '../src/utils/quizEngine';

const validStory = {
  id: 'test-story',
  title: 'Test Story',
  arc: 'Jesus',
  order: 1,
  passage: 'John 3',
  estMinutes: 3,
  verse: { ref: 'John 3:16', translation: 'WEB', text: 'For God so loved the world...' },
  cards: [
    { type: 'narration', text: 'A short line.' },
    { type: 'payoff' }
  ],
  quiz: [
    { id: 'q1', category: 'who', question: 'Who?', options: ['a', 'b', 'c', 'd'], answerIndex: 0 }
  ]
};

test.describe('story schema validation', () => {
  test('accepts a well-formed story', () => {
    const result = validateStory(validStory);
    expect(result.ok).toBe(true);
  });

  test('rejects an unknown arc', () => {
    const result = validateStory({ ...validStory, arc: 'Nope' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/arc/i);
  });

  test('rejects a quiz with the wrong option count', () => {
    const result = validateStory({ ...validStory, quiz: [{ id: 'q', category: 'what', question: 'Q?', options: ['a', 'b'], answerIndex: 0 }] });
    expect(result.ok).toBe(false);
  });

  test('rejects a scripture line with a non-existent translation', () => {
    const result = validateStory({ ...validStory, verse: { ref: 'John 3:16', translation: 'NIV', text: 'x' } });
    expect(result.ok).toBe(false);
  });

  test('rejects a choice card missing whatHappened', () => {
    const result = validateStory({
      ...validStory,
      cards: [{ type: 'choice', prompt: 'Pick', options: [{ label: 'a', response: 'b' }, { label: 'c', response: 'd' }] }]
    });
    expect(result.ok).toBe(false);
  });
});

test.describe('bundled story content', () => {
  test('all full stories validate', () => {
    expect(STORY_VALIDATION_ERRORS).toEqual([]);
    expect(STORIES.length).toBeGreaterThan(0);
  });

  test('the map has all 24 ordered stops', () => {
    expect(STORY_STOPS.length).toBe(24);
    const orders = STORY_STOPS.map((s) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  test('every map stop is a playable story with a fair quiz', () => {
    expect(STORIES.length).toBe(24);
    expect(STORY_STOPS.every((stop) => isFullStory(stop))).toBe(true);
    for (const story of STORIES) {
      expect(getQuizIssues(story), story.id).toEqual([]);
    }
  });

  test('every tap-reveal scene matches the pieces in that story', () => {
    for (const story of STORIES) {
      for (const card of story.cards) {
        if (card.type !== 'interaction' || card.kind !== 'tap-reveal' || card.config.kind !== 'tap-reveal') continue;
        expect(card.config.scene, story.id).toBe(story.id);
        const ids = [...card.config.reveals.map((item) => item.id)].sort();
        expect(ids, story.id).toEqual([...(SCENE_REVEAL_IDS[story.id] ?? [])].sort());
      }
    }
  });

  test('David and Goliath is the authored story with 8 cards', () => {
    const story = getStoryById('david-and-goliath');
    expect(story).not.toBeNull();
    expect(story!.cards.length).toBe(8);
    expect(story!.quiz.length).toBe(3);
    expect(story!.verse.ref).toBe('1 Samuel 17:47');
    expect(story!.verse.translation).toBe('WEB');
  });

  test('every story scripture reference parses and is valid', () => {
    const story = getStoryById('david-and-goliath')!;
    const refs = [
      story.verse.ref,
      ...story.cards.flatMap((card) => card.type === 'narration' && card.scriptureLine ? [card.scriptureLine.ref] : [])
    ];
    for (const ref of refs) {
      expect(parseScriptureReference(ref), `reference "${ref}" should parse`).not.toBeNull();
    }
  });

  test('story scripture never claims a translation other than WEB/KJV', () => {
    const story = getStoryById('david-and-goliath')!;
    const translations = [
      story.verse.translation,
      ...story.cards.flatMap((card) => card.type === 'narration' && card.scriptureLine ? [card.scriptureLine.translation] : []),
      ...story.cards.flatMap((card) => card.type === 'choice' ? [card.whatHappened.translation] : [])
    ];
    for (const translation of translations) {
      expect(['WEB', 'KJV']).toContain(translation);
    }
  });

  test('quiz distractors never leak the answer word uniquely', () => {
    const story = getStoryById('david-and-goliath')!;
    for (const item of story.quiz) {
      expect(item.answerIndex).toBeGreaterThanOrEqual(0);
      expect(item.options.length).toBe(4);
      // The answer must not be the only option sharing a keyword with the question.
      const questionWords = new Set(item.question.toLowerCase().match(/[a-z']+/g) ?? []);
      const leaking = item.options.filter((option) =>
        (option.toLowerCase().match(/[a-z']+/g) ?? []).some((w) => questionWords.has(w))
      );
      expect(leaking.length, `question "${item.question}" leaks via ${leaking.join(', ')}`).not.toBe(1);
    }
  });
});