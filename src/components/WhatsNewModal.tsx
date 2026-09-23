import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '../utils/audio';
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
  Brain
} from 'lucide-react';

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

const RELEASES: ReleaseMilestone[] = [
  {
    version: 'v1.6.1',
    tagline: 'PWA Background Updates & Push Notifications',
    dateBadge: 'Current Release',
    isLatest: true,
    highlights: [
      {
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        title: 'Background & Open Update Push Notifications',
        description: 'When a new version is released, receive an OS-level system push notification ("🚀 Update Available: Tap to update and open") on mobile lock screens and desktop.'
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
        description: 'No more wandering around aimlessly. Follow a curated 4-step daily path: Story Quest Act → "What\'s the Play?" Dilemma → Word Forge Memory Lock → Scriptorium Codex Briefing.'
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
    tagline: 'Core Genesis: 14 Quests & Word Forge',
    dateBadge: 'Initial Launch',
    highlights: [
      {
        icon: <Target className="w-4 h-4 text-amber-400" />,
        title: '14 Gritty Biblical Story Quests',
        description: 'Historical depth, psychological perspectives, and decision choices in the sandals of David, Moses, Elijah, and Paul.'
      },
      {
        icon: <Brain className="w-4 h-4 text-amber-400" />,
        title: 'Word Forge Memory Engine',
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
  const [activeTab, setActiveTab] = useState<string>('v1.6.1');

  const handleDismiss = () => {
    soundEngine.playClick();
    try {
      localStorage.setItem('testament_last_seen_version', '1.6.1');
    } catch {
      // ignore
    }
    onClose();
  };

  const selectedRelease = RELEASES.find(r => r.version === activeTab) || RELEASES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-gradient-to-b from-[#161a24] via-[#10131c] to-[#0c0e14] border-2 border-amber-500/50 shadow-2xl flex flex-col text-left overflow-hidden relative"
          >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-stone-800/90 flex items-center justify-between gap-4 relative z-10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow-amber shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-black text-parchment-50">
                  Field Update Dispatches
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  v1.6.0 Live
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Chronological evolution and major features built in Testament
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERSION SELECTOR PILLS */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-stone-800/60 bg-black/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
                    ? 'bg-amber-500 text-black font-bold shadow-glow-amber'
                    : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>{release.version}</span>
                {release.isLatest && (
                  <span className={`text-[9px] px-1 py-0.2 rounded-full uppercase ${
                    isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RELEASE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-800/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                {selectedRelease.dateBadge}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-parchment-100">
                {selectedRelease.version}: {selectedRelease.tagline}
              </h3>
            </div>
            {selectedRelease.isLatest && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full font-bold shrink-0">
                ✓ Installed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {selectedRelease.highlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/90 hover:border-amber-500/40 transition-all flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  {highlight.icon}
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-amber-200 mb-0.5">
                    {highlight.title}
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-stone-800/90 bg-black/40 flex items-center justify-between gap-3 relative z-10">
          <div className="text-[11px] font-mono text-stone-400 hidden sm:block">
            Testament v1.6.0 • Built with Next-Gen Biblical Education
          </div>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-glow-amber transition-all"
          >
            <span>Got It • Enter Field HQ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
