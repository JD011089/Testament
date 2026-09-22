import { MEMORY_VERSES } from '../data/verses';
import type { MemoryVerse } from '../types';
import { MORNING_BRIEFINGS } from '../data/morningBriefings';
import type { MorningBriefing } from '../data/morningBriefings';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import type { RealLifeDilemma } from '../data/dilemmas';
import { STORY_QUESTS } from '../data/stories';
import type { StoryQuest, StoryAct } from '../types';
import type { UserCalibrationProfile } from '../components/OnboardingModal';

export interface AdaptiveObjective {
  type: 'next_act' | 'retention_drill' | 'all_completed';
  title: string;
  subtitle: string;
  badge: string;
  targetVerseId?: string;
  targetQuest?: StoryQuest;
  targetAct?: StoryAct;
}

/**
 * Returns YYYY-MM-DD in local time
 */
export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns formatted date string, e.g. "Tuesday, Sep 22"
 */
export const getTodayFormatted = (): string => {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Returns a stable day index based on local midnight timestamp
 */
export const getDayIndex = (offsetDays = 0): number => {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayIndex = Math.floor(localMidnight / (1000 * 60 * 60 * 24)) + offsetDays;
  return Math.abs(dayIndex);
};

/**
 * Deterministically rotates today's verse
 */
export const getDailyVerse = (offsetDays = 0): MemoryVerse => {
  const index = (getDayIndex(offsetDays)) % MEMORY_VERSES.length;
  return MEMORY_VERSES[index];
};

/**
 * Selects today's 3-Minute Morning Briefing aligned with day-of-week
 */
export const getDailyBriefing = (): MorningBriefing => {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  return MORNING_BRIEFINGS[dayOfWeek] || MORNING_BRIEFINGS[0];
};

/**
 * Deterministically rotates today's featured tactical dilemma
 */
export const getDailyDilemma = (offsetDays = 0): RealLifeDilemma => {
  const index = (getDayIndex(offsetDays)) % REAL_LIFE_DILEMMAS.length;
  return REAL_LIFE_DILEMMAS[index];
};

/**
 * Records when a verse was mastered/reviewed for Spaced Repetition
 */
export const recordVerseMasteryDate = (verseId: string): void => {
  try {
    const dates: Record<string, string> = JSON.parse(
      localStorage.getItem('testament_verse_mastery_dates') || '{}'
    );
    dates[verseId] = new Date().toISOString();
    localStorage.setItem('testament_verse_mastery_dates', JSON.stringify(dates));
  } catch (err) {
    console.error('Failed to save mastery date', err);
  }
};

/**
 * Checks for any mastered verse due for retention review (mastered >= 3 days ago)
 */
export const getSpacedRepetitionDueVerse = (memorizedVerses: string[]): MemoryVerse | null => {
  if (memorizedVerses.length === 0) return null;

  try {
    const dates: Record<string, string> = JSON.parse(
      localStorage.getItem('testament_verse_mastery_dates') || '{}'
    );
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

    // Find first verse mastered > 3 days ago, or the oldest reviewed verse
    let oldestVerseId: string | null = null;
    let oldestTimestamp = Infinity;

    for (const verseId of memorizedVerses) {
      const timestamp = dates[verseId] ? new Date(dates[verseId]).getTime() : 0;
      if (timestamp < threeDaysAgo) {
        // Due for review!
        const verse = MEMORY_VERSES.find(v => v.id === verseId);
        if (verse) return verse;
      }
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestVerseId = verseId;
      }
    }

    // If all are recent but user has 2+ mastered verses, pick the oldest
    if (oldestVerseId) {
      return MEMORY_VERSES.find(v => v.id === oldestVerseId) || null;
    }
  } catch (err) {
    console.error('Error computing spaced repetition', err);
  }
  return null;
};

/**
 * Dynamically computes the user's Next Objective based on progress
 */
export const getAdaptiveNextObjective = (
  completedActs: string[],
  userProfile?: UserCalibrationProfile | null,
  memorizedVerses: string[] = []
): AdaptiveObjective => {
  // 1. Check if a verse is due for review
  const dueVerse = getSpacedRepetitionDueVerse(memorizedVerses);
  if (dueVerse && Math.random() < 0.35 && memorizedVerses.length >= 2) {
    return {
      type: 'retention_drill',
      title: `Retention Drill: ${dueVerse.reference}`,
      subtitle: `Mastered previously • Keep your edge sharp before memory fades.`,
      badge: 'Spaced Repetition',
      targetVerseId: dueVerse.id
    };
  }

  // 2. Identify target quest: prioritized by user profile recommendation or default to David
  const preferredQuestId = userProfile?.recommendedQuestId || 'david-journey';
  const orderedQuests = [
    ...STORY_QUESTS.filter(q => q.id === preferredQuestId),
    ...STORY_QUESTS.filter(q => q.id !== preferredQuestId)
  ];

  for (const quest of orderedQuests) {
    for (const act of quest.acts) {
      if (!completedActs.includes(act.id)) {
        return {
          type: 'next_act',
          title: `${quest.heroName} • Act ${act.actNumber}: ${act.actTitle}`,
          subtitle: act.sceneAtmosphere,
          badge: 'Next Mission',
          targetQuest: quest,
          targetAct: act,
          targetVerseId: act.unlockedScripture.reference.includes('Proverbs') ? 'verse-5' : undefined
        };
      }
    }
  }

  return {
    type: 'all_completed',
    title: 'All Quests Mastered • Veteran of the Crucible',
    subtitle: 'You have conquered every trial. Continue sharpening verses in the Word Forge.',
    badge: 'Iron Pillar'
  };
};

/**
 * Check if a daily bonus was already claimed today
 */
export const isDailyBonusClaimed = (type: 'briefing' | 'drill'): boolean => {
  const key = `testament_daily_bonus_${type}_${getTodayDateKey()}`;
  return localStorage.getItem(key) === 'true';
};

/**
 * Mark daily bonus as claimed for today
 */
export const claimDailyBonus = (type: 'briefing' | 'drill'): void => {
  const key = `testament_daily_bonus_${type}_${getTodayDateKey()}`;
  localStorage.setItem(key, 'true');
};
