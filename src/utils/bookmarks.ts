/**
 * Bookmark ("Saved") persistence. Kept as pure helpers so the save/read
 * round-trip is unit-testable without a browser. A storage object can be
 * injected; otherwise `localStorage` is used when present.
 */

export const BOOKMARKS_KEY = 'testament_bookmarked_verses';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // ignore
  }
  return null;
}

export function readBookmarks(storage: StorageLike | null = defaultStorage()): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(BOOKMARKS_KEY);
    if (!raw || raw === 'null') return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function writeBookmarks(ids: string[], storage: StorageLike | null = defaultStorage()): string[] {
  const unique = Array.from(new Set(ids));
  if (storage) {
    try {
      storage.setItem(BOOKMARKS_KEY, JSON.stringify(unique));
    } catch {
      // ignore quota failures
    }
  }
  return unique;
}

/** Adds a bookmark id, persists it, and returns the full updated list. */
export function addBookmark(id: string, storage: StorageLike | null = defaultStorage()): string[] {
  return writeBookmarks([...readBookmarks(storage), id], storage);
}

export function removeBookmark(id: string, storage: StorageLike | null = defaultStorage()): string[] {
  return writeBookmarks(readBookmarks(storage).filter((item) => item !== id), storage);
}

export function isBookmarked(id: string, storage: StorageLike | null = defaultStorage()): boolean {
  return readBookmarks(storage).includes(id);
}
