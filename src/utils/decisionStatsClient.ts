export interface DecisionStatsResponse {
  totalVotes: number;
  counts: Record<string, number>;
  topChoiceId: string | null;
  topChoicePercentage: number;
}

function getVoterId(): string {
  const key = 'testament_decision_voter_id';
  const createId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = Math.floor(Math.random() * 16);
      return (char === 'x' ? random : (random & 3) | 8).toString(16);
    });
  };
  try {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    const id = createId();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return createId();
  }
}

/**
 * Client for fetching and recording real anonymous decision statistics.
 * Strictly adheres to the Honesty Rule: Zero fabricated numbers.
 */
export async function fetchDecisionStats(
  dateKey: string,
  passageId: string
): Promise<DecisionStatsResponse | null> {
  try {
    const res = await fetch(
      `/api/decision-stats?dateKey=${encodeURIComponent(dateKey)}&passageId=${encodeURIComponent(passageId)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitAnonymousDecisionVote(
  dateKey: string,
  passageId: string,
  choiceId: string
): Promise<DecisionStatsResponse | null> {
  try {
    const res = await fetch('/api/decision-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateKey,
        passageId,
        choiceId,
        voterId: getVoterId()
      })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
