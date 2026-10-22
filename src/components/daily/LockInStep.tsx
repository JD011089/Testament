import { useMemo, useState } from 'react';
import type { StoryVerse } from '../../types/story';
import {
  buildBlankTask,
  firstLetterHint,
  getLevelTask,
  normalizeVerseForMatch,
  validateOrder,
  validateTyped,
  verseWords,
  type LadderLevel
} from '../../utils/memoryLadder';
import { getMemoryState, recordReview } from '../../utils/spacedRepetition';
import { celebrate, nudge } from '../../utils/feedback';
import { VerseLine } from '../story/VerseLine';
import { useLanguage } from '../../context/LanguageContext';

function seededShuffle<T>(items: T[], seed = 11): T[] {
  const out = [...items];
  let state = seed;
  const rand = () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface LockInStepProps {
  verse: StoryVerse;
  onDone: () => void;
}

/** Step 3: lock in today's verse before continuing to the collection step. */
export function LockInStep({ verse, onDone }: LockInStepProps) {
  const { t } = useLanguage();
  const current = useMemo(() => ({
    ref: verse.ref,
    text: verse.text,
    translation: verse.translation,
    level: getMemoryState(verse.ref).level
  }), [verse]);

  const finishOne = (correct: boolean) => {
    recordReview(current.ref, current.level, correct);
    if (correct) {
      celebrate('victory');
      window.setTimeout(() => {
        onDone();
      }, 300);
    } else {
      nudge();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-small text-fg-muted">
        <span>{t('lockIn.todayVerse')}</span>
        <span className="uppercase text-label">{t('lockIn.level', { level: current.level })}</span>
      </div>
      <VerseLine line={{ ref: current.ref, translation: current.translation, text: current.text }} />
      <LadderTask
        key={current.ref}
        text={current.text}
        level={current.level}
        onResult={finishOne}
        t={t}
      />
    </div>
  );
}

function LadderTask({ text, level, onResult, t }: { text: string; level: LadderLevel; onResult: (correct: boolean) => void; t: (key: string, params?: Record<string, string | number>) => string }) {
  const task = getLevelTask(level);
  const words = useMemo(() => verseWords(text), [text]);

  // order / first-letter: tap tiles in order
  const tiles = useMemo(() => {
    if (task.mode === 'blank' || task.mode === 'type') return [];
    const base = words.map((w, i) => ({ id: `${i}-${w}`, word: w }));
    const shuffled = seededShuffle(base);
    // avoid trivially-correct ordering
    return shuffled.every((t, i) => t.word === words[i]) ? shuffled.reverse() : shuffled;
  }, [task.mode, words]);

  const [built, setBuilt] = useState<{ id: string; word: string }[]>([]);
  const [typed, setTyped] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const blankTask = useMemo(() => (task.mode === 'blank' ? buildBlankTask(text, 3) : null), [task.mode, text]);
  const [blankPicks, setBlankPicks] = useState<string[]>([]);

  if (task.mode === 'type') {
    return (
      <div className="space-y-3">
        <p className="text-small text-fg-muted">{task.instruction}</p>
        <textarea
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-line bg-surface-raised p-3 text-body text-fg"
          aria-label={t('lockIn.typeAria')}
        />
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            const correct = validateTyped(typed, text);
            setMsg(correct ? t('lockIn.perfect') : t('lockIn.notQuite'));
            onResult(correct);
          }}
        >
          {t('lockIn.check')}
        </button>
        {msg && <p className="text-small text-fg-muted text-center">{msg}</p>}
      </div>
    );
  }

  if (task.mode === 'blank' && blankTask) {
    return (
      <div className="space-y-3">
        <p className="text-small text-fg-muted">{task.instruction} {t('lockIn.instruction')}</p>
        <p className="text-body text-fg font-reading">{blankTask.display}</p>
        <div className="flex flex-wrap gap-2">
          {blankTask.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              disabled={blankPicks.includes(choice)}
              onClick={() => {
                const nextPicks = [...blankPicks, choice];
                setBlankPicks(nextPicks);
                if (nextPicks.length === blankTask.blanks.length) {
                  const correct = nextPicks.every((pick, i) => normalizeVerseForMatch(pick) === normalizeVerseForMatch(blankTask.blanks[i].answer));
                  setMsg(correct ? t('lockIn.filled') : t('lockIn.slipped'));
                  onResult(correct);
                }
              }}
              className="btn-secondary"
            >
              {choice}
            </button>
          ))}
        </div>
        {msg && <p className="text-small text-fg-muted text-center">{msg}</p>}
        {msg === t('lockIn.slipped') && (
          <button type="button" className="btn-secondary w-full" onClick={() => { setBlankPicks([]); setMsg(null); }}>
            {t('lockIn.tryAgain')}
          </button>
        )}
      </div>
    );
  }

  // order / first-letter
  return (
    <div className="space-y-3">
      <p className="text-small text-fg-muted">{task.instruction}</p>
      <p className="text-label text-fg-muted">{t('lockIn.removeHint')}</p>
      {task.mode === 'first-letter' && (
        <p className="text-body text-fg-muted font-mono break-words">{firstLetterHint(text)}</p>
      )}
      <div className="min-h-[48px] rounded-xl border border-dashed border-line bg-surface-raised p-2 flex flex-wrap gap-1">
        {built.length === 0 && <span className="text-small text-fg-muted">{t('lockIn.placeholder')}</span>}
        {built.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-label={t('lockIn.placedAria', { word: entry.word })}
            onClick={() => {
              setBuilt((current) => current.filter((placed) => placed.id !== entry.id));
              setMsg(null);
            }}
            className="btn-secondary px-2"
          >
            {entry.word}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tiles.filter((t) => !built.some((b) => b.id === t.id)).map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => {
              const next = [...built, { id: tile.id, word: tile.word }];
              setBuilt(next);
              if (next.length === words.length) {
                const correct = validateOrder(next.map((entry) => entry.word), text);
                setMsg(correct ? t('lockIn.inOrder') : t('lockIn.close'));
                onResult(correct);
              }
            }}
            className="btn-secondary"
          >
            {tile.word}
          </button>
        ))}
      </div>
      {msg && <p className="text-small text-fg-muted text-center">{msg}</p>}
      {msg === t('lockIn.close') && (
        <button type="button" className="btn-secondary w-full" onClick={() => { setBuilt([]); setMsg(null); }}>
          {t('lockIn.tryAgain')}
        </button>
      )}
    </div>
  );
}
