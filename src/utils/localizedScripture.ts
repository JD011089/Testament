/**
 * Localized Scripture Engine
 * Provides authentic, high-fidelity Reina-Valera 1960 (ES) and Louis Segond 1910 (FR)
 * scripture translations, plain-language takeaways, and metadata
 * across the entire Testament platform.
 */

import type { MemoryVerse } from '../types';
import type { RealLifeDilemma } from '../data/dilemmas';
import type { ProverbScenario } from '../data/proverbs';
import type { PsalmPrescription } from '../data/psalms';
import type { CanonBook } from '../data/canon';
import type { SupportedLanguage } from '../context/LanguageContext';

export interface LocalizedVerseData {
  reference: string;
  translation: string;
  text: string;
  plainEnglishSummary: string;
  category?: MemoryVerse['category'];
  keyTakeaway: string;
}

export interface LocalizedDilemmaData {
  reference: string;
  text: string;
  streetMeaning: string;
}

// ============================================================================
// CORE MEMORY VERSES (7 VERSES)
// ============================================================================
export const LOCALIZED_CORE_VERSES: Record<'es' | 'fr', Record<string, LocalizedVerseData>> = {
  es: {
    'verse-1': {
      reference: 'Josué 1:9',
      translation: 'RVR1960',
      text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      plainEnglishSummary: 'El coraje no es la ausencia de miedo; es dar el paso necesario con el nudo en el estómago, sabiendo que Dios te respalda desde el inicio.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Avanza hoy con la frente en alto. En la reunión o decisión difícil que enfrentes, no estás caminando solo.'
    },
    'verse-2': {
      reference: 'Filipenses 4:6-7',
      translation: 'RVR1960',
      text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
      plainEnglishSummary: 'No dejes que los pensamientos de pánico giren sin control a las 3 de la mañana. Descarga la presión mediante la oración y la gratitud sincera.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Cuando el estrés o la ansiedad aumenten, detente y di en voz alta por qué estás agradecido antes de pedir auxilio.'
    },
    'verse-3': {
      reference: 'Proverbios 16:32',
      translation: 'RVR1960',
      text: 'Mejor es el que tarda en airarse que el fuerte; y el que se enseñorea de su espíritu, que el que toma una ciudad.',
      plainEnglishSummary: 'Cualquiera puede estallar de rabia o gritar. El verdadero guerrero es aquel que mantiene la calma y el dominio propio ante la provocación.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Conquistar tu propio orgullo y temperamento exige diez veces más valor que ganar una discusión a los gritos.'
    },
    'verse-4': {
      reference: 'Romanos 8:28',
      translation: 'RVR1960',
      text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
      plainEnglishSummary: 'Incluso los tropiezos, despidos y heridas pueden transformarse en sabiduría y firmeza bajo el plan restaurador de Dios.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Nada se desperdicia. Tus momentos más duros serán el blindaje que ayude a levantar a otros más adelante.'
    },
    'verse-5': {
      reference: 'Proverbios 27:17',
      translation: 'RVR1960',
      text: 'Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.',
      plainEnglishSummary: 'La fricción da filo. Si solo te rodeas de gente complaciente, te quedarás romo. Necesitas compañeros firmes que te hablen con verdad.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Busca hombres con la honestidad de señalar tus fallas para mejorarte y alentarte cuando actúas con rectitud.'
    },
    'verse-6': {
      reference: '2 Timoteo 1:7',
      translation: 'RVR1960',
      text: 'Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.',
      plainEnglishSummary: 'El pánico paralizante nunca viene de Dios. Cuando la angustia te oprima, recuerda tu verdadera dotación: poder, amor y mente sobria.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Respira hondo. Llevas sensatez y disciplina adentro. Decide con convicción serena, no con pánico reactivo.'
    },
    'verse-7': {
      reference: 'Miqueas 6:8',
      translation: 'RVR1960',
      text: 'Oh hombre, él te ha declarado lo que es bueno, y qué pide Jehová de ti: solamente hacer justicia, y amar misericordia, y humillarte ante tu Dios.',
      plainEnglishSummary: 'Haz lo correcto, muestra compasión hacia quien no la merece y mantén tu ego bajo estricto control.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Corta las complicaciones: justicia con el prójimo, gracia sin límites y humildad activa hoy.'
    }
  },
  fr: {
    'verse-1': {
      reference: 'Josué 1:9',
      translation: 'LSG',
      text: 'Ne t’ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t’effraie point et ne t’épouvante point, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.',
      plainEnglishSummary: 'Le vrai courage n’est pas l’absence de peur; c’est avancer malgré l’angoisse au ventre, sachant que Dieu vous précède et vous soutient.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Avancez aujourd’hui la tête haute. Dans toute confrontation ou décision redoutée, vous ne marchez pas seul.'
    },
    'verse-2': {
      reference: 'Philippiens 4:6-7',
      translation: 'LSG',
      text: 'Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.',
      plainEnglishSummary: 'Ne laissez pas les pensées anxieuses tourner en boucle la nuit. Déposez ce fardeau par une prière sincère et une vraie gratitude.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Dès que la panique pointe, marquez une pause et nommez ce dont vous êtes reconnaissant avant d’appeler à l’aide.'
    },
    'verse-3': {
      reference: 'Proverbes 16:32',
      translation: 'LSG',
      text: 'Celui qui est lent à la colère vaut mieux qu’un héros, et celui qui est maître de lui-même, que celui qui prend des villes.',
      plainEnglishSummary: 'N’importe qui peut s’emporter et crier. La véritable puissance réside dans l’homme qui dompte son tempérament face à la provocation.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Vaincre son propre orgueil et maîtriser son sang-froid demande dix fois plus de force que de gagner une dispute.'
    },
    'verse-4': {
      reference: 'Romains 8:28',
      translation: 'LSG',
      text: 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.',
      plainEnglishSummary: 'Même les licenciements, les échecs cuisants et les détours douloureux sont recyclés en force et en sagesse inébranlable.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Rien n’est perdu. Vos chapitres les plus sombres deviendront l’armure qui fortifiera d’autres combattants.'
    },
    'verse-5': {
      reference: 'Proverbes 27:17',
      translation: 'LSG',
      text: 'Comme le fer aiguise le fer, ainsi un homme aiguise la face d’un autre.',
      plainEnglishSummary: 'Le frottement affine la lame. Si vous ne fréquentez que des complaisants, vous resterez émoussé. Il vous faut des frères qui disent la vérité.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Entourez-vous d’hommes qui ont le cran de vous recadrer quand vous faiblissez et de vous honorer quand vous persévérez.'
    },
    'verse-6': {
      reference: '2 Timothée 1:7',
      translation: 'LSG',
      text: 'Car ce n’est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d’amour et de sagesse.',
      plainEnglishSummary: 'La panique paralysante ne vient jamais de Dieu. Quand la peur vous oppresse, rappelez-vous votre équipement: force, amour et discernement.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Respirez profondément. Vous avez en vous le calme et la discipline. Agissez sur des vérités fermes, non sur la panique.'
    },
    'verse-7': {
      reference: 'Michée 6:8',
      translation: 'LSG',
      text: 'On t’a fait connaître, ô homme, ce qui est bien; et ce que l’Éternel demande de toi, c’est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu.',
      plainEnglishSummary: 'Allez droit à l’essentiel: agissez avec équité, offrez de la grâce à qui ne la mérite pas et domptez votre ego.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Dépassez les faux faux-semblants: justice, miséricorde et marche humble. Appliquez cela dès aujourd’hui.'
    }
  }
};

