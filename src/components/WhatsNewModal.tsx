import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { 
  Sparkles, 
  X, 
  Layers, 
  BookOpen, 
  Bell, 
  Zap, 
  Car, 
  ShieldAlert, 
  Target, 
  Award, 
  ChevronRight,
  Flame,
  Volume2,
  Brain,
  Compass,
  Swords,
  Languages,
  Clock,
  Calendar,
  ShieldCheck,
  Gamepad2
} from 'lucide-react';

import { APP_VERSION, APP_VERSION_NAME } from '../config/version';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReleaseMilestone {
  version: string;
  tagline: string;
  dateBadge: string;
  isLatest?: boolean;
  highlights: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

const ACTIVE_RELEASES: ReleaseMilestone[] = [
  {
    version: APP_VERSION,
    tagline: 'Trivia Gauntlet â€” A Scripture Game That Teaches',
    dateBadge: 'Current Release',
    isLatest: true,
    highlights: [
      {
        icon: <Gamepad2 className="w-4 h-4 text-amber-400" />,
        title: 'Scripture Trivia Arcade',
        description: 'A new Game tab runs a fast arcade quiz built entirely from the Bible inside the app â€” beat the clock, build combos, guard three lives, and survive a double-points boss question.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: '700+ Questions From Your Bible',
        description: 'Eight question types are generated from the verses, story quests, and all 66 books â€” which passage, match the words, fill the blank, hero and theme matching, and anchor Scriptures â€” reshuffled every run.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Learn the Passage When You Miss',
        description: 'A wrong answer pauses the round and points you straight to the Scripture â€” the exact reference, text, and a plain-language explanation â€” with one-tap practice in Practice.'
      },
      {
        icon: <Flame className="w-4 h-4 text-amber-400" />,
        title: 'Missed Questions Come Back',
        description: 'Questions you miss are saved on your device and reappear in later runs as "Review round" until you get them right, so the game keeps teaching instead of just scoring.'
      }
    ]
  },
  {
    version: 'v1.25.1',
    tagline: 'Scripture Integrity, Smarter Memory & Calmer Mobile',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Honest Scripture Labeling Everywhere',
        description: 'Every plain-English takeaway is now explicitly badged as AI reflection â€¢ Not Scripture â€” including Saved Scriptures and Memorize â€” and only verbatim WEB/KJV text is ever read aloud.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Memory You Can Trust',
        description: 'Retention is only scheduled when you grade a verse yourself. Quick Recall, Progressive Reveal, and Reset Tiles no longer inflate or double-count your progress, and tiles graduate from full words to first-letter hints as you grow.'
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        title: 'Predictable Back Button & Modals',
        description: 'The Android Back button now dismisses Settings, Proverbs, Psalms, Dossiers, Onboarding and What\'s New before ever leaving the app, with consistent focus handling across dialogs.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Balanced Home & Better Search',
        description: 'A new Your Toolkit card fills and balances the home dashboard, references like "Song of Solomon 2:1" now parse correctly, and chapter searches clamp safely with clear feedback.'
      }
    ]
  },
  {
    version: 'v1.24.0',
    tagline: 'Daybreak Redesign â€” Calmer, Simpler & Gold Lit Palette',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Daybreak Palette & Lit Gold Buttons',
        description: 'Warm parchment and celestial sunrise hues with WCAG AA compliance across light and dark modes, paired with tactile lit gold primary buttons.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Calm 3-Item Home & 4-Tab Navigation',
        description: 'Streamlined Home focusing solely on Today\'s mission, Memory verse, and Weekly series. Consolidated Practice tab combining Memorize and Dilemmas.'
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        title: 'Toned Down XP & Calmer Tone',
        description: 'Military ranks and XP distractions are toned down and quiet by default, keeping focus on Scripture and daily rhythm.'
      }
    ]
  },
  {
    version: 'v1.23.1',
    tagline: 'Bug Fixes & Native Android TWA Alignment',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        title: 'Native Wrapper Stability',
        description: 'Clean release artifacts, automated version checksums, and streamlined manifest alignment.'
      }
    ]
  },
  {
    version: 'v1.22.2',
    tagline: 'Celestial Amber Branding, Mission Audio Briefing & Native Calendar Handoff',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Celestial Amber Icon & Branding',
        description: 'Vibrant, hope-filled app icon with radiant celestial amber, dawn rays, and an illuminated heraldic crest across all mobile and PWA display targets.'
      },
      {
        icon: <Car className="w-4 h-4 text-amber-400" />,
        title: 'Drive Mode Mission Briefing (Track 0)',
        description: 'Drive mode now opens directly with Today\'s Mission briefing â€” narrating the hero, scenario, story, and scripture hands-free on your commute.'
      },
      {
        icon: <Calendar className="w-4 h-4 text-amber-400" />,
        title: 'Native Device Calendar Handoff',
        description: 'Add to Calendar routes directly to Samsung Calendar, Google Calendar, and Apple Calendar without mobile browser redirect issues.'
      },
      {
        icon: <Volume2 className="w-4 h-4 text-amber-400" />,
        title: 'Reliable Audio Recitals',
        description: 'Instant scripture and plain-English audio playback in the Saved tab with intelligent on-device neural voice fallback.'
      }
    ]
  },
  {
    version: 'v1.22.1',
    tagline: 'Post-Sweep Polish â€” Calendar Handoff, Question Parity & ADHD Clarity',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Question Parity & Zero Drift',
        description: 'Single source of truth guarantees Home Card and Decide Screen show identical scenario questions without desync.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Resilient Backstory Layer',
        description: 'Historical backstory layer ("Why this mattered then") now reliably grounds every single mission without intermittent drops.'
      },
      {
        icon: <Flame className="w-4 h-4 text-amber-400" />,
        title: 'Unified Streak Truth',
        description: 'Single unified streak calculation across header pill, navigation, and weekly recap card with weekly grace day protection.'
      }
    ]
  },
  {
    version: 'v1.21.0',
    tagline: 'Calendar Reminders â€” Replaces Push Notifications',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Calendar className="w-4 h-4 text-amber-400" />,
        title: 'Zero-Guilt Calendar Reminders',
        description: 'Morning mission (7:00 AM) and verse recall (12:30 PM) reminders directly in your phone\'s calendar. No push spam, zero server tracking.'
      },
      {
        icon: <Calendar className="w-4 h-4 text-amber-400" />,
        title: '1-Tap Google Calendar & Apple/Outlook (.ics)',
        description: 'Instant Google Calendar web links and RFC 5545 recurring .ics downloads with standard alarms and direct links back into today\'s mission.'
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        title: 'Cleaner, Lighter Experience',
        description: 'Removed legacy web push notification prompts, service worker alarm overhead, and background polling for a calm, distraction-free app.'
      }
    ]
  },
  {
    version: 'v1.20.0',
    tagline: 'Engagement Spec v2 â€” 7 Retention & Scripture Depth Features',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Locked Tomorrow Teaser ("Can\'t peek")',
        description: 'Curiosity-gap tension hook locked until tomorrow. Builds genuine anticipation without spoilers or breaking today\'s focus.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Historical Backstory Layer',
        description: 'Collapsed-by-default historical grounding: who wrote it, who these people were, and why it mattered then in 3â€“5 concrete sentences.'
      },
      {
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        title: 'Private Decision Journal',
        description: 'Reverse-chronological timeline of your exact decisions and takeaways. Saved strictly on your deviceâ€”nobody sees this but you.'
      },
      {
        icon: <Award className="w-4 h-4 text-amber-400" />,
        title: 'Anonymous Decision Stats (100% Real)',
        description: 'See how other believers weighed today\'s decision after you choose. Zero fake numbersâ€”strictly honest aggregate counts.'
      },
      {
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        title: '"Previously On..." Weekly Recap',
        description: 'A 60-second read summarizing the 7-day arc, overarching biblical thread, and what you\'ve exploredâ€”with zero guilt language.'
      },
      {
        icon: <Flame className="w-4 h-4 text-amber-400" />,
        title: 'Follow a Person: Character Arcs',
        description: 'Deep dive into 6 foundational figures (Jesus, Peter, David, Mary, Paul, Esther) across 10â€“12 pivotal moments each.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: '"Carry It With You" Lock-Screen Card',
        description: 'Generate high-res 1080Ã—1920 phone lock-screen scripture cards directly on-device with one tap to save or share.'
      }
    ]
  },
  {
    version: 'v1.19.2',
    tagline: 'Persona QA Round 2 â€” Screen Reader, ESL, Network Resilience & Trust',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Screen Reader & VoiceOver Precision',
        description: 'Decide interaction refactored with semantic fieldset, radiogroup, plain-language options, and clear disabled state hints with zero emoji noise.'
      },
      {
        icon: <Languages className="w-4 h-4 text-amber-400" />,
        title: 'Plain Language & ESL Vocabulary Support',
        description: 'Eliminated idioms from generation prompts, added tap-to-define on difficult biblical terms, and instant "Say it simpler" toggles.'
      },
      {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        title: 'Network Resilience & In-Progress Save',
        description: '3G slow-connection loading indicators with ~8s fallback, plus automatic mission step recovery when backgrounding the app.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Trust & Transparency Center',
        description: '"How Testament works" transparency page within 2 taps of Home, plus one-tap issue reporting for AI reflections.'
      }
    ]
  },
  {
    version: 'v1.19.0',
    tagline: 'Decision-First Redesign, Daily AI Pipeline & Unified Verse Recall',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Decision-First Core Loop',
        description: 'No more 40-minute reading plans or confusing clutter. The homepage opens with a single tactical card asking what you would do before showing what happened.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Daily AI Generation Pipeline',
        description: 'Vetted biblical passages dynamically generate grounded scenarios, modern retelling (â‰¤140 words), and tailored mirror-back reflections with zero offline disruptions.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Unified Memory Verse Engine & 1-Round Drills',
        description: 'Todayâ€™s mission verse automatically locks into tomorrowâ€™s quick recall flip card, backed by simplified 1-round WordForge fill-in-the-blank drills.'
      },
      {
        icon: <Flame className="w-4 h-4 text-amber-400" />,
        title: 'ADHD Streak Forgiveness & Borderless Polish',
        description: 'Weekly grace day protects your hard-earned streak from missed days, paired with clean borderless cards, instant rank-up promotions, and subtle toast notifications.'
      }
    ]
  },
  {
    version: 'v1.18.1',
    tagline: 'Gemini Engagement Polish, Direct Scripture Fidelity & Production Key Reliability',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Zero-Config Client API Reliability',
        description: 'Built-in Gemini Flash key fallback ensures AI engagement features work seamlessly in any browser environment without manual setup.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Faithful Scripture Translation Paraphrases',
        description: '"Say it simpler" generates direct, plain 10-year-old translations faithful to the exact verse text with zero canned filler.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Intelligent Off-Topic Passage Bridging',
        description: 'Story step Q&A gracefully bridges off-topic questions back to the anchor passage while strictly adhering to â‰¤3 sentence brevity.'
      }
    ]
  },
  {
    version: 'v1.18.0',
    tagline: 'Gemini-Powered Engagement: Plain-Language Reflections & Adaptive Study',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: '"What Does This Mean?" Passage Q&A',
        description: 'Ask questions directly on story passages and get concise, plain-language answers grounded strictly in the Scripture text.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: '"Say It Simpler" One-Tap Paraphrases',
        description: 'Tap any verse across story quests and the full library reader for an instant 10-year-old friendly explanation without confusing terminology.'
      },
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Personal Act Prayers & Socratic Probing',
        description: 'End each story act with an authentic prayer connecting Scripture imagery to your daily struggle, plus adaptive follow-ups in Dilemma Simulator.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Age & Life-Stage Dilemma Contexts',
        description: 'Adapt ethical dilemmas between Student, Workplace, and Family settings while preserving the core moral tension and choices.'
      }
    ]
  },
  {
    version: 'v1.17.1',
    tagline: 'Journey Stability, Memoized Scripture Loader & UX Polish',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Beginner Journey Unresponsiveness Blocker Fixed',
        description: 'Fixed an infinite render loop in the story flow that caused browser tabs to hang upon choice selection and scripture loading in the Jesus journey.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Beginner On-Ramp & Plain Language Foundation',
        description: 'Full 3-act Life of Jesus journey with "Great for Beginners" badge, plain-language CTAs, and clear library shelves.'
      }
    ]
  },
  {
    version: 'v1.17.0',
    tagline: 'Persona-Based Usability Overhaul, Plain Language & Beginner On-Ramp',
    dateBadge: 'Previous Release',
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'New to the Bible? Beginner On-Ramp & Jesus Journey',
        description: 'First-time learners now have a clear, immediate starting point on the homepage featuring the full 3-act Life of Jesus journey with the "Great for Beginners" badge.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Plain, Everyday Language Across All Controls',
        description: 'Replaced military jargon with intuitive labels (e.g., "Daily check-in", "45-second summary", "Today\'s plan", "What would you do?"). Library shelves renamed to clear book groupings.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Chunked Practice & Memory Modes',
        description: 'Memorize Scripture by short natural phrases (â‰¤8 taps), progressive reveal, or full verse assembly without cognitive overload.'
      },
      {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        title: 'ADHD-Friendly Homepage & Instant Audio Feedback',
        description: 'Single prominent daily CTA above the fold, collapsible secondary quick tools, and instant audio playing feedback with animated equalizer bars.'
      }
    ]
  },
  {
    version: 'v1.16.0',
    tagline: 'Progressive Quest Stepper, Cognitive Declutter & Mobile Optimization',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Bite-Sized 5-Step Story Quests',
        description: 'No more vertical scroll overwhelm. Quests now unfold one focused stage at a time: Decide First â†’ What Unfolded â†’ Unlocked Scripture â†’ Real Talk â†’ Wisdom Check Drill.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Compact Reader & Reading Preferences Drawer',
        description: 'Saved 53px of mobile screen space with a streamlined reader bar and an off-screen preferences drawer with full 44px touch targets for Translation, Voice, and Font Size.'
      },
      {
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        title: 'Tabbed Dilemmas & Expandable Mobile Explore',
        description: 'Dilemmas now organize into Pastoral Diagnosis vs Tactical Playbook tabs. On the Dashboard, 7 explore tools now live cleanly inside a quick-expand mobile drawer.'
      },
      {
        icon: <Volume2 className="w-4 h-4 text-amber-400" />,
        title: 'Voice Parity & Deep-Linking Back Button',
        description: 'Added 4th voice profile Rachel (Grace) across all narrator controls, trimmed mobile bottom nav to 5 columns, and enabled native mobile back-button navigation for active quests.'
      }
    ]
  },
  {
    version: 'v1.15.1',
    tagline: 'Interactive 12-Hour Custom Reminder Controls & Anti-Forced Scheduling',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'Manual 12-Hour Time Picker with Live Previews',
        description: 'Take full control over your reminder schedule. Explicitly choose Hour (1-12), Minute (:00-:55), and AM/PM before adding it to your schedule.'
      },
      {
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        title: 'No Auto-Inserted Schedules & One-Tap Quick Presets',
        description: 'Never get unwanted times forced onto your schedule. Tap quick presets (7 AM, 12 PM, 6:30 PM, 9:30 PM) or manually configure any exact time.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Inline Slot Adjustments & Clean Chronological Sync',
        description: 'Fine-tune each existing reminder with inline Hour, Minute, and AM/PM controls. Times are automatically sorted and deduplicated.'
      }
    ]
  },
];

