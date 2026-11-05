/**
 * Localized Daily Mission Engine
 * Provides authentic French and Spanish localizations for Daily Missions,
 * Story Quests, Action Buttons, and Hero Tracks.
 */

import type { SupportedLanguage } from '../context/LanguageContext';
import type { DailyCampaignStep } from '../data/dailyCampaigns';

// ============================================================================
// 1. HERO NAMES
// ============================================================================
export const LOCALIZED_HERO_NAMES: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    David: 'David',
    Moses: 'Moses',
    Elijah: 'Elijah',
    Joseph: 'Joseph',
    Peter: 'Peter',
    Paul: 'Paul',
    Daniel: 'Daniel',
    Esther: 'Esther',
    Nehemiah: 'Nehemiah',
    Gideon: 'Gideon',
    Jonah: 'Jonah',
    Ruth: 'Ruth',
    Joshua: 'Joshua',
    'John the Baptist': 'John the Baptist',
  },
  es: {
    David: 'David',
    Moses: 'Moisés',
    Elijah: 'Elías',
    Joseph: 'José',
    Peter: 'Pedro',
    Paul: 'Pablo',
    Daniel: 'Daniel',
    Esther: 'Ester',
    Nehemiah: 'Nehemías',
    Gideon: 'Gedeón',
    Jonah: 'Jonás',
    Ruth: 'Rut',
    Joshua: 'Josué',
    'John the Baptist': 'Juan el Bautista',
  },
  fr: {
    David: 'David',
    Moses: 'Moïse',
    Elijah: 'Élie',
    Joseph: 'Joseph',
    Peter: 'Pierre',
    Paul: 'Paul',
    Daniel: 'Daniel',
    Esther: 'Esther',
    Nehemiah: 'Néhémie',
    Gideon: 'Gédéon',
    Jonah: 'Jonas',
    Ruth: 'Ruth',
    Joshua: 'Josué',
    'John the Baptist': 'Jean-Baptiste',
  },
};

export function getLocalizedHero(hero: string, lang: SupportedLanguage): string {
  return LOCALIZED_HERO_NAMES[lang]?.[hero] || hero;
}

// ============================================================================
// 2. VIRTUE THEMES & BATTLEFIELDS
// ============================================================================
export const LOCALIZED_VIRTUES: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'Underdog & Courage': 'Underdog & Courage',
    'Burnout & Pressure': 'Burnout & Pressure',
    'Career & High Stakes': 'Career & High Stakes',
    'Restoration & Brotherhood': 'Restoration & Brotherhood',
    'Active learning': 'Active Learning',
    'Workplace Politics & Authority Tension': 'Workplace Politics & Authority Tension',
    'Anxiety, Burnout & Heavy Overwhelm': 'Anxiety, Burnout & Heavy Overwhelm',
    'Betrayal, Slander & Relational Friction': 'Betrayal, Slander & Relational Friction',
    'High-Stakes Decision & Moral Courage': 'High-Stakes Decision & Moral Courage',
    'Spiritual Dryness & Lethargy': 'Spiritual Dryness & Lethargy',
  },
  es: {
    'Underdog & Courage': 'Desvalido y Valentía',
    'Burnout & Pressure': 'Agotamiento y Presión',
    'Career & High Stakes': 'Carrera y Altos Riesgos',
    'Restoration & Brotherhood': 'Restauración y Hermandad',
    'Active learning': 'Aprendizaje Activo',
    'Workplace Politics & Authority Tension': 'Política Laboral y Tensión con la Autoridad',
    'Anxiety, Burnout & Heavy Overwhelm': 'Ansiedad, Agotamiento y Sobrecarga',
    'Betrayal, Slander & Relational Friction': 'Traición, Difamación y Fricción Relacional',
    'High-Stakes Decision & Moral Courage': 'Decisión Crucial y Valentía Moral',
    'Spiritual Dryness & Lethargy': 'Sequedad Espiritual y Letargo',
  },
  fr: {
    'Underdog & Courage': 'Outsider & Courage',
    'Burnout & Pressure': 'Épuisement & Pression',
    'Career & High Stakes': 'Carrière & Enjeux Élevés',
    'Restoration & Brotherhood': 'Restauration & Fraternité',
    'Active learning': 'Apprentissage Actif',
    'Workplace Politics & Authority Tension': 'Politique d’Entreprise & Tension Hiérarchique',
    'Anxiety, Burnout & Heavy Overwhelm': 'Anxiété, Épuisement & Accablement',
    'Betrayal, Slander & Relational Friction': 'Trahison, Calomnie & Frictions Relationnelles',
    'High-Stakes Decision & Moral Courage': 'Décision Cruciale & Courage Moral',
    'Spiritual Dryness & Lethargy': 'Sécheresse Spirituelle & Léthargie',
  },
};

