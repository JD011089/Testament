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
 * Explicit theme -> category mapping for the Proverbs Codex. Every known
 * scenario is listed so nothing silently falls into a catch-all bucket.
 */
export const PROVERB_CATEGORY_BY_SCENARIO: Record<string, MemoryVerse['category']> = {
  'money-debt': 'Anger & Self-Control',
  'ego-criticism': 'Anger & Self-Control',
  'tongue-conflict': 'Anger & Self-Control',
  'sluggard-work': 'Courage & Facing Giants',
  'toxic-allies': 'Endurance & Brotherhood',
};

/**
 * Maps Proverbs Tactical Codex entries into MemoryVerse format
 */
export const PROVERB_MEMORY_VERSES: MemoryVerse[] = PROVERB_SCENARIOS.map((p) => {
  const category = PROVERB_CATEGORY_BY_SCENARIO[p.category] ?? 'Endurance & Brotherhood';

  return {
    id: p.id,
    reference: p.reference,
    translation: 'Plain English',
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
    translation: 'Plain English',
    text: ps.formalText,
    plainEnglishSummary: ps.streetTranslation,
    category,
    difficulty: 'Core',
    keyTakeaway: ps.keyTakeaway,
    heroName: /sons of korah/i.test(ps.caveBackstory)
      ? 'Sons of Korah'
      : 'David (Psalms Field Medic)',
    storyTitle: ps.title
  };
});

/**
 * Explicit life-theme -> category mapping for the Canon Codex, so the 66 books
 * no longer share one catch-all theme.
 */
export const CANON_CATEGORY_BY_THEME: Record<string, MemoryVerse['category']> = {
  'Anxiety & Fear': 'Pressure & Anxiety',
  'Burnout & Meaning': 'Pressure & Anxiety',
  'Courage Under Fire': 'Courage & Facing Giants',
  'Action Over Cheap Talk': 'Courage & Facing Giants',
  'Workplace & Career Pressure': 'Anger & Self-Control',
  'Integrity in Toxic Cultures': 'Anger & Self-Control',
  'Unfair Pain & Betrayal': 'Restoration After Failure',
  'Family & Conflict Resolution': 'Restoration After Failure',
};

/**
 * Maps all 66 Canon Codex books' anchor scriptures into MemoryVerse format
 */
export const CANON_MEMORY_VERSES: MemoryVerse[] = CANON_BOOKS.map((b) => {
  const category = CANON_CATEGORY_BY_THEME[b.lifeTheme] ?? 'Endurance & Brotherhood';

  return {
    id: b.id,
    reference: b.anchorScripture.reference,
    translation: 'Plain English',
    text: b.anchorScripture.canonicalText,
    plainEnglishSummary: b.anchorScripture.streetTranslation,
    category,
    difficulty: 'Core',
    keyTakeaway: b.anchorScripture.takeaway,
    heroName: `${b.name} (Canon Codex)`,
    storyTitle: b.codename
  };
});

import { getLocalizedVerse } from './localizedScripture';
import { getStoredLanguage, type SupportedLanguage } from '../context/LanguageContext';
import { canonicalVerseKey, isVerseKey, verseCanonicalKey } from './verseKey';

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
 * Returns all verses combined, localized into the selected language
 */
