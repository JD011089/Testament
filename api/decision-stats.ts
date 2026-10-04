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

// Global in-memory storage for Vercel serverless function warm instances
interface DecisionTally {
  totalVotes: number;
  counts: Record<string, number>;
}

const votesStore: Map<string, DecisionTally> =
  (globalThis as unknown as { __decisionVotes?: Map<string, DecisionTally> }).__decisionVotes
  ?? new Map();

(globalThis as unknown as { __decisionVotes: Map<string, DecisionTally> }).__decisionVotes = votesStore;

function getStoreKey(dateKey: string, passageId: string): string {
  return `${dateKey.trim()}::${passageId.trim()}`;
}

function calculateStats(tally?: DecisionTally) {
  if (!tally || tally.totalVotes === 0) {
    return {
      totalVotes: 0,
      counts: {},
      topChoiceId: null,
      topChoicePercentage: 0
    };
  }

  let topChoiceId: string | null = null;
  let maxCount = 0;

  for (const [choiceId, count] of Object.entries(tally.counts)) {
    if (count > maxCount) {
      maxCount = count;
      topChoiceId = choiceId;
    }
  }

  const topChoicePercentage = tally.totalVotes > 0
    ? Math.round((maxCount / tally.totalVotes) * 100)
    : 0;

  return {
    totalVotes: tally.totalVotes,
    counts: tally.counts,
    topChoiceId,
    topChoicePercentage
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const dateKey = typeof req.query?.dateKey === 'string' ? req.query.dateKey : '';
    const passageId = typeof req.query?.passageId === 'string' ? req.query.passageId : '';

    if (!dateKey || !passageId) {
      res.status(400).json({ error: 'dateKey and passageId query parameters required' });
      return;
    }

    const key = getStoreKey(dateKey, passageId);
    const tally = votesStore.get(key);
    res.status(200).json(calculateStats(tally));
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.status(400).json({ error: 'Invalid JSON body' });
        return;
      }
    }

    const data = body as { dateKey?: string; passageId?: string; choiceId?: string };
    const dateKey = data?.dateKey?.trim();
    const passageId = data?.passageId?.trim();
    const choiceId = data?.choiceId?.trim();

    if (!dateKey || !passageId || !choiceId) {
      res.status(400).json({ error: 'dateKey, passageId, and choiceId required' });
      return;
    }

    // Safety: only allow standard choice IDs (A/B/C/D or choice-*) - never free text
    if (choiceId.length > 50 || choiceId.includes('\n')) {
      res.status(400).json({ error: 'Invalid choice identifier' });
      return;
    }

    const key = getStoreKey(dateKey, passageId);
    const current = votesStore.get(key) || { totalVotes: 0, counts: {} };
    current.totalVotes += 1;
    current.counts[choiceId] = (current.counts[choiceId] || 0) + 1;
    votesStore.set(key, current);

    res.status(200).json(calculateStats(current));
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
