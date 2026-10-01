import type { RealLifeDilemma } from '../data/dilemmas';
import { getTodayDateKey } from './dailyEngine';
import { evaluateUserPlay, evaluateSocraticTurn2, type HeartEvaluationResult, type TemperamentProfile } from './heartEvaluation';
import { evaluateQuestCustomResponse, type QuestCustomEvaluation } from './questInstinctEngine';
import type { StoryQuest, StoryAct } from '../types/index';

// High-speed, low-latency models priority order
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest'
];

function getApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (envKey) return envKey;
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('testament_gemini_api_key') || '';
  }
  return '';
}

/**
 * Robust caller across fast Gemini Flash models with per-attempt timeout and graceful fallback.
 */
async function callGemini(prompt: string, maxTokens = 2500): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('Gemini API key is not configured');
    return null;
  }

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Gemini model ${model} returned HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      if (!parts || !Array.isArray(parts)) continue;

      const textPart = parts.find((p: { text?: string }) => typeof p.text === 'string' && p.text.trim().length > 0);
      if (textPart && textPart.text) {
        return textPart.text.trim();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Failed calling Gemini model ${model}:`, err);
    }
  }

  return null;
}

/**
 * Automatically provides today's real-life, faith-driven, non-political Christian dilemma.
 * If the Gemini API key is available, it dynamically generates and caches a fresh,
 * deeply relatable scenario grounded in scripture and everyday challenges.
 * Otherwise, it reliably returns today's curated dilemma.
 */
export async function getDynamicDailyDilemma(fallbackDilemma: RealLifeDilemma): Promise<RealLifeDilemma> {
  const todayKey = getTodayDateKey();
  const cacheKey = `testament_gemini_dilemma_${todayKey}`;

  // 1. Check local cache for today
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.id && parsed.title && parsed.plays?.length) {
        return parsed as RealLifeDilemma;
      }
    }
  } catch {
    // ignore cache read error
  }

  // If no Gemini API key configured, use fallback immediately
  if (!getApiKey()) {
    return fallbackDilemma;
  }

  // 2. Fetch fresh dynamic dilemma from Gemini Flash API
  try {
    const prompt = `You are an expert biblical counselor and pastoral mentor creating a daily Christian dilemma for an interactive discipleship app.

STRICT CRITERIA:
1. NON-POLITICAL: Strictly avoid partisan politics, government elections, culture wars, or legal debates.
2. LIFE-DRIVEN & RELATABLE: Focus exclusively on real everyday situations people face: workplace integrity, deceitful colleagues, financial strain, family estrangement, forgiving unrepentant relatives, pride vs humility, setting boundaries with grace, or handling burnout.
3. GROUNDED IN SCRIPTURE: Must feature a solid biblical anchor, a historical biblical parallel (e.g. David, Joseph, Daniel, Abigail, Nehemiah, Peter, Ruth, or Paul), and actionable biblical wisdom.
4. JSON FORMAT ONLY: Output ONLY valid, raw JSON matching this TypeScript structure, with no markdown, no backticks, no preamble:

{
  "id": "gemini-dilemma-${todayKey}",
  "title": "String (engaging 4-6 word title)",
  "category": "One of: 'Workplace & Ambition' | 'Family & Relationships' | 'Stress & Burnout' | 'Betrayal & Integrity'",
  "situationSetup": "String (2-3 concise, punchy paragraphs setting up a realistic contemporary Christian dilemma)",
  "whatIsAtStake": "String (1 sentence on the spiritual, relational, and practical stakes)",
  "biblicalParallel": {
    "hero": "Name of biblical figure",
    "event": "Concise summary of the biblical historical event",
    "lesson": "The core takeaway from how the biblical figure handled it"
  },
  "anchorScripture": {
    "reference": "e.g. Proverbs 15:1 or Colossians 3:23-24",
    "text": "The Scripture text in plain modern English",
    "streetMeaning": "A gritty, plain-English street translation explaining what this means right now"
  },
  "tacticalActionSteps": [
    "Step 1: First 60-second immediate move (calm the flesh)",
    "Step 2: Practical, boundary-setting or communication move",
    "Step 3: Long-term spiritual posture"
  ],
  "plays": [
    {
      "id": "play-flesh",
      "name": "The Flesh Reaction (What human instinct screams to do)",
      "playType": "Flesh Reaction",
      "action": "Description of the impulsive or avoidant flesh reaction",
      "outcome": "The destructive short-term and long-term fallout of this reaction",
      "biblicalRoot": "Why the flesh wants this and what Scripture warns against it",
      "scriptureReference": "Scripture warning",
      "isRecommended": false
    },
    {
      "id": "play-biblical",
      "name": "The Biblical Play (Calculated Grace & Truth)",
      "playType": "The Biblical Play",
      "action": "The courageous, spiritually disciplined response",
      "outcome": "How this guards your heart, preserves testimony, and invites God to act",
      "biblicalRoot": "The biblical doctrine and pattern demonstrated",
      "scriptureReference": "Supporting scripture",
      "isRecommended": true
    }
  ]
}`;

    const rawText = await callGemini(prompt, 2048);
    if (!rawText) return fallbackDilemma;

    const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText) as RealLifeDilemma;

    if (parsed && parsed.title && parsed.plays?.length) {
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to dynamically fetch Gemini daily dilemma, falling back to curated:', err);
  }

  return fallbackDilemma;
}

/**
 * Deeply personal AI evaluation of a user's typed response to a Christian Dilemma.
 * Directly critiques their specific words, ideas, and proposed actions in light of Scripture.
 * Falls back to the rule-based engine if offline or if API is unreachable.
 */
export async function evaluateUserPlayWithGemini(
  userInput: string,
  selectedFeeling: string | null,
  dilemma: RealLifeDilemma
): Promise<HeartEvaluationResult> {
  const cleanInput = userInput.trim();
  if (!cleanInput) {
    return evaluateUserPlay(userInput, selectedFeeling, dilemma);
  }

  const prompt = `You are an elite biblical counselor, pastoral mentor, and tactical discipleship coach.
Analyze the user's authentic personal response to this Christian life dilemma.

DILEMMA CONTEXT:
Title: "${dilemma.title}"
Category: "${dilemma.category}"
Situation: "${dilemma.situationSetup}"
What is at stake: "${dilemma.whatIsAtStake}"
Anchor Scripture: "${dilemma.anchorScripture.reference} - ${dilemma.anchorScripture.text}" (Street meaning: "${dilemma.anchorScripture.streetMeaning}")

USER'S SUBMITTED RESPONSE:
User's typed words: "${cleanInput.replace(/"/g, '\\"')}"
Selected emotional state: "${selectedFeeling || 'None specified'}"

CRITICAL INSTRUCTIONS:
1. DEEPLY PERSONAL & DIRECT: Speak directly to the user's exact words, people mentioned, and proposed strategy. Do NOT give generic or canned advice. If they mentioned taking someone to coffee, writing an email, giving up, setting a boundary, or praying, directly evaluate that exact action.
2. SCRIPTURAL & TACTICAL: Ground your feedback in biblical grace and truth. Highlight the spiritual strength of their response, but also gently expose any blindspots, subtle pride, fear of conflict, or flesh traps.
3. NON-POLITICAL: Focus exclusively on personal Christian character, relationship wisdom, workplace integrity, and emotional health.
4. VALID JSON ONLY: Return ONLY a valid JSON object matching this schema with no markdown formatting:

{
  "stanceTitle": "String (3-5 word title characterizing their exact strategy, e.g. 'The Restorative Diplomat', 'The Direct Truth-Speaker', 'The Reluctant Pacifier', etc.)",
  "stanceType": "One of: 'avenger' | 'escapist' | 'pacifier' | 'strategist' | 'raw_human'",
  "badgeColor": "One of: '#10b981' (emerald) | '#f59e0b' (amber) | '#ef4444' (red) | '#6366f1' (indigo) | '#06b6d4' (cyan)",
  "coreMotive": "String (1-2 sentences identifying the underlying heart motive behind what they said)",
  "userWordsAnalysis": {
    "userQuoteSummary": "String (1 concise sentence summarizing their exact approach in their own words)",
    "detectedKeywords": ["3-5 key phrases extracted directly from what they wrote"],
    "primaryTactic": "String (1 concise phrase describing their methodology)",
    "detectedTone": "String (e.g. 'Cautious yet principled', 'Emotionally drained', 'Prudent and collaborative')"
  },
  "directAnswerToUser": "String (2-3 paragraphs directly engaging what they said: evaluate their specific plan, what it gets right spiritually, and where it may encounter real-world friction or flesh temptations)",
  "tacticalProsCons": {
    "strength": "String (the genuine spiritual or practical strength of their idea)",
    "vulnerability": "String (the subtle vulnerability or blindspot inherent in their proposal)"
  },
  "humanValidation": "String (1 paragraph validating why any normal human would feel or react this way in their shoes)",
  "theFleshTrap": "String (1 paragraph exposing the subtle flesh snare, bitterness, people-pleasing, or pride disguised in this approach)",
  "biblicalPlayRedirect": "String (1 paragraph explaining how biblical wisdom or the model of Christ/Apostles elevates their instinct into spiritual maturity)",
  "scriptureReference": "String (e.g. Proverbs 15:1 or Matthew 18:15)",
  "scriptureText": "String (the scripture verse text)",
  "scriptureStreetMeaning": "String (punchy modern street-level application)",
  "tacticalMoves": [
    "Move 1: Immediate practical action for tomorrow morning directly applied to what they wrote",
    "Move 2: Communication boundary or practical step directly applied to what they wrote",
    "Move 3: Spiritual posture or prayer focus directly applied to what they wrote"
  ],
  "socraticChallenge": "String (a piercing follow-up question challenging them on what to do if their plan encounters resistance or unfairness)",
  "temperamentProfile": {
    "graceScore": 75,
    "truthScore": 80,
    "prudenceScore": 85,
    "courageScore": 70,
    "archetype": "The Prudent Peacemaker",
    "archetypeTitle": "The Prudent Peacemaker",
    "archetypeDescription": "Short description of their posture"
  }
}`;

  try {
    const raw = await callGemini(prompt, 2500);
    if (raw) {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as HeartEvaluationResult;
      if (parsed && (parsed.stanceTitle || parsed.directAnswerToUser)) {
        if (!parsed.stanceType) parsed.stanceType = 'strategist';
        if (!parsed.badgeColor) parsed.badgeColor = '#10b981';
        if (!Array.isArray(parsed.tacticalMoves) || parsed.tacticalMoves.length === 0) {
          parsed.tacticalMoves = [
            "Step 1: Pause and pray before reacting to calm human adrenaline.",
            "Step 2: Have a calm, direct, and factual conversation focused on truth and restoration.",
            "Step 3: Document clear commitments and anchor your identity in God rather than human praise."
          ];
        }
        if (!parsed.userWordsAnalysis) {
          parsed.userWordsAnalysis = {
            userQuoteSummary: cleanInput.slice(0, 100),
            detectedKeywords: [],
            primaryTactic: parsed.stanceTitle || 'Direct Response',
            detectedTone: 'Prudent'
          };
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gemini evaluation failed, falling back to rule-based engine:', err);
  }

  return evaluateUserPlay(userInput, selectedFeeling, dilemma);
}

/**
 * Deeply personal AI evaluation of the user's response to the Mentor's Socratic Counter-Challenge (Turn 2).
 */
export async function evaluateSocraticTurn2WithGemini(
  turn1Text: string,
  turn2Text: string,
  dilemma: RealLifeDilemma
): Promise<{ followUpFeedback: string; temperament: TemperamentProfile }> {
  const cleanTurn2 = turn2Text.trim();
  if (!cleanTurn2) {
    return evaluateSocraticTurn2(turn1Text, turn2Text, dilemma);
  }

  const prompt = `You are an elite biblical counselor and pastoral mentor evaluating a Christian user's response to your Socratic counter-challenge.

DILEMMA CONTEXT:
Title: "${dilemma.title}"
Scenario: "${dilemma.situationSetup}"

USER'S INITIAL APPROACH:
"${turn1Text.replace(/"/g, '\\"')}"

