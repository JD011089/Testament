import React, { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, Headphones, Play, Compass, ChevronRight, PenLine } from 'lucide-react';
import { SeriesPickerModal } from './SeriesPickerModal';
import { getActiveSeriesState, getSeriesDayNumber, type ActiveSeriesState } from '../utils/weeklySeriesEngine';
import { getWeeklySeriesById } from '../data/weeklySeries';
import { CANON_BOOKS, type CanonBook } from '../data/canon';
import { PageHeader } from './PageHeader';
import { soundEngine } from '../utils/audio';
import { parseScriptureReference } from '../utils/scriptureRef';
import { findCanonBookByName } from '../utils/bookLinks';
import { getBookChapterCount, getDefaultTranslationForLanguage } from '../utils/bibleService';
import { loadReadingPlace, type ReadingPlace } from '../utils/readingPlace';
import { useLanguage } from '../context/LanguageContext';
import {
  BIBLE_SECTIONS,
  HIGHLIGHT_BG,
  MARKS_EVENT,
  READING_PROGRESS_EVENT,
  bookMonogram,
  booksInSection,
  chapterCount,
  listMarks,
  loadChaptersRead,
  shortBookName,
  type VerseMark,
} from '../utils/bibleLibrary';
import { BibleReader } from './bible/BibleReader';
import { BookAbout } from './bible/BookAbout';
import { ChapterSheet } from './bible/ChapterSheet';
import { BibleSheet } from './bible/BibleSheet';
import { useBibleStrings } from './bible/strings';

interface CanonLibraryPageProps {
  onOpenWordForge?: (verseId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
  onPlayStory?: (storyId: string) => void;
  passageTarget?: { book: string; chapter: number; verseStart: number; verseEnd: number } | null;
  onPassageOpened?: () => void;
}

interface ReaderLaunch {
  book: CanonBook;
  chapter: number;
  focus: { start: number; end: number } | null;
  listen: boolean;
  token: number;
}

/** Bible tab: continue reading, highlights, and every book two taps from a chapter. */
export const CanonLibraryPage: React.FC<CanonLibraryPageProps> = ({
  onOpenWordForge,
  onSelectStoryQuest,
  onPlayStory,
  passageTarget,
  onPassageOpened,
}) => {
  const s = useBibleStrings();
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [reader, setReader] = useState<ReaderLaunch | null>(null);
  const [about, setAbout] = useState<CanonBook | null>(null);
  const [chapterBook, setChapterBook] = useState<CanonBook | null>(null);
  const [showAllMarks, setShowAllMarks] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [place, setPlace] = useState<ReadingPlace | null>(() => loadReadingPlace());
  const [read, setRead] = useState<Record<string, number[]>>(() => loadChaptersRead());
  const [marks, setMarks] = useState<VerseMark[]>(() => listMarks());
  const [series, setSeries] = useState<ActiveSeriesState | null>(() => getActiveSeriesState());
  const placeBook = place ? CANON_BOOKS.find((b) => b.id === place.bookId) ?? null : null;
  const [testament, setTestament] = useState<'OT' | 'NT'>(() => placeBook?.testament ?? 'NT');

  useEffect(() => {
    const refresh = () => {
      setPlace(loadReadingPlace());
      setRead(loadChaptersRead());
      setMarks(listMarks());
      setSeries(getActiveSeriesState());
    };
    const events = ['testament-reading-place', READING_PROGRESS_EVENT, MARKS_EVENT, 'testament-series-changed'];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => events.forEach((e) => window.removeEventListener(e, refresh));
  }, []);

  const openReader = (book: CanonBook, chapter: number, opts: { focus?: { start: number; end: number } | null; listen?: boolean } = {}) => {
    soundEngine.playClick();
    setChapterBook(null);
    setAbout(null);
    setReader({ book, chapter, focus: opts.focus ?? null, listen: !!opts.listen, token: Date.now() });
  };

  // Links from elsewhere in the app (Today's "keep reading", verse references).
  useEffect(() => {
    if (!passageTarget) return;
    const book = findCanonBookByName(passageTarget.book);
    if (book) {
      openReader(book, passageTarget.chapter, {
        focus: passageTarget.verseStart > 0 ? { start: passageTarget.verseStart, end: passageTarget.verseEnd || passageTarget.verseStart } : null,
      });
    }
  }, [passageTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const passage = useMemo(() => {
    const parsed = parseScriptureReference(query.trim());
    if (!parsed) return null;
    const book = findCanonBookByName(parsed.book);
    if (!book || parsed.chapter < 1 || parsed.chapter > getBookChapterCount(book.name)) return null;
    return { book, chapter: parsed.chapter, verseStart: parsed.verseStart, verseEnd: parsed.verseEnd };
  }, [query]);

  const bookHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || passage) return [];
    return CANON_BOOKS.filter((b) => b.name.toLowerCase().includes(q) || shortBookName(b.name).toLowerCase().startsWith(q)).slice(0, 6);
  }, [query, passage]);

