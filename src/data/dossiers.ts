export interface CharacterDossier {
  id: string;
  name: string;
  codename: string;
  era: string;
  occupation: string;
  image: string;
  superpower: string;
  majorFlaws: string[];
  definingMoment: string;
  realTalkLesson: string;
  relatedQuestId: string;
}

export const CHARACTER_DOSSIERS: CharacterDossier[] = [
  {
    id: 'jesus',
    name: 'Jesus of Nazareth',
    codename: 'The Servant King',
    era: 'c. 30 AD • Roman Judea & Galilee',
    occupation: 'Carpenter → Rabbi → Savior of the World',
    image: '/images/hero_banner.jpg',
    superpower: 'Infinite grace, absolute truth, authority over nature and death.',
    majorFlaws: [
      'Sinless; misunderstood by family and hometown critics.',
      'Refused worldly political power, frustrating those who wanted an earthly revolutionary.'
    ],
    definingMoment: 'Washing the feet of his disciples, dying on the cross for sinners, and walking out of the tomb alive.',
    realTalkLesson: 'Greatness is not about dominating others; it is having the strength to lay your life down in love.',
    relatedQuestId: 'jesus-journey'
  },
  {
    id: 'david',
    name: 'David ben Jesse',
    codename: 'The Outlaw Shepherd',
    era: 'c. 1020 BC • Kingdom of Israel',
    occupation: 'Shepherd boy → Folk hero → Fugitive outlaw commander → King of Israel',
    image: '/images/valley_battlefield.jpg',
    superpower: 'Zero intimidation factor. Refused to see giants as bigger than God.',
    majorFlaws: [
      'Struggled with impulse control and lust (the Bathsheba disaster).',
      'Terrible at disciplining his grown sons, leading to family civil war.',
      'Could be ruthless and emotionally volatile when provoked.'
    ],
    definingMoment: 'Running at full speed into the Valley of Elah with just a leather sling to meet Goliath.',
    realTalkLesson: 'God didn’t choose David because he was morally flawless; He chose him because when David messed up, he repented with a shattered, honest heart instead of making excuses.',
    relatedQuestId: 'david-journey'
  },
  {
    id: 'joseph',
    name: 'Joseph ben Jacob',
    codename: 'The Unbroken Steward',
    era: 'c. 1800 BC • Canaan & Ancient Egypt',
    occupation: 'Spoiled younger son → Slave → Convict trustee → Prime Minister of Egypt',
    image: '/images/desert_canyon.jpg',
    superpower: 'Incurable excellence. Whatever ditch he was thrown into, he managed it with mastery.',
    majorFlaws: [
      'Immature and boastful as a 17-year-old (rubbing his coat and dreams in his brothers’ faces).',
      'Naïve about the deep jealousy brewing around him until he was at the bottom of a dry pit.'
    ],
    definingMoment: 'Standing before the brothers who sold him into slavery 20 years earlier, with absolute power to execute them, and choosing to forgive them instead.',
    realTalkLesson: 'You cannot prevent people from doing evil to you. But you can refuse to let their poison dictate who you become. Faithfulness in the dirt leads to authority on the throne.',
    relatedQuestId: 'joseph-journey'
  },
  {
    id: 'moses',
    name: 'Moses',
    codename: 'The Reluctant Liberator',
    era: 'c. 1446 BC • Egypt & Mount Sinai',
    occupation: 'Egyptian prince → Wanted fugitive → Backcountry desert shepherd → Lawgiver',
    image: '/images/red_sea.jpg',
    superpower: 'Unshakable endurance. Stepped into high-stakes leadership at age 80.',
    majorFlaws: [
      'Bad temper: murdered an Egyptian taskmaster and fled; later smashed stone tablets in rage.',
      'Massive imposter syndrome: begged God five times to send anyone else instead of him.',
      'Stuttered and doubted his ability to speak in public.'
    ],
    definingMoment: 'Raising his wooden shepherd’s staff at midnight as the Red Sea split in front of 2 million panicked slaves.',
    realTalkLesson: 'You are never "too old", "too unqualified", or "too broken by past mistakes" to be used by God. If God can use a stammering 80-year-old ex-felon with a wooden stick, He can use you.',
    relatedQuestId: 'moses-journey'
  },
  {
    id: 'elijah',
    name: 'Elijah the Tishbite',
    codename: 'The Lone Firebrand',
    era: 'c. 860 BC • Northern Israel',
    occupation: 'Wilderness prophet & social challenger',
    image: '/images/mount_carmel.jpg',
    superpower: 'Boldness that defied entire corrupt royal regimes and false religions.',
    majorFlaws: [
      'Prone to severe emotional crashes and depression after massive adrenal output.',
      'Felt isolated and had a martyr complex ("I am the only one left!").',
      'Ran in panic when Queen Jezebel threatened him right after his biggest victory.'
    ],
    definingMoment: 'Pouring 12 jars of precious water over his altar on Mount Carmel and calling down divine fire in front of 450 screaming false prophets.',
    realTalkLesson: 'High-performing men often crash the hardest after huge milestones. God didn’t condemn Elijah for being depressed; He fed him warm bread and let him sleep. Rest is a discipline.',
    relatedQuestId: 'elijah-journey'
  },
  {
    id: 'peter',
    name: 'Simon Peter',
    codename: 'The Restored Fisherman',
    era: 'c. 30–67 AD • Galilee & Rome',
    occupation: 'Commercial sea fisherman → Disciple → Apostle & martyr in Rome',
    image: '/images/courtyard_fire.jpg',
    superpower: 'Raw, impulsive courage. The only disciple brave enough to step out of the boat onto the storm.',
    majorFlaws: [
      'Foot-in-mouth syndrome: spoke before thinking in almost every recorded moment.',
      'Overconfident swagger: "Even if all abandon you, I will never!"',
      'Choked under social pressure and cursed that he never knew his best friend.'
    ],
    definingMoment: 'Weeping bitter tears in the Jerusalem dark as the rooster crowed, then meeting Jesus over the shore charcoal fire to receive forgiveness.',
    realTalkLesson: 'God does not throw away a man who choked under pressure. Failure is an event, not an identity. When you turn back, strengthen your brothers.',
    relatedQuestId: 'peter-journey'
  },
  {
    id: 'paul',
    name: 'Paul of Tarsus (Saul)',
    codename: 'The Converted Bounty Hunter',
    era: 'c. 35–64 AD • Roman Mediterranean',
    occupation: 'Religious intellectual & legal enforcer → Missionary tentmaker & prisoner of Rome',
    image: '/images/prison_cell.jpg',
    superpower: 'Unstoppable willpower and intellectual clarity. Beaten, shipwrecked, and stoned, but kept preaching.',
    majorFlaws: [
      'Began life as an ideological fanatic approving the murder of innocent families.',
      'Could be stern, uncompromising, and hard on colleagues (had a bitter split with Barnabas over Mark).',
      'Struggled with a painful, chronic physical affliction he called a "thorn in the flesh".'
    ],
    definingMoment: 'Singing hymns at midnight with Silas while locked in wooden stocks in the Roman dungeon of Philippi.',
    realTalkLesson: 'Nobody is too far gone. If God could take a hate-filled religious terrorist and turn him into the greatest teacher of love and grace in history, nobody in your life is beyond redemption.',
    relatedQuestId: 'paul-journey'
  },
  {
    id: 'daniel',
    name: 'Daniel (Belteshazzar)',
    codename: 'The Iron Diplomat',
    era: 'c. 605–536 BC • Babylonian & Persian Empires',
    occupation: 'Exiled teenage prince → Chief of Royal Wisemen → Imperial Prime Minister',
    image: '/images/palace_hall.jpg',
    superpower: 'Zero moral compromise under supreme cultural pressure. Outlived three hostile world empires.',
    majorFlaws: [
      'Isolated in the highest corridors of imperial power, far from home and family.',
      'Carried immense personal and emotional toll from apocalyptic visions and political conspiracies.',
      'Constantly the prime target of jealous bureaucratic rivals seeking his execution.'
    ],
    definingMoment: 'Opening his windows toward Jerusalem and praying on his knees three times a day, knowing a royal death warrant was signed.',
    realTalkLesson: 'You do not have to sell out your soul to thrive in a secular, competitive industry. Technical excellence paired with radical integrity makes you irreplaceable.',
    relatedQuestId: 'daniel-journey'
  },
  {
    id: 'esther',
    name: 'Esther (Hadassah)',
    codename: 'The Shadow Empress',
    era: 'c. 483–473 BC • Susa, Persian Empire',
    occupation: 'Orphaned Jewish refugee → Queen Consort of Persia',
    image: '/images/courtyard_fire.jpg',
    superpower: 'Tactical patience and supreme moral bravery. Knew exactly when to hold silence and when to strike.',
    majorFlaws: [
      'Initially hid her Jewish lineage and stayed silent to survive royal court scrutiny.',
      'Paralyzed by natural fear when asked to risk her neck for her people.',
      'Forced into a hyper-vulnerable, gilded cage where a single royal displeasure meant instant execution.'
    ],
    definingMoment: 'Crossing the forbidden inner court uninvited in full royal robes and declaring: "If I perish, I perish."',
    realTalkLesson: 'Your current position, platform, or privilege is not for your personal comfort—it is a strategic staging ground for a moment of destiny.',
    relatedQuestId: 'esther-journey'
  },
  {
    id: 'nehemiah',
    name: 'Nehemiah ben Hacaliah',
    codename: 'The Blueprint Builder',
    era: 'c. 445 BC • Susa & Jerusalem',
    occupation: 'Imperial cupbearer to King Artaxerxes → Governor of Judah & Master Builder',
    image: '/images/valley_battlefield.jpg',
    superpower: 'Dual-handed mastery: building with a trowel in one hand while gripping a spear in the other.',
    majorFlaws: [
      'Hot temper: pulled out corrupt officials\' hair and cursed them when they exploited the poor.',
      'Relentless, workaholic intensity that demanded 24/7 hyper-vigilance from his workforce.',
      'Extreme skepticism toward rival regional leaders, refusing all attempts at compromise.'
    ],
    definingMoment: 'Refusing four consecutive invitations to debate his enemies in the plains of Ono, declaring: "I am doing a great work and I cannot come down."',
    realTalkLesson: 'Focus is saying NO to a hundred good distractions to protect your core mission. Build with high competence and keep your guards posted.',
    relatedQuestId: 'nehemiah-journey'
  },
  {
    id: 'gideon',
    name: 'Gideon ben Joash (Jerubbaal)',
    codename: 'The Reluctant Guerilla',
    era: 'c. 1160 BC • Valley of Jezreel, Ancient Israel',
    occupation: 'Impoverished farmer threshing grain in a winepress → Judge & Liberator',
    image: '/images/desert_canyon.jpg',
    superpower: 'Willingness to obey unconventional, counter-intuitive orders when all human odds were against him.',
    majorFlaws: [
      'Chronic imposter syndrome and persistent self-doubt (demanded multiple fleece signs from God).',
      'Later made a golden ephod from enemy spoils that became a spiritual snare for his family.',
      'Struggled with lingering family fear and operated under cover of darkness.'
    ],
    definingMoment: 'Attacking a 135,000-man horde with only 300 soldiers carrying clay jars, blazing torches, and ram’s horns.',
    realTalkLesson: 'God does not call you based on your current résumé; He calls you according to the identity He has forged in you. God trims your resources so you rely on His power.',
    relatedQuestId: 'gideon-journey'
  },
  {
    id: 'jonah',
    name: 'Jonah ben Amittai',
    codename: 'The Reluctant Maverick',
    era: 'c. 760 BC • Mediterranean Sea & Nineveh',
    occupation: 'Prophet of Israel → Deep-sea fugitive → Reluctant revivalist',
    image: '/images/cave_refuge.jpg',
    superpower: 'Brutal, raw honesty. Even in the depths of the sea or scorching sun, he did not fake his emotions with God.',
    majorFlaws: [
      'Deep patriotic prejudice: hated the Assyrians so much he preferred to see them destroyed rather than redeemed.',
      'Petulant, sulking attitude when God demonstrated mercy to enemies.',
      'Attempted to physically sail across the known world to escape his calling.'
    ],
    definingMoment: 'Praying from inside the belly of the great fish in total darkness, surrendering his runaway rebellion to the God of second chances.',
    realTalkLesson: 'God’s mercy is not bounded by your political, national, or personal grievances. Running from your purpose always costs more than you planned to pay.',
    relatedQuestId: 'jonah-journey'
  },
  {
    id: 'ruth',
    name: 'Ruth the Moabitess',
    codename: 'The Loyal Immigrant',
    era: 'c. 1100 BC • Moab & Bethlehem',
    occupation: 'Widowed refugee immigrant → Field gleaner → Matriarch in the royal Davidic line',
    image: '/images/desert_canyon.jpg',
    superpower: 'Covenant loyalty (Hesed). Radical, selfless commitment without safety nets.',
    majorFlaws: [
      'Zero social standing, legal rights, or wealth as a foreigner in post-war Bethlehem.',
      'Depended entirely on the kindness of strangers for basic daily grain survival.',
      'Bore the heavy cultural stigma of being from Moab, Israel\'s ancient enemy.'
    ],
    definingMoment: 'Standing on the border highway refusing to return home, telling Naomi: "Where you go, I will go; your people shall be my people, and your God my God."',
    realTalkLesson: 'Loyalty in obscurity catches the attention of heaven. What looks like a dead-end tragedy can become the precise field where redemption begins.',
    relatedQuestId: 'ruth-journey'
  },
  {
    id: 'joshua',
    name: 'Joshua ben Nun',
    codename: 'The Vanguard Commander',
    era: 'c. 1406 BC • Jordan River & Jericho',
    occupation: 'Moses’ field aide & spy → Supreme Military Commander of Israel',
    image: '/images/valley_battlefield.jpg',
    superpower: 'Fearless tactical execution under direct divine command. Held ground when everyone else panicked.',
    majorFlaws: [
      'Failed to consult God before the Battle of Ai, leading to an initial military rout.',
      'Deceived by the Gibeonite peace delegation because he evaluated them with his eyes instead of prayer.',
      'Struggled with the heavy burden of stepping into the shoes of the legendary Moses.'
    ],
    definingMoment: 'Falling face-down before the Commander of the Lord’s Army outside Jericho with his shoes removed before the walls collapsed.',
    realTalkLesson: 'True courage is not the absence of trembling fear—it is obedience in the presence of it. As for me and my house, we will serve the Lord.',
    relatedQuestId: 'joshua-journey'
  },
  {
    id: 'john-baptist',
    name: 'John the Baptist (Yohanan)',
    codename: 'The Wilderness Rebel',
    era: 'c. 28–32 AD • Judean Desert & Jordan River',
    occupation: 'Desert ascetic & street preacher → Herald of the Messiah → Martyr of Machaerus',
    image: '/images/desert_canyon.jpg',
    superpower: 'Zero appetite for human approval or luxury. Spoke unflinching truth to emperors and kings.',
    majorFlaws: [
      'Struggled with intense doubt and disorientation when sitting in Herod’s dungeon waiting for execution.',
      'Harsh, unyielding demeanor that made him zero friends in elite religious circles.',
      'Lived an extreme, solitary lifestyle that alienated traditional societal circles.'
    ],
    definingMoment: 'Submitting his entire public following and ego to Jesus with the immortal line: "He must increase, but I must decrease."',
    realTalkLesson: 'Greatness in God\'s kingdom is measured by your willingness to point the spotlight away from yourself and onto Christ. Even lions of faith experience dark nights of the soul.',
    relatedQuestId: 'john-baptist-journey'
  }
];
