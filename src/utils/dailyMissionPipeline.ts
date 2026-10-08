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
  isAiGenerated: boolean;
  reflectionBadge: string;
  backstory?: CuratedPassageBackstory;
}

export interface PersonalizedMissionResult {
  mirrorBack: string;
  actionLine: string;
  source: 'gemini' | 'local_rule' | 'default';
  reflectionBadge: string;
}

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest'
];

function getApiKey(): string {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('testament_gemini_api_key');
    if (stored !== null) return stored.trim();
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY.trim();
    }
  } catch {
    // ignore
  }
  return 'AIzaSyDnxe9vZ9IoxlaBJ7ZRRZHJEGDXCvFW8S4';
}

function wordCount(paragraphs: string[]): number {
  return paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Builds a mission from a curated passage's static fallback
 */
export function buildStaticFallbackMission(passage: CuratedPassage, dateKey: string): GeneratedDailyMission {
  return {
    id: `mission-${dateKey}`,
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
    isAiGenerated: false,
    reflectionBadge: '✨ AI reflection • Not Scripture',
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
  const cacheKey = `testament_daily_generated_mission_${dateKey}`;
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

  const passage = getDailyCuratedPassage(dayOffset, battlefieldId);
  return buildStaticFallbackMission(passage, dateKey);
}

/**
 * Asynchronous Daily Generation Pipeline.
 * 1. Checks cache for dateKey.
 * 2. If not cached, calls Gemini with in-context verbatim passage text and strict grounding rules.
 * 3. Enforces max 150-word story retelling and no-invention constraints.
 * 4. Caches and returns mission; falls back seamlessly to static fallback if key removed or API fails.
 */
export async function getDailyMission(
  dateKey = getTodayDateKey(),
  dayOffset = 0,
  battlefieldId?: string | null
): Promise<GeneratedDailyMission> {
  const cacheKey = `testament_daily_generated_mission_${dateKey}`;
  const passage = getDailyCuratedPassage(dayOffset, battlefieldId);

  // 1. Return from cache if already generated today
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
    // continue
  }

  // 2. Check API key
  const apiKey = getApiKey();
  if (!apiKey) {
    // API key removed: return static fallback instantly
    const fallback = buildStaticFallbackMission(passage, dateKey);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      }
    } catch {
      // ignore
    }
    return fallback;
  }

  // 3. Call Gemini with strict grounding instructions
  const prompt = `You are a biblical narrative AI generating today's decision-first mission for Testament, an app for ADHD learners.

PASSAGE REFERENCE: ${passage.reference}
HERO: ${passage.heroName}
VERBATIM SCRIPTURE TEXT:
"""
${passage.passageText}
"""

STRICT GROUNDING RULES (NON-NEGOTIABLE):
1. Retell ONLY what is in the provided passage text above.
2. NO INVENTED EVENTS, dialogue, characters, motives, or details. When in doubt, say less.
3. The key verse MUST be copied verbatim from the passage text; never paraphrase scripture text itself.
4. Reading level: plain modern English (say it simpler by default).
5. The story retelling must be max 140 words total across 2 to 3 short paragraphs.
6. The decision scenario question must ask what the USER would do in a similar high-stakes crossroad BEFORE seeing what happened. Provide 3-4 nuanced preset choices reflecting real human responses (e.g. go quiet and wait alone, get angry, run away, reach out for help), NEVER a binary right/wrong pair.
7. Use plain, concrete words. No idioms, slang, or figures of speech.

Return ONLY a valid JSON object matching this structure:
{
  "scenarioQuestion": "string (the provocative scenario question)",
  "presetChoices": [
    { "id": "choice-1", "text": "Nuanced human reaction (go quiet/isolate - plain words, no idioms)" },
    { "id": "choice-2", "text": "Nuanced human reaction (get angry/frustration - plain words, no idioms)" },
    { "id": "choice-3", "text": "Nuanced human reaction (run away/avoid - plain words, no idioms)" },
    { "id": "choice-4", "text": "Nuanced human reaction (reach out for help - plain words, no idioms)" }
  ],
  "storyRetelling": [
    "Paragraph 1 (short plain English narrative)",
    "Paragraph 2 (short plain English narrative)",
    "Paragraph 3 (short plain English narrative)"
  ],
  "keyVerseReference": "${passage.keyVerseReference}",
  "keyVerseText": "${passage.keyVerseText}",
  "actionLine": "One concrete action line for today starting with a strong verb. Under 20 words."
}`;

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 500,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = JSON.parse(rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

      if (
        parsed.scenarioQuestion &&
        Array.isArray(parsed.presetChoices) &&
        parsed.presetChoices.length >= 3 &&
        Array.isArray(parsed.storyRetelling) &&
        parsed.actionLine
      ) {
        // Enforce word count limit (≤150 words) and sanitize grammar
        let cleanRetelling = (parsed.storyRetelling as string[]).map(p => sanitizeGrammarArticles(p));
        if (wordCount(cleanRetelling) > 150) {
          cleanRetelling = passage.staticFallback.storyRetelling.map(p => sanitizeGrammarArticles(p));
        }

        const generatedMission: GeneratedDailyMission = {
          id: `mission-${dateKey}`,
          dateKey,
          passageId: passage.id,
          passageReference: passage.reference,
          heroName: passage.heroName,
          scenarioQuestion: parsed.scenarioQuestion.trim(),
          presetChoices: parsed.presetChoices.map((c: { id?: string; text: string }, i: number) => ({
            id: c.id || `choice-${i + 1}`,
            text: c.text.trim()
          })),
          storyRetelling: cleanRetelling,
          keyVerseReference: passage.keyVerseReference,
          keyVerseText: passage.keyVerseText,
          kjvVerseText: passage.kjvKeyVerseText,
          actionLine: parsed.actionLine.trim(),
          isAiGenerated: true,
          reflectionBadge: '✨ AI reflection • Not Scripture',
          backstory: passage.backstory
        };

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify(generatedMission));
          }
        } catch {
          // ignore cache error
        }

        return generatedMission;
      }
    } catch {
      clearTimeout(timeoutId);
      // Try next model or fallback
    }
  }

  // Fallback to passage static mission
  const fallback = buildStaticFallbackMission(passage, dateKey);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
    }
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Lightweight per-user personalization after the decision is made.
 * 1. Immediately returns high-quality local mirror-back in 0ms.
 * 2. If Gemini key is available and caller is async, tailors dynamically.
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
      source: 'default',
      reflectionBadge: '✨ AI reflection • Not Scripture'
    };
  }

  const clean = userDecision.trim();

  // 1. Check exact preset match (by ID, or by matching preset choice text)
  if (passage.staticFallback.mirrorBackRules[clean]) {
    return {
      mirrorBack: passage.staticFallback.mirrorBackRules[clean],
      actionLine: mission.actionLine,
      source: 'local_rule',
      reflectionBadge: '✨ AI reflection • Not Scripture'
    };
  }

  const matchedChoice = mission.presetChoices.find(
    c => c.id === clean || c.text.trim().toLowerCase() === clean.toLowerCase()
  );
  if (matchedChoice && passage.staticFallback.mirrorBackRules[matchedChoice.id]) {
    return {
      mirrorBack: passage.staticFallback.mirrorBackRules[matchedChoice.id],
      actionLine: mission.actionLine,
      source: 'local_rule',
      reflectionBadge: '✨ AI reflection • Not Scripture'
    };
  }

  // 2. Fallback heuristic for custom text
  const lower = clean.toLowerCase();
  if (/shut|isolate|hide|alone|cut|quiet|bed/i.test(lower)) {
    return {
      mirrorBack: `You chose to go quiet and wait — ${mission.heroName} fought that exact urge under pressure.`,
      actionLine: `Send one honest text to someone in your corner today instead of staying alone.`,
      source: 'local_rule',
      reflectionBadge: '✨ AI reflection • Not Scripture'
    };
  }
  if (/lash|angry|yell|scream|fight|blame|retaliate/i.test(lower)) {
    return {
      mirrorBack: `You chose to express your anger — ${mission.heroName} felt that anger too, but chose self-control over revenge.`,
      actionLine: `Take a ten-minute breather before responding to that irritating message today.`,
      source: 'local_rule',
      reflectionBadge: '✨ AI reflection • Not Scripture'
    };
  }
  if (/run|flee|escape|quit|leave|give\s*up/i.test(lower)) {
    return {
      mirrorBack: `You chose to run away — ${mission.heroName} fled into the wilderness, but learned peace isn't found in running away.`,
      actionLine: `Pick the one hard task you've been avoiding and tackle five minutes of it.`,
      source: 'local_rule',
      reflectionBadge: '✨ AI reflection • Not Scripture'
    };
  }

  return {
    mirrorBack: `You chose to face this directly — ${mission.heroName} had to make that same hard choice when tested.`,
    actionLine: mission.actionLine,
    source: 'local_rule',
    reflectionBadge: '✨ AI reflection • Not Scripture'
  };
}

