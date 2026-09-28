export type CanonDivision = 
  | 'Torah & Origins'
  | 'War & Chronicles'
  | 'Wisdom & Soul Triage'
  | 'Prophet Intelligence'
  | 'The King\'s Manifesto'
  | 'Field Dispatches'
  | 'The Cosmic Endgame';

export interface CanonAnchorScripture {
  reference: string;
  canonicalText: string;
  streetTranslation: string;
  takeaway: string;
}

export interface CanonBook {
  id: string;
  name: string;
  order: number;
  testament: 'OT' | 'NT';
  division: CanonDivision;
  localizedDivision?: string;
  codename: string;
  subtitle: string;
  lifeTheme: string;
  authorContext: string;
  historicalPeril: string;
  whyItMattersMonday: string;
  anchorScripture: CanonAnchorScripture;
  deepLinkType?: 'story' | 'proverbs' | 'psalms' | 'dossier';
  deepLinkId?: string;
}

export const CANON_DIVISIONS: { id: CanonDivision; label: string; count: number; description: string; icon: string }[] = [
  { id: 'Torah & Origins', label: 'Torah & Origins', count: 5, description: 'Foundations of humanity, covenant, and the wilderness survival code.', icon: '📜' },
  { id: 'War & Chronicles', label: 'War & Chronicles', count: 12, description: 'Military campaigns, palace coups, espionage, and exile resistance.', icon: '⚔️' },
  { id: 'Wisdom & Soul Triage', label: 'Wisdom & Triage', count: 5, description: 'High-stakes dilemma tactics, emergency soul triage, and burnout antidotes.', icon: '🛡️' },
  { id: 'Prophet Intelligence', label: 'Prophet Intelligence', count: 17, description: 'Geopolitical whistleblowers, imperial infiltrators, and moral warnings.', icon: '🔥' },
  { id: 'The King\'s Manifesto', label: 'The King\'s Manifesto', count: 5, description: 'The counter-cultural revolution of Jesus and the explosive early church.', icon: '👑' },
  { id: 'Field Dispatches', label: 'Field Dispatches', count: 21, description: 'Tactical letters to underground cells on freedom, integrity, and action.', icon: '✉️' },
  { id: 'The Cosmic Endgame', label: 'The Cosmic Endgame', count: 1, description: 'Cosmic warfare, the fall of empire, and unshakeable hope in victory.', icon: '⚡' }
];

export const CANON_LIFE_THEMES = [
  'All Themes',
  'Burnout & Meaning',
  'Workplace & Career Pressure',
  'Anxiety & Fear',
  'Unfair Pain & Betrayal',
  'Action Over Cheap Talk',
  'Integrity in Toxic Cultures',
  'Family & Conflict Resolution',
  'Courage Under Fire'
] as const;

