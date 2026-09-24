import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  BookOpen, 
  Brain, 
  ShieldAlert, 
  Shield, 
  Car, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  HelpCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import type { NavTab } from './Navigation';

interface AppTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: NavTab) => void;
  onOpenDriveMode?: () => void;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  tabTarget?: NavTab;
  isDriveTarget?: boolean;
  bulletPoints: {
    title: string;
    description: string;
    icon: string;
  }[];
  quickTip: string;
  primaryActionLabel?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    badge: 'Welcome Guide',
    title: 'Welcome to Testament! 🕊️',
    subtitle: 'A simple guide to help you find your way around with ease',
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    bulletPoints: [
      {
        icon: '🌱',
        title: 'Built For Everyday Life',
        description: 'No complicated church jargon or confusing layouts. You can learn in just 3 to 5 minutes a day.'
      },
      {
        icon: '🗺️',
        title: 'Simple 5-Tab Navigation',
        description: 'Everything is organized into 5 easy sections at the top (or bottom on phones): Home, Library, Memorize, Dilemmas, and Saved.'
      },
      {
        icon: '✨',
        title: 'Go At Your Own Pace',
        description: 'You cannot make a mistake or break anything. Explore freely, or follow the guided Daily Mission!'
      }
    ],
    quickTip: 'Tip: You can re-open this guide anytime by clicking the (?) Guide button in the menu.',
    primaryActionLabel: 'Start Tour (1 Min)'
  },
  {
    id: 'home',
    badge: 'Tab 1: Home',
    title: '🏠 Home (Daily Mission & Stories)',
    subtitle: 'Your starting point every day — listen, learn, and be encouraged',
    icon: <Compass className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    tabTarget: 'dashboard',
    bulletPoints: [
      {
        icon: '🎯',
        title: 'Daily Mission',
        description: 'A friendly 4-step daily walkthrough (Story Scene → Real-Life Dilemma → Memory Verse → Bible Reflection).'
      },
      {
        icon: '☕',
        title: '45-Second Morning Audio',
        description: 'Hit the Play button at the top of Home for a warm, quick 45-second audio briefing while brewing coffee.'
      },
      {
        icon: '📖',
        title: 'Character Journeys',
        description: 'Relatable, illustrated true stories of David, Moses, Esther, Peter, Ruth, and more.'
      }
    ],
    quickTip: 'If you only have 3 minutes today, just open Home and listen to the 45-second audio!',
    primaryActionLabel: 'Jump to Home'
  },
  {
    id: 'library',
    badge: 'Tab 2: Library',
    title: '📖 Library (All 66 Books & Comfort)',
    subtitle: 'Your complete Bible library, Proverbs wisdom, and emergency comfort',
    icon: <BookOpen className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    tabTarget: 'library',
    bulletPoints: [
      {
        icon: '📚',
        title: 'Complete 66-Book Bible',
        description: 'Browse every book from Genesis to Revelation with plain-English summaries, themes, and key verses.'
      },
      {
        icon: '💡',
        title: 'Proverbs Codex',
        description: 'Practical daily advice from Solomon for work, relationships, communication, and patience.'
      },
      {
        icon: '❤️',
        title: 'Psalms Field Medic',
        description: 'Feeling stressed, anxious, tired, or grieving? Instant healing scriptures tailored to what you feel right now.'
      }
    ],
    quickTip: 'Whenever you feel overwhelmed or need prayerful encouragement, tap Psalms Field Medic.',
    primaryActionLabel: 'Jump to Library'
  },
  {
    id: 'wordforge',
    badge: 'Tab 3: Memorize',
    title: '🧠 Memorize (Word Forge)',
    subtitle: 'A fun word-tile game that makes memorizing scripture effortless',
    icon: <Brain className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    tabTarget: 'wordforge',
    bulletPoints: [
      {
        icon: '🧩',
        title: 'Word-Tile Puzzle',
        description: 'Tap words into place one phrase at a time. It feels like a calming puzzle instead of schoolwork!'
      },
      {
        icon: '⏰',
        title: 'Smart Spaced Repetition',
        description: 'The app remembers which verses you know and gently reminds you at the right time so you never forget.'
      },
      {
        icon: '🔒',
        title: 'Lock Words in Your Heart',
        description: 'Build confidence having comforting verses ready whenever you or your loved ones need strength.'
      }
    ],
    quickTip: 'Try solving just 1 verse tile puzzle a day — you will be amazed at what sticks with you!',
    primaryActionLabel: 'Jump to Memorize'
  },
  {
    id: 'dilemmas',
    badge: 'Tab 4: Dilemmas',
    title: '⚖️ Life Dilemmas (Real-World Decisions)',
    subtitle: 'See how biblical wisdom applies directly to everyday choices',
    icon: <ShieldAlert className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    tabTarget: 'dilemmas',
    bulletPoints: [
      {
        icon: '🤔',
        title: 'Real-Life Situations',
        description: 'Workplace politics, family friction, difficult boundaries, handling anger, and money stress.'
      },
      {
        icon: '🧭',
        title: '"What Would You Do?"',
        description: 'Choose between different realistic responses and see the consequences explained with scripture.'
      },
      {
        icon: '🛡️',
        title: 'Wisdom For The Real World',
        description: 'Learn why the biblical path protects your peace and relationships in everyday modern dilemmas.'
      }
    ],
    quickTip: 'Great for talking about over dinner or thinking through tough decisions at work or home.',
    primaryActionLabel: 'Jump to Dilemmas'
  },
  {
    id: 'arsenal',
    badge: 'Tab 5: Saved',
    title: '🛡️ Saved & Relics (Your Arsenal)',
    subtitle: 'Where all your favorite verses, notes, and achievements live',
    icon: <Shield className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    tabTarget: 'arsenal',
    bulletPoints: [
      {
        icon: '⭐',
        title: 'Bookmarked Verses',
        description: 'Any verse you star while reading is safely saved here for quick reading anytime.'
      },
      {
        icon: '🏅',
        title: 'Mastered Verses',
        description: 'Track all the verses you have successfully memorized with your personal mastery counter.'
      },
      {
        icon: '🏺',
        title: 'Unlocked Biblical Relics',
        description: 'Fun collectible historical artifacts you discover along your story journeys (like David’s smooth stones).'
      }
    ],
    quickTip: 'Think of this as your personal spiritual scrapbook and favorite verse binder.',
    primaryActionLabel: 'Jump to Saved'
  },
  {
    id: 'audio',
    badge: 'Bonus: Audio Mode',
    title: '🚗 Drive & Audio Mode (Hands-Free)',
    subtitle: 'Listen while walking, driving, doing chores, or relaxing in bed',
    icon: <Car className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60',
    isDriveTarget: true,
    bulletPoints: [
      {
        icon: '🎧',
        title: 'Big Buttons For Driving',
        description: 'Large, easy-to-tap controls with voice narration so your eyes can stay on the road or path.'
      },
      {
        icon: '🔥',
        title: 'Calming Ambient Soundscapes',
        description: 'Listen to a cozy crackling campfire, gentle prairie wind, or peaceful sanctuary ambience in the background.'
      },
      {
        icon: '🗣️',
        title: 'Choose Your Narrator',
        description: 'Easily select narrator voice style and speed in your audio controls.'
      }
    ],
    quickTip: 'Tap the Drive button in the top menu or bottom bar anytime you want pure audio listening.',
    primaryActionLabel: 'Open Audio Mode'
  }
];

