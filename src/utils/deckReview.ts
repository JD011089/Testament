/**
 * Which Deck verses are ready to review, read from the same practice history
 * (FSRS) that the Practice screen writes to.
 *
 * A verse can live in the registry under several ids that share one reference
 * (bundled, story, or a custom id made when it was opened from the Deck), and
 * Practice may record under any of them. So we look at every id with the same
 * reference and use the most recently reviewed card.
 */
import { getDeckVerseCards, type DeckVerseCard } from './deck';
import { getAllVerses, normalizeVerseSlug } from './verseRegistry';
import { getDueFSRSCards, loadFSRSCards, type FSRSCard } from './fsrsEngine';

export type DeckReviewStatus = 'due' | 'new' | 'later';

export interface DeckReviewItem {
  card: DeckVerseCard;
  status: DeckReviewStatus;
  /** Latest practice record for this verse, if it has ever been practiced. */
  practice: FSRSCard | null;
}

function idsForReference(ref: string, idsByRef: Map<string, string[]>): string[] {
  const slug = normalizeVerseSlug(ref);
  return [`custom-bible-${slug}`, ...(idsByRef.get(slug) ?? [])];
}

export function getDeckReviewItems(cards: DeckVerseCard[] = getDeckVerseCards()): DeckReviewItem[] {
  if (cards.length === 0) return [];
  const practiceCards = loadFSRSCards();
  const dueIds = new Set(getDueFSRSCards().map((c) => c.verseId));

  const idsByRef = new Map<string, string[]>();
  for (const verse of getAllVerses()) {
    const slug = normalizeVerseSlug(verse.reference);
    const list = idsByRef.get(slug) ?? [];
    list.push(verse.id);
    idsByRef.set(slug, list);
  }

  return cards.map((card) => {
    let latest: FSRSCard | null = null;
    for (const id of idsForReference(card.ref, idsByRef)) {
      const record = practiceCards[id];
      if (record && (!latest || record.lastReviewDate > latest.lastReviewDate)) latest = record;
    }
    const status: DeckReviewStatus = !latest ? 'new' : dueIds.has(latest.verseId) ? 'due' : 'later';
    return { card, status, practice: latest };
  });
}

/** Verses to work on now: overdue reviews first, then collected-but-never-practiced. */
export function getDeckReviewQueue(cards?: DeckVerseCard[]): DeckReviewItem[] {
  const items = getDeckReviewItems(cards);
  return [
    ...items.filter((item) => item.status === 'due'),
    ...items.filter((item) => item.status === 'new'),
  ];
}
