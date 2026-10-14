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
          className="btn-primary text-xs transition-colors"
        >
          <span>{moduleLabel}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )}
      {dilemmas.length > 0 && (
        <div className="w-full text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-2 mb-1 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-amber-500" />
          <span>Related life scenarios:</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {dilemmas.map((dilemma) => (
          <button
            key={dilemma.id}
            type="button"
            onClick={() => onOpenDilemma?.(dilemma.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors text-left"
          >
            <span>{dilemma.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
