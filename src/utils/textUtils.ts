/**
 * Shared text formatting utilities for clean typography and spacing.
 */

/**
 * Joins non-empty string parts with a specified separator, guaranteeing single-space boundaries.
 * Handles bullet points, hyphens, and mixed tokens without accidental character concatenations.
 */
export function formatSpaced(parts: (string | number | undefined | null | false)[], separator: string = ' '): string {
  return parts
    .filter((p): p is string | number => p !== undefined && p !== null && p !== false && String(p).trim().length > 0)
    .map(p => String(p).trim())
    .join(separator);
}

/**
 * Truncates text cleanly at word boundaries, appending an ellipsis ('…') if truncated.
 * Prevents mid-word cuts like 'conseq…' -> 'consequence…' or 'faithf…' -> 'faithful…'.
 */
export function truncateAtWordBoundary(text: string, maxLength: number, ellipsis: string = '…'): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const sub = text.slice(0, maxLength);
  const lastSpaceIdx = sub.lastIndexOf(' ');

  if (lastSpaceIdx > 0 && lastSpaceIdx >= Math.floor(maxLength * 0.5)) {
    return sub.slice(0, lastSpaceIdx).trimEnd() + ellipsis;
  }

  return sub.trimEnd() + ellipsis;
}

/**
 * Sanitizes English grammatical articles (e.g., 'A angry crowd' -> 'An angry crowd').
 */
export function sanitizeGrammarArticles(text: string): string {
  if (!text) return text;
  return text
    .replace(/\bA\s+angry\b/gi, (match) => {
      const isUpper = match.startsWith('A') && match[1] === ' ';
      return (isUpper ? 'An angry' : 'an angry');
    })
    .replace(/\bA\s+urgent\b/gi, (match) => {
      const isUpper = match.startsWith('A') && match[1] === ' ';
      return (isUpper ? 'An urgent' : 'an urgent');
    })
    .replace(/\bA\s+honest\b/gi, (match) => {
      const isUpper = match.startsWith('A') && match[1] === ' ';
      return (isUpper ? 'An honest' : 'an honest');
    });
}
