import type { TranslationId } from './bibleService';

const KEY = 'testament_reading_place';

export type ReadingFontSize = 'sm' | 'base' | 'lg' | 'xl';
export type ReadingLayout = 'verses' | 'flow';

export interface ReadingPlace {
  bookId: string;
  bookName: string;
  chapter: number;
  translation: TranslationId;
}

export interface ReadingPrefs {
  fontSize: ReadingFontSize;
  layout: ReadingLayout;
}

interface StoredReading {
  place: ReadingPlace | null;
  visited: Record<string, number>;
  fontSize: ReadingFontSize;
  layout: ReadingLayout;
}

const FONT_SIZES: ReadingFontSize[] = ['sm', 'base', 'lg', 'xl'];
const LAYOUTS: ReadingLayout[] = ['verses', 'flow'];
const TRANSLATIONS: TranslationId[] = ['web', 'kjv', 'bbe'];

function isFontSize(value: unknown): value is ReadingFontSize {
  return FONT_SIZES.includes(value as ReadingFontSize);
}

function isLayout(value: unknown): value is ReadingLayout {
  return LAYOUTS.includes(value as ReadingLayout);
}

function isTranslation(value: unknown): value is TranslationId {
  return TRANSLATIONS.includes(value as TranslationId);
}

function emptyStore(): StoredReading {
  return { place: null, visited: {}, fontSize: 'base', layout: 'verses' };
}

function read(): StoredReading {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<StoredReading>;
    const place = parsed.place;
    const validPlace = place
      && typeof place.bookId === 'string'
      && typeof place.bookName === 'string'
      && typeof place.chapter === 'number'
      && isTranslation(place.translation)
      ? place
      : null;
    const visited: Record<string, number> = {};
    if (parsed.visited && typeof parsed.visited === 'object') {
      for (const [bookId, chapter] of Object.entries(parsed.visited)) {
        if (typeof chapter === 'number' && chapter > 0) visited[bookId] = chapter;
      }
    }
    return {
      place: validPlace,
      visited,
      fontSize: isFontSize(parsed.fontSize) ? parsed.fontSize : 'base',
      layout: isLayout(parsed.layout) ? parsed.layout : 'verses',
    };
  } catch {
    return emptyStore();
  }
}

function write(next: StoredReading) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('testament-reading-place'));
  } catch {
    // ignore quota failures
  }
}

export function loadReadingPlace(): ReadingPlace | null {
  return read().place;
}

export function loadVisitedChapters(): Record<string, number> {
  return read().visited;
}

export function loadReadingPrefs(): ReadingPrefs {
  const stored = read();
  return { fontSize: stored.fontSize, layout: stored.layout };
}

export function saveReadingPlace(place: ReadingPlace) {
  const stored = read();
  write({
    ...stored,
    place,
    visited: { ...stored.visited, [place.bookId]: place.chapter },
  });
}

export function saveReadingPrefs(prefs: Partial<ReadingPrefs>) {
  const stored = read();
  write({
    ...stored,
    fontSize: prefs.fontSize ?? stored.fontSize,
    layout: prefs.layout ?? stored.layout,
  });
}
