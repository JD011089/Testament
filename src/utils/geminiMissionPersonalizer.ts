import type { StoryQuest, StoryAct } from '../types';

export interface MissionPersonalization {
  mirrorBack: string;
  storyBeat?: string;
  actionLine: string;
  verseReference: string;
  verseText: string;
  kjvVerseText: string;
  source: 'gemini' | 'local_rule' | 'default';
}

// Preset decision keys for categorization
export type DecisionStance = 'shut_down' | 'lash_out' | 'run' | 'reach_out' | 'faith_trust' | 'general';

interface ActFallbackRule {
  presetResponses: Record<string, { mirrorBack: string; actionLine: string; storyBeat?: string }>;
  stanceRules: Record<DecisionStance, { mirrorBack: string; actionLine: string; storyBeat?: string }>;
  defaultResponse: { mirrorBack: string; actionLine: string };
  kjvVerse: string;
}

const ACT_FALLBACK_RULES: Record<string, ActFallbackRule> = {
  'david-act-2': {
    presetResponses: {
      'choice-cave-shutdown': {
        mirrorBack: "You chose to go quiet and wait — David felt that exact urge in the cave, too.",
        actionLine: "Send one honest text to someone in your corner today instead of staying alone in your cave.",
        storyBeat: "When 400 broken men found David hiding in Adullam, his first challenge was fighting the instinct to lock the doors and stay alone."
      },
      'choice-cave-lashout': {
        mirrorBack: "You chose to express your anger — David was hunted and angry, but poured his fury into raw prayer instead of revenge.",
        actionLine: "Take a ten-minute breather before responding to that irritating message today.",
        storyBeat: "Surrounded by 400 angry, armed outlaws, David had every reason to unleash wrath. Instead, he channeled that energy into purpose."
      },
      'choice-cave-run': {
        mirrorBack: "You chose to run — David fled into the desert, but discovered you can't outrun where God is calling you.",
        actionLine: "Pick the one hard task you've been putting off all week and tackle just five minutes of it.",
        storyBeat: "David had run as far as he could until there were no more hiding spots. That rock-bottom cave was where running stopped and building began."
      },
      'choice-cave-reachout': {
        mirrorBack: "You chose to reach out — that's the exact move that turned David's cave into a legendary brotherhood.",
        actionLine: "Check in on someone you know is carrying a heavy load right now and offer a word of strength.",
        storyBeat: "Instead of rejecting the broken misfits at his door, David welcomed them, fed them, and gave them back their dignity."
      }
    },
    stanceRules: {
      shut_down: {
        mirrorBack: "You chose to go quiet and wait — David fought that exact urge when he retreated into the limestone caves.",
        actionLine: "Send one honest text to someone in your corner today instead of staying alone in your cave."
      },
      lash_out: {
        mirrorBack: "You chose to express your anger — David had every reason to be bitter, but chose discipline over retaliation.",
        actionLine: "Take a ten-minute breather before responding to that irritating message today."
      },
      run: {
        mirrorBack: "You said you'd run — David fled into the wilderness, but discovered peace isn't found in escaping.",
        actionLine: "Pick the one task you've been avoiding and face just five minutes of it today."
      },
      reach_out: {
        mirrorBack: "You said you'd reach out — that instinct is what turned David's 400 outlaws into mighty men.",
        actionLine: "Check in on someone who is quietly struggling in their own cave right now."
      },
      faith_trust: {
        mirrorBack: "You said you'd trust God in the dark — in that very cave, David penned songs of unwavering faith.",
        actionLine: "Pause for 60 seconds right now and give the situation you can't control over to God."
      },
      general: {
        mirrorBack: "You chose to face today's chaos head-on — David had to make that same pivot when his world fell apart.",
        actionLine: "Take one concrete step today to bring order to whatever feels chaotic around you."
      }
    },
    defaultResponse: {
      mirrorBack: "Here is what unfolded in the Cave of Adullam when David's entire career collapsed.",
      actionLine: "Take 60 seconds of quiet before your next task and anchor yourself in God's presence."
    },
    kjvVerse: "And every one that was in distress, and every one that was in debt, and every one that was discontented, gathered themselves unto him; and he became a captain over them: and there were with him about four hundred men. — 1 Samuel 22:2 (KJV)"
  },
  'david-act-1': {
    presetResponses: {
      'choice-goliath-freeze': {
        mirrorBack: "You said you'd keep your head down — an entire army did that for forty mornings before David showed up.",
        actionLine: "Speak up on one important truth today even if the room is staying quiet."
      },
      'choice-goliath-conform': {
        mirrorBack: "You said you'd put on borrowed armor — Saul tried to put heavy bronze on David, but it only slowed him down.",
        actionLine: "Tackle today's main challenge using your own authentic gifts, not what others expect."
      },
      'choice-goliath-rage': {
        mirrorBack: "You said you'd attack in anger — David moved with calm spiritual precision, not reckless rage.",
        actionLine: "Slow your breath and approach your biggest obstacle with tactical composure today."
      },
      'choice-goliath-faith': {
        mirrorBack: "You said you'd step forward in faith — David walked onto that valley floor with total confidence in God.",
        actionLine: "Take on the one intimidating phone call or task you've been dreading with quiet courage."
      }
    },
    stanceRules: {
      shut_down: {
        mirrorBack: "You said you'd stay back — King Saul's entire army froze in terror before David stepped forward.",
        actionLine: "Take the first small step toward the challenge you've been avoiding today."
      },
      lash_out: {
        mirrorBack: "You said you'd lash out — David didn't fight with blind fury, but with deliberate tactical precision.",
        actionLine: "Step back, breathe, and choose calm focus over frustration today."
      },
      run: {
        mirrorBack: "You said you'd avoid the crossfire — everyone in the valley was retreating until one shepherd stood his ground.",
        actionLine: "Stand firm on your values today when pressure tempts you to compromise."
      },
      reach_out: {
        mirrorBack: "You said you'd rally support — David reminded his trembling brothers who their God truly was.",
        actionLine: "Offer a word of courage to a teammate or family member who looks stressed today."
      },
      faith_trust: {
        mirrorBack: "You said you'd stand on faith — that exact conviction toppled the giant in the valley.",
        actionLine: "Remind yourself before your hardest meeting today that God is greater than your giant."
      },
      general: {
        mirrorBack: "You weighed your options carefully — David sized up the giant and picked five smooth stones.",
        actionLine: "Identify your giant for today and take one decisive, faithful action against it."
      }
    },
    defaultResponse: {
      mirrorBack: "Here is what happened in the Valley of Elah when no one else dared to step forward.",
      actionLine: "Face your biggest task today with quiet confidence in God's strength."
    },
    kjvVerse: "Then said David to the Philistine, Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the LORD of hosts... — 1 Samuel 17:45 (KJV)"
  }
};

