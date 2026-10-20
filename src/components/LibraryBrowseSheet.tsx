import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BookOpen, Flame, X } from 'lucide-react';
import {
  CANON_DIVISIONS,
  CANON_LIFE_THEMES,
  type CanonBook,
  type CanonDivision,
} from '../data/canon';
import { BookSpine } from './BookSpine';
import { soundEngine } from '../utils/audio';
import { getBookChapterCount } from '../utils/bibleService';
import { useModalLock } from '../utils/useModalLock';
import { useLanguage } from '../context/LanguageContext';
import {
  CANON_DIVISION_I18N_KEYS,
  CANON_LIFE_THEME_I18N_KEYS,
} from '../utils/localizedScripture';

type SheetLevel = 'divisions' | 'books' | 'chapters';

/** Swallow the same tap that closes the sheet so it cannot hit controls underneath (e.g. Back). */
function guardClickThrough(ms = 450) {
  const blocker = document.createElement('div');
  blocker.setAttribute('aria-hidden', 'true');
  blocker.style.cssText = 'position:fixed;inset:0;z-index:2147483647;touch-action:none;';
  const stop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  blocker.addEventListener('click', stop, true);
  blocker.addEventListener('pointerup', stop, true);
  blocker.addEventListener('pointerdown', stop, true);
  blocker.addEventListener('touchend', stop, true);
  document.body.appendChild(blocker);
  window.setTimeout(() => blocker.remove(), ms);
}

interface LibraryBrowseSheetProps {
  testament: 'OT' | 'NT';
  books: CanonBook[];
  visited: Record<string, number>;
  onClose: () => void;
  onOpenReader: (book: CanonBook, chapter?: number) => void;
  onOpenBriefing: (book: CanonBook) => void;
}

