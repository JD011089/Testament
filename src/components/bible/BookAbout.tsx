import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { CanonBook } from '../../data/canon';
import { soundEngine } from '../../utils/audio';
import { fetchBibleChapter, type TranslationId } from '../../utils/bibleService';
import { parseScriptureReference } from '../../utils/scriptureRef';
import { getStoryIllustrationUrl } from '../../utils/storyIllustrations';
import { loadVisitedChapters } from '../../utils/readingPlace';
import { chapterCount, sectionForBook, shortBookName, storiesForBook } from '../../utils/bibleLibrary';
import { useBibleStrings } from './strings';

interface BookAboutProps {
  book: CanonBook;
  translation: TranslationId;
  onBack: () => void;
  onStartReading: (book: CanonBook, chapter: number) => void;
  onPlayStory?: (storyId: string) => void;
  onSelectStoryQuest?: (questId: string) => void;
}

/** Plain-language introduction to a book, with its key verse quoted from the real translation. */
export const BookAbout: React.FC<BookAboutProps> = ({ book, translation, onBack, onStartReading, onPlayStory, onSelectStoryQuest }) => {
  const s = useBibleStrings();
  const name = shortBookName(book.name);
  const section = sectionForBook(book);
  const stories = useMemo(() => storiesForBook(book.id), [book.id]);
  const resumeAt = loadVisitedChapters()[book.id];
  const [keyVerse, setKeyVerse] = useState<{ ref: string; text: string } | null>(null);

  // Quote the key verse from the actual translation, not a stored copy.
  useEffect(() => {
    const parsed = parseScriptureReference(book.anchorScripture.reference);
    if (!parsed) return;
    let live = true;
    fetchBibleChapter(book.name, parsed.chapter, translation)
      .then((data) => {
        if (!live) return;
        const from = parsed.verseStart || 1;
        const to = parsed.verseEnd || from;
        const text = data.verses.filter((v) => v.verse >= from && v.verse <= to).map((v) => v.text.trim()).join(' ');
        if (text) setKeyVerse({ ref: book.anchorScripture.reference, text });
      })
      .catch(() => { /* offline: the verse card is simply hidden */ });
    return () => { live = false; };
  }, [book, translation]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-surface text-fg">
      <div className="max-w-xl mx-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 z-10 -mx-4 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 bg-surface/90 backdrop-blur-md">
          <button type="button" onClick={onBack} aria-label={s.back} className="w-11 h-11 rounded-full flex items-center justify-center text-fg-muted hover:bg-stone-100 dark:hover:bg-stone-850">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <section className="rounded-3xl p-5 text-white bg-[linear-gradient(150deg,#23408E,#16295C)] dark:bg-[linear-gradient(150deg,#1D2A4A,#121A2E)] dark:text-fg shadow-[0_16px_34px_-16px_rgba(10,15,30,0.6)]">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] opacity-80">
            {s.sections[section.id]} · {book.testament === 'OT' ? s.ot : s.nt}
          </p>
          <h1 className="font-serif text-[2rem] font-semibold leading-tight mt-1">{name}</h1>
          <p className="text-[0.9rem] leading-snug opacity-90 mt-1">{book.subtitle}</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-xl bg-white/15 dark:bg-white/5 px-3 py-2">
              <b className="block text-base">{chapterCount(book)}</b>
              <span className="text-[11px] font-semibold opacity-80">{s.chapters(chapterCount(book)).replace(/^\d+\s*/, '')}</span>
            </div>
            <div className="rounded-xl bg-white/15 dark:bg-white/5 px-3 py-2">
              <b className="block text-base">{stories.length}</b>
              <span className="text-[11px] font-semibold opacity-80">{s.stories}</span>
            </div>
          </div>
        </section>

        <div className="mt-3 rounded-[1.25rem] border border-line bg-surface-raised p-4 shadow-sm">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-fg-muted mb-1.5">{s.whoWrote}</h2>
          <p className="text-[0.9rem] leading-relaxed text-fg-secondary">{book.authorContext}</p>
        </div>
        <div className="mt-3 rounded-[1.25rem] border border-line bg-surface-raised p-4 shadow-sm">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-fg-muted mb-1.5">{s.whyMatters}</h2>
          <p className="text-[0.9rem] leading-relaxed text-fg-secondary">{book.whyItMattersMonday}</p>
        </div>
        {keyVerse && (
          <div className="mt-3 rounded-[1.25rem] border border-line bg-surface-raised p-4 shadow-sm">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-fg-muted mb-1.5">{s.keyVerse} · {keyVerse.ref}</h2>
            <p className="font-serif italic text-[1.02rem] leading-relaxed text-fg">“{keyVerse.text}”</p>
          </div>
        )}

        {stories.length > 0 && onPlayStory && (
          <>
            <h2 className="mt-5 mb-2 px-1 text-[10.5px] font-bold uppercase tracking-[0.13em] text-fg-muted">{s.storiesFrom(name)}</h2>
            <div className="grid grid-cols-3 gap-2">
              {stories.map((story) => (
                <button
                  key={story.storyId}
                  type="button"
                  onClick={() => { soundEngine.playClick(); onPlayStory(story.storyId); }}
                  className="relative h-24 rounded-2xl overflow-hidden text-left bg-stone-800"
                >
                  <img src={getStoryIllustrationUrl(story.storyId)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <span className="absolute inset-0 bg-[linear-gradient(transparent_30%,rgba(0,0,0,0.82))]" aria-hidden="true" />
                  <span className="absolute left-2 right-1.5 bottom-1.5 text-white text-[11.5px] font-bold leading-tight">
                    {story.title}
                    <span className="block text-[9.5px] font-semibold opacity-80">{story.passage}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {book.deepLinkType && book.deepLinkType !== 'dossier' ? (
          <>
            <h2 className="mt-5 mb-2 px-1 text-[10.5px] font-bold uppercase tracking-[0.13em] text-fg-muted">{s.more}</h2>
            <div className="rounded-[1.25rem] border border-line bg-surface-raised divide-y divide-line overflow-hidden">
              {book.deepLinkType === 'story' && book.deepLinkId && onSelectStoryQuest && (
                <MoreRow label={s.playStory} onClick={() => onSelectStoryQuest(book.deepLinkId!)} />
              )}
              {book.deepLinkType === 'proverbs' && (
                <MoreRow label="Proverbs" onClick={() => window.dispatchEvent(new CustomEvent('open-proverbs-codex'))} />
              )}
              {book.deepLinkType === 'psalms' && (
                <MoreRow label="Psalms" onClick={() => window.dispatchEvent(new CustomEvent('open-psalms-medic'))} />
              )}
            </div>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => { soundEngine.playClick(); onStartReading(book, resumeAt ?? 1); }}
          className="mt-5 w-full h-12 rounded-full bg-accent text-accent-on font-bold text-[15px] shadow-[0_10px_24px_-10px_rgb(var(--color-accent)/0.7)]"
        >
          {resumeAt ? s.continueBook(name, resumeAt) : s.startBook(name)}
        </button>
      </div>
    </div>
  );
};

const MoreRow: React.FC<{ label: string; hint?: string; onClick: () => void }> = ({ label, hint, onClick }) => (
  <button type="button" onClick={() => { soundEngine.playClick(); onClick(); }} className="w-full flex items-center gap-3 px-4 py-3 min-h-[52px] text-left hover:bg-stone-100/70 dark:hover:bg-stone-850/70">
    <Sparkles className="w-4 h-4 text-accent-text shrink-0" aria-hidden="true" />
    <span className="flex-1 min-w-0">
      <span className="block text-[14px] font-semibold text-fg truncate">{label}</span>
      {hint && <span className="block text-[11.5px] text-fg-muted">{hint}</span>}
    </span>
    <ChevronRight className="w-4 h-4 text-fg-muted shrink-0" aria-hidden="true" />
  </button>
);
