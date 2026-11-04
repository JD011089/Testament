import { test, expect } from '@playwright/test';
import { CANON_BOOKS } from '../src/data/canon';
import {
  BIBLE_SECTIONS,
  booksInSection,
  bookMonogram,
  chaptersInPassage,
  chaptersWithStories,
  sectionForBook,
  shortBookName,
  storyForChapter,
} from '../src/utils/bibleLibrary';

const john = CANON_BOOKS.find((b) => b.name === 'John')!;

test.describe('Bible library data', () => {
  test('every book belongs to exactly one section, and sections cover all 66', () => {
    const counted = BIBLE_SECTIONS.reduce((n, s) => n + booksInSection(s).length, 0);
    expect(counted).toBe(66);
    expect(sectionForBook(john).id).toBe('gospels');
    expect(sectionForBook(CANON_BOOKS.find((b) => b.name === 'Psalms')!).id).toBe('poetry');
  });

  test('story passages map to their chapters, including lists and ranges', () => {
    const joseph = chaptersInPassage('Genesis 37, 39-45');
    expect(joseph?.book.name).toBe('Genesis');
    expect(joseph?.chapters).toEqual([37, 39, 40, 41, 42, 43, 44, 45]);
    expect(chaptersInPassage('1 Kings 18')?.chapters).toEqual([18]);
  });

  test('chapters with a playable story are found', () => {
    expect([...chaptersWithStories(john.id)].sort((a, b) => a - b)).toEqual([6, 19, 20]);
    expect(storyForChapter(john.id, 6)?.storyId).toBe('feeding-the-5000');
    expect(storyForChapter(john.id, 3)).toBeNull();
  });

  test('book labels', () => {
    expect(shortBookName('Acts of the Apostles')).toBe('Acts');
    expect(bookMonogram('1 John')).toBe('1J');
    expect(bookMonogram('Genesis')).toBe('Ge');
  });
});
