import { test, expect } from '@playwright/test';
import {
  canonicalVerseKey,
  resolveVerseKey,
  parseVerseKey,
  isVerseKey,
  verseCanonicalKey
} from '../src/utils/verseKey';

test.describe('canonical verse key', () => {
  test('normalizes references to CODE.CHAPTER.VERSE', () => {
    expect(canonicalVerseKey('1 Kings 19:12')).toBe('1KI.19.12');
    expect(canonicalVerseKey('1 Kgs 19:12')).toBe('1KI.19.12');
    expect(canonicalVerseKey('Romans 8:28')).toBe('ROM.8.28');
    expect(canonicalVerseKey('Rom 8:28-30')).toBe('ROM.8.28');
    expect(canonicalVerseKey('Ps 23')).toBe('PSA.23.1');
    expect(canonicalVerseKey('Psalm 23')).toBe('PSA.23.1');
    expect(canonicalVerseKey('John 3')).toBe('JHN.3.1');
    expect(canonicalVerseKey('1 Samuel 17:47')).toBe('1SA.17.47');
  });

  test('rejects invalid references', () => {
    expect(canonicalVerseKey('Romans 8:99')).toBeNull();
    expect(canonicalVerseKey('not a reference')).toBeNull();
    expect(canonicalVerseKey('')).toBeNull();
    expect(canonicalVerseKey(null)).toBeNull();
  });

  test('parses a key back into parts', () => {
    const parsed = parseVerseKey('1KI.19.12');
    expect(parsed).toEqual({ bookCode: '1KI', book: '1 Kings', chapter: 19, verse: 12 });
    expect(parseVerseKey('nope')).toBeNull();
  });

  test('isVerseKey distinguishes keys from references', () => {
    expect(isVerseKey('ROM.8.28')).toBe(true);
    expect(isVerseKey('rom.8.28')).toBe(true);
    expect(isVerseKey('Romans 8:28')).toBe(false);
  });

  test('resolveVerseKey accepts keys and references', () => {
    expect(resolveVerseKey('1ki.19.12')).toBe('1KI.19.12');
    expect(resolveVerseKey('1 Kings 19:12')).toBe('1KI.19.12');
    expect(resolveVerseKey('Romans 8:99')).toBeNull();
  });

  test('verseCanonicalKey reads a verse object reference', () => {
    expect(verseCanonicalKey({ reference: '1 Samuel 17:47' })).toBe('1SA.17.47');
    expect(verseCanonicalKey({})).toBeNull();
  });
});
