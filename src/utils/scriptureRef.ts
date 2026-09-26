export interface ParsedScriptureRef {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

/** "1 Samuel 17:45" or "Exodus 14:13-14" */
export function parseScriptureReference(reference: string): ParsedScriptureRef | null {
  const match = reference.trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*-\s*(\d+))?$/);
  if (!match) return null;
  const verseStart = Number(match[3]);
  const verseEnd = Number(match[4] || match[3]);
  if (!verseStart || verseEnd < verseStart) return null;
  return {
    book: match[1],
    chapter: Number(match[2]),
    verseStart,
    verseEnd,
  };
}

/** A few verses of context around the cited range. */
export function passageWindow(start: number, end: number, totalVerses: number) {
  const last = Math.max(totalVerses, end);
  return {
    from: Math.max(1, start - 2),
    to: Math.min(last, end + 2),
  };
}
