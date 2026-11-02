import { createHash } from 'node:crypto';

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

function supabaseConfig(): { url: string; key: string } | null {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return { url, key };
}

function validTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const origin = firstHeader(req.headers.origin) || firstHeader(req.headers.referer);
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Forbidden origin' });
    return;
  }
  if (origin && firstHeader(req.headers.origin)) res.setHeader('Access-Control-Allow-Origin', firstHeader(req.headers.origin));
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const config = supabaseConfig();
  if (!config) {
    res.status(503).json({ error: 'Push subscriptions are not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
  }
  const data = body as {
    subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    slots?: unknown;
    timezone?: unknown;
    enabled?: unknown;
  };

  const endpoint = typeof data?.subscription?.endpoint === 'string' ? data.subscription.endpoint.trim() : '';
  const p256dh = typeof data?.subscription?.keys?.p256dh === 'string' ? data.subscription.keys.p256dh.trim() : '';
  const auth = typeof data?.subscription?.keys?.auth === 'string' ? data.subscription.keys.auth.trim() : '';
  const timezone = typeof data?.timezone === 'string' ? data.timezone.trim() : '';
  const enabled = data?.enabled !== false;

  if (!endpoint || !/^https:\/\//i.test(endpoint) || endpoint.length > 2048) {
    res.status(400).json({ error: 'Invalid subscription endpoint' });
    return;
  }
  if (!p256dh || p256dh.length > 256 || !auth || auth.length > 64) {
    res.status(400).json({ error: 'Invalid subscription keys' });
    return;
  }
  if (timezone && !validTimeZone(timezone)) {
    res.status(400).json({ error: 'Invalid timezone' });
    return;
  }

  const rawSlots = Array.isArray(data?.slots) ? data.slots : [];
  const slots = rawSlots
    .filter((slot): slot is string => typeof slot === 'string' && /^(morning|recall):([01]\d|2[0-3]):[0-5]\d$/.test(slot))
    .filter((slot, index, all) => all.indexOf(slot) === index)
    .slice(0, 2);

  const payload = {
    endpoint,
    p256dh,
    auth,
    timezone: timezone || 'UTC',
    scheduled_slots: enabled ? slots : [],
    enabled,
    updated_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${config.url}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      res.status(502).json({ error: 'Could not store push subscription' });
      return;
    }
  } catch {
    res.status(502).json({ error: 'Could not store push subscription' });
    return;
  }

  res.status(200).json({ ok: true, endpointHash: createHash('sha256').update(endpoint).digest('hex').slice(0, 12) });
}
