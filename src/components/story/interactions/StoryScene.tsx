import type { StorySceneId } from '../../../utils/storyScenes';
import { getStoryIllustrationUrl } from '../../../utils/storyIllustrations';
import { getStoryScene } from '../sceneModel';
import revealFocus from '../revealFocus.json' with { type: 'json' };

export type RevealFocus = { x: number; y: number; zoom?: number };

const FOCUS = revealFocus as Record<string, Record<string, RevealFocus>>;

export function getRevealFocus(scene: StorySceneId, revealId: string): RevealFocus | null {
  return FOCUS[scene]?.[revealId] ?? null;
}

export interface SceneReveal {
  id: string;
  label: string;
  detail?: string;
}

interface StoryWorldProps {
  scene: StorySceneId;
  /** Legacy prop; only used to decide nothing is focused. */
  stepIndex?: number;
  /** Ordered reveal steps for this card. Omit to show the plain illustration. */
  reveals?: SceneReveal[];
  /** How many steps have been revealed so far. */
  revealedCount?: number;
  /** The step the picture is focused on, or -1 for none. */
  focusIndex?: number;
  compact?: boolean;
  veryCompact?: boolean;
}

/**
 * The story illustration for a "Your turn" reveal. Each revealed step zooms the
 * picture toward its spot, dims the rest, drops a numbered marker there, and
 * names what was revealed in a caption on the picture.
 */
export function StoryWorld({ scene, reveals, revealedCount = 0, focusIndex = -1, compact = false, veryCompact = false }: StoryWorldProps) {
  const config = getStoryScene(scene);
  if (!config) return null;

  const focusedReveal = reveals && focusIndex >= 0 ? reveals[focusIndex] : undefined;
  const focus = focusedReveal ? getRevealFocus(scene, focusedReveal.id) : null;
  const zoom = focus ? focus.zoom ?? 1.5 : 1;
  const origin = focus ? `${focus.x}% ${focus.y}%` : '50% 50%';
  // Where a point on the original picture ends up after zooming toward the focus.
  const project = (p: RevealFocus) => ({
    left: focus ? focus.x + (p.x - focus.x) * zoom : p.x,
    top: focus ? focus.y + (p.y - focus.y) * zoom : p.y,
  });

  const sizeClass = veryCompact
    ? '!h-[clamp(84px,14dvh,118px)] !aspect-auto'
    : compact
      ? '!h-[clamp(110px,22dvh,170px)] !aspect-auto'
      : '';

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-line bg-stone-950 aspect-video ${sizeClass}`}>
      <img
        src={getStoryIllustrationUrl(config.id)}
        alt={`${config.title} story illustration`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transformOrigin: origin, transform: `scale(${zoom})` }}
      />

      {/* Spotlight: dim everything except the revealed spot. */}
      {reveals && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: focus ? 1 : 0,
            background: focus
              ? `radial-gradient(circle at ${focus.x}% ${focus.y}%, transparent 0%, transparent 11%, rgba(8,6,4,0.35) 20%, rgba(8,6,4,0.62) 42%)`
              : undefined,
          }}
        />
      )}

      {/* Caption naming what was just revealed. */}
      {reveals && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent ${
            veryCompact ? 'px-2.5 pb-1.5 pt-5' : compact ? 'px-3 pb-2 pt-6' : 'px-4 pb-3 pt-10'
          }`}
        >
          {focusedReveal ? (
            <div key={focusedReveal.id} className="animate-fadeIn">
              <p className={`font-bold uppercase tracking-[0.16em] text-[#F6D79B] ${veryCompact ? 'text-[9px]' : 'text-[10px]'}`}>
                {focusIndex + 1} / {reveals.length}
              </p>
              <p className={`font-serif font-semibold leading-tight text-white ${veryCompact ? 'text-sm' : compact ? 'text-base' : 'text-xl'}`}>
                {focusedReveal.label}
              </p>
              {focusedReveal.detail && !veryCompact && (
                <p className={`text-white/80 ${compact ? 'text-[11px]' : 'text-sm'}`}>{focusedReveal.detail}</p>
              )}
            </div>
          ) : (
            <p className={`font-bold uppercase tracking-[0.16em] text-white/70 ${veryCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              0 / {reveals.length}
            </p>
          )}
        </div>
      )}
      {/* Numbered markers for every revealed step. */}
      {reveals?.slice(0, revealedCount).map((reveal, index) => {
        const point = getRevealFocus(scene, reveal.id);
        if (!point) return null;
        const pos = project(point);
        if (pos.left < 2 || pos.left > 98 || pos.top < 2 || pos.top > 98) return null;
        const active = index === focusIndex;
        return (
          <span
            key={reveal.id}
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
          >
            {active && (
              <span className={`absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F6D79B] shadow-[0_0_18px_rgba(246,215,155,0.85)] motion-safe:animate-pulse ${veryCompact ? 'h-9 w-9' : compact ? 'h-11 w-11' : 'h-14 w-14'}`} />
            )}
            <span
              className={`relative grid place-items-center rounded-full font-bold shadow-md ${
                active ? 'bg-[#F6D79B] text-stone-950' : 'bg-black/60 text-[#F6D79B] ring-1 ring-[#F6D79B]/70'
              } ${veryCompact ? 'h-4 w-4 text-[9px]' : 'h-5 w-5 text-[10px]'}`}
            >
              {index + 1}
            </span>
          </span>
        );
      })}

    </div>
  );
}
