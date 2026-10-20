import type { StorySceneId } from '../../utils/storyScenes';
import { REST_SCENES } from './sceneRest';

export type LayerEnter = 'fade' | 'rise' | 'grow' | 'slide-left' | 'ripple';

export type SceneLayer = {
  src: string;
  alt: string;
  z: number;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  size: { width: string; height: string };
  /** Cover fills a landscape band. Contain keeps a cutout at its own size. */
  fit?: 'cover' | 'contain';
  enter: LayerEnter;
  durationMs: number;
  delayMs: number;
};

export type SceneAmbient = {
  tint?: string;
  glow?: string;
  particles?: boolean;
};

/** One story beat. Showing step N also shows every layer from steps 0..N. */
export type SceneStep = {
  id: string;
  caption: string;
  verse?: string;
  layers: SceneLayer[];
  ambient?: SceneAmbient;
};

export type StorySceneConfig = {
  id: StorySceneId;
  title: string;
  anchor: { src: string; alt: string };
  steps: SceneStep[];
};

const CREATION: StorySceneConfig = {
  id: 'creation',
  title: 'Creation',
  anchor: {
    src: '/images/stories/creation-0.jpg',
    alt: 'Dark water under a night sky, before the first light'
  },
  steps: [
    {
      id: 'light',
      caption: 'Light',
      verse: 'Genesis 1:3',
      ambient: {
        tint: 'rgba(255, 220, 160, 0.14)',
        glow: 'radial-gradient(ellipse at 50% 18%, rgba(255, 214, 140, 0.55), rgba(255, 186, 90, 0.16) 36%, transparent 62%)'
      },
      layers: [
        {
          src: '/images/stories/layers/creation-light.webp',
          alt: 'A small sun in the upper sky',
          z: 20,
          position: { top: '2%', left: '38%' },
          size: { width: '24%', height: '28%' },
          enter: 'grow',
          durationMs: 900,
          delayMs: 0
        }
      ]
    },
    {
      id: 'sky',
      caption: 'Sky and sea',
      verse: 'Genesis 1:8',
      layers: [
        {
          src: '/images/stories/layers/creation-sky.webp',
          alt: 'Clouds gathering across the sky',
          z: 10,
          position: { top: '0', left: '0' },
          size: { width: '100%', height: '46%' },
          fit: 'cover',
          enter: 'fade',
          durationMs: 800,
          delayMs: 40
        }
      ]
    },
    {
      id: 'land',
      caption: 'Land and plants',
      verse: 'Genesis 1:11',
      layers: [
        {
          src: '/images/stories/layers/creation-land.webp',
          alt: 'Hills, trees, and a river',
          z: 30,
          position: { bottom: '0', left: '0' },
          size: { width: '100%', height: '84%' },
          fit: 'cover',
          enter: 'rise',
          durationMs: 1000,
          delayMs: 0
        }
      ]
    },
    {
      id: 'life',
      caption: 'Living creatures',
      verse: 'Genesis 1:24',
      layers: [
        {
          src: '/images/stories/layers/creation-life.webp',
          alt: 'Sheep, a deer, birds, and fish',
          z: 40,
          position: { bottom: '2%', left: '4%' },
          size: { width: '92%', height: '50%' },
          enter: 'fade',
          durationMs: 900,
          delayMs: 80
        }
      ]
    }
  ]
};

const NOAH: StorySceneConfig = {
  id: 'noah',
  title: 'Noah',
  anchor: {
    src: '/images/stories/layers/noah-base.jpg',
    alt: 'A dark storm sea before the ship'
  },
  steps: [
    {
      id: 'ship',
      caption: 'The ship',
      layers: [
        {
          src: '/images/stories/layers/noah-ship.webp',
          alt: 'A wooden ship',
          z: 10,
          position: { bottom: '0', left: '2%' },
          size: { width: '96%', height: '74%' },
          enter: 'rise',
          durationMs: 1000,
          delayMs: 0
        }
      ]
    },
    {
      id: 'animals',
      caption: 'The animals',
      layers: [
        {
          src: '/images/stories/layers/noah-animals.webp',
          alt: 'Animals on the deck',
          z: 20,
          position: { bottom: '24%', left: '14%' },
          size: { width: '46%', height: '26%' },
          enter: 'rise',
          durationMs: 900,
          delayMs: 40
        }
      ]
    },
    {
      id: 'people',
      caption: 'Noah and his household',
      layers: [
        {
          src: '/images/stories/layers/noah-people.webp',
          alt: 'Noah and his household on the deck',
          z: 30,
          position: { bottom: '36%', left: '42%' },
          size: { width: '18%', height: '24%' },
          enter: 'fade',
          durationMs: 800,
          delayMs: 0
        }
      ]
    }
  ]
};

