/**
 * Records studio narration for every story with Azure Speech.
 *
 *   npm run narration                       record anything missing or changed
 *   npm run narration -- --dry-run          show what would be recorded (no key needed)
 *   npm run narration -- --voice cinematic  one narrator only
 *   npm run narration -- --story jonah      one story only
 *   npm run narration -- --redo jonah:0     re-record one card (story:cardIndex)
 *
 * Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env (never committed).
 * Writes public/audio/narration/<story>/<card>-<voice>-<hash>.mp3 and
 * src/content/stories/narration-manifest.json, then a review page at
 * scripts/narration/review.html (open it with the dev server running).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NarratorProfile } from '../../src/utils/audio.ts';
import {
  STUDIO_VOICES,
  buildNarrationSsml,
  narrationTextForCard,
  type NarrationManifest,
} from '../../src/utils/narrationScript.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STORIES_DIR = join(ROOT, 'src', 'content', 'stories');
const MANIFEST_PATH = join(STORIES_DIR, 'narration-manifest.json');
const AUDIO_DIR = join(ROOT, 'public', 'audio', 'narration');
const REVIEW_PATH = join(ROOT, 'scripts', 'narration', 'review.html');

// 48 kbps constant bitrate mono: clear speech, small files, easy duration math.
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const BYTES_PER_SEC = 48000 / 8;
// The free tier allows 20 requests a minute.
const MIN_GAP_MS = 3200;

interface Card { type: string; text?: string; scriptureLine?: { ref?: string; text: string } }
interface StoryJson { id: string; title: string; cards: Card[] }

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of ['.env', '.env.local']) {
    const p = join(ROOT, file);
    if (!existsSync(p)) continue;
    for (const raw of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = raw.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...out, ...process.env } as Record<string, string>;
}

function loadStories(): StoryJson[] {
  const read = (f: string) => JSON.parse(readFileSync(join(STORIES_DIR, f), 'utf8'));
  return [read('david-and-goliath.json'), ...(read('rotation.json') as StoryJson[])];
}

function clipHash(ssml: string): string {
  return createHash('sha1').update(ssml).digest('hex').slice(0, 10);
}

function parseArgs(argv: string[]) {
  const args = { dryRun: false, voices: [] as NarratorProfile[], stories: [] as string[], redo: [] as string[] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--voice') args.voices.push(argv[++i] as NarratorProfile);
    else if (a === '--story') args.stories.push(argv[++i]);
    else if (a === '--redo') args.redo.push(argv[++i]);
  }
  return args;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function synthesize(ssml: string, key: string, region: string): Promise<Buffer> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'testament-narration',
      },
      body: ssml,
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) {
      const wait = 5000 * attempt;
      console.warn(`  Azure busy (${res.status}), retrying in ${wait / 1000}s…`);
      await sleep(wait);
      continue;
    }
    const detail = await res.text().catch(() => '');
    if (res.status === 401) throw new Error('Azure rejected the key (401). Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.');
    throw new Error(`Azure error ${res.status}: ${detail.slice(0, 300)}`);
  }
  throw new Error('Azure kept refusing requests; try again in a few minutes.');
}

function writeReview(stories: StoryJson[], manifest: NarrationManifest) {
  const rows: string[] = [];
  for (const story of stories) {
    story.cards.forEach((card, idx) => {
      const parts = narrationTextForCard(card);
      const clips = manifest[story.id]?.[String(idx)];
      if (!parts || !clips) return;
      const players = Object.entries(clips)
        .map(([p, clip]) => `<div class="p"><b>${p}</b><audio controls preload="none" src="${clip!.url}"></audio><code>npm run narration -- --voice ${p} --redo ${story.id}:${idx}</code></div>`)
        .join('');
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      rows.push(`<tr><td><b>${esc(story.title)}</b><br><small>card ${idx}</small></td><td>${esc(parts.line)}${parts.scripture ? `<blockquote>${esc(parts.scripture)}</blockquote>` : ''}</td><td>${players}</td></tr>`);
    });
  }
  writeFileSync(REVIEW_PATH, `<!DOCTYPE html><meta charset="utf-8"><title>Narration review</title>
<style>body{font-family:system-ui;margin:24px;color:#121A2E}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ddd;padding:10px;vertical-align:top}blockquote{margin:6px 0 0;color:#555;font-style:italic}.p{margin-bottom:8px}.p b{display:inline-block;width:80px}audio{vertical-align:middle;height:32px}code{display:block;font-size:11px;color:#777;margin-top:2px;user-select:all}</style>
<h1>Narration review</h1><p>Listen to each clip. To re-record one, run the command under it (copy with a click).</p><table>${rows.join('')}</table>`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const key = env.AZURE_SPEECH_KEY;
  const region = env.AZURE_SPEECH_REGION;
  const stories = loadStories().filter((s) => args.stories.length === 0 || args.stories.includes(s.id));
  const voices = (args.voices.length ? args.voices : (Object.keys(STUDIO_VOICES) as NarratorProfile[]))
    .filter((v) => STUDIO_VOICES[v]);
  const manifest: NarrationManifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
  const redo = new Set(args.redo);

  type Job = { story: StoryJson; idx: number; profile: NarratorProfile; ssml: string; hash: string };
  const jobs: Job[] = [];
  let chars = 0;
  for (const story of stories) {
    story.cards.forEach((card, idx) => {
      for (const profile of voices) {
        const ssml = buildNarrationSsml(card, profile);
        if (!ssml) continue;
        const hash = clipHash(ssml);
        const existing = manifest[story.id]?.[String(idx)]?.[profile];
        const fileOk = existing && existsSync(join(ROOT, 'public', existing.url));
        if (existing?.hash === hash && fileOk && !redo.has(`${story.id}:${idx}`)) continue;
        jobs.push({ story, idx, profile, ssml, hash });
        chars += ssml.replace(/<[^>]+>/g, '').length;
      }
    });
  }

  console.log(`${jobs.length} clip(s) to record, about ${chars.toLocaleString()} characters (Azure free tier: 500,000/month).`);
  if (args.dryRun || jobs.length === 0) {
    for (const j of jobs.slice(0, 40)) console.log(`  ${j.profile.padEnd(10)} ${j.story.id}:${j.idx}`);
    if (jobs.length === 0) writeReview(loadStories(), manifest);
    return;
  }
  if (!key || !region) {
    console.error('Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION in .env. See docs/studio-narration-plan.md.');
    process.exit(1);
  }

  let last = 0;
  for (const [n, job] of jobs.entries()) {
    const wait = last + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    console.log(`[${n + 1}/${jobs.length}] ${job.profile} · ${job.story.id} card ${job.idx}`);
    const audio = await synthesize(job.ssml, key, region);

    const dir = join(AUDIO_DIR, job.story.id);
    mkdirSync(dir, { recursive: true });
    // Remove older takes of this card/voice.
    const prefix = `${job.idx}-${job.profile}-`;
    for (const f of readdirSync(dir)) if (f.startsWith(prefix)) unlinkSync(join(dir, f));
    const fileName = `${prefix}${job.hash}.mp3`;
    writeFileSync(join(dir, fileName), audio);

    manifest[job.story.id] ??= {};
    manifest[job.story.id][String(job.idx)] ??= {};
    manifest[job.story.id][String(job.idx)][job.profile] = {
      url: `/audio/narration/${job.story.id}/${fileName}`,
      durationSec: Math.round((audio.length / BYTES_PER_SEC) * 10) / 10,
      hash: job.hash,
    };
    // Save after every clip so an interrupted run keeps its progress.
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  }

  writeReview(loadStories(), manifest);
  console.log(`Done. Review: restart npm run dev (it only sees new audio files after a restart), then open http://localhost:5173/scripts/narration/review.html`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
