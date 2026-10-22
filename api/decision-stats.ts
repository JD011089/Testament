import {
  consumeRateLimit,
  getDecisionTally,
  isSharedStoreConfigured,
  recordDecisionVote,
  requestClientIp
} from './sharedRedis.js';

type HeaderValue = string | string[] | undefined;
interface ApiRequest {
  method?: string;
  headers: Record<string, HeaderValue>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (data: unknown) => void;
  end: (body?: string | Buffer) => void;
}

function firstHeader(value: HeaderValue): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function isAllowedOrigin(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol === 'android-app:') return host === 'app.testament.bible';
    return host === 'localhost' || host === '127.0.0.1' ||
      host === 'testament-bible-learning.vercel.app' ||
      /^testament-bible-learning-[a-z0-9-]+\.vercel\.app$/.test(host);
  } catch {
    return false;
  }
}

function parseTally(values: string[]) {
  const tally: Record<string, string> = {};
  for (let index = 0; index + 1 < values.length; index += 2) tally[values[index]] = values[index + 1];
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(tally)) {
    if (key.startsWith('choice:')) counts[key.slice(7)] = Number(value) || 0;
  }
  const totalVotes = Number(tally.totalVotes) || 0;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return {
    totalVotes,
    counts,
    topChoiceId: top?.[0] ?? null,
    topChoicePercentage: totalVotes && top ? Math.round(top[1] / totalVotes * 100) : 0
  };
}

function validDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const origin = firstHeader(req.headers.origin) || firstHeader(req.headers.referer);
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Forbidden origin' });
    return;
  }
  if (origin && firstHeader(req.headers.origin)) res.setHeader('Access-Control-Allow-Origin', firstHeader(req.headers.origin));
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isSharedStoreConfigured()) {
    res.status(503).json({ error: 'Decision statistics are temporarily unavailable' });
    return;
  }
  try {
    if (!await consumeRateLimit('decision-stats', requestClientIp(req.headers), 40, 60)) {
      res.setHeader('Retry-After', '60');
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
  } catch {
    res.status(503).json({ error: 'Decision statistics are temporarily unavailable' });
    return;
  }

  let dateKey = '';
  let passageId = '';
  let values: string[];
  if (req.method === 'GET') {
    dateKey = typeof req.query?.dateKey === 'string' ? req.query.dateKey.trim() : '';
    passageId = typeof req.query?.passageId === 'string' ? req.query.passageId.trim() : '';
  } else {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {
        res.status(400).json({ error: 'Invalid JSON body' });
        return;
      }
    }
    const data = body as { dateKey?: unknown; passageId?: unknown; choiceId?: unknown; voterId?: unknown };
    dateKey = typeof data?.dateKey === 'string' ? data.dateKey.trim() : '';
    passageId = typeof data?.passageId === 'string' ? data.passageId.trim() : '';
    const choiceId = typeof data?.choiceId === 'string' ? data.choiceId.trim() : '';
    const voterId = typeof data?.voterId === 'string' ? data.voterId.trim() : '';
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(choiceId) ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(voterId)) {
      res.status(400).json({ error: 'Invalid choice or voter identifier' });
      return;
    }
    if (!validDateKey(dateKey) || !/^[A-Za-z0-9._:-]{1,120}$/.test(passageId)) {
      res.status(400).json({ error: 'Invalid dateKey or passageId' });
      return;
    }
    try { values = await recordDecisionVote(dateKey, passageId, voterId, choiceId); } catch {
      res.status(503).json({ error: 'Decision statistics are temporarily unavailable' });
      return;
    }
    res.status(200).json(parseTally(values));
    return;
  }

  if (!validDateKey(dateKey) || !/^[A-Za-z0-9._:-]{1,120}$/.test(passageId)) {
    res.status(400).json({ error: 'Invalid dateKey or passageId' });
    return;
  }
  try { values = await getDecisionTally(dateKey, passageId); } catch {
    res.status(503).json({ error: 'Decision statistics are temporarily unavailable' });
    return;
  }
  res.status(200).json(parseTally(values));
}
