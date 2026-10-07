# Changelog

All notable changes to the **Testament** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.22.0] - 2026-10-06

### Added (Learner Modes: Builder, Reciter & Storyteller)
- **Learner Mode Architecture**: Built unified lens system on top of the decision-first daily mission core. Default mode remains Builder with zero regression. Progress across all modes is kept preserved and local-first on-device (`testament_learner_modes_state`).
- **Mode Selector**: Added intuitive 1-screen modal to choose among Builder, Reciter, and Storyteller. Integrated into Settings dropdown and Step 5 of the Onboarding calibration flow.
- **Mode B — Reciter (Flagship Cumulative Chaining)**:
  - Rolling 7-day verse-of-the-week practice based on natural clause-boundary phrase splitting (punctuation-aware).
  - Day 1: Full verse read aloud with `Scripture (Verbatim)` badge.
  - Day 2: First phrase revealed from memory with self-grading (`Got it` / `Missed it`).
  - Days 3–6: Cumulative out-loud chaining from phrase 1 through N.
  - Day 7: Full recitation test retiring the mastered verse into the on-device **Known Verses** collection and issuing the next verse in rotation.
  - Automatic loop-back insertion on subsequent days for any phrase marked `Missed it`.
  - Native daily calendar reminder integration using the zero-guilt calendar system.
- **Mode C — Storyteller (Retell & Teach)**:
  - "Tell the story back in your own words" reflection input prompt upon completing daily mission.
  - Side-by-side comparison with the app's faithful retelling badged with `✨ AI reflection • Not Scripture`.
  - Interactive self-marking of captured vs. missed narrative beats saved on-device.
- **Testing**: Added Playwright test specification verifying verbatim scripture preservation, punctuation clause splitting, multi-mode persistence, 7-day progression advancement under test-clock dates, loop-back queues, and AI reflection badging.

## [1.21.0] - 2026-10-04

### Added (Feature 8: Calendar Reminders — Replaces Push Notifications)
- **Zero-Guilt Calendar Reminders**: Added recurring daily calendar events (`Today's Mission — Testament` at 7:00 AM, `Still got yesterday's verse? — Testament` at 12:30 PM) replacing broken and intrusive web push notifications.
- **Client-Side Google Calendar Links**: Generates instant `calendar.google.com` recurring event URLs prefilled with daily recurrence (`RRULE:FREQ=DAILY`), device local timezone, event details, and direct links to the Testament web app.
- **RFC 5545 `.ics` File Generation**: Clean client-side `.ics` generator with standard daily recurrence rule (`RRULE:FREQ=DAILY`), local timezone offset, and event reminder alarms (`VALARM:DISPLAY`) for seamless native import into Apple Calendar (iOS/macOS) and Microsoft Outlook.
- **Zero Guilt Copy & Flow Integration**:
  - Live It (Screen 3) completion card: *"Want a reminder for tomorrow? Add to calendar."*
  - Profile & Settings: Dedicated *"Daily reminders"* entry in the header Settings dropdown.
  - WordForge & Saved Scriptures (Arsenal): 1-tap verse recall calendar reminder generator attached to practice workbench items.
  - Zero guilt tone (*"Still got yesterday's verse?"*, never *"Don't forget!"* or guilt-tripping streak warnings).
- **Push Notification Cleanup**: Removed legacy Web Push permission prompts, IndexedDB alarm sync, PeriodicSync background listeners, and notification engine overhead (`notificationEngine.ts` safely removed).

## [1.20.0] - 2026-10-03

### Added (Engagement Spec v2 — 7 Retention & Scripture Depth Features)
- **Feature 1: Locked Tomorrow Teaser ("Can't peek")**: Displays tomorrow's curated passage tension hook locked until midnight, building genuine curiosity and anticipation with zero spoilers.
- **Feature 2: Backstory Layer ("Who was this guy?")**: Collapsed-by-default historical grounding card on Story step (who wrote it, who these people were, cultural context, and ancient meaning) in 3–5 concrete sentences.
- **Feature 3: "Your Words" — Private Decision Journal**: Reverse-chronological timeline of daily decisions, verbatim custom words, questions, passages, and takeaways saved strictly to device storage (`testament_decision_journal`). Includes clear-journal management.
- **Feature 4: Anonymous Decision Stats (100% Real)**: Real-time aggregate tallying of choices per date/passage via serverless API (`api/decision-stats.ts`). Strictly follows the Honesty Rule: zero fabricated numbers or social-proof illusions.
- **Feature 5: "Previously On..." Weekly Narrative Recap**: 60-second read summarizing the 7-day arc, overarching story thread, and passages completed with zero guilt language.
- **Feature 6: Follow a Person — Character Arcs**: Deep-dive character arc explorer for 6 foundational figures (Jesus, Peter, David, Mary, Paul, Esther) with 10–12 moments each, cross-linked directly from daily missions.
- **Feature 7: "Carry It With You" Lock-Screen Verse Card Generator**: High-resolution 1080×1920 canvas phone wallpaper generator producing clean, verbatim scripture cards with native share sheet and download fallback.

## [1.19.2] - 2026-10-03

### Fixed & Accessibility (Persona QA Round 2)
- **C-1 & C-2 Decide Screen Screen-Reader Operability**: Rebuilt Decide interaction with semantic `<fieldset>` and `<legend>` containing the scenario question, `role="radiogroup"`, real `<label>`s with `<input type="radio">`, an explicitly labeled "In your own words" text field with linked privacy note (`aria-describedby`), and perceivable disabled state helper text ("Choose an option above to continue").
- **M-1 & M-2 Plain-Language Primary CTA & Idiom Guardrails**: Renamed primary action button to *"Start today's mission"* / *"Review today's mission"*. Rewrote decision options in plain words (*"Go quiet and wait for it to pass alone"*, *"Get angry at the people around you"*), and added strict prompt guardrails across Gemini generation pipelines ("Use plain, concrete words. No idioms, slang, or figures of speech.").
- **M-3 Inline ESL Assistance**: Integrated tap-to-define on difficult biblical vocabulary (e.g. *"rebuked"*, *"squall"*, *"stocks"*) with 1-tap explanations, plus an inline *"Say it simpler"* toggle on key verse cards.
- **M-4 Screen-Reader Decorative Cleanliness**: Added `aria-hidden="true"` to all decorative emoji and icons; streamlined badge announcement to `"AI reflection • Not Scripture"` without noise.
- **M-5 Verbatim Mirror-Back**: Quoted the user's authentic choice verbatim (*"You chose: '...'*), with the AI connection rendered in a distinct, badged sentence.
- **M-6 & M-10 Network & Interruption Resilience**: Added progress feedback for slow 3G connections with automatic ~8s fallback to curated backup content. Persisted in-progress mission state to `localStorage` so PWA backgrounding resumes the exact step and selection.
- **M-7 Jargon Removal**: Renamed *"Calibrate"* to *"Set up my plan"*, *"Relics"* to *"Collection"*, and updated rank title to *"Profile"*.
- **M-8 Transparency Page**: Added *"How Testament works"* trust page accessible within 2 taps from Home (explaining default CSB translation, KJV toggle, strict AI guardrails, passage vetting, and local-only privacy).
- **M-9 Content Issue Flagging**: Added low-friction *"Report an issue with today's reflection"* link on AI screens logging to `localStorage` and offering direct email reporting.
- **Minor Enhancements (N-1 to N-12)**: Removed kicker truncation on 390px screens (N-1), renamed recall card to *"Remember yesterday's verse?"* (N-2), saved verse pill to *"Saved as today's memory verse"* (N-3), answer connection to *"Here's how your answer connects"* (N-4), Live It heading to *"Your one thing today"* (N-5), accessible step position text (N-6), language selector `aria-label` (N-7), streak and XP accessible status labels (N-8), clear audio labels (N-9), prefers-reduced-motion honor in confetti (N-10), and one-line Collection explainer on first view (N-12).

