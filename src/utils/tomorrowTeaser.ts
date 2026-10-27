import { getDailyCuratedPassage, type CuratedPassage } from '../data/dailyPassages';

export interface TomorrowTeaserData {
  passageId: string;
  reference: string;
  heroName: string;
  hook: string;
  unlockLabel: string;
}

const FALLBACK_TEASER: TomorrowTeaserData = {
  passageId: 'tomorrow-fallback',
  reference: 'Upcoming Scripture',
  heroName: 'Next Hero',
  hook: "Tomorrow's mission is ready. Come back to unlock it.",
  unlockLabel: 'Unlocks tomorrow',
};

/**
 * Returns tomorrow's teaser card data based on the device's local calendar day.
 * Always resolves to the next calendar day's vetted passage without spoilers.
 */
export function getTomorrowTeaser(): TomorrowTeaserData {
  try {
    const tomorrowPassage: CuratedPassage = getDailyCuratedPassage(1);
    if (!tomorrowPassage) return FALLBACK_TEASER;

    const hook = tomorrowPassage.teaserHook?.trim() || FALLBACK_TEASER.hook;

    return {
      passageId: tomorrowPassage.id,
      reference: tomorrowPassage.reference,
      heroName: tomorrowPassage.heroName,
      hook,
      unlockLabel: 'Unlocks tomorrow',
    };
  } catch {
    return FALLBACK_TEASER;
  }
}
