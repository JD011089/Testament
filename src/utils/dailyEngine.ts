import { getAllVerses, getVerseById } from './verseRegistry';
import type { MemoryVerse } from '../types';
import { MORNING_BRIEFINGS } from '../data/morningBriefings';
import type { MorningBriefing } from '../data/morningBriefings';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import type { RealLifeDilemma } from '../data/dilemmas';
import { STORY_QUESTS } from '../data/stories';
import { getTodayDailyCampaign } from '../data/dailyCampaigns';
import { getComposedDailyMission } from './missionComposer';
import type { StoryQuest, StoryAct } from '../types';
import type { UserCalibrationProfile } from '../components/OnboardingModal';
import { getDueFSRSCards } from './fsrsEngine';
import { getTodayBattlefieldId, setTodayBattlefieldId } from './battlefield';
export { getTodayBattlefieldId, setTodayBattlefieldId };

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
export const getTodayFormatted = (lang?: SupportedLanguage): string => {
  const activeLang = lang ?? getStoredLanguage();
  const locale = activeLang === 'fr' ? 'fr-FR' : activeLang === 'es' ? 'es-ES' : 'en-US';
  return new Date().toLocaleDateString(locale, {
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

import { getStoredLanguage, type SupportedLanguage } from '../context/LanguageContext';
import { getLocalizedDilemma } from './localizedScripture';

/**
 * Deterministically rotates today's verse across the entire 121-verse library
 */
export const getDailyVerse = (offsetDays = 0, lang?: SupportedLanguage): MemoryVerse => {
  const activeLang = lang ?? getStoredLanguage();
  const all = getAllVerses(activeLang);
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


/**
 * Deterministically aligns today's featured tactical dilemma with the 1 dilemma of today's Daily Campaign
 * (Requirement 6: There should only be 1 dilemma per daily campaign, or customized by today's Battlefield Check-in)
 */
export const getDailyDilemma = (offsetDays = 0, lang?: SupportedLanguage): RealLifeDilemma => {
  const activeLang = lang ?? getStoredLanguage();
  const bfId = getTodayBattlefieldId();
  if (bfId) {
    if (bfId === 'anxiety-overwhelm') {
      const match = REAL_LIFE_DILEMMAS.find(d => d.id === 'dilemma-burnout');
      if (match) return getLocalizedDilemma(match, activeLang);
    } else {
      const match = REAL_LIFE_DILEMMAS.find(d => d.id === 'dilemma-credit-thief');
      if (match) return getLocalizedDilemma(match, activeLang);
    }
  }

  const campaign = offsetDays === 0 ? getComposedDailyMission() : getTodayDailyCampaign(offsetDays);
  const dilemmaStep = campaign.steps.find(s => s.type === 'dilemma');
  if (dilemmaStep) {
    const matched = REAL_LIFE_DILEMMAS.find(d => d.id === dilemmaStep.targetId);
    if (matched) return getLocalizedDilemma(matched, activeLang);
  }
  const index = (getDayIndex(offsetDays)) % REAL_LIFE_DILEMMAS.length;
  return getLocalizedDilemma(REAL_LIFE_DILEMMAS[index], activeLang);
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
 * Returns the first FSRS-due verse (single spaced-repetition source of truth).
 * Prefer this over any legacy mastery-date heuristics.
 */
export const getSpacedRepetitionDueVerse = (_memorizedVerses: string[] = []): MemoryVerse | null => {
  const dueCards = getDueFSRSCards();
  for (const card of dueCards) {
    const verse = getVerseById(card.verseId);
    if (verse) return verse;
  }
  return null;
};

/**
 * Computes a lightweight next objective. Daily Mission remains the primary path;
 * this is used only as a fallback hint (e.g. FSRS due reviews).
 */
export const getAdaptiveNextObjective = (
  completedActs: string[],
  userProfile?: UserCalibrationProfile | null,
  _memorizedVerses: string[] = []
): AdaptiveObjective => {
  // 1. FSRS-due retention (deterministic — no random coin flip)
  const dueVerse = getSpacedRepetitionDueVerse();
  if (dueVerse) {
    return {
      type: 'retention_drill',
      title: `Retention Drill: ${dueVerse.reference}`,
      subtitle: `Due for review • Keep your edge sharp before memory fades.`,
      badge: 'FSRS Review',
      targetVerseId: dueVerse.id
    };
  }

  // 2. Identify target quest: battlefield check-in, then user profile recommendation
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

/**
 * Single source of truth for daily streak count across all views (Dashboard, Recap, Nav).
 */
export const getDailyStreakCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = Number(localStorage.getItem('testament_streak'));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
};

/**
 * Records daily activity and updates the streak with weekly grace day forgiveness.
 */
export const recordDailyActivityStreak = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('testament_last_active');
    const stored = getDailyStreakCount();
    if (lastActive === today) return stored;

    const diffDays = lastActive
      ? Math.round((new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const now = new Date();
    const currentWeekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)}`;
    const lastGraceWeek = localStorage.getItem('testament_last_grace_week');

    let next = 1;
    if (!lastActive) {
      next = 1;
    } else if (diffDays === 1) {
      next = stored + 1;
    } else if (diffDays === 2 && lastGraceWeek !== currentWeekKey) {
      // Missed yesterday, but protected by weekly grace day!
      localStorage.setItem('testament_last_grace_week', currentWeekKey);
      next = stored + 1;
    } else {
      next = 1;
    }

    localStorage.setItem('testament_streak', String(next));
    localStorage.setItem('testament_last_active', today);
    return next;
  } catch {
    return 1;
  }
};
