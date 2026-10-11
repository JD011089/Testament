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
  entryType?: 'mission_decision' | 'free_reflection';
}

const STORAGE_KEY = 'testament_decision_journal';

function getLocalTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
    const targetType = entry.entryType || 'mission_decision';
    // Preserve free reflections and only replace same-day mission decisions
    const filtered = existing.filter((e) => {
      if (e.entryType === 'free_reflection') return true;
      if (targetType === 'mission_decision' && (e.entryType || 'mission_decision') === 'mission_decision' && e.dateKey === entry.dateKey) {
        return false;
      }
      return true;
    });

    const newEntry: DecisionJournalEntry = {
      ...entry,
      entryType: targetType,
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
 * Saves a free-text personal reflection or prayer directly to the journal.
 */
export function saveUserFreeTextJournalEntry(text: string): DecisionJournalEntry | null {
  const clean = text.trim();
  if (!clean) return null;

  try {
    if (typeof localStorage === 'undefined') return null;

    const todayKey = getLocalTodayKey();
    const newEntry: DecisionJournalEntry = {
      id: `journal-free-${Date.now()}`,
      dateKey: todayKey,
      timestamp: Date.now(),
      passageReference: 'Personal Reflection',
      heroName: 'You',
      scenarioQuestion: 'Personal reflection on your walk & scripture',
      chosenText: clean,
      userCustomText: clean,
      entryType: 'free_reflection'
    };

    const existing = getDecisionJournalEntries();
    const updated = [newEntry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch {
    return null;
  }
}

/**
 * Deletes a single journal entry by ID.
 */
export function deleteDecisionJournalEntry(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const existing = getDecisionJournalEntries();
    const updated = existing.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
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
