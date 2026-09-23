export type ProverbCategory = 
  | 'money-debt'
  | 'tongue-conflict'
  | 'sluggard-work'
  | 'ego-criticism'
  | 'toxic-allies';

export interface ProverbOption {
  id: string;
  label: string;
  isWise: boolean;
  feedback: string;
}

export interface ProverbScenario {
  id: string;
  category: ProverbCategory;
  title: string;
  reference: string;
  formalText: string;
  streetTranslation: string;
  dilemma: {
    situation: string;
    question: string;
    options: ProverbOption[];
  };
  solomonBriefing: string;
  keyTakeaway: string;
  xpReward: number;
}

export const PROVERB_CATEGORIES: Record<ProverbCategory, { label: string; icon: string; desc: string }> = {
  'money-debt': {
    label: 'Money & Debt Vault',
    icon: '💰',
    desc: 'Co-signing traps, speculative leverage, hasty riches, and building generational bedrock.'
  },
  'tongue-conflict': {
    label: 'The Tongue & Meetings',
    icon: '⚔️',
    desc: 'Shutting your mouth in hostile rooms, defusing rage, and destroying office gossip.'
  },
  'sluggard-work': {
    label: 'Sluggard vs. Relentless',
    icon: '🐜',
    desc: 'Breaking dopamine loops, killing excuses, and compounding unglamorous daily execution.'
  },
  'ego-criticism': {
    label: 'Ego & Brutal Feedback',
    icon: '🛡️',
    desc: 'Receiving razor-sharp critique without crumbling, and spotting pride before disaster strikes.'
  },
  'toxic-allies': {
    label: 'Dangerous & Fake Allies',
    icon: '🐍',
    desc: 'Dissecting smooth flatterers, hot-tempered business partners, and fair-weather friends.'
  }
};

