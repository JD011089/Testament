import { createHash } from 'node:crypto';

const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

const RECORD_VOTE_SCRIPT = `
local first = redis.call('SET', KEYS[2], '1', 'NX', 'EX', ARGV[1])
if first then
  redis.call('HINCRBY', KEYS[1], 'totalVotes', 1)
  redis.call('HINCRBY', KEYS[1], ARGV[2], 1)
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return redis.call('HGETALL', KEYS[1])
`;

export class SharedStoreUnavailableError extends Error {
  constructor() {
    super('Shared rate-limit storage is not configured or unavailable');
    this.name = 'SharedStoreUnavailableError';
  }
}

export function isSharedStoreConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisCommand<T>(command: unknown[]): Promise<T> {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!endpoint || !token) throw new SharedStoreUnavailableError();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });
    if (!response.ok) throw new SharedStoreUnavailableError();
    const payload = await response.json() as { result?: T; error?: string };
    if (payload.error) throw new SharedStoreUnavailableError();
    return payload.result as T;
  } catch {
    throw new SharedStoreUnavailableError();
  }
}

export function requestClientIp(headers: Record<string, string | string[] | undefined>): string {
  const value = (header: string) => {
    const raw = headers[header];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';
  };
  return value('x-real-ip') || value('x-vercel-ip') || value('x-forwarded-for').split(',')[0].trim() || 'unknown';
}

export async function consumeRateLimit(
  scope: string,
  clientId: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const fingerprint = createHash('sha256').update(clientId || 'unknown').digest('hex');
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `testament:rate:${scope}:${fingerprint}:${bucket}`;
  const count = await redisCommand<number>(['EVAL', RATE_LIMIT_SCRIPT, 1, key, windowSeconds]);
  return Number(count) <= maxRequests;
}

function decisionStatsKey(dateKey: string, passageId: string): string {
  const passageHash = createHash('sha256').update(passageId).digest('hex');
  return `testament:decision-stats:${dateKey}:${passageHash}`;
}

export async function getDecisionTally(dateKey: string, passageId: string): Promise<string[]> {
  return redisCommand<string[]>(['HGETALL', decisionStatsKey(dateKey, passageId)]) ?? [];
}

export async function recordDecisionVote(
  dateKey: string,
  passageId: string,
  voterId: string,
  choiceId: string
): Promise<string[]> {
  const statsKey = decisionStatsKey(dateKey, passageId);
  const voterHash = createHash('sha256').update(voterId).digest('hex');
  const voteKey = `testament:decision-vote:${dateKey}:${createHash('sha256').update(`${passageId}:${voterHash}`).digest('hex')}`;
  const choiceField = `choice:${choiceId}`;
  return redisCommand<string[]>(['EVAL', RECORD_VOTE_SCRIPT, 2, statsKey, voteKey, 34560000, choiceField]);
}
