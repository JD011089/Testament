type HeaderValue = string | string[] | undefined;

interface ApiRequest {
  method?: string;
  headers: Record<string, HeaderValue>;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (data: unknown) => void;
  end: (body?: string | Buffer) => void;
}

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
];

const hits: Map<string, { count: number; reset: number }> =
  (globalThis as unknown as { __geminiHits?: Map<string, { count: number; reset: number }> }).__geminiHits
  ?? new Map();

(globalThis as unknown as { __geminiHits: Map<string, { count: number; reset: number }> }).__geminiHits = hits;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function firstHeader(value: HeaderValue): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function clientIp(req: ApiRequest): string {
  const forwarded = firstHeader(req.headers['x-forwarded-for']);
  return forwarded.split(',')[0].trim() || 'unknown';
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

function isOriginAllowed(originOrReferer: string): boolean {
  if (!originOrReferer) return true; // Direct same-origin or native request
  try {
    const url = new URL(originOrReferer);
    const host = url.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'testament-bible-learning.vercel.app' ||
      host.endsWith('.vercel.app') ||
      originOrReferer.startsWith('android-app://')
    );
  } catch {
    return false;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-gemini-key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const origin = firstHeader(req.headers['origin']) || firstHeader(req.headers['referer']);
  if (!isOriginAllowed(origin)) {
    res.status(403).json({ error: 'Forbidden origin' });
    return;
  }

  const ip = clientIp(req);
  if (!allow(ip)) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
  }

  const { prompt, maxTokens = 2048, responseMimeType } = (body as {
    prompt?: string;
    maxTokens?: number;
    responseMimeType?: string;
  }) || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  // Allow optional user-supplied key from header, or fall back to secure server environment key
  const userKey = firstHeader(req.headers['x-user-gemini-key']).trim();
  const apiKey = userKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(503).json({ error: 'Gemini API is not configured on the server' });
    return;
  }

  const requestBody: {
    contents: Array<{ parts: Array<{ text: string }> }>;
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      responseMimeType?: string;
    };
  } = {
    contents: [{ parts: [{ text: prompt.slice(0, 15000) }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: Math.min(Math.max(Number(maxTokens) || 2048, 50), 4096),
    },
  };

  if (responseMimeType) {
    requestBody.generationConfig.responseMimeType = responseMimeType;
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === 'string') {
        res.status(200).json({ text });
        return;
      }
    } catch {
      // Try next candidate model
    }
  }

  res.status(502).json({ error: 'Failed to generate response from Gemini' });
}
