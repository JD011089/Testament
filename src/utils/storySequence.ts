/**
 * Turns a story plus the learner's choice ledger into the playable sequence.
 *
 * A pick inserts that option's branch right after its choice card, then a reveal
 * card with what really happened. Callback cards become narration that names a
 * pick from an earlier story, or a fallback when no pick was made.
 */

import type {
  ChoiceCard,
  ChoiceOption,
  NarrationCard,
  PlayCard,
  Story,
  StoryCard
} from '../types/story';
import { choiceLedgerKey, type ChoiceLedger } from './storyChoices';

export function optionKeyOf(option: ChoiceOption, index: number): string {
  return option.id ?? String(index);
}

export function choiceKeyOf(card: ChoiceCard, index: number): string {
  return card.id ?? `choice-${index}`;
}

function pickFor(ledger: ChoiceLedger, storyId: string, choiceId: string) {
  return ledger[choiceLedgerKey(storyId, choiceId)] ?? null;
}

export function resolveSequence(story: Story, ledger: ChoiceLedger): PlayCard[] {
  const out: PlayCard[] = [];
  story.cards.forEach((card: StoryCard, index: number) => {
    if (card.type === 'callback') {
      const [refStory, refChoice] = card.choiceRef.split(':');
      const pick = pickFor(ledger, refStory, refChoice);
      const variant = pick ? card.variants[pick.optionId] : undefined;
      out.push({
        type: 'narration',
        id: `${card.id}:${variant !== undefined && pick ? pick.optionId : 'fallback'}`,
        text: variant ?? card.fallback
      });
      return;
    }
    if (card.type === 'narration') {
      out.push(card.id ? card : { ...card, id: String(index) });
      return;
    }
    if (card.type === 'choice') {
      out.push(card);
      const pick = pickFor(ledger, story.id, choiceKeyOf(card, index));
      if (!pick) return;
      const optionIndex = card.options.findIndex((option, i) => optionKeyOf(option, i) === pick.optionId);
      const branch = optionIndex >= 0 ? card.options[optionIndex].branch : undefined;
      if (!branch || branch.length === 0) return;
      for (const b of branch) out.push(b as PlayCard);
      out.push({ type: 'reveal', choice: card, optionIndex });
      return;
    }
    out.push(card as PlayCard);
  });
  return out;
}

/** Narration units that need a recorded clip: key plus the narration text. */
export interface NarrationUnit {
  key: string;
  card: NarrationCard;
}

export function narrationUnitsForStory(story: Story): NarrationUnit[] {
  const units: NarrationUnit[] = [];
  story.cards.forEach((card, index) => {
    if (card.type === 'narration') {
      units.push({ key: card.id ?? String(index), card });
    } else if (card.type === 'callback') {
      for (const [optionId, text] of Object.entries(card.variants)) {
        units.push({ key: `${card.id}:${optionId}`, card: { type: 'narration', text } });
      }
      units.push({ key: `${card.id}:fallback`, card: { type: 'narration', text: card.fallback } });
    } else if (card.type === 'choice') {
      for (const option of card.options) {
        for (const b of option.branch ?? []) {
          if (b.type === 'narration') units.push({ key: b.id ?? '', card: b });
        }
      }
    }
  });
  return units;
}

/** The Today teaser for this story, from the pick made in its choice card. */
export function storyHookFor(story: Story, ledger: ChoiceLedger): string | null {
  if (!story.hook) return null;
  for (const [index, card] of story.cards.entries()) {
    if (card.type !== 'choice') continue;
    const pick = pickFor(ledger, story.id, choiceKeyOf(card, index));
    if (pick && story.hook[pick.optionId]) return story.hook[pick.optionId];
  }
  return null;
}

/** Every callback must point at a choice in a story that comes earlier in map order. */
export function callbackReferenceErrors(stories: Story[]): string[] {
  const byId = new Map(stories.map((s) => [s.id, s]));
  const errors: string[] = [];
  for (const story of stories) {
    for (const card of story.cards) {
      if (card.type !== 'callback') continue;
      const [refStory, refChoice] = card.choiceRef.split(':');
      const source = byId.get(refStory);
      if (!source) {
        errors.push(`${story.id}: callback ${card.id} points at unknown story "${refStory}"`);
        continue;
      }
      if (source.order >= story.order) {
        errors.push(`${story.id}: callback ${card.id} must call back to an earlier story, not "${refStory}"`);
      }
      const choice = source.cards.find((c) => c.type === 'choice' && c.id === refChoice);
      if (!choice) errors.push(`${story.id}: callback ${card.id} points at missing choice "${refChoice}" in ${refStory}`);
      if (choice && choice.type === 'choice') {
        for (const variantId of Object.keys(card.variants)) {
          if (!choice.options.some((o, i) => optionKeyOf(o, i) === variantId)) {
            errors.push(`${story.id}: callback ${card.id} has a variant for unknown option "${variantId}"`);
          }
        }
      }
    }
  }
  return errors;
}
