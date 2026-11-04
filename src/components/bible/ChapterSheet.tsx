import React, { useMemo, useState } from 'react';
import { Info, Headphones, ArrowLeftRight, ChevronLeft } from 'lucide-react';
import type { CanonBook } from '../../data/canon';
import { soundEngine } from '../../utils/audio';
import {
  BIBLE_SECTIONS,
  booksInSection,
  chapterCount,
  chaptersWithStories,
  loadChaptersRead,
  nextUnreadChapter,
  sectionForBook,
  shortBookName,
} from '../../utils/bibleLibrary';
import { BibleSheet } from './BibleSheet';
import { useBibleStrings } from './strings';

interface ChapterSheetProps {
  book: CanonBook;
  /** Chapter open in the reader, if any. */
  currentChapter?: number;
  onClose: () => void;
  onOpenChapter: (book: CanonBook, chapter: number, listen?: boolean) => void;
  onOpenAbout: (book: CanonBook) => void;
  /** Show "Change book" (used from inside the reader). */
  allowBookChange?: boolean;
}

/** Book's chapter grid: read chapters filled, "up next" solid, gold dot = has a story. */
export const ChapterSheet: React.FC<ChapterSheetProps> = ({ book: initialBook, currentChapter, onClose, onOpenChapter, onOpenAbout, allowBookChange }) => {
  const s = useBibleStrings();
  const [book, setBook] = useState(initialBook);
  const [pickingBook, setPickingBook] = useState(false);
  const total = chapterCount(book);
  const read = useMemo(() => loadChaptersRead()[book.id] ?? [], [book.id]);
  const storyChapters = useMemo(() => chaptersWithStories(book.id), [book.id]);
  const upNext = book.id === initialBook.id && currentChapter ? currentChapter : nextUnreadChapter(book, read);
  const section = sectionForBook(book);

  if (pickingBook) {
    return (
      <BibleSheet
        title={
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => setPickingBook(false)} aria-label={s.back} className="w-9 h-9 min-h-0 -ml-2 rounded-full flex items-center justify-center text-fg-muted">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {s.changeBook}
          </span>
        }
        onClose={onClose}
        closeLabel={s.close}
      >
        {BIBLE_SECTIONS.map((sec) => (
          <div key={sec.id} className="mb-3">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-fg-secondary mb-1.5">
              <span className={`w-2 h-2 rounded-full ${sec.color}`} />
              {s.sections[sec.id]}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {booksInSection(sec).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { soundEngine.playClick(); setBook(b); setPickingBook(false); }}
                  className={`min-h-[36px] px-3 rounded-full border text-sm font-semibold ${
                    b.id === book.id ? 'border-accent bg-amber-100 dark:bg-amber-500/15 text-accent-text' : 'border-line text-fg-secondary'
                  }`}
                >
                  {shortBookName(b.name)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </BibleSheet>
    );
  }

  return (
    <BibleSheet
      title={shortBookName(book.name)}
      subtitle={`${s.chapters(total)} · ${s.sections[section.id]}`}
      onClose={onClose}
      closeLabel={s.close}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onOpenAbout(book)}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-accent-text text-[13px] font-bold"
        >
          <Info className="w-4 h-4" aria-hidden="true" />{s.about(shortBookName(book.name))}
        </button>
        <button
          type="button"
          onClick={() => onOpenChapter(book, upNext, true)}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full border border-line text-fg-secondary text-[13px] font-bold"
        >
          <Headphones className="w-4 h-4" aria-hidden="true" />{s.listenFrom(upNext)}
        </button>
        {allowBookChange && (
          <button
            type="button"
            onClick={() => setPickingBook(true)}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full border border-line text-fg-secondary text-[13px] font-bold"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />{s.changeBook}
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2 mt-4" role="list">
        {Array.from({ length: total }, (_, i) => i + 1).map((ch) => {
          const isRead = read.includes(ch);
          const isNext = ch === upNext;
          return (
            <button
              key={ch}
              type="button"
              role="listitem"
              onClick={() => onOpenChapter(book, ch)}
              aria-label={`${shortBookName(book.name)} ${ch}${isRead ? `, ${s.legendRead}` : ''}${storyChapters.has(ch) ? `, ${s.legendStory}` : ''}`}
              className={`relative aspect-square min-h-0 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
                isNext
                  ? 'bg-accent text-accent-on'
                  : isRead
                    ? 'bg-amber-100 dark:bg-amber-500/15 text-accent-text'
                    : 'border border-line text-fg-secondary hover:border-accent/60'
              }`}
            >
              {ch}
              {storyChapters.has(ch) && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#B8862B] dark:bg-[#E2B65E]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] font-semibold text-fg-muted">
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px] bg-amber-100 dark:bg-amber-500/15" />{s.legendRead}</span>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px] bg-accent" />{s.legendNext}</span>
        {storyChapters.size > 0 && (
          <span className="flex items-center gap-1.5"><i className="w-1.5 h-1.5 rounded-full bg-[#B8862B] dark:bg-[#E2B65E]" />{s.legendStory}</span>
        )}
      </div>
    </BibleSheet>
  );
};