// ============================================================================
// STORY QUEST PRIMARY SCRIPTURES (12 QUESTS)
// ============================================================================
export const LOCALIZED_STORY_VERSES: Record<'es' | 'fr', Record<string, LocalizedVerseData>> = {
  es: {
    'story-david-journey': {
      reference: '1 Samuel 17:45',
      translation: 'RVR1960',
      text: 'Tú vienes a mí con espada y lanza y jabalina; mas yo vengo a ti en el nombre de Jehová de los ejércitos, el Dios de los escuadrones de Israel, a quien tú has provocado.',
      plainEnglishSummary: 'David no ignoró el tamaño del gigante; miró por encima del gigante hacia la soberanía de Dios. Las armas convencionales palidecen ante la confianza en el Señor.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Enfréntate a la conversación o desafío desalentador de hoy sabiendo quién te respalda.'
    },
    'story-peter-journey': {
      reference: 'Lucas 22:31-32',
      translation: 'RVR1960',
      text: 'Simón, Simón, he aquí Satanás os ha pedido para zarandearos como a trigo; pero yo he rogado por ti, que tu fe no falte; y tú, una vez vuelto, confirma a tus hermanos.',
      plainEnglishSummary: 'Tu fracaso no es tu conclusión. El quebranto de Pedro fue la forja que lo transformó de fanfarrón en la roca de la iglesia naciente.',
      category: 'Restoration After Failure',
      keyTakeaway: 'No te escondas en la culpa de ayer. Levántate, asume tu falta y confirma la fe de quienes te rodean.'
    },
    'story-paul-journey': {
      reference: 'Filipenses 4:11-13',
      translation: 'RVR1960',
      text: 'Sé vivir humildemente, y sé tener abundancia... Todo lo puedo en Cristo que me fortalece.',
      plainEnglishSummary: 'El contento no es resignación tibia; es una fortaleza interna invulnerable que no depende del balance de tu cuenta o de tus comodidades.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Rechaza la queja hoy. Sea que las circunstancias favorezcan o aprieten, mantente inalterable en el propósito divino.'
    },
    'story-joseph-journey': {
      reference: 'Génesis 50:20',
      translation: 'RVR1960',
      text: 'Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien, para hacer lo que vemos hoy, para mantener en vida a mucho pueblo.',
      plainEnglishSummary: 'La traición de los hombres no puede descarrilar los planes de Dios. La fosa y la prisión fueron los escalones necesarios para salvar a una nación.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Renuncia a la sed de revancha contra quien te hizo daño. Deja que Dios use esa cicatriz como tu mejor credencial de liderazgo.'
    },
    'story-moses-journey': {
      reference: 'Éxodo 14:14',
      translation: 'RVR1960',
      text: 'Jehová peleará por vosotros, y vosotros estaréis tranquilos.',
      plainEnglishSummary: 'Cuando tengas el mar intransitable al frente y el ejército enemigo en la retaguardia, el pánico te destruye. Tu primera orden es la serenidad obediente.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Guarda silencio interior ante la tormenta. Deja de actuar por histeria y mira cómo Dios abre camino en lo imposible.'
    },
    'story-elijah-journey': {
      reference: '1 Reyes 19:11-12',
      translation: 'RVR1960',
      text: 'Y tras el terremoto un fuego; pero Jehová no estaba en el fuego. Y tras el fuego un silbo apacible y delicado.',
      plainEnglishSummary: 'El agotamiento físico extremo nubla el alma de los hombres más fuertes. Dios no reprendió a Elías; le dio descanso, alimento y un susurro apacible.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Si el agotamiento te aplasta hoy, duerme bien, come alimento real y apaga el ruido para escuchar la voz mansa de Dios.'
    },
    'story-daniel-journey': {
      reference: 'Daniel 6:10',
      translation: 'RVR1960',
      text: 'Cuando Daniel supo que el edicto había sido firmado, entró en su casa... y se arrodillaba tres veces al día, y oraba y daba gracias delante de su Dios, como solía hacer antes.',
      plainEnglishSummary: 'La consistencia en la disciplina secreta es la que produce inmunidad frente a la intimidación de los imperios humanos.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'No alteres tu ritmo espiritual por el miedo al qué dirán o a las políticas del entorno. Mantén abiertas las ventanas de tu oración.'
    },
    'story-nehemiah-journey': {
      reference: 'Nehemías 4:14',
      translation: 'RVR1960',
      text: 'No temáis delante de ellos; acordaos del Señor, grande y temible, y pelead por vuestros hermanos, por vuestros hijos y por vuestras hijas, por vuestras mujeres y por vuestras casas.',
      plainEnglishSummary: 'Construir en tiempos hostiles demanda la llana en una mano y la espada en la otra. La valentía protege a los vulnerables.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Trabaja con excelencia técnica y mantente alerta moralmente para defender tu hogar de influencias corruptas.'
    },
    'story-esther-journey': {
      reference: 'Ester 4:14',
      translation: 'RVR1960',
      text: '¿Y quién sabe si para esta hora has llegado al reino?',
      plainEnglishSummary: 'El confort y la influencia no te fueron concedidos para esconderte, sino para asumir riesgos calculados a favor de la justicia en la hora crucial.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'No guardes silencio por proteger tu pellejo o tu comodidad. Usa tu posición para defender la verdad dondequiera que estés.'
    },
    'story-ruth-journey': {
      reference: 'Rut 1:16',
      translation: 'RVR1960',
      text: 'No me ruegues que te deje, y me aparte de ti; porque a dondequiera que tú fueres, iré yo, y dondequiera que vivieres, viviré. Tu pueblo será mi pueblo, y tu Dios mi Dios.',
      plainEnglishSummary: 'La lealtad inquebrantable en medio de la desolación y la pérdida abre puertas de redención generacional inimaginables.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Cumple tus compromisos con aquellos que han caído en desgracia. Tu fidelidad silenciosa tiene un peso eterno.'
    },
    'story-joshua-journey': {
      reference: 'Josué 1:9',
      translation: 'RVR1960',
      text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      plainEnglishSummary: 'La sucesión de grandes hombres asusta, pero la promesa no estaba atada a Moisés sino a la presencia infalible del Creador.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Asume la responsabilidad del relevo sin titubear. Tu liderazgo empieza por no ceder al desaliento.'
    },
    'story-john-baptist-journey': {
      reference: 'Juan 3:30',
      translation: 'RVR1960',
      text: 'Es necesario que él crezca, pero que yo mengüe.',
      plainEnglishSummary: 'La cumbre de la madurez es saber cuándo hacerse a un lado para que la verdadera gloria y luz recaiga en Cristo Jesús.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Mata el deseo de ser el centro de atención hoy. Encuentra tu mayor gozo en exaltar a Cristo y promover a otros.'
    }
  },
  fr: {
    'story-david-journey': {
      reference: '1 Samuel 17:45',
      translation: 'LSG',
      text: 'Tu marches contre moi avec l’épée, la lance et le javelot; et moi, je marche contre toi au nom de l’Éternel des armées, du Dieu de l’armée d’Israël, que tu as insultée.',
      plainEnglishSummary: 'David ne minimisait pas la stature de son adversaire; il mesurait Goliath à la grandeur de Dieu. L’armure conventionnelle cède devant la foi ferme.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Affrontez votre géant du jour en sachant avec certitude qui combat à vos côtés.'
    },
    'story-peter-journey': {
      reference: 'Luc 22:31-32',
      translation: 'LSG',
      text: 'Simon, Simon, Satan vous a réclamés, pour vous cribler comme le froment. Mais j’ai prié pour toi, afin que ta foi ne défaille point; et toi, quand tu seras converti, affermis tes frères.',
      plainEnglishSummary: 'Votre chute n’est pas le mot de la fin. Le brisement de Pierre fut le creuset qui forgea le pilier de l’Église primitive.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Relevez-vous de vos faux pas d’hier. Accueillez la grâce et affermissez vos compagnons de route.'
    },
    'story-paul-journey': {
      reference: 'Philippiens 4:11-13',
      translation: 'LSG',
      text: 'Je sais vivre dans l’humiliation, et je sais vivre dans l’abondance... Je puis tout par celui qui me fortifie.',
      plainEnglishSummary: 'Le contentement n’est pas de la passivité résignée; c’est une force intérieure invincible forgée au contact permanent du Christ.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Refusez la plainte et le murmure aujourd’hui. Quelle que soit la rigueur des temps, tenez bon dans votre appel.'
    },
    'story-joseph-journey': {
      reference: 'Genèse 50:20',
      translation: 'LSG',
      text: 'Vous aviez médité de me faire du mal: Dieu l’a changé en bien, de manière à accomplir ce qui arrive aujourd’hui, pour sauver la vie à un peuple nombreux.',
      plainEnglishSummary: 'Aucun complot humain ne peut anéantir le dessein de Dieu. La fosse et la prison n’étaient que l’antichambre du salut d’un peuple entier.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Bannissez toute rancœur amère. Laissez Dieu transformer vos blessures passées en autorité bienveillante.'
    },
    'story-moses-journey': {
      reference: 'Exode 14:14',
      translation: 'LSG',
      text: 'L’Éternel combattra pour vous; et vous, gardez le silence.',
      plainEnglishSummary: 'Lorsque la mer est infranchissable devant et que l’ennemi presse derrière, la panique est le pire ennemi. Votre premier devoir est le calme confiant.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Faites taire le tumulte intérieur. Arrêtez les décisions impulsives et regardez Dieu frayer une brèche.'
    },
    'story-elijah-journey': {
      reference: '1 Rois 19:11-12',
      translation: 'LSG',
      text: 'Et après le tremblement de terre, un feu: l’Éternel n’était point dans le feu. Et après le feu, un murmure doux et léger.',
      plainEnglishSummary: 'L’épuisement physique obscurcit le jugement des plus braves. Dieu a d’abord offert à Élie le repos, du pain frais et une parole murmurée de paix.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Si l’accablement vous submerge, restaurez votre corps et écoutez le souffle doux de Dieu dans le silence.'
    },
    'story-daniel-journey': {
      reference: 'Daniel 6:10',
      translation: 'LSG',
      text: 'Lorsque Daniel sut que le décret était rédigé, il se retira dans sa maison... et trois fois par jour il se mettait à genoux, il priait, et il louait son Dieu, comme il le faisait auparavant.',
      plainEnglishSummary: 'C’est la régularité des disciplines spirituelles secrètes qui forge l’audace indestructible devant les menaces des tyrans.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Ne modifiez pas votre droiture morale sous prétexte de pressions professionnelles. Gardez vos fenêtres ouvertes vers le ciel.'
    },
    'story-nehemiah-journey': {
      reference: 'Néhémie 4:14',
      translation: 'LSG',
      text: 'Ne les craignez point! Souvenez-vous du Seigneur, grand et redoutable, et combattez pour vos frères, pour vos fils et vos filles, pour vos femmes et pour vos maisons!',
      plainEnglishSummary: 'Rebâtir dans l’adversité réclame la truelle dans une main et le glaive dans l’autre. Le devoir sacré protège les plus vulnérables.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Bâtissez avec rigueur professionnelle tout en restant vigilant pour protéger ceux qui comptent sur vous.'
    },
    'story-esther-journey': {
      reference: 'Esther 4:14',
      translation: 'LSG',
      text: 'Et qui sait si ce n’est pas pour un temps comme celui-ci que tu es parvenue à la royauté?',
      plainEnglishSummary: 'Votre influence et vos privilèges ne vous ont pas été donnés pour votre seule sécurité, mais pour intervenir au moment décisif.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Ne restez pas silencieux par peur de compromettre votre confort. Prenez position courageuse pour la vérité.'
    },
    'story-ruth-journey': {
      reference: 'Ruth 1:16',
      translation: 'LSG',
      text: 'Ne me presse pas de te laisser, de retourner loin de toi! Où tu iras j’irai, où tu demeureras je demeurerai; ton peuple sera mon peuple, et ton Dieu sera mon Dieu.',
      plainEnglishSummary: 'La fidélité persévérante dans le dénuement déclenche une bénédiction divine qui traverse les générations entières.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Honorez vos engagements envers ceux qui traversent la détresse. Votre loyauté invisible a un écho éternel.'
    },
    'story-joshua-journey': {
      reference: 'Josué 1:9',
      translation: 'LSG',
      text: 'Ne t’ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t’effraie point et ne t’épouvante point, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.',
      plainEnglishSummary: 'Prendre la relève d’un grand bâtisseur est intimidant, mais la source de la victoire repose en Dieu et non sur les épaules d’un seul homme.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Saisissez vos responsabilités sans reculer. Votre autorité débute par le refus formel de vous décourager.'
    },
    'story-john-baptist-journey': {
      reference: 'Jean 3:30',
      translation: 'LSG',
      text: 'Il faut qu’il croisse, et que je diminue.',
      plainEnglishSummary: 'Le sommet de la grandeur spirituelle consiste à s’effacer volontairement afin que toute l’attention converge vers le Christ.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Rejetez la quête vaniteuse de reconnaissance aujourd’hui. Trouvez votre dignité à élever Jésus et à servir le prochain.'
    }
  }
};

