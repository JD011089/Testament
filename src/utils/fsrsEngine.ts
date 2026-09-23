/**
 * FSRS (Free Spaced Repetition Scheduler) Engine for Scripture Retention
 * Calculates memory stability, difficulty, retrievability, and optimal review dates.
 */

export interface FSRSCard {
  verseId: string;
  stability: number; // predicted days until retrievability drops below 90%
  difficulty: number; // 1 (easiest) to 10 (hardest)
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  lastReviewDate: string; // YYYY-MM-DD
  nextReviewDate: string; // YYYY-MM-DD
  retrievability: number; // 0 to 1 current recall probability
}

const STORAGE_KEY = 'testament_fsrs_cards';

const getTodayKey = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysToDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Math.max(1, Math.round(days)));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const loadFSRSCards = (): Record<string, FSRSCard> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveFSRSCards = (cards: Record<string, FSRSCard>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save FSRS cards', err);
  }
};

export const getFSRSCard = (verseId: string): FSRSCard => {
  const cards = loadFSRSCards();
  if (cards[verseId]) {
    const card = cards[verseId];
    // Calculate current decay / retrievability
    const today = new Date(getTodayKey()).getTime();
    const lastRev = new Date(card.lastReviewDate).getTime();
    const daysElapsed = Math.max(0, (today - lastRev) / (1000 * 60 * 60 * 24));
    // R = (1 + factor * t / S)^-1 approximation
    const retrievability = Math.max(0.05, Math.min(1.0, Math.exp(-daysElapsed / (card.stability || 1))));
    return { ...card, retrievability };
  }

  const today = getTodayKey();
  return {
    verseId,
    stability: 1.0,
    difficulty: 5.0,
    reps: 0,
    lapses: 0,
    state: 'new',
    lastReviewDate: today,
    nextReviewDate: today,
    retrievability: 1.0
  };
};

/**
 * Record a spaced repetition review rating:
 * 1: Again (Complete lapse, forgotten)
 * 2: Hard (High effort, barely recalled)
 * 3: Good (Normal recall with slight effort)
 * 4: Easy (Flawless instant recall)
 */
export const recordFSRSReview = (verseId: string, rating: 1 | 2 | 3 | 4): FSRSCard => {
  const cards = loadFSRSCards();
  const current = getFSRSCard(verseId);
  const today = getTodayKey();

  let newStability: number;
  let newDifficulty: number;
  let newLapses = current.lapses;
  let newReps = current.reps + 1;
  let newState: FSRSCard['state'] = 'review';

  if (rating === 1) {
    // Again / Lapse
    newLapses += 1;
    newStability = Math.max(0.5, current.stability * 0.3);
    newDifficulty = Math.min(10.0, current.difficulty + 1.2);
    newState = 'relearning';
  } else if (rating === 2) {
    // Hard
    newStability = Math.max(1.2, current.stability * 1.25);
    newDifficulty = Math.min(10.0, current.difficulty + 0.4);
  } else if (rating === 3) {
    // Good
    const factor = Math.max(1.8, 3.0 - (current.difficulty * 0.15));
    newStability = Math.max(2.0, (current.stability || 1) * factor);
    newDifficulty = Math.max(1.0, current.difficulty - 0.1);
  } else {
    // Easy
    const factor = Math.max(2.5, 4.2 - (current.difficulty * 0.15));
    newStability = Math.max(4.0, (current.stability || 1) * factor * 1.3);
    newDifficulty = Math.max(1.0, current.difficulty - 0.4);
  }

  const nextReviewDate = addDaysToDate(today, newStability);

  const updated: FSRSCard = {
    verseId,
    stability: Math.round(newStability * 10) / 10,
    difficulty: Math.round(newDifficulty * 10) / 10,
    reps: newReps,
    lapses: newLapses,
    state: newState,
    lastReviewDate: today,
    nextReviewDate,
    retrievability: 1.0
  };

  cards[verseId] = updated;
  saveFSRSCards(cards);
  return updated;
};

/**
 * Returns all cards whose nextReviewDate <= today
 */
export const getDueFSRSCards = (): FSRSCard[] => {
  const cards = loadFSRSCards();
  const today = getTodayKey();
  return Object.values(cards).filter(card => card.nextReviewDate <= today);
};

export const getDueFSRSCount = (): number => {
  return getDueFSRSCards().length;
};