/**
 * Classifies free text into a psychological stance
 */
function classifyStance(text: string): DecisionStance {
  const lower = text.toLowerCase();
  
  if (/shut\s*down|isolate|hide|alone|cut\s*off|ignore|silent|disappear|bed|crawl|numb/i.test(lower)) {
    return 'shut_down';
  }
  if (/lash\s*out|angry|yell|scream|fight|punch|smash|blame|hate|retaliate|destroy/i.test(lower)) {
    return 'lash_out';
  }
  if (/run|flee|escape|quit|leave|give\s*up|walk\s*away|abandon|pack/i.test(lower)) {
    return 'run';
  }
  if (/reach|talk|call|help|friend|brother|together|rebuild|connect|ask/i.test(lower)) {
    return 'reach_out';
  }
  if (/pray|god|jesus|lord|faith|trust|worship|peace|scripture/i.test(lower)) {
    return 'faith_trust';
  }
  return 'general';
}

function getApiKey(): string {
  // Check localStorage explicit override first
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
  // Default client key
  return 'REDACTED_API_KEY';
}

/**
 * Immediate, zero-latency local personalization generator.
 * Guaranteed to return synchronously in 0ms.
 */
export function getLocalPersonalization(
  userDecision: string | null,
  act: StoryAct,
  quest: StoryQuest
): MissionPersonalization {
  const rule = ACT_FALLBACK_RULES[act.id];
  const defaultModernVerse = act.unlockedScripture.text;
  const defaultRef = act.unlockedScripture.reference;
  const defaultKjv = rule?.kjvVerse || `${defaultModernVerse} — ${defaultRef} (KJV)`;

  if (!userDecision || !userDecision.trim()) {
    // Decision was skipped
    return {
      mirrorBack: rule?.defaultResponse.mirrorBack || `Here is how ${quest.heroName} navigated this pivotal moment.`,
      actionLine: rule?.defaultResponse.actionLine || act.realTalkTakeaway.dailyAction || "Anchor your thoughts in God's presence before your next move today.",
      verseReference: defaultRef,
      verseText: defaultModernVerse,
      kjvVerseText: defaultKjv,
      source: 'default'
    };
  }

  const cleanDecision = userDecision.trim();

  // 1. Check exact preset match
  if (rule?.presetResponses[cleanDecision]) {
    const preset = rule.presetResponses[cleanDecision];
    return {
      mirrorBack: preset.mirrorBack,
      storyBeat: preset.storyBeat,
      actionLine: preset.actionLine,
      verseReference: defaultRef,
      verseText: defaultModernVerse,
      kjvVerseText: defaultKjv,
      source: 'local_rule'
    };
  }

  // 2. Classify stance for free-text or custom choices
  const stance = classifyStance(cleanDecision);
  const stanceRule = rule?.stanceRules[stance];

  if (stanceRule) {
    return {
      mirrorBack: stanceRule.mirrorBack,
      storyBeat: stanceRule.storyBeat,
      actionLine: stanceRule.actionLine,
      verseReference: defaultRef,
      verseText: defaultModernVerse,
      kjvVerseText: defaultKjv,
      source: 'local_rule'
    };
  }

  // General fallback tailored to the hero
  const stanceLabels: Record<DecisionStance, string> = {
    shut_down: "shut everyone out",
    lash_out: "react in frustration",
    run: "run from the situation",
    reach_out: "reach out to others",
    faith_trust: "lean on faith",
    general: "take your time to respond"
  };

  return {
    mirrorBack: `You said you'd ${stanceLabels[stance]} — ${quest.heroName} faced that same tension when pressure spiked.`,
    actionLine: `Take 60 seconds of quiet before taking your next step, and bring your honest thoughts to God.`,
    verseReference: defaultRef,
    verseText: defaultModernVerse,
    kjvVerseText: defaultKjv,
    source: 'local_rule'
  };
}

