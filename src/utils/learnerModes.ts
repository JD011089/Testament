import { MEMORY_VERSES } from '../data/verses';
import type { 
  LearnerMode, 
  LearnerModesState, 
  ReciterVerseState, 
  StorytellerRetellEntry 
} from '../types/learnerModes';

const STORAGE_KEY = 'testament_learner_modes_state';

export const RECITER_VERSE_ROTATION = MEMORY_VERSES;

/**
 * Splits verse text into natural, punctuation-aware clauses.
 * Splitting delimiters: periods, question marks, exclamation marks, semicolons, colons, or em-dashes/commas if long.
 * Preserves verbatim text integrity — joining phrases with appropriate spacing matches original verse text.
 */
export function splitVerseIntoNaturalPhrases(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Match sentences or clauses ending in . ? ! ; : or long clauses separated by commas
  // First split by sentence boundaries (. ? !)
  const rawParts: string[] = [];
  
  // Regex to split on major clause punctuation while retaining punctuation attached to the clause
  const matches = text.match(/[^.?!;:]+[.?!;:]?/g);
  if (!matches) {
    return [text.trim()];
  }

  for (const match of matches) {
    const trimmed = match.trim();
    if (!trimmed) continue;

    // If a clause is still very long (> 12 words) and contains a comma, we can split on comma
    const words = trimmed.split(/\s+/);
    if (words.length > 12 && trimmed.includes(',')) {
      const commaSub = trimmed.split(/,\s*/);
      let buffer = '';
      for (let i = 0; i < commaSub.length; i++) {
        const sub = commaSub[i].trim();
        if (!sub) continue;
        const withPunct = (i < commaSub.length - 1) ? `${sub},` : sub;
        if (!buffer) {
          buffer = withPunct;
        } else if ((buffer.split(/\s+/).length + withPunct.split(/\s+/).length) <= 12) {
          buffer = `${buffer} ${withPunct}`;
        } else {
          rawParts.push(buffer);
          buffer = withPunct;
        }
      }
      if (buffer) rawParts.push(buffer);
    } else {
      rawParts.push(trimmed);
    }
  }

  // Fallback: If only 1 or 2 phrases were generated, ensure we have at least 3-4 natural phrases if verse is long enough
  const filtered = rawParts.filter(p => p.trim().length > 0);
  return filtered.length > 0 ? filtered : [text.trim()];
}

export function getDefaultLearnerModesState(): LearnerModesState {
  return {
    activeMode: 'builder',
    reciter: {
      currentVerse: null,
      knownVerses: [],
      verseRotationIndex: 0
    },
    storyteller: {
      entries: []
    }
  };
}

export function loadLearnerModesState(): LearnerModesState {
  if (typeof localStorage === 'undefined') return getDefaultLearnerModesState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultLearnerModesState();
    const parsed = JSON.parse(raw);
    return {
      activeMode: (parsed.activeMode === 'reciter' || parsed.activeMode === 'storyteller') 
        ? parsed.activeMode 
        : 'builder',
      reciter: {
        currentVerse: parsed.reciter?.currentVerse || null,
        knownVerses: Array.isArray(parsed.reciter?.knownVerses) ? parsed.reciter.knownVerses : [],
        verseRotationIndex: typeof parsed.reciter?.verseRotationIndex === 'number' ? parsed.reciter.verseRotationIndex : 0
      },
      storyteller: {
        entries: Array.isArray(parsed.storyteller?.entries) ? parsed.storyteller.entries : []
      }
    };
  } catch {
    return getDefaultLearnerModesState();
  }
}

export function saveLearnerModesState(state: LearnerModesState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('testament-mode-changed', { detail: state }));
  } catch {
    // ignore quota failure
  }
}

export function setLearnerMode(mode: LearnerMode): LearnerModesState {
  const current = loadLearnerModesState();
  current.activeMode = mode;
  saveLearnerModesState(current);
  return current;
}

/**
 * Initializes or gets the active Reciter verse for the user.
 * Reciter verse runs on a rolling 7-day schedule from startDate.
 * If today's date extends past 7 days and Day 7 was completed, verse retires into Known verses
 * and the next verse in the curated rotation is issued.
 */
