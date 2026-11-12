/**
 * Choice ledger: the option a learner picked for each choice, per device.
 * Keyed by "storyId:choiceId" so a pick never leaks into another story.
 * Latest pick wins on replay.
 */

import type { StorageLike } from './storyProgress';

export const STORY_CHOICES_KEY = 'testament_story_choices';

export interface ChoicePick {
  optionId: string;
  pickedAt: string;
}

export type ChoiceLedger = Record<string, ChoicePick>;

function defaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // ignore
  }
  return null;
}

export function choiceLedgerKey(storyId: string, choiceId: string): string {
  return `${storyId}:${choiceId}`;
}

export function readChoiceLedger(storage: StorageLike | null = defaultStorage()): ChoiceLedger {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORY_CHOICES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const ledger: ChoiceLedger = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const pick = value as Partial<ChoicePick> | null;
      if (pick && typeof pick.optionId === 'string') {
        ledger[key] = { optionId: pick.optionId, pickedAt: typeof pick.pickedAt === 'string' ? pick.pickedAt : '' };
      }
    }
    return ledger;
  } catch {
    return {};
  }
}

/** Records a pick and returns the updated ledger. Storage failures are ignored. */
export function recordChoicePick(
  storyId: string,
  choiceId: string,
  optionId: string,
  storage: StorageLike | null = defaultStorage()
): ChoiceLedger {
  const ledger = readChoiceLedger(storage);
  ledger[choiceLedgerKey(storyId, choiceId)] = { optionId, pickedAt: new Date().toISOString() };
  if (storage) {
    try {
      storage.setItem(STORY_CHOICES_KEY, JSON.stringify(ledger));
    } catch {
      // ignore quota failures
    }
  }
  return ledger;
}