## [1.19.1] - 2026-10-03

### Refined
- **Sentence Case Display Typography**: Shifted `font-serif` to `Lora` for headlines and narrative titles, eliminating all-caps shouting on questions, story retellings, action lines, and takeaways while preserving small letterspaced kickers.
- **Thinned Core Loop Kickers**: Removed duplicate and restating kickers across Decide, Story, and Live It, capping simultaneously visible letterspaced-caps labels at maximum 2 per screen.
- **Unified AI Reflection Badge**: Standardized all AI badges across the app to the canonical copy: `✨ AI reflection • Not Scripture`.
- **Consolidated Completion Moment**: Combined memory-verse confirmation into the single `MISSION COMPLETE` celebration card (`Mark 4:39 locked in as today's memory verse`) and renamed the primary CTA button from "Finish today's mission" to "Done".
- **Distinct Navigation Icons**: Replaced the duplicate shield icon on Dilemmas with `GitFork`, visually distinguishing the Dilemmas crossroad simulator from Saved Scripture/relics (`Shield`).
- **Decluttered Top Header**: Streamlined the Dashboard header to avatar/title, version, streak, XP, and a single settings dropdown entry for Theme and Language.

## [1.19.0] - 2026-10-03

### Added
- **Decision-First Homepage (1 Card, 1 Clear Action)**: Replaced the quest-style dashboard with a single decision card above the fold featuring today's provocative scenario question and a single primary CTA (*Make today's call* / *Review today's call*). Eliminates triple-named confusion (*TODAY'S PLAN*, *Start Today's Mission*, *Daily Mission*).
- **The 3-Screen Mission Core Loop**: Replaced the 5-step stepper with a fast 3-screen core mission (*Screen 1: Decide → Screen 2: Story → Screen 3: Live It*) completing in ≤5 taps with zero typing and zero interrupting modals.
- **Daily AI Generation Pipeline**: Hybrid architecture featuring vetted daily biblical passage rotation (`CURATED_DAILY_PASSAGES`), in-context Gemini generation with strict no-invention faithfulness guardrails (≤140 words, verbatim scripture copy, plain English narrative, and AI reflection badges), plus instant 0ms offline fallback.
- **Per-User Decision Mirror-Back**: Tailors a single punchy mirror-back connection (*"You said you'd shut everyone out — Jesus fought that exact urge..."*) and a concrete action line based on the user's authentic choice.
- **Unified Memory Verse Loop**: Today's key verse automatically locks into the memory system and FSRS spaced repetition with a one-tap confirmation on the Live It screen. The next day displays a single *"Yesterday's verse — still got it?"* flip-recall card before joining the regular rotation.
- **Simplified 1-Round Drills**: Replaced multi-step word tile dragging with a quick fill-in-the-blank recall drill: tap missing key words from candidate chips, one round, then done.
- **Weekly Streak Forgiveness**: Integrated an automatic grace day per calendar week protecting users from losing their daily streak if a single day is missed.
- **Prominent Rank Promotion Fanfare**: Announced rank advancements (*Seeker → Story Explorer → Mighty Man of Adullam → Iron Pillar*) with animated celebration banners on the completion screen.
- **Shareable Mission Cards**: Added 1-tap shareable completion card generating clean summary text for native mobile sharing and clipboard export.

### Changed
- **Plain Language Navigation Labels**: Renamed cryptic gamified badges (*"2 Due"* → *"2 verses to review"*, *"Arsenal"* → *"Scripture library"*).
- **Progress Framing Overhaul**: Eliminated *"0/4 completed"* progress pressure; post-mission review items and explore tools are framed as optional bonuses.
- **Subtle PWA Update Toast**: Converted persistent *"Update Ready"* banner into a subtle, borderless toast that automatically dismisses after 7 seconds and remembers dismissal in `sessionStorage`.
- **First-Run Direct Landing**: New users land directly on today's mission with zero popup modals; beginner journey (*"Jesus: The Living Word"*) anchors the first-week rotation.

### Retired
- Retired standalone morning briefing modal and its separate voice picker; its 3-part structure (*Real Moment → Truth for the Pocket → Your Call Today*) is now the mission itself.
- Retired standalone daily check-in modal (*"What are you facing today?"*); the Decide screen's answer now serves as the check-in and is recorded to `testament_daily_checkin`.

## [1.16.0] - 2026-10-01

### Added
- **Story Quest Progressive 5-Step Stepper**: Eliminated the intimidating 3,430px vertical scroll stack in Story Viewer, transforming quests into a focused, bite-sized 5-step journey (*Decide First → What Actually Unfolded → Scripture Unlocked → Real Talk → Wisdom Check Drill*), with step navigation buttons, sticky stepper bar, and synchronized desktop Reading Roadmap.
- **Compact Mobile Reader & Preferences Drawer**: Reduced reader modal top bar height by 53px on mobile, streamlined sticky reader bar, and added an accessible slide-up *Reading Preferences* drawer for Translation, Voice, and Font Size with full 44px touch targets.
- **Tabbed Pastoral & Tactical Dilemmas**: Converted Dilemma evaluations into clean "Pastoral Diagnosis" vs "Tactical Playbook" tabs, reducing initial reading cognitive load while preserving depth. Made the Socratic counter-challenge an optional XP drill.
- **Expandable Mobile Explore Drawer**: Collapsed the 7 mobile Explore sidebar modules behind an expandable gear drawer on the Dashboard, eliminating ~2,200px of mobile scrolling.
- **Narrator Voice Parity**: Added the 4th voice profile `grace` (🙏 Rachel) across all narrator pickers in Story Viewer, Drive Mode, and Dashboard briefing.

### Fixed
- **Mobile Bottom Navigation Trim**: Reduced mobile bottom navigation from 6 to 5 columns (`grid-cols-5`), eliminating label truncation across English, Spanish, German, French, and Portuguese.
- **Mobile Back-Button Deep-Linking**: Integrated browser `pushState`/`popstate` back-button navigation for active quests so users can smoothly exit a quest with native mobile back gestures without being trapped.
- **Floating Banner Mutual Exclusion**: Ensured PWA install prompt and daily campaign banner never stack over each other.
- **Touch Target Accessibility**: Enlarged BookSpine touch hit-areas with unclipped pseudo-elements to guarantee WCAG 44px compliance.
- **Repaired Dilemma Key Mappings**: Resolved 4 broken and duplicated dilemma identifiers in Battlefield Check-In (`dilemma-burnout-home`, `dilemma-friend-betrayal`, `dilemma-group-chat-pressure`, `dilemma-envy-spiral`).
- **Dead Code Purge**: Deleted 5 orphan files (~1,090 lines / ~50 KB) that were no longer referenced (`AppTourModal.tsx`, `TimelineModal.tsx`, `StreetTranslatorModal.tsx`, `timeline.ts`, `streetTranslator.ts`).

