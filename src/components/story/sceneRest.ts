import type { StorySceneId } from '../../utils/storyScenes';
import type { LayerEnter, SceneLayer, StorySceneConfig } from './sceneModel';

type Box = { t?: number; l?: number; r?: number; b?: number; w: number; h: number };

function pct(n: number): string {
  return `${n}%`;
}

function at(
  file: string,
  alt: string,
  z: number,
  box: Box,
  enter: LayerEnter = 'fade',
  fit?: 'cover' | 'contain'
): SceneLayer {
  const position: SceneLayer['position'] = {};
  if (box.t != null) position.top = pct(box.t);
  if (box.l != null) position.left = pct(box.l);
  if (box.r != null) position.right = pct(box.r);
  if (box.b != null) position.bottom = pct(box.b);
  return {
    src: `/images/stories/layers/${file}.webp`,
    alt,
    z,
    position,
    size: { width: pct(box.w), height: pct(box.h) },
    enter,
    durationMs: 850,
    delayMs: 0,
    ...(fit ? { fit } : {})
  };
}

function story(
  id: StorySceneId,
  title: string,
  anchor: string,
  anchorAlt: string,
  steps: StorySceneConfig['steps']
): StorySceneConfig {
  return {
    id,
    title,
    anchor: { src: `/images/stories/layers/${anchor}.jpg`, alt: anchorAlt },
    steps
  };
}

const JOSEPH = story('joseph', 'Joseph', 'joseph-base', 'An empty desert road', [
  { id: 'pit', caption: 'A pit', layers: [at('joseph-pit', 'A pit in the road', 20, { b: 8, l: 36, w: 28, h: 32 }, 'rise')] },
  { id: 'sale', caption: 'A sale', layers: [at('joseph-sale', 'Merchants on the road', 30, { b: 10, l: 6, w: 34, h: 42 })] },
  { id: 'egypt', caption: 'A new land', layers: [at('joseph-egypt', 'A city and pyramids', 25, { b: 18, r: 2, w: 42, h: 46 }, 'slide-left')] }
]);

const MOSES = story('moses-burning-bush', 'Moses and the Burning Bush', 'moses-burning-bush-base', 'An unlit bush in the desert', [
  { id: 'pharaoh', caption: "Pharaoh's court", layers: [at('moses-burning-bush-pharaoh', "Pharaoh's court", 20, { t: 8, l: 2, w: 34, h: 40 })] },
  { id: 'people', caption: 'The people', layers: [at('moses-burning-bush-people', 'The people of Israel', 25, { b: 6, l: 4, w: 26, h: 34 })] },
  { id: 'name', caption: 'The name', layers: [at('moses-burning-bush-name', 'Fire in the bush', 40, { t: 16, l: 52, w: 26, h: 42 }, 'grow')] }
]);

const RUTH = story('ruth', 'Ruth', 'ruth-base', 'Two women on an empty road', [
  { id: 'go', caption: 'The road ahead', layers: [at('ruth-go', 'The road continuing ahead', 15, { b: 6, l: 36, w: 24, h: 30 })] },
  { id: 'people', caption: 'A village', layers: [at('ruth-people', 'A small village', 20, { b: 16, r: 2, w: 32, h: 38 }, 'rise')] },
  { id: 'god', caption: 'A lamp', layers: [at('ruth-god', 'A small lamp', 30, { b: 20, r: 36, w: 10, h: 22 }, 'grow')] }
]);

const CARMEL = story('elijah-carmel', 'Elijah on Carmel', 'elijah-carmel-base', 'A bare altar', [
  { id: 'offering', caption: 'The offering', layers: [at('elijah-carmel-offering', 'An offering on the altar', 40, { t: 38, l: 40, w: 20, h: 18 }, 'rise')] },
  { id: 'wood', caption: 'The wood', layers: [at('elijah-carmel-wood', 'Wood on the altar', 30, { t: 34, l: 36, w: 28, h: 16 })] },
  { id: 'stones', caption: 'The stones', layers: [at('elijah-carmel-stones', 'Stones around the altar', 20, { t: 46, l: 32, w: 36, h: 14 })] },
  { id: 'water', caption: 'The water', layers: [at('elijah-carmel-water', 'Water poured into the trench', 35, { b: 2, l: 18, w: 64, h: 30 }, 'ripple')] }
]);

