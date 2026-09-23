import { getAllVerses, getVerseById } from './verseRegistry';
import type { MemoryVerse } from '../types';
import { MORNING_BRIEFINGS } from '../data/morningBriefings';
import type { MorningBriefing } from '../data/morningBriefings';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import type { RealLifeDilemma } from '../data/dilemmas';
import { STORY_QUESTS } from '../data/stories';
import { getTodayDailyCampaign } from '../data/dailyCampaigns';
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
 * Formatted human-readable date
 */
export const getTodayFormatted = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
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
 * Deterministically rotates today's verse across the entire 121-verse library
 */
export const getDailyVerse = (offsetDays = 0): MemoryVerse => {
  const all = getAllVerses();
  const index = (getDayIndex(offsetDays)) % all.length;
  return all[index];
};

/**
 * Selects today's 3-Minute Morning Briefing aligned with day-of-week
 */
export const getDailyBriefing = (): MorningBriefing => {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  return MORNING_BRIEFINGS[dayOfWeek] || MORNING_BRIEFINGS[0];
};

export const getTodayBattlefieldId = (): string | null => {
  try {
    return localStorage.getItem('testament_todays_battlefield');
  } catch {
    return null;
  }
};

export const setTodayBattlefieldId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem('testament_todays_battlefield', id);
    } else {
      localStorage.removeItem('testament_todays_battlefield');
    }
    window.dispatchEvent(new CustomEvent('testament-battlefield-changed', { detail: { battlefieldId: id } }));
  } catch {
    // ignore
  }
};

/**
 * Deterministically aligns today's featured tactical dilemma with the 1 dilemma of today's Daily Campaign
 * (Requirement 6: There should only be 1 dilemma per daily campaign, or customized by today's Battlefield Check-in)
 */
export const getDailyDilemma = (offsetDays = 0): RealLifeDilemma => {
  const bfId = getTodayBattlefieldId();
  if (bfId) {
    if (bfId === 'anxiety-overwhelm') {
      const match = REAL_LIFE_DILEMMAS.find(d => d.id === 'dilemma-burnout');
      if (match) return match;
    } else {
      const match = REAL_LIFE_DILEMMAS.find(d => d.id === 'dilemma-credit-thief');
      if (match) return match;
    }
  }

  const campaign = getTodayDailyCampaign(offsetDays);
  const dilemmaStep = campaign.steps.find(s => s.type === 'dilemma');
  if (dilemmaStep) {
    const matched = REAL_LIFE_DILEMMAS.find(d => d.id === dilemmaStep.targetId);
    if (matched) return matched;
  }
  const index = (getDayIndex(offsetDays)) % REAL_LIFE_DILEMMAS.length;
  return REAL_LIFE_DILEMMAS[index];
};

/**
 * Records when a verse was mastered/reviewed for Spaced Repetition
 */
export const recordVerseMasteryDate = (verseId: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
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
  if (typeof window === 'undefined' || !window.localStorage) return null;

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
        const verse = getVerseById(verseId);
        if (verse) return verse;
      }
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestVerseId = verseId;
      }
    }

    // If all are recent but user has 2+ mastered verses, pick the oldest
    if (oldestVerseId) {
      return getVerseById(oldestVerseId);
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

  // 2. Identify target quest: prioritized by today's battlefield check-in, then user profile recommendation
  const bfId = getTodayBattlefieldId();
  let preferredQuestId = userProfile?.recommendedQuestId || 'david-journey';
  if (bfId === 'anxiety-overwhelm') preferredQuestId = 'elijah-journey';
  else if (bfId === 'betrayal-relational') preferredQuestId = 'joseph-journey';
  else if (bfId === 'high-stakes-decision') preferredQuestId = 'peter-journey';
  else if (bfId === 'workplace-politics') preferredQuestId = 'david-journey';

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
