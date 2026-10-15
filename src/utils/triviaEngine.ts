import type { MemoryVerse, StoryQuest } from '../types';
import type { RealLifeDilemma } from '../data/dilemmas';
import type { CanonBook } from '../data/canon';
import { getAllVerses } from './verseRegistry';
import { cleanWord, normalizeWord, VERSE_STOP_WORDS } from './verseText';
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

const KEY_TOKEN_LENGTH = 4;

/**
 * Plain, non-branded section names for the canonical divisions, so canon
 * questions test Bible structure instead of in-app branding.
 */
const DIVISION_SECTION: Record<string, string> = {
  'Torah & Origins': 'The Law (Torah)',
  'War & Chronicles': 'The Historical Books',
  'Wisdom & Soul Triage': 'Wisdom & Poetry',
  'Prophet Intelligence': 'The Prophets',
  "The King's Manifesto": 'The Gospels & Acts',
  'Field Dispatches': 'The Letters',
  'The Cosmic Endgame': 'Revelation & Apocalypse',
};

const SECTION_NAMES = Object.values(DIVISION_SECTION);

const STOP_WORDS = VERSE_STOP_WORDS;

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

function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= KEY_TOKEN_LENGTH && !STOP_WORDS.has(word));
}

function tokenSet(text: string): Set<string> {
  return new Set(significantTokens(text));
}

/** True when a candidate option repeats a significant word from the question stem. */
function sharesToken(value: string, forbidden: Set<string>): boolean {
  return significantTokens(value).some((token) => forbidden.has(token));
}

/** Strips in-app branding suffixes so hero options are plain biblical figures. */
function cleanHeroName(name: string): string {
  return name.replace(/\s*\((?:Canon Codex|Proverbs Codex|Psalms Field Medic)\)\s*$/i, '').trim();
}

const CANON_BY_NAME = new Map<string, CanonBook>();
for (const book of CANON_BOOKS) {
  CANON_BY_NAME.set(book.name.toLowerCase(), book);
  CANON_BY_NAME.set(book.name.toLowerCase().replace(/s$/, ''), book);
}

function referenceBookName(reference: string): string {
  const match = reference.match(/^((?:[1-3]\s+)?[A-Za-z][A-Za-z\s]*?)\s*\d/);
  return (match ? match[1] : reference.split(/[\s:]/)[0]).trim();
}

function canonBookFor(reference: string): CanonBook | undefined {
  const name = referenceBookName(reference).toLowerCase();
  return CANON_BY_NAME.get(name) ?? CANON_BY_NAME.get(name.replace(/s$/, ''));
}

function referenceFamily(reference: string): string {
  return canonBookFor(reference)?.division ?? 'Other';
}