USER'S RESPONSE TO COUNTER-CHALLENGE:
"${cleanTurn2.replace(/"/g, '\\"')}"

CRITICAL INSTRUCTIONS:
1. Address their follow-up answer directly.
2. Evaluate whether they demonstrated spiritual maturity, biblical discernment, courageous grace, and practical boundaries.
3. Return ONLY valid JSON:

{
  "followUpFeedback": "String (2-3 paragraphs directly engaging their follow-up answer, offering pastoral wisdom, affirming what was wise, and warning against any residual flesh reaction)",
  "temperament": {
    "graceScore": 80,
    "truthScore": 85,
    "prudenceScore": 90,
    "courageScore": 75,
    "archetype": "String",
    "archetypeTitle": "String",
    "archetypeDescription": "String"
  }
}`;

  try {
    const raw = await callGemini(prompt, 1800);
    if (raw) {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && (parsed.followUpFeedback || parsed.temperament)) {
        if (!parsed.temperament) {
          parsed.temperament = {
            graceScore: 75,
            truthScore: 80,
            prudenceScore: 85,
            courageScore: 70,
            archetype: "Prudent Guardian",
            archetypeTitle: "The Prudent Guardian",
            archetypeDescription: "Balanced discernment under pressure."
          };
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gemini Turn 2 evaluation failed, falling back to rule-based engine:', err);
  }

  return evaluateSocraticTurn2(turn1Text, turn2Text, dilemma);
}

/**
 * Evaluates the user's authentic response to a Quest crossroads in light of biblical history.
 */
export async function evaluateQuestCustomResponseWithGemini(
  userInput: string,
  act: StoryAct,
  quest: StoryQuest
): Promise<QuestCustomEvaluation> {
  const cleanInput = userInput.trim();
  if (!cleanInput) {
    return evaluateQuestCustomResponse(userInput, act, quest);
  }

  const prompt = `You are a biblical historian and master disciple-maker analyzing a user's authentic response to a pivotal biblical crossroads.