export function getLocalizedVirtue(theme: string, lang: SupportedLanguage): string {
  return LOCALIZED_VIRTUES[lang]?.[theme] || theme;
}

// ============================================================================
// 3. STEP BADGES
// ============================================================================
export const LOCALIZED_STEP_BADGES: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'Story Quest': 'Story Quest',
    'Scripture Memory': 'Scripture Memory',
    'FSRS Review': 'FSRS Review',
    'Proverbs': 'Proverbs',
    'Psalms': 'Psalms',
    'Canon Briefing': 'Canon Briefing',
  },
  es: {
    'Story Quest': 'Misión Narrativa',
    'Scripture Memory': 'Memorizar Escritura',
    'FSRS Review': 'Repaso FSRS',
    'Proverbs': 'Proverbios',
    'Psalms': 'Salmos',
    'Canon Briefing': 'Briefing del Canon',
  },
  fr: {
    'Story Quest': 'Quête Narrative',
    'Scripture Memory': 'Mémorisation d’Écriture',
    'FSRS Review': 'Révision FSRS',
    'Proverbs': 'Proverbes',
    'Psalms': 'Psaumes',
    'Canon Briefing': 'Briefing du Canon',
  },
};

export function getLocalizedStepBadge(badge: string, lang: SupportedLanguage): string {
  return LOCALIZED_STEP_BADGES[lang]?.[badge] || badge;
}

// ============================================================================
// 4. ACTION BUTTON LABELS
// ============================================================================
export const LOCALIZED_ACTIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'make the call': 'Make the call',
    'enter story': 'Enter Story',
    'memorize this verse': 'Memorize this verse',
    'forge the verse': 'Memorize this verse',
    'forge truth': 'Memorize verse',
    'review now': 'Review now',
    'meditate': 'Reflect',
    'read chapter': 'Read Chapter',
    'open proverbs': 'Open Proverbs',
    'pray the psalm': 'Pray this Psalm',
    'pray this psalm': 'Pray this Psalm',
    'open psalms': 'Pray this Psalm',
  },
  es: {
    'make the call': 'Tomar la decisión',
    'enter story': 'Entrar a la historia',
    'memorize this verse': 'Memorizar este versículo',
    'forge the verse': 'Memorizar este versículo',
    'forge truth': 'Memorizar versículo',
    'review now': 'Repasar ahora',
    'meditate': 'Meditar',
    'read chapter': 'Leer capítulo',
    'open proverbs': 'Abrir Proverbios',
    'pray the psalm': 'Orar este Salmo',
    'pray this psalm': 'Orar este Salmo',
    'open psalms': 'Orar este Salmo',
  },
  fr: {
    'make the call': 'Prendre la décision',
    'enter story': 'Entrer dans le récit',
    'memorize this verse': 'Mémoriser ce verset',
    'forge the verse': 'Mémoriser ce verset',
    'forge truth': 'Mémoriser le verset',
    'review now': 'Réviser maintenant',
    'meditate': 'Méditer',
    'read chapter': 'Lire le chapitre',
    'open proverbs': 'Ouvrir les Proverbes',
    'pray the psalm': 'Prier ce Psaume',
    'pray this psalm': 'Prier ce Psaume',
    'open psalms': 'Prier ce Psaume',
  },
};

export function getLocalizedAction(action: string, lang: SupportedLanguage): string {
  const norm = action.trim().toLowerCase();
  return LOCALIZED_ACTIONS[lang]?.[norm] || action;
}

