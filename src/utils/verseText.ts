/**
 * Unicode-safe word handling shared by every fill-in-the-blank surface.
 *
 * The previous ASCII-only regexes (`[^\w]` / `[^a-z]`) deleted accented letters
 * outright, turning Spanish/French words like "oración" into "oracin". Folding
 * diacritics first keeps the letter and yields "oracion".
 */

export const VERSE_STOP_WORDS: Set<string> = new Set([
  // Scriptural / functional words excluded from blanks and keyword checks.
  'the', 'and', 'but', 'for', 'nor', 'yet', 'so', 'that', 'this', 'these', 'those',
  'with', 'from', 'into', 'onto', 'upon', 'will', 'shall', 'have', 'has', 'had',
  'they', 'them', 'their', 'you', 'your', 'yours', 'him', 'his', 'her', 'hers',
  'she', 'who', 'whom', 'whose', 'which', 'what', 'when', 'where', 'why', 'how',
  'not', 'are', 'was', 'were', 'been', 'being', 'does', 'did', 'doing', 'than',
  'then', 'there', 'here', 'about', 'over', 'under', 'some', 'such',
  // Short function words used by the Practice Quick Recall drill.
  'a', 'an', 'in', 'on', 'at', 'to', 'of', 'by', 'up', 'after', 'is', 'be',
  'he', 'it', 'we', 'my', 'our', 'me', 'us', 'or', 'if', 'as', 'its',
]);

/** Folds accents so "oración" keeps its base letters as "oracion". */
export function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Diacritic-folded, punctuation-free word that preserves the original casing. */
export function cleanWord(word: string): string {
  return stripDiacritics(word).replace(/[^\p{L}\p{N}']/gu, '');
}

/** Lowercased form used for answer matching and blank eligibility. */
export function normalizeWord(word: string): string {
  return cleanWord(word).toLowerCase();
}

export function isBlankCandidate(word: string, minLength = 4): boolean {
  const clean = normalizeWord(word);
  return clean.length >= minLength && !VERSE_STOP_WORDS.has(clean);
}
