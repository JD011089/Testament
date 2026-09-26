import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  ArrowLeft, 
  Layers, 
  LayoutGrid, 
  Sparkles, 
  Flame,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { 
  CANON_BOOKS, 
  CANON_DIVISIONS, 
  CANON_LIFE_THEMES, 
  type CanonBook 
} from '../data/canon';
import { BookSpine } from './BookSpine';
import { OpenBookModal } from './OpenBookModal';
import { soundEngine } from '../utils/audio';

interface CanonLibraryPageProps {
  onBackToDashboard: () => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
  passageTarget?: { book: string; chapter: number; verseStart: number; verseEnd: number } | null;
  onPassageOpened?: () => void;
}

export const CanonLibraryPage: React.FC<CanonLibraryPageProps> = ({
  onBackToDashboard,
  onOpenWordForge,
  onSetMemoryVerse,
  onSelectStoryQuest,
  passageTarget,
  onPassageOpened
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'grid'>('shelf');
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

  useEffect(() => {
    if (!passageTarget) return;
    const book = CANON_BOOKS.find(b => b.name.toLowerCase() === passageTarget.book.toLowerCase());
    if (book) {
      setReaderLaunch({
        token: Date.now(),
        chapter: passageTarget.chapter,
        verseStart: passageTarget.verseStart,
        verseEnd: passageTarget.verseEnd,
      });
      setActiveBookForModal(book);
    }
  }, [passageTarget]);

  // For Grid View
  const [translationLenses, setTranslationLenses] = useState<Record<string, 'street' | 'canonical'>>({});
  const [expandedSitReps, setExpandedSitReps] = useState<Record<string, boolean>>({});
  const [playingBookId, setPlayingBookId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredBooks = useMemo(() => {
    return CANON_BOOKS.filter((b) => {
      // Testament filter
      if (selectedTestament !== 'All' && b.testament !== selectedTestament) return false;
      // Division filter
      if (selectedDivision !== 'All' && b.division !== selectedDivision) return false;
      // Life Theme filter
      if (selectedTheme !== 'All Themes' && b.lifeTheme !== selectedTheme) return false;
      // Search query
      if (searchQuery.trim()) {
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
  }, [selectedTestament, selectedDivision, selectedTheme, searchQuery]);

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

  const handleToggleLens = (bookId: string) => {
    soundEngine.playSnap();
    setTranslationLenses(prev => ({
      ...prev,
      [bookId]: prev[bookId] === 'canonical' ? 'street' : 'canonical'
    }));
  };

  const handleToggleSitRep = (bookId: string) => {
    soundEngine.playClick();
    setExpandedSitReps(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  const handleToggleAudio = (book: CanonBook) => {
    if (playingBookId === book.id) {
      soundEngine.stopSpeaking();
      setPlayingBookId(null);
    } else {
      soundEngine.stopSpeaking();
      soundEngine.playClick();
      setPlayingBookId(book.id);

      const lens = translationLenses[book.id] || 'street';
      const scriptureText = lens === 'street'
        ? book.anchorScripture.streetTranslation
        : book.anchorScripture.canonicalText;

      const narrationText = `${book.name}. Tactical Codename: ${book.codename}. ${book.subtitle}. Why this matters on Monday: ${book.whyItMattersMonday}. Scripture anchor, ${book.anchorScripture.reference}: ${scriptureText}`;

      soundEngine.speakVerse(narrationText, () => setPlayingBookId(null));
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] dark:bg-[#0a0c10] text-stone-900 dark:text-parchment-100 transition-colors pb-36 pt-4 sm:pt-6 overflow-x-hidden w-full max-w-full">
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
              <span>Back to Dashboard</span>
            </button>

            <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold">
              <BookOpen className="w-4 h-4" />
              <span>The Scriptorium</span>
            </div>
          </div>

          {/* VIEW MODE TOGGLE (Bookshelf vs Grid) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800">
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
              <span>Bookshelf View</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playSnap();
                setViewMode('grid');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tactical Grid View</span>
            </button>
          </div>
        </div>

        {/* HERO TITLE BANNER */}
        <div className="pt-6 pb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Complete 66-Book Field Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-parchment-50 leading-tight">
            The Living Word Library
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-3xl mt-2 leading-relaxed font-sans">
            Every book of the Bible crafted as a physical volume on the shelf. Pull any book from its wooden perch to inspect its crisis sitrep, street translation, and practical battle takeaways.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="space-y-3 pb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search across all 66 books, codenames, themes, or scripture references..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500 transition-colors font-sans shadow-xs"
              />
            </div>

            {/* Testament Filter Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shrink-0">
              {(['All', 'OT', 'NT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedTestament(t);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedTestament === t
                      ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/50 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {t === 'All' ? 'All (66)' : t === 'OT' ? 'Old Testament (39)' : 'New Testament (27)'}
                </button>
              ))}
            </div>
          </div>

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
              All 7 Shelves
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
                <span>{div.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedDivision === div.id ? 'bg-black/20 text-stone-950 font-extrabold' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}>
                  {div.count}
                </span>
              </button>
            ))}
          </div>

          {/* Life Situation Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-stone-500 shrink-0 mr-1">
              Filter by Life Battle:
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedTheme('All Themes');
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                selectedTheme === 'All Themes'
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              All
            </button>
            {CANON_LIFE_THEMES.map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedTheme(theme);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedTheme === theme
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Flame className={`w-2.5 h-2.5 ${selectedTheme === theme ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                <span>{theme}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODE A: THE 3D INTERACTIVE BOOKSHELF SCRIPTORIUM              */}
        {/* ============================================================ */}
        {viewMode === 'shelf' && (
          <div className="space-y-12 pb-16">
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
                        <span>{shelfGroup.division.label}</span>
                        <span className="text-xs font-mono font-normal text-amber-700 dark:text-amber-400/70">
                          ({shelfGroup.books.length} Volumes)
                        </span>
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                        {shelfGroup.division.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-500/80 uppercase tracking-widest hidden sm:inline">
                    Hover & pull volumes to open codex
                  </span>
                </div>

                {/* THE SHELF RACK CONTAINER */}
                <div className="relative pb-2">
                  {/* Books Row with generous top headroom for pull-out physics and floating preview card */}
                  <div className="flex items-end justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto pt-32 sm:pt-36 pb-2 px-6 sm:px-10 scrollbar-none min-h-[350px]">
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
                          onSelect={() => setActiveBookForModal(book)}
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
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-300">No volumes match your search</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">Try clearing filters or search terms.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE B: THE TACTICAL GRID VIEW (Searchable Cards)             */}
        {/* ============================================================ */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
            {filteredBooks.map((book) => {
              const lens = translationLenses[book.id] || 'street';
              const isExpanded = !!expandedSitReps[book.id];
              const isPlaying = playingBookId === book.id;

              return (
                <div
                  key={book.id}
                  className="flex flex-col justify-between rounded-2xl bg-stone-100/70 hover:bg-stone-100 dark:bg-stone-900/60 dark:hover:bg-stone-850 transition-all p-5 group text-left"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                        #{String(book.order).padStart(2, '0')} • {book.testament} • {book.division}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {book.lifeTheme}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveBookForModal(book);
                      }}
                      className="text-left w-full group/title cursor-pointer focus:outline-none"
                    >
                      <h3 className="text-xl font-serif font-black text-stone-900 dark:text-parchment-100 group-hover/title:text-amber-600 dark:group-hover/title:text-amber-300 transition-colors">
                        {book.name}
                      </h3>
                      <div className="text-xs font-serif italic text-amber-700 dark:text-amber-400/90 font-semibold mt-0.5">
                        "{book.codename}"
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                        {book.subtitle}
                      </p>
                    </button>

                    {/* Dual-Lens Scripture Box */}
                    <div className="mt-4 rounded-xl bg-white/80 dark:bg-stone-950/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-700 dark:text-amber-400 font-bold">{book.anchorScripture.reference}</span>
                        <button
                          onClick={() => handleToggleLens(book.id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-amber-800 dark:text-amber-300 transition-colors"
                        >
                          {lens === 'street' ? '⚡ Street Plain' : '📜 Canonical'}
                        </button>
                      </div>

                      <blockquote className="text-xs font-serif italic text-stone-800 dark:text-parchment-200 leading-relaxed">
                        "{lens === 'street' ? book.anchorScripture.streetTranslation : book.anchorScripture.canonicalText}"
                      </blockquote>
                    </div>

                    {/* Expandable SitRep */}
                    <button
                      onClick={() => handleToggleSitRep(book.id)}
                      className="mt-3 w-full flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors py-1"
                    >
                      <span>Full Crisis SitRep & Application</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-3 pt-2 border-t border-stone-200/60 dark:border-stone-850 text-xs text-stone-700 dark:text-stone-300">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-500/90 font-bold">Author & Context</div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-normal">
                            {book.authorContext}
                          </p>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">Historical Peril</div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-normal">
                            {book.historicalPeril}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-500/10 p-2.5">
                          <div className="text-[10px] font-mono uppercase text-amber-900 dark:text-amber-300 font-bold">Why It Matters Monday</div>
                          <p className="text-[11px] text-stone-800 dark:text-parchment-200 mt-0.5 leading-normal">
                            {book.whyItMattersMonday}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-stone-200/60 dark:border-stone-850/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAudio(book)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                          isPlaying
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
                        }`}
                      >
                        {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                        <span>{isPlaying ? 'Pause Voice' : 'Listen SitRep'}</span>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveBookForModal(book);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-800 hover:text-stone-950 dark:text-amber-300 dark:hover:text-black text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Book</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          if (onOpenWordForge) onOpenWordForge(`canon-${book.id}`);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-[11px] text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                      >
                        <Brain className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Word Forge</span>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          if (onSetMemoryVerse) {
                            onSetMemoryVerse(`canon-${book.id}`);
                            showToast(`Anchored ${book.anchorScripture.reference} to Memory Pulse!`);
                          }
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-[11px] text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                      >
                        <Bell className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Memory Pulse</span>
                      </button>
                    </div>

                    {book.deepLinkId && (
                      <button
                        onClick={() => {
                          soundEngine.playVictory();
                          if (book.deepLinkType === 'story' && book.deepLinkId && onSelectStoryQuest) {
                            onSelectStoryQuest(book.deepLinkId);
                          } else if (book.deepLinkType === 'proverbs') {
                            window.dispatchEvent(new CustomEvent('open-proverbs-codex'));
                          } else if (book.deepLinkType === 'psalms') {
                            window.dispatchEvent(new CustomEvent('open-psalms-medic'));
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-800 hover:text-stone-950 dark:text-amber-300 dark:hover:text-black border border-amber-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Launch Journey Module</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OPEN BOOK CODEX MODAL */}
        <OpenBookModal
          book={activeBookForModal}
          allBooks={filteredBooks}
          onClose={() => {
            setActiveBookForModal(null);
            setReaderLaunch(null);
            onPassageOpened?.();
          }}
          onSelectBook={(b) => {
            setReaderLaunch(null);
            setActiveBookForModal(b);
          }}
          onOpenWordForge={onOpenWordForge}
          onSetMemoryVerse={onSetMemoryVerse}
          onSelectStoryQuest={onSelectStoryQuest}
          initialMode={readerLaunch ? 'reader' : 'briefing'}
          initialChapter={readerLaunch?.chapter ?? 1}
          launchToken={readerLaunch?.token ?? 0}
          highlightVerseStart={readerLaunch?.verseStart}
          highlightVerseEnd={readerLaunch?.verseEnd}
        />

        {/* Toast Popup */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};
