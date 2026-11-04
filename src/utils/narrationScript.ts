/**
 * Studio narration for Story Swipes.
 *
 * Shared by the app (to find a card's recorded clip) and by
 * scripts/narration/generate.ts (to record clips with Azure Speech).
 * Kept free of browser APIs so Node can run it directly.
 */
import type { NarratorProfile } from './audio.ts';
import { normalizeScriptureForSpeech } from './audio.ts';

/** Minimal card shape so this file does not depend on the full story types. */
interface NarrationCardLike {
  type: string;
  text?: string;
  scriptureLine?: { text: string };
}

export interface StudioVoice {
  /** Azure neural voice name. Swap here after listening, then re-run the generator. */
  azureVoice: string;
  /** SSML prosody rate, e.g. "-6%". */
  rate: string;
  /** Pause between the narrator's line and the scripture line. */
  pauseMs: number;
}

/** Narrators that have studio recordings. Others use the device voice. */
export const STUDIO_VOICES: Partial<Record<NarratorProfile, StudioVoice>> = {
  cinematic: { azureVoice: 'en-US-AndrewMultilingualNeural', rate: '-6%', pauseMs: 650 },
  grace: { azureVoice: 'en-US-AvaMultilingualNeural', rate: '-8%', pauseMs: 700 },
};

/**
 * Names the voice may mispronounce, with a respelling it reads correctly.
 * Applied only to the recorded audio (SSML <sub>), never to on-screen text.
 */
export const PRONUNCIATIONS: Record<string, string> = {
  Yahweh: 'Yahway',
  Zacchaeus: 'Zakkeeus',
  Baal: 'Bay-ul',
  Tarshish: 'Tar-shish',
  Joppa: 'Joppuh',
  Ishmaelites: 'Ishmuh-lites',
  Midianites: 'Middy-uh-nites',
  Magdalene: 'Magdalen',
  Abram: 'Ay-brum',
  Nineveh: 'Ninnuh-vuh',
  Mordecai: 'Mordeh-kye',
  Haman: 'Hay-mun',
  Darius: 'Duh-rye-us',
  Nebuchadnezzar: 'Nebbuh-kud-nezzer',
  Gethsemane: 'Geth-semmuh-nee',
  Golgotha: 'Gol-guh-thuh',
};

/** What gets spoken for a card, or null if the card is not narrated. */
export function narrationTextForCard(card: NarrationCardLike): { line: string; scripture: string | null } | null {
  if (card.type !== 'narration' || !card.text) return null;
  return {
    line: normalizeScriptureForSpeech(card.text, 'en'),
    scripture: card.scriptureLine?.text ? normalizeScriptureForSpeech(card.scriptureLine.text, 'en') : null,
  };
}

/** Plain text for the device voice: the narrator's line, then the scripture. */
export function spokenTextForCard(card: NarrationCardLike): string | null {
  const parts = narrationTextForCard(card);
  if (!parts) return null;
  return parts.scripture ? `${parts.line} ${parts.scripture}` : parts.line;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function withPronunciations(text: string): string {
  let out = escapeXml(text);
  for (const [word, alias] of Object.entries(PRONUNCIATIONS)) {
    out = out.replace(new RegExp(`\\b${word}\\b`, 'g'), `<sub alias="${escapeXml(alias)}">${word}</sub>`);
  }
  return out;
}

/** Azure SSML for one card. Its text also identifies the clip (see the hash in the generator). */
export function buildNarrationSsml(card: NarrationCardLike, profile: NarratorProfile): string | null {
  const voice = STUDIO_VOICES[profile];
  const parts = narrationTextForCard(card);
  if (!voice || !parts) return null;
  const body = parts.scripture
    ? `${withPronunciations(parts.line)}<break time="${voice.pauseMs}ms"/>${withPronunciations(parts.scripture)}`
    : withPronunciations(parts.line);
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">` +
    `<voice name="${voice.azureVoice}"><prosody rate="${voice.rate}">${body}</prosody></voice></speak>`
  );
}

export interface NarrationClip {
  url: string;
  durationSec: number;
  hash: string;
}

/** story id -> card index -> narrator -> clip */
export type NarrationManifest = Record<string, Record<string, Partial<Record<NarratorProfile, NarrationClip>>>>;

export function findNarrationClip(
  manifest: NarrationManifest,
  storyId: string,
  cardIndex: number,
  profile: NarratorProfile
): NarrationClip | null {
  return manifest[storyId]?.[String(cardIndex)]?.[profile] ?? null;
}

/** Narrators that have at least one recorded clip. */
export function studioProfiles(manifest: NarrationManifest): Set<NarratorProfile> {
  const out = new Set<NarratorProfile>();
  for (const cards of Object.values(manifest)) {
    for (const byProfile of Object.values(cards)) {
      for (const p of Object.keys(byProfile)) out.add(p as NarratorProfile);
    }
  }
  return out;
}
