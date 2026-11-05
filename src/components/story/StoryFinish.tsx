import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Flame, ListChecks, PenLine, Share2 } from 'lucide-react';
import type { Story, StoryVerse } from '../../types/story';
import { useLanguage } from '../../context/LanguageContext';
import { getDeckVerseCards, setVerseStrength, type CardStrength } from '../../utils/deck';
import { getDailyStreakCount } from '../../utils/dailyEngine';
import { getCampaignDateKey } from '../../data/dailyCampaigns';
import { saveDecisionJournalEntry } from '../../utils/decisionJournal';
import { shareVerseCard } from '../../utils/shareCard';
import { celebrate } from '../../utils/feedback';
import { StoryQuiz } from '../daily/StoryQuiz';

interface StoryFinishProps {
  story: Story;
  /** The verse the payoff card put in the deck. */
  verse: StoryVerse;
}

type View = 'hub' | 'reflect' | 'quiz';

function deckStrength(ref: string): CardStrength {
  return getDeckVerseCards().find((card) => card.ref === ref)?.strength ?? 'bronze';
}

/** Shown after the last card: reflect, quiz, and the verse card just earned. */
export function StoryFinish({ story, verse }: StoryFinishProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<View>('hub');
  const [reflection, setReflection] = useState('');
  const [reflected, setReflected] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [upgraded, setUpgraded] = useState(false);
  const [strength, setStrength] = useState<CardStrength>(() => deckStrength(verse.ref));
  const [sharing, setSharing] = useState(false);
  const streak = useMemo(() => getDailyStreakCount(), []);
  const prompt = story.reflection ?? t('finish.reflectFallback');

  const saveReflection = () => {
    const text = reflection.trim();
    if (!text) return;
    saveDecisionJournalEntry({
      dateKey: getCampaignDateKey(),
      passageReference: story.passage,
      heroName: story.title,
      scenarioQuestion: prompt,
      chosenText: text,
      userCustomText: text,
      storyTakeaway: `${verse.text} (${verse.ref})`,
      entryType: 'story_reflection',
    });
    celebrate('snap');
    setReflected(true);
    setView('hub');
  };

  const finishQuiz = (correct: number, total: number) => {
    setScore({ correct, total });
    if (total > 0 && correct === total && strength === 'bronze') {
      setVerseStrength(verse.ref, 'silver');
      setStrength('silver');
      setUpgraded(true);
      celebrate('payoff');
    }
    setView('hub');
  };

  const share = async () => {
    setSharing(true);
    try {
      await shareVerseCard({ ref: verse.ref, text: verse.text, translation: verse.translation, storyId: story.id });
      celebrate('snap');
    } catch {
      // sharing is best effort
    } finally {
      setSharing(false);
    }
  };

  const backButton = (
    <button type="button" onClick={() => setView('hub')} className="btn-quiet !min-h-10 -ml-2 text-sm">
      <ChevronLeft className="h-4 w-4" /> {t('story.back')}
    </button>
  );

  if (view === 'reflect') {
    return (
      <article className="rounded-[1.75rem] border border-line bg-surface-raised p-5 text-fg shadow-[0_16px_48px_rgba(0,0,0,0.3)] sm:p-7">
        {backButton}
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-fg-muted">{t('finish.reflect')}</p>
        <h2 className="mt-2 font-serif text-xl leading-snug sm:text-2xl">{prompt}</h2>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder={t('finish.reflectPlaceholder')}
          rows={5}
          autoFocus
          className="mt-4 w-full resize-none rounded-2xl border border-line bg-surface p-3 font-serif text-base leading-relaxed text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button type="button" onClick={saveReflection} disabled={!reflection.trim()} className="btn-primary mt-3 w-full disabled:opacity-50">
          {t('finish.saveToJournal')}
        </button>
      </article>
    );
  }

  if (view === 'quiz') {
    return (
      <article className="rounded-[1.75rem] border border-line bg-surface-raised p-5 text-fg shadow-[0_16px_48px_rgba(0,0,0,0.3)] sm:p-7">
        {backButton}
        <div className="mt-2">
          <StoryQuiz story={story} onDone={finishQuiz} />
        </div>
      </article>
    );
  }

  const rows = [
    {
      key: 'reflect',
      Icon: PenLine,
      title: t('finish.reflect'),
      detail: reflected ? t('finish.savedToJournal') : t('finish.reflectDetail'),
      done: reflected,
      open: () => setView('reflect'),
    },
    ...(story.quiz.length > 0
      ? [{
          key: 'quiz',
          Icon: ListChecks,
          title: t('finish.quiz'),
          detail: score ? t('finish.quizScore', { correct: score.correct, total: score.total }) : t('finish.quizDetail'),
          done: score !== null,
          open: () => setView('quiz'),
        }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <header className="text-center">
        <span className="foil-gold mx-auto grid h-14 w-14 place-items-center rounded-full text-stone-900 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
          <Check className="h-7 w-7" strokeWidth={3} />
        </span>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
          {t('finish.complete')}
          {streak > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-amber-100">
              · <Flame className="h-3.5 w-3.5 fill-current" /> {t('finish.streak', { count: streak })}
            </span>
          )}
        </p>
        <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">{story.title}</h2>
      </header>

      <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line bg-surface-raised text-fg">
        {rows.map(({ key, Icon, title, detail, done, open }) => (
          <li key={key}>
            <button type="button" onClick={() => { celebrate('tap'); open(); }} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${done ? 'bg-success/15 text-success' : 'bg-amber-100 text-accent-text dark:bg-amber-500/15'}`}>
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-bold">{title}</span>
                <span className="block text-xs text-fg-muted">{detail}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-fg-muted" />
            </button>
          </li>
        ))}
      </ul>

      <section className={`foil-${strength} rounded-[1.5rem] p-[3px]`} aria-label={t('finish.yourCard')}>
        <div className="rounded-[calc(1.5rem-3px)] bg-stone-950/95 px-4 py-4 text-center">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
            {t('finish.yourCard')} · {t(`deck.tier.${strength}`)}
          </p>
          <p className="mt-2 line-clamp-4 font-serif text-base italic leading-relaxed text-white">“{verse.text}”</p>
          <p className="mt-1 text-xs text-white/60">{verse.ref}</p>
          {upgraded && <p className="mt-2 text-sm font-semibold text-amber-100" aria-live="polite">{t('finish.upgraded')}</p>}
          <button
            type="button"
            onClick={share}
            disabled={sharing}
            className="btn-secondary mt-3 min-h-10 !border-white/25 !bg-white/10 !text-white hover:!bg-white/15"
          >
            <Share2 className="h-4 w-4" /> {t('deck.share')}
          </button>
        </div>
      </section>
    </div>
  );
}
