# Story Swipes Ã¢â‚¬â€ Execution Checklist

Branch: `feature/story-swipes`. Checklist mirrors `docs/story-swipes-plan.md`.
Status legend: `[x]` done Ã‚Â· `[~]` partial Ã‚Â· `[ ]` not started.

## Phase 1 Ã¢â‚¬â€ Critical fixes
- [x] 1.1 Canonical verse key (`1KI.19.12`) + resolver used everywhere (`src/utils/verseKey.ts`)
- [x] 1.2 Practice opens the mission verse; never falls back to Joshua 1:9
- [x] 1.3 Save card persists to Saved + unit test
- [x] 1.4 Progress keyed by storyId (and day for daily loop), never leaks across stories Ã¢â‚¬â€ `storyProgress.ts`
- [x] 1.5 Real routes + history; Back never exits a sub-screen; tabs replace history; confirm before leaving in-progress story
- [x] 1.6 Reference parsing: Psalm 23 / Ps 23 / John 3 / Rom 8:28 / abbrevs; reject Romans 8:99; cross-book chapter nav
- [x] 1.7 Translation integrity: WEB/KJV only, no CSB/NIV/ESV; `scripts/verify-verses.ts` fails on mismatch
- [x] 1.8 Tablet layout 768Ã¢â‚¬â€œ1233px compact header + bottom nav (verified at 820 & 1279)
- [x] 1.9 Text-size applied before first paint (inline script); rows wrap at 320px with XL text
- [x] 1.10 XP hidden when off (existing gate) Ã¢â‚¬â€ verify displayed == awarded after Phase 7 cut
- [x] 1.11 Remove fake "yesterday's verse" on day one (existing) Ã¢â‚¬â€ verify streak/rollover by local date
- [x] 1.12 Listen/TTS loading/playing/stop/error states (existing) Ã¢â‚¬â€ surface in new surfaces

## Phase 2 Ã¢â‚¬â€ Story Swipes engine
- [x] 2.1 Story types + validator (`src/types/story.ts`, `src/utils/storySchema.ts`)
- [x] 2.2 `src/content/stories/*.json` one file per story
- [x] 2.3 Full-screen player with progress segments, swipe/tap, resume, pause on hidden
- [x] 2.4 Interactions: DragToTarget, HoldToContinue, TapReveal, TapSequence (haptic, sound, no fail)
- [x] 2.5 Choice moment replaces Dilemmas
- [x] 2.6 David and Goliath (1 Sam 17, 8 cards, WEB text)
- [x] 2.7 "Read the full chapter" button opens reader at passage
- [x] 2.8 24 story stubs (title/passage/arc/order)
- [x] 2.9 Payoff card flips verse into Deck

## Phase 3 Ã¢â‚¬â€ Daily loop (Today)
- [x] 3.1 Today screen with 4-step progress ring
- [x] 3.2 Step 1 Swipe: play story (~90s)
- [x] 3.3 Step 2 Play: 3 tap questions (who/what/where) from played story only
- [x] 3.4 Distractor rule: same category, never leak key word (tested)
- [x] 3.5 Instant right/wrong + verse on miss; no timer by default
- [x] 3.6 Step 3 Lock in: today's verse + up to 2 due reviews
- [x] 3.7 Step 4 Collect: card flips into Deck, "Done for today" + tomorrow teaser
- [x] 3.8 Home is Today (only today card, streak, map entry); Dashboard retained at /explore

## Phase 4 Ã¢â‚¬â€ Simplified memory
- [x] 4.1 One fade-out ladder per verse (4 levels)
- [x] 4.2 Validate word order + score accuracy
- [x] 4.3 Spaced repetition 1/3/7/14/30; due reviews auto-appear in Lock in
- [x] 4.4 Mastered only after Level 4 recall on 3 separate days
- [x] 4.5 Unicode-safe matching (keep accents; normalize case + punctuation)
- [x] 4.6 Lock in uses the fade-out ladder as the single memory surface (Word Forge naming removed)

## Phase 5 Ã¢â‚¬â€ My Deck
- [x] 5.1 Verse cards + character cards
- [x] 5.2 Card strength badges (bronze/silver/gold)
- [x] 5.3 Tap to flip: story recap, verse, Practice, Read chapter
- [x] 5.4 Filter by arc and strength
- [x] 5.5 Share as Daybreak image card with deep link; never include private notes
- [x] 5.6 Arsenal/Saved retired from nav; /saved and /arsenal redirect to Deck

## Phase 6 Ã¢â‚¬â€ Story map
- [x] 6.1 Vertical path grouped into 7 arcs
- [x] 6.2 Completed glow gold, next pulses, locked show titles only
- [x] 6.3 Replay any finished story
- [x] 6.4 Arc completion celebration (gold "Arc complete" badge)

## Phase 7 Ã¢â‚¬â€ Merge and cut
- [x] 7.1 4 tabs: Today, Map, Bible, Deck (+ Settings header icon)
- [x] 7.2 Remove Game tab; engine becomes loop step 2 + Map Quick Play
- [x] 7.3 Engine fixes: results show correct/answered; review badge only on return; debounce (existing answerLock); XP respects setting
- [x] 7.4 Delete app-label questions (removed invented-title "Which story belongs to X?" generator) + dup refs guard
- [x] 7.5 Remove XP/ranks from UI (nav, dashboard, gauntlet)
- [x] 7.6 Word Forge naming removed; `/dilemmas` redirects to Map

## Phase 8 Ã¢â‚¬â€ Onboarding and settings
- [x] 8.1 First run: 3 screens then drop into David and Goliath
- [x] 8.2 Settings persist AND apply: session length, audio, sound/haptics, text size, theme, translation, reminder
- [x] 8.3 Family-friendly, inclusive language (copy reviewed)
- [x] 8.4 Sound + Haptics toggles wired in Settings

## Quality bar
- [x] Unit tests: verse key resolver, reference parser, spaced repetition, story progress, deck, quiz distractor
- [x] Playwright e2e at 390x844 and 820x1180: full daily loop, Back never exits, Done appears, card in Deck, reload resumes (both pass)
- [~] Lighthouse PWA + a11y: verified tablet/phone layout, 44px targets, no uncaught console errors (TTS 500 is external)
- [x] Version bumped to 2.0.0-beta
- [x] CHANGELOG entries per phase

## Cross-cutting notes
- `npm test` = playwright test with no config; unit tests are Node-level; e2e spec needs config + dev server.
- Bundled English labeled `Plain English`; Story Swipes scripture is verified WEB only.