// ============================================================================
// 5. STORY ACT HEADINGS & ATMOSPHERES (FOR DAILY MISSION CARDS)
// ============================================================================
export interface LocalizedStoryActData {
  actTitle: string;
  atmosphere: string;
}

export const LOCALIZED_QUEST_ACTS: Record<SupportedLanguage, Record<string, LocalizedStoryActData>> = {
  en: {},
  es: {
    'moses-journey': {
      actTitle: 'La Trampa en el Mar Rojo',
      atmosphere: 'El viento nocturno desgarra tu manto. Al frente: olas oceánicas negras e implacables. Detrás: el estruendo de 600 carros de guerra del Faraón acercándose.',
    },
    'david-journey': {
      actTitle: 'Guerra Psicológica en el Valle',
      atmosphere: 'El polvo del valle de Ela se levanta con los gritos del gigante Goliat. Todo el ejército de Israel tiembla aterrado ante sus burlas.',
    },
    'elijah-journey': {
      actTitle: 'El Duelo en el Monte Carmelo',
      atmosphere: 'El silencio ardiente de tres años de sequía. Un solo profeta de pie frente a 450 profetas de Baal ante la mirada expectante de la nación.',
    },
    'joseph-journey': {
      actTitle: 'La Fosa en Dotán',
      atmosphere: 'La túnica rasgada, arrojado a una cisterna seca por tus propios hermanos mientras discuten con frialdad si venderte o abandonarte.',
    },
    'peter-journey': {
      actTitle: 'El Fuego del Patio y el Canto del Gallo',
      atmosphere: 'El frío de la noche alrededor de las brasas entre extraños hostiles. La mirada inquisitiva de una criada y el pánico que quiebra tu juramento.',
    },
    'paul-journey': {
      actTitle: 'El Terremoto de Medianoche en Filipos',
      atmosphere: 'La espalda lacerada, los pies en el cepo en la celda más oscura. En lugar de lamentos, himnos de medianoche sacuden los cimientos de la prisión.',
    },
    'daniel-journey': {
      actTitle: 'Desafío en el Comedor Imperial',
      atmosphere: 'El oro del palacio de Babilonia y los manjares del emperador. Elegir la integridad silenciosa en vez del compromiso cómodo.',
    },
    'esther-journey': {
      actTitle: 'Identidad Oculta en Susa',
      atmosphere: 'Los pasillos de mármol del harén imperial persa, donde un solo paso en falso significa la muerte. Un secreto guardado para la hora decisiva.',
    },
    'nehemiah-journey': {
      actTitle: 'La Tristeza Ante el Rey',
      atmosphere: 'Presentar la copa de vino al emperador con el corazón roto por las murallas de Jerusalén, sabiendo que mostrar tristeza podía costar la vida.',
    },
    'ruth-journey': {
      actTitle: 'El Pacto en el Duelo',
      atmosphere: 'En el camino polvoriento dejando Moab, dos viudas sin protección. Elegir la lealtad radical cuando todo aconseja volver atrás.',
    },
    'joshua-journey': {
      actTitle: 'El Cruce del Jordán Desbordado',
      atmosphere: 'Las aguas turbulentas del río Jordán desbordadas en tiempo de siega. Poner el pie en el agua antes de que se abra el camino.',
    },
  },
  fr: {
    'moses-journey': {
      actTitle: 'Le Piège de la Mer Rouge',
      atmosphere: 'Le vent d’orage hurle contre votre manteau. Devant : les vagues noires et furieuses. Derrière : le fracas de 600 chars de combat du Pharaon qui fondent sur vous.',
    },
    'david-journey': {
      actTitle: 'Guerre Psychologique dans la Vallée',
      atmosphere: 'La poussière de la vallée d’Éla s’élève sous les cris de défi du géant Goliath. Toute l’armée d’Israël tremble de terreur.',
    },
    'elijah-journey': {
      actTitle: 'L’Affrontement au Mont Carmel',
      atmosphere: 'Le silence brûlant d’une terre assoiffée depuis trois ans. Un seul prophète debout face à 450 faux prophètes de Baal sous les yeux de tout un peuple.',
    },
    'joseph-journey': {
      actTitle: 'La Citerne de Dothan',
      atmosphere: 'La tunique déchirée, jeté au fond d’une fosse aride par vos propres frères. Leurs rires au-dessus de vous pendant qu’ils décident de votre sort.',
    },
    'peter-journey': {
      actTitle: 'Le Feu de la Cour & Le Chant du Coq',
      atmosphere: 'Le froid mordant de la nuit de Jérusalem autour d’un brasier d’ennemis. Le regard inquisiteur d’une servante, la panique qui monte et le serment brisé.',
    },
    'paul-journey': {
      actTitle: 'Le Séisme de Minuit à Philippes',
      atmosphere: 'Le dos lacéré de coups de verges, les pieds verrouillés dans les ceps au fond d’un cachot obscur. Au lieu de gémir, des chants de louange percent la nuit.',
    },
    'daniel-journey': {
      actTitle: 'Le Refus de la Table Impériale',
      atmosphere: 'Les dorures du palais de Babylone et le festin somptueux de l’empereur. Choisir l’intégrité silencieuse plutôt que la compromission confortable.',
    },
    'esther-journey': {
      actTitle: 'L’Identité Secrète à Suse',
      atmosphere: 'Les couloirs de marbre du harem impérial perse, où un seul faux pas signifie l’oubli ou la mort. Un secret gardé pour l’heure décisive.',
    },
    'nehemiah-journey': {
      actTitle: 'La Tristesse Devant le Roi',
      atmosphere: 'Présenter la coupe d’or au souverain de l’empire avec le cœur brisé pour les ruines de Jérusalem, sachant que paraître triste devant lui peut coûter la vie.',
    },
    'ruth-journey': {
      actTitle: 'L’Alliance dans le Deuil',
      atmosphere: 'Sur la route poussiéreuse quittant Moab, deux veuves démunies sans protection. Choisir la loyauté indéfectible quand la logique crie de faire demi-tour.',
    },
    'joshua-journey': {
      actTitle: 'La Traversée du Jourdain en Crue',
      atmosphere: 'Les eaux impétueuses du Jourdain débordant de toutes parts au temps de la moisson. Poser le pied dans le fleuve avant qu’il ne s’ouvre.',
    },
  },
};