## [1.15.1] - 2026-10-01

### Added
- **Interactive 12-Hour Custom Reminder Builder**: Added an intuitive, touch-friendly 12-hour Time Picker (Hour 1-12, Minute :00-:55, AM/PM toggle) allowing users to manually construct and preview the exact time before adding it to their reminder schedule.
- **One-Tap Quick Presets**: Added quick time presets (7:00 AM, 12:00 PM, 6:30 PM, 9:30 PM) for effortless scheduling.
- **Inline 12-Hour Slot Editing**: Each scheduled slot in the list now provides direct Hour, Minute, and AM/PM adjustment controls along with instant 12-hour formatted feedback.

### Fixed
- **Prevent Auto-Inserted Times**: Completely eliminated automatic placeholder insertion (e.g. `16:00`) when adding reminders. Users now have total manual control over their schedules.
- **Deduplication & Chronological Alignment**: Scheduled slots are automatically deduplicated and sorted chronologically from morning to night.
- **Cross-Platform Picker Compatibility**: Replaced problematic native `<input type="time">` wheels with reliable custom dropdowns and toggle buttons that operate seamlessly on iOS Safari, Android Chrome, and desktop PWAs.

## [1.15.0] - 2026-10-01

### Added
- **Gemini-Powered Discipleship & Dilemma AI**: Integrated Google Gemini Flash (`gemini-flash-lite-latest`, `gemini-3.5-flash-lite`) to dynamically generate real-life, non-political Christian daily dilemmas and evaluate user plays with ultra-fast latency (< 1s).
- **Deeply Personalized Answer Dissection**: Dilemma and Quest crossroads responses are evaluated against the user's authentic words, named persons, and proposed tactics rather than static keyword templates. Provides bespoke stance titles, direct answers, biblical parallels, flesh traps, and 3 tailored morning battle moves.
- **Multi-Turn Socratic AI (Turn 2)**: Added dynamic evaluation for the Mentor's Socratic Counter-Challenge, scoring Biblical Tactical Temperament (Grace, Truth, Prudence, Courage) based on the user's actual follow-up response.
- **Custom Quest Crossroads Input**: Enabled open-ended, free-form text input in Quest Step 1 crossroads alongside standard multiple choice, evaluating authentic human instinct against what Scripture recorded for biblical heroes.
- **Individualized Reminder Time Slots**: Granted complete user freedom over exact notification reminder times via custom time picker list (`<input type="time">`) without rigid system-forced math.
- **Multi-Verse Training Queue Rotation**: System rotates scheduled memory notifications across all bookmarked and FSRS-trained verses rather than repeating a single verse.
- **Direct-Intel Tactical Nexus**: Redesigned Tactical Nexus card with clean layout and direct "Open Intel" links jumping straight into linked Psalms, Proverbs, and Character Dossiers.

### Fixed
- **Delayed Campaign Next Task Prompt**: Repositioned the campaign completion event trigger in `DilemmaSimulator.tsx` using an intersection observer on a bottom sentinel element so the prompt modal appears only when the user finishes reading and reaches the bottom of the evaluation.
- **Low-Latency Gemini Candidate Priority & Timeout**: Optimized model list with `gemini-flash-lite-latest` priority and 12-second abort timeout, preventing browser hang and fallback to static rules.
- **Fresh Slate Reset**: Clicking "Try Answering Again" clears prior cached responses to ensure a fresh, live AI evaluation.

## [1.14.0] - 2026-09-28

### Added
- **Full Daily Mission localization**: The Home/Daily Mission screen dynamically adapts to French and Spanish, translating biblical hero tracks (e.g. *Voie de Moïse*), mission titles (*Moïse : Mission du Jour*), virtue themes (*Outsider & Courage*), reasons, and narrative atmospheres.
- **Localized step cards & action triggers**: Story quests, real-life dilemmas, and scripture memory steps feature localized badges (*Quête Narrative*, *Dilemme du Monde Réel*, *Mémorisation d’Écriture*), translated titles, intros, and action buttons (*Prendre la décision*, *Lancer la simulation*, *Forger le verset*).
- **Localized canon divisions & life themes**: Library shelf brass headers, list view division intros, and life theme filter chips (*Famille & Résolution de Conflits*, *Courage Sous le Feu*, etc.) are translated across English, Spanish, and French.
- **Localized book briefings**: Open book modals render localized SitRep sections, author context, historical peril, Monday application, dual-lens headers, and ground rule badges.
- **Language-aware date formatting**: Top header dates format according to the active language locale (*lun. 28 sept.*).

### Fixed
- **Canon book & verse key resolution**: Resolved ID prefix mismatch (`canon-*` vs `ot-*`/`nt-*`) in `getLocalizedCanonBook` and `getLocalizedVerse`, enabling Louis Segond (LSG) and Reina-Valera (RVR1960) text to display reliably across all 66 canon books.
- **Division style preservation**: Preserved typed canonical division identifiers while storing localized labels, preventing broken CSS shelf styles and filter mismatches.

## [1.13.0] - 2026-09-28

### Added
- **Tri-language scripture engine**: Full biblical text support for English (WEB, KJV, BBE), Spanish (Reina-Valera 1960, RV2004), and French (Louis Segond 1910, BDS).
- **Dual-API resilience**: Reader queries `bible-api.com` with automatic fallback to `bolls.life` canonical 66-book endpoints and local offline storage cache.
- **Complete localized scripture registry**: Handcrafted Reina-Valera and Louis Segond translations for Core Memory Verses, Daily Anchor Scriptures, Story Quests, Proverbs Tactical Codex, Psalms Field Medic, Real-Life Dilemmas, and Canon book overviews.
- **Language-aware Word Forge**: Word tiles immediately re-split, shuffle, and validate in Spanish or French upon language toggle.
- **Multilingual TTS audio**: 45s tactical briefing, drive mode narrator, and dilemma audio speak localized scripture using neural voices in Spanish and French.

### Changed
- **Reader translation synchronization**: Changing app language automatically updates the default Bible translation (`rvr` for Spanish, `ls1910` for French, `web` for English).
- **Arsenal & Canon Library**: Saved scriptures and canonical chapter outlines dynamically render in the active user language.

## [1.12.0] - 2026-09-27

### Added
- **Readable book list**: The Library opens as a list with each book's name and why it matters. The shelf remains as a second view.
- **Continue reading**: Home and the Library resume the last book and chapter. Type size and the verse or flow layout are remembered.
- **Verse jump**: Search accepts a reference such as John 3:16 or Psalm 23:1 and opens that passage.
- **Book connections**: A book's briefing offers its story, Proverbs, or Psalms module, plus dilemmas that cite that book.

### Changed
- **Chapter reader**: Opening a book lands on the chapter. Tap a verse to memorize, save, listen, or copy it. In flow layout those actions stay under the reader controls. Saved verses update the Arsenal list.

## [1.11.0] - 2026-09-27

### Security
- **Narration key stays on the server**: Drive Mode, Briefing, and scripture listen call `/api/tts`. The function reads `ELEVENLABS_API_KEY` from the environment, caps text length, and rate-limits requests. The app no longer keeps a key in source or local storage. If the function fails, the browser reads the passage.

