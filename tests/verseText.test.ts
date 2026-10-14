import { test, expect } from '@playwright/test';
import { cleanWord, normalizeWord, stripDiacritics } from '../src/utils/verseText';
import { buildTriviaBank } from '../src/utils/triviaEngine';

test.describe('Unicode-safe verse text handling', () => {
  test('accents are folded, not deleted', () => {
    expect(stripDiacritics('oración')).toBe('oracion');
    expect(normalizeWord('oración')).toBe('oracion');
    expect(cleanWord('oración')).toBe('oracion');
    expect(normalizeWord('corazón')).toBe('corazon');
    expect(normalizeWord('él')).toBe('el');
    expect(normalizeWord('Şükür')).toBe('sukur');
  });

  test('punctuation is stripped but letters survive', () => {
    expect(normalizeWord('"strength,"')).toBe('strength');
    expect(normalizeWord('Lord’s')).toBe('lords');
  });
});

for (const lang of ['en', 'es', 'fr'] as const) {
  test(`fill-blank answers exist in their verse text (${lang})`, () => {
    const bank = buildTriviaBank(lang);
    const blanks = bank.filter((q) => q.kind === 'fill-blank');
    expect(blanks.length).toBeGreaterThan(0);

    for (const q of blanks) {
      const text = q.scripture?.text ?? '';
      const answer = q.options[q.correctIndex];
      const tokens = text.split(/\s+/).map((word) => normalizeWord(word));
      expect(
        tokens.includes(normalizeWord(answer)),
        `answer "${answer}" not found in text for ${q.id} (${lang})`,
      ).toBe(true);
    }
  });
}
