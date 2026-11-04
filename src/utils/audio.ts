// Procedural Ambient Soundscape, Cinematic Dramatized Audio & Studio Voice Engine via Web Audio API
// 100% Offline-capable, zero external asset dependencies with Neural Studio Voice streaming

export type NarratorProfile = 'cinematic' | 'brotherhood' | 'scholar' | 'grace';
export type VoicePlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface NarrationProgressDetail {
  narrationId: string | null;
  state: VoicePlaybackState;
  elapsedSec: number;
  durationSec: number;
  remainingSec: number;
  progress: number;
}

/** Rough narration speed used to estimate speech-synthesis duration (characters/second). */
const SPEECH_CHARS_PER_SECOND = 14.5;

export interface VoiceMetadata {
  id: NarratorProfile;
  name: string;
  subtitle: string;
  description: string;
}

export const NARRATOR_VOICES: Record<NarratorProfile, VoiceMetadata> = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    subtitle: 'Epic & Resonant',
    description: 'Deep, commanding baritone with cinematic gravitas. Ideal for battles and epics.'
  },
  brotherhood: {
    id: 'brotherhood',
    name: 'Grounded',
    subtitle: 'Warm & Relatable',
    description: 'Warm, conversational tempo with natural pacing. Perfect for daily guidance.'
  },
  scholar: {
    id: 'scholar',
    name: 'Scholar',
    subtitle: 'Wise & Articulate',
    description: 'Sophisticated British cadence with thoughtful, intellectual clarity.'
  },
  grace: {
    id: 'grace',
    name: 'Grace & Peace',
    subtitle: 'Gentle & Reflective',
    description: 'Gentle, soothing, and clear cadence. Perfect for quiet reflection, meditation, and prayer.'
  }
};

function numberToWordsEn(numStr: string): string {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num === 0) return 'zero';
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
  if (num < 1000) {
    const rem = num % 100;
    return ones[Math.floor(num / 100)] + ' hundred' + (rem ? ' ' + numberToWordsEn(String(rem)) : '');
  }
  return String(num);
}

const NUMBERED_BOOKS = 'Samuel|Kings|Chronicles|Corinthians|Thessalonians|Timothy|Peter|John';
const ORDINALS_EN: Record<string, string> = { '1': 'First', '2': 'Second', '3': 'Third' };
const VERSE_WORD: Record<string, { one: string; many: string; through: string }> = {
  es: { one: 'versículo', many: 'versículos', through: 'al' },
  fr: { one: 'verset', many: 'versets', through: 'à' },
};

/** Current UI language as a two-letter prefix (en, es, fr). */
export function currentSpeechLang(): string {
  const raw = (typeof document !== 'undefined' && document.documentElement?.lang) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('testament_language')) ||
    'en';
  return raw.toLowerCase().slice(0, 2);
}

/**
 * Normalizes scripture references, punctuation, and markdown formatting
 * to create smooth, human-like cadence with natural pauses.
 */
export function normalizeScriptureForSpeech(text: string, lang: string = 'en'): string {
  const isEn = !(lang === 'es' || lang === 'fr');
  let out = text;
  if (isEn) {
    // "1 Kings" is read "First Kings", not "one Kings".
    out = out.replace(new RegExp(`\\b([123])\\s+(${NUMBERED_BOOKS})\\b`, 'g'), (_m, n, book) => `${ORDINALS_EN[n]} ${book}`);
  }
  // All-caps divine names (KJV style) can be spelled out letter by letter.
  out = out.replace(/\bLORD\b/g, 'Lord').replace(/\bGOD\b/g, 'God');

  const words = VERSE_WORD[lang];
  return out
    // 1. Strip badges & annotations (labels must never be spoken)
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*(?:Plain\s+English|Reflection|Story\s+retelling)\s*[•\-–—·*]\s*Not\s+Scripture/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*(?:Plain\s+English|Plain\s+English\s+takeaway)\s*:?/gi, ' ')
    .replace(/Scripture\s*\(Verbatim\)/gi, ' ')
    // 2. Strip URLs & web links
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/www\.\S+/gi, ' ')
    // 3. Strip emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, ' ')
    // 4. Expand verse references: "Genesis 45:5" -> "Genesis forty-five, verse five"
    .replace(/\b(\d?\s*[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,3})\s+(\d+):(\d+)(?:-(\d+))?\b/g, (_match, book, ch, vs, endVs) => {
      if (words) {
        // Spanish/French voices read digits well; just make the structure clear.
        return endVs
          ? `${book} ${ch}, ${words.many} ${vs} ${words.through} ${endVs}`
          : `${book} ${ch}, ${words.one} ${vs}`;
      }
      const chWord = numberToWordsEn(ch);
      const vsWord = numberToWordsEn(vs);
      if (endVs) {
        const endWord = numberToWordsEn(endVs);
        return `${book} ${chWord}, verses ${vsWord} through ${endWord}`;
      }
      return `${book} ${chWord}, verse ${vsWord}`;
    })
    .replace(/(\d+):(\d+)/g, (_m, ch, vs) => (words ? `${ch}, ${words.one} ${vs}` : `${numberToWordsEn(ch)}, verse ${numberToWordsEn(vs)}`))
    // 5. Clean markdown and brackets
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[{}[\]()<>~^|\\/]/g, ' ')
    .replace(/\.{3,}\s*$/g, '.')
    .replace(/\.{3,}/g, ', ')
    .replace(/[—–]/g, ', ')
    .replace(/--+/g, ', ')
    .replace(/\s+([,.:;?!])/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/, '.')
    .trim();
}

