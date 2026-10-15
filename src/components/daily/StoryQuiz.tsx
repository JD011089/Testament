import { useMemo, useRef, useState } from 'react';
import type { Story } from '../../types/story';
import { buildQuizRun } from '../../utils/quizEngine';
import { celebrate, nudge } from '../../utils/feedback';
import { Check, X } from 'lucide-react';

interface StoryQuizProps {
  story: Story;
  onDone: (correctCount: number, total: number) => void;
}

/** Step 2 of the loop: 3 quick tap questions from the story just played. */
export function StoryQuiz({ story, onDone }: StoryQuizProps) {
  const run = useMemo(() => buildQuizRun(story), [story]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const locked = useRef(false);

  if (run.length === 0) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-body text-fg">No questions for this story yet.</p>
        <button type="button" className="btn-primary" onClick={() => onDone(0, 0)}>Continue</button>
      </div>
    );
  }

  const item = run[index];
  const isCorrect = picked !== null && picked === item.answerIndex;

  const pick = (i: number) => {
    if (locked.current || picked !== null) return;
    locked.current = true;
    setPicked(i);
    if (i === item.answerIndex) {
      celebrate('tap');
      setCorrectCount((c) => c + 1);
    } else {
      nudge();
    }
  };

  const next = () => {
    locked.current = false;
    setPicked(null);
    if (index + 1 >= run.length) {
      onDone(correctCount, run.length);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-small text-fg-muted">
        <span>Question {index + 1} of {run.length}</span>
        <span className="uppercase text-label">{item.category}</span>
      </div>
      <p className="text-title-3 text-fg">{item.question}</p>
      <div className="grid gap-2">
        {item.options.map((option, i) => {
          const chosen = picked === i;
          const showCorrect = picked !== null && i === item.answerIndex;
          return (
            <button
              key={option}
              type="button"
              onClick={() => pick(i)}
              disabled={picked !== null}
              aria-pressed={chosen}
              className={[
                'min-h-[44px] rounded-xl border px-4 text-small font-semibold text-left flex items-center justify-between transition-colors',
                showCorrect ? 'border-success bg-success/10' : chosen ? 'border-danger bg-danger/10' : 'border-line bg-surface-raised'
              ].join(' ')}
            >
              <span>{option}</span>
              {showCorrect && <Check className="w-4 h-4 text-success" />}
              {chosen && !showCorrect && <X className="w-4 h-4 text-danger" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="space-y-3">
          {!isCorrect && (
            <p className="text-small text-fg-muted">
              The answer is “{item.options[item.answerIndex]}”
              {item.verseRef ? <> — see <span className="text-accent font-semibold">{item.verseRef}</span>.</> : '.'}
            </p>
          )}
          <button type="button" onClick={next} className="btn-primary w-full">
            {index + 1 >= run.length ? 'Done' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}