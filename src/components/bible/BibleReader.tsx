import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronDown, Headphones, Type, Play, Pause, SkipBack, SkipForward, X,
  Layers, Brain, PenLine, Copy, Share2, Loader2, Check,
} from 'lucide-react';
import type { CanonBook } from '../../data/canon';
import { findCanonBookByName } from '../../utils/bookLinks';
import { soundEngine } from '../../utils/audio';
import { useLanguage, type SupportedLanguage } from '../../context/LanguageContext';
import {
  BIBLE_TRANSLATIONS,
  fetchBibleChapter,
  getDefaultTranslationForLanguage,
  type BibleChapterData,
  type TranslationId,
} from '../../utils/bibleService';
import { nextChapter, previousChapter } from '../../utils/scriptureRef';
import {
  loadReadingPlace,
  loadReadingPrefs,
  saveReadingPlace,
  saveReadingPrefs,
  type ReadingFontSize,
  type ReadingPrefs,
} from '../../utils/readingPlace';
import {
  HIGHLIGHT_BG,
  HIGHLIGHT_COLORS,
  MARKS_EVENT,
  markChapterRead,
  marksForChapter,
  saveMark,
  shortBookName,
  storyForChapter,
  type HighlightColor,
  type VerseMark,
} from '../../utils/bibleLibrary';
import { addVerseCard } from '../../utils/deck';
import { registerDynamicBibleVerse } from '../../utils/verseRegistry';
import { saveOrShareVerseCard } from '../../utils/verseCardGenerator';
import { getStoryIllustrationUrl } from '../../utils/storyIllustrations';
import { celebrate } from '../../utils/feedback';
import { BibleSheet } from './BibleSheet';
import { ChapterSheet } from './ChapterSheet';
import { useBibleStrings } from './strings';

interface BibleReaderProps {
  initialBook: CanonBook;
  initialChapter: number;
  /** Verses to scroll to and briefly mark (from search or a link). */
  focusVerses?: { start: number; end: number } | null;
  /** Start read-along audio as soon as the chapter loads. */
  autoListen?: boolean;
  onClose: () => void;
  onOpenAbout: (book: CanonBook) => void;
  onPlayStory?: (storyId: string) => void;
  onOpenWordForge?: (verseId: string) => void;
}

const FONT_STEPS: ReadingFontSize[] = ['sm', 'base', 'lg', 'xl'];
const FONT_CLASS: Record<ReadingFontSize, string> = {
  sm: 'text-[1rem] leading-[1.7]',
  base: 'text-[1.125rem] leading-[1.72]',
  lg: 'text-[1.28rem] leading-[1.72]',
  xl: 'text-[1.45rem] leading-[1.7]',
};
const SPEEDS = [1, 1.15, 1.3, 0.85];
const CHAPTER_WORD: Record<string, string> = { en: 'chapter', es: 'capítulo', fr: 'chapitre' };

function translationFor(language: string): TranslationId {
  const saved = loadReadingPlace()?.translation;
  const info = BIBLE_TRANSLATIONS.find((t) => t.id === saved);
  return saved && info && info.language === language ? saved : getDefaultTranslationForLanguage(language as SupportedLanguage);
}

