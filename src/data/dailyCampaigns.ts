export interface DailyCampaignStep {
  stepNumber: 1 | 2 | 3 | 4;
  type: 'quest' | 'dilemma' | 'wordforge' | 'canon' | 'proverb' | 'psalm';
  title: string;
  badge: string;
  subtitle: string;
  targetId: string; // questId, dilemmaId, verseId, or bookId
  targetSecondaryId?: string; // e.g. actId for quest
  actionLabel: string;
  icon: string;
  intel: string;
}

export interface DailyCampaign {
  id: string;
  title: string;
  virtueTheme: string;
  heroName: string;
  heroIcon: string;
  heroSubtitle: string;
  summary: string;
  bonusXP: number;
  steps: DailyCampaignStep[];
}

export interface DailyCampaignProgress {
  campaignId: string;
  dateKey: string;
  completedSteps: number[]; // e.g. [1, 2]
  isFullyCompleted: boolean;
  bonusClaimed: boolean;
}

export const DAILY_CAMPAIGNS: DailyCampaign[] = [
  // 1. DAVID
  {
    id: 'campaign-david',
    title: 'The Giant Slayer Operation',
    virtueTheme: 'Courage Against Impossible Intimidation',
    heroName: 'David',
    heroIcon: 'ðŸª¨',
    heroSubtitle: 'From Overlooked Shepherd to King in the Caves',
    summary: 'Confront psychological intimidation, dismiss family hecklers, lock fearless scripture into memory, and master the Crucible of kingship.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'David: Act 1 â€¢ Psychological Warfare in the Valley',
        targetId: 'david-journey',
        targetSecondaryId: 'david-act-1',
        actionLabel: 'Enter Valley of Elah',
        icon: 'âš”ï¸',
        intel: 'Face down the 9-foot mercenary in bronze armor while Saulâ€™s army cowers on the ridge.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'Family Undermining Your Ambition',
        targetId: 'dilemma-toxic-family',
        actionLabel: 'Solve Family Mockery Sim',
        icon: 'ðŸ›¡ï¸',
        intel: 'Apply Davidâ€™s reaction to his eldest brother Eliab: never waste high-caliber ammo on low-caliber hecklers.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: '1 Samuel 17:45 â€¢ "I Come in the Name of the Lord"',
        targetId: 'story-david-act-1',
        actionLabel: 'Forge 1 Samuel 17:45',
        icon: 'ðŸ§ ',
        intel: 'Cement the unshakeable truth into your mind so intimidation evaporates when pressure hits.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: '1 Samuel â€¢ The Crown & The Crucible',
        targetId: 'canon-1samuel',
        actionLabel: 'Inspect 1 Samuel Codex',
        icon: 'ðŸ“œ',
        intel: 'Discover the Monday morning reality check: why God tests leaders in quiet pastures before crowning them in palaces.'
      }
    ]
  },

  // 2. JOSEPH
  {
    id: 'campaign-joseph',
    title: 'The Unbroken Architect',
    virtueTheme: 'Quiet Excellence & Integrity Under Unfair Blame',
    heroName: 'Joseph',
    heroIcon: 'ðŸ’',
    heroSubtitle: 'Turned Slavery and Prison Into Dominion',
    summary: 'Navigate betrayal, let receipts speak louder than anger, memorize the sovereignty of God, and study the Genesis Code.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Joseph: Act 1 â€¢ The Cistern in Dothan',
        targetId: 'joseph-journey',
        targetSecondaryId: 'joseph-act-1',
        actionLabel: 'Enter The Cistern Trial',
        icon: 'âš”ï¸',
        intel: 'Stripped of your coat and thrown in a pit by your own brothers: will bitterness consume you?'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Workplace Credit Thief',
        targetId: 'dilemma-credit-thief',
        actionLabel: 'Outsmart The Credit Thief',
        icon: 'ðŸ›¡ï¸',
        intel: 'A peer takes credit for your 60 hours of labor. Execute the Joseph Play: mastery, timestamps, and undeniable receipts.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Genesis 50:20 â€¢ "God Meant It for Good"',
        targetId: 'story-joseph-act-1',
        actionLabel: 'Forge Genesis 50:20',
        icon: 'ðŸ§ ',
        intel: 'Lock in the master truth that human malice cannot overturn Godâ€™s tactical assignment for your life.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Genesis â€¢ The Foundations of Covenant',
        targetId: 'canon-genesis',
        actionLabel: 'Inspect Genesis Codex',
        icon: 'ðŸ“œ',
        intel: 'Examine the covenant architecture: how family dysfunction is redeemed into global salvation.'
      }
    ]
  },

  // 3. MOSES
  {
    id: 'campaign-moses',
    title: 'The Red Sea Commander',
    virtueTheme: 'Holding Ground When the Crowd Panics',
    heroName: 'Moses',
    heroIcon: 'ðŸªµ',
    heroSubtitle: 'From Fugitive Stutterer to Nation Builder',
    summary: 'Lead trapped people through impossible bottlenecks, disarm financial and situational panic, lock Exodus 14 into memory, and review the Iron Crucible.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Moses: Act 1 â€¢ Stuttering at the Burning Bush',
        targetId: 'moses-journey',
        targetSecondaryId: 'moses-act-1',
        actionLabel: 'Confront The Burning Bush',
        icon: 'âš”ï¸',
        intel: 'Face your excuses and imposter syndrome when God calls you to face the most ruthless empire on earth.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Financial Emergency & The Panic Loan',
        targetId: 'dilemma-financial-panic',
        actionLabel: 'Defeat The Panic Spiral',
        icon: 'ðŸ›¡ï¸',
        intel: 'When an unexpected crisis threatens your livelihood, reject predatory quick-fixes and hold your ground.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Exodus 14:14 â€¢ "The Lord Will Fight For You"',
        targetId: 'story-moses-act-1',
        actionLabel: 'Forge Exodus 14:14',
        icon: 'ðŸ§ ',
        intel: 'Memorize the command given to 2 million panicking Israelites: be still and watch God open the sea.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Exodus â€¢ The Iron Crucible & Rescue Protocol',
        targetId: 'canon-exodus',
        actionLabel: 'Inspect Exodus Codex',
        icon: 'ðŸ“œ',
        intel: 'Learn how God breaks psychological slave mindsets into disciplined covenant warriors.'
      }
    ]
  },

  // 4. DANIEL
  {
    id: 'campaign-daniel',
    title: 'The Imperial Dissident',
    virtueTheme: 'Zero Moral Compromise in Hostile Culture',
    heroName: 'Daniel',
    heroIcon: 'ðŸ¦',
    heroSubtitle: 'Outlived Four Emperors Without Bending His Knee',
    summary: 'Stand unbending in the den of corruption, reject unethical financial shortcuts, memorize Danielâ€™s deliverance, and study the Empire Protocol.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Daniel: Act 1 â€¢ The Imperial Indoctrination',
        targetId: 'daniel-journey',
        targetSecondaryId: 'daniel-act-1',
        actionLabel: 'Resist The Kingâ€™s Table',
        icon: 'âš”ï¸',
        intel: 'Captured as a teenager into Babylonâ€™s elite academy: how to outthink the empire without forfeiting your soul.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The "Nobody Will Know" Deal',
        targetId: 'dilemma-dirty-money',
        actionLabel: 'Refuse The Shady Contract',
        icon: 'ðŸ›¡ï¸',
        intel: 'Your manager invites you to fudge audit numbers for a massive quarterly bonus. Execute the fiery furnace standard.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Daniel 6:22 â€¢ "God Shut The Lions\' Mouths"',
        targetId: 'story-daniel-act-3',
        actionLabel: 'Forge Daniel 6:22',
        icon: 'ðŸ§ ',
        intel: 'Lock into memory the testimony of untarnished integrity that muzzles royal predators.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Daniel â€¢ Empire Protocol & The Unshakable Throne',
        targetId: 'canon-daniel',
        actionLabel: 'Inspect Daniel Codex',
        icon: 'ðŸ“œ',
        intel: 'Discover how to survive high-stress secular corporate halls with an untouchable inner sanctuary.'
      }
    ]
  },

  // 5. ELIJAH
  {
    id: 'campaign-elijah',
    title: 'The Whisper After the Fire',
    virtueTheme: 'Overcoming Burnout & Finding Stillness',
    heroName: 'Elijah',
    heroIcon: 'ðŸ§¥',
    heroSubtitle: 'Called Down Fire on Carmel, Wept Under the Broom Bush',
    summary: 'Recognize emotional depletion, arrest the burnout spiral at home, lock Godâ€™s gentle stillness into memory, and examine the Divided Realm.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Elijah: Act 1 â€¢ Showdown on Mount Carmel',
        targetId: 'elijah-journey',
        targetSecondaryId: 'elijah-act-1',
        actionLabel: 'Call Down Heavenly Fire',
        icon: 'âš”ï¸',
        intel: 'Single-handedly challenge 850 state-sponsored false prophets in front of a fickle, compromised nation.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The 80-Hour Burnout & Snapping at Home',
        targetId: 'dilemma-burnout-home',
        actionLabel: 'Halt The Burnout Crash',
        icon: 'ðŸ›¡ï¸',
        intel: 'Exhausted after an 80-hour week, you walk through your front door on a short fuse. Reset your nervous system before destroying relationships.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: '1 Kings 19:12 â€¢ "A Gentle Whisper in the Wind"',
        targetId: 'story-elijah-act-1',
        actionLabel: 'Forge 1 Kings 19:12',
        icon: 'ðŸ§ ',
        intel: 'Remember that God does not always speak in the hurricane or the earthquake, but in quiet, restorative stillness.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: '1 Kings â€¢ The Splendor & The Divided Realm',
        targetId: 'canon-1kings',
        actionLabel: 'Inspect 1 Kings Codex',
        icon: 'ðŸ“œ',
        intel: 'Understand how compromise in peak seasons leads to generational fractures and deep spiritual fatigue.'
      }
    ]
  },

  // 6. ESTHER
  {
    id: 'campaign-esther',
    title: 'The Silent Sovereign',
    virtueTheme: 'High-Stakes Bravery on Behalf of Others',
    heroName: 'Esther',
    heroIcon: 'ðŸª„',
    heroSubtitle: 'Orphan Exile Turned Queen Who Stopped a Genocide',
    summary: 'Step up when others stay cowardly silent, stand against groupthink and public pressure, lock courage into your soul, and inspect Estherâ€™s codex.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Esther: Act 1 â€¢ The Citadel of Susa',
        targetId: 'esther-journey',
        targetSecondaryId: 'esther-act-1',
        actionLabel: 'Enter The Persian Court',
        icon: 'âš”ï¸',
        intel: 'An undercover Jewish orphan chosen as Queen of Persia while an imperial prime minister plots total annihilation.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Group Chat Mockery & Public Pressure',
        targetId: 'dilemma-group-chat-pressure',
        actionLabel: 'Take A Principled Stand',
        icon: 'ðŸ›¡ï¸',
        intel: 'When a group chat of colleagues starts roasting a vulnerable peer, refuse cowardly conformity and draw the line.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Esther 4:14 â€¢ "For Such a Time as This"',
        targetId: 'story-esther-act-2',
        actionLabel: 'Forge Esther 4:14',
        icon: 'ðŸ§ ',
        intel: 'Lock in the reality of divine placement: you are not in your current position by accident, but for an assignment.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Esther â€¢ Silent Sovereignty in Susa',
        targetId: 'canon-esther',
        actionLabel: 'Inspect Esther Codex',
        icon: 'ðŸ“œ',
        intel: 'See how God works behind the scenes without ever mentioning His own name explicitly in the text.'
      }
    ]
  },

  // 7. NEHEMIAH
  {
    id: 'campaign-nehemiah',
    title: 'The Rebuilder\'s Shield',
    virtueTheme: 'Relentless Focus in the Face of Hecklers',
    heroName: 'Nehemiah',
    heroIcon: 'ðŸ”¨',
    heroSubtitle: 'Cupbearer Who Rebuilt Jerusalemâ€™s Ruined Walls in 52 Days',
    summary: 'Build with one hand while holding a blade in the other, defeat toxic scapegoating, lock perseverance into memory, and review Nehemiahâ€™s tactical playbook.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Nehemiah: Act 1 â€¢ Midnight Inspection of the Rubble',
        targetId: 'nehemiah-journey',
        targetSecondaryId: 'nehemiah-act-1',
        actionLabel: 'Scout The Broken Gates',
        icon: 'âš”ï¸',
        intel: 'Survey charred ash and collapsed stones in secret before organizing 40 teams of masons under constant death threats.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Scapegoating Boss',
        targetId: 'dilemma-boss-scapegoat',
        actionLabel: 'Neutralize Slander With Facts',
        icon: 'ðŸ›¡ï¸',
        intel: 'Sanballat and Tobiah smear your motives. Keep your head clear, document the timeline, and let execution silence the noise.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Nehemiah 4:14 â€¢ "Remember The Lord, Great & Awesome"',
        targetId: 'story-nehemiah-act-2',
        actionLabel: 'Forge Nehemiah 4:14',
        icon: 'ðŸ§ ',
        intel: 'Memorize the battle cry that rallies weary teams: remember who fights for your families and homes.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Nehemiah â€¢ The Rebuilderâ€™s Strategic Code',
        targetId: 'canon-nehemiah',
        actionLabel: 'Inspect Nehemiah Codex',
        icon: 'ðŸ“œ',
        intel: 'Learn master-level organizational leadership: prayer, strategic planning, security guards, and rapid execution.'
      }
    ]
  },

  // 8. PETER
  {
    id: 'campaign-peter',
    title: 'From Charcoal Fire to Iron Pillar',
    virtueTheme: 'Grace That Rebuilds You After Catastrophic Failure',
    heroName: 'Peter',
    heroIcon: 'ðŸ”¥',
    heroSubtitle: 'Fisherman Who Denied Christ Three Times, Restored to Lead the Church',
    summary: 'Turn shameful failure into seasoned leadership, handle painful friend betrayals, lock restoration scripture into your soul, and inspect 1 Peter.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Peter: Act 1 â€¢ The Midnight Storm on Galilee',
        targetId: 'peter-journey',
        targetSecondaryId: 'peter-act-1',
        actionLabel: 'Step Onto The Black Water',
        icon: 'âš”ï¸',
        intel: 'Climb over the wooden gunwale into pounding waves while the other 11 disciples grip the seats in terror.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2 â€¢ What would you do?',
        badge: 'Real-Life Scenario',
        subtitle: 'Navigating Broken Trust & Rumors',
        targetId: 'dilemma-friend-betrayal',
        actionLabel: 'Try scenario',
        icon: 'ðŸ›¡ï¸',
        intel: 'Someone in your inner circle betrayed your confidence. Choose biblical restoration over spiteful retaliation.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'John 21:17 â€¢ "Feed My Sheep"',
        targetId: 'story-peter-act-1',
        actionLabel: 'Forge John 21:17',
        icon: 'ðŸ§ ',
        intel: 'Lock in the moment of three-fold restoration: your worst failures do not disqualify your higher calling.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: '1 Peter â€¢ Exile Protocol & Fiery Crucible',
        targetId: 'canon-1peter',
        actionLabel: 'Inspect 1 Peter Codex',
        icon: 'ðŸ“œ',
        intel: 'Read Peterâ€™s mature battlefield manual for believers living under imperial harassment and mockery.'
      }
    ]
  },

  // 9. GIDEON
  {
    id: 'campaign-gideon',
    title: 'The 300 & The Broken Jar',
    virtueTheme: 'Shattering Self-Reliance to Let Godâ€™s Power Shine',
    heroName: 'Gideon',
    heroIcon: 'ðŸº',
    heroSubtitle: 'Threshing Wheat in a Winepress to Conquering Midian',
    summary: 'Conquer imposter syndrome, adapt when resources get slashed by 99%, lock victory into memory, and examine the Book of Judges.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Gideon: Act 1 â€¢ Threshing Wheat in Secret',
        targetId: 'gideon-journey',
        targetSecondaryId: 'gideon-act-1',
        actionLabel: 'Meet The Angel At The Winepress',
        icon: 'âš”ï¸',
        intel: 'Hiding from desert raiders in a cramped stone pit when God addresses you as a "Mighty Warrior."'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Demotion & Crushed Ego',
        targetId: 'dilemma-sudden-layoff',
        actionLabel: 'Pivot When Stripped of Rank',
        icon: 'ðŸ›¡ï¸',
        intel: 'When corporate strips your team from 32,000 to 300, execute the Ziklag Pivot: find strength in God and attack.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Judges 7:20 â€¢ "A Sword for the Lord & Gideon"',
        targetId: 'story-gideon-act-2',
        actionLabel: 'Forge Judges 7:20',
        icon: 'ðŸ§ ',
        intel: 'Lock into memory the principle of broken clay jars: human self-sufficiency must break before divine light blazes.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Judges â€¢ The Anarchy Spiral & Flawed Heroes',
        targetId: 'canon-judges',
        actionLabel: 'Inspect Judges Codex',
        icon: 'ðŸ“œ',
        intel: 'Understand what happens when a culture abandons truth and everyone does what is right in their own eyes.'
      }
    ]
  },

  // 10. PAUL
  {
    id: 'campaign-paul',
    title: 'Midnight Praises in Chains',
    virtueTheme: 'Unshakeable Joy Through Isolation & Setbacks',
    heroName: 'Paul',
    heroIcon: 'â›“ï¸',
    heroSubtitle: 'Pharisee Hunter Who Became the Apostle to the Nations',
    summary: 'Praise God while chained in midnight gloom, conquer late-night isolation and temptation, lock Philippians 4 into your mind, and study Joy in Chains.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Paul: Act 1 â€¢ Blinding Light on the Damascus Road',
        targetId: 'paul-journey',
        targetSecondaryId: 'paul-act-1',
        actionLabel: 'Confront The Damascus Light',
        icon: 'âš”ï¸',
        intel: 'Knocked to the dirt by the resurrected King: having your entire world view pulverized and rebuilt.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'Late Night Isolation & The Secret Escape',
        targetId: 'dilemma-digital-temptation',
        actionLabel: 'Fortify Your Guard In Isolation',
        icon: 'ðŸ›¡ï¸',
        intel: 'Alone in a hotel room at 1 AM with exhaustion creeping in. Break the loop before cheap dopamine steals your edge.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Acts 16:25 â€¢ "Praying & Singing at Midnight"',
        targetId: 'story-paul-act-1',
        actionLabel: 'Forge Acts 16:25',
        icon: 'ðŸ§ ',
        intel: 'Memorize the supernatural counter-punch: praise when your feet are locked in wooden stocks.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Philippians â€¢ Joy in Chains & Outlaw Fellowship',
        targetId: 'canon-philippians',
        actionLabel: 'Inspect Philippians Codex',
        icon: 'ðŸ“œ',
        intel: 'Learn how to possess an untouchable peace that imperial prison guards and financial fluctuations cannot crack.'
      }
    ]
  },

  // 11. JONAH
  {
    id: 'campaign-jonah',
    title: 'Surrendering the Runaway Heart',
    virtueTheme: 'Yielding Your Resentment to Godâ€™s Mercy',
    heroName: 'Jonah',
    heroIcon: 'âš“',
    heroSubtitle: 'The Reluctant Prophet Who Fled to the End of the Sea',
    summary: 'Stop sprinting in the wrong direction, release toxic grudges toward people you despise, memorize Jonahâ€™s prayer from the deep, and study Reluctant Mercy.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Jonah: Act 1 â€¢ Sleeping in the Mediterranean Tempest',
        targetId: 'jonah-journey',
        targetSecondaryId: 'jonah-act-1',
        actionLabel: 'Face The Sea Gale',
        icon: 'âš”ï¸',
        intel: 'Boarding a ship to Tarshish to run away from Godâ€™s calling, only to be awakened by pagan sailors in a category 5 storm.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Estranged Relative Asking for Bailout',
        targetId: 'dilemma-estrangement-grudge',
        actionLabel: 'Set Boundaries With Mercy',
        icon: 'ðŸ›¡ï¸',
        intel: 'Balance true forgiveness with wise, firm guardrails when dealing with family members who burned bridges.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Jonah 2:9 â€¢ "Salvation Comes From the Lord"',
        targetId: 'story-jonah-act-2',
        actionLabel: 'Forge Jonah 2:9',
        icon: 'ðŸ§ ',
        intel: 'Lock into memory the surrender confession uttered from the pitch-black belly of the great fish.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Jonah â€¢ The Reluctant Mercy',
        targetId: 'canon-jonah',
        actionLabel: 'Inspect Jonah Codex',
        icon: 'ðŸ“œ',
        intel: 'Discover Godâ€™s relentless heart for your enemies and why anger over grace poisons the prophet.'
      }
    ]
  },

  // 12. RUTH
  {
    id: 'campaign-ruth',
    title: 'Radical Loyalty in Famine',
    virtueTheme: 'Honor and Steadfast Loyalty in the Leanest Seasons',
    heroName: 'Ruth',
    heroIcon: 'ðŸŒ¾',
    heroSubtitle: 'Foreign Widow Who Chose God and Became Ancestor to Kings',
    summary: 'Stand by family when comfort evaporates, set healthy boundaries with overstepping relatives, lock Ruthâ€™s vow into memory, and review the Kinsman Redeemer.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Ruth: Act 1 â€¢ The Crossroads of Moab',
        targetId: 'ruth-journey',
        targetSecondaryId: 'ruth-act-1',
        actionLabel: 'Make The Vow At Moab',
        icon: 'âš”ï¸',
        intel: 'Penniless and grieving on a dirt road, choosing poverty with Naomi over comfortable pagan security in Moab.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Overstepping In-Laws',
        targetId: 'dilemma-inlaw-boundary',
        actionLabel: 'Establish Peaceful Guardrails',
        icon: 'ðŸ›¡ï¸',
        intel: 'Navigate complex generational family dynamics with high respect, unbreakable loyalty, and clear adult boundaries.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Ruth 1:16 â€¢ "Where You Go, I Will Go"',
        targetId: 'story-ruth-act-1',
        actionLabel: 'Forge Ruth 1:16',
        icon: 'ðŸ§ ',
        intel: 'Memorize the definitive anthem of covenant fidelity that echoes through Davidâ€™s entire royal lineage.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Ruth â€¢ The Kinsman Redeemer Protocol',
        targetId: 'canon-ruth',
        actionLabel: 'Inspect Ruth Codex',
        icon: 'ðŸ“œ',
        intel: 'Examine Boaz and Ruth: how quiet everyday decency and legal honor lay the foundation for Christâ€™s arrival.'
      }
    ]
  },

  // 13. JOSHUA
  {
    id: 'campaign-joshua',
    title: 'Seven Days at the Wall',
    virtueTheme: 'Patient Obedience When the Strategy Looks Strange',
    heroName: 'Joshua',
    heroIcon: 'ðŸ“¯',
    heroSubtitle: 'The General Who Stepped Into Mosesâ€™ Sandals and Conquered Canaan',
    summary: 'Trust Godâ€™s blueprint over human military pride, break the 48-hour cold war at home, lock Joshua 1:9 into your backbone, and examine the Conquest Chronicle.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'Joshua: Act 1 â€¢ The Commander of the Lordâ€™s Army',
        targetId: 'joshua-journey',
        targetSecondaryId: 'joshua-act-1',
        actionLabel: 'Drop Your Sword Before Jericho',
        icon: 'âš”ï¸',
        intel: 'Confronting an armed celestial warrior outside Jerichoâ€™s gates and discovering He is not on Israelâ€™s side, but His own.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The 48-Hour Marital Cold War',
        targetId: 'dilemma-marital-silent-war',
        actionLabel: 'Break The Stone Silence',
        icon: 'ðŸ›¡ï¸',
        intel: 'Marching silently without petty venting until the appointed moment: drop pride, confess first, and tear down emotional walls.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'Joshua 1:9 â€¢ "Be Strong and Courageous"',
        targetId: 'verse-1',
        actionLabel: 'Forge Joshua 1:9',
        icon: 'ðŸ§ ',
        intel: 'Cement the core command into your nervous system: you do not step into tomorrowâ€™s battlefield alone.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Joshua â€¢ Conquest Chronicle & Claiming Ground',
        targetId: 'canon-joshua',
        actionLabel: 'Inspect Joshua Codex',
        icon: 'ðŸ“œ',
        intel: 'Understand how discipline, sanctification, and communal integrity claim the promises God placed before you.'
      }
    ]
  },

  // 14. JOHN THE BAPTIST
  {
    id: 'campaign-john-baptist',
    title: 'Voice in the Wasteland',
    virtueTheme: 'Radical Humility & Destroying the Envy Spiral',
    heroName: 'John the Baptist',
    heroIcon: 'ðŸ¥‹',
    heroSubtitle: 'The Wilderness Forerunner Who Refused to Idolize His Own Platform',
    summary: 'Crush the modern comparison trap, dismantle social media envy, lock John 3:30 into your heart, and inspect the Gospel of Mark.',
    bonusXP: 150,
    steps: [
      {
        stepNumber: 1,
        type: 'quest',
        title: 'Step 1: The Narrative Forge',
        badge: 'Story Quest Act',
        subtitle: 'John the Baptist: Act 1 â€¢ Shouting from the Jordan Scrub',
        targetId: 'john-baptist-journey',
        targetSecondaryId: 'john-act-1',
        actionLabel: 'Enter The Jordan River Scrub',
        icon: 'âš”ï¸',
        intel: 'Wearing camel hair and eating wild honey while commanding religious hypocrites to produce fruits worthy of repentance.'
      },
      {
        stepNumber: 2,
        type: 'dilemma',
        title: 'Step 2: "What\'s The Play?" Tactical Sim',
        badge: 'Real-Life Dilemma',
        subtitle: 'The Social Media Envy Spiral',
        targetId: 'dilemma-envy-spiral',
        actionLabel: 'Extinguish The Envy Fire',
        icon: 'ðŸ›¡ï¸',
        intel: 'Watching peers receive massive accolades while your hard grind goes unnoticed. Execute Johnâ€™s Play: celebrate their fruit and stay on your post.'
      },
      {
        stepNumber: 3,
        type: 'wordforge',
        title: 'Step 3: Practice Memory Lock',
        badge: 'Scripture Memory Drill',
        subtitle: 'John 3:30 â€¢ "He Must Increase, I Must Decrease"',
        targetId: 'story-john-act-2',
        actionLabel: 'Forge John 3:30',
        icon: 'ðŸ§ ',
        intel: 'Lock into memory the master key to unshakeable inner peace: zero ego, zero jealousy, 100% mission.'
      },
      {
        stepNumber: 4,
        type: 'canon',
        title: 'Step 4: Scriptorium Field Codex',
        badge: '3D Library Codex',
        subtitle: 'Mark â€¢ The Servant Warrior & High-Tempo Mission',
        targetId: 'canon-mark',
        actionLabel: 'Inspect Mark Codex',
        icon: 'ðŸ“œ',
        intel: 'Study the earliest high-tempo Gospel where Jesus moves immediately from crisis to deliverance without bureaucratic delay.'
      }
    ]
  }
];