// ============================================================================
// PROVERBS TACTICAL CODEX (10 PROVERBS)
// ============================================================================
export const LOCALIZED_PROVERB_VERSES: Record<'es' | 'fr', Record<string, LocalizedVerseData>> = {
  es: {
    'proverb-anger': {
      reference: 'Proverbios 15:1',
      translation: 'RVR1960',
      text: 'La blanda respuesta quita la ira; mas la palabra áspera hace subir el furor.',
      plainEnglishSummary: 'Bajar el volumen y hablar con calma desactiva la agresividad del otro. El fuego no se apaga arrojándole más gasolina.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Cuando te provoquen hoy, responde con tono firme pero pacífico. Toma el control desescalando la tensión.'
    },
    'proverb-debt': {
      reference: 'Proverbios 22:7',
      translation: 'RVR1960',
      text: 'El rico se enseñorea de los pobres, y el que toma prestado es siervo del que presta.',
      plainEnglishSummary: 'La deuda te pone grilletes financieros y limita tu libertad moral para obedecer a Dios sin miedo al acreedor.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Elimina los gastos superfluos y haz un plan agresivo para erradicar tus deudas. Recupera tu soberanía.'
    },
    'proverb-sluggard': {
      reference: 'Proverbios 6:6-8',
      translation: 'RVR1960',
      text: 'Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán, ni gobernador, ni señor, prepara en el verano su comida.',
      plainEnglishSummary: 'La hormiga no necesita un supervisor vigilándola para trabajar duro. La disciplina autónoma construye imperios silenciosos.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'No esperes a que te recuerden tus tareas. Inicia con energía la tarea más pesada del día antes de que te lo pidan.'
    },
    'proverb-flattery': {
      reference: 'Proverbios 27:6',
      translation: 'RVR1960',
      text: 'Fieles son las heridas del que ama; pero importunos los besos del que aborrece.',
      plainEnglishSummary: 'El verdadero hermano te dice verdades incómodas para salvarte. El adulador te endulza el oído mientras cavas tu propia tumba.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Agradece la crítica constructiva de quienes te aman de verdad y desconfía de los halagos vacíos.'
    },
    'proverb-speech': {
      reference: 'Proverbios 4:23',
      translation: 'RVR1960',
      text: 'Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.',
      plainEnglishSummary: 'Tu corazón es el centro de mando. Si dejas entrar veneno por tus ojos y oídos, tus decisiones se volverán corruptas.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Filtra lo que miras, escuchas y rumias hoy. Protege la pureza de tu mente como un centinela en la muralla.'
    },
    'proverb-counsel': {
      reference: 'Proverbios 11:14',
      translation: 'RVR1960',
      text: 'Donde no hay dirección sabia, caerá el pueblo; mas en la multitud de consejeros hay seguridad.',
      plainEnglishSummary: 'Tomar decisiones trascendentales en soledad es soberbia ciega. Los consejeros sabios detectan tus puntos ciegos.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Antes de firmar o comprometerte, consulta con dos mentores que teman a Dios y no teman contradecirte.'
    },
    'proverb-haste': {
      reference: 'Proverbios 18:13',
      translation: 'RVR1960',
      text: 'Al que responde palabra antes de oír, le es fatuidad y oprobio.',
      plainEnglishSummary: 'Interrumpir y asumir que sabes lo que el otro va a decir antes de escucharlo es pura arrogancia que engendra conflictos.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Escucha el doble de lo que hablas. Deja que la otra persona termine de exponer sus hechos antes de emitir juicio.'
    },
    'proverb-temper': {
      reference: 'Proverbios 29:11',
      translation: 'RVR1960',
      text: 'El necio da rienda suelta a toda su ira, mas el sabio al fin la sosiega.',
      plainEnglishSummary: 'Descargar tu furia sin filtro no te hace un líder fuerte; te convierte en un esclavo de tus pasiones momentáneas.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Cuando sientas que la rabia te domina el pecho, sal de la habitación y espera diez minutos antes de hablar.'
    },
    'proverb-pride': {
      reference: 'Proverbios 16:18',
      translation: 'RVR1960',
      text: 'Antes del quebrantamiento es la soberbia, y antes de la caída la altivez de espíritu.',
      plainEnglishSummary: 'La arrogancia es la anestesia que te impide sentir el abismo hacia donde estás caminando a toda prisa.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Examina tus áreas de complacencia hoy. Admite tus limitaciones antes de que la realidad te humille bruscamente.'
    },
    'proverb-trust': {
      reference: 'Proverbios 3:5-6',
      translation: 'RVR1960',
      text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
      plainEnglishSummary: 'Tu intelecto es una herramienta dada por Dios, pero un pésimo dios. Entrega el volante al Creador en tus decisiones.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Somete tus planes estratégicos a la voluntad de Dios en oración antes de dar el primer paso operativo.'
    }
  },
  fr: {
    'proverb-anger': {
      reference: 'Proverbes 15:1',
      translation: 'LSG',
      text: 'Une réponse douce calme la fureur, mais une parole dure excite la colère.',
      plainEnglishSummary: 'Baisser d’un ton désamorce l’agression adverse. On n’éteint pas un brasier en y versant de l’huile.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Face à une attaque verbale aujourd’hui, répondez avec calme et fermeté. Maîtrisez le terrain par votre retenue.'
    },
    'proverb-debt': {
      reference: 'Proverbes 22:7',
      translation: 'LSG',
      text: 'Le riche domine sur les pauvres, et celui qui emprunte est l’esclave de celui qui prête.',
      plainEnglishSummary: 'L’endettement crée des chaînes invisibles qui restreignent votre liberté de servir Dieu sans entrave financière.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Établissez une stratégie résolue pour rembourser vos dettes et regagner votre pleine liberté d’action.'
    },
    'proverb-sluggard': {
      reference: 'Proverbes 6:6-8',
      translation: 'LSG',
      text: 'Va vers la fourmi, paresseux; considère ses voies, et deviens sage. Elle n’a ni chef, ni inspecteur, ni maître; elle prépare en été sa nourriture.',
      plainEnglishSummary: 'La fourmi n’a pas besoin d’un supérieur pour se mettre au labeur. La rigueur autonome est le secret des bâtisseurs.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'N’attendez pas qu’on vous presse. Attaquez la tâche la plus exigeante de la journée dès les premières heures.'
    },
    'proverb-flattery': {
      reference: 'Proverbes 27:6',
      translation: 'LSG',
      text: 'Les blessures d’un ami prouvent sa fidélité, mais les baisers d’un ennemi sont trompeurs.',
      plainEnglishSummary: 'Le véritable ami ose vous faire mal pour votre bien en disant la vérité, tandis que le flatteur vous berce d’illusions mortelles.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Recherchez les conseils lucides et sincères de ceux qui vous aiment assez pour ne pas vous épargner la vérité.'
    },
    'proverb-speech': {
      reference: 'Proverbes 4:23',
      translation: 'LSG',
      text: 'Garde ton cœur plus que toute autre chose, car de lui jaillissent les sources de la vie.',
      plainEnglishSummary: 'Votre for intérieur est votre centre d’opérations. Si vous y laissez pénétrer des impuretés, toutes vos décisions en seront polluées.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Filtrez strictement vos lectures, vos regards et vos fréquentations. Montez la garde devant votre esprit.'
    },
    'proverb-counsel': {
      reference: 'Proverbes 11:14',
      translation: 'LSG',
      text: 'Quand la prudence fait défaut, le peuple tombe; et le salut est dans le grand nombre des conseillers.',
      plainEnglishSummary: 'Trancher seul sur des enjeux cruciaux est une témérité dangereuse. Les conseillers avisés révèlent vos angles morts.',
      category: 'Endurance & Brotherhood',
      keyTakeaway: 'Prenez l’avis de deux mentors intègres et éclairés avant tout engagement capital.'
    },
    'proverb-haste': {
      reference: 'Proverbes 18:13',
      translation: 'LSG',
      text: 'Celui qui répond avant d’avoir écouté fait un acte de folie et s’attire la confusion.',
      plainEnglishSummary: 'Couper la parole en présumant tout savoir avant la fin du récit est un signe manifeste d’orgueil stérile.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Écoutez avec attention totale. Laissez votre interlocuteur achever son exposé avant de formuler votre réponse.'
    },
    'proverb-temper': {
      reference: 'Proverbes 29:11',
      translation: 'LSG',
      text: 'L’insensé met en dehors toute sa passion, mais le sage la retient et l’apaise.',
      plainEnglishSummary: 'Déverser sans filtre sa fureur n’est pas une preuve d’autorité; c’est l’aveu d’une perte totale de contrôle de soi.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Quand l’énervement vous gagne, prenez du recul et attendez d’avoir retrouvé votre sang-froid avant d’intervenir.'
    },
    'proverb-pride': {
      reference: 'Proverbes 16:18',
      translation: 'LSG',
      text: 'L’arrogance précède la ruine, et l’orgueil précède la chute.',
      plainEnglishSummary: 'L’autosuffisance aveugle l’esprit juste avant l’effondrement. L’humilité lucide reste la meilleure des préventions.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Identifiez vos zones de suffisance et reconnaissez vos faiblesses avant que les circonstances ne vous y contraignent.'
    },
    'proverb-trust': {
      reference: 'Proverbes 3:5-6',
      translation: 'LSG',
      text: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.',
      plainEnglishSummary: 'Votre intelligence est un instrument béni mais un piètre guide suprême. Soumettez toutes vos démarches à la souveraineté divine.',
      category: 'Courage & Facing Giants',
      keyTakeaway: 'Présentez vos choix stratégiques au Seigneur dans la prière avant d’enclencher l’action.'
    }
  }
};

// ============================================================================
// PSALMS FIELD MEDIC (6 PRESCRIPTIONS)
// ============================================================================
export const LOCALIZED_PSALM_VERSES: Record<'es' | 'fr', Record<string, LocalizedVerseData>> = {
  es: {
    'psalm-panic': {
      reference: 'Salmos 27:1',
      translation: 'RVR1960',
      text: 'Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?',
      plainEnglishSummary: 'Cuando los muros parezcan caer sobre ti y las amenazas te cerquen, Dios sigue siendo tu ciudadela inexpugnable.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Declara la soberanía de Dios en voz alta sobre tus temores más oscuros. Su protección es real.'
    },
    'psalm-insomnia': {
      reference: 'Salmos 4:8',
      translation: 'RVR1960',
      text: 'En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado.',
      plainEnglishSummary: 'El insomnio se alimenta de la ilusión de que tienes que controlar el universo entero esta noche. Suelta el peso y descansa.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Apaga las pantallas, entrega tus cargas a Dios y déjale a Él la guardia nocturna.'
    },
    'psalm-betrayal': {
      reference: 'Salmos 55:12-14, 22',
      translation: 'RVR1960',
      text: 'Echa sobre Jehová tu carga, y él te sustentará; no dejará para siempre caído al justo.',
      plainEnglishSummary: 'La puñalada por la espalda de un allegado quema profundo, pero Dios es el juez justo que vindicará tu inocencia.',
      category: 'Restoration After Failure',
      keyTakeaway: 'No trames represalias en las sombras. Transfiere el caso al tribunal divino y mantén limpias tus manos.'
    },
    'psalm-guilt': {
      reference: 'Salmos 51:10, 17',
      translation: 'RVR1960',
      text: 'Crea en mí, oh Dios, un corazón limpio, y renueva un espíritu recto dentro de mí... Al corazón contrito y humillado no despreciarás tú, oh Dios.',
      plainEnglishSummary: 'Cuando el error sea completamente tuyo, no te justifiques con excusas baratas. Acércate con arrepentimiento honesto.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Confiesa tu falta sin adornos. La misericordia de Dios reconstruye sobre la verdad desnuda.'
    },
    'psalm-rage': {
      reference: 'Salmos 37:1-3, 7-8',
      translation: 'RVR1960',
      text: 'No te impacientes a causa de los malignos... Guarda silencio ante Jehová, y espera en él; no te alteres con motivo del que prospera en su camino.',
      plainEnglishSummary: 'Ver a los tramposos triunfar temporalmente enciende la indignación, pero su éxito es humo que el viento dispersará.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Apacigua tu furor. No te rebajes a sus métodos sucios; tu recompensa viene de Dios.'
    },
    'psalm-grief': {
      reference: 'Salmos 42:5, 11',
      translation: 'RVR1960',
      text: '¿Por qué te abates, oh alma mía, y por qué te turbas dentro de mí? Espera en Dios; porque aún he de alabarle, salvación mía y Dios mío.',
      plainEnglishSummary: 'El dolor y el agotamiento no significan que Dios te haya abandonado. Es un valle amargo, pero no tu destino final.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Predícale a tu propia alma en los días grises. La noche pasará y la alabanza volverá.'
    }
  },
  fr: {
    'psalm-panic': {
      reference: 'Psaume 27:1',
      translation: 'LSG',
      text: 'L’Éternel est ma lumière et mon salut: de qui aurais-je crainte? L’Éternel est le soutien de ma vie: de qui aurais-je peur?',
      plainEnglishSummary: 'Même si l’adversité vous encercle et que la panique tente d’assiéger votre esprit, le Seigneur demeure votre forteresse imprenable.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Proclamez haut et fort la protection souveraine de Dieu sur vos angoisses actuelles.'
    },
    'psalm-insomnia': {
      reference: 'Psaume 4:8',
      translation: 'LSG',
      text: 'Je me couche et je m’endors en paix, car toi seul, ô Éternel! tu me donnes la sécurité dans ma demeure.',
      plainEnglishSummary: 'L’insomnie prospère quand on s’obstine à vouloir porter le monde sur ses épaules en pleine nuit. Laissez Dieu veiller et reposez-vous.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Éteignez toute distraction, remettez vos fardeaux au Seigneur et trouvez le repos dans Sa garde bienveillante.'
    },
    'psalm-betrayal': {
      reference: 'Psaume 55:12-14, 22',
      translation: 'LSG',
      text: 'Remets ton sort à l’Éternel, et il te soutiendra, il ne laissera jamais chanceler le juste.',
      plainEnglishSummary: 'La trahison d’un proche blesse cruellement, mais Dieu est le garant suprême de votre intégrité.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Résistez à l’amertume et à la rancœur. Déposez votre cause entre les mains divines en gardant les mains pures.'
    },
    'psalm-guilt': {
      reference: 'Psaume 51:10, 17',
      translation: 'LSG',
      text: 'Ô Dieu! crée en moi un cœur pur, renouvelle en moi un esprit bien disposé... Le cœur brisé et contrit, ô Dieu! tu ne le dédaignes pas.',
      plainEnglishSummary: 'Quand la faute vous incombe pleinement, évitez les vaines justifications. Présentez un cœur brisé et sincère.',
      category: 'Restoration After Failure',
      keyTakeaway: 'Confessez vos torts avec lucidité. Le pardon de Dieu restaure avec une puissance inespérée.'
    },
    'psalm-rage': {
      reference: 'Psaume 37:1-3, 7-8',
      translation: 'LSG',
      text: 'Ne t’irrite pas contre les méchants... Garde le silence devant l’Éternel, et espère en lui; ne t’irrite pas contre celui qui réussit dans ses voies.',
      plainEnglishSummary: 'La réussite éphémère des malhonnêtes suscite l’indignation, mais leur gloire n’est qu’une brume passagère.',
      category: 'Anger & Self-Control',
      keyTakeaway: 'Désamorcez votre colère. Ne cédez pas à la tentation des représailles indignes; votre justice vient du Seigneur.'
    },
    'psalm-grief': {
      reference: 'Psaume 42:5, 11',
      translation: 'LSG',
      text: 'Pourquoi t’abats-tu, mon âme, et gémis-tu au dedans de moi? Espère en Dieu, car je le louerai encore; il est mon salut et mon Dieu.',
      plainEnglishSummary: 'La tristesse profonde ne signifie nullement l’éloignement de Dieu. Cette vallée d’ombre n’est pas votre demeure définitive.',
      category: 'Pressure & Anxiety',
      keyTakeaway: 'Exhortez votre propre cœur dans les jours sombres. L’espérance en Dieu ranimera bientôt vos chants de délivrance.'
    }
  }
};

