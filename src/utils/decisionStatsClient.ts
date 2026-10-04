export interface DecisionStatsResponse {
  totalVotes: number;
  counts: Record<string, number>;
  topChoiceId: string | null;
  topChoicePercentage: number;
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
        choiceId
      })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
