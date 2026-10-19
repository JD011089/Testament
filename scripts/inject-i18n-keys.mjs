import fs from 'node:fs';

const path = 'src/context/LanguageContext.tsx';
let s = fs.readFileSync(path, 'utf8');

const blocks = {
  en: `
    'nav.map': 'Map',
    'nav.mapTooltip': 'Story map from Creation to the early church',
    'nav.deck': 'Deck',
    'nav.deckTooltip': 'Verses and characters you have collected',
    'nav.freshStart': 'Fresh start',
    'nav.settings': 'Settings',
    'nav.settingsTooltip': 'Settings & preferences',
    'nav.whatsNew': "What's new in {version}",
    'nav.mobileAria': 'Mobile navigation',
    'common.loading': 'Loading...',
    'common.close': 'Close',
    'common.continue': 'Continue',
    'common.play': 'Play',
    'common.replay': 'Replay',
    'common.practice': 'Practice',
    'today.title': 'Today',
    'today.streak': '{count}-day streak — kind and steady.',
    'today.freshStart': 'A fresh start today.',
    'today.step.swipe': 'Swipe',
    'today.step.play': 'Play',
    'today.step.lockIn': 'Lock in',
    'today.step.collect': 'Collect',
    'today.done': 'Done for today',
    'today.tomorrow': 'Tomorrow: {title} ({passage}).',
    'today.mapFinished': 'You finished the map.',
    'today.openMap': 'Open the map',
    'today.myDeck': 'My Deck',
    'today.estMinutes': '{passage} • about {minutes} minutes',
    'today.swipeIntro': 'Swipe through the story. Then answer three quick questions.',
    'today.playStory': 'Play the story',
    'today.playAgain': 'Play again',
    'today.verseCollected': 'Verse collected',
    'today.inDeck': 'This verse is in My Deck.',
    'today.addingDeck': 'Adding to My Deck…',
    'today.noStory': 'No story available.',
    'story.narrationLabel': 'Narration • not Scripture',
    'story.finishToSwipe': 'Finish this step to keep swiping forward.',
    'story.readChapter': 'Read the full chapter',
    'story.next': 'Next',
    'story.doneForNow': 'Done for now',
    'story.doneFooter': "Done for today. Tomorrow's story is waiting on the map.",
    'story.verseInDeck': 'This verse is now in My Deck.',
    'story.leaveConfirm': 'Leave this story? Your spot is saved.',
    'story.back': 'Back',
    'story.dragHint': 'Drag a stone here',
    'story.tapBag': 'Tap the bag to drop it',
    'story.allStones': 'All five stones are in the bag.',
    'map.title': 'Story Map',
    'map.subtitle': 'Follow the path from Creation to the early church.',
    'map.quickPlay': 'Quick play',
    'map.arcComplete': 'Arc complete',
    'map.comingSoon': 'Coming soon',
    'deck.title': 'My Deck',
    'deck.subtitleCount': '{count} cards collected.',
    'deck.subtitleEmpty': 'Finish a story and its verse lands here.',
    'deck.empty': 'No cards yet. Finish a story and its verse lands here.',
    'deck.filterAll': 'All',
    'deck.flip': 'Flip',
    'deck.share': 'Share',
    'deck.read': 'Read',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Daybreak (Light)',
    'settings.themeDark': 'Vespers (Dark)',
    'settings.translation': 'Bible Translation',
    'settings.language': 'Language',
    'settings.sound': 'Sound',
    'settings.soundHint': 'Short sound on every success',
    'settings.haptics': 'Haptics',
    'settings.hapticsHint': 'Light tap on every success',
    'settings.sessionLength': 'Daily session length',
    'settings.showXp': 'Show XP',
    'settings.narrationVoice': 'Narration voice',
    'settings.close': 'Close settings',
    'settings.langEn': 'English 🇺🇸',
    'settings.langEs': 'Español 🇪🇸',
    'settings.langFr': 'Français 🇫🇷',
    'firstRun.s1.title': 'Play a Bible story in 3 minutes a day',
    'firstRun.s1.body': 'Swipe through the story, make a choice, and see what really happened — no walls of text.',
    'firstRun.s2.title': 'Collect the verses you learn',
    'firstRun.s2.body': 'Every finished story adds a card to My Deck. Watch your collection grow.',
    'firstRun.s3.title': 'Pick a daily reminder time',
    'firstRun.s3.body': 'A gentle nudge each day keeps your streak kind and easy.',
    'firstRun.reminderLabel': 'Daily reminder time',
    'firstRun.next': 'Next',
    'firstRun.start': 'Start with David and Goliath',
    'firstRun.skip': 'Skip',
`,
  es: `
    'nav.map': 'Mapa',
    'nav.mapTooltip': 'Mapa de historias desde la Creación hasta la iglesia primitiva',
    'nav.deck': 'Colección',
    'nav.deckTooltip': 'Versículos y personajes que has coleccionado',
    'nav.freshStart': 'Nuevo comienzo',
    'nav.settings': 'Ajustes',
    'nav.settingsTooltip': 'Ajustes y preferencias',
    'nav.whatsNew': 'Novedades en {version}',
    'nav.mobileAria': 'Navegación móvil',
    'common.loading': 'Cargando...',
    'common.close': 'Cerrar',
    'common.continue': 'Continuar',
    'common.play': 'Jugar',
    'common.replay': 'Repetir',
    'common.practice': 'Practicar',
    'today.title': 'Hoy',
    'today.streak': 'Racha de {count} días — constante y amable.',
    'today.freshStart': 'Un nuevo comienzo hoy.',
    'today.step.swipe': 'Desliza',
    'today.step.play': 'Juega',
    'today.step.lockIn': 'Fija',
    'today.step.collect': 'Colecciona',
    'today.done': 'Listo por hoy',
    'today.tomorrow': 'Mañana: {title} ({passage}).',
    'today.mapFinished': 'Terminaste el mapa.',
    'today.openMap': 'Abrir el mapa',
    'today.myDeck': 'Mi colección',
    'today.estMinutes': '{passage} • unos {minutes} minutos',
    'today.swipeIntro': 'Desliza la historia. Luego responde tres preguntas rápidas.',
    'today.playStory': 'Jugar la historia',
    'today.playAgain': 'Jugar de nuevo',
    'today.verseCollected': 'Versículo coleccionado',
    'today.inDeck': 'Este versículo está en Mi colección.',
    'today.addingDeck': 'Añadiendo a Mi colección…',
    'today.noStory': 'No hay historia disponible.',
    'story.narrationLabel': 'Narración • no es Escritura',
    'story.finishToSwipe': 'Termina este paso para seguir deslizando.',
    'story.readChapter': 'Leer el capítulo completo',
    'story.next': 'Siguiente',
    'story.doneForNow': 'Listo por ahora',
    'story.doneFooter': 'Listo por hoy. La historia de mañana te espera en el mapa.',
    'story.verseInDeck': 'Este versículo ya está en Mi colección.',
    'story.leaveConfirm': '¿Salir de esta historia? Tu progreso está guardado.',
    'story.back': 'Atrás',
    'story.dragHint': 'Arrastra una piedra aquí',
    'story.tapBag': 'Toca la bolsa para soltarla',
    'story.allStones': 'Las cinco piedras están en la bolsa.',
    'map.title': 'Mapa de historias',
    'map.subtitle': 'Sigue el camino desde la Creación hasta la iglesia primitiva.',
    'map.quickPlay': 'Juego rápido',
    'map.arcComplete': 'Arco completo',
    'map.comingSoon': 'Próximamente',
    'deck.title': 'Mi colección',
    'deck.subtitleCount': '{count} cartas coleccionadas.',
    'deck.subtitleEmpty': 'Termina una historia y su versículo llega aquí.',
    'deck.empty': 'Aún no hay cartas. Termina una historia y su versículo llega aquí.',
    'deck.filterAll': 'Todas',
    'deck.flip': 'Voltear',
    'deck.share': 'Compartir',
    'deck.read': 'Leer',
    'settings.theme': 'Tema',
    'settings.themeLight': 'Amanecer (Claro)',
    'settings.themeDark': 'Vísperas (Oscuro)',
    'settings.translation': 'Traducción bíblica',
    'settings.language': 'Idioma',
    'settings.sound': 'Sonido',
    'settings.soundHint': 'Sonido breve en cada éxito',
    'settings.haptics': 'Vibración',
    'settings.hapticsHint': 'Toque ligero en cada éxito',
    'settings.sessionLength': 'Duración de la sesión diaria',
    'settings.showXp': 'Mostrar XP',
    'settings.narrationVoice': 'Voz de narración',
    'settings.close': 'Cerrar ajustes',
    'settings.langEn': 'English 🇺🇸',
    'settings.langEs': 'Español 🇪🇸',
    'settings.langFr': 'Français 🇫🇷',
    'firstRun.s1.title': 'Juega una historia bíblica en 3 minutos al día',
    'firstRun.s1.body': 'Desliza la historia, elige y ve lo que realmente pasó — sin muros de texto.',
    'firstRun.s2.title': 'Colecciona los versículos que aprendes',
    'firstRun.s2.body': 'Cada historia terminada añade una carta a Mi colección. Mira crecer tu mazo.',
    'firstRun.s3.title': 'Elige una hora de recordatorio diario',
    'firstRun.s3.body': 'Un aviso suave cada día mantiene tu racha amable y fácil.',
    'firstRun.reminderLabel': 'Hora del recordatorio diario',
    'firstRun.next': 'Siguiente',
    'firstRun.start': 'Empezar con David y Goliat',
    'firstRun.skip': 'Omitir',
`,
  fr: `
    'nav.map': 'Carte',
    'nav.mapTooltip': 'Carte des récits de la Création à l\\'Église primitive',
    'nav.deck': 'Collection',
    'nav.deckTooltip': 'Versets et personnages que vous avez collectés',
    'nav.freshStart': 'Nouveau départ',
    'nav.settings': 'Réglages',
    'nav.settingsTooltip': 'Réglages et préférences',
    'nav.whatsNew': 'Nouveautés de {version}',
    'nav.mobileAria': 'Navigation mobile',
    'common.loading': 'Chargement...',
    'common.close': 'Fermer',
    'common.continue': 'Continuer',
    'common.play': 'Jouer',
    'common.replay': 'Rejouer',
    'common.practice': 'Pratiquer',
    'today.title': 'Aujourd\\'hui',
    'today.streak': 'Série de {count} jours — douce et régulière.',
    'today.freshStart': 'Un nouveau départ aujourd\\'hui.',
    'today.step.swipe': 'Glisser',
    'today.step.play': 'Jouer',
    'today.step.lockIn': 'Ancrer',
    'today.step.collect': 'Collecter',
    'today.done': 'Terminé pour aujourd\\'hui',
    'today.tomorrow': 'Demain : {title} ({passage}).',
    'today.mapFinished': 'Vous avez terminé la carte.',
    'today.openMap': 'Ouvrir la carte',
    'today.myDeck': 'Ma collection',
    'today.estMinutes': '{passage} • environ {minutes} minutes',
    'today.swipeIntro': 'Parcourez l\\'histoire. Puis répondez à trois questions rapides.',
    'today.playStory': 'Jouer l\\'histoire',
    'today.playAgain': 'Rejouer',
    'today.verseCollected': 'Verset collecté',
    'today.inDeck': 'Ce verset est dans Ma collection.',
    'today.addingDeck': 'Ajout à Ma collection…',
    'today.noStory': 'Aucune histoire disponible.',
    'story.narrationLabel': 'Narration • pas l\\'Écriture',
    'story.finishToSwipe': 'Terminez cette étape pour continuer à glisser.',
    'story.readChapter': 'Lire le chapitre complet',
    'story.next': 'Suivant',
    'story.doneForNow': 'C\\'est bon pour l\\'instant',
    'story.doneFooter': 'Terminé pour aujourd\\'hui. L\\'histoire de demain vous attend sur la carte.',
    'story.verseInDeck': 'Ce verset est maintenant dans Ma collection.',
    'story.leaveConfirm': 'Quitter cette histoire ? Votre progression est enregistrée.',
    'story.back': 'Retour',
    'story.dragHint': 'Glissez une pierre ici',
    'story.tapBag': 'Touchez le sac pour déposer',
    'story.allStones': 'Les cinq pierres sont dans le sac.',
    'map.title': 'Carte des récits',
    'map.subtitle': 'Suivez le chemin de la Création à l\\'Église primitive.',
    'map.quickPlay': 'Jeu rapide',
    'map.arcComplete': 'Arc terminé',
    'map.comingSoon': 'Bientôt',
    'deck.title': 'Ma collection',
    'deck.subtitleCount': '{count} cartes collectées.',
    'deck.subtitleEmpty': 'Terminez une histoire et son verset arrive ici.',
    'deck.empty': 'Pas encore de cartes. Terminez une histoire et son verset arrive ici.',
    'deck.filterAll': 'Toutes',
    'deck.flip': 'Retourner',
    'deck.share': 'Partager',
    'deck.read': 'Lire',
    'settings.theme': 'Thème',
    'settings.themeLight': 'Aube (Clair)',
    'settings.themeDark': 'Vêpres (Sombre)',
    'settings.translation': 'Traduction biblique',
    'settings.language': 'Langue',
    'settings.sound': 'Son',
    'settings.soundHint': 'Son court à chaque réussite',
    'settings.haptics': 'Vibrations',
    'settings.hapticsHint': 'Légère vibration à chaque réussite',
    'settings.sessionLength': 'Durée de la session quotidienne',
    'settings.showXp': 'Afficher l\\'XP',
    'settings.narrationVoice': 'Voix de narration',
    'settings.close': 'Fermer les réglages',
    'settings.langEn': 'English 🇺🇸',
    'settings.langEs': 'Español 🇪🇸',
    'settings.langFr': 'Français 🇫🇷',
    'firstRun.s1.title': 'Jouez une histoire biblique en 3 minutes par jour',
    'firstRun.s1.body': 'Parcourez l\\'histoire, faites un choix, et voyez ce qui s\\'est vraiment passé — sans murs de texte.',
    'firstRun.s2.title': 'Collectez les versets que vous apprenez',
    'firstRun.s2.body': 'Chaque histoire terminée ajoute une carte à Ma collection. Regardez-la grandir.',
    'firstRun.s3.title': 'Choisissez une heure de rappel quotidien',
    'firstRun.s3.body': 'Un doux rappel chaque jour garde votre série simple et légère.',
    'firstRun.reminderLabel': 'Heure du rappel quotidien',
    'firstRun.next': 'Suivant',
    'firstRun.start': 'Commencer avec David et Goliath',
    'firstRun.skip': 'Passer',
`,
};

