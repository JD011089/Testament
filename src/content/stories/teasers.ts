/**
 * Short teaser lines for the Today screen.
 *
 * - `keyPhrase` is an exact excerpt of the story's verse text (WEB), so the
 *   preview never misquotes Scripture. A test checks this.
 * - `hook` is narration (not Scripture), translated per language.
 */
import type { SupportedLanguage } from '../../context/LanguageContext';

export interface StoryTeaser {
  keyPhrase: string;
  hook: Record<SupportedLanguage, string>;
}

export const STORY_TEASERS: Record<string, StoryTeaser> = {
  'david-and-goliath': {
    keyPhrase: "the battle is Yahweh's",
    hook: {
      en: 'A shepherd boy, five stones, and a giant no one else will face.',
      es: 'Un pastorcito, cinco piedras y un gigante al que nadie se atreve a enfrentar.',
      fr: "Un jeune berger, cinq pierres et un géant que personne n'ose affronter.",
    },
  },
  creation: {
    keyPhrase: 'it was very good',
    hook: {
      en: 'Out of darkness and empty waters, God speaks a world into being.',
      es: 'De la oscuridad y las aguas vacías, Dios llama al mundo a existir.',
      fr: 'Des ténèbres et des eaux vides, Dieu fait naître un monde par sa parole.',
    },
  },
  noah: {
    keyPhrase: 'I set my rainbow in the cloud',
    hook: {
      en: 'One family, one boat, and a promise painted across the sky.',
      es: 'Una familia, un arca y una promesa pintada en el cielo.',
      fr: 'Une famille, une arche et une promesse peinte dans le ciel.',
    },
  },
  'abrahams-call': {
    keyPhrase: 'go to the land that I will show you',
    hook: {
      en: 'God tells Abram to leave everything he knows, with no map.',
      es: 'Dios le pide a Abram dejar todo lo que conoce, sin mapa.',
      fr: 'Dieu demande à Abram de tout quitter, sans carte.',
    },
  },
  joseph: {
    keyPhrase: 'God meant it for good',
    hook: {
      en: 'Sold by his brothers, forgotten in prison, then raised to save them all.',
      es: 'Vendido por sus hermanos, olvidado en la cárcel y luego elevado para salvarlos.',
      fr: 'Vendu par ses frères, oublié en prison, puis élevé pour tous les sauver.',
    },
  },
  'moses-burning-bush': {
    keyPhrase: 'I AM WHO I AM',
    hook: {
      en: 'A bush burns without burning up, and a voice calls a runaway by name.',
      es: 'Una zarza arde sin consumirse, y una voz llama a un fugitivo por su nombre.',
      fr: 'Un buisson brûle sans se consumer, et une voix appelle un fugitif par son nom.',
    },
  },
  'red-sea': {
    keyPhrase: 'the waters were divided',
    hook: {
      en: 'An army behind, the sea ahead, and nowhere left to run.',
      es: 'Un ejército detrás, el mar delante y ningún lugar adonde huir.',
      fr: "Une armée derrière, la mer devant, et nulle part où fuir.",
    },
  },
  ruth: {
    keyPhrase: 'where you go, I will go',
    hook: {
      en: 'A widow chooses loyalty over safety, and finds a new home.',
      es: 'Una viuda elige la lealtad antes que la seguridad, y encuentra un nuevo hogar.',
      fr: 'Une veuve choisit la fidélité plutôt que la sécurité, et trouve un nouveau foyer.',
    },
  },
  'elijah-carmel': {
    keyPhrase: 'Yahweh, he is God!',
    hook: {
      en: 'One prophet, four hundred and fifty rivals, and a soaked altar.',
      es: 'Un profeta, cuatrocientos cincuenta rivales y un altar empapado.',
      fr: 'Un prophète, quatre cent cinquante rivaux et un autel détrempé.',
    },
  },
  'elijah-still-small-voice': {
    keyPhrase: 'a still small voice',
    hook: {
      en: 'Worn out and hiding, Elijah waits for God in wind, earthquake and fire.',
      es: 'Agotado y escondido, Elías espera a Dios en el viento, el terremoto y el fuego.',
      fr: 'Épuisé et caché, Élie attend Dieu dans le vent, le séisme et le feu.',
    },
  },
  'daniel-lions-den': {
    keyPhrase: 'because he had trusted in his God',
    hook: {
      en: 'Daniel keeps praying, even with a den of lions waiting.',
      es: 'Daniel sigue orando, aunque lo espera un foso de leones.',
      fr: 'Daniel continue de prier, même avec une fosse aux lions qui l’attend.',
    },
  },
  jonah: {
    keyPhrase: 'Yahweh prepared a great fish',
    hook: {
      en: 'A prophet runs the other way, and the sea will not let him go.',
      es: 'Un profeta huye en dirección contraria, y el mar no lo deja escapar.',
      fr: 'Un prophète fuit dans l’autre sens, et la mer ne le laisse pas partir.',
    },
  },
  esther: {
    keyPhrase: 'for such a time as this',
    hook: {
      en: 'A young queen must risk her life to speak for her people.',
      es: 'Una joven reina debe arriesgar su vida para hablar por su pueblo.',
      fr: 'Une jeune reine doit risquer sa vie pour parler au nom de son peuple.',
    },
  },
  'birth-of-jesus': {
    keyPhrase: 'a Savior, who is Christ the Lord',
    hook: {
      en: 'No room at the inn, a manger for a bed, and angels over the fields.',
      es: 'No hay lugar en el mesón, un pesebre por cuna y ángeles sobre los campos.',
      fr: "Pas de place à l'auberge, une mangeoire pour berceau et des anges sur les champs.",
    },
  },
  'jesus-calms-the-storm': {
    keyPhrase: 'Peace! Be still!',
    hook: {
      en: 'Waves flood the boat while Jesus sleeps in the stern.',
      es: 'Las olas inundan la barca mientras Jesús duerme en la popa.',
      fr: 'Les vagues remplissent la barque pendant que Jésus dort à la poupe.',
    },
  },
  'feeding-the-5000': {
    keyPhrase: 'I am the bread of life',
    hook: {
      en: 'Five loaves, two fish, and a hungry crowd of thousands.',
      es: 'Cinco panes, dos peces y una multitud hambrienta de miles.',
      fr: 'Cinq pains, deux poissons et une foule affamée de milliers de personnes.',
    },
  },
  'peter-walks-on-water': {
    keyPhrase: 'why did you doubt?',
    hook: {
      en: 'Peter steps out of the boat onto the waves, until he looks down.',
      es: 'Pedro sale de la barca sobre las olas, hasta que mira hacia abajo.',
      fr: 'Pierre sort de la barque sur les vagues, jusqu’à ce qu’il regarde en bas.',
    },
  },
  'prodigal-son': {
    keyPhrase: 'was moved with compassion, and ran',
    hook: {
      en: 'A son wastes everything, then walks home hoping to be a servant.',
      es: 'Un hijo lo derrocha todo y vuelve a casa esperando ser un siervo.',
      fr: 'Un fils dilapide tout, puis rentre en espérant devenir serviteur.',
    },
  },
  'good-samaritan': {
    keyPhrase: 'Go and do likewise.',
    hook: {
      en: 'A man lies beaten on the road. Who will stop?',
      es: 'Un hombre yace golpeado en el camino. ¿Quién se detendrá?',
      fr: "Un homme gît, battu, sur la route. Qui va s'arrêter ?",
    },
  },
  zacchaeus: {
    keyPhrase: 'Today, salvation has come to this house',
    hook: {
      en: 'A short, hated tax collector climbs a tree to see Jesus pass.',
      es: 'Un recaudador bajito y odiado sube a un árbol para ver pasar a Jesús.',
      fr: 'Un petit collecteur d’impôts détesté grimpe dans un arbre pour voir passer Jésus.',
    },
  },
  'the-cross': {
    keyPhrase: 'It is finished.',
    hook: {
      en: 'The darkest afternoon in history, and the words that changed it.',
      es: 'La tarde más oscura de la historia, y las palabras que la cambiaron.',
      fr: "L'après-midi le plus sombre de l'histoire, et les mots qui l'ont changé.",
    },
  },
  'the-resurrection': {
    keyPhrase: 'Jesus said to her, “Mary.”',
    hook: {
      en: 'An empty tomb, a weeping woman, and a voice she knows.',
      es: 'Una tumba vacía, una mujer que llora y una voz que reconoce.',
      fr: 'Un tombeau vide, une femme en larmes et une voix qu’elle reconnaît.',
    },
  },
  pentecost: {
    keyPhrase: 'filled with the Holy Spirit',
    hook: {
      en: 'Wind, fire, and a crowd hearing God in their own languages.',
      es: 'Viento, fuego y una multitud que oye a Dios en sus propios idiomas.',
      fr: 'Du vent, du feu, et une foule qui entend Dieu dans sa propre langue.',
    },
  },
  'road-to-damascus': {
    keyPhrase: 'something like scales fell from his eyes',
    hook: {
      en: "On his way to arrest Christians, Saul is stopped by a blinding light.",
      es: 'Camino a arrestar cristianos, Saulo es detenido por una luz cegadora.',
      fr: 'En route pour arrêter des chrétiens, Saul est arrêté par une lumière aveuglante.',
    },
  },
};

export function getStoryTeaser(storyId: string): StoryTeaser | null {
  return STORY_TEASERS[storyId] ?? null;
}
