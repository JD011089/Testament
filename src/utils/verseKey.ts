/**
 * Single canonical verse key used across the whole app.
 *
 * A canonical key is a normalized reference in the form `CODE.CHAPTER.VERSE`,
 * e.g. "1 Kings 19:12" -> "1KI.19.12", "Romans 8:28" -> "ROM.8.28".
 * Book codes are OSIS-style abbreviations. Keys are stable, locale-independent,
 * and safe to persist: they never contain spaces, colons, or accents.
 */

import { parseScriptureReference, resolveBookName } from './scriptureRef';

/** Canonical English book name -> OSIS-style code. */
export const BOOK_CODE_BY_NAME: Record<string, string> = {
  Genesis: 'GEN', Exodus: 'EXO', Leviticus: 'LEV', Numbers: 'NUM', Deuteronomy: 'DEU',
  Joshua: 'JOS', Judges: 'JDG', Ruth: 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  Ezra: 'EZR', Nehemiah: 'NEH', Esther: 'EST', Job: 'JOB', Psalms: 'PSA',
  Proverbs: 'PRO', Ecclesiastes: 'ECC', 'Song of Solomon': 'SNG', Isaiah: 'ISA',
  Jeremiah: 'JER', Lamentations: 'LAM', Ezekiel: 'EZK', Daniel: 'DAN', Hosea: 'HOS',
  Joel: 'JOL', Amos: 'AMO', Obadiah: 'OBA', Jonah: 'JON', Micah: 'MIC', Nahum: 'NAM',
  Habakkuk: 'HAB', Zephaniah: 'ZEP', Haggai: 'HAG', Zechariah: 'ZEC', Malachi: 'MAL',
  Matthew: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT', Romans: 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', Galatians: 'GAL', Ephesians: 'EPH',
  Philippians: 'PHP', Colossians: 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', Titus: 'TIT', Philemon: 'PHM', Hebrews: 'HEB',
  James: 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
  '3 John': '3JN', Jude: 'JUD', Revelation: 'REV'
};

export const BOOK_NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_CODE_BY_NAME).map(([name, code]) => [code, name])
);

const KEY_PATTERN = /^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)$/;

export interface ParsedVerseKey {
  bookCode: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Build the canonical key for a scripture reference. Accepts forms like
 * "1 Kings 19:12", "1Kgs 19:12", "Rom 8:28-30", "Psalm 23".
 * Returns null when the reference cannot be parsed.
 */
export function canonicalVerseKey(reference: string | null | undefined): string | null {
  if (!reference) return null;
  const parsed = parseScriptureReference(reference);
  if (!parsed) return null;
  const code = BOOK_CODE_BY_NAME[parsed.book];
  if (!code) return null;
  return `${code}.${parsed.chapter}.${parsed.verseStart}`;
}

/** Parse a canonical key back into its parts. Returns null for non-keys. */
export function parseVerseKey(key: string | null | undefined): ParsedVerseKey | null {
  if (!key) return null;
  const match = key.trim().toUpperCase().match(KEY_PATTERN);
  if (!match) return null;
  const [, bookCode, chapter, verse] = match;
  return {
    bookCode,
    book: BOOK_NAME_BY_CODE[bookCode] ?? bookCode,
    chapter: Number(chapter),
    verse: Number(verse)
  };
}

export function isVerseKey(value: string | null | undefined): boolean {
  return parseVerseKey(value) !== null;
}

/**
 * Resolve any of: a canonical key, a reference, a book name + digits, or a
 * legacy id-ish string, to a canonical key. Falls back to null.
 */
export function resolveVerseKey(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (isVerseKey(trimmed)) return trimmed.toUpperCase();

  const direct = canonicalVerseKey(trimmed);
  if (direct) return direct;

  // Legacy ids such as "custom-bible-romans-8-28" or "story-david-journey":
  // extract a trailing book chapter verse pattern.
  const slug = trimmed.replace(/-/g, ' ').replace(/\s+/g, ' ');
  const fromSlug = canonicalVerseKey(slug);
  if (fromSlug) return fromSlug;

  return null;
}

/** Canonical key for a verse-like object carrying a `reference`. */
export function verseCanonicalKey(verse: { reference?: string | null } | null | undefined): string | null {
  return canonicalVerseKey(verse?.reference ?? null);
}

export { resolveBookName };