function inject(lang, marker, block) {
  if (s.includes("'today.title':")) {
    console.log('keys already present');
    return;
  }
  const needle = `'nav.scriptureXp':`;
  // Find the Nth occurrence for en=1, es=2, fr=3
  let idx = -1;
  let from = 0;
  const which = lang === 'en' ? 1 : lang === 'es' ? 2 : 3;
  for (let i = 0; i < which; i++) {
    idx = s.indexOf(needle, from);
    if (idx < 0) throw new Error(`Missing ${needle} for ${lang}`);
    from = idx + needle.length;
  }
  const lineEnd = s.indexOf('\n', idx);
  const insertAt = lineEnd + 1;
  s = s.slice(0, insertAt) + block + s.slice(insertAt);
  console.log('injected', lang, 'at', insertAt);
}

inject('en', null, blocks.en);
inject('es', null, blocks.es);
inject('fr', null, blocks.fr);

// Also add setStoredLanguage sync if missing
if (!s.includes('getDefaultTranslationForLanguage')) {
  s = s.replace(
    `export const setStoredLanguage = (lang: Language) => {
  try {
    localStorage.setItem('testament_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    window.dispatchEvent(new CustomEvent('testament-language-changed', { detail: { language: lang } }));
  } catch {
    // ignore
  }
};`,
    `export const setStoredLanguage = (lang: Language) => {
  try {
    localStorage.setItem('testament_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    window.dispatchEvent(new CustomEvent('testament-language-changed', { detail: { language: lang } }));
    void import('../utils/bibleService').then(({ getDefaultTranslationForLanguage }) => {
      void import('../utils/readingPlace').then(({ loadReadingPlace, saveReadingPlace }) => {
        const place = loadReadingPlace();
        const nextTranslation = getDefaultTranslationForLanguage(lang);
        if (!place) {
          saveReadingPlace({
            bookId: 'GEN',
            bookName: 'Genesis',
            chapter: 1,
            translation: nextTranslation,
          });
          return;
        }
        if (place.translation === nextTranslation) return;
        saveReadingPlace({ ...place, translation: nextTranslation });
      });
    });
  } catch {
    // ignore
  }
};`
  );
  console.log('patched setStoredLanguage');
}

fs.writeFileSync(path, s);
console.log('done, today.title=', s.includes("'today.title'"));