// ============================================================================
// REAL LIFE DILEMMAS (10 DILEMMAS)
// ============================================================================
export const LOCALIZED_DILEMMAS: Record<'es' | 'fr', Record<string, LocalizedDilemmaData>> = {
  es: {
    'dilemma-credit-thief': {
      reference: 'Génesis 41:38-39 y Proverbios 22:29',
      text: '¿Has visto hombre solícito en su trabajo? Delante de los reyes estará; no estará delante de los de baja condición.',
      streetMeaning: 'La excelencia, la maestría y la constancia hablan con más contundencia que los reclamos airados en el pasillo. Deja que los resultados revelen quién construyó realmente el motor.'
    },
    'dilemma-burnout': {
      reference: '1 Reyes 19:5-8 y Mateo 11:28',
      text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
      streetMeaning: 'El descanso no es pereza ni deserción; es mantenimiento táctico indispensable de la armadura. Dios envió pan y sueño reparador a Elías antes de confiarle cualquier nueva misión.'
    },
    'dilemma-family-conflict': {
      reference: 'Génesis 45:4-8 y Colosenses 3:13',
      text: 'Soportándoos con paciencia los unos a los otros, y perdonándoos unos a otros si alguno tuviere queja contra otro.',
      streetMeaning: 'El perdón no anula los límites sanos ni finge amnesia, pero corta de raíz la cadena tóxica del resentimiento generacional.'
    },
    'dilemma-unethical-boss': {
      reference: 'Daniel 3:16-18 y Hechos 5:29',
      text: 'Es menester obedecer a Dios antes que a los hombres.',
      streetMeaning: 'La integridad no está en venta. Jamás comprometas tu conciencia moral por complacer órdenes fraudulentas de un superior.'
    },
    'dilemma-whistleblower': {
      reference: 'Proverbios 28:1 y Efesios 5:11',
      text: 'Y no participéis en las obras infructuosas de las tinieblas, sino más bien reprendedlas.',
      streetMeaning: 'El silencio cómplice también corrompe. La verdadera valentía exige exponer las irregularidades con pruebas sobrias y sin histeria.'
    },
    'dilemma-friend-betrayal': {
      reference: 'Salmos 41:9 y Romanos 12:19-21',
      text: 'No os venguéis vosotros mismos, amados míos... No seas vencido de lo malo, sino vence con el bien el mal.',
      streetMeaning: 'La venganza te encadena a quien te lastimó. Deja el veredicto en manos de Dios y continúa tu camino con la conciencia limpia.'
    },
    'dilemma-job-loss': {
      reference: 'Habacuc 3:17-19 y Romanos 8:28',
      text: 'Aunque la higuera no florezca... con todo, yo me alegraré en Jehová, y me gozaré en el Dios de mi salvación.',
      streetMeaning: 'Tu dignidad no depende de un puesto ni de una nómina corporativa. La fuente de tu sustento es el Dios vivo.'
    },
    'dilemma-envy-promotion': {
      reference: '1 Samuel 18:8-9 y Santiago 3:16',
      text: 'Porque donde hay celos y contención, allí hay perturbación y toda obra perversa.',
      streetMeaning: 'La envidia es un veneno que tomas tú esperando que muera el otro. Concéntrate en tu propia misión y celebra el avance ajeno.'
    },
    'dilemma-parental-pressure': {
      reference: 'Mateo 10:37 y Proverbios 3:5-6',
      text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.',
      streetMeaning: 'Honrar a tus padres no significa abdicar del llamado único que Dios plantó en tu alma por satisfacer expectativas ajenas.'
    },
    'dilemma-moral-compromise': {
      reference: 'Génesis 39:9 y 1 Corintios 10:13',
      text: '¿Cómo, pues, haría yo este grande mal, y pecaría contra Dios?',
      streetMeaning: 'Corre como José. Frente a la trampa moral armada ante ti, no te detengas a dialogar ni a negociar: sal de ahí de inmediato.'
    }
  },
  fr: {
    'dilemma-credit-thief': {
      reference: 'Genèse 41:38-39 & Proverbes 22:29',
      text: 'Si tu vois un homme habile dans son ouvrage, il se tient auprès des rois; il ne se tient pas auprès de gens obscurs.',
      streetMeaning: 'La compétence incontestable et les faits ont bien plus de poids que les récriminations de couloir. Laissez le temps prouver qui maîtrise les dossiers.'
    },
    'dilemma-burnout': {
      reference: '1 Rois 19:5-8 & Matthieu 11:28',
      text: 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.',
      streetMeaning: 'Le repos n’est ni de la paresse ni une faiblesse; c’est un entretien tactique vital de votre armure. Dieu a d’abord accordé du sommeil et un repas fortifiant à Élie.'
    },
    'dilemma-family-conflict': {
      reference: 'Genèse 45:4-8 & Colossiens 3:13',
      text: 'Supportez-vous les uns les autres, et, si l’un a sujet de se plaindre de l’autre, pardonnez-vous réciproquement.',
      streetMeaning: 'Pardonner n’abolit pas la prudence ni les limites salutaires, mais cela brise net la chaîne toxique de la rancune familiale.'
    },
    'dilemma-unethical-boss': {
      reference: 'Daniel 3:16-18 & Actes 5:29',
      text: 'Il faut obéir à Dieu plutôt qu’aux hommes.',
      streetMeaning: 'L’intégrité morale ne se marchande jamais. Ne transigez pas avec votre conscience pour complaire aux injonctions douteuses d’un dirigeant.'
    },
    'dilemma-whistleblower': {
      reference: 'Proverbes 28:1 & Éphésiens 5:11',
      text: 'Et ne prenez point part aux œuvres infructueuses des ténèbres, mais plutôt condamnez-les.',
      streetMeaning: 'Le silence complice nourrit la dérive. Le courage exige de dénoncer les malversations avec des preuves solides et un calme rigoureux.'
    },
    'dilemma-friend-betrayal': {
      reference: 'Psaume 41:9 & Romains 12:19-21',
      text: 'Ne vous vengez point vous-mêmes, bien-aimés... Ne te laisse pas surmonter par le mal, mais surmonte le mal par le bien.',
      streetMeaning: 'La vengeance vous attache à votre agresseur. Laissez le verdict entre les mains de Dieu et avancez le cœur libre.'
    },
    'dilemma-job-loss': {
      reference: 'Habacuc 3:17-19 & Romains 8:28',
      text: 'Car le figuier ne fleurira pas... Toutefois, je veux me réjouir en l’Éternel, je veux me réjouir dans le Dieu de mon salut.',
      streetMeaning: 'Votre dignité ne réside pas dans un intitulé de poste ou une fiche de paie. Votre véritable sécurité repose en Dieu.'
    },
    'dilemma-envy-promotion': {
      reference: '1 Samuel 18:8-9 & Jacques 3:16',
      text: 'Car là où il y a un zèle amer et un esprit de dispute, il y a du désordre et toutes sortes de mauvaises actions.',
      streetMeaning: 'La jalousie est un poison destructeur. Consacrez votre énergie à votre propre appel et réjouissez-vous du succès de vos pairs.'
    },
    'dilemma-parental-pressure': {
      reference: 'Matthieu 10:37 & Proverbes 3:5-6',
      text: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse.',
      streetMeaning: 'Honorer ses parents n’exige pas de sacrifier la vocation que Dieu a déposée en vous au profit de conformismes extérieurs.'
    },
    'dilemma-moral-compromise': {
      reference: 'Genèse 39:9 & 1 Corinthiens 10:13',
      text: 'Comment ferais-je un aussi grand mal et pécherais-je contre Dieu?',
      streetMeaning: 'Fuyez sans hésiter comme Joseph. Face au piège tendu, ne discutez pas, ne tergiversez pas: partez sur-le-champ.'
    }
  }
};

// ============================================================================
// CANON BOOKS NAMES & DIVISIONS
// ============================================================================

/**
 * Converts a canon book id (e.g. 'canon-genesis') to the localization key
 * (e.g. 'ot-genesis') used in LOCALIZED_CANON_BOOK_DATA.
 */
const OT_BOOKS = new Set([
  'genesis','exodus','leviticus','numbers','deuteronomy',
  'joshua','judges','ruth','1samuel','2samuel','1kings','2kings',
  '1chronicles','2chronicles','ezra','nehemiah','esther','job',
  'psalms','proverbs','ecclesiastes','songofsolomon','isaiah',
  'jeremiah','lamentations','ezekiel','daniel','hosea','joel',
  'amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah',
  'haggai','zechariah','malachi'
]);

function canonIdToLocKey(canonId: string): string {
  // canonId is like 'canon-genesis', 'canon-1samuel', etc.
  const slug = canonId.replace(/^canon-/, '');
  const prefix = OT_BOOKS.has(slug) ? 'ot' : 'nt';
  return `${prefix}-${slug}`;
}

