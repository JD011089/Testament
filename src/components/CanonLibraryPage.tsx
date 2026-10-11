import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  ArrowLeft, 
  Layers, 
  List, 
  Sparkles, 
  Flame,
  Compass,
  ArrowRight
} from 'lucide-react';
import { SeriesPickerModal } from './SeriesPickerModal';
import { getActiveSeriesState, getSeriesDayNumber, type ActiveSeriesState } from '../utils/weeklySeriesEngine';
import { getWeeklySeriesById } from '../data/weeklySeries';
import { 
  CANON_BOOKS, 
  CANON_DIVISIONS, 
  CANON_LIFE_THEMES, 
  type CanonBook 
} from '../data/canon';
import { BookSpine } from './BookSpine';
import { OpenBookModal } from './OpenBookModal';
import { soundEngine } from '../utils/audio';
import { parseScriptureReference } from '../utils/scriptureRef';
import { findCanonBookByName } from '../utils/bookLinks';
import { getBookChapterCount } from '../utils/bibleService';
import { loadReadingPlace, loadVisitedChapters, type ReadingPlace } from '../utils/readingPlace';
import { useLanguage } from '../context/LanguageContext';
import { 
  getLocalizedCanonBook, 
  CANON_DIVISION_I18N_KEYS, 
  CANON_LIFE_THEME_I18N_KEYS 
} from '../utils/localizedScripture';

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
  onPassageOpened
}) => {
  const { t, language } = useLanguage();

  const getDivisionLabel = (id: string, fallback: string) => {
    const k = CANON_DIVISION_I18N_KEYS[id];
    return k ? t(k.label) : fallback;
  };

  const getDivisionDesc = (id: string, fallback: string) => {
    const k = CANON_DIVISION_I18N_KEYS[id];
    return k ? t(k.desc) : fallback;
  };

  const getThemeLabel = (theme: string) => {
    const k = CANON_LIFE_THEME_I18N_KEYS[theme];
    return k ? t(k) : theme;
  };

  const [viewMode, setViewMode] = useState<'list' | 'shelf'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'All' | 'OT' | 'NT'>('All');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [selectedTheme, setSelectedTheme] = useState<string>('All Themes');
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
    return CANON_BOOKS.map(b => getLocalizedCanonBook(b, language));
  }, [language]);

  const filteredBooks = useMemo(() => {
    return localizedBooks.filter((b) => {
      // Testament filter
      if (selectedTestament !== 'All' && b.testament !== selectedTestament) return false;
      // Division filter
      if (selectedDivision !== 'All' && b.division !== selectedDivision) return false;
      // Life Theme filter
      if (selectedTheme !== 'All Themes' && b.lifeTheme !== selectedTheme) return false;
      // Search query
      if (searchQuery.trim()) {
        const parsed = parseScriptureReference(searchQuery.trim());
        if (parsed) {
          const jump = findCanonBookByName(parsed.book);
          if (jump) return b.id === jump.id;
        }
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesCodename = b.codename.toLowerCase().includes(q);
        const matchesSubtitle = b.subtitle.toLowerCase().includes(q);
        const matchesTheme = b.lifeTheme.toLowerCase().includes(q);
        const matchesRef = b.anchorScripture.reference.toLowerCase().includes(q);
        const matchesText = b.anchorScripture.canonicalText.toLowerCase().includes(q) ||
                            b.anchorScripture.streetTranslation.toLowerCase().includes(q);
        return matchesName || matchesCodename || matchesSubtitle || matchesTheme || matchesRef || matchesText;
      }
      return true;
    });
  }, [localizedBooks, selectedTestament, selectedDivision, selectedTheme, searchQuery]);

  // Group books by division for authentic library shelving
  const shelvedDivisions = useMemo(() => {
    return CANON_DIVISIONS.map((div) => {
      const booksInDivision = filteredBooks.filter(b => b.division === div.id);
      return {
        division: div,
        books: booksInDivision
      };
    }).filter(group => group.books.length > 0);
  }, [filteredBooks]);

  const passageQuery = useMemo(() => {
    const parsed = parseScriptureReference(searchQuery.trim());
    if (!parsed) return null;
    const book = findCanonBookByName(parsed.book);
    if (!book) return null;
    const chapters = getBookChapterCount(book.name);
    if (parsed.chapter < 1 || parsed.chapter > chapters) return null;
    return { book, chapter: parsed.chapter, verseStart: parsed.verseStart, verseEnd: parsed.verseEnd };
  }, [searchQuery]);

  const browsingAll = !searchQuery.trim()
    && selectedTestament === 'All'
    && selectedDivision === 'All'
    && selectedTheme === 'All Themes';

  return (
    <div className="min-h-screen bg-surface dark:bg-ink text-stone-900 dark:text-parchment-100 transition-colors pb-2 md:pb-6 pt-4 sm:pt-6 overflow-x-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 overflow-x-hidden w-full">
        
        {/* TOP NAVIGATION / BREADCRUMB HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onBackToDashboard();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-500/50 transition-all text-xs font-semibold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('library.backToDashboard')}</span>
            </button>

            <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-500 font-bold">
              <BookOpen className="w-4 h-4" />
              <span>{t('library.scriptorium')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE (Bookshelf vs Grid) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800">
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setViewMode('list');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{t('library.list')}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setViewMode('shelf');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'shelf'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('library.bookshelf')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* HERO TITLE BANNER */}
        <div className="pt-6 pb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('library.heroBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight">
            {t('library.heroTitle')}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-3xl mt-2 leading-relaxed font-sans">
            {t('library.heroSubtitle')}
          </p>
        </div>

        {readingPlace && (
          <button
            type="button"
            onClick={() => {
              const book = CANON_BOOKS.find((item) => item.id === readingPlace.bookId);
              if (!book) return;
              soundEngine.playClick();
              openReader(book, readingPlace.chapter);
            }}
            className="w-full mb-5 flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 px-4 py-3 text-left hover:bg-amber-500/15 transition-colors"
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                {t('library.continueReading')}
              </div>
              <div className="font-serif text-lg font-bold text-stone-900 dark:text-parchment-50">
                {readingPlace.bookName} {readingPlace.chapter}
              </div>
            </div>
            <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
          </button>
        )}

        {/* WEEKLY STUDY SERIES ENTRY POINT */}
        <div className="w-full mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full">
                  Weekly Study Series
                </span>
                {activeSeriesState && (
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    Active • Day {getSeriesDayNumber(activeSeriesState)} of 7
                  </span>
                )}
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-parchment-50 mt-1">
                {activeSeriesState 
                  ? `${getWeeklySeriesById(activeSeriesState.seriesId)?.title || 'Weekly Series'}`
                  : 'Go Deep on One Story (7-Day Series)'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 max-w-xl">
                {activeSeriesState
                  ? `${getWeeklySeriesById(activeSeriesState.seriesId)?.hook}`
                  : 'Trace one biblical figure across 7 daily decision-moments. One decision a day, depth through repetition.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSnap();
              setIsSeriesModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
          >
            <span>{activeSeriesState ? 'Manage Series' : 'Explore 6 Series'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="space-y-3 pb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder={t('library.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && passageQuery) {
                    soundEngine.playClick();
                    openReader(passageQuery.book, passageQuery.chapter, passageQuery.verseStart, passageQuery.verseEnd);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500 transition-colors font-sans shadow-xs"
              />
            </div>

            {/* Testament Filter Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shrink-0">
              {(['All', 'OT', 'NT'] as const).map((tFilter) => (
                <button
                  key={tFilter}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedTestament(tFilter);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedTestament === tFilter
                      ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/50 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tFilter === 'All' ? t('library.all66') : tFilter === 'OT' ? t('library.ot39') : t('library.nt27')}
                </button>
              ))}
            </div>
          </div>

          {passageQuery && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                openReader(passageQuery.book, passageQuery.chapter, passageQuery.verseStart, passageQuery.verseEnd);
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-500/50 px-4 py-3 text-left hover:border-amber-500 transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">{t('library.openPassage')}</div>
                <div className="font-serif text-base font-bold text-stone-900 dark:text-parchment-50">
                  {passageQuery.book.name} {passageQuery.chapter}:{passageQuery.verseStart}
                  {passageQuery.verseEnd !== passageQuery.verseStart ? `–${passageQuery.verseEnd}` : ''}
                </div>
              </div>
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </button>
          )}

          {/* Division Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedDivision('All');
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedDivision === 'All'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 shadow-xs'
              }`}
            >
              {t('library.allShelves')}
            </button>
            {CANON_DIVISIONS.map((div) => (
              <button
                key={div.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedDivision(div.id);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedDivision === div.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 shadow-xs'
                }`}
              >
                <span>{getDivisionLabel(div.id, div.label)}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  selectedDivision === div.id ? 'bg-black/20 text-stone-950 font-extrabold' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}>
                  {div.count}
                </span>
              </button>
            ))}
          </div>

          {/* Life Situation Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono uppercase text-stone-500 shrink-0 mr-1">
              {t('library.filterByBattle')}
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedTheme('All Themes');
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                selectedTheme === 'All Themes'
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {t('library.all')}
            </button>
            {CANON_LIFE_THEMES.filter((theme) => theme !== 'All Themes').map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedTheme(theme);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedTheme === theme
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Flame className={`w-2.5 h-2.5 ${selectedTheme === theme ? 'text-amber-800 dark:text-amber-400' : 'text-stone-400'}`} />
                <span>{getThemeLabel(theme)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODE A: THE 3D INTERACTIVE BOOKSHELF SCRIPTORIUM              */}
        {/* ============================================================ */}
        {viewMode === 'shelf' && (
          <div className="space-y-12 pb-2">
            {shelvedDivisions.map((shelfGroup, shelfIndex) => (
              <div 
                key={shelfGroup.division.id}
                className="relative rounded-3xl bg-stone-100/40 dark:bg-stone-900/30 p-4 sm:p-6 transition-colors"
              >
                {/* SHELF BRASS HEADER PLAQUE */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-600/30 dark:border-amber-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-200/80 dark:bg-amber-950/80 border border-amber-500/60 dark:border-amber-600/50 flex items-center justify-center text-amber-950 dark:text-amber-300 font-serif font-black text-xs shadow-inner">
                      {shelfIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-black text-stone-900 dark:text-amber-200 tracking-wide uppercase flex items-center gap-2">
                        <span>{getDivisionLabel(shelfGroup.division.id, shelfGroup.division.label)}</span>
                        <span className="text-xs font-mono font-normal text-amber-800 dark:text-amber-400/70">
                          {t('library.volumesCount', { count: shelfGroup.books.length })}
                        </span>
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                        {getDivisionDesc(shelfGroup.division.id, shelfGroup.division.description)}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-amber-800 dark:text-amber-500/80 uppercase tracking-widest hidden sm:inline">
                    {t('library.tapVolume')}
                  </span>
                </div>

                {/* THE SHELF RACK CONTAINER */}
                <div className="relative pb-2">
                  {/* Books Row with generous top headroom for pull-out physics and floating preview card */}
                  <div className="flex items-start justify-start gap-1.5 sm:gap-2.5 overflow-x-auto pt-6 pb-3 px-2 sm:px-4 scrollbar-none">
                    {shelfGroup.books.map((book, bookIdx) => {
                      const total = shelfGroup.books.length;
                      const tooltipAlign = total <= 1 
                        ? 'center' 
                        : bookIdx === 0 
                          ? 'left' 
                          : bookIdx === total - 1 
                            ? 'right' 
                            : 'center';
                      return (
                        <BookSpine
                          key={book.id}
                          book={book}
                          tooltipAlign={tooltipAlign}
                          isSelected={activeBookForModal?.id === book.id}
                          onSelect={() => openReader(book, visited[book.id])}
                        />
                      );
                    })}
                  </div>

                  {/* THE SOLID WOOD SHELF PLANK (Base) */}
                  <div className="relative w-full h-7 rounded-md bg-gradient-to-b from-[#3a2719] via-[#24170d] to-[#120b06] border-t-2 border-amber-600/50 shadow-[0_15px_30px_rgba(0,0,0,0.9)] overflow-hidden">
                    {/* Metallic brass front edge bevel */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                    {/* Shelf Wood Grain Subtle Lines */}
                    <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.05)_41px)]" />
                    {/* Brass Mount Studs */}
                    <div className="absolute top-1.5 left-4 w-2 h-2 rounded-full bg-amber-500/60 border border-amber-300/40 shadow" />
                    <div className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-amber-500/60 border border-amber-300/40 shadow" />
                  </div>

                  {/* Deep Shadow Below Plank */}
                  <div className="w-full h-4 bg-gradient-to-b from-black/80 to-transparent" />
                </div>
              </div>
            ))}

            {shelvedDivisions.length === 0 && (
              <div className="py-20 text-center rounded-3xl bg-stone-100/50 dark:bg-stone-900/30">
                <BookOpen className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-300">{t('library.noVolumes')}</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{t('library.tryClearing')}</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-8 pb-2">
            {shelvedDivisions.map((shelfGroup) => (
              <section key={shelfGroup.division.id}>
                <div className="mb-3">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50">
                    {getDivisionLabel(shelfGroup.division.id, shelfGroup.division.label)}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                    {getDivisionDesc(shelfGroup.division.id, shelfGroup.division.description)}
                  </p>
                </div>
                <ul className="divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
                  {shelfGroup.books.map((book) => {
                    const lastChapter = visited[book.id];
                    return (
                      <li key={book.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-parchment-50">
                              {book.name}
                            </h4>
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                              {book.testament === 'OT' ? t('library.ot') : t('library.nt')}
                            </span>
                            {lastChapter ? (
                              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                {t('library.lastRead', { chapter: lastChapter })}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed line-clamp-2">
                            {book.whyItMattersMonday}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{getThemeLabel(book.lifeTheme)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              openReader(book, lastChapter);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold"
                          >
                            {lastChapter ? t('library.continueCh', { chapter: lastChapter }) : t('library.read')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              openBriefing(book);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200"
                          >
                            {t('library.about')}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {shelvedDivisions.length === 0 && (
              <div className="py-20 text-center">
                <BookOpen className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-300">{t('library.noBooks')}</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{t('library.tryBookName')}</p>
              </div>
            )}
          </div>
        )}

        <OpenBookModal
          key={activeBookForModal ? `${activeBookForModal.id}-${readerLaunch?.token ?? 'brief'}` : 'closed'}
          book={activeBookForModal}
          allBooks={browsingAll ? localizedBooks : filteredBooks}
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

      </div>
    </div>
  );
};
