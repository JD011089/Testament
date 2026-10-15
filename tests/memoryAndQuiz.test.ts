import { test, expect } from '@playwright/test';
import {
  validateOrder,
  validateTyped,
  scoreAccuracy,
  normalizeVerseForMatch,
  buildBlankTask,
  firstLetterHint,
  getLevelTask
} from '../src/utils/memoryLadder';
import { getQuizIssues, buildQuizRun, isFairDistractorSet } from '../src/utils/quizEngine';
import { getStoryById } from '../src/content/stories';
import type { QuizItem } from '../src/types/story';

const VERSE = "Haven't I commanded you? Be strong and courageous.";

test.describe('memory ladder', () => {
  test('word order validation is exact', () => {
    expect(validateOrder(['Haven\'t', 'I', 'commanded', 'you?', 'Be', 'strong', 'and', 'courageous.'], VERSE)).toBe(true);
    expect(validateOrder(['I', 'Haven\'t', 'commanded'], VERSE)).toBe(false);
  });

  test('typed matching keeps accents but ignores case and punctuation', () => {
    const spanish = 'Sé vivir humildemente, y sé tener abundancia.';
    expect(validateTyped('se VIVIR humildemente y se tener abundancia', spanish)).toBe(false); // accents kept
    expect(validateTyped('Sé vivir humildemente y sé tener abundancia.', spanish)).toBe(true);
    expect(normalizeVerseForMatch('Oración, ¡sí!')).toBe('oración sí');
  });

  test('accuracy is a position-based fraction', () => {
    expect(scoreAccuracy('Haven\'t I commanded you', VERSE)).toBeCloseTo(4 / 8, 5);
    expect(scoreAccuracy(VERSE, VERSE)).toBe(1);
  });

  test('blank task blanks meaningful words and offers their answers', () => {
    const task = buildBlankTask(VERSE, 3);
    expect(task.blanks.length).toBeGreaterThan(0);
    expect(task.display).toContain('▢');
    for (const blank of task.blanks) {
      expect(task.choices).toContain(blank.answer);
    }
  });

  test('first-letter hint reveals only openings', () => {
    const hint = firstLetterHint('Be strong');
    expect(hint.startsWith('B')).toBe(true);
    expect(hint).not.toContain('strong');
  });

  test('level tasks describe four modes', () => {
    expect(getLevelTask(1).mode).toBe('order');
    expect(getLevelTask(2).mode).toBe('blank');
    expect(getLevelTask(3).mode).toBe('first-letter');
    expect(getLevelTask(4).mode).toBe('type');
  });
});

test.describe('quiz engine', () => {
  test('David quiz is fair and complete', () => {
    const story = getStoryById('david-and-goliath')!;
    expect(getQuizIssues(story)).toEqual([]);
  });

  test('a question that only one option matches is flagged unfair', () => {
    const bad: QuizItem = {
      id: 'bad',
      category: 'who',
      question: 'Who swung the sling at Goliath?',
      options: ['Goliath stepped back', 'David', 'Saul', 'Samuel'],
      answerIndex: 1
    };
    expect(isFairDistractorSet(bad)).toBe(false);
  });

  test('buildQuizRun returns up to 3 questions with rotated answers', () => {
    const story = getStoryById('david-and-goliath')!;
    const run = buildQuizRun(story);
    expect(run.length).toBe(3);
    for (const item of run) {
      expect(item.options.length).toBe(4);
      expect(item.answerIndex).toBeGreaterThanOrEqual(0);
      expect(item.options[item.answerIndex]).toBeTruthy();
    }
  });
});