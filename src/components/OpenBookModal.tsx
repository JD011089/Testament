import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Brain, 
  ExternalLink, 
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen,
  Shield,
  Bookmark,
  Copy,
  Loader2,
  ChevronDown,
  Mic
} from 'lucide-react';
import type { CanonBook } from '../data/canon';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { VoiceSelectorModal } from './VoiceSelectorModal';
import { 
  fetchBibleChapter, 
  getBookChapterCount, 
  BIBLE_TRANSLATIONS, 
  type BibleChapterData, 
  type TranslationId 
} from '../utils/bibleService';
import { registerDynamicBibleVerse } from '../utils/verseRegistry';

interface OpenBookModalProps {
  book: CanonBook | null;
  allBooks: CanonBook[];
  onClose: () => void;
  onSelectBook: (book: CanonBook) => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
  initialMode?: 'briefing' | 'reader';
  initialChapter?: number;
}

export const OpenBookModal: React.FC<OpenBookModalProps> = ({
  book,
  allBooks,
  onClose,
  onSelectBook,
  onOpenWordForge,
  onSetMemoryVerse,
  onSelectStoryQuest,
  initialMode = 'briefing',
  initialChapter = 1
}) => {
  // Navigation & View Mode
  const [activeMode, setActiveMode] = useState<'briefing' | 'reader'>(initialMode);
  const [lens, setLens] = useState<'street' | 'canonical'>('street');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Full Scripture Reader State
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationId>('web');
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [readingFontSize, setReadingFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isPlayingChapterAudio, setIsPlayingChapterAudio] = useState(false);
  const [activeReadingVerse, setActiveReadingVerse] = useState<number | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());

  const modalRef = useModalLock(book !== null);

  const totalChapters = book ? getBookChapterCount(book.name) : 1;

  useEffect(() => {
    const handleVoiceChange = (e: Event) => {
      const custom = e as CustomEvent<NarratorProfile>;
      if (custom.detail) setCurrentVoice(custom.detail);
    };
    window.addEventListener('testament-voice-changed', handleVoiceChange);
    return () => window.removeEventListener('testament-voice-changed', handleVoiceChange);
  }, []);

  // Cleanup speech on unmount or book change
  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, [book]);

  // Reset chapter to 1 when book changes
  useEffect(() => {
    setSelectedChapter(1);
    setIsPlayingChapterAudio(false);
    soundEngine.stopSpeaking();
  }, [book?.id]);

  // Fetch chapter data when in reader mode or when book/chapter/translation changes
  useEffect(() => {
    if (!book || activeMode !== 'reader') return;

    let isMounted = true;
    setIsLoadingChapter(true);
    setChapterError(null);

    fetchBibleChapter(book.name, selectedChapter, selectedTranslation)
      .then((data) => {
        if (isMounted) {
          setChapterData(data);
          setIsLoadingChapter(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setChapterError(err.message || 'Unable to load scripture chapter');
          setIsLoadingChapter(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [book?.name, selectedChapter, selectedTranslation, activeMode]);

  const currentIndex = book ? allBooks.findIndex(b => b.id === book.id) : -1;
  const prevBook = currentIndex > 0 ? allBooks[currentIndex - 1] : null;
  const nextBook = currentIndex >= 0 && currentIndex < allBooks.length - 1 ? allBooks[currentIndex + 1] : null;

  const goToNext = useCallback(() => {
    if (nextBook) {
      soundEngine.playPageTurn();
      setIsPlayingAudio(false);
      setIsPlayingChapterAudio(false);
      soundEngine.stopSpeaking();
      onSelectBook(nextBook);
    }
  }, [nextBook, onSelectBook]);

  const goToPrev = useCallback(() => {
    if (prevBook) {
      soundEngine.playPageTurn();
      setIsPlayingAudio(false);
      setIsPlayingChapterAudio(false);
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
      } else if (e.key === 'ArrowRight' && activeMode === 'briefing') {
        goToNext();
      } else if (e.key === 'ArrowLeft' && activeMode === 'briefing') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, goToNext, goToPrev, onClose, activeMode]);

  if (!book) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleBriefingAudio = () => {
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

  const handleToggleChapterAudio = () => {
    if (isPlayingChapterAudio) {
      soundEngine.stopSpeaking();
      setIsPlayingChapterAudio(false);
    } else {
      if (!chapterData || chapterData.verses.length === 0) return;
      soundEngine.stopSpeaking();
      soundEngine.playClick();
      setIsPlayingChapterAudio(true);

      const fullChapterText = `${book.name} Chapter ${selectedChapter}. ` +
        chapterData.verses.map(v => `${v.verse}. ${v.text}`).join(' ');

      soundEngine.speakVerse(fullChapterText, () => setIsPlayingChapterAudio(false));
    }
  };

  const handleSpeakSingleVerse = (verseNum: number, text: string) => {
    soundEngine.stopSpeaking();
    soundEngine.playClick();
    setIsPlayingChapterAudio(false);
    setActiveReadingVerse(verseNum);
    soundEngine.speakVerse(`${book.name} ${selectedChapter}:${verseNum}. ${text}`, () => {
      setActiveReadingVerse(null);
    });
  };

  const handleSendVerseToForge = (verseNum: number, text: string) => {
    soundEngine.playVictory();
    const reference = `${book.name} ${selectedChapter}:${verseNum}`;
    const dynamicVerse = registerDynamicBibleVerse(reference, text, 'CSB');

    showToast(`"${reference}" loaded into Word Forge!`);

    if (onOpenWordForge) {
      setTimeout(() => {
        onOpenWordForge(dynamicVerse.id);
        onClose();
      }, 400);
    }
  };

  const handleSaveVerseToArsenal = (verseNum: number, text: string) => {
    soundEngine.playSnap();
    const reference = `${book.name} ${selectedChapter}:${verseNum}`;
    const dynamicVerse = registerDynamicBibleVerse(reference, text, 'CSB');

    try {
      const stored = localStorage.getItem('testament_bookmarked_verses');
      const bookmarks: string[] = stored ? JSON.parse(stored) : [];
      if (!bookmarks.includes(dynamicVerse.id)) {
        bookmarks.push(dynamicVerse.id);
        localStorage.setItem('testament_bookmarked_verses', JSON.stringify(bookmarks));
        window.dispatchEvent(new CustomEvent('testament-verse-bookmarked', { detail: dynamicVerse.id }));
        showToast(`Saved ${reference} to your Tactical Arsenal!`);
      } else {
        showToast(`${reference} is already in your Arsenal.`);
      }
    } catch (e) {
      showToast(`Saved ${reference} to Arsenal!`);
    }
  };

  const handleCopyVerse = (verseNum: number, text: string) => {
    soundEngine.playSnap();
    const reference = `${book.name} ${selectedChapter}:${verseNum}`;
    const fullCitation = `"${text}" — ${reference} (${chapterData?.translation || 'CSB'})`;
    navigator.clipboard.writeText(fullCitation);
    showToast(`Copied ${reference} to clipboard!`);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* The Open Leather Codex Container */}
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          key={book.id}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-5xl rounded-3xl bg-white dark:bg-[#12151d] border border-amber-500/40 dark:border-amber-500/40 shadow-2xl dark:shadow-black/90 overflow-hidden flex flex-col my-auto max-h-[94vh] transition-colors focus:outline-none"
        >
          {/* Top Brass Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-stone-50 dark:bg-[#0c0e14] border-b border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
              <span className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold truncate">
                {book.name} • Volume #{String(book.order).padStart(2, '0')} of 66
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 hidden sm:inline">
                Use ← / → to flip volumes
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                aria-label="Close book"
                className="w-8 h-8 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MODE SELECTOR BAR: TACTICAL BRIEFING vs READ FULL SCRIPTURE */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-stone-100/70 dark:bg-[#10131b] border-b border-stone-200 dark:border-stone-800/90">
            <div className="inline-flex p-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 shadow-xs">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMode('briefing');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'briefing'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>🛡️ Tactical Briefing</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMode('reader');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'reader'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📖 Read Scripture ({totalChapters} Chs)</span>
              </button>
            </div>

            {/* Quick meta indicators */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                {book.testament === 'OT' ? 'Old Testament' : 'New Testament'}
              </span>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                {book.division}
              </span>
            </div>
          </div>

          {/* VIEW 1: TACTICAL BRIEFING (TWO-PAGE OPEN TOME) */}
          {activeMode === 'briefing' ? (
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800/80 bg-gradient-to-br from-stone-50 via-white to-amber-50/20 dark:from-[#12161f] dark:via-[#10131a] dark:to-[#0d1015]">
              {/* LEFT PAGE: SitRep, Historical Peril, & Practical Life */}
              <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 font-bold">
                      {book.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {book.division}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100/80 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/50 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-600 dark:text-red-400" />
                      {book.lifeTheme}
                    </span>
                  </div>

                  {/* Title & Tactical Codename */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight">
                    {book.name}
                  </h2>
                  <p className="text-amber-700 dark:text-amber-400 font-serif text-base sm:text-lg font-bold mt-1">
                    "{book.codename}"
                  </p>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 italic leading-relaxed">
                    {book.subtitle}
                  </p>

                  {/* 30-Second Crisis SitRep */}
                  <div className="mt-6 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 p-4 space-y-3 shadow-xs">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-500/90 font-bold">
                      ⚡ 30-Second Crisis SitRep
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">Author & Context</div>
                      <p className="text-xs text-stone-700 dark:text-stone-200 mt-0.5 leading-relaxed font-sans">
                        {book.authorContext}
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400/90 font-semibold">Historical Peril</div>
                      <p className="text-xs text-stone-700 dark:text-stone-200 mt-0.5 leading-relaxed font-sans">
                        {book.historicalPeril}
                      </p>
                    </div>
                  </div>

                  {/* Why This Matters on Monday Morning */}
                  <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-100/70 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/10 border border-amber-300 dark:border-amber-600/30 p-4">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-300 font-bold mb-1">
                      🎯 Why This Matters on Monday Morning
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-parchment-200 leading-relaxed font-sans">
                      {book.whyItMattersMonday}
                    </p>
                  </div>
                </div>

                {/* Audio Listen Bar */}
                <div className="pt-2">
                  <button
                    onClick={handleToggleBriefingAudio}
                    className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                      isPlayingAudio
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-glow-gold'
                        : 'bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-500/50 shadow-xs'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-4 h-4 animate-pulse" />
                        <span>Pause Dramatic Voice Briefing</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Listen to Situational Voice Briefing</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT PAGE: Anchor Scripture & Action Launcher */}
              <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6 bg-stone-50/60 dark:bg-[#0f131a]">
                <div>
                  {/* Jump Straight to Chapter Reader Banner */}
                  <div 
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveMode('reader');
                    }}
                    className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/40 text-left cursor-pointer transition-all shadow-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-serif font-bold text-stone-900 dark:text-parchment-100">
                          Read All {totalChapters} Chapters & Verses
                        </div>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                          Jump straight into full scripture with zero railroading
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Dual-Lens Scripture Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                      Anchor Scripture
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playSnap();
                        setLens(l => (l === 'street' ? 'canonical' : 'street'));
                      }}
                      className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-amber-400/60 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 transition-colors shadow-xs"
                    >
                      Lens: {lens === 'street' ? '⚡ Street Plain English' : '📜 Canonical Word-for-Word'}
                    </button>
                  </div>

                  {/* Scripture Text Box */}
                  <div className="rounded-2xl bg-white dark:bg-stone-950/90 border border-stone-200 dark:border-stone-800 p-5 shadow-xs dark:shadow-inner">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400 mb-2">
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{book.anchorScripture.reference}</span>
                      <span className="text-[10px] uppercase text-stone-400 dark:text-stone-500 font-semibold">
                        {lens === 'street' ? 'Modern Applied' : 'CSB / ESV'}
                      </span>
                    </div>

                    <blockquote className="text-sm sm:text-base font-serif italic text-stone-900 dark:text-parchment-100 leading-relaxed">
                      "{lens === 'street' ? book.anchorScripture.streetTranslation : book.anchorScripture.canonicalText}"
                    </blockquote>

                    <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-start gap-2">
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bold shrink-0 mt-0.5">
                        Ground Rule:
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal font-sans">
                        {book.anchorScripture.takeaway}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Launch Deep-Link (If Quest / Proverbs / Psalms available) */}
                  {book.deepLinkId && (
                    <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-100/80 via-white to-amber-50/60 dark:from-amber-950/40 dark:via-stone-900 dark:to-amber-950/20 border border-amber-300 dark:border-amber-500/50 p-4 shadow-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Interactive Module Ready</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                            Experience {book.name}'s dilemmas through experiential simulation.
                          </p>
                        </div>

                        <button
                          onClick={handleLaunchDeepLink}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-sans tracking-wide flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                        >
                          <span>Launch Journey</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Word Forge & Pin Daily */}
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
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-xs text-stone-700 dark:text-stone-200 font-semibold transition-all shadow-xs"
                    >
                      <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Train Word Forge</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        if (onSetMemoryVerse) {
                          onSetMemoryVerse(`canon-${book.id}`);
                          showToast(`Anchor scripture pinned to daily practice!`);
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-xs text-stone-700 dark:text-stone-200 font-semibold transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Pin Daily Anchor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 2: FULL SCRIPTURE CHAPTER & VERSE READER */
            <div className="flex-1 overflow-y-auto flex flex-col bg-[#fcfbfa] dark:bg-[#0c0e14]">
              {/* READER CONTROLS TOOLBAR */}
              <div className="sticky top-0 z-20 px-4 sm:px-6 py-3 bg-white/95 dark:bg-[#12161f]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                {/* Left: Chapter Selector Controls */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={selectedChapter <= 1}
                    onClick={() => {
                      soundEngine.playPageTurn();
                      setSelectedChapter(c => Math.max(1, c - 1));
                    }}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-stone-700 dark:text-stone-300 transition-colors"
                    title="Previous chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Chapter Dropdown Picker */}
                  <div className="relative">
                    <select
                      value={selectedChapter}
                      onChange={(e) => {
                        soundEngine.playSnap();
                        setSelectedChapter(Number(e.target.value));
                      }}
                      className="appearance-none px-3.5 py-1.5 pr-8 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 border border-amber-500/40 text-stone-900 dark:text-parchment-50 font-serif font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {Array.from({ length: totalChapters }, (_, idx) => idx + 1).map((ch) => (
                        <option key={ch} value={ch} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-parchment-100">
                          {book.name} Chapter {ch} of {totalChapters}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    disabled={selectedChapter >= totalChapters}
                    onClick={() => {
                      soundEngine.playPageTurn();
                      setSelectedChapter(c => Math.min(totalChapters, c + 1));
                    }}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-stone-700 dark:text-stone-300 transition-colors"
                    title="Next chapter"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Translation, Font Size & Audio */}
                <div className="flex items-center gap-2">
                  {/* Translation Switcher */}
                  <select
                    value={selectedTranslation}
                    onChange={(e) => {
                      soundEngine.playClick();
                      setSelectedTranslation(e.target.value as TranslationId);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 cursor-pointer focus:outline-none"
                  >
                    {BIBLE_TRANSLATIONS.map(t => (
                      <option key={t.id} value={t.id} className="bg-white dark:bg-stone-900">
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Reading Voice Picker Button */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsVoiceModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-250 dark:border-stone-800 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 transition-colors"
                    title="Change reading voice"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Voice:</span>
                    <span className="font-bold">{NARRATOR_VOICES[currentVoice]?.name.split(' ')[0] || 'Adam'}</span>
                  </button>

                  {/* Font Size Selector */}
                  <div className="hidden sm:inline-flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <button
                      onClick={() => setReadingFontSize('sm')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${readingFontSize === 'sm' ? 'bg-white dark:bg-stone-800 font-bold' : 'text-stone-500'}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setReadingFontSize('base')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${readingFontSize === 'base' ? 'bg-white dark:bg-stone-800 font-bold' : 'text-stone-500'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setReadingFontSize('lg')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${readingFontSize === 'lg' ? 'bg-white dark:bg-stone-800 font-bold' : 'text-stone-500'}`}
                    >
                      A+
                    </button>
                  </div>

                  {/* Chapter Audio Reader */}
                  <button
                    onClick={handleToggleChapterAudio}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isPlayingChapterAudio
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-glow-gold'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 border-stone-250 dark:border-stone-800'
                    }`}
                    title="Listen to full chapter"
                  >
                    {isPlayingChapterAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SCRIPTURE TEXT CANVAS */}
              <div className="p-4 sm:p-8 md:p-12 max-w-3xl mx-auto w-full text-left">
                {isLoadingChapter ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-sm font-serif text-stone-600 dark:text-stone-300">
                      Opening {book.name} Chapter {selectedChapter}...
                    </p>
                    <span className="text-[11px] font-mono text-stone-400">
                      Loading scripture verses
                    </span>
                  </div>
                ) : chapterError ? (
                  <div className="py-16 text-center space-y-3">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {chapterError}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedChapter(selectedChapter);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                    >
                      Retry Loading Chapter
                    </button>
                  </div>
                ) : chapterData ? (
                  <div>
                    {/* Chapter Header */}
                    <div className="text-center pb-6 sm:pb-8 mb-6 sm:mb-8 border-b border-stone-200 dark:border-stone-800">
                      <span className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold block mb-1">
                        {book.name}
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50">
                        Chapter {selectedChapter}
                      </h2>
                      <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-1">
                        {chapterData.verses.length} Verses • {chapterData.translation}
                      </p>
                    </div>

                    {/* Verses Container */}
                    <div className={`space-y-3.5 font-reading leading-relaxed ${
                      readingFontSize === 'sm' ? 'text-sm' : readingFontSize === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                    }`}>
                      {chapterData.verses.map((v) => {
                        const isSpeakingThis = activeReadingVerse === v.verse;

                        return (
                          <div
                            key={v.verse}
                            className={`group relative p-2.5 -mx-2.5 rounded-xl transition-colors ${
                              isSpeakingThis 
                                ? 'bg-amber-100/60 dark:bg-amber-950/40 text-stone-950 dark:text-white' 
                                : 'hover:bg-stone-100/70 dark:hover:bg-stone-900/50 text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            <span className="inline-block text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 mr-2 select-none align-baseline">
                              {v.verse}
                            </span>
                            <span>{v.text}</span>

                            {/* Tactical Quick Action Icons on hover / focus */}
                            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 inline-flex items-center gap-1.5 ml-2 align-middle transition-opacity">
                              {/* Train in Word Forge */}
                              <button
                                onClick={() => handleSendVerseToForge(v.verse, v.text)}
                                className="p-1 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-black text-stone-600 dark:text-stone-300 transition-colors shadow-xs"
                                title="Memorize in Word Forge"
                              >
                                <Brain className="w-3.5 h-3.5" />
                              </button>

                              {/* Save to Arsenal */}
                              <button
                                onClick={() => handleSaveVerseToArsenal(v.verse, v.text)}
                                className="p-1 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-black text-stone-600 dark:text-stone-300 transition-colors shadow-xs"
                                title="Save to Arsenal"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>

                              {/* Read / Listen to Verse */}
                              <button
                                onClick={() => handleSpeakSingleVerse(v.verse, v.text)}
                                className="p-1 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-black text-stone-600 dark:text-stone-300 transition-colors shadow-xs"
                                title="Speak this verse"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Copy Citation */}
                              <button
                                onClick={() => handleCopyVerse(v.verse, v.text)}
                                className="p-1 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-black text-stone-600 dark:text-stone-300 transition-colors shadow-xs"
                                title="Copy verse"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Chapter Navigation & Quick Jump */}
                    <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
                      <button
                        disabled={selectedChapter <= 1}
                        onClick={() => {
                          soundEngine.playPageTurn();
                          setSelectedChapter(c => Math.max(1, c - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-850 text-xs font-bold text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Chapter</span>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveMode('briefing');
                        }}
                        className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        View Tactical Briefing
                      </button>

                      <button
                        disabled={selectedChapter >= totalChapters}
                        onClick={() => {
                          soundEngine.playPageTurn();
                          setSelectedChapter(c => Math.min(totalChapters, c + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-stone-950 disabled:opacity-30 disabled:pointer-events-none shadow-xs"
                      >
                        <span>Next Chapter</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Toast Notification Popup */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono font-bold shadow-xl border border-stone-700 dark:border-stone-300 flex items-center gap-2 pointer-events-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* App-Wide Reading Voice Selector Modal */}
          <VoiceSelectorModal
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
