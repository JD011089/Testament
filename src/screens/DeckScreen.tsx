import { useMemo, useState } from 'react';
import { readDeck, setVerseStrength, type CardStrength, type DeckVerseCard } from '../utils/deck';
import { getStoryStop } from '../content/stories';
import { isStoryCompleted } from '../utils/storyProgress';
import { celebrate } from '../utils/feedback';
import { shareVerseCard } from '../utils/shareCard';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { BookOpen, Dumbbell, Share2, RotateCw } from 'lucide-react';

interface DeckScreenProps {
  onPractice: (ref: string) => void;
  onReadChapter: (passage: string) => void;
}

type StrengthFilter = 'all' | CardStrength;

const STRENGTH_STYLES: Record<CardStrength, string> = {
  bronze: 'bg-amber-700/20 text-amber-900 dark:text-amber-300 border-amber-700/40',
  silver: 'bg-stone-300/40 text-stone-800 dark:text-stone-200 border-stone-400/50',
  gold: 'bg-amber-400/25 text-amber-900 dark:text-amber-200 border-amber-400/60'
};

export function DeckScreen({ onPractice, onReadChapter }: DeckScreenProps) {
  const { t } = useLanguage();
  const [nonce, setNonce] = useState(0);
  const cards = useMemo(() => readDeck(), [nonce]);
  const [strengthFilter, setStrengthFilter] = useState<StrengthFilter>('all');
  const [arcFilter, setArcFilter] = useState<string>('all');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
        title={t('deck.title')}
        subtitle={cards.length > 0 ? t('deck.subtitleCount', { count: cards.length }) : t('deck.subtitleEmpty')}
      />

      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-1.5">
          {(['all', 'bronze', 'silver', 'gold'] as StrengthFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { celebrate('tap'); setStrengthFilter(s); }}
              aria-pressed={strengthFilter === s}
              className={`btn-segment w-full min-w-0 capitalize px-1.5 ${strengthFilter === s ? 'btn-segment-selected' : ''}`}
            >
              {s === 'all' ? t('deck.filterAll') : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {arcs.length > 0 && (
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

      {visible.length === 0 ? (
        <p className="text-body text-fg-muted text-center py-10">
          {t('deck.empty')}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map((card) => card.type === 'verse' ? (
            <li key={card.id} className="rounded-2xl border border-line bg-surface-raised p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-label uppercase text-fg-muted">{card.ref}</span>
                <span className={`text-label uppercase px-2 py-0.5 rounded-full border ${STRENGTH_STYLES[card.strength]}`}>{card.strength}</span>
              </div>
              {flipped === card.id ? (
                <VerseCardBack card={card} onPractice={onPractice} onReadChapter={onReadChapter} />
              ) : (
                <p className="text-body text-fg font-reading line-clamp-4">“{card.text}”</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" className="btn-secondary" onClick={() => { celebrate('tap'); setFlipped(flipped === card.id ? null : card.id); }}>
                  <RotateCw className="w-4 h-4" /> {t('deck.flip')}
                </button>
                <button
                  type="button"
                  className="btn-quiet"
                  onClick={() => { celebrate('tap'); onPractice(card.ref); }}
                >
                  <Dumbbell className="w-4 h-4" /> {t('common.practice')}
                </button>
                <button
                  type="button"
                  className="btn-quiet"
                  disabled={busy === card.id}
                  onClick={() => handleShare(card)}
                >
                  <Share2 className="w-4 h-4" /> {t('deck.share')}
                </button>
                {card.strength !== 'gold' && (
                  <button
                    type="button"
                    className="btn-quiet"
                    onClick={() => {
                      const next: CardStrength = card.strength === 'bronze' ? 'silver' : 'gold';
                      setVerseStrength(card.ref, next);
                      setNonce((n) => n + 1);
                    }}
                  >
                    Mark {card.strength === 'bronze' ? 'silver' : 'gold'}
                  </button>
                )}
              </div>
            </li>
          ) : (
            <li key={card.id} className="rounded-2xl border border-line bg-surface-raised p-4 space-y-2">
              <span className="text-label uppercase text-fg-muted">Character</span>
              <h3 className="text-title-3 font-serif text-fg">{card.name}</h3>
              <p className="text-small text-fg-muted">From {card.storyTitle}</p>
              {isStoryCompleted(card.storyId) && <p className="text-small text-accent">Story finished</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VerseCardBack({ card, onPractice, onReadChapter }: { card: DeckVerseCard; onPractice: (ref: string) => void; onReadChapter: (passage: string) => void }) {
  const { t } = useLanguage();
  const stop = getStoryStop(card.storyId);
  return (
    <div className="space-y-2">
      <p className="text-small text-fg-muted">{card.storyTitle}{stop ? ` • ${stop.passage}` : ''}</p>
      <p className="text-body text-fg font-reading">“{card.text}”</p>
      <p className="text-ref text-fg-muted">{card.ref} • {card.translation}</p>
      <div className="flex gap-2">
        <button type="button" className="btn-quiet" onClick={() => { celebrate('tap'); onPractice(card.ref); }}>
          <Dumbbell className="w-4 h-4" /> {t('common.practice')}
        </button>
        {stop && (
          <button type="button" className="btn-quiet" onClick={() => { celebrate('tap'); onReadChapter(stop.passage); }}>
            <BookOpen className="w-4 h-4" /> {t('deck.read')}
          </button>
        )}
      </div>
    </div>
  );
}