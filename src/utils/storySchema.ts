/**
 * Runtime validation for Story Swipes data. No external dependency: a focused
 * validator that returns typed stories or a list of human-readable errors.
 */

import type {
  CallbackCard,
  ChoiceCard,
  InteractionCard,
  NarrationCard,
  PayoffCard,
  QuizItem,
  Story,
  StoryArc,
  StoryCard,
  VerseTranslation
} from '../types/story';
import { STORY_ARCS } from '../types/story';
import { isStorySceneId } from './storyScenes';

export type ValidationResult =
  | { ok: true; story: Story }
  | { ok: false; errors: string[] };

const TRANSLATIONS: VerseTranslation[] = ['WEB', 'KJV'];
const INTERACTION_KINDS = ['drag', 'hold', 'tap-reveal', 'tap-sequence'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScriptureLine(value: unknown): boolean {
  if (!isObject(value)) return false;
  return typeof value.ref === 'string' && typeof value.text === 'string' &&
    typeof value.translation === 'string' && TRANSLATIONS.includes(value.translation as VerseTranslation);
}

function validateNarration(card: Record<string, unknown>, where: string, errors: string[]): void {
  if (typeof card.text !== 'string' || !card.text.trim()) errors.push(`${where}: narration needs text`);
  else if (card.text.trim().split(/\s+/).length > 28) errors.push(`${where}: narration is longer than 25 words`);
  if (card.scriptureLine !== undefined && !isScriptureLine(card.scriptureLine)) {
    errors.push(`${where}: scriptureLine must have ref, text, and a WEB/KJV translation`);
  }
}

function validateInteraction(card: Record<string, unknown>, where: string, errors: string[]): void {
  if (typeof card.prompt !== 'string' || !card.prompt.trim()) errors.push(`${where}: interaction needs a prompt`);
  if (typeof card.successText !== 'string' || !card.successText.trim()) errors.push(`${where}: interaction needs successText`);
  if (typeof card.kind !== 'string' || !INTERACTION_KINDS.includes(card.kind)) {
    errors.push(`${where}: unknown interaction kind "${String(card.kind)}"`);
  }
  if (!isObject(card.config)) {
    errors.push(`${where}: interaction needs a config`);
    return;
  }
  if (card.config.kind !== card.kind) {
    errors.push(`${where}: config.kind must match card.kind`);
  }
  const config = card.config;
  switch (config.kind) {
    case 'drag':
      if (!Array.isArray(config.items) || config.items.length === 0) errors.push(`${where}: drag needs items`);
      if (typeof config.targetLabel !== 'string') errors.push(`${where}: drag needs a targetLabel`);
      if (typeof config.requiredCount !== 'number' || config.requiredCount < 1) errors.push(`${where}: drag needs requiredCount`);
      break;
    case 'hold':
      if (typeof config.durationMs !== 'number' || config.durationMs < 200) errors.push(`${where}: hold needs durationMs >= 200`);
      if (typeof config.holdLabel !== 'string') errors.push(`${where}: hold needs a holdLabel`);
      break;
    case 'tap-reveal':
      if (!Array.isArray(config.reveals) || config.reveals.length === 0) errors.push(`${where}: tap-reveal needs reveals`);
      if (!isStorySceneId(config.scene)) errors.push(`${where}: tap-reveal needs a known scene`);
      break;
    case 'tap-sequence':
      if (!Array.isArray(config.steps) || config.steps.length < 2) errors.push(`${where}: tap-sequence needs at least 2 steps`);
      break;
    default:
      break;
  }
}

function validateChoice(card: Record<string, unknown>, where: string, errors: string[]): void {
  if (card.id !== undefined && (typeof card.id !== 'string' || !card.id.trim())) errors.push(`${where}: choice id must be text`);
  if (typeof card.prompt !== 'string' || !card.prompt.trim()) errors.push(`${where}: choice needs a prompt`);
  if (!Array.isArray(card.options) || card.options.length < 2) {
    errors.push(`${where}: choice needs at least 2 options`);
  } else {
    card.options.forEach((option, i) => {
      const at = `${where}.options[${i}]`;
      if (!isObject(option) || typeof option.label !== 'string' || typeof option.response !== 'string') {
        errors.push(`${at}: needs label and response`);
        return;
      }
      if (option.id !== undefined && (typeof option.id !== 'string' || !option.id.trim())) errors.push(`${at}: id must be text`);
      if (option.scene !== undefined && (typeof option.scene !== 'string' || !option.scene.trim())) {
        errors.push(`${at}: scene must be text`);
      }
      if (option.branch !== undefined) {
        if (!Array.isArray(option.branch) || option.branch.length > 2) {
          errors.push(`${at}: branch must be an array of at most 2 cards`);
          return;
        }
        option.branch.forEach((b, j) => {
          const bAt = `${at}.branch[${j}]`;
          if (!isObject(b)) {
            errors.push(`${bAt}: must be an object`);
          } else if (b.type === 'narration') {
            validateNarration(b, bAt, errors);
            if (typeof b.id !== 'string' || !b.id.trim()) errors.push(`${bAt}: branch narration needs an id`);
          } else if (b.type === 'interaction') {
            validateInteraction(b, bAt, errors);
          } else {
            errors.push(`${bAt}: branch cards must be narration or interaction`);
          }
        });
      }
    });
  }
  const wh = card.whatHappened;
  if (!isObject(wh) || typeof wh.text !== 'string' || typeof wh.ref !== 'string' ||
      typeof wh.translation !== 'string' || typeof wh.scriptureText !== 'string') {
    errors.push(`${where}: choice needs whatHappened {text, ref, translation, scriptureText}`);
  }
}

function validateCallback(card: Record<string, unknown>, where: string, errors: string[]): void {
  if (typeof card.id !== 'string' || !card.id.trim()) errors.push(`${where}: callback needs an id`);
  if (typeof card.choiceRef !== 'string' || !/^[a-z0-9-]+:[a-z0-9-]+$/i.test(card.choiceRef)) {
    errors.push(`${where}: callback choiceRef must be "storyId:choiceId"`);
  }
  if (typeof card.fallback !== 'string' || !card.fallback.trim()) errors.push(`${where}: callback needs fallback text`);
  if (!isObject(card.variants) || Object.values(card.variants).some((v) => typeof v !== 'string' || !v.trim())) {
    errors.push(`${where}: callback variants must map option ids to text`);
  }
}


function validateQuizItems(raw: unknown, where: string, errors: string[]): QuizItem[] {
  if (!Array.isArray(raw)) {
    errors.push(`${where}: quiz must be an array`);
    return [];
  }
  const items: QuizItem[] = [];
  raw.forEach((item, i) => {
    const at = `${where}.quiz[${i}]`;
    if (!isObject(item)) {
      errors.push(`${at}: must be an object`);
      return;
    }
    if (typeof item.id !== 'string') errors.push(`${at}: needs an id`);
    if (!['who', 'what', 'where'].includes(item.category as string)) errors.push(`${at}: category must be who/what/where`);
    if (typeof item.question !== 'string') errors.push(`${at}: needs a question`);
    if (!Array.isArray(item.options) || item.options.length !== 4) {
      errors.push(`${at}: needs exactly 4 options`);
    } else if (!item.options.every((o) => typeof o === 'string')) {
      errors.push(`${at}: options must be strings`);
    }
    if (typeof item.answerIndex !== 'number' || item.answerIndex < 0 || item.answerIndex > 3) {
      errors.push(`${at}: answerIndex must be 0-3`);
    }
    if (item.verseRef !== undefined && typeof item.verseRef !== 'string') errors.push(`${at}: verseRef must be a string`);
    items.push(item as unknown as QuizItem);
  });
  return items;
}

export function validateStory(raw: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(raw)) return { ok: false, errors: ['story must be an object'] };

  if (typeof raw.id !== 'string' || !raw.id.trim()) errors.push('story needs an id');
  if (typeof raw.title !== 'string' || !raw.title.trim()) errors.push('story needs a title');
  if (typeof raw.passage !== 'string' || !raw.passage.trim()) errors.push('story needs a passage');
  if (!STORY_ARCS.includes(raw.arc as StoryArc)) errors.push(`story arc "${String(raw.arc)}" is not one of ${STORY_ARCS.join(', ')}`);
  if (typeof raw.order !== 'number') errors.push('story needs a numeric order');
  if (typeof raw.estMinutes !== 'number' || raw.estMinutes <= 0) errors.push('story needs estMinutes > 0');
  if (!isScriptureLine(raw.verse)) errors.push('story needs a verse {ref, translation, text}');

  const cards: StoryCard[] = [];
  if (!Array.isArray(raw.cards) || raw.cards.length === 0) {
    errors.push('story needs at least one card');
  } else {
    raw.cards.forEach((card, i) => {
      const where = `cards[${i}]`;
      if (!isObject(card)) {
        errors.push(`${where}: must be an object`);
        return;
      }
      switch (card.type) {
        case 'narration':
          validateNarration(card, where, errors);
          cards.push(card as unknown as NarrationCard);
          break;
        case 'interaction':
          validateInteraction(card, where, errors);
          cards.push(card as unknown as InteractionCard);
          break;
        case 'choice':
          validateChoice(card, where, errors);
          cards.push(card as unknown as ChoiceCard);
          break;
        case 'callback':
          validateCallback(card, where, errors);
          cards.push(card as unknown as CallbackCard);
          break;
        case 'payoff':
          cards.push(card as unknown as PayoffCard);
          break;
        default:
          errors.push(`${where}: unknown card type "${String(card.type)}"`);
      }
    });
  }

  const quiz = validateQuizItems(raw.quiz ?? [], 'story', errors);

  if (raw.reflection !== undefined && typeof raw.reflection !== 'string') {
    errors.push('story: reflection must be a string');
  }
  if (raw.hook !== undefined && (!isObject(raw.hook) || Object.values(raw.hook).some((v) => typeof v !== 'string' || !v.trim()))) {
    errors.push('story: hook must map option ids to text');
  }

  if (errors.length > 0) return { ok: false, errors };

  const story: Story = {
    id: raw.id as string,
    title: raw.title as string,
    arc: raw.arc as StoryArc,
    order: raw.order as number,
    passage: raw.passage as string,
    estMinutes: raw.estMinutes as number,
    cards,
    verse: raw.verse as Story['verse'],
    reflection: raw.reflection as string | undefined,
    hideArtUntilReveal: raw.hideArtUntilReveal === true,
    quiz,
    hook: raw.hook as Record<string, string> | undefined
  };
  return { ok: true, story };
}

export function validateStories(raws: unknown[]): { stories: Story[]; errors: string[] } {
  const stories: Story[] = [];
  const errors: string[] = [];
  raws.forEach((raw, i) => {
    const result = validateStory(raw);
    if (result.ok) stories.push(result.story);
    else errors.push(...result.errors.map((e) => `story #${i}: ${e}`));
  });
  return { stories, errors };
}