### Added
- **Real tab addresses**: Home, Library, Memorize, Dilemmas, and Saved have their own paths. The back button stays inside the app, and direct links rewrite to the app shell.
- **Install screen assets**: Opaque maskable and Apple touch icons, a real favicon, theme colors for light and dark, and Open Graph, Twitter, canonical, robots, and sitemap tags.

### Changed
- **Lighter scene art**: Story images are served as WebP and AVIF at 768 and 1376 pixels, with lazy loading except for the home hero.
- **Long-lived static cache**: Hashed assets, images, audio, and icons cache for a year. `index.html` and the service worker stay revalidated.
- **First visit**: The install card waits until Battle Plan Calibration is finished or skipped, and a dismissal is remembered.
- **Mobile layout**: The home action row scrolls with a fade edge. The campaign completion card sits above the bottom nav.
- **Offline copy and cache**: Scene images, self-hosted fonts, and opened Bible chapters cache at runtime. The install prompt says saved content works offline.
- **Light mode**: Amber labels, nav text, and selection color meet contrast on the cream background. The app name is Testament — The Living Word throughout.
- **Smaller install**: MP3s are no longer precached. Library, Word Forge, Dilemmas, and Drive Mode load when opened.

### Fixed
- **World English Bible label**: The reader translation is named World English Bible (WEB).
- **Service worker updates**: Fetch no longer opens IndexedDB. Update prompts go through the in-app banner, which tells the waiting worker to activate.

## [1.10.0] - 2026-09-26

### Added
- **One composed Daily Mission**: Today's path is built from the battlefield check-in, the verse that is due, and the chosen cadence. A short reason line explains why that mission was picked.
- **Real Bible passages inside quests**: After a choice, the scripture step loads the cited verses from the Library's Bible text, keeps the plain-English note, and falls back to the handwritten verse if the chapter cannot load.
- **Read this chapter**: Opens that book and chapter in the Library with the cited verses highlighted.

### Changed
- **Word Forge practice**: Hints reveal only the next word. New verses start as first-letter tiles. Show me stays on screen until dismissed and counts as an Again review.
- **Saved verses**: The Saved tab lists mastered and bookmarked verses only.
- **Onboarding**: Calibration sets the battlefield, guided mode, and cadence. Finishing setup starts today's mission or jumps into the story.

### Removed
- **Switch Track**: The 14 hand-built campaigns are no longer a second "today" beside the composed mission.
- **Competing introductions**: The app tour and Field Guide buttons are gone. Onboarding is the introduction.
- **Side-tool peers on Explore**: Timeline, Character Dossiers, and Street Translator are no longer Field Tools. Dossiers still open from inside a quest.

## [1.9.3] - 2026-09-24

### Added
- **Native Web Push Subscriptions (`PushManager` & VAPID)**:
  - Added full client-side Web Push subscription generation in `notificationEngine.ts` utilizing browser `PushManager` and production VAPID credentials.
  - Implemented automatic local caching of push tokens in `localStorage`.
  - Added zero-cost Supabase backend subscription sync via `syncSubscriptionToSupabase()` to save device endpoints into `push_subscriptions`.
- **App Badging API Integration**:
  - Integrated `navigator.setAppBadge()` into client notification dispatch and `self.navigator.setAppBadge()` inside the Service Worker (`sw-notifications.js`) to display unread verse practice counters on the PWA app icon.
- **Notification Triggers API Support**:
  - Added native `TimestampTrigger` support for scheduled exact-time notifications on supporting Chromium browsers.
- **Safari / iOS In-Memory Timer Fallback**:
  - Added exact next-reminder `setTimeout` scheduler in `initNotificationScheduler` to guarantee timely delivery while the PWA is active or backgrounded in iOS Safari.

### Fixed
- **Deep-Link URL Encoding in Notifications**:
  - Fixed parameter references and URL formatting so notification taps navigate cleanly to `/?action=wordforge&verseId=...` without unescaped characters.

## [1.9.2] - 2026-09-24

### Changed
- **App-Wide Card Border & Outline Elimination**:
  - Removed 4-sided boxed card outlines, border enclosures, and drop shadows across the entire application as commanded.
  - Redesigned `DailyCampaignCard` into a seamless native flow sitting directly on the canvas with subtle row dividers (`divide-y`) rather than an enclosed card container.
  - Stripped card border boxes and heavy drop shadows from `Dashboard.tsx` (top status bar, segmented pill toggles, free-roam hero banners, battle plan, starter quest cards, and all right sidebar tool widgets).
  - Stripped card borders from `ArsenalView.tsx` (all scripture defense cards, category filters, plain English summaries, and journals).
  - Stripped card borders from `DilemmaSimulator.tsx` (briefing cards, situation boxes, human validation vs flesh trap grid, biblical redirection card, Socratic challenge drills, tactical battle moves, and side-by-side playbook analysis cards).
  - Stripped card borders from `WordForge.tsx` (left-column workbench container, plain English summary boxes, FSRS stats widget, assembly word area, word tile buttons, and completion evaluation).
  - Stripped card borders from `TacticalNexusCard.tsx` (nexus graph card container and connected items).
  - Stripped outer division border box from `CanonLibraryPage.tsx` (bookshelf and tactical grid views).

- **Mobile Full-Screen Modal Experience**:
  - Updated all interactive modals (`CanonCodexModal`, `TimelineModal`, `DossierModal`, `MemoryPulseModal`, `BattlefieldCheckInModal`, `StreetTranslatorModal`, `ProverbsCodexModal`, `PsalmsFieldMedicModal`, `OpenBookModal`) to open as seamless, distraction-free full-screen pages on mobile touchscreens (`100dvh`, zero padding/margins, no floating borders or background card silhouettes peeking through).

## [1.9.1] - 2026-09-24

### Improved
- **Full-Screen Mobile Scripture Reader Experience (`OpenBookModal.tsx`)**:
  - Replaced the floating windowed modal on mobile with an edge-to-edge, distraction-free native reader view (`100dvh`, zero margins, no background cards or shelves peeking through).
  - Added dedicated mobile header with `← Books` back navigation to return directly to the library.
  - Implemented responsive, 50/50 segmented mode switcher (`Briefing` vs `Read`) that eliminates pixel-based button overflows.
  - Added tap-to-read triggers on book titles and cards in the 66-book grid view (`CanonLibraryPage.tsx`).

### Fixed
- **Mobile Horizontal Scroll Elimination**:
  - Constrained chapter dropdown picker to prevent long book names (e.g. *1 Thessalonians*, *Song of Solomon*) from pushing toolbar bounds.
  - Eliminated negative margins (`-mx-2.5`) on scripture verses.
  - Redesigned verse quick actions on mobile into a non-disruptive row beneath the verse, preventing inline button blowout.
  - Replaced fixed-width bottom chapter navigation with responsive, wrapping navigation controls that smoothly scroll reader back to top.
  - Added `touch-pan-y` and strict `overflow-x-hidden` containment across the reader container and library pages.
- **Sticky Tooltips on Touch Devices (`BookSpine.tsx`)**:
  - Restricted 3D book spine hover preview tooltips to true mouse pointers (`(hover: hover) and (pointer: fine)`).
  - Added touch dismissal to prevent tooltip preview cards from sticking to the screen on mobile devices.

