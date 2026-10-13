import type { MemoryVerse, StoryQuest } from '../types';
import type { RealLifeDilemma } from '../data/dilemmas';
import type { CanonBook } from '../data/canon';
import { getAllVerses } from './verseRegistry';
import { STORY_QUESTS } from '../data/stories';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import { CANON_BOOKS } from '../data/canon';
import type { SupportedLanguage } from '../context/LanguageContext';

export interface TriviaScripture {
  reference: string;
  text: string;
  translation?: string;
}

export interface TriviaQuestion {
  id: string;
  kind: string;
  tag: string;
  prompt: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explain: string;
  scripture?: TriviaScripture;
}

interface TriviaSources {
  verses: MemoryVerse[];
  quests: StoryQuest[];
  dilemmas: RealLifeDilemma[];
  books: CanonBook[];
}

const VERSE_CATEGORIES: MemoryVerse['category'][] = [
  'Pressure & Anxiety',
  'Courage & Facing Giants',
  'Anger & Self-Control',
  'Restoration After Failure',
  'Endurance & Brotherhood',
];

const STOP_WORDS = new Set([
  'the', 'and', 'but', 'for', 'nor', 'yet', 'so', 'that', 'this', 'these', 'those',
  'with', 'from', 'into', 'onto', 'upon', 'will', 'shall', 'have', 'has', 'had',
  'they', 'them', 'their', 'you', 'your', 'yours', 'him', 'his', 'her', 'hers',
  'she', 'who', 'whom', 'whose', 'which', 'what', 'when', 'where', 'why', 'how',
  'not', 'are', 'was', 'were', 'been', 'being', 'does', 'did', 'doing', 'than',
  'then', 'there', 'here', 'about', 'over', 'under', 'some', 'such',
]);

function shuffle<T>(input: T[]): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pick<T>(input: T[]): T {
  return input[Math.floor(Math.random() * input.length)];
}

