const MAX_CHARS = 2500;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const VOICES: Record<string, { voiceId: string; settings: { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean } }> = {
  cinematic: {
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    settings: { stability: 0.45, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true },
  },
  brotherhood: {
    voiceId: 'ErXwobaYiN019PkySvjV',
    settings: { stability: 0.55, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true },
  },
  scholar: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    settings: { stability: 0.65, similarity_boost: 0.82, style: 0.05, use_speaker_boost: true },
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

const hits: Map<string, { count: number; reset: number }> =
  (globalThis as unknown as { __ttsHits?: Map<string, { count: number; reset: number }> }).__ttsHits
  ?? new Map();

(globalThis as unknown as { __ttsHits: Map<string, { count: number; reset: number }> }).__ttsHits = hits;

function firstHeader(value: HeaderValue): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function clientIp(req: TtsRequest): string {
  const forwarded = firstHeader(req.headers['x-forwarded-for']);
  return forwarded.split(',')[0].trim() || 'unknown';
}

function queryValue(req: TtsRequest, key: string): string {
  const value = req.query?.[key];
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function normalizeSpeech(text: string): string {
  return text
    .replace(/\b(\d?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)\b/g, '$1 $2 verse $3')
    .replace(/(\d+):(\d+)/g, '$1 verse $2')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\.{3,}/g, ', ')
    .replace(/—/g, ', ')
    .replace(/--+/g, ', ')
    .replace(/\s+([,.:;?!])/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

function allow(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_REQUESTS;
}

export default async function handler(req: TtsRequest, res: TtsResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).end('Method not allowed');
    return;
  }

  if (!allow(clientIp(req))) {
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
