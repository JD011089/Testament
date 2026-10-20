import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Compass,
  ArrowRight,
  ScrollText,
} from 'lucide-react';
import { SeriesPickerModal } from './SeriesPickerModal';
import { LibraryBrowseSheet } from './LibraryBrowseSheet';
import { getActiveSeriesState, getSeriesDayNumber, type ActiveSeriesState } from '../utils/weeklySeriesEngine';
import { getWeeklySeriesById } from '../data/weeklySeries';
import {
  CANON_BOOKS,
  type CanonBook,
} from '../data/canon';
import { OpenBookModal } from './OpenBookModal';
import { PageHeader } from './PageHeader';
import { soundEngine } from '../utils/audio';
import { parseScriptureReference } from '../utils/scriptureRef';
import { findCanonBookByName } from '../utils/bookLinks';
import { getBookChapterCount } from '../utils/bibleService';
import { loadReadingPlace, loadVisitedChapters, type ReadingPlace } from '../utils/readingPlace';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedCanonBook } from '../utils/localizedScripture';

interface CanonLibraryPageProps {
  onBackToDashboard: () => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
  onSaveBookmark?: (verseId: string) => boolean;
  onOpenDilemma?: (dilemmaId: string) => void;
  passageTarget?: { book: string; chapter: number; verseStart: number; verseEnd: number } | null;
  onPassageOpened?: () => void;
}

