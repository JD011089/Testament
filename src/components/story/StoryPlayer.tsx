import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { InteractionCard, Story, StoryArc, StoryCard, TapRevealConfig } from '../../types/story';
import { getStoryCardIndex, isStoryCompleted, markStoryComplete, saveStoryCursor } from '../../utils/storyProgress';
import { addVerseCard } from '../../utils/deck';
import { celebrate, isSoundEnabled } from '../../utils/feedback';
import { soundEngine } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { useModalLock } from '../../utils/useModalLock';
import { VerseLine } from './VerseLine';
import { ChoiceMoment } from './ChoiceMoment';
import { DragToTarget } from './interactions/DragToTarget';
import { HoldToContinue } from './interactions/HoldToContinue';
import { TapReveal } from './interactions/TapReveal';
import { TapSequence } from './interactions/TapSequence';
import { StoryWorld } from './interactions/StoryScene';
import { getStoryScene } from './sceneModel';
import { isStorySceneId } from '../../utils/storyScenes';
import { getStoryIllustrationUrl } from '../../utils/storyIllustrations';
import { ChevronLeft, BookOpen, Check, ArrowRight, Sparkles } from 'lucide-react';

function ambienceForArc(arc: StoryArc): 'wind' | 'campfire' | 'sanctuary' {
  if (arc === 'Jesus' || arc === 'Church') return 'sanctuary';
  if (arc === 'Kings' || arc === 'Prophets') return 'campfire';
  return 'wind';
}

interface StoryPlayerProps {
  story: Story;
  onExit: () => void;
  onReadChapter: (passage: string) => void;
  onCompleted?: (story: Story) => void;
}

function narrationAudioEnabled(): boolean {
  try {
    return localStorage.getItem('testament_audio_enabled') !== 'false';
  } catch {
    return true;
  }
}

function InteractionCardView({ card, onComplete, density }: { card: InteractionCard; onComplete: () => void; density: number }) {
  switch (card.kind) {
    case 'drag':
      return <DragToTarget config={card.config as never} onComplete={onComplete} />;
    case 'hold':
      return <HoldToContinue config={card.config as never} onComplete={onComplete} />;
    case 'tap-reveal':
      return <TapReveal config={card.config as never} onComplete={onComplete} compact={density > 0} veryCompact={density > 1} />;
    case 'tap-sequence':
      return <TapSequence config={card.config as never} onComplete={onComplete} />;
    default:
      return null;
  }
}