function uniqueOptions(
  correct: string,
  pool: string[],
  forbidden: Set<string>,
): { options: string[]; correctIndex: number } | null {
  const distractors: string[] = [];
  for (const candidate of shuffle(pool)) {
    const value = candidate.trim();
    if (!value || value === correct || distractors.includes(value)) continue;
    if (sharesToken(value, forbidden)) continue;
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
  const forbidden = tokenSet(spec.prompt);
  if (sharesToken(spec.correct, forbidden)) return null;
  const built = uniqueOptions(spec.correct, spec.pool, forbidden);
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
    const clean = normalizeWord(word);
    if (clean.length >= 5 && !STOP_WORDS.has(clean)) eligible.push(idx);
  });
  if (eligible.length === 0) return null;

  const blankIdx = pick(eligible);
  const answer = cleanWord(words[blankIdx]);
  if (!answer) return null;

  const rendered = words.map((w, i) => (i === blankIdx ? '_____' : w)).join(' ');
  const forbidden = tokenSet('Which word completes the passage?');
  if (sharesToken(answer, forbidden)) return null;
  const built = uniqueOptions(answer, pool, forbidden);
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
    verses.map((v) => cleanHeroName(v.heroName || '')).concat(quests.map((q) => cleanHeroName(q.heroName)))
  );
  const dilemmaHeroPool = uniqueStrings(dilemmas.map((d) => cleanHeroName(d.biblicalParallel.hero)));

  const referenceCandidates = uniqueStrings([
    ...referencePool,
    ...quests.map((q) => q.acts[0]?.unlockedScripture.reference || ''),
    ...books.map((b) => b.anchorScripture.reference),
    ...dilemmas.map((d) => d.anchorScripture.reference),
  ]);

  // Distractors for reference questions come from the same division (book family),
  // never from the same book, so no option gives the answer away.
  const familyPoolFor = (reference: string, excludeSameBook: boolean): string[] => {
    const family = referenceFamily(reference);
    const book = referenceBookName(reference).toLowerCase();
    const sameFamily = referenceCandidates.filter(
      (candidate) =>
        referenceFamily(candidate) === family &&
        (!excludeSameBook || referenceBookName(candidate).toLowerCase() !== book)
    );
    if (sameFamily.length >= 3) return sameFamily;
    return referenceCandidates.filter((candidate) => referenceBookName(candidate).toLowerCase() !== book);
  };

  const bookOptionsFor = (book: CanonBook): string[] => {
    const siblings = books
      .filter((b) => b.name !== book.name && b.division === book.division)
      .map((b) => b.name);
    if (siblings.length >= 3) return siblings;
    return books.filter((b) => b.name !== book.name).map((b) => b.name);
  };

  const blankWordPool: string[] = [];
  for (const verse of verses) {
    for (const word of verse.text.split(/\s+/)) {
      const clean = cleanWord(word);
      if (clean.length >= 5 && clean.length <= 12 && !STOP_WORDS.has(normalizeWord(word))) {
        blankWordPool.push(clean);
      }
    }
  }
  const uniqueBlankPool = uniqueStrings(blankWordPool);

  // ---- Verse-grounded questions ----
  // A reference must map to one question set: duplicate references (e.g. a memory
  // verse that also appears as a canon anchor) would otherwise yield contradictory
  // "correct" answers, so only the first occurrence is used.
  const seenReference = new Set<string>();
  for (const verse of verses) {
    if (seenReference.has(verse.reference)) continue;
    seenReference.add(verse.reference);

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
      pool: familyPoolFor(verse.reference, true),
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

    push(fillBlankQuestion(verse, uniqueBlankPool));

    if (verse.heroName) {
      push(buildChoice({
        id: `v-hero:${verse.id}`,
        kind: 'verse-hero',
        tag: 'Hero & story',
        prompt: `Which story hero is tied to ${verse.reference}?`,
        correct: cleanHeroName(verse.heroName),
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

    // "Which story belongs to X?" was an invented app-title question and is removed.
    if (anchor) {
      push(buildChoice({
        id: `q-anchor:${quest.id}`,
        kind: 'story-anchor',
        tag: 'Story Scripture',
        prompt: `Which Scripture anchors ${quest.heroName}'s story?`,
        correct: anchor.reference,
        pool: familyPoolFor(anchor.reference, true),
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
      id: `b-section:${book.id}`,
      kind: 'book-section',
      tag: 'Where in the Bible?',
      prompt: `Which part of the Bible is the book of ${book.name} found in?`,
      correct: DIVISION_SECTION[book.division] ?? book.division,
      pool: SECTION_NAMES,
      explain: `${book.name} sits in “${DIVISION_SECTION[book.division] ?? book.division}”. ${truncate(book.subtitle, 120)}`,
      scripture,
    }));

    push(buildChoice({
      id: `b-book:${book.id}`,
      kind: 'book-identify',
      tag: 'Name that book',
      prompt: 'Which book of the Bible contains this passage?',
      context: `“${truncate(book.anchorScripture.canonicalText, 180)}”`,
      correct: book.name,
      pool: bookOptionsFor(book),
      explain: `“${truncate(book.anchorScripture.canonicalText, 120)}” — ${book.anchorScripture.reference}`,
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
      correct: cleanHeroName(dilemma.biblicalParallel.hero),
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
      pool: familyPoolFor(dilemma.anchorScripture.reference, true),
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
