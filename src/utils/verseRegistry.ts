import { MEMORY_VERSES } from '../data/verses';
import { STORY_QUESTS } from '../data/stories';
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
 * All available verses (Core arsenal + all story unlocked scriptures)
 */
export const ALL_AVAILABLE_VERSES: MemoryVerse[] = [
  ...MEMORY_VERSES,
  ...STORY_MEMORY_VERSES
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