/**
 * Asynchronous Gemini personalization.
 * Calls Gemini Flash with strict timeout; updates dynamically if fast enough.
 */
export async function fetchGeminiPersonalization(
  userDecision: string,
  act: StoryAct,
  quest: StoryQuest
): Promise<Partial<MissionPersonalization> | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null; // With key removed, safely returns null

  const prompt = `You are a warm, tactical Bible guide for Testament, an app for ADHD learners.
STORY: ${quest.title} — ${act.actTitle} (${quest.heroName})
CONTEXT: ${act.historicalContext}
SCENARIO QUESTION: "${act.perspectivePrompt}"
KEY VERSE: "${act.unlockedScripture.text}" (${act.unlockedScripture.reference})
USER'S DECISION: "${userDecision.replace(/"/g, '\\"')}"

INSTRUCTIONS:
1. "mirrorBack": A single punchy sentence connecting what the user chose to what ${quest.heroName} did. Under 20 words.
2. "actionLine": One hyper-specific, doable daily action line for today starting with a strong verb. Under 20 words. No clichés.
3. Use plain, concrete words. No idioms, slang, or figures of speech.
4. Return ONLY valid JSON:
{
  "mirrorBack": "string",
  "actionLine": "string"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 200,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = JSON.parse(rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      if (parsed.mirrorBack && parsed.actionLine) {
        clearTimeout(timeoutId);
        return {
          mirrorBack: String(parsed.mirrorBack).trim(),
          actionLine: String(parsed.actionLine).trim(),
          source: 'gemini'
        };
      }
    } catch {
      // try next model or fall back cleanly
    }
  }

  clearTimeout(timeoutId);
  return null;
}
