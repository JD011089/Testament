/**
 * Gemini-powered engagement features for Testament
 * Designed for hands-on learners & ADHD readers: short, plain, non-overwhelming.
 * 
 * Rules:
 * - Encouraging, plain-spoken, tactical tone.
 * - Reflections only — NEVER presented as Scripture text.
 * - Grounded in passage / cites reference.
 * - Default SHORT: 1-3 sentences.
 * - 10-year-old reading level / no jargon.
 * - Model: Fast Flash-class, max tokens ~150, temperature 0.7.
 * - In-memory session cache for passage texts.
 */

import { callServerGemini } from './geminiClient';

/** In-memory session cache for passage text to avoid redundant transfers */
const sessionPassageCache = new Map<string, string>();

export function getCachedPassage(reference: string): string | undefined {
  return sessionPassageCache.get(reference.trim().toLowerCase());
}

export function cachePassage(reference: string, text: string): void {
  if (reference && text) {
    sessionPassageCache.set(reference.trim().toLowerCase(), text.trim());
  }
}

/**
 * Lightweight, fast Gemini caller bounded to ~150 max output tokens
 */
async function callGeminiFlash(
  prompt: string,
  options?: { maxTokens?: number; responseMimeType?: string }
): Promise<string | null> {
  return callServerGemini(prompt, {
    maxTokens: options?.maxTokens ?? 160,
    responseMimeType: options?.responseMimeType,
    timeoutMs: 9000,
  });
}

/* =========================================================================
   FEATURE 1: "What does this mean?" passage Q&A
   ========================================================================= */

export interface PassageQARequest {
  passageText: string;
  reference: string;
  userQuestion: string;
}

export async function askPassageQuestion({
  passageText,
  reference,
  userQuestion
}: PassageQARequest): Promise<string> {
  const cachedText = getCachedPassage(reference) || passageText;
  cachePassage(reference, cachedText);

  const prompt = `You are a warm, plain-spoken Bible study guide for Testament, a learning app for hands-on learners and people with ADHD.
Passage reference: ${reference}
Passage text:
"${cachedText}"

User's question: "${userQuestion}"

RULES:
1. Answer in at most 3 short sentences.
2. Plain language: a 10-year-old must understand every word. No seminary jargon.
3. Stay strictly grounded in the passage. Cite the specific verse number for claims (e.g., "in verse 39" or "verses 37-40").
4. If the question is off-topic or about everyday things (like food, dinner, sports, weather), answer briefly and bridge back: "Good question — in this passage, the part that connects is..." or "The passage doesn't say — here's what it does say:".
5. Never pretend to be Scripture. Give an encouraging, clear reflection.
6. Maximum ~75 words. Output ONLY the answer.`;

  const response = await callGeminiFlash(prompt, { maxTokens: 140 });
  if (response) return response;

  // Offline / no-API-key fallback
  const cleanQ = userQuestion.toLowerCase();
  if (cleanQ.includes('dinner') || cleanQ.includes('food') || cleanQ.includes('eat') || cleanQ.includes('weather') || cleanQ.includes('game')) {
    return `Good question — in this passage (${reference}), the text does not talk about food or daily routines, but about what Jesus does when sudden storms hit. The part that connects is how Jesus brings calm when fear takes over (verses 39-40).`;
  }
  if (cleanQ.includes('why') || cleanQ.includes('storm') || cleanQ.includes('calm')) {
    return `In ${reference}, Jesus calmed the fierce wind and waves to save his frightened disciples who thought they were going to drown (verses 37-39). He also challenged them to trust Him instead of giving in to panic (verse 40). His miracle proved that his peace is stronger than any storm.`;
  }
  return `Good question! In ${reference}, this passage shows that Jesus has real authority over terrifying situations (verses 39-41). The main takeaway is that you can wake Him with your honest fears whenever life feels overwhelming.`;
}

/* =========================================================================
   FEATURE 2: Personal prayer after each act
   ========================================================================= */