// ============================================================================
// 7. SCRIPTURE INTEL LOCALIZATIONS
// ============================================================================
export const LOCALIZED_FORGE_STRINGS: Record<SupportedLanguage, { cement: string; due: string }> = {
  en: {
    cement: 'Cement the verse that belongs to this story.',
    due: 'This verse is due. A short retrieval keeps it from fading.',
  },
  es: {
    cement: 'Graba en tu memoria el versículo clave que ancla esta historia.',
    due: 'Este versículo está pendiente de repaso. Un breve recuerdo consolida tu memoria.',
  },
  fr: {
    cement: 'Gravez dans votre mémoire le verset clé qui ancre ce récit.',
    due: 'Ce verset arrive à échéance. Un rappel rapide consolide votre mémoire.',
  },
};

// Book names translation in references (e.g. "Exodus 14:13-14" -> "Éxode 14:13-14")
const BOOK_NAME_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {},
  es: {
    Genesis: 'Génesis',
    Exodus: 'Éxodo',
    Leviticus: 'Levítico',
    Numbers: 'Números',
    Deuteronomy: 'Deuteronomio',
    Joshua: 'Josué',
    Judges: 'Jueces',
    Ruth: 'Rut',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reyes',
    '2 Kings': '2 Reyes',
    Psalms: 'Salmos',
    Proverbs: 'Proverbios',
    Matthew: 'Mateo',
    John: 'Juan',
    Romans: 'Romanos',
    Revelation: 'Apocalipsis',
  },
  fr: {
    Genesis: 'Genèse',
    Exodus: 'Exode',
    Leviticus: 'Lévitique',
    Numbers: 'Nombres',
    Deuteronomy: 'Deuteronome',
    Joshua: 'Josué',
    Judges: 'Juges',
    Ruth: 'Ruth',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Rois',
    '2 Kings': '2 Rois',
    Psalms: 'Psaumes',
    Proverbs: 'Proverbes',
    Matthew: 'Matthieu',
    John: 'Jean',
    Romans: 'Romains',
    Revelation: 'Apocalypse',
  },
};