/**
 * Splits narration into sentence-sized pieces. Speaking one long utterance is
 * unreliable: Chrome's online voices silently stop after ~15 seconds, and
 * short pieces give natural breaths between sentences.
 */
export function splitForSpeech(text: string, maxLen = 160): { text: string; start: number }[] {
  const pieces: { text: string; start: number }[] = [];
  const sentenceRe = /[^.!?;:]+(?:[.!?;:]+["”’')\]]*|$)\s*/g;
  const push = (start: number, end: number) => {
    const raw = text.slice(start, end);
    const lead = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    if (trimmed) pieces.push({ text: trimmed, start: start + lead });
  };

  let chunkStart = -1;
  let chunkEnd = -1;
  let m: RegExpExecArray | null;
  while ((m = sentenceRe.exec(text)) !== null) {
    if (m[0].length === 0) { sentenceRe.lastIndex += 1; continue; }
    const sStart = m.index;
    const sEnd = m.index + m[0].length;

    if (sEnd - sStart > maxLen) {
      // Very long sentence: flush, then cut at commas or spaces.
      if (chunkStart >= 0) push(chunkStart, chunkEnd);
      chunkStart = -1;
      let pos = sStart;
      while (sEnd - pos > maxLen) {
        const window = text.slice(pos, pos + maxLen);
        let cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf('; '));
        if (cut < maxLen * 0.4) cut = window.lastIndexOf(' ');
        if (cut <= 0) cut = maxLen;
        push(pos, pos + cut + 1);
        pos += cut + 1;
      }
      push(pos, sEnd);
      continue;
    }

    if (chunkStart >= 0 && sEnd - chunkStart > maxLen) {
      push(chunkStart, chunkEnd);
      chunkStart = -1;
    }
    if (chunkStart < 0) chunkStart = sStart;
    chunkEnd = sEnd;
  }
  if (chunkStart >= 0) push(chunkStart, chunkEnd);
  return pieces;
}

/** Per-narrator delivery so each voice option sounds distinct even on the same device voice. */
const PROFILE_DELIVERY: Record<NarratorProfile, { rate: number; pitch: number }> = {
  cinematic: { rate: 0.93, pitch: 0.94 },
  brotherhood: { rate: 1.0, pitch: 1.0 },
  scholar: { rate: 0.95, pitch: 0.98 },
  grace: { rate: 0.9, pitch: 1.03 },
};

/** Preferred voice names per narrator, best first (Edge/Windows, Google, Apple). */
const PROFILE_VOICE_NAMES: Record<NarratorProfile, string[]> = {
  cinematic: ['andrew', 'christopher', 'guy', 'brian', 'davis', 'tony', 'roger', 'steffan', 'evan', 'nathan', 'tom', 'alex', 'aaron', 'google uk english male', 'google us english'],
  brotherhood: ['brian', 'guy', 'eric', 'andrew', 'jason', 'roger', 'evan', 'nathan', 'alex', 'aaron', 'google uk english male', 'google us english'],
  scholar: ['ryan', 'thomas', 'oliver', 'arthur', 'george', 'daniel', 'google uk english male'],
  grace: ['ava', 'emma', 'jenny', 'aria', 'michelle', 'sonia', 'libby', 'maisie', 'samantha', 'zoe', 'allison', 'susan', 'serena', 'karen', 'moira', 'google us english', 'google uk english female'],
};

const FEMALE_HINTS = ['ava', 'emma', 'jenny', 'aria', 'michelle', 'sonia', 'libby', 'maisie', 'samantha', 'zoe', 'allison', 'susan', 'serena', 'karen', 'moira', 'female', 'zira', 'hazel', 'ana', 'nicky', 'kate', 'tessa', 'fiona', 'victoria'];
const MALE_HINTS = ['andrew', 'christopher', 'guy', 'brian', 'eric', 'davis', 'tony', 'roger', 'steffan', 'jason', 'evan', 'nathan', 'tom', 'alex', 'aaron', 'ryan', 'thomas', 'oliver', 'arthur', 'george', 'daniel', 'male', 'fred', 'david', 'mark', 'rishi', 'gordon', 'lee'];

/** Novelty and very old voices that sound robotic. */
const ROBOTIC_VOICES = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester', 'organ',
  'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox', 'junior', 'ralph', 'kathy', 'fred',
  'grandma', 'grandpa', 'rocko', 'sandy', 'shelley', 'eddy', 'flo', 'reed',
  'microsoft david', 'microsoft zira', 'microsoft mark', 'microsoft hazel', 'desktop', 'espeak',
];