export function LibraryBrowseSheet({
  testament,
  books,
  visited,
  onClose,
  onOpenReader,
  onOpenBriefing,
}: LibraryBrowseSheetProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const rootRef = useModalLock(true);
  const [level, setLevel] = useState<SheetLevel>('divisions');
  const [divisionId, setDivisionId] = useState<CanonDivision | null>(null);
  const [selectedBook, setSelectedBook] = useState<CanonBook | null>(null);
  const [theme, setTheme] = useState<string>('All Themes');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      soundEngine.playSnap();
      if (level === 'chapters') {
        setSelectedBook(null);
        setLevel('books');
        return;
      }
      if (level === 'books') {
        setDivisionId(null);
        setTheme('All Themes');
        setLevel('divisions');
        return;
      }
      guardClickThrough();
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [level, onClose]);

  const divisions = useMemo(() => {
    return CANON_DIVISIONS.filter((div) =>
      books.some((b) => b.division === div.id && b.testament === testament)
    );
  }, [books, testament]);

  const divisionBooks = useMemo(() => {
    if (!divisionId) return [];
    return books.filter((b) => {
      if (b.division !== divisionId || b.testament !== testament) return false;
      if (theme !== 'All Themes' && b.lifeTheme !== theme) return false;
      return true;
    });
  }, [books, divisionId, testament, theme]);

  const chapterCount = selectedBook ? getBookChapterCount(selectedBook.name) : 0;

  const getDivisionLabel = (id: string, fallback: string) => {
    const k = CANON_DIVISION_I18N_KEYS[id];
    return k ? t(k.label) : fallback;
  };

  const getDivisionDesc = (id: string, fallback: string) => {
    const k = CANON_DIVISION_I18N_KEYS[id];
    return k ? t(k.desc) : fallback;
  };

  const getThemeLabel = (value: string) => {
    if (value === 'All Themes') return t('library.allThemes');
    const k = CANON_LIFE_THEME_I18N_KEYS[value];
    return k ? t(k) : value;
  };

  const dismissSheet = () => {
    guardClickThrough();
    onClose();
  };

  const handleBack = () => {
    soundEngine.playSnap();
    if (level === 'chapters') {
      setSelectedBook(null);
      setLevel('books');
      return;
    }
    if (level === 'books') {
      setDivisionId(null);
      setTheme('All Themes');
      setLevel('divisions');
      return;
    }
    dismissSheet();
  };

  const title =
    level === 'chapters' && selectedBook
      ? selectedBook.name
      : level === 'books' && divisionId
        ? getDivisionLabel(divisionId, divisionId)
        : testament === 'OT'
          ? t('library.ot')
          : t('library.nt');

  const subtitle =
    level === 'chapters'
      ? t('library.pickChapter')
      : level === 'books'
        ? t('library.pickBook')
        : t('library.pickDivision');

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 34 };

  return (
    <motion.div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-browse-title"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      onClick={() => {
        soundEngine.playSnap();
        dismissSheet();
      }}
    >
      <motion.div
        initial={reduceMotion ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
        transition={transition}
        className="w-full max-w-lg sm:max-w-2xl max-h-[88dvh] rounded-t-3xl sm:rounded-3xl bg-surface-raised dark:bg-stone-900 border border-line dark:border-stone-700 shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-4 pt-3 pb-3 border-b border-line dark:border-stone-800 flex items-start gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-line bg-surface dark:bg-stone-850 text-fg-muted hover:text-fg transition-colors"
            aria-label={level === 'divisions' ? t('library.closePicker') : t('library.back')}
          >
            {level === 'divisions' ? <X className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-accent-text font-bold">
              {subtitle}
            </p>
            <h2 id="library-browse-title" className="text-title-3 text-fg truncate">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <AnimatePresence mode="wait">
            {level === 'divisions' && (
              <motion.div
                key="divisions"
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="grid gap-2.5"
              >
                {divisions.map((div, i) => (
                  <motion.button
                    key={div.id}
                    type="button"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : i * 0.04, duration: reduceMotion ? 0 : 0.22 }}
                    onClick={() => {
                      soundEngine.playClick();
                      setDivisionId(div.id);
                      setLevel('books');
                    }}
                    className="w-full text-left rounded-2xl border border-line bg-surface dark:bg-stone-850/80 px-4 py-3.5 hover:border-accent/50 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-title-4 text-fg">
                          {getDivisionLabel(div.id, div.label)}
                        </div>
                        <p className="text-small text-fg-muted mt-0.5 line-clamp-2">
                          {getDivisionDesc(div.id, div.description)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-mono font-bold text-accent-text bg-accent/15 border border-accent/30 px-2 py-1 rounded-full">
                        {div.count}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {level === 'books' && (
              <motion.div
                key="books"
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setTheme('All Themes');
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      theme === 'All Themes'
                        ? 'border-accent/60 bg-accent/15 text-accent-text font-bold'
                        : 'border-line text-fg-muted'
                    }`}
                  >
                    {t('library.all')}
                  </button>
                  {CANON_LIFE_THEMES.filter((item) => item !== 'All Themes').map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setTheme(item);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
                        theme === item
                          ? 'border-accent/60 bg-accent/15 text-accent-text font-bold'
                          : 'border-line text-fg-muted'
                      }`}
                    >
                      <Flame className="w-2.5 h-2.5" />
                      {getThemeLabel(item)}
                    </button>
                  ))}
                </div>

                {divisionBooks.length === 0 ? (
                  <p className="text-center text-body text-fg-muted py-10">{t('library.noBooks')}</p>
                ) : (
                  <div className="rounded-2xl bg-stone-100/50 dark:bg-stone-950/40 p-3 sm:p-4">
                    <div className="flex items-end gap-1.5 overflow-x-auto pt-4 pb-2 px-1 scrollbar-none">
                      {divisionBooks.map((book, bookIdx) => {
                        const total = divisionBooks.length;
                        const tooltipAlign =
                          total <= 1 ? 'center' : bookIdx === 0 ? 'left' : bookIdx === total - 1 ? 'right' : 'center';
                        return (
                          <BookSpine
                            key={book.id}
                            book={book}
                            tooltipAlign={tooltipAlign}
                            isSelected={selectedBook?.id === book.id}
                            onSelect={() => {
                              setSelectedBook(book);
                              setLevel('chapters');
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="relative w-full h-5 rounded-md bg-gradient-to-b from-[#3a2719] via-[#24170d] to-[#120b06] border-t border-amber-600/40" />
                  </div>
                )}
              </motion.div>
            )}

            {level === 'chapters' && selectedBook && (
              <motion.div
                key="chapters"
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-line bg-surface dark:bg-stone-850 p-4">
                  <p className="text-small text-fg-muted italic line-clamp-2">
                    {selectedBook.codename}
                  </p>
                  <p className="text-body text-fg mt-2 line-clamp-3">
                    {selectedBook.whyItMattersMonday}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onOpenBriefing(selectedBook);
                        dismissSheet();
                      }}
                      className="btn-secondary text-xs"
                    >
                      {t('library.about')}
                    </button>
                    {visited[selectedBook.id] ? (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onOpenReader(selectedBook, visited[selectedBook.id]);
                          dismissSheet();
                        }}
                        className="btn-primary text-xs"
                      >
                        {t('library.continueCh', { chapter: visited[selectedBook.id] })}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 text-small text-fg-muted">
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    <span>{t('library.chapters', { count: chapterCount })}</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                    {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => {
                      const isLast = visited[selectedBook.id] === chapter;
                      return (
                        <button
                          key={chapter}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            onOpenReader(selectedBook, chapter);
                            dismissSheet();
                          }}
                          className={`min-h-[44px] rounded-xl text-xs font-mono font-bold border transition-colors ${
                            isLast
                              ? 'bg-accent text-accent-on border-accent-border'
                              : 'bg-surface dark:bg-stone-850 border-line text-fg hover:border-accent/50 hover:bg-accent/10'
                          }`}
                        >
                          {chapter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
