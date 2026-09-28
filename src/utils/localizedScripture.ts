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
export const LOCALIZED_CANON_BOOK_DATA: Record<'es' | 'fr', Record<string, {
  name: string;
  codename: string;
  subtitle: string;
  division: string;
  lifeTheme: string;
  anchorReference: string;
  canonicalText: string;
  streetTranslation: string;
  takeaway: string;
}>> = {
  es: {
    'ot-genesis': {
      name: 'Génesis',
      codename: 'Operación Génesis',
      subtitle: 'El Pacto, el Caos y la Creación',
      division: 'Torá y Orígenes',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Génesis 50:20',
      canonicalText: 'Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien, para hacer lo que vemos hoy, para mantener en vida a mucho pueblo.',
      streetTranslation: 'La traición humana jamás descarrilará los planes de Dios. La fosa y la prisión fueron los escalones para salvar a una nación.',
      takeaway: 'Confía en que Dios está transformando los peores reveses en preparación para tu propósito.'
    },
    'ot-exodus': {
      name: 'Éxodo',
      codename: 'La Gran Fuga',
      subtitle: 'Ruptura Imperial y el Código de Libertad',
      division: 'Torá y Orígenes',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Éxodo 14:14',
      canonicalText: 'Jehová peleará por vosotros, y vosotros estaréis tranquilos.',
      streetTranslation: 'Con el mar infranqueable adelante y los carros enemigos detrás, tu primera misión es la serenidad bajo fuego.',
      takeaway: 'Detén el pánico impulsivo. Mira cómo Dios abre caminos donde todo parecía cerrado.'
    },
    'ot-psalms': {
      name: 'Salmos',
      codename: 'El Botiquín del Alma',
      subtitle: 'Oraciones de Trinchera y Triunfo',
      division: 'Sabiduría y Triage',
      lifeTheme: 'Anxiety & Fear',
      anchorReference: 'Salmos 23:4',
      canonicalText: 'Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo.',
      streetTranslation: 'Caminar por el valle oscuro no significa estar derrotado. La presencia del Pastor desarma el terror.',
      takeaway: 'Avanza por el valle con la certeza de que no estás desamparado.'
    },
    'ot-proverbs': {
      name: 'Proverbios',
      codename: 'El Manual de Tácticas',
      subtitle: 'Estrategias Prácticas para el Mundo Real',
      division: 'Sabiduría y Triage',
      lifeTheme: 'Integrity in Toxic Cultures',
      anchorReference: 'Proverbios 3:5-6',
      canonicalText: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
      streetTranslation: 'Tu inteligencia es un recurso valioso pero un dios pésimo. Entrega el volante de tus planes al Creador.',
      takeaway: 'Somete tus decisiones estratégicas a Dios antes de dar el primer paso.'
    },
    'nt-matthew': {
      name: 'Mateo',
      codename: 'El Manifiesto del Rey',
      subtitle: 'La Revolución del Reino',
      division: 'El Manifiesto del Rey',
      lifeTheme: 'Action Over Cheap Talk',
      anchorReference: 'Mateo 6:33',
      canonicalText: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.',
      streetTranslation: 'Alinea tus prioridades con el Reino y deja de angustiarte por las añadiduras materiales.',
      takeaway: 'Pon lo primero en primer lugar hoy: justicia, rectitud y fidelidad a Cristo.'
    },
    'nt-john': {
      name: 'Juan',
      codename: 'Luz en las Tinieblas',
      subtitle: 'La Divinidad Hecha Carne',
      division: 'El Manifiesto del Rey',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Juan 1:14',
      canonicalText: 'Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.',
      streetTranslation: 'Dios no se quedó en una torre lejana observando el dolor; se metió en el lodo con nosotros lleno de gracia.',
      takeaway: 'Acércate a Cristo sin miedo: Él conoce tus luchas de primera mano.'
    },
    'nt-romans': {
      name: 'Romanos',
      codename: 'La Constitución de la Gracia',
      subtitle: 'Doctrina de Acero y Vida Victoriosa',
      division: 'Despachos de Campo',
      lifeTheme: 'Burnout & Meaning',
      anchorReference: 'Romanos 8:31',
      canonicalText: '¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?',
      streetTranslation: 'Si el Creador del universo está de tu lado, ninguna oposición terrenal tiene la última palabra.',
      takeaway: 'Ponte de pie con confianza renovada: ningún enemigo prevalecerá contra el plan divino.'
    },
    'nt-revelation': {
      name: 'Apocalipsis',
      codename: 'El Desenlace Cósmico',
      subtitle: 'Victoria Final del Cordero y Ruina Imperial',
      division: 'El Desenlace Cósmico',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Apocalipsis 21:4',
      canonicalText: 'Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor.',
      streetTranslation: 'El mal, el luto y el dolor tienen fecha de caducidad fijada por el Rey invicto.',
      takeaway: 'Persevera hoy sabiendo con total certeza cómo termina la historia: el Cordero vence.'
    }
  },
  fr: {
    'ot-genesis': {
      name: 'Genèse',
      codename: 'Opération Genèse',
      subtitle: 'L’Alliance, le Chaos et la Création',
      division: 'Torah & Origines',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Genèse 50:20',
      canonicalText: 'Vous aviez médité de me faire du mal: Dieu l’a changé en bien, de manière à accomplir ce qui arrive aujourd’hui, pour sauver la vie à un peuple nombreux.',
      streetTranslation: 'La perfidie humaine ne peut anéantir le dessein de Dieu. La trahison fut l’escalier secret du salut.',
      takeaway: 'Gardez confiance: Dieu réoriente vos épreuves les plus rudes pour accomplir un bien durable.'
    },
    'ot-exodus': {
      name: 'Exode',
      codename: 'La Grande Évasion',
      subtitle: 'Rupture Impériale & Code de Liberté',
      division: 'Torah & Origines',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Exode 14:14',
      canonicalText: 'L’Éternel combattra pour vous; et vous, gardez le silence.',
      streetTranslation: 'Face à l’impasse de la mer Rouge et aux armées ennemies, la sérénité confiante reste votre meilleure arme.',
      takeaway: 'Refusez la panique stérile. Laissez Dieu déployer Sa puissance là où vos forces s’arrêtent.'
    },
    'ot-psalms': {
      name: 'Psaumes',
      codename: 'L’Infirmerie de l’Âme',
      subtitle: 'Prières de Tranchées & Victoires',
      division: 'Sagesse & Triage',
      lifeTheme: 'Anxiety & Fear',
      anchorReference: 'Psaume 23:4',
      canonicalText: 'Quand je marche dans la vallée de l’ombre de la mort, je ne crains aucun mal, car tu es avec moi.',
      streetTranslation: 'Traverser l’ombre ne signifie pas être abandonné. La houlette du Berger anéantit l’effroi.',
      takeaway: 'Avancez dans l’épreuve avec la conviction paisible que vous n’êtes jamais seul.'
    },
    'ot-proverbs': {
      name: 'Proverbes',
      codename: 'Le Manuel Tactique',
      subtitle: 'Stratégies Pratiques pour le Monde Réel',
      division: 'Sagesse & Triage',
      lifeTheme: 'Integrity in Toxic Cultures',
      anchorReference: 'Proverbes 3:5-6',
      canonicalText: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.',
      streetTranslation: 'Votre discernement est précieux mais insuffisant sans Dieu. Remettez-Lui la boussole de votre vie.',
      takeaway: 'Soumettez vos orientations à la prière avant de passer à l’exécution opérationnelle.'
    },
    'nt-matthew': {
      name: 'Matthieu',
      codename: 'Le Manifeste du Roi',
      subtitle: 'La Révolution du Royaume',
      division: 'Le Manifeste du Roi',
      lifeTheme: 'Action Over Cheap Talk',
      anchorReference: 'Matthieu 6:33',
      canonicalText: 'Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.',
      streetTranslation: 'Recentrez vos priorités absolues sur le Royaume et cessez de consumer vos forces dans l’angoisse du lendemain.',
      takeaway: 'Mettez l’essentiel au cœur de votre journée: fidélité, justice et droiture devant Dieu.'
    },
    'nt-john': {
      name: 'Jean',
      codename: 'Lumière dans les Ténèbres',
      subtitle: 'La Divinité Faite Chair',
      division: 'Le Manifeste du Roi',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Jean 1:14',
      canonicalText: 'Et la parole a été faite chair, et elle a habité parmi nous, pleine de grâce et de vérité.',
      streetTranslation: 'Dieu n’est pas resté dans un sanctuaire lointain; Il a revêtu notre humanité pour nous combler de Sa grâce.',
      takeaway: 'Venez au Christ en toute assurance: Il comprend vos faiblesses intimes.'
    },
    'nt-romans': {
      name: 'Romains',
      codename: 'La Charte de la Grâce',
      subtitle: 'Doctrine d’Acier & Victoire Éternelle',
      division: 'Dépêches de Terrain',
      lifeTheme: 'Burnout & Meaning',
      anchorReference: 'Romains 8:31',
      canonicalText: 'Que dirons-nous donc à l’égard de ces choses? Si Dieu est pour nous, qui sera contre nous?',
      streetTranslation: 'Si le Maître de l’univers combat à vos côtés, aucune adversité terrestre ne saurait avoir le dernier mot.',
      takeaway: 'Relevez la tête avec foi: aucune condamnation ne tient devant la fidélité de Dieu.'
    },
    'nt-revelation': {
      name: 'Apocalypse',
      codename: 'Le Dénouement Cosmique',
      subtitle: 'Triomphe Final de l’Agneau & Chute de l’Empire',
      division: 'Le Dénouement Cosmique',
      lifeTheme: 'Courage Under Fire',
      anchorReference: 'Apocalypse 21:4',
      canonicalText: 'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n’y aura plus ni deuil, ni cri, ni douleur.',
      streetTranslation: 'Le deuil, la souffrance et la mort ont un terme irréversiblement scellé par le Seigneur de gloire.',
      takeaway: 'Persévérez aujourd’hui en gardant les yeux fixés sur la victoire promise: l’Agneau a triomphé.'
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
  const canonMatch = LOCALIZED_CANON_BOOK_DATA[lang]?.[verse.id];
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
 */
export function getLocalizedCanonBook(book: CanonBook, lang: SupportedLanguage): CanonBook {
  if (lang === 'en') return book;

  const match = LOCALIZED_CANON_BOOK_DATA[lang]?.[book.id];
  if (!match) return book;

  return {
    ...book,
    name: match.name,
    codename: match.codename,
    subtitle: match.subtitle,
    division: match.division as any,
    anchorScripture: {
      reference: match.anchorReference,
      canonicalText: match.canonicalText,
      streetTranslation: match.streetTranslation,
      takeaway: match.takeaway
    }
  };
}
