import { test, expect } from '@playwright/test';

// Minimal in-memory localStorage so the browser-side modules run under Node.
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => { store.set(k, String(v)); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() { return store.size; },
} as Storage;

const deckCard = (ref: string) => ({
  id: `verse:${ref}`, type: 'verse' as const, ref, translation: 'WEB',
  text: 'Sample text.', storyId: 'red-sea', storyTitle: 'Red Sea', strength: 'bronze' as const,
  addedAt: new Date().toISOString(),
});

test.beforeEach(() => store.clear());

test('a collected verse that was never practiced is ready as new', async () => {
  const { getDeckReviewQueue } = await import('../src/utils/deckReview');
  const queue = getDeckReviewQueue([deckCard('Exodus 14:14')]);
  expect(queue.map((i) => [i.card.ref, i.status])).toEqual([['Exodus 14:14', 'new']]);
});

test('practice history recorded by Practice decides due vs later', async () => {
  const { getDeckReviewItems, getDeckReviewQueue } = await import('../src/utils/deckReview');
  const { recordFSRSReview } = await import('../src/utils/fsrsEngine');
  const { registerDynamicBibleVerse } = await import('../src/utils/verseRegistry');

  // Practice records under the registry id for the verse, exactly as WordForge does.
  // (Labelled 'Plain English' so this shared registry entry can't trip the translations test.)
  const verse = registerDynamicBibleVerse('Exodus 14:14', 'Sample text.', 'Plain English');
  recordFSRSReview(verse.id, 4); // "easy": next review is days away

  const items = getDeckReviewItems([deckCard('Exodus 14:14')]);
  expect(items[0].status).toBe('later');
  expect(items[0].practice?.verseId).toBe(verse.id);
  expect(getDeckReviewQueue([deckCard('Exodus 14:14')])).toEqual([]);

  // Make it overdue.
  const cards = JSON.parse(store.get('testament_fsrs_cards')!);
  cards[verse.id].nextReviewDate = '2020-01-01';
  store.set('testament_fsrs_cards', JSON.stringify(cards));
  expect(getDeckReviewQueue([deckCard('Exodus 14:14')]).map((i) => i.status)).toEqual(['due']);
});

test('due reviews come before never-practiced verses', async () => {
  const { getDeckReviewQueue } = await import('../src/utils/deckReview');
  const { registerDynamicBibleVerse } = await import('../src/utils/verseRegistry');
  const verse = registerDynamicBibleVerse('Genesis 1:1', 'Sample text.', 'Plain English');
  store.set('testament_fsrs_cards', JSON.stringify({
    [verse.id]: { verseId: verse.id, stability: 1, difficulty: 5, reps: 1, lapses: 0, state: 'review', lastReviewDate: '2019-12-30', nextReviewDate: '2020-01-01', retrievability: 1 },
  }));
  const queue = getDeckReviewQueue([deckCard('Exodus 14:14'), deckCard('Genesis 1:1')]);
  expect(queue.map((i) => [i.card.ref, i.status])).toEqual([['Genesis 1:1', 'due'], ['Exodus 14:14', 'new']]);
});