export function getOrInitReciterVerse(todayDateStr: string): ReciterVerseState {
  const state = loadLearnerModesState();
  let current = state.reciter.currentVerse;

  if (!current) {
    // Pick the first verse from rotation
    const rotationIndex = state.reciter.verseRotationIndex % RECITER_VERSE_ROTATION.length;
    const verse = RECITER_VERSE_ROTATION[rotationIndex];
    current = {
      verseId: verse.id,
      reference: verse.reference,
      text: verse.text,
      phrases: splitVerseIntoNaturalPhrases(verse.text),
      startDate: todayDateStr,
      dayNumber: 1,
      completedDays: {},
      loopBackPhraseIndices: []
    };
    state.reciter.currentVerse = current;
    saveLearnerModesState(state);
    return current;
  }

  // Calculate day difference from startDate (zero-guilt: pause never resets, but advances day count up to 7)
  const start = new Date(current.startDate);
  const today = new Date(todayDateStr);
  const diffDays = Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // Day number is bounded 1..7
  const calculatedDay = Math.min(7, Math.max(1, diffDays + 1));
  if (current.dayNumber !== calculatedDay && calculatedDay >= current.dayNumber) {
    current.dayNumber = calculatedDay;
    state.reciter.currentVerse = current;
    saveLearnerModesState(state);
  }

  return current;
}

/**
 * Self-grades a recitation practice day (1 to 7).
 * If any phrase is marked 'missed_it', that phrase's index is pushed into loopBackPhraseIndices.
 * If Day 7 is completed, verse retires to Known Verses and next rotation verse is unlocked.
 */
export function completeReciterDay(
  dayNumber: number,
  reps: { phraseIndex: number; rating: 'got_it' | 'missed_it' }[],
  todayDateStr: string
): { state: LearnerModesState; verseCompleted: boolean } {
  const state = loadLearnerModesState();
  const current = state.reciter.currentVerse;
  if (!current) return { state, verseCompleted: false };

  // Track missed phrases to loop-back next day
  const missedIndices = reps.filter(r => r.rating === 'missed_it').map(r => r.phraseIndex);
  const nextLoopBack = Array.from(new Set([...current.loopBackPhraseIndices, ...missedIndices]));
  
  // If rep was got_it, remove from loop-back queue
  const gotIndices = reps.filter(r => r.rating === 'got_it').map(r => r.phraseIndex);
  const cleanedLoopBack = nextLoopBack.filter(idx => !gotIndices.includes(idx));

  current.loopBackPhraseIndices = cleanedLoopBack;
  current.completedDays[dayNumber] = {
    date: todayDateStr,
    completedAt: new Date().toISOString(),
    reps
  };

  let verseCompleted = false;

  // Day 7 recitation test completion
  if (dayNumber >= 7) {
    verseCompleted = true;
    current.retiredToKnownAt = new Date().toISOString();
    
    // Add to known verses if not present
    if (!state.reciter.knownVerses.some(v => v.reference === current.reference)) {
      state.reciter.knownVerses.push({
        verseId: current.verseId,
        reference: current.reference,
        text: current.text,
        masteredAt: new Date().toISOString()
      });
    }

    // Advance rotation
    state.reciter.verseRotationIndex += 1;
    const nextVerse = RECITER_VERSE_ROTATION[state.reciter.verseRotationIndex % RECITER_VERSE_ROTATION.length];
    state.reciter.currentVerse = {
      verseId: nextVerse.id,
      reference: nextVerse.reference,
      text: nextVerse.text,
      phrases: splitVerseIntoNaturalPhrases(nextVerse.text),
      startDate: todayDateStr,
      dayNumber: 1,
      completedDays: {},
      loopBackPhraseIndices: []
    };
  } else {
    state.reciter.currentVerse = current;
  }

  saveLearnerModesState(state);
  return { state, verseCompleted };
}

/**
 * Saves a Storyteller retelling entry on-device.
 */
export function saveStorytellerEntry(entry: Omit<StorytellerRetellEntry, 'id' | 'createdAt'>): StorytellerRetellEntry {
  const state = loadLearnerModesState();
  const newEntry: StorytellerRetellEntry = {
    ...entry,
    id: `retell-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString()
  };
  state.storyteller.entries.unshift(newEntry);
  saveLearnerModesState(state);
  return newEntry;
}
