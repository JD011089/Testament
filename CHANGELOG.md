# Changelog

All notable changes to the **Testament** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