const hasWord = (name: string, word: string) => new RegExp(`(^|[^a-z])${word}([^a-z]|$)`).test(name);

/** How natural a device voice is likely to sound (higher is better). */
export function voiceQualityScore(voice: Pick<SpeechSynthesisVoice, 'name' | 'localService'>): number {
  const n = voice.name.toLowerCase();
  if (ROBOTIC_VOICES.some((bad) => n.includes(bad))) return -100;
  let score = 0;
  if (n.includes('natural')) score += 40; // Edge / Windows 11 neural voices
  if (n.includes('neural')) score += 35;
  if (n.includes('premium')) score += 32; // Apple downloaded voices
  if (n.includes('enhanced')) score += 26;
  if (n.includes('online')) score += 10;
  if (n.startsWith('google')) score += 18; // Chrome's network voices
  if (n.includes('siri')) score += 14;
  if (n.includes('compact')) score -= 10;
  return score;
}

/** Picks the best-sounding installed voice for a narrator and language. */
export function pickNarratorVoice(
  voices: SpeechSynthesisVoice[],
  profile: NarratorProfile,
  langPrefix: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const wantLang = langPrefix === 'es' || langPrefix === 'fr' ? langPrefix : 'en';
  let pool = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(wantLang));
  if (pool.length === 0) pool = voices;

  const preferred = wantLang === 'en' ? PROFILE_VOICE_NAMES[profile] : [];
  const wantsFemale = profile === 'grace';
  const wantsUk = profile === 'scholar';

  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    let s = voiceQualityScore(v);
    const idx = preferred.findIndex((p) => (p.includes(' ') ? n.includes(p) : hasWord(n, p)));
    if (idx >= 0) s += 20 - Math.min(idx, 12);
    const female = FEMALE_HINTS.some((h) => hasWord(n, h));
    const male = MALE_HINTS.some((h) => hasWord(n, h));
    if (wantsFemale ? female : male) s += 8;
    if (wantsFemale ? male : female) s -= 8;
    if (wantLang === 'en') {
      const uk = lang.includes('gb') || lang.includes('uk');
      if (wantsUk) s += uk ? 10 : 0;
      else if (lang.includes('us')) s += 4;
    }
    if (v.default) s += 1;
    return s;
  };

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  for (const v of pool) {
    const s = score(v);
    if (s > bestScore) { best = v; bestScore = s; }
  }
  return best;
}

/** Short, friendly form of a device voice name: "Microsoft Andrew Online (Natural) - English (United States)" -> "Andrew (Natural)". */
export function friendlyVoiceName(name: string): string {
  const natural = /natural|neural/i.test(name) ? ' (Natural)' : /premium/i.test(name) ? ' (Premium)' : /enhanced/i.test(name) ? ' (Enhanced)' : '';
  const core = name
    .replace(/^(Microsoft|Google|Apple)\s+/i, '')
    .replace(/\s*-\s*.*$/, '')
    .replace(/\s*\((?:Natural|Neural|Premium|Enhanced|Compact)\)/gi, '')
    .replace(/\s+Online/i, '')
    .trim();
  return `${core || name}${natural}`;
}

