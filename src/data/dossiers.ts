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
    id: 'david',
    name: 'David ben Jesse',
    codename: 'The Outlaw Shepherd',
    era: 'c. 1020 BC • Kingdom of Israel',
    occupation: 'Shepherd boy &rarr; Folk hero &rarr; Fugitive outlaw commander &rarr; King of Israel',
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
    occupation: 'Spoiled younger son &rarr; Slave &rarr; Convict trustee &rarr; Prime Minister of Egypt',
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
    occupation: 'Egyptian prince &rarr; Wanted fugitive &rarr; Backcountry desert shepherd &rarr; Lawgiver',
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
    occupation: 'Commercial sea fisherman &rarr; Disciple &rarr; Apostle & martyr in Rome',
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
    occupation: 'Religious intellectual & legal enforcer &rarr; Missionary tentmaker & prisoner of Rome',
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
  }
];
