/**
 * Bible tab data: book sections, reading progress, saved highlights, and
 * which chapters have a playable story. Everything is stored on the device.
 */
import { CANON_BOOKS, type CanonBook } from '../data/canon';
import { STORY_STOPS } from '../content/stories';
import { findCanonBookByName } from './bookLinks';
import { getBookChapterCount } from './bibleService';

/* ---------------- sections ---------------- */

export type BibleSectionId = 'law' | 'history' | 'poetry' | 'prophets' | 'gospels' | 'church' | 'letters' | 'prophecy';

export interface BibleSection {
  id: BibleSectionId;
  testament: 'OT' | 'NT';
  /** Inclusive canon order range. */
  from: number;
  to: number;
  /** Tailwind classes for the section colour (dot, bar). */
  color: string;
}

export const BIBLE_SECTIONS: BibleSection[] = [
  { id: 'law', testament: 'OT', from: 1, to: 5, color: 'bg-[#B8862B] dark:bg-[#E2B65E]' },
  { id: 'history', testament: 'OT', from: 6, to: 17, color: 'bg-[#2E7D6B] dark:bg-[#6FC7AE]' },
  { id: 'poetry', testament: 'OT', from: 18, to: 22, color: 'bg-[#7A4E8C] dark:bg-[#C39BD6]' },
  { id: 'prophets', testament: 'OT', from: 23, to: 39, color: 'bg-[#B5523B] dark:bg-[#EE9677]' },
  { id: 'gospels', testament: 'NT', from: 40, to: 43, color: 'bg-[#23408E] dark:bg-[#8FA8F0]' },
  { id: 'church', testament: 'NT', from: 44, to: 44, color: 'bg-[#2E7D6B] dark:bg-[#6FC7AE]' },
  { id: 'letters', testament: 'NT', from: 45, to: 65, color: 'bg-[#7A4E8C] dark:bg-[#C39BD6]' },
  { id: 'prophecy', testament: 'NT', from: 66, to: 66, color: 'bg-[#B5523B] dark:bg-[#EE9677]' },
];

export function sectionForBook(book: CanonBook): BibleSection {
  return BIBLE_SECTIONS.find((s) => book.order >= s.from && book.order <= s.to) ?? BIBLE_SECTIONS[0];
}

export function booksInSection(section: BibleSection, books: CanonBook[] = CANON_BOOKS): CanonBook[] {
  return books.filter((b) => b.order >= section.from && b.order <= section.to).sort((a, b) => a.order - b.order);
}

/** Short display name: "Acts of the Apostles" -> "Acts". */
export function shortBookName(name: string): string {
  if (name === 'Acts of the Apostles') return 'Acts';
  return name;
}

/** Two-letter label for the little book icon: "1 John" -> "1J", "Genesis" -> "Ge". */
export function bookMonogram(name: string): string {
  const short = shortBookName(name);
  const m = short.match(/^(\d)\s+(\S)/);
  if (m) return `${m[1]}${m[2]}`;
  return short.slice(0, 2);
}

export function chapterCount(book: CanonBook): number {
  return getBookChapterCount(book.name);
}

/* ---------------- reading progress ---------------- */

const READ_KEY = 'testament_chapters_read';
export const READING_PROGRESS_EVENT = 'testament-reading-progress';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown, event: string) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(event));
  } catch {
    // storage full or unavailable
  }
}

/** bookId -> sorted list of chapters read. */
export function loadChaptersRead(): Record<string, number[]> {
  const raw = readJson<Record<string, unknown>>(READ_KEY, {});
  const out: Record<string, number[]> = {};
  for (const [id, list] of Object.entries(raw)) {
    if (Array.isArray(list)) out[id] = list.filter((n): n is number => typeof n === 'number' && n > 0);
  }
  return out;
}

export function markChapterRead(bookId: string, chapter: number) {
  const all = loadChaptersRead();
  const list = all[bookId] ?? [];
  if (list.includes(chapter)) return;
  all[bookId] = [...list, chapter].sort((a, b) => a - b);
  writeJson(READ_KEY, all, READING_PROGRESS_EVENT);
}

