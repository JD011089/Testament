/**
 * Best-effort per-chapter verse counts used to reject impossible references
 * such as "Romans 8:99" with a friendly message.
 *
 * Scope: the complete New Testament plus a handful of high-traffic Old
 * Testament books the app cites directly. For any book/chapter not listed the
 * count is unknown and validation is skipped (never a false rejection).
 */

const BOOK_VERSE_COUNTS: Record<string, number[]> = {
  Genesis: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26],
  Exodus: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],
  Joshua: [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33],
  Ruth: [22,23,18,22],
  Jonah: [17,10,10,11],

  Matthew: [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],
  Mark: [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],
  Luke: [80,52,38,44,39,49,56,62,42,42,55,59,35,31,34,36,36,24,35,41,48,47,42,38,59,66,59,36,50,48,44,24,55,45,41,33,27,42,50,40,44,49,44,46,51,56,48,42,48,43,29,31,36,26],
  John: [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25],
  Acts: [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,40,38,40,30,35,27,27,32,44,31],
  Romans: [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27],
  '1 Corinthians': [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24],
  '2 Corinthians': [24,17,18,18,21,18,16,24,15,18,33,21,14],
  Galatians: [24,21,29,31,26,18],
  Ephesians: [23,22,21,32,33,24],
  Philippians: [30,30,21,23],
  Colossians: [29,23,25,18],
  '1 Thessalonians': [10,20,13,18,28],
  '2 Thessalonians': [12,17,18],
  '1 Timothy': [20,15,16,16,25,21],
  '2 Timothy': [18,26,17,22],
  Titus: [16,15,15],
  Philemon: [25],
  Hebrews: [14,18,19,16,14,20,28,13,28,39,40,29,25],
  James: [27,26,18,17,20],
  '1 Peter': [25,25,22,19,14],
  '2 Peter': [21,22,18],
  '1 John': [10,29,24,21,21],
  '2 John': [13],
  Jude: [25],
  Revelation: [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21]
};

/** Verse count for a chapter, or null when the data is not bundled. */
export function getVerseCount(book: string, chapter: number): number | null {
  const counts = BOOK_VERSE_COUNTS[book];
  if (!counts) return null;
  if (chapter < 1 || chapter > counts.length) return null;
  return counts[chapter - 1];
}

export function hasVerseCountData(book: string): boolean {
  return book in BOOK_VERSE_COUNTS;
}
