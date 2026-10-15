/**
 * Translation integrity check.
 *
 * Every bundled Scripture line must come from a single verified source that
 * matches its label. Story Swipes ships only WEB (public domain) text for now;
 * anything labeled WEB or KJV must match the bundled source corpus exactly.
 * Blended or unlicensed labels (NIV, ESV, CSB, BSB) are rejected outright.
 */

import { STORIES } from '../content/stories';
import { canonicalVerseKey } from './verseKey';
import { parseScriptureReference } from './scriptureRef';
import webSource from '../content/sources/web.json' with { type: 'json' };

export const ALLOWED_TRANSLATIONS = ['WEB', 'KJV', 'Plain English'];
export const DISALLOWED_LABELS = ['NIV', 'ESV', 'CSB', 'BSB', 'NLT', 'NASB'];

export interface BundledScripture {
  where: string;
  ref: string;
  translation: string;
  text: string;
}

export interface VerificationIssue {
  where: string;
  problem: string;
}

const SOURCES: Record<string, string> = webSource as Record<string, string>;

export function collectBundledScripture(): BundledScripture[] {
  const lines: BundledScripture[] = [];
  for (const story of STORIES) {
    lines.push({ where: `${story.id}.verse`, ref: story.verse.ref, translation: story.verse.translation, text: story.verse.text });
    story.cards.forEach((card, i) => {
      if (card.type === 'narration' && card.scriptureLine) {
        lines.push({
          where: `${story.id}.cards[${i}]`,
          ref: card.scriptureLine.ref,
          translation: card.scriptureLine.translation,
          text: card.scriptureLine.text
        });
      }
      if (card.type === 'choice') {
        lines.push({
          where: `${story.id}.cards[${i}].whatHappened`,
          ref: card.whatHappened.ref,
          translation: card.whatHappened.translation,
          text: card.whatHappened.scriptureText
        });
      }
    });
  }
  return lines;
}

export function verifyBundledVerses(lines: BundledScripture[] = collectBundledScripture()): VerificationIssue[] {
  const issues: VerificationIssue[] = [];
  for (const line of lines) {
    if (DISALLOWED_LABELS.includes(line.translation)) {
      issues.push({ where: line.where, problem: `label "${line.translation}" is not a shipped public-domain translation` });
      continue;
    }
    if (!ALLOWED_TRANSLATIONS.includes(line.translation)) {
      issues.push({ where: line.where, problem: `unknown translation label "${line.translation}"` });
    }
    if (!parseScriptureReference(line.ref)) {
      issues.push({ where: line.where, problem: `reference "${line.ref}" is invalid` });
    }
    if (line.translation === 'WEB' || line.translation === 'KJV') {
      const key = canonicalVerseKey(line.ref);
      const source = key ? SOURCES[key] : undefined;
      if (!source) {
        issues.push({ where: line.where, problem: `no bundled ${line.translation} source text for ${line.ref} (${key ?? 'unparseable'})` });
      } else if (source.trim() !== line.text.trim()) {
        issues.push({ where: line.where, problem: `text for ${line.ref} does not match the verified ${line.translation} source` });
      }
    }
  }
  return issues;
}