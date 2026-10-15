# Story Swipes — 2.0 Redesign Plan

Branch: `feature/story-swipes`. Do not push to `main` or deploy.

Product goal: **play the story instead of reading it.** A ~3-minute daily session that
ends in a clear Done state. Keep the full Bible reader, simplify memory, turn Saved
into a collectible Deck.

This document lists the files to add, change, or delete, then the phase-by-phase
execution order. Build, lint, and tests run after each phase.

---

## Guiding constants (already present, keep)

- Daybreak is the default theme (`bg #F8F1E0`, gold `#D49D5F`, sky `#7FAAC6`,
  Vespers `#131722` / secondary text `#A89C86`).
- One primary button (`.btn-primary`, lit gold gradient, 48px), one secondary
  (`.btn-secondary`), one selected-state, one toast.
- 44x44px minimum tap targets; 16px page margin; 24px section gap; 4pt spacing.
- Type tokens `.text-title-1/2/3/4`, `.text-body`, `.text-small`, `.text-label`,
  `.text-ref`; radii 8/12/16/24/full.
- Scripture lines are gold + reference + translation; AI lines are labeled as AI.
- Haptic (`navigator.vibrate`) + short sound on every success, with a Settings toggle.

---

## Phase 1 — Critical fixes

### Files to ADD
- `src/utils/verseKey.ts` — single canonical verse key (`"1KI.19.12"`), OSIS-style book
  codes, `canonicalVerseKey(ref)`, `parseVerseKey(key)`, `resolveVerseKey(input)`.
- `src/data/bookVerseCounts.ts` — per-chapter verse counts (at least the books the app
  references) so invalid verses like `Romans 8:99` are rejected with a friendly message.
- `src/utils/celebrate.ts` — one wrapper for haptic + success sound (respects Settings).
- `src/utils/toast.ts` + `src/components/Toast.tsx` — one shared toast component/bus.
- `tests/verseKey.test.ts`, `tests/scriptureRef.test.ts`, `tests/bookmarks.test.ts` —
  canonical key resolver, reference parser (accept + reject), bookmark persistence.

### Files to CHANGE
- `src/utils/verseRegistry.ts` — `getVerseById` resolves via the canonical key first;
  register dynamic verses with the canonical key; never silently return a different verse.
- `src/utils/scriptureRef.ts` — validate book/chapter/verse; cross-book chapter nav
  helpers; friendly rejection.
- `src/components/WordForge.tsx` — when an explicit `targetVerseId` is supplied and cannot
  be resolved, show a "verse not found" state instead of falling back to `verse-1`
  (Joshua 1:9).
- `src/components/StoryViewer.tsx` — `handleSaveVerseCard` dispatches the resolved
  **id** (not the reference) so Saved is populated; use shared toast + celebrate.
- `src/utils/dailyEngine.ts` — streak/day math on the user's **local** date; no fake
  "yesterday's verse" on day one; midnight rollover.
- `src/utils/audio.ts` — expose `setMuted`; surface loading/playing/stop/error.
- `index.html` / `public/theme-init.js` — theme + text-size applied before first paint.
- `src/components/Navigation.tsx`, `src/App.tsx` — tablet header overflow; 44px targets;
  confirm before leaving an in-progress game/story; tabs replace history.
- `src/components/SettingsModal.tsx` — add Sound/Haptics toggle (persisted + applied).

### Files to DELETE (Phase 1)
- None. Cleanup happens in Phase 7.

### Tests added
- `tests/verseKey.test.ts`, `tests/scriptureRef.test.ts`, `tests/bookmarks.test.ts`.

---

## Phase 2 — Story Swipes engine

### Files to ADD
- `src/types/story.ts` — `Story`, `StoryCard` (`narration|interaction|choice|payoff`),
  `QuizItem` types.
- `src/utils/storySchema.ts` — zod-free hand-rolled validator (no new dependency) or a
  light validator matching the schema; returns typed `Story` or throws with path.
- `src/content/stories/*.json` — one file per story. First complete story:
  `david-and-goliath.json` (1 Samuel 17, ~8 cards). Then stubs for the 24 stops.
- `src/content/stories/index.ts` — loads + validates all stories, exposes the ordered list.
- `src/utils/storyProgress.ts` — progress keyed by `storyId` (never date); resume cursor.
- `src/components/story/StoryPlayer.tsx` — full-screen vertical card player with
  Instagram-style progress segments, swipe/tap, auto-play narration, tab-hidden pause,
  exact resume, payoff/deck flip, "Read the full chapter".