const ABRAHAM: StorySceneConfig = {
  id: 'abrahams-call',
  title: "Abraham's Call",
  anchor: {
    src: '/images/stories/layers/abrahams-call-base.jpg',
    alt: 'A man walking away across an empty desert'
  },
  steps: [
    {
      id: 'country',
      caption: 'His country',
      layers: [
        {
          src: '/images/stories/layers/abrahams-call-country.webp',
          alt: 'A walled city',
          z: 10,
          position: { bottom: '0', left: '0' },
          size: { width: '58%', height: '62%' },
          enter: 'slide-left',
          durationMs: 900,
          delayMs: 0
        }
      ]
    },
    {
      id: 'relatives',
      caption: 'His relatives',
      layers: [
        {
          src: '/images/stories/layers/abrahams-call-relatives.webp',
          alt: 'Relatives he is leaving',
          z: 30,
          position: { bottom: '8%', left: '16%' },
          size: { width: '22%', height: '40%' },
          enter: 'fade',
          durationMs: 800,
          delayMs: 40
        }
      ]
    },
    {
      id: 'house',
      caption: "His father's house",
      layers: [
        {
          src: '/images/stories/layers/abrahams-call-house.webp',
          alt: "His father's house",
          z: 20,
          position: { bottom: '10%', left: '30%' },
          size: { width: '20%', height: '30%' },
          enter: 'rise',
          durationMs: 900,
          delayMs: 0
        }
      ]
    }
  ]
};

const DAVID: StorySceneConfig = {
  id: 'david-and-goliath',
  title: 'David and Goliath',
  anchor: {
    src: '/images/stories/layers/david-and-goliath-base.jpg',
    alt: 'A shepherd facing a tall man in a valley'
  },
  steps: [
    {
      id: 'helmet',
      caption: 'Helmet of brass',
      layers: [
        {
          src: '/images/stories/layers/david-and-goliath-helmet.webp',
          alt: 'A bronze helmet',
          z: 30,
          position: { top: '16%', right: '12%' },
          size: { width: '14%', height: '18%' },
          enter: 'fade',
          durationMs: 700,
          delayMs: 0
        }
      ]
    },
    {
      id: 'coat',
      caption: 'Coat of mail',
      layers: [
        {
          src: '/images/stories/layers/david-and-goliath-coat.webp',
          alt: 'A coat of mail',
          z: 20,
          position: { top: '26%', right: '8%' },
          size: { width: '24%', height: '40%' },
          enter: 'fade',
          durationMs: 800,
          delayMs: 0
        }
      ]
    },
    {
      id: 'legs',
      caption: 'Brass shin armor',
      layers: [
        {
          src: '/images/stories/layers/david-and-goliath-legs.webp',
          alt: 'Bronze shin armor',
          z: 15,
          position: { bottom: '10%', right: '14%' },
          size: { width: '12%', height: '20%' },
          enter: 'rise',
          durationMs: 800,
          delayMs: 0
        }
      ]
    },
    {
      id: 'javelin',
      caption: 'Javelin of brass',
      layers: [
        {
          src: '/images/stories/layers/david-and-goliath-javelin.webp',
          alt: 'A bronze javelin',
          z: 40,
          position: { top: '34%', right: '2%' },
          size: { width: '36%', height: '16%' },
          enter: 'slide-left',
          durationMs: 800,
          delayMs: 0
        }
      ]
    },
    {
      id: 'spear',
      caption: "Spear like a weaver's beam",
      layers: [
        {
          src: '/images/stories/layers/david-and-goliath-spear.webp',
          alt: 'A heavy spear',
          z: 35,
          position: { top: '0', right: '1%' },
          size: { width: '8%', height: '92%' },
          enter: 'rise',
          durationMs: 900,
          delayMs: 0
        }
      ]
    }
  ]
};

const RED_SEA: StorySceneConfig = {
  id: 'red-sea',
  title: 'The Red Sea',
  anchor: {
    src: '/images/stories/layers/red-sea-base.jpg',
    alt: 'People waiting at an unbroken sea'
  },
  steps: [
    {
      id: 'hand',
      caption: 'A hand stretched out',
      layers: [
        {
          src: '/images/stories/layers/red-sea-hand.webp',
          alt: 'A hand stretched out over the water',
          z: 30,
          position: { top: '46%', left: '0' },
          size: { width: '26%', height: '28%' },
          enter: 'slide-left',
          durationMs: 800,
          delayMs: 0
        }
      ]
    },
    {
      id: 'wind',
      caption: 'A strong east wind',
      layers: [
        {
          src: '/images/stories/layers/red-sea-wind.webp',
          alt: 'Wind moving across the sky',
          z: 20,
          position: { top: '0', left: '0' },
          size: { width: '100%', height: '34%' },
          fit: 'cover',
          enter: 'fade',
          durationMs: 800,
          delayMs: 40
        }
      ]
    },
    {
      id: 'path',
      caption: 'A path of dry land',
      layers: [
        {
          src: '/images/stories/layers/red-sea-path.webp',
          alt: 'A dry path between walls of water',
          z: 8,
          position: { top: '0', left: '0' },
          size: { width: '100%', height: '100%' },
          fit: 'cover',
          enter: 'ripple',
          durationMs: 1100,
          delayMs: 0
        }
      ]
    }
  ]
};

const SCENES: Partial<Record<StorySceneId, StorySceneConfig>> = {
  creation: CREATION,
  noah: NOAH,
  'abrahams-call': ABRAHAM,
  'david-and-goliath': DAVID,
  'red-sea': RED_SEA,
  ...REST_SCENES
};

export function getStoryScene(id: StorySceneId): StorySceneConfig | undefined {
  return SCENES[id];
}
