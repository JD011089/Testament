import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildNarrationSsml,
  spokenTextForCard,
  findNarrationClip,
  studioProfiles,
  STUDIO_VOICES,
  type NarrationManifest,
} from '../src/utils/narrationScript';
import { narrationUnitsForStory } from '../src/utils/storySequence';
import { STORIES } from '../src/content/stories';
import manifestRaw from '../src/content/stories/narration-manifest.json' with { type: 'json' };
import type { NarratorProfile } from '../src/utils/audio';

const ROOT = process.cwd();
const manifest = manifestRaw as NarrationManifest;
const hash = (ssml: string) => createHash('sha1').update(ssml).digest('hex').slice(0, 10);

test.describe('Studio narration', () => {
  test('SSML reads the narrator line, pauses, then the scripture, with fixed pronunciations', () => {
    const ssml = buildNarrationSsml(
      { type: 'narration', text: 'Elijah faced the prophets of Baal & waited.', scriptureLine: { text: 'Yahweh, he is God!' } },
      'cinematic'
    )!;
    expect(ssml).toContain(`<voice name="${STUDIO_VOICES.cinematic!.azureVoice}">`);
    expect(ssml).toContain('<sub alias="Bay-ul">Baal</sub>');
    expect(ssml).toContain('<sub alias="Yahway">Yahweh</sub>');
    expect(ssml).toContain('&amp;');
    expect(ssml).toMatch(/waited\.<break time="\d+ms"\/>/);
  });

  test('only narration cards and studio narrators produce SSML', () => {
    expect(buildNarrationSsml({ type: 'choice' }, 'cinematic')).toBeNull();
    expect(buildNarrationSsml({ type: 'narration', text: 'Hi.' }, 'scholar')).toBeNull();
  });

  test('device voice speaks the narrator line and the scripture', () => {
    expect(spokenTextForCard({ type: 'narration', text: 'He stood.', scriptureLine: { text: 'Read 1 Kings 18:21.' } }))
      .toBe('He stood. Read First Kings eighteen, verse twenty-one.');
  });

  test('every recorded clip exists, is a known unit, and matches the current text', () => {
    for (const story of STORIES) {
      const units = new Map(narrationUnitsForStory(story).map((u) => [u.key, u.card]));
      for (const [key, byProfile] of Object.entries(manifest[story.id] ?? {})) {
        const card = units.get(key);
        expect(card, `${story.id} clip "${key}" no longer matches a narrated card; run npm run narration`).toBeDefined();
        for (const [profile, clip] of Object.entries(byProfile)) {
          const ssml = buildNarrationSsml(card!, profile as NarratorProfile);
          expect(ssml, `${story.id} "${key}" is no longer narrated for ${profile}`).not.toBeNull();
          expect(clip!.hash, `${story.id} "${key}" (${profile}) text changed; run npm run narration`).toBe(hash(ssml!));
          expect(existsSync(join(ROOT, 'public', clip!.url)), `missing file ${clip!.url}`).toBe(true);
        }
      }
    }
  });

  test('a narrator with any recordings has every narrated unit recorded', () => {
    for (const profile of studioProfiles(manifest)) {
      for (const story of STORIES) {
        for (const { key } of narrationUnitsForStory(story)) {
          expect(findNarrationClip(manifest, story.id, key, profile), `${profile}: ${story.id} "${key}" not recorded`).not.toBeNull();
        }
      }
    }
  });
});