export const LOCALIZED_CANON_BOOK_DATA: Record<'es' | 'fr', Record<string, {
  name: string;
  codename: string;
  subtitle: string;
  division: string;
  lifeTheme: string;
  whyItMattersMonday?: string;
  anchorReference: string;
  canonicalText: string;
  streetTranslation: string;
  takeaway: string;
}>> = {
  es: {
    'ot-genesis': {
      name: 'Génesis',
      codename: 'Orígenes y Dinastías Rotas',
      subtitle: 'Desde la creación del cosmos hasta el trauma familiar profundo y la resiliencia',
      division: 'Torah & Orígenes',
      lifeTheme: 'Family & Conflict Resolution',
      whyItMattersMonday: 'Las familias en Génesis son profundamente imperfectas — celos entre hermanos, favoritismo y traición. Sin embargo, Dios reorienta el fracaso humano en propósito generacional.',
      anchorReference: 'Génesis 50:20',
      canonicalText: 'Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien, para hacer lo que vemos hoy, para mantener en vida a mucho pueblo.',
      streetTranslation: 'La traición humana jamás descarrilará los planes de Dios. La fosa y la prisión fueron los escalones para salvar a una nación.',
      takeaway: 'Deja de obsesionarte con quien te traicionó. Concéntrate en cómo Dios está usando el arma formada contra ti como tu palanca.'
    },
    'ot-exodus': {
      name: 'Éxodo',
      codename: 'La Gran Fuga',
      subtitle: 'Derribar a una superpotencia imperial con un pastor desarmado',
      division: 'Torah & Orígenes',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Cuando estás atrapado contra un muro imposible, el pánico es un reflejo natural. El Éxodo enseña que mantenerse quieto y confiar en el mandato de Dios supera a los esfuerzos frenéticos.',
      anchorReference: 'Éxodo 14:14',
      canonicalText: 'Jehová peleará por vosotros, y vosotros estaréis tranquilos.',
      streetTranslation: 'Baja tu ritmo cardíaco. El Comandante del cielo tiene la línea del frente; tu trabajo es mantener la boca cerrada y tu posición.',
      takeaway: 'Silencia el ruido mental. Antes de enviar ese correo frenético, haz pausa y deja que Dios pelee la batalla.'
    },
    'ot-leviticus': {
      name: 'Levítico',
      codename: 'El Protocolo de Alto Voltaje',
      subtitle: 'Sobrevivir en proximidad a la santidad bruta y sin diluir',
      division: 'Torah & Orígenes',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'El Levítico no es legalismo aburrido — es un manual de aislamiento biohazard y moral que muestra que la verdadera integridad requiere establecer límites claros y sólidos en un mundo desordenado.',
      anchorReference: 'Levítico 19:18',
      canonicalText: 'No te vengarás, ni guardarás rencor a los hijos de tu pueblo, sino que amarás a tu prójimo como a ti mismo.',
      streetTranslation: 'Corta la fantasía de venganza. Guardar rencor es beber veneno esperando que el otro muera.',
      takeaway: 'Cancela el registro mental de agravios que has estado cargando contra ese compañero de trabajo o familiar.'
    },
    'ot-numbers': {
      name: 'Números',
      codename: 'Las Arenas Movedizas del Desierto',
      subtitle: 'Cómo un viaje de 11 días se convirtió en una prisión mental de 40 años',
      division: 'Torah & Orígenes',
      lifeTheme: 'Anxiety & Fear',
      whyItMattersMonday: 'La queja y el miedo son contagiosos. Cuando te concentras en los "gigantes" en lugar de tu objetivo, darás vueltas en círculos por años.',
      anchorReference: 'Números 14:9',
      canonicalText: 'Por tanto, no seáis rebeldes contra Jehová, ni temáis al pueblo de esta tierra; porque nosotros los comeremos como pan. Su amparo se ha apartado de ellos, y con nosotros está Jehová.',
      streetTranslation: 'Deja de temblar. Esos obstáculos intimidantes solo son nuestro desayuno. Su armadura es hueca; nuestro Dios es real.',
      takeaway: 'Reencuadra tu mayor obstáculo actual como nutrición para tu crecimiento espiritual.'
    },
    'ot-deuteronomy': {
      name: 'Deuteronomio',
      codename: 'El Último Briefing',
      subtitle: 'El discurso de despedida de Moisés antes de cruzar las líneas del Jordán',
      division: 'Torah & Orígenes',
      lifeTheme: 'Action Over Cheap Talk',
      whyItMattersMonday: 'La comodidad engendra amnesia. Cuando tu negocio prospera y tus cuentas están pagadas, ese es el momento de mayor peligro de pensar que tu propia astucia lo hizo.',
      anchorReference: 'Deuteronomio 8:17-18',
      canonicalText: 'No digas en tu corazón: Mi poder y la fuerza de mi mano me han traído esta riqueza. Acuérdate de Jehová tu Dios, porque él te da el poder para hacer riquezas.',
      streetTranslation: 'No te engañes pensando que tu puro esfuerzo consiguió esta fortuna. Recuerda quién te dio el aliento y el cerebro para construirla.',
      takeaway: 'Ancla tu ego hoy. Atribuye tus victorias al Dios que te dio la capacidad de ejecutar.'
    },
    'ot-joshua': {
      name: 'Josué',
      codename: 'La Invasión de la Cabeza de Playa',
      subtitle: 'Asumir el liderazgo después de que tu mentor muere',
      division: 'Guerra & Crónicas',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'El coraje no es la ausencia de miedo — es avanzar mientras tus rodillas tiemblan porque sabes quién ordenó la carga.',
      anchorReference: 'Josué 1:9',
      canonicalText: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      streetTranslation: 'Endereza tu espalda. Sin titubear, sin segundas dudas. No estás entrando a esa sala solo.',
      takeaway: 'Enfrenta la confrontación más difícil de hoy con la cabeza en alto.'
    },
    'ot-ruth': {
      name: 'Rut',
      codename: 'El Contrato de Lealtad',
      subtitle: 'Lealtad silenciosa y dignidad en las ruinas del hambre y la viudez',
      division: 'Guerra & Crónicas',
      lifeTheme: 'Family & Conflict Resolution',
      whyItMattersMonday: 'Sin milagros llamativos, solo trabajo arduo y lealtad radical. La decisión de Rut de quedarse junto a la amargada Noemí remodela la historia y da origen a un linaje real.',
      anchorReference: 'Rut 1:16',
      canonicalText: 'No me ruegues que te deje, y me aparte de ti; porque a dondequiera que tú fueres, iré yo, y dondequiera que vivieres, viviré. Tu pueblo será mi pueblo, y tu Dios mi Dios.',
      streetTranslation: 'Deja de tratar de deshacerte de mí. Donde tú sangras, yo sangro. Estoy contigo hasta que la tierra nos cubra.',
      takeaway: 'Demuestra tu lealtad a alguien que atraviesa una temporada oscura cuando todos los demás se han ido.'
    },
    'ot-1samuel': {
      name: '1 Samuel',
      codename: 'El Pastor & El Tirano',
      subtitle: 'El ascenso de David y el colapso mental del rey Saúl',
      division: 'Guerra & Crónicas',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Saúl cayó porque le importaba más la imagen pública que la obediencia secreta. David ascendió porque tenía un corazón auténtico y sin armadura.',
      anchorReference: '1 Samuel 16:7',
      canonicalText: 'Jehová no mira lo que mira el hombre; pues el hombre mira lo que está delante de sus ojos, pero Jehová mira el corazón.',
      streetTranslation: 'La gente te juzga por tu traje, tu título y tus métricas. Dios escanea tus motivos secretos y tu columna vertebral interna.',
      takeaway: 'Invierte más tiempo calibrando tu integridad privada que cultivando tu marca pública.'
    },
    'ot-psalms': {
      name: 'Salmos',
      codename: 'El Triage del Medico de Campo',
      subtitle: 'Canciones de batalla y triage emocional bruto de reyes perseguidos y poetas',
      division: 'Sabiduría & Triage del Alma',
      lifeTheme: 'Anxiety & Fear',
      whyItMattersMonday: 'La sala de emergencias emocional de la Biblia. Te da permiso de traer ira, pánico, culpa y lágrimas directamente ante Dios sin filtrar.',
      anchorReference: 'Salmos 46:1',
      canonicalText: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.',
      streetTranslation: 'Dios es nuestro búnker y nuestro blindaje — una unidad de apoyo activa ya de pie junto a ti en la batalla.',
      takeaway: 'Corre a Dios como tu primer refugio en lugar de adormecerte con pantallas o comida.'
    },
    'ot-proverbs': {
      name: 'Proverbios',
      codename: 'El Códice Táctico',
      subtitle: 'El manual callejero del rey Salomón para los negocios, el habla y los límites',
      division: 'Sabiduría & Triage del Alma',
      lifeTheme: 'Workplace & Career Pressure',
      whyItMattersMonday: 'Inteligencia práctica de alto nivel para el dinero, las reuniones, el manejo de la ira e identificar aliados tóxicos antes de que arruinen tu carrera.',
      anchorReference: 'Proverbios 4:23',
      canonicalText: 'Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.',
      streetTranslation: 'Posta centinelas armados en las puertas de tu mente. Todo tu futuro depende de lo que permites entrar.',
      takeaway: 'Audita lo que miraste y escuchaste esta mañana. Limpia la basura mental.'
    },
    'ot-isaiah': {
      name: 'Isaías',
      codename: 'El Profeta del Trono',
      subtitle: 'Advertencias geopolíticas, el Siervo Sufriente y visiones de nueva creación',
      division: 'Red de Inteligencia Profética',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Contiene el anticipo más claro de Jesucristo 700 años antes de Su nacimiento, junto con promesas sólidas para los que se sienten agotados.',
      anchorReference: 'Isaías 40:31',
      canonicalText: 'Los que esperan en Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
      streetTranslation: 'Los que fijan sus ojos en el Señor cambiarán sus baterías drenadas por energía divina. Correrás y no golpearás el muro.',
      takeaway: 'Cambia tu esfuerzo agotado por espera paciente en la presencia de Dios.'
    },
    'ot-jeremiah': {
      name: 'Jeremías',
      codename: 'El Pilar de Hierro',
      subtitle: 'Hablar verdades impopulares a una sociedad en colapso mientras estás en un pozo',
      division: 'Red de Inteligencia Profética',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'Cuando tus colegas o cultura derivan hacia la locura, mantener la línea te hará impopular. Jeremías te enseña a mantenerte como un pilar de hierro.',
      anchorReference: 'Jeremías 29:11',
      canonicalText: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      streetTranslation: 'Dicho no a turistas cómodos, sino a cautivos en Babilonia: Aún tengo el plano maestro para tu supervivencia y tu futuro.',
      takeaway: 'Recuerda que incluso en temporada de exilio, el plano maestro de Dios sigue activo.'
    },
    'ot-daniel': {
      name: 'Daniel',
      codename: 'Encubierto en Babilonia',
      subtitle: 'Prosperar en los pasillos de élite paganos sin perder tu columna vertebral moral',
      division: 'Red de Inteligencia Profética',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'El manual principal para profesionales cristianos navegando la política corporativa secular. Daniel sobrevivió a cuatro reyes paganos gracias a una competencia inigualable y una oración silenciosa.',
      anchorReference: 'Daniel 3:17-18',
      canonicalText: 'He aquí nuestro Dios a quien servimos puede librarnos del horno de fuego ardiendo... Y si no, sepas, oh rey, que no serviremos a tus dioses.',
      streetTranslation: 'Nuestro Dios puede sacarnos de tu horno. Pero aunque no lo haga, nunca nos inclinaremos ante tu estatua de oro.',
      takeaway: 'Traza tu línea en la arena antes de que llegue la presión. Decide qué nunca comprometerás.'
    },
    'nt-matthew': {
      name: 'Mateo',
      codename: 'El Manifiesto del Rey',
      subtitle: 'La revolución contracultural de Jesús y la explosiva iglesia primitiva',
      division: 'El Manifiesto del Rey',
      lifeTheme: 'Action Over Cheap Talk',
      whyItMattersMonday: 'Mateo presenta a Jesús como el Rey esperado, cuyos enseñanzas invierten los valores del mundo y exigen obediencia concreta, no fe de fachada.',
      anchorReference: 'Mateo 6:33',
      canonicalText: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.',
      streetTranslation: 'Alinea tus prioridades con el Reino y deja de angustiarte por las añadiduras materiales.',
      takeaway: 'Pon lo primero en primer lugar hoy: justicia, rectitud y fidelidad a Cristo.'
    },
    'nt-john': {
      name: 'Juan',
      codename: 'Luz en las Tinieblas',
      subtitle: 'La divinidad hecha carne',
      division: 'El Manifiesto del Rey',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Juan revela la identidad divina de Jesús a través de siete señales poderosas y siete declaraciones "Yo soy", mostrando que Él es la luz en las tinieblas más profundas.',
      anchorReference: 'Juan 1:14',
      canonicalText: 'Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.',
      streetTranslation: 'Dios no se quedó en una torre lejana observando el dolor; se metió en el lodo con nosotros lleno de gracia.',
      takeaway: 'Acércate a Cristo sin miedo: Él conoce tus luchas de primera mano.'
    },
    'nt-romans': {
      name: 'Romanos',
      codename: 'La Constitución de la Gracia',
      subtitle: 'Doctrina de acero y vida victoriosa',
      division: 'Despachos de Campo',
      lifeTheme: 'Burnout & Meaning',
      whyItMattersMonday: 'Romanos es la carta más completa de la gracia en toda la Biblia — mostrando por qué incluso los mejores esfuerzos humanos no bastan, y cómo la fe lo transforma todo.',
      anchorReference: 'Romanos 8:31',
      canonicalText: '¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?',
      streetTranslation: 'Si el Creador del universo está de tu lado, ninguna oposición terrenal tiene la última palabra.',
      takeaway: 'Ponte de pie con confianza renovada: ningún enemigo prevalecerá contra el plan divino.'
    },
    'nt-revelation': {
      name: 'Apocalipsis',
      codename: 'El Desenlace Cósmico',
      subtitle: 'Guerra cósmica, la caída del imperio y esperanza inquebrantable en la victoria',
      division: 'El Desenlace Cósmico',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Guerra cósmica, caída del imperio y esperanza inquebrantable en la victoria. El Cordero triunfa — y quienes perseveren reinarán con Él.',
      anchorReference: 'Apocalipsis 21:4',
      canonicalText: 'Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor.',
      streetTranslation: 'El mal, el luto y el dolor tienen fecha de caducidad fijada por el Rey invicto.',
      takeaway: 'Persevera hoy sabiendo con total certeza cómo termina la historia: el Cordero vence.'
    }
  },
  fr: {
    'ot-genesis': {
      name: 'Gen\u00e8se',
      codename: 'Origines et Dynasties Bris\u00e9es',
      subtitle: 'De la cr\u00e9ation du cosmos au traumatisme familial profond et \u00e0 la r\u00e9silience',
      division: 'Torah & Origines',
      lifeTheme: 'Family & Conflict Resolution',
      whyItMattersMonday: 'Les familles de la Gen\u00e8se sont profond\u00e9ment imparfaites \u2014 jalousie, favoritisme, trahison. Pourtant, Dieu retourne les \u00e9checs humains en destin g\u00e9n\u00e9rationnel.',
      anchorReference: 'Gen\u00e8se 50:20',
      canonicalText: 'Vous aviez m\u00e9dit\u00e9 de me faire du mal\u00a0: Dieu l\u2019a chang\u00e9 en bien, de mani\u00e8re \u00e0 accomplir ce qui arrive aujourd\u2019hui, pour sauver la vie \u00e0 un peuple nombreux.',
      streetTranslation: 'La perfidie humaine ne peut an\u00e9antir le dessein de Dieu. La trahison fut l\u2019escalier secret du salut.',
      takeaway: 'Gardez confiance\u00a0: Dieu r\u00e9oriente vos \u00e9preuves les plus rudes pour accomplir un bien durable.'
    },
    'ot-exodus': {
      name: 'Exode',
      codename: 'La Grande \u00c9vasion',
      subtitle: 'Renverser une superpuissance imp\u00e9riale avec un berger d\u00e9sarm\u00e9',
      division: 'Torah & Origines',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Face \u00e0 un mur impossible, la panique est un r\u00e9flexe naturel. L\u2019Exode enseigne que rester immobile et faire confiance au commandement divin surpasse l\u2019agitation fr\u00e9n\u00e9tique.',
      anchorReference: 'Exode 14:14',
      canonicalText: 'L\u2019\u00c9ternel combattra pour vous\u00a0; et vous, gardez le silence.',
      streetTranslation: 'Face \u00e0 l\u2019impasse de la mer Rouge et aux arm\u00e9es ennemies, la s\u00e9r\u00e9nit\u00e9 confiante reste votre meilleure arme.',
      takeaway: 'Refusez la panique st\u00e9rile. Laissez Dieu d\u00e9ployer Sa puissance l\u00e0 o\u00f9 vos forces s\u2019arr\u00eatent.'
    },
    'ot-leviticus': {
      name: 'L\u00e9vitique',
      codename: 'Le Protocole Haute Tension',
      subtitle: 'Survivre en pr\u00e9sence d\u2019une saintet\u00e9 brute et non dilu\u00e9e',
      division: 'Torah & Origines',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'Le L\u00e9vitique n\u2019est pas du l\u00e9galisme ennuyeux \u2014 c\u2019est un manuel de d\u00e9contamination morale montrant que l\u2019int\u00e9grit\u00e9 exige des limites nettes dans un monde trouble.',
      anchorReference: 'L\u00e9vitique 19:18',
      canonicalText: 'Tu ne te vengeras pas et tu ne garderas pas de rancune envers les enfants de ton peuple. Tu aimeras ton prochain comme toi-m\u00eame.',
      streetTranslation: 'Abandonnez le fantasme de vengeance. Nourrir une rancune, c\u2019est boire du poison en esp\u00e9rant que l\u2019autre en meure.',
      takeaway: 'Annulez le registre mental des griefs que vous portez contre ce coll\u00e8gue ou ce proche.'
    },
    'ot-numbers': {
      name: 'Nombres',
      codename: 'Le Sable Mouvant du D\u00e9sert',
      subtitle: 'Comment un voyage de 11 jours est devenu une prison mentale de 40 ans',
      division: 'Torah & Origines',
      lifeTheme: 'Anxiety & Fear',
      whyItMattersMonday: 'La plainte et la peur sont contagieuses. Se concentrer sur les \u00ab\u00a0g\u00e9ants\u00a0\u00bb plut\u00f4t que sur l\u2019objectif vous fait tourner en rond pendant des ann\u00e9es.',
      anchorReference: 'Nombres 14:9',
      canonicalText: 'Ne vous r\u00e9voltez point contre l\u2019\u00c9ternel, et ne craignez point le peuple de ce pays\u00a0; car il sera notre proie. Leur protection s\u2019est \u00e9loign\u00e9e d\u2019eux, et l\u2019\u00c9ternel est avec nous.',
      streetTranslation: 'Cessez de trembler. Ces obstacles intimidants ne sont que notre repas du matin. Leur armure est creuse\u00a0; notre Dieu est r\u00e9el.',
      takeaway: 'Recadrez votre plus grand obstacle actuel comme une \u00e9tape de votre croissance spirituelle.'
    },
    'ot-deuteronomy': {
      name: 'Deut\u00e9ronome',
      codename: 'Le Dernier Briefing',
      subtitle: 'Discours d\u2019adieu de Mo\u00efse avant de franchir le Jourdain',
      division: 'Torah & Origines',
      lifeTheme: 'Action Over Cheap Talk',
      whyItMattersMonday: 'Le confort engen\u00e8re l\u2019amn\u00e9sie. Quand les affaires prosp\u00e8rent, c\u2019est le moment le plus dangereux pour croire que c\u2019est votre propre intelligence qui a tout fait.',
      anchorReference: 'Deut\u00e9ronome 8:17-18',
      canonicalText: 'Prends garde de ne pas dire dans ton c\u0153ur\u00a0: \u00ab\u00a0C\u2019est ma force et la puissance de ma main qui m\u2019ont acquis ces richesses.\u00a0\u00bb Souviens-toi de l\u2019\u00c9ternel, ton Dieu, car c\u2019est lui qui te donne la force de faire des exploits.',
      streetTranslation: 'Ne vous leurrez pas en pensant que votre seule ambition vous a apport\u00e9 ce succ\u00e8s. Rappelez-vous qui vous a donn\u00e9 le souffle et la capacit\u00e9 de le construire.',
      takeaway: 'Ancrez votre ego\u00a0: attribuez vos victoires \u00e0 Dieu qui vous a donn\u00e9 la capacit\u00e9 d\u2019agir.'
    },
    'ot-joshua': {
      name: 'Josu\u00e9',
      codename: 'L\u2019Invasion de la T\u00eate de Pont',
      subtitle: 'Prendre la t\u00eate apr\u00e8s la mort de votre mentor',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Le courage n\u2019est pas l\u2019absence de peur \u2014 c\u2019est avancer avec les genoux qui tremblent parce que vous savez qui a donn\u00e9 l\u2019ordre d\u2019avancer.',
      anchorReference: 'Josu\u00e9 1:9',
      canonicalText: 'Ne t\u2019ai-je pas donn\u00e9 cet ordre\u00a0: Fortifie-toi et prends courage\u00a0? Ne t\u2019effraie point et ne t\u2019\u00e9pouvante point, car l\u2019\u00c9ternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.',
      streetTranslation: 'Redressez le dos. Pas de recul, pas de remise en question. Vous n\u2019entrez pas dans cette salle seul.',
      takeaway: 'Abordez la confrontation la plus difficile d\u2019aujourd\u2019hui la t\u00eate haute.'
    },
    'ot-judges': {
      name: 'Juges',
      codename: 'La R\u00e9sistance des Rebelles',
      subtitle: 'Des champions imparfaits luttant contre l\u2019anarchie et la d\u00e9cadence morale',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'Dieu se sert de personnes profond\u00e9ment imparfaites (G\u00e9d\u00e9on cach\u00e9 dans un pressoir, Samson luttant contre la luxure) pour briser une oppression syst\u00e9mique.',
      anchorReference: 'Juges 6:14',
      canonicalText: 'L\u2019\u00c9ternel se tourna vers lui et dit\u00a0: Va avec cette force que tu as, et tu d\u00e9livreras Isra\u00ebl de la main de Madian\u00a0; n\u2019est-ce pas moi qui t\u2019envoie\u00a0?',
      streetTranslation: 'Cessez de vous lamenter sur vos origines modestes. Avancez avec la force brute que vous avez maintenant \u2014 c\u2019est moi qui vous soutiens.',
      takeaway: 'Cessez d\u2019attendre de vous sentir pleinement qualifi\u00e9. Agissez d\u00e8s maintenant avec ce que vous avez.'
    },
    'ot-ruth': {
      name: 'Ruth',
      codename: 'Le Contrat de Loyaut\u00e9',
      subtitle: 'Loyaut\u00e9 silencieuse et dignit\u00e9 dans les ruines de la famine et du veuvage',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Family & Conflict Resolution',
      whyItMattersMonday: 'Pas de miracles spectaculaires, juste du travail et une loyaut\u00e9 radicale. La d\u00e9cision de Ruth de rester aupr\u00e8s de la d\u00e9prim\u00e9e Na\u00efomi remodele l\u2019histoire et engendre une lign\u00e9e royale.',
      anchorReference: 'Ruth 1:16',
      canonicalText: 'Ne me presse pas de te laisser\u00a0! O\u00f9 tu iras j\u2019irai, o\u00f9 tu demeureras je demeurerai\u00a0; ton peuple sera mon peuple, et ton Dieu sera mon Dieu.',
      streetTranslation: 'Cessez d\u2019essayer de me repousser. L\u00e0 o\u00f9 tu saignes, je saigne. Je suis engag\u00e9 avec toi jusqu\u2019\u00e0 la fin.',
      takeaway: 'Prouvez votre loyaut\u00e9 \u00e0 quelqu\u2019un qui traverse une saison sombre quand tout le monde est parti.'
    },
    'ot-1samuel': {
      name: '1 Samuel',
      codename: 'Le Berger & Le Tyran',
      subtitle: 'L\u2019asc\u00e9nsion de David et l\u2019effondrement mental du roi Sa\u00fcl',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Sa\u00fcl a chut\u00e9 parce qu\u2019il se souciait plus de l\u2019image publique que de l\u2019ob\u00e9issance secr\u00e8te. David s\u2019est \u00e9lev\u00e9 parce qu\u2019il avait un c\u0153ur authentique et sans armure.',
      anchorReference: '1 Samuel 16:7',
      canonicalText: 'L\u2019\u00c9ternel ne regarde pas \u00e0 ce que l\u2019homme regarde\u00a0: l\u2019homme regarde \u00e0 ce qui frappe les yeux, mais l\u2019\u00c9ternel regarde au c\u0153ur.',
      streetTranslation: 'Les gens vous jugent sur votre costume, votre titre et vos chiffres. Dieu scrute vos motivations secr\u00e8tes et votre colonne vert\u00e9brale int\u00e9rieure.',
      takeaway: 'Consacrez plus de temps \u00e0 calibrer votre int\u00e9grit\u00e9 priv\u00e9e qu\u2019\u00e0 soigner votre image publique.'
    },
    'ot-2samuel': {
      name: '2 Samuel',
      codename: 'Le Tr\u00f4ne & La Chute',
      subtitle: 'Consolider un empire et faire face aux cons\u00e9quences d\u2019une d\u00e9faillance morale priv\u00e9e',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Unfair Pain & Betrayal',
      whyItMattersMonday: 'Vous pouvez \u00eatre un leader puissant et vous effondrer quand vous ne prot\u00e9gez pas votre temps libre. Quand David est rest\u00e9 \u00e0 la maison au lieu d\u2019aller au combat, la ruine est entr\u00e9e chez lui.',
      anchorReference: '2 Samuel 12:13',
      canonicalText: 'David dit \u00e0 Nathan\u00a0: J\u2019ai p\u00e9ch\u00e9 contre l\u2019\u00c9ternel. Et Nathan dit \u00e0 David\u00a0: L\u2019\u00c9ternel a pardonn\u00e9 ton p\u00e9ch\u00e9\u00a0; tu ne mourras pas.',
      streetTranslation: 'David n\u2019a pas tent\u00e9 de se justifier. Il a aval\u00e9 son orgueil et admis\u00a0: \u00ab\u00a0Je suis coupable.\u00a0\u00bb Et la gr\u00e2ce l\u2019a accueilli dans la poussi\u00e8re.',
      takeaway: 'Face \u00e0 un \u00e9chec, \u00e9liminez toutes les excuses. La confession radicale est la seule porte vers la restauration.'
    },
    'ot-1kings': {
      name: '1 Rois',
      codename: 'Or, Feu & \u00c9puisement',
      subtitle: 'L\u2019\u00e2ge d\u2019or de Salomon, la confrontation du mont Carmel et l\u2019effondrement d\u2019\u00c9lie',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Burnout & Meaning',
      whyItMattersMonday: 'M\u00eame les champions l\u00e9gendaires s\u2019effondrent. Apr\u00e8s avoir fait descendre le feu sur le mont Carmel, \u00c9lie voulait mourir sous un g\u00ean\u00eate. Dieu lui a donn\u00e9 de la nourriture, du sommeil et un murmure doux.',
      anchorReference: '1 Rois 19:12',
      canonicalText: 'Et apr\u00e8s le tremblement de terre, un feu\u00a0: l\u2019\u00c9ternel n\u2019\u00e9tait point dans le feu. Et apr\u00e8s le feu, un murmure doux et l\u00e9ger.',
      streetTranslation: 'Dieu n\u2019\u00e9tait pas dans l\u2019ouragan hurlant ni dans l\u2019explosion dramatique. Il est apparu dans le silence doux et tranquille.',
      takeaway: '\u00c9teignez les podcasts, les flux d\u2019actualit\u00e9s et le bruit pendant 15 minutes. \u00c9coutez le murmure doux.'
    },
    'ot-esther': {
      name: 'Esther',
      codename: 'L\u2019Espionnage au Palais',
      subtitle: 'Une reine orpheline infiltr\u00e9e qui risque l\u2019ex\u00e9cution pour stopper un g\u00e9nocide',
      division: 'Guerre & Chroniques',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Le nom de Dieu n\u2019est mentionn\u00e9 nulle part dans Esther, pourtant Sa main invisible est sur chaque page. Vous \u00eates plac\u00e9 dans votre position actuelle pour un but strat\u00e9gique.',
      anchorReference: 'Esther 4:14',
      canonicalText: 'Et qui sait si ce n\u2019est pas pour un temps comme celui-ci que tu es parvenue \u00e0 la royaut\u00e9\u00a0?',
      streetTranslation: 'Pensez-vous vraiment que vous \u00eates arriv\u00e9 \u00e0 cette position par accident\u00a0? Vous \u00eates l\u00e0 pr\u00e9cis\u00e9ment pour ce moment de courage.',
      takeaway: 'Utilisez votre influence pour prot\u00e9ger quelqu\u2019un de vuln\u00e9rable cette semaine.'
    },
    'ot-job': {
      name: 'Job',
      codename: 'Le Silence de Dieu',
      subtitle: 'Survivre \u00e0 une perte catastrophique, aux conseils toxiques et au myst\u00e8re divin',
      division: 'Sagesse & Triage de l\u2019\u00c2me',
      lifeTheme: 'Unfair Pain & Betrayal',
      whyItMattersMonday: 'D\u00e9truit les formules de karma simplistes. Quand la vie s\u2019effondre, vous n\u2019avez pas besoin de positivit\u00e9 toxique\u00a0; il vous faut le courage de questionner honn\u00eatement et d\u2019adorer dans les d\u00e9combres.',
      anchorReference: 'Job 19:25',
      canonicalText: 'Je sais que mon R\u00e9dempteur est vivant, et qu\u2019il se l\u00e8vera le dernier sur la terre.',
      streetTranslation: 'M\u00eame avec ma chair en putr\u00e9faction et mon monde en cendres, je sais que mon D\u00e9fenseur est vivant et qu\u2019il aura le dernier mot dans ce tribunal.',
      takeaway: 'Ancrez-vous dans la v\u00e9rit\u00e9 que votre douleur pr\u00e9sente n\u2019est pas le dernier chapitre.'
    },
    'ot-psalms': {
      name: 'Psaumes',
      codename: 'Le Triage du M\u00e9decin de Champ',
      subtitle: 'Chants de tranchées et triage \u00e9motionnel brut de rois pourchass\u00e9s et de po\u00e8tes',
      division: 'Sagesse & Triage de l\u2019\u00c2me',
      lifeTheme: 'Anxiety & Fear',
      whyItMattersMonday: 'La salle d\u2019urgence \u00e9motionnelle de la Bible. Vous donne la permission d\u2019apporter col\u00e8re, panique, culpabilit\u00e9 et larmes directement devant Dieu sans filtre.',
      anchorReference: 'Psaume 46:1',
      canonicalText: 'Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la d\u00e9tresse.',
      streetTranslation: 'Dieu est notre bunker et notre blindage \u2014 une unit\u00e9 de soutien active d\u00e9j\u00e0 debout \u00e0 c\u00f4t\u00e9 de vous dans le combat.',
      takeaway: 'Courez vers Dieu comme votre premier refuge plut\u00f4t que de vous engourdir avec des \u00e9crans ou la nourriture.'
    },
    'ot-proverbs': {
      name: 'Proverbes',
      codename: 'Le Codex Tactique',
      subtitle: 'Le manuel pratique du roi Salomon pour les affaires, la parole et les limites',
      division: 'Sagesse & Triage de l\u2019\u00c2me',
      lifeTheme: 'Workplace & Career Pressure',
      whyItMattersMonday: 'Intelligence pratique de haut niveau pour l\u2019argent, les r\u00e9unions, la gestion de la col\u00e8re et le rep\u00e9rage des alli\u00e9s toxiques avant qu\u2019ils ne d\u00e9truisent votre carri\u00e8re.',
      anchorReference: 'Proverbes 4:23',
      canonicalText: 'Garde ton c\u0153ur plus que toute autre chose, car de lui jaillissent les sources de la vie.',
      streetTranslation: 'Postez des sentinelles arm\u00e9es aux portes de votre esprit. Tout votre avenir d\u00e9pend de ce que vous y laissez entrer.',
      takeaway: 'Auditez ce que vous avez regard\u00e9 et \u00e9cout\u00e9 ce matin. Nettoyez les d\u00e9chets mentaux.'
    },
    'ot-ecclesiastes': {
      name: 'Eccl\u00e9siaste',
      codename: 'L\u2019Antidote \u00e0 l\u2019\u00c9puisement',
      subtitle: 'D\u00e9construire le statut, la richesse et le bourreautablet sous le soleil',
      division: 'Sagesse & Triage de l\u2019\u00c2me',
      lifeTheme: 'Burnout & Meaning',
      whyItMattersMonday: 'L\u2019antidote \u00e0 l\u2019\u00e9puisement de la course aux rats moderne. Il vous dit clairement que le succ\u00e8s professionnel seul ne comblera jamais votre aspiration la plus profonde.',
      anchorReference: 'Eccl\u00e9siaste 3:11',
      canonicalText: 'Il a fait toutes choses belles en leur temps\u00a0; il a m\u00eame mis dans leur c\u0153ur la pens\u00e9e de l\u2019\u00e9ternit\u00e9.',
      streetTranslation: 'Dieu a plant\u00e9 une faim d\u2019\u00e9ternit\u00e9 au fond de votre poitrine \u2014 c\u2019est pourquoi aucun salaire, aucune promotion ni aucune vacance ne peut jamais vous satisfaire durablement.',
      takeaway: 'Cessez d\u2019attendre que votre emploi ou votre compte bancaire satisfasse une aspiration \u00e9ternelle.'
    },
    'ot-isaiah': {
      name: '\u00c9sa\u00efe',
      codename: 'Le Proph\u00e8te de la Salle du Tr\u00f4ne',
      subtitle: 'Avertissements g\u00e9opolitiques, le Serviteur souffrant et visions de nouvelle cr\u00e9ation',
      division: 'R\u00e9seau de Renseignement Proph\u00e9tique',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Contient l\u2019avant-go\u00fbt le plus clair de J\u00e9sus-Christ 700 ans avant Sa naissance, avec des promesses solides pour ceux qui se sentent \u00e9puis\u00e9s.',
      anchorReference: '\u00c9sa\u00efe 40:31',
      canonicalText: 'Mais ceux qui se confient en l\u2019\u00c9ternel renouvellent leur force. Ils prennent le vol comme les aigles\u00a0; ils courent et ne se lassent point, ils marchent et ne se fatiguent point.',
      streetTranslation: 'Ceux qui fixent les yeux sur le Seigneur \u00e9changeront leurs batteries \u00e9puis\u00e9es contre une \u00e9nergie divine. Vous courrez sans atteindre la limite.',
      takeaway: '\u00c9changez votre effort \u00e9puis\u00e9 contre une attente patiente dans la pr\u00e9sence de Dieu.'
    },
    'ot-jeremiah': {
      name: 'J\u00e9r\u00e9mie',
      codename: 'Le Pilier de Fer',
      subtitle: 'Dire des v\u00e9rit\u00e9s impopulaires \u00e0 une soci\u00e9t\u00e9 en effondrement depuis une fosse de boue',
      division: 'R\u00e9seau de Renseignement Proph\u00e9tique',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'Quand vos coll\u00e8gues ou votre culture d\u00e9rivent vers la folie, tenir la ligne vous rendra impopulaire. J\u00e9r\u00e9mie vous apprend \u00e0 vous tenir comme un pilier de fer.',
      anchorReference: 'J\u00e9r\u00e9mie 29:11',
      canonicalText: 'Car je connais les projets que j\u2019ai form\u00e9s sur vous, dit l\u2019\u00c9ternel, projets de paix et non de malheur, afin de vous donner un avenir et de l\u2019esp\u00e9rance.',
      streetTranslation: 'Dit non pas \u00e0 des touristes confortables, mais \u00e0 des captifs en Babylone\u00a0: J\u2019ai encore le plan directeur pour votre survie et votre avenir.',
      takeaway: 'Rappelez-vous que m\u00eame en saison d\u2019exil, le plan directeur de Dieu reste actif.'
    },
    'ot-daniel': {
      name: 'Daniel',
      codename: 'Infiltr\u00e9 \u00e0 Babylone',
      subtitle: 'Prosp\u00e9rer dans les couloirs d\u2019\u00e9lite pa\u00efens sans perdre sa colonne vert\u00e9brale morale',
      division: 'R\u00e9seau de Renseignement Proph\u00e9tique',
      lifeTheme: 'Integrity in Toxic Cultures',
      whyItMattersMonday: 'Le manuel de r\u00e9f\u00e9rence pour les professionnels chr\u00e9tiens naviguant dans la politique d\u2019entreprise s\u00e9culi\u00e8re. Daniel a surviv\u00e9 \u00e0 quatre rois pa\u00efens gr\u00e2ce \u00e0 une comp\u00e9tence in\u00e9gal\u00e9e et \u00e0 une pri\u00e8re silencieuse.',
      anchorReference: 'Daniel 3:17-18',
      canonicalText: 'Notre Dieu que nous servons peut nous d\u00e9livrer\u00a0... Mais sinon, sache, \u00f4 roi, que nous ne servirons pas tes dieux.',
      streetTranslation: 'Notre Dieu peut nous arracher \u00e0 ta fournaise. Mais m\u00eame s\u2019il ne le fait pas, nous n\u2019inchinerons jamais devant ta statue d\u2019or.',
      takeaway: 'Tracez votre ligne dans le sable avant que la pression n\u2019arrive. D\u00e9cidez ce que vous ne compromettrez jamais.'
    },
    'nt-matthew': {
      name: 'Matthieu',
      codename: 'Le Manifeste du Roi',
      subtitle: 'La r\u00e9volution contre-culturelle de J\u00e9sus et l\u2019Église primitive explosive',
      division: 'Le Manifeste du Roi',
      lifeTheme: 'Action Over Cheap Talk',
      whyItMattersMonday: 'Matthieu pr\u00e9sente J\u00e9sus comme le Roi attendu, dont les enseignements renversent les valeurs du monde et appellent \u00e0 une ob\u00e9issance concr\u00e8te, pas \u00e0 une foi de fa\u00e7ade.',
      anchorReference: 'Matthieu 6:33',
      canonicalText: 'Cherchez premi\u00e8rement le royaume et la justice de Dieu\u00a0; et toutes ces choses vous seront donn\u00e9es par-dessus.',
      streetTranslation: 'Recentrez vos priorit\u00e9s absolues sur le Royaume et cessez de consumer vos forces dans l\u2019angoisse du lendemain.',
      takeaway: 'Mettez l\u2019essentiel au c\u0153ur de votre journ\u00e9e\u00a0: fid\u00e9lit\u00e9, justice et droiture devant Dieu.'
    },
    'nt-john': {
      name: 'Jean',
      codename: 'Lumi\u00e8re dans les T\u00e9n\u00e8bres',
      subtitle: 'La Divinit\u00e9 Faite Chair',
      division: 'Le Manifeste du Roi',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Jean r\u00e9v\u00e8le l\u2019identit\u00e9 divine de J\u00e9sus \u00e0 travers sept signes puissants et sept d\u00e9clarations \u00ab\u00a0Je suis\u00a0\u00bb, montrant qu\u2019Il est la lumi\u00e8re dans les t\u00e9n\u00e8bres les plus profondes.',
      anchorReference: 'Jean 1:14',
      canonicalText: 'Et la parole a \u00e9t\u00e9 faite chair, et elle a habit\u00e9 parmi nous, pleine de gr\u00e2ce et de v\u00e9rit\u00e9.',
      streetTranslation: 'Dieu n\u2019est pas rest\u00e9 dans un sanctuaire lointain\u00a0; Il a rev\u00eatu notre humanit\u00e9 pour nous combler de Sa gr\u00e2ce.',
      takeaway: 'Venez au Christ en toute assurance\u00a0: Il comprend vos faiblesses intimes.'
    },
    'nt-romans': {
      name: 'Romains',
      codename: 'La Charte de la Gr\u00e2ce',
      subtitle: 'Doctrine d\u2019Acier & Victoire \u00c9ternelle',
      division: 'D\u00e9p\u00eaches de Terrain',
      lifeTheme: 'Burnout & Meaning',
      whyItMattersMonday: 'Romains est la charte la plus compl\u00e8te de la gr\u00e2ce dans toute la Bible \u2014 montrant pourquoi m\u00eame les meilleurs efforts humains ne suffisent pas, et comment la foi transforme tout.',
      anchorReference: 'Romains 8:31',
      canonicalText: 'Que dirons-nous donc \u00e0 l\u2019\u00e9gard de ces choses\u00a0? Si Dieu est pour nous, qui sera contre nous\u00a0?',
      streetTranslation: 'Si le Ma\u00eetre de l\u2019univers combat \u00e0 vos c\u00f4t\u00e9s, aucune adversit\u00e9 terrestre ne saurait avoir le dernier mot.',
      takeaway: 'Relevez la t\u00eate avec foi\u00a0: aucune condamnation ne tient devant la fid\u00e9lit\u00e9 de Dieu.'
    },
    'nt-revelation': {
      name: 'Apocalypse',
      codename: 'Le D\u00e9nouement Cosmique',
      subtitle: 'Guerre cosmique, la chute de l\u2019empire et espoir in\u00e9branlable dans la victoire',
      division: 'Le D\u00e9nouement Cosmique',
      lifeTheme: 'Courage Under Fire',
      whyItMattersMonday: 'Guerre cosmique, chute de l\u2019empire et espoir in\u00e9branlable dans la victoire. L\u2019Agneau triomphe \u2014 et ceux qui pers\u00e9v\u00e8rent r\u00e8gneront avec Lui.',
      anchorReference: 'Apocalypse 21:4',
      canonicalText: 'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n\u2019y aura plus ni deuil, ni cri, ni douleur.',
      streetTranslation: 'Le deuil, la souffrance et la mort ont un terme irr\u00e9versiblement scell\u00e9 par le Seigneur de gloire.',
      takeaway: 'Pers\u00e9v\u00e9rez aujourd\u2019hui en gardant les yeux fix\u00e9s sur la victoire promise\u00a0: l\u2019Agneau a triomph\u00e9.'
    }
  }
};