const VOICE = story('elijah-still-small-voice', 'The Still Small Voice', 'elijah-still-small-voice-base', 'A cave mouth', [
  { id: 'wind', caption: 'A wind', layers: [at('elijah-still-small-voice-wind', 'Wind across the sky', 20, { t: 0, l: 0, w: 100, h: 36 }, 'fade', 'cover')] },
  { id: 'quake', caption: 'A shaking', layers: [at('elijah-still-small-voice-quake', 'Cracked ground', 15, { b: 0, l: 0, w: 100, h: 42 }, 'rise', 'cover')] },
  { id: 'fire', caption: 'A fire', layers: [at('elijah-still-small-voice-fire', 'Fire outside the cave', 25, { b: 8, r: 8, w: 28, h: 36 }, 'grow')] },
  { id: 'voice', caption: 'A quiet voice', layers: [at('elijah-still-small-voice-voice', 'A small light in the cave', 40, { t: 28, l: 44, w: 12, h: 28 }, 'grow')] }
]);

const DANIEL = story('daniel-lions-den', 'Daniel', 'daniel-lions-den-base', 'A dark room', [
  { id: 'windows', caption: 'Open windows', layers: [at('daniel-lions-den-windows', 'Open windows', 20, { t: 4, l: 8, w: 84, h: 46 }, 'fade', 'cover')] },
  { id: 'jerusalem', caption: 'Jerusalem', layers: [at('daniel-lions-den-jerusalem', 'Jerusalem beyond the windows', 15, { t: 8, l: 18, w: 64, h: 36 })] },
  { id: 'times', caption: 'Three lamps', layers: [at('daniel-lions-den-times', 'Three lamps', 30, { b: 8, l: 22, w: 56, h: 32 }, 'grow')] }
]);

const JONAH = story('jonah', 'Jonah', 'jonah-base', 'An empty harbor', [
  { id: 'joppa', caption: 'Joppa', layers: [at('jonah-joppa', 'The port of Joppa', 20, { t: 26, l: 2, w: 32, h: 22 })] },
  { id: 'ship', caption: 'A ship', layers: [at('jonah-ship', 'A ship at the pier', 30, { b: 14, r: 4, w: 32, h: 36 }, 'slide-left')] },
  { id: 'tarshish', caption: 'Tarshish', layers: [at('jonah-tarshish', 'A coast on the horizon', 15, { t: 32, r: 4, w: 28, h: 10 }, 'fade', 'cover')] }
]);

const ESTHER = story('esther', 'Esther', 'esther-base', 'An empty palace court', [
  { id: 'gather', caption: 'The people', layers: [at('esther-gather', 'People gathered in the court', 20, { b: 4, l: 4, w: 46, h: 48 })] },
  { id: 'fast', caption: 'A bare table', layers: [at('esther-fast', 'A bare fast table', 25, { b: 8, l: 28, w: 40, h: 28 }, 'rise')] },
  { id: 'king', caption: 'The throne', layers: [at('esther-king', 'The throne', 30, { b: 10, r: 6, w: 28, h: 52 })] }
]);

const BIRTH = story('birth-of-jesus', 'The Birth', 'birth-of-jesus-base', 'A night field', [
  { id: 'fear', caption: 'A messenger', layers: [at('birth-of-jesus-fear', 'A distant messenger light', 30, { t: 6, l: 8, w: 16, h: 24 }, 'grow')] },
  { id: 'news', caption: 'The star', layers: [at('birth-of-jesus-news', 'A star', 35, { t: 4, l: 42, w: 16, h: 22 }, 'grow')] },
  { id: 'joy', caption: 'Shepherds', layers: [at('birth-of-jesus-joy', 'Shepherds in the field', 20, { b: 4, l: 6, w: 40, h: 40 })] },
  { id: 'savior', caption: 'A manger', layers: [at('birth-of-jesus-savior', 'A manger with cloth', 25, { b: 6, r: 8, w: 32, h: 36 }, 'rise')] }
]);