/**
 * Returns stable date key YYYY-MM-DD
 */
export const getCampaignDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Deterministically retrieves today's featured daily campaign
 */
export const getTodayDailyCampaign = (offsetDays = 0): DailyCampaign => {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayIndex = Math.floor(localMidnight / (1000 * 60 * 60 * 24)) + offsetDays;
  const index = Math.abs(dayIndex) % DAILY_CAMPAIGNS.length;
  return DAILY_CAMPAIGNS[index];
};

/**
 * Retrieves a campaign by ID
 */
export const getCampaignById = (campaignId: string): DailyCampaign => {
  return DAILY_CAMPAIGNS.find(c => c.id === campaignId) || DAILY_CAMPAIGNS[0];
};

/**
 * Reads campaign progress from localStorage
 */
export const getDailyCampaignProgress = (campaignId: string, dateKey = getCampaignDateKey()): DailyCampaignProgress => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      campaignId,
      dateKey,
      completedSteps: [],
      isFullyCompleted: false,
      bonusClaimed: false
    };
  }

  try {
    const key = `testament_campaign_progress_${campaignId}_${dateKey}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to read campaign progress', err);
  }

  return {
    campaignId,
    dateKey,
    completedSteps: [],
    isFullyCompleted: false,
    bonusClaimed: false
  };
};

/**
 * Marks a campaign step completed and saves to localStorage
 */
export const markCampaignStepCompleted = (
  campaignId: string,
  stepNumber: number,
  dateKey = getCampaignDateKey(),
  totalSteps = 4
): DailyCampaignProgress => {
  const current = getDailyCampaignProgress(campaignId, dateKey);
  if (!current.completedSteps.includes(stepNumber)) {
    const updatedSteps = [...current.completedSteps, stepNumber].sort((a, b) => a - b);
    const isFullyCompleted = updatedSteps.length >= totalSteps;
    const updated: DailyCampaignProgress = {
      ...current,
      completedSteps: updatedSteps,
      isFullyCompleted
    };

    try {
      const key = `testament_campaign_progress_${campaignId}_${dateKey}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save campaign step progress', err);
    }

    return updated;
  }
  return current;
};

/**
 * Marks campaign completion bonus as claimed
 */
export const claimCampaignCompletionBonus = (
  campaignId: string,
  dateKey = getCampaignDateKey()
): void => {
  const current = getDailyCampaignProgress(campaignId, dateKey);
  const updated: DailyCampaignProgress = {
    ...current,
    bonusClaimed: true
  };
  try {
    const key = `testament_campaign_progress_${campaignId}_${dateKey}`;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to claim campaign bonus', err);
  }
};
