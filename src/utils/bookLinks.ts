import { CANON_BOOKS, type CanonBook } from '../data/canon';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';

const NAME_ALIASES: Record<string, string> = {
  psalm: 'Psalms',
  psalms: 'Psalms',
  'song of songs': 'Song of Solomon',
  'song of solomon': 'Song of Solomon',
};

export function findCanonBookByName(raw: string): CanonBook | undefined {
  const key = raw.trim().toLowerCase();
  const resolved = NAME_ALIASES[key] ?? raw.trim();
  return CANON_BOOKS.find((book) => book.name.toLowerCase() === resolved.toLowerCase());
}

function matchNames(bookName: string): string[] {
  if (bookName === 'Psalms') return ['Psalm', 'Psalms'];
  if (bookName === 'Song of Solomon') return ['Song of Solomon', 'Song of Songs'];
  return [bookName];
}

export function referenceMentionsBook(reference: string, bookName: string): boolean {
  const names = matchNames(bookName).map((name) => name.toLowerCase());
  return reference.split('&').some((part) => {
    const segment = part.trim().toLowerCase();
    return names.some((name) => {
      if (!segment.startsWith(name)) return false;
      const next = segment.charAt(name.length);
      return next === '' || next === ' ' || next === ':' || /[0-9]/.test(next);
    });
  });
}

export function dilemmasForBook(bookName: string): { id: string; title: string }[] {
  return REAL_LIFE_DILEMMAS.filter((dilemma) => {
    if (referenceMentionsBook(dilemma.anchorScripture.reference, bookName)) return true;
    return dilemma.plays.some((play) => referenceMentionsBook(play.scriptureReference, bookName));
  }).map(({ id, title }) => ({ id, title }));
}

export function bookModuleLabel(book: CanonBook): string | null {
  if (book.deepLinkType === 'story' && book.deepLinkId) return 'Open the story';
  if (book.deepLinkType === 'proverbs') return 'Open Proverbs';
  if (book.deepLinkType === 'psalms') return 'Open Psalms';
  return null;
}
