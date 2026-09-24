import React, { useState, useEffect } from 'react';
import { getAllVerses } from '../utils/verseRegistry';
import { STORY_QUESTS } from '../data/stories';
import type { MemoryVerse } from '../types';
import { soundEngine } from '../utils/audio';
import { MemoryPulseModal } from './MemoryPulseModal';
import { 
  Shield, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Search, 
  Brain,
  FileText,
  Bell
} from 'lucide-react';

interface ArsenalViewProps {
  memorizedVerses: string[];
  bookmarkedVerses: string[];
  onToggleBookmark: (verseId: string) => void;
  onPracticeVerse: (verseId: string) => void;
}

const getActTitle = (actId: string): string => {
  for (const quest of STORY_QUESTS) {
    const act = quest.acts.find(a => a.id === actId);
    if (act) {
      return `${quest.heroName} — Act ${act.actNumber}: ${act.actTitle}`;
    }
  }
  return `Act Reflection (${actId})`;
};

export const ArsenalView: React.FC<ArsenalViewProps> = ({
  memorizedVerses,
  bookmarkedVerses,
  onToggleBookmark,
  onPracticeVerse,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAudioVerseId, setActiveAudioVerseId] = useState<string | null>(null);
  const [pulseModalVerse, setPulseModalVerse] = useState<MemoryVerse | null>(null);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
    };
  }, []);

  const notes: Record<string, string> = (() => {
    try {
      const stored = localStorage.getItem('testament_notes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  })();
  const allVerses = getAllVerses();

  const categories = ['All', 'Courage & Facing Giants', 'Pressure & Anxiety', 'Anger & Self-Control', 'Restoration After Failure', 'Endurance & Brotherhood'];

  const filteredVerses = allVerses.filter((verse: MemoryVerse) => {
    const matchesCategory = selectedCategory === 'All' || verse.category === selectedCategory;
    const matchesSearch = 
      verse.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verse.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (verse.heroName && verse.heroName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      verse.plainEnglishSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSpeak = (verse: MemoryVerse) => {
    if (activeAudioVerseId === verse.id) {
      soundEngine.stopSpeaking();
      setActiveAudioVerseId(null);
    } else {
      setActiveAudioVerseId(verse.id);
      soundEngine.speakVerse(
        `${verse.reference}. ${verse.text}. Plain English takeaway: ${verse.plainEnglishSummary}`,
        () => setActiveAudioVerseId(null)
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-36 sm:pb-40 md:pb-48 text-left">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
          <Shield className="w-4 h-4" />
          <span>The Arsenal • Battle-Ready Scriptures</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-serif font-black text-stone-900 dark:text-parchment-50">
          Wisdom for Real Battles
        </h1>
        <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
          Direct scriptures categorized for practical adult challenges. Plain English breakdowns without religious complexity.
        </p>
      </div>

      {/* Search Input & Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search scriptures by topic, keyword, or reference"
            placeholder="Search by topic, keyword, or reference (e.g. anxiety, courage, Proverbs)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-parchment-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500/70 focus-visible:ring-2 focus-visible:ring-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN WIDESCREEN GRID OF SCRIPTURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVerses.map((verse) => {
          const isMastered = memorizedVerses.includes(verse.id);
          const isBookmarked = bookmarkedVerses.includes(verse.id);
          const isSpeakingThis = activeAudioVerseId === verse.id;

          return (
            <div 
              key={verse.id}
              className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#12151b] border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 dark:hover:border-amber-600/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-serif font-bold text-amber-700 dark:text-amber-400">
                      {verse.reference}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                      {verse.translation}
                    </span>
                    {isMastered && (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                        ✓ Memorized
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeak(verse)}
                      title="Audio Recital"
                      className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      {isSpeakingThis ? (
                        <VolumeX className="w-4 h-4 text-amber-500 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playSnap();
                        onToggleBookmark(verse.id);
                      }}
                      title="Bookmark to Arsenal"
                      className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verse Scripture Text */}
                <blockquote className="font-reading text-base md:text-lg text-stone-800 dark:text-parchment-100 italic pl-3 border-l-2 border-amber-500 dark:border-amber-600/60 my-2 leading-relaxed">
                  "{verse.text}"
                </blockquote>

                {/* Plain English Translation Breakdown */}
                <div className="my-3 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800/80 text-xs md:text-sm text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plain English Real Talk</span>
                  </div>
                  <p className="leading-relaxed">
                    {verse.plainEnglishSummary}
                  </p>
                </div>

                {/* Actionable Takeaway */}
                <div className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5 mb-4">
                  <strong className="text-stone-900 dark:text-stone-300 shrink-0">Today's Call: </strong>
                  <span>{verse.keyTakeaway}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  {verse.heroName ? `Story: ${verse.heroName}` : verse.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setPulseModalVerse(verse);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 py-1.5 px-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 transition-colors"
                    title="Train with daily spaced notifications"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Train Daily</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onPracticeVerse(verse.id);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-amber-500/10"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Practice &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVerses.length === 0 && (
        <div className="text-center py-16 text-stone-500 text-sm">
          No scriptures found matching "{searchQuery}". Try a different term or clear filters.
        </div>
      )}

      {/* Saved Journal Notes Section */}
      {Object.keys(notes).length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3">
            <FileText className="w-4 h-4" />
            <span>Your Personal Reflections & Journal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notes).map(([actId, noteText]) => (
              <div key={actId} className="p-4 rounded-xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs">
                <div className="text-amber-700 dark:text-amber-400 font-serif font-bold text-sm mb-1">{getActTitle(actId)}</div>
                <p className="text-stone-700 dark:text-stone-300 italic">"{noteText}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spaced Memory Pulse Modal */}
      <MemoryPulseModal
        isOpen={pulseModalVerse !== null}
        onClose={() => setPulseModalVerse(null)}
        targetVerse={pulseModalVerse}
        onOpenWordForge={(verseId) => {
          setPulseModalVerse(null);
          onPracticeVerse(verseId);
        }}
      />
    </div>
  );
};
