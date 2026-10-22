import type { CSSProperties } from 'react';
import type { StorySceneId } from '../../../utils/storyScenes';
import { getStoryIllustrationUrl } from '../../../utils/storyIllustrations';
import { getStoryScene, type SceneLayer, type StorySceneConfig } from '../sceneModel';

function spotlightStyle(layer: SceneLayer, on: boolean): CSSProperties {
  return {
    top: layer.position.top,
    left: layer.position.left,
    right: layer.position.right,
    bottom: layer.position.bottom,
    width: layer.size.width,
    height: layer.size.height,
    zIndex: layer.z,
    opacity: on ? 0.88 : 0,
    background: 'radial-gradient(ellipse at center, rgba(255, 226, 170, 0.72) 0%, rgba(255, 211, 137, 0.4) 34%, rgba(232, 165, 76, 0.16) 62%, transparent 86%)',
    filter: 'blur(4px)',
    mixBlendMode: 'screen',
    transitionDuration: `${layer.durationMs}ms`,
    transitionDelay: on ? `${layer.delayMs}ms` : '0ms'
  };
}

/** One full-frame illustration; each revealed detail adds a soft light cue. */
export function StoryWorld({ scene, stepIndex }: { scene: StorySceneId; stepIndex: number }) {
  const config = getStoryScene(scene);
  if (!config) return null;
  return <SceneCanvas config={config} stepIndex={stepIndex} />;
}

export function SceneCanvas({ config, stepIndex }: { config: StorySceneConfig; stepIndex: number }) {
  const ambients = config.steps.slice(0, Math.max(0, stepIndex + 1)).flatMap((step) => step.ambient ? [step.ambient] : []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-stone-950" style={{ aspectRatio: '16 / 9' }}>
      <img
        src={getStoryIllustrationUrl(config.id)}
        alt={`${config.title} story illustration`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {config.steps.flatMap((step, index) =>
        step.layers.map((layer) => {
          const on = index <= stepIndex;
          return (
            <div
              key={`${step.id}-${layer.src}`}
              aria-hidden="true"
              className={`scene-piece enter-${layer.enter} ${on ? 'is-on' : ''}`}
              style={spotlightStyle(layer, on)}
            />
          );
        })
      )}
      {ambients.map((ambient, index) => (
        <div
          key={`ambient-${index}`}
          aria-hidden
          className="scene-ambient is-on"
          style={{
            zIndex: 50,
            background: ambient.glow ?? ambient.tint,
            opacity: ambient.glow ? undefined : 1
          }}
        />
      ))}
    </div>
  );
}