export function StoryPlayer({ story, onExit, onReadChapter, onCompleted }: StoryPlayerProps) {
  const { t } = useLanguage();
  const lastIndex = story.cards.length - 1;
  const [index, setIndex] = useState(() => isStoryCompleted(story.id) ? 0 : Math.min(getStoryCardIndex(story.id), lastIndex));
  const [completed, setCompleted] = useState(false);
  const [cardDone, setCardDone] = useState(false);
  const [density, setDensity] = useState(0);
  const rootRef = useModalLock(true);
  const mainRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const payoffRecorded = useRef(false);

  const card: StoryCard = story.cards[index];

  useLayoutEffect(() => {
    const main = mainRef.current;
    const stage = stageRef.current;
    if (!main || !stage) return;
    setDensity(0);
    let frame = 0;
    const fitToViewport = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (stage.scrollHeight > main.clientHeight + 2) {
          setDensity((current) => Math.min(current + 1, 2));
        }
      });
    };
    const refreshForViewport = () => {
      setDensity(0);
      fitToViewport();
    };
    const observer = new ResizeObserver(fitToViewport);
    observer.observe(main);
    observer.observe(stage);
    fitToViewport();
    window.addEventListener('resize', refreshForViewport);
    window.visualViewport?.addEventListener('resize', refreshForViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', refreshForViewport);
      window.visualViewport?.removeEventListener('resize', refreshForViewport);
    };
  }, [cardDone, index, story.id]);

  // Persist the cursor so a reload resumes on the exact card.
  useEffect(() => {
    saveStoryCursor(story.id, index);
    setCardDone(false);
  }, [index, story.id]);

  useEffect(() => {
    payoffRecorded.current = false;
  }, [story.id]);

  const finish = useCallback(() => {
    markStoryComplete(story.id);
    setCompleted(true);
    celebrate('payoff');
    onCompleted?.(story);
  }, [story, onCompleted]);

  // Ambient bed for the story arc; stop on exit.
  useEffect(() => {
    if (isSoundEnabled()) {
      soundEngine.startAmbience(ambienceForArc(story.arc));
    }
    return () => {
      soundEngine.stopAmbience();
      soundEngine.stopSpeaking();
    };
  }, [story.id, story.arc]);

  // Narration audio: auto-play (if enabled) and stop when leaving the card.
  useEffect(() => {
    if (card.type !== 'narration' || !narrationAudioEnabled()) return;
    const line = card.scriptureLine ? card.scriptureLine.text : card.text;
    soundEngine.speakVerse(line);
    return () => { soundEngine.stopSpeaking(); };
  }, [card]);

  // Pause audio on tab hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) soundEngine.stopSpeaking();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Flip the verse into the deck when the payoff card is reached.
  useEffect(() => {
    if (card.type !== 'payoff' || payoffRecorded.current) return;
    payoffRecorded.current = true;
    const verse = card.verse ?? story.verse;
    addVerseCard({
      ref: verse.ref,
      translation: verse.translation,
      text: verse.text,
      storyId: story.id,
      storyTitle: story.title
    });
  }, [card, story]);

  const advance = useCallback(() => {
    if (index >= lastIndex) {
      finish();
      return;
    }
    celebrate('whoosh');
    setIndex((i) => Math.min(i + 1, lastIndex));
  }, [index, lastIndex, finish]);

  const requestExit = () => {
    if (!completed && index > 0 && !window.confirm(t('story.leaveConfirm'))) return;
    soundEngine.stopSpeaking();
    soundEngine.stopAmbience();
    onExit();
  };

  const canTapAdvance = card.type === 'narration' || card.type === 'payoff';
  const sceneId = isStorySceneId(story.id) && getStoryScene(story.id) ? story.id : undefined;
  const tapScene =
    card.type === 'interaction' &&
    card.kind === 'tap-reveal' &&
    Boolean((card.config as TapRevealConfig).scene);
  const sceneBehind =
    card.type === 'interaction' &&
    card.kind !== 'tap-reveal' &&
    sceneId != null;
  const illustrated = tapScene || sceneBehind;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
      className="story-reader fixed inset-0 z-[100] isolate flex flex-col overflow-hidden bg-stone-950 text-white overscroll-none"
    >
      <img
        src={getStoryIllustrationUrl(story.id)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/90" aria-hidden="true" />

      <header className="relative z-10 shrink-0 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={requestExit}
            aria-label={t('story.back')}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition hover:bg-white/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{story.title}</p>
            <p className="mt-0.5 text-xs text-white/65">{story.passage} <span className="px-1 text-amber-200">·</span> {index + 1} of {story.cards.length}</p>
          </div>
          <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
            {card.type === 'interaction' ? t('story.stageYourTurn') : card.type === 'payoff' ? t('story.stageTakeaway') : t('story.stageStory')}
          </span>
        </div>
        <div className="mx-auto mt-4 flex w-full max-w-3xl gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={story.cards.length} aria-valuenow={index + 1}>
          {story.cards.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i < index || completed ? 'bg-amber-300' : i === index ? 'bg-white' : 'bg-white/25'}`}
            />
          ))}
        </div>
      </header>

      <main ref={mainRef} className={`relative z-10 min-h-0 flex-1 overflow-hidden overscroll-contain px-4 ${density > 1 ? 'py-1' : density ? 'py-2' : 'pb-4 pt-5'}`}>
        <div ref={stageRef} className={`mx-auto flex min-h-full w-full max-w-xl flex-col justify-end ${illustrated ? density > 1 ? 'gap-1' : density ? 'gap-2' : 'gap-4' : ''}`}>
          {card.type === 'narration' && (
            <article className={`rounded-[1.75rem] border border-white/20 bg-black/55 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl ${density > 1 ? 'p-2.5' : density ? 'p-3' : 'p-5 sm:p-7'}`}>
              <span className="inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                {t('story.narrationLabel')}
              </span>
              <p className={`font-serif leading-snug text-white ${density > 1 ? 'mt-2 text-lg' : density ? 'mt-3 text-xl' : 'mt-4 text-2xl sm:text-3xl'}`}>{card.text}</p>
              {card.scriptureLine && <VerseLine line={card.scriptureLine} compact={density > 0} veryCompact={density > 1} className={`${density > 1 ? 'mt-2' : 'mt-5'} !border-line !bg-surface-raised`} />}
            </article>
          )}

          {card.type === 'interaction' && (
            <article className={`rounded-[1.75rem] border border-white/20 bg-black/55 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl ${density > 1 ? 'space-y-1.5 p-2' : density ? 'space-y-2 p-3' : `space-y-4 p-4 sm:p-6 ${illustrated ? '' : 'space-y-5'}`}`}>
              <div>
                <span className="inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">{t('story.stageYourTurn')}</span>
                <p className={`font-serif leading-snug text-white ${density > 1 ? 'mt-1 text-base' : density ? 'mt-2 text-lg' : 'mt-3 text-xl sm:text-2xl'}`}>{card.prompt}</p>
              </div>
              {sceneBehind && sceneId && <StoryWorld scene={sceneId} stepIndex={99} compact={density > 0} veryCompact={density > 1} />}
              <InteractionCardView card={card} density={density} onComplete={() => setCardDone(true)} />
              {cardDone ? (
                <p className={`rounded-2xl bg-amber-200/10 text-sm font-medium text-amber-100 ${density > 1 ? 'px-2 py-1' : density ? 'px-3 py-1.5' : 'px-4 py-3'}`} aria-live="polite">
                  <Sparkles className="mr-2 inline h-4 w-4" />{card.successText}
                </p>
              ) : null}
            </article>
          )}

          {card.type === 'choice' && (
            <article className={`rounded-[1.75rem] border border-white/20 bg-black/55 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl ${density > 1 ? 'p-2' : density ? 'p-3' : 'p-5 sm:p-7'}`}>
              <ChoiceMoment card={card} compact={density > 0} veryCompact={density > 1} onComplete={() => { setCardDone(true); advance(); }} />
            </article>
          )}

          {card.type === 'payoff' && (
            <article className={`rounded-[1.75rem] border border-amber-200/30 bg-black/60 text-center shadow-[0_16px_48px_rgba(0,0,0,0.3)] backdrop-blur-xl ${density > 1 ? 'p-2' : density ? 'p-3' : 'p-5 sm:p-7'}`}>
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                <Sparkles className="h-3.5 w-3.5" /> {t('today.verseCollected')}
              </span>
              <div className="mt-4 animate-fadeIn">
                <VerseLine line={card.verse ?? story.verse} compact={density > 0} veryCompact={density > 1} className="!border-line !bg-surface-raised text-left" />
              </div>
              <p className="mt-4 text-sm text-white/70">{t('story.verseInDeck')}</p>
            </article>
          )}
        </div>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-white/10 bg-gradient-to-t from-black/80 to-black/45 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg sm:px-6">
        <div className="mx-auto flex w-full max-w-xl gap-2">
          <button
            type="button"
            onClick={() => { celebrate('snap'); onReadChapter(story.passage); }}
            className="btn-secondary min-h-12 flex-1 !border-white/25 !bg-white/10 !text-white hover:!bg-white/15"
          >
            <BookOpen className="h-4 w-4" /> {t('story.readChapter')}
          </button>
          {card.type === 'interaction' && cardDone && !completed && (
            <button type="button" onClick={advance} className="btn-primary min-h-12 flex-1 inline-flex items-center justify-center gap-2">
              {t('common.continue')} <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {canTapAdvance && !completed && card.type !== 'payoff' && (
            <button type="button" onClick={advance} className="btn-primary min-h-12 flex-1 inline-flex items-center justify-center gap-2">
              {t('common.continue')} <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {card.type === 'payoff' && !completed && (
            <button type="button" onClick={finish} className="btn-primary min-h-12 flex-1 inline-flex items-center justify-center gap-2">
              <Check className="h-4 w-4" /> {t('story.doneForNow')}
            </button>
          )}
        </div>
        {completed && <p className="mx-auto mt-2 max-w-xl text-center text-xs text-white/60">{t('story.doneFooter')}</p>}
      </footer>
    </div>
  );
}
