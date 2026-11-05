import { useMemo, useState } from 'react';
import { readDeck, setVerseStrength, type CardStrength, type DeckCharacterCard, type DeckVerseCard } from '../utils/deck';
import { registerDynamicBibleVerse } from '../utils/verseRegistry';
import { STORY_STOPS, getStoryStop } from '../content/stories';
import { getCompletedStoryIds } from '../utils/storyProgress';
import { getDailyStoryId } from '../utils/dailyStory';
import { getDeckReviewQueue } from '../utils/deckReview';
import { celebrate } from '../utils/feedback';
import { shareVerseCard } from '../utils/shareCard';
import { getStoryIllustrationUrl } from '../utils/storyIllustrations';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { StrengthSeal } from '../components/PracticeView';
import { usePracticeStrings } from '../components/practice/strings';
import { BookOpen, Dumbbell, RotateCw, Share2 } from 'lucide-react';

interface DeckScreenProps {
  onPractice: (ref: string) => void;
  onReadChapter: (passage: string) => void;
  onPlayStory?: (storyId: string) => void;
}

type StrengthFilter = 'all' | CardStrength;

const TIERS: CardStrength[] = ['gold', 'silver', 'bronze'];

export function DeckScreen({ onPractice, onReadChapter, onPlayStory }: DeckScreenProps) {
  const { t } = useLanguage();
  const s = usePracticeStrings();
  const [nonce, setNonce] = useState(0);
  const cards = useMemo(() => readDeck(), [nonce]);
  const [tab, setTab] = useState<'verses' | 'people'>('verses');
  const [strengthFilter, setStrengthFilter] = useState<StrengthFilter>('all');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const verseCards = useMemo(() => cards.filter((card): card is DeckVerseCard => card.type === 'verse'), [cards]);
  const peopleCards = useMemo(() => cards.filter((card): card is DeckCharacterCard => card.type === 'character'), [cards]);
  const tierCounts = useMemo(() => {
    const counts: Record<CardStrength, number> = { gold: 0, silver: 0, bronze: 0 };
    for (const card of verseCards) counts[card.strength] += 1;
    return counts;
  }, [verseCards]);

  const dueRefs = useMemo(() => getDeckReviewQueue(verseCards).map((item) => item.card.ref), [verseCards]);
  const completed = useMemo(() => new Set(getCompletedStoryIds()), [nonce]);
  // Next stories to finish: shown as locked cards so it's clear how to earn more.
  const nextLocked = useMemo(() => STORY_STOPS.filter((stop) => !completed.has(stop.id)).slice(0, 2), [completed]);

  const visibleVerses = verseCards.filter((card) => strengthFilter === 'all' || card.strength === strengthFilter);

  const practiceCard = (card: DeckVerseCard) => {
    registerDynamicBibleVerse(card.ref, card.text, card.translation);
    onPractice(card.ref);
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

  const lockedTiles = nextLocked.map((stop) => (
    <li key={`locked-${stop.id}`} className="flex min-h-[150px] flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border-[1.5px] border-dashed border-line bg-stone-100/60 dark:bg-stone-900/40 p-3 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-line font-serif text-xl font-semibold text-surface" aria-hidden="true">?</span>
      <span className="text-[12.5px] font-bold text-fg-secondary">{s.locked}</span>
      <span className="text-[11px] text-fg-muted">{tab === 'verses' ? s.finishToEarn(stop.title) : s.finishStory(stop.title)}</span>
    </li>
  ));

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-4">
      <PageHeader className="!mb-1" title={s.collection} />

      {cards.length === 0 ? (
        <>
          <section className="rounded-[1.4rem] border border-line bg-surface-raised p-5 text-center shadow-sm">
            <div className="relative mx-auto mb-2 h-[150px] w-[230px]" aria-hidden="true">
              {[
                { label: 'Ruth 1:16', cls: '-translate-x-[118%] -rotate-12 !items-start bg-stone-100 dark:bg-stone-900' },
                { label: 'Exodus 14:14', cls: 'translate-x-[18%] rotate-12 !items-start justify-end text-right bg-stone-100 dark:bg-stone-900' },
                { label: '1 Samuel 17:47', cls: '-translate-x-1/2 z-10 bg-surface-raised', seal: true },
              ].map((c) => (
                <span key={c.label} className={`absolute left-1/2 top-2 flex h-[130px] w-[96px] items-end rounded-[14px] border border-line p-2.5 font-serif text-[12px] font-semibold text-fg shadow-[0_10px_24px_-12px_rgba(10,15,30,0.4)] ${c.cls}`}>
                  {c.seal && <StrengthSeal strength="gold" className="absolute right-2 top-2 h-5 w-5" />}
                  {c.label}
                </span>
              ))}
            </div>
            <h2 className="font-serif text-xl font-semibold text-fg">{s.firstCardTitle}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">{s.firstCardBody}</p>
            {onPlayStory && (
              <button type="button" onClick={() => { celebrate('tap'); onPlayStory(getDailyStoryId()); }} className="btn-primary mt-4 w-full">
                {s.playToday}
              </button>
            )}
          </section>
          <ol className="rounded-[1.25rem] border border-line bg-surface-raised px-4 py-1 divide-y divide-line">
            {[s.how1, s.how2, s.how3].map((line, i) => (
              <li key={line} className="flex items-center gap-3 py-3 text-[13.5px] text-fg-secondary">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-100 dark:bg-amber-500/15 text-[12px] font-bold text-accent-text">{i + 1}</span>
                {line}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          {/* Progress */}
          <section className="rounded-[1.25rem] border border-line bg-surface-raised p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-fg">{s.storiesOf(completed.size, STORY_STOPS.length)}</h2>
              <span className="text-xs font-semibold text-fg-muted">{s.cardsCount(cards.length)}</span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round((completed.size / Math.max(1, STORY_STOPS.length)) * 100)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-fg-secondary">
              {TIERS.map((tier) => (
                <span key={tier} className="flex items-center gap-1.5">
                  <StrengthSeal strength={tier} className="h-3.5 w-3.5" />
                  {tierCounts[tier]} {t(`deck.tier.${tier}`).toLowerCase()}
                </span>
              ))}
            </div>
          </section>

          {/* Verses / People */}
          <div className="grid grid-cols-2 rounded-full border border-line bg-stone-100 dark:bg-stone-900 p-1" role="tablist">
            {(['verses', 'people'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => { celebrate('tap'); setTab(id); }}
                className={`min-h-[38px] rounded-full text-[13px] font-bold ${tab === id ? 'bg-surface-raised dark:bg-stone-800 text-fg shadow-sm' : 'text-fg-muted'}`}
              >
                {id === 'verses' ? `${s.verses} · ${verseCards.length}` : `${s.peopleTab} · ${peopleCards.length}`}
              </button>
            ))}
          </div>

          {tab === 'verses' ? (
            <>
              {verseCards.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {(['all', ...TIERS] as StrengthFilter[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => { celebrate('tap'); setStrengthFilter(strengthFilter === tier ? 'all' : tier); }}
                      aria-pressed={strengthFilter === tier}
                      className={`inline-flex !min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${
                        strengthFilter === tier ? 'bg-fg text-surface' : 'border border-line bg-surface-raised text-fg-secondary'
                      }`}
                    >
                      {tier !== 'all' && <StrengthSeal strength={tier} className="h-3 w-3" />}
                      {tier === 'all' ? t('deck.filterAll') : t(`deck.tier.${tier}`)}
                    </button>
                  ))}
                </div>
              )}
              <ul className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                {visibleVerses.map((card) => (
                  <li
                    key={card.id}
                    className="relative flex flex-col rounded-[1.4rem] border border-line bg-surface-raised p-4 pt-5 shadow-[0_8px_24px_-14px_rgba(10,15,30,0.25)]"
                  >
                    <StrengthSeal strength={card.strength} className="absolute -top-3 right-4 h-8 w-8" />
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
                        <p className="font-serif text-[15px] font-semibold text-fg">{card.ref}</p>
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
                          <StrengthSeal strength={card.strength === 'bronze' ? 'silver' : 'gold'} className="h-3.5 w-3.5" />
                          {t(card.strength === 'bronze' ? 'deck.markSilver' : 'deck.markGold')}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {strengthFilter === 'all' && lockedTiles}
              </ul>
            </>
          ) : (
            <ul className="grid grid-cols-2 gap-2.5">
              {peopleCards.map((card) => (
                <li key={card.id} className="relative min-h-[150px] overflow-hidden rounded-[1.25rem] bg-stone-800 text-white">
                  <img src={getStoryIllustrationUrl(card.storyId)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-[linear-gradient(transparent_35%,rgba(6,8,14,0.88))]" aria-hidden="true" />
                  <span className="absolute inset-x-3 bottom-2.5">
                    <span className="block font-serif text-[17px] font-semibold">{card.name}</span>
                    <span className="block text-[11px] text-white/85">{card.storyTitle}</span>
                  </span>
                </li>
              ))}
              {lockedTiles}
            </ul>
          )}
        </>
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