// ============================================================================
// CORE HELPER RESOLVERS
// ============================================================================

/**
 * Resolves a MemoryVerse into the active user language (EN / ES / FR).
 */
export function getLocalizedVerse(verse: MemoryVerse, lang: SupportedLanguage): MemoryVerse {
  if (lang === 'en') return verse;

  // 1. Check Core Verses
  const coreMatch = LOCALIZED_CORE_VERSES[lang]?.[verse.id];
  if (coreMatch) {
    return {
      ...verse,
      reference: coreMatch.reference,
      translation: coreMatch.translation,
      text: coreMatch.text,
      plainEnglishSummary: coreMatch.plainEnglishSummary,
      keyTakeaway: coreMatch.keyTakeaway
    };
  }

  // 2. Check Story Verses
  const storyMatch = LOCALIZED_STORY_VERSES[lang]?.[verse.id];
  if (storyMatch) {
    return {
      ...verse,
      reference: storyMatch.reference,
      translation: storyMatch.translation,
      text: storyMatch.text,
      plainEnglishSummary: storyMatch.plainEnglishSummary,
      keyTakeaway: storyMatch.keyTakeaway
    };
  }

  // 3. Check Proverbs Verses
  const proverbMatch = LOCALIZED_PROVERB_VERSES[lang]?.[verse.id];
  if (proverbMatch) {
    return {
      ...verse,
      reference: proverbMatch.reference,
      translation: proverbMatch.translation,
      text: proverbMatch.text,
      plainEnglishSummary: proverbMatch.plainEnglishSummary,
      keyTakeaway: proverbMatch.keyTakeaway
    };
  }

  // 4. Check Psalm Verses
  const psalmMatch = LOCALIZED_PSALM_VERSES[lang]?.[verse.id];
  if (psalmMatch) {
    return {
      ...verse,
      reference: psalmMatch.reference,
      translation: psalmMatch.translation,
      text: psalmMatch.text,
      plainEnglishSummary: psalmMatch.plainEnglishSummary,
      keyTakeaway: psalmMatch.keyTakeaway
    };
  }

  // 5. Check Canon Book Verses
  const canonLocKey = canonIdToLocKey(verse.id);
  const canonMatch = LOCALIZED_CANON_BOOK_DATA[lang]?.[canonLocKey]
                  ?? LOCALIZED_CANON_BOOK_DATA[lang]?.[verse.id];
  if (canonMatch) {
    return {
      ...verse,
      reference: canonMatch.anchorReference,
      translation: lang === 'es' ? 'RVR1960' : 'LSG',
      text: canonMatch.canonicalText,
      plainEnglishSummary: canonMatch.streetTranslation,
      keyTakeaway: canonMatch.takeaway
    };
  }

  return verse;
}

