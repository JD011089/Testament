# Studio-quality narration — plan

> **Status:** Provider chosen: **Azure Speech (free tier)**. Phase 1 pipeline is built
> (`npm run narration`); audio is recorded once an Azure key is added.
>
> **Recording the stories**
> 1. In the Azure portal, create a **Speech** resource on the **Free F0** tier
>    (any region, e.g. East US). Under *Keys and Endpoint*, copy **Key 1** and the
>    **Location/Region**.
> 2. Add to `.env` (never committed):
>    `AZURE_SPEECH_KEY=...` and `AZURE_SPEECH_REGION=eastus`
> 3. `npm run narration` — records 54 clips (Cinematic = Andrew, Grace & Peace = Ava),
>    about 11,000 characters, ~3 minutes because of the free tier's rate limit.
> 4. Restart `npm run dev`, open `http://localhost:5173/scripts/narration/review.html`,
>    and listen. Re-record a line with the command shown under it. Change a voice
>    or speed in `src/utils/narrationScript.ts` (`STUDIO_VOICES`), or a name's
>    pronunciation in `PRONUNCIATIONS`, then run `npm run narration` again; only
>    changed lines are re-recorded.
> 5. Commit `public/audio/narration/` and `src/content/stories/narration-manifest.json`.
>    Tests fail if a story's text changes without re-recording.

**Goal:** every story sounds like a professional narrator on every device, including
Chrome on Windows where device voices are robotic. Device voices stay as the
fallback for anything without a recording.

## Where we are today

| Surface | What plays now | Notes |
|---|---|---|
| Story Swipes (Today, Journey) — 24 stories | Device voice, narration cards only | The player never uses recorded audio, even though `NarrationCard` already has an unused `audio?` field. |
| Old "journey" acts | 18 recorded MP3s (3.1 MB) | Only used with the Cinematic narrator. |
| Bible tab (chapter + verse playback) | Device voice | Any translation, English/Spanish/French. |
| Dashboard briefs, dilemmas, Word Forge, Drive Mode, verse taps | Device voice | Text is built on the fly, so it can't be pre-recorded. |

Offline caching already covers `/audio/*` (CacheFirst, `testament-audio`), so new
clips will work offline after first play with no service worker changes.

## How big the job is

- **Stories:** 24 stories, about **18,000 characters** of card text in total per voice
  (narration, scripture lines, choice prompts and "what happened", payoff verses).
  Roughly 20–25 minutes of audio per voice, ~4–5 MB as 64 kbps mono MP3.
- Stories are English-only today (only the teasers are translated), so Spanish and
  French audio waits until the stories themselves are translated.
- **Whole Bible (WEB):** about 4.3 million characters. Too big to generate with AI
  voices cheaply, but free human recordings exist (see Phase 2).

## Provider options (prices from third-party roundups, Nov 2026 — confirm before buying)

| Provider | Quality for storytelling | Cost for all stories, 1 voice | Notes |
|---|---|---|---|
| **ElevenLabs** (recommended) | Best: expressive, dramatic, natural breaths | ~$1.50 per pass (~$0.08 / 1k chars); budget ~$10–25 with retakes | Needs a paid plan for commercial use; pronunciation dictionaries supported. |
| Azure Neural / HD voices | Very good, a bit more "newsreader" | Free tier (0.5M chars/month) covers it | SSML gives precise control of pauses and pronunciation; same voice family as Edge's "Natural" voices. |
| OpenAI gpt-4o-mini-tts | Good, steerable with instructions ("warm storyteller") | Under $1 | Fewer voices; less control over pronunciation. |

Recommendation: **ElevenLabs** for stories. The volume is so small that cost is
not the deciding factor; how the stories sound is.

## Phase 1 — Recorded narration for all 24 stories (main win)

1. **Script builder.** `scripts/narration/build-scripts.mjs` turns each story into a
   list of spoken lines per card (narration text, scripture line, choice prompt,
   "what happened", payoff verse), using the same `normalizeScriptureForSpeech`
   the app uses ("First Kings eighteen, verse twenty-one", "Lord").
