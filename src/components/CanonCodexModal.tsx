import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Brain, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Flame,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { 
  CANON_BOOKS, 
  CANON_DIVISIONS, 
  CANON_LIFE_THEMES, 
  type CanonBook 
} from '../data/canon';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';

interface CanonCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWordForge?: (verseId: string) => void;
  onSetMemoryVerse?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
}

export const CanonCodexModal: React.FC<CanonCodexModalProps> = ({
  isOpen,
  onClose,
  onOpenWordForge,
  onSetMemoryVerse,
  onSelectStoryQuest
}) => {
  const modalRef = useModalLock(isOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [selectedTestament, setSelectedTestament] = useState<'All' | 'OT' | 'NT'>('All');
  const [selectedTheme, setSelectedTheme] = useState<string>('All Themes');
  const [translationLenses, setTranslationLenses] = useState<Record<string, 'street' | 'canonical'>>({});
  const [expandedSitReps, setExpandedSitReps] = useState<Record<string, boolean>>({});
  const [playingBookId, setPlayingBookId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleTranslationLens = (bookId: string) => {
    soundEngine.playSnap();
    setTranslationLenses(prev => ({
      ...prev,
      [bookId]: prev[bookId] === 'canonical' ? 'street' : 'canonical'
    }));
  };

  const toggleSitRep = (bookId: string) => {
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

      const narrationText = `${book.name}. Tactical Codename: ${book.codename}. ${book.subtitle}. Real world application: ${book.whyItMattersMonday}. Scripture anchor, ${book.anchorScripture.reference}: ${scriptureText}`;

      soundEngine.speakVerse(narrationText, () => setPlayingBookId(null));
    }
  };

  const handleLaunchDeepLink = (book: CanonBook) => {
    soundEngine.playVictory();
    onClose();

    if (book.deepLinkType === 'proverbs') {
      window.dispatchEvent(new CustomEvent('open-proverbs-codex'));
    } else if (book.deepLinkType === 'psalms') {
      window.dispatchEvent(new CustomEvent('open-psalms-medic'));
    } else if (book.deepLinkType === 'story' && book.deepLinkId && onSelectStoryQuest) {
      onSelectStoryQuest(book.deepLinkId);
    }
  };

  // Filter books
  const filteredBooks = CANON_BOOKS.filter(book => {
    const matchesSearch = 
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.codename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.anchorScripture.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.lifeTheme.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTestament = selectedTestament === 'All' || book.testament === selectedTestament;
    const matchesDivision = selectedDivision === 'All' || book.division === selectedDivision;
    const matchesTheme = selectedTheme === 'All Themes' || book.lifeTheme === selectedTheme;

    return matchesSearch && matchesTestament && matchesDivision && matchesTheme;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-3xl bg-white dark:bg-[#0f1219] border-0 sm:border border-amber-500/30 dark:border-amber-500/40 shadow-none sm:shadow-2xl overflow-hidden transition-colors outline-none"
        onClick={e => e.stopPropagation()}
      >
        
        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-glow-gold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800/80 bg-stone-50 dark:bg-gradient-to-r dark:from-stone-950 dark:via-[#131722] dark:to-stone-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm dark:shadow-glow-amber">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-500 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60">
                  The Canon Codex • 66 Books
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  {filteredBooks.length} of 66 Unlocked
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-parchment-50">
                The Scripture Field Library
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              soundEngine.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900/80 dark:hover:bg-stone-800 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all border border-stone-250 dark:border-stone-800"
            aria-label="Close Canon Codex"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FILTER BAR & SEARCH */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800/80 bg-stone-100/70 dark:bg-[#121620] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book name, dilemma, theme, or reference..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-250 dark:border-stone-800 text-stone-900 dark:text-parchment-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Testament Filter Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-250 dark:border-stone-800 self-start sm:self-auto shrink-0">
              {(['All', 'OT', 'NT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    soundEngine.playSnap();
                    setSelectedTestament(t);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedTestament === t
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'All' ? 'All (66)' : t === 'OT' ? 'Old Testament (39)' : 'New Testament (27)'}
                </button>
              ))}
            </div>
          </div>

          {/* Canonical Divisions Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                soundEngine.playSnap();
                setSelectedDivision('All');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedDivision === 'All'
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-500/60 shadow-sm'
                  : 'bg-white dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-stone-250 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>All Divisions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">66</span>
            </button>

            {CANON_DIVISIONS.map((div) => {
              const isSelected = selectedDivision === div.id;
              return (
                <button
                  key={div.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setSelectedDivision(div.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-500/60 shadow-sm'
                      : 'bg-white dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-stone-250 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span>{div.icon}</span>
                  <span>{div.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                    {div.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Life Situation Quick-Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            <span className="text-stone-500 font-mono text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Life Need:
            </span>
            {CANON_LIFE_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => {
                    soundEngine.playSnap();
                    setSelectedTheme(theme);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-200 border border-amber-400 dark:border-amber-500/60 font-semibold'
                      : 'bg-white dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-250 dark:border-transparent'
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOOK CARDS GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 px-4">
              <BookOpen className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
              <h4 className="text-base font-serif font-bold text-stone-900 dark:text-parchment-100">No books found</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto mt-1">
                No scripture books match "{searchQuery}" with the current filters. Try resetting the division or theme filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDivision('All');
                  setSelectedTestament('All');
                  setSelectedTheme('All Themes');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBooks.map((book) => {
                const lens = translationLenses[book.id] || 'street';
                const isSitRepOpen = expandedSitReps[book.id] || false;
                const isPlaying = playingBookId === book.id;

                return (
                  <div
                    key={book.id}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-100/70 dark:bg-[#141824] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta Line */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-900 text-amber-800 dark:text-amber-400">
                            #{String(book.order).padStart(2, '0')}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 font-medium">
                            {book.division}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-900/80">
                          {book.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                        </span>
                      </div>

                      {/* Title & Codename */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-parchment-50">
                            {book.name}
                          </h4>
                          <span className="text-xs font-serif italic text-amber-700 dark:text-amber-400/90 font-medium">
                            "{book.codename}"
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                          {book.subtitle}
                        </p>
                      </div>

                      {/* Life Theme Tag */}
                      <div className="mb-3.5">
                        <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-900">
                          🎯 {book.lifeTheme}
                        </span>
                      </div>

                      {/* SCRIPTURE ANCHOR BOX WITH DUAL-LENS TOGGLE */}
                      <div className="p-3.5 rounded-xl bg-white/90 dark:bg-stone-950/70 mb-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                            {book.anchorScripture.reference}
                          </span>

                          <button
                            onClick={() => toggleTranslationLens(book.id)}
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-amber-300 transition-colors"
                          >
                            {lens === 'street' ? 'Switch to Canonical Text' : 'Switch to Street Translation'}
                          </button>
                        </div>

                        <p className="text-xs font-serif text-stone-800 dark:text-parchment-100 leading-relaxed italic">
                          "{lens === 'street' ? book.anchorScripture.streetTranslation : book.anchorScripture.canonicalText}"
                        </p>

                        <div className="pt-1.5 border-t border-stone-200/60 dark:border-stone-800/60 flex items-start gap-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                          <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">Monday Play:</span>
                          <span>{book.anchorScripture.takeaway}</span>
                        </div>
                      </div>

                      {/* EXPANDABLE SITUATION REPORT (DRAWER) */}
                      {isSitRepOpen && (
                        <div className="p-3.5 rounded-xl bg-stone-200/50 dark:bg-[#0c0e14] mb-3 space-y-2.5 text-xs animate-fadeIn">
                          <div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-0.5">
                              Historical Peril & Author Context
                            </div>
                            <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                              {book.historicalPeril} <span className="text-stone-500 dark:text-stone-400">({book.authorContext})</span>
                            </p>
                          </div>

                          <div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
                              Why This Matters on Monday Morning
                            </div>
                            <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                              {book.whyItMattersMonday}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD ACTION BUTTONS */}
                    <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleSitRep(book.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 hover:text-stone-950 dark:text-stone-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                        >
                          <span>{isSitRepOpen ? 'Hide SitRep' : 'Full SitRep'}</span>
                          {isSitRepOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => handleToggleAudio(book)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                            isPlaying
                              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                              : 'bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 hover:text-stone-950 dark:text-stone-300'
                          }`}
                          title="Listen to Situational Briefing"
                        >
                          {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />}
                          <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {book.deepLinkType && (
                          <button
                            onClick={() => handleLaunchDeepLink(book)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 dark:bg-stone-900 dark:hover:bg-stone-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                            title="Open deep interactive simulator for this book"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>
                              {book.deepLinkType === 'proverbs' ? 'Codex' : book.deepLinkType === 'psalms' ? 'Medic' : 'Quest'}
                            </span>
                          </button>
                        )}

                        {onSetMemoryVerse && (
                          <button
                            onClick={() => {
                              soundEngine.playSnap();
                              onSetMemoryVerse(book.id);
                              showToast(`Anchor verse for ${book.name} set as Memory Pulse!`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                            title="Set as lock-screen Memory Pulse notification"
                          >
                            <Bell className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            <span>Pulse</span>
                          </button>
                        )}

                        {onOpenWordForge && (
                          <button
                            onClick={() => {
                              soundEngine.playSnap();
                              onClose();
                              onOpenWordForge(book.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                            title="Train this scripture in Word Forge puzzle"
                          >
                            <Brain className="w-3 h-3" />
                            <span>Forge</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800/80 bg-stone-50 dark:bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Every single book is wired directly into Word Forge and lock-screen Memory Pulse.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                soundEngine.stopSpeaking();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 hover:text-stone-950 dark:text-stone-300 font-medium border border-stone-250 dark:border-stone-800"
            >
              Close Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
