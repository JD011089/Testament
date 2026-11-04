import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildNarrationSsml,
  spokenTextForCard,
  findNarrationClip,
  studioProfiles,
  STUDIO_VOICES,
  type NarrationManifest,
} from '../src/utils/narrationScript';
import type { NarratorProfile } from '../src/utils/audio';

const ROOT = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const stories: { id: string; cards: { type: string; text?: string; scriptureLine?: { text: string } }[] }[] = [
  read('src/content/stories/david-and-goliath.json'),
  ...read('src/content/stories/rotation.json'),
];
const manifest: NarrationManifest = read('src/content/stories/narration-manifest.json');
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

  test('every recorded clip exists and matches the current story text', () => {
    for (const story of stories) {
      const cards = manifest[story.id] ?? {};
      for (const [idx, byProfile] of Object.entries(cards)) {
        for (const [profile, clip] of Object.entries(byProfile)) {
          const card = story.cards[Number(idx)];
          const ssml = card ? buildNarrationSsml(card, profile as NarratorProfile) : null;
          expect(ssml, `${story.id} card ${idx} is no longer narrated; run npm run narration`).not.toBeNull();
          expect(clip!.hash, `${story.id} card ${idx} (${profile}) text changed; run npm run narration`).toBe(hash(ssml!));
          expect(existsSync(join(ROOT, 'public', clip!.url)), `missing file ${clip!.url}`).toBe(true);
        }
      }
    }
  });

  test('a narrator with any recordings has every narrated card recorded', () => {
    for (const profile of studioProfiles(manifest)) {
      for (const story of stories) {
        story.cards.forEach((card, idx) => {
          if (card.type !== 'narration') return;
          expect(findNarrationClip(manifest, story.id, idx, profile), `${profile}: ${story.id} card ${idx} not recorded`).not.toBeNull();
        });
      }
    }
  });
});
