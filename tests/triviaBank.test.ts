import { test, expect } from '@playwright/test';
import { buildTriviaBank, pickRunFromBank, type TriviaQuestion } from '../src/utils/triviaEngine';
import { getVerseById } from '../src/utils/verseRegistry';

// Mirrors the engine's key-token rule (KEY_TOKEN_LENGTH = 4 in triviaEngine.ts).
const STOP_WORDS = new Set([
  'the', 'and', 'but', 'for', 'nor', 'yet', 'so', 'that', 'this', 'these', 'those',
  'with', 'from', 'into', 'onto', 'upon', 'will', 'shall', 'have', 'has', 'had',
  'they', 'them', 'their', 'you', 'your', 'yours', 'him', 'his', 'her', 'hers',
  'she', 'who', 'whom', 'whose', 'which', 'what', 'when', 'where', 'why', 'how',
  'not', 'are', 'was', 'were', 'been', 'being', 'does', 'did', 'doing', 'than',
  'then', 'there', 'here', 'about', 'over', 'under', 'some', 'such',
]);

function keyTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word)),
  );
}

function sharesToken(value: string, forbidden: Set<string>): boolean {
  const tokens = keyTokens(value);
  for (const token of tokens) if (forbidden.has(token)) return true;
  return false;
}

const APP_LABEL_PATTERN = /Canon Codex|Proverbs Codex|Psalms Field Medic|known as which title|in the Canon|Codename/i;

const bank: TriviaQuestion[] = buildTriviaBank('en');

test.describe('Trivia Gauntlet — generated question bank integrity', () => {
  test('bank is non-trivial', () => {
    expect(bank.length).toBeGreaterThan(300);
  });

  test('every question has exactly one correct option, uniquely stated', () => {
    for (const q of bank) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);

      const correct = q.options[q.correctIndex];
      const occurrences = q.options.filter((option) => option === correct).length;
      expect(occurrences, `duplicate correct option in ${q.id}`).toBe(1);

      expect(new Set(q.options).size, `duplicate options in ${q.id}`).toBe(q.options.length);
    }
  });

  test('no option repeats a significant word from the question stem (no giveaway)', () => {
    for (const q of bank) {
      const stem = keyTokens(q.prompt);
      for (const option of q.options) {
        expect(
          sharesToken(option, stem),
          `option "${option}" leaks the prompt keyword in ${q.id}`,
        ).toBe(false);
      }
    }
  });

  test('no app-label questions survive', () => {
    for (const q of bank) {
      expect(q.prompt, `app-label prompt in ${q.id}`).not.toMatch(APP_LABEL_PATTERN);
      expect(['book-theme', 'hero-title', 'verse-theme']).not.toContain(q.kind);
    }
  });

  test('no invented in-app story titles are asked as questions', () => {
    for (const q of bank) {
      // The removed "Which story belongs to X?" generator produced this kind.
      expect(['hero-story']).not.toContain(q.kind);
      expect(q.prompt, `invented-title prompt in ${q.id}`).not.toMatch(/which story belongs to/i);
    }
  });

  test('no duplicate references produce two question sets', () => {
    const references = bank
      .filter((q) => q.id.startsWith('v-ref:'))
      .map((q) => q.options[q.correctIndex]);
    expect(new Set(references).size).toBe(references.length);
  });

  test('non-dilemma scripture references resolve back to a verse', () => {
    for (const q of bank) {
      if (!q.scripture) continue;
      if (q.kind.startsWith('dilemma')) continue; // dilemma anchors may be compound refs
      expect(
        getVerseById(q.scripture.reference, 'en'),
        `unresolvable reference ${q.scripture.reference} in ${q.id}`,
      ).not.toBeNull();
    }
  });

  test('Psalm 42 is credited to the sons of Korah, not David', () => {
    const psalm42Hero = bank.find((q) => q.id === 'v-hero:psalm-42-soul-check');
    expect(psalm42Hero, 'missing Psalm 42 hero question').toBeDefined();
    expect(psalm42Hero!.options[psalm42Hero!.correctIndex]).toBe('Sons of Korah');
  });

  test('hero options are plain names without in-app suffixes', () => {
    for (const q of bank) {
      for (const option of q.options) {
        expect(option, `branded hero option in ${q.id}`).not.toMatch(/\((?:Canon Codex|Proverbs Codex|Psalms Field Medic)\)/);
      }
    }
  });

  test('pickRunFromBank returns the requested count with unique ids', () => {
    const run = pickRunFromBank(bank, 10);
    expect(run.length).toBe(10);
    expect(new Set(run.map((q) => q.id)).size).toBe(10);
    for (const q of run) {
      expect(q.options.length).toBe(4);
      expect(q.options[q.correctIndex]).toBeDefined();
    }
  });
});
