/**
 * The single fade-out memory ladder. One verse, four levels:
 *   1. Full verse — tap the words in order.
 *   2. Some words blanked — fill them in.
 *   3. First letters only.
 *   4. Type or tap the whole verse from memory.
 *
 * Matching is Unicode-safe: accents are kept for Spanish and French; only case
 * and punctuation are normalized.
 */

import { isBlankCandidate } from './verseText';

export type LadderLevel = 1 | 2 | 3 | 4;

export function verseWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Normalize for comparison: keep accents (Spanish/French), normalize case and
 * punctuation only.
 */
export function normalizeVerseForMatch(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeWordForMatch(word: string): string {
  return normalizeVerseForMatch(word);
}

export function validateOrder(input: string[], text: string): boolean {
  const expected = verseWords(text).map(normalizeWordForMatch);
  const actual = input.map(normalizeWordForMatch);
  return expected.length === actual.length && expected.every((word, i) => word === actual[i]);
}

export function validateTyped(input: string, text: string): boolean {
  return normalizeVerseForMatch(input) === normalizeVerseForMatch(text);
}

/** Fraction of words in the right position (0-1), used for partial credit. */
export function scoreAccuracy(input: string, text: string): number {
  const expected = verseWords(text).map(normalizeWordForMatch);
  const actual = verseWords(input).map(normalizeWordForMatch);
  if (expected.length === 0) return 0;
  let matches = 0;
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] === expected[i]) matches++;
  }
  return matches / expected.length;
}

export interface BlankTask {
  /** Text with blanks replaced by ▢ markers, one per blank word. */
  display: string;
  blanks: { index: number; answer: string }[];
  choices: string[];
}

/** Level 2: blank a subset of meaningful words and offer shuffled choices. */
export function buildBlankTask(text: string, blankCount = 3): BlankTask {
  const words = verseWords(text);
  const candidates = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => isBlankCandidate(word));
  const blanks = candidates.slice(0, blankCount).map(({ word, index }) => ({ index, answer: normalizeWordForMatch(word) }));
  const blankIndices = new Set(blanks.map((b) => b.index));
  const display = words.map((word, index) => (blankIndices.has(index) ? '▢' : word)).join(' ');
  const choices = blanks.map((b) => b.answer).sort((a, b) => a.localeCompare(b));
  return { display, blanks, choices };
}

/** Level 3: show only the first letter of each word. */
export function firstLetterHint(text: string): string {
  return verseWords(text)
    .map((word) => {
      const letters = word.normalize('NFC').replace(/[^\p{L}]/gu, '');
      if (letters.length === 0) return '•';
      return `${letters[0]}${'·'.repeat(Math.max(0, letters.length - 1))}`;
    })
    .join(' ');
}

export interface LevelTask {
  level: LadderLevel;
  instruction: string;
  mode: 'order' | 'blank' | 'first-letter' | 'type';
}

export function getLevelTask(level: LadderLevel): LevelTask {
  switch (level) {
    case 1: return { level, instruction: 'Tap the words in order.', mode: 'order' };
    case 2: return { level, instruction: 'Fill in the missing words.', mode: 'blank' };
    case 3: return { level, instruction: 'Tap the words from the first letters.', mode: 'first-letter' };
    case 4: return { level, instruction: 'Type the whole verse from memory.', mode: 'type' };
    default: return { level: 1, instruction: 'Tap the words in order.', mode: 'order' };
  }
}