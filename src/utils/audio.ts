// Procedural Ambient Soundscape, Cinematic Dramatized Audio & Studio Voice Engine via Web Audio API
// 100% Offline-capable, zero external asset dependencies with Neural Studio Voice streaming

export type NarratorProfile = 'cinematic' | 'brotherhood' | 'scholar' | 'grace';
export type VoicePlaybackState = 'idle' | 'loading' | 'playing' | 'error';

export interface VoiceMetadata {
  id: NarratorProfile;
  name: string;
  subtitle: string;
  actor: string;
  elevenVoiceId: string;
  description: string;
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export const NARRATOR_VOICES: Record<NarratorProfile, VoiceMetadata> = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    subtitle: 'Epic & Resonant',
    actor: 'Adam (ElevenLabs)',
    elevenVoiceId: 'pNInz6obpgDQGcFmaJgB',
    description: 'Deep, commanding baritone with cinematic gravitas. Ideal for battles and epics.',
    settings: {
      stability: 0.70,
      similarity_boost: 0.85,
      style: 0.0,
      use_speaker_boost: true
    }
  },
  brotherhood: {
    id: 'brotherhood',
    name: 'Grounded',
    subtitle: 'Warm & Relatable',
    actor: 'Antoni (ElevenLabs)',
    elevenVoiceId: 'ErXwobaYiN019PkySvjV',
    description: 'Warm, conversational tempo with natural pacing. Perfect for daily guidance.',
    settings: {
      stability: 0.72,
      similarity_boost: 0.80,
      style: 0.0,
      use_speaker_boost: true
    }
  },
  scholar: {
    id: 'scholar',
    name: 'Scholar',
    subtitle: 'Wise & Articulate',
    actor: 'George (ElevenLabs UK)',
    elevenVoiceId: 'JBFqnCBsd6RMkjVDRZzb',
    description: 'Sophisticated British cadence with thoughtful, intellectual clarity.',
    settings: {
      stability: 0.75,
      similarity_boost: 0.82,
      style: 0.0,
      use_speaker_boost: true
    }
  },
  grace: {
    id: 'grace',
    name: 'Grace & Peace',
    subtitle: 'Gentle & Reflective',
    actor: 'Rachel (ElevenLabs)',
    elevenVoiceId: '21m00Tcm4TlvDq8ikWAM',
    description: 'Gentle, soothing, and clear cadence. Perfect for quiet reflection, meditation, and prayer.',
    settings: {
      stability: 0.72,
      similarity_boost: 0.85,
      style: 0.0,
      use_speaker_boost: true
    }
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
    // 1. Strip badges & annotations (AI reflection badges must NEVER be spoken)
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*AI\s+reflection\s*[•\-–—·*]?\s*Not\s+Scripture/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*Plain\s+English\s*[•\-–—·*]?\s*AI\s+reflection/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*Plain\s+English\s+takeaway\s*:?/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*AI\s+reflection/gi, ' ')
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
    .replace(/[{}[\]()<>~^|\\\/]/g, ' ')
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

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbience: 'none' | 'campfire' | 'wind' | 'sanctuary' = 'none';
  private isMuted: boolean = false;
  private isAmbiencePlaying: boolean = false;
  private currentNarratorProfile: NarratorProfile = (
    typeof window !== 'undefined'
      ? (localStorage.getItem('testament_narrator_profile') as NarratorProfile) || 'cinematic'
      : 'cinematic'
  );
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private currentAbortController: AbortController | null = null;
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
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.ambientSource) {
            try { (this.ambientSource as AudioScheduledSourceNode).stop(); } catch { /* ignore */ }
            this.ambientSource.disconnect();
            this.ambientSource = null;
          }
        }, 550);
      } catch {
        /* ignore */
      }
    }
    this.isAmbiencePlaying = false;
    this.currentAmbience = 'none';
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
    this.ambientSource = whiteNoise;
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
    this.ambientSource = source;
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

    this.ambientGain = masterGain;
    this.ambientSource = oscs[0];
  }

  // --- CINEMATIC SWELL ---

  public playCinematicSwell() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

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
    if (this.isMuted) return;
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
    if (this.isMuted) return;
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
    if (this.isMuted) return;
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

  public playBookSlide() {
    if (this.isMuted) return;
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
    if (this.isMuted) return;
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

  // --- BROWSER SPEECH SYNTHESIS FALLBACK ---
  private getFallbackVoice(profile: NarratorProfile): SpeechSynthesisVoice | null {
    this.refreshVoices();
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    if (voices.length === 0) return null;

    const currentLang = (typeof document !== 'undefined' && document.documentElement?.lang) || 
                        (typeof localStorage !== 'undefined' && localStorage.getItem('testament_language')) || 
                        'en';
    const langPrefix = currentLang.toLowerCase().slice(0, 2);

    if (langPrefix === 'fr') {
      const frenchVoices = voices.filter(v => v.lang.toLowerCase().startsWith('fr'));
      if (frenchVoices.length > 0) {
        const neural = frenchVoices.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('natural') || n.includes('online') || n.includes('neural') || n.includes('google');
        });
        if (neural) return neural;
        return frenchVoices[0];
      }
    }

    if (langPrefix === 'es') {
      const spanishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
      if (spanishVoices.length > 0) {
        const neural = spanishVoices.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('natural') || n.includes('online') || n.includes('neural') || n.includes('google');
        });
        if (neural) return neural;
        return spanishVoices[0];
      }
    }

    // English voices
    const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    // Filter out robotic legacy desktop voices if any modern ones exist
    const nonRobotic = pool.filter(v => {
      const n = v.name.toLowerCase();
      return !n.includes('desktop') && !n.includes('microsoft david') && !n.includes('zira') && !n.includes('mark');
    });

    const activePool = nonRobotic.length > 0 ? nonRobotic : pool;

    if (profile === 'scholar') {
      const ukNeural = activePool.find(v => {
        const lang = v.lang.toLowerCase();
        const name = v.name.toLowerCase();
        return (lang.includes('gb') || lang.includes('uk')) &&
               (name.includes('natural') || name.includes('online') || name.includes('neural') || name.includes('ryan') || name.includes('george') || name.includes('oliver'));
      }) || activePool.find(v => v.lang.toLowerCase().includes('gb') || v.lang.toLowerCase().includes('uk'));
      if (ukNeural) return ukNeural;
    }

    if (profile === 'grace') {
      const femaleNeural = activePool.find(v => {
        const name = v.name.toLowerCase();
        return (name.includes('natural') || name.includes('online') || name.includes('neural') || name.includes('jenny') || name.includes('aria') || name.includes('samantha')) &&
               !name.includes('david');
      });
      if (femaleNeural) return femaleNeural;
    }

    // Default & cinematic / brotherhood: best available natural/online/Google neural voice
    const neuralVoice = activePool.find(v => {
      const name = v.name.toLowerCase();
      return name.includes('natural') || name.includes('online') || name.includes('neural') || name.includes('google');
    });
    if (neuralVoice) return neuralVoice;

    return activePool[0] || null;
  }

  // --- STUDIO & NEURAL VOICE NARRATION ---

  public speakVerse(text: string, onEnd?: () => void, audioAssetUrl?: string) {
    this.stopSpeaking();
    this.playCinematicSwell();
    this.duckAmbience();

    const handleFinished = () => {
      this.restoreAmbience();
      if (onEnd) onEnd();
    };

    // Stream from real-time Azure Neural endpoint with safe buffering & persona fallback
    this.streamOrSynthesize(text, handleFinished, audioAssetUrl);
  }

  private streamOrSynthesize(text: string, onFinished: () => void, audioAssetUrl?: string) {
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch {
        /* ignore */
      }
      this.currentAbortController = null;
    }

    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {
        /* ignore */
      }
      this.currentObjectUrl = null;
    }

    const controller = new AbortController();
    this.currentAbortController = controller;

    const cleanText = normalizeScriptureForSpeech(text);

    // Primary: High-fidelity ElevenLabs via Vite local proxy
    const streamUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(this.currentNarratorProfile)}`;

    this.setPlaybackState('loading');

    const playBlob = (blob: Blob) => {
      const objectUrl = URL.createObjectURL(blob);
      this.currentObjectUrl = objectUrl;

      const audio = new Audio(objectUrl);
      this.currentAudioElement = audio;

      const cleanup = () => {
        if (this.currentObjectUrl === objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            /* ignore */
          }
          this.currentObjectUrl = null;
        }
        if (this.currentAudioElement === audio) {
          this.currentAudioElement = null;
        }
        if (this.currentAbortController === controller) {
          this.currentAbortController = null;
        }
      };

      audio.onplay = () => {
        this.setPlaybackState('playing');
      };

      audio.onended = () => {
        cleanup();
        this.setPlaybackState('idle');
        onFinished();
      };

      audio.onerror = () => {
        cleanup();
        this.setPlaybackState('error', 'Audio streaming failed');
        this.fallbackWithAssetOrSpeech(cleanText, onFinished, audioAssetUrl);
      };

      audio.play().catch(() => {
        cleanup();
        this.setPlaybackState('error', 'Audio playback blocked');
        this.fallbackWithAssetOrSpeech(cleanText, onFinished, audioAssetUrl);
      });
    };

    fetch(streamUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`TTS server HTTP ${res.status}`);
        }
        const blob = await res.blob();
        if (controller.signal.aborted) return;

        if (blob.size < 100) {
          throw new Error('TTS payload too small');
        }

        playBlob(blob);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn('[SoundEngine] Narration API unavailable, using on-device reader:', (err as Error)?.message);
        this.setPlaybackState('error', (err as Error)?.message || 'Narration unavailable');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('testament:narration-fallback', {
              detail: { reason: (err as Error)?.message || 'Narration server error' }
            })
          );
        }
        this.fallbackWithAssetOrSpeech(cleanText, onFinished, audioAssetUrl);
      });
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

  private fallbackWithAssetOrSpeech(text: string, onFinished: () => void, audioAssetUrl?: string) {
    // If an offline studio asset is available and profile is cinematic, try it
    if (audioAssetUrl && SoundEngine.AVAILABLE_STUDIO_AUDIO.has(audioAssetUrl) && this.currentNarratorProfile === 'cinematic') {
      try {
        const audio = new Audio(audioAssetUrl);
        this.currentAudioElement = audio;
        audio.onended = () => {
          this.currentAudioElement = null;
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
        /* proceed to fallbackSpeak */
      }
    }

    this.fallbackSpeak(text, onFinished);
  }

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

      utterance.onend = () => callFinishedOnce();
      utterance.onerror = () => callFinishedOnce();

      window.speechSynthesis.speak(utterance);
    } catch {
      onFinished();
    }
  }

  public stopSpeaking() {
    // 1. Abort any active fetch in progress
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch {
        /* ignore */
      }
      this.currentAbortController = null;
    }

    // 2. Revoke and release blob object URL
    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {
        /* ignore */
      }
      this.currentObjectUrl = null;
    }

    // 3. Stop HTML5 audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement = null;
      } catch {
        /* ignore */
      }
    }

    // 4. Cancel browser speech synthesis
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
