/** Full-frame artwork for story covers and reveal scenes. */
const SPECIAL_ILLUSTRATIONS: Record<string, string> = {
  creation: '/images/stories/creation-3.jpg',
  'david-and-goliath': '/images/valley_battlefield-1376.webp'
};

export function getStoryIllustrationUrl(storyId: string): string {
  return SPECIAL_ILLUSTRATIONS[storyId] ?? `/images/stories/${storyId}.jpg`;
}
