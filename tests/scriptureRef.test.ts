import { test, expect } from '@playwright/test';
import {
  parseScriptureReference,
  parseScriptureReferenceDetailed,
  getReferenceError,
  nextChapter,
  previousChapter
} from '../src/utils/scriptureRef';

test.describe('scripture reference parser', () => {
  test('accepts chapter+verse, short forms, and abbreviations', () => {
    expect(parseScriptureReference('Romans 8:28')).toMatchObject({ book: 'Romans', chapter: 8, verseStart: 28 });
    expect(parseScriptureReference('Rom 8:28')).toMatchObject({ book: 'Romans', chapter: 8, verseStart: 28 });
    expect(parseScriptureReference('1 Kings 19:12')).toMatchObject({ book: '1 Kings', chapter: 19, verseStart: 12 });
    expect(parseScriptureReference('1 Kgs 19:12')).toMatchObject({ book: '1 Kings', chapter: 19, verseStart: 12 });
  });

  test('accepts chapter-only references, defaulting to verse 1', () => {
    expect(parseScriptureReference('Psalm 23')).toEqual({ book: 'Psalms', chapter: 23, verseStart: 1, verseEnd: 1 });
    expect(parseScriptureReference('Ps 23')).toEqual({ book: 'Psalms', chapter: 23, verseStart: 1, verseEnd: 1 });
    expect(parseScriptureReference('John 3')).toEqual({ book: 'John', chapter: 3, verseStart: 1, verseEnd: 1 });
  });

  test('rejects invalid verses with a friendly message', () => {
    expect(parseScriptureReference('Romans 8:99')).toBeNull();
    const detail = parseScriptureReferenceDetailed('Romans 8:99');
    expect(detail.ok).toBe(false);
    if (!detail.ok) expect(detail.error).toMatch(/Romans 8 has 39 verses/i);
    expect(getReferenceError('Romans 8:99')).toMatch(/39 verses/);
  });

  test('rejects chapters past the end of a book and unknown books', () => {
    expect(parseScriptureReference('Genesis 51')).toBeNull();
    expect(getReferenceError('Genesis 51')).toMatch(/50 chapters/);
    expect(parseScriptureReference('Fooland 3:16')).toBeNull();
    expect(getReferenceError('Fooland 3:16')).toMatch(/don't know a Bible book/i);
  });

  test('rejects plain prose', () => {
    expect(parseScriptureReference('hello world')).toBeNull();
  });
});

test.describe('cross-book chapter navigation', () => {
  test('next chapter crosses into the next book', () => {
    expect(nextChapter('Genesis', 50)).toEqual({ book: 'Exodus', chapter: 1 });
    expect(nextChapter('Malachi', 4)).toEqual({ book: 'Matthew', chapter: 1 });
    expect(nextChapter('Revelation', 22)).toBeNull();
  });

  test('previous chapter crosses back into the previous book', () => {
    expect(previousChapter('Exodus', 1)).toEqual({ book: 'Genesis', chapter: 50 });
    expect(previousChapter('Matthew', 1)).toEqual({ book: 'Malachi', chapter: 4 });
    expect(previousChapter('Genesis', 1)).toBeNull();
  });
});
