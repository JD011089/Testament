import React, { useState, useEffect } from 'react';
import { Brain, GitFork } from 'lucide-react';
import { WordForge } from './WordForge';
import { DilemmaSimulator } from './DilemmaSimulator';
import { soundEngine } from '../utils/audio';

export type PracticeSubTab = 'memorize' | 'dilemmas';

interface PracticeViewProps {
  initialSubTab?: PracticeSubTab;
  memorizedVerses: string[];
  onVerseMastered: (verseId: string) => void;
  targetVerseId?: string | null;
  onClearTargetVerse?: () => void;
  onRewardXP: (amount: number) => void;
  targetDilemmaId?: string | null;
  onClearTargetDilemma?: () => void;
  onOpenNexus?: (type: string, id: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  initialSubTab = 'memorize',
  memorizedVerses,
  onVerseMastered,
  targetVerseId,
  onClearTargetVerse,
  onRewardXP,
  targetDilemmaId,
  onClearTargetDilemma,
  onOpenNexus
}) => {
  const [activeTab, setActiveTab] = useState<PracticeSubTab>(initialSubTab);

  useEffect(() => {
    if (targetDilemmaId) {
      setActiveTab('dilemmas');
    }
  }, [targetDilemmaId]);

  useEffect(() => {
    if (targetVerseId) {
      setActiveTab('memorize');
    }
  }, [targetVerseId]);

  return (
    <div className="space-y-4">
      {/* 2-pill Sub-tab Switcher: Memorize vs Dilemmas */}
      <div className="max-w-md mx-auto px-4 pt-2">
        <div 
          role="tablist" 
          aria-label="Practice tools"
          className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-line shadow-inner"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'memorize'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('memorize');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'memorize'
                ? 'bg-surface text-fg font-bold shadow-xs border border-line'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            <Brain className="w-4 h-4 text-accent" />
            <span>Memorize</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dilemmas'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('dilemmas');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'dilemmas'
                ? 'bg-surface text-fg font-bold shadow-xs border border-line'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            <GitFork className="w-4 h-4 text-accent" />
            <span>Dilemmas</span>
          </button>
        </div>
      </div>

      {/* Embedded Sub-views */}
      {activeTab === 'memorize' ? (
        <WordForge
          memorizedVerses={memorizedVerses}
          onVerseMastered={onVerseMastered}
          targetVerseId={targetVerseId}
          onClearTargetVerse={onClearTargetVerse}
        />
      ) : (
        <DilemmaSimulator
          onRewardXP={onRewardXP}
          targetDilemmaId={targetDilemmaId}
          onClearTargetDilemma={onClearTargetDilemma}
          onOpenNexus={onOpenNexus}
        />
      )}
    </div>
  );
};
