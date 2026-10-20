import { useEffect, type CSSProperties } from 'react';
import type { StorySceneId } from '../../../utils/storyScenes';
import { getStoryScene, type SceneLayer, type StorySceneConfig } from '../sceneModel';

function preload(src: string) {
  const img = new Image();
  img.src = src;
}

function layerStyle(layer: SceneLayer, on: boolean): CSSProperties {
  return {
    top: layer.position.top,
    left: layer.position.left,
    right: layer.position.right,
    bottom: layer.position.bottom,
    width: layer.size.width,
    height: layer.size.height,
    zIndex: layer.z,
    objectFit: layer.fit ?? 'contain',
    transitionDuration: `${layer.durationMs}ms`,
    transitionDelay: on ? `${layer.delayMs}ms` : '0ms'
  };
}

/** One 16:9 canvas. The anchor stays put; each step only adds or removes its own layers. */
export function StoryWorld({ scene, stepIndex }: { scene: StorySceneId; stepIndex: number }) {
  const config = getStoryScene(scene);
  if (!config) return null;
  return <SceneCanvas config={config} stepIndex={stepIndex} />;
}

export function SceneCanvas({ config, stepIndex }: { config: StorySceneConfig; stepIndex: number }) {
  useEffect(() => {
    const upcoming = config.steps[stepIndex + 1];
    upcoming?.layers.forEach((layer) => preload(layer.src));
  }, [config, stepIndex]);

  const ambients = config.steps.slice(0, Math.max(0, stepIndex + 1)).flatMap((step) => step.ambient ? [step.ambient] : []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-stone-950" style={{ aspectRatio: '16 / 9' }}>
      <img
        src={config.anchor.src}
        alt={config.anchor.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {config.steps.flatMap((step, index) =>
        step.layers.map((layer) => {
          const on = index <= stepIndex;
          return (
            <img
              key={`${step.id}-${layer.src}`}
              src={layer.src}
              alt={on ? layer.alt : ''}
              aria-hidden={on ? undefined : true}
              draggable={false}
              className={`scene-piece enter-${layer.enter} ${on ? 'is-on' : ''}`}
              style={layerStyle(layer, on)}
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
