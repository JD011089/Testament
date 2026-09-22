// Procedural Ambient Soundscape, Cinematic Dramatized Audio & Studio Voice Engine via Web Audio API
// 100% Offline-capable, zero external asset dependencies with Neural Studio Voice streaming

export type NarratorProfile = 'cinematic' | 'brotherhood' | 'scholar';

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

  // --- BROWSER SPEECH SYNTHESIS FALLBACK (NEVER USES FEMALE ZIRA ROBOT) ---
  private getFallbackVoice(profile: NarratorProfile): SpeechSynthesisVoice | null {
    this.refreshVoices();
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    if (voices.length === 0) return null;

    // Filter OUT any known female or robot voices
    const nonFemale = voices.filter(v => {
      const name = v.name.toLowerCase();
      return !name.includes('zira') &&
             !name.includes('female') &&
             !name.includes('hazel') &&
             !name.includes('samantha') &&
             !name.includes('victoria') &&
             !name.includes('susan') &&
             !name.includes('catherine');
    });

    const candidates = nonFemale.length > 0 ? nonFemale : voices;

    // Filter to avoid legacy Windows desktop robotic voices if modern/natural ones exist
    const highQualityCandidates = candidates.filter(v => {
      const name = v.name.toLowerCase();
      return !name.includes('desktop') && !name.includes('microsoft david');
    });

    const pool = highQualityCandidates.length > 0 ? highQualityCandidates : candidates;

    if (profile === 'scholar') {
      // Seek British or cultured English voice
      const british = pool.find(v => {
        const lang = v.lang.toLowerCase();
        const name = v.name.toLowerCase();
        return (lang.includes('gb') || lang.includes('uk')) &&
               (name.includes('ryan') || name.includes('george') || name.includes('oliver') || name.includes('daniel') || name.includes('male'));
      }) || pool.find(v => v.lang.toLowerCase().includes('gb') || v.lang.toLowerCase().includes('uk'));

      if (british) return british;
    }

    if (profile === 'cinematic') {
      // Seek deep, commanding US/neutral English voice
      const cinematicVoice = pool.find(v => {
        const name = v.name.toLowerCase();
        return v.lang.toLowerCase().startsWith('en') && 
               (name.includes('christopher') || name.includes('eric') || name.includes('guy') || name.includes('alex'));
      });
      if (cinematicVoice) return cinematicVoice;
    }

    if (profile === 'brotherhood') {
      // Seek warm, conversational US English voice
      const warmVoice = pool.find(v => {
        const name = v.name.toLowerCase();
        return v.lang.toLowerCase().startsWith('en') && 
               (name.includes('guy') || name.includes('brian') || name.includes('google us english') || name.includes('christopher') || name.includes('matthew'));
      });
      if (warmVoice) return warmVoice;
    }

    // Secondary search across pool for any natural or Google voice
    const naturalVoice = pool.find(v => {
      const name = v.name.toLowerCase();
      return v.lang.toLowerCase().startsWith('en') && (name.includes('natural') || name.includes('online') || name.includes('google'));
    });
    if (naturalVoice) return naturalVoice;

    // Any English voice
    const anyEnglish = pool.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEnglish) return anyEnglish;

    // Absolute fallback
    return candidates.find(v => v.lang.toLowerCase().startsWith('en')) || candidates[0] || null;
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

    // Real-time Azure Neural endpoint
    const streamUrl = `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(this.currentNarratorProfile)}`;

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

        audio.onended = () => {
          cleanup();
          onFinished();
        };

        audio.onerror = () => {
          cleanup();
          this.fallbackWithAssetOrSpeech(text, onFinished, audioAssetUrl);
        };

        audio.play().catch(() => {
          cleanup();
          this.fallbackWithAssetOrSpeech(text, onFinished, audioAssetUrl);
        });
      })
      .catch((_err) => {
        if (controller.signal.aborted) return;
        this.fallbackWithAssetOrSpeech(text, onFinished, audioAssetUrl);
      });
  }

  private fallbackWithAssetOrSpeech(text: string, onFinished: () => void, audioAssetUrl?: string) {
    // If an offline studio asset is available and profile is cinematic, try it
    if (audioAssetUrl && this.currentNarratorProfile === 'cinematic') {
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

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply distinct acoustic profiles for each narrator persona
    switch (this.currentNarratorProfile) {
      case 'cinematic':
        utterance.pitch = 0.82; // Deep, resonance
        utterance.rate = 0.84;  // Majestic, deliberate pacing
        break;
      case 'scholar':
        utterance.pitch = 1.04; // Clear, intellectual tone
        utterance.rate = 0.88;  // Articulate, deliberate cadence
        break;
      case 'brotherhood':
      default:
        utterance.pitch = 1.00; // Natural, relatable pitch
        utterance.rate = 0.95;  // Warm, conversational tempo
        break;
    }

    const matchedVoice = this.getFallbackVoice(this.currentNarratorProfile);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => onFinished();
    utterance.onerror = () => onFinished();

    window.speechSynthesis.speak(utterance);
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

    this.restoreAmbience();
  }
}

export const soundEngine = new SoundEngine();