2. **Pronunciation list.** `scripts/narration/lexicon.json` for names voices get
   wrong: Yahweh, Goliath, Philistine, Zacchaeus, Baal, Carmel, Nebuchadnezzar,
   Darius, Mordecai, Boaz, Naomi, Pharaoh, Gethsemane, Golgotha, etc. Sent to the
   provider as a pronunciation dictionary.
3. **Generator.** `scripts/narration/generate.mjs` (run locally, never in the
   browser):
   - Reads the API key from `.env` (`NARRATION_API_KEY`); the key is never shipped.
   - Names each file by a hash of text + voice + model:
     `public/audio/narration/<story>/<card>-<voice>-<hash>.mp3`. Only changed lines
     are regenerated, so editing one sentence costs one line.
   - Normalizes loudness (ffmpeg `loudnorm`, -16 LUFS), trims silence, and exports
     64 kbps mono MP3 so every clip plays at the same volume.
   - Writes `src/content/stories/narration-manifest.json`:
     story → card → voice → `{ url, durationSec }`.
4. **Player.**
   - `StoryPlayer` looks up the card's clip in the manifest and passes it to
     `soundEngine.speakVerse(..., audioUrl)`.
   - `playAssetOrSpeech` accepts any manifest URL (replacing the hard-coded list
     and the "Cinematic only" check). Missing clip, wrong language or failed
     download → device voice, exactly as now.
   - Prefetch the next card's clip so there is no gap between cards.
   - The progress bar uses the real clip duration.
5. **Narrators.** Start with **one studio voice** (Cinematic) for all stories. Once
   approved, add Grace & Peace as a second. Grounded and Scholar keep device
   voices unless you want all four (each extra voice is another ~$2–5 and another
   listening pass). Settings marks narrators that have studio audio with a
   "Studio" badge.
6. **Review page.** A dev-only page (`/dev/narration`) lists every clip next to its
   text with play, approve and "redo" buttons. Redo marks the line so the
   generator re-records only that line.
7. **Tests.**
   - Every narration card in every story has a clip for the default voice.
   - Every manifest URL exists on disk.
   - Manifest text hashes match the current story text, so an edited story can't
     ship stale audio.

**Done when:** all 24 stories play studio narration end to end on Chrome/Windows,
iPhone and Android, offline after first play, and the tests above pass.

## Phase 2 — Human-read Bible chapters (free)

eBible.org hosts public-domain, human-narrated recordings of the World English
Bible, one MP3 per chapter (Winfred Henson; Michael Paul Johnson; LibriVox).

- When the reader is on **WEB, English**, the chapter "Listen" button plays the
  recording; other translations and languages keep device voices.
- Host the files ourselves (Cloudflare R2 or Vercel Blob) rather than linking to
  eBible.org, so playback doesn't depend on their server. Expect roughly
  1–2 GB for the whole Bible; check exact size and bitrate first.
- Single-verse playback stays device voice (the recordings are per chapter).
- Credit the narrator in the reader. "World English Bible" is an eBible.org
  trademark, so keep the name as is.

## Phase 3 — Optional: studio voice for on-the-fly text

Dashboard briefs, dilemmas and Word Forge build their text at runtime. Options:

- **Leave on device voices** (current; free).
- **On-demand studio voice:** a Vercel function calls the provider and caches the
  result by text hash, so each line is paid for once. It needs the API key on the
  server, a spending cap, and a per-user rate limit. Revisit only if those
  screens get heavy audio use.

## Decisions needed

1. **Provider:** ElevenLabs (recommended), Azure, or OpenAI.
2. **Narrators with studio audio:** Cinematic only to start (recommended), or all four.
3. **Phase 2:** go ahead with the human-read WEB Bible, and where to host it.

## Rough effort

- Phase 1: two working sessions (pipeline + player), plus your listening pass.
- Phase 2: one session, plus the upload.
- Phase 3: one session, only if wanted.
