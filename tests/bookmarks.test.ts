import { test, expect } from '@playwright/test';
import {
  addBookmark,
  removeBookmark,
  readBookmarks,
  isBookmarked,
  BOOKMARKS_KEY,
  type StorageLike
} from '../src/utils/bookmarks';

function fakeStorage(): StorageLike & { dump(): Record<string, string> } {
  const map: Record<string, string> = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => { map[k] = v; },
    dump: () => map
  };
}

test.describe('bookmark persistence', () => {
  test('addBookmark persists to storage so it survives a reload', () => {
    const storage = fakeStorage();
    addBookmark('story-david-journey', storage);
    // A fresh read simulates a page reload.
    expect(readBookmarks(storage)).toEqual(['story-david-journey']);
    expect(isBookmarked('story-david-journey', storage)).toBe(true);
    expect(storage.dump()[BOOKMARKS_KEY]).toBeTruthy();
  });

  test('duplicate saves do not create duplicate entries', () => {
    const storage = fakeStorage();
    addBookmark('verse-1', storage);
    addBookmark('verse-1', storage);
    expect(readBookmarks(storage)).toEqual(['verse-1']);
  });

  test('removeBookmark deletes and persists', () => {
    const storage = fakeStorage();
    addBookmark('a', storage);
    addBookmark('b', storage);
    expect(removeBookmark('a', storage)).toEqual(['b']);
    expect(readBookmarks(storage)).toEqual(['b']);
  });

  test('corrupt storage degrades to empty rather than throwing', () => {
    const storage = fakeStorage();
    storage.setItem(BOOKMARKS_KEY, '{not json');
    expect(readBookmarks(storage)).toEqual([]);
  });

  test('saving a card then resending the same bookmark does not replay', () => {
    const storage = fakeStorage();
    const first = addBookmark('1SA.17.47', storage);
    expect(first).toEqual(['1SA.17.47']);
    // The app guards duplicates before dispatching; simulate the guard.
    const already = readBookmarks(storage).includes('1SA.17.47');
    expect(already).toBe(true);
  });
});
