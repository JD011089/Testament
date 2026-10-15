import type { ScriptureLine } from '../../types/story';

/**
 * A real Scripture line: gold highlight with its reference and translation.
 * Never used for AI-written narration.
 */
export function VerseLine({ line, className = '' }: { line: ScriptureLine; className?: string }) {
  return (
    <figure className={`rounded-2xl border border-accent/40 bg-accent/10 p-3 sm:p-4 ${className}`}>
      <blockquote className="font-reading text-body text-fg italic">
        <span className="text-accent text-title-4 not-italic">“</span>
        {line.text}
        <span className="text-accent text-title-4 not-italic">”</span>
      </blockquote>
      <figcaption className="mt-2 flex items-center gap-2 text-ref text-fg-muted">
        <span className="font-semibold text-accent">{line.ref}</span>
        <span aria-hidden="true">•</span>
        <span className="uppercase tracking-wide">{line.translation}</span>
      </figcaption>
    </figure>
  );
}