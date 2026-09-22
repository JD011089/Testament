import type { StoryQuest } from '../types';

export const STORY_QUESTS: StoryQuest[] = [
  {
    id: 'david-journey',
    title: 'David: The Outlaw & The Giant',
    subtitle: 'From overlooked shepherd to king forged in desert caves',
    heroName: 'David',
    characterTitle: 'The Relentless Heart',
    testament: 'Old Testament',
    historicalPeriod: 'c. 1020 BC — Ancient Israel',
    estimatedMinutes: 6,
    themeColor: 'from-amber-600 to-stone-900',
    badgeName: 'Giant Slayer',
    starterTrack: 'Underdog & Purpose',
    relicReward: {
      id: 'david-stones',
      name: 'The Five Smooth Stones',
      iconName: 'stones',
      description: 'Stream stones gathered from the brook of Elah.',
      lesson: 'Never fight in borrowed armor. You don’t need to fake who you are to bring down a giant.'
    },
    summary: 'A raw look at fear, psychological warfare, and what happens when an ordinary person refuses to let intimidation dictate reality.',
    acts: [
      {
        id: 'david-act-1',
        actNumber: 1,
        actTitle: 'Psychological Warfare in the Valley',
        visualTheme: 'valley_battlefield',
        sceneAtmosphere: 'Two armies camped on opposing limestone ridges. Between them: a nine-foot veteran mercenary bellowing insults across the ravine for forty straight mornings.',
        historicalContext: "In ancient warfare, champions would duel to the death so thousands of men didn't have to butcher each other blindly. The Philistines brought their ultimate weapon: Goliath, armored in bronze scales weighing over 120 pounds.",
        narrativeParagraphs: [
          'Picture this: You are standing in the ranks of King Saul’s army. These are grown men—hardened veterans who know how to swing an iron blade. Yet every morning and every evening, this monstrous warrior steps into the dust, bangs his bronze spear against his shield, and roars: "Send me one man! If he beats me, we will be your slaves. But if I kill him, you are ours!"',
          'For forty straight days, nobody moves. Saul is trembling in his royal tent. The soldiers are paralyzed. It is pure psychological warfare. If fear sits in your head long enough, it starts looking like common sense.',
          'Then walks in David. He’s not even a soldier—he’s the youngest boy in a family of eight, sent by his dad just to bring roasted grain and cheese to his older brothers. When David hears this brute mock his God and his people, his older brothers yell at him: "Who do you think you are? Go back to your sheep!"',
          'David ignores the family noise. He looks at Saul and says the most offensive thing possible to a frightened king: "Let no man lose heart on account of this Philistine; your servant will go and fight him."'
        ],
        perspectivePrompt: "Put yourself in David’s boots. You’re young, your own family tells you to shut up, and a 9-foot veteran wants to tear your limbs off. What is your gut reaction?",
        choices: [
          {
            id: 'choice-1',
            text: "Keep your head down. It’s Saul’s problem, not yours.",
            reaction: "That is what 99% of normal people would do. Most of us avoid friction even when something deeply wrong is staring us in the face.",
            historicalPivot: "David didn’t see Goliath as an invincible monster; he saw him as a mere man defying the Living God who had already helped David survive lions and bears in the wilderness."
          },
          {
            id: 'choice-2',
            text: "Put on King Saul’s bronze armor and pick up a sword.",
            reaction: "Saul actually tried to force that on him! But the heavy helmet clamped over his ears and the bronze coat dragged him down. He couldn’t even take three steps.",
            historicalPivot: "David had the courage to say: \"I cannot go in these, because I am not used to them.\" He stripped off the borrowed prestige and fought with what he actually knew: a sling and five smooth stones from the dry brook."
          },
          {
            id: 'choice-3',
            text: "Call out the intimidation, grab your sling, and run toward the fight.",
            reaction: "This sounds insane to military tacticians, but a skilled slinger could launch a river stone at over 100 miles per hour with the stopping power of a modern handgun.",
            historicalPivot: "David didn’t creep forward hesitantly. Scripture says he ran quickly toward the battle line to meet him. One clean strike to the unprotected forehead, and the giant crashed face-first into the dirt."
          }
        ],
        unlockedScripture: {
          reference: '1 Samuel 17:45',
          translation: 'CSB / Modern Plain English',
          text: 'David said to the Philistine: "You come against me with a sword, spear, and javelin, but I come against you in the name of the Lord of Armies, the God of the ranks of Israel—whom you have defied."',
          deepDive: "Notice David didn't pretend Goliath wasn't lethal. He acknowledged the weapons in Goliath's hands, but put them next to an infinite God. Perspective changes everything."
        },
        glossary: [
          {
            term: 'Philistines',
            ancientMeaning: 'Seafaring Aegean warriors who dominated the coastal plains of Canaan with advanced iron weaponry.',
            modernAnalogy: 'Think of them like a high-tech military superpower with superior equipment and ruthless discipline.'
          },
          {
            term: 'Sling & Smooth Stones',
            ancientMeaning: "Not a kid's toy slingshot; a heavy woven leather strap that swung rocks with lethal terminal velocity.",
            modernAnalogy: 'Equivalent to carrying a precision firearm against a heavily encumbered tank who can only fight hand-to-hand.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Intimidation and fear of failure at work, finances, or family responsibilities.',
          practicalLesson: "Never try to fight your battles using someone else's borrowed armor. You don't have to fake being someone else to win.",
          dailyAction: 'Identify the one "Goliath" problem you have avoided for weeks. Stop waiting for someone else to step up—tackle it head-on with the authentic skills you already have.'
        },
        wisdomQuiz: {
          question: "When David’s older brother Eliab angrily mocked him for showing up at the battle line, what was David’s winning strategy?",
          options: [
            {
              text: "He got into a fistfight with his brother to prove he was tough.",
              isCorrect: false,
              explanation: "Wasting your energy fighting small-minded critics is how you miss the real giant in front of you."
            },
            {
              text: "He turned away from the family drama and kept his eyes on the real mission.",
              isCorrect: true,
              explanation: "Spot on. Scripture notes David literally 'turned away toward someone else.' Don’t waste your best ammo on sideways noise."
            },
            {
              text: "He packed up his cheese and went back to his sheep.",
              isCorrect: false,
              explanation: "If David listened to his family’s insecurities, Goliath would have ruled the valley."
            }
          ]
        },
        teaserForNext: "David’s stone toppled the giant, but King Saul’s paranoid jealousy is about to trigger a 3,000-man military manhunt. Can David survive the outlaw caves?"
      },
      {
        id: 'david-act-2',
        actNumber: 2,
        actTitle: 'The Cave of the Outlaws',
        visualTheme: 'cave_refuge',
        sceneAtmosphere: 'Damp limestone caves at Adullam. Smoke from a small fire stinging your eyes. 400 desperate, broken, broke men looking to David for survival.',
        historicalContext: "After killing Goliath, David became a folk hero. King Saul grew intensely jealous and launched a full military manhunt. David went from celebrated warrior to a wanted fugitive living in caves.",
        narrativeParagraphs: [
          'Most people know the Goliath story, but they forget what happened next: David’s life got harder, not easier. The paranoid King Saul sent death squads after him.',
          'David ended up hiding in the Cave of Adullam. And look who showed up to join him: not elite royal guards, but "all those who were in distress or in debt or discontented"—about 400 broken men.',
          'Imagine being responsible for feeding, organizing, and keeping morale high among 400 angry, broke outlaws while 3,000 royal soldiers are hunting you down like wild dogs.',
          'Yet in that dark cave, instead of turning into a bitter warlord, David wrote songs of gut-honest prayer. He trained those 400 misfits into the fiercest, most loyal brotherhood in Israel’s history—men who would later risk their lives just to bring David a drink of water.'
        ],
        perspectivePrompt: 'When your career or plans collapse and you find yourself in rock bottom surrounded by chaos, what is your instinct?',
        choices: [
          {
            id: 'choice-cave-1',
            text: 'Resent everyone and ask why God allowed you to fall so hard.',
            reaction: 'Honest reaction. David felt that agony too—read Psalm 142: "Look and see, there is no one at my right hand; no one is concerned for me."',
            historicalPivot: "David didn't bottle up his anger or pretend everything was fine. He dumped his raw despair right onto God, but then decided: \"I will trust you anyway.\""
          },
          {
            id: 'choice-cave-2',
            text: 'Look at the broken people around you and start building something together.',
            reaction: 'True leadership is never proven on the palace throne; it is forged when you have nothing left to offer except integrity and grit.',
            historicalPivot: 'Those 400 indebted outlaws became the legendary "Mighty Men." Greatness isn’t born in easy seasons; it’s forged in the cave.'
          }
        ],
        unlockedScripture: {
          reference: '1 Samuel 22:2',
          translation: 'CSB / Modern Plain English',
          text: 'All who were in distress, in debt, or discontented gathered to him, and he became their commander. There were about four hundred men with him.',
          deepDive: "God doesn't look for pre-packaged champions. He gathers people who know what failure and struggle taste like, and builds them into leaders."
        },
        glossary: [
          {
            term: 'Cave of Adullam',
            ancientMeaning: 'A labyrinth of underground limestone caverns near the border of Judah and Philistia.',
            modernAnalogy: 'A secure bunker off the grid where you regroup when everything you built has been stripped away.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'When you feel stuck at the bottom, dealing with financial strain or career setbacks.',
          practicalLesson: "The cave isn't the end of your story—it's the training ground. How you treat people when you are broke defines who you will be when you win.",
          dailyAction: 'Check in on a friend or brother who is quietly struggling in his own "cave" right now.'
        },
        wisdomQuiz: {
          question: "What transformed the 400 bankrupt, indebted outlaws into David's legendary 'Mighty Men'?",
          options: [
            {
              text: "They were given massive gold paychecks from King Saul.",
              isCorrect: false,
              explanation: "They were broke outlaws on the run from Saul—gold had nothing to do with it."
            },
            {
              text: "David modeled genuine faith and dignity under pressure, turning broken misfits into brothers.",
              isCorrect: true,
              explanation: "Exactly right. Real leadership is infectious. When a leader acts with integrity at rock bottom, men will follow him into hell."
            },
            {
              text: "They decided to surrender immediately.",
              isCorrect: false,
              explanation: "They fought with legendary courage and stayed loyal for decades."
            }
          ]
        }
      }
    ]
  },
  {
    id: 'moses-journey',
    title: 'Moses: From Imposter to Liberator',
    subtitle: 'Facing the Red Sea trap between elite chariots and the ocean',
    heroName: 'Moses',
    characterTitle: 'The Reluctant Leader',
    testament: 'Old Testament',
    historicalPeriod: 'c. 1446 BC — Egypt & Sinai',
    estimatedMinutes: 6,
    themeColor: 'from-blue-700 to-stone-900',
    badgeName: 'Ocean Breaker',
    starterTrack: 'High-Pressure Crisis',
    relicReward: {
      id: 'moses-staff',
      name: 'The Shepherd’s Staff',
      iconName: 'staff',
      description: 'A simple olive-wood branch used to guide sheep.',
      lesson: 'You don’t need an empire to lead. A common wooden branch in faithful hands can part an impossible sea.'
    },
    summary: 'When you feel completely unqualified, panic surrounds you, and your back is pinned against a wall with zero escape routes.',
    acts: [
      {
        id: 'moses-act-1',
        actNumber: 1,
        actTitle: 'The Trap at the Red Sea',
        visualTheme: 'red_sea',
        sceneAtmosphere: 'The howling night wind tearing at your cloak. In front: black, churning oceanic waves. Behind: the thunder of 600 iron Pharaoh war chariots closing fast.',
        historicalContext: 'Pharaoh mobilized Egypt’s elite mechanized armor: 600 select war chariots. The Israelites were escaped civilian slaves—unarmed, accompanied by children and livestock, literally trapped against the sea.',
        narrativeParagraphs: [
          'Moses never wanted this job. He spent 40 years tending sheep in the desert after killing an Egyptian and running for his life. When God told him to confront Pharaoh, Moses literally stammered: "Please send someone else."',
          'Now, imagine the weight on this man’s shoulders. He just led over a million people out of Egypt. They march to the edge of the Red Sea, and suddenly look behind them: a cloud of dust on the desert horizon. Pharaoh changed his mind.',
          'Six hundred elite chariots are charging at full gallop with archers and spears. The sea blocks the front. The mountains block the sides. The people surround Moses screaming in terror: "Did you bring us out here just to die in the desert? It would have been better to stay slaves!"',
          'Moses doesn’t have weapons, cavalry, or a fleet of boats. He has nothing except a weathered shepherd’s staff and the voice of God. He looks at the terrified mob and shouts: "Don’t be afraid. Stand firm and you will see the deliverance the Lord will bring you today. The Lord will fight for you; you need only to be still."'
        ],
        perspectivePrompt: 'Two million people you are leading are panicking, ready to stone you, and a ruthless war machine is 10 minutes away. What is your reaction?',
        choices: [
          {
            id: 'choice-m-1',
            text: 'Wave a white flag and negotiate surrender back into slavery.',
            reaction: 'That’s what the people were begging for! Fear always makes slavery and bad habits look safer than stepping into the unknown.',
            historicalPivot: 'Moses knew that going back to slavery was death in disguise. He refused to look back.'
          },
          {
            id: 'choice-m-2',
            text: 'Stand your ground, stop panicking, and raise what is in your hands.',
            reaction: 'Pure, disciplined nerve. When panic is screaming in your ear, true leadership stays calm.',
            historicalPivot: 'God told Moses: "Why are you crying out to me? Tell the people to move forward. Raise your staff over the sea." Moses stretched out his hand, an east wind blew all night, and the waters split into towering walls.'
          }
        ],
        unlockedScripture: {
          reference: 'Exodus 14:13-14',
          translation: 'CSB / Modern Plain English',
          text: 'Moses said to the people: "Don’t be afraid. Stand firm and see the Lord’s salvation that he will accomplish for you today. The Lord will fight for you, and you must be quiet."',
          deepDive: 'Notice the command: "You must be quiet." The biggest threat when crisis strikes isn’t the enemy outside—it’s the runaway panic inside your own head.'
        },
        glossary: [
          {
            term: 'War Chariots',
            ancientMeaning: 'Two-wheeled mobile firing platforms pulled by stallions; the tanks of the Bronze Age world.',
            modernAnalogy: 'Like having an armored tank division bearing down on unarmed families on foot.'
          },
          {
            term: 'Stand Firm',
            ancientMeaning: 'A military posture command meaning: lock your feet into the earth, do not break formation or route.',
            modernAnalogy: 'Refuse to blink or fold under sudden pressure at work or in a family emergency.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Crisis moments when you feel trapped between a rock and a hard place with zero good options.',
          practicalLesson: 'Silence the panic before you make any decisions. Often the breakthrough requires taking one forward step into the dark before the water parts.',
          dailyAction: 'When an emergency or panic thought strikes today, pause for 60 seconds of silence before reacting.'
        },
        wisdomQuiz: {
          question: "When the people saw Pharaoh’s chariots charging, what did they immediately want to do?",
          options: [
            {
              text: "They wanted to build warships and attack Pharaoh.",
              isCorrect: false,
              explanation: "They had no military training or ships—they were panicked."
            },
            {
              text: "They wanted to surrender and return to being slaves in Egypt.",
              isCorrect: true,
              explanation: "Exactly. Panic always tempts men to return to comfortable old addictions or bad situations rather than walking into freedom."
            },
            {
              text: "They organized a stealth flanking maneuver.",
              isCorrect: false,
              explanation: "They were in total disorganized hysteria until Moses anchored them."
            }
          ]
        }
      }
    ]
  },
  {
    id: 'elijah-journey',
    title: 'Elijah: The Fire & The Whispering Cave',
    subtitle: 'From crushing 450 false prophets to collapsing from burnout',
    heroName: 'Elijah',
    characterTitle: 'The Iron Prophet',
    testament: 'Old Testament',
    historicalPeriod: 'c. 860 BC — Kingdom of Israel',
    estimatedMinutes: 6,
    themeColor: 'from-amber-600 to-stone-900',
    badgeName: 'Fire Caller',
    starterTrack: 'High-Pressure Crisis',
    relicReward: {
      id: 'elijah-mantle',
      name: 'The Weathered Mantle',
      iconName: 'mantle',
      description: 'A rough camel-hair cloak worn by the solitary prophet.',
      lesson: 'God doesn’t shout to compete with your anxiety; He meets you in the quiet whisper when you rest.'
    },
    summary: 'A raw reality check for driven men: how to handle the sudden depression and emotional crash that often follows your greatest victories.',
    acts: [
      {
        id: 'elijah-act-1',
        actNumber: 1,
        actTitle: 'The Showdown on Mount Carmel',
        visualTheme: 'mount_carmel',
        sceneAtmosphere: 'Mount Carmel overlooking the Mediterranean. 450 screaming prophets of Baal slashing themselves. One solitary man standing calm before a water-soaked altar.',
        historicalContext: 'Israel was ruled by the corrupt King Ahab and Queen Jezebel, who executed God’s prophets. Elijah called a high-stakes national duel: the god who answers with real fire is the true God.',
        narrativeParagraphs: [
          'Elijah walked straight into hostile territory all alone. King Ahab greeted him: "Is that you, you troubler of Israel?" Elijah fired right back: "I haven’t troubled Israel; you have, by abandoning God."',
          'On Mount Carmel, 450 state-sponsored prophets of Baal danced, screamed, and slashed themselves with knives for hours trying to summon fire. Zero answer. Elijah actually mocked them: "Shout louder! Maybe your god is asleep or using the restroom!"',
          'At evening, Elijah rebuilt the altar with 12 stones, dug a deep trench, and poured four massive jars of water over the wood three times until water overflowed the trenches.',
          'Then Elijah prayed a simple 60-word prayer. Instantly, fire fell from heaven, consuming the meat, wood, stones, soil, and licking up all the water in the trench. The entire crowd fell face-down shouting: "The Lord, He is God!"'
        ],
        perspectivePrompt: 'You just pulled off the biggest high-stakes victory of your life. Within 24 hours, you get a death threat from Queen Jezebel. What happens to your mind?',
        choices: [
          {
            id: 'choice-e-1',
            text: 'Feel invincible and mock Jezebel back.',
            reaction: 'That’s what movies show, but real human psychology is very different after adrenaline depletes.',
            historicalPivot: 'Elijah’s nervous system crashed. He ran a full day into the desert, sat under a broom bush, and begged to die: "I’ve had enough, Lord. Take my life."'
          },
          {
            id: 'choice-e-2',
            text: 'Recognize that high output drains your body and you need food and rest.',
            reaction: 'God didn’t lecture Elijah for being depressed. He sent an angel with baked bread, fresh water, and let him sleep for days.',
            historicalPivot: 'God didn’t reveal Himself to burnt-out Elijah in the howling wind, earthquake, or fire; He spoke in a gentle, quiet whisper.'
          }
        ],
        unlockedScripture: {
          reference: '1 Kings 18:37-38',
          translation: 'CSB / Modern Plain English',
          text: '"Answer me, Lord, answer me, so that this people will know that you, the Lord, are God, and that you have turned their hearts back." Then the Lord’s fire fell and consumed the burnt offering.',
          deepDive: 'Elijah didn’t pray a long, fancy, pious speech. In the moments of highest crisis, simple, raw prayers carry the most power.'
        },
        glossary: [
          {
            term: 'Mount Carmel',
            ancientMeaning: 'A coastal mountain ridge known for lush green forests, considered the sacred turf of the rain-god Baal.',
            modernAnalogy: 'Taking the fight directly to the home turf of your biggest opponent.'
          },
          {
            term: 'Gentle Whisper',
            ancientMeaning: 'Literally "the sound of a thin silence"—the quiet presence of God after storms pass.',
            modernAnalogy: 'Turning off the smartphone notifications, noise, and demands so your soul can actually heal.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Burnout, emotional crash, and depression after a heavy work project or stressful life season.',
          practicalLesson: 'Sometimes the most spiritual thing a tired, stressed man can do is eat a good meal, drink water, and get 8 hours of sleep.',
          dailyAction: 'If you have been running on fumes this week, schedule an hour of zero screens and complete quiet tonight.'
        },
        wisdomQuiz: {
          question: "When Elijah crashed from burnout in the desert and wanted to quit, how did God respond?",
          options: [
            {
              text: "God rebuked him harshly for lacking faith.",
              isCorrect: false,
              explanation: "Not at all. God understood his physical and emotional exhaustion."
            },
            {
              text: "God provided warm bread, water, sleep, and met him with a gentle whisper.",
              isCorrect: true,
              explanation: "Yes! God treats our physical humanity with profound gentleness when we are depleted."
            },
            {
              text: "God told him to immediately find 450 more prophets to fight.",
              isCorrect: false,
              explanation: "God gave him rest and an assistant (Elisha) so he wouldn't carry it alone."
            }
          ]
        }
      }
    ]
  },
  {
    id: 'joseph-journey',
    title: 'Joseph: Betrayal, Chains & The Throne',
    subtitle: 'Surviving family sabotage and 13 years of forgotten prison cells',
    heroName: 'Joseph',
    characterTitle: 'The Unbreakable Steward',
    testament: 'Old Testament',
    historicalPeriod: 'c. 1800 BC — Canaan & Ancient Egypt',
    estimatedMinutes: 7,
    themeColor: 'from-amber-700 to-stone-900',
    badgeName: 'Faithful in the Pit',
    starterTrack: 'Underdog & Purpose',
    relicReward: {
      id: 'joseph-ring',
      name: 'Pharaoh’s Signet Ring',
      iconName: 'signet',
      description: 'Gold seal ring of authority over the empire of Egypt.',
      lesson: 'Faithfulness in the smallest, dirtiest jobs prepares you to wield immense authority without arrogance.'
    },
    summary: 'How to survive when the people closest to you stab you in the back, and how to hold ultimate power without becoming vengeful.',
    acts: [
      {
        id: 'joseph-act-1',
        actNumber: 1,
        actTitle: 'The Pit in Dothan',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'Blistering desert heat. The dry dirt walls of an empty cistern. Up above, the sound of your own brothers laughing and chewing bread while deciding your fate.',
        historicalContext: "Jacob played blatant favoritism with Joseph, giving him an ornate coat. Joseph's older brothers seethed with jealousy. In clan-based desert cultures, being expelled or sold was practically a death sentence.",
        narrativeParagraphs: [
          'The Bible doesn’t sugarcoat family dysfunction. Joseph was 17 years old. He made the mistake of bragging about his dreams to his ten older brothers, who already resented him.',
          'When their father sends Joseph to check on them out in the grazing fields, they see him coming from a distance. Their first thought isn’t greeting him; it’s: "Here comes that dreamer. Let’s kill him and throw him into a pit."',
          'The oldest brother Reuben talks them out of outright murder, so they strip Joseph’s ornate coat, slam him into a dry cistern, and literally sit down to eat lunch while he begs from the darkness.',
          'When a caravan of Midianite traders comes riding past, Judah speaks up: "What do we gain if we kill him? Let’s sell him." They sold their own flesh and blood for twenty pieces of silver.'
        ],
        perspectivePrompt: 'Your own flesh and blood threw you into a pit and sold you as cargo. What happens to your heart in that moment?',
        choices: [
          {
            id: 'choice-j-1',
            text: 'Vow that if you ever get free, you will find them and make them pay with their lives.',
            reaction: 'Completely natural adult reaction. Unchecked vengeance feels like justice, but it locks your mind into their prison forever.',
            historicalPivot: 'Joseph had every legal and moral right to seek revenge 20 years later when he held supreme power in Egypt. Instead, he chose something far harder: redemptive testing and forgiveness.'
          },
          {
            id: 'choice-j-2',
            text: 'Focus on doing the next right thing, wherever you land, even in chains.',
            reaction: 'This is the rare discipline that turns victims into leaders. Joseph refused to surrender his work ethic or his integrity.',
            historicalPivot: 'Sold into Egypt as a household slave, Joseph didn’t sulk. He worked with such diligence that his master Potiphar put him in charge of everything.'
          }
        ],
        unlockedScripture: {
          reference: 'Genesis 50:20',
          translation: 'CSB / Modern Plain English',
          text: 'You planned evil against me; God planned it for good to bring about the present result—the survival of many people.',
          deepDive: 'This is one of the most mature statements in human literature. Joseph didn’t deny their evil ("You planned evil"), but he recognized that human malice cannot veto God’s purpose.'
        },
        glossary: [
          {
            term: 'Dry Cistern',
            ancientMeaning: 'A bottle-shaped underground pit carved into rock to hold rainwater. With smooth, inward-sloping walls, it was impossible to climb out without a rope.',
            modernAnalogy: 'Being locked in a windowless concrete basement with the ladder removed.'
          },
          {
            term: 'Twenty Shekels of Silver',
            ancientMeaning: 'The standard going price for a young slave or manual laborer in the early 2nd millennium BC.',
            modernAnalogy: 'Being treated as disposable commodity cash by the very people who were supposed to protect you.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Toxic family drama, betrayal by business partners or friends you trusted.',
          practicalLesson: 'You cannot control the evil other people do to you. You can only control whether you let their poison turn you into a replica of them.',
          dailyAction: 'Release a grudge you have been keeping score on. Holding onto it is like drinking poison and expecting the other person to get sick.'
        },
        wisdomQuiz: {
          question: "When Joseph was falsely framed in Potiphar’s house and thrown into prison, how did he carry himself?",
          options: [
            {
              text: "He gave up completely and stopped caring about his work.",
              isCorrect: false,
              explanation: "Giving up is how men stay stuck in prison mentally."
            },
            {
              text: "He served diligently right where he was, earning the trust of the prison warden.",
              isCorrect: true,
              explanation: "Bingo. Joseph mastered the art of stewarding whatever corner of life he was handed with absolute excellence."
            },
            {
              text: "He attempted an armed prison riot.",
              isCorrect: false,
              explanation: "Joseph relied on patience and integrity, which eventually brought him before Pharaoh."
            }
          ]
        }
      }
    ]
  },
  {
    id: 'peter-journey',
    title: 'Peter: Courage, The Fall & Restoration',
    subtitle: 'From walking on water to weeping by a courtyard fire',
    heroName: 'Simon Peter',
    characterTitle: 'The Broken Rock',
    testament: 'New Testament',
    historicalPeriod: 'c. 30–33 AD — Jerusalem & Galilee',
    estimatedMinutes: 6,
    themeColor: 'from-blue-700 to-stone-900',
    badgeName: 'Restored Leader',
    starterTrack: 'Grace After Failure',
    relicReward: {
      id: 'peter-brazier',
      name: 'The Charcoal Brazier',
      iconName: 'brazier',
      description: 'The glowing embers of the fire on the beach of Galilee.',
      lesson: 'Failure is an event, never your identity. Grace doesn’t just forgive you; it puts you back to work.'
    },
    summary: 'For every man who has sworn he would never mess up, choked under pressure, and wondered if he can ever be forgiven.',
    acts: [
      {
        id: 'peter-act-1',
        actNumber: 1,
        actTitle: 'The Courtyard Fire & The Rooster',
        visualTheme: 'courtyard_fire',
        sceneAtmosphere: 'A cold Jerusalem night. The crackle of olive wood coals. Guards and servant girls warming their hands while Jesus is interrogated inside.',
        historicalContext: 'Hours earlier at the Last Supper, Peter had arrogantly boasted: "Even if everyone else abandons you, I will never abandon you! I will go to prison and death with you!"',
        narrativeParagraphs: [
          'Simon Peter was a working-class fisherman—rough hands, impulsive heart, and big mouth. When soldiers came to arrest Jesus in Gethsemane, Peter was the only one crazy enough to draw a short sword against an entire cohort of Roman soldiers.',
          'He wasn’t a coward by nature. But hours later, everything shifted. Jesus was bound and dragged into the high priest’s palace. Peter trailed from a distance, slipped into the courtyard, and stood near a charcoal fire trying to blend in.',
          'A servant girl looked at his face in the firelight: "You were with Jesus of Galilee too." Peter panicked: "I don’t know what you’re talking about."',
          'Twice more people cornered him: "Your Galilean accent gives you away!" Peter began to curse and swear: "I do not know the man!" Right then, a rooster crowed. Luke records that Jesus turned and looked straight at Peter. Peter walked out into the dark and wept bitterly.'
        ],
        perspectivePrompt: 'You swore to your family or yourself that you would never fail them. Then you caved. The guilt is crushing. What do you do?',
        choices: [
          {
            id: 'choice-p-1',
            text: 'Walk away forever. You disqualified yourself and proved you are a hypocrite.',
            reaction: 'This is the voice of shame. That’s what Judas did when he hung himself in despair. Shame tells you that your failure is your final identity.',
            historicalPivot: 'Peter fell flat on his face, but he didn’t run away from the other disciples. He stayed connected to his brothers even in his brokenness.'
          },
          {
            id: 'choice-p-2',
            text: 'Face the person you let down and allow grace to heal the wound.',
            reaction: 'The hardest thing for a proud man is receiving grace when he knows he deserves condemnation.',
            historicalPivot: 'After the resurrection, Jesus met Peter on the shore of Galilee over another charcoal fire. Jesus didn’t yell or lecture him; three times he asked: "Simon, do you love me? Feed my sheep."'
          }
        ],
        unlockedScripture: {
          reference: 'Luke 22:31-32',
          translation: 'CSB / Modern Plain English',
          text: '"Simon, Simon, look out. Satan has asked to sift you like wheat. But I have prayed for you that your faith may not fail. And when you have turned back, strengthen your brothers."',
          deepDive: 'Notice Jesus said: "When you have turned back"—not IF. Jesus knew Peter would fall before it even happened, and had already mapped out his restoration.'
        },
        glossary: [
          {
            term: 'Sift like Wheat',
            ancientMeaning: 'Violently shaking crushed grain in a mesh sieve to separate the edible grain from the chaff.',
            modernAnalogy: 'Being put through an emotional and spiritual meat grinder where all your self-confidence is ripped away.'
          },
          {
            term: 'Charcoal Fire',
            ancientMeaning: 'A specific fire made from dense charcoal lumps. It produced a distinctive aroma.',
            modernAnalogy: 'A powerful scent memory that takes you right back to the exact place where you blew it.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Crushing guilt after failing a moral standard, letting down your spouse, kids, or friends.',
          practicalLesson: 'Failure is an event, not a person. God never uses a man deeply until he has been broken of his own self-righteous pride.',
          dailyAction: 'Own up to a mistake with zero excuses. Apologize cleanly without trying to justify your actions.'
        },
        wisdomQuiz: {
          question: "When Jesus restored Peter on the shore of Galilee, what did He ask him three times?",
          options: [
            {
              text: "'Why did you curse and swear that you didn't know me?'",
              isCorrect: false,
              explanation: "Jesus didn't rub his nose in his failure."
            },
            {
              text: "'Do you love me? ... Feed my sheep.'",
              isCorrect: true,
              explanation: "Spot on. For every time Peter denied Him by the fire, Jesus gave him a chance to affirm his love and gave him a mission to lead."
            },
            {
              text: "'Will you sign a contract promising never to make a mistake again?'",
              isCorrect: false,
              explanation: "Grace isn't a legal contract; it's a relationship of restoration."
            }
          ]
        }
      }
    ]
  },
  {
    id: 'paul-journey',
    title: 'Paul: Bounty Hunter to Rome’s Prisoner',
    subtitle: 'From hunting Christians to singing in a Roman dungeon',
    heroName: 'Paul of Tarsus',
    characterTitle: 'The Unshakable Witness',
    testament: 'New Testament',
    historicalPeriod: 'c. 35–64 AD — Roman Empire',
    estimatedMinutes: 7,
    themeColor: 'from-red-800 to-stone-900',
    badgeName: 'Iron Endurance',
    starterTrack: 'Grace After Failure',
    relicReward: {
      id: 'paul-stocks',
      name: 'The Broken Roman Stocks',
      iconName: 'stocks',
      description: 'Shattered oak stocks from the midnight earthquake in Philippi.',
      lesson: 'Iron chains can restrain your body, but they have zero jurisdiction over a free conscience.'
    },
    summary: 'The dramatic turnaround of an ideological enforcer who traded power and status for shipwrecks, beatings, and unstoppable purpose.',
    acts: [
      {
        id: 'paul-act-1',
        actNumber: 1,
        actTitle: 'The Midnight Earthquake in Philippi',
        visualTheme: 'prison_cell',
        sceneAtmosphere: 'The inner cell of a Roman colony prison. Damp stone, total darkness, feet clamped into heavy wooden stocks. Backs torn raw from lictor rods.',
        historicalContext: 'Paul and Silas were illegally beaten by Roman magistrates without a trial and thrown into the high-security inner dungeon.',
        narrativeParagraphs: [
          'Before he became Paul the Apostle, he was Saul: an intellectual hitman hunting down early believers, dragging men and women to prison. When an encounter with the risen Christ blinded him and shattered his pride, he switched sides completely.',
          'Years later in the Roman city of Philippi, after freeing an exploited slave girl, a mob turned on him. The city rulers tore their clothes, ordered them stripped, and had them flogged with wooden rods.',
          'Imagine the physical reality: Your back is raw meat. You are shoved into a pitch-black, filthy underground sewer-cell. Your legs are forced far apart and locked in wooden stocks, causing excruciating cramps.',
          'Most men would curse their luck or yell at the ceiling. But at midnight, Paul and Silas were praying and singing hymns aloud. The other prisoners were listening in disbelief. Suddenly, a violent earthquake shook the foundations, doors flew open, and everyone’s chains fell loose.'
        ],
        perspectivePrompt: 'You did the right thing, and you got punished, humiliated, and locked up for it. How do you respond at midnight?',
        choices: [
          {
            id: 'choice-paul-1',
            text: 'Sit in the corner and nurse your anger against the corrupt system.',
            reaction: 'Natural and common. But bitterness only gives your jailers power over your mind.',
            historicalPivot: 'Paul knew that stone walls and iron chains could bind his body, but they had zero authority over his spirit.'
          },
          {
            id: 'choice-paul-2',
            text: 'Praise through the pain and keep your eyes open for the purpose.',
            reaction: 'This baffles onlookers. When you refuse to break under unfair treatment, everyone around you pays attention.',
            historicalPivot: 'When the doors flew open, the terrified jailer pulled his sword to commit suicide. Paul stopped him: "Do yourself no harm, we are all here!" That night, the jailer and his entire family found faith.'
          }
        ],
        unlockedScripture: {
          reference: 'Philippians 4:11-13',
          translation: 'CSB / Modern Plain English',
          text: 'I have learned how to be content with whatever I have. I know how to live on almost nothing or with everything. I can do all things through Christ who strengthens me.',
          deepDive: 'This famous verse was not written from a comfortable luxury villa. Paul wrote this from a Roman prison cell. Real strength isn’t having an easy life; it’s being unbreakable when life is hard.'
        },
        glossary: [
          {
            term: 'Wooden Stocks',
            ancientMeaning: 'A torture-restraint device with holes for feet that could be spaced widely to stretch muscles to agony.',
            modernAnalogy: 'Being locked in an agonizing physical stress-position for hours without relief.'
          },
          {
            term: 'Roman Colony',
            ancientMeaning: 'A mini-Rome populated by retired legionaries with strict Roman law and zero tolerance for perceived rebellion.',
            modernAnalogy: 'A heavily fortified military base where stepping out of line brings ruthless enforcement.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Being treated unfairly at work, doing honest work and getting blamed or overlooked.',
          practicalLesson: 'Circumstances cannot dictate your character unless you hand over the keys. You can choose dignity and worship even when the situation stinks.',
          dailyAction: 'Next time you hit traffic, an unfair critique, or a frustrating delay today, refuse to complain. Pivot to gratitude.'
        },
        wisdomQuiz: {
          question: "When the earthquake ripped open the prison doors, why didn't Paul and Silas run away into the night?",
          options: [
            {
              text: "They were too exhausted to move.",
              isCorrect: false,
              explanation: "They were wide awake singing minutes earlier."
            },
            {
              text: "They saw the panicked jailer about to kill himself and stayed to save his life.",
              isCorrect: true,
              explanation: "Right on the money. Roman law executed jailers whose prisoners escaped. Paul valued the jailer's life more than his own freedom."
            },
            {
              text: "They waited for a lawyer to arrive.",
              isCorrect: false,
              explanation: "Roman dungeons didn't have defense attorneys—Paul acted out of pure compassion."
            }
          ]
        }
      }
    ]
  }
];