- `src/components/story/interactions/DragToTarget.tsx`
- `src/components/story/interactions/HoldToContinue.tsx`
- `src/components/story/interactions/TapReveal.tsx`
- `src/components/story/interactions/TapSequence.tsx`
- `src/components/story/ChoiceMoment.tsx` — pick, then "what really happened" + verse.
- `src/components/story/NarrationCard.tsx`, `VerseLine.tsx`, `StoryCardShell.tsx`.
- `tests/storySchema.test.ts`, `tests/storyProgress.test.ts`.

### Files to CHANGE
- `src/App.tsx` — route to `StoryPlayer`; "Read the full chapter" opens the reader.
- `src/components/CanonLibraryPage.tsx` / reader — accept an open-at-passage target
  (already supported via `passageTarget`).

### Files to DELETE
- None yet.

---

## Phase 3 — Daily loop (Today)

ADD `src/screens/TodayScreen.tsx` (4-step progress ring: Swipe → Play → Lock in →
Collect), `src/components/daily/StoryQuiz.tsx` (3 tap questions from the played story),
`src/utils/quizEngine.ts` (distractor rule: same category, never leak the key word),
`src/utils/deck.ts` (verse/character cards + persistence), `tests/quizEngine.test.ts`,
`tests/deck.test.ts`. CHANGE `App.tsx` home to Today; Dashboard reduced to today card +
streak + map entry. `src/content/stories/*` gains `quiz` arrays.

## Phase 4 — Simplified memory

ADD `src/utils/memoryLadder.ts` (4 levels: full tap-order, some blanks, first letters,
type/tap), `src/utils/spacedRepetition.ts` (1/3/7/14/30, mastered = Level 4 on 3
distinct days), `src/components/memory/LevelPlayer.tsx`, `tests/spacedRepetition.test.ts`.
CHANGE `WordForge`/PracticeView to a single fade-out ladder. Unicode-safe matching reuses
`src/utils/verseText.ts`.

## Phase 5 — My Deck

ADD `src/screens/DeckScreen.tsx`, `src/components/deck/VerseCard.tsx`,
`src/components/deck/CharacterCard.tsx`, `src/utils/shareCard.ts` (Daybreak image +
deep link, never includes private notes), `tests/deck.test.ts`. CHANGE nav `arsenal` →
Deck; remove private-note sharing. DELETE `ArsenalView` usage (keep file until Phase 7).

## Phase 6 — Story map

ADD `src/screens/MapScreen.tsx`, `src/utils/storyMap.ts` (arcs: Beginnings, Patriarchs,
Exodus, Kings, Prophets, Jesus, Church; completed glow, next pulses, locked = title only),
arc completion celebration. CHANGE nav.

## Phase 7 — Merge and cut

CHANGE `src/components/Navigation.tsx` to 4 tabs (Today, Map, Bible, Deck) + Settings
header icon. Remove Game tab (engine becomes loop step 2 + Map "Quick Play"). DELETE
app-label questions in `src/utils/triviaEngine.ts` (Canon Codex, life-theme, invented
titles), XP/ranks UI, Word Forge naming, `/dilemmas` route (redirect to Map), and
non-interactive "tappable" elements. `tests/triviaBank.test.ts` updated.

## Phase 8 — Onboarding and settings

ADD `src/components/onboarding/FirstRun.tsx` (3 screens: 3-min promise, collect verses,
reminder time). CHANGE `SettingsModal` so every field persists **and applies**
(session length, audio, sound/haptics, text size, theme, translation, reminder). First
run drops into David and Goliath.

---

## Cross-cutting
- Bump `package.json` version to `2.0.0-beta`; add CHANGELOG entries per phase.
- Run `npm run lint`, `npm run build`, `npm test` after each phase.
- Playwright: a full daily-loop run at 390x844 and 820x1180, Back never exits mid-flow,
  Done appears, card lands in Deck, reload resumes.

## Notes / risks
- The repo's `npm test` is `playwright test` with **no config**; the existing
  `tests/*.test.ts` are Node-level unit tests collected by Playwright's default matching.
  New unit tests follow the same pattern. A real browser spec needs a config + dev server.
- Bundled English verse text is currently labeled `Plain English`; the reader fetches
  WEB/KJV remotely. Phase 1 adds `scripts/verify-verses.ts` to check bundled text against
  a verified source and fail on mismatch; Story Swipes scripture uses verified WEB only.
- 24 story stops do not exist as data today; they are added as stubs in Phase 2.