QUEST: "${quest.title}" (${quest.heroName})
ACT: "${act.actTitle}"
HISTORICAL CONTEXT: "${act.historicalContext}"
SITUATION / PERSPECTIVE: "${act.perspectivePrompt}"
CHOICES FACED: "${act.choices.map(c => c.text).join(' | ')}"
BIBLICAL RESOLUTION: "${act.realTalkTakeaway.practicalLesson}"

USER'S AUTHENTIC RESPONSE:
"${cleanInput.replace(/"/g, '\\"')}"

CRITICAL INSTRUCTIONS:
1. Address the user's EXACT words and proposed course of action.
2. Compare their instinct directly with what ${quest.heroName} and the biblical figures did in Scripture.
3. Return ONLY valid JSON:

{
  "stanceType": "One of: 'wrath_combat' | 'escape_fear' | 'borrowed_armor' | 'diplomatic_pacify' | 'steadfast_faith' | 'raw_instinct'",
  "stanceTitle": "String (e.g. 'Covenant Boldness', 'Borrowed Strength', 'Strategic Restraint')",
  "stanceBadge": "String (e.g. '⚡ Faith-Driven Action', '🛡️ Self-Preservation', '⚔️ Flesh Combat')",
  "userSummary": "String (1-2 sentences summarizing and directly quoting their chosen path)",
  "humanInstinct": "String (psychological validation of why human nature instinctively leans toward this response)",
  "historicalPivot": "String (how this compares to what ${quest.heroName} actually faced and decided in biblical history)",
  "practicalLesson": "String (actionable modern application for the user's everyday life)"
}`;

  try {
    const raw = await callGemini(prompt, 1500);
    if (raw) {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as QuestCustomEvaluation;
      if (parsed && (parsed.stanceTitle || parsed.practicalLesson || parsed.humanInstinct)) {
        if (!parsed.stanceType) parsed.stanceType = 'steadfast_faith';
        if (!parsed.stanceBadge) parsed.stanceBadge = '⚡ Faith-Driven Action';
        if (!parsed.userSummary) parsed.userSummary = cleanInput.slice(0, 80);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gemini quest response evaluation failed, falling back:', err);
  }

  return evaluateQuestCustomResponse(userInput, act, quest);
}
