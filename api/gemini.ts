import { consumeRateLimit, isSharedStoreConfigured, requestClientIp } from '../server/sharedRedis.js';

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

const MAX_REQUESTS = 30;

function firstHeader(value: HeaderValue): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function isOriginAllowed(originOrReferer: string): boolean {
  if (!originOrReferer) return true; // Direct same-origin or native request
  try {
    const url = new URL(originOrReferer);
    const host = url.hostname.toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    const isProd = host === 'testament-bible-learning.vercel.app';
    const isVercelPreview = /^testament-bible-learning(?:-[a-z0-9-]+)?-jd011089\.vercel\.app$/.test(host);
    const isAndroidTwa = url.protocol === 'android-app:' && host === 'app.testament.bible';
    return isLocal || isProd || isVercelPreview || isAndroidTwa;
  } catch {
    return false;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const originHeader = firstHeader(req.headers['origin']);
  const refererHeader = firstHeader(req.headers['referer']);
  const incomingOrigin = originHeader || refererHeader;
  const originValid = isOriginAllowed(incomingOrigin);

  // Dynamic and safe CORS headers
  if (originValid && originHeader) {
    res.setHeader('Access-Control-Allow-Origin', originHeader);
  } else if (!originHeader) {
    res.setHeader('Access-Control-Allow-Origin', 'https://testament-bible-learning.vercel.app');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-gemini-key');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!originValid) {
    res.status(403).json({ error: 'Forbidden origin' });
    return;
  }

  if (!isSharedStoreConfigured()) {
    res.status(503).json({ error: 'AI service is temporarily unavailable' });
    return;
  }

  let allowed = false;
  try {
    allowed = await consumeRateLimit('gemini', requestClientIp(req.headers), MAX_REQUESTS, 60);
  } catch {
    res.status(503).json({ error: 'AI service is temporarily unavailable' });
    return;
  }
  if (!allowed) {
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

  if (prompt.length > 25000) {
    res.status(413).json({ error: 'Prompt exceeds maximum length' });
    return;
  }

  // Allow optional user-supplied key from header, or fall back to secure server environment key
  const rawUserKey = firstHeader(req.headers['x-user-gemini-key']).trim();
  let apiKey = process.env.GEMINI_API_KEY;

  if (rawUserKey) {
    // Validate custom API key format
    if (!/^[A-Za-z0-9_-]{20,80}$/.test(rawUserKey)) {
      res.status(400).json({ error: 'Invalid Gemini API key format' });
      return;
    }
    apiKey = rawUserKey;
  }

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
