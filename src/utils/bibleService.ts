/**
 * Testament Bible Service
 * Fetches chapters and verses across all 66 books of the Bible
 * with offline local caching and instant response.
 */

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapterData {
  reference: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
  translation: string;
  totalChapters: number;
}

// Chapter counts for all 66 Canonical Books
export const BIBLE_BOOK_CHAPTER_COUNTS: Record<string, number> = {
  // Old Testament (39 Books)
  'Genesis': 50,
  'Exodus': 40,
  'Leviticus': 27,
  'Numbers': 36,
  'Deuteronomy': 34,
  'Joshua': 24,
  'Judges': 21,
  'Ruth': 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Kings': 22,
  '2 Kings': 25,
  '1 Chronicles': 29,
  '2 Chronicles': 36,
  'Ezra': 10,
  'Nehemiah': 13,
  'Esther': 10,
  'Job': 42,
  'Psalms': 150,
  'Proverbs': 31,
  'Ecclesiastes': 12,
  'Song of Solomon': 8,
  'Song of Songs': 8,
  'Isaiah': 66,
  'Jeremiah': 52,
  'Lamentations': 5,
  'Ezekiel': 48,
  'Daniel': 12,
  'Hosea': 14,
  'Joel': 3,
  'Amos': 9,
  'Obadiah': 1,
  'Jonah': 4,
  'Micah': 7,
  'Nahum': 3,
  'Habakkuk': 3,
  'Zephaniah': 3,
  'Haggai': 2,
  'Zechariah': 14,
  'Malachi': 4,

  // New Testament (27 Books)
  'Matthew': 28,
  'Mark': 16,
  'Luke': 24,
  'John': 21,
  'Acts': 28,
  'Romans': 16,
  '1 Corinthians': 16,
  '2 Corinthians': 13,
  'Galatians': 6,
  'Ephesians': 6,
  'Philippians': 4,
  'Colossians': 4,
  '1 Thessalonians': 5,
  '2 Thessalonians': 3,
  '1 Timothy': 6,
  '2 Timothy': 4,
  'Titus': 3,
  'Philemon': 1,
  'Hebrews': 13,
  'James': 5,
  '1 Peter': 5,
  '2 Peter': 3,
  '1 John': 5,
  '2 John': 1,
  '3 John': 1,
  'Jude': 1,
  'Revelation': 22
};

export const getBookChapterCount = (bookName: string): number => {
  return BIBLE_BOOK_CHAPTER_COUNTS[bookName] || 1;
};

const CANON_BOOK_ORDER = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
] as const;

const CANON_BOOK_NUMBERS: Record<string, number> = {};
CANON_BOOK_ORDER.forEach((name, index) => {
  CANON_BOOK_NUMBERS[name] = index + 1;
});
CANON_BOOK_NUMBERS['Song of Songs'] = CANON_BOOK_NUMBERS['Song of Solomon'];

export function canonBookNumber(bookName: string): number | null {
  return CANON_BOOK_NUMBERS[bookName] ?? null;
}

// Public-domain translations. bible-api.com serves the English set;
// getBible serves the other languages with the same chapter shape.
export const BIBLE_TRANSLATIONS = [
  { id: 'web', label: 'World English Bible (WEB)', short: 'WEB', note: 'Clear, modern standard English', source: 'bible-api', group: 'en' },
  { id: 'kjv', label: 'Classic King James (KJV)', short: 'KJV', note: 'Traditional poetic phrasing', source: 'bible-api', group: 'en' },
  { id: 'bbe', label: 'Basic Bible English (BBE)', short: 'BBE', note: 'Simplified direct English', source: 'bible-api', group: 'en' },
  { id: 'valera', label: 'Reina-Valera 1909', short: 'RV1909', note: 'Español', source: 'getbible', group: 'es' },
  { id: 'almeida', label: 'Almeida Atualizada', short: 'ALM', note: 'Português', source: 'getbible', group: 'pt' },
  { id: 'ls1910', label: 'Louis Segond 1910', short: 'LSG', note: 'Français', source: 'getbible', group: 'fr' },
  { id: 'luther1545', label: 'Luther 1545', short: 'LUT', note: 'Deutsch', source: 'getbible', group: 'de' },
  { id: 'korean', label: '개역한글', short: 'KRV', note: '한국어', source: 'getbible', group: 'ko' },
  { id: 'cus', label: '和合本简体', short: 'CUVS', note: '中文', source: 'getbible', group: 'zh' },
  { id: 'cut', label: '和合本繁體', short: 'CUVT', note: '中文', source: 'getbible', group: 'zh' },
  { id: 'arabicsv', label: 'Smith & Van Dyke', short: 'SVD', note: 'العربية', source: 'getbible', group: 'ar' }
] as const;

