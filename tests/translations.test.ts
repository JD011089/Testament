import { test, expect } from '@playwright/test';
import { getAllVerses } from '../src/utils/verseRegistry';

// The bundled corpus is the app's own modern-English rendering; it is not the
// World English Bible. Only text fetched live through bibleService may claim a
// named translation, so no bundled verse may carry the WEB label.
test('no bundled English verse claims an unverified named translation', () => {
  const verses = getAllVerses('en');
  expect(verses.length).toBeGreaterThan(0);
  const mislabeled = verses.filter((v) => v.translation === 'WEB');
  expect(mislabeled.map((v) => v.reference)).toEqual([]);
});

test('bundled verses carry the honest Plain English label', () => {
  const verses = getAllVerses('en');
  const labeled = verses.filter((v) => v.translation === 'Plain English');
  expect(labeled.length).toBe(verses.length);
});
