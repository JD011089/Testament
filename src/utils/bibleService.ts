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

// Available translations supported by the engine
export const BIBLE_TRANSLATIONS = [
  { id: 'web', label: 'World English Bible (WEB)', note: 'Clear, modern standard English' },
  { id: 'kjv', label: 'Classic King James (KJV)', note: 'Traditional poetic phrasing' },
  { id: 'bbe', label: 'Basic Bible English (BBE)', note: 'Simplified direct English' }
] as const;

export type TranslationId = typeof BIBLE_TRANSLATIONS[number]['id'];

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

  // 1. Check local offline cache first
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

  // 2. Fetch from fast, open public Bible API
  const queryParam = `${encodeURIComponent(bookName)}+${chapter}?translation=${translation}`;
  const response = await fetch(`https://bible-api.com/${queryParam}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${bookName} Chapter ${chapter} (Status ${response.status})`);
  }

  const data = await response.json();

  const formattedVerses: BibleVerse[] = (data.verses || []).map((v: any) => ({
    book_id: v.book_id,
    book_name: v.book_name || bookName,
    chapter: v.chapter || chapter,
    verse: v.verse,
    text: (v.text || '').trim().replace(/\n+/g, ' ')
  }));

  const chapterData: BibleChapterData = {
    reference: data.reference || `${bookName} ${chapter}`,
    bookName,
    chapter,
    verses: formattedVerses,
    translation: data.translation_name || translation.toUpperCase(),
    totalChapters
  };

  // 3. Save to local storage for instant offline recall
  try {
    localStorage.setItem(cacheKey, JSON.stringify(chapterData));
  } catch (e) {
    // Local storage full or private mode, gracefully proceed
  }

  return chapterData;
}