const SOUND_PREF_KEY = 'testament_sound_enabled';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  /** Every oscillator and noise source in the current bed, so stop can silence all of them. */
  private ambientNodes: AudioNode[] = [];
  private ambientStopTimer: ReturnType<typeof setTimeout> | null = null;
  private currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary' = 'none';
  private isMuted: boolean = false;
  private isAmbiencePlaying: boolean = false;
  private currentNarratorProfile: NarratorProfile = (
    typeof window !== 'undefined'
      ? (localStorage.getItem('testament_narrator_profile') as NarratorProfile) || 'cinematic'
      : 'cinematic'
  );
  private currentAudioElement: HTMLAudioElement | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private currentPlaybackState: VoicePlaybackState = 'idle';
  /** Identifies the narration currently loaded so pause/resume cannot cross-wire different clips. */
  private activeNarrationId: string | null = null;
  private pausedNarrationId: string | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private speechGeneration = 0;
  private speechSession: {
    generation: number;
    fullText: string;
    offsetChars: number;
    boundaryChar: number;
    startedAt: number;
    elapsedMs: number;
    durationSec: number;
    onFinished: () => void;
    voice: SpeechSynthesisVoice | null;
    lang: string;
    pitch: number;
    rate: number;
  } | null = null;
  private pausedSpeech: {
    fullText: string;
    resumeChar: number;
    elapsedMs: number;
    durationSec: number;
    onFinished: () => void;
    voice: SpeechSynthesisVoice | null;
    lang: string;
    pitch: number;
    rate: number;
  } | null = null;

  public getPlaybackState(): VoicePlaybackState {
    return this.currentPlaybackState;
  }

  private setPlaybackState(state: VoicePlaybackState, errorDetail?: string) {
    this.currentPlaybackState = state;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('testament:voice-state', {
        detail: { state, errorDetail }
      }));
    }
  }

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoices();
      };
    }
  }

  private refreshVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Honors Settings → Sound (`testament_sound_enabled`) and the engine mute flag. */
  private soundsAllowed(): boolean {
    if (this.isMuted) return false;
    try {
      const raw = localStorage.getItem(SOUND_PREF_KEY);
      if (raw === null) return true;
      return raw === 'true';
    } catch {
      return true;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stopAmbience();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- NARRATOR PROFILES & CONFIGURATION ---

  public getNarratorProfile(): NarratorProfile {
    return this.currentNarratorProfile;
  }

  public setNarratorProfile(profile: NarratorProfile) {
    this.currentNarratorProfile = profile;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('testament_narrator_profile', profile);
        window.dispatchEvent(new CustomEvent('testament-voice-changed', { detail: profile }));
      } catch {
        /* ignore localStorage quota/disabled errors */
      }
    }
    this.playSnap();
  }

  // --- AMBIENT SOUND GENERATION ---

  public startAmbience(type: 'campfire' | 'wind' | 'sanctuary') {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopAmbience();
    this.currentAmbience = type;
    this.isAmbiencePlaying = true;

    if (type === 'wind') {
      this.playWindAmbience();
    } else if (type === 'campfire') {
      this.playCampfireAmbience();
    } else if (type === 'sanctuary') {
      this.playSanctuaryAmbience();
    }
  }

  public stopAmbience() {
    this.isAmbiencePlaying = false;
    this.currentAmbience = 'none';
    if (this.ambientStopTimer) {
      clearTimeout(this.ambientStopTimer);
      this.ambientStopTimer = null;
    }
    const nodes = this.ambientNodes;
    const gain = this.ambientGain;
    this.ambientNodes = [];
    this.ambientGain = null;
    if (gain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        const current = Math.max(gain.gain.value, 0.0001);
        gain.gain.setValueAtTime(current, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      } catch {
        /* ignore */
      }
    }
    const kill = () => {
      for (const node of nodes) {
        try { (node as AudioScheduledSourceNode).stop(); } catch { /* already stopped */ }
        try { node.disconnect(); } catch { /* ignore */ }
      }
      try { gain?.disconnect(); } catch { /* ignore */ }
    };
    this.ambientStopTimer = setTimeout(kill, 220);
  }

  public getCurrentAmbience() {
    return this.currentAmbience;
  }

  public toggleAmbience(type: 'campfire' | 'wind' | 'sanctuary') {
    if (this.isAmbiencePlaying && this.currentAmbience === type) {
      this.stopAmbience();
    } else {
      this.startAmbience(type);
    }
  }

  private playWindAmbience() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(filter.frequency);
    lfo.start();

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 1);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.ambientNodes = [whiteNoise, lfo];
    this.ambientGain = gainNode;
  }

  private playCampfireAmbience() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const crackle = Math.random() > 0.998 ? (Math.random() * 0.4 - 0.2) : 0;
      output[i] = (Math.random() * 0.05 - 0.025) + crackle;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 1.2;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    source.start();
    this.ambientNodes = [source];
    this.ambientGain = gainNode;
  }

  private playSanctuaryAmbience() {
    if (!this.ctx) return;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);
    masterGain.connect(this.ctx.destination);

    const freqs = [73.42, 110.0, 146.83, 220.0];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.035;

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscs.push(osc);
    });

    this.ambientNodes = oscs;
    this.ambientGain = masterGain;
  }

  // --- CINEMATIC SWELL ---

  public playCinematicSwell() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(0.001, now);
      swellGain.gain.linearRampToValueAtTime(0.07, now + 1.2);
      swellGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + 2.0);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.value = 55.0;

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 82.4;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 5.6);
      osc2.stop(now + 5.6);
    } catch {
      /* ignore */
    }
  }

  // --- SOUND EFFECTS ---

  public playClick() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playSnap() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playVictory() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [220, 277.18, 329.63, 440];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.85);
    });
  }

  /** Soft bandpass sweep for story card advance / swipe. */
  public playWhoosh() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 0.7;
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.18);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      /* ignore */
    }
  }

  /** Soft two-note chime for reveals and sequence steps. */
  public playReveal() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = now + idx * 0.06;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.07, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {
      /* ignore */
    }
  }

  /** Low thud when a drag item settles into the target. */
  public playSettle() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      /* ignore */
    }
  }

  /** Quiet rising tick while the learner holds to continue. */
  public playHoldPulse() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      /* ignore */
    }
  }

  /** Mid click when picking a choice option. */
  public playChoiceSelect() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      /* ignore */
    }
  }

  /** Payoff cue: brief swell into the victory arpeggio. */
  public playPayoff() {
    if (!this.soundsAllowed()) return;
    this.playCinematicSwell();
    window.setTimeout(() => this.playVictory(), 280);
  }

  public playBookSlide() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.12);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      /* ignore */
    }
  }

  public playPageTurn() {
    if (!this.soundsAllowed()) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.value = 1.2;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      /* ignore */
    }
  }

  // --- DUCKING AMBIENCE ---
  private duckAmbience() {
    if (this.ambientGain && this.ctx && this.isAmbiencePlaying) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.4);
      } catch {
        /* ignore */
      }
    }
  }

  private restoreAmbience() {
    if (this.ambientGain && this.ctx && this.isAmbiencePlaying) {
      try {
        const targetVol = this.currentAmbience === 'sanctuary' ? 0.12 : 0.18;
        this.ambientGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 1.2);
      } catch {
        /* ignore */
      }
    }
  }

  // --- DEVICE SPEECH (FREE, NO NETWORK) ---
  private getFallbackVoice(profile: NarratorProfile): SpeechSynthesisVoice | null {
    this.refreshVoices();
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    return pickNarratorVoice(voices, profile, currentSpeechLang());
  }

  /** Name of the device voice a narrator will use (for Settings), or null if none is available yet. */
  public getNarratorVoiceName(profile: NarratorProfile = this.currentNarratorProfile): string | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    return this.getFallbackVoice(profile)?.name ?? null;
  }

  /** True when the device has at least one natural-sounding voice for the current language. */
  public hasNaturalVoice(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    this.refreshVoices();
    const lang = currentSpeechLang();
    const want = lang === 'es' || lang === 'fr' ? lang : 'en';
    return this.cachedVoices.some((v) => v.lang.toLowerCase().startsWith(want) && voiceQualityScore(v) >= 18);
  }

  /**
   * Chrome loads its voice list asynchronously. Speaking before it arrives uses
   * the robotic default voice, so wait briefly for the list when it is empty.
   */
  private whenVoicesReady(callback: () => void) {
    this.refreshVoices();
    if (this.cachedVoices.length > 0 || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callback();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      this.refreshVoices();
      callback();
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, 800);
  }

  // --- STUDIO AUDIO & ON-DEVICE VOICE NARRATION (NO NETWORK COST) ---

  public speakVerse(text: string, onEnd?: () => void, audioAssetUrl?: string, narrationId?: string) {
    this.stopSpeaking();
    this.activeNarrationId = narrationId ?? null;
    // No sound effect under the voice: a drone competes with speech and muddies it.
    this.duckAmbience();

    const handleFinished = () => {
      this.activeNarrationId = null;
      this.pausedNarrationId = null;
      this.restoreAmbience();
      if (onEnd) onEnd();
    };

    this.playAssetOrSpeech(normalizeScriptureForSpeech(text, currentSpeechLang()), handleFinished, audioAssetUrl);
  }

  /**
   * Pauses the active narration in place. Unlike `stopSpeaking`, this keeps the
   * audio/speech cursor so a later `resumeSpeaking` continues where it left off.
   */
  public pauseSpeaking(narrationId?: string): boolean {
    if (narrationId && this.activeNarrationId !== narrationId) return false;

    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      try {
        this.currentAudioElement.pause();
        this.pausedNarrationId = this.activeNarrationId ?? '';
        this.setPlaybackState('paused');
        this.emitAudioProgress(this.currentAudioElement);
        return true;
      } catch {
        return false;
      }
    }

    const session = this.speechSession;
    if (session && this.currentPlaybackState === 'playing') {
      const elapsedMs = this.getSpeechElapsedMs();
      const estimatedChar = Math.floor(
        session.fullText.length * Math.min(1, elapsedMs / Math.max(1, session.durationSec * 1000))
      );
      // Prefer the last spoken word boundary so resuming repeats at most one word.
      const resumeChar = session.boundaryChar > session.offsetChars
        ? session.boundaryChar
        : Math.max(session.offsetChars, estimatedChar);

      this.pausedSpeech = {
        fullText: session.fullText,
        resumeChar,
        elapsedMs,
        durationSec: session.durationSec,
        onFinished: session.onFinished,
        voice: session.voice,
        lang: session.lang,
        pitch: session.pitch,
        rate: session.rate,
      };
      this.pausedNarrationId = this.activeNarrationId ?? '';
      this.setPlaybackState('paused');
      this.emitSpeechProgress();
      this.stopProgressTicker();
      this.speechSession = null;
      this.speechGeneration += 1;
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      return true;
    }

    return false;
  }

  /** Resumes narration paused by `pauseSpeaking` from its exact position. */
  public resumeSpeaking(narrationId?: string): boolean {
    const paused = this.pausedNarrationId;
    if (narrationId && paused !== narrationId) return false;

    if (this.currentAudioElement && this.currentAudioElement.paused && paused !== null) {
      this.pausedNarrationId = null;
      this.currentAudioElement.play().catch(() => {
        this.setPlaybackState('error', 'Audio unavailable');
      });
      return true;
    }

    if (this.pausedSpeech && paused !== null) {
      const resume = this.pausedSpeech;
      this.pausedSpeech = null;
      this.pausedNarrationId = null;
      this.speakSpeechFrom(resume.resumeChar, resume);
      return true;
    }

    return false;
  }

  public isNarrationPaused(narrationId?: string): boolean {
    if (this.pausedNarrationId === null) return false;
    return narrationId ? this.pausedNarrationId === narrationId : true;
  }

  private emitProgress(detail: NarrationProgressDetail) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<NarrationProgressDetail>('testament:voice-progress', { detail }));
  }

  private emitAudioProgress(audio: HTMLAudioElement) {
    const durationSec = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const elapsedSec = Math.max(0, Math.min(durationSec || audio.currentTime, audio.currentTime || 0));
    this.emitProgress({
      narrationId: this.activeNarrationId,
      state: this.currentPlaybackState,
      elapsedSec,
      durationSec,
      remainingSec: Math.max(0, durationSec - elapsedSec),
      progress: durationSec > 0 ? Math.min(1, elapsedSec / durationSec) : 0,
    });
  }

  private getSpeechElapsedMs(): number {
    const session = this.speechSession;
    if (!session) return 0;
    const running = this.currentPlaybackState === 'playing' ? Date.now() - session.startedAt : 0;
    return session.elapsedMs + running;
  }

  private emitSpeechProgress() {
    const session = this.speechSession;
    if (!session) return;
    const elapsedSec = this.getSpeechElapsedMs() / 1000;
    // If the device voice runs longer than estimated, extend the estimate so the
    // remaining time does not sit at 0:00 while narration is still speaking.
    if (elapsedSec > session.durationSec) {
      session.durationSec = elapsedSec + 15;
    }
    const durationSec = session.durationSec;
    this.emitProgress({
      narrationId: this.activeNarrationId,
      state: this.currentPlaybackState,
      elapsedSec,
      durationSec,
      remainingSec: Math.max(0, durationSec - elapsedSec),
      progress: durationSec > 0 ? Math.min(1, elapsedSec / durationSec) : 0,
    });
  }

  private startProgressTicker() {
    this.stopProgressTicker();
    this.progressTimer = setInterval(() => {
      if (this.speechSession) this.emitSpeechProgress();
    }, 500);
  }

  private stopProgressTicker() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private playAssetOrSpeech(text: string, onFinished: () => void, audioAssetUrl?: string) {
    // Bundled studio narration is free, instant, and works offline.
    if (
      audioAssetUrl &&
      SoundEngine.AVAILABLE_STUDIO_AUDIO.has(audioAssetUrl) &&
      this.currentNarratorProfile === 'cinematic'
    ) {
      try {
        const audio = new Audio(audioAssetUrl);
        this.currentAudioElement = audio;
        audio.onloadedmetadata = () => this.emitAudioProgress(audio);
        audio.ontimeupdate = () => this.emitAudioProgress(audio);
        audio.onplay = () => {
          this.setPlaybackState('playing');
          this.emitAudioProgress(audio);
        };
        audio.onended = () => {
          this.currentAudioElement = null;
          this.setPlaybackState('idle');
          this.emitAudioProgress(audio);
          onFinished();
        };
        audio.onerror = () => {
          this.currentAudioElement = null;
          this.fallbackSpeak(text, onFinished);
        };
        audio.play().catch(() => {
          this.currentAudioElement = null;
          this.fallbackSpeak(text, onFinished);
        });
        return;
      } catch {
        /* fall through to device speech */
      }
    }

    this.fallbackSpeak(text, onFinished);
  }

  private static readonly AVAILABLE_STUDIO_AUDIO = new Set([
    '/audio/stories/david-journey_david-act-1.mp3',
    '/audio/stories/david-journey_david-act-2.mp3',
    '/audio/stories/david-journey_david-act-3.mp3',
    '/audio/stories/joseph-journey_joseph-act-1.mp3',
    '/audio/stories/joseph-journey_joseph-act-2.mp3',
    '/audio/stories/joseph-journey_joseph-act-3.mp3',
    '/audio/stories/peter-journey_peter-act-1.mp3',
    '/audio/stories/peter-journey_peter-act-2.mp3',
    '/audio/stories/peter-journey_peter-act-3.mp3',
    '/audio/stories/paul-journey_paul-act-1.mp3',
    '/audio/stories/paul-journey_paul-act-2.mp3',
    '/audio/stories/paul-journey_paul-act-3.mp3',
    '/audio/stories/moses-journey_moses-act-1.mp3',
    '/audio/stories/moses-journey_moses-act-2.mp3',
    '/audio/stories/moses-journey_moses-act-3.mp3',
    '/audio/stories/elijah-journey_elijah-act-1.mp3',
    '/audio/stories/elijah-journey_elijah-act-2.mp3',
    '/audio/stories/elijah-journey_elijah-act-3.mp3',
  ]);


  private fallbackSpeak(text: string, onFinished: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onFinished();
      return;
    }

    const langPrefix = currentSpeechLang();
    const profile = this.currentNarratorProfile;
    const delivery = PROFILE_DELIVERY[profile] ?? PROFILE_DELIVERY.brotherhood;
    const generation = this.speechGeneration;

    this.whenVoicesReady(() => {
      // Stopped or replaced while waiting for the voice list.
      if (this.speechGeneration !== generation) return;
      const voice = this.getFallbackVoice(profile);
      this.speakSpeechFrom(0, {
        fullText: text,
        elapsedMs: 0,
        durationSec: Math.max(10, text.length / (SPEECH_CHARS_PER_SECOND * delivery.rate)),
        onFinished,
        voice,
        lang: voice?.lang || (langPrefix === 'fr' ? 'fr-FR' : langPrefix === 'es' ? 'es-ES' : 'en-US'),
        pitch: delivery.pitch,
        rate: delivery.rate,
      });
    });
  }

  /**
   * Speaks from a character offset. Pausing cancels speech and resuming starts a
   * fresh utterance at the last word boundary, which works on browsers where
   * `speechSynthesis.pause()/resume()` is unreliable (notably mobile Safari).
   * Text is spoken sentence by sentence (see `splitForSpeech`).
   */
  private speakSpeechFrom(
    charIndex: number,
    params: {
      fullText: string;
      elapsedMs: number;
      durationSec: number;
      onFinished: () => void;
      voice: SpeechSynthesisVoice | null;
      lang: string;
      pitch: number;
      rate: number;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      params.onFinished();
      return;
    }

    let start = Math.max(0, Math.min(params.fullText.length, charIndex));
    while (start < params.fullText.length && /\s/.test(params.fullText[start])) start += 1;
    const segment = params.fullText.slice(start);
    const pieces = splitForSpeech(segment);

    if (!segment.trim() || pieces.length === 0) {
      this.setPlaybackState('idle');
      params.onFinished();
      return;
    }

    try {
      const generation = ++this.speechGeneration;
      try {
        window.speechSynthesis.cancel();
        // Chrome can get stuck in a paused state after cancel; make sure it is running.
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }

      this.speechSession = {
        generation,
        fullText: params.fullText,
        offsetChars: start,
        boundaryChar: start,
        startedAt: Date.now(),
        elapsedMs: params.elapsedMs,
        durationSec: params.durationSec,
        onFinished: params.onFinished,
        voice: params.voice,
        lang: params.lang,
        pitch: params.pitch,
        rate: params.rate,
      };

      let finishedCalled = false;
      const finish = (state: 'idle' | 'error', errorDetail?: string) => {
        if (this.speechGeneration !== generation || finishedCalled) return;
        finishedCalled = true;
        const session = this.speechSession;
        this.stopProgressTicker();
        if (session) {
          this.emitProgress({
            narrationId: this.activeNarrationId,
            state,
            elapsedSec: session.durationSec,
            durationSec: session.durationSec,
            remainingSec: 0,
            progress: 1,
          });
        }
        this.speechSession = null;
        this.setPlaybackState(state, errorDetail);
        params.onFinished();
      };

      const speakPiece = (index: number) => {
        if (this.speechGeneration !== generation) return;
        if (index >= pieces.length) {
          finish('idle');
          return;
        }
        const piece = pieces[index];
        const pieceStart = start + piece.start;
        const session = this.speechSession;
        if (session && session.generation === generation) session.boundaryChar = pieceStart;

        const utterance = new SpeechSynthesisUtterance(piece.text);
        utterance.lang = params.lang;
        utterance.pitch = params.pitch;
        utterance.rate = params.rate;
        if (params.voice) utterance.voice = params.voice;

        utterance.onboundary = (event: SpeechSynthesisEvent) => {
          const current = this.speechSession;
          if (!current || current.generation !== generation) return;
          if (typeof event.charIndex === 'number') {
            current.boundaryChar = pieceStart + event.charIndex;
            this.emitSpeechProgress();
          }
        };
        utterance.onend = () => speakPiece(index + 1);
        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          // "interrupted"/"canceled" come from our own cancel(); the generation check ignores them.
          if (event.error === 'interrupted' || event.error === 'canceled') {
            if (this.speechGeneration === generation) speakPiece(index + 1);
            return;
          }
          finish('error', 'Device voice unavailable');
        };
        window.speechSynthesis.speak(utterance);
      };

      this.setPlaybackState('playing');
      this.startProgressTicker();
      this.emitSpeechProgress();
      speakPiece(0);
    } catch {
      this.speechSession = null;
      this.stopProgressTicker();
      this.setPlaybackState('error', 'Device voice unavailable');
      params.onFinished();
    }
  }

  public stopSpeaking() {
    // Reset pause bookkeeping so a later play starts a fresh narration.
    const wasNarrating = this.activeNarrationId !== null || this.currentPlaybackState !== 'idle';
    this.activeNarrationId = null;
    this.pausedNarrationId = null;
    this.speechGeneration += 1;
    this.speechSession = null;
    this.pausedSpeech = null;
    this.stopProgressTicker();

    // 1. Stop bundled audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement = null;
      } catch {
        /* ignore */
      }
    }

    // 2. Cancel browser speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }

    this.setPlaybackState('idle');
    if (wasNarrating) {
      this.emitProgress({
        narrationId: null,
        state: 'idle',
        elapsedSec: 0,
        durationSec: 0,
        remainingSec: 0,
        progress: 0,
      });
    }

    this.restoreAmbience();
  }

  /**
   * 45-Second Morning Audio Tactical Briefing
   * Synthesizes and reads a high-impact audio mission briefing.
   */
  public playMorningTacticalBriefing(
    briefing: { title: string; battlefieldFocus: string; memoryVerse: string; proverb: string },
    onFinished?: () => void
  ) {
    this.playSnap();
    const currentLang = (typeof document !== 'undefined' && document.documentElement?.lang) || 
                        (typeof localStorage !== 'undefined' && localStorage.getItem('testament_language')) || 
                        'en';
    const langPrefix = currentLang.toLowerCase().slice(0, 2);

    let script = `Command Center Morning Tactical Briefing for today. Battlefield Focus: ${briefing.battlefieldFocus}. Anchor Scripture: ${briefing.memoryVerse}. Field Wisdom: ${briefing.proverb}. Tactical Directive: Stand fast in truth and maintain spiritual discernment. You are equipped for victory.`;

    if (langPrefix === 'es') {
      script = `Informe táctico matutino del Centro de Mando para hoy. Enfoque del campo de batalla: ${briefing.battlefieldFocus}. Escritura ancla: ${briefing.memoryVerse}. Sabiduría de campo: ${briefing.proverb}. Directiva táctica: Permanece firme en la verdad y mantén el discernimiento espiritual. Estás equipado para la victoria.`;
    } else if (langPrefix === 'fr') {
      script = `Rapport tactique matinal du Centre de Commandement pour aujourd'hui. Objectif du champ de bataille : ${briefing.battlefieldFocus}. Écriture d'ancrage : ${briefing.memoryVerse}. Sagesse de terrain : ${briefing.proverb}. Directive tactique : Tiens bon dans la vérité et garde le discernement spirituel. Tu es équipé pour la victoire.`;
    }

    this.speakVerse(script, onFinished);
  }
}

export const soundEngine = new SoundEngine();