## [1.9.0] - 2026-09-24

### Added
- **Full 66-Book Bible Scripture Reader (`OpenBookModal.tsx`, `bibleService.ts`)**:
  - Unlocked free-choice scripture reading across all **66 canonical books, 1,189 chapters, and ~31,102 verses** with zero forced railroading.
  - Multi-translation support: **CSB / Modern Reader (WEB)**, **Classic King James (KJV)**, and **Basic Bible English (BBE)**.
  - Offline local caching via `localStorage`: Chapters loaded once are stored permanently for instant, offline PWA access.
  - Interactive verse superpowers:
    - 🔨 **Tap-to-WordForge**: Send any individual scripture verse directly into the Word Forge tile memory workbench.
    - 🛡️ **Save to Arsenal**: Bookmark any verse instantly to your defense cards.
    - 🔊 **Voice Narration**: Listen to entire chapters or speak individual verses on demand.
    - 📋 **Quick Citation Copy**: Copy formatted scripture text and citations in one click.
  - Reader ergonomics: Adjustable typography (`A-`, `A`, `A+`) and comfortable parchment/editorial line heights.
- **App-Wide Reading Voice Selection & Live Previews (`VoiceSelectorModal.tsx`, `audio.ts`)**:
  - Unified voice selection modal with interactive audio sample previews.
  - Added new reflective voice profile: **Rachel (Grace & Peace)** alongside **Adam (Cinematic)**, **Antoni (Grounded)**, and **George (Scholar)**.
  - Selection applies across chapters, daily briefings, and story quest narrations app-wide via persistent storage and reactive broadcast events.

### Improved
- **Mobile Decluttering & Expansive Layouts (`Dashboard.tsx`, `DailyCampaignCard.tsx`, `Navigation.tsx`)**:
  - Eliminated box-in-a-box nested containers in the morning command area and mode selection controls.
  - Replaced bulky step cards with sleek, expansive list rows featuring left-accent status borders (`border-l-4`).
  - Removed duplicate floating mobile header; consolidated **Guide** and **Theme Toggle** directly alongside version #, date, streak, and XP in the main top command bar.

### Fixed
- **App-Wide Light / Dark Mode Consistency**:
  - Extended theme classes across all modals including Proverbs Codex, Psalms Field Medic, Canon Codex, and Campaign Selector.
- **PWA Installation Banner Suppression (`PWAInstallPrompt.tsx`)**:
  - Added multi-source standalone detection and `appinstalled` listeners to permanently suppress install banners once installed.

## [1.8.0] - 2026-09-23

### Fixed
- **Background Notifications (Scripture Memory Pulse)**:
  - Replaced `setTimeout`-based Service Worker alarms with **IndexedDB-persisted alarm timestamps** (`pendingAlarm` record). Alarms now survive SW termination by the browser and fire on the next SW wakeup event (`activate`, `fetch`, `periodicsync`, `push`, `notificationclick`).
  - Fixed burst-on-open bug where opening the app triggered 3 missed reminders simultaneously. `checkAndDispatchDueReminders` now reads both `lastFired` and `pendingAlarm` from IDB before dispatching, suppressing any slot the SW already handled or is about to handle.
  - `syncNextAlarmToServiceWorker` now writes the `pendingAlarm` record directly to IDB as the primary persistence path, with the SW `postMessage` as a secondary path.

## [1.7.0] - 2026-09-23

### Added
- **Desktop UI & Visual Hierarchy Overhaul (Decluttering)**:
  - **Responsive Dual Navigation Bar (`Navigation.tsx`)**:
    - **Desktop (`md:` and above)**: Fixed, frosted-glass top navigation bar (`bg-[#0a0d13]/90 backdrop-blur-md`) with Testament Emblem, primary tabs (`Quests`, `Library`, `Word Forge`, `The Play?`, `Arsenal`), and dedicated utilities (`Drive Audio`, `Ambient Sound`, `Streak`, `XP`).
    - **Mobile (`< md`)**: Retains the streamlined bottom navigation dock tailored for single-thumb interaction.
  - **Ergonomic 2-Column Command Center (Free Roam)**:
    - **Main Stage (`lg:col-span-8`)**: Displays the Cinematic Hero Study Table Banner and brings **all 14 Illustrated Story Quests directly above the fold** with category filter pills.
    - **Tactical Sidebar (`lg:col-span-4`)**: Reorganized into a clean HUD featuring the **Adaptive Next Objective**, **Learner's Tactical Toolkit** (6 visual accelerators in a 2-column grid), **Spaced Memory Pulse** card, **Scripture Field Library & Arsenal** launcher, **The Armory (Relics)**, and **Ambient Audio & Voice Persona**.
  - **Streamlined Morning Command Header**: Replaced the 12-button header wrap with a focused single-row command center for declaring today's trial, listening to the 45s audio briefing, checking due reviews, and calibrating battle plans.
- **Multi-Turn Socratic AI for Dilemmas & Virtue Profiling (`heartEvaluation.ts`)**:
  - Turn 2 Socratic challenge probe analyzing user submissions for theological blind spots (e.g. conflict avoidance, premature confrontation without Matt 18:15 private 1-on-1, or emotional escalation).
  - Biblical Tactical Temperament Profile computing 4 virtue metrics (Grace, Truth, Prudence, Courage) and assigning 1 of 6 biblical archetypes (*The Nathan*, *The Nehemiah*, *The Abigail*, *The Barnabas*, *The Solomon*, *The Caleb*).
- **Cross-Quest Consequence Tracking & Narrative Momentum (`narrativeMomentum.ts`)**:
  - Act decisions ripple into subsequent acts with dynamic narrative indicators (`+Patience`, `+Diplomacy`, `+Discernment`, `+Boldness`).
  - Tactical After-Action Reports (AAR) summarizing user virtue paths upon quest review.
- **FSRS Spaced Repetition & Multi-Tier Word Forge Scaffolding (`fsrsEngine.ts`)**:
  - Cognitive science spaced repetition intervals calculating memory stability, difficulty, and retrievability.
  - 3 progressive scaffolding tiers: **1. Builder (Novice)**, **2. Ghost Letters (Adept)**, and **3. Blind Recall (Master)**.
- **5-Second Battlefield Check-In & Adaptive Daily Campaign (`BattlefieldCheckInModal.tsx`)**:
  - One-tap declaration across 5 battlefields (Workplace Politics, Anxiety & Burnout, Betrayal & Friction, High-Stakes Decision, Spiritual Dryness) dynamically adapting today's quest and dilemma.
- **The Living Canon Tactical Nexus (`nexusGraph.ts`, `TacticalNexusCard.tsx`)**:
  - Interactive knowledge graph connecting story situations to historical crisis Psalms, adversary psychological profiles, proverbs, and modern workplace dilemmas.
- **45-Second Morning Audio Tactical Briefing**:
  - Hands-free audio broadcast synthesizing today's battlefield focus, memory verse, and tactical directives.
- **Campaign Next Task Auto-Prompts (`CampaignNextTaskPrompt.tsx`)**:
  - Intelligent floating prompt guiding users seamlessly through each task of the daily campaign.