export interface ActPrayerRequest {
  storyTitle: string;
  actNumber: number;
  actTitle: string;
  verseText: string;
  reference: string;
  struggle?: string;
}

export async function generateActPrayer({
  storyTitle,
  actNumber,
  actTitle,
  verseText,
  reference,
  struggle
}: ActPrayerRequest): Promise<string> {
  const prompt = `You are a gentle, encouraging prayer guide for Testament.
Story: ${storyTitle}
Act ${actNumber}: ${actTitle}
Scripture: ${reference} ("${verseText}")
User's check-in struggle: ${struggle ? `"${struggle}"` : 'General daily anxiety and fatigue'}

RULES:
1. Write a 2 to 3 sentence prayer.
2. Weave ONE concrete image or moment from this story act (e.g. boat in the storm, washing dusty feet, stones in a brook) together with their struggle.
3. Pray WITH them, not at them (start with "Lord," "Jesus," or "Father," and use "we / our / me / us").
4. No lecturing, no scolding, no thee/thou language. Plain words a 10-year-old understands.
5. Max ~60 words. Output ONLY the prayer text.`;

  const response = await callGeminiFlash(prompt, { maxTokens: 130 });
  if (response) {
    // Strip surrounding quotes if model added them
    return response.replace(/^["']|["']$/g, '').trim();
  }

  // Grounded fallback
  const struggleClean = struggle && struggle.trim() ? struggle.toLowerCase() : 'our worries';
  return `Lord, when the waves feel too big and our boat feels like it is filling up with water, remind us that you are right here in the storm. Take ${struggleClean} from our shoulders today, speak your peace over our racing minds, and help us rest in your strength.`;
}

/* =========================================================================
   FEATURE 3: "Say it simpler" verse paraphrase
   ========================================================================= */

export interface SimplerVerseRequest {
  verseText: string;
  reference: string;
}

export async function paraphraseVerseSimpler({
  verseText,
  reference
}: SimplerVerseRequest): Promise<string> {
  const prompt = `You are a plain-language translator for Testament, helping 10-year-olds and ADHD readers understand Bible verses clearly.
Verse (${reference}):
"${verseText}"

RULES:
1. Write 1 to 2 plain, clear sentences explaining what this verse means in simple everyday English.
2. Stay strictly faithful to the verse. Do not invent, preach, or add outside ideas not present in the verse text.
3. If there are ancient names, customs, or unusual terms (like "Yahweh", "rabbi", "yoke", "formless and void"), fold the plain explanation naturally into the sentence.
4. Plain language: a 10-year-old must understand every word.
5. Output ONLY the 1-2 sentence paraphrase. Do NOT start with "This means:" or "This verse means:". No quotes.`;

  const response = await callGeminiFlash(prompt, { maxTokens: 100 });
  if (response) {
    let clean = response.replace(/^["']|["']$/g, '').trim();
    clean = clean.replace(/^(this means|this verse means|in simple words|in plain english):\s*/i, '');
    return clean;
  }

  // Plain faithful fallback if model is unreachable
  const clean = verseText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (reference.toLowerCase().includes('genesis 1:2')) {
    return `Before God spoke creation into being, the earth was completely dark and covered in deep waters, and God's Spirit hovered over the sea getting ready to make life.`;
  }
  return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
}

/* =========================================================================
   FEATURE 4: Adaptive Socratic follow-up
   ========================================================================= */

export interface SocraticFollowUpRequest {
  scenarioTitle: string;
  chosenReaction: string;
  userText?: string;
  ageOrStage?: string;
}

export async function generateSocraticFollowUp({
  scenarioTitle,
  chosenReaction,
  userText,
  ageOrStage
}: SocraticFollowUpRequest): Promise<string> {
  const prompt = `You are a wise mentor in Testament asking ONE piercing Socratic follow-up question after a dilemma decision.
Scenario: "${scenarioTitle}"
User's Life Stage: ${ageOrStage || 'Adult'}
Chosen Gut Reaction: "${chosenReaction}"
User's Added Plan: ${userText ? `"${userText}"` : '(none, chose gut reaction directly)'}

RULES:
1. Ask exactly ONE follow-up question (one sentence only).
2. Gently probe the hidden assumption, fear, or trade-off behind their choice.
3. Age-appropriate, plain language. No jargon.
4. Do NOT lecture. Do NOT give a "correct" answer. Do NOT ask two questions in one sentence.
5. Output ONLY the single question ending with a question mark.`;

  const response = await callGeminiFlash(prompt, { maxTokens: 80 });
  if (response) {
    const clean = response.replace(/^["']|["']$/g, '').trim();
    if (clean.endsWith('?')) return clean;
    return `${clean}?`;
  }

  // Fallback probing question
  if (chosenReaction.toLowerCase().includes('furious') || chosenReaction.toLowerCase().includes('confront')) {
    return `If you act on that immediate anger, will it protect your character or just your pride?`;
  }
  if (chosenReaction.toLowerCase().includes('walk away') || chosenReaction.toLowerCase().includes('quiet')) {
    return `Is walking away here true peacemaking, or are you just avoiding an uncomfortable truth?`;
  }
  return `What is the fear that makes this choice feel like your safest option right now?`;
}

/* =========================================================================
   FEATURE 5: Age-aware dilemma variants
   ========================================================================= */

export interface AgeVariantRequest {
  originalTitle: string;
  scenarioText: string;
  options: string[];
  targetStage: string; // e.g. "School / Student", "Workplace / Career", "Family / Home"
}

export interface AgeVariantResult {
  adaptedTitle: string;
  adaptedScenario: string;
}

export async function generateAgeAwareDilemma({
  originalTitle,
  scenarioText,
  options,
  targetStage
}: AgeVariantRequest): Promise<AgeVariantResult> {
  const prompt = `You are a dilemma creator for Testament adapting a life scenario to a specific life stage.
Original Dilemma: "${originalTitle}"
Original Scenario:
"${scenarioText}"

Gut Reaction options to preserve: ${options.map(o => `"${o}"`).join(', ')}
Target Life Stage: "${targetStage}" (e.g. Student / School, Young Adult, Working Parent, Senior)

RULES:
1. Rewrite the scenario for this life stage in 3 to 4 short sentences.
2. Keep the EXACT same moral tension and stakes, but adapt the setting, environment, and vocabulary to their daily life.
3. The choice must stay genuinely hard and relatable — do NOT soften it into an obvious answer.
4. Plain language a 10-year-old or teenager easily understands.
5. Return JSON with keys "adaptedTitle" and "adaptedScenario".`;

  const response = await callGeminiFlash(prompt, { maxTokens: 200, responseMimeType: 'application/json' });
  if (response) {
    try {
      const parsed = JSON.parse(response) as AgeVariantResult;
      if (parsed.adaptedTitle && parsed.adaptedScenario) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // High quality curated fallbacks for common scenarios
  if (targetStage.toLowerCase().includes('student') || targetStage.toLowerCase().includes('school')) {
    return {
      adaptedTitle: originalTitle.replace('Workplace', 'Group Project').replace('Corporate', 'School'),
      adaptedScenario: `You stayed up late doing almost all the slides for a science group project because your partner kept slacking off. When your teacher announces in front of the whole class that the project earned an A+, your partner smiles and says, "Thank you, I put so much work into this!" The teacher gives them the extra credit badge while you sit there in shock.`
    };
  }

  if (targetStage.toLowerCase().includes('family') || targetStage.toLowerCase().includes('home')) {
    return {
      adaptedTitle: originalTitle.replace('Workplace', 'Family').replace('Corporate', 'Household'),
      adaptedScenario: `You spent the entire weekend organizing the house and cleaning up after a chaotic week while everyone else was relaxing. At Sunday dinner, your sibling announces to your parents how hard they worked keeping the family organized and receives all the praise. Everyone nods in admiration, completely unaware you were the one who sacrificed your rest.`
    };
  }

  return {
    adaptedTitle: originalTitle,
    adaptedScenario: scenarioText
  };
}