export const CanonLibraryPage: React.FC<CanonLibraryPageProps> = ({
  onBackToDashboard,
  onOpenWordForge,
  onSetMemoryVerse,
  onSelectStoryQuest,
  onSaveBookmark,
  onOpenDilemma,
  passageTarget,
  onPassageOpened,
}) => {
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [browseTestament, setBrowseTestament] = useState<'OT' | 'NT' | null>(null);
  const [activeBookForModal, setActiveBookForModal] = useState<CanonBook | null>(null);
  const [readerLaunch, setReaderLaunch] = useState<{
    token: number;
    chapter: number;
    verseStart: number;
    verseEnd: number;
  } | null>(null);
  const [readingPlace, setReadingPlace] = useState<ReadingPlace | null>(() => loadReadingPlace());
  const [visited, setVisited] = useState<Record<string, number>>(() => loadVisitedChapters());
  const [activeSeriesState, setActiveSeriesState] = useState<ActiveSeriesState | null>(() => getActiveSeriesState());
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const launchSeq = useRef(0);

  useEffect(() => {
    const refresh = () => {
      setReadingPlace(loadReadingPlace());
      setVisited(loadVisitedChapters());
      setActiveSeriesState(getActiveSeriesState());
    };
    window.addEventListener('testament-reading-place', refresh);
    window.addEventListener('testament-series-changed', refresh);
    return () => {
      window.removeEventListener('testament-reading-place', refresh);
      window.removeEventListener('testament-series-changed', refresh);
    };
  }, []);

  const openReader = (book: CanonBook, chapter?: number, verseStart = 0, verseEnd = 0) => {
    const saved = loadVisitedChapters()[book.id];
    launchSeq.current += 1;
    setReaderLaunch({
      token: launchSeq.current,
      chapter: chapter ?? saved ?? 1,
      verseStart,
      verseEnd,
    });
    setActiveBookForModal(book);
  };

  const openBriefing = (book: CanonBook) => {
    setReaderLaunch(null);
    setActiveBookForModal(book);
  };

  useEffect(() => {
    if (!passageTarget) return;
    const book = findCanonBookByName(passageTarget.book);
    if (book) openReader(book, passageTarget.chapter, passageTarget.verseStart, passageTarget.verseEnd);
  }, [passageTarget]);

  const localizedBooks = useMemo(() => {
    return CANON_BOOKS.map((b) => getLocalizedCanonBook(b, language));
  }, [language]);

  const passageQuery = useMemo(() => {
    const parsed = parseScriptureReference(searchQuery.trim());
    if (!parsed) return null;
    const book = findCanonBookByName(parsed.book);
    if (!book) return null;
    const chapters = getBookChapterCount(book.name);
    if (parsed.chapter < 1 || parsed.chapter > chapters) return null;
    return { book, chapter: parsed.chapter, verseStart: parsed.verseStart, verseEnd: parsed.verseEnd };
  }, [searchQuery]);

  const searchHits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || passageQuery) return [];
    return localizedBooks
      .filter((b) => {
        return (
          b.name.toLowerCase().includes(q) ||
          b.codename.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.lifeTheme.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [localizedBooks, searchQuery, passageQuery]);

  const otCount = useMemo(() => localizedBooks.filter((b) => b.testament === 'OT').length, [localizedBooks]);
  const ntCount = useMemo(() => localizedBooks.filter((b) => b.testament === 'NT').length, [localizedBooks]);

  const openPortal = (testament: 'OT' | 'NT') => {
    soundEngine.playClick();
    setBrowseTestament(testament);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-ink text-stone-900 dark:text-parchment-100 transition-colors pb-2 md:pb-6 pt-4 sm:pt-6 overflow-x-hidden w-full max-w-full">
      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 overflow-x-hidden w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line dark:border-stone-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onBackToDashboard();
              }}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-full bg-surface-raised dark:bg-stone-900/90 border border-line dark:border-stone-800 text-fg-secondary hover:text-accent-text transition-all text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{t('library.backToDashboard')}</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent-text font-bold min-w-0">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('library.scriptorium')}</span>
            </div>
          </div>
        </div>

        <PageHeader
          className="pt-4 pb-3"
          eyebrow={t('library.heroBadge')}
          eyebrowIcon={<Sparkles className="w-3.5 h-3.5 text-accent" />}
          title={t('library.heroTitle')}
          subtitle={t('library.heroSubtitleFront')}
        />

        {readingPlace && (
          <button
            type="button"
            onClick={() => {
              const book = CANON_BOOKS.find((item) => item.id === readingPlace.bookId);
              if (!book) return;
              soundEngine.playClick();
              openReader(book, readingPlace.chapter);
            }}
            className="w-full mb-4 flex items-center justify-between gap-3 rounded-2xl bg-accent/10 border border-accent/40 px-4 py-3 text-left hover:bg-accent/15 transition-colors"
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-accent-text font-bold">
                {t('library.continueReading')}
              </div>
              <div className="text-title-3 text-fg">
                {readingPlace.bookName} {readingPlace.chapter}
              </div>
            </div>
            <BookOpen className="w-5 h-5 text-accent shrink-0" />
          </button>
        )}

        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('library.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && passageQuery) {
                  soundEngine.playClick();
                  openReader(
                    passageQuery.book,
                    passageQuery.chapter,
                    passageQuery.verseStart,
                    passageQuery.verseEnd
                  );
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-raised dark:bg-stone-900/90 border border-line dark:border-stone-800 text-fg placeholder-fg-muted text-xs focus:outline-none focus:border-accent transition-colors font-sans shadow-xs min-h-[44px]"
            />
          </div>

          {passageQuery && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                openReader(
                  passageQuery.book,
                  passageQuery.chapter,
                  passageQuery.verseStart,
                  passageQuery.verseEnd
                );
              }}
              className="w-full flex items-center justify-between gap-3 rounded-2xl bg-surface-raised dark:bg-stone-900 border border-accent/50 px-4 py-3 text-left hover:border-accent transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-accent-text">{t('library.openPassage')}</div>
                <div className="font-serif text-base font-bold text-fg">
                  {passageQuery.book.name} {passageQuery.chapter}:{passageQuery.verseStart}
                  {passageQuery.verseEnd !== passageQuery.verseStart ? `–${passageQuery.verseEnd}` : ''}
                </div>
              </div>
              <BookOpen className="w-4 h-4 text-accent" />
            </button>
          )}

          {searchHits.length > 0 && (
            <ul className="rounded-2xl border border-line bg-surface-raised dark:bg-stone-900 overflow-hidden divide-y divide-line dark:divide-stone-800">
              {searchHits.map((book) => (
                <li key={book.id}>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      openReader(book, visited[book.id]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors flex items-center justify-between gap-2 min-h-[44px]"
                  >
                    <span className="font-serif font-bold text-fg">{book.name}</span>
                    <span className="text-[11px] font-mono text-fg-muted">
                      {book.testament === 'OT' ? t('library.otShort') : t('library.ntShort')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <motion.button
            type="button"
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => openPortal('OT')}
            className="rounded-3xl border border-line bg-surface-raised dark:bg-stone-900 p-5 text-left shadow-[0_8px_28px_rgba(31,35,48,0.05)] hover:border-accent/50 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-3">
              <ScrollText className="w-5 h-5" />
            </div>
            <div className="text-title-3 text-fg">{t('library.ot')}</div>
            <p className="text-small text-fg-muted mt-1">{t('library.otPortalHint')}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-accent-text">
              <span>{t('library.bookCount', { count: otCount })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => openPortal('NT')}
            className="rounded-3xl border border-line bg-surface-raised dark:bg-stone-900 p-5 text-left shadow-[0_8px_28px_rgba(31,35,48,0.05)] hover:border-accent/50 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-secondary/20 border border-secondary/40 text-secondary-text flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-title-3 text-fg">{t('library.nt')}</div>
            <p className="text-small text-fg-muted mt-1">{t('library.ntPortalHint')}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-secondary-text">
              <span>{t('library.bookCount', { count: ntCount })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSnap();
            setIsSeriesModalOpen(true);
          }}
          className="w-full mb-6 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-accent-text font-bold">
                {t('library.seriesBadge')}
              </div>
              <div className="text-sm font-semibold text-fg truncate">
                {activeSeriesState
                  ? t('library.seriesActiveDay', {
                      title: getWeeklySeriesById(activeSeriesState.seriesId)?.title || t('library.seriesFallback'),
                      day: getSeriesDayNumber(activeSeriesState),
                    })
                  : t('library.seriesExplore')}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-accent shrink-0" />
        </button>

        <OpenBookModal
          key={activeBookForModal ? `${activeBookForModal.id}-${readerLaunch?.token ?? 'brief'}` : 'closed'}
          book={activeBookForModal}
          allBooks={localizedBooks}
          onClose={() => {
            setActiveBookForModal(null);
            setReaderLaunch(null);
            onPassageOpened?.();
          }}
          onSelectBook={(b) => openReader(b, visited[b.id])}
          onOpenWordForge={onOpenWordForge}
          onSetMemoryVerse={onSetMemoryVerse}
          onSelectStoryQuest={onSelectStoryQuest}
          onSaveBookmark={onSaveBookmark}
          onOpenDilemma={onOpenDilemma}
          initialMode={readerLaunch ? 'reader' : 'briefing'}
          initialChapter={readerLaunch?.chapter ?? 1}
          launchToken={readerLaunch?.token ?? 0}
          highlightVerseStart={readerLaunch && readerLaunch.verseStart > 0 ? readerLaunch.verseStart : undefined}
          highlightVerseEnd={readerLaunch && readerLaunch.verseEnd > 0 ? readerLaunch.verseEnd : undefined}
        />

        <SeriesPickerModal
          isOpen={isSeriesModalOpen}
          onClose={() => setIsSeriesModalOpen(false)}
        />

        <AnimatePresence>
          {browseTestament && (
            <LibraryBrowseSheet
              key={browseTestament}
              testament={browseTestament}
              books={localizedBooks}
              visited={visited}
              onClose={() => setBrowseTestament(null)}
              onOpenReader={(book, chapter) => openReader(book, chapter)}
              onOpenBriefing={(book) => openBriefing(book)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
