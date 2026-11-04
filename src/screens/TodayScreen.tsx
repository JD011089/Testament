import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getStoryById } from '../content/stories';
import { getDailyStoryId, nextStoryIdAfter } from '../utils/dailyStory';
import { isStoryCompleted } from '../utils/storyProgress';
import { todayKey, getDueVerses } from '../utils/spacedRepetition';
import { getDeckVerseCards } from '../utils/deck';
import { registerDynamicBibleVerse } from '../utils/verseRegistry';
import { loadReadingPlace } from '../utils/readingPlace';
import { celebrate } from '../utils/feedback';
import { useLanguage } from '../context/LanguageContext';
import { StoryPlayer } from '../components/story/StoryPlayer';
import { getStoryIllustrationUrl } from '../utils/storyIllustrations';
import { BookOpen, Check, ChevronRight, Flame, Play, RotateCcw, RefreshCw, Settings } from 'lucide-react';

interface TodayScreenProps {
  streakCount?: number;
  onOpenMap?: () => void;
  onOpenDeck?: () => void;
  onReadChapter: (passage: string) => void;
  onPracticeVerse?: (ref: string) => void;
  onContinueReading?: () => void;
}

function readStepIndex(storyId: string): number {
  try {
    const raw = localStorage.getItem(`testament_today_loop_${todayKey()}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { step?: number; storyId?: string };
    if (parsed?.storyId && parsed.storyId !== storyId) return 0;
    // Older saves had no story id and always belonged to David and Goliath.
    if (!parsed?.storyId && storyId !== 'david-and-goliath') return 0;
    return typeof parsed?.step === 'number' ? parsed.step : 0;
  } catch {
    return 0;
  }
}

/**
 * Which of the last seven days (Mon–Sun of this week) count toward the streak.
 * There is no per-day history, so this walks back from the last active day
 * for as many days as the streak is long.
 */
function activeDaysThisWeek(streak: number): { date: Date; active: boolean; isToday: boolean; future: boolean }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  let lastActive: Date | null = null;
  try {
    const raw = localStorage.getItem('testament_last_active');
    if (raw) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) lastActive = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  } catch {
    // ignore
  }

  const activeKeys = new Set<string>();
  if (lastActive && streak > 0) {
    for (let i = 0; i < Math.min(streak, 7); i++) {
      const d = new Date(lastActive);
      d.setDate(lastActive.getDate() - i);
      activeKeys.add(d.toDateString());
    }
  }

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      date,
      active: activeKeys.has(date.toDateString()),
      isToday: date.getTime() === today.getTime(),
      future: date.getTime() > today.getTime(),
    };
  });
}

function greetingKey(): 'today.greeting.morning' | 'today.greeting.afternoon' | 'today.greeting.evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'today.greeting.morning';
  if (hour < 18) return 'today.greeting.afternoon';
  return 'today.greeting.evening';
}

export function TodayScreen({
  streakCount = 0,
  onOpenMap,
  onOpenDeck,
  onReadChapter,
  onPracticeVerse,
  onContinueReading,
}: TodayScreenProps) {
  const { t, language } = useLanguage();
  const [storyId] = useState(() => getDailyStoryId());
  const story = getStoryById(storyId);
  const [step, setStep] = useState(() => readStepIndex(storyId) >= 1 ? 4 : 0);
  const [playing, setPlaying] = useState(false);

  const tomorrow = useMemo(() => getStoryById(nextStoryIdAfter(storyId)) ?? null, [storyId]);
  const week = useMemo(() => activeDaysThisWeek(streakCount), [streakCount, step]);
  const deckVerses = useMemo(() => getDeckVerseCards(), [step]);
  const dueVerses = useMemo(() => {
    const deckRefs = new Set(deckVerses.map((card) => card.ref));
    return getDueVerses().filter((state) => deckRefs.has(state.ref));
  }, [deckVerses]);
  const readingPlace = useMemo(() => loadReadingPlace(), []);

  if (!story) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-fg-muted">{t('today.noStory')}</div>;
  }

  const persist = (next: number) => {
    try { localStorage.setItem(`testament_today_loop_${todayKey()}`, JSON.stringify({ step: next, storyId })); } catch { /* ignore */ }
    setStep(next);
  };

  const done = step >= 4;
  const scene = getStoryIllustrationUrl(story.id);
  const opening = story.cards.find((card) => card.type === 'narration');
  const openingText = opening && opening.type === 'narration' ? opening.text : '';
  const verseSnippet = story.verse.text.length > 64 ? `${story.verse.text.slice(0, 62).replace(/[\s,;:]+\S*$/, '')}…` : story.verse.text;

  const dateLabel = new Date().toLocaleDateString(language, { weekday: 'long', month: 'short', day: 'numeric' });
  const dayInitial = (date: Date) => date.toLocaleDateString(language, { weekday: 'narrow' });

  const practiceTarget = dueVerses[0]?.ref ?? deckVerses[0]?.ref ?? null;
  const startReview = () => {
    if (!practiceTarget || !onPracticeVerse) {
      onOpenDeck?.();
      return;
    }
    const card = deckVerses.find((c) => c.ref === practiceTarget);
    if (card) registerDynamicBibleVerse(card.ref, card.text, card.translation);
    celebrate('tap');
    onPracticeVerse(practiceTarget);
  };

  const reviewTitle = dueVerses.length > 1
    ? t('today.reviewMany', { count: dueVerses.length })
    : dueVerses.length === 1
      ? t('today.reviewOne')
      : deckVerses.length > 0
        ? t('today.practiceTitle')
        : t('today.deckEmptyTitle');
  const reviewDetail = dueVerses.length > 0
    ? dueVerses.slice(0, 2).map((d) => d.ref).join(', ') + (dueVerses.length > 2 ? ` +${dueVerses.length - 2}` : '')
    : deckVerses.length > 0
      ? t('today.practiceDetail', { count: deckVerses.length })
      : t('today.deckEmptyDetail');

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-3 pb-4 xl:pt-6 xl:pb-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-accent-text">{dateLabel}</p>
          <h1 className="mt-1 font-serif text-[2rem] font-semibold leading-none text-fg">{t('today.title')}</h1>
          <p className="mt-1.5 text-small text-fg-secondary">{t(greetingKey())}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1 xl:hidden">
          <span className="inline-flex h-9 items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-3 text-label font-bold text-accent-text">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {streakCount > 0 ? `${streakCount}d` : 'New'}
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('testament-open-settings'))}
            aria-label={t('nav.settings')}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-raised text-fg-muted transition hover:text-fg"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Week strip */}
      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label={t('today.weekLabel')}>
        {week.map((day) => (
          <div key={day.date.toDateString()} className="flex flex-col items-center gap-1">
            <span className={`text-[10px] font-semibold uppercase ${day.future ? 'text-fg-muted/60' : 'text-fg-muted'}`}>{dayInitial(day.date)}</span>
            <span
              className={`grid h-7 w-full place-items-center rounded-lg transition ${
                day.active
                  ? 'bg-accent text-accent-on shadow-sm'
                  : day.isToday
                    ? 'border-2 border-accent bg-surface-raised'
                    : 'bg-line/50'
              }`}
            >
              {day.active && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />

      {/* 1 — Today's story, framed like an illuminated plate */}
      <section className="mt-4 rounded-[1.6rem] border border-accent/45 bg-surface-raised p-2.5 shadow-[0_0_0_4px_rgb(var(--color-bg)),0_0_0_5px_rgb(var(--color-accent)/0.35),0_12px_30px_rgba(120,84,30,0.12)]">
        <div className="relative overflow-hidden rounded-[1.1rem]">
          <img
            src={scene}
            alt=""
            aria-hidden="true"
            className={`h-40 w-full object-cover object-[50%_40%] sm:h-56 ${done ? 'saturate-[.8]' : ''}`}
            loading="eager"
            fetchPriority="high"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-surface-raised/90 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-accent-text backdrop-blur">
            {story.passage} · {t('today.duration', { minutes: story.estMinutes })}
          </span>
          {done && (
            <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-success text-white shadow">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="px-2 pb-2 pt-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-accent-text">
            <span className="mr-1.5 inline-grid h-4 w-4 place-items-center rounded-full border border-accent/60 align-[-3px] text-[9px]">1</span>
            {t('today.storyEyebrow')}
          </p>

          {done ? (
            <>
              <h2 className="mt-1.5 font-serif text-2xl font-semibold text-fg">{t('today.done')}</h2>
              <p className="mt-1 text-small text-fg-secondary">
                {story.title}
                {tomorrow ? ` · ${t('today.tomorrow', { title: tomorrow.title, passage: tomorrow.passage })}` : ` · ${t('today.mapFinished')}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary !min-h-10 !rounded-full px-4 text-sm"
                  onClick={() => { celebrate('tap'); setPlaying(true); }}
                >
                  <RotateCcw className="h-4 w-4" /> {t('today.playAgain')}
                </button>
                {onOpenMap && (
                  <button type="button" className="btn-quiet !min-h-10 text-sm text-accent-text" onClick={() => { celebrate('tap'); onOpenMap(); }}>
                    {t('today.openMap')} <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-1.5 font-serif text-2xl font-semibold text-fg sm:text-3xl">{story.title}</h2>
              {openingText && (
                <p className="mt-2 font-serif text-[0.95rem] leading-relaxed text-fg-secondary first-letter:float-left first-letter:mr-1.5 first-letter:mt-1 first-letter:font-display first-letter:text-[2.6rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-accent-text">
                  {openingText}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-accent-text">{t('today.youllKeep')}</p>
                  <p className="mt-0.5 line-clamp-2 font-serif text-[0.85rem] italic leading-snug text-fg">“{verseSnippet}”</p>
                  <p className="mt-0.5 text-[11px] text-fg-muted">{story.verse.ref}</p>
                </div>
                <button
                  type="button"
                  aria-label={isStoryCompleted(story.id) ? t('today.playAgain') : t('today.playStory')}
                  className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-full border border-accent-border/60 bg-gradient-to-b from-[#ECC285] to-accent-hover px-6 font-bold text-accent-on shadow-[0_6px_16px_rgba(154,106,34,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:brightness-105 active:scale-95"
                  onClick={() => { celebrate('tap'); setPlaying(true); }}
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>{t('today.begin')}</span>
                </button>
              </div>
              <p className="mt-2.5 text-[11px] text-fg-muted">{t('today.thenQuestions')}</p>
            </>
          )}
        </div>
      </section>

      {/* 2 — Review */}
      <button
        type="button"
        onClick={startReview}
        className="group mt-3 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3 text-left shadow-sm transition hover:border-accent/60 active:scale-[0.99]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary-text">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[9px] font-bold uppercase tracking-[0.16em] text-fg-muted">2 · {t('today.reviewEyebrow')}</span>
          <span className="mt-0.5 block text-[0.95rem] font-bold text-fg">{reviewTitle}</span>
          <span className="block truncate text-small text-fg-muted">{reviewDetail}</span>
        </span>
        {dueVerses.length > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-secondary-text px-1.5 text-[11px] font-bold text-white dark:text-secondary-on">{dueVerses.length}</span>
        )}
        <ChevronRight className="h-5 w-5 shrink-0 text-fg-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
      </button>

      {/* 3 — Keep reading */}
      {onContinueReading && (
        <button
          type="button"
          onClick={() => { celebrate('tap'); onContinueReading(); }}
          className="group mt-3 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3 text-left shadow-sm transition hover:border-accent/60 active:scale-[0.99]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-text">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[9px] font-bold uppercase tracking-[0.16em] text-fg-muted">3 · {t('today.readEyebrow')}</span>
            <span className="mt-0.5 block text-[0.95rem] font-bold text-fg">
              {readingPlace
                ? t('today.keepReading', { book: readingPlace.bookName, chapter: readingPlace.chapter })
                : t('today.startReading')}
            </span>
            <span className="block truncate text-small text-fg-muted">
              {readingPlace ? t('today.keepReadingDetail') : t('today.startReadingDetail')}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-fg-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      )}

      {playing && (
        createPortal(
          <StoryPlayer
            story={story}
            onExit={() => setPlaying(false)}
            onReadChapter={onReadChapter}
            onCompleted={() => {
              setPlaying(false);
              persist(4);
            }}
          />,
          document.body
        )
      )}
    </div>
  );
}
