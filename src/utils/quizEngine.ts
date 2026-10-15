/**
 * Daily-loop quiz: 3 quick tap questions (who / what / where) drawn ONLY from
 * the story just played. Four options each, distractors from the same category,
 * and no option may give the answer away by uniquely repeating a question word.
 */

import type { QuizCategory, QuizItem, Story } from '../types/story';
import { VERSE_STOP_WORDS } from './verseText';

const CATEGORY_ORDER: QuizCategory[] = ['who', 'what', 'where'];

function significantTokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z']+/g) ?? [])
    .filter((word) => word.length >= 4 && !VERSE_STOP_WORDS.has(word));
}

/**
 * A question is fair when either no option shares a keyword with the question,
 * or at least two do (so the shared word cannot single out the answer).
 */
export function isFairDistractorSet(item: QuizItem): boolean {
  const questionWords = new Set(significantTokens(item.question));
  const leaking = item.options.filter((option) =>
    significantTokens(option).some((word) => questionWords.has(word))
  );
  return leaking.length === 0 || leaking.length >= 2;
}

export function getQuizIssues(story: Story): string[] {
  const issues: string[] = [];
  for (const item of story.quiz) {
    if (item.options.length !== 4) issues.push(`${item.id}: needs 4 options`);
    if (item.answerIndex < 0 || item.answerIndex > 3) issues.push(`${item.id}: answerIndex out of range`);
    if (!isFairDistractorSet(item)) issues.push(`${item.id}: an option leaks a keyword from the question`);
    const answer = item.options[item.answerIndex];
    if (item.options.filter((o) => o === answer).length !== 1) issues.push(`${item.id}: duplicate options`);
  }
  return issues;
}

/** Deterministic option shuffle so a rerun is stable but not answer-first. */
function rotateOptions(item: QuizItem): QuizItem {
  const answer = item.options[item.answerIndex];
  const others = item.options.filter((_, i) => i !== item.answerIndex);
  const ordered = [...others.slice(1), others[0] ?? '', answer].filter(Boolean);
  const options = ordered.slice(0, item.options.length);
  return { ...item, options, answerIndex: options.indexOf(answer) };
}

/** Pick one who / what / where question (in that order) from the story. */
export function buildQuizRun(story: Story): QuizItem[] {
  const picked: QuizItem[] = [];
  for (const category of CATEGORY_ORDER) {
    const match = story.quiz.find((item) => item.category === category && !picked.includes(item));
    if (match) picked.push(match);
  }
  for (const item of story.quiz) {
    if (picked.length >= 3) break;
    if (!picked.includes(item)) picked.push(item);
  }
  return picked.slice(0, 3).map(rotateOptions);
}