/**
 * Resolves a RealLifeDilemma anchor scripture and plays into the active language.
 */
export function getLocalizedDilemma(dilemma: RealLifeDilemma, lang: SupportedLanguage): RealLifeDilemma {
  if (lang === 'en') return dilemma;

  const match = LOCALIZED_DILEMMAS[lang]?.[dilemma.id];
  if (!match) return dilemma;

  return {
    ...dilemma,
    anchorScripture: {
      reference: match.reference,
      text: match.text,
      streetMeaning: match.streetMeaning
    }
  };
}

/**
 * Resolves a ProverbScenario into the active language.
 */
export function getLocalizedProverb(proverb: ProverbScenario, lang: SupportedLanguage): ProverbScenario {
  if (lang === 'en') return proverb;

  const match = LOCALIZED_PROVERB_VERSES[lang]?.[proverb.id];
  if (!match) return proverb;

  return {
    ...proverb,
    reference: match.reference,
    formalText: match.text,
    streetTranslation: match.plainEnglishSummary,
    keyTakeaway: match.keyTakeaway
  };
}

/**
 * Resolves a PsalmPrescription into the active language.
 */
export function getLocalizedPsalm(psalm: PsalmPrescription, lang: SupportedLanguage): PsalmPrescription {
  if (lang === 'en') return psalm;

  const match = LOCALIZED_PSALM_VERSES[lang]?.[psalm.id];
  if (!match) return psalm;

  return {
    ...psalm,
    reference: match.reference,
    formalText: match.text,
    streetTranslation: match.plainEnglishSummary,
    keyTakeaway: match.keyTakeaway
  };
}

