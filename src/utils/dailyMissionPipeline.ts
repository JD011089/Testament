import {
  CURATED_DAILY_PASSAGES,
  getDailyCuratedPassage,
  type CuratedPassage,
  type CuratedPassageBackstory
} from '../data/dailyPassages';
import { getTodayDateKey } from './dailyEngine';
import { sanitizeGrammarArticles } from './textUtils';

export interface GeneratedDailyMission {
  id: string;
  dateKey: string;
  passageId: string;
  passageReference: string;
  heroName: string;
  scenarioQuestion: string;
  presetChoices: { id: string; text: string; stance?: string }[];
  storyRetelling: string[]; // max 150 words
  keyVerseReference: string;
  keyVerseText: string;
  kjvVerseText: string;
  actionLine: string;
  backstory?: CuratedPassageBackstory;
}

export interface PersonalizedMissionResult {
  mirrorBack: string;
  actionLine: string;
  source: 'local_rule' | 'default';
}

/**
 * Builds a mission from a curated passage's static fallback
 */
export function buildStaticFallbackMission(passage: CuratedPassage, dateKey: string): GeneratedDailyMission {
  return {
    id: `mission-${passage.id}-${dateKey}`,
    dateKey,
    passageId: passage.id,
    passageReference: passage.reference,
    heroName: passage.heroName,
    scenarioQuestion: passage.staticFallback.scenarioQuestion,
    presetChoices: passage.staticFallback.presetChoices,
    storyRetelling: passage.staticFallback.storyRetelling.map(p => sanitizeGrammarArticles(p)),
    keyVerseReference: passage.keyVerseReference,
    keyVerseText: passage.keyVerseText,
    kjvVerseText: passage.kjvKeyVerseText,
    actionLine: passage.staticFallback.actionLine,
    backstory: passage.backstory
  };
}

/**
 * Synchronous accessor for cold-open: returns cached mission or instant static fallback in 0ms
 */
export function getDailyMissionSync(
  dateKey = getTodayDateKey(),
  dayOffset = 0,
  battlefieldId?: string | null
): GeneratedDailyMission {
  const passage = getDailyCuratedPassage(dayOffset, battlefieldId);
  const cacheKey = `testament_daily_generated_mission_${passage.id}_${dateKey}`;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored) as GeneratedDailyMission;
        if (parsed && parsed.scenarioQuestion && parsed.keyVerseText && parsed.presetChoices?.length) {
          return parsed;
        }
      }
    }
  } catch {
    // ignore cache failure
  }

  return buildStaticFallbackMission(passage, dateKey);
}

/**
 * Daily mission accessor. Missions are curated and bundled with the app so
 * they load instantly, work offline, and never depend on a paid API.
 */
export async function getDailyMission(
  dateKey = getTodayDateKey(),
  dayOffset = 0,
  battlefieldId?: string | null
): Promise<GeneratedDailyMission> {
  return getDailyMissionSync(dateKey, dayOffset, battlefieldId);
}

/**
 * Lightweight per-user personalization after the decision is made.
 * Runs entirely on-device with hand-written rules for instant results.
 */
export function getLocalDecisionPersonalization(
  userDecision: string | null,
  mission: GeneratedDailyMission
): PersonalizedMissionResult {
  const passage = CURATED_DAILY_PASSAGES.find(p => p.id === mission.passageId) || CURATED_DAILY_PASSAGES[0];

  if (!userDecision || !userDecision.trim()) {
    return {
      mirrorBack: passage.staticFallback.defaultMirrorBack,
      actionLine: mission.actionLine,
      source: 'default'
    };
  }

  const clean = userDecision.trim();

  // 1. Check exact preset match (by ID, or by matching preset choice text)
  if (passage.staticFallback.mirrorBackRules[clean]) {
    return {
      mirrorBack: passage.staticFallback.mirrorBackRules[clean],
      actionLine: mission.actionLine,
      source: 'local_rule'
    };
  }

  const matchedChoice = mission.presetChoices.find(
    c => c.id === clean || c.text.trim().toLowerCase() === clean.toLowerCase()
  );
  if (matchedChoice && passage.staticFallback.mirrorBackRules[matchedChoice.id]) {
    return {
      mirrorBack: passage.staticFallback.mirrorBackRules[matchedChoice.id],
      actionLine: mission.actionLine,
      source: 'local_rule'
    };
  }

  // 2. Fallback heuristic for custom text
  const lower = clean.toLowerCase();
  if (/shut|isolate|hide|alone|cut|quiet|bed/i.test(lower)) {
    return {
      mirrorBack: `You chose to go quiet and wait — ${mission.heroName} fought that exact urge under pressure.`,
      actionLine: `Send one honest text to someone in your corner today instead of staying alone.`,
      source: 'local_rule'
    };
  }
  if (/lash|angry|yell|scream|fight|blame|retaliate/i.test(lower)) {
    return {
      mirrorBack: `You chose to express your anger — ${mission.heroName} felt that anger too, but chose self-control over revenge.`,
      actionLine: `Take a ten-minute breather before responding to that irritating message today.`,
      source: 'local_rule'
    };
  }
  if (/run|flee|escape|quit|leave|give\s*up/i.test(lower)) {
    return {
      mirrorBack: `You chose to run away — ${mission.heroName} fled into the wilderness, but learned peace isn't found in running away.`,
      actionLine: `Pick the one hard task you've been avoiding and tackle five minutes of it.`,
      source: 'local_rule'
    };
  }

  return {
    mirrorBack: `You chose to face this directly — ${mission.heroName} had to make that same hard choice when tested.`,
    actionLine: mission.actionLine,
    source: 'local_rule'
  };
}