  const openPassage = () => {
    if (!passage) return;
    openReader(passage.book, passage.chapter, {
      focus: passage.verseStart > 0 ? { start: passage.verseStart, end: passage.verseEnd || passage.verseStart } : null,
    });
    setQuery('');
  };

  const placeRead = placeBook ? (read[placeBook.id] ?? []).length : 0;
  const placeTotal = placeBook ? chapterCount(placeBook) : 0;
  const translation = place?.translation ?? getDefaultTranslationForLanguage(language);

  return (
    <div className="min-h-screen bg-surface text-fg pb-28 pt-4 sm:pt-6 overflow-x-hidden w-full">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full">
        <PageHeader className="mb-3" title={s.title} />

        {/* Search */}
        <div className="relative">
          <Search className="w-[18px] h-[18px] text-fg-muted absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') openPassage(); }}
            placeholder={s.search}
            aria-label={s.search}
            className="w-full min-h-[48px] pl-11 pr-4 rounded-2xl bg-surface-raised border border-line text-[15px] text-fg placeholder-fg-muted focus:outline-none focus:border-accent shadow-sm"
          />
        </div>
        {passage && (
          <button type="button" onClick={openPassage} className="mt-2 w-full flex items-center justify-between gap-3 rounded-2xl border border-accent/50 bg-surface-raised px-4 py-3 text-left">
            <span>
              <span className="block text-xs font-semibold text-accent-text">{s.open}</span>
              <span className="block font-serif text-base font-semibold">
                {shortBookName(passage.book.name)} {passage.chapter}{passage.verseStart ? `:${passage.verseStart}` : ''}
                {passage.verseEnd && passage.verseEnd !== passage.verseStart ? `–${passage.verseEnd}` : ''}
              </span>
            </span>
            <BookOpen className="w-5 h-5 text-accent-text" aria-hidden="true" />
          </button>
        )}
        {bookHits.length > 0 && (
          <ul className="mt-2 rounded-2xl border border-line bg-surface-raised divide-y divide-line overflow-hidden">
            {bookHits.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => { setQuery(''); setChapterBook(b); }} className="w-full flex items-center justify-between gap-2 px-4 min-h-[48px] text-left">
                  <span className="font-serif font-semibold">{shortBookName(b.name)}</span>
                  <span className="text-xs text-fg-muted">{s.chShort(chapterCount(b))}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Continue reading */}
        {place && placeBook && (
          <section className="mt-3 rounded-[1.4rem] bg-accent text-accent-on p-4 shadow-[0_14px_30px_-14px_rgb(var(--color-accent)/0.75)]">
            <div className="flex items-center gap-3">
              <span className="w-11 h-14 shrink-0 rounded-[5px_10px_10px_5px] bg-white/20 dark:bg-black/15 border-l-4 border-white/45 dark:border-black/25 flex items-center justify-center font-serif font-semibold text-lg" aria-hidden="true">
                {bookMonogram(placeBook.name)}
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] opacity-80">{s.continueReading}</p>
                <p className="font-serif text-[1.35rem] font-semibold leading-tight truncate">{shortBookName(placeBook.name)} {place.chapter}</p>
              </div>
            </div>
            <div className="h-1 rounded-full bg-white/25 dark:bg-black/20 mt-3 overflow-hidden">
              <div className="h-full bg-current" style={{ width: `${placeTotal ? Math.max(3, (placeRead / placeTotal) * 100) : 0}%` }} />
            </div>
            <p className="text-[11px] font-semibold opacity-85 mt-1.5">{s.chaptersOf(placeRead, placeTotal)}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => openReader(placeBook, place.chapter)}
                className="min-h-[42px] rounded-full bg-white text-[#23408E] dark:bg-[#1A1306] dark:text-[#E2B65E] font-bold text-sm flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />{s.read}
              </button>
              <button
                type="button"
                onClick={() => openReader(placeBook, place.chapter, { listen: true })}
                className="min-h-[42px] rounded-full bg-white/15 dark:bg-black/10 font-bold text-sm flex items-center justify-center gap-1.5"
              >
                <Headphones className="w-4 h-4" aria-hidden="true" />{s.listen}
              </button>
            </div>
          </section>
        )}