export const PROVERB_SCENARIOS: ProverbScenario[] = [
  // 1. MONEY & DEBT
  {
    id: 'proverb-debt-slave',
    category: 'money-debt',
    title: 'The Co-Signing Landmine',
    reference: 'Proverbs 22:7',
    formalText: 'The rich rule over the poor, and the borrower is the slave of the lender.',
    streetTranslation: 'When you take someone else’s capital to fund your ego or bail out a friend with your credit, you are no longer your own boss. You are working for their terms.',
    dilemma: {
      situation: 'A close lifelong friend is launching an ambitious new enterprise. The bank refused him a loan because of his poor credit score. He asks you to co-sign a $40,000 credit line, swearing on your friendship that he will never miss a single payment.',
      question: 'What is your tactical move?',
      options: [
        {
          id: 'opt-a',
          label: 'Co-sign to preserve the friendship and prove your loyalty.',
          isWise: false,
          feedback: 'Catastrophic move. Proverbs 11:15 warns: "He who puts up security for a stranger will surely suffer, but whoever hates striking hands in pledge is secure." You just chained your financial future to someone whose track record already failed standard scrutiny.'
        },
        {
          id: 'opt-b',
          label: 'Politely decline to co-sign. If you can afford it, give a small no-strings-attached cash gift, but refuse any shared legal debt.',
          isWise: true,
          feedback: 'Master-level move. You protect both your balance sheet and your relationship. Never turn an ally into a creditor or debtor.'
        },
        {
          id: 'opt-c',
          label: 'Agree to co-sign, but demand 50% equity in his business as collateral.',
          isWise: false,
          feedback: 'Dangerous half-measure. If the venture founders, you still bear 100% of the bank’s legal wrath regardless of your worthless equity.'
        }
      ]
    },
    solomonBriefing: 'Debt is not just an interest rate—it is a surrender of sovereignty. When you co-sign, you hand the keys to your house to another man’s competence.',
    keyTakeaway: 'Never co-sign a loan. Give freely if you choose, but never sign away your freedom on someone else’s risk.',
    xpReward: 35
  },
  {
    id: 'proverb-hasty-wealth',
    category: 'money-debt',
    title: 'The "Guaranteed 10x" Speculation',
    reference: 'Proverbs 13:11',
    formalText: 'Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.',
    streetTranslation: 'Money made overnight usually evaporates overnight. The only wealth that survives pressure is built brick by boring brick.',
    dilemma: {
      situation: 'A former coworker texts you a private screenshot showing huge 300% returns in 3 weeks on a high-risk offshore crypto derivative fund. He urges you to move your emergency savings in before the "liquidity window" closes tonight.',
      question: 'How do you respond?',
      options: [
        {
          id: 'opt-a',
          label: 'Wire half your emergency fund so you don’t suffer from FOMO.',
          isWise: false,
          feedback: 'Fool’s trap. Proverbs 28:20 states: "A faithful man will abound with blessings, but whoever hastens to be rich will not go unpunished." High speed with zero moats is financial suicide.'
        },
        {
          id: 'opt-b',
          label: 'Pass completely. Keep compounding in your proven, boring, steady vehicle.',
          isWise: true,
          feedback: 'Sovereign discipline. Wealth that outlasts generations is gathered step by step. Solomon knew that fast money creates arrogant habits that wipe out the principal.'
        },
        {
          id: 'opt-c',
          label: 'Borrow money on a credit card to test the waters without touching your savings.',
          isWise: false,
          feedback: 'Doubling down on folly. You are stacking high-interest guaranteed debt on top of speculative unverified returns.'
        }
      ]
    },
    solomonBriefing: 'The appetite for easy speed is the easiest handle for predators to pull. Lasting strength grows at the speed of an oak tree, not a weed.',
    keyTakeaway: 'Beware of any deal requiring hurry. True wealth is an endurance race, not a casino sprint.',
    xpReward: 35
  },

  // 2. THE TONGUE & CONFLICT
  {
    id: 'proverb-gentle-answer',
    category: 'tongue-conflict',
    title: 'The Executive Ambush',
    reference: 'Proverbs 15:1',
    formalText: 'A soft answer turns away wrath, but a harsh word stirs up anger.',
    streetTranslation: 'When someone attacks you with volcanic rage, matching their volume guarantees a war. A controlled, ice-cold, calm response disarms their power.',
    dilemma: {
      situation: 'In a department-wide meeting with senior leaders, a rival colleague aggressively cuts you off, blaming your team for a delayed client deliverable in a snide, accusatory tone.',
      question: 'How do you counter?',
      options: [
        {
          id: 'opt-a',
          label: 'Immediately raise your voice, expose his past blunders, and put him in his place.',
          isWise: false,
          feedback: 'Rage bait. The room forgets who was right and only remembers that two undisciplined children were shouting at each other.'
        },
        {
          id: 'opt-b',
          label: 'Take a slow breath, speak at half-speed in a calm tone, state the facts with dates, and offer to review the audit trail together right after the call.',
          isWise: true,
          feedback: 'Flawless execution. Your calm tone acts as a mirror showing everyone in the room who is in control of their faculties and who is unhinged.'
        },
        {
          id: 'opt-c',
          label: 'Stay silent and sulk, then vent bitterly to your direct reports after the meeting.',
          isWise: false,
          feedback: 'Passive-aggressive weakness. Silence without resolution creates resentment that poisons your team morale.'
        }
      ]
    },
    solomonBriefing: 'He who controls his tongue controls the battlefield. When you match a screaming man’s volume, you let him dictate the terms of engagement.',
    keyTakeaway: 'Lower your voice as the temperature rises. Cool composure under public attack signals absolute authority.',
    xpReward: 35
  },
  {
    id: 'proverb-silent-fool',
    category: 'tongue-conflict',
    title: 'The Meeting With Nothing to Say',
    reference: 'Proverbs 17:28',
    formalText: 'Even a fool who keeps silent is considered wise; when he closes his lips, he is deemed intelligent.',
    streetTranslation: 'You never have to apologize for what you did not say. If you have nothing substantive to add, your silence sounds like strategic restraint.',
    dilemma: {
      situation: 'You are invited to a high-level strategic alignment session where you are unfamiliar with the intricate technical nuances being debated. Everyone around the table is jockeying for speaking time to look smart.',
      question: 'What is your posture?',
      options: [
        {
          id: 'opt-a',
          label: 'String together industry buzzwords so you don’t look invisible or passive.',
          isWise: false,
          feedback: 'Disaster. Veteran leaders immediately detect empty posturing. Proverbs warns that a fool’s mouth invites ruin.'
        },
        {
          id: 'opt-b',
          label: 'Listen intently, take sharp notes, and speak only if you have an incisive question or a clean data point that clarifies the bottleneck.',
          isWise: true,
          feedback: 'Tactical intelligence. By not blabbering, your eventual single comment carries 10x the weight of those who spoke for 20 minutes.'
        },
        {
          id: 'opt-c',
          label: 'Pretend to be on an urgent phone call to avoid being called on.',
          isWise: false,
          feedback: 'Cowardly retreat. Silence while present is dignified; feigning escape damages your standing.'
        }
      ]
    },
    solomonBriefing: 'The desire to prove you belong in the room makes you speak too early. Master the discipline of tactical silence until your words are lethal with precision.',
    keyTakeaway: 'Speak only when your words improve upon silence. Better to be thought thoughtful than proven hollow.',
    xpReward: 35
  },

  // 3. SLUGGARD VS. RELENTLESS
  {
    id: 'proverb-ant-discipline',
    category: 'sluggard-work',
    title: 'The Autonomous Grind',
    reference: 'Proverbs 6:6-8',
    formalText: 'Go to the ant, O sluggard; consider her ways, and be wise. Without having any chief, officer, or ruler, she prepares her bread in summer and gathers her food in harvest.',
    streetTranslation: 'If you only work hard when a manager is breathing down your neck, you are a child. High-value operators build internal drive that needs no babysitter.',
    dilemma: {
      situation: 'You have three weeks of remote work with minimal supervisor check-ins before a major product launch. The weather is pristine, your gaming setup is 5 feet away, and nobody will notice if you do 2 hours of real work a day.',
      question: 'How do you operate?',
      options: [
        {
          id: 'opt-a',
          label: 'Coast for two and a half weeks, then pull manic all-nighters right before the deadline.',
          isWise: false,
          feedback: 'Sluggard logic. Emergency panic creates sloppy, uninspired work riddled with bugs that destroy trust.'
        },
        {
          id: 'opt-b',
          label: 'Treat your calendar like a professional athlete: clock in early, finish core milestones before noon, and build a buffer.',
          isWise: true,
          feedback: 'Ant sovereignty. You do not require a whip because you respect your own code of craftsmanship. When winter hits, you feast.'
        },
        {
          id: 'opt-c',
          label: 'Do just enough to answer Slack pings and spend the rest of the day daydreaming about your future dream company.',
          isWise: false,
          feedback: 'Delusion. Proverbs 13:4 says: "The soul of the sluggard craves and gets nothing, while the soul of the diligent is richly supplied."'
        }
      ]
    },
    solomonBriefing: 'The ant has no overseer, yet she prepares her storehouse in the summer. Maturity is doing the hard thing when no camera is pointed at you.',
    keyTakeaway: 'Self-governance is the parent of all wealth and mastery. Fire the internal sluggard before life fires you.',
    xpReward: 35
  },
  {
    id: 'proverb-lion-in-street',
    category: 'sluggard-work',
    title: 'The "Reasonable" Excuse Trap',
    reference: 'Proverbs 26:13',
    formalText: 'The sluggard says, "There is a lion in the road! There is a fierce lion in the streets!"',
    streetTranslation: 'A lazy mind can always invent a completely dramatic, plausible-sounding excuse to justify staying in bed or putting off the hard call.',
    dilemma: {
      situation: 'You need to make 10 uncomfortable sales calls to prospective clients today. You catch yourself thinking: "The economy is weird this week, Tuesday morning is bad for outreach, and I should really redesign my logo first."',
      question: 'How do you break the paralysis?',
      options: [
        {
          id: 'opt-a',
          label: 'Spend the next 4 hours researching the ideal outreach strategy on YouTube.',
          isWise: false,
          feedback: 'Productive procrastination. You traded uncomfortable action for a dopamine rush of theoretical planning.'
        },
        {
          id: 'opt-b',
          label: 'Recognize the imaginary "lion" for what it is: fear of rejection masquerading as logic. Dial the first number within 60 seconds.',
          isWise: true,
          feedback: 'Relentless breakthrough. Action dissolves dread. Once the first call is done, the lion vanishes into thin air.'
        },
        {
          id: 'opt-c',
          label: 'Postpone the calls until next Monday when conditions feel more aligned.',
          isWise: false,
          feedback: 'Next Monday will bring a new lion, a bear, and a thunderstorm. The sluggard dies of perpetual preparation.'
        }
      ]
    },
    solomonBriefing: 'The human brain is an Olympic athlete at inventing rational reasons to avoid pain. Identify your imaginary lions and walk straight through them.',
    keyTakeaway: 'When resistance tells you "now is not the right time," it is almost always the exact time to strike.',
    xpReward: 35
  },

  // 4. EGO & BRUTAL FEEDBACK
  {
    id: 'proverb-pride-ruin',
    category: 'ego-criticism',
    title: 'The Untouchable Founder',
    reference: 'Proverbs 16:18',
    formalText: 'Pride goes before destruction, and a haughty spirit before a fall.',
    streetTranslation: 'When you start believing your own press releases and think you are too gifted to fail, you are standing on a trapdoor with a frayed rope.',
    dilemma: {
      situation: 'After your team scores a massive victory, a junior team member quietly pulls you aside to point out a major blind spot in your contract terms that could leave you exposed.',
      question: 'How do you receive the warning?',
      options: [
        {
          id: 'opt-a',
          label: 'Dismiss him dismissively: "I’ve been doing this for ten years; trust the process."',
          isWise: false,
          feedback: 'The classic precursor to ruin. Solomon watched empires collapse because kings refused to listen to whispers before the roof fell in.'
        },
        {
          id: 'opt-b',
          label: 'Suppress your defensive impulse, inspect the clause with legal counsel immediately, and thank him publicly for the catch.',
          isWise: true,
          feedback: 'Steel humility. Humility is not self-hate; it is an obsession with reality over vanity. You just saved your company a lawsuit.'
        },
        {
          id: 'opt-c',
          label: 'Secretly fix the clause, but ensure the junior member never receives credit so your authority isn’t questioned.',
          isWise: false,
          feedback: 'Fragile ego. Insecurity kills loyalty. A true leader honors vigilance wherever it originates.'
        }
      ]
    },
    solomonBriefing: 'The moment a man believes he cannot be instructed is the moment his downfall is drafted. Treat sharp critique as free armor.',
    keyTakeaway: 'Welcome harsh truth over soothing lies. Pride blinds; humility audits the perimeter.',
    xpReward: 35
  },
  {
    id: 'proverb-faithful-wounds',
    category: 'ego-criticism',
    title: 'The Friend Who Tells the Truth',
    reference: 'Proverbs 27:6',
    formalText: 'Faithful are the wounds of a friend; profuse are the kisses of an enemy.',
    streetTranslation: 'A real brother will stab you in the chest with uncomfortable truth to save your life. A fake ally smiles and flatters you while you walk into traffic.',
    dilemma: {
      situation: 'A respected, loyal friend looks you in the eye over dinner and says: "Your temper with your family lately is completely out of line, and your arrogance at work is alienating the people who built you."',
      question: 'What is your reaction?',
      options: [
        {
          id: 'opt-a',
          label: 'Cut him out of your circle. You don’t need toxic negativity in your space.',
          isWise: false,
          feedback: 'Fatal self-delusion. When you purge honest men from your camp, only sycophants remain. And sycophants will let you march off a cliff.'
        },
        {
          id: 'opt-b',
          label: 'Let the sting sink in. Don’t defend yourself. Ask: "Where else are you seeing this?" and take immediate corrective measures.',
          isWise: true,
          feedback: 'Rare nobility. Those wounds hurt because they cut out rotting flesh. Treasure the friend whose love is strong enough to risk your offense.'
        },
        {
          id: 'opt-c',
          label: 'Bring up his personal failures from three years ago to balance the scoreboard.',
          isWise: false,
          feedback: 'Childish deflection. Counter-attacking is the hallmark of a man whose pride matters more than his character.'
        }
      ]
    },
    solomonBriefing: 'Gold is refined by fire, and men are refined by surgical rebuke. Guard the brothers who refuse to lie to you.',
    keyTakeaway: 'The wounds of a faithful friend are healing scalpels. The flattering kisses of an enemy are cyanide.',
    xpReward: 35
  },

  // 5. TOXIC & DANGEROUS ALLIES
  {
    id: 'proverb-hothead-partner',
    category: 'toxic-allies',
    title: 'The Loose Cannon Co-Founder',
    reference: 'Proverbs 22:24-25',
    formalText: 'Make no friendship with a man given to anger, nor go with a wrathful man, lest you learn his ways and entangle yourself in a snare.',
    streetTranslation: 'Do not partner with a hot-tempered loose cannon. Anger is contagious, and you will end up cleaning up his legal, relational, and business collateral damage.',
    dilemma: {
      situation: 'A brilliant, charismatic salesperson wants to co-found a high-growth startup with you. However, you have repeatedly watched him blow up at restaurant waiters, scream at vendors, and threaten scorched-earth lawsuits when minor friction occurs.',
      question: 'Do you sign the partnership?',
      options: [
        {
          id: 'opt-a',
          label: 'Sign the deal: business is cutthroat, and his fierce aggression will help crush competitors.',
          isWise: false,
          feedback: 'Guaranteed disaster. Proverbs guarantees: "lest you learn his ways and entangle yourself in a snare." The same venom he shoots at waiters will eventually be aimed directly at your throat.'
        },
        {
          id: 'opt-b',
          label: 'Politely walk away from the partnership. No talent compensates for a toxic, unhinged character.',
          isWise: true,
          feedback: 'Life-saving discernment. Competence without temperance is a ticking bomb. You just avoided a devastating partnership divorce.'
        },
        {
          id: 'opt-c',
          label: 'Sign, but draft a clause penalizing him $500 every time he loses his temper.',
          isWise: false,
          feedback: 'Naive engineering. You cannot contract away a character deficiency. When rage strikes, clauses are fuel for the fire.'
        }
      ]
    },
    solomonBriefing: 'Wrath is a fire that consumes whatever is closest to it. He who walks with hotheads will eventually burn his own house down.',
    keyTakeaway: 'Never hitch your wagon to an untamed temper. Talent is cheap; character is the entire game.',
    xpReward: 35
  },
  {
    id: 'proverb-smooth-flatterer',
    category: 'toxic-allies',
    title: 'The Yes-Man with the Golden Tongue',
    reference: 'Proverbs 29:5',
    formalText: 'A man who flatters his neighbor spreads a net for his feet.',
    streetTranslation: 'Unearned excessive praise is never free. The person who compliments your genius before they even know your work is setting a trap for your pride.',
    dilemma: {
      situation: 'A vendor you recently hired constantly showers you with lavish compliments, calls you a visionary leader, and sends expensive gifts, while subtly requesting that you bypass standard audit sign-offs on their invoices.',
      question: 'How do you handle this?',
      options: [
        {
          id: 'opt-a',
          label: 'Enjoy the appreciation and waive the audit: they clearly understand your caliber.',
          isWise: false,
          feedback: 'Caught in the net. The flatterer greased your ego so your guard would drop on the cash register.'
        },
        {
          id: 'opt-b',
          label: 'Return the lavish gifts, reinforce strict adherence to the audit protocol, and scrutinize every invoice twice as hard.',
          isWise: true,
          feedback: 'Solomon’s vigilance. Flattery is the bait of a predator. By enforcing the standard without apology, you disarm the trap.'
        },
        {
          id: 'opt-c',
          label: 'Accept the gifts quietly and pretend not to notice their request.',
          isWise: false,
          feedback: 'Compromised integrity. Accepting favors while knowing the motive entangles you in passive corruption.'
        }
      ]
    },
    solomonBriefing: 'A man who flatters spreads a net for your feet. When the praise is louder than the performance, check your wallet.',
    keyTakeaway: 'Be suspicious of unearned applause. Flattery is designed to soften your defenses before the strike.',
    xpReward: 35
  }
];

export const getAllProverbs = (): ProverbScenario[] => PROVERB_SCENARIOS;

export const getProverbById = (id: string): ProverbScenario | undefined => {
  return PROVERB_SCENARIOS.find(p => p.id === id);
};

export const getProverbsByCategory = (cat: ProverbCategory): ProverbScenario[] => {
  return PROVERB_SCENARIOS.filter(p => p.category === cat);
};
