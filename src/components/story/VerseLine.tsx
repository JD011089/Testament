import type { ScriptureLine } from '../../types/story';

/**
 * For text that is shown inside quote marks already. A verse that opens
 * mid-speech starts with a quote mark that never closes, and a verse that is
 * one whole quotation carries its own pair: drop those so the marks do not double.
 */
export function stripOuterQuotes(text: string): string {
  if (!text.startsWith('“')) return text;
  const rest = text.slice(1);
  if (!rest.includes('”')) return rest;
  const wholeQuote = rest.indexOf('”') === rest.length - 1 && !rest.includes('“');
  return wholeQuote ? rest.slice(0, -1) : text;
}

/**
 * A real Scripture line: gold highlight with its reference and translation.
 * Never used for AI-written narration.
 */
export function VerseLine({ line, className = '', compact = false, veryCompact = false }: { line: ScriptureLine; className?: string; compact?: boolean; veryCompact?: boolean }) {
  return (
    <figure className={`rounded-2xl border border-accent/40 bg-accent/10 ${compact ? 'p-2' : 'p-3 sm:p-4'} ${className}`}>
      <blockquote className={`font-reading text-fg italic ${veryCompact ? 'text-[clamp(0.72rem,1.5dvh,0.86rem)]' : compact ? 'text-[clamp(0.78rem,1.7dvh,0.95rem)]' : 'text-body'}`}>
        <span className="text-accent text-title-4 not-italic">“</span>
        {stripOuterQuotes(line.text)}
        <span className="text-accent text-title-4 not-italic">”</span>
      </blockquote>
      <figcaption className={`mt-2 flex items-center gap-2 text-fg-muted ${compact ? 'text-[10px]' : 'text-ref'}`}>
        <span className="font-semibold text-accent">{line.ref}</span>
        <span aria-hidden="true">•</span>
        <span className="uppercase tracking-wide">{line.translation}</span>
      </figcaption>
    </figure>
  );
}
