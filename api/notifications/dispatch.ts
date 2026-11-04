import { timingSafeEqual } from 'node:crypto';
import webpush from 'web-push';

type HeaderValue = string | string[] | undefined;
interface ApiRequest {
  method?: string;
  headers: Record<string, HeaderValue>;
}
interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (data: unknown) => void;
  end: (body?: string | Buffer) => void;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string | null;
  scheduled_slots: string[] | null;
  last_sent_date: string | null;
  last_sent_slot: string | null;
}

interface LocalParts {
  dateKey: string;
  minutes: number;
}

const DUE_WINDOW_MINUTES = 15;
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function firstHeader(value: HeaderValue): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function authorized(headers: Record<string, HeaderValue>): boolean {
  const secret = process.env.NOTIFICATION_CRON_SECRET || '';
  if (!secret) return false;
  const provided = firstHeader(headers.authorization).replace(/^Bearer\s+/i, '');
  const providedBuffer = Buffer.from(provided);
  const secretBuffer = Buffer.from(secret);
  return providedBuffer.length === secretBuffer.length && timingSafeEqual(providedBuffer, secretBuffer);
}

function supabaseConfig(): { url: string; key: string } | null {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return { url, key };
}

function localParts(timeZone: string, now: Date): LocalParts {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    formatterCache.set(timeZone, formatter);
  }

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  const dateKey = `${get('year')}-${get('month')}-${get('day')}`;
  return { dateKey, minutes: hour * 60 + minute };
}

function parseSlot(raw: string): { id: 'morning' | 'recall'; minutes: number; time: string } | null {
  const match = /^(morning|recall):([01]\d|2[0-3]):([0-5]\d)$/.exec(raw);
  if (!match) return null;
  return {
    id: match[1] as 'morning' | 'recall',
    minutes: Number(match[2]) * 60 + Number(match[3]),
    time: `${match[2]}:${match[3]}`,
  };
}

function formatTime12h(hhmm: string): string {
  const [hourText, minute] = hhmm.split(':');
  const hour = Number(hourText);
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${hour < 12 ? 'AM' : 'PM'}`;
}

function buildPayload(slotId: 'morning' | 'recall', time: string) {
  if (slotId === 'morning') {
    return {
      title: 'Testament — Morning mission',
      body: `Your daily story is ready (${formatTime12h(time)}). Open Today to begin.`,
      tag: 'testament-morning',
      data: { type: 'DAILY_MISSION', url: '/' },
    };
  }
  return {
    title: 'Testament — Memory pulse',
    body: `Quick verse recall (${formatTime12h(time)}). Can you still say it?`,
    tag: 'testament-recall',
    data: { type: 'MEMORY_PULSE', url: '/practice' },
  };
}

async function restFetch(
  config: { url: string; key: string },
  path: string,
  init: RequestInit
): Promise<Response> {
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(8000),
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!authorized(req.headers)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const config = supabaseConfig();
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || '';
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!config || !publicKey || !privateKey) {
    res.status(503).json({ error: 'Push delivery is not configured' });
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'https://testament-bible-learning.vercel.app',
    publicKey,
    privateKey
  );

  let rows: SubscriptionRow[];
  try {
    const response = await restFetch(
      config,
      'push_subscriptions?enabled=eq.true&select=id,endpoint,p256dh,auth,timezone,scheduled_slots,last_sent_date,last_sent_slot',
      { method: 'GET' }
    );
    if (!response.ok) {
      res.status(502).json({ error: 'Could not load subscriptions' });
      return;
    }
    rows = await response.json() as SubscriptionRow[];
  } catch {
    res.status(502).json({ error: 'Could not load subscriptions' });
    return;
  }

  const now = new Date();
  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (const row of rows) {
    if (!row?.endpoint || !row.p256dh || !row.auth) continue;
    const timeZone = row.timezone || 'UTC';
    let local: LocalParts;
    try {
      local = localParts(timeZone, now);
    } catch {
      local = localParts('UTC', now);
    }

    const alreadySent = new Set(
      row.last_sent_date === local.dateKey
        ? (row.last_sent_slot || '').split(',').map((value) => value.trim()).filter(Boolean)
        : []
    );

    const dueSlots = (row.scheduled_slots || [])
      .map(parseSlot)
      .filter((slot): slot is NonNullable<ReturnType<typeof parseSlot>> => Boolean(slot))
      .filter((slot) => {
        if (alreadySent.has(slot.id)) return false;
        const diff = local.minutes - slot.minutes;
        return diff >= 0 && diff <= DUE_WINDOW_MINUTES;
      });

    if (dueSlots.length === 0) continue;

    const sentNow: string[] = [];
    for (const slot of dueSlots) {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify(buildPayload(slot.id, slot.time)),
          { TTL: 60 * 60 }
        );
        sentNow.push(slot.id);
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          try {
            await restFetch(config, `push_subscriptions?id=eq.${encodeURIComponent(row.id)}`, { method: 'DELETE' });
            removed += 1;
          } catch {
            /* ignore */
          }
          break;
        }
      }
    }

    if (sentNow.length > 0) {
      try {
        await restFetch(config, `push_subscriptions?id=eq.${encodeURIComponent(row.id)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            last_sent_date: local.dateKey,
            last_sent_slot: [...alreadySent, ...sentNow].join(','),
          }),
        });
      } catch {
        /* ignore */
      }
    }
  }

  // One line per run so delivery can be checked in the Vercel logs.
  console.log(`push-dispatch checked=${rows.length} sent=${sent} failed=${failed} removed=${removed}`);
  res.status(200).json({ ok: true, checked: rows.length, sent, failed, removed });
}