        {/* Highlights */}
        {marks.length > 0 && (
          <section className="mt-5">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="font-serif text-lg font-semibold">{s.yourHighlights}</h2>
              <button type="button" onClick={() => setShowAllMarks(true)} className="min-h-[36px] text-[13px] font-semibold text-accent-text">{s.seeAll}</button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 pb-1 snap-x" style={{ scrollbarWidth: 'none' }}>
              {marks.slice(0, 8).map((m) => (
                <MarkCard key={`${m.bookId}-${m.chapter}-${m.verse}`} mark={m} onOpen={() => {
                  const b = CANON_BOOKS.find((x) => x.id === m.bookId);
                  if (b) openReader(b, m.chapter, { focus: { start: m.verse, end: m.verse } });
                }} />
              ))}
            </div>
          </section>
        )}

        {/* Books */}
        <div className="mt-5 grid grid-cols-2 p-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-line" role="tablist">
          {(['OT', 'NT'] as const).map((tm) => (
            <button
              key={tm}
              type="button"
              role="tab"
              aria-selected={testament === tm}
              onClick={() => { soundEngine.playClick(); setTestament(tm); }}
              className={`min-h-[38px] rounded-full text-[13px] font-bold transition-colors ${testament === tm ? 'bg-surface-raised dark:bg-stone-800 text-fg shadow-sm' : 'text-fg-muted'}`}
            >
              {tm === 'OT' ? s.ot : s.nt}
            </button>
          ))}
        </div>

