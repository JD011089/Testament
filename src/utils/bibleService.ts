/**
 * Testament Bible Service
 * Fetches chapters and verses across all 66 books of the Bible
 * with offline local caching, tri-language support (EN / ES / FR),
 * and instant fallback response.
 */

import type { SupportedLanguage } from '../context/LanguageContext';

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

export const BIBLE_BOOK_ORDER: Record<string, number> = {
  // Old Testament
  'genesis': 1, 'génesis': 1, 'genèse': 1,
  'exodus': 2, 'éxodo': 2, 'exode': 2,
  'leviticus': 3, 'levítico': 3, 'lévitique': 3,
  'numbers': 4, 'números': 4, 'nombres': 4,
  'deuteronomy': 5, 'deuteronomio': 5, 'deutéronome': 5,
  'joshua': 6, 'josué': 6,
  'judges': 7, 'jueces': 7, 'juges': 7,
  'ruth': 8, 'rut': 8,
  '1 samuel': 9, '1 samuel ': 9, '1º samuel': 9,
  '2 samuel': 10, '2 samuel ': 10, '2º samuel': 10,
  '1 kings': 11, '1 reyes': 11, '1 rois': 11,
  '2 kings': 12, '2 reyes': 12, '2 rois': 12,
  '1 chronicles': 13, '1 crónicas': 13, '1 chroniques': 13,
  '2 chronicles': 14, '2 crónicas': 14, '2 chroniques': 14,
  'ezra': 15, 'esdras': 15,
  'nehemiah': 16, 'nehemías': 16, 'néhémie': 16,
  'esther': 17, 'ester': 17,
  'job': 18,
  'psalms': 19, 'psalm': 19, 'salmos': 19, 'salmo': 19, 'psaumes': 19, 'psaume': 19,
  'proverbs': 20, 'proverb': 20, 'proverbios': 20, 'proverbes': 20,
  'ecclesiastes': 21, 'eclesiastés': 21, 'ecclésiaste': 21,
  'song of solomon': 22, 'song of songs': 22, 'cantares': 22, 'cantique des cantiques': 22,
  'isaiah': 23, 'isaías': 23, 'ésaïe': 23,
  'jeremiah': 24, 'jeremías': 24, 'jérémie': 24,
  'lamentations': 25, 'lamentaciones': 25,
  'ezekiel': 26, 'ezequiel': 26, 'ézéchiel': 26,
  'daniel': 27,
  'hosea': 28, 'oseas': 28, 'osée': 28,
  'joel': 29, 'joël': 29,
  'amos': 30,
  'obadiah': 31, 'abdías': 31, 'abdias': 31,
  'jonah': 32, 'jonás': 32,
  'micah': 33, 'miqueas': 33, 'michée': 33,
  'nahum': 34,
  'habakkuk': 35, 'habacuc': 35,
  'zephaniah': 36, 'sofonías': 36, 'sophonie': 36,
  'haggai': 37, 'hageo': 37, 'aggée': 37,
  'zechariah': 38, 'zacarías': 38, 'zacharie': 38,
  'malachi': 39, 'malaquías': 39, 'malachie': 39,

  // New Testament
  'matthew': 40, 'mateo': 40, 'matthieu': 40,
  'mark': 41, 'marcos': 41, 'marc': 41,
  'luke': 42, 'lucas': 42, 'luc': 42,
  'john': 43, 'juan': 43, 'jean': 43,
  'acts': 44, 'hechos': 44, 'actes': 44,
  'romans': 45, 'romanos': 45, 'romains': 45,
  '1 corinthians': 46, '1 corintios': 46, '1 corinthiens': 46,
  '2 corinthians': 47, '2 corintios': 47, '2 corinthiens': 47,
  'galatians': 48, 'gálatas': 48, 'galates': 48,
  'ephesians': 49, 'efesios': 49, 'éphésiens': 49,
  'philippians': 50, 'filipenses': 50, 'philippiens': 50,
  'colossians': 51, 'colosenses': 51, 'colossiens': 51,
  '1 thessalonians': 52, '1 tesalonicenses': 52, '1 thessaloniciens': 52,
  '2 thessalonians': 53, '2 tesalonicenses': 53, '2 thessaloniciens': 53,
  '1 timothy': 54, '1 timoteo': 54, '1 timothée': 54,
  '2 timothy': 55, '2 timoteo': 55, '2 timothée': 55,
  'titus': 56, 'tito': 56, 'tite': 56,
  'philemon': 57, 'filemón': 57, 'philémon': 57,
  'hebrews': 58, 'hebreos': 58, 'hébreux': 58,
  'james': 59, 'santiago': 59, 'jacques': 59,
  '1 peter': 60, '1 pedro': 60, '1 pierre': 60,
  '2 peter': 61, '2 pedro': 61, '2 pierre': 61,
  '1 john': 62, '1 juan': 62, '1 jean': 62,
  '2 john': 63, '2 juan': 63, '2 jean': 63,
  '3 john': 64, '3 juan': 64, '3 jean': 64,
  'jude': 65, 'judas': 65,
  'revelation': 66, 'apocalipsis': 66, 'apocalypse': 66
};