const STORM = story('jesus-calms-the-storm', 'Jesus Calms the Storm', 'jesus-calms-the-storm-base', 'A boat on open water', [
  { id: 'wind', caption: 'The wind', layers: [at('jesus-calms-the-storm-wind', 'Wind in the sky', 20, { t: 0, l: 0, w: 100, h: 38 }, 'fade', 'cover')] },
  { id: 'sea', caption: 'The waves', layers: [at('jesus-calms-the-storm-sea', 'Waves around the boat', 15, { b: 0, l: 0, w: 100, h: 42 }, 'ripple', 'cover')] }
]);

const FEEDING = story('feeding-the-5000', 'Feeding the Five Thousand', 'feeding-the-5000-base', 'An empty hillside', [
  { id: 'thanks', caption: 'Thanks', layers: [at('feeding-the-5000-thanks', 'Hands lifted in thanks', 30, { t: 18, l: 36, w: 28, h: 36 })] },
  { id: 'loaves', caption: 'Loaves', layers: [at('feeding-the-5000-loaves', 'Loaves of bread', 25, { b: 8, l: 8, w: 28, h: 28 }, 'rise')] },
  { id: 'fish', caption: 'Fish', layers: [at('feeding-the-5000-fish', 'Fish', 25, { b: 8, r: 10, w: 26, h: 26 })] },
  { id: 'enough', caption: 'Baskets', layers: [at('feeding-the-5000-enough', 'Baskets of leftovers', 20, { b: 4, l: 32, w: 30, h: 26 }, 'rise')] }
]);

const PETER = story('peter-walks-on-water', 'Peter Walks on Water', 'peter-walks-on-water-base', 'A boat on the water', [
  { id: 'wind', caption: 'The wind', layers: [at('peter-walks-on-water-wind', 'Wind over the water', 20, { t: 0, l: 0, w: 100, h: 34 }, 'fade', 'cover')] },
  { id: 'fear', caption: 'Looking down', layers: [at('peter-walks-on-water-fear', 'Peter looking down', 30, { b: 8, l: 38, w: 24, h: 42 })] },
  { id: 'sink', caption: 'The waves', layers: [at('peter-walks-on-water-sink', 'Waves at his legs', 15, { b: 0, l: 20, w: 60, h: 36 }, 'ripple', 'cover')] }
]);

const PRODIGAL = story('prodigal-son', 'The Prodigal Son', 'prodigal-son-base', 'A house and a road', [
  { id: 'saw', caption: 'The father', layers: [at('prodigal-son-saw', 'A father on the porch', 25, { b: 18, r: 22, w: 14, h: 36 })] },
  { id: 'ran', caption: 'The run', layers: [at('prodigal-son-ran', 'A son running up the road', 30, { b: 8, l: 30, w: 16, h: 28 }, 'slide-left')] },
  { id: 'kiss', caption: 'The embrace', layers: [at('prodigal-son-kiss', 'An embrace', 35, { b: 8, l: 28, w: 32, h: 46 })] }
]);

const SAMARITAN = story('good-samaritan', 'The Good Samaritan', 'good-samaritan-base', 'An empty road', [
  { id: 'near', caption: 'A traveler', layers: [at('good-samaritan-near', 'A traveler sitting by the road', 20, { b: 4, l: 4, w: 42, h: 36 })] },
  { id: 'saw', caption: 'Someone stopping', layers: [at('good-samaritan-saw', 'Someone stopping', 30, { b: 8, l: 24, w: 20, h: 40 })] },
  { id: 'mercy', caption: 'A donkey', layers: [at('good-samaritan-mercy', 'A donkey', 25, { b: 6, r: 6, w: 28, h: 36 }, 'slide-left')] }
]);

const ZACCHAEUS = story('zacchaeus', 'Zacchaeus', 'zacchaeus-base', 'A tree and a street', [
  { id: 'half', caption: 'Coins set aside', layers: [at('zacchaeus-half', 'Coins set aside', 20, { b: 6, l: 8, w: 36, h: 32 }, 'rise')] },
  { id: 'restore', caption: 'Coins returned', layers: [at('zacchaeus-restore', 'Open hands returning coins', 30, { b: 8, r: 8, w: 36, h: 40 })] }
]);