function cleanWord(word: string): string {
  return word.replace(/[^\w']/g, '');
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed;
}

function snippet(text: string, words = 14, skip = 2): string {
  const parts = text.trim().split(/\s+/);
  const slice = parts.slice(skip, skip + words).join(' ');
  return truncate(slice || text, 130);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function uniqueOptions(correct: string, pool: string[]): { options: string[]; correctIndex: number } | null {
  const distractors: string[] = [];
  for (const candidate of shuffle(pool)) {
    const value = candidate.trim();
    if (!value || value === correct || distractors.includes(value)) continue;
    distractors.push(value);
    if (distractors.length === 3) break;
  }
  if (distractors.length < 3) return null;
  const options = shuffle([correct, ...distractors]);
  return { options, correctIndex: options.indexOf(correct) };
}

interface ChoiceSpec {
  id: string;
  kind: string;
  tag: string;
  prompt: string;
  context?: string;
  correct: string;
  pool: string[];
  explain: string;
  scripture?: TriviaScripture;
}

function buildChoice(spec: ChoiceSpec): TriviaQuestion | null {
  const built = uniqueOptions(spec.correct, spec.pool);
  if (!built) return null;
  return {
    id: spec.id,
    kind: spec.kind,
    tag: spec.tag,
    prompt: spec.prompt,
    context: spec.context,
    options: built.options,
    correctIndex: built.correctIndex,
    explain: spec.explain,
    scripture: spec.scripture,
  };
}

function fillBlankQuestion(verse: MemoryVerse, pool: string[]): TriviaQuestion | null {
  const words = verse.text.split(/\s+/);
  if (words.length < 8) return null;

  const eligible: number[] = [];
  words.forEach((word, idx) => {
    const clean = cleanWord(word).toLowerCase();
    if (clean.length >= 5 && !STOP_WORDS.has(clean)) eligible.push(idx);
  });
  if (eligible.length === 0) return null;

  const blankIdx = pick(eligible);
  const answer = cleanWord(words[blankIdx]);
  if (!answer) return null;

  const rendered = words.map((w, i) => (i === blankIdx ? '_____' : w)).join(' ');
  const built = uniqueOptions(answer, pool);
  if (!built) return null;

  return {
    id: `v-blank:${verse.id}`,
    kind: 'fill-blank',
    tag: 'Fill the Blank',
    prompt: 'Which word completes the passage?',
    context: `“${truncate(rendered, 190)}”`,
    options: built.options,
    correctIndex: built.correctIndex,
    explain: `${verse.reference}: ${truncate(verse.plainEnglishSummary, 150)}`,
    scripture: { reference: verse.reference, text: verse.text, translation: verse.translation },
  };
}

/**
 * Builds a deterministic bank of hundreds of Scripture-grounded questions
 * drawn entirely from the verses, stories, and books already inside the app.
 */
export function buildTriviaBank(lang?: SupportedLanguage): TriviaQuestion[] {
  const sources: TriviaSources = {
    verses: getAllVerses(lang),
    quests: STORY_QUESTS,
    dilemmas: REAL_LIFE_DILEMMAS,
    books: CANON_BOOKS,
  };

  const { verses, quests, dilemmas, books } = sources;
  const bank: TriviaQuestion[] = [];
  const seen = new Set<string>();

  const push = (question: TriviaQuestion | null) => {
    if (!question || seen.has(question.id)) return;
    seen.add(question.id);
    bank.push(question);
  };

  // Pools for distractors
  const referencePool = uniqueStrings(verses.map((v) => v.reference));
  const snippetPool = uniqueStrings(verses.map((v) => snippet(v.text)));
  const heroPool = uniqueStrings(
    verses.map((v) => v.heroName || '').concat(quests.map((q) => q.heroName))
  );
  const anchorReferencePool = uniqueStrings(
    quests.map((q) => q.acts[0]?.unlockedScripture.reference || '')
  );
  const bookThemePool = uniqueStrings(books.map((b) => b.lifeTheme));
  const bookReferencePool = uniqueStrings(books.map((b) => b.anchorScripture.reference));
  const dilemmaHeroPool = uniqueStrings(dilemmas.map((d) => d.biblicalParallel.hero));
  const dilemmaReferencePool = uniqueStrings(dilemmas.map((d) => d.anchorScripture.reference));

  const blankWordPool: string[] = [];
  for (const verse of verses) {
    for (const word of verse.text.split(/\s+/)) {
      const clean = cleanWord(word);
      if (clean.length >= 5 && clean.length <= 12 && !STOP_WORDS.has(clean.toLowerCase())) {
        blankWordPool.push(clean);
      }
    }
  }
  const uniqueBlankPool = uniqueStrings(blankWordPool);

  // ---- Verse-grounded questions ----
  for (const verse of verses) {
    const scripture: TriviaScripture = {
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
    };

    push(buildChoice({
      id: `v-ref:${verse.id}`,
      kind: 'verse-reference',
      tag: 'Which passage?',
      prompt: 'Which passage says this?',
      context: `“${truncate(verse.text, 180)}”`,
      correct: verse.reference,
      pool: referencePool,
      explain: `${verse.reference} — ${truncate(verse.plainEnglishSummary, 150)}`,
      scripture,
    }));

    push(buildChoice({
      id: `v-words:${verse.id}`,
      kind: 'verse-text',
      tag: 'Match the words',
      prompt: `Which reading belongs to ${verse.reference}?`,
      correct: snippet(verse.text),
      pool: snippetPool,
      explain: `${verse.reference}: ${truncate(verse.plainEnglishSummary, 140)}`,
      scripture,
    }));

    push(buildChoice({
      id: `v-theme:${verse.id}`,
      kind: 'verse-theme',
      tag: 'Life theme',
      prompt: `Which life theme fits ${verse.reference}?`,
      context: `“${snippet(verse.text, 12, 1)}”`,
      correct: verse.category,
      pool: VERSE_CATEGORIES,
      explain: `${verse.reference} is filed under “${verse.category}”. ${truncate(verse.keyTakeaway, 120)}`,
      scripture,
    }));

    push(fillBlankQuestion(verse, uniqueBlankPool));

    if (verse.heroName) {
      push(buildChoice({
        id: `v-hero:${verse.id}`,
        kind: 'verse-hero',
        tag: 'Hero & story',
        prompt: `Which story hero is tied to ${verse.reference}?`,
        correct: verse.heroName,
        pool: heroPool,
        explain: `${verse.heroName}${verse.storyTitle ? ` — ${verse.storyTitle}` : ''}. ${truncate(verse.keyTakeaway, 110)}`,
        scripture,
      }));
    }
  }

  // ---- Story quest questions ----
  for (const quest of quests) {
    const anchor = quest.acts[0]?.unlockedScripture;
    const scripture: TriviaScripture | undefined = anchor
      ? { reference: anchor.reference, text: anchor.text, translation: anchor.translation }
      : undefined;

    push(buildChoice({
      id: `q-title:${quest.id}`,
      kind: 'hero-story',
      tag: 'Hero & story',
      prompt: `Which story belongs to ${quest.heroName}?`,
      correct: quest.title,
      pool: uniqueStrings(quests.map((q) => q.title)),
      explain: `${quest.heroName} — ${quest.characterTitle}. ${truncate(quest.summary, 130)}`,
      scripture,
    }));

    push(buildChoice({
      id: `q-char:${quest.id}`,
      kind: 'hero-title',
      tag: 'Hero & title',
      prompt: `“${quest.heroName}” is known as which title?`,
      correct: quest.characterTitle,
      pool: uniqueStrings(quests.map((q) => q.characterTitle)),
      explain: `${quest.heroName} is called “${quest.characterTitle}” (${quest.badgeName}).`,
      scripture,
    }));

    if (anchor) {
      push(buildChoice({
        id: `q-anchor:${quest.id}`,
        kind: 'story-anchor',
        tag: 'Story Scripture',
        prompt: `Which Scripture anchors ${quest.heroName}'s story?`,
        correct: anchor.reference,
        pool: anchorReferencePool,
        explain: `“${truncate(anchor.text, 130)}” — ${anchor.reference}`,
        scripture,
      }));
    }
  }

  // ---- Canon book questions ----
  for (const book of books) {
    const scripture: TriviaScripture = {
      reference: book.anchorScripture.reference,
      text: book.anchorScripture.canonicalText,
    };

    push(buildChoice({
      id: `b-theme:${book.id}`,
      kind: 'book-theme',
      tag: 'Book & theme',
      prompt: `How is the book of ${book.name} themed in the Canon Codex?`,
      correct: book.lifeTheme,
      pool: bookThemePool,
      explain: `${book.name} — “${book.codename}”: ${truncate(book.anchorScripture.takeaway, 130)}`,
      scripture,
    }));

    push(buildChoice({
      id: `b-ref:${book.id}`,
      kind: 'book-reference',
      tag: 'Book Scripture',
      prompt: `Which passage is the anchor Scripture of ${book.name}?`,
      correct: book.anchorScripture.reference,
      pool: bookReferencePool,
      explain: `“${truncate(book.anchorScripture.canonicalText, 130)}” — ${book.anchorScripture.reference}`,
      scripture,
    }));
  }

  // ---- Dilemma ancient-parallel questions (Bible history) ----
  for (const dilemma of dilemmas) {
    const scripture: TriviaScripture = {
      reference: dilemma.anchorScripture.reference,
      text: dilemma.anchorScripture.text,
    };

    push(buildChoice({
      id: `d-figure:${dilemma.id}`,
      kind: 'dilemma-figure',
      tag: 'Ancient parallel',
      prompt: `Which biblical figure parallels “${dilemma.title}”?`,
      correct: dilemma.biblicalParallel.hero,
      pool: dilemmaHeroPool,
      explain: truncate(dilemma.biblicalParallel.event, 160),
      scripture,
    }));

    push(buildChoice({
      id: `d-ref:${dilemma.id}`,
      kind: 'dilemma-reference',
      tag: 'Counsel Scripture',
      prompt: `Which Scripture anchors the counsel for “${dilemma.title}”?`,
      correct: dilemma.anchorScripture.reference,
      pool: dilemmaReferencePool,
      explain: truncate(dilemma.anchorScripture.streetMeaning, 150),
      scripture,
    }));
  }

  return bank;
}

function shuffleQuestionOptions(question: TriviaQuestion): TriviaQuestion {
  const correct = question.options[question.correctIndex];
  const options = shuffle(question.options);
  return { ...question, options, correctIndex: options.indexOf(correct) };
}

/**
 * Selects a run from the bank, prioritising questions the player previously missed
 * (so they keep coming back until answered correctly), then filling with fresh picks.
 */
export function pickRunFromBank(bank: TriviaQuestion[], count: number, preferredIds: string[] = []): TriviaQuestion[] {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const chosen: TriviaQuestion[] = [];
  const used = new Set<string>();

  for (const id of preferredIds) {
    const question = byId.get(id);
    if (question && !used.has(question.id)) {
      chosen.push(question);
      used.add(question.id);
    }
    if (chosen.length >= count) break;
  }

  for (const question of shuffle(bank)) {
    if (chosen.length >= count) break;
    if (used.has(question.id)) continue;
    chosen.push(question);
    used.add(question.id);
  }

  return shuffle(chosen).map(shuffleQuestionOptions);
}
