# Changelog

All notable changes to the **Testament** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