export const getAllVerses = (lang?: SupportedLanguage): MemoryVerse[] => {
  hydrateCustomVerses();
  const activeLang = lang ?? getStoredLanguage();
  return ALL_AVAILABLE_VERSES.map(v => getLocalizedVerse(v, activeLang));
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
/**
 * Normalize a reference or ID into a clean canonical slug for matching
 * e.g. "1 Kings 19:12" -> "1-kings-19-12"
 */
export const normalizeVerseSlug = (refOrId: string): string => {
  return refOrId.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

/**
 * Look up a verse by its ID or scripture reference
 * Handles:
 * - Direct IDs ('verse-1', 'story-david-journey', 'david-act-1')
 * - Exact and normalized references ('1 Kings 19:12', '1-kings-19-12')
 * - Dynamic custom verses
 */
export const getVerseById = (id?: string | null, lang?: SupportedLanguage): MemoryVerse | null => {
  if (!id) return null;
  hydrateCustomVerses();
  const activeLang = lang ?? getStoredLanguage();
  const cleanTarget = id.trim().toLowerCase();
  const targetSlug = normalizeVerseSlug(id);
  const targetKey = isVerseKey(id) ? id.trim().toUpperCase() : canonicalVerseKey(id);

  // 0. Canonical verse key match ("1KI.19.12"). This is the single source of
  //    truth for cross-surface lookups so a mission reference always resolves
  //    to the exact verse the mission cites.
  if (targetKey) {
    const keyMatch = ALL_AVAILABLE_VERSES.find(v => verseCanonicalKey(v) === targetKey);
    if (keyMatch) return getLocalizedVerse(keyMatch, activeLang);
  }

  // 1. Exact ID match
  const match = ALL_AVAILABLE_VERSES.find(v => v.id.toLowerCase() === cleanTarget);
  if (match) return getLocalizedVerse(match, activeLang);

  // 2. Reference match (exact or case-insensitive)
  const refMatch = ALL_AVAILABLE_VERSES.find(v => 
    v.reference.toLowerCase() === cleanTarget ||
    normalizeVerseSlug(v.reference) === targetSlug
  );
  if (refMatch) return getLocalizedVerse(refMatch, activeLang);

  // 3. Slug match on ID
  const slugMatch = ALL_AVAILABLE_VERSES.find(v => normalizeVerseSlug(v.id) === targetSlug);
  if (slugMatch) return getLocalizedVerse(slugMatch, activeLang);

  // 4. Check if stripped of 'story-' prefix or exact quest match
  const storyMatch = ALL_AVAILABLE_VERSES.find(v => 
    v.id.toLowerCase() === `story-${cleanTarget}` || 
    v.storyQuestId?.toLowerCase() === cleanTarget ||
    `story-${v.storyQuestId?.toLowerCase()}` === cleanTarget ||
    v.actId?.toLowerCase() === cleanTarget
  );
  if (storyMatch) return getLocalizedVerse(storyMatch, activeLang);

  // 5. Resolve legacy act IDs (e.g. 'story-david-act-1' or 'david-act-1') to the quest's one memory verse
  const parentQuest = STORY_QUESTS.find(q => 
    q.acts.some(a => a.id.toLowerCase() === cleanTarget || `story-${a.id.toLowerCase()}` === cleanTarget) ||
    cleanTarget.startsWith(`story-${q.id.replace('-journey', '').toLowerCase()}`) ||
    cleanTarget.startsWith(q.id.replace('-journey', '').toLowerCase())
  );
  if (parentQuest) {
    const questVerse = STORY_MEMORY_VERSES.find(v => v.storyQuestId === parentQuest.id);
    if (questVerse) return getLocalizedVerse(questVerse, activeLang);
  }

  return null;
};

/**
 * Retrieve the single memory verse associated with a specific story quest
 */
export const getStoryVerseForQuest = (questId: string, lang?: SupportedLanguage): MemoryVerse | null => {
  const activeLang = lang ?? getStoredLanguage();
  const found = STORY_MEMORY_VERSES.find(v => v.storyQuestId === questId || v.id === `story-${questId}`) || null;
  return found ? getLocalizedVerse(found, activeLang) : null;
};

/**
 * Retrieve the memory verse associated with a specific story quest and act
 * (Always returns the ONE defining memory verse of the quest, satisfying requirement 1)
 */
export const getStoryVerseForAct = (questId: string, _actId?: string, lang?: SupportedLanguage): MemoryVerse | null => {
  return getStoryVerseForQuest(questId, lang) || (STORY_MEMORY_VERSES.find(v => v.storyQuestId === questId) ? getLocalizedVerse(STORY_MEMORY_VERSES.find(v => v.storyQuestId === questId)!, lang ?? getStoredLanguage()) : null);
};

/**
 * Register any dynamic Bible verse selected from the full chapter reader or daily mission
 * so it can be practiced immediately in Practice and saved in Arsenal
 */
export const registerDynamicBibleVerse = (reference: string, text: string, translation: string = 'WEB'): MemoryVerse => {
  const cleanId = `custom-bible-${normalizeVerseSlug(reference)}`;
  const refKey = canonicalVerseKey(reference);
  const existing = ALL_AVAILABLE_VERSES.find(v =>
    v.id === cleanId ||
    v.reference.toLowerCase() === reference.toLowerCase() ||
    normalizeVerseSlug(v.reference) === normalizeVerseSlug(reference) ||
    (refKey !== null && verseCanonicalKey(v) === refKey)
  );
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