/** First unread chapter after the furthest one read (or 1). */
export function nextUnreadChapter(book: CanonBook, read: number[] = loadChaptersRead()[book.id] ?? []): number {
  const total = chapterCount(book);
  if (read.length === 0) return 1;
  for (let c = Math.max(...read) + 1; c <= total; c++) if (!read.includes(c)) return c;
  for (let c = 1; c <= total; c++) if (!read.includes(c)) return c;
  return total;
}

/* ---------------- highlights & notes ---------------- */

export type HighlightColor = 'yellow' | 'blue' | 'green' | 'purple';
export const HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'blue', 'green', 'purple'];

/** Background classes per colour (light and dark). */
export const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: 'bg-[#FCE9A8] dark:bg-[#E2B65E]/30',
  blue: 'bg-[#D6E1F7] dark:bg-[#8FA8F0]/25',
  green: 'bg-[#D5EDDD] dark:bg-[#6FC7AE]/25',
  purple: 'bg-[#EBDDF2] dark:bg-[#C39BD6]/25',
};

export interface VerseMark {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  color: HighlightColor | null;
  note?: string;
  updatedAt: string;
}

const MARKS_KEY = 'testament_verse_marks';
export const MARKS_EVENT = 'testament-verse-marks';

const markKey = (bookId: string, chapter: number, verse: number) => `${bookId}|${chapter}|${verse}`;

function loadAllMarks(): Record<string, VerseMark> {
  return readJson<Record<string, VerseMark>>(MARKS_KEY, {});
}

export function marksForChapter(bookId: string, chapter: number): Record<number, VerseMark> {
  const out: Record<number, VerseMark> = {};
  for (const m of Object.values(loadAllMarks())) {
    if (m.bookId === bookId && m.chapter === chapter) out[m.verse] = m;
  }
  return out;
}

/** Most recent first. Only verses with a highlight or a note. */
export function listMarks(): VerseMark[] {
  return Object.values(loadAllMarks())
    .filter((m) => m.color || m.note)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveMark(mark: Omit<VerseMark, 'updatedAt'>) {
  const all = loadAllMarks();
  const key = markKey(mark.bookId, mark.chapter, mark.verse);
  if (!mark.color && !mark.note) delete all[key];
  else all[key] = { ...mark, updatedAt: new Date().toISOString() };
  writeJson(MARKS_KEY, all, MARKS_EVENT);
}

/* ---------------- stories by chapter ---------------- */

export interface ChapterStory {
  storyId: string;
  title: string;
  passage: string;
}

/** Parses "Genesis 37, 39-45" into chapter numbers. */
export function chaptersInPassage(passage: string): { book: CanonBook; chapters: number[] } | null {
  const m = passage.match(/^(.*?\D)\s*(\d[\d,\s-]*)$/);
  if (!m) return null;
  const book = findCanonBookByName(m[1].trim());
  if (!book) return null;
  const chapters: number[] = [];
  for (const part of m[2].split(',')) {
    const [a, b] = part.trim().split('-').map((n) => parseInt(n, 10));
    if (!Number.isFinite(a)) continue;
    for (let c = a; c <= (Number.isFinite(b) ? b : a); c++) chapters.push(c);
  }
  return { book, chapters };
}

let storyIndex: Map<string, ChapterStory[]> | null = null;

/** bookId -> stories; each story lists which chapters it covers. */
function getStoryIndex(): Map<string, ChapterStory[]> {
  if (storyIndex) return storyIndex;
  storyIndex = new Map();
  for (const stop of STORY_STOPS) {
    const parsed = chaptersInPassage(stop.passage);
    if (!parsed) continue;
    const list = storyIndex.get(parsed.book.id) ?? [];
    list.push({ storyId: stop.id, title: stop.title, passage: stop.passage });
    storyIndex.set(parsed.book.id, list);
  }
  return storyIndex;
}

export function storiesForBook(bookId: string): ChapterStory[] {
  return getStoryIndex().get(bookId) ?? [];
}

export function storyForChapter(bookId: string, chapter: number): ChapterStory | null {
  return storiesForBook(bookId).find((s) => chaptersInPassage(s.passage)?.chapters.includes(chapter)) ?? null;
}

export function chaptersWithStories(bookId: string): Set<number> {
  const out = new Set<number>();
  for (const s of storiesForBook(bookId)) chaptersInPassage(s.passage)?.chapters.forEach((c) => out.add(c));
  return out;
}
