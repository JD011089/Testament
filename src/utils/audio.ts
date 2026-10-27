// Procedural Ambient Soundscape, Cinematic Dramatized Audio & Studio Voice Engine via Web Audio API
// 100% Offline-capable, zero external asset dependencies with Neural Studio Voice streaming

export type NarratorProfile = 'cinematic' | 'brotherhood' | 'scholar' | 'grace';
export type VoicePlaybackState = 'idle' | 'loading' | 'playing' | 'error';

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

/**
 * Normalizes scripture references, punctuation, and markdown formatting
 * to create smooth, human-like cadence with natural pauses.
 */
export function normalizeScriptureForSpeech(text: string): string {
  return text
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
    .replace(/\b(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(\d+):(\d+)(?:-(\d+))?\b/g, (_match, book, ch, vs, endVs) => {
      const chWord = numberToWordsEn(ch);
      const vsWord = numberToWordsEn(vs);
      if (endVs) {
        const endWord = numberToWordsEn(endVs);
        return `${book} ${chWord}, verses ${vsWord} through ${endWord}`;
      }
      return `${book} ${chWord}, verse ${vsWord}`;
    })
    .replace(/(\d+):(\d+)/g, (_m, ch, vs) => `${numberToWordsEn(ch)}, verse ${numberToWordsEn(vs)}`)
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
    if (voices.length === 0) return null;

    const currentLang = (typeof document !== 'undefined' && document.documentElement?.lang) || 
                        (typeof localStorage !== 'undefined' && localStorage.getItem('testament_language')) || 
                        'en';
    const langPrefix = currentLang.toLowerCase().slice(0, 2);

    const naturalScore = (voice: SpeechSynthesisVoice): number => {
      const n = voice.name.toLowerCase();
      let score = 0;
      if (n.includes('natural')) score += 6;
      if (n.includes('neural')) score += 5;
      if (n.includes('premium') || n.includes('enhanced')) score += 5;
      if (n.includes('online')) score += 4;
      if (n.includes('google')) score += 3;
      if (n.includes('siri')) score += 2;
      return score;
    };

    const chooseVoice = (
      pool: SpeechSynthesisVoice[],
      preferredNames: string[]
    ): SpeechSynthesisVoice | null => {
      const ranked = [...pool].sort((a, b) => naturalScore(b) - naturalScore(a));
      for (const name of preferredNames) {
        const match = ranked.find(v => v.name.toLowerCase().includes(name));
        if (match) return match;
      }
      return ranked[0] || null;
    };

    if (langPrefix === 'fr' || langPrefix === 'es') {
      const localized = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
      if (localized.length > 0) return chooseVoice(localized, []);
    }

    const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    // Skip the old robotic desktop voices when anything better is available.
    const nonRobotic = pool.filter(v => {
      const n = v.name.toLowerCase();
      return !n.includes('microsoft david') && !n.includes('microsoft zira') && !n.includes('microsoft mark') && !n.includes('desktop');
    });
    const activePool = nonRobotic.length > 0 ? nonRobotic : pool;

    const maleNames = ['andrew', 'brian', 'guy', 'christopher', 'eric', 'ryan', 'alex', 'daniel', 'george', 'oliver'];
    const femaleNames = ['aria', 'jenny', 'samantha', 'serena', 'karen', 'moira', 'ava', 'zoe', 'emma', 'olivia'];

    if (profile === 'scholar') {
      const ukPool = activePool.filter(v => {
        const lang = v.lang.toLowerCase();
        return lang.includes('gb') || lang.includes('uk');
      });
      const uk = chooseVoice(ukPool.length > 0 ? ukPool : activePool, maleNames);
      if (uk) return uk;
    }

    if (profile === 'grace') {
      return chooseVoice(activePool, femaleNames);
    }

    if (profile === 'cinematic') {
      return chooseVoice(activePool, ['andrew', 'brian', 'christopher', 'guy', 'ryan', 'alex']);
    }

    if (profile === 'brotherhood') {
      return chooseVoice(activePool, ['guy', 'andrew', 'brian', 'christopher', 'alex']);
    }

    return chooseVoice(activePool, maleNames);
  }

  // --- STUDIO AUDIO & ON-DEVICE VOICE NARRATION (NO NETWORK COST) ---

  public speakVerse(text: string, onEnd?: () => void, audioAssetUrl?: string) {
    this.stopSpeaking();
    this.playCinematicSwell();
    this.duckAmbience();

    const handleFinished = () => {
      this.restoreAmbience();
      if (onEnd) onEnd();
    };

    this.playAssetOrSpeech(normalizeScriptureForSpeech(text), handleFinished, audioAssetUrl);
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
        audio.onplay = () => this.setPlaybackState('playing');
        audio.onended = () => {
          this.currentAudioElement = null;
          this.setPlaybackState('idle');
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

    try {
      window.speechSynthesis.cancel();

      const matchedVoice = this.getFallbackVoice(this.currentNarratorProfile);

      const utterance = new SpeechSynthesisUtterance(text);

      const currentLang = (typeof document !== 'undefined' && document.documentElement?.lang) || 
                          (typeof localStorage !== 'undefined' && localStorage.getItem('testament_language')) || 
                          'en';
      utterance.lang = currentLang === 'fr' ? 'fr-FR' : currentLang === 'es' ? 'es-ES' : 'en-US';

      // Natural on-device voice at standard rate 1.0 and pitch 1.0
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      let finishedCalled = false;
      const callFinishedOnce = () => {
        if (!finishedCalled) {
          finishedCalled = true;
          onFinished();
        }
      };

      utterance.onend = () => {
        this.setPlaybackState('idle');
        callFinishedOnce();
      };
      utterance.onerror = () => {
        this.setPlaybackState('error', 'Device voice unavailable');
        callFinishedOnce();
      };

      this.setPlaybackState('playing');
      window.speechSynthesis.speak(utterance);
    } catch {
      this.setPlaybackState('error', 'Device voice unavailable');
      onFinished();
    }
  }

  public stopSpeaking() {
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
