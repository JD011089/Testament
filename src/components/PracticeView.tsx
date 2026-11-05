import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, CalendarDays, Users, Car, ScrollText } from 'lucide-react';
import { WordForge } from './WordForge';
import { PageHeader } from './PageHeader';
import { SeriesPickerModal } from './SeriesPickerModal';
import { getDeckReviewItems, type DeckReviewItem } from '../utils/deckReview';
import { getDeckVerseCards, type CardStrength } from '../utils/deck';
import { registerDynamicBibleVerse } from '../utils/verseRegistry';
import { soundEngine } from '../utils/audio';
import { celebrate } from '../utils/feedback';
import { usePracticeStrings } from './practice/strings';

interface PracticeViewProps {
  memorizedVerses: string[];
  onVerseMastered: (verseId: string) => void;
  targetVerseId?: string | null;
  onClearTargetVerse?: () => void;
  onOpenTrivia?: () => void;
  onOpenDriveMode?: () => void;
}

const SEAL_ORDER: CardStrength[] = ['bronze', 'silver', 'gold'];
const STATUS_ORDER = { due: 0, new: 1, later: 2 } as const;

/** Foil seal used for card strength (bronze / silver / gold). */
export const StrengthSeal: React.FC<{ strength: CardStrength; className?: string }> = ({ strength, className = 'h-7 w-7' }) => (
  <span
    className={`foil-${strength} block shrink-0 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.6)] ${className}`}
    aria-hidden="true"
  />
);

