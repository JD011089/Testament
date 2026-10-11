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

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
};

const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysToDate = (dateStr: string, days: number): string => {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + Math.max(1, Math.round(days)));
  return formatLocalDate(date);
};

export const loadFSRSCards = (): Record<string, FSRSCard> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === 'null') return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, FSRSCard>;
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
    const today = parseLocalDate(getTodayKey()).getTime();
    const lastRev = parseLocalDate(card.lastReviewDate).getTime();
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

const nextStability = (
  current: FSRSCard,
  rating: 1 | 2 | 3 | 4
): { stability: number; difficulty: number; lapses: number; state: FSRSCard['state'] } => {
  if (rating === 1) {
    return {
      stability: Math.max(0.5, current.stability * 0.3),
      difficulty: Math.min(10.0, current.difficulty + 1.2),
      lapses: current.lapses + 1,
      state: 'relearning',
    };
  }
  if (rating === 2) {
    return {
      stability: Math.max(1.2, current.stability * 1.25),
      difficulty: Math.min(10.0, current.difficulty + 0.4),
      lapses: current.lapses,
      state: 'review',
    };
  }
  if (rating === 3) {
    const factor = Math.max(1.8, 3.0 - (current.difficulty * 0.15));
    return {
      stability: Math.max(2.0, (current.stability || 1) * factor),
      difficulty: Math.max(1.0, current.difficulty - 0.1),
      lapses: current.lapses,
      state: 'review',
    };
  }
  const factor = Math.max(2.5, 4.2 - (current.difficulty * 0.15));
  return {
    stability: Math.max(4.0, (current.stability || 1) * factor * 1.3),
    difficulty: Math.max(1.0, current.difficulty - 0.4),
    lapses: current.lapses,
    state: 'review',
  };
};

/**
 * Days until the next review if this rating were saved now.
 */
export const previewFSRSDays = (verseId: string, rating: 1 | 2 | 3 | 4): number => {
  const current = getFSRSCard(verseId);
  return Math.max(1, Math.round(nextStability(current, rating).stability));
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
  const next = nextStability(current, rating);
  const nextReviewDate = addDaysToDate(today, next.stability);

  const updated: FSRSCard = {
    verseId,
    stability: Math.round(next.stability * 10) / 10,
    difficulty: Math.round(next.difficulty * 10) / 10,
    reps: current.reps + 1,
    lapses: next.lapses,
    state: next.state,
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

/**
 * A verse is considered "Mastered" only after repeated successful recalls across days,
 * not after a single session or instant round.
 * Criteria: Reps >= 4, stability >= 7 days, lapses <= 1, state === 'review'.
 */
export const isVerseMastered = (verseId: string): boolean => {
  const card = getFSRSCard(verseId);
  return card.reps >= 4 && card.stability >= 7.0 && card.lapses <= 1 && card.state === 'review';
};

export const getAllMasteredVerseIds = (): string[] => {
  const cards = loadFSRSCards();
  return Object.values(cards)
    .filter(card => card.reps >= 4 && card.stability >= 7.0 && card.lapses <= 1 && card.state === 'review')
    .map(card => card.verseId);
};