/**
 * Resolves a CanonBook into the active language.
 * Uses canonIdToLocKey() to bridge the 'canon-genesis' → 'ot-genesis' gap.
 */
export function getLocalizedCanonBook(book: CanonBook, lang: SupportedLanguage): CanonBook {
  if (lang === 'en') return book;

  // Try direct lookup first (fallback), then try the normalized key
  const locKey = canonIdToLocKey(book.id);
  const match = LOCALIZED_CANON_BOOK_DATA[lang]?.[locKey]
              ?? LOCALIZED_CANON_BOOK_DATA[lang]?.[book.id];
  if (!match) return book;

  return {
    ...book,
    name: match.name,
    codename: match.codename,
    subtitle: match.subtitle,
    division: book.division,
    localizedDivision: match.division,
    ...(match.whyItMattersMonday ? { whyItMattersMonday: match.whyItMattersMonday } : {}),
    anchorScripture: {
      reference: match.anchorReference,
      canonicalText: match.canonicalText,
      streetTranslation: match.streetTranslation,
      takeaway: match.takeaway
    }
  };
}

export const CANON_DIVISION_I18N_KEYS: Record<string, { label: string; desc: string }> = {
  'Torah & Origins': { label: 'divisionLabel.torah', desc: 'division.torah' },
  'War & Chronicles': { label: 'divisionLabel.war', desc: 'division.war' },
  'Wisdom & Soul Triage': { label: 'divisionLabel.wisdom', desc: 'division.wisdom' },
  'Wisdom & Triage': { label: 'divisionLabel.wisdom', desc: 'division.wisdom' },
  'Prophet Intelligence': { label: 'divisionLabel.prophet', desc: 'division.prophet' },
  "The King's Manifesto": { label: 'divisionLabel.kingsManifesto', desc: 'division.kingsManifesto' },
  'Field Dispatches': { label: 'divisionLabel.fieldDispatches', desc: 'division.fieldDispatches' },
  'The Cosmic Endgame': { label: 'divisionLabel.cosmicEndgame', desc: 'division.cosmicEndgame' },
};

export const CANON_LIFE_THEME_I18N_KEYS: Record<string, string> = {
  'All Themes': 'lifeTheme.all',
  'Burnout & Meaning': 'lifeTheme.burnout',
  'Workplace & Career Pressure': 'lifeTheme.workplace',
  'Anxiety & Fear': 'lifeTheme.anxiety',
  'Unfair Pain & Betrayal': 'lifeTheme.pain',
  'Action Over Cheap Talk': 'lifeTheme.action',
  'Integrity in Toxic Cultures': 'lifeTheme.integrity',
  'Family & Conflict Resolution': 'lifeTheme.family',
  'Courage Under Fire': 'lifeTheme.courage',
};