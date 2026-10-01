import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Brain, 
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen,
  Shield,
  Loader2,
  ChevronDown,
  Mic,
  SlidersHorizontal
} from 'lucide-react';
import type { CanonBook } from '../data/canon';
import { soundEngine, NARRATOR_VOICES, type NarratorProfile } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';
import { VoiceSelectorModal } from './VoiceSelectorModal';
import { 
  fetchBibleChapter, 
  getBookChapterCount, 
  BIBLE_TRANSLATIONS, 
  getDefaultTranslationForLanguage,
  type BibleChapterData, 
  type TranslationId 
} from '../utils/bibleService';
import { useLanguage } from '../context/LanguageContext';
import { 
  CANON_DIVISION_I18N_KEYS, 
  CANON_LIFE_THEME_I18N_KEYS 
} from '../utils/localizedScripture';
import { registerDynamicBibleVerse, getVerseById } from '../utils/verseRegistry';
import {
  loadReadingPlace,
  loadReadingPrefs,
  saveReadingPlace,
  saveReadingPrefs,
  type ReadingFontSize,
  type ReadingLayout,
} from '../utils/readingPlace';
import { BookConnections } from './BookConnections';

interface OpenBookModalProps {
  book: CanonBook | null;
  allBooks: CanonBook[];
  onClose: () => void;
  onSelectBook: (book: CanonBook) => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
  onSaveBookmark?: (verseId: string) => boolean;
  onOpenDilemma?: (dilemmaId: string) => void;
  initialMode?: 'briefing' | 'reader';
  initialChapter?: number;
  launchToken?: number;
  highlightVerseStart?: number;
  highlightVerseEnd?: number;
}

