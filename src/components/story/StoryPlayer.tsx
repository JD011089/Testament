import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import type { InteractionCard, Story, StoryArc, StoryCard, TapRevealConfig } from '../../types/story';
import { getStoryCardIndex, markStoryComplete, saveStoryCursor } from '../../utils/storyProgress';
import { addVerseCard } from '../../utils/deck';
import { celebrate, isSoundEnabled, nudge } from '../../utils/feedback';
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
import { ChevronLeft, BookOpen, Check } from 'lucide-react';

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

function InteractionCardView({ card, onComplete }: { card: InteractionCard; onComplete: () => void }) {
  switch (card.kind) {
    case 'drag':
      return <DragToTarget config={card.config as never} onComplete={onComplete} />;
    case 'hold':
      return <HoldToContinue config={card.config as never} onComplete={onComplete} />;
    case 'tap-reveal':
      return <TapReveal config={card.config as never} onComplete={onComplete} />;
    case 'tap-sequence':
      return <TapSequence config={card.config as never} onComplete={onComplete} />;
    default:
      return null;
  }
}

export function StoryPlayer({ story, onExit, onReadChapter, onCompleted }: StoryPlayerProps) {
  const { t } = useLanguage();
  const lastIndex = story.cards.length - 1;
  const [index, setIndex] = useState(() => Math.min(getStoryCardIndex(story.id), lastIndex));
  const [completed, setCompleted] = useState(false);
  const [cardDone, setCardDone] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useModalLock(true);
  const payoffRecorded = useRef(false);

  const card: StoryCard = story.cards[index];

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

  const goBack = useCallback(() => {
    if (index <= 0) return;
    celebrate('whoosh');
    setIndex((i) => Math.max(0, i - 1));
  }, [index]);

  const requireCardDone = card.type === 'interaction' || card.type === 'choice';
  const canSwipe = !requireCardDone || cardDone;

  const tryAdvance = useCallback(() => {
    if (!canSwipe) {
      nudge();
      return;
    }
    advance();
  }, [advance, canSwipe]);

  const requestExit = () => {
    if (!completed && index > 0 && !window.confirm(t('story.leaveConfirm'))) return;
    soundEngine.stopSpeaking();
    soundEngine.stopAmbience();
    onExit();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') tryAdvance();
      if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryAdvance, goBack]);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const end = e.changedTouches[0];
    if (!end) return;
    const deltaX = end.clientX - start.x;
    const deltaY = end.clientY - start.y;
    // Require a deliberate horizontal swipe so vertical scrolling, diagonal
    // drags, and in-card interactions are never mistaken for navigation.
    if (Math.abs(deltaX) < 72) return;
    if (Math.abs(deltaY) > Math.abs(deltaX) * 0.6) return;
    if (deltaX < 0) tryAdvance();
    else goBack();
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
    <div ref={rootRef} className="fixed inset-0 z-50 bg-bg text-fg flex flex-col overscroll-none">
      {/* Progress segments + back */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={requestExit}
            aria-label={t('story.back')}
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-surface/60"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-small font-semibold text-fg-muted truncate">{story.title}</span>
        </div>
        <div className="flex items-center gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={story.cards.length} aria-valuenow={index + 1}>
          {story.cards.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i < index || completed ? 'bg-accent' : i === index ? 'bg-accent/60' : 'bg-line'}`}
            />
          ))}
        </div>
      </div>

      {/* Card body */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 pb-6"
      >
        <div className={`max-w-xl mx-auto min-h-full flex flex-col py-4 ${illustrated ? 'gap-4' : 'justify-center gap-5'}`}>
          {card.type === 'narration' && (
            <div className="space-y-4">
              <span className="text-label uppercase text-fg-muted">{t('story.narrationLabel')}</span>
              {index === 0 && (
                <img
                  src={getStoryIllustrationUrl(story.id)}
                  alt={`${story.title} story illustration`}
                  className="aspect-video w-full rounded-2xl object-cover"
                  loading="eager"
                />
              )}
              <p className="text-title-3 font-reading leading-relaxed text-fg">{card.text}</p>
              {card.scriptureLine && <VerseLine line={card.scriptureLine} />}
            </div>
          )}

          {card.type === 'interaction' && (
            <div className={illustrated ? 'flex min-h-0 flex-1 flex-col gap-4' : 'space-y-4'}>
              <p className="text-title-3 text-fg">{card.prompt}</p>
              {sceneBehind && sceneId && <StoryWorld scene={sceneId} stepIndex={99} />}
              <InteractionCardView card={card} onComplete={() => setCardDone(true)} />
              {cardDone && (
                <div className="space-y-3">
                  <p className="text-body text-accent font-semibold">{card.successText}</p>
                  <button type="button" onClick={advance} className="btn-primary w-full">{t('common.continue')}</button>
                </div>
              )}
              {!cardDone && (
                <p className="text-small text-fg-muted text-center">{t('story.finishToSwipe')}</p>
              )}
            </div>
          )}

          {card.type === 'choice' && <ChoiceMoment card={card} onComplete={() => { setCardDone(true); advance(); }} />}

          {card.type === 'payoff' && (
            <div className="space-y-5 text-center">
              <span className="text-label uppercase text-accent">{t('today.verseCollected')}</span>
              <div className="animate-fadeIn">
                <VerseLine line={card.verse ?? story.verse} />
              </div>
              <p className="text-small text-fg-muted">{t('story.verseInDeck')}</p>
              {!completed && (
                <button type="button" onClick={finish} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> {t('story.doneForNow')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2 border-t border-line">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => { celebrate('snap'); onReadChapter(story.passage); }}
            className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" /> {t('story.readChapter')}
          </button>
          {canTapAdvance && !completed && card.type !== 'payoff' && (
            <button type="button" onClick={advance} className="btn-primary flex-1">{t('story.next')}</button>
          )}
        </div>
        {completed && (
          <div className="max-w-xl mx-auto mt-2 text-center">
            <p className="text-small text-fg-muted">{t('story.doneFooter')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
