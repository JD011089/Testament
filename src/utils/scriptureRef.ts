export interface ParsedScriptureRef {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

export const BOOK_ABBREVIATIONS: Record<string, string> = {
  // Old Testament
  gen: 'Genesis', ge: 'Genesis', gn: 'Genesis',
  ex: 'Exodus', exo: 'Exodus', exod: 'Exodus',
  lev: 'Leviticus', le: 'Leviticus', lv: 'Leviticus',
  num: 'Numbers', nu: 'Numbers', nm: 'Numbers', nb: 'Numbers',
  deut: 'Deuteronomy', dt: 'Deuteronomy', de: 'Deuteronomy',
  josh: 'Joshua', jos: 'Joshua', jsh: 'Joshua',
  judg: 'Judges', jdg: 'Judges', jg: 'Judges', jdgs: 'Judges',
  ruth: 'Ruth', rth: 'Ruth', ru: 'Ruth',
  '1sam': '1 Samuel', '1 sam': '1 Samuel', '1sa': '1 Samuel', '1s': '1 Samuel', '1 samuel': '1 Samuel',
  '2sam': '2 Samuel', '2 sam': '2 Samuel', '2sa': '2 Samuel', '2s': '2 Samuel', '2 samuel': '2 Samuel',
  '1kgs': '1 Kings', '1 kgs': '1 Kings', '1ki': '1 Kings', '1k': '1 Kings', '1 kings': '1 Kings', '1 king': '1 Kings',
  '2kgs': '2 Kings', '2 kgs': '2 Kings', '2ki': '2 Kings', '2k': '2 Kings', '2 kings': '2 Kings', '2 king': '2 Kings',
  '1chron': '1 Chronicles', '1 chron': '1 Chronicles', '1chr': '1 Chronicles', '1ch': '1 Chronicles', '1 chronicles': '1 Chronicles',
  '2chron': '2 Chronicles', '2 chron': '2 Chronicles', '2chr': '2 Chronicles', '2ch': '2 Chronicles', '2 chronicles': '2 Chronicles',
  ezra: 'Ezra', ezr: 'Ezra',
  neh: 'Nehemiah', ne: 'Nehemiah',
  esth: 'Esther', est: 'Esther', es: 'Esther',
  job: 'Job', jb: 'Job',
  ps: 'Psalms', psa: 'Psalms', psm: 'Psalms', pss: 'Psalms', psalm: 'Psalms', psalms: 'Psalms',
  prov: 'Proverbs', pro: 'Proverbs', prv: 'Proverbs', pr: 'Proverbs', proverb: 'Proverbs', proverbs: 'Proverbs',
  eccles: 'Ecclesiastes', eccl: 'Ecclesiastes', ecc: 'Ecclesiastes', ec: 'Ecclesiastes', qoh: 'Ecclesiastes',
  song: 'Song of Solomon', songs: 'Song of Solomon', sos: 'Song of Solomon', cant: 'Song of Solomon', 'song of songs': 'Song of Solomon', 'song of solomon': 'Song of Solomon',
  isa: 'Isaiah', is: 'Isaiah',
  jer: 'Jeremiah', je: 'Jeremiah', jr: 'Jeremiah',
  lam: 'Lamentations', la: 'Lamentations',
  ezek: 'Ezekiel', eze: 'Ezekiel', ezk: 'Ezekiel',
  dan: 'Daniel', da: 'Daniel', dn: 'Daniel',
  hos: 'Hosea', ho: 'Hosea',
  joel: 'Joel', jl: 'Joel',
  amos: 'Amos', am: 'Amos',
  obad: 'Obadiah', ob: 'Obadiah',
  jonah: 'Jonah', jon: 'Jonah', jnh: 'Jonah',
  mic: 'Micah', mc: 'Micah',
  nah: 'Nahum', na: 'Nahum',
  hab: 'Habakkuk', hb: 'Habakkuk',
  zeph: 'Zephaniah', zep: 'Zephaniah', zp: 'Zephaniah',
  hag: 'Haggai', hg: 'Haggai',
  zech: 'Zechariah', zec: 'Zechariah', zc: 'Zechariah',
  mal: 'Malachi', ml: 'Malachi',

  // New Testament
  matt: 'Matthew', mat: 'Matthew', mt: 'Matthew',
  mark: 'Mark', mrk: 'Mark', mk: 'Mark', mr: 'Mark',
  luke: 'Luke', luk: 'Luke', lk: 'Luke',
  john: 'John', jhn: 'John', jn: 'John',
  acts: 'Acts', act: 'Acts', ac: 'Acts',
  rom: 'Romans', ro: 'Romans', rm: 'Romans',
  '1cor': '1 Corinthians', '1 cor': '1 Corinthians', '1co': '1 Corinthians', '1c': '1 Corinthians',
  '2cor': '2 Corinthians', '2 cor': '2 Corinthians', '2co': '2 Corinthians', '2c': '2 Corinthians',
  gal: 'Galatians', ga: 'Galatians',
  eph: 'Ephesians', ep: 'Ephesians',
  phil: 'Philippians', php: 'Philippians', pp: 'Philippians',
  col: 'Colossians', co: 'Colossians',
  '1thess': '1 Thessalonians', '1 thess': '1 Thessalonians', '1th': '1 Thessalonians', '1ts': '1 Thessalonians',
  '2thess': '2 Thessalonians', '2 thess': '2 Thessalonians', '2th': '2 Thessalonians', '2ts': '2 Thessalonians',
  '1tim': '1 Timothy', '1 tim': '1 Timothy', '1ti': '1 Timothy', '1t': '1 Timothy',
  '2tim': '2 Timothy', '2 tim': '2 Timothy', '2ti': '2 Timothy', '2t': '2 Timothy',
  titus: 'Titus', tit: 'Titus', ti: 'Titus',
  philem: 'Philemon', phm: 'Philemon', pm: 'Philemon',
  heb: 'Hebrews', he: 'Hebrews',
  jas: 'James', jm: 'James', jam: 'James',
  '1pet': '1 Peter', '1 pet': '1 Peter', '1pe': '1 Peter', '1pt': '1 Peter', '1p': '1 Peter',
  '2pet': '2 Peter', '2 pet': '2 Peter', '2pe': '2 Peter', '2pt': '2 Peter', '2p': '2 Peter',
  '1jn': '1 John', '1 jn': '1 John', '1jo': '1 John', '1j': '1 John', '1 john': '1 John',
  '2jn': '2 John', '2 jn': '2 John', '2jo': '2 John', '2j': '2 John', '2 john': '2 John',
  '3jn': '3 John', '3 jn': '3 John', '3jo': '3 John', '3j': '3 John', '3 john': '3 John',
  jude: 'Jude', jud: 'Jude', jd: 'Jude',
  rev: 'Revelation', re: 'Revelation', rv: 'Revelation', apocalypse: 'Revelation'
};

export function resolveBookName(rawBook: string): string {
  const clean = rawBook.trim().toLowerCase().replace(/\./g, '');
  if (BOOK_ABBREVIATIONS[clean]) return BOOK_ABBREVIATIONS[clean];
  const spaced = clean.replace(/\s+/g, ' ');
  if (BOOK_ABBREVIATIONS[spaced]) return BOOK_ABBREVIATIONS[spaced];
  return rawBook.trim();
}

/**
 * Parses scripture references like:
 * - "Romans 8:28", "Rom 8:28", "Rom 8:28-30"
 * - "Psalm 23", "Ps 23", "John 3" (chapter-only defaults to verse 1)
 * - "1 Kings 19:12", "1 Kgs 19:12"
 */
export function parseScriptureReference(reference: string): ParsedScriptureRef | null {
  const trimmed = reference.trim();
  if (!trimmed) return null;

  // 1. Chapter and verse: "Romans 8:28", "Rom 8:28-30", "1 Kings 19:12", "Song of Solomon 2:1"
  const cvMatch = trimmed.match(/^([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(\d+):(\d+)(?:\s*-\s*(\d+))?$/);
  if (cvMatch) {
    const book = resolveBookName(cvMatch[1]);
    const chapter = Number(cvMatch[2]);
    const verseStart = Number(cvMatch[3]);
    const verseEnd = Number(cvMatch[4] || cvMatch[3]);
    if (!chapter || !verseStart || verseEnd < verseStart) return null;
    return { book, chapter, verseStart, verseEnd };
  }

  // 2. Chapter only: "Psalm 23", "Ps 23", "John 3", "Genesis 1", "Song of Solomon 2"
  const cMatch = trimmed.match(/^([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(\d+)$/);
  if (cMatch) {
    const book = resolveBookName(cMatch[1]);
    const chapter = Number(cMatch[2]);
    if (!chapter) return null;
    return { book, chapter, verseStart: 1, verseEnd: 1 };
  }

  return null;
}

/** A few verses of context around the cited range. */
export function passageWindow(start: number, end: number, totalVerses: number) {
  const last = Math.max(totalVerses, end);
  return {
    from: Math.max(1, start - 2),
    to: Math.min(last, end + 2),
  };
}
