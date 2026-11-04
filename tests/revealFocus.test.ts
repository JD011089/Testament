import { test, expect } from '@playwright/test';
import { STORIES } from '../src/content/stories';
import revealFocus from '../src/components/story/revealFocus.json' with { type: 'json' };

const FOCUS = revealFocus as Record<string, Record<string, { x: number; y: number; zoom?: number }>>;

test('every tap-reveal step has a focus point on its story picture', () => {
  const missing: string[] = [];
  for (const story of STORIES) {
    for (const card of story.cards) {
      if (card.type !== 'interaction' || card.kind !== 'tap-reveal') continue;
      const config = card.config as { scene?: string; reveals: { id: string }[] };
      if (!config.scene) continue;
      for (const reveal of config.reveals) {
        if (!FOCUS[config.scene]?.[reveal.id]) missing.push(`${config.scene}.${reveal.id}`);
      }
    }
  }
  expect(missing).toEqual([]);
});

test('focus points sit inside the picture with a sensible zoom', () => {
  const bad: string[] = [];
  for (const [scene, steps] of Object.entries(FOCUS)) {
    for (const [id, f] of Object.entries(steps)) {
      if (f.x < 0 || f.x > 100 || f.y < 0 || f.y > 100 || (f.zoom ?? 1.5) < 1 || (f.zoom ?? 1.5) > 3) bad.push(`${scene}.${id}`);
    }
  }
  expect(bad).toEqual([]);
});