const CROSS = story('the-cross', 'The Cross', 'the-cross-base', 'A quiet hill', [
  {
    id: 'words',
    caption: 'A blank sign',
    layers: [
      at('the-cross-cross', 'An empty cross', 20, { b: 22, l: 41, w: 18, h: 36 }, 'rise'),
      at('the-cross-words', 'A blank sign', 30, { t: 22, l: 32, w: 36, h: 14 })
    ]
  },
  { id: 'head', caption: 'A crown of thorns', layers: [at('the-cross-head', 'A crown of thorns', 35, { t: 36, l: 40, w: 20, h: 14 })] },
  { id: 'spirit', caption: 'A soft light', layers: [at('the-cross-spirit', 'A soft light rising', 15, { t: 6, l: 46, w: 8, h: 36 }, 'fade', 'contain')] }
]);

const RESURRECTION = story('the-resurrection', 'The Resurrection', 'the-resurrection-base', 'A sealed tomb in the dark', [
  { id: 'early', caption: 'Dawn', layers: [at('the-resurrection-early', 'Dawn in the sky', 10, { t: 0, l: 0, w: 100, h: 40 }, 'fade', 'cover')] },
  { id: 'stone', caption: 'The stone', layers: [at('the-resurrection-stone', 'A stone rolled aside', 25, { b: 8, r: 8, w: 28, h: 36 }, 'slide-left')] },
  { id: 'empty', caption: 'An empty doorway', layers: [at('the-resurrection-empty', 'Light in the doorway', 30, { b: 16, l: 38, w: 24, h: 42 }, 'grow')] }
]);

const PENTECOST = story('pentecost', 'Pentecost', 'pentecost-base', 'An upper room', [
  { id: 'sound', caption: 'A wind', layers: [at('pentecost-sound', 'Wind through the room', 15, { t: 0, l: 0, w: 100, h: 28 }, 'fade', 'cover')] },
  { id: 'filled', caption: 'Small flames', layers: [at('pentecost-filled', 'Small flames above their heads', 40, { t: 6, l: 12, w: 76, h: 22 }, 'grow')] },
  { id: 'speak', caption: 'Open speech', layers: [at('pentecost-speak', 'Open scrolls', 30, { t: 24, l: 16, w: 68, h: 16 })] }
]);

const DAMASCUS = story('road-to-damascus', 'The Road to Damascus', 'road-to-damascus-base', 'A noon road', [
  { id: 'voice', caption: 'A light', layers: [at('road-to-damascus-voice', 'Light from above', 20, { t: 0, l: 46, w: 8, h: 72 }, 'grow')] },
  { id: 'scales', caption: 'Scales', layers: [at('road-to-damascus-scales', 'Scales falling', 30, { t: 14, l: 42, w: 12, h: 28 })] },
  { id: 'sight', caption: 'Sight', layers: [at('road-to-damascus-sight', 'A man kneeling', 25, { b: 6, l: 40, w: 16, h: 36 })] },
  { id: 'baptism', caption: 'Water poured', layers: [at('road-to-damascus-baptism', 'Water poured from a jar', 35, { b: 8, r: 8, w: 18, h: 32 })] }
]);

export const REST_SCENES: Partial<Record<StorySceneId, StorySceneConfig>> = {
  joseph: JOSEPH,
  'moses-burning-bush': MOSES,
  ruth: RUTH,
  'elijah-carmel': CARMEL,
  'elijah-still-small-voice': VOICE,
  'daniel-lions-den': DANIEL,
  jonah: JONAH,
  esther: ESTHER,
  'birth-of-jesus': BIRTH,
  'jesus-calms-the-storm': STORM,
  'feeding-the-5000': FEEDING,
  'peter-walks-on-water': PETER,
  'prodigal-son': PRODIGAL,
  'good-samaritan': SAMARITAN,
  zacchaeus: ZACCHAEUS,
  'the-cross': CROSS,
  'the-resurrection': RESURRECTION,
  pentecost: PENTECOST,
  'road-to-damascus': DAMASCUS
};
