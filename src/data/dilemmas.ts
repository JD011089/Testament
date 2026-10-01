export interface DilemmaPlay {
  id: string;
  name: string;
  playType: 'Flesh Reaction' | 'The Biblical Play';
  action: string;
  outcome: string;
  biblicalRoot: string;
  scriptureReference: string;
  isRecommended: boolean;
}

export interface RealLifeDilemma {
  id: string;
  title: string;
  category: 'Workplace & Ambition' | 'Family & Relationships' | 'Stress & Burnout' | 'Betrayal & Integrity';
  situationSetup: string;
  whatIsAtStake: string;
  biblicalParallel: {
    hero: string;
    event: string;
    lesson: string;
  };
  anchorScripture: {
    reference: string;
    text: string;
    streetMeaning: string;
  };
  tacticalActionSteps: string[];
  plays: DilemmaPlay[];
}

export const REAL_LIFE_DILEMMAS: RealLifeDilemma[] = [
  // 1. Workplace: Credit Thief
  {
    id: 'dilemma-credit-thief',
    title: 'The Workplace Credit Thief',
    category: 'Workplace & Ambition',
    situationSetup: 'You put in 60 hours over three weeks building a high-stakes client presentation and financial model. In the executive meeting, your peer Mark steps in and presents your core findings as if they were his own brainchild, while the VP nods and heaps praise on him.',
    whatIsAtStake: 'Your temper, your year-end bonus, and your professional credibility.',
    biblicalParallel: {
      hero: 'Joseph in Egypt',
      event: 'The Chief Cupbearer forgot Joseph in prison after Joseph interpreted his dream and saved his skin.',
      lesson: 'Joseph did not burn down the prison or plot bitter revenge; he kept doing exceptional work until his mastery made him indispensable to the king.'
    },
    anchorScripture: {
      reference: 'Genesis 41:38-39 & Proverbs 22:29',
      text: 'Do you see someone skilled in their work? They will serve before kings; they will not serve before officials of low rank.',
      streetMeaning: 'Competence and receipts speak louder than screaming in the hallway. Let time and implementation reveal who actually built the engine.'
    },
    tacticalActionSteps: [
      'Say nothing reactive in the boardroom; maintain an unshakeable poker face.',
      'Send a follow-up email to the VP and team within 2 hours: "Glad Mark highlighted the model summary! Attached are the raw data tables, calculation formulas, and phase 2 execution steps."',
      'When leadership inevitably asks technical questions only the creator can answer, be the calm problem-solver.'
    ],
    plays: [
      {
        id: 'play-credit-flesh',
        name: 'The Hallway Ambush (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Corner him in the breakroom right after the meeting, raise your voice, call him a fraud, and demand he confess to the boss.',
        outcome: 'You look emotionally unstable to colleagues. Mark plays the humble victim, and management tags you as "difficult to work with."',
        biblicalRoot: 'Proverbs 29:11 — "A fool gives full vent to his spirit, but a wise man quietly holds it back."',
        scriptureReference: 'Proverbs 29:11',
        isRecommended: false
      },
      {
        id: 'play-credit-biblical',
        name: 'The Joseph Play (Mastery & Receipts)',
        playType: 'The Biblical Play',
        action: 'Stay silent in the room. Afterward, circulate the technical files with timestamped version history and implementation plans. Make your execution undeniable.',
        outcome: 'The VP immediately notices who holds the keys to the machinery. Mark cannot answer follow-up technicals, and your value becomes obvious without childish drama.',
        biblicalRoot: 'Genesis 41:38-39 — Pharaoh said: "Can we find anyone like this man, one in whom is the spirit of God?"',
        scriptureReference: 'Genesis 41:38-39',
        isRecommended: true
      }
    ]
  },

  // 2. Workplace: Toxic Boss Scapegoat
  {
    id: 'dilemma-boss-scapegoat',
    title: 'The Scapegoating Boss',
    category: 'Workplace & Ambition',
    situationSetup: 'A major client contract hits a roadblock because your manager forgot to approve the vendor compliance paperwork. In an email thread with the company directors, your manager subtly frames it as "a communication breakdown on [Your Name]’s side of the pipeline."',
    whatIsAtStake: 'Your reputation with senior leadership and your job security.',
    biblicalParallel: {
      hero: 'Daniel in Babylon',
      event: 'Corrupt rival commissioners framed Daniel with a new law because they could find no corruption or negligence in his work.',
      lesson: 'Daniel’s integrity was so airtight that his enemies had to invent a trap against his God; he remained faithful, prayed, and let God shut the lions’ mouths.'
    },
    anchorScripture: {
      reference: 'Proverbs 26:24-26 & 1 Peter 3:16',
      text: 'Keeping a clear conscience, so that those who speak maliciously against your good behavior in Christ may be ashamed of their slander.',
      streetMeaning: 'Never trade insults with someone holding institutional rank. Use facts, timestamps, and paper trails to disarm their bluff.'
    },
    tacticalActionSteps: [
      'Do not hit "Reply All" while your adrenaline is surging.',
      'Gather the exact email where you submitted the paperwork to him 3 weeks ago requesting his sign-off.',
      'Schedule a 10-minute 1-on-1 with your manager: "I saw your note to the directors. I want to make sure we are aligned on the timeline before we update the client, since I provided the paperwork on the 12th."'
    ],
    plays: [
      {
        id: 'play-boss-flesh',
        name: 'The Reply-All Nuclear Bomb (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Reply all attaching previous screenshots, aggressively highlighting your boss\'s failure and accusing him of lying to protect his bonus.',
        outcome: 'You humiliate your manager in front of his superiors. Even if you are right, leadership brands you as insubordinate and untrustworthy in a crisis.',
        biblicalRoot: 'Proverbs 18:19 — "An offended brother is more unyielding than a fortified city."',
        scriptureReference: 'Proverbs 18:19',
        isRecommended: false
      },
      {
        id: 'play-boss-biblical',
        name: 'The Daniel In Babylon Play (Quiet Steel & Objective Proof)',
        playType: 'The Biblical Play',
        action: 'Send a calm private note offering the solution first: "Here is the signed document ready for the client. To ensure leadership has accurate milestones, here is the log of submission dates." Put the client first and document the truth.',
        outcome: 'The problem is solved, your professionalism shines, and your manager realizes you have receipts and cannot be bullied.',
        biblicalRoot: 'Daniel 6:4 — "They could find no corruption in him, because he was trustworthy and neither corrupt nor negligent."',
        scriptureReference: 'Daniel 6:4',
        isRecommended: true
      }
    ]
  },

  // 3. Workplace: Unethical Profit / Dirty Money
  {
    id: 'dilemma-dirty-money',
    title: 'The "Nobody Will Know" Deal',
    category: 'Workplace & Ambition',
    situationSetup: 'Your supervisor offers you an off-the-books commission bonus or suggests fudging an audit/inspection report to close a massive account before the fiscal quarter ends. He winks and says, "Everyone in this industry plays this game. It guarantees your promotion next month."',
    whatIsAtStake: 'Your integrity, legal liability, and the spiritual foundation of your family.',
    biblicalParallel: {
      hero: 'Shadrach, Meshach, and Abednego',
      event: 'King Nebuchadnezzar demanded they bow to the golden idol or be thrown into the fiery furnace.',
      lesson: 'They refused to bow, declaring that even if God did not rescue them from the fire, they would never sell their allegiance.'
    },
    anchorScripture: {
      reference: 'Proverbs 13:11 & Mark 8:36',
      text: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow. What does it profit a man to gain the whole world yet forfeit his soul?',
      streetMeaning: 'Fast money built on lies always carries hidden interest rates that will ruin your peace, your family, and your freedom down the road.'
    },
    tacticalActionSteps: [
      'Refuse politely and immediately without preaching or lecturing: "I appreciate the opportunity to close the deal, but I can’t sign off on altering those numbers."',
      'Put all future communications on that specific account into written email records.',
      'Prepare yourself mentally: you may lose the short-term praise of a corrupt boss, but you will keep your head held high.'
    ],
    plays: [
      {
        id: 'play-money-flesh',
        name: 'The Rationalization Play (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Convince yourself that you have bills to pay, everyone else is doing it, and God will understand if you give some of the money to church or charity.',
        outcome: 'You enter a trap of blackmail. The boss now owns you because you are complicit, and the anxiety of being exposed robs you of sleep.',
        biblicalRoot: 'Proverbs 28:20 — "A faithful person will be richly blessed, but one eager to get rich will not go unpunished."',
        scriptureReference: 'Proverbs 28:20',
        isRecommended: false
      },
      {
        id: 'play-money-biblical',
        name: 'The Fiery Furnace Play (Unyielding Standard)',
        playType: 'The Biblical Play',
        action: 'Politely decline the shortcut. Focus on winning clients legitimate ways. If the environment demands fraud, update your resume and look for honorable ground.',
        outcome: 'You preserve an uncompromised reputation. True leaders in your network will value your honesty when the corrupt ship eventually sinks.',
        biblicalRoot: 'Daniel 3:18 — "Even if he does not, we want you to know, Your Majesty, that we will not serve your gods."',
        scriptureReference: 'Daniel 3:18',
        isRecommended: true
      }
    ]
  },

  // 4. Workplace: Sudden Demotion or Layoff
  {
    id: 'dilemma-sudden-layoff',
    title: 'The Demotion & Crushed Ego',
    category: 'Workplace & Ambition',
    situationSetup: 'After giving 5 loyal years to your company, corporate announces a restructuring. Your leadership title is stripped, you are placed under a younger external hire, or you are handed a severance box and walked to the parking lot.',
    whatIsAtStake: 'Your identity as a provider, your pride, and your faith in God’s provision.',
    biblicalParallel: {
      hero: 'David at Ziklag',
      event: 'While fleeing Saul, David’s city of Ziklag was burned, families taken captive, and his own men spoke of stoning him.',
      lesson: 'David wept until he had no strength left, but then he "strengthened himself in the Lord his God" and asked God what the next tactical move was.'
    },
    anchorScripture: {
      reference: '1 Samuel 30:6 & Romans 8:28',
      text: 'David was greatly distressed because the men were talking of stoning him... but David found strength in the Lord his God.',
      streetMeaning: 'Your job title was your assignment, not your identity. When a door is slammed in your face, look for the battlefield God is preparing you for.'
    },
    tacticalActionSteps: [
      'Allow yourself 24 hours to feel the grief and shock without making any rash public statements.',
      'Do not trash the company on LinkedIn or burn bridges with colleagues.',
      'Take inventory of your hard skills, update your resume, and wake up tomorrow at 7:00 AM as if looking for work is your full-time job.'
    ],
    plays: [
      {
        id: 'play-layoff-flesh',
        name: 'The Bitterness Spiral (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Post a passive-aggressive rant on social media, drink alcohol to numb the sting, and spend the next two months moping on the couch convinced you are a failure.',
        outcome: 'You waste critical momentum. Potential employers sense your bitter cynicism, and your family suffers under your depression.',
        biblicalRoot: 'Hebrews 12:15 — "See to it that no bitter root grows up to cause trouble and defile many."',
        scriptureReference: 'Hebrews 12:15',
        isRecommended: false
      },
      {
        id: 'play-layoff-biblical',
        name: 'The Ziklag Pivot (Strengthen Yourself & Attack)',
        playType: 'The Biblical Play',
        action: 'Treat the severance as God moving you off a dead-end road. Maintain grace on your exit interview, lean into prayer for direction, and start building your next chapter.',
        outcome: 'You walk away with honor, free to pursue a greater calling that wouldn’t have been possible while comfortable in your old role.',
        biblicalRoot: '1 Samuel 30:8 — "David inquired of the Lord: Shall I pursue this raiding party? Will I overtake them? Pursue them, he answered."',
        scriptureReference: '1 Samuel 30:8',
        isRecommended: true
      }
    ]
  },

  // 5. Family: Mocking Relatives
  {
    id: 'dilemma-toxic-family',
    title: 'Family Undermining Your Ambition',
    category: 'Family & Relationships',
    situationSetup: 'At a family holiday dinner, your older brother or uncle sarcastically mocks your new trade venture or commitment to your faith: "Who do you think you are now? You’ll probably quit in three months like you always do." Several relatives chuckle.',
    whatIsAtStake: 'Your self-worth, your temper, and family peace.',
    biblicalParallel: {
      hero: 'David at the Valley of Elah',
      event: 'David brought bread to his brothers at the front lines, and his eldest brother Eliab burned with anger, calling him conceited and wicked.',
      lesson: 'David didn’t fight his brother. He asked, "Can’t I even speak?" and turned away to face Goliath instead.'
    },
    anchorScripture: {
      reference: '1 Samuel 17:28-30 & Proverbs 26:4',
      text: 'David then turned away to someone else and brought up the same matter... Do not answer a fool according to his folly, or you will be just like him.',
      streetMeaning: 'Never spend high-caliber ammunition on low-caliber hecklers. Turn your back and save your strength for the giant.'
    },
    tacticalActionSteps: [
      'Take a sip of water; give a 2-second silence to let their disrespect hang in the air.',
      'Reply with a relaxed, 1-sentence shrug: "Time will tell. How are your kids doing with baseball?"',
      'Change the subject or excuse yourself to talk to someone positive in the room.'
    ],
    plays: [
      {
        id: 'play-fam-flesh',
        name: 'The Counter-Attack (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Bring up their past bankruptcies, divorces, or failures to humiliate them in front of the entire family table.',
        outcome: 'The dinner explodes into screaming. You leave feeling toxic and depleted, having let their insecurity derail your focus.',
        biblicalRoot: 'Proverbs 15:18 — "A hot-tempered person stirs up conflict, but the one who is patient calms a quarrel."',
        scriptureReference: 'Proverbs 15:18',
        isRecommended: false
      },
      {
        id: 'play-fam-biblical',
        name: 'The Eliab Shrug (Turn to the Giant)',
        playType: 'The Biblical Play',
        action: 'Smile gently, refuse to take the bait, and turn your attention to someone else. Let your execution over the next 12 months do the talking.',
        outcome: 'Their sarcasm bounces off your armor. You preserve your peace, and your growth becomes undeniable over time.',
        biblicalRoot: '1 Samuel 17:30 — "He turned away from him toward someone else."',
        scriptureReference: '1 Samuel 17:30',
        isRecommended: true
      }
    ]
  },

  // 6. Family: 10-Year Estrangement & Money Demands
  {
    id: 'dilemma-estrangement-grudge',
    title: 'The Estranged Relative Asking for Bailout',
    category: 'Family & Relationships',
    situationSetup: 'An estranged parent or sibling who mistreated or ignored you for years suddenly texts out of nowhere: they are behind on rent, facing eviction, and guilt-tripping you to send $1,500 immediately because "we’re blood."',
    whatIsAtStake: 'Your financial boundaries, emotional health, and understanding of true biblical mercy vs. enabling.',
    biblicalParallel: {
      hero: 'Joseph Testing His Brothers',
      event: 'When Joseph’s brothers arrived in Egypt needing grain, Joseph did not immediately hand out free favors; he tested their hearts to see if they had truly changed.',
      lesson: 'Forgiveness is free; trust and partnership must be earned through fruit.'
    },
    anchorScripture: {
      reference: 'Galatians 6:5 & 2 Thessalonians 3:10',
      text: 'For each should carry their own load... The one who is unwilling to work shall not eat.',
      streetMeaning: 'Biblical love does not mean funding someone’s addiction or dysfunction. You can love them without handing them a blank check.'
    },
    tacticalActionSteps: [
      'Do not wire money under emotional panic or artificial deadlines.',
      'Separate the emergency from the relationship: offer non-cash support if appropriate (e.g. paying the utility company directly or buying groceries).',
      'Set a firm boundary: "I care about you, but I cannot give a cash loan. I am willing to buy groceries or help you review a budget."'
    ],
    plays: [
      {
        id: 'play-estrange-flesh-1',
        name: 'The Guilt-Tripped Enabler (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Immediately send the cash out of guilt to stop them from badmouthing you to the rest of the family, even though you know they will waste it.',
        outcome: 'You enable their destructive cycle. In three months, they will return demanding more and get angry when you finally say no.',
        biblicalRoot: 'Proverbs 19:19 — "A hot-tempered person must pay the penalty; rescue them, and you will have to do it again."',
        scriptureReference: 'Proverbs 19:19',
        isRecommended: false
      },
      {
        id: 'play-estrange-biblical',
        name: 'The Joseph Boundary Play (Wise Compassion Without Enabling)',
        playType: 'The Biblical Play',
        action: 'Forgive the past in your heart, but maintain wise guardrails. Offer practical, conditional help directly to the vendor if you choose, but refuse enabling loans.',
        outcome: 'You protect your household while modeling healthy, sober love that honors God rather than fear.',
        biblicalRoot: 'Genesis 42:18-20 — Joseph set boundaries to inspect their character before opening his home.',
        scriptureReference: 'Genesis 42:18-20',
        isRecommended: true
      }
    ]
  },

  // 7. Family: Marital Cold War & Silent Treatment
  {
    id: 'dilemma-marital-silent-war',
    title: 'The 48-Hour Marital Cold War',
    category: 'Family & Relationships',
    situationSetup: 'After a heated disagreement on Thursday night, neither you nor your spouse has spoken a word. You walk by each other in the kitchen like ghosts. Your pride whispers: "They started it; they need to come apologize to me first."',
    whatIsAtStake: 'Your marriage, intimacy, and the spiritual climate of your home.',
    biblicalParallel: {
      hero: 'Jesus Washing Disciples’ Feet',
      event: 'Knowing Judas was about to betray him and Peter would deny him, Jesus took off his outer robe, wrapped a towel around his waist, and washed their dirty feet.',
      lesson: 'In the Kingdom of God, the leader is the one who initiates humility and service first.'
    },
    anchorScripture: {
      reference: 'Ephesians 4:26-27 & Romans 12:18',
      text: 'Do not let the sun go down while you are still angry, and do not give the devil a foothold... As far as it depends on you, live at peace with everyone.',
      streetMeaning: 'Cold silence is the devil’s favorite breeding ground. Breaking the stalemate first isn’t losing—it’s taking spiritual leadership.'
    },
    tacticalActionSteps: [
      'Swallow the poison pill of needing to "win" the argument.',
      'Make a warm drink or coffee and set it in front of them without sarcasm.',
      'Say one disarming sentence: "I hate this silence between us. I care more about our marriage than being right. Can we restart?"'
    ],
    plays: [
      {
        id: 'play-marital-flesh',
        name: 'The Stonewall Freeze (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Sleep on the sofa, give cold one-word answers, and wait for them to break down and beg for your forgiveness.',
        outcome: 'Resentment hardens into stone. The enemy gains a foothold in your home, and intimacy dies a slow death.',
        biblicalRoot: 'Proverbs 18:1 — "An unfriendly person pursues selfish ends and against all sound judgment starts quarrels."',
        scriptureReference: 'Proverbs 18:1',
        isRecommended: false
      },
      {
        id: 'play-marital-biblical',
        name: 'The Foot-Washing Initiative (First to Apologize)',
        playType: 'The Biblical Play',
        action: 'Be the mature adult who initiates peace. Own your 10% of the fault unconditionally: "I am sorry for my harsh tone." Watch how humility breaks their defensive walls.',
        outcome: 'The emotional ice melts immediately. Your spouse feels safe, and you restore closeness without sacrificing dignity.',
        biblicalRoot: 'Ephesians 4:32 — "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you."',
        scriptureReference: 'Ephesians 4:32',
        isRecommended: true
      }
    ]
  },

  // 8. Family: In-Law Boundary Crosser
  {
    id: 'dilemma-inlaw-boundary',
    title: 'The Overstepping In-Laws',
    category: 'Family & Relationships',
    situationSetup: 'Your in-laws constantly drop by unannounced, criticize how you raise your kids, and make passive-aggressive comments about how you provide for your household. Your spouse is terrified of confronting their parents and tells you to "just let it go."',
    whatIsAtStake: 'Your marriage unity, household peace, and leadership.',
    biblicalParallel: {
      hero: 'Genesis Mandate (Leave & Cleave)',
      event: 'God ordained the design of marriage at creation: a man leaves his father and mother and clings to his wife.',
      lesson: 'A marriage cannot survive if the umbilical cord to the parents is never severed.'
    },
    anchorScripture: {
      reference: 'Genesis 2:24 & Matthew 19:5',
      text: 'For this reason a man will leave his father and mother and be united to his wife, and the two will become one flesh.',
      streetMeaning: 'Honor your parents, but protect your marriage garden. Your spouse and children are your primary flock now.'
    },
    tacticalActionSteps: [
      'Do not attack your in-laws to your spouse; that puts your spouse in a loyalty trap.',
      'Have a calm, unified discussion behind closed doors: "I love your parents, but for our marriage to thrive, we need clear boundaries on visits."',
      'Present a united front together with polite, clear guidelines.'
    ],
    plays: [
      {
        id: 'play-inlaw-flesh',
        name: 'The Sunday Blowup (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Snap in front of the children during Sunday dinner, telling the in-laws to get out of your house and mind their own business.',
        outcome: 'Your spouse is deeply hurt and defends their parents. The family fractures into opposing camps.',
        biblicalRoot: 'Proverbs 14:1 — "The wise woman builds her house, but with her own hands the foolish one tears it down."',
        scriptureReference: 'Proverbs 14:1',
        isRecommended: false
      },
      {
        id: 'play-inlaw-biblical',
        name: 'The United Fortress Play (Unified Boundaries)',
        playType: 'The Biblical Play',
        action: 'Align with your spouse first. Together, gently set clear schedules: "We love seeing you, but moving forward we need a call 24 hours ahead before visits."',
        outcome: 'Boundaries create respect. The tension de-escalates, and your household regains peace and autonomy.',
        biblicalRoot: 'Proverbs 25:17 — "Seldom set foot in your neighbor’s house—too much of you, and they will hate you."',
        scriptureReference: 'Proverbs 25:17',
        isRecommended: true
      }
    ]
  },

  // 9. Stress: 80-Hour Burnout & Snapping at Home
  {
    id: 'dilemma-burnout-home',
    title: 'The 80-Hour Burnout & Snapping at Home',
    category: 'Stress & Burnout',
    situationSetup: 'You’ve worked brutal 12-hour shifts all week. Your back hurts, your head is pounding. You walk through your front door and your spouse asks an innocent question or the kids are rowdy, and you instantly bark in anger.',
    whatIsAtStake: 'Your children’s emotional safety, your marriage, and your physical health.',
    biblicalParallel: {
      hero: 'Elijah Under the Broom Tree',
      event: 'After the Mount Carmel showdown, Elijah ran into the wilderness exhausted and collapsed under a tree asking God to let him die.',
      lesson: 'God didn’t preach at Elijah or rebuke him; He sent an angel with baked bread, fresh water, and let him sleep.'
    },
    anchorScripture: {
      reference: '1 Kings 19:5-8 & Mark 6:31',
      text: 'Come with me by yourselves to a quiet place and get some rest... The angel touched him and said, "Get up and eat, for the journey is too much for you."',
      streetMeaning: 'When your battery is at 1%, your anger is not spiritual—it is physical exhaustion. Own the low battery instead of blaming everyone else.'
    },
    tacticalActionSteps: [
      'Recognize the redline before you step across the threshold of your home.',
      'Take 5 deep breaths in your car in the driveway before turning the key.',
      'Own it immediately: "I am so sorry I snapped. My tank is at absolute zero right now. Let me wash my face and sit for 15 minutes, then I want to be present with you."'
    ],
    plays: [
      {
        id: 'play-burn-flesh',
        name: 'The Martyr Shield (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Defend your outburst: "Do you realize how hard I work to pay the bills around here?! Can I get 5 minutes without everyone whining?!"',
        outcome: 'Your family walks on eggshells. Your home becomes a tense fortress, and you isolate further in guilt.',
        biblicalRoot: 'Proverbs 15:1 — "A gentle answer turns away wrath, but a harsh word stirs up anger."',
        scriptureReference: 'Proverbs 15:1',
        isRecommended: false
      },
      {
        id: 'play-burn-biblical',
        name: 'The Elijah Broom Tree Play (Own the Low Battery)',
        playType: 'The Biblical Play',
        action: 'Drop the tough-guy facade. Apologize cleanly without excuses, ask for 20 minutes to rest and recharge, and protect the peace of your sanctuary.',
        outcome: 'Your family extends grace because you were humble and honest instead of tyrannical. Your home remains a haven.',
        biblicalRoot: '1 Kings 19:7 — "The angel of the Lord came back a second time and touched him and said, \'Get up and eat, for the journey is too much for you.\'"',
        scriptureReference: '1 Kings 19:7',
        isRecommended: true
      }
    ]
  },

  // 10. Stress & Temptation: Late Night Digital Vice
  {
    id: 'dilemma-digital-temptation',
    title: 'Late Night Isolation & The Secret Escape',
    category: 'Stress & Burnout',
    situationSetup: 'It is 1:00 AM. You are exhausted, stressed about money, and everyone in the house is asleep. You are staring at your phone or laptop. The familiar urge rises to open an incognito browser tab or text someone you shouldn’t to numb the emptiness.',
    whatIsAtStake: 'Your purity, your spiritual authority, and your self-respect in the mirror.',
    biblicalParallel: {
      hero: 'Joseph Fleeing Potiphar’s Wife',
      event: 'Potiphar’s wife caught Joseph by his cloak alone in the house and demanded he sleep with her.',
      lesson: 'Joseph did not debate, reason, or try to be strong; he left his cloak in her hand and literally ran out of the room.'
    },
    anchorScripture: {
      reference: '1 Corinthians 6:18 & 2 Timothy 2:22',
      text: 'Flee from sexual immorality... Flee the evil desires of youth and pursue righteousness, faith, love and peace.',
      streetMeaning: 'You do not box with temptation at 1 AM; you run. Courage in sexual temptation is having the wisdom to leave the room.'
    },
    tacticalActionSteps: [
      'Throw the phone across the room or plug it into the kitchen outlet away from your bed.',
      'Get out of bed immediately, drink a glass of cold water, or do 20 pushups to break the physical trance.',
      'Pray 1 honest sentence: "Lord, I am tired and stressed. Fill the void in my heart right now. I refuse to trade my dignity for 5 seconds of dopamine."'
    ],
    plays: [
      {
        id: 'play-digital-flesh',
        name: 'The "Just One Look" Trap (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Tell yourself you will just scroll for a minute to relax because you had a hard day and deserve a release.',
        outcome: 'Ten minutes later you are swimming in shame, your spiritual confidence is shattered, and you wake up tomorrow groggy and defeated.',
        biblicalRoot: 'Proverbs 5:8-9 — "Keep to a path far from her, do not go near the door of her house, lest you lose your honor to others."',
        scriptureReference: 'Proverbs 5:8-9',
        isRecommended: false
      },
      {
        id: 'play-digital-biblical',
        name: 'The Joseph Sprint (Physical Relocation)',
        playType: 'The Biblical Play',
        action: 'Leave the device behind, get on your knees, and surrender the exhaustion to God. Go to sleep with a clear conscience.',
        outcome: 'You wake up the next morning feeling like a conqueror. Your spiritual strength grows every time you say NO in secret.',
        biblicalRoot: 'Genesis 39:12 — "She caught him by his cloak... but he left his cloak in her hand and ran out of the house."',
        scriptureReference: 'Genesis 39:12',
        isRecommended: true
      }
    ]
  },

  // 11. Stress & Ambition: The Envy Spiral
  {
    id: 'dilemma-envy-spiral',
    title: 'The Social Media Envy Spiral',
    category: 'Stress & Burnout',
    situationSetup: 'You open Instagram or LinkedIn. An old high school acquaintance just posted photos of his new $1.2M home and luxury car. Another friend just raised $5M for a startup. You look around your modest apartment and feel like a complete loser.',
    whatIsAtStake: 'Your gratitude, contentment, and joy in your current calling.',
    biblicalParallel: {
      hero: 'King Saul’s Envy of David',
      event: 'When women sang "Saul has slain his thousands, and David his tens of thousands," Saul burned with jealousy and spent the rest of his life trying to murder David.',
      lesson: 'Comparison turned an anointed king into a paranoid madman chasing shadows in the desert.'
    },
    anchorScripture: {
      reference: 'Proverbs 14:30 & Galatians 6:4',
      text: 'A heart at peace gives life to the body, but envy rots the bones... Each one should test their own actions. Then they can take pride in themselves alone, without comparing themselves to someone else.',
      streetMeaning: 'Comparison is the thief of purpose. You cannot run your race while staring at someone else’s lane.'
    },
    tacticalActionSteps: [
      'Delete or mute social media apps for 7 days.',
      'Write down 5 concrete blessings you have right now that money cannot buy (health, clear conscience, family, salvation).',
      'Bless them genuinely in prayer: "Lord, prosper them and keep them humble. Now show me how to be faithful with what’s in my hands today."'
    ],
    plays: [
      {
        id: 'play-envy-flesh',
        name: 'The Saul Paranoia (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Obsessively browse luxury real estate you can’t afford, take on stupid debt to look successful, and complain about how "unlucky" you are.',
        outcome: 'Financial strain, bitterness, and rotted bones. You miss the beautiful season of growth God has you in right now.',
        biblicalRoot: '1 Samuel 18:9 — "And from that time on Saul kept a close eye on David."',
        scriptureReference: '1 Samuel 18:9',
        isRecommended: false
      },
      {
        id: 'play-envy-biblical',
        name: 'The Faithful Steward Play (Eyes on Your Lane)',
        playType: 'The Biblical Play',
        action: 'Celebrate their victory and lock in on your own grind. Master the little things right in front of you.',
        outcome: 'Deep peace and unshakeable focus. When promotion comes your way, you will have the character to carry it without pride.',
        biblicalRoot: 'Luke 16:10 — "Whoever can be trusted with very little can also be trusted with much."',
        scriptureReference: 'Luke 16:10',
        isRecommended: true
      }
    ]
  },

  // 12. Betrayal: Backstabbing Friend
  {
    id: 'dilemma-friend-betrayal',
    title: 'Navigating Broken Trust & Rumors',
    category: 'Betrayal & Integrity',
    situationSetup: 'A close friend you mentored, helped financially, and invited into your inner circle was overheard at a social gathering mocking your personal struggles and spreading exaggerated rumors about you to gain favor with a cooler crowd.',
    whatIsAtStake: 'Your heart hardening into cynicism and hatred towards people.',
    biblicalParallel: {
      hero: 'David & Ahithophel',
      event: 'David’s trusted counselor Ahithophel, who ate bread at his table, joined Absalom’s rebellion to overthrow him.',
      lesson: 'David poured his sorrow out to God in Psalm 55 rather than taking human vengeance, trusting God’s justice.'
    },
    anchorScripture: {
      reference: 'Romans 12:19 & Psalm 55:12-14',
      text: 'Do not take revenge, my dear friends, but leave room for God’s wrath, for it is written: "It is mine to avenge; I will repay," says the Lord.',
      streetMeaning: 'When a Judas kisses your cheek, don’t drop to their level. God sees the treason and handles accounts better than you ever could.'
    },
    tacticalActionSteps: [
      'Do not blast them publicly on social media or in group chats.',
      'Quietly remove them from your inner circle of confidence; do not feed pearls to swine.',
      'Confront them privately once with facts: "I heard what you shared at dinner. I am hurt and disappointed. For my own peace, I am stepping back from our closeness."'
    ],
    plays: [
      {
        id: 'play-betray-flesh',
        name: 'The Scorched Earth War (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Leak their private secrets, tell all mutual friends what a fake they are, and wage a social campaign to cancel them.',
        outcome: 'Mutual friends get sick of both of you. You become just as dirty as the slanderer, and your spiritual peace is wrecked.',
        biblicalRoot: 'Proverbs 17:9 — "Whoever fosters love covers over an offense, but whoever repeats the matter separates close friends."',
        scriptureReference: 'Proverbs 17:9',
        isRecommended: false
      },
      {
        id: 'play-betray-biblical',
        name: 'The Matthew 18 & Psalm 55 Play (Quiet Excision & God\'s Court)',
        playType: 'The Biblical Play',
        action: 'Speak the truth in love directly to their face, set firm distance, forgive them in your heart so you don’t carry the poison, and let God handle the rest.',
        outcome: 'Your heart remains clean and soft. You protect yourself from future betrayal while modeling godliness under fire.',
        biblicalRoot: 'Matthew 18:15 — "If your brother or sister sins, go and point out their fault, just between the two of you."',
        scriptureReference: 'Matthew 18:15',
        isRecommended: true
      }
    ]
  },

  // 13. Betrayal & Integrity: Financial Emergency & Predatory Debt
  {
    id: 'dilemma-financial-panic',
    title: 'The Financial Emergency & The Panic Loan',
    category: 'Betrayal & Integrity',
    situationSetup: 'Your car transmission blows up and a medical bill lands in the same week ($3,200 total). Your savings account has $200. Panic sets in. A high-interest payday lender or shady acquaintance offers quick cash at 38% interest.',
    whatIsAtStake: 'Years of crippling financial bondage, family stability, and peace of mind.',
    biblicalParallel: {
      hero: 'The Widow’s Oil with Elisha',
      event: 'A deceased prophet’s wife was facing creditors who came to take her two sons as slaves because of unpaid debts.',
      lesson: 'Elisha asked: "Tell me, what do you have in your house?" God multiplied the small jar of olive oil she already possessed to clear the debt.'
    },
    anchorScripture: {
      reference: 'Proverbs 22:7 & Philippians 4:19',
      text: 'The rich rule over the poor, and the borrower is slave to the lender... And my God will meet all your needs according to the riches of his glory.',
      streetMeaning: 'Never make permanent financial decisions in a temporary panic state. Slavery begins when you sign predatory papers.'
    },
    tacticalActionSteps: [
      'Stop and pray: "God, You are my provider. Close my ears to panic and show me the path."',
      'Call the hospital billing department immediately and ask for the "financial hardship application" or negotiate an interest-free payment plan.',
      'Sell items you don’t need, take on temporary weekend side labor, and ask a trusted mentor or church community for emergency assistance before predatory loans.'
    ],
    plays: [
      {
        id: 'play-panic-flesh',
        name: 'The Payday Shackle (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Sign the 38% predatory loan papers just to stop the anxiety today, promising yourself you will figure out how to pay it next month.',
        outcome: 'Interest swallows your paycheck. The debt balloons to $7,000, and you spend the next three years working just to pay fees.',
        biblicalRoot: 'Proverbs 22:7 — "The borrower is slave to the lender."',
        scriptureReference: 'Proverbs 22:7',
        isRecommended: false
      },
      {
        id: 'play-panic-biblical',
        name: 'The Widow’s Jar Play (Hustle, Negotiate, & Trust Provision)',
        playType: 'The Biblical Play',
        action: 'Refuse toxic debt. Negotiate every bill down to $50/mo, sell unused gear, pick up extra shifts, and trust God to provide step by step.',
        outcome: 'You pay it off clean through grit and honor. You break the generational cycle of financial panic and sleep like a free man.',
        biblicalRoot: '2 Kings 4:7 — "Go, sell the oil and pay your debts. You and your sons can live on what is left."',
        scriptureReference: '2 Kings 4:7',
        isRecommended: true
      }
    ]
  },

  // 14. Integrity: Group Chat Slander / Peer Pressure
  {
    id: 'dilemma-group-chat-pressure',
    title: 'The Group Chat Mockery',
    category: 'Betrayal & Integrity',
    situationSetup: 'In a group chat with 8 long-time buddies, someone shares an embarrassing video or screenshot of a vulnerable mutual acquaintance. Everyone is dropping laughing GIFs, making cruel jokes, and someone tags you: "Bro, tell him what you think 😂."',
    whatIsAtStake: 'Your moral courage, your integrity, and standing up for the defenseless.',
    biblicalParallel: {
      hero: 'Peter in the Courtyard vs Nathan Confronting David',
      event: 'Peter conformed to the crowd at the charcoal fire and cursed to fit in, while the prophet Nathan boldly spoke truth to power.',
      lesson: 'Going along with the mob to avoid social discomfort is cowardice; true men stand in the gap.'
    },
    anchorScripture: {
      reference: 'Exodus 23:2 & Proverbs 31:8-9',
      text: 'Do not follow the crowd in doing wrong... Speak up for those who have no voice, for the justice of all who are dispossessed.',
      streetMeaning: 'It costs nothing to laugh with the pack. It takes a real man to say "That’s enough, guys. We’re better than this."'
    },
    tacticalActionSteps: [
      'Refuse to send a laughing emoji just to fit in.',
      'Drop a direct, calm tone-check: "Come on guys, that’s low. Leave the man alone."',
      'Notice how one person with backbone gives permission for others in the chat to stop the pile-on.'
    ],
    plays: [
      {
        id: 'play-chat-flesh',
        name: 'The Courtyard Laugh (The Flesh Reaction)',
        playType: 'Flesh Reaction',
        action: 'Send a laughing GIF and add another joke so the guys don’t think you’re soft or "too religious now."',
        outcome: 'You feel a pit in your stomach. You traded your integrity for 10 seconds of cheap peer validation.',
        biblicalRoot: 'Proverbs 29:25 — "Fear of man will prove to be a snare, but whoever trusts in the Lord is kept safe."',
        scriptureReference: 'Proverbs 29:25',
        isRecommended: false
      },
      {
        id: 'play-chat-biblical',
        name: 'The Stand In The Gap Play (Quiet Courage)',
        playType: 'The Biblical Play',
        action: 'Politely redirect the energy or call time-out on the slander. Show leadership that sets the moral bar for your crew.',
        outcome: 'The group chat calms down. Real men respect someone with convictions, and you sleep with a clean soul.',
        biblicalRoot: 'Exodus 23:2 — "Do not follow the crowd in doing wrong."',
        scriptureReference: 'Exodus 23:2',
        isRecommended: true
      }
    ]
  }
];
