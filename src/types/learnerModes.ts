export type LearnerMode = 'builder' | 'reciter' | 'storyteller';

export interface ReciterPhraseRep {
  phraseIndex: number;
  phraseText: string;
  rating?: 'got_it' | 'missed_it';
}

export interface ReciterVerseState {
  verseId: string;
  reference: string;
  text: string;
  phrases: string[];
  startDate: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 7
  completedDays: Record<number, {
    date: string;
    completedAt: string;
    reps: { phraseIndex: number; rating: 'got_it' | 'missed_it' }[];
  }>;
  // Loop-back queue: indices of phrases that were missed on previous days and need extra rep
  loopBackPhraseIndices: number[];
  retiredToKnownAt?: string; // ISO date string when completed Day 7
}

export interface KnownVerseEntry {
  verseId: string;
  reference: string;
  text: string;
  masteredAt: string;
}

export interface StorytellerRetellEntry {
  id: string;
  dateKey: string;
  passageReference: string;
  heroName: string;
  userRetelling: string;
  faithfulRetelling: string; // The app's faithful retelling badged as reflection
  capturedPoints: string[];
  missedPoints: string[];
  createdAt: string;
}

export interface LearnerModesState {
  activeMode: LearnerMode;
  reciter: {
    currentVerse: ReciterVerseState | null;
    knownVerses: KnownVerseEntry[];
    // Historical verses completed
    verseRotationIndex: number;
  };
  storyteller: {
    entries: StorytellerRetellEntry[];
  };
}
