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
import { getStoryTeaser } from '../content/stories/teasers';
import { BookOpen, Check, ChevronRight, Flame, Headphones, Play, RotateCcw, RefreshCw, Settings } from 'lucide-react';

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

  const dateLabel = new Date().toLocaleDateString(language, { weekday: 'long', month: 'short', day: 'numeric' });
  const dayInitial = (date: Date) => date.toLocaleDateString(language, { weekday: 'narrow' });
  const hour = new Date().getHours();
  const timeOfDay: 'morning' | 'day' | 'evening' = hour < 11 ? 'morning' : hour >= 18 ? 'evening' : 'day';

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

  const startStory = (withNarration = false) => {
    if (withNarration) {
      try { localStorage.setItem('testament_audio_enabled', 'true'); } catch { /* ignore */ }
    }
    celebrate('tap');
    setPlaying(true);
  };

  const reviewTitle = dueVerses.length > 0
    ? t('today.tileReview')
    : deckVerses.length > 0 ? t('today.tilePractice') : t('today.tileEmpty');
  const reviewDetail = dueVerses.length > 0
    ? t('today.tileReviewDetail', { minutes: Math.max(1, Math.round(dueVerses.length * 0.5)) })
    : deckVerses.length > 0
      ? t('today.tilePracticeDetail', { count: deckVerses.length })
      : t('today.tileEmptyDetail');

  return (
    <div className="relative isolate mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pt-2 pb-4 sm:px-4 xl:pt-6 xl:pb-6">
      {/* Time-of-day sky tint behind the header */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 ${
          timeOfDay === 'morning'
            ? 'bg-[linear-gradient(180deg,rgba(240,190,120,0.30),transparent)] dark:bg-[linear-gradient(180deg,rgba(228,184,121,0.10),transparent)]'
            : timeOfDay === 'evening'
              ? 'bg-[linear-gradient(180deg,rgba(84,120,172,0.20),transparent)] dark:bg-[linear-gradient(180deg,rgba(52,88,124,0.55),transparent)]'
              : 'bg-[linear-gradient(180deg,rgba(164,189,199,0.22),transparent)] dark:bg-[linear-gradient(180deg,rgba(43,74,99,0.30),transparent)]'
        }`}
      />

      {/* Header: date, title + greeting, streak */}
      <header className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-accent-text">{dateLabel}</p>
          <h1 className="mt-0.5 flex items-baseline gap-2 whitespace-nowrap font-serif text-[1.85rem] font-semibold leading-tight text-fg">
            {t('today.title')}
            <span className="truncate font-sans text-xs font-medium text-fg-muted">· {t(greetingKey())}</span>
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5 xl:hidden">
          <span className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-full border border-accent/40 bg-accent/15 px-2.5 text-xs font-bold text-accent-text">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {streakCount > 0 ? `${streakCount}d` : 'New'}
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('testament-open-settings'))}
            aria-label={t('nav.settings')}
            className="grid !min-h-8 h-8 w-8 place-items-center rounded-full border border-line bg-surface-raised text-fg-muted transition hover:text-fg"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Week as dots */}
      <div className="mt-2 flex justify-between px-3" aria-label={t('today.weekLabel')} role="list">
        {week.map((day) => (
          <div key={day.date.toDateString()} role="listitem" className="flex w-6 flex-col items-center gap-1">
            <span className={`text-[10px] font-semibold uppercase ${
              day.isToday ? 'font-extrabold text-accent-text' : day.future ? 'text-fg-muted/60' : 'text-fg-muted'
            }`}>{dayInitial(day.date)}</span>
            {day.active ? (
              <span className="grid h-3 w-3 place-items-center rounded-full bg-accent text-accent-on">
                {day.isToday && <Check className="h-2 w-2" strokeWidth={4} aria-hidden="true" />}
              </span>
            ) : day.isToday ? (
              <span className="h-2.5 w-2.5 rounded-full border-2 border-accent" />
            ) : (
              <span className="h-[7px] w-[7px] rounded-full bg-line-strong/60" />
            )}
          </div>
        ))}
      </div>

      {/* Story card: title and hook on the art */}
      <section className="mt-3 rounded-[1.6rem] border border-accent/45 bg-surface-raised p-1.5 shadow-[0_0_0_3px_rgb(var(--color-bg)),0_0_0_4px_rgb(var(--color-accent)/0.35),0_14px_30px_rgba(120,84,30,0.14)] dark:shadow-[0_0_30px_rgb(var(--color-accent)/0.10)]">
        <div className="relative h-[clamp(14rem,36vh,22rem)] overflow-hidden rounded-[1.25rem]">
          <img
            src={scene}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover object-[38%_40%] ${done ? 'saturate-[.75]' : ''}`}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,10,6,0)_32%,rgba(14,10,6,0.88)_100%)]" aria-hidden="true" />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-surface-raised/90 px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.12em] text-accent-text backdrop-blur">
            {story.passage} · {t('today.duration', { minutes: story.estMinutes })}
          </span>
          {done ? (
            <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-success text-white shadow">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => startStory(true)}
              aria-label={t('today.listenAria')}
              className="absolute right-2.5 top-2.5 inline-flex !min-h-8 h-8 items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 text-[11px] font-semibold text-white backdrop-blur-md transition hover:bg-black/55 active:scale-95"
            >
              <Headphones className="h-3.5 w-3.5" aria-hidden="true" /> {t('today.listen')}
            </button>
          )}
          <div className="absolute inset-x-3.5 bottom-3 text-white">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-[#F1CF94]">
              {t('today.storyEyebrow')} · {story.arc}
            </p>
            <h2 className="mt-1 font-serif text-[1.7rem] font-semibold leading-[1.05] drop-shadow sm:text-4xl">{story.title}</h2>
            {hook && <p className="mt-1.5 line-clamp-2 font-serif text-[0.8rem] leading-snug text-white/85 sm:text-sm">{hook}</p>}
          </div>
        </div>

        {done ? (
          <div className="px-2.5 pb-2 pt-3">
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
          <div className="flex items-center gap-3 px-2.5 pb-1.5 pt-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-accent-text">{t('today.youllKeep')}</p>
              <p className="mt-0.5 line-clamp-2 font-serif text-[0.95rem] italic leading-snug text-fg">“{keepLine}”</p>
              <p className="text-[11px] text-fg-muted">{story.verse.ref}</p>
            </div>
            <button
              type="button"
              aria-label={isStoryCompleted(story.id) ? t('today.playAgain') : t('today.playStory')}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-accent-border/60 bg-gradient-to-b from-[#ECC285] to-accent-hover px-5 font-bold text-accent-on shadow-[0_6px_16px_rgba(154,106,34,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:brightness-105 active:scale-95 dark:from-[#F3CF90] dark:to-accent dark:shadow-[0_0_24px_rgb(var(--color-accent)/0.35)]"
              onClick={() => startStory()}
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>{t('today.begin')}</span>
            </button>
          </div>
        )}
      </section>

      {/* Review and reading, side by side */}
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={startReview}
          className="relative flex flex-col items-start rounded-[1.1rem] border border-line bg-surface-raised px-3 py-2.5 text-left shadow-sm transition hover:border-accent/60 active:scale-[0.98]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-[0.6rem] bg-secondary/15 text-secondary-text">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </span>
          {dueVerses.length > 0 && (
            <span className="absolute right-2.5 top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-secondary-text px-1.5 text-[11px] font-bold text-white dark:text-secondary-on">
              {dueVerses.length}
            </span>
          )}
          <span className="mt-1.5 text-[0.85rem] font-bold leading-tight text-fg">{reviewTitle}</span>
          <span className="text-[11px] text-fg-muted">{reviewDetail}</span>
        </button>

        {onContinueReading && (
          <button
            type="button"
            onClick={() => { celebrate('tap'); onContinueReading(); }}
            className="flex flex-col items-start rounded-[1.1rem] border border-line bg-surface-raised px-3 py-2.5 text-left shadow-sm transition hover:border-accent/60 active:scale-[0.98]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-[0.6rem] bg-accent/15 text-accent-text">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="mt-1.5 truncate text-[0.85rem] font-bold leading-tight text-fg">
              {readingPlace ? `${readingPlace.bookName} ${readingPlace.chapter}` : t('today.tileOpenBible')}
            </span>
            <span className="text-[11px] text-fg-muted">{readingPlace ? t('today.tileRead') : t('today.tileAnyBook')}</span>
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