export type TranslationId = typeof BIBLE_TRANSLATIONS[number]['id'];
export type TranslationSource = typeof BIBLE_TRANSLATIONS[number]['source'];

export function isTranslationId(value: unknown): value is TranslationId {
  return BIBLE_TRANSLATIONS.some((item) => item.id === value);
}

export function translationById(id: TranslationId) {
  return BIBLE_TRANSLATIONS.find((item) => item.id === id) ?? BIBLE_TRANSLATIONS[0];
}

interface RemoteVerse {
  book_id?: string;
  book_name?: string;
  chapter?: number;
  verse: number;
  text?: string;
}

function rememberChapter(cacheKey: string, chapterData: BibleChapterData) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(chapterData));
  } catch {
    // storage full or private mode
  }
}

async function fetchFromBibleApi(bookName: string, chapter: number, translation: TranslationId): Promise<{ verses: RemoteVerse[]; reference: string; translationName: string }> {
  const queryParam = `${encodeURIComponent(bookName)}+${chapter}?translation=${translation}`;
  const response = await fetch(`https://bible-api.com/${queryParam}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${bookName} Chapter ${chapter} (Status ${response.status})`);
  }
  const data = await response.json();
  return {
    verses: data.verses || [],
    reference: data.reference || `${bookName} ${chapter}`,
    translationName: data.translation_name || translation.toUpperCase()
  };
}

async function fetchFromGetBible(bookName: string, chapter: number, translation: TranslationId): Promise<{ verses: RemoteVerse[]; reference: string; translationName: string }> {
  const bookNumber = canonBookNumber(bookName);
  if (!bookNumber) {
    throw new Error(`Unknown book: ${bookName}`);
  }
  const response = await fetch(`https://api.getbible.net/v2/${translation}/${bookNumber}/${chapter}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load ${bookName} Chapter ${chapter} (Status ${response.status})`);
  }
  const data = await response.json();
  const verses: RemoteVerse[] = (data.verses || []).map((verse: { verse: number; text?: string; name?: string }) => ({
    book_name: data.book_name || bookName,
    chapter: data.chapter || chapter,
    verse: verse.verse,
    text: verse.text
  }));
  return {
    verses,
    reference: data.name || `${data.book_name || bookName} ${chapter}`,
    translationName: data.translation || translationById(translation).label
  };
}

/**
 * Fetch a whole chapter with local storage caching for instant offline reading
 */
export async function fetchBibleChapter(
  bookName: string,
  chapter: number,
  translation: TranslationId = 'web'
): Promise<BibleChapterData> {
  const cacheKey = `testament_chapter_${bookName.toLowerCase().replace(/\s+/g, '_')}_${chapter}_${translation}`;
  const totalChapters = getBookChapterCount(bookName);

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as BibleChapterData;
      return {
        ...parsed,
        totalChapters
      };
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  const source = translationById(translation).source;
  const remote = source === 'getbible'
    ? await fetchFromGetBible(bookName, chapter, translation)
    : await fetchFromBibleApi(bookName, chapter, translation);

  const formattedVerses: BibleVerse[] = remote.verses.map((verse) => ({
    book_id: verse.book_id || '',
    book_name: verse.book_name || bookName,
    chapter: verse.chapter || chapter,
    verse: verse.verse,
    text: (verse.text || '').trim().replace(/\n+/g, ' ')
  }));

  const chapterData: BibleChapterData = {
    reference: remote.reference,
    bookName,
    chapter,
    verses: formattedVerses,
    translation: remote.translationName,
    totalChapters
  };

  rememberChapter(cacheKey, chapterData);
  return chapterData;
}
