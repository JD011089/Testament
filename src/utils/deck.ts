/**
 * My Deck — collectible verse and character cards.
 * Keyed by card id so re-earning a card never duplicates it.
 */

export const DECK_KEY = 'testament_deck';

export type CardStrength = 'bronze' | 'silver' | 'gold';

export interface DeckVerseCard {
  id: string;
  type: 'verse';
  ref: string;
  translation: string;
  text: string;
  storyId: string;
  storyTitle: string;
  strength: CardStrength;
  addedAt: string;
}

export interface DeckCharacterCard {
  id: string;
  type: 'character';
  name: string;
  storyId: string;
  storyTitle: string;
  addedAt: string;
}

export type DeckCard = DeckVerseCard | DeckCharacterCard;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // ignore
  }
  return null;
}

export function readDeck(storage: StorageLike | null = defaultStorage()): DeckCard[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(DECK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((card): card is DeckCard => !!card && typeof card === 'object' && typeof (card as DeckCard).id === 'string');
  } catch {
    return [];
  }
}

function writeDeck(cards: DeckCard[], storage: StorageLike | null = defaultStorage()): DeckCard[] {
  if (storage) {
    try {
      storage.setItem(DECK_KEY, JSON.stringify(cards));
    } catch {
      // ignore quota failures
    }
  }
  return cards;
}

export function hasCard(id: string, storage: StorageLike | null = defaultStorage()): boolean {
  return readDeck(storage).some((card) => card.id === id);
}

export function addCard(card: DeckCard, storage: StorageLike | null = defaultStorage()): { cards: DeckCard[]; added: boolean } {
  const cards = readDeck(storage);
  if (cards.some((existing) => existing.id === card.id)) return { cards, added: false };
  const next = [...cards, card];
  writeDeck(next, storage);
  return { cards: next, added: true };
}

export function addVerseCard(
  input: { ref: string; translation: string; text: string; storyId: string; storyTitle: string },
  storage: StorageLike | null = defaultStorage()
): { cards: DeckCard[]; added: boolean } {
  const card: DeckVerseCard = {
    id: `verse:${input.ref}`,
    type: 'verse',
    ref: input.ref,
    translation: input.translation,
    text: input.text,
    storyId: input.storyId,
    storyTitle: input.storyTitle,
    strength: 'bronze',
    addedAt: new Date().toISOString()
  };
  return addCard(card, storage);
}

export function addCharacterCard(
  input: { name: string; storyId: string; storyTitle: string },
  storage: StorageLike | null = defaultStorage()
): { cards: DeckCard[]; added: boolean } {
  const card: DeckCharacterCard = {
    id: `character:${input.storyId}`,
    type: 'character',
    name: input.name,
    storyId: input.storyId,
    storyTitle: input.storyTitle,
    addedAt: new Date().toISOString()
  };
  return addCard(card, storage);
}

export function getDeckVerseCards(storage: StorageLike | null = defaultStorage()): DeckVerseCard[] {
  return readDeck(storage).filter((card): card is DeckVerseCard => card.type === 'verse');
}

export function setVerseStrength(ref: string, strength: CardStrength, storage: StorageLike | null = defaultStorage()): DeckCard[] {
  const cards = readDeck(storage).map((card) =>
    card.type === 'verse' && card.ref === ref ? { ...card, strength } : card
  );
  return writeDeck(cards, storage);
}