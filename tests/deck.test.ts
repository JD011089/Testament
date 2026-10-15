import { test, expect } from '@playwright/test';
import {
  addVerseCard,
  addCharacterCard,
  readDeck,
  hasCard,
  setVerseStrength,
  getDeckVerseCards,
  DECK_KEY,
  type StorageLike
} from '../src/utils/deck';

function fakeStorage(): StorageLike & { dump(): Record<string, string> } {
  const map: Record<string, string> = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => { map[k] = v; },
    dump: () => map
  };
}

const verseInput = { ref: '1 Samuel 17:47', translation: 'WEB', text: 'the battle is Yahweh\u2019s', storyId: 'david-and-goliath', storyTitle: 'David and Goliath' };

test.describe('deck persistence', () => {
  test('a collected verse card persists across a reload', () => {
    const s = fakeStorage();
    const { added } = addVerseCard(verseInput, s);
    expect(added).toBe(true);
    expect(s.dump()[DECK_KEY]).toBeTruthy();
    expect(readDeck(s)).toHaveLength(1);
    expect(getDeckVerseCards(s)[0].ref).toBe('1 Samuel 17:47');
    expect(getDeckVerseCards(s)[0].strength).toBe('bronze');
  });

  test('re-earning the same card does not duplicate it', () => {
    const s = fakeStorage();
    addVerseCard(verseInput, s);
    const second = addVerseCard(verseInput, s);
    expect(second.added).toBe(false);
    expect(readDeck(s)).toHaveLength(1);
    expect(hasCard('verse:1 Samuel 17:47', s)).toBe(true);
  });

  test('character cards are earned when a story is finished', () => {
    const s = fakeStorage();
    addCharacterCard({ name: 'David', storyId: 'david-and-goliath', storyTitle: 'David and Goliath' }, s);
    expect(hasCard('character:david-and-goliath', s)).toBe(true);
    expect(readDeck(s).some((c) => c.type === 'character')).toBe(true);
  });

  test('card strength can be upgraded', () => {
    const s = fakeStorage();
    addVerseCard(verseInput, s);
    setVerseStrength('1 Samuel 17:47', 'gold', s);
    expect(getDeckVerseCards(s)[0].strength).toBe('gold');
  });

  test('share payload never carries private notes', () => {
    const s = fakeStorage();
    addVerseCard(verseInput, s);
    const card = getDeckVerseCards(s)[0];
    expect(Object.keys(card)).not.toContain('notes');
    expect(JSON.stringify(card)).not.toMatch(/note/i);
  });

  test('corrupt deck storage degrades to empty', () => {
    const s = fakeStorage();
    s.setItem(DECK_KEY, 'not json');
    expect(readDeck(s)).toEqual([]);
  });
});