/** "John 3:16", "John 3:16-18" or "John 3:14, 16". */
function refFor(book: string, chapter: number, verses: number[]): string {
  const sorted = [...verses].sort((a, b) => a - b);
  const contiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  const tail = sorted.length === 1 ? `${sorted[0]}` : contiguous ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(', ');
  return `${book} ${chapter}:${tail}`;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  initialBook, initialChapter, focusVerses, autoListen, onClose, onOpenAbout, onPlayStory, onOpenWordForge,
}) => {
  const s = useBibleStrings();
  const { language } = useLanguage();
  const [book, setBook] = useState(initialBook);
  const [chapter, setChapter] = useState(initialChapter);
  const [translation, setTranslation] = useState<TranslationId>(() => translationFor(language));
  const [data, setData] = useState<BibleChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [prefs, setPrefs] = useState<ReadingPrefs>(() => loadReadingPrefs());
  const [marks, setMarks] = useState<Record<number, VerseMark>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'chapters' | 'settings' | null>(null);
  const [barHidden, setBarHidden] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ start: number; end: number } | null>(focusVerses ?? null);

  // Read-along state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(0);
  const [speed, setSpeed] = useState(() => soundEngine.getRateMultiplier());
  const playToken = useRef(0);
  const continueIntoNext = useRef(!!autoListen);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const bookName = shortBookName(book.name);
  const story = useMemo(() => storyForChapter(book.id, chapter), [book.id, chapter]);
  const verses = useMemo(() => data?.verses ?? [], [data]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  /* ---------- loading ---------- */

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    setSelected([]);
    fetchBibleChapter(book.name, chapter, translation)
      .then((d) => {
        if (!live) return;
        setData(d);
        setLoading(false);
        window.dispatchEvent(new CustomEvent('testament-scripture-read'));
        // Warm the next chapter so swiping is instant and it works offline.
        const next = nextChapter(book.name, chapter);
        if (next) fetchBibleChapter(next.book, next.chapter, translation).catch(() => {});
      })
      .catch(() => {
        if (!live) return;
        setError(s.offline);
        setLoading(false);
      });
    saveReadingPlace({ bookId: book.id, bookName: book.name, chapter, translation });
    return () => { live = false; };
  }, [book, chapter, translation, retry, s.offline]);

  useEffect(() => {
    const load = () => setMarks(marksForChapter(book.id, chapter));
    load();
    window.addEventListener(MARKS_EVENT, load);
    return () => window.removeEventListener(MARKS_EVENT, load);
  }, [book.id, chapter]);

  // Scroll to the top on a new chapter, or to the verses asked for.
  useEffect(() => {
    if (loading || !data) return;
    if (flash) {
      const el = scrollRef.current?.querySelector(`[data-verse="${flash.start}"]`);
      el?.scrollIntoView({ block: 'center' });
      const t = window.setTimeout(() => setFlash(null), 2600);
      return () => window.clearTimeout(t);
    }
    scrollRef.current?.scrollTo({ top: 0 });
  }, [loading, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Count the chapter as read once its end comes into view.
  useEffect(() => {
    const el = endRef.current;
    if (!el || loading) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) markChapterRead(book.id, chapter);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [book.id, chapter, loading]);

  /* ---------- navigation ---------- */

  const goTo = useCallback((target: { book: string; chapter: number } | null, keepPlaying = false) => {
    if (!target) return;
    if (!keepPlaying) {
      playToken.current += 1;
      soundEngine.stopSpeaking();
      setPlaying(false);
      continueIntoNext.current = false;
    }
    soundEngine.playPageTurn();
    if (target.book !== book.name) {
      const nb = findCanonBookByName(target.book);
      if (nb) setBook(nb);
    }
    setChapter(target.chapter);
    setPlayIdx(0);
  }, [book.name]);

  const prev = previousChapter(book.name, chapter);
  const next = nextChapter(book.name, chapter);

  /* ---------- read-along ---------- */

  // Points at the latest speakAt so a finished verse can start the next one.
  const speakAtRef = useRef<(idx: number) => void>(() => {});
  const speakAt = useCallback((idx: number) => {
    const token = ++playToken.current;
    const v = verses[idx];
    if (!v) {
      // End of chapter: count it, then carry on into the next one.
      markChapterRead(book.id, chapter);
      setPlaying(false);
      if (next) {
        continueIntoNext.current = true;
        goTo(next, true);
      }
      return;
    }
    setPlayIdx(idx);
    setPlaying(true);
    const intro = idx === 0 ? `${bookName} ${CHAPTER_WORD[language] ?? 'chapter'} ${chapter}. ` : '';
    soundEngine.speakVerse(intro + v.text, () => {
      if (playToken.current === token) speakAtRef.current(idx + 1);
    }, undefined, 'bible-reader');
  }, [verses, book.id, chapter, next, goTo, bookName, language]);
  useEffect(() => { speakAtRef.current = speakAt; }, [speakAt]);

  // Continue into the next chapter (or start on open) once its text is loaded.
  useEffect(() => {
    if (!loading && data && continueIntoNext.current) {
      continueIntoNext.current = false;
      setPlayerOpen(true);
      speakAt(0);
    }
  }, [loading, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the verse being read.
  useEffect(() => {
    if (!playing) return;
    const v = verses[playIdx];
    if (!v) return;
    scrollRef.current?.querySelector(`[data-verse="${v.verse}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [playIdx, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = () => {
    playToken.current += 1;
    soundEngine.stopSpeaking();
    setPlaying(false);
  };

  const togglePlayer = () => {
    if (playerOpen) {
      pause();
      setPlayerOpen(false);
      return;
    }
    soundEngine.playClick();
    setPlayerOpen(true);
    speakAt(playIdx < verses.length ? playIdx : 0);
  };

  const cycleSpeed = () => {
    const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1;
    setSpeed(nextSpeed);
    soundEngine.setRateMultiplier(nextSpeed);
    if (playing) speakAt(playIdx);
  };

  useEffect(() => () => {
    playToken.current += 1;
    soundEngine.stopSpeaking();
    // Speed is a reader setting; don't let it leak into story narration.
    soundEngine.setRateMultiplier(1);
  }, []);

  /* ---------- verse selection & actions ---------- */

  const selVerses = useMemo(() => verses.filter((v) => selected.includes(v.verse)), [verses, selected]);
  const selRef = selected.length ? refFor(bookName, chapter, selected) : '';
  const selText = selVerses.map((v) => v.text.trim()).join(' ');
  const translationLabel = data?.translation || translation.toUpperCase();

  const tapVerse = (n: number) => {
    if (playing) return;
    setNoteDraft(null);
    setSelected((cur) => (cur.length === 0 ? [n] : cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));
  };

  const setColor = (color: HighlightColor) => {
    soundEngine.playSnap();
    const allSame = selVerses.every((v) => marks[v.verse]?.color === color);
    for (const v of selVerses) {
      saveMark({
        bookId: book.id, bookName: book.name, chapter, verse: v.verse, text: v.text.trim(),
        translation: translationLabel, color: allSame ? null : color, note: marks[v.verse]?.note,
      });
    }
    setSelected([]);
  };

  const saveCard = () => {
    const { added } = addVerseCard({ ref: selRef, translation: translationLabel, text: selText, storyId: 'bible', storyTitle: `${bookName} ${chapter}` });
    celebrate(added ? 'victory' : 'tap');
    showToast(added ? s.saved(selRef) : s.alreadySaved(selRef));
    setSelected([]);
  };

  const memorize = () => {
    const verse = registerDynamicBibleVerse(selRef, selText, translationLabel);
    setSelected([]);
    onOpenWordForge?.(verse.id);
  };

  const listenFromSelection = () => {
    const idx = verses.findIndex((v) => v.verse === Math.min(...selected));
    setSelected([]);
    setPlayerOpen(true);
    speakAt(Math.max(0, idx));
  };

  const copy = () => {
    navigator.clipboard?.writeText(`"${selText}" — ${selRef} (${translationLabel})`).catch(() => {});
    showToast(s.copied);
    setSelected([]);
  };

  const share = () => {
    saveOrShareVerseCard(selRef, selText).catch(() => {});
    setSelected([]);
  };

  const saveNote = () => {
    const first = selVerses[0];
    if (!first) return;
    saveMark({
      bookId: book.id, bookName: book.name, chapter, verse: first.verse, text: first.text.trim(),
      translation: translationLabel, color: marks[first.verse]?.color ?? null, note: (noteDraft ?? '').trim() || undefined,
    });
    setNoteDraft(null);
    setSelected([]);
  };

  /* ---------- settings ---------- */

  const updatePrefs = (p: Partial<ReadingPrefs>) => {
    saveReadingPrefs(p);
    setPrefs(loadReadingPrefs());
  };

  /* ---------- bar hide on scroll ---------- */

  const lastY = useRef(0);
  const onScroll = () => {
    const y = scrollRef.current?.scrollTop ?? 0;
    const d = y - lastY.current;
    if (y < 60) setBarHidden(false);
    else if (d > 8) setBarHidden(true);
    else if (d < -8) setBarHidden(false);
    if (Math.abs(d) > 8 || y < 60) lastY.current = y;
  };

  /* ---------- swipe between chapters ---------- */

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || selected.length) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 80 && Math.abs(dy) < 50) goTo(dx < 0 ? next : prev, playing);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sheet || selected.length) {
        if (e.key === 'Escape') { setSelected([]); setNoteDraft(null); }
        return;
      }
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goTo(next);
      else if (e.key === 'ArrowLeft') goTo(prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, selected.length, onClose, goTo, next, prev]);

  /* ---------- rendering ---------- */

  const pageClass = prefs.page === 'dark' ? 'story-reader dark' : prefs.page === 'sepia' ? 'reader-sepia' : '';
  const activeVerse = playing || playerOpen ? verses[playIdx]?.verse : undefined;

  const verseSpan = (v: { verse: number; text: string }) => {
    const mark = marks[v.verse];
    const isSel = selected.includes(v.verse);
    const isActive = activeVerse === v.verse;
    const isFlash = flash && v.verse >= flash.start && v.verse <= (flash.end || flash.start);
    return (
      <span
        key={v.verse}
        data-verse={v.verse}
        onClick={() => tapVerse(v.verse)}
        className={`cursor-pointer rounded-[3px] [box-decoration-break:clone] transition-colors ${
          mark?.color ? HIGHLIGHT_BG[mark.color] : ''
        } ${isSel ? 'underline decoration-accent decoration-2 underline-offset-4' : ''} ${
          isActive ? 'bg-amber-100 dark:bg-amber-500/20 shadow-[0_0_0_3px] shadow-amber-100 dark:shadow-amber-500/20' : ''
        } ${isFlash ? 'bg-amber-100 dark:bg-amber-500/20' : ''}`}
      >
        {prefs.showVerseNumbers && (
          <sup className="font-sans text-[0.62em] font-bold text-[#B8862B] dark:text-[#E2B65E] mr-0.5 select-none">{v.verse}</sup>
        )}
        {v.text.trim()}
        {mark?.note && <PenLine className="inline w-3.5 h-3.5 ml-1 -mt-1 text-accent-text" aria-label={s.note} />}{' '}
      </span>
    );
  };

  const paragraphs = useMemo(() => {
    const out: typeof verses[] = [];
    for (let i = 0; i < verses.length; i += 5) out.push(verses.slice(i, i + 5));
    return out;
  }, [verses]);

  return (
    <div className={`fixed inset-0 z-50 bg-surface text-fg ${pageClass}`}>
      {/* Slim top bar: hides while scrolling down */}
      <div
        className={`absolute inset-x-0 top-0 z-20 bg-surface/92 backdrop-blur-md transition-transform duration-300 pt-[max(0.4rem,env(safe-area-inset-top))] ${
          barHidden && !playerOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-1 px-2 pb-2">
          <button type="button" onClick={onClose} aria-label={s.back} className="w-11 h-11 rounded-full flex items-center justify-center text-fg-secondary hover:bg-stone-100 dark:hover:bg-stone-850">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-center min-w-0">
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); setSheet('chapters'); }}
              className="inline-flex items-center gap-1.5 min-h-[40px] max-w-full px-4 rounded-full border border-line bg-surface-raised font-serif font-semibold text-[15px] truncate"
            >
              <span className="truncate">{bookName} {chapter}</span>
              <ChevronDown className="w-4 h-4 shrink-0 text-fg-muted" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={togglePlayer}
            aria-label={s.listen}
            aria-pressed={playerOpen}
            className={`w-11 h-11 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-850 ${playerOpen ? 'text-accent-text' : 'text-fg-secondary'}`}
          >
            <Headphones className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => { soundEngine.playClick(); setSheet('settings'); }}
            aria-label={s.reading}
            className="w-11 h-11 rounded-full flex items-center justify-center text-fg-secondary hover:bg-stone-100 dark:hover:bg-stone-850"
          >
            <Type className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Text */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="absolute inset-0 overflow-y-auto overscroll-contain"
      >
        <div className="max-w-2xl mx-auto px-6 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-40">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-serif text-[3.2rem] leading-none font-semibold text-accent-text">{chapter}</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-fg-muted">{bookName} · {translationLabel}</span>
          </div>

          {story && onPlayStory && (
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); onPlayStory(story.storyId); }}
              className="w-full flex items-center gap-3 mb-4 p-2.5 rounded-2xl border border-line bg-surface-raised text-left"
            >
              <img src={getStoryIllustrationUrl(story.storyId)} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" loading="lazy" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-fg truncate">{s.playStory}: {story.title}</span>
                <span className="block text-[11.5px] text-fg-muted">{story.passage}</span>
              </span>
              <Play className="w-4 h-4 text-accent-text shrink-0 fill-current" aria-hidden="true" />
            </button>
          )}

          {loading && (
            <div className="flex items-center gap-2 py-16 justify-center text-fg-muted text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> {s.loading}
            </div>
          )}
          {error && !loading && (
            <div className="py-12 text-center">
              <p className="text-sm text-fg-secondary max-w-xs mx-auto">{error}</p>
              <button type="button" onClick={() => setRetry((n) => n + 1)} className="btn-secondary mt-4">{s.retry}</button>
            </div>
          )}

          {!loading && !error && (
            <div className={`font-serif text-fg ${FONT_CLASS[prefs.fontSize]}`}>
              {prefs.layout === 'flow'
                ? paragraphs.map((group, i) => <p key={i} className="mb-4">{group.map(verseSpan)}</p>)
                : verses.map((v) => <p key={v.verse} className="mb-3">{verseSpan(v)}</p>)}
            </div>
          )}

          {!loading && !error && (
            <div ref={endRef} className="grid grid-cols-2 gap-2.5 mt-8">
              <button
                type="button"
                disabled={!prev}
                onClick={() => goTo(prev)}
                className="rounded-2xl border border-line px-3.5 py-3 text-left disabled:opacity-40"
              >
                <span className="block text-[11px] font-semibold text-fg-muted">{s.previous}</span>
                <span className="block font-serif text-[15px] font-semibold text-fg truncate">{prev ? `${shortBookName(prev.book)} ${prev.chapter}` : '—'}</span>
              </button>
              <button
                type="button"
                disabled={!next}
                onClick={() => goTo(next)}
                className="rounded-2xl bg-accent text-accent-on px-3.5 py-3 text-right disabled:opacity-40"
              >
                <span className="block text-[11px] font-semibold opacity-85">{s.nextChapter}</span>
                <span className="block font-serif text-[15px] font-semibold truncate">{next ? `${shortBookName(next.book)} ${next.chapter}` : '—'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Read-along player */}
      {playerOpen && verses.length > 0 && (
        <div className="absolute inset-x-3 bottom-[max(0.9rem,env(safe-area-inset-bottom))] z-30 max-w-xl mx-auto rounded-3xl border border-line bg-surface-raised shadow-[0_14px_36px_-10px_rgba(0,0,0,0.45)] px-3.5 py-3">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => speakAt(Math.max(0, playIdx - 1))} aria-label="Previous verse" className="w-10 h-10 min-h-0 rounded-full flex items-center justify-center text-fg-secondary">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => (playing ? pause() : speakAt(playIdx))}
              aria-label={playing ? 'Pause' : 'Play'}
              className="w-12 h-12 min-h-0 rounded-full bg-accent text-accent-on flex items-center justify-center shrink-0"
            >
              {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button type="button" onClick={() => speakAt(Math.min(verses.length - 1, playIdx + 1))} aria-label="Next verse" className="w-10 h-10 min-h-0 rounded-full flex items-center justify-center text-fg-secondary">
              <SkipForward className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1 pl-1">
              <b className="block text-[13.5px] truncate">{bookName} {chapter}:{verses[playIdx]?.verse ?? 1}</b>
              <span className="block text-[11px] font-semibold text-fg-muted truncate">{s.verseOf(playIdx + 1, verses.length)}</span>
            </div>
            <button type="button" onClick={cycleSpeed} aria-label={s.speed} className="min-h-[34px] px-2.5 rounded-full border border-line text-[12px] font-bold text-fg-secondary">
              {speed}×
            </button>
            <button type="button" onClick={() => { pause(); setPlayerOpen(false); }} aria-label={s.close} className="w-9 h-9 min-h-0 rounded-full flex items-center justify-center text-fg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="h-1 rounded-full bg-line mt-2.5 overflow-hidden">
            <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${((playIdx + 1) / verses.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Verse panel */}
      {selected.length > 0 && (
        <BibleSheet onClose={() => { setSelected([]); setNoteDraft(null); }} dim={false} closeLabel={s.close}>
          <div className="font-serif text-[17px] font-semibold">{selRef}</div>
          <p className="font-serif italic text-[14px] text-fg-secondary leading-snug mt-1 line-clamp-2">{selText}</p>
          {selected.length === 1 && <p className="text-[11px] text-fg-muted mt-1">{s.tapMore}</p>}

          {noteDraft !== null ? (
            <div className="mt-3">
              <textarea
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder={s.notePlaceholder}
                rows={4}
                className="w-full rounded-2xl border border-line bg-surface p-3 text-[15px] text-fg focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setNoteDraft(null)} className="btn-quiet flex-1">{s.back}</button>
                <button type="button" onClick={saveNote} className="btn-primary flex-1">{s.saveNote}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 my-3.5" role="group" aria-label={s.highlight}>
                {HIGHLIGHT_COLORS.map((c) => {
                  const on = selVerses.length > 0 && selVerses.every((v) => marks[v.verse]?.color === c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`${s.highlight} ${c}`}
                      aria-pressed={on}
                      className={`w-9 h-9 min-h-0 rounded-full flex items-center justify-center ${HIGHLIGHT_BG[c]} ${on ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface-raised' : ''}`}
                    >
                      {on && <Check className="w-4 h-4 text-fg" />}
                    </button>
                  );
                })}
                <span className="ml-auto text-[11.5px] font-semibold text-fg-muted">{s.highlight}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ActionTile icon={<Layers className="w-5 h-5" />} label={s.saveCard} onClick={saveCard} primary />
                <ActionTile icon={<Brain className="w-5 h-5" />} label={s.memorize} onClick={memorize} />
                <ActionTile icon={<Headphones className="w-5 h-5" />} label={s.listen} onClick={listenFromSelection} />
                <ActionTile icon={<PenLine className="w-5 h-5" />} label={s.note} onClick={() => setNoteDraft(marks[selected[0]]?.note ?? '')} />
                <ActionTile icon={<Copy className="w-5 h-5" />} label={s.copy} onClick={copy} />
                <ActionTile icon={<Share2 className="w-5 h-5" />} label={s.shareImage} onClick={share} />
              </div>
            </>
          )}
        </BibleSheet>
      )}

      {/* Chapter picker */}
      {sheet === 'chapters' && (
        <ChapterSheet
          book={book}
          currentChapter={chapter}
          allowBookChange
          onClose={() => setSheet(null)}
          onOpenAbout={(b) => { setSheet(null); onOpenAbout(b); }}
          onOpenChapter={(b, ch, listen) => {
            setSheet(null);
            goTo({ book: b.name, chapter: ch });
            if (listen) continueIntoNext.current = true;
          }}
        />
      )}

      {/* Reading settings */}
      {sheet === 'settings' && (
        <BibleSheet title={s.reading} onClose={() => setSheet(null)} closeLabel={s.close}>
          <div className={`rounded-2xl border border-line px-4 py-3 font-serif ${FONT_CLASS[prefs.fontSize]}`}>
            {prefs.showVerseNumbers && <sup className="font-sans text-[0.62em] font-bold text-[#B8862B] dark:text-[#E2B65E] mr-0.5">{verses[0]?.verse ?? 1}</sup>}
            {(verses[0]?.text ?? '').trim().slice(0, 90)}…
          </div>
          <div className="divide-y divide-line mt-2">
            <label className="flex items-center justify-between gap-3 py-3">
              <b className="text-[14px] font-semibold">{s.translation}</b>
              <select
                value={translation}
                onChange={(e) => setTranslation(e.target.value as TranslationId)}
                className="max-w-[60%] min-h-[40px] rounded-xl border border-line bg-surface px-2.5 text-[13px] font-semibold text-fg"
              >
                {BIBLE_TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            <div className="flex items-center justify-between gap-3 py-3">
              <b className="text-[14px] font-semibold">{s.textSize}</b>
              <div className="flex items-center gap-2 flex-1 max-w-[190px]">
                <span className="text-xs font-bold text-fg-muted" aria-hidden="true">A</span>
                <input
                  type="range" min={0} max={FONT_STEPS.length - 1} step={1}
                  value={FONT_STEPS.indexOf(prefs.fontSize)}
                  onChange={(e) => updatePrefs({ fontSize: FONT_STEPS[Number(e.target.value)] })}
                  aria-label={s.textSize}
                  className="flex-1 h-10 accent-[rgb(var(--color-accent))]"
                />
                <span className="text-lg font-bold text-fg-muted" aria-hidden="true">A</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <b className="text-[14px] font-semibold">{s.layout}</b>
              <div className="flex p-0.5 rounded-xl bg-stone-100 dark:bg-stone-850 border border-line" role="radiogroup" aria-label={s.layout}>
                {(['flow', 'verses'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={prefs.layout === l}
                    onClick={() => updatePrefs({ layout: l })}
                    className={`min-h-[34px] px-2.5 rounded-[10px] text-[12px] font-bold ${prefs.layout === l ? 'bg-surface-raised text-fg shadow-sm' : 'text-fg-muted'}`}
                  >
                    {l === 'flow' ? s.paragraphs : s.versePerLine}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <b className="text-[14px] font-semibold">{s.verseNumbers}</b>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.showVerseNumbers}
                aria-label={s.verseNumbers}
                onClick={() => updatePrefs({ showVerseNumbers: !prefs.showVerseNumbers })}
                className="inline-flex items-center justify-center min-w-[52px] min-h-[44px]"
              >
                <span className={`w-12 h-7 rounded-full p-1 transition-colors ${prefs.showVerseNumbers ? 'bg-accent' : 'bg-stone-300 dark:bg-stone-700'}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs.showVerseNumbers ? 'translate-x-5' : ''}`} />
                </span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <b className="text-[14px] font-semibold">{s.page}</b>
              <div className="flex gap-2" role="radiogroup" aria-label={s.page}>
                {([
                  ['app', 'bg-white text-[#121A2E] dark:bg-[#141D33] dark:text-[#EEE7D6]'],
                  ['sepia', 'bg-[#F4ECD8] text-[#5B4636]'],
                  ['dark', 'bg-[#0A0F1E] text-[#EEE7D6]'],
                ] as const).map(([p, cls]) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={prefs.page === p}
                    aria-label={p}
                    onClick={() => updatePrefs({ page: p })}
                    className={`w-9 h-9 min-h-0 rounded-full border border-line font-serif font-semibold text-sm ${cls} ${prefs.page === p ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface-raised' : ''}`}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>
          </div>
        </BibleSheet>
      )}

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-28 z-[80] max-w-[90%] rounded-full bg-fg text-surface px-4 py-2.5 text-[13px] font-semibold shadow-lg" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};

const ActionTile: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean }> = ({ icon, label, onClick, primary }) => (
  <button
    type="button"
    onClick={() => { soundEngine.playClick(); onClick(); }}
    className={`rounded-2xl border px-2 py-3 flex flex-col items-center gap-1.5 text-[12px] font-bold ${
      primary
        ? 'bg-amber-100 dark:bg-amber-500/15 border-transparent text-accent-text'
        : 'bg-surface border-line text-fg-secondary [&>svg]:text-accent-text'
    }`}
  >
    {icon}
    {label}
  </button>
);
