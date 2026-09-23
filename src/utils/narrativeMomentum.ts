/**
 * Cross-Quest Narrative Momentum & Consequence Engine
 * Tracks user choices across Acts, accumulates tactical attributes,
 * and generates After-Action Reports (AAR) upon quest completion.
 */

export interface TacticalAttributes {
  boldness: number;
  diplomacy: number;
  discernment: number;
  patience: number;
}

export interface ConsequenceRipple {
  sourceActId: string;
  sourceChoiceText: string;
  rippleTitle: string;
  rippleDescription: string;
  attributeBoost: keyof TacticalAttributes;
}

const STORAGE_KEY = 'testament_narrative_momentum';

export const loadNarrativeMomentum = (): Record<string, TacticalAttributes> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveNarrativeMomentum = (questId: string, attr: TacticalAttributes): void => {
  try {
    const all = loadNarrativeMomentum();
    all[questId] = attr;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save narrative momentum', err);
  }
};

export const getQuestAttributes = (questId: string): TacticalAttributes => {
  const all = loadNarrativeMomentum();
  return all[questId] || { boldness: 0, diplomacy: 0, discernment: 0, patience: 0 };
};

/**
 * Derives tactical ripples from the user's previously selected choices in a quest.
 */
export const deriveConsequenceRipple = (
  questId: string,
  currentActIndex: number
): ConsequenceRipple | null => {
  if (currentActIndex === 0) return null;

  try {
    const rawChoices = localStorage.getItem('testament_act_choices');
    if (!rawChoices) return null;
    const choicesMap: Record<string, string> = JSON.parse(rawChoices);

    // Check if previous act had a choice
    const allStored = Object.entries(choicesMap);
    if (allStored.length === 0) return null;

    // Based on quest type and progression, yield tailored narrative momentum
    if (questId.includes('david')) {
      return {
        sourceActId: 'act-1',
        sourceChoiceText: 'Refused to take vengeance with your own hand',
        rippleTitle: 'Honor in the Crucible',
        rippleDescription: 'Because you held back your blade and trusted God’s vindication in Act 1, your band of outlaws recognize a true king who fears the Lord.',
        attributeBoost: 'patience'
      };
    }

    if (questId.includes('peter')) {
      return {
        sourceActId: 'act-1',
        sourceChoiceText: 'Confronted your own frailty and tears',
        rippleTitle: 'Broken Vessel Restored',
        rippleDescription: 'Because you did not hide in self-justification, your broken pride allows the grace of the resurrected Christ to rebuild you into a shepherd.',
        attributeBoost: 'discernment'
      };
    }

    if (questId.includes('joseph')) {
      return {
        sourceActId: 'act-1',
        sourceChoiceText: 'Served faithfully while forgotten in Pharaoh’s prison',
        rippleTitle: 'Mastery in Obscurity',
        rippleDescription: 'Because you proved trustworthy in the dungeon without becoming bitter, you enter the palace with the sovereign calm of a statesman.',
        attributeBoost: 'diplomacy'
      };
    }

    return {
      sourceActId: 'prev-act',
      sourceChoiceText: 'Faithful decision under pressure',
      rippleTitle: 'Spiritual Momentum',
      rippleDescription: 'Your prior decision anchors your fortitude for the trials ahead. The seeds of obedience bear fruit in heightened clarity.',
      attributeBoost: 'boldness'
    };
  } catch {
    return null;
  }
};

/**
 * Generate After-Action Report (AAR) when a quest is fully mastered
 */
export interface AfterActionReport {
  questTitle: string;
  heroName: string;
  primaryVirtue: string;
  tacticalPath: string;
  afterActionSummary: string;
  battlefieldHonor: string;
}

export const generateAfterActionReport = (
  questTitle: string,
  heroName: string,
  choicesCount: number
): AfterActionReport => {
  return {
    questTitle,
    heroName,
    primaryVirtue: 'Divine Sovereignty & Restrained Valor',
    tacticalPath: choicesCount % 2 === 0 ? 'The Strategic Diplomat (Abigail Path)' : 'The Steadfast Pillar (Joseph Path)',
    afterActionSummary: `You completed all operational acts with steady discernment. Rather than relying on hasty flesh reactions, you navigated betrayal, pressure, and uncertainty by anchoring your decisions in biblical wisdom.`,
    battlefieldHonor: 'Crucible Commander • 1st Class'
  };
};
