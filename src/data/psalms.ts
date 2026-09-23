export type PsalmCrisisMood = 
  | 'panic-fear'
  | 'insomnia-overwhelm'
  | 'betrayal-hurt'
  | 'guilt-ruin'
  | 'rage-injustice'
  | 'grief-exhaustion';

export interface PsalmPrescription {
  id: string;
  moodId: PsalmCrisisMood;
  title: string;
  reference: string;
  formalText: string;
  streetTranslation: string;
  moodLabel: string;
  moodIcon: string;
  caveBackstory: string; // The raw historical context when David or the Psalmist was under fire
  symptomCheck: string; // What the user is feeling right now
  fieldMedicSteps: [string, string, string]; // 1. Breath/Body, 2. Spoken Anchor, 3. Immediate Action
  keyTakeaway: string;
  ambiencePreset: 'sanctuary' | 'campfire' | 'wind';
  xpReward: number;
}

export const PSALM_MOODS: Record<PsalmCrisisMood, { label: string; icon: string; desc: string }> = {
  'panic-fear': {
    label: 'Under Siege / Panic',
    icon: '🔥',
    desc: 'When walls are closing in, stakes are terrifying, and your nervous system is in flight mode.'
  },
  'insomnia-overwhelm': {
    label: '3:00 AM Insomnia & Racing Mind',
    icon: '🌑',
    desc: 'When you are staring at the ceiling, paralyzed by tomorrow’s bills, decisions, or burnout.'
  },
  'betrayal-hurt': {
    label: 'Knife in the Back / Betrayal',
    icon: '🗡️',
    desc: 'When someone you fed, trusted, and backed turns on you and attacks your name.'
  },
  'guilt-ruin': {
    label: 'Blown Up Life / Guilt & Regret',
    icon: '💥',
    desc: 'When you have nobody to blame but the man in the mirror, and the wreckage is real.'
  },
  'rage-injustice': {
    label: 'Simmering Rage & Injustice',
    icon: '⚡',
    desc: 'When corruption, liars, or bullies seem to win and your blood is boiling for revenge.'
  },
  'grief-exhaustion': {
    label: 'Crushed Spirit / Deep Burnout',
    icon: '🩹',
    desc: 'When your tank is on empty, your heart is broken, and you have nothing left to give.'
  }
};

