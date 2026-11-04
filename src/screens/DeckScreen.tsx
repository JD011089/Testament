import { useMemo, useState } from 'react';
import { readDeck, setVerseStrength, type CardStrength, type DeckVerseCard } from '../utils/deck';
import { registerDynamicBibleVerse } from '../utils/verseRegistry';
import { getStoryStop } from '../content/stories';
import { isStoryCompleted } from '../utils/storyProgress';
import { getDueVerses } from '../utils/spacedRepetition';
import { celebrate } from '../utils/feedback';
import { shareVerseCard } from '../utils/shareCard';
import { getStoryIllustrationUrl } from '../utils/storyIllustrations';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { BookOpen, ChevronRight, Dumbbell, RefreshCw, RotateCw, Share2, User } from 'lucide-react';

interface DeckScreenProps {
  onPractice: (ref: string) => void;
  onReadChapter: (passage: string) => void;
}

type StrengthFilter = 'all' | CardStrength;

const TIERS: CardStrength[] = ['gold', 'silver', 'bronze'];

function Seal({ strength, className = '' }: { strength: CardStrength; className?: string }) {
  return (
    <span
      className={`foil-${strength} block rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] ${className}`}
      aria-hidden="true"
    />
  );
}

export function DeckScreen({ onPractice, onReadChapter }: DeckScreenProps) {
  const { t } = useLanguage();
  const [nonce, setNonce] = useState(0);
  const cards = useMemo(() => readDeck(), [nonce]);
  const [strengthFilter, setStrengthFilter] = useState<StrengthFilter>('all');
  const [arcFilter, setArcFilter] = useState<string>('all');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const verseCards = cards.filter((card): card is DeckVerseCard => card.type === 'verse');
  const tierCounts = useMemo(() => {
    const counts: Record<CardStrength, number> = { gold: 0, silver: 0, bronze: 0 };
    for (const card of verseCards) counts[card.strength] += 1;
    return counts;
  }, [verseCards]);

  const dueRefs = useMemo(() => {
    const refs = new Set(verseCards.map((card) => card.ref));
    return getDueVerses().filter((state) => refs.has(state.ref)).map((state) => state.ref);
  }, [verseCards]);

  const arcs = useMemo(() => {
    const set = new Set<string>();
    for (const card of cards) {
      const stop = getStoryStop(card.storyId);
      if (stop) set.add(stop.arc);
    }
    return Array.from(set);
  }, [cards]);

  const visible = cards.filter((card) => {
    if (strengthFilter !== 'all' && (card.type !== 'verse' || card.strength !== strengthFilter)) return false;
    if (arcFilter !== 'all' && getStoryStop(card.storyId)?.arc !== arcFilter) return false;
    return true;
  });

  const practiceCard = (card: DeckVerseCard) => {
    registerDynamicBibleVerse(card.ref, card.text, card.translation);
    onPractice(card.ref);
  };

  const startReview = () => {
    const ref = dueRefs[0] ?? verseCards.find((card) => card.strength !== 'gold')?.ref ?? verseCards[0]?.ref;
    const card = verseCards.find((c) => c.ref === ref);
    if (!card) return;
    celebrate('tap');
    practiceCard(card);
  };

  const handleShare = async (card: DeckVerseCard) => {
    setBusy(card.id);
    try {
      await shareVerseCard({ ref: card.ref, text: card.text, translation: card.translation, storyId: card.storyId });
      celebrate('snap');
    } catch {
      // sharing is best effort
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-5">
      <PageHeader
        className="!mb-2"
        eyebrow={t('deck.eyebrow')}
        title={verseCards.length > 0 ? t('deck.versesKept', { count: verseCards.length }) : t('deck.title')}
        subtitle={cards.length > 0 ? undefined : t('deck.subtitleEmpty')}
      />

      {verseCards.length > 0 && (
        <button
          type="button"
          onClick={startReview}
          className="group flex w-full items-center gap-3 rounded-2xl bg-stone-900 px-4 py-3.5 text-left text-parchment-50 shadow-md transition hover:bg-stone-800 active:scale-[0.99] dark:bg-surface-raised dark:ring-1 dark:ring-accent/30"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-on">
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.95rem] font-bold text-[#F6EEDB]">
              {dueRefs.length > 0 ? t('deck.reviewReady', { count: dueRefs.length }) : t('deck.practiceAny')}
            </span>
            <span className="block text-small text-[#CDBB98]">
              {dueRefs.length > 0
                ? t('deck.reviewDetail', { minutes: Math.max(1, Math.round(dueRefs.length * 0.5)) })
                : t('deck.practiceDetail')}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-accent transition group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      )}

      {cards.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => { celebrate('tap'); setStrengthFilter('all'); }}
              aria-pressed={strengthFilter === 'all'}
              className={`inline-flex !min-h-9 shrink-0 items-center rounded-full px-3.5 text-xs font-semibold transition ${
                strengthFilter === 'all' ? 'bg-fg text-surface' : 'border border-line bg-surface-raised text-fg-secondary hover:text-fg'
              }`}
            >
              {t('deck.filterAll')} {cards.length}
            </button>
            {TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => { celebrate('tap'); setStrengthFilter(strengthFilter === tier ? 'all' : tier); }}
                aria-pressed={strengthFilter === tier}
                className={`inline-flex !min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                  strengthFilter === tier ? 'bg-fg text-surface' : 'border border-line bg-surface-raised text-fg-secondary hover:text-fg'
                }`}
              >
                <Seal strength={tier} className="h-3 w-3" />
                {t(`deck.tier.${tier}`)} {tierCounts[tier]}
              </button>
            ))}
          </div>
          {arcs.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {arcs.map((arc) => (
                <button
                  key={arc}
                  type="button"
                  onClick={() => { celebrate('tap'); setArcFilter(arcFilter === arc ? 'all' : arc); }}
                  aria-pressed={arcFilter === arc}
                  className={`btn-segment ${arcFilter === arc ? 'btn-segment-selected' : ''}`}
                >
                  {arc}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-line-strong px-6 py-12 text-center">
          <span className="foil-bronze grid h-14 w-14 place-items-center rounded-full opacity-70" aria-hidden="true" />
          <p className="mt-4 max-w-xs text-body text-fg-muted">{t('deck.empty')}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          {visible.map((card) => card.type === 'verse' ? (
            <li
              key={card.id}
              className="relative flex flex-col rounded-[1.4rem] border border-line bg-surface-raised p-4 pt-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_24px_rgba(120,84,30,0.10)] dark:shadow-none"
            >
              <Seal strength={card.strength} className="absolute -top-3 right-4 h-8 w-8" />
              <div className="flex items-center gap-3">
                <img
                  src={getStoryIllustrationUrl(card.storyId)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 pr-8">
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-accent-text">{card.ref}</p>
                  <p className="truncate text-[11px] text-fg-muted">{card.storyTitle} · {t(`deck.tier.${card.strength}`)}{dueRefs.includes(card.ref) ? ` · ${t('deck.dueNow')}` : ''}</p>
                </div>
              </div>

              <div className="mt-3 flex-1">
                {flipped === card.id ? (
                  <VerseCardBack card={card} onReadChapter={onReadChapter} />
                ) : (
                  <p className="font-serif text-[1.02rem] italic leading-relaxed text-fg line-clamp-5">“{card.text}”</p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2">
                <button type="button" className="btn-quiet !min-h-10 text-xs" onClick={() => { celebrate('tap'); setFlipped(flipped === card.id ? null : card.id); }}>
                  <RotateCw className="w-4 h-4" /> {t('deck.flip')}
                </button>
                <button type="button" className="btn-quiet !min-h-10 text-xs text-accent-text" onClick={() => { celebrate('tap'); practiceCard(card); }}>
                  <Dumbbell className="w-4 h-4" /> {t('common.practice')}
                </button>
                <button type="button" className="btn-quiet !min-h-10 text-xs" disabled={busy === card.id} onClick={() => handleShare(card)}>
                  <Share2 className="w-4 h-4" /> {t('deck.share')}
                </button>
                {card.strength !== 'gold' && (
                  <button
                    type="button"
                    className="btn-quiet !min-h-10 ml-auto text-xs"
                    onClick={() => {
                      const next: CardStrength = card.strength === 'bronze' ? 'silver' : 'gold';
                      setVerseStrength(card.ref, next);
                      celebrate('snap');
                      setNonce((n) => n + 1);
                    }}
                  >
                    <Seal strength={card.strength === 'bronze' ? 'silver' : 'gold'} className="h-3.5 w-3.5" />
                    {t(card.strength === 'bronze' ? 'deck.markSilver' : 'deck.markGold')}
                  </button>
                )}
              </div>
            </li>
          ) : (
            <li key={card.id} className="relative flex items-center gap-3 rounded-[1.4rem] border border-line bg-surface-raised p-4">
              <img
                src={getStoryIllustrationUrl(card.storyId)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-full border-2 border-accent-border object-cover"
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-fg-muted"><User className="h-3 w-3" aria-hidden="true" /> {t('deck.character')}</p>
                <h3 className="font-serif text-title-3 text-fg">{card.name}</h3>
                <p className="text-small text-fg-muted">
                  {card.storyTitle}{isStoryCompleted(card.storyId) ? ` · ${t('deck.storyFinished')}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VerseCardBack({ card, onReadChapter }: { card: DeckVerseCard; onReadChapter: (passage: string) => void }) {
  const { t } = useLanguage();
  const stop = getStoryStop(card.storyId);
  return (
    <div className="space-y-2">
      <p className="text-small text-fg-muted">{card.storyTitle}{stop ? ` • ${stop.passage}` : ''}</p>
      <p className="text-body text-fg font-reading">“{card.text}”</p>
      <p className="text-ref text-fg-muted">{card.ref} • {card.translation}</p>
      {stop && (
        <button type="button" className="btn-quiet !min-h-10 text-xs" onClick={() => { celebrate('tap'); onReadChapter(stop.passage); }}>
          <BookOpen className="w-4 h-4" /> {t('deck.read')}
        </button>
      )}
    </div>
  );
}
