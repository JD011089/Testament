import { test, expect } from '@playwright/test';
import { CANON_CATEGORY_BY_THEME, PROVERB_CATEGORY_BY_SCENARIO } from '../src/utils/verseRegistry';
import { CANON_BOOKS } from '../src/data/canon';
import { PROVERB_SCENARIOS } from '../src/data/proverbs';

test.describe('Verse category mapping covers every theme (no silent catch-all)', () => {
  test('every canon life theme has an explicit category', () => {
    const themes = Array.from(new Set(CANON_BOOKS.map((b) => b.lifeTheme)));
    for (const theme of themes) {
      expect(CANON_CATEGORY_BY_THEME[theme], `no category mapped for theme "${theme}"`).toBeDefined();
    }
  });

  test('every proverb scenario category has an explicit entry', () => {
    const categories = Array.from(new Set(PROVERB_SCENARIOS.map((p) => p.category)));
    for (const category of categories) {
      expect(
        PROVERB_CATEGORY_BY_SCENARIO[category],
        `no category mapped for proverb scenario "${category}"`,
      ).toBeDefined();
    }
  });
});