export function getLocalizedReference(ref: string, lang: SupportedLanguage): string {
  if (lang === 'en') return ref;
  const match = ref.match(/^([1-3]?\s?[A-Za-z]+)\s(.*)$/);
  if (!match) return ref;
  const book = match[1].trim();
  const rest = match[2];
  const translatedBook = BOOK_NAME_TRANSLATIONS[lang]?.[book];
  return translatedBook ? `${translatedBook} ${rest}` : ref;
}

// ============================================================================
// 8. RESOLVE DAILY CAMPAIGN STEP CONTENT
// ============================================================================
export function getLocalizedStep(
  step: DailyCampaignStep,
  lang: SupportedLanguage
): { subtitle: string; intel: string; badge: string; actionLabel: string } {
  const badge = getLocalizedStepBadge(step.badge, lang);
  const actionLabel = getLocalizedAction(step.actionLabel, lang);

  if (lang === 'en') {
    return {
      subtitle: step.subtitle,
      intel: step.intel,
      badge,
      actionLabel,
    };
  }

  // 1. Quest Step
  if (step.type === 'quest') {
    const actData = LOCALIZED_QUEST_ACTS[lang]?.[step.targetId];
    if (actData) {
      const actNumMatch = step.subtitle.match(/Act\s+(\d+)/i);
      const actNum = actNumMatch ? actNumMatch[1] : '1';
      const actPrefix = lang === 'fr' ? `Acte ${actNum} • ` : `Acto ${actNum} • `;
      return {
        subtitle: `${actPrefix}${actData.actTitle}`,
        intel: actData.atmosphere,
        badge,
        actionLabel,
      };
    }
  }

  // 3. Wordforge Step
  if (step.type === 'wordforge') {
    const isDue = step.actionLabel.toLowerCase().includes('review');
    const strings = LOCALIZED_FORGE_STRINGS[lang] || LOCALIZED_FORGE_STRINGS.en;
    return {
      subtitle: getLocalizedReference(step.subtitle, lang),
      intel: isDue ? strings.due : strings.cement,
      badge,
      actionLabel,
    };
  }

  return {
    subtitle: step.subtitle,
    intel: step.intel,
    badge,
    actionLabel,
  };
}

// ============================================================================
// 9. RESOLVE REASON
// ============================================================================
export function getLocalizedReason(
  reason: string,
  heroName: string,
  lang: SupportedLanguage
): string {
  if (lang === 'en') return reason;
  const hero = getLocalizedHero(heroName, lang);

  if (reason.startsWith('Continuing ')) {
    return lang === 'fr' ? `Suite du parcours de ${hero}` : `Continuando con ${hero}`;
  }
  if (reason.includes('is due for review')) {
    const ref = reason.replace(' is due for review', '');
    const localizedRef = getLocalizedReference(ref, lang);
    return lang === 'fr' ? `${localizedRef} est à réviser` : `${localizedRef} pendiente de repaso`;
  }
  if (reason.startsWith('Checked in: ')) {
    const bf = reason.replace('Checked in: ', '');
    const localizedBf = getLocalizedVirtue(bf, lang);
    return lang === 'fr' ? `Bilan enregistré : ${localizedBf}` : `Check-in : ${localizedBf}`;
  }
  if (reason.includes('Short session for a 3-minute day')) {
    return lang === 'fr' ? 'Session courte pour une journée de 3 minutes' : 'Sesión corta de 3 minutos';
  }

  return reason;
}

// ============================================================================
// 10. RESOLVE MISSION SUMMARY
// ============================================================================
export function getLocalizedMissionSummary(
  questId: string,
  rawSummary: string,
  lang: SupportedLanguage
): string {
  if (lang === 'en') return rawSummary;
  const actData = LOCALIZED_QUEST_ACTS[lang]?.[questId];
  return actData ? actData.atmosphere : rawSummary;
}
