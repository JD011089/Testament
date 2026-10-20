import type { StorySceneId } from '../utils/storyScenes';

/**
 * Story Swipes data model.
 *
 * A Story is a short, playable sequence of cards. Scripture lines are always
 * real, verified text (WEB or KJV) with their reference and translation label.
 * AI-written lines are narration and are never labeled as Scripture.
 */

export type StoryArc =
  | 'Beginnings'
  | 'Patriarchs'
  | 'Exodus'
  | 'Kings'
  | 'Prophets'
  | 'Jesus'
  | 'Church';

export const STORY_ARCS: StoryArc[] = [
  'Beginnings', 'Patriarchs', 'Exodus', 'Kings', 'Prophets', 'Jesus', 'Church'
];

export type VerseTranslation = 'WEB' | 'KJV';

export interface ScriptureLine {
  ref: string;
  translation: VerseTranslation;
  text: string;
}

export interface StoryVerse extends ScriptureLine {}

export interface NarrationCard {
  type: 'narration';
  text: string;
  scriptureLine?: ScriptureLine;
  image?: string;
  audio?: string;
}

export type InteractionKind = 'drag' | 'hold' | 'tap-reveal' | 'tap-sequence';

export interface DragItem {
  id: string;
  label: string;
  /** Whether dropping this item into the target counts toward the goal. */
  accept?: boolean;
}

export interface DragConfig {
  kind: 'drag';
  items: DragItem[];
  targetLabel: string;
  requiredCount: number;
}

export interface HoldConfig {
  kind: 'hold';
  durationMs: number;
  holdLabel: string;
}

export interface RevealItem {
  id: string;
  label: string;
  detail?: string;
}

export interface TapRevealConfig {
  kind: 'tap-reveal';
  reveals: RevealItem[];
  /** Illustrated stage that fills in as the tiles are tapped. */
  scene?: StorySceneId;
}

export interface TapSequenceConfig {
  kind: 'tap-sequence';
  steps: string[];
}

export type InteractionConfig = DragConfig | HoldConfig | TapRevealConfig | TapSequenceConfig;

export interface InteractionCard {
  type: 'interaction';
  kind: InteractionKind;
  prompt: string;
  config: InteractionConfig;
  successText: string;
}

export interface ChoiceOption {
  label: string;
  response: string;
}

export interface WhatHappened {
  text: string;
  ref: string;
  translation: string;
  scriptureText: string;
}

export interface ChoiceCard {
  type: 'choice';
  prompt: string;
  options: ChoiceOption[];
  whatHappened: WhatHappened;
}

export interface PayoffCard {
  type: 'payoff';
  /** Optional override; defaults to the story verse. */
  verse?: StoryVerse;
}

export type StoryCard = NarrationCard | InteractionCard | ChoiceCard | PayoffCard;

export type QuizCategory = 'who' | 'what' | 'where';

export interface QuizItem {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  answerIndex: number;
  /** Verse shown when the answer is missed. */
  verseRef?: string;
}

export interface Story {
  id: string;
  title: string;
  arc: StoryArc;
  order: number;
  passage: string;
  estMinutes: number;
  cards: StoryCard[];
  verse: StoryVerse;
  quiz: QuizItem[];
}

/** Stub stops are title/passage/arc/order only until the story is built. */
export interface StoryStub {
  id: string;
  title: string;
  arc: StoryArc;
  order: number;
  passage: string;
}

export type StoryEntry = Story | StoryStub;

export function isFullStory(entry: StoryEntry): entry is Story {
  return Array.isArray((entry as Story).cards);
}