function daysUntil(date: string): number {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Practice: today's review first, your collected verses with their strength,
 * then the extra tools (trivia, psalms, proverbs, series, people, drive mode).
 * Tapping a verse opens the memorize session (WordForge).
 */
export const PracticeView: React.FC<PracticeViewProps> = ({
  memorizedVerses,
  onVerseMastered,
  targetVerseId,
  onClearTargetVerse,
  onOpenTrivia,
  onOpenDriveMode,
}) => {
  const s = usePracticeStrings();
  const [session, setSession] = useState<{ target: string | null } | null>(() => (targetVerseId ? { target: targetVerseId } : null));
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // A verse sent from elsewhere (Today, Bible, Collection) opens straight into practice.
  useEffect(() => {
    if (targetVerseId) setSession({ target: targetVerseId });
  }, [targetVerseId]);

  // Coming back from a session: reload due dates and strengths.
  const items = useMemo<DeckReviewItem[]>(
    () => [...getDeckReviewItems()].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [refresh, session] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const tiers = useMemo(() => {
    const counts: Record<CardStrength, number> = { bronze: 0, silver: 0, gold: 0 };
    for (const card of getDeckVerseCards()) counts[card.strength] += 1;
    return counts;
  }, [refresh, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const due = items.filter((i) => i.status === 'due');
  const fresh = items.filter((i) => i.status === 'new');

  const openVerse = (item: DeckReviewItem | null) => {
    soundEngine.playClick();
    if (item) registerDynamicBibleVerse(item.card.ref, item.card.text, item.card.translation);
    setSession({ target: item ? item.card.ref : null });
    window.scrollTo({ top: 0 });
  };

  const startReview = () => {
    celebrate('tap');
    openVerse(due[0] ?? fresh[0] ?? items[0] ?? null);
  };

  if (session) {
    return (
      <div className="w-full pb-4">
        <div className="max-w-2xl mx-auto px-3 pt-2">
          <button
            type="button"
            onClick={() => { soundEngine.playClick(); setSession(null); setRefresh((n) => n + 1); window.scrollTo({ top: 0 }); }}
            className="inline-flex items-center gap-1 min-h-[44px] pl-1 pr-3 rounded-full text-[15px] font-semibold text-fg-secondary hover:bg-stone-100 dark:hover:bg-stone-850"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            {s.backToPractice}
          </button>
        </div>
        <WordForge
          memorizedVerses={memorizedVerses}
          onVerseMastered={(id) => { onVerseMastered(id); setRefresh((n) => n + 1); }}
          targetVerseId={session.target}
          onClearTargetVerse={onClearTargetVerse}
        />
      </div>
    );
  }

  const heroTitle = due.length > 0 ? s.dueCount(due.length) : fresh.length > 0 ? s.newCount(fresh.length) : s.allCaughtUp;
  const heroDetail = due.length + fresh.length > 0 ? s.dueDetail(Math.max(1, Math.round((due.length + fresh.length) * 0.7))) : s.caughtUpDetail;

  const tools: { key: string; title: string; hint: string; art?: string; icon?: React.ReactNode; onClick?: () => void }[] = [
    { key: 'trivia', title: s.trivia, hint: s.triviaHint, art: '/images/stories/finished/david-and-goliath.jpg', onClick: onOpenTrivia },
    { key: 'psalms', title: s.psalms, hint: s.psalmsHint, art: '/images/stories/finished/elijah-still-small-voice.jpg', onClick: () => window.dispatchEvent(new CustomEvent('open-psalms-medic')) },
    { key: 'proverbs', title: s.proverbs, hint: s.proverbsHint, icon: <ScrollText className="w-[18px] h-[18px]" />, onClick: () => window.dispatchEvent(new CustomEvent('open-proverbs-codex')) },
    { key: 'series', title: s.series, hint: s.seriesHint, icon: <CalendarDays className="w-[18px] h-[18px]" />, onClick: () => setSeriesOpen(true) },
    { key: 'people', title: s.people, hint: s.peopleHint, icon: <Users className="w-[18px] h-[18px]" />, onClick: () => window.dispatchEvent(new CustomEvent('testament-open-people')) },
    { key: 'drive', title: s.drive, hint: s.driveHint, icon: <Car className="w-[18px] h-[18px]" />, onClick: onOpenDriveMode },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-28">
      <PageHeader title={s.practice} className="!mb-3" />

      {/* Today's review */}
      <section className="rounded-[1.4rem] bg-accent text-accent-on p-4 shadow-[0_14px_30px_-14px_rgb(var(--color-accent)/0.75)]">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] opacity-80">{s.todaysReview}</p>
        <h2 className="font-serif text-[1.45rem] font-semibold leading-tight mt-0.5">{heroTitle}</h2>
        <p className="text-[13px] opacity-90 mt-0.5">{heroDetail}</p>
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {SEAL_ORDER.map((tier) => (
              <span key={tier} className="flex items-center gap-1.5 rounded-xl bg-white/15 dark:bg-black/15 px-2 py-1.5 text-[11.5px] font-bold whitespace-nowrap">
                <StrengthSeal strength={tier} className="h-3.5 w-3.5" />
                {tiers[tier]} {s[tier]}
              </span>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={startReview}
          className="mt-3 w-full min-h-[44px] rounded-full bg-white text-[#23408E] dark:bg-[#1A1306] dark:text-[#E2B65E] font-bold text-sm flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          {items.length > 0 ? s.startReview : s.practiceAVerse}
        </button>
      </section>

      {/* Your verses */}
      <div className="flex items-center justify-between px-1 mt-5 mb-2">
        <h2 className="font-serif text-lg font-semibold">{s.yourVerses}</h2>
        <button type="button" onClick={() => openVerse(null)} className="min-h-[36px] text-[13px] font-semibold text-accent-text">
          {s.browseVerses}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-sm text-fg-muted text-center">{s.noVersesYet}</p>
      ) : (
        <ul className="rounded-[1.25rem] border border-line bg-surface-raised divide-y divide-line overflow-hidden shadow-sm">
          {items.slice(0, 8).map((item) => {
            const later = item.status === 'later' && item.practice ? daysUntil(item.practice.nextReviewDate) : null;
            return (
              <li key={item.card.id}>
                <button type="button" onClick={() => openVerse(item)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left min-h-[60px]">
                  <StrengthSeal strength={item.card.strength} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-serif text-[15px] font-semibold text-fg">{item.card.ref}</span>
                    <span className="block text-[12px] text-fg-muted truncate">{item.card.text}</span>
                  </span>
                  {item.status === 'later' ? (
                    <span className="shrink-0 text-[11px] font-semibold text-fg-muted">{later !== null ? s.inDays(later) : ''}</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-accent-text">
                      {item.status === 'due' ? s.due : s.isNew}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* More ways to grow (moved here from the old Explore screen) */}
      <h2 className="font-serif text-lg font-semibold px-1 mt-6 mb-2">{s.moreWays}</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {tools.filter((t) => t.onClick).map((tool) => (
          <button
            key={tool.key}
            type="button"
            onClick={() => { soundEngine.playClick(); tool.onClick?.(); }}
            className={`relative min-h-[100px] overflow-hidden rounded-[1.1rem] p-3 text-left flex flex-col justify-end ${
              tool.art ? 'text-white bg-stone-800' : 'border border-line bg-surface-raised text-fg'
            }`}
          >
            {tool.art ? (
              <>
                <img src={tool.art} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute inset-0 bg-[linear-gradient(transparent_20%,rgba(6,8,14,0.85))]" aria-hidden="true" />
              </>
            ) : (
              <span className="mb-auto w-8 h-8 rounded-[10px] bg-amber-100 dark:bg-amber-500/15 text-accent-text flex items-center justify-center">{tool.icon}</span>
            )}
            <span className="relative block text-[13.5px] font-bold leading-tight">{tool.title}</span>
            <span className={`relative flex items-center gap-0.5 text-[11px] ${tool.art ? 'text-white/85' : 'text-fg-muted'}`}>
              {tool.hint}
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      <SeriesPickerModal isOpen={seriesOpen} onClose={() => setSeriesOpen(false)} />
    </div>
  );
};
