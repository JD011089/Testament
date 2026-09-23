import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Brain, 
  Bell, 
  ExternalLink, 
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import type { CanonBook } from '../data/canon';
import { soundEngine } from '../utils/audio';

interface OpenBookModalProps {
  book: CanonBook | null;
  allBooks: CanonBook[];
  onClose: () => void;
  onSelectBook: (book: CanonBook) => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
}

export const OpenBookModal: React.FC<OpenBookModalProps> = ({
  book,
  allBooks,
  onClose,
  onSelectBook,
  onOpenWordForge,
  onSetMemoryVerse,
  onSelectStoryQuest
}) => {
  const [lens, setLens] = useState<'street' | 'canonical'>('street');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, [book]);

  const currentIndex = book ? allBooks.findIndex(b => b.id === book.id) : -1;
  const prevBook = currentIndex > 0 ? allBooks[currentIndex - 1] : null;
  const nextBook = currentIndex >= 0 && currentIndex < allBooks.length - 1 ? allBooks[currentIndex + 1] : null;

  const goToNext = useCallback(() => {
    if (nextBook) {
      soundEngine.playPageTurn();
      setIsPlayingAudio(false);
      soundEngine.stopSpeaking();
      onSelectBook(nextBook);
    }
  }, [nextBook, onSelectBook]);

  const goToPrev = useCallback(() => {
    if (prevBook) {
      soundEngine.playPageTurn();
      setIsPlayingAudio(false);
      soundEngine.stopSpeaking();
      onSelectBook(prevBook);
    }
  }, [prevBook, onSelectBook]);

  // Keyboard navigation for flipping through the library
  useEffect(() => {
    if (!book) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playClick();
        onClose();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, goToNext, goToPrev, onClose]);

  if (!book) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      soundEngine.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      soundEngine.stopSpeaking();
      soundEngine.playClick();
      setIsPlayingAudio(true);

      const scriptureText = lens === 'street'
        ? book.anchorScripture.streetTranslation
        : book.anchorScripture.canonicalText;

      const narrationText = `${book.name}. Tactical Codename: ${book.codename}. ${book.subtitle}. Why this matters on Monday: ${book.whyItMattersMonday}. Scripture anchor, ${book.anchorScripture.reference}: ${scriptureText}`;

      soundEngine.speakVerse(narrationText, () => setIsPlayingAudio(false));
    }
  };

  const handleLaunchDeepLink = () => {
    soundEngine.playVictory();
    if (book.deepLinkType === 'story' && book.deepLinkId && onSelectStoryQuest) {
      onSelectStoryQuest(book.deepLinkId);
      onClose();
    } else if (book.deepLinkType === 'proverbs') {
      window.dispatchEvent(new CustomEvent('open-proverbs-codex'));
      onClose();
    } else if (book.deepLinkType === 'psalms') {
      window.dispatchEvent(new CustomEvent('open-psalms-medic'));
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* The Open Leather Codex Container */}
        <motion.div
          key={book.id}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-5xl rounded-3xl bg-[#141820] border-2 border-amber-600/40 shadow-2xl shadow-black/90 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Top Brass Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f1217] border-b border-stone-800 text-stone-300">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                The Scripture Field Library • Volume #{String(book.order).padStart(2, '0')} of 66
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-stone-400 hidden sm:inline">
                Use ← / → arrows to flip volumes
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                aria-label="Close book"
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TWO-PAGE OPEN TOME LAYOUT */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-800/80 bg-gradient-to-br from-[#12161f] via-[#10131a] to-[#0d1015]">
            {/* LEFT PAGE: SitRep, Historical Peril, & Practical Life */}
            <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6">
              <div>
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                    {book.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                    {book.division}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-800/50 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    {book.lifeTheme}
                  </span>
                </div>

                {/* Title & Tactical Codename */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-parchment-50 leading-tight">
                  {book.name}
                </h2>
                <p className="text-amber-400 font-serif text-base sm:text-lg font-bold mt-1">
                  "{book.codename}"
                </p>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 italic leading-relaxed">
                  {book.subtitle}
                </p>

                {/* 30-Second Crisis SitRep */}
                <div className="mt-6 rounded-2xl bg-stone-900/80 border border-stone-800 p-4 space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-amber-500/90 font-bold">
                    ⚡ 30-Second Crisis SitRep
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-stone-400">Author & Context</div>
                    <p className="text-xs text-stone-200 mt-0.5 leading-relaxed font-sans">
                      {book.authorContext}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-red-400/90">Historical Peril</div>
                    <p className="text-xs text-stone-200 mt-0.5 leading-relaxed font-sans">
                      {book.historicalPeril}
                    </p>
                  </div>
                </div>

                {/* Why This Matters on Monday Morning */}
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-amber-900/10 border border-amber-600/30 p-4">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold mb-1">
                    🎯 Why This Matters on Monday Morning
                  </div>
                  <p className="text-xs sm:text-sm text-parchment-200 leading-relaxed font-sans">
                    {book.whyItMattersMonday}
                  </p>
                </div>
              </div>

              {/* Audio Listen Bar */}
              <div className="pt-2">
                <button
                  onClick={handleToggleAudio}
                  className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-black border-amber-400 shadow-glow-gold'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700 hover:border-amber-500/50'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-4 h-4 animate-pulse" />
                      <span>Pause Dramatic Voice Briefing</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Listen to Situational Voice Briefing</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT PAGE: Anchor Scripture, Translations & Launch Actions */}
            <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6 bg-[#0f131a]">
              <div>
                {/* Dual-Lens Scripture Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                    Anchor Scripture
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playSnap();
                      setLens(l => (l === 'street' ? 'canonical' : 'street'));
                    }}
                    className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 border border-amber-500/40 text-amber-300 transition-colors"
                  >
                    Lens: {lens === 'street' ? '⚡ Street Plain English' : '📜 Canonical Word-for-Word'}
                  </button>
                </div>

                {/* Scripture Text Box */}
                <div className="rounded-2xl bg-stone-950/90 border border-stone-800 p-5 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-2">
                    <span className="text-amber-400 font-bold">{book.anchorScripture.reference}</span>
                    <span className="text-[10px] uppercase text-stone-500">
                      {lens === 'street' ? 'Modern Applied' : 'CSB / ESV'}
                    </span>
                  </div>

                  <blockquote className="text-sm sm:text-base font-serif italic text-parchment-100 leading-relaxed">
                    "{lens === 'street' ? book.anchorScripture.streetTranslation : book.anchorScripture.canonicalText}"
                  </blockquote>

                  <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-start gap-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold shrink-0 mt-0.5">
                      Ground Rule:
                    </span>
                    <p className="text-xs text-stone-300 leading-normal font-sans">
                      {book.anchorScripture.takeaway}
                    </p>
                  </div>
                </div>

                {/* Interactive Launch Deep-Link (If Quest / Proverbs / Psalms available) */}
                {book.deepLinkId && (
                  <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/20 border border-amber-500/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Interactive Module Ready</span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1">
                          Experience {book.name}'s dilemmas through experiential simulation.
                        </p>
                      </div>

                      <button
                        onClick={handleLaunchDeepLink}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-sans tracking-wide flex items-center gap-1.5 shrink-0 shadow-glow-gold transition-all"
                      >
                        <span>Launch Journey</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Word Forge & Memory Pulse */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      if (onOpenWordForge) {
                        onOpenWordForge(`canon-${book.id}`);
                        onClose();
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-xs text-stone-200 font-semibold transition-all"
                  >
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    <span>Train Word Forge</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      if (onSetMemoryVerse) {
                        onSetMemoryVerse(`canon-${book.id}`);
                        showToast(`Anchored ${book.anchorScripture.reference} to Memory Pulse!`);
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-xs text-stone-200 font-semibold transition-all"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Set Memory Pulse</span>
                  </button>
                </div>

                {/* Bottom Volume Pager Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                  <button
                    onClick={goToPrev}
                    disabled={!prevBook}
                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{prevBook ? prevBook.name : 'First Volume'}</span>
                  </button>

                  <span className="text-[11px] font-mono text-stone-500">
                    {book.order} / 66
                  </span>

                  <button
                    onClick={goToNext}
                    disabled={!nextBook}
                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium"
                  >
                    <span>{nextBook ? nextBook.name : 'Last Volume'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