- **Smooth Auto-Scroll to Top**:
  - Ensures completing an Act or Quest automatically scrolls the viewport smoothly to the top for the next phase.

### Fixed
- **PWA Service Worker Infinite Reload Loop**:
  - Fixed aggressive auto-reloading loop by adopting stable `autoUpdate` registerType and guarded broadcast channels.
- **Single Memory Verse Per Quest Consistency**:
  - Quests now consistently reinforce one unified anchor memory verse across all acts rather than overwhelming users with multiple verses.
- **Completed Quest State Persistence**:
  - Completed quests maintain their full completed state and answer review history upon re-visiting.

## [1.6.1] - 2026-09-22

### Added
- **PWA Background & Open Update Push Notifications**:
  - Automatically checks for new app updates whenever the app is opened, when switching back from other apps or tabs (`visibilitychange`), and periodically in the background (every 15 minutes and via Periodic Background Sync).
  - When an update is ready and the user has notifications enabled, dispatches an OS-level system push notification:
    - **Title**: `🚀 Testament Update Available`
    - **Body**: `A new version of Testament is ready! Tap to update and open the latest features.`
    - **Actions**: `[ 🔄 Update & Open ]` and `[ Later ]`.
  - Tapping the notification triggers `skipWaiting()` and cleanly updates and reloads the application to the latest version.
  - **In-App Floating Update Banner (`UpdateNotificationBanner`)**: Floating non-intrusive prompt that appears when an update is ready while the app is active in foreground.
  - **Device Verification Button**: Added "Test Update Push" button in the Memory Pulse modal to easily simulate and verify update notifications on mobile and desktop lock screens.

## [1.6.0] - 2026-09-22

### Added
- **Daily Guided Mission System ("Today's Tactical Campaign")**:
  - Replaces aimless wandering with a curated, high-tempo 4-step daily path:
    1. **Narrative Forge (Story Quest Act)**: Step into the boots of a biblical hero facing high-stakes conflict (e.g. David facing Goliath).
    2. **"What's the Play?" Tactical Simulation**: Solve a connected real-life modern crisis directly paralleling that hero's battle (e.g. Family Undermining Ambition / Workplace Hecklers).
    3. **Word Forge Memory Lock**: Lock the anchor scripture into your mental armor with interactive block builders and cloze puzzles.
    4. **Scriptorium Codex Briefing**: Open the matching volume in the 3D Library to extract the Monday Morning Reality Check.
  - **14 Curated Hero Tracks**: Freedom to follow today's rotating campaign or choose from all 14 Hero Tracks (David, Joseph, Moses, Daniel, Elijah, Esther, Nehemiah, Peter, Gideon, Paul, Jonah, Ruth, Joshua, John the Baptist).
  - **Real-Time Step Progression & Celebration**: 4 connected step nodes with visual checkmarks, progress percentages, and celebration confetti awarding a +150 XP completion victory bonus.
- **Dual Dashboard Mode Switcher (Guided Campaign vs. Free Roam)**:
  - 1-tap mode toggle on the Dashboard allowing users to switch between structured mentorship lessons (`🎯 Daily Guided Mission`) and open sandbox exploration (`🗺️ Free Roam`), with persistent state in `localStorage`.
- **In-App "What's New" Release Notes Dispatcher (`WhatsNewModal`)**:
  - High-craftsmanship modal automatically notifying users of new capabilities upon app updates (with `localStorage` tracking).
  - Permanent access from the Dashboard top header pill (`v1.6.0 Live ✨`).
  - Interactive archive detailing all major version milestones from v1.0.0 through v1.6.0.
- **Seamless Cross-Tab Deep Linking**:
  - Direct 1-tap buttons on each campaign step launch directly into the matching Quest, Dilemma, Word Forge verse, or Library Codex pre-loaded and ready for immediate action.

---

## [1.5.0] - 2026-09-22

