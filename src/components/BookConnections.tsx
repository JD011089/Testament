import React, { useMemo } from 'react';
import { ExternalLink, Swords } from 'lucide-react';
import type { CanonBook } from '../data/canon';
import { bookModuleLabel, dilemmasForBook } from '../utils/bookLinks';

interface BookConnectionsProps {
  book: CanonBook;
  onOpenModule?: () => void;
  onOpenDilemma?: (dilemmaId: string) => void;
  compact?: boolean;
}

export const BookConnections: React.FC<BookConnectionsProps> = ({
  book,
  onOpenModule,
  onOpenDilemma,
  compact = false,
}) => {
  const moduleLabel = bookModuleLabel(book);
  const dilemmas = useMemo(() => dilemmasForBook(book.name).slice(0, compact ? 2 : 3), [book.name, compact]);

  if (!moduleLabel && dilemmas.length === 0) return null;

  return (
    <div className={compact ? 'mt-4 flex flex-wrap gap-2' : 'mt-5 space-y-3'}>
      {moduleLabel && onOpenModule && (
        <button
          type="button"
          onClick={onOpenModule}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
        >
          <span>{moduleLabel}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )}
      {dilemmas.map((dilemma) => (
        <button
          key={dilemma.id}
          type="button"
          onClick={() => onOpenDilemma?.(dilemma.id)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors text-left"
        >
          <Swords className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>{dilemma.title}</span>
        </button>
      ))}
    </div>
  );
};