        {BIBLE_SECTIONS.filter((sec) => sec.testament === testament).map((sec) => (
          <section key={sec.id} className="mt-4">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-fg-secondary mb-2 px-1">
              <span className={`w-2 h-2 rounded-full ${sec.color}`} aria-hidden="true" />
              {s.sections[sec.id]}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {booksInSection(sec).map((b) => {
                const total = chapterCount(b);
                const count = (read[b.id] ?? []).length;
                const isCurrent = placeBook?.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => { soundEngine.playClick(); setChapterBook(b); }}
                    className={`relative min-w-0 overflow-hidden rounded-[14px] border bg-surface-raised px-2.5 pt-2 pb-2.5 text-left ${
                      isCurrent ? 'border-accent ring-1 ring-accent' : 'border-line'
                    }`}
                  >
                    <span className="block font-serif text-[14.5px] font-semibold truncate">{shortBookName(b.name)}</span>
                    <span className="block text-[11px] font-semibold text-fg-muted">
                      {count >= total ? `${s.chShort(total)} · ${s.done}` : s.chShort(total)}
                    </span>
                    {count > 0 && (
                      <span className={`absolute left-0 bottom-0 h-[3px] ${sec.color}`} style={{ width: `${Math.max(6, (count / total) * 100)}%` }} aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* Weekly series (kept from the old library) */}
        <button
          type="button"
          onClick={() => { soundEngine.playSnap(); setSeriesOpen(true); }}
          className="mt-6 w-full flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3.5 text-left min-h-[60px]"
        >
          <span className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-accent-text flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-fg-muted">{s.weeklySeries}</span>
            <span className="block text-sm font-semibold truncate">
              {series
                ? `${getWeeklySeriesById(series.seriesId)?.heroName ?? ''} · ${getSeriesDayNumber(series)}/7`
                : '—'}
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-fg-muted shrink-0" aria-hidden="true" />
        </button>
      </div>

      {chapterBook && (
        <ChapterSheet
          book={chapterBook}
          onClose={() => setChapterBook(null)}
          onOpenAbout={(b) => { setChapterBook(null); setAbout(b); }}
          onOpenChapter={(b, ch, listen) => openReader(b, ch, { listen })}
        />
      )}

      {showAllMarks && (
        <BibleSheet title={s.yourHighlights} onClose={() => setShowAllMarks(false)} closeLabel={s.close}>
          {marks.length === 0 && <p className="text-sm text-fg-muted">{s.noHighlights}</p>}
          <div className="space-y-2">
            {marks.map((m) => (
              <MarkCard key={`${m.bookId}-${m.chapter}-${m.verse}`} wide mark={m} onOpen={() => {
                setShowAllMarks(false);
                const b = CANON_BOOKS.find((x) => x.id === m.bookId);
                if (b) openReader(b, m.chapter, { focus: { start: m.verse, end: m.verse } });
              }} />
            ))}
          </div>
        </BibleSheet>
      )}

      {reader && (
        <BibleReader
          key={reader.token}
          initialBook={reader.book}
          initialChapter={reader.chapter}
          focusVerses={reader.focus}
          autoListen={reader.listen}
          onClose={() => { setReader(null); onPassageOpened?.(); }}
          onOpenAbout={(b) => setAbout(b)}
          onPlayStory={onPlayStory}
          onOpenWordForge={onOpenWordForge}
        />
      )}

      {about && (
        <BookAbout
          book={about}
          translation={translation}
          onBack={() => setAbout(null)}
          onStartReading={(b, ch) => openReader(b, ch)}
          onPlayStory={onPlayStory}
          onSelectStoryQuest={onSelectStoryQuest}
        />
      )}

      <SeriesPickerModal isOpen={seriesOpen} onClose={() => setSeriesOpen(false)} />
    </div>
  );
};

const MarkCard: React.FC<{ mark: VerseMark; onOpen: () => void; wide?: boolean }> = ({ mark, onOpen, wide }) => (
  <button
    type="button"
    onClick={onOpen}
    className={`${wide ? 'w-full' : 'w-[210px] shrink-0 snap-start'} rounded-2xl border border-line bg-surface-raised p-3 text-left`}
  >
    <p className="font-serif italic text-[13.5px] leading-snug text-fg line-clamp-3">“{mark.text}”</p>
    {mark.note && (
      <p className="mt-1.5 text-[12px] text-fg-secondary line-clamp-2 flex gap-1">
        <PenLine className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent-text" aria-hidden="true" />{mark.note}
      </p>
    )}
    <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-fg-muted">
      {mark.color && <span className={`w-2.5 h-2.5 rounded-[3px] ${HIGHLIGHT_BG[mark.color]}`} aria-hidden="true" />}
      {shortBookName(mark.bookName)} {mark.chapter}:{mark.verse}
    </span>
  </button>
);