export const getBookChapterCount = (bookName: string): number => {
  const norm = bookName.trim();
  if (BIBLE_BOOK_CHAPTER_COUNTS[norm]) return BIBLE_BOOK_CHAPTER_COUNTS[norm];
  const order = getBookOrder(bookName);
  const entry = Object.entries(BIBLE_BOOK_ORDER).find(([_, o]) => o === order);
  if (entry) {
    const canonicalKey = Object.keys(BIBLE_BOOK_CHAPTER_COUNTS).find(
      k => k.toLowerCase() === entry[0]
    );
    if (canonicalKey) return BIBLE_BOOK_CHAPTER_COUNTS[canonicalKey];
  }
  return 1;
};

export const getBookOrder = (bookName: string): number => {
  const key = bookName.toLowerCase().trim();
  return BIBLE_BOOK_ORDER[key] || 1;
};

export interface BibleTranslationInfo {
  id: string;
  label: string;
  note: string;
  language: 'en' | 'es' | 'fr';
}

// Available translations supported by the engine across English, Spanish, and French
export const BIBLE_TRANSLATIONS: BibleTranslationInfo[] = [
  // English translations
  { id: 'web', label: 'World English Bible (WEB)', note: 'Clear, modern standard English', language: 'en' },
  { id: 'kjv', label: 'Classic King James (KJV)', note: 'Traditional poetic phrasing', language: 'en' },
  { id: 'bbe', label: 'Basic Bible English (BBE)', note: 'Simplified direct English', language: 'en' },
  // Spanish translations
  { id: 'rvr', label: 'Reina-Valera 1960 (RVR)', note: 'Traducción clásica en español', language: 'es' },
  { id: 'rv2004', label: 'Reina Valera Gómez (RV2004)', note: 'Texto bíblico fiel en español', language: 'es' },
  // French translations
  { id: 'ls1910', label: 'Louis Segond 1910 (LSG)', note: 'Traduction classique en français', language: 'fr' },
  { id: 'bds', label: 'La Bible du Semeur (BDS)', note: 'Français contemporain et fluide', language: 'fr' }
];

export type TranslationId = 'web' | 'kjv' | 'bbe' | 'rvr' | 'rv2004' | 'ls1910' | 'bds' | 'valera' | 'rv1960' | 'lsg' | 'frlsg';

export function normalizeTranslationId(id: string): string {
  const lower = id.toLowerCase().trim();
  if (lower === 'valera' || lower === 'rv1960') return 'rvr';
  if (lower === 'lsg' || lower === 'frlsg') return 'ls1910';
  return lower;
}

export function getDefaultTranslationForLanguage(lang: SupportedLanguage): TranslationId {
  switch (lang) {
    case 'es': return 'rvr';
    case 'fr': return 'ls1910';
    case 'en':
    default: return 'web';
  }
}

const cleanVerseText = (raw: string): string => {
  return raw
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/\s+/g, ' ')
    .trim();
};

export const CANONICAL_ENGLISH_BOOKS: Record<number, string> = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
  16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
  21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
  26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
  31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
  36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
  40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
  45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
  50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
  55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
  60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
  65: 'Jude', 66: 'Revelation'
};

export function getCanonicalEnglishBookName(bookName: string): string {
  const order = getBookOrder(bookName);
  return CANONICAL_ENGLISH_BOOKS[order] || bookName;
}

/**
 * Fetch a whole chapter with local storage caching for instant offline reading
 */
