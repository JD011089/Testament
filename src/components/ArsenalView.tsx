import React, { useState, useEffect } from 'react';
import { getAllVerses, normalizeVerseSlug } from '../utils/verseRegistry';
import { isVerseMastered } from '../utils/fsrsEngine';
import { STORY_QUESTS } from '../data/stories';
import type { MemoryVerse } from '../types';
import { soundEngine } from '../utils/audio';
import { CalendarRemindersModal } from './CalendarRemindersModal';
import { PageHeader } from './PageHeader';
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
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ArsenalViewProps {
  memorizedVerses: string[];
  bookmarkedVerses: string[];
  onToggleBookmark: (verseId: string) => void;
  onPracticeVerse: (verseId: string) => void;
}

type ArsenalFilter = 'saved' | 'mastered' | 'bookmarked';

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
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<ArsenalFilter>('saved');
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
  const allVerses = getAllVerses(language);

  // Helper matching function across IDs and references
  const matchesIdentifier = (verse: MemoryVerse, idList: string[]): boolean => {
    const vId = verse.id.toLowerCase();
    const vRef = verse.reference.toLowerCase();
    const vSlug = normalizeVerseSlug(verse.reference);
    const vIdSlug = normalizeVerseSlug(verse.id);

    return idList.some(raw => {
      const clean = raw.toLowerCase();
      const slug = normalizeVerseSlug(raw);
      return (
        clean === vId ||
        clean === vRef ||
        slug === vSlug ||
        slug === vIdSlug ||
        clean === `story-${vId}` ||
        clean === verse.actId?.toLowerCase() ||
        clean === verse.storyQuestId?.toLowerCase()
      );
    });
  };

  const isVerseBookmarked = (v: MemoryVerse) => matchesIdentifier(v, bookmarkedVerses);
  const isVerseMemorized = (v: MemoryVerse) => matchesIdentifier(v, memorizedVerses) || isVerseMastered(v.id) || isVerseMastered(v.reference);

  const savedVerses = allVerses.filter((v) => isVerseBookmarked(v) || isVerseMemorized(v));

  const filteredVerses = savedVerses.filter((verse: MemoryVerse) => {
    const mastered = isVerseMemorized(verse);
    const bookmarked = isVerseBookmarked(verse);
    const matchesFilter =
      activeFilter === 'saved' ||
      (activeFilter === 'mastered' && mastered) ||
      (activeFilter === 'bookmarked' && bookmarked);
    const matchesSearch =
      verse.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verse.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (verse.heroName && verse.heroName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      verse.plainEnglishSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSpeak = (verse: MemoryVerse) => {
    if (activeAudioVerseId === verse.id) {
      soundEngine.stopSpeaking();
      setActiveAudioVerseId(null);
    } else {
      soundEngine.stopSpeaking();
      setActiveAudioVerseId(verse.id);
      // Scripture-only utterance: reflection is visual-only with its badge.
      soundEngine.speakVerse(
        `${verse.reference}. ${verse.text}`,
        () => setActiveAudioVerseId(null)
      );
    }
  };

  const masteredVerses = savedVerses.filter((v) => isVerseMemorized(v));
  const bookmarkedList = savedVerses.filter((v) => isVerseBookmarked(v));

  const filters: { id: ArsenalFilter; label: string; count: number }[] = [
    { id: 'saved', label: t('arsenal.allSaved'), count: savedVerses.length },
    { id: 'mastered', label: t('arsenal.mastered'), count: masteredVerses.length },
    { id: 'bookmarked', label: t('arsenal.bookmarked'), count: bookmarkedList.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-2 md:pb-6 text-left">
      <PageHeader
        eyebrow={t('arsenal.badge')}
        eyebrowIcon={<Shield className="w-4 h-4" />}
        title={t('arsenal.title')}
        subtitle={t('arsenal.subtitle')}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search saved scriptures"
            placeholder={t('arsenal.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-parchment-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500/70 focus-visible:ring-2 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveFilter(f.id);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-200/50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {filteredVerses.length === 0 ? (
        <div className="text-center py-16 text-stone-500 text-sm space-y-2">
          <p>
            {savedVerses.length === 0
              ? t('arsenal.nothingSaved')
              : t('arsenal.noMatch', { query: searchQuery || activeFilter })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVerses.map((verse) => {
            const isMastered = isVerseMemorized(verse);
            const isBookmarked = isVerseBookmarked(verse);
            const isSpeakingThis = activeAudioVerseId === verse.id;

            return (
              <div 
                key={verse.id}
                className="p-5 md:p-6 rounded-2xl bg-stone-100/70 hover:bg-stone-100 dark:bg-stone-900/60 dark:hover:bg-stone-850 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-serif font-bold text-amber-800 dark:text-amber-400">
                        {verse.reference}
                      </span>
                      {isMastered && (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                          {t('arsenal.masteredBadge')}
                        </span>
                      )}
                      {isBookmarked && (
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                          {t('arsenal.bookmarkedBadge')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeak(verse)}
                        title={isSpeakingThis ? t('dashboard.pauseAudio') : t('arsenal.audioRecital')}
                        aria-label={isSpeakingThis ? t('dashboard.pauseAudio') : t('arsenal.audioRecital')}
                        className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
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
                        title={t('arsenal.toggleBookmark')}
                        className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <blockquote className="font-reading text-base md:text-lg text-stone-800 dark:text-parchment-100 italic pl-3 border-l-2 border-amber-500 dark:border-amber-600/60 my-2 leading-relaxed">
                    &ldquo;{verse.text}&rdquo;
                  </blockquote>

                  <div className="my-3 p-3.5 rounded-xl bg-white/80 dark:bg-stone-950/70 text-xs md:text-sm text-stone-700 dark:text-stone-300">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-semibold mb-1" role="note" aria-label="AI reflection, Not Scripture">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('arsenal.plainEnglish')} • AI reflection • Not Scripture</span>
                    </div>
                    <p className="leading-relaxed">{verse.plainEnglishSummary}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                    {verse.heroName ? `Story: ${verse.heroName}` : verse.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setPulseModalVerse(verse);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 py-1.5 px-2.5 rounded-lg bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 transition-colors"
                      title={t('arsenal.reminders')}
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('arsenal.reminders')}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onPracticeVerse(verse.id);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-amber-500/10"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>{t('arsenal.practice')} →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(notes).length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200/60 dark:border-stone-800/60">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-3">
            <FileText className="w-4 h-4" />
            <span>{t('arsenal.personalJournal')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notes).map(([actId, noteText]) => (
              <div key={actId} className="p-4 rounded-xl bg-stone-100/60 dark:bg-stone-900/40 text-xs">
                <div className="text-amber-800 dark:text-amber-400 font-serif font-bold text-sm mb-1">{getActTitle(actId)}</div>
                <p className="text-stone-700 dark:text-stone-300 italic">&ldquo;{noteText}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <CalendarRemindersModal
        isOpen={pulseModalVerse !== null}
        onClose={() => setPulseModalVerse(null)}
        initialType="recall"
        targetVerse={pulseModalVerse}
        onOpenWordForge={(verseId) => {
          setPulseModalVerse(null);
          onPracticeVerse(verseId);
        }}
      />
    </div>
  );
};
