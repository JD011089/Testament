import { CANON_BOOKS, type CanonBook } from '../data/canon';
import { resolveBookName } from './scriptureRef';

const NAME_ALIASES: Record<string, string> = {
  psalm: 'Psalms',
  psalms: 'Psalms',
  'song of songs': 'Song of Solomon',
  'song of solomon': 'Song of Solomon',
};

export function findCanonBookByName(raw: string): CanonBook | undefined {
  const resolvedName = resolveBookName(raw);
  const key = resolvedName.trim().toLowerCase();
  const resolved = NAME_ALIASES[key] ?? resolvedName.trim();
  return CANON_BOOKS.find((book) => 
    book.name.toLowerCase() === resolved.toLowerCase() ||
    book.id.toLowerCase() === resolved.toLowerCase()
  );
}

export function bookModuleLabel(book: CanonBook): string | null {
  if (book.deepLinkType === 'story' && book.deepLinkId) return 'Open the story';
  if (book.deepLinkType === 'proverbs') return 'Open Proverbs';
  if (book.deepLinkType === 'psalms') return 'Emergency verses (Psalm triage)';
  return null;
}