export async function fetchBibleChapter(
  bookName: string,
  chapter: number,
  translation: TranslationId = 'web'
): Promise<BibleChapterData> {
  const normTrans = normalizeTranslationId(translation);
  const bookNumber = getBookOrder(bookName);
  const englishBookName = getCanonicalEnglishBookName(bookName);
  const cacheKey = `testament_chapter_${bookNumber}_${chapter}_${normTrans}`;
  const totalChapters = getBookChapterCount(bookName);

  // 1. Check local offline cache first
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as BibleChapterData;
        return {
          ...parsed,
          totalChapters
        };
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  // 2. Fetch Spanish or French translations from high-speed bolls.life API
  if (normTrans === 'rvr' || normTrans === 'rv2004' || normTrans === 'ls1910' || normTrans === 'bds') {
    const bollsMap: Record<string, string> = {
      rvr: 'RV1960',
      rv2004: 'RV2004',
      ls1910: 'FRLSG',
      bds: 'BDS'
    };
    const bollsTrans = bollsMap[normTrans] || 'RV1960';

    try {
      const response = await fetch(`https://bolls.life/get-chapter/${bollsTrans}/${bookNumber}/${chapter}/`);
      if (response.ok) {
        const rawVerses: Array<{ pk?: number; verse: number; text: string }> = await response.json();
        if (Array.isArray(rawVerses) && rawVerses.length > 0) {
          const formattedVerses: BibleVerse[] = rawVerses.map(v => ({
            book_id: bookName.toLowerCase().replace(/\s+/g, '_'),
            book_name: bookName,
            chapter,
            verse: v.verse,
            text: cleanVerseText(v.text)
          }));

          const matchedLabel = BIBLE_TRANSLATIONS.find(t => t.id === normTrans)?.label || normTrans.toUpperCase();
          const chapterData: BibleChapterData = {
            reference: `${bookName} ${chapter}`,
            bookName,
            chapter,
            verses: formattedVerses,
            translation: matchedLabel,
            totalChapters
          };

          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(cacheKey, JSON.stringify(chapterData));
            }
          } catch {}
          return chapterData;
        }
      }
    } catch (bollsErr) {
      console.warn('Bolls API request failed:', bollsErr);
    }
  }

  // 3. Fetch English translations from bible-api.com
  try {
    const queryParam = `${encodeURIComponent(englishBookName)}+${chapter}?translation=${normTrans}`;
    const response = await fetch(`https://bible-api.com/${queryParam}`);

    if (response.ok) {
      const data = await response.json();
      const formattedVerses: BibleVerse[] = (data.verses || []).map((v: any) => ({
        book_id: v.book_id,
        book_name: v.book_name || bookName,
        chapter: v.chapter || chapter,
        verse: v.verse,
        text: cleanVerseText(v.text || '')
      }));

      const chapterData: BibleChapterData = {
        reference: data.reference || `${bookName} ${chapter}`,
        bookName,
        chapter,
        verses: formattedVerses,
        translation: data.translation_name || normTrans.toUpperCase(),
        totalChapters
      };

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify(chapterData));
        }
      } catch {}
      return chapterData;
    }
  } catch (apiErr) {
    console.warn('bible-api.com request failed, trying secondary fallback:', apiErr);
  }

  // 4. English fallback to bolls.life WEB/KJV
  try {
    const fallbackCode = normTrans === 'kjv' ? 'KJV' : 'WEB';
    const fallbackResp = await fetch(`https://bolls.life/get-chapter/${fallbackCode}/${bookNumber}/${chapter}/`);
    if (fallbackResp.ok) {
      const rawVerses: Array<{ pk?: number; verse: number; text: string }> = await fallbackResp.json();
      if (Array.isArray(rawVerses) && rawVerses.length > 0) {
        const formattedVerses: BibleVerse[] = rawVerses.map(v => ({
          book_id: bookName.toLowerCase().replace(/\s+/g, '_'),
          book_name: bookName,
          chapter,
          verse: v.verse,
          text: cleanVerseText(v.text)
        }));

        const chapterData: BibleChapterData = {
          reference: `${bookName} ${chapter}`,
          bookName,
          chapter,
          verses: formattedVerses,
          translation: fallbackCode,
          totalChapters
        };

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify(chapterData));
          }
        } catch {}
        return chapterData;
      }
    }
  } catch (err) {
    console.warn('Secondary fallback failed:', err);
  }

  throw new Error(`Failed to load ${bookName} Chapter ${chapter} (${normTrans.toUpperCase()}). Please check your connection.`);
}