### Added
- **The Scripture Scriptorium: Dedicated 66-Book Library Page & 3D Interactive Bookshelf**:
  - Transformed the 66-Book Field Library from a popup modal into a full-page dedicated experience accessible via the persistent bottom navigation bar ("Library") and Dashboard action buttons.
  - **Authentic 3D Physical Bookshelves**:
    - Rich dark oak/walnut wood bookshelves with beveled plank shadows, metallic mount studs, and ambient candlelight aesthetic.
    - 7 Division Shelves with carved brass header plaques (*I. Torah & Origins*, *II. War & Chronicles*, *III. Wisdom & Soul Triage*, *IV. Prophet Intelligence*, *V. The King's Manifesto*, *VI. Field Dispatches*, *VII. The Cosmic Endgame*).
  - **Dynamic Physical Book Spines (`BookSpine`)**:
    - Textured leather spine color palettes tailored to each of the 7 canonical divisions (royal navy, oxblood, burnished gold, forest emerald, imperial purple, saddle tan, obsidian).
    - Proportional physical spine thicknesses and height variations (heavy tomes like Psalms and Genesis vs. slender volumes like Jude and Philemon).
    - Gold-embossed lettering, Roman numeral order badges, raised spine ribs, and testament indicators.
    - Smooth 3D hover/pull animation with illuminated edge highlights, drop shadows, and floating tactical tooltips.
  - **The 3D Open Codex Reader (`OpenBookModal`)**:
    - Pulling a book smoothly unfolds a two-page ancient leather codex / tactical manual.
    - Left Page: Book title, division badge, tactical codename, 30-second crisis sitrep, and Monday morning reality check.
    - Right Page: Anchor scripture with 1-tap dual-lens switcher (Street Plain English vs. Canonical Word-for-Word), dramatic voice audio narration, and deep-link action buttons (`⚔️ Launch Journey`, `🧠 Train Word Forge`, `🔔 Set Memory Pulse`).
    - Volume Pager controls (`← Previous Book` / `Next Book →`) and keyboard arrow key listeners (`←` / `→`) allowing users to read through all 66 books continuously with smooth page turns.
  - **Dual View Modes (Bookshelf vs. Tactical Grid)**:
    - 1-tap toggle between **📚 Bookshelf View** (3D wooden library shelves) and **📋 Tactical Grid View** (searchable cards with life situation filters).
  - **Procedural Sound Effects (`soundEngine`)**:
    - Added `playBookSlide()`: tactile low-friction wood/leather slide when hovering or pulling books.
    - Added `playPageTurn()`: gentle parchment paper rustle when opening and flipping volumes.

---

## [1.4.0] - 2026-09-22

### Added
- **8 New Full Interactive Story Quests (Expanded from 6 to 14 Journeys)**:
  - **Daniel: Undercover in Babylon** (*Book of Daniel*): Exiled teenager navigating imperial indoctrination, dietary boundary warfare, and the lions' den conspiracy without compromise.
  - **Esther: The Shadow Empress** (*Book of Esther*): Covert orphan queen crossing the forbidden inner throne room uninvited to halt genocide: *"If I perish, I perish."*
  - **Nehemiah: The Blueprint Builder** (*Book of Nehemiah*): Wall construction in 52 days holding a trowel in one hand and a spear in the other; mastering extreme focus and saying no to the Plains of Ono.
  - **Gideon: The Reluctant Guerilla** (*Book of Judges*): Imposter-syndrome farmer threshing wheat in secret, guided to defeat a 135,000-man horde with 300 men, clay jars, and torches.
  - **Jonah: The Reluctant Maverick** (*Book of Jonah*): A deep-sea flight from destiny, surviving the ocean abyss, and confronting the difficult truth that divine mercy extends to enemies.
  - **Ruth: The Loyal Immigrant** (*Book of Ruth*): Covenant loyalty (*Hesed*) in the wake of catastrophic loss; an impoverished foreign gleaner becoming the great-grandmother of King David.
  - **Joshua: The Beachhead Commander** (*Book of Joshua*): Stepping out from Moses' shadow, commanding the crossing of the Jordan at flood stage, and tearing down the walls of Jericho.
  - **John the Baptist: Voice in the Wild** (*The Gospels*): Uncompromising desert herald confronting imperial corruption, mastering radical humility (*"He must increase, but I must decrease"*), and enduring dark nights of the soul in Herod's dungeon.
- **8 New Historical Character Dossiers in Dossier Vault**:
  - Added rich profiles for Daniel, Esther, Nehemiah, Gideon, Jonah, Ruth, Joshua, and John the Baptist detailing superpowers, tragic flaws, defining crisis moments, and modern Monday-morning lessons.
- **8 New Collectible Relic Artifacts**:
  - `daniel-signet` (💍 Babylonian Signet Ring)
  - `esther-scepter` (🪄 Golden Scepter)
  - `nehemiah-trowel` (🔨 Mason's Chisel & Trowel)
  - `gideon-torch` (🏺 Broken Clay Jar & Blazing Torch)
  - `jonah-anchor` (⚓ Sea Anchor)
  - `ruth-sheaf` (🌾 Golden Barley Sheaf)
  - `joshua-trumpet` (📯 Jericho Shofar)
  - `john-belt` (🥋 Leather Belt & Locust Honey)
- **Zero-Overwhelm 4 Life-Season Tracks**:
  - Harmonized all 14 quests across 4 intuitive, relatable real-world tracks:
    - *Underdog & Courage* (David, Moses, Gideon, Joshua)
    - *Career & High Stakes* (Joseph, Daniel, Esther, Nehemiah)
    - *Burnout & Pressure* (Elijah, Jonah, John the Baptist)
    - *Restoration & Brotherhood* (Peter, Paul, Ruth)
- **66-Book Canon & Timeline Cross-Linking**:
  - Added 1-tap `⚔️ Launch Story Quest` deep-links directly from the Scripture Field Library for Joshua, Judges, Ruth, Nehemiah, Esther, Daniel, Jonah, and Mark.
  - Mapped all 8 new journeys into the interactive Biblical Timeline eras.
- **Word Forge & Spaced Memory Pulse Registry**:
  - Registered all 24 new act scripture anchors into `ALL_AVAILABLE_VERSES`, allowing immediate stealth puzzle memorization and multi-daily lock screen notifications.

---

## [1.3.0] - 2026-09-22

### Added
- **The Testament Canon Codex (Complete 66-Book Field Library)**:
  - Catalogs all 66 books of the biblical canon (Genesis to Revelation) through Testament's signature gritty, story-driven, anti-textbook lens.
  - Organized into 7 canonical divisions with dedicated badge counts:
    - *Torah & Origins* (5 books): Foundations of humanity, covenant, and the wilderness survival code.
    - *War & Chronicles* (12 books): Military campaigns, palace coups, espionage, and exile resistance.
    - *Wisdom & Soul Triage* (5 books): High-stakes dilemma tactics, emergency triage, and burnout antidotes.
    - *Prophet Intelligence* (17 books): Geopolitical whistleblowers, imperial infiltrators, and moral warnings.
    - *The King's Manifesto* (5 books): The counter-cultural revolution of Jesus and the explosive early church.
    - *Field Dispatches* (21 books): Tactical letters to underground cells on freedom, integrity, and action.
    - *The Cosmic Endgame* (1 book): Cosmic warfare, the fall of empire, and unshakeable hope in victory.
  - **Tactical Intel Per Book**:
    - Modern tactical codename & subtitle (e.g. *Ecclesiastes: "The Burnout Antidote"*, *Daniel: "Undercover in Babylon"*, *Nehemiah: "Project Management Under Fire"*, *James: "Faith with Teeth"*, *Revelation: "The Dragon's Defeat"*).
    - 30-Second Crisis SitRep detailing author context and historical peril.
    - "Why This Matters on Monday Morning" modern practical application.
    - Anchor scripture with 1-tap dual-lens switcher between canonical text and street translation.
  - **Full Platform Integration**:
    - Every book's anchor scripture registered in `ALL_AVAILABLE_VERSES` for immediate active recall in **Word Forge**.
    - 1-tap lock-screen **Memory Pulse** notification scheduling from any book.
    - Built-in audio narration with cinematic voice playback (`speakVerse`).
    - Direct deep-links to interactive modules (Proverbs Codex, Psalms Medic, Story Quests).
  - **Library UI & Navigation**:
    - Division switcher pills with live counts.
    - Life situation filter chips (*"Burnout & Meaning"*, *"Workplace Warfare"*, *"Anxiety & Fear"*, *"Unfair Pain"*, *"Action Over Cheap Talk"*, *"Integrity"*).
    - Instant real-time keyword search across book names, codenames, themes, and references.
    - Added "The Scripture Field Library" featured banner and top-level quick action button on the Dashboard.

---

## [1.2.0] - 2026-09-22

### Added
- **The Proverbs Tactical Codex (Solomon's High-Stakes Simulator)**:
  - Built an interactive dilemma simulator transforming the book of Proverbs into a modern tactical playbook for life, work, and relationships.
  - Added 8 high-stakes real-world scenario dilemmas across 5 battle categories:
    - *Money & Debt*: Navigating predatory get-rich-quick schemes and high-interest cosigning traps (Proverbs 22:7, 21:5).
    - *Tongue & Meetings*: Strategic tactical silence during executive ambush meetings and extinguishing office rumor fires (Proverbs 17:28, 26:20).
    - *Sluggard vs. Relentless*: The 1% compound micro-habits of the ant vs. the insidious tomorrow trap (Proverbs 6:6-8, 12:24).
    - *Ego & Brutal Feedback*: Distinguishing wound of a loyal friend from flattering poison, and diagnosing pride blind spots (Proverbs 27:6, 16:18).
    - *Toxic Allies & Boundary Warfare*: Eliminating manipulative peers and establishing clean perimeter boundaries (Proverbs 22:24-25, 13:20).
  - Included 3 distinct tactical choices per scenario with instant Solomon Debriefs explaining the psychological and spiritual mechanics of each outcome (+35 XP rewards with celebration confetti).
  - Added dual-lens translation switcher: seamlessly toggle between canonical scripture and punchy street translations.
  - Added Tactical Vault drawer to browse all proverbs by category with integrated text-to-speech audio narration.
  - Linked all Proverbs directly into the Spaced Memory Pulse notification engine and Word Forge puzzle game.

- **The Psalms Field Medic (Emergency Spiritual Triage)**:
  - Built an acute emotional emergency triage interface diagnosing modern psychological fires through David's battlefield prayers.
  - Added 6 targeted crisis triage presets:
    - *Panic Attack / Claustrophobia*: Psalm 91 (*The Fortress Protocol*).
    - *3 AM Insomnia / Racing Dread*: Psalm 4 (*The Battlefield Rest*).
    - *Betrayal by Inner Circle / Close Ally*: Psalm 55 (*The Poisoned Cup*).
    - *Guilt / Self-Disgust / Moral Failure*: Psalm 51 (*The Core Reset Protocol*).
    - *Rage at Injustice & Corrupt Winners*: Psalm 37 (*The Long Horizon Game*).
    - *Deep Grief / Soul Desert Emptiness*: Psalm 42 (*The Deep Water Well*).
  - Provided David's cave situation reports highlighting the exact physical and political peril behind the verses (Cave of Adullam, En-Gedi, fleeing his son Absalom, Nathan's confrontation).
  - Engineered 3-step field medic protocol:
    1. *Physiological Reset*: 4-7-8 tactical down-regulation breathing timer.
    2. *Vocal Anchor*: Out-loud auditory override of anxiety thought loops.
    3. *Trench Action*: Immediate physical micro-step to anchor psychological stability.
  - Integrated 1-tap ambient sound switcher (Cave Wind, Campfire Embers, Night Sanctuary) to match the triage environment.
  - Connected all Psalms to active recall in Word Forge and multi-daily Memory Pulse notifications.

- **Learner's Toolkit Expansion**:
  - Expanded the Dashboard Learner's Toolkit to 6 responsive accelerators: 60-Sec Timeline, Character Dossiers, Street Translator, "What's the Play?", Proverbs Codex, and Psalms Medic.

---

## [1.1.2] - 2026-09-22

### Fixed
- **Status Bar & Notification Shade Badge Silhouette**:
  - Replaced opaque square badge icon (`/favicon.png`) with dedicated Android-compliant monochrome alpha-mask badges (`/icons/badge-96.png`, `/icons/badge-72.png`, and `/icons/badge-48.png`).
  - Rendered a sharp, high-contrast Testament Shield, Sword, and Sacred Flame emblem in pure white on a transparent background, ensuring the phone's status bar and the notification shade header display the crisp emblem silhouette instead of a blank white/tinted square.
- **PWA & Notification Shade Large Icon Assets**:
  - Resized and cleaned `icon-192.png`, `icon-512.png`, `notification-icon.png`, `favicon.png`, and `apple-touch-icon.png` to eliminate solid white rectangular borders.
  - Ensured large icons blend into system notification cards, dark mode, and launcher squircles.

---

## [1.1.1] - 2026-09-22

### Fixed
- **Notification Schedule Deadlock**:
  - Fixed a critical timing bug where missing the 30-minute window of slot 0 (`09:00`) locked `sentToday` to `0`, preventing afternoon (`14:00`) and evening (`19:30`) slots from ever being evaluated or fired.
  - Replaced linear index tracking with discrete slot tracking (`firedSlotsToday: string[]`).
  - Added smart mid-day calibration: slots within the current window are handled smoothly while older slots are marked resolved to prevent backlog spam.
- **Mobile Sleep & Background Wakeup Support**:
  - Implemented `SCHEDULE_ALARM` and `CANCEL_ALARM` Service Worker message handlers in `public/sw.js` and `public/sw-notifications.js` to run active alarms directly in the Service Worker.
  - Added IndexedDB (`testament-notifications-db`) persistence shared between Service Worker and Window to track background-fired notifications without duplication.
  - Added instant catch-up triggers on device unlock and app resume (`visibilitychange`, `focus`, `pageshow`).
  - Added bidirectional Service Worker messaging (`TESTAMENT_ALARM_FIRED`, `TESTAMENT_TRIGGER_CHECK`).
  - Added Periodic Background Sync registration (`testament-memory-pulse`) for Android Chrome PWAs.

### Changed
- **Enhanced Schedule Status & Live Countdown**:
  - Added live "Next Reminder" countdown preview (e.g. `Next: 2:00 PM (in 15m)` or `9:00 AM Tomorrow`) on both the Dashboard Spaced Memory Pulse card and `MemoryPulseModal`.
  - Added 12-hour formatted slot status badges (`✓ 9:00 AM Sent`, `⏳ 2:00 PM Next`, `7:30 PM Upcoming`).
  - Added a "Sync Schedule" button on the Dashboard for immediate schedule verification.
  - Automatically requests notification permissions upon clicking "Activate Reminders" if not yet granted.
  - Added `testament-notifications-updated` custom event to keep UI components synchronized immediately upon settings update.

---

## [1.1.0] - 2026-09-22

### Added
- **Spaced Memory Verse Notification System**:
  - Implemented multi-daily spaced reminders for scripture retention instead of generic single-time notifications.
  - Added configurable frequency selector: 2x (Morning/Evening), 3x (Spaced / Recommended), 4x (Steady), and 5x (Memory Sprint) per day.
  - Added configurable waking hours window (e.g. 8:00 AM – 9:00 PM) to ensure notifications are non-invasive and never disturb sleep.
  - Added three gentle recall prompt styles:
    - **Opening Cue**: Provides opening words to spark active cognitive retrieval.
    - **First-Letter Cloze**: Blanks out words with initial letter hints (`H___ I n__ c________...`).
    - **Stealth Challenge**: Prompts silent recitation before tapping to verify.
  - Added instant test and 4-second delayed test options to preview lock screen notifications.
- **Story Verse Integration & Unified Registry**:
  - Created `verseRegistry.ts` uniting core memory verses with scriptures unlocked from all Story Quests (David, Moses, Elijah, Joseph, Peter, Paul).
  - Added direct **"Train This Verse (Reminders)"** action in Step 3 (*Scripture Unlocked*) of `StoryViewer`.
  - Added story metadata (Hero Name, Quest Title, Act Title) to verse models across the application.
  - Enabled **Word Forge** word assembly puzzle support for all story-unlocked scriptures.
- **Dashboard & Arsenal UI Enhancements**:
  - Added **Spaced Memory Pulse** card on the main Dashboard tracking today's progress (`1 of 3 sent`), scheduled time slots, and quick actions.
  - Added **"Memory Pulse"** shortcut in the Dashboard action bar.
  - Added **"Train Daily"** reminder buttons to every verse card in `ArsenalView`.
  - Added `MemoryPulseModal` configuration modal.
- **PWA Service Worker & Deep-Linking**:
  - Updated `public/sw.js` and created `public/sw-notifications.js` with `notificationclick` and `push` event handlers.
  - Integrated Service Worker script into `vite.config.ts` Workbox build configuration.
  - Added deep-linking so tapping a notification brings the app into focus and routes directly to the verse in **Word Forge**.
  - Added client-side scheduler heartbeat monitoring reminder slots on page focus and background interval.

### Changed
- Upgraded `App.tsx` to handle notification scheduler lifecycle and URL deep-linking parameters.
- Enhanced `WordForge.tsx` to search and match verses across both core and story scripture registries.

---

## [1.0.0] - 2026-09-21

### Initial Release
- Initial release of Testament: Interactive Graphic-Novel Bible Study Journey.
- Core Story Quests (David, Moses, Elijah, Joseph, Peter, Paul).
- Interactive Decision Crossroads and Tactical Dilemma Simulator.
- Word Forge scripture memory puzzle workbench.
- Character Dossiers, 60-Second Era Timeline, and Street Translator.
- Offline PWA support with local caching and sound effects.