export const OpenBookModal: React.FC<OpenBookModalProps> = ({
  book,
  allBooks,
  onClose,
  onSelectBook,
  onOpenWordForge,
  onSetMemoryVerse,
  onSelectStoryQuest,
  onSaveBookmark,
  onOpenDilemma,
  initialMode = 'briefing',
  initialChapter = 1,
  launchToken = 0,
  highlightVerseStart,
  highlightVerseEnd
}) => {
  const { t, language } = useLanguage();

  const getDivisionLabel = (id: string, fallback: string) => {
    const k = CANON_DIVISION_I18N_KEYS[id];
    return k ? t(k.label) : fallback;
  };

  const getThemeLabel = (theme: string) => {
    const k = CANON_LIFE_THEME_I18N_KEYS[theme];
    return k ? t(k) : theme;
  };

  // Navigation & View Mode
  const [activeMode, setActiveMode] = useState<'briefing' | 'reader'>(initialMode);
  const [lens, setLens] = useState<'street' | 'canonical'>('street');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReadingPrefs, setShowReadingPrefs] = useState<boolean>(false);

  // Full Scripture Reader State
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationId>(() => {
    const saved = loadReadingPlace()?.translation as TranslationId | undefined;
    if (saved) {
      const match = BIBLE_TRANSLATIONS.find(tr => tr.id === saved);
      if (match && match.language === language) return saved;
    }
    return getDefaultTranslationForLanguage(language);
  });
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [readingFontSize, setReadingFontSize] = useState<ReadingFontSize>(() => loadReadingPrefs().fontSize);
  const [readingLayout, setReadingLayout] = useState<ReadingLayout>(() => loadReadingPrefs().layout);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [isPlayingChapterAudio, setIsPlayingChapterAudio] = useState(false);
  const [activeReadingVerse, setActiveReadingVerse] = useState<number | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<NarratorProfile>(() => soundEngine.getNarratorProfile());

  const modalRef = useModalLock(book !== null);
  const readerScrollRef = useRef<HTMLDivElement | null>(null);

  // Default the active scripture translation to the matching language when app language changes
  useEffect(() => {
    const curTrans = BIBLE_TRANSLATIONS.find(tr => tr.id === selectedTranslation);
    if (!curTrans || curTrans.language !== language) {
      setSelectedTranslation(getDefaultTranslationForLanguage(language));
    }
  }, [language, selectedTranslation]);

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

  // Briefing opens clean. A launch token lands on the cited chapter in the reader.
  useEffect(() => {
    if (!book) return;
    setIsPlayingChapterAudio(false);
    setSelectedVerse(null);
    soundEngine.stopSpeaking();
    if (launchToken) {
      setSelectedChapter(initialChapter);
      setActiveMode('reader');
    } else {
      setSelectedChapter(1);
      setActiveMode('briefing');
    }
  }, [book, book?.id, launchToken, initialChapter]);

  // Smooth scroll reader to top on chapter change, or to the cited verse
  useEffect(() => {
    if (highlightVerseStart && chapterData && selectedChapter === initialChapter) {
      const el = readerScrollRef.current?.querySelector(`[data-verse="${highlightVerseStart}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    readerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedChapter, chapterData, highlightVerseStart, initialChapter]);

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
          window.dispatchEvent(new CustomEvent('testament-scripture-read'));
        }
      })
      .catch((err) => {
        if (isMounted) {
          const raw = err?.message || 'Unable to load scripture chapter';
          const friendly = /fetch|network|offline|failed/i.test(raw)
            ? 'This chapter needs a connection. Chapters you already opened still work offline.'
            : raw;
          setChapterError(friendly);
          setIsLoadingChapter(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [book, book?.name, selectedChapter, selectedTranslation, activeMode, retryNonce]);

  useEffect(() => {
    if (!book || activeMode !== 'reader') return;
    saveReadingPlace({
      bookId: book.id,
      bookName: book.name,
      chapter: selectedChapter,
      translation: selectedTranslation,
    });
  }, [book, book?.id, book?.name, selectedChapter, selectedTranslation, activeMode]);

  useEffect(() => {
    setSelectedVerse(null);
  }, [selectedChapter, book?.id]);

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
    const dynamicVerse = registerDynamicBibleVerse(reference, text, chapterData?.translation || 'WEB');

    showToast(t('reader.loadedForge', { ref: reference }));

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
    const dynamicVerse = registerDynamicBibleVerse(reference, text, chapterData?.translation || 'WEB');
    const added = onSaveBookmark ? onSaveBookmark(dynamicVerse.id) : true;
    showToast(added ? t('reader.savedArsenal', { ref: reference }) : t('reader.alreadyArsenal', { ref: reference }));
  };

  const handleCopyVerse = (verseNum: number, text: string) => {
    soundEngine.playSnap();
    const reference = `${book.name} ${selectedChapter}:${verseNum}`;
    const fullCitation = `"${text}" — ${reference} (${chapterData?.translation || 'CSB'})`;
    navigator.clipboard.writeText(fullCitation);
    showToast(t('reader.copied', { ref: reference }));
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

  const chooseFontSize = (size: ReadingFontSize) => {
    setReadingFontSize(size);
    saveReadingPrefs({ fontSize: size });
  };

  const chooseLayout = (layout: ReadingLayout) => {
    setReadingLayout(layout);
    saveReadingPrefs({ layout });
    setSelectedVerse(null);
  };

  const verseActions = (verseNum: number, text: string) => (
    <div className="mt-2 flex flex-wrap gap-1.5" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={() => handleSendVerseToForge(verseNum, text)} className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-200">Memorize</button>
      <button type="button" onClick={() => handleSaveVerseToArsenal(verseNum, text)} className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-200">Save</button>
      <button type="button" onClick={() => handleSpeakSingleVerse(verseNum, text)} className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-200">Listen</button>
      <button type="button" onClick={() => handleCopyVerse(verseNum, text)} className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-200">Copy</button>
    </div>
  );

  const fontClass = readingFontSize === 'sm'
    ? 'text-sm'
    : readingFontSize === 'lg'
      ? 'text-lg sm:text-xl'
      : readingFontSize === 'xl'
        ? 'text-xl sm:text-2xl'
        : 'text-base sm:text-lg';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 md:p-6 bg-black/90 md:backdrop-blur-md overflow-x-hidden overflow-y-auto overscroll-contain">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* The Open Leather Codex Container (Edge-to-edge full-screen on mobile, centered modal on desktop) */}
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          key={book.id}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full h-[100dvh] sm:h-auto sm:max-h-[94vh] max-w-5xl rounded-none sm:rounded-3xl bg-surface dark:bg-ink-raised border-0 sm:border border-amber-500/40 shadow-2xl dark:shadow-black/90 overflow-x-hidden flex flex-col focus:outline-none touch-pan-y"
        >
          {/* Top Header Bar (Combined with Mode Selector on Mobile) */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-stone-50 dark:bg-ink border-b border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 shrink-0 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-200/80 dark:bg-stone-850 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold shrink-0 transition-colors min-h-[36px]"
                aria-label="Back to library"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Books</span>
              </button>

              <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-500 shrink-0 hidden sm:inline" />
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold truncate">
                {book.name} <span className="hidden sm:inline">• Volume #{String(book.order).padStart(2, '0')} of 66</span>
              </span>
            </div>

            {/* Mobile Inline Mode Selector */}
            <div className="flex sm:hidden items-center p-0.5 rounded-lg bg-stone-200/70 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMode('briefing');
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeMode === 'briefing'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {t('reader.briefing')}
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMode('reader');
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeMode === 'reader'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Read
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 hidden sm:inline">
                {t('reader.flipVolumes')}
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                aria-label={t('reader.closeBook')}
                title={t('reader.closeBook')}
                className="w-8 h-8 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MODE SELECTOR BAR: TACTICAL BRIEFING vs READ FULL SCRIPTURE (Desktop only) */}
          <div className="hidden sm:flex items-center justify-between gap-2 px-3 sm:px-6 py-2 bg-stone-100/70 dark:bg-ink-raised border-b border-stone-200 dark:border-stone-800/90 shrink-0">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 shadow-xs w-full sm:w-auto sm:inline-flex">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMode('briefing');
                }}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'briefing'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('reader.briefing')}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMode('reader');
                }}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'reader'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {totalChapters > 1 ? t('reader.readCount', { count: totalChapters }) : t('reader.readCountSingle')}
                </span>
              </button>
            </div>

            {/* Quick meta indicators (desktop only) */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                {book.testament === 'OT' ? t('reader.oldTestament') : t('reader.newTestament')}
              </span>
              <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 font-semibold">
                {book.localizedDivision || getDivisionLabel(book.division, book.division)}
              </span>
            </div>
          </div>

          {/* VIEW 1: TACTICAL BRIEFING (TWO-PAGE OPEN TOME) */}
          {activeMode === 'briefing' ? (
            <div className="flex-1 overflow-x-hidden overflow-y-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800/80 bg-gradient-to-br from-stone-50 via-white to-amber-50/20 dark:from-[#12161f] dark:via-[#10131a] dark:to-[#0d1015] touch-pan-y">
              {/* LEFT PAGE: SitRep, Historical Peril, & Practical Life */}
              <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 font-bold">
                      {book.testament === 'OT' ? t('reader.oldTestament') : t('reader.newTestament')}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {book.localizedDivision || getDivisionLabel(book.division, book.division)}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-100/80 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/50 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-600 dark:text-red-400" />
                      {getThemeLabel(book.lifeTheme)}
                    </span>
                  </div>

                  {/* Title & Tactical Codename */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight">
                    {book.name}
                  </h2>
                  <p className="text-amber-800 dark:text-amber-400 font-serif text-base sm:text-lg font-bold mt-1">
                    "{book.codename}"
                  </p>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 italic leading-relaxed">
                    {book.subtitle}
                  </p>

                  {/* 30-Second Crisis SitRep */}
                  <div className="mt-6 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 p-4 space-y-3 shadow-xs">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-500/90 font-bold">
                      {t('reader.crisisSitrep')}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">{t('reader.authorContext')}</div>
                      <p className="text-xs text-stone-700 dark:text-stone-200 mt-0.5 leading-relaxed font-sans">
                        {book.authorContext}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase text-red-600 dark:text-red-400/90 font-semibold">{t('reader.historicalPeril')}</div>
                      <p className="text-xs text-stone-700 dark:text-stone-200 mt-0.5 leading-relaxed font-sans">
                        {book.historicalPeril}
                      </p>
                    </div>
                  </div>

                  {/* Why This Matters on Monday Morning */}
                  <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-100/70 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/10 border border-amber-300 dark:border-amber-600/30 p-4">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-300 font-bold mb-1">
                      {t('reader.whyItMatters')}
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
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-glow'
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
                        <Volume2 className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                        <span>Listen to Situational Voice Briefing</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT PAGE: Anchor Scripture & Action Launcher */}
              <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6 bg-stone-50/60 dark:bg-ink-raised">
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
                        <p className="text-[11px] text-amber-800 dark:text-amber-400">
                          Jump straight into full scripture with zero railroading
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-800 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Dual-Lens Scripture Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                      {t('reader.keyAnchor')}
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playSnap();
                        setLens(l => (l === 'street' ? 'canonical' : 'street'));
                      }}
                      className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-amber-400/60 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 transition-colors shadow-xs"
                    >
                      {language === 'fr' 
                        ? (lens === 'street' ? '⚡ Langage Direct Appliqué' : '📜 Texte Canonique')
                        : language === 'es'
                          ? (lens === 'street' ? '⚡ Lenguaje Directo Aplicado' : '📜 Texto Canónico')
                          : (lens === 'street' ? '⚡ Street Plain English' : '📜 Canonical Word-for-Word')}
                    </button>
                  </div>

                  {/* Scripture Text Box */}
                  <div className="rounded-2xl bg-white dark:bg-stone-950/90 border border-stone-200 dark:border-stone-800 p-5 shadow-xs dark:shadow-inner">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400 mb-2">
                      <span className="text-amber-800 dark:text-amber-400 font-bold">
                        {(() => {
                          const lv = getVerseById(book.id, language);
                          return lv ? lv.reference : book.anchorScripture.reference;
                        })()}
                      </span>
                      <span className="text-[11px] uppercase text-stone-400 dark:text-stone-500 font-semibold">
                        {lens === 'street' 
                          ? (language === 'fr' ? 'Appliqué Moderne' : language === 'es' ? 'Aplicado Moderno' : 'Modern Applied') 
                          : (getVerseById(book.id, language)?.translation || (language === 'fr' ? 'LSG 1910' : language === 'es' ? 'RVR 1960' : 'CSB / ESV'))}
                      </span>
                    </div>

                    <blockquote className="text-sm sm:text-base font-serif italic text-stone-900 dark:text-parchment-100 leading-relaxed">
                      "{(() => {
                        const lv = getVerseById(book.id, language);
                        if (lv) return lens === 'street' ? lv.plainEnglishSummary : lv.text;
                        return lens === 'street' ? book.anchorScripture.streetTranslation : book.anchorScripture.canonicalText;
                      })()}"
                    </blockquote>

                    <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-start gap-2">
                      <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 uppercase tracking-wider font-bold shrink-0 mt-0.5">
                        {language === 'fr' ? 'Règle de Base:' : language === 'es' ? 'Regla Fundamental:' : 'Ground Rule:'}
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal font-sans">
                        {(() => {
                          const lv = getVerseById(book.id, language);
                          return lv ? lv.keyTakeaway : book.anchorScripture.takeaway;
                        })()}
                      </p>
                    </div>
                  </div>

                  <BookConnections
                    book={book}
                    onOpenModule={handleLaunchDeepLink}
                    onOpenDilemma={(dilemmaId) => {
                      soundEngine.playClick();
                      onOpenDilemma?.(dilemmaId);
                      onClose();
                    }}
                  />
                </div>

                {/* Action Buttons: Word Forge & Pin Daily */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        if (onOpenWordForge) {
                          onOpenWordForge(book.id);
                          onClose();
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-xs text-stone-700 dark:text-stone-200 font-semibold transition-all shadow-xs"
                    >
                      <Brain className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                      <span>Train Word Forge</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        if (onSetMemoryVerse) {
                          onSetMemoryVerse(book.id);
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
            <div 
              ref={readerScrollRef}
              className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col bg-surface dark:bg-ink w-full max-w-full touch-pan-y"
            >
              {/* READER CONTROLS TOOLBAR */}
              <div className="sticky top-0 z-20 px-3 sm:px-6 py-2.5 bg-white/95 dark:bg-ink-raised/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 shadow-xs w-full max-w-full">
                {/* Left: Chapter Selector Controls */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    disabled={selectedChapter <= 1}
                    onClick={() => {
                      soundEngine.playPageTurn();
                      setSelectedChapter(c => Math.max(1, c - 1));
                    }}
                    className="p-1.5 sm:p-2 rounded-xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-stone-700 dark:text-stone-300 transition-colors"
                    title={t('reader.prevChapter')}
                    aria-label={t('reader.prevChapter')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Chapter Dropdown Picker with truncation */}
                  <div className="relative min-w-0 max-w-[130px] sm:max-w-xs">
                    <select
                      value={selectedChapter}
                      onChange={(e) => {
                        soundEngine.playSnap();
                        setSelectedChapter(Number(e.target.value));
                      }}
                      className="appearance-none w-full pl-2.5 sm:pl-3.5 pr-7 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 border border-amber-500/40 text-stone-900 dark:text-parchment-50 font-serif font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer truncate"
                    >
                      {Array.from({ length: totalChapters }, (_, idx) => idx + 1).map((ch) => (
                        <option key={ch} value={ch} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-parchment-100">
                          {t('reader.chOf', { current: ch, total: totalChapters })}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    disabled={selectedChapter >= totalChapters}
                    onClick={() => {
                      soundEngine.playPageTurn();
                      setSelectedChapter(c => Math.min(totalChapters, c + 1));
                    }}
                    className="p-1.5 sm:p-2 rounded-xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-stone-700 dark:text-stone-300 transition-colors"
                    title={t('reader.nextChapter')}
                    aria-label={t('reader.nextChapter')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop Reader Controls (Hidden on mobile) */}
                <div className="hidden sm:flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {/* Translation Switcher */}
                  <select
                    value={selectedTranslation}
                    onChange={(e) => {
                      soundEngine.playClick();
                      setSelectedTranslation(e.target.value as TranslationId);
                    }}
                    title={BIBLE_TRANSLATIONS.find((item) => item.id === selectedTranslation)?.label}
                    aria-label="Bible translation"
                    className="max-w-[7.5rem] px-2 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-[11px] sm:text-xs font-mono font-medium text-stone-700 dark:text-stone-300 cursor-pointer focus:outline-none"
                  >
                    {BIBLE_TRANSLATIONS.map(t => (
                      <option key={t.id} value={t.id} className="bg-white dark:bg-stone-900">
                        {t.id.toUpperCase()} ({t.language.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  {/* Reading Voice Picker Button */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsVoiceModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-250 dark:border-stone-800 text-[11px] sm:text-xs font-mono font-medium text-stone-700 dark:text-stone-300 transition-colors"
                    title="Change reading voice"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold">{NARRATOR_VOICES[currentVoice]?.name.split(' ')[0] || 'Adam'}</span>
                  </button>

                  <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    {([
                      ['sm', 'A-'],
                      ['base', 'A'],
                      ['lg', 'A+'],
                      ['xl', 'A++'],
                    ] as const).map(([size, label]) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => chooseFontSize(size)}
                        className={`px-2 py-1 rounded text-[11px] font-mono ${readingFontSize === size ? 'bg-white dark:bg-stone-800 font-bold text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
                        aria-label={`Text size ${label}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => chooseLayout('verses')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${readingLayout === 'verses' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
                    >
                      Verses
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseLayout('flow')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${readingLayout === 'flow' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
                    >
                      Flow
                    </button>
                  </div>

                  {/* Chapter Audio Reader */}
                  <button
                    onClick={handleToggleChapterAudio}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
                      isPlayingChapterAudio
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-glow'
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

                {/* Mobile Right Controls: Audio + Settings Drawer Trigger */}
                <div className="flex sm:hidden items-center gap-1.5">
                  <button
                    onClick={handleToggleChapterAudio}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all min-h-[36px] ${
                      isPlayingChapterAudio
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-glow'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 border-stone-250 dark:border-stone-800'
                    }`}
                    title="Listen to chapter"
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

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setShowReadingPrefs(true);
                    }}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-700 dark:text-stone-300 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                    title="Reading Settings (Translation, Voice, Font Size, Layout)"
                    aria-label="Reading Settings"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-800 dark:text-amber-500" />
                  </button>
                </div>
                {readingLayout === 'flow' && selectedVerse != null && chapterData?.verses.some((verse) => verse.verse === selectedVerse) && (
                  <div className="w-full pt-1 border-t border-stone-200 dark:border-stone-800">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1.5">
                      {book.name} {selectedChapter}:{selectedVerse}
                    </p>
                    {verseActions(selectedVerse, chapterData.verses.find((verse) => verse.verse === selectedVerse)?.text || '')}
                  </div>
                )}
              </div>

              {/* MOBILE READING PREFERENCES SLIDE-UP DRAWER */}
              {showReadingPrefs && (
                <div 
                  className="sm:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end"
                  onClick={() => setShowReadingPrefs(false)}
                >
                  <div 
                    className="bg-white dark:bg-ink-raised border-t-2 border-amber-500/50 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-parchment-100 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                        <span>Reading Preferences</span>
                      </h4>
                      <button
                        onClick={() => setShowReadingPrefs(false)}
                        className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Close preferences"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Translation & Voice */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block mb-1">Translation</label>
                        <select
                          value={selectedTranslation}
                          onChange={(e) => {
                            soundEngine.playClick();
                            setSelectedTranslation(e.target.value as TranslationId);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-xs font-mono font-medium text-stone-800 dark:text-stone-200 min-h-[44px]"
                        >
                          {BIBLE_TRANSLATIONS.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.id.toUpperCase()} ({t.language.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block mb-1">Narrator Voice</label>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setIsVoiceModalOpen(true);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-xs font-mono font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between min-h-[44px]"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Mic className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{NARRATOR_VOICES[currentVoice]?.name.split(' ')[0] || 'Adam'}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                        </button>
                      </div>
                    </div>

                    {/* Font Size with 44px tap targets */}
                    <div>
                      <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block mb-1">Text Size</label>
                      <div className="grid grid-cols-4 gap-2">
                        {([
                          ['sm', 'Small'],
                          ['base', 'Normal'],
                          ['lg', 'Large'],
                          ['xl', 'XL'],
                        ] as const).map(([size, label]) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => chooseFontSize(size)}
                            className={`py-3 px-1 rounded-xl text-xs font-mono min-h-[44px] flex items-center justify-center transition-all ${
                              readingFontSize === size
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                                : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Mode with 44px tap targets */}
                    <div>
                      <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block mb-1">Layout Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => chooseLayout('verses')}
                          className={`py-3 px-3 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center transition-all ${
                            readingLayout === 'verses'
                              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                              : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          Numbered Verses
                        </button>
                        <button
                          type="button"
                          onClick={() => chooseLayout('flow')}
                          className={`py-3 px-3 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center transition-all ${
                            readingLayout === 'flow'
                              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                              : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          Continuous Flow
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowReadingPrefs(false)}
                      className="w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-sm mt-2"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* SCRIPTURE TEXT CANVAS */}
              <div className="p-3.5 sm:p-8 md:p-12 max-w-3xl mx-auto w-full text-left overflow-x-hidden">
                {isLoadingChapter ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-sm font-serif text-stone-600 dark:text-stone-300">
                      Opening {book.name} Chapter {selectedChapter}...
                    </p>
                    <span className="text-[11px] font-mono text-stone-400">
                      {t('reader.loadingChapter')}
                    </span>
                  </div>
                ) : chapterError ? (
                  <div className="py-16 text-center space-y-3">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {chapterError}
                    </p>
                    <button
                      onClick={() => setRetryNonce((value) => value + 1)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                    >
                      {t('reader.retry')}
                    </button>
                  </div>
                ) : chapterData ? (
                  <div className="w-full max-w-full overflow-x-hidden">
                    {/* Chapter Header */}
                    <div className="text-center pb-5 sm:pb-8 mb-5 sm:mb-8 border-b border-stone-200 dark:border-stone-800 max-w-[65ch] mx-auto">
                      <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold block mb-1">
                        {book.name}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50">
                        Chapter {selectedChapter}
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {chapterData.verses.length} verses · {chapterData.translation}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                        Tap a verse to memorize, save, or hear it.
                      </p>
                      <BookConnections
                        book={book}
                        compact
                        onOpenModule={handleLaunchDeepLink}
                        onOpenDilemma={(dilemmaId) => {
                          soundEngine.playClick();
                          onOpenDilemma?.(dilemmaId);
                          onClose();
                        }}
                      />
                    </div>

                    <div className={`font-reading leading-[1.75] w-full max-w-[65ch] mx-auto overflow-x-hidden text-stone-800 dark:text-stone-200 ${fontClass} ${readingLayout === 'verses' ? 'space-y-4' : ''}`}>
                      {readingLayout === 'flow' ? (
                        <div>
                          <p>
                            {chapterData.verses.map((v) => {
                              const citeActive = launchToken > 0 && selectedChapter === initialChapter;
                              const isCited = citeActive && (highlightVerseStart ?? 0) > 0 && highlightVerseEnd != null
                                && v.verse >= highlightVerseStart! && v.verse <= highlightVerseEnd;
                              const isActive = selectedVerse === v.verse || activeReadingVerse === v.verse || isCited;
                              return (
                                <span
                                  key={v.verse}
                                  data-verse={v.verse}
                                  onClick={() => setSelectedVerse(v.verse)}
                                  className={`cursor-pointer rounded-sm ${isActive ? 'bg-amber-100/80 dark:bg-amber-950/50' : ''}`}
                                >
                                  <sup className="text-[0.65em] font-mono font-bold text-amber-800 dark:text-amber-400 mr-0.5 select-none">{v.verse}</sup>
                                  {v.text}{' '}
                                </span>
                              );
                            })}
                          </p>
                        </div>
                      ) : (
                        chapterData.verses.map((v) => {
                          const isSpeakingThis = activeReadingVerse === v.verse;
                          const citeActive = launchToken > 0 && selectedChapter === initialChapter;
                          const isCited = citeActive && (highlightVerseStart ?? 0) > 0 && highlightVerseEnd != null
                            && v.verse >= highlightVerseStart! && v.verse <= highlightVerseEnd;
                          const isOpen = selectedVerse === v.verse;

                          return (
                            <div
                              key={v.verse}
                              data-verse={v.verse}
                              onClick={() => setSelectedVerse(isOpen ? null : v.verse)}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                isSpeakingThis || isCited || isOpen
                                  ? 'bg-amber-100/60 dark:bg-amber-950/40 text-stone-950 dark:text-white'
                                  : 'hover:bg-stone-100/70 dark:hover:bg-stone-900/50'
                              }`}
                            >
                              <span className="inline-block text-[0.7em] font-mono font-bold text-amber-800 dark:text-amber-400 mr-2 select-none align-baseline">
                                {v.verse}
                              </span>
                              <span className="break-words">{v.text}</span>
                              {isOpen && verseActions(v.verse, v.text)}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Bottom Chapter Navigation & Quick Jump */}
                    <div className="mt-10 pt-5 border-t border-stone-200 dark:border-stone-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 w-full max-w-full overflow-x-hidden">
                      <button
                        disabled={selectedChapter <= 1}
                        onClick={() => {
                          soundEngine.playPageTurn();
                          setSelectedChapter(c => Math.max(1, c - 1));
                          readerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-850 text-xs font-bold text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                        <span>Prev Ch</span>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveMode('briefing');
                        }}
                        className="w-full sm:w-auto text-xs font-mono font-bold text-amber-800 dark:text-amber-400 hover:underline py-1 text-center order-first sm:order-none"
                      >
                        View Tactical Briefing
                      </button>

                      <button
                        disabled={selectedChapter >= totalChapters}
                        onClick={() => {
                          soundEngine.playPageTurn();
                          setSelectedChapter(c => Math.min(totalChapters, c + 1));
                          readerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-stone-950 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-colors"
                      >
                        <span>Next Ch</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
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
