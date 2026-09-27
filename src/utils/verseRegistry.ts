import { MEMORY_VERSES } from '../data/verses';
import { STORY_QUESTS } from '../data/stories';
import { PROVERB_SCENARIOS } from '../data/proverbs';
import { PSALM_PRESCRIPTIONS } from '../data/psalms';
import { CANON_BOOKS } from '../data/canon';
import type { MemoryVerse } from '../types';

/**
 * Maps each Story Quest into ONE definitive MemoryVerse for the entire quest.
 * (Requirement 1: One memory verse should apply to the quest no matter how many acts)
 */
export const STORY_MEMORY_VERSES: MemoryVerse[] = STORY_QUESTS.map((quest) => {
  // Use quest's primary anchor scripture (Act 1's unlocked scripture) as the definitive memory verse
  const primaryAct = quest.acts[0];

  // Determine the most fitting category
  let category: MemoryVerse['category'] = 'Courage & Facing Giants';
  if (quest.id === 'peter-journey' || quest.id === 'joseph-journey' || quest.id === 'ruth-journey') {
    category = 'Restoration After Failure';
  } else if (quest.id === 'paul-journey' || quest.id === 'nehemiah-journey' || quest.id === 'joshua-journey') {
    category = 'Endurance & Brotherhood';
  } else if (quest.id === 'moses-journey' || quest.id === 'elijah-journey' || quest.id === 'jonah-journey' || quest.id === 'john-baptist-journey') {
    category = 'Pressure & Anxiety';
  } else if (quest.id === 'daniel-journey' || quest.id === 'esther-journey') {
    category = 'Anger & Self-Control';
  }

  return {
    id: `story-${quest.id}`,
    reference: primaryAct.unlockedScripture.reference,
    translation: primaryAct.unlockedScripture.translation.split('/')[0].trim(),
    text: primaryAct.unlockedScripture.text,
    plainEnglishSummary: primaryAct.realTalkTakeaway.practicalLesson,
    category,
    difficulty: 'Core',
    keyTakeaway: primaryAct.realTalkTakeaway.dailyAction,
    storyQuestId: quest.id,
    storyTitle: quest.title,
    heroName: quest.heroName,
    actId: primaryAct.id,
    actTitle: primaryAct.actTitle
  };
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
  hydrateCustomVerses();
  return ALL_AVAILABLE_VERSES;
};

const CUSTOM_VERSES_KEY = 'testament_custom_verses';

function hydrateCustomVerses(): void {
  try {
    const raw = localStorage.getItem(CUSTOM_VERSES_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return;
    for (const verse of parsed) {
      if (!verse || typeof verse !== 'object' || typeof (verse as MemoryVerse).id !== 'string') continue;
      const candidate = verse as MemoryVerse;
      if (!ALL_AVAILABLE_VERSES.some((item) => item.id === candidate.id)) {
        ALL_AVAILABLE_VERSES.push(candidate);
      }
    }
  } catch {
    // ignore corrupt custom verse lists
  }
}

function persistCustomVerse(verse: MemoryVerse): void {
  try {
    const raw = localStorage.getItem(CUSTOM_VERSES_KEY);
    const parsed = raw ? JSON.parse(raw) as unknown : [];
    const list = Array.isArray(parsed) ? parsed as MemoryVerse[] : [];
    if (!list.some((item) => item.id === verse.id)) {
      list.push(verse);
      localStorage.setItem(CUSTOM_VERSES_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore quota failures
  }
}

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
 * Look up a verse by its ID (handles 'verse-1', 'story-david-journey', legacy 'story-david-act-1', 'david-act-1', etc.)
 */
export const getVerseById = (id?: string | null): MemoryVerse | null => {
  if (!id) return null;
  hydrateCustomVerses();
  
  // Exact match
  const match = ALL_AVAILABLE_VERSES.find(v => v.id === id);
  if (match) return match;

  // Check if stripped of 'story-' prefix or exact quest match
  const storyMatch = ALL_AVAILABLE_VERSES.find(v => 
    v.id === `story-${id}` || 
    v.storyQuestId === id ||
    `story-${v.storyQuestId}` === id ||
    v.actId === id
  );
  if (storyMatch) return storyMatch;

  // Resolve legacy act IDs (e.g. 'story-david-act-1' or 'david-act-1') to the quest's one memory verse
  const parentQuest = STORY_QUESTS.find(q => 
    q.acts.some(a => a.id === id || `story-${a.id}` === id) ||
    id.startsWith(`story-${q.id.replace('-journey', '')}`) ||
    id.startsWith(q.id.replace('-journey', ''))
  );
  if (parentQuest) {
    const questVerse = STORY_MEMORY_VERSES.find(v => v.storyQuestId === parentQuest.id);
    if (questVerse) return questVerse;
  }

  // Fallback to reference match
  const refMatch = ALL_AVAILABLE_VERSES.find(v => v.reference.toLowerCase() === id.toLowerCase());
  return refMatch || null;
};

/**
 * Retrieve the single memory verse associated with a specific story quest
 */
export const getStoryVerseForQuest = (questId: string): MemoryVerse | null => {
  return STORY_MEMORY_VERSES.find(v => v.storyQuestId === questId || v.id === `story-${questId}`) || null;
};

/**
 * Retrieve the memory verse associated with a specific story quest and act
 * (Always returns the ONE defining memory verse of the quest, satisfying requirement 1)
 */
export const getStoryVerseForAct = (questId: string, _actId?: string): MemoryVerse | null => {
  return getStoryVerseForQuest(questId) || STORY_MEMORY_VERSES.find(v => v.storyQuestId === questId) || null;
};

/**
 * Register any dynamic Bible verse selected from the full chapter reader
 * so it can be practiced immediately in Word Forge and saved in Arsenal
 */
export const registerDynamicBibleVerse = (reference: string, text: string, translation: string = 'CSB'): MemoryVerse => {
  const cleanId = `custom-bible-${reference.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const existing = ALL_AVAILABLE_VERSES.find(v => v.id === cleanId || v.reference.toLowerCase() === reference.toLowerCase());
  if (existing) return existing;

  const newVerse: MemoryVerse = {
    id: cleanId,
    reference,
    translation,
    text,
    plainEnglishSummary: `Meditate on and internalize ${reference} from the Scriptures.`,
    category: 'Courage & Facing Giants',
    difficulty: 'Core',
    keyTakeaway: `Anchor this truth in your memory and apply it to today's trials.`
  };

  ALL_AVAILABLE_VERSES.push(newVerse);
  persistCustomVerse(newVerse);
  return newVerse;
};