export const PSALM_PRESCRIPTIONS: PsalmPrescription[] = [
  // 1. PANIC & UNDER SIEGE
  {
    id: 'psalm-27-light',
    moodId: 'panic-fear',
    title: 'The Fortress in the Ambush',
    reference: 'Psalm 27:1-3',
    formalText: 'The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid? When the wicked advance against me to devour me, it is my enemies and my foes who will stumble and fall. Though an army besiege me, my heart will not fear.',
    streetTranslation: 'God is my high-ground bunker and my searchlight in pitch black. When an entire legion surrounds my perimeter with knives drawn, I do not panic. They are the ones walking into a brick wall, not me.',
    moodLabel: 'Under Siege / Panic',
    moodIcon: '🔥',
    caveBackstory: 'Composed while David was an outlaw on the run in the Judean badlands. Saul’s royal army of 3,000 elite mercenaries had combed the jagged limestone cliffs of En-gedi. David was cornered against sheer drops with nowhere left to run.',
    symptomCheck: 'Rapid pulse, shallow breathing, catastrophizing the worst-case scenario, feeling vulnerable and exposed to enemies or career ruin.',
    fieldMedicSteps: [
      'Tactical Physiological Reset: 4 seconds in through the nose, hold 4 seconds, exhale 6 seconds out. Force your nervous system down from red-alert.',
      'Audible Spoken Anchor: Speak Psalm 27:1 aloud with chest voice: "The Lord is the stronghold of my life; of whom shall I be afraid?" Give your ears authority over your adrenaline.',
      'Immediate Trench Action: Write down the single biggest threat right now. Separate what you cannot control from the one concrete action you can execute in the next 30 minutes.'
    ],
    keyTakeaway: 'Courage is not the absence of trembling hands; it is holding the line because your bunker is bombproof.',
    ambiencePreset: 'wind',
    xpReward: 35
  },
  {
    id: 'psalm-91-shadow',
    moodId: 'panic-fear',
    title: 'The Night Arrow Interceptor',
    reference: 'Psalm 91:4-6',
    formalText: 'He will cover you with His feathers, and under His wings you will find refuge; His faithfulness will be your shield and rampart. You will not fear the terror of night, nor the arrow that flies by day.',
    streetTranslation: 'You are tucked under bulletproof armor. The sneak attacks in the dark and the direct incoming fire in broad daylight cannot pierce through His perimeter.',
    moodLabel: 'Under Siege / Panic',
    moodIcon: '🔥',
    caveBackstory: 'Ancient field anthem recited by soldiers marching into treacherous valley skirmishes where invisible archers hid on cliff ridges.',
    symptomCheck: 'Hyper-vigilance, feeling that catastrophe is lurking around the next corner, dreading the morning alarm.',
    fieldMedicSteps: [
      'Shoulder Drop: Unclench your jaw, drop your shoulders away from your ears, and place both feet flat on the floor.',
      'Whisper the Shield: Recite: "His faithfulness is my shield and rampart. No arrow hits my soul without His clearance."',
      'Put Down the Weapon: Stop doom-scrolling or checking email at midnight. Put your phone in another room.'
    ],
    keyTakeaway: 'You cannot fight tomorrow’s battles with tonight’s borrowed panic. Sleep in the bunker.',
    ambiencePreset: 'sanctuary',
    xpReward: 35
  },

  // 2. INSOMNIA & OVERWHELM
  {
    id: 'psalm-42-soul-check',
    moodId: 'insomnia-overwhelm',
    title: 'The 3:00 AM Interrogation',
    reference: 'Psalm 42:5',
    formalText: 'Why are you cast down, O my soul, and why are you in turmoil within me? Hope in God; for I shall again praise Him, my salvation and my God.',
    streetTranslation: 'Stop listening to your feelings and start talking to yourself. Interrogate your panic: "Why are you falling apart? Put your anchor back in God; this is not the final chapter."',
    moodLabel: '3:00 AM Insomnia & Racing Mind',
    moodIcon: '🌑',
    caveBackstory: 'Written by the sons of Korah in exile by the roaring headwaters of the Jordan River at Mount Hermon, cut off from home, mocked by enemies who sneered: "Where is your God now?"',
    symptomCheck: 'Racing thoughts at 3:00 AM, heavy chest, mental loop replaying mistakes and financial figures on repeat.',
    fieldMedicSteps: [
      'Stop Listening to Your Mind: Your 3:00 AM brain has zero serotonin and lies constantly. Recognize racing thoughts as chemical exhaustion, not reality.',
      'Speak to Your Soul: Tell yourself out loud: "Soul, stand at attention. Why are you in turmoil? Hope in God; we will see daylight again."',
      'Tactical Brain Dump: Turn on a dim amber light, grab a physical notepad, write down every racing worry without filtering, and close the notebook.'
    ],
    keyTakeaway: 'Most of your misery comes from listening to yourself instead of talking to yourself. Preach truth to your own panic.',
    ambiencePreset: 'campfire',
    xpReward: 35
  },

  // 3. BETRAYAL & KNIFE IN THE BACK
  {
    id: 'psalm-55-companion',
    moodId: 'betrayal-hurt',
    title: 'The Trusted Companion’s Knife',
    reference: 'Psalm 55:12-14, 22',
    formalText: 'For it is not an enemy who taunts me—then I could bear it... but it is you, a man, my equal, my companion, my familiar friend. We used to take sweet counsel together... Cast your burden on the Lord, and He will sustain you; He will never permit the righteous to be shaken.',
    streetTranslation: 'If it were an outspoken enemy cursing me online, I could shrug it off. But it was you—the brother who sat at my dining table, the co-founder who knew my secrets. Give this agony to God before bitterness rots your insides.',
    moodLabel: 'Knife in the Back / Betrayal',
    moodIcon: '🗡️',
    caveBackstory: 'David wrote this when his closest senior counselor Ahithophel—a man whose counsel was regarded "as if one consulted the word of God"—defected to join Absalom’s coup to have David murdered.',
    symptomCheck: 'Sickening knot in the stomach, obsessive replay of conversations, burning desire for public vindication or revenge, feeling deeply foolish for trusting them.',
    fieldMedicSteps: [
      'Acknowledge the Knife: Do not pretend it doesn’t hurt. David wept openly and groaned. Give yourself permission to mourn the death of the trust.',
      'Cancel Retaliation: Vow right now that you will not leak, gossip, or strike back in the dark. Proverbs & Psalms guarantee that vengeance belongs to God and He executes it cleaner than you ever could.',
      'Hand Over the Debt: Say aloud: "God, I release this traitor’s punishment to Your courtroom. You settle the account; I will keep my hands clean."'
    ],
    keyTakeaway: 'The deepest cuts come from the closest seats. Do not let someone else’s treachery turn you into a bitter cynic.',
    ambiencePreset: 'wind',
    xpReward: 35
  },

  // 4. GUILT & BLOWN UP LIFE
  {
    id: 'psalm-51-clean-heart',
    moodId: 'guilt-ruin',
    title: 'The Ash Heap Reconstruction',
    reference: 'Psalm 51:10-12',
    formalText: 'Create in me a clean heart, O God, and renew a right spirit within me. Cast me not away from Your presence, and take not Your Holy Spirit from me. Restore to me the joy of Your salvation, and uphold me with a willing spirit.',
    streetTranslation: 'I am not making excuses or blaming circumstances. I blew it. Wash the blood off my hands, rebuild my ruined interior, and give me back the joy of walking clean.',
    moodLabel: 'Blown Up Life / Guilt & Regret',
    moodIcon: '💥',
    caveBackstory: 'Written after the prophet Nathan pointed his finger into King David’s face and said: "You are the man." David had committed adultery with Bathsheba and murdered her loyal soldier husband Uriah to cover it up.',
    symptomCheck: 'Crushing shame, feeling dirty and hypocritical, believing you are disqualified from ever being used by God or respected again.',
    fieldMedicSteps: [
      'Stop Justifying: Kill all "Yes, but..." statements. Own 100% of your failure before God. David made zero excuses.',
      'Claim Cleansing: Read Psalm 51:7: "Wash me, and I shall be whiter than snow." Forgiveness is not a probation period; it is total expungement through grace.',
      'Step Back Onto the Field: Your failure is not your tombstone; it is the soil of your testimony. Confess, make restitution where possible, and march forward.'
    ],
    keyTakeaway: 'God does not throw away broken soldiers; He rebuilds them from the ground up into iron pillars.',
    ambiencePreset: 'sanctuary',
    xpReward: 35
  },

  // 5. RAGE & INJUSTICE
  {
    id: 'psalm-37-fret-not',
    moodId: 'rage-injustice',
    title: 'The Short Shelf-Life of Scoundrels',
    reference: 'Psalm 37:1-3, 7-8',
    formalText: 'Fret not yourself because of evildoers; be not envious of wrongdoers! For they will soon fade like the grass and wither like the green herb... Refrain from anger, and forsake wrath! Fret not yourself; it tends only to evil.',
    streetTranslation: 'Do not lose your sleep or your mind over crooked men who seem to be flourishing. They are seasonal grass; the lawnmower is already running. Cool your rage before it burns you down.',
    moodLabel: 'Simmering Rage & Injustice',
    moodIcon: '⚡',
    caveBackstory: 'Written by David in his twilight years after watching dozens of ruthless warlords, corrupt officials, and arrogant oppressors rise like gods and disappear into dust within a generation.',
    symptomCheck: 'Clenched fists, obsessing over crooked rivals winning, feeling that honesty is a sucker’s game.',
    fieldMedicSteps: [
      'Unclench the Fist: Literally open your hands palms up. Rage contracts muscles; surrender opens them.',
      'Check the Horizon: Remember the lifespan of wicked men. Fast wealth with rotten roots has a 100% historical fatality rate.',
      'Double Down on Good: Psalm 37:3: "Trust in the Lord and do good." The greatest revenge against evil is unyielding, productive excellence.'
    ],
    keyTakeaway: 'Never envy the corrupt; their success is a death sentence with a countdown timer. Stay faithful.',
    ambiencePreset: 'campfire',
    xpReward: 35
  },

  // 6. CRUSHED SPIRIT & GRIEF
  {
    id: 'psalm-34-brokenhearted',
    moodId: 'grief-exhaustion',
    title: 'The Triage at the Broken Heart',
    reference: 'Psalm 34:18',
    formalText: 'The Lord is near to the brokenhearted and saves the crushed in spirit.',
    streetTranslation: 'When your world crumbles and your chest physically hurts with grief, God is not at a distant throne. He is right beside you in the rubble.',
    moodLabel: 'Crushed Spirit / Deep Burnout',
    moodIcon: '🩹',
    caveBackstory: 'David composed this when he had to feign insanity in front of King Achish of Gath, drooling on his beard and scratching on city gates just to escape execution.',
    symptomCheck: 'Exhaustion, dry eyes or uncontrollable tears, numbness, feeling completely alone in your pain.',
    fieldMedicSteps: [
      'Breathe in the Rubble: You do not need to perform or be strong right now. Just breathe.',
      'Accept the Closeness: God draws nearest to the casualty tent, not the victory parade.',
      'Take One Meal & One Rest: Elijah was fed by an angel and told to sleep. Treat your broken body with patience today.'
    ],
    keyTakeaway: 'Brokenness is where God does His best surgery. You will survive this wilderness.',
    ambiencePreset: 'sanctuary',
    xpReward: 35
  }
];

export const getAllPsalms = (): PsalmPrescription[] => PSALM_PRESCRIPTIONS;

export const getPsalmById = (id: string): PsalmPrescription | undefined => {
  return PSALM_PRESCRIPTIONS.find(p => p.id === id);
};

export const getPsalmsByMood = (mood: PsalmCrisisMood): PsalmPrescription[] => {
  return PSALM_PRESCRIPTIONS.filter(p => p.moodId === mood);
};