/**
 * Async Gemini personalization caller with strict timeout.
 */
export async function fetchPersonalizedMirrorBack(
  userDecision: string,
  mission: GeneratedDailyMission
): Promise<{ mirrorBack: string; actionLine: string } | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = `You are a biblical guide for Testament, a decision-first Bible app.
HERO: ${mission.heroName}
PASSAGE: ${mission.passageReference}
SCENARIO QUESTION: "${mission.scenarioQuestion}"
USER'S DECISION: "${userDecision.replace(/"/g, '\\"')}"

STRICT GROUNDING RULES:
1. Retell ONLY what connects to ${mission.heroName}'s recorded response in this passage.
2. Produce a single punchy mirror-back line: "You chose to face this — ${mission.heroName} [what hero did]..." (under 20 words).
3. Tailor the action line for the user's day (starts with a strong verb, under 20 words).
4. Use plain, concrete words. No idioms, slang, or figures of speech.

Return ONLY JSON:
{
  "mirrorBack": "string",
  "actionLine": "string"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 150,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    if (parsed.mirrorBack && parsed.actionLine) {
      return {
        mirrorBack: String(parsed.mirrorBack).trim(),
        actionLine: String(parsed.actionLine).trim()
      };
    }
  } catch {
    clearTimeout(timeoutId);
  }

  return null;
}
