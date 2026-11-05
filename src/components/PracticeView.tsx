import React from 'react';
import { WordForge } from './WordForge';
import { PageHeader } from './PageHeader';

interface PracticeViewProps {
  memorizedVerses: string[];
  onVerseMastered: (verseId: string) => void;
  targetVerseId?: string | null;
  onClearTargetVerse?: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  memorizedVerses,
  onVerseMastered,
  targetVerseId,
  onClearTargetVerse,
}) => {
  return (
    <div className="space-y-4">
      <div className="max-w-md mx-auto px-4 pt-2">
        <PageHeader title="Practice" className="mb-4" />
      </div>

      <WordForge
        memorizedVerses={memorizedVerses}
        onVerseMastered={onVerseMastered}
        targetVerseId={targetVerseId}
        onClearTargetVerse={onClearTargetVerse}
      />
    </div>
  );
};