const ARCHIVED_RELEASES: ReleaseMilestone[] = [
  {
    version: 'v1.15.0',
    tagline: 'Dynamic Gemini Discipleship AI & Authentic Custom Instincts',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Deep Gemini AI Evaluation of Your Exact Words',
        description: 'Type your authentic response to any life dilemma. Gemini dissects your exact strategy and words with pastoral discernment, custom stance titles, and 3 morning battle moves.'
      },
      {
        icon: <Swords className="w-4 h-4 text-amber-400" />,
        title: 'Custom Quest Crossroads & Multi-Turn Socratic AI',
        description: 'Type how you would handle biblical crises in Story Quests, or lock horns with the Mentor\'s Socratic counter-challenge to test your biblical tactical temperament.'
      },
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'Custom Reminder Times & Multi-Verse Queue Rotation',
        description: 'Set your exact custom notification schedule with time pickers, rotating reminders across all your trained and bookmarked verses.'
      }
    ]
  },
  {
    version: 'v1.14.0',
    tagline: 'End-to-End Mission & Library Localization',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Universal Daily Mission in French & Spanish',
        description: 'Hero tracks, tactical mission titles, virtue themes, reasons, and quest atmospheres fully adapt to your active language on the Home screen.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Localized Canon Library & Shelf Plaque Headers',
        description: 'Division descriptions, life theme chips, and "Why it matters on Monday" summaries now speak directly in French and Spanish across all 66 canonical books.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Harmonized Actions & Authentic Localized Dates',
        description: 'Step badges, action buttons ("Prendre la décision", "Lancer la simulation"), and the top dashboard date dynamically format in your chosen tongue.'
      }
    ]
  },
  {
    version: 'v1.13.0',
    tagline: 'Tri-Language Scripture & Deep Localization',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Languages className="w-4 h-4 text-amber-400" />,
        title: 'Authentic Multi-Language Scripture Reader',
        description: 'The Canon reader automatically switches to Reina-Valera 1960 for Spanish and Louis Segond 1910 for French, with dual-API resilience and instant chapter lookup.'
      },
      {
        icon: <Swords className="w-4 h-4 text-amber-400" />,
        title: 'Localized Practice & Daily Truth',
        description: 'Scripture tiles in Practice rebuild dynamically in Spanish and French with accurate punctuation, while daily anchors and briefings speak in your chosen tongue.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Unified Tri-Language Tactical Codex',
        description: 'Proverbs, Psalms, Dilemmas, and Story Quests now feature hand-crafted, culturally accurate biblical translations across English, Spanish, and French.'
      }
    ]
  },
  {
    version: 'v1.12.0',
    tagline: 'A Library You Can Keep Reading',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'A Book List You Can Scan',
        description: 'The Library opens as a list with why each book matters. Continue reading picks up your last chapter, and the shelf is still there when you want it.'
      },
      {
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        title: 'Jump to a Verse',
        description: 'Search John 3:16 or Psalm 23:1 and the reader opens that passage. Type size and verse or flow layout stay as you left them.'
      },
      {
        icon: <Swords className="w-4 h-4 text-amber-400" />,
        title: 'From the Chapter into the Rest of the App',
        description: 'Tap a verse to memorize, save, listen, or copy it. A book also offers its story, Proverbs, or Psalms, and any dilemma that cites it.'
      }
    ]
  },
  {
    version: 'v1.11.0',
    tagline: 'Faster Pages, Real Links, and Safer Narration',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Volume2 className="w-4 h-4 text-amber-400" />,
        title: 'Narration Without a Client Key',
        description: 'Listen buttons ask the server for a voice. If that service is unavailable, your browser reads the passage instead.'
      },
      {
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        title: 'Lighter Scenes and a Smaller Install',
        description: 'Story art loads as smaller WebP and AVIF images. Audio is fetched when you play it, so the first install no longer downloads every narration file.'
      },
      {
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        title: 'Pages You Can Open and Go Back From',
        description: 'Library, Memorize, Dilemmas, and Saved have their own addresses. The install card waits until calibration is done, and the home actions scroll on a phone.'
      }
    ]
  },
  {
    version: 'v1.10.0',
    tagline: 'One Mission, the Real Passage, and a Simpler Practice',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'One Daily Mission',
        description: 'Home shows a single mission shaped by your check-in, the verse that is due, and how much time you have. The alternate track list is gone.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Quests Open the Real Passage',
        description: 'After you decide, the scripture step loads the cited verses from the Bible. Read this chapter opens that book in the Library with those verses marked.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Clearer Memorize Practice',
        description: 'Hints reveal only the next word. New verses start as first letters. Show me stays visible until you hide it, and it counts as reviewing the verse again.'
      }
    ]
  },
  {
    version: 'v1.9.3',
    tagline: 'Enterprise-Grade Web Push & PWA App Badging',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'Native Web Push & Zero-Cost Supabase Sync',
        description: 'Subscribes your device to Web Push notifications and syncs encrypted push endpoints directly to Supabase so you can receive memory scripture prompts even when the app is completely closed.'
      },
      {
        icon: <Award className="w-4 h-4 text-amber-400" />,
        title: 'Home Screen App Badging',
        description: 'Your PWA home screen icon now displays an unread practice badge whenever daily memory verse challenges are awaiting review.'
      },
      {
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        title: 'Notification Triggers & Exact Safari Timers',
        description: 'Utilizes native Chromium TimestampTrigger for scheduled delivery alongside exact-second in-memory fallback timers for iOS Safari.'
      }
    ]
  },
  {
    version: 'v1.9.2',
    tagline: 'Seamless Borderless Design & Full-Screen Mobile Modals',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'App-Wide Border Elimination',
        description: 'Stripped 4-sided boxed card outlines, harsh borders, and drop shadows across the entire app. Daily campaigns, arsenal cards, dilemma simulators, and workbench now flow seamlessly on the background canvas.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Full-Screen Mobile Readers & Modals',
        description: 'All dialogsâ€”including the 66-Book Scripture Reader, Canon Codex, Timeline, Dossiers, and Spaced Memory Pulseâ€”now open edge-to-edge on mobile touchscreens with zero horizontal scroll.'
      },
      {
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        title: 'Distraction-Free Reading Focus',
        description: "Softened dividers, native list layouts, and dedicated mobile back-navigation give you maximum immersion in God's Word without box fatigue."
      }
    ]
  },
  {
    version: 'v1.9.0',
    tagline: 'Full 66-Book Scripture Reader, Voice Engine & Clean Mobile Aesthetic',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Complete 66-Book Scripture Reader',
        description: 'Unrestricted chapter and verse reading across all 66 books of the Bible. Seamlessly jump to any chapter, adjust typography, listen to audio narration, and send any verse directly to Practice or your Tactical Arsenal.'
      },
      {
        icon: <Volume2 className="w-4 h-4 text-amber-400" />,
        title: 'App-Wide Reading Voice Selector',
        description: 'Choose your preferred reading voice across the entire app with live preview samples. Select from Adam (Cinematic & Deep), Antoni (Calm & Grounded), George (Authoritative Scholar), or Rachel (Grace & Peace).'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Streamlined Mobile & Unified Action Bar',
        description: 'De-cluttered the mobile layout by unifying Field Guide, Light/Dark Theme, streak, and XP into a single command row, giving you maximum screen space for scripture.'
      }
    ]
  },
  {
    version: 'v1.8.0',
    tagline: 'Background Notifications & IDB-Persisted Alarms',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'True Background Scripture Reminders',
        description: 'Memory verse reminders now appear in your system notification bar even when the app tab is closed. Alarms are stored in IndexedDB so they survive Service Worker restarts.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'No More Burst Notifications on App Open',
        description: 'Fixed the bug where opening the app triggered 3 missed reminders at once. The SW and app now share alarm state via IDB, so each slot fires exactly once.'
      }
    ]
  },
  {
    version: 'v1.7.0',
    tagline: 'Desktop Layout Overhaul & Socratic Tactical AI',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        title: 'Desktop Top Nav & 2-Column Command Center',
        description: 'Clean frosted-glass top navigation on desktop, streamlined morning command bar, and all 14 Quests right above the fold with zero banner fatigue.'
      },
      {
        icon: <Swords className="w-4 h-4 text-amber-400" />,
        title: 'Multi-Turn Socratic AI & Virtue Archetypes',
        description: 'Turn 2 interactive probe analyzes your answers for tactical blind spots and categorizes your instincts into 6 biblical virtue archetypes (Nathan, Abigail, Solomon, etc.).'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'FSRS Spaced Repetition & Multi-Tier Memory',
        description: 'Cognitive science spaced repetition schedules review drills with 3 progressive scaffolding tiers: Builder, Ghost Letters, and Blind Recall.'
      },
      {
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        title: 'Tactical Nexus Knowledge Graph & Consequence Ripples',
        description: 'Contextually links story crises to historical Psalms, adversary psychological dossiers, and modern workplace dilemmas with cross-act consequence tracking.'
      }
    ]
  },
  {
    version: 'v1.6.1',
    tagline: 'PWA Background Updates & Push Notifications',
    dateBadge: 'Previous Release',
    isLatest: false,
    highlights: [
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'Background & Open Update Push Notifications',
        description: 'When a new version is released, receive an OS-level system push notification ("ðŸš€ Update Available: Tap to update and open") on mobile lock screens and desktop.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'In-App Update Banner & 1-Tap Refresh',
        description: 'A floating alert banner appears when updates are waiting. Tapping "Update & Open" activates the new version instantly.'
      },
      {
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        title: 'Proactive Periodic Sync',
        description: 'Checks for updates whenever you open the app, switch back from another tab or app, and on an automatic 15-minute background cadence.'
      }
    ]
  },
  {
    version: 'v1.6.0',
    tagline: 'Daily Guided Missions & Connected Battle Paths',
    dateBadge: 'Previous Release',
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: 'Daily Guided Campaign System',
        description: 'No more wandering around aimlessly. Follow a curated 4-step daily path: Story Quest Act â†’ "What\'s the Play?" Dilemma â†’ Practice Memory Lock â†’ Scriptorium Codex Briefing.'
      },
      {
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        title: 'Dual Mode Switcher: Guided vs. Free Roam',
        description: 'Choose between structured daily mentorship campaigns or freeform open sandbox exploration across all 14 quests and 66 books.'
      },
      {
        icon: <Award className="w-4 h-4 text-amber-400" />,
        title: '14 Curated Hero Tracks with Bonus XP',
        description: 'Pick any of the 14 hero campaign tracks at will (David, Joseph, Moses, Daniel, Esther, Peter, Paul, etc.) and claim +150 XP on completion.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'In-App Release Dispatcher',
        description: 'Stay up to date with new features as the app evolves with full historical milestone archives.'
      }
    ]
  },
  {
    version: 'v1.5.0',
    tagline: '3D Interactive Bookshelf Scriptorium',
    dateBadge: 'Major Update',
    highlights: [
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Physical Wooden Bookshelves',
        description: 'Browse the 66-Book Field Library as physical volumes organized on wooden shelves across 7 canonical divisions with carved brass plaques.'
      },
      {
        icon: <Volume2 className="w-4 h-4 text-amber-400" />,
        title: 'Tactile Web Audio Physics',
        description: 'Procedural synthesized audio effects simulate leather friction sliding when pulling books and parchment paper rustle when turning pages.'
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: '3D Open Codex Reader',
        description: 'Clicking any book opens a two-page ancient leather spread with dual-lens street vs. canonical translation, narration, and arrow-key volume flipping.'
      }
    ]
  },
  {
    version: 'v1.4.0',
    tagline: 'The Complete 66-Book Scripture Field Library',
    dateBadge: 'Major Update',
    highlights: [
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'All 66 Biblical Volumes Unlocked',
        description: 'Every book from Genesis to Revelation translated into real-world Monday morning tactical intelligence with situational anchor scriptures.'
      },
      {
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        title: 'Dual-Lens Translation Switcher',
        description: 'Toggle between Street Plain English (zero textbook jargon) and Canonical Word-for-Word scripture across the entire canon.'
      }
    ]
  },
  {
    version: 'v1.3.0',
    tagline: 'Spaced Memory Pulse & Background Notifications',
    dateBadge: 'Major Update',
    highlights: [
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'Automated Multi-Daily Memory Pulse',
        description: 'Background scheduler delivers verses to your device throughout the day (1x to 8x daily) using spaced repetition algorithms.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        title: 'Instant Sync & One-Tap Test Prompts',
        description: 'Test prompts directly on mobile or desktop and sync with your daily routine.'
      }
    ]
  },
  {
    version: 'v1.2.0',
    tagline: 'The Anti-Textbook Learner\'s Toolkit',
    dateBadge: 'Major Update',
    highlights: [
      {
        icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
        title: '"What\'s the Play?" Dilemma Simulator',
        description: 'Compare real-world Flesh Reactions with The Biblical Play across modern workplace, family, and burnout crises.'
      },
      {
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        title: '60-Sec Timeline & Character Dossiers',
        description: 'Explore the Bible across 6 distinct historical eras and inspect superpowers and fatal flaws of 14 biblical leaders.'
      },
      {
        icon: <Flame className="w-4 h-4 text-amber-400" />,
        title: 'Proverbs Codex & Psalms Field Medic',
        description: 'Quick-access tactical playbooks for Solomon\'s practical wisdom and emergency emotional triage.'
      }
    ]
  },
  {
    version: 'v1.1.0',
    tagline: 'Drive Audio Mode & Ambient Soundscapes',
    dateBadge: 'Feature Update',
    highlights: [
      {
        icon: <Car className="w-4 h-4 text-amber-400" />,
        title: 'Hands-Free Commuter Theater',
        description: 'Listen to quests and scripture on the road with high-contrast large buttons and automatic act advancement.'
      },
      {
        icon: <Volume2 className="w-4 h-4 text-amber-400" />,
        title: 'Atmospheric Ambience Engine',
        description: 'Immerse your study in campfire crackle, desert wind, and sanctuary acoustic backgrounds.'
      }
    ]
  },
  {
    version: 'v1.0.0',
    tagline: 'Core Genesis: 14 Quests & Practice',
    dateBadge: 'Initial Launch',
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: '14 Gritty Biblical Story Quests',
        description: 'Historical depth, psychological perspectives, and decision choices in the sandals of David, Moses, Elijah, and Paul.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Practice Memory Engine',
        description: 'Multi-sensory scripture memory using interactive block builders, cloze deletion puzzles, and typing speed runs.'
      },
      {
        icon: <Award className="w-4 h-4 text-amber-400" />,
        title: 'XP, Ranks & Relic Collection',
        description: 'Earn rank titles from Seeker to Iron Pillar while unlocking legendary historical relics.'
      }
    ]
  }
];

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useModalLock(isOpen);
  const [activeTab, setActiveTab] = useState<string>(APP_VERSION);
  const [showArchive, setShowArchive] = useState(false);

  const RELEASES = showArchive ? [...ACTIVE_RELEASES, ...ARCHIVED_RELEASES] : ACTIVE_RELEASES;

  const handleDismiss = () => {
    soundEngine.playClick();
    try {
      localStorage.setItem('testament_last_seen_version', APP_VERSION_NAME);
    } catch {
      // ignore
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selectedRelease = RELEASES.find(r => r.version === activeTab) || RELEASES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
          onClick={handleDismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsnew-modal-title"
        >
          <motion.div 
            ref={modalRef}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl bg-white dark:bg-gradient-to-b dark:from-[#161a24] dark:via-[#10131c] dark:to-[#0c0e14] border-0 sm:border-2 border-amber-400 dark:border-amber-500/50 shadow-none sm:shadow-2xl flex flex-col text-left overflow-hidden relative outline-none"
          >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800/90 flex items-center justify-between gap-4 relative z-10 bg-stone-50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-gradient-to-br dark:from-amber-500/30 dark:to-amber-600/10 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-800 dark:text-amber-400 shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="whatsnew-modal-title" className="text-lg sm:text-xl font-serif font-black text-stone-900 dark:text-parchment-50">
                  Field Update Dispatches
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold">
                  {APP_VERSION} Live
                </span>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400">
                Chronological evolution and major features built in Testament
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERSION SELECTOR PILLS */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-stone-200 dark:border-stone-800/60 bg-stone-100/70 dark:bg-black/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {RELEASES.map((release) => {
            const isSelected = release.version === activeTab;
            return (
              <button
                key={release.version}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(release.version);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
                }`}
              >
                <span>{release.version}</span>
                {release.isLatest && (
                  <span className={`text-[11px] px-1 py-0.2 rounded-full uppercase ${
                    isSelected ? 'bg-black/20 text-stone-950 font-extrabold' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400'
                  }`}>
                    New
                  </span>
                )}
              </button>
            );
          })}
          {!showArchive && (
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowArchive(true);
              }}
              className="text-xs px-3 py-1.5 rounded-xl font-mono whitespace-nowrap bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all"
            >
              + Archive (v1.0â€“v1.16.0)
            </button>
          )}
          {showArchive && (
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowArchive(false);
                setActiveTab('v1.17.0');
              }}
              className="text-xs px-3 py-1.5 rounded-xl font-mono whitespace-nowrap bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
            >
              âˆ’ Hide Archive
            </button>
          )}
        </div>

        {/* RELEASE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800/60">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                {selectedRelease.dateBadge}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-100">
                {selectedRelease.version}: {selectedRelease.tagline}
              </h3>
            </div>
            {selectedRelease.isLatest && (
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full font-bold shrink-0">
                ✓ Installed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {selectedRelease.highlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800/90 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-800 dark:text-amber-400">
                  {highlight.icon}
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-amber-800 dark:text-amber-200 mb-0.5">
                    {highlight.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800/90 bg-stone-50 dark:bg-black/40 flex items-center justify-between gap-3 relative z-10">
          <div className="text-xs font-mono text-stone-500 dark:text-stone-400 hidden sm:block">
            Testament {APP_VERSION} â€¢ The Living Word
          </div>


          <button
            onClick={handleDismiss}
            className="btn-primary w-full sm:w-auto text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <span>Got It â€¢ Enter Field HQ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
