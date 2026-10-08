import { getDailyCuratedPassage, type CuratedPassage } from '../data/dailyPassages';
import { getDecisionJournalEntries, type DecisionJournalEntry } from './decisionJournal';
import { truncateAtWordBoundary } from './textUtils';

export interface WeeklyRecapDay {
  dayOffset: number;
  dateKey: string;
  dayName: string;
  passage: CuratedPassage;
  userEntry?: DecisionJournalEntry;
  summaryLine: string;
  isCompleted: boolean;
}

export interface WeeklyRecapData {
  days: WeeklyRecapDay[];
  narrativeThread: string;
  nextTeaserHook: string;
  isMonday: boolean;
  completedCount: number;
}

export function getWeeklyRecap(): WeeklyRecapData {
  const today = new Date();
  const isMonday = today.getDay() === 1;

  const journal = getDecisionJournalEntries();
  const journalMap = new Map<string, DecisionJournalEntry>();
  for (const entry of journal) {
    if (entry.dateKey) journalMap.set(entry.dateKey, entry);
    if (entry.passageReference) journalMap.set(entry.passageReference, entry);
  }

  const days: WeeklyRecapDay[] = [];
  let completedCount = 0;

  for (let offset = -6; offset <= 0; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const passage = getDailyCuratedPassage(offset);

    const userEntry = journalMap.get(dateKey) || journalMap.get(passage.reference);
    const isCompleted = Boolean(userEntry);
    if (isCompleted) completedCount++;

    let summaryLine = '';
    if (userEntry) {
      const rawText = userEntry.userCustomText
        ? `"${userEntry.userCustomText}"`
        : userEntry.chosenText;
      const choiceSnippet = truncateAtWordBoundary(rawText, 45, '…');
      summaryLine = `${dayName} — You chose: ${choiceSnippet} · ${passage.reference}`;
    } else {
      summaryLine = `${dayName} — ${passage.heroName} under pressure · ${passage.reference}`;
    }

    days.push({
      dayOffset: offset,
      dateKey,
      dayName,
      passage,
      userEntry,
      summaryLine,
      isCompleted
    });
  }

  const tomorrowPassage = getDailyCuratedPassage(1);
  const nextTeaserHook = tomorrowPassage?.teaserHook || "Tomorrow's mission is ready. Come back to unlock it.";

  const narrativeThread =
    "Across this past week's arc, we watched fear collide with faith — from outlaws in desert caves to fishermen panicking on stormy waters. In every crisis, the real turning point was releasing self-reliance and leaning on God.";

  return {
    days,
    narrativeThread,
    nextTeaserHook,
    isMonday,
    completedCount
  };
}
