export interface DecisionJournalEntry {
  id: string;
  dateKey: string;
  timestamp: number;
  passageReference: string;
  heroName: string;
  scenarioQuestion: string;
  chosenText: string;
  userCustomText?: string;
  actionLine?: string;
  storyTakeaway?: string;
}

const STORAGE_KEY = 'testament_decision_journal';

/**
 * Saves a decision to the private on-device journal.
 * Strictly local storage: no network requests or external persistence.
 */
export function saveDecisionJournalEntry(
  entry: Omit<DecisionJournalEntry, 'id' | 'timestamp'>
): void {
  try {
    if (typeof localStorage === 'undefined') return;

    const existing = getDecisionJournalEntries();
    // Update existing entry for the same date or prepend new one
    const filtered = existing.filter((e) => e.dateKey !== entry.dateKey);

    const newEntry: DecisionJournalEntry = {
      ...entry,
      id: `journal-${entry.dateKey}-${Date.now()}`,
      timestamp: Date.now()
    };

    const updated = [newEntry, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore local storage errors
  }
}

/**
 * Retrieves all journal entries, sorted reverse-chronologically.
 */
export function getDecisionJournalEntries(): DecisionJournalEntry[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as DecisionJournalEntry[];
    if (!Array.isArray(parsed)) return [];

    return parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch {
    return [];
  }
}

/**
 * Permanently wipes all decision journal entries from the device.
 */
export function clearDecisionJournal(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Returns the count of recorded journal entries.
 */
export function getJournalCount(): number {
  return getDecisionJournalEntries().length;
}
