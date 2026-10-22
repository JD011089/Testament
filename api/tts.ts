const MAX_CHARS = 2500;
import { consumeRateLimit, isSharedStoreConfigured, requestClientIp } from './sharedRedis.js';

const MAX_REQUESTS = 20;

const VOICES: Record<string, { voiceId: string; settings: { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean } }> = {
  cinematic: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam: Deep, calm resonant narration
    settings: { stability: 0.70, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true },
  },
  brotherhood: {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni: Warm, grounded natural conversational cadence
    settings: { stability: 0.72, similarity_boost: 0.80, style: 0.0, use_speaker_boost: true },
  },
  scholar: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George: Wise, articulate UK reader
    settings: { stability: 0.75, similarity_boost: 0.82, style: 0.0, use_speaker_boost: true },
  },
  grace: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel: Gentle, peaceful reflective cadence
    settings: { stability: 0.72, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true },
  },
};

type HeaderValue = string | string[] | undefined;

interface TtsRequest {
  method?: string;
  headers: Record<string, HeaderValue>;
  query?: Record<string, string | string[] | undefined>;
}

interface TtsResponse {
  status: (code: number) => TtsResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string | Buffer) => void;
}

function firstHeader(value: HeaderValue): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function queryValue(req: TtsRequest, key: string): string {
  const value = req.query?.[key];
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

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

function normalizeSpeech(text: string): string {
  return text
    // 1. Strip badges & annotations
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*AI\s+reflection\s*[•\-–—·*]?\s*Not\s+Scripture/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*Plain\s+English\s*[•\-–—·*]?\s*AI\s+reflection/gi, ' ')
    .replace(/[\u2728\u2729\u2605\u2B50]?\s*AI\s+reflection/gi, ' ')
    .replace(/Scripture\s*\(Verbatim\)/gi, ' ')
    // 2. Strip URLs & web links
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/www\.\S+/gi, ' ')
    // 3. Strip emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, ' ')
    // 4. Expand verse references: "Genesis 45:5" -> "Genesis forty-five, verse five"
    .replace(/\b(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g, (_match, book, ch, vs, endVs) => {
      const chWord = numberToWordsEn(ch);
      const vsWord = numberToWordsEn(vs);
      if (endVs) {
        const endWord = numberToWordsEn(endVs);
        return `${book} ${chWord}, verses ${vsWord} through ${endWord}`;
      }
      return `${book} ${chWord}, verse ${vsWord}`;
    })
    .replace(/(\d+):(\d+)/g, (_m, ch, vs) => `${numberToWordsEn(ch)}, verse ${numberToWordsEn(vs)}`)
    // 5. Clean markdown and bracket formatting
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

function isOriginAllowed(originOrReferer: string): boolean {
  if (!originOrReferer) return true;
  try {
    const url = new URL(originOrReferer);
    const host = url.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'testament-bible-learning.vercel.app' ||
      /^testament-bible-learning(?:-[a-z0-9-]+)?-jd011089\.vercel\.app$/.test(host) ||
      (url.protocol === 'android-app:' && host === 'app.testament.bible')
    );
  } catch {
    return false;
  }
}

export default async function handler(req: TtsRequest, res: TtsResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).end('Method not allowed');
    return;
  }

  const origin = firstHeader(req.headers['origin']) || firstHeader(req.headers['referer']);
  if (!isOriginAllowed(origin)) {
    res.status(403).end('Forbidden origin');
    return;
  }

  if (!isSharedStoreConfigured()) {
    res.status(503).end('Narration is temporarily unavailable');
    return;
  }

  let allowed = false;
  try {
    allowed = await consumeRateLimit('tts', requestClientIp(req.headers), MAX_REQUESTS, 60);
  } catch {
    res.status(503).end('Narration is temporarily unavailable');
    return;
  }
  if (!allowed) {
    res.setHeader('Retry-After', '60');
    res.status(429).end('Too many narration requests');
    return;
  }

  const rawText = queryValue(req, 'text');
  const voiceParam = queryValue(req, 'voice') || 'cinematic';
  const cleanText = normalizeSpeech(rawText);

  if (!cleanText) {
    res.status(400).end('Missing text parameter');
    return;
  }

  if (cleanText.length > MAX_CHARS) {
    res.status(413).end('Text is too long');
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).end('Narration is not configured');
    return;
  }

  const profile = VOICES[voiceParam] || VOICES.cinematic;

  try {
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${profile.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: profile.settings,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!elevenRes.ok) {
      res.status(502).end('Narration failed');
      return;
    }

    const audio = Buffer.from(await elevenRes.arrayBuffer());
    if (audio.length < 100) {
      res.status(502).end('Narration failed');
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).end(audio);
  } catch {
    res.status(502).end('Narration failed');
  }
}