export const CANON_BOOKS: CanonBook[] = [
  // ==========================================
  // TORAH & ORIGINS (5 BOOKS)
  // ==========================================
  {
    id: 'canon-genesis',
    name: 'Genesis',
    order: 1,
    testament: 'OT',
    division: 'Torah & Origins',
    codename: 'Origins & Broken Dynasties',
    subtitle: 'From cosmos creation to deep family trauma and resilience',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Traditional authorship attributed to Moses during the wilderness trek.',
    historicalPeril: 'Israel was an enslaved people with no identity. Genesis forged their origin story amidst crushing Egyptian imperial mythology.',
    whyItMattersMonday: 'Families in Genesis are deeply flawed—jealous siblings, favoritism, and betrayal. Yet God repurposes raw human failure into generational purpose.',
    anchorScripture: {
      reference: 'Genesis 50:20',
      canonicalText: 'As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive.',
      streetTranslation: 'You tried to destroy me in the pit, but God turned your sabotage into my training ground to save thousands.',
      takeaway: 'Stop obsessing over who betrayed you. Focus on how God is turning the weapon formed against you into your leverage.'
    },
    deepLinkType: 'story',
    deepLinkId: 'joseph-journey'
  },
  {
    id: 'canon-exodus',
    name: 'Exodus',
    order: 2,
    testament: 'OT',
    division: 'Torah & Origins',
    codename: 'The Great Breakout',
    subtitle: 'Toppling an imperial superpower with an unarmed shepherd',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Moses recording the geopolitical emancipation of Hebrew slaves from the Nile empire.',
    historicalPeril: 'Facing the world’s most militarized superpower with zero weapons, trapped between chariot divisions and the Red Sea.',
    whyItMattersMonday: 'When you are trapped against an impossible wall, panic is a natural reflex. Exodus teaches you that standing still and trusting God’s command beats frantic scrambling.',
    anchorScripture: {
      reference: 'Exodus 14:14',
      canonicalText: 'The Lord will fight for you, and you have only to be silent.',
      streetTranslation: 'Lower your heart rate. The Commander of heaven has the frontline; your job is to keep your mouth shut and hold your ground.',
      takeaway: 'Quiet the mental static. Before you send that frantic email, pause and let God fight the battle.'
    },
    deepLinkType: 'story',
    deepLinkId: 'moses-journey'
  },
  {
    id: 'canon-leviticus',
    name: 'Leviticus',
    order: 3,
    testament: 'OT',
    division: 'Torah & Origins',
    codename: 'The High-Voltage Protocol',
    subtitle: 'Surviving in proximity to raw, undiluted holiness',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'The priestly desert manual delivered at the base of Mount Sinai.',
    historicalPeril: 'Living in an ancient Near East soaked in human sacrifice, blood cults, and disease without sanitation.',
    whyItMattersMonday: 'Leviticus isn’t boring legalism—it is an ancient biohazard and moral insulation manual showing that true integrity requires setting hard, clean boundaries in a sloppy world.',
    anchorScripture: {
      reference: 'Leviticus 19:18',
      canonicalText: 'You shall not take vengeance or bear a grudge against the sons of your own people, but you shall love your neighbor as yourself.',
      streetTranslation: 'Cut the revenge fantasy. Holding a grudge is drinking poison and expecting the other person to die.',
      takeaway: 'Cancel the mental ledger of grievances you have been carrying against that coworker or relative.'
    }
  },
  {
    id: 'canon-numbers',
    name: 'Numbers',
    order: 4,
    testament: 'OT',
    division: 'Torah & Origins',
    codename: 'The Wilderness Quicksand',
    subtitle: 'How an 11-day journey turned into a 40-year mental prison',
    lifeTheme: 'Anxiety & Fear',
    authorContext: 'Field census and military journal of the wilderness wanderings.',
    historicalPeril: 'An entire generation paralyzed by imposter syndrome, believing 10 fearful spies over God’s promise.',
    whyItMattersMonday: 'Complaining and fear are contagious. When you focus on the "giants" in the boardroom instead of your objective, you will wander in circles for years.',
    anchorScripture: {
      reference: 'Numbers 14:9',
      canonicalText: 'Only do not rebel against the Lord. And do not fear the people of the land, for they are bread for us. Their protection is removed from them, and the Lord is with us; do not fear them.',
      streetTranslation: 'Stop shaking. Those intimidating obstacles are just breakfast for us. Their armor is hollow; our God is real.',
      takeaway: 'Reframe your biggest current obstacle as nutrition for your spiritual growth.'
    }
  },
  {
    id: 'canon-deuteronomy',
    name: 'Deuteronomy',
    order: 5,
    testament: 'OT',
    division: 'Torah & Origins',
    codename: 'The Final Briefing',
    subtitle: 'Moses’ farewell address before crossing the Jordan battle lines',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'Delivered by an aged Moses on the plains of Moab to a new generation.',
    historicalPeril: 'Entering a fierce land of fortified walled cities without their founding father.',
    whyItMattersMonday: 'Comfort breeds amnesia. When your business thrives and your bills are paid, that is when you are in the greatest danger of thinking your own cleverness did it.',
    anchorScripture: {
      reference: 'Deuteronomy 8:17-18',
      canonicalText: 'Beware lest you say in your heart, "My power and the might of my hand have gotten me this wealth." You shall remember the Lord your God, for it is he who gives you power to get wealth.',
      streetTranslation: 'Don’t kid yourself into thinking your pure hustle got you this bag. Remember who gave you the breath and brain to build it in the first place.',
      takeaway: 'Ground your ego today. Attribute your wins to the God who gave you the capacity to execute.'
    }
  },

  // ==========================================
  // WAR, CHRONICLES & PALACE ESPIONAGE (12 BOOKS)
  // ==========================================
  {
    id: 'canon-joshua',
    name: 'Joshua',
    order: 6,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Beachhead Invasion',
    subtitle: 'Stepping into leadership after your mentor dies',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Attributed to Joshua and eyewitness chroniclers of the Canaan campaigns.',
    historicalPeril: 'Stepping into the shoes of a legend (Moses) with a river to cross and fortified Jericho ahead.',
    whyItMattersMonday: 'Courage is not the absence of fear—it is moving forward while your knees are shaking because you know who ordered the charge.',
    anchorScripture: {
      reference: 'Joshua 1:9',
      canonicalText: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.',
      streetTranslation: 'Straighten your back. No flinching, no second-guessing. You aren’t walking into that room alone.',
      takeaway: 'Step into today’s hardest confrontation with your head held high.'
    },
    deepLinkType: 'story',
    deepLinkId: 'joshua-journey'
  },
  {
    id: 'canon-judges',
    name: 'Judges',
    order: 7,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Rogue Resistance',
    subtitle: 'Flawed champions fighting societal anarchy and moral decay',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Compiled during early monarchy reflecting on Israel’s tribal dark age.',
    historicalPeril: 'Complete moral collapse: "Everyone did what was right in their own eyes."',
    whyItMattersMonday: 'God uses deeply flawed, imposter-syndrome wrecks (Gideon hiding in a winepress, Samson battling lust) to break systemic oppression.',
    anchorScripture: {
      reference: 'Judges 6:14',
      canonicalText: 'And the Lord turned to him and said, "Go in this might of yours and save Israel from the hand of Midian; do not I send you?"',
      streetTranslation: 'Stop whining about your background and your small family. Go with the raw strength you’ve got right now—I am the one backing you.',
      takeaway: 'Stop waiting until you feel 100% qualified. Move on God’s assignment with what you have.'
    },
    deepLinkType: 'story',
    deepLinkId: 'gideon-journey'
  },
  {
    id: 'canon-ruth',
    name: 'Ruth',
    order: 8,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Loyalty Contract',
    subtitle: 'Quiet loyalty and dignity in the ruins of famine and widowhood',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Historical narrative setting the royal genealogy of King David.',
    historicalPeril: 'A destitute foreign widow arriving in an unfamiliar land with zero legal standing.',
    whyItMattersMonday: 'No flashy miracles, just grind and radical loyalty. Ruth’s decision to stay by bitter Naomi reshapes history and births a royal lineage.',
    anchorScripture: {
      reference: 'Ruth 1:16',
      canonicalText: 'Where you go I will go, and where you lodge I will lodge. Your people shall be my people, and your God my God.',
      streetTranslation: 'Stop trying to shake me off. Where you bleed, I bleed. I’m locked in with you till the dirt covers us.',
      takeaway: 'Prove your loyalty to someone walking through a dark season when everyone else has bailed.'
    },
    deepLinkType: 'story',
    deepLinkId: 'ruth-journey'
  },
  {
    id: 'canon-1samuel',
    name: '1 Samuel',
    order: 9,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Shepherd & The Tyrant',
    subtitle: 'The rise of David and the tragic mental unraveling of King Saul',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Prophetic court history recorded by Samuel, Nathan, and Gad.',
    historicalPeril: 'King Saul hunting young David like a wild dog across limestone desert ravines.',
    whyItMattersMonday: 'Saul fell because he cared more about public optics than secret obedience. David rose because he had an authentic, unarmored heart.',
    anchorScripture: {
      reference: '1 Samuel 16:7',
      canonicalText: 'For the Lord sees not as man sees: man looks on the outward appearance, but the Lord looks on the heart.',
      streetTranslation: 'People judge you by your suit, your title, and your metrics. God scans your secret motives and your internal spine.',
      takeaway: 'Spend more time calibrating your private integrity today than curating your public brand.'
    },
    deepLinkType: 'story',
    deepLinkId: 'david-journey'
  },
  {
    id: 'canon-2samuel',
    name: '2 Samuel',
    order: 10,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Throne & The Fall',
    subtitle: 'Consolidating an empire and facing the brutal fallout of private moral failure',
    lifeTheme: 'Unfair Pain & Betrayal',
    authorContext: 'Official royal chronicles of David’s 40-year reign.',
    historicalPeril: 'Civil war, palace treason from David’s favorite son Absalom, and moral catastrophe.',
    whyItMattersMonday: 'You can be a powerhouse leader and still implode if you fail to guard your leisure time. When David stayed home from battle, ruin entered his house.',
    anchorScripture: {
      reference: '2 Samuel 12:13',
      canonicalText: 'David said to Nathan, "I have sinned against the Lord." And Nathan said to David, "The Lord also has put away your sin; you shall not die."',
      streetTranslation: 'David didn’t spin PR or blame Bathsheba. He swallowed his pride and admitted: "I am guilty." And grace met him in the dirt.',
      takeaway: 'When caught in a failure, eliminate all excuses. Radical confession is the only doorway to restoration.'
    }
  },
  {
    id: 'canon-1kings',
    name: '1 Kings',
    order: 11,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'Gold, Fire & Burnout',
    subtitle: 'Solomon’s golden age, the Mount Carmel showdown, and Elijah’s breakdown',
    lifeTheme: 'Burnout & Meaning',
    authorContext: 'Prophetic history tracking the glory and fracture of the monarchy.',
    historicalPeril: 'State-sponsored Baal worship, death threats from Queen Jezebel, and spiritual civil war.',
    whyItMattersMonday: 'Even legendary champions crash. After calling down fire on Mount Carmel, Elijah wanted to die under a broom tree. God gave him food, sleep, and a quiet whisper.',
    anchorScripture: {
      reference: '1 Kings 19:12',
      canonicalText: 'And after the earthquake a fire, but the Lord was not in the fire. And after the fire the sound of a low whisper.',
      streetTranslation: 'God wasn’t in the screaming hurricane or the dramatic explosion. He showed up in the gentle, quiet silence.',
      takeaway: 'Turn off the podcasts, news feeds, and noise for 15 minutes. Listen for the quiet whisper.'
    },
    deepLinkType: 'story',
    deepLinkId: 'elijah-journey'
  },
  {
    id: 'canon-2kings',
    name: '2 Kings',
    order: 12,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Collapse of Empires',
    subtitle: 'Corrupt dynasties, miracle operations, and the siege of Jerusalem',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Compiled during the Babylonian exile to explain how the nation fell.',
    historicalPeril: 'The Assyrian war machine annihilating the northern kingdom and Babylon breaching the gates of Zion.',
    whyItMattersMonday: 'Compromise is slow and quiet before it is loud and catastrophic. Guard your foundation before external pressures expose the rot.',
    anchorScripture: {
      reference: '2 Kings 6:16',
      canonicalText: 'He said, "Do not be afraid, for those who are with us are more than those who are with them."',
      streetTranslation: 'Open your eyes. The enemy army encircling this mountain is surrounded by an invisible division of flaming chariots.',
      takeaway: 'When pressure feels overwhelming, pray for spiritual vision to see God’s reinforcements.'
    }
  },
  {
    id: 'canon-1chronicles',
    name: '1 Chronicles',
    order: 13,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Warrior Registry',
    subtitle: 'Lineage of the faithful and the elite specs of David’s mighty men',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Ezra or post-exilic chroniclers rebuilding national memory.',
    historicalPeril: 'A broken remnant returning from 70 years in Babylon asking: "Does our heritage still count?"',
    whyItMattersMonday: 'God keeps detailed records of the unheralded soldiers who held the line in barley fields when everyone else ran.',
    anchorScripture: {
      reference: '1 Chronicles 28:20',
      canonicalText: 'Be strong and courageous and do it. Do not be afraid and do not be dismayed, for the Lord God, even my God, is with you.',
      streetTranslation: 'Quit procrastinating and second-guessing. Get to work. The God who held my life will not drop you.',
      takeaway: 'Stop endlessly researching. Launch the project today.'
    }
  },
  {
    id: 'canon-2chronicles',
    name: '2 Chronicles',
    order: 14,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Temple & The Turning',
    subtitle: 'Revival under fire and national resets through humble prayer',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Post-exilic chronicle centered on worship, temple reform, and repentance.',
    historicalPeril: 'Invasions by vast coalition armies leaving leaders with zero military solutions.',
    whyItMattersMonday: 'When you are outmatched and outgunned, confession and collective prayer overturn impossible odds.',
    anchorScripture: {
      reference: '2 Chronicles 7:14',
      canonicalText: 'If my people who are called by my name humble themselves, and pray and seek my face and turn from their wicked ways, then I will hear from heaven and will forgive their sin and heal their land.',
      streetTranslation: 'If you drop the arrogance, get on your knees, and turn away from the garbage habits, I will step into your crisis and restore what was broken.',
      takeaway: 'Humble yourself before God regarding a chronic issue in your household or team.'
    }
  },
  {
    id: 'canon-ezra',
    name: 'Ezra',
    order: 15,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Reconstruction Bureau',
    subtitle: 'Rebuilding the spiritual altar amidst hostile bureaucratic sabotage',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Ezra the priest and royal scribe under Persian emperor Artaxerxes.',
    historicalPeril: 'Hostile regional governors filing fake legal injunctions to halt construction.',
    whyItMattersMonday: 'Building something meaningful always triggers bureaucratic opposition. Faithfulness means maintaining your standards while navigating political red tape.',
    anchorScripture: {
      reference: 'Ezra 7:10',
      canonicalText: 'For Ezra had set his heart to study the Law of the Lord, and to do it and to teach his statutes and rules in Israel.',
      streetTranslation: 'Ezra nailed the three-step sequence: First absorb the truth, second live it out yourself, third teach it to others.',
      takeaway: 'Don’t preach or manage others on standards you aren’t living yourself.'
    }
  },
  {
    id: 'canon-nehemiah',
    name: 'Nehemiah',
    order: 16,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'Project Management Under Fire',
    subtitle: 'Rebuilding city walls in 52 days while holding a trowel and a sword',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Memoirs of Nehemiah, royal cupbearer turned military governor.',
    historicalPeril: 'Assassination plots, mockers at the fence line, and internal usury threatening to collapse the project.',
    whyItMattersMonday: 'The ultimate textbook on crisis leadership, logistics, defensive boundaries, and refusing to let petty critics pull you off the wall.',
    anchorScripture: {
      reference: 'Nehemiah 6:3',
      canonicalText: 'I am doing a great work and I cannot come down. Why should the work stop while I leave it and come down to you?',
      streetTranslation: 'I am in the middle of mission-critical execution. I will not pause this build to attend your distraction meeting.',
      takeaway: 'Politely decline time-wasting drama: "I am doing important work and cannot come down."'
    },
    deepLinkType: 'story',
    deepLinkId: 'nehemiah-journey'
  },
  {
    id: 'canon-esther',
    name: 'Esther',
    order: 17,
    testament: 'OT',
    division: 'War & Chronicles',
    codename: 'The Palace Espionage',
    subtitle: 'A covert orphan queen risking execution to stop genocide',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Persian court records from the Citadel of Susa during King Xerxes.',
    historicalPeril: 'Haman securing an imperial decree for the systematic extermination of all Jews.',
    whyItMattersMonday: 'God’s name is never mentioned once in Esther, yet His invisible hand is on every page. You are placed in your current seat for a strategic purpose.',
    anchorScripture: {
      reference: 'Esther 4:14',
      canonicalText: 'And who knows whether you have not come to the kingdom for such a time as this?',
      streetTranslation: 'Do you really think you made it into this position by accident? You are here precisely for this moment of courage.',
      takeaway: 'Leverage your influence to protect someone vulnerable this week.'
    },
    deepLinkType: 'story',
    deepLinkId: 'esther-journey'
  },

  // ==========================================
  // WISDOM, PHILOSOPHY & SOUL TRIAGE (5 BOOKS)
  // ==========================================
  {
    id: 'canon-job',
    name: 'Job',
    order: 18,
    testament: 'OT',
    division: 'Wisdom & Soul Triage',
    codename: 'The Silence of God',
    subtitle: 'Surviving catastrophic loss, toxic theological advice, and divine mystery',
    lifeTheme: 'Unfair Pain & Betrayal',
    authorContext: 'Ancient wisdom epic set in the land of Uz during the patriarchal era.',
    historicalPeril: 'Losing 10 children, personal health, and wealth in 24 hours without an explanation.',
    whyItMattersMonday: 'Destroys simplistic karma formulas. When life collapses, you don’t need toxic-positivity advice; you need the guts to question honestly and worship in the rubble.',
    anchorScripture: {
      reference: 'Job 19:25',
      canonicalText: 'For I know that my Redeemer lives, and at the last he will stand upon the earth.',
      streetTranslation: 'Even with my flesh rotting and my world in ashes, I know my Defender is alive and He will have the final word in this courtroom.',
      takeaway: 'Anchor yourself in the truth that your present pain is not the closing chapter.'
    }
  },
  {
    id: 'canon-psalms',
    name: 'Psalms',
    order: 19,
    testament: 'OT',
    division: 'Wisdom & Soul Triage',
    codename: 'The Field Medic Triage',
    subtitle: 'Battlefield songs and raw emotional triage from hunted kings and poets',
    lifeTheme: 'Anxiety & Fear',
    authorContext: 'Composed by David, Asaph, the sons of Korah, and Moses over 900 years.',
    historicalPeril: 'Caves of Adullam, night panics, treachery of best friends, and deep grief.',
    whyItMattersMonday: 'The Bible’s emotional emergency room. Gives you permission to bring anger, panic, guilt, and tears straight into God’s presence without filtering.',
    anchorScripture: {
      reference: 'Psalm 46:1',
      canonicalText: 'God is our refuge and strength, a very present help in trouble.',
      streetTranslation: 'God is our bunker and our armor plating—an active backup unit already standing right next to you in the fight.',
      takeaway: 'Run to God as your first shelter rather than numb yourself with screens or food.'
    },
    deepLinkType: 'psalms'
  },
  {
    id: 'canon-proverbs',
    name: 'Proverbs',
    order: 20,
    testament: 'OT',
    division: 'Wisdom & Soul Triage',
    codename: 'The Tactical Codex',
    subtitle: 'King Solomon’s street-smart manual for business, speech, and boundaries',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Compiled primarily by Solomon with royal editors under King Hezekiah.',
    historicalPeril: 'Navigating cutthroat royal courts, financial traps, and predatory seduction.',
    whyItMattersMonday: 'High-stakes practical intelligence for money, meetings, anger management, and spotting toxic allies before they ruin your career.',
    anchorScripture: {
      reference: 'Proverbs 4:23',
      canonicalText: 'Keep your heart with all vigilance, for from it flow the springs of life.',
      streetTranslation: 'Post armed sentries at the gates of your mind. Everything about your future depends on what you allow inside your thought life.',
      takeaway: 'Audit what you watched and listened to this morning. Clean out mental junk.'
    },
    deepLinkType: 'proverbs'
  },
  {
    id: 'canon-ecclesiastes',
    name: 'Ecclesiastes',
    order: 21,
    testament: 'OT',
    division: 'Wisdom & Soul Triage',
    codename: 'The Burnout Antidote',
    subtitle: 'Deconstructing status, wealth, and workaholism under the sun',
    lifeTheme: 'Burnout & Meaning',
    authorContext: 'Kohelet (The Teacher / Solomon) looking back on decades of royal excess.',
    historicalPeril: 'Experiencing everything money and power could buy and finding emptiness.',
    whyItMattersMonday: 'The antidote to modern rat-race exhaustion. Tells you straight that career success alone will never scratch your deepest itch; enjoy simple food, honest work, and fear God.',
    anchorScripture: {
      reference: 'Ecclesiastes 3:11',
      canonicalText: 'He has made everything beautiful in its time. Also, he has put eternity into man’s heart, yet so that he cannot find out what God has done from the beginning to the end.',
      streetTranslation: 'God planted a hunger for eternity deep in your chest—which is why no salary, promotion, or vacation can ever permanently satisfy you.',
      takeaway: 'Stop expecting your job or bank account to satisfy an eternal craving.'
    }
  },
  {
    id: 'canon-songofsolomon',
    name: 'Song of Solomon',
    order: 22,
    testament: 'OT',
    division: 'Wisdom & Soul Triage',
    codename: 'The Fierce Covenant',
    subtitle: 'Unapologetic passion, romantic pursuit, and relational boundaries',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Poetic dialogue between a bride, the royal lover, and friends.',
    historicalPeril: 'Living in an era where love was often treated as a cold financial transaction or pagan lust.',
    whyItMattersMonday: 'Celebrates marital desire, verbal affirmation, and fierce loyalty. Love is not a weak feeling—it is as unyielding and fierce as the grave.',
    anchorScripture: {
      reference: 'Song of Solomon 8:6',
      canonicalText: 'Set me as a seal upon your heart, as a seal upon your arm, for love is strong as death, jealousy is fierce as the grave.',
      streetTranslation: 'Brand my name into your chest like a royal wax seal. True covenant love is tougher than death itself.',
      takeaway: 'Send an intentional word of deep honor and affection to your spouse today.'
    }
  },

  // ==========================================
  // PROPHET INTELLIGENCE NETWORK (17 BOOKS)
  // ==========================================
  {
    id: 'canon-isaiah',
    name: 'Isaiah',
    order: 23,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Throne Room Prophet',
    subtitle: 'Geopolitical warnings, the Suffering Servant, and new creation visions',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Prophet in the royal court of Jerusalem across the reigns of 4 kings.',
    historicalPeril: 'The Assyrian siege of Jerusalem and impending Babylonian deportation.',
    whyItMattersMonday: 'Contains the clearest foretaste of Jesus Christ 700 years before His birth, paired with rock-solid promises for those feeling weary.',
    anchorScripture: {
      reference: 'Isaiah 40:31',
      canonicalText: 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
      streetTranslation: 'Those who lock their eyes on the Lord will trade their drained batteries for divine energy. You will run and not hit the wall.',
      takeaway: 'Trade your exhausted striving for patient waiting in God’s presence.'
    }
  },
  {
    id: 'canon-jeremiah',
    name: 'Jeremiah',
    order: 24,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Iron Pillar',
    subtitle: 'Speaking unpopular truth to a collapsing society while imprisoned in mud pits',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'The "weeping prophet" ministering in the death throes of Judah.',
    historicalPeril: 'Threatened by his own hometown, thrown into a subterranean muddy cistern, and rejected by kings.',
    whyItMattersMonday: 'When your colleagues or culture drift into madness, holding the line will make you unpopular. Jeremiah teaches you how to stand like an iron pillar.',
    anchorScripture: {
      reference: 'Jeremiah 29:11',
      canonicalText: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
      streetTranslation: 'Spoken not to comfortable tourists, but to captives in Babylon: I still have the blueprint for your survival and your future.',
      takeaway: 'Remember that even in an exile season, God’s master blueprint remains active.'
    }
  },
  {
    id: 'canon-lamentations',
    name: 'Lamentations',
    order: 25,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Ash Heap Dirge',
    subtitle: 'Grieving total catastrophe without sugarcoating the devastation',
    lifeTheme: 'Unfair Pain & Betrayal',
    authorContext: 'Five acrostic funeral poems written over the smoldering ruins of Jerusalem.',
    historicalPeril: 'Sitting in the ashes of the burnt temple after Babylonian slaughter.',
    whyItMattersMonday: 'Grief needs a voice. In the exact dead center of the book’s deepest sorrow shines the most famous promise of morning mercies.',
    anchorScripture: {
      reference: 'Lamentations 3:22-23',
      canonicalText: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.',
      streetTranslation: 'His fierce loyalty doesn’t expire. His mercy reboots fresh every single morning when you open your eyes.',
      takeaway: 'No matter how badly yesterday went, today’s counter is wiped completely clean.'
    }
  },
  {
    id: 'canon-ezekiel',
    name: 'Ezekiel',
    order: 26,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Valley of Dry Bones',
    subtitle: 'Bizarre street-theater prophecies, celestial chariots, and reviving corpses',
    lifeTheme: 'Burnout & Meaning',
    authorContext: 'Priest-prophet writing from the refugee camp along the Chebar River in Babylon.',
    historicalPeril: 'Living as a displaced prisoner of war with zero political leverage.',
    whyItMattersMonday: 'Can dead situations live again? God shows Ezekiel a desert valley of bleached skeletons and turns them into a standing army through the breath of His Spirit.',
    anchorScripture: {
      reference: 'Ezekiel 36:26',
      canonicalText: 'And I will give you a new heart, and a new spirit I will put within you. And I will remove the heart of stone from your flesh and give you a heart of flesh.',
      streetTranslation: 'I will surgically excise that callous, cynical rock inside your chest and transplant a soft, responsive heart.',
      takeaway: 'Ask God to melt the cynical hardness you’ve built up to protect yourself from getting hurt.'
    }
  },
  {
    id: 'canon-daniel',
    name: 'Daniel',
    order: 27,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'Undercover in Babylon',
    subtitle: 'Thriving in elite pagan corridors without losing your moral backbone',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Exile statesman serving at the highest levels of Babylonian and Persian empires.',
    historicalPeril: 'Death decrees in blazing furnaces, lions’ dens, and imperial indoctrination.',
    whyItMattersMonday: 'The premier playbook for Christian professionals navigating secular corporate politics. Daniel outlasted four pagan kings through unmatched competence and quiet prayer.',
    anchorScripture: {
      reference: 'Daniel 3:17-18',
      canonicalText: 'Our God whom we serve is able to deliver us... But if not, be it known to you, O king, that we will not serve your gods.',
      streetTranslation: 'Our God can snatch us out of your furnace. But even if He doesn’t, we will never bow to your golden statue.',
      takeaway: 'Draw your line in the sand before the pressure hits. Decide what you will never compromise.'
    },
    deepLinkType: 'story',
    deepLinkId: 'daniel-journey'
  },
  {
    id: 'canon-hosea',
    name: 'Hosea',
    order: 28,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Relentless Pursuit',
    subtitle: 'Marrying an unfaithful partner as a living billboard of God’s scandalous grace',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Northern prophet commanded to marry Gomer to embody divine heartbreak.',
    historicalPeril: 'Israel selling out to fertility idols and geopolitical alliances.',
    whyItMattersMonday: 'When you have wandered and ruined your own life, God does not greet you with an "I told you so." He buys you back from the auction block.',
    anchorScripture: {
      reference: 'Hosea 6:6',
      canonicalText: 'For I desire steadfast love and not sacrifice, the knowledge of God rather than burnt offerings.',
      streetTranslation: 'I don’t want your robotic religious rituals. I want your heart’s genuine loyalty and your real friendship.',
      takeaway: 'Stop offering transactional religious checkboxes; bring God your authentic self.'
    }
  },
  {
    id: 'canon-joel',
    name: 'Joel',
    order: 29,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Locust Swarm Warning',
    subtitle: 'Ecological collapse, the Day of the Lord, and the outpouring of the Spirit',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'Prophet addressing Judah after a devastating agricultural locust plague.',
    historicalPeril: 'Complete destruction of the economy, crops, and national food supply.',
    whyItMattersMonday: 'God promises to restore the years the locusts have eaten. No matter how much time or money you lost during a wasted season, God can accelerate redemption.',
    anchorScripture: {
      reference: 'Joel 2:25',
      canonicalText: 'I will restore to you the years that the swarming locust has eaten.',
      streetTranslation: 'I will pay you back for the lost seasons where everything seemed stripped down to the bark.',
      takeaway: 'Stop mourning lost years. God is able to compress supernatural growth into your next season.'
    }
  },
  {
    id: 'canon-amos',
    name: 'Amos',
    order: 30,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Blue-Collar Roar',
    subtitle: 'A rugged sycamore fig farmer calling out billionaire greed and crooked judges',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Shepherd from rural Tekoa sent north to the luxury resorts of Samaria.',
    historicalPeril: 'Wealthy elites trampling the poor while maintaining pious religious ceremonies.',
    whyItMattersMonday: 'If your faith does not impact how you treat low-income workers, your suppliers, and the vulnerable, God hates your religious music.',
    anchorScripture: {
      reference: 'Amos 5:24',
      canonicalText: 'But let justice roll down like waters, and righteousness like an ever-flowing stream.',
      streetTranslation: 'Cut the religious songs. Let real justice flood the streets like a bursting flash flood that never dries up.',
      takeaway: 'Actively stand up for a junior employee or contractor being shortchanged at work.'
    }
  },
  {
    id: 'canon-obadiah',
    name: 'Obadiah',
    order: 31,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Cliff Fortress Fall',
    subtitle: 'Calling out the arrogance of Edom for gloating over a brother’s ruin',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Shortest Old Testament book directed at the high mountain redoubts of Petra.',
    historicalPeril: 'Edom standing at the crossroads looting refugees when Babylon sacked Jerusalem.',
    whyItMattersMonday: 'Never celebrate when someone you dislike crashes. Gloating over an adversary’s ruin invites divine judgment onto your own head.',
    anchorScripture: {
      reference: 'Obadiah 1:3',
      canonicalText: 'The pride of your heart has deceived you, you who live in the clefts of the rock, whose dwelling is high, who say in your heart, "Who will bring me down to the ground?"',
      streetTranslation: 'Your arrogance has tricked your brain into thinking you’re untouchable in your high-rise penthouse. I will drag you down.',
      takeaway: 'Guard against smug satisfaction when a competitor or rival stumbles.'
    }
  },
  {
    id: 'canon-jonah',
    name: 'Jonah',
    order: 32,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Reluctant Maverick',
    subtitle: 'Why a patriotic prophet fled in the opposite direction from God’s grace',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Satirical historical narrative exposing the bitter heart of a nationalist prophet.',
    historicalPeril: 'Assyrian Nineveh was famous for decapitations, impalement, and torture.',
    whyItMattersMonday: 'Jonah didn’t flee because he was afraid Nineveh would kill him—he fled because he was terrified God would show them mercy. Exposes our hatred of our enemies.',
    anchorScripture: {
      reference: 'Jonah 4:2',
      canonicalText: 'I knew that you are a gracious God and merciful, slow to anger and abounding in steadfast love, and relenting from disaster.',
      streetTranslation: 'I knew it! I ran away because I knew you’re too gracious, too patient, and you’d actually forgive the people I hate.',
      takeaway: 'Pray an honest blessing over the person or group you find most repulsive.'
    },
    deepLinkType: 'story',
    deepLinkId: 'jonah-journey'
  },
  {
    id: 'canon-micah',
    name: 'Micah',
    order: 33,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Street Litigator',
    subtitle: 'Indicting crooked land barons and predicting the Bethlehem ruler',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'Rural prophet defending exploited farming families in Judah.',
    historicalPeril: 'Corrupt real estate syndicates foreclosing on widows’ homes at night.',
    whyItMattersMonday: 'Cuts through religious complexity with three razor-sharp rules: do justice, love mercy, and walk humbly with your God.',
    anchorScripture: {
      reference: 'Micah 6:8',
      canonicalText: 'He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?',
      streetTranslation: 'He already gave you the playbook: Stop complicating it. Do the right thing, fiercely love mercy, and walk without ego alongside your God.',
      takeaway: 'Simplify your life today: check yourself on justice, kindness, and humility.'
    }
  },
  {
    id: 'canon-nahum',
    name: 'Nahum',
    order: 34,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Fortress Demolition',
    subtitle: 'The inevitable collapse of brutal military superpowers',
    lifeTheme: 'Unfair Pain & Betrayal',
    authorContext: 'Poetic oracle declaring the imminent overthrow of Nineveh.',
    historicalPeril: 'A century after Jonah, Nineveh returned to genocidal violence across the fertile crescent.',
    whyItMattersMonday: 'No matter how heavily fortified a tyrannical system or corrupt monopoly appears, its expiration date is already stamped in heaven.',
    anchorScripture: {
      reference: 'Nahum 1:7',
      canonicalText: 'The Lord is good, a stronghold in the day of trouble; he knows those who take refuge in him.',
      streetTranslation: 'The Lord is solid through and through. In a day of total chaos, He is the reinforced bunker that cannot be breached.',
      takeaway: 'Rest in the knowledge that corrupt bullies will not escape accountability.'
    }
  },
  {
    id: 'canon-habakkuk',
    name: 'Habakkuk',
    order: 35,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Watchtower Interrogation',
    subtitle: 'Wrestling with God when evil wins and society unravels',
    lifeTheme: 'Anxiety & Fear',
    authorContext: 'A prophet who starts by aggressively cross-examining God and ends in worship.',
    historicalPeril: 'Seeing his homeland overrun by the ruthless, arrogant Chaldean army.',
    whyItMattersMonday: 'Teaches you how to stand in the watchtower when nothing makes sense. Even when the crops fail and the business goes under, joy can be rooted in God.',
    anchorScripture: {
      reference: 'Habakkuk 3:17-18',
      canonicalText: 'Though the fig tree should not blossom, nor fruit be on the vines... yet I will rejoice in the Lord; I will take joy in the God of my salvation.',
      streetTranslation: 'Even if the economy crashes, the savings account drains, and every deal falls through—I will still stand tall and rejoice in my Savior.',
      takeaway: 'Detach your emotional joy from your bank balance today.'
    }
  },
  {
    id: 'canon-zephaniah',
    name: 'Zephaniah',
    order: 36,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Search with Lanterns',
    subtitle: 'God hunting down complacent complacency in the dark alleys',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'Great-great-grandson of King Hezekiah prophesying before King Josiah’s reforms.',
    historicalPeril: 'Cynical urbanites saying in their hearts: "The Lord will not do good, nor will he do ill."',
    whyItMattersMonday: 'A wake-up call against apathy and lukewarmness. God promises to silence our fears and sing over His people with loud celebration.',
    anchorScripture: {
      reference: 'Zephaniah 3:17',
      canonicalText: 'The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love; he will exult over you with loud singing.',
      streetTranslation: 'The Champion is standing in your corner. He will hush your frantic anxiety with His love and literally sing with joy over you.',
      takeaway: 'Let the truth that God celebrates over you quiet your inner critic.'
    }
  },
  {
    id: 'canon-haggai',
    name: 'Haggai',
    order: 37,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Foundation Audit',
    subtitle: 'Why your wallet has holes in it: auditing your real priorities',
    lifeTheme: 'Burnout & Meaning',
    authorContext: 'Post-exilic prophet confronting returned settlers who abandoned the temple.',
    historicalPeril: 'Settlers investing all their resources in luxury cedar home renovations while God’s work lay in ruins.',
    whyItMattersMonday: 'Ever feel like you work 80 hours a week and your paycheck disappears like water through a sieve? Haggai says: "Consider your ways. Put first things first."',
    anchorScripture: {
      reference: 'Haggai 1:5-6',
      canonicalText: 'Now, therefore, thus says the Lord of hosts: Consider your ways. You have sown much, and harvested little. You eat, but you never have enough.',
      streetTranslation: 'Audit your life right now. You’re pouring energy into your own luxury while earning wages to put into a purse full of holes.',
      takeaway: 'Realign your spending and calendar with what actually builds God’s kingdom.'
    }
  },
  {
    id: 'canon-zechariah',
    name: 'Zechariah',
    order: 38,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Night Visions War Room',
    subtitle: 'Apocalyptic horsemen, golden lampstands, and the humble King on a donkey',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Young priestly prophet partnering with Haggai in Jerusalem’s rebuild.',
    historicalPeril: 'Small, impoverished community surrounded by mocking regional superpowers.',
    whyItMattersMonday: 'Big mountains are not leveled by human brute force or political hustle, but by the quiet power of the Spirit.',
    anchorScripture: {
      reference: 'Zechariah 4:6',
      canonicalText: 'Not by might, nor by power, but by my Spirit, says the Lord of hosts.',
      streetTranslation: 'Not by raw muscle, and not by political leverage, but by the quiet fire of My Spirit.',
      takeaway: 'Stop trying to batter down the door with willpower. Ask the Holy Spirit for strategy.'
    }
  },
  {
    id: 'canon-malachi',
    name: 'Malachi',
    order: 39,
    testament: 'OT',
    division: 'Prophet Intelligence',
    codename: 'The Cold-Heart Debate',
    subtitle: 'God’s final confrontation before 400 years of intertestamental silence',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'Last prophetic voice of the Old Testament calling out cynical half-heartedness.',
    historicalPeril: 'Priests offering blind, diseased sheep on the altar while keeping healthy ones for themselves.',
    whyItMattersMonday: 'God hates when we give Him our leftover scrap energy after the world gets our prime hours. He calls for wholehearted, cheerful honoring.',
    anchorScripture: {
      reference: 'Malachi 3:10',
      canonicalText: 'Bring the full tithe into the storehouse... and thereby put me to the test, says the Lord of hosts, if I will not open the windows of heaven for you.',
      streetTranslation: 'Bring your firstfruits and put Me to the test. See if I don’t blow open the floodgates of heaven with blessings you can’t even contain.',
      takeaway: 'Give God your first hour and your primary tithe instead of your scraps.'
    }
  },

  // ==========================================
  // THE KING'S MANIFESTO & ACTS (5 BOOKS)
  // ==========================================
  {
    id: 'canon-matthew',
    name: 'Matthew',
    order: 40,
    testament: 'NT',
    division: 'The King\'s Manifesto',
    codename: 'The King’s Blueprint',
    subtitle: 'From the Sermon on the Mount to the Great Commission invasion',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'Levi / Matthew, hated tax collector turned apostle and royal biographer.',
    historicalPeril: 'Written to Jewish believers struggling under brutal Roman occupation and rabbinic ostracism.',
    whyItMattersMonday: 'The Sermon on the Mount is the counter-cultural constitution for living in an anxious world: turning the other cheek, going the second mile, and building on the rock.',
    anchorScripture: {
      reference: 'Matthew 6:33',
      canonicalText: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
      streetTranslation: 'Put the King’s agenda in slot #1. Stop hyperventilating over tomorrow’s rent and clothes; everything else will lock into place.',
      takeaway: 'Start today by asking: "What advances God’s kingdom right here?"'
    }
  },
  {
    id: 'canon-mark',
    name: 'Mark',
    order: 41,
    testament: 'NT',
    division: 'The King\'s Manifesto',
    codename: 'The Blitzkrieg Gospel',
    subtitle: 'Fast-paced, urgent action: Jesus as the relentless Servant-Warrior',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'John Mark recording Simon Peter’s raw eyewitness memoirs in Rome.',
    historicalPeril: 'Neronian persecutions where Roman believers were thrown to lions or burned as torches.',
    whyItMattersMonday: 'No long academic speeches. Mark uses the Greek word "immediately" over 40 times. Jesus moves straight into the teeth of disease, demons, and political corruption.',
    anchorScripture: {
      reference: 'Mark 10:45',
      canonicalText: 'For even the Son of Man came not to be served but to serve, and to give his life as a ransom for many.',
      streetTranslation: 'The King of the cosmos didn’t show up demanding an entourage. He arrived with a towel to wash feet and lay down His life.',
      takeaway: 'Find the lowest, most thankless task in your office or home today and do it with joy.'
    },
    deepLinkType: 'story',
    deepLinkId: 'john-baptist-journey'
  },
  {
    id: 'canon-luke',
    name: 'Luke',
    order: 42,
    testament: 'NT',
    division: 'The King\'s Manifesto',
    codename: 'The Outcast Physician',
    subtitle: 'Investigative history focused on outsiders, women, lepers, and the prodigal son',
    lifeTheme: 'Unfair Pain & Betrayal',
    authorContext: 'Dr. Luke, Gentile physician and traveling companion of the apostle Paul.',
    historicalPeril: 'Navigating Roman aristocracy while documenting a movement rooted in the marginalized.',
    whyItMattersMonday: 'Shows that no matter how radioactive your past is, Jesus specializes in finding the lost, the disqualified, and the broken, bringing them to the head table.',
    anchorScripture: {
      reference: 'Luke 19:10',
      canonicalText: 'For the Son of Man came to seek and to save the lost.',
      streetTranslation: 'The mission objective was never to build an exclusive country club; it was a search-and-rescue operation for the broken.',
      takeaway: 'Treat that struggling, awkward person around you as the exact target of God’s grace.'
    }
  },
  {
    id: 'canon-john',
    name: 'John',
    order: 43,
    testament: 'NT',
    division: 'The King\'s Manifesto',
    codename: 'The Cosmic Light',
    subtitle: 'The Word made flesh, seven supernatural signs, and the "I AM" claims',
    lifeTheme: 'Burnout & Meaning',
    authorContext: 'John the Beloved Apostle reflecting from Ephesus in his elderly years.',
    historicalPeril: 'Early gnostic heresy denying Christ’s true humanity and Roman imperial worship.',
    whyItMattersMonday: 'Deep philosophical and spiritual grounding. You are not a random biological accident; you are loved by the Word through whom galaxies were spoken into existence.',
    anchorScripture: {
      reference: 'John 14:6',
      canonicalText: 'Jesus said to him, "I am the way, and the truth, and the life. No one comes to the Father except through me."',
      streetTranslation: 'I am the runway, the unvarnished reality, and the heartbeat of life. You don’t find the Father through a religious system; you find Him through Me.',
      takeaway: 'Stop looking for life in accomplishments; connect with the Person of Jesus.'
    }
  },
  {
    id: 'canon-acts',
    name: 'Acts of the Apostles',
    order: 44,
    testament: 'NT',
    division: 'The King\'s Manifesto',
    codename: 'The Unstoppable Movement',
    subtitle: 'From a terrified upper room to flipping the Roman Empire upside down',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Dr. Luke recording the 30-year expansion of the church from Jerusalem to Rome.',
    historicalPeril: 'Stoning of Stephen, imperial executions, prison breaks, and riots across Greece.',
    whyItMattersMonday: 'Shows ordinary, uneducated men and women operating with supernatural boldness. When the Holy Spirit hits, fear evaporates.',
    anchorScripture: {
      reference: 'Acts 1:8',
      canonicalText: 'But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth.',
      streetTranslation: 'You will be equipped with explosive power when the Spirit drops. You will be My frontline witnesses in your hometown and to the edge of the map.',
      takeaway: 'Ask the Holy Spirit for bold words before entering your next conversation.'
    },
    deepLinkType: 'story',
    deepLinkId: 'paul-journey'
  },

  // ==========================================
  // FIELD DISPATCHES (21 EPISTLES)
  // ==========================================
  {
    id: 'canon-romans',
    name: 'Romans',
    order: 45,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Legal Emancipation',
    subtitle: 'The supreme theological brief on justification, grace, and life in the Spirit',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Paul writing from Corinth preparing his final journey to Jerusalem and Spain.',
    historicalPeril: 'Racial and cultural friction between Jewish and Gentile believers in imperial Rome.',
    whyItMattersMonday: 'Kills religious performance anxiety. You are not accepted by God because you had a flawless week; you are justified as a gift of pure grace through faith.',
    anchorScripture: {
      reference: 'Romans 8:1',
      canonicalText: 'There is therefore now no condemnation for those who are in Christ Jesus.',
      streetTranslation: 'Case dismissed. The gavel has come down. Zero condemnation, zero guilt-tripping for anyone locked in Christ Jesus.',
      takeaway: 'Silence the condemning voice in your head: you are fully pardoned and adopted.'
    }
  },
  {
    id: 'canon-1corinthians',
    name: '1 Corinthians',
    order: 46,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Riotous Church Fix',
    subtitle: 'Tackling lawsuits, sexual anarchy, ego factions, and spiritual gifts',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Paul writing to the wild, hyper-commercial port city of Corinth.',
    historicalPeril: 'Believers taking each other to pagan civil courts and partying in temples.',
    whyItMattersMonday: 'Direct real-world conflict resolution. The famous Love Chapter (1 Cor 13) wasn’t written for weddings—it was written for an argumentative, selfish team.',
    anchorScripture: {
      reference: '1 Corinthians 16:13-14',
      canonicalText: 'Be watchful, stand firm in the faith, act like men, be strong. Let all that you do be done in love.',
      streetTranslation: 'Stay alert. Keep both feet planted in the truth. Grow a spine, be strong—and make sure every single move is driven by genuine love.',
      takeaway: 'Combine courage with kindness. Be tough on truth, but tender with people.'
    }
  },
  {
    id: 'canon-2corinthians',
    name: '2 Corinthians',
    order: 47,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'Strength in Broken Jars',
    subtitle: 'Paul’s rawest, most vulnerable defense of weakness as true ministry power',
    lifeTheme: 'Unfair Pain & Betrayal',
    authorContext: 'Written in Macedonia after surviving near-death trauma in Asia.',
    historicalPeril: 'Slick "super-apostles" ridiculing Paul’s physical appearance and suffering.',
    whyItMattersMonday: 'You don’t have to pretend you have it all together. God doesn’t pour His glory into shiny gold trophies—He pours it into cracked clay jars so He gets the credit.',
    anchorScripture: {
      reference: '2 Corinthians 12:9',
      canonicalText: 'My grace is sufficient for you, for my power is made perfect in weakness.',
      streetTranslation: 'My favor is all you need. My horsepower reaches its peak right when your human strength runs out.',
      takeaway: 'Stop hiding your limitations; let God display His power through them.'
    }
  },
  {
    id: 'canon-galatians',
    name: 'Galatians',
    order: 48,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Freedom Declaration',
    subtitle: 'Nuking legalistic performance and walking by the radical Spirit',
    lifeTheme: 'Burnout & Meaning',
    authorContext: 'Paul’s fiery letter to churches infiltrated by circumcision legalists.',
    historicalPeril: 'False teachers telling converts they had to obey archaic rituals to be saved.',
    whyItMattersMonday: 'Legalism is exhausting. Galatians frees you from the spiritual treadmill of trying to earn God’s love and unleashes the fruit of the Spirit: love, joy, and peace.',
    anchorScripture: {
      reference: 'Galatians 5:1',
      canonicalText: 'For freedom Christ has set us free; stand firm therefore, and do not submit again to a yoke of slavery.',
      streetTranslation: 'Christ broke your shackles so you could walk free. Do not let anyone drag you back onto that exhausting guilt-trip treadmill.',
      takeaway: 'Refuse to live today under the heavy burden of people-pleasing.'
    }
  },
  {
    id: 'canon-ephesians',
    name: 'Ephesians',
    order: 49,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Armor of God',
    subtitle: 'Cosmic identity in the heavenly realms and invisible spiritual warfare',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Prison letter penned while chained to a Roman imperial praetorian guard.',
    historicalPeril: 'Ephesus was the occult capital of Asia Minor, dominated by black magic and Artemis.',
    whyItMattersMonday: 'Your primary battle is not against your annoying boss or political opponents—it is against spiritual forces in unseen places. Suit up with the full armor of God.',
    anchorScripture: {
      reference: 'Ephesians 6:11',
      canonicalText: 'Put on the whole armor of God, that you may be able to stand against the schemes of the devil.',
      streetTranslation: 'Strap on the full combat gear of God so you don’t get blindsided by the enemy’s psychological booby traps.',
      takeaway: 'Consciously strap on truth, righteousness, and the shield of faith before you start work.'
    }
  },
  {
    id: 'canon-philippians',
    name: 'Philippians',
    order: 50,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'Joy in Iron Chains',
    subtitle: 'Unshakable gladness and mental peace written from death row',
    lifeTheme: 'Anxiety & Fear',
    authorContext: 'Paul in Roman house arrest awaiting potential beheading.',
    historicalPeril: 'Facing execution while rival preachers tried to kick him while he was down.',
    whyItMattersMonday: 'Joy is not dependent on your circumstances. If a man in chains facing execution can write a letter bubbling with joy, you can find peace in your traffic jam.',
    anchorScripture: {
      reference: 'Philippians 4:6-7',
      canonicalText: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.',
      streetTranslation: 'Stop letting panic spiral in your chest. Dump the entire load onto God with thankfulness, and His peace will stand guard like an armed sentry over your mind.',
      takeaway: 'Whenever worry hits your gut, replace it with three specific things you are grateful for.'
    }
  },
  {
    id: 'canon-colossians',
    name: 'Colossians',
    order: 51,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Supremacy Brief',
    subtitle: 'The supreme Architect of creation vs. mystical self-help philosophy',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Prison letter combating syncretistic angel-worship and legalism in Phrygia.',
    historicalPeril: 'Intellectual gurus claiming believers needed secret cosmic knowledge to be complete.',
    whyItMattersMonday: 'You don’t need 12 secret self-help rituals. In Christ, all the fullness of God lives in bodily form, and you have been filled to completeness in Him.',
    anchorScripture: {
      reference: 'Colossians 3:23',
      canonicalText: 'Whatever you do, work heartily, as for the Lord and not for men.',
      streetTranslation: 'Whatever task lands on your desk, put your back into it as if you’re reporting directly to King Jesus instead of a human manager.',
      takeaway: 'Treat your most boring work task today as an act of worship to Christ.'
    }
  },
  {
    id: 'canon-1thessalonians',
    name: '1 Thessalonians',
    order: 52,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Second Coming Watch',
    subtitle: 'Standing firm under persecution, holy living, and the trumpet blast',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'One of Paul’s earliest letters sent back to a young, persecuted Macedonian church.',
    historicalPeril: 'Mobs attacking believers and hauling leaders before the politarchs.',
    whyItMattersMonday: 'Live with quiet diligence. Work with your hands, mind your own business, and live with eternal perspective because the King is coming back.',
    anchorScripture: {
      reference: '1 Thessalonians 5:16-18',
      canonicalText: 'Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.',
      streetTranslation: 'Stay upbeat continuously. Keep an open hotline of prayer running in the background of your mind. Find gratitude in every situation.',
      takeaway: 'Maintain a running, informal conversation with God throughout your errands today.'
    }
  },
  {
    id: 'canon-2thessalonians',
    name: '2 Thessalonians',
    order: 53,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Anti-Slack Manifesto',
    subtitle: 'Clearing up end-times panic and telling lazy loafers to get to work',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Follow-up letter addressing forged letters that claimed the Day of the Lord had passed.',
    historicalPeril: 'People quitting their jobs and sponging off others because they thought Jesus arrived.',
    whyItMattersMonday: 'Antidote to spiritual laziness: "If anyone is not willing to work, let him not eat." End-times hope produces industrious discipline, not lazy daydreaming.',
    anchorScripture: {
      reference: '2 Thessalonians 3:13',
      canonicalText: 'As for you, brothers, do not grow weary in doing good.',
      streetTranslation: 'Do not let fatigue drag your arms down. Keep doing what is right even when nobody says thank you.',
      takeaway: 'Do the right, honorable thing today even if you receive zero recognition.'
    }
  },
  {
    id: 'canon-1timothy',
    name: '1 Timothy',
    order: 54,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Young Commander Manual',
    subtitle: 'Leadership standards, handling toxic teachers, and the danger of money',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Pastoral mentorship letter from veteran Paul to young protege Timothy in Ephesus.',
    historicalPeril: 'Arrogant elders hijacking church meetings with endless genealogies and myths.',
    whyItMattersMonday: 'A field manual on leadership character: you cannot lead others effectively if your personal finances, temper, and integrity are a dumpster fire.',
    anchorScripture: {
      reference: '1 Timothy 4:12',
      canonicalText: 'Let no one despise you for your youth, but set the believers an example in speech, in conduct, in love, in faith, in purity.',
      streetTranslation: 'Don’t let anyone belittle you because of your age or junior status. Out-lead them by setting the gold standard in your speech, character, and discipline.',
      takeaway: 'Lead by exemplary competence and integrity rather than demanding respect.'
    }
  },
  {
    id: 'canon-2timothy',
    name: '2 Timothy',
    order: 55,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Final Torch Passing',
    subtitle: 'Paul’s death-row last will and testament from the dark Mamertine dungeon',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Chained in a freezing subterranean Roman sewer dungeon, awaiting execution.',
    historicalPeril: 'Abandoned by fair-weather friends as Emperor Nero’s persecution peaked.',
    whyItMattersMonday: 'The ultimate definition of finishing strong. When life strips everything away, what matters is keeping the faith and passing the baton with no regrets.',
    anchorScripture: {
      reference: '2 Timothy 1:7',
      canonicalText: 'For God gave us a spirit not of fear but of power and love and self-control.',
      streetTranslation: 'God never handed you a spirit of cowardice. He wired you with raw horsepower, sacrificial love, and a disciplined, sound mind.',
      takeaway: 'When fear paralyzes you today, speak this verse aloud to reboot your mental spine.'
    }
  },
  {
    id: 'canon-titus',
    name: 'Titus',
    order: 56,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'Taming the Island Pirates',
    subtitle: 'Planting disciplined order and elder character into rowdy Cretan culture',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Instructions to partner Titus left behind on the rugged island of Crete.',
    historicalPeril: 'Cretan culture was legendary for dishonesty: "Cretans are always liars, evil beasts, lazy gluttons."',
    whyItMattersMonday: 'Shows that good theology must produce good works. Talk is cheap; our character should make the gospel attractive even to cynical outsiders.',
    anchorScripture: {
      reference: 'Titus 2:11-12',
      canonicalText: 'For the grace of God has appeared, bringing salvation for all people, training us to renounce ungodliness and worldly passions, and to live self-controlled, upright, and godly lives.',
      streetTranslation: 'Grace isn’t a license to be reckless; it’s a master instructor training you to tell corrupt appetites "No!" and live with laser self-control.',
      takeaway: 'Say a clean, firm "No" to a toxic indulgence or shortcut today.'
    }
  },
  {
    id: 'canon-philemon',
    name: 'Philemon',
    order: 57,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Slaveholder Subversion',
    subtitle: 'Paul leveraging his personal credit to secure freedom for a runaway slave',
    lifeTheme: 'Family & Conflict Resolution',
    authorContext: 'Personal masterclass letter sent to a wealthy Colossian house church leader.',
    historicalPeril: 'Under Roman law, a runaway slave like Onesimus faced crucifixion or branding.',
    whyItMattersMonday: 'Radical reconciliation. Paul tells Philemon: "Charge his debt to my personal account. Receive him no longer as a slave, but as a beloved brother."',
    anchorScripture: {
      reference: 'Philemon 1:18',
      canonicalText: 'If he has wronged you at all, or owes you anything, charge that to my account.',
      streetTranslation: 'If he stole from you or burned you, put that bill on my credit card. I’ll pay it in full.',
      takeaway: 'Step into a conflict and absorb the cost to broker real peace.'
    }
  },
  {
    id: 'canon-hebrews',
    name: 'Hebrews',
    order: 58,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Superior Covenant',
    subtitle: 'Why retreating to comfortable old rituals will forfeit your eternal inheritance',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Masterful anonymous sermon addressed to Jewish Christians under social pressure.',
    historicalPeril: 'Tempted to abandon Christ and slide back to the temple system to escape persecution.',
    whyItMattersMonday: 'Jesus is superior to angels, Moses, Aaron, and all earthly anchors. The Hall of Faith (Hebrews 11) proves that faith means enduring when the prize is unseen.',
    anchorScripture: {
      reference: 'Hebrews 12:1-2',
      canonicalText: 'Let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith.',
      streetTranslation: 'Strip off every ounce of dead weight and the pet sins tripping you up. Lock your eyes on Jesus and run your lane with relentless stamina.',
      takeaway: 'Identify the "dead weight" habit slowing your spiritual momentum and drop it.'
    }
  },
  {
    id: 'canon-james',
    name: 'James',
    order: 59,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'Faith with Teeth',
    subtitle: 'Brutal street-level authenticity: taming your tongue and backing up your words',
    lifeTheme: 'Action Over Cheap Talk',
    authorContext: 'James, the brother of Jesus and bishop of the Jerusalem mother church.',
    historicalPeril: 'Scattered Jewish believers suffering economic oppression from arrogant landlords.',
    whyItMattersMonday: 'The most direct, punchy book in the New Testament. If you claim to have faith but have zero compassion for the poor and can’t control your mouth, your religion is worthless.',
    anchorScripture: {
      reference: 'James 1:22',
      canonicalText: 'But be doers of the word, and not hearers only, deceiving yourselves.',
      streetTranslation: 'Don’t just sit there nodding along to the sermon. Put boots on the ground and execute it; otherwise, you’re just conning yourself.',
      takeaway: 'Pick one practical scripture command and execute it before sunset.'
    }
  },
  {
    id: 'canon-1peter',
    name: '1 Peter',
    order: 60,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Exiles Fire Manual',
    subtitle: 'Standing unshakable when society marks you as a suspicious resident alien',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Simon Peter writing from "Babylon" (Rome) shortly before his martyrdom.',
    historicalPeril: 'Believers suffering slander, social boycotts, and violence under Emperor Nero.',
    whyItMattersMonday: 'When culture turns hostile, don’t play the victim. Win by unmatched excellence, quiet integrity, and knowing that your trial is purifying your faith like gold in a furnace.',
    anchorScripture: {
      reference: '1 Peter 5:7',
      canonicalText: 'Casting all your anxieties on him, because he cares for you.',
      streetTranslation: 'Hurl the entire weight of your panic onto His shoulders, because He is intimately tracking every detail of your life.',
      takeaway: 'Physically exhale and throw your heaviest financial or family fear onto God.'
    },
    deepLinkType: 'story',
    deepLinkId: 'peter-journey'
  },
  {
    id: 'canon-2peter',
    name: '2 Peter',
    order: 61,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Counter-Infiltration Brief',
    subtitle: 'Peter’s farewell warning against seductive charlatans and false teachers',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Peter knowing his execution is imminent, writing to protect the flock.',
    historicalPeril: 'Predatory teachers exploiting church members for money and promoting sexual license.',
    whyItMattersMonday: 'Warns against intellectual con artists who twist scripture to justify their greed. Peter tells us to add virtue, knowledge, and self-control to our faith.',
    anchorScripture: {
      reference: '2 Peter 1:3',
      canonicalText: 'His divine power has granted to us all things that pertain to life and godliness.',
      streetTranslation: 'His supernatural power has already equipped you with every single tool required to navigate life and stay clean.',
      takeaway: 'You lack nothing needed to honor God today. Stop making excuses.'
    }
  },
  {
    id: 'canon-1john',
    name: '1 John',
    order: 62,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Black & White Audit',
    subtitle: 'Zero shades of grey: walking in the light vs. pretending you have no sin',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'The aged apostle John writing affectionately to his "little children" in Asia Minor.',
    historicalPeril: 'Gnostic elitists claiming that the physical body didn’t matter so sin had no consequence.',
    whyItMattersMonday: 'Cuts through religious hypocrisy. If you say you love God while despising your brother, you are walking in pitch blackness. Perfect love casts out all fear.',
    anchorScripture: {
      reference: '1 John 4:18',
      canonicalText: 'There is no fear in love, but perfect love casts out fear. For fear has to do with punishment.',
      streetTranslation: 'There is zero room for fear in authentic love. Unconditional love kicks terror right out the front door.',
      takeaway: 'Let God’s love drive out your performance terror and social anxiety.'
    }
  },
  {
    id: 'canon-2john',
    name: '2 John',
    order: 63,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Gatekeeper Directive',
    subtitle: 'Refusing hospitality and backing to teachers who water down the truth',
    lifeTheme: 'Integrity in Toxic Cultures',
    authorContext: 'Short, sharp personal dispatch from John to "the elect lady and her children."',
    historicalPeril: 'Traveling religious grifters fleecing house churches for lodging and funds.',
    whyItMattersMonday: 'Love without truth is soft sentimentality; truth without love is harsh legalism. Guard your door against supporting ideas that destroy people.',
    anchorScripture: {
      reference: '2 John 1:6',
      canonicalText: 'And this is love, that we walk according to his commandments.',
      streetTranslation: 'Real love isn’t warm feelings; it’s walking in radical alignment with His battle orders.',
      takeaway: 'Align your actions with God’s commands today rather than your fluctuating moods.'
    }
  },
  {
    id: 'canon-3john',
    name: '3 John',
    order: 64,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Church Boss Showdown',
    subtitle: 'Calling out the narcissistic church boss Diotrephes and praising loyal Gaius',
    lifeTheme: 'Workplace & Career Pressure',
    authorContext: 'Personal postcard to Gaius regarding a toxic church dictator.',
    historicalPeril: 'Diotrephes loving first place, badmouthing the apostles, and excommunicating rivals.',
    whyItMattersMonday: 'Every modern company or ministry has a "Diotrephes"—someone obsessed with power and control who sabotages teammates. John models how to confront bullies with courage.',
    anchorScripture: {
      reference: '3 John 1:11',
      canonicalText: 'Beloved, do not imitate evil but imitate good. Whoever does good is from God; whoever does evil has not seen God.',
      streetTranslation: 'Never copy bad leadership behavior just because it seems to work. Model the good; anyone doing dirty moves doesn’t know God.',
      takeaway: 'Refuse to adopt cutthroat office politics just because your manager does.'
    }
  },
  {
    id: 'canon-jude',
    name: 'Jude',
    order: 65,
    testament: 'NT',
    division: 'Field Dispatches',
    codename: 'The Perimeter Defense',
    subtitle: 'Sounding the battle siren against covert infiltration into the ranks',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Jude, brother of James and half-brother of Jesus.',
    historicalPeril: 'Subversive teachers sneaking into love feasts, turning grace into an excuse for immorality.',
    whyItMattersMonday: 'A fiery 25-verse perimeter alarm. Reminds us to contend earnestly for the faith while rescuing those who doubt with fierce compassion.',
    anchorScripture: {
      reference: 'Jude 1:24-25',
      canonicalText: 'Now to him who is able to keep you from stumbling and to present you blameless before the presence of his glory with great joy...',
      streetTranslation: 'To the Master who has the power to keep your feet from slipping on the ice, and will present you standing tall and spotless with explosive joy...',
      takeaway: 'Rest in the God who has the grip to keep you from slipping.'
    }
  },

  // ==========================================
  // THE COSMIC ENDGAME (1 BOOK)
  // ==========================================
  {
    id: 'canon-revelation',
    name: 'Revelation',
    order: 66,
    testament: 'NT',
    division: 'The Cosmic Endgame',
    codename: 'The Dragon’s Defeat',
    subtitle: 'Cosmic war, the fall of Babylon, and the final triumph of the Lamb',
    lifeTheme: 'Courage Under Fire',
    authorContext: 'Apostle John writing from the penal slave colony island of Patmos under Domitian.',
    historicalPeril: 'Totalitarian Roman state demanding worship of Caesar as "Lord and God."',
    whyItMattersMonday: 'Not a confusing puzzle book to argue over—it is underground resistance literature for believers under fire. The dragon loses, Babylon falls, the Lamb wins, and every tear is wiped away.',
    anchorScripture: {
      reference: 'Revelation 21:4',
      canonicalText: 'He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away.',
      streetTranslation: 'He will reach down and wipe every tear from your face with His own hand. Death is executed. No more mourning, no more screaming in pain. The old nightmare is over.',
      takeaway: 'Anchor your hope in the finish line: the King has already secured the final victory.'
    }
  }
];

export const getCanonBookById = (id: string): CanonBook | undefined => {
  return CANON_BOOKS.find(b => b.id === id);
};

export const getCanonBooksByDivision = (division: CanonDivision): CanonBook[] => {
  return CANON_BOOKS.filter(b => b.division === division);
};
