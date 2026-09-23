# Changelog

All notable changes to the **Testament** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
