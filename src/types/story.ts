import type { StorySceneId } from '../utils/storyScenes';

/**
 * Story Swipes data model.
 *
 * A Story is a short, playable sequence of cards. Scripture lines are always
 * real, verified text (WEB or KJV) with their reference and translation label.
 * Reflection lines are narration and are never labeled as Scripture.
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
  /** Stable key for the recorded clip. Required on cards inside a branch or a callback-driven story. */
  id?: string;
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
  /** Narration shown when a wrong item is dropped on the target. */
  rejectText?: string;
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
  /** Stable key stored in the choice ledger. Defaults to the option's index when absent. */
  id?: string;
  label: string;
  response: string;
  /** Single-screen scene shown on its own before what really happened (legacy). */
  scene?: string;
  /** 0-2 narration or interaction cards that play after the pick, before what really happened. */
  branch?: StoryCard[];
}

export interface WhatHappened {
  text: string;
  ref: string;
  translation: string;
  scriptureText: string;
}

export interface ChoiceCard {
  type: 'choice';
  /** Stable id; required when another story calls this choice back. */
  id?: string;
  prompt: string;
  options: ChoiceOption[];
  whatHappened: WhatHappened;
}

/** Narrates a remembered pick from an earlier story. Resolves to a variant or the fallback. */
export interface CallbackCard {
  type: 'callback';
  id: string;
  /** "<storyId>:<choiceId>" of a choice in an earlier story. */
  choiceRef: string;
  /** Option id -> narration text. */
  variants: Record<string, string>;
  fallback: string;
}

export interface PayoffCard {
  type: 'payoff';
  /** Optional override; defaults to the story verse. */
  verse?: StoryVerse;
}

export type StoryCard = NarrationCard | InteractionCard | ChoiceCard | PayoffCard | CallbackCard;

/** A card in the playable sequence: authored cards plus the reveal that follows a branch. */
export interface RevealCard {
  type: 'reveal';
  choice: ChoiceCard;
  optionIndex: number;
}

export type PlayCard = Exclude<StoryCard, CallbackCard> | RevealCard;

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
  /** One personal question asked on the finish screen. */
  reflection?: string;
  /** Show the scene's "before" picture until the tap-reveal card, so the art does not give away the ending. */
  hideArtUntilReveal?: boolean;
  quiz: QuizItem[];
  /** Teaser on the Today screen after finishing, keyed by the option picked in this story's choice. */
  hook?: Record<string, string>;
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
