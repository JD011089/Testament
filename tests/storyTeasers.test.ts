import { test, expect } from '@playwright/test';
import { STORIES } from '../src/content/stories';
import { STORY_TEASERS } from '../src/content/stories/teasers';

test('every playable story has a Today teaser with hooks in all languages', () => {
  const missing = STORIES.filter((story) => !STORY_TEASERS[story.id]).map((story) => story.id);
  expect(missing).toEqual([]);
  for (const [id, teaser] of Object.entries(STORY_TEASERS)) {
    for (const lang of ['en', 'es', 'fr'] as const) {
      expect(teaser.hook[lang]?.trim(), `${id} hook (${lang})`).toBeTruthy();
    }
  }
});

test("each teaser's key phrase is an exact excerpt of its story verse", () => {
  const wrong = STORIES
    .filter((story) => STORY_TEASERS[story.id])
    .filter((story) => !story.verse.text.includes(STORY_TEASERS[story.id].keyPhrase))
    .map((story) => `${story.id}: "${STORY_TEASERS[story.id].keyPhrase}"`);
  expect(wrong).toEqual([]);
});
