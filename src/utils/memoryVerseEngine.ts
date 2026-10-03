import { recordFSRSReview, getFSRSCard } from './fsrsEngine';
import { getTodayDateKey } from './dailyEngine';
import { getDailyCuratedPassage } from '../data/dailyPassages';

export interface MemoryVerseData {
  id?: string;
  reference: string;
  text: string;
  heroName?: string;
  dateKey?: string;
}

export interface RankInfo {
  title: string;
  minXp: number;
  nextThreshold?: number;
}

export const RANKS: RankInfo[] = [
  { title: 'Iron Pillar', minXp: 500 },
  { title: 'Mighty Man of Adullam', minXp: 300, nextThreshold: 500 },
  { title: 'Story Explorer', minXp: 150, nextThreshold: 300 },
  { title: 'Seeker', minXp: 0, nextThreshold: 150 },
];

export function getRankTitle(xp: number): string {
  if (xp >= 500) return 'Iron Pillar';
  if (xp >= 300) return 'Mighty Man of Adullam';
  if (xp >= 150) return 'Story Explorer';
  return 'Seeker';
}

export function checkRankPromotion(prevXp: number, newXp: number): { promoted: boolean; oldRank: string; newRank: string } {
  const oldRank = getRankTitle(prevXp);
  const newRank = getRankTitle(newXp);
  return {
    promoted: oldRank !== newRank,
    oldRank,
    newRank,
  };
}

/**
 * One verse system: lock in today's mission key verse as today's memory verse.
 */
export function lockInMemoryVerse(verse: MemoryVerseData): void {
  if (typeof localStorage === 'undefined') return;
  const todayKey = getTodayDateKey();
  const verseId = verse.id || verse.reference;

  // 1. Store today's memory verse snapshot
  try {
    const payload: MemoryVerseData = {
      id: verseId,
      reference: verse.reference,
      text: verse.text,
      heroName: verse.heroName,
      dateKey: todayKey,
    };
    localStorage.setItem('testament_today_memory_verse', JSON.stringify(payload));
  } catch {
    // ignore
  }

  // 2. Add to memorized verses array if not present
  try {
    const stored = localStorage.getItem('testament_memorized_verses');
    const list: string[] = stored ? JSON.parse(stored) : [];
    if (!list.includes(verseId) && !list.includes(verse.reference)) {
      list.push(verse.reference);
      localStorage.setItem('testament_memorized_verses', JSON.stringify(list));
    }
  } catch {
    // ignore
  }

  // 3. Initialize or update FSRS card
  try {
    const card = getFSRSCard(verse.reference);
    if (card.reps === 0) {
      recordFSRSReview(verse.reference, 3);
    }
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('testament-memory-verse-locked', { detail: { reference: verse.reference } }));
  }
}

/**
 * Checks whether the given verse reference is already locked in
 */
export function isVerseLockedIn(reference: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const todayJson = localStorage.getItem('testament_today_memory_verse');
    if (todayJson) {
      const parsed = JSON.parse(todayJson) as MemoryVerseData;
      if (parsed.reference === reference || parsed.id === reference) return true;
    }
    const memorized = localStorage.getItem('testament_memorized_verses');
    if (memorized) {
      const list: string[] = JSON.parse(memorized);
      if (list.includes(reference)) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Retrieves yesterday's verse for the single next-day recall card on the Dashboard.
 * Returns null if already checked today or not applicable.
 */
export function getYesterdayRecallVerse(): MemoryVerseData | null {
  if (typeof localStorage === 'undefined') return null;
  const todayKey = getTodayDateKey();

  // If already recalled today, don't show the card again
  if (localStorage.getItem(`testament_yesterday_recalled_${todayKey}`)) {
    return null;
  }

  // 1. Check if there was a locked-in verse saved on a previous day
  try {
    const saved = localStorage.getItem('testament_today_memory_verse');
    if (saved) {
      const parsed = JSON.parse(saved) as MemoryVerseData;
      if (parsed.dateKey && parsed.dateKey !== todayKey && parsed.reference && parsed.text) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 2. Fall back to yesterday's curated rotation passage
  try {
    const yesterdayPassage = getDailyCuratedPassage(-1);
    return {
      id: yesterdayPassage.keyVerseReference,
      reference: yesterdayPassage.keyVerseReference,
      text: yesterdayPassage.keyVerseText,
      heroName: yesterdayPassage.heroName,
    };
  } catch {
    return null;
  }
}

/**
 * Marks yesterday's recall card as completed for today and updates FSRS
 */
export function markYesterdayRecallComplete(reference: string, rating: 'got_it' | 'need_review'): void {
  if (typeof localStorage === 'undefined') return;
  const todayKey = getTodayDateKey();
  try {
    localStorage.setItem(`testament_yesterday_recalled_${todayKey}`, rating);
    recordFSRSReview(reference, rating === 'got_it' ? 3 : 1);
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('testament-yesterday-recalled-updated'));
  }
}
