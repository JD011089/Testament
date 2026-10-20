/** Illustrated tap-reveal stages, one per story that asks the reader to tap pieces in. */
export const STORY_SCENE_IDS = [
  'creation',
  'noah',
  'abrahams-call',
  'joseph',
  'moses-burning-bush',
  'red-sea',
  'ruth',
  'david-and-goliath',
  'elijah-carmel',
  'elijah-still-small-voice',
  'daniel-lions-den',
  'jonah',
  'esther',
  'birth-of-jesus',
  'jesus-calms-the-storm',
  'feeding-the-5000',
  'peter-walks-on-water',
  'prodigal-son',
  'good-samaritan',
  'zacchaeus',
  'the-cross',
  'the-resurrection',
  'pentecost',
  'road-to-damascus'
] as const;

export type StorySceneId = (typeof STORY_SCENE_IDS)[number];

/** Reveal ids each scene knows how to draw. Kept in step with the story JSON. */
export const SCENE_REVEAL_IDS: Record<StorySceneId, readonly string[]> = {
  creation: ['light', 'sky', 'land', 'life'],
  noah: ['ship', 'animals', 'people'],
  'abrahams-call': ['country', 'relatives', 'house'],
  joseph: ['pit', 'sale', 'egypt'],
  'moses-burning-bush': ['pharaoh', 'people', 'name'],
  'red-sea': ['hand', 'wind', 'path'],
  ruth: ['go', 'people', 'god'],
  'david-and-goliath': ['helmet', 'coat', 'legs', 'javelin', 'spear'],
  'elijah-carmel': ['offering', 'wood', 'stones', 'water'],
  'elijah-still-small-voice': ['wind', 'quake', 'fire', 'voice'],
  'daniel-lions-den': ['windows', 'jerusalem', 'times'],
  jonah: ['joppa', 'ship', 'tarshish'],
  esther: ['gather', 'fast', 'king'],
  'birth-of-jesus': ['fear', 'news', 'joy', 'savior'],
  'jesus-calms-the-storm': ['wind', 'sea'],
  'feeding-the-5000': ['thanks', 'loaves', 'fish', 'enough'],
  'peter-walks-on-water': ['wind', 'fear', 'sink'],
  'prodigal-son': ['saw', 'ran', 'kiss'],
  'good-samaritan': ['near', 'saw', 'mercy'],
  zacchaeus: ['half', 'restore'],
  'the-cross': ['words', 'head', 'spirit'],
  'the-resurrection': ['early', 'stone', 'empty'],
  pentecost: ['sound', 'filled', 'speak'],
  'road-to-damascus': ['voice', 'scales', 'sight', 'baptism']
};

export function isStorySceneId(value: unknown): value is StorySceneId {
  return typeof value === 'string' && (STORY_SCENE_IDS as readonly string[]).includes(value);
}
