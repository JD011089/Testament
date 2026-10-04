export interface TermExplainer {
  term: string;
  ancientMeaning: string;
  modernAnalogy: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  reaction: string;
  historicalPivot: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface WisdomQuiz {
  question: string;
  options: QuizOption[];
}

export interface RelicReward {
  id: string;
  name: string;
  iconName: 'stones' | 'signet' | 'staff' | 'mantle' | 'brazier' | 'stocks' | string;
  description: string;
  lesson: string;
}

export interface StoryAct {
  id: string;
  actNumber: number;
  actTitle: string;
  visualTheme: 'valley_battlefield' | 'cave_refuge' | 'desert_canyon' | 'courtyard_fire' | 'prison_cell' | 'sea_storm' | 'palace_hall' | 'red_sea' | 'mount_carmel';
  sceneAtmosphere: string;
  historicalContext: string;
  narrativeParagraphs: string[];
  perspectivePrompt: string;
  choices: StoryChoice[];
  unlockedScripture: {
    reference: string;
    translation: string;
    text: string;
    deepDive: string;
  };
  glossary: TermExplainer[];
  realTalkTakeaway: {
    coreChallenge: string;
    practicalLesson: string;
    dailyAction: string;
  };
  wisdomQuiz?: WisdomQuiz;
  teaserForNext?: string;
}

export interface StoryQuest {
  id: string;
  title: string;
  subtitle: string;
  heroName: string;
  characterTitle: string;
  testament: 'Old Testament' | 'New Testament';
  historicalPeriod: string;
  estimatedMinutes: number;
  themeColor: string;
  badgeName: string;
  summary: string;
  starterTrack?:
    | 'Underdog & Courage'
    | 'Career & High Stakes'
    | 'Burnout & Pressure'
    | 'Restoration & Brotherhood'
    | 'Underdog & Purpose'
    | 'Grace After Failure'
    | 'High-Pressure Crisis'
    | string;
  relicReward?: RelicReward;
  acts: StoryAct[];
}

export interface MemoryVerse {
  id: string;
  reference: string;
  translation: string;
  text: string;
  plainEnglishSummary: string;
  category: 'Pressure & Anxiety' | 'Courage & Facing Giants' | 'Anger & Self-Control' | 'Restoration After Failure' | 'Endurance & Brotherhood';
  difficulty: 'Core' | 'Deep';
  keyTakeaway: string;
  // Story connection metadata (if unlocked from or tied to a story quest)
  storyQuestId?: string;
  storyTitle?: string;
  heroName?: string;
  actId?: string;
  actTitle?: string;
}

export interface CalendarReminderPreferences {
  morningTime: string; // HH:MM (24h)
  recallTime: string;  // HH:MM (24h)
}

export interface UserProgress {
  completedActs: string[]; // act ids
  completedQuests: string[]; // quest ids
  memorizedVerses: string[]; // verse ids
  unlockedRelics: string[]; // relic ids
  streakCount: number;
  lastActiveDate: string;
  arsenalBookmarks: string[]; // verse ids
  notes: Record<string, string>; // verseId or questId -> note text
  xp: number;
}

