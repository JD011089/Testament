import { MEMORY_VERSES } from '../data/verses';
import { STORY_QUESTS } from '../data/stories';
import { PROVERB_SCENARIOS } from '../data/proverbs';
import { PSALM_PRESCRIPTIONS } from '../data/psalms';
import { CANON_BOOKS } from '../data/canon';
import type { MemoryVerse } from '../types';

/**
 * Maps each Story Act's unlockedScripture into a first-class MemoryVerse
 */
export const STORY_MEMORY_VERSES: MemoryVerse[] = STORY_QUESTS.flatMap((quest) => {
  return quest.acts.map((act) => {
    // Determine the most fitting category
    let category: MemoryVerse['category'] = 'Courage & Facing Giants';
    if (quest.id === 'peter-journey' || quest.id === 'joseph-journey') {
      category = 'Restoration After Failure';
    } else if (quest.id === 'paul-journey') {
      category = 'Endurance & Brotherhood';
    } else if (quest.id === 'moses-journey' || quest.id === 'elijah-journey') {
      category = 'Pressure & Anxiety';
    }

    return {
      id: `story-${act.id}`,
      reference: act.unlockedScripture.reference,
      translation: act.unlockedScripture.translation.split('/')[0].trim(),
      text: act.unlockedScripture.text,
      plainEnglishSummary: act.realTalkTakeaway.practicalLesson,
      category,
      difficulty: 'Core',
      keyTakeaway: act.realTalkTakeaway.dailyAction,
      storyQuestId: quest.id,
      storyTitle: quest.title,
      heroName: quest.heroName,
      actId: act.id,
      actTitle: act.actTitle
    };
  });
});

/**
 * Maps Proverbs Tactical Codex entries into MemoryVerse format
 */
export const PROVERB_MEMORY_VERSES: MemoryVerse[] = PROVERB_SCENARIOS.map((p) => {
  let category: MemoryVerse['category'] = 'Endurance & Brotherhood';
  if (p.category === 'money-debt' || p.category === 'ego-criticism') {
    category = 'Anger & Self-Control';
  } else if (p.category === 'sluggard-work') {
    category = 'Courage & Facing Giants';
  }

  return {
    id: p.id,
    reference: p.reference,
    translation: 'BSB',
    text: p.formalText,
    plainEnglishSummary: p.streetTranslation,
    category,
    difficulty: 'Core',
    keyTakeaway: p.keyTakeaway,
    heroName: 'Solomon (Proverbs Codex)',
    storyTitle: p.title
  };
});

/**
 * Maps Psalms Field Medic prescriptions into MemoryVerse format
 */
export const PSALM_MEMORY_VERSES: MemoryVerse[] = PSALM_PRESCRIPTIONS.map((ps) => {
  let category: MemoryVerse['category'] = 'Pressure & Anxiety';
  if (ps.moodId === 'betrayal-hurt' || ps.moodId === 'guilt-ruin') {
    category = 'Restoration After Failure';
  } else if (ps.moodId === 'rage-injustice') {
    category = 'Anger & Self-Control';
  }

  return {
    id: ps.id,
    reference: ps.reference,
    translation: 'BSB',
    text: ps.formalText,
    plainEnglishSummary: ps.streetTranslation,
    category,
    difficulty: 'Core',
    keyTakeaway: ps.keyTakeaway,
    heroName: 'David (Psalms Field Medic)',
    storyTitle: ps.title
  };
});

/**
 * Maps all 66 Canon Codex books' anchor scriptures into MemoryVerse format
 */
export const CANON_MEMORY_VERSES: MemoryVerse[] = CANON_BOOKS.map((b) => {
  let category: MemoryVerse['category'] = 'Endurance & Brotherhood';
  if (b.lifeTheme === 'Anxiety & Fear' || b.lifeTheme === 'Burnout & Meaning') {
    category = 'Pressure & Anxiety';
  } else if (b.lifeTheme === 'Courage Under Fire') {
    category = 'Courage & Facing Giants';
  } else if (b.lifeTheme === 'Workplace & Career Pressure') {
    category = 'Anger & Self-Control';
  } else if (b.lifeTheme === 'Unfair Pain & Betrayal' || b.lifeTheme === 'Family & Conflict Resolution') {
    category = 'Restoration After Failure';
  }

  return {
    id: b.id,
    reference: b.anchorScripture.reference,
    translation: 'BSB',
    text: b.anchorScripture.canonicalText,
    plainEnglishSummary: b.anchorScripture.streetTranslation,
    category,
    difficulty: 'Core',
    keyTakeaway: b.anchorScripture.takeaway,
    heroName: `${b.name} (Canon Codex)`,
    storyTitle: b.codename
  };
});

/**
 * All available verses (Core arsenal + all story unlocked scriptures + Proverbs Codex + Psalms Field Medic + 66 Canon Books)
 */
export const ALL_AVAILABLE_VERSES: MemoryVerse[] = [
  ...MEMORY_VERSES,
  ...STORY_MEMORY_VERSES,
  ...PROVERB_MEMORY_VERSES,
  ...PSALM_MEMORY_VERSES,
  ...CANON_MEMORY_VERSES
];

/**
 * Returns all verses combined
 */
export const getAllVerses = (): MemoryVerse[] => {
  return ALL_AVAILABLE_VERSES;
};

/**
 * Returns core verses
 */
export const getCoreVerses = (): MemoryVerse[] => {
  return MEMORY_VERSES;
};

/**
 * Returns story-derived verses
 */
export const getStoryVerses = (): MemoryVerse[] => {
  return STORY_MEMORY_VERSES;
};

/**
 * Look up a verse by its ID (handles both 'verse-1' and 'story-david-act-1' or raw 'david-act-1')
 */
export const getVerseById = (id?: string | null): MemoryVerse | null => {
  if (!id) return null;
  
  // Exact match
  const match = ALL_AVAILABLE_VERSES.find(v => v.id === id);
  if (match) return match;

  // Check if stripped of 'story-' prefix
  const storyMatch = ALL_AVAILABLE_VERSES.find(v => v.id === `story-${id}` || v.actId === id);
  if (storyMatch) return storyMatch;

  // Fallback to reference match
  const refMatch = ALL_AVAILABLE_VERSES.find(v => v.reference.toLowerCase() === id.toLowerCase());
  return refMatch || null;
};

/**
 * Retrieve the memory verse associated with a specific story quest and act
 */
export const getStoryVerseForAct = (questId: string, actId: string): MemoryVerse | null => {
  return STORY_MEMORY_VERSES.find(v => v.storyQuestId === questId && v.actId === actId) || null;
};