export const AppTourModal: React.FC<AppTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenDriveMode
}) => {
  const modalRef = useModalLock(isOpen);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState<'walkthrough' | 'cheatsheet'>('walkthrough');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentStepIndex < TOUR_STEPS.length - 1 && activeViewMode === 'walkthrough') {
        setCurrentStepIndex(i => i + 1);
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0 && activeViewMode === 'walkthrough') {
        setCurrentStepIndex(i => i - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, activeViewMode, onClose]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    soundEngine.playSnap();
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    soundEngine.playClick();
    if (!isFirstStep) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const handleComplete = () => {
    soundEngine.playVictory();
    try {
      localStorage.setItem('testament_tour_completed', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleJumpToSection = (step: TourStep) => {
    soundEngine.playClick();
    try {
      localStorage.setItem('testament_tour_completed', 'true');
    } catch {
      // ignore
    }
    onClose();
    if (step.isDriveTarget && onOpenDriveMode) {
      onOpenDriveMode();
    } else if (step.tabTarget && onNavigateToTab) {
      onNavigateToTab(step.tabTarget);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-tour-title"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white dark:bg-[#12151c] text-stone-900 dark:text-parchment-100 border border-stone-200 dark:border-amber-600/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] transition-colors outline-none"
      >
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161a24] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="app-tour-title" className="text-sm sm:text-base font-serif font-bold text-stone-900 dark:text-parchment-50">
                  How To Get Around Testament
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 font-semibold">
                  Auntie-Approved Guide
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Quick, clear overview of what each button does
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher: Walkthrough vs Cheat Sheet */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-stone-200 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-[11px] font-semibold">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveViewMode('walkthrough');
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeViewMode === 'walkthrough'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Tour
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveViewMode('cheatsheet');
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeViewMode === 'cheatsheet'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Cheat Sheet
              </button>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                handleComplete();
              }}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              title="Close guide"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeViewMode === 'walkthrough' ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Step Banner */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${currentStep.iconBg} shadow-sm`}>
                    {currentStep.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                      {currentStep.badge}
                    </span>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50 leading-snug">
                      {currentStep.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      {currentStep.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2.5">
                  {currentStep.bulletPoints.map((point, idx) => (
                    <div 
                      key={idx}
                      className="p-3 sm:p-3.5 rounded-xl bg-stone-50 dark:bg-[#161a22] border border-stone-200/90 dark:border-stone-800 flex items-start gap-3 transition-colors"
                    >
                      <span className="text-xl shrink-0 mt-0.5">{point.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-parchment-100">
                          {point.title}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auntie Quick Tip */}
                <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-[#1a1f2c] border border-amber-300/70 dark:border-amber-600/40 text-xs text-stone-800 dark:text-amber-200/90 flex items-start gap-2.5">
                  <span className="text-base">💡</span>
                  <div className="leading-relaxed">
                    <strong>Rule of thumb:</strong> {currentStep.quickTip}
                  </div>
                </div>

                {/* Jump Directly to this tab (if applicable) */}
                {(currentStep.tabTarget || currentStep.isDriveTarget) && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      Want to check out this section right now?
                    </span>
                    <button
                      onClick={() => handleJumpToSection(currentStep)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                    >
                      <span>{currentStep.primaryActionLabel || 'Open Section'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* CHEAT SHEET MODE: All 5 tabs + Audio at a single glance */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-stone-700 dark:text-stone-300">
                <strong>Quick Navigation Cheat Sheet:</strong> Click any section to jump directly to it!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TOUR_STEPS.slice(1).map((step) => (
                  <div
                    key={step.id}
                    onClick={() => handleJumpToSection(step)}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-[#161a22] border border-stone-200 dark:border-stone-800 hover:border-amber-500/70 hover:bg-amber-50/50 dark:hover:bg-[#1a202c] transition-all cursor-pointer group text-left shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center shrink-0">
                        {step.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                          {step.title}
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                          {step.badge}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {step.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS & PROGRESS */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161a24] flex items-center justify-between gap-3 shrink-0">
          {activeViewMode === 'walkthrough' ? (
            <>
              {/* Back / Skip */}
              <div className="flex items-center gap-2">
                {!isFirstStep ? (
                  <button
                    onClick={handlePrev}
                    className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-parchment-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-medium transition-colors"
                  >
                    Skip Tour
                  </button>
                )}
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEngine.playClick();
                      setCurrentStepIndex(idx);
                    }}
                    title={`Go to step ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-6 bg-amber-500'
                        : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-amber-400/60'
                    }`}
                  />
                ))}
              </div>

              {/* Next / Got It */}
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>{isLastStep ? "Got It! Let's Go" : 'Next'}</span>
                {isLastStep ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Click any section above to open it.
              </span>
              <button
                onClick={handleComplete}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all"
              >
                Close Cheat Sheet
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
