import webpush from 'web-push';

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

  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || '';
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!publicKey || !privateKey) {
    res.status(503).json({ error: 'Push delivery is not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
  }
  const data = body as { subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } };
  const endpoint = typeof data?.subscription?.endpoint === 'string' ? data.subscription.endpoint.trim() : '';
  const p256dh = typeof data?.subscription?.keys?.p256dh === 'string' ? data.subscription.keys.p256dh.trim() : '';
  const auth = typeof data?.subscription?.keys?.auth === 'string' ? data.subscription.keys.auth.trim() : '';
  if (!endpoint || !/^https:\/\//i.test(endpoint) || !p256dh || !auth) {
    res.status(400).json({ error: 'Invalid subscription' });
    return;
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'https://testament-bible-learning.vercel.app',
      publicKey,
      privateKey
    );
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify({
        title: 'Testament — Test push',
        body: 'If you can read this with the app closed, background notifications are working.',
        tag: 'testament-test',
        data: { type: 'DAILY_MISSION', url: '/' },
      }),
      { TTL: 300 }
    );
    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: 'Push service rejected the test' });
  }
}
