import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getStoryById } from '../content/stories';
import { getDailyStoryId, nextStoryIdAfter } from '../utils/dailyStory';
import { getStoryProgress, isStoryCompleted } from '../utils/storyProgress';
import { todayKey } from '../utils/spacedRepetition';
import { getDeckReviewQueue } from '../utils/deckReview';
import { getDeckVerseCards } from '../utils/deck';
import { registerDynamicBibleVerse } from '../utils/verseRegistry';
import { loadReadingPlace } from '../utils/readingPlace';
import { celebrate } from '../utils/feedback';
import { useLanguage } from '../context/LanguageContext';
import { StoryPlayer } from '../components/story/StoryPlayer';
import { getStoryIllustrationUrl } from '../utils/storyIllustrations';
import { getStoryTeaser } from '../content/stories/teasers';
import { BookOpen, Check, ChevronRight, Flame, Headphones, Play, RotateCcw, RefreshCw, UserRound } from 'lucide-react';

interface TodayScreenProps {
  streakCount?: number;
  onOpenMap?: () => void;
  onOpenDeck?: () => void;
  onReadChapter: (passage: string) => void;
  onPracticeVerse?: (ref: string) => void;
  onContinueReading?: () => void;
}

/** True when this story was finished today, from any entry point (Today, Map or a /story link). */
function finishedToday(storyId: string): boolean {
  const completedAt = getStoryProgress(storyId)?.completedAt;
  if (!completedAt) return false;
  const finished = new Date(completedAt);
  return !Number.isNaN(finished.getTime()) && finished.toDateString() === new Date().toDateString();
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
  const [step, setStep] = useState(() => readStepIndex(storyId) >= 1 || finishedToday(storyId) ? 4 : 0);
  const [playing, setPlaying] = useState(false);

  const tomorrow = useMemo(() => getStoryById(nextStoryIdAfter(storyId)) ?? null, [storyId]);
  const week = useMemo(() => activeDaysThisWeek(streakCount), [streakCount, step]);
  const deckVerses = useMemo(() => getDeckVerseCards(), [step]);
  // Overdue reviews first, then verses collected but never practiced.
  const reviewQueue = useMemo(() => getDeckReviewQueue(deckVerses), [deckVerses]);
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
  const teaser = getStoryTeaser(story.id);
  const opening = story.cards.find((card) => card.type === 'narration');
  const hook = teaser?.hook[language] ?? (opening && opening.type === 'narration' ? opening.text : '');
  const keepLine = (() => {
    const text = story.verse.text;
    const phrase = teaser?.keyPhrase;
    if (!phrase || !text.includes(phrase)) {
      return text.length > 64 ? `${text.slice(0, 62).replace(/[\s,;:]+\S*$/, '')}…` : text;
    }
    const start = text.indexOf(phrase);
    const before = text.slice(0, start).replace(/[\s“"‘']+$/, '');
    const after = text.slice(start + phrase.length).replace(/^[\s”"’'.!?,;:]+/, '');
    return `${before ? '…' : ''}${phrase}${after ? '…' : ''}`;
  })();

  const dateLabel = new Date().toLocaleDateString(language, { weekday: 'short', month: 'short', day: 'numeric' });
  const dayInitial = (date: Date) => date.toLocaleDateString(language, { weekday: 'narrow' });
  const hour = new Date().getHours();
  const timeOfDay: 'morning' | 'day' | 'evening' = hour < 11 ? 'morning' : hour >= 18 ? 'evening' : 'day';

  const practiceTarget = reviewQueue[0]?.card.ref ?? deckVerses[0]?.ref ?? null;
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

  const startStory = (withNarration = false) => {
    if (withNarration) {
      try { localStorage.setItem('testament_audio_enabled', 'true'); } catch { /* ignore */ }
    }
    celebrate('tap');
    setPlaying(true);
  };

  const reviewTitle = reviewQueue.length > 0
    ? t('today.tileReview')
    : deckVerses.length > 0 ? t('today.tilePractice') : t('today.tileEmpty');
  const reviewDetail = reviewQueue.length > 0
    ? t('today.tileReviewDetail', { minutes: Math.max(1, Math.round(reviewQueue.length * 0.5)) })
    : deckVerses.length > 0
      ? t('today.tilePracticeDetail', { count: deckVerses.length })
      : t('today.tileEmptyDetail');

  return (
    <div className="relative isolate mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-2 pb-4 sm:px-5 xl:pt-6 xl:pb-6">
      {/* Soft time-of-day wash behind the header */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 ${
          timeOfDay === 'morning'
            ? 'bg-[linear-gradient(180deg,rgba(226,182,94,0.16),transparent)] dark:bg-[linear-gradient(180deg,rgba(226,182,94,0.08),transparent)]'
            : timeOfDay === 'evening'
              ? 'bg-[linear-gradient(180deg,rgba(35,64,142,0.14),transparent)] dark:bg-[linear-gradient(180deg,rgba(35,64,142,0.45),transparent)]'
              : 'bg-[linear-gradient(180deg,rgba(35,64,142,0.07),transparent)] dark:bg-[linear-gradient(180deg,rgba(35,64,142,0.28),transparent)]'
        }`}
      />

      {/* Header: date with streak + profile on one row, greeting on its own line
          so large text or narrow phones can never push them into each other. */}
      <header className="px-1">
        <div className="flex min-h-9 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-muted">{dateLabel}</p>
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <span className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-full border border-line bg-surface-raised px-3 text-xs font-bold text-secondary-text">
            <Flame className={`h-4 w-4 ${streakCount > 0 ? 'fill-current' : ''}`} aria-hidden="true" /> {streakCount > 0 ? streakCount : 'New'}
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('testament-open-settings'))}
            aria-label={t('nav.settings')}
            className="grid !min-h-9 h-9 w-9 place-items-center rounded-full border border-line bg-amber-100 text-accent-text transition hover:ring-2 hover:ring-accent/40 dark:bg-amber-500/15"
          >
            <UserRound className="h-[18px] w-[18px]" />
          </button>
        </div>
        </div>
        <h1 className="mt-0.5 font-serif text-[1.65rem] font-semibold leading-tight text-fg">
          <span className="sr-only">{t('today.title')}: </span>
          {t(greetingKey())}
        </h1>
      </header>

      {/* This week */}
      <div className="mt-3 flex justify-between px-1" aria-label={t('today.weekLabel')} role="list">
        {week.map((day) => (
          <div key={day.date.toDateString()} role="listitem" className="flex w-8 flex-col items-center gap-1">
            <span className={`text-[10px] font-bold uppercase ${
              day.isToday ? 'text-accent-text' : day.future ? 'text-fg-muted/60' : 'text-fg-muted'
            }`}>{dayInitial(day.date)}</span>
            {day.active ? (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-on shadow-sm">
                <Check className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden="true" />
              </span>
            ) : day.isToday ? (
              <span className="h-7 w-7 rounded-full border-2 border-accent bg-surface-raised" />
            ) : (
              <span className="h-7 w-7 rounded-full border-[1.5px] border-dashed border-line-strong/70" />
            )}
          </div>
        ))}
      </div>

      {/* Today's story: full-bleed art with everything on it */}
      {/* Chips and text sit in normal flow (not pinned), so at large text sizes the
          card grows taller instead of stacking text on top of itself. */}
      <section className="relative mt-4 flex min-h-[clamp(17rem,42vh,24rem)] flex-col justify-between overflow-hidden rounded-[1.6rem] shadow-[0_18px_40px_-16px_rgba(10,15,30,0.55)]">
        <img
          src={scene}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-[38%_40%] ${done ? 'saturate-[.75]' : ''}`}
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_26%,transparent_40%,rgba(8,8,14,0.92)_100%)]" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-2 p-3">
          <span className="min-w-0 truncate whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
            {story.passage} · {t('today.duration', { minutes: story.estMinutes })}
          </span>
          {done ? (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-success text-white shadow">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => startStory(true)}
              aria-label={t('today.listenAria')}
              className="inline-flex !min-h-8 h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-3 text-[11px] font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
            >
              <Headphones className="h-3.5 w-3.5" aria-hidden="true" /> {t('today.listen')}
            </button>
          )}
        </div>
        <div className="relative px-4 pb-4 pt-10 text-white">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8C070]">
            {t('today.storyEyebrow')} · {story.arc}
          </p>
          <h2 className="mt-1 font-serif text-[1.85rem] font-semibold leading-[1.05] drop-shadow sm:text-4xl">{story.title}</h2>
          {hook && <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-snug text-white/85 sm:text-sm">{hook}</p>}
          {!done && (
            <button
              type="button"
              aria-label={isStoryCompleted(story.id) ? t('today.playAgain') : t('today.playStory')}
              className="mt-3.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-on shadow-[0_8px_22px_-6px_rgb(var(--color-accent)/0.8)] transition hover:bg-accent-hover active:scale-[0.98]"
              onClick={() => startStory()}
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>{t('today.begin')}</span>
            </button>
          )}
        </div>
      </section>

      {done ? (
        <div className="mt-3 rounded-[1.25rem] border border-line bg-surface-raised px-4 py-3.5 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-fg">{t('today.done')}</h2>
          <p className="mt-0.5 text-small text-fg-secondary">
            {tomorrow ? t('today.tomorrow', { title: tomorrow.title, passage: tomorrow.passage }) : t('today.mapFinished')}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary !min-h-10 !rounded-full px-4 text-sm" onClick={() => startStory()}>
              <RotateCcw className="h-4 w-4" /> {t('today.playAgain')}
            </button>
            {onOpenMap && (
              <button type="button" className="btn-quiet !min-h-10 text-sm text-accent-text" onClick={() => { celebrate('tap'); onOpenMap(); }}>
                {t('today.openMap')} <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-start gap-3 rounded-[1.25rem] border border-line bg-surface-raised px-4 py-3 shadow-sm">
          <span className="font-serif text-[2.4rem] leading-[0.8] text-[#B8862B] dark:text-[#E2B65E]" aria-hidden="true">“</span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-serif text-[0.98rem] italic leading-snug text-fg">{keepLine}</p>
            <p className="mt-1 text-[11px] font-semibold text-fg-muted">{t('today.youllKeep')} · {story.verse.ref}</p>
          </div>
        </div>
      )}

      {/* Review and reading, side by side */}
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={startReview}
          className="relative flex min-w-0 flex-col items-start gap-2 overflow-hidden rounded-[1.1rem] border border-line bg-surface-raised p-3 text-left shadow-sm transition hover:border-accent/60 active:scale-[0.98]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-accent-text dark:bg-amber-500/15">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="w-full min-w-0">
            <span className="block truncate text-[0.85rem] font-bold leading-tight text-fg">{reviewTitle}</span>
            <span className="block truncate text-[11px] text-fg-muted">{reviewDetail}</span>
          </span>
          {reviewQueue.length > 0 && (
            <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1.5 text-[11px] font-bold text-secondary-on">
              {reviewQueue.length}
            </span>
          )}
        </button>

        {onContinueReading && (
          <button
            type="button"
            onClick={() => { celebrate('tap'); onContinueReading(); }}
            className="flex min-w-0 flex-col items-start gap-2 overflow-hidden rounded-[1.1rem] border border-line bg-surface-raised p-3 text-left shadow-sm transition hover:border-accent/60 active:scale-[0.98]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-accent-text dark:bg-amber-500/15">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="w-full min-w-0">
              <span className="block truncate text-[0.85rem] font-bold leading-tight text-fg">
                {readingPlace ? `${readingPlace.bookName} ${readingPlace.chapter}` : t('today.tileOpenBible')}
              </span>
              <span className="block truncate text-[11px] text-fg-muted">{readingPlace ? t('today.tileRead') : t('today.tileAnyBook')}</span>
            </span>
          </button>
        )}
      </div>

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
