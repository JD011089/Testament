import type { StoryQuest } from '../types';

export const STORY_QUESTS: StoryQuest[] = [
  {
    id: 'jesus-journey',
    title: 'Jesus: The King Who Serves',
    subtitle: 'The revolutionary who redefined power, entered our storm, and conquered death',
    heroName: 'Jesus',
    characterTitle: 'The Servant King',
    testament: 'New Testament',
    historicalPeriod: 'c. 30 AD — Roman Judea & Galilee',
    estimatedMinutes: 6,
    themeColor: 'from-amber-500 to-indigo-950',
    badgeName: 'Great for Beginners',
    starterTrack: 'Great for Beginners',
    relicReward: {
      id: 'jesus-basin',
      name: 'The Basin & The Towel',
      iconName: 'basin',
      description: 'The washbasin Jesus used to wash the dusty feet of his disciples before going to the cross.',
      lesson: 'In God\'s kingdom, greatness is measured by how you love and serve others, not how many serve you.'
    },
    summary: 'The life of Jesus of Nazareth: who he was, why he turned religious hypocrisy and imperial power upside down, and how his resurrection changes everything.',
    acts: [
      {
        id: 'jesus-act-1',
        actNumber: 1,
        actTitle: 'The Authority in the Gale',
        visualTheme: 'sea_storm',
        sceneAtmosphere: 'Nightfall on the freshwater lake of Galilee. Violent subterranean squalls whip six-foot waves over the wooden gunwales of an open fishing skiff. Veteran fishermen are screaming; Jesus is asleep on a cushion.',
        historicalContext: 'The Sea of Galilee sits nearly 700 feet below sea level, surrounded by steep basalt hills. Cold winds rushing down the ravines collide with warm lake air, creating sudden, violent squalls that could swamp heavy wooden boats in minutes.',
        narrativeParagraphs: [
          'Put yourself in the boat. These disciples aren’t delicate tourists—several of them are hardened commercial fishermen who have spent their whole lives pulling nets on these exact waters. They know lake weather. Yet waves are pounding over the bow, the boat is filling with dark water, and they are genuinely terrified they are about to drown.',
          'They scramble to the stern and find Jesus sound asleep on a coarse leather cushion. In sheer panic, they shake him awake with an accusation every human being has whispered: "Teacher, don’t you care if we drown?"',
          'Jesus doesn’t panic. He doesn’t reach for a bucket. He simply stands up in the howling wind, looks at the raging black water, and says three words: "Peace! Be still!"',
          'Immediately the screaming wind cuts out. The lake turns completely flat as glass. And the disciples are suddenly far more terrified of the man standing in front of them than they were of the storm: "Who then is this, that even the wind and the sea obey him?"'
        ],
        perspectivePrompt: 'Life throws sudden crises—unexpected bad news, stress, or relational conflict—that feel like waves flooding your boat. What is your initial reflex?',
        choices: [
          {
            id: 'choice-jesus-1',
            text: 'Assume God has abandoned you and panic in isolation.',
            reaction: 'That is the default human response. When the storm hits, fear tells us God must not care.',
            historicalPivot: 'The disciples thought Jesus sleeping meant he didn’t care. In reality, his calm proved he possessed complete sovereignty over the crisis.'
          },
          {
            id: 'choice-jesus-2',
            text: 'Wake Jesus with honest raw prayers, admitting you cannot fix it alone.',
            reaction: 'Jesus welcomed their honest cry. He didn’t rebuke them for asking for help; he invited them to trust his presence in the storm.',
            historicalPivot: 'Jesus spoke directly to the chaos. Having Jesus in your boat doesn’t mean you will never face storms—it means the storm cannot sink you.'
          }
        ],
        unlockedScripture: {
          reference: 'Mark 4:39-40',
          translation: 'WEB',
          text: 'He got up, rebuked the wind, and said to the sea, "Silence! Be still!" The wind ceased, and there was a great calm. Then he said to them, "Why are you afraid? Do you still have no faith?"',
          deepDive: 'The Greek word used for "be still" literally means "be muzzled." Jesus treated the violent chaos of nature like an unruly beast that instantly recognizes its Creator\'s voice.'
        },
        glossary: [
          {
            term: 'Sea of Galilee',
            ancientMeaning: 'A 13-mile-long freshwater rift lake bordered by steep ravines prone to sudden flash storms.',
            modernAnalogy: 'Like driving an open small boat into an unexpected mountain microburst with zero cell service.'
          },
          {
            term: 'Rabbi / Teacher',
            ancientMeaning: 'An authoritative Jewish master of the Torah whom disciples followed intimately to imitate his life.',
            modernAnalogy: 'A trusted master mentor whose character and habits you adopt completely.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Feeling overwhelmed when circumstances spiral completely out of your control.',
          practicalLesson: 'The presence of a storm does not mean the absence of God. Peace is not the absence of trouble; it is the presence of Jesus.',
          dailyAction: 'Name the one overwhelming situation keeping you awake right now. Surrender the illusion of total control and ask Jesus for his peace in the center of it.'
        },
        wisdomQuiz: {
          question: 'What surprised the disciples most after Jesus calmed the fierce storm on the lake?',
          options: [
            {
              text: 'They were angry that the fish got scared away by the wind.',
              isCorrect: false,
              explanation: 'Fishing was the last thing on their minds during a near-death encounter.'
            },
            {
              text: 'They were struck with awe and wonder at who Jesus truly was, realizing even nature obeyed his voice.',
              isCorrect: true,
              explanation: 'Spot on! Experiencing the power of Jesus shifted their fear of the storm into deep awe and reverence for Him.'
            }
          ]
        },
        teaserForNext: 'Next: The King of Kings kneels on the floor with a towel to wash the dirty feet of his followers.'
      },
      {
        id: 'jesus-act-2',
        actNumber: 2,
        actTitle: 'The King With a Towel',
        visualTheme: 'palace_hall',
        sceneAtmosphere: 'An intimate upstairs dining room in Jerusalem on the eve of the Passover. Twelve men reclined around a low table, arguing over who is the most important, their sandals kicked off and feet caked in street dust.',
        historicalContext: 'In first-century Judea, roads were dusty tracks littered with animal waste. Etiquette required foot-washing upon entering a house, but it was considered so filthy that only the lowest non-Jewish slave was ever tasked with doing it.',
        narrativeParagraphs: [
          'It is the night before Jesus is betrayed and executed. Knowing that all authority in heaven and earth has been placed in his hands, what does Jesus do? Does he demand a coronation? Does he summon an army of angels to crush the Roman legions?',
          'Instead, Jesus stands up from dinner, takes off his outer robe, and wraps a rough linen towel around his waist. He pours clean water into a ceramic washbasin.',
          'One by one, Jesus kneels in the dirt before his disciples and washes their filthy, calloused feet, drying them with the towel tied around his waist. When he gets to Peter, Peter recoils in shock: "Lord, you are going to wash my feet? Never!"',
          'Jesus answers: "If I do not wash you, you have no part with me... For I have given you an example, that you also should do just as I have done to you. The greatest among you must be your servant."'
        ],
        perspectivePrompt: 'When you are around people who take you for granted or disagree with you, how hard is it to swallow your pride and serve them first?',
        choices: [
          {
            id: 'choice-jesus-3',
            text: 'Defend your status and insist on being treated with proper respect.',
            reaction: 'That is the world\'s game: compete for status, dominate the room, and make sure everyone knows your worth.',
            historicalPivot: 'Jesus completely upended the world\'s definition of power. True strength is not using people to elevate yourself; it is using your strength to lift up others.'
          },
          {
            id: 'choice-jesus-4',
            text: 'Step down into humble service, choosing to love without keeping score.',
            reaction: 'This takes supreme internal security. You can only wash feet when you know your identity is already secure in God.',
            historicalPivot: 'Jesus washed even Judas’s feet—knowing Judas would betray him within hours. Love that gives without condition breaks the cycle of human retaliation.'
          }
        ],
        unlockedScripture: {
          reference: 'John 13:14-15',
          translation: 'WEB',
          text: '"If I then, your Lord and Teacher, have washed your feet, you also ought to wash one another’s feet. For I have given you an example, that you also should do just as I have done to you."',
          deepDive: 'Jesus didn’t merely teach humility as an abstract philosophy; he enacted it physically before dying on a Roman cross for the very people who mocked him.'
        },
        glossary: [
          {
            term: 'Passover',
            ancientMeaning: 'The sacred Jewish festival celebrating God delivering Israel out of Egyptian slavery with the blood of the lamb.',
            modernAnalogy: 'Like an independence celebration combined with profound spiritual remembrance of liberation.'
          },
          {
            term: 'Foot Washing',
            ancientMeaning: 'The lowest household task in antiquity, reserved exclusively for the most junior servant.',
            modernAnalogy: 'Volunteering to scrub the dirtiest public bathroom without telling anyone.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Pride, entitlement, and the temptation to treat people based on what they can do for you.',
          practicalLesson: 'True leadership is servant leadership. You never look more like Jesus than when you quietly serve someone who can never pay you back.',
          dailyAction: 'Do one unseen act of service today for someone in your family, workplace, or school without mentioning it to anyone.'
        },
        wisdomQuiz: {
          question: 'Why did Simon Peter initially refuse to let Jesus wash his feet?',
          options: [
            {
              text: 'Peter thought his feet were already too clean.',
              isCorrect: false,
              explanation: 'First-century Jerusalem roads were filthy; Peter’s feet definitely needed washing.'
            },
            {
              text: 'Peter felt uncomfortable seeing his Master and King stoop down to do the work of a lowly servant.',
              isCorrect: true,
              explanation: 'Exactly right. Peter had worldly ideas about power, but Jesus showed that God\'s kingdom is built on sacrificial love.'
            }
          ]
        },
        teaserForNext: 'Next: The cross, the empty tomb, and the message that ignited hope across the ancient world.'
      },
      {
        id: 'jesus-act-3',
        actNumber: 3,
        actTitle: 'The Empty Tomb & The Living Hope',
        visualTheme: 'cave_refuge',
        sceneAtmosphere: 'Pre-dawn gray light outside the city walls of Jerusalem. A garden tomb carved out of solid limestone. The massive circular stone has been rolled away up its track, and the Roman military seal is broken.',
        historicalContext: 'Crucifixion was Rome’s most brutal public execution, designed to crush rebellious movements and deter anyone from following their leader. When Jesus was crucified, his followers went into hiding, terrified and crushed with grief.',
        narrativeParagraphs: [
          'By Saturday evening, Rome and the religious establishment thought the Jesus movement was dead and buried. The disciples were locked behind closed doors for fear of arrest. All their hopes seemed extinguished on a Roman hill called Golgotha.',
          'Early Sunday morning, before sunrise, Mary Magdalene and other women walked through the chill air with funeral spices to finish anointing his body. They were wondering how on earth they would move the heavy stone sealing the cave.',
          'When they arrived, the ground shook. The stone was rolled aside. Looking inside, the grave clothes were lying folded, and the tomb was completely empty. Angels announced the words that changed human history: "Why do you look for the living among the dead? He is not here; he has risen!"',
          'Over the next forty days, Jesus appeared alive to his followers, eating with them, walking with them, and sending them out to the ends of the earth with good news: death is defeated, grace is real, and Jesus is Lord forever.'
        ],
        perspectivePrompt: 'When you face grief, painful loss, or what feels like an absolute dead end, where do you look for hope?',
        choices: [
          {
            id: 'choice-jesus-5',
            text: 'Conclude that darkness has the final say and give up.',
            reaction: 'That is what the disciples almost did on Saturday. They forgot that God does his greatest work in the dark.',
            historicalPivot: 'Friday looked like defeat; Sunday proved that God’s love and life are stronger than Rome, sin, and the grave.'
          },
          {
            id: 'choice-jesus-6',
            text: 'Anchor your life to the living Jesus, knowing no grave can hold God’s promise.',
            reaction: 'The resurrection turned terrified fishermen into fearless apostles who laid down their lives because they knew Jesus was alive.',
            historicalPivot: 'Because Jesus lives, failure is never final and death is not the end. Your story is held in his hands.'
          }
        ],
        unlockedScripture: {
          reference: 'Luke 24:5-6',
          translation: 'WEB',
          text: '"Why do you look for the living among the dead? He is not here, but has risen!"',
          deepDive: 'The resurrection is the cornerstone of Christian faith. Christianity did not survive because of a clever philosophy, but because an empty tomb proved Jesus conquered the grave.'
        },
        glossary: [
          {
            term: 'Resurrection',
            ancientMeaning: 'Bodily rising from physical death to immortal, renewed physical life—not merely a ghostly spirit.',
            modernAnalogy: 'Not a ghost or metaphor; a real, physical defeat of death and permanent restoration of life.'
          },
          {
            term: 'The Gospel',
            ancientMeaning: 'Euangelion: An imperial proclamation of victory that a new king has ascended the throne and peace is declared.',
            modernAnalogy: 'Breaking news announced to the entire world that freedom and pardon have arrived.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Despair, fear of the future, and wondering if your worst mistakes or losses are permanent.',
          practicalLesson: 'Because Jesus rose from the dead, hope is never lost. God can bring life, purpose, and renewal out of the darkest graveyard in your life.',
          dailyAction: 'Walk into today with your head held high. No matter what happened yesterday, Sunday has come—take one step forward in faith.'
        },
        wisdomQuiz: {
          question: 'What message did the angel give to the women at the empty tomb on Sunday morning?',
          options: [
            {
              text: 'He told them to build a museum around the burial clothes.',
              isCorrect: false,
              explanation: 'The tomb was an announcement of life, not a memorial to death.'
            },
            {
              text: '"Why do you look for the living among the dead? He is not here; he has risen!"',
              isCorrect: true,
              explanation: 'Yes! The tomb was empty because Jesus defeated death once and for all.'
            }
          ]
        }
      }
    ]
  },
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
    starterTrack: 'Underdog & Courage',
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
          translation: 'WEB',
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
          "Most people know the Goliath story, but they forget what happened next: David's life got harder, not easier. The paranoid King Saul sent death squads after him, turning Israel's hero into a hunted fugitive.",
          "David ended up hiding in the dark limestone caves of Adullam. And look who showed up at his door: not elite royal bodyguards, but 400 desperate, broken, and bankrupt outlaws looking to him for survival.",
          "Instead of turning into a bitter warlord or shutting down in despair, David poured his gut-level raw grief into honest prayers. Then he started training those 400 broken misfits into the fiercest, most loyal brotherhood in Israel's history."
        ],
        perspectivePrompt: "Your plans just collapsed and you're surrounded by chaos. What's your move?",
        choices: [
          {
            id: 'choice-cave-shutdown',
            text: 'Go quiet and wait for it to pass alone.',
            reaction: 'That is the natural survival instinct when exhausted—hiding behind thick limestone walls to protect yourself.',
            historicalPivot: "David was tempted to retreat completely into silence. In Psalm 142 he cried, 'No one is concerned for me.' But he didn't stay locked away."
          },
          {
            id: 'choice-cave-lashout',
            text: 'Get angry at the people around you.',
            reaction: 'Anger often masks deep betrayal. David had served King Saul faithfully, only to be rewarded with spears and exile.',
            historicalPivot: "Instead of becoming a bitter warlord raiding innocent villages, David brought his fury directly to God and chose self-control."
          },
          {
            id: 'choice-cave-run',
            text: 'Run as far from this mess as you can get.',
            reaction: 'When everything breaks at once, running feels like the only viable option.',
            historicalPivot: "David fled across the desert until there was nowhere left to run. That rock-bottom cave was where running stopped and rebuilding began."
          },
          {
            id: 'choice-cave-reachout',
            text: 'Reach out to the misfits around you and rebuild together.',
            reaction: 'This takes supreme internal grit—looking past your own pain to serve others who are hurting.',
            historicalPivot: "David welcomed 400 indebted outlaws. Over years in the wilderness, they forged Israel's legendary Mighty Men."
          }
        ],
        unlockedScripture: {
          reference: '1 Samuel 22:2',
          translation: 'WEB',
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
    starterTrack: 'Underdog & Courage',
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
          translation: 'WEB',
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
    starterTrack: 'Burnout & Pressure',
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
          translation: 'WEB',
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
    starterTrack: 'Career & High Stakes',
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
          translation: 'WEB',
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
    starterTrack: 'Restoration & Brotherhood',
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
          translation: 'WEB',
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
    starterTrack: 'Restoration & Brotherhood',
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
          translation: 'WEB',
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
  },
  {
    id: 'daniel-journey',
    title: 'Daniel: Undercover in Babylon',
    subtitle: 'Surviving cutthroat imperial politics with unbreakable conviction',
    heroName: 'Daniel',
    characterTitle: 'The Prime Minister in Babylon',
    testament: 'Old Testament',
    historicalPeriod: 'c. 605–536 BC — Babylon & Persia',
    estimatedMinutes: 8,
    themeColor: 'from-blue-700 to-stone-900',
    badgeName: 'Lion Heart',
    starterTrack: 'Career & High Stakes',
    relicReward: {
      id: 'daniel-signet',
      name: 'Babylonian Signet Ring',
      iconName: 'signet',
      description: 'The Prime Minister’s seal worn across four imperial regimes.',
      lesson: 'Uncompromising excellence and private integrity will outlast any corrupt political administration.'
    },
    summary: 'A masterclass in navigating secular, cutthroat corporate power corridors without selling out your moral core.',
    acts: [
      {
        id: 'daniel-act-1',
        actNumber: 1,
        actTitle: 'The Imperial Cafeteria Defiance',
        visualTheme: 'palace_hall',
        sceneAtmosphere: 'The marble-columned banqueting halls of Babylon. Nebuchadnezzar’s chief eunuch serving rich meats and royal wine dedicated to pagan gods.',
        historicalContext: 'Babylonian strategy was total cultural assimilation: strip captured Jewish nobility of their language, names, and dietary convictions.',
        narrativeParagraphs: [
          'Picture being a 16-year-old high-born captive in the greatest, wealthiest empire on earth. Your homeland was burned, your temple leveled, and you are dragged 900 miles in chains to Babylon.',
          'Instead of throwing you in a dungeon, King Nebuchadnezzar puts you through imperial indoctrination: top-tier education, prestigious status, and royal food straight from the king’s table.',
          'Most captives would say: "When in Babylon, do what Babylonians do. God will understand." But Daniel made up his mind not to defile himself with the royal food and wine.',
          'He didn’t throw a temper tantrum or stage a violent protest. With astonishing tact and emotional intelligence, he proposed a 10-day test to his overseer: water and vegetables. After 10 days, Daniel and his three friends looked healthier and sharper than everyone else.'
        ],
        perspectivePrompt: 'Your new company or peer group expects you to participate in compromises that violate your conscience. How do you handle the pressure?',
        choices: [
          {
            id: 'choice-dan-1',
            text: 'Blend in quietly to avoid jeopardizing your career climb.',
            reaction: 'The easy path. But once you compromise on small boundary lines, your moral backbone dissolves.',
            historicalPivot: 'Daniel drew his boundary line at the very first gate. If you don’t stand for your convictions in the cafeteria, you will fold in the boardroom.'
          },
          {
            id: 'choice-dan-2',
            text: 'Propose a creative, low-friction test backed by superior performance.',
            reaction: 'Tactical genius. You protect your integrity while making your supervisor look good.',
            historicalPivot: 'Daniel’s respectful 10-day trial won over the chief official and proved that God honors disciplined boundary-keeping.'
          }
        ],
        unlockedScripture: {
          reference: 'Daniel 1:8',
          translation: 'WEB',
          text: 'Daniel resolved in his heart that he would not defile himself with the king\'s food or with the wine that he drank.',
          deepDive: 'Notice the sequence: Daniel decided in his heart BEFORE the tray was placed in front of him. If you wait until the pressure is in your face, you will compromise every time.'
        },
        glossary: [
          {
            term: 'Babylonian Assimilation',
            ancientMeaning: 'Systematic re-education where young leaders were renamed after Babylonian idols (Daniel became Belteshazzar).',
            modernAnalogy: 'Intense corporate culture indoctrination where personal ethics are erased to serve the bottom line.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Feeling pressured to drink, gossip, fudge numbers, or compromise ethics to fit in at work.',
          practicalLesson: 'Make your decision in advance. Respectful boundary-setting combined with elite competence earns enduring respect.',
          dailyAction: 'Identify one small compromise you have been tolerating. Draw a clean, firm line in the sand today.'
        },
        wisdomQuiz: {
          question: 'Why did Daniel propose a 10-day trial instead of demanding his rights or staging a public protest?',
          options: [
            {
              text: 'He was terrified of the chief eunuch.',
              isCorrect: false,
              explanation: 'Daniel was courageous; he understood diplomacy.'
            },
            {
              text: 'He combined conviction with emotional intelligence, giving the official a safe way to say yes.',
              isCorrect: true,
              explanation: 'Spot on. Wisdom knows how to stand firm on conviction without being abrasive or reckless.'
            }
          ]
        }
      },
      {
        id: 'daniel-act-2',
        actNumber: 2,
        actTitle: 'The Furnace of Defiance ("Even If Not")',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'The Plain of Dura under a scorching Mesopotamian sun. A 90-foot golden colossus looming over thousands of prostrated imperial officials.',
        historicalContext: 'Nebuchadnezzar erected a monumental gold statue representing his absolute divine sovereignty, mandating death in an industrial kiln for dissenters.',
        narrativeParagraphs: [
          'The royal decree was simple: When the horn, flute, zither, and harp play, everyone drops face-down in the dirt. Anyone who remains standing is hurled immediately into a blazing industrial smelting furnace.',
          'The music blasts. Tens of thousands of governors, magistrates, and military officers hit the dust. But standing in the center of the crowd like stone pillars are three young Jewish administrators: Shadrach, Meshach, and Abednego.',
          'The king turns purple with rage. He offers them one final chance to bow. Their reply is the greatest mic-drop moment in ancient history: "Our God is able to deliver us. But even if He does not, we will not serve your gods or worship this statue."',
          'Heats the furnace seven times hotter. Soldiers are incinerated just throwing them in. But inside the flames, the king rubs his eyes: four men walking around completely unharmed, and the fourth looks like the Son of God.'
        ],
        perspectivePrompt: 'If standing for what is right means you could lose your job, your income, or your reputation, what is your gut response?',
        choices: [
          {
            id: 'choice-dan-3',
            text: 'Bow down outwardly while telling yourself you don\'t mean it in your heart.',
            reaction: 'The compromise that millions make. You save your skin today, but surrender your authority forever.',
            historicalPivot: 'The three men knew that public compliance is public endorsement. They chose physical fire over spiritual surrender.'
          },
          {
            id: 'choice-dan-4',
            text: 'Hold your ground with an "Even If Not" posture.',
            reaction: 'This takes supernatural courage. You entrust the outcome completely to God.',
            historicalPivot: 'They didn’t have a guarantee they would survive. They simply knew that bowing to a counterfeit king was worse than burning.'
          }
        ],
        unlockedScripture: {
          reference: 'Daniel 3:17-18',
          translation: 'WEB',
          text: 'If we are thrown into the blazing furnace, the God we serve is able to deliver us... But even if he does not, we want you to know, Your Majesty, that we will not serve your gods.',
          deepDive: '"Even if not." That is mature, battle-tested faith. They didn’t serve God as an insurance policy to avoid pain; they served Him because He is God.'
        },
        glossary: [
          {
            term: 'Smelting Furnace',
            ancientMeaning: 'A vertical kiln with an open top used to bake bricks or melt bronze, producing temperatures exceeding 1,000°C.',
            modernAnalogy: 'A high-intensity crisis designed to destroy anyone who refuses to fall in line.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Facing threats of termination or isolation for standing up against an unethical directive.',
          practicalLesson: 'The fourth man only joins you in the furnace, not outside of it. You discover God’s closest presence when the heat is highest.',
          dailyAction: 'When you face a test of courage today, say under your breath: "Even if not, I will do what is right."'
        },
        wisdomQuiz: {
          question: 'What was unique about the condition of Shadrach, Meshach, and Abednego when they stepped out of the furnace?',
          options: [
            {
              text: 'Their robes were burned, but their skin was healed.',
              isCorrect: false,
              explanation: 'Their robes were entirely untouched.'
            },
            {
              text: 'Not a single hair was singed, their cloaks were unchanged, and they didn’t even smell like smoke.',
              isCorrect: true,
              explanation: 'Exactly right. The only things the fire burned away were the ropes that bound their wrists.'
            }
          ]
        }
      },
      {
        id: 'daniel-act-3',
        actNumber: 3,
        actTitle: 'The Bureaucratic Ambush & The Lions’ Den',
        visualTheme: 'cave_refuge',
        sceneAtmosphere: 'The subterranean royal pit in Susa under King Darius. Heavy stone slab rolled over the mouth, sealed with the king’s signet ring.',
        historicalContext: 'Jealous Persian politicians couldn’t find any dirt on Prime Minister Daniel’s finances, so they targeted his private prayer life with a manufactured law.',
        narrativeParagraphs: [
          'Decades have passed. Daniel is now in his 80s, serving under a new superpower: the Medo-Persian empire. King Darius plans to promote Daniel over the entire kingdom because an extraordinary spirit was in him.',
          'The other bureaucrats are consumed by toxic envy. They run an opposition audit on Daniel. They inspect his tax receipts, government contracts, and administrative records. Verdict: Zero corruption, zero negligence. He was totally trustworthy.',
          'They realize: "We will never find any basis for charges against this Daniel unless it has something to do with the law of his God." They manipulate the vain king into signing an irrevocable decree: Pray to anyone other than King Darius for 30 days, and you are fed to starved lions.',
          'Daniel hears the law is signed. Does he run? Does he hide in a closet? He walks home, opens his windows toward Jerusalem, gets down on his knees, and prays three times a day—just as he had done before.'
        ],
        perspectivePrompt: 'Envious rivals engineer a policy change specifically designed to catch you and push you out. How do you handle the ambush?',
        choices: [
          {
            id: 'choice-dan-5',
            text: 'Confront them with dirty political tricks of your own.',
            reaction: 'Fighting poison with poison makes you just another toxic politician.',
            historicalPivot: 'Daniel never engaged in palace mud-slinging. He kept doing his job with elite competence and kept his prayer schedule unchanged.'
          },
          {
            id: 'choice-dan-6',
            text: 'Maintain your steady cadence of integrity and prayer without flinching.',
            reaction: 'Unshakeable composure. You refuse to let scheming rivals dictate your daily communion with God.',
            historicalPivot: 'Darius spent the night fasting and pacing. At dawn, Daniel shouted from the pit: "My God sent his angel, and he shut the mouths of the lions."'
          }
        ],
        unlockedScripture: {
          reference: 'Daniel 6:10',
          translation: 'WEB',
          text: 'Now when Daniel learned that the decree had been published, he went home to his upstairs room where the windows opened toward Jerusalem. Three times a day he got down on his knees and prayed, giving thanks to his God, just as he had done before.',
          deepDive: '"Just as he had done before." Daniel’s courage was not a sudden burst of adrenaline; it was the compound dividend of a lifetime of steady, quiet daily discipline.'
        },
        glossary: [
          {
            term: 'Law of the Medes and Persians',
            ancientMeaning: 'An imperial legal doctrine where a royal decree signed with the signet ring could never be revoked, even by the king himself.',
            modernAnalogy: 'A binding institutional contract or policy locked in stone without room for appeal.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Workplace jealousy, false rumors, or unfair bureaucratic traps designed to derail your momentum.',
          practicalLesson: 'Live with such pristine financial and personal integrity that your critics have nothing to attack except your faith. God will muzzle the lions.',
          dailyAction: 'Keep your daily quiet time today, no matter how chaotic or threatening the schedule feels.'
        },
        wisdomQuiz: {
          question: 'What did King Darius do while Daniel spent the night in the lions\' den?',
          options: [
            {
              text: 'He threw a victory party with his ministers.',
              isCorrect: false,
              explanation: 'Darius loved Daniel and was tricked by his ministers.'
            },
            {
              text: 'He fasted all night, refused any entertainment, and ran to the pit at the crack of dawn.',
              isCorrect: true,
              explanation: 'Yes! Darius was sick with guilt and rushed to the den at sunrise to see if Daniel had survived.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'esther-journey',
    title: 'Esther: The Palace Infiltration',
    subtitle: 'An undercover orphan queen risking execution to stop a genocide',
    heroName: 'Esther',
    characterTitle: 'The Covert Queen',
    testament: 'Old Testament',
    historicalPeriod: 'c. 483–473 BC — Citadel of Susa, Persia',
    estimatedMinutes: 8,
    themeColor: 'from-amber-600 to-rose-950',
    badgeName: 'Silent Providence',
    starterTrack: 'Career & High Stakes',
    relicReward: {
      id: 'esther-scepter',
      name: 'The Golden Scepter',
      iconName: 'scepter',
      description: 'The golden scepter extended by King Xerxes in the royal throne room.',
      lesson: 'Courage is stepping into mortal danger when staying silent would be the safer personal choice.'
    },
    summary: 'The thrilling political espionage of a young minority woman who leveraged her position to flip an empire’s death decree.',
    acts: [
      {
        id: 'esther-act-1',
        actNumber: 1,
        actTitle: 'The Hidden Identity in Susa',
        visualTheme: 'palace_hall',
        sceneAtmosphere: 'The luxurious citadel of Susa. Perfumed courtyards, marble mosaics, and eunuch guards watching every breath.',
        historicalContext: 'King Ahasuerus (Xerxes I) deposed Queen Vashti and launched an empire-wide search for a replacement queen among thousands of women.',
        narrativeParagraphs: [
          'Her Hebrew name was Hadassah—an orphaned Jewish girl raised by her cousin Mordecai in the foreign capital of Persia. When the king’s imperial press-gangs swept through the provinces, she was swept into the royal harem.',
          'Mordecai gave her one crucial tactical directive: "Do not reveal your family background or your people." In a volatile palace where foreign minorities could be executed on a whim, discretion was a survival skill.',
          'For twelve months, Esther went through cosmetic preparation. But unlike other contenders who demanded gold and jewelry, Esther listened strictly to Hegai, the king’s eunuch, asking for nothing beyond what he advised. Her quiet poise and inner dignity captivated everyone who saw her.',
          'Xerxes placed the royal crown on her head. Hadassah was now Queen Esther of the Persian Empire—an undercover believer seated at the apex of global power.'
        ],
        perspectivePrompt: 'You find yourself elevated into an influential circle with high stakes and hidden agendas. How do you carry yourself?',
        choices: [
          {
            id: 'choice-esther-1',
            text: 'Flatter everyone, wear flashy status symbols, and demand attention.',
            reaction: 'The rookie mistake. In cutthroat environments, flashing your ego puts a target on your back.',
            historicalPivot: 'Esther demonstrated tactical silence and listened to trusted counselors. Her restraint was her superpower.'
          },
          {
            id: 'choice-esther-2',
            text: 'Maintain poise, seek wise counsel, and keep your core cards close to your chest.',
            reaction: 'Strategic mastery. Quiet competence and emotional self-control win over volatile leaders.',
            historicalPivot: 'Esther won the favor of the king precisely because she was grounded, unpretentious, and emotionally disciplined.'
          }
        ],
        unlockedScripture: {
          reference: 'Esther 2:10',
          translation: 'WEB',
          text: 'Esther had not revealed her people or her kindred, for Mordecai had commanded her not to make it known.',
          deepDive: 'Wisdom knows when to speak and when to hold your tongue. Timing is everything in high-stakes environments.'
        },
        glossary: [
          {
            term: 'Citadel of Susa',
            ancientMeaning: 'The fortified winter palace of the Persian emperors, spanning acres of luxurious courtyards and guard towers.',
            modernAnalogy: 'The inner sanctum of global geopolitical power or executive corporate headquarters.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Entering a new corporate culture or high-influence room where people have hidden motives.',
          practicalLesson: 'You don’t have to broadcast everything on day one. Learn the terrain, listen more than you speak, and build quiet credibility.',
          dailyAction: 'Practice strategic listening today: speak last in your next meeting.'
        },
        wisdomQuiz: {
          question: 'Why did Mordecai tell Esther to keep her Jewish heritage secret when she first entered the palace?',
          options: [
            {
              text: 'He wanted her to pretend she was Persian forever.',
              isCorrect: false,
              explanation: 'He intended her heritage to be revealed only at the strategically right moment.'
            },
            {
              text: 'He knew premature disclosure in a hostile court would jeopardize her safety before her influence was established.',
              isCorrect: true,
              explanation: 'Exactly. Premature transparency in a cutthroat environment gets you eliminated before you can make an impact.'
            }
          ]
        }
      },
      {
        id: 'esther-act-2',
        actNumber: 2,
        actTitle: '"For Such a Time as This"',
        visualTheme: 'courtyard_fire',
        sceneAtmosphere: 'The King’s Gate draped in sackcloth and ashes. Weeping echoes across the city as royal heralds nail a genocide decree to the city gates.',
        historicalContext: 'Haman, prime minister of Persia, bribed King Xerxes with 10,000 silver talents to authorize the total extermination of all Jews on the 13th of Adar.',
        narrativeParagraphs: [
          'A royal decree backed by the king’s signet ring went out to all 127 provinces: Destroy, kill, and annihilate all Jews—young and old, women and children—in a single day, and plunder their goods.',
          'Mordecai tore his clothes, put on rough burlap and ashes, and wept at the palace gate. When Queen Esther sent him clean clothes to cover his embarrassment, Mordecai refused the comfort. He sent her a copy of the death warrant with a direct command: Go to the king and beg for mercy.',
          'Esther sent word back reminding him of the palace reality: "Anyone—man or woman—who approaches the king in the inner court without being summoned has only one law: death. Unless the king extends his golden scepter, you are executed on the spot. And I haven’t been summoned in thirty days."',
          'Mordecai fired back the line that defined her life: "Do not think that because you are in the king’s house you alone of all the Jews will escape. If you remain silent at this time, relief and deliverance will arise from another place, but you will perish. And who knows whether you haven’t come to the kingdom for such a time as this?"'
        ],
        perspectivePrompt: 'You have comfortable privilege, but speaking up for vulnerable people could risk your career or status. What do you do?',
        choices: [
          {
            id: 'choice-esther-3',
            text: 'Keep your head down and preserve your personal safety in the palace.',
            reaction: 'Comfort is a seductive lie. When tyranny is unchecked, your silence will not protect you forever.',
            historicalPivot: 'Mordecai reminded Esther that privilege is not a personal reward; it is an assignment to be spent for the defenseless.'
          },
          {
            id: 'choice-esther-4',
            text: 'Recognize your appointment, call for prayer, and prepare to risk everything.',
            reaction: 'This transforms a passive bystander into a heroic history-maker.',
            historicalPivot: 'Esther realized her royal seat was not an accident of beauty. She told Mordecai: "Fast for me for three days... and if I perish, I perish."'
          }
        ],
        unlockedScripture: {
          reference: 'Esther 4:14',
          translation: 'WEB',
          text: 'And who knows whether you have not come to the kingdom for such a time as this?',
          deepDive: 'You were not placed in your family, your job, or your neighborhood by accident. God positions His people ahead of crises to be agents of redemption.'
        },
        glossary: [
          {
            term: 'Fast of Susa',
            ancientMeaning: 'Three days of complete abstention from food and water by the entire community in desperate intercession.',
            modernAnalogy: 'Total shutdown of all distractions to seek spiritual clarity and breakthrough in a life-or-death crisis.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Staying silent when coworkers, family members, or friends are being mistreated or destroyed.',
          practicalLesson: 'Your current platform, income, or voice was given to you for a reason bigger than your comfort. Use your leverage.',
          dailyAction: 'Speak up or send a protective message on behalf of someone being targeted or excluded today.'
        },
        wisdomQuiz: {
          question: 'What was Mordecai’s theological point when he said "relief and deliverance will arise from another place"?',
          options: [
            {
              text: 'He was confident the Persian army would change its mind.',
              isCorrect: false,
              explanation: 'Persian law could not be changed.'
            },
            {
              text: 'He knew God’s covenant promises could never fail, but Esther would miss her generational destiny if she stayed silent.',
              isCorrect: true,
              explanation: 'Spot on. God’s ultimate victory is guaranteed; whether you choose to participate in the courage is up to you.'
            }
          ]
        }
      },
      {
        id: 'esther-act-3',
        actNumber: 3,
        actTitle: '"If I Perish, I Perish"',
        visualTheme: 'palace_hall',
        sceneAtmosphere: 'The inner throne room of Xerxes. Polished porphyry floors, towering royal bodyguards with double-edged spears, absolute silence.',
        historicalContext: 'Appearing uninvited before the Persian emperor was a capital offense punishable by immediate execution.',
        narrativeParagraphs: [
          'On the third morning of the fast, Esther put on her royal robes. Her hands were cold, but her spine was steel. She stepped across the threshold into the inner court, facing the throne directly.',
          'King Xerxes was sitting on his royal seat. The guards gripped their weapons. A tense five seconds hung in the air. Then the king saw Queen Esther standing in the courtyard—and he held out the golden scepter in his hand.',
          'Esther stepped forward and touched the tip of the scepter. "What is your request, Queen Esther? Even up to half the kingdom, it will be given you." She didn’t blurt out the accusation immediately; with masterclass pacing, she invited the king and Haman to two private banquets.',
          'At the second banquet, she dropped the hammer: "My people and I have been sold to be annihilated." When the stunned king demanded: "Who has dared to do such a thing?", Esther pointed her finger: "The adversary and enemy is this vile Haman!" Haman was hanged on the very gallows he built for Mordecai, and the decree was overturned.'
        ],
        perspectivePrompt: 'You have the audience with leadership, but the conversation is terrifyingly high-stakes. How do you execute?',
        choices: [
          {
            id: 'choice-esther-5',
            text: 'Burst in shouting accusations and lose your composure.',
            reaction: 'Emotional outbursts trigger defensiveness and make you look out of control.',
            historicalPivot: 'Esther prepared with fasting, staged an intimate dinner setting, and spoke with calm, undeniable clarity.'
          },
          {
            id: 'choice-esther-6',
            text: 'Prepare spiritually, set the atmosphere, and deliver the truth with surgical precision.',
            reaction: 'Masterful execution. Truth delivered with dignity and precision is unstoppable.',
            historicalPivot: 'Esther’s courage flipped the entire legal framework of the Persian Empire and protected an entire generation.'
          }
        ],
        unlockedScripture: {
          reference: 'Esther 7:3',
          translation: 'WEB',
          text: 'If I have found favor in your eyes, O king, and if it please the king, let my life be granted me for my wish, and my people for my request!',
          deepDive: 'Notice Esther didn\'t play the victim. She framed her plea in the language of honor, clarity, and bold truth.'
        },
        glossary: [
          {
            term: 'Golden Scepter',
            ancientMeaning: 'The personal staff of the Persian king; touching its tip granted royal immunity and audience.',
            modernAnalogy: 'Gaining executive sign-off and protection in a high-risk corporate initiative.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Confronting an abusive leader, bad policy, or toxic dynamic at work or in family.',
          practicalLesson: 'Courage plus timing equals victory. Prepare your spirit before you deliver the confrontation.',
          dailyAction: 'Schedule that difficult, truthful conversation you’ve been avoiding. Step in with poise.'
        },
        wisdomQuiz: {
          question: 'What happened to Haman, the mastermind behind the genocide decree?',
          options: [
            {
              text: 'He escaped to Egypt on horseback.',
              isCorrect: false,
              explanation: 'He was arrested on the spot.'
            },
            {
              text: 'He was hanged on the 75-foot gallows he had constructed in his backyard to execute Mordecai.',
              isCorrect: true,
              explanation: 'Poetic justice at its finest. The trap he set for an innocent man became his own execution site.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'nehemiah-journey',
    title: 'Nehemiah: Building Under Fire',
    subtitle: 'Rebuilding shattered defenses in 52 days while holding a trowel and a sword',
    heroName: 'Nehemiah',
    characterTitle: 'The Builder Governor',
    testament: 'Old Testament',
    historicalPeriod: 'c. 445 BC — Jerusalem & Persian Empire',
    estimatedMinutes: 8,
    themeColor: 'from-amber-700 to-stone-900',
    badgeName: 'Wall Builder',
    starterTrack: 'Career & High Stakes',
    relicReward: {
      id: 'nehemiah-trowel',
      name: 'The Builder\'s Chisel & Trowel',
      iconName: 'trowel',
      description: 'The stonemason tool carried alongside a heavy iron blade.',
      lesson: 'Never stop building your mission to engage small-minded mockers at the fence line.'
    },
    summary: 'The ultimate blueprint for crisis leadership, logistics, defensive boundaries, and overcoming sabotage.',
    acts: [
      {
        id: 'nehemiah-act-1',
        actNumber: 1,
        actTitle: 'The Midnight Rubble Recon',
        visualTheme: 'valley_battlefield',
        sceneAtmosphere: 'Charred limestone boulders and collapsed cedar timbers around the Valley of Hinnom under moonlight.',
        historicalContext: 'Jerusalem’s walls had lain in blackened rubble for 140 years since the Babylonian siege, leaving inhabitants vulnerable to marauders.',
        narrativeParagraphs: [
          'Nehemiah had it made: high-ranking cupbearer to the Persian emperor Artaxerxes. High salary, palace security, daily access to the throne. But when travelers from Judah told him: "The wall of Jerusalem is broken down, and its gates are burned with fire," Nehemiah sat down and wept.',
          'He prayed for four months, secured royal timber permits and letters of transit from the king, and rode 1,000 miles to Jerusalem. But when he arrived, he didn’t hold a flashy press conference or make grand speeches.',
          'In the dead of night, while the city slept, Nehemiah mounted a beast and inspected the broken gates in complete secrecy. He audited the damage with his own eyes before rallying the demoralized survivors.',
          'Only after understanding the exact scope of the rubble did he gather the people: "Come, let us rebuild the wall of Jerusalem, that we may no longer suffer derision." Inspired by a leader who had done the homework, they said: "Let us rise up and build!"'
        ],
        perspectivePrompt: 'You inherit a broken project, dysfunctional team, or ruined family dynamic. What is your first move?',
        choices: [
          {
            id: 'choice-neh-1',
            text: 'Announce sweeping plans immediately before assessing the real problems.',
            reaction: 'The amateur trap. Making promises before understanding the ground truth leads to rapid failure.',
            historicalPivot: 'Nehemiah audited the rubble in the dark without telling anyone what God had put in his heart.'
          },
          {
            id: 'choice-neh-2',
            text: 'Do quiet recon, measure the real damage, and build an airtight plan before talking.',
            reaction: 'Elite leadership. When you know the facts cold, your vision inspires unshakeable confidence.',
            historicalPivot: 'Because Nehemiah did the secret groundwork, the people rallied behind him in a single meeting.'
          }
        ],
        unlockedScripture: {
          reference: 'Nehemiah 2:17',
          translation: 'WEB',
          text: 'Then I said to them, "You see the trouble we are in, how Jerusalem lies in ruins with its gates burned. Come, let us build the wall of Jerusalem, that we may no longer suffer derision."',
          deepDive: 'Notice the pronoun: "we." Nehemiah didn’t say "you people messed up." He identified with their pain and shared the burden.'
        },
        glossary: [
          {
            term: 'Royal Cupbearer',
            ancientMeaning: 'A trusted senior security and administrative advisor who tested the king’s wine for poison and had intimate access to state affairs.',
            modernAnalogy: 'Chief of Staff or confidential executive advisor to a head of state.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Tackling a messy, long-neglected project in your career, finances, or family.',
          practicalLesson: 'Never launch a turnaround until you have done the quiet, unglamorous audit of the rubble.',
          dailyAction: 'Take 20 minutes tonight to audit a messy problem in your life with brutal honesty before taking action.'
        },
        wisdomQuiz: {
          question: 'Why did Nehemiah conduct his inspection of the broken walls at midnight in complete secret?',
          options: [
            {
              text: 'He was afraid of ghosts in the ruins.',
              isCorrect: false,
              explanation: 'Ancient ruins didn\'t frighten a veteran palace official.'
            },
            {
              text: 'He needed unbiased ground truth before local critics or panicked locals could interfere with the plan.',
              isCorrect: true,
              explanation: 'Precisely. Leaking plans prematurely creates panic and invites sabotage.'
            }
          ]
        }
      },
      {
        id: 'nehemiah-act-2',
        actNumber: 2,
        actTitle: 'Trowel and Sword Defense',
        visualTheme: 'valley_battlefield',
        sceneAtmosphere: 'Chisels banging against stone under the hot desert sun. Sanballat and Tobiah mocking from the ridge as armed watchmen scan the scrub brush.',
        historicalContext: 'Regional warlords plotted a surprise dawn military raid to slaughter the builders and stop the wall construction.',
        narrativeParagraphs: [
          'As the wall rose to half its height, the enemies panicked. Sanballat the Horonite sneered: "What are these feeble Jews doing? If a fox steps on their stone wall, it will crumble!"',
          'Mockery turned into active military threats. Word leaked that neighboring armies were planning a coordinated ambush. The workers were exhausted: "The strength of the laborers is giving out, and there is so much rubble that we cannot rebuild the wall."',
          'Nehemiah instituted a brilliant tactical rotation: From that day on, half his men worked on construction while the other half stood armed with spears, shields, bows, and coats of mail.',
          'Even the builders worked with a weapon strapped to their waist: a trowel in one hand, a sword in the other. When threats surrounded them, Nehemiah cried: "Do not be afraid of them. Remember the Lord, great and awesome, and fight for your brothers, your sons, your daughters, your wives, and your homes!"'
        ],
        perspectivePrompt: 'Critics mock your progress and active resistance tries to derail your build. How do you split your focus?',
        choices: [
          {
            id: 'choice-neh-3',
            text: 'Drop the construction completely to argue with the critics.',
            reaction: 'The hater’s goal achieved. When you stop building to argue, the enemy wins without firing a shot.',
            historicalPivot: 'Nehemiah never stopped the work. He armed the workers and integrated defense directly into production.'
          },
          {
            id: 'choice-neh-4',
            text: 'Keep building with one hand while keeping your defense ready in the other.',
            reaction: 'The dual-engine strategy: continuous production guarded by vigilant perimeter security.',
            historicalPivot: 'By integrating security with labor, the enemy realized their surprise ambush was blown and withdrew.'
          }
        ],
        unlockedScripture: {
          reference: 'Nehemiah 4:14',
          translation: 'WEB',
          text: 'Do not be afraid of them. Remember the Lord, who is great and awesome, and fight for your brothers, your sons, your daughters, your wives, and your homes.',
          deepDive: 'Connect your grind to your loved ones. When work gets brutal, remember who you are fighting for: your family, your integrity, your legacy.'
        },
        glossary: [
          {
            term: 'Trowel & Sword',
            ancientMeaning: 'Working on stonework while armed with a combat gladius or short spear.',
            modernAnalogy: 'Simultaneously executing product building while actively managing operational risk and cybersecurity.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Balancing aggressive forward progress with defending against office politics and burnout.',
          practicalLesson: 'Never stop building what God gave you to build, but never be naive about your blind spots. Keep your spiritual armor strapped on.',
          dailyAction: 'When you feel like quitting on a tough goal today, write down the names of the people who depend on you finishing.'
        },
        wisdomQuiz: {
          question: 'How did Nehemiah organize the families during the construction to ensure maximum motivation?',
          options: [
            {
              text: 'He forced them to work on areas far from their houses.',
              isCorrect: false,
              explanation: 'That would demoralize the builders.'
            },
            {
              text: 'He assigned each family to rebuild the section of the wall directly facing their own home.',
              isCorrect: true,
              explanation: 'Brilliant organizational psychology! People fight 10x harder for the wall that protects their own front door.'
            }
          ]
        }
      },
      {
        id: 'nehemiah-act-3',
        actNumber: 3,
        actTitle: '"I Cannot Come Down"',
        visualTheme: 'palace_hall',
        sceneAtmosphere: 'The completed ramparts overlooking Jerusalem. Couriers delivering urgent letters from the plains of Ono requesting a private conference.',
        historicalContext: 'Sanballat and Geshem sent four invitations to lure Nehemiah into an ambush in an isolated village, followed by false rumors of treason.',
        narrativeParagraphs: [
          'The gaps were closed. The gates were hung. The enemy realized open warfare had failed, so they pivoted to a subtler weapon: false friendship and distraction meetings.',
          'Sanballat sent a message: "Come, let us meet together in the villages on the plain of Ono." Nehemiah recognized the trap: they planned to assassinate or kidnap him in neutral territory.',
          'Nehemiah sent couriers back with the legendary sentence: "I am doing a great work and I cannot come down. Why should the work stop while I leave it and come down to you?" Four times they sent the same request; four times he gave the exact same answer.',
          'They hired a compromised prophet who urged Nehemiah to hide in the temple to save his life. Nehemiah scoffed: "Should a man like me run away?" In just 52 days, the wall was completed. Even surrounding hostile nations admitted: "This work had been accomplished with the help of our God."'
        ],
        perspectivePrompt: 'Competitors or toxic peers try to lure you into distraction meetings or fake controversies. What is your response?',
        choices: [
          {
            id: 'choice-neh-5',
            text: 'Go to the meeting out of fear of looking rude or uncooperative.',
            reaction: 'You waste your prime execution energy in a swamp of pointless debate.',
            historicalPivot: 'Nehemiah knew that not every meeting deserves your calendar. Say no to the plains of Ono.'
          },
          {
            id: 'choice-neh-6',
            text: 'Politely refuse: "I am doing important work and I cannot come down."',
            reaction: 'The gold standard of time management and mission focus.',
            historicalPivot: 'Nehemiah stayed on the wall, ignored the noise, and completed in 52 days what had sat ruined for 140 years.'
          }
        ],
        unlockedScripture: {
          reference: 'Nehemiah 6:3',
          translation: 'WEB',
          text: 'I am doing a great work and I cannot come down. Why should the work stop while I leave it and come down to you?',
          deepDive: 'Guard your focus ruthlessly. The enemy doesn\'t need to destroy your character if he can simply distract your attention.'
        },
        glossary: [
          {
            term: 'Plains of Ono',
            ancientMeaning: 'A low-lying coastal border territory between Jewish and Samaritan influence, ideal for kidnapping.',
            modernAnalogy: 'A pointless debate thread, toxic dinner, or distraction committee designed to drain your execution momentum.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Saying yes to too many distractions, meetings, and side projects that pull you off your main goal.',
          practicalLesson: 'Great leaders have a high threshold for saying NO. Protect your build time like a bulldog.',
          dailyAction: 'Say "No, thank you" to at least one low-priority request today to protect your primary mission.'
        },
        wisdomQuiz: {
          question: 'How long did it take Nehemiah and the people to rebuild the entire broken wall of Jerusalem?',
          options: [
            {
              text: '3 years and 6 months.',
              isCorrect: false,
              explanation: 'Prior efforts stalled for 140 years, but Nehemiah operated with blitzkrieg speed.'
            },
            {
              text: 'Just 52 days.',
              isCorrect: true,
              explanation: 'An unbelievable 52 days! Shocked their enemies and proved God’s backing.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'gideon-journey',
    title: 'Gideon: The Imposter\'s Army',
    subtitle: 'From trembling coward hiding in a winepress to routing 135,000 invaders with 300 men',
    heroName: 'Gideon',
    characterTitle: 'The Reluctant Warrior',
    testament: 'Old Testament',
    historicalPeriod: 'c. 1160 BC — Valley of Jezreel, Israel',
    estimatedMinutes: 8,
    themeColor: 'from-amber-600 to-stone-900',
    badgeName: 'Torch & Pitcher',
    starterTrack: 'Underdog & Courage',
    relicReward: {
      id: 'gideon-torch',
      name: 'The Broken Clay Jar & Torch',
      iconName: 'torch',
      description: 'The earthenware clay jar shattered at midnight along the hills of Moreh.',
      lesson: 'God’s light and power shine brightest when human self-reliance is completely shattered.'
    },
    summary: 'The ultimate cure for imposter syndrome: how God transforms paralyzing insecurity into history-shaping victory.',
    acts: [
      {
        id: 'gideon-act-1',
        actNumber: 1,
        actTitle: 'The Winepress Thresher',
        visualTheme: 'cave_refuge',
        sceneAtmosphere: 'A dark, subterranean stone wine vat in Ophrah. Chaff clinging to sweat-soaked skin as young Gideon glances nervously over the rim.',
        historicalContext: 'Midianite raiders invaded every harvest season like locusts with endless camels, stripping the land of all food and livestock.',
        narrativeParagraphs: [
          'Normally, wheat is threshed outdoors on high hilltop threshing floors where the breeze catches the chaff and blows it away. But Gideon is threshing grain inside a narrow, sunken stone winepress to hide it from Midianite marauders.',
          'He is terrified, covered in dust, and terrified of being caught. Suddenly, the Angel of the Lord appears sitting under an oak tree and says to him: "The Lord is with you, you mighty man of valor!"',
          'Gideon looks around in disbelief: "Pardon me, sir, but if the Lord is with us, why has all this happened to us? And where are all His miracles our fathers told us about? The Lord has abandoned us." Gideon wasn’t pretending to be pious; he was raw, skeptical, and frustrated.',
          'The Lord turned to him and said: "Go in this might of yours and save Israel from the hand of Midian. Am I not sending you?" Gideon protested: "My clan is the weakest in Manasseh, and I am the least in my father’s house!" But God doesn’t call the qualified; He qualifies the called.'
        ],
        perspectivePrompt: 'You feel unqualified, underfunded, and like the weakest person in the room. What is your response to a big calling?',
        choices: [
          {
            id: 'choice-gid-1',
            text: 'List all your flaws and make excuses to turn down the assignment.',
            reaction: 'Very common. Imposter syndrome makes us focus on our weaknesses instead of God’s capacity.',
            historicalPivot: 'Gideon tried to disqualify himself with his resume, but God promised: "I will be with you, and you will strike down the Midianites as one man."'
          },
          {
            id: 'choice-gid-2',
            text: 'Bring your honest doubts to God, but accept the assignment.',
            reaction: 'Authentic courage. You step forward not because you feel strong, but because God is with you.',
            historicalPivot: 'Gideon obeyed despite his shaking hands, tearing down his father’s Baal altar that very night.'
          }
        ],
        unlockedScripture: {
          reference: 'Judges 6:12',
          translation: 'WEB',
          text: 'The angel of the Lord appeared to him and said, "The Lord is with you, mighty warrior!"',
          deepDive: 'God speaks to your future identity, not your present insecurity. He called Gideon a "mighty warrior" while he was still hiding in a hole.'
        },
        glossary: [
          {
            term: 'Winepress Threshing',
            ancientMeaning: 'Using a deep underground stone trough meant for crushing grapes to beat wheat in secret.',
            modernAnalogy: 'Working secretly in a basement out of fear that competitors will steal your project.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Imposter syndrome, feeling like a fraud who doesn’t belong in leadership.',
          practicalLesson: 'Stop measuring your qualifications against the size of the challenge. God deliberately picks the least qualified so His glory is undeniable.',
          dailyAction: 'When self-doubt whispers "Who do you think you are?" answer with: "God is with me, and that is enough."'
        },
        wisdomQuiz: {
          question: 'What was Gideon doing when God’s messenger called him a "mighty warrior"?',
          options: [
            {
              text: 'Leading a cavalry charge against Midian.',
              isCorrect: false,
              explanation: 'He had never swung a sword in battle.'
            },
            {
              text: 'Hiding inside a sunken wine vat beating wheat so invaders wouldn’t steal it.',
              isCorrect: true,
              explanation: 'Yes! God sees your potential when you only see your panic.'
            }
          ]
        }
      },
      {
        id: 'gideon-act-2',
        actNumber: 2,
        actTitle: 'The Radical Roster Cut (From 32,000 to 300)',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'The Spring of Harod. 32,000 nervous volunteer militia camped across from 135,000 veteran Midianite raiders in the valley below.',
        historicalContext: 'Human military logic dictates gathering as many troops as possible. God’s strategy was the exact opposite.',
        narrativeParagraphs: [
          'Gideon blew the ram’s horn across the hills. To his surprise, 32,000 men showed up ready to fight. But the enemy coalition camped in the valley of Jezreel numbered 135,000 seasoned warriors—outnumbering Israel 4 to 1.',
          'Then God dropped an order that seemed suicidal: "The people who are with you are too many for Me to give the Midianites into their hand, lest Israel boast against Me, saying: \'My own hand has saved me.\' Tell anyone who is fearful and trembling to turn around and go home."',
          'Gideon made the announcement. 22,000 men immediately packed their bags and walked away! Imagine standing there watching two-thirds of your army leave. Only 10,000 men remained.',
          'Then God said: "There are still too many. Take them down to the water." He watched how they drank: 9,700 knelt face-down in the water, oblivious to their surroundings. Only 300 men brought the water up to their mouths in their cupped hands, eyes scanning the horizon. God said: "With these 300 men I will deliver you."'
        ],
        perspectivePrompt: 'Your budget is slashed, your team shrinks by 90%, and the odds look completely impossible. How do you pivot?',
        choices: [
          {
            id: 'choice-gid-3',
            text: 'Panic, surrender, and complain that leadership sabotaged you.',
            reaction: 'The natural reaction when relying purely on headcount and human resources.',
            historicalPivot: 'God trimmed the fat because bloated armies rely on human hustle rather than divine power.'
          },
          {
            id: 'choice-gid-4',
            text: 'Embrace the lean, disciplined strike team and trust God for the outcome.',
            reaction: 'Elite focus. 300 disciplined, vigilant executors beat 30,000 distracted bodies every single time.',
            historicalPivot: 'Gideon accepted the roster cut. He traded an oversized, terrified mob for a razor-sharp, obedient unit.'
          }
        ],
        unlockedScripture: {
          reference: 'Judges 7:7',
          translation: 'WEB',
          text: 'The Lord said to Gideon, "With the 300 men who lapped I will save you and deliver the Midianites into your hands. Let all the other people go home."',
          deepDive: 'God loves impossible math. When your resources are cut to the bone, you are set up for a miracle where God gets 100% of the credit.'
        },
        glossary: [
          {
            term: 'Spring of Harod',
            ancientMeaning: '"Well of Trembling," a freshwater spring at the base of Mount Gilboa where the army water test occurred.',
            modernAnalogy: 'A high-pressure stress test that reveals who stays vigilant versus who gets sloppy.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Having your budget, team, or resources cut right before a major launch.',
          practicalLesson: 'Quality over quantity. A small, aligned, disciplined team operating with God’s blessing is infinitely more lethal than a bloated committee.',
          dailyAction: 'Stop obsessing over the resources you don’t have; master the 300 tools you DO have.'
        },
        wisdomQuiz: {
          question: 'Why did God insist on cutting Gideon’s army down from 32,000 men to just 300?',
          options: [
            {
              text: 'There wasn’t enough food to feed 32,000 men.',
              isCorrect: false,
              explanation: 'God fed millions in the desert; logistics were not the issue.'
            },
            {
              text: 'So that Israel could not boast: "My own strength has saved me."',
              isCorrect: true,
              explanation: 'Exactly right. God ensures the victory is so supernatural that nobody can credit human cleverness.'
            }
          ]
        }
      },
      {
        id: 'gideon-act-3',
        actNumber: 3,
        actTitle: 'Torches, Clay Jars & Midnight Panic',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'Surrounding the Midianite camp at 11:00 PM. 300 men holding clay jars with hidden torches and ram\'s horns.',
        historicalContext: 'Ancient armies slept in massive tent camps in valleys; night raids using psychological terror caused instant friendly-fire chaos.',
        narrativeParagraphs: [
          'Gideon equipped each of the 300 men with bizarre equipment for battle: zero swords, zero shields. Just a ram\'s horn trumpet in one hand, and an empty earthenware clay jar hiding a burning torch in the other.',
          'He divided them into three companies of 100 and encircled the vast sleeping enemy camp on the slopes above. He whispered his orders: "Watch me and follow my lead. When I blow my trumpet, blow yours and shout!"',
          'At the start of the middle night watch (around 11 PM), Gideon gave the signal. In a split second, 300 clay jars smashed simultaneously like rolling thunder! 300 bright torches blazed into the darkness, and 300 horns blasted as they roared: "A sword for the Lord and for Gideon!"',
          'The sleeping Midianites woke in pure delirium. In the pitch darkness, with hundreds of torches and horns encircling them, they believed a massive division had breached the perimeter. Panic swept the camp; they pulled their swords and butchered each other in the dark, fleeing in total rout.'
        ],
        perspectivePrompt: 'Facing overwhelming opposition, you have unconventional tools that don’t make conventional sense. Do you execute?',
        choices: [
          {
            id: 'choice-gid-5',
            text: 'Abandon the plan and run to buy traditional weapons.',
            reaction: 'Human pride hates looking foolish with clay jars and horns.',
            historicalPivot: 'Gideon trusted God’s psychological warfare strategy over conventional military wisdom.'
          },
          {
            id: 'choice-gid-6',
            text: 'Smash your self-reliance, let God’s light shine, and shout with confidence.',
            reaction: 'Total victory. When we break our human self-importance, God’s light confuses the adversary.',
            historicalPivot: 'The 300 men didn’t even need to draw a sword; God turned the enemy’s own swords against themselves.'
          }
        ],
        unlockedScripture: {
          reference: 'Judges 7:20',
          translation: 'WEB',
          text: 'The three companies blew the trumpets and broke the jars. Holding the torches in their left hands and the trumpets in their right hands... they shouted, "A sword for the Lord and for Gideon!"',
          deepDive: 'The light was hidden inside the jar until the jar was broken. Your deepest impact on others happens when your ego and self-sufficiency are broken open.'
        },
        glossary: [
          {
            term: 'Ram’s Horn (Shofar)',
            ancientMeaning: 'A curved horn capable of producing an ear-splitting, piercing sonic blast carried over miles.',
            modernAnalogy: 'A megaphone or tactical siren signaling an all-out assault.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Feeling outgunned by larger competitors, richer rivals, or massive institutional obstacles.',
          practicalLesson: 'Break the clay jar of your self-reliance. When you follow God’s counter-intuitive tactics, the enemy’s own confusion will defeat them.',
          dailyAction: 'Trust God with an unconventional solution to a problem today instead of following the world\'s playbook.'
        },
        wisdomQuiz: {
          question: 'What weapon did Gideon’s 300 men hold in their hands when the Midianite camp broke into chaos?',
          options: [
            {
              text: 'Iron broadswords and bronze javelins.',
              isCorrect: false,
              explanation: 'They held zero swords!'
            },
            {
              text: 'A ram’s horn in one hand, and a blazing torch inside a shattered clay jar in the other.',
              isCorrect: true,
              explanation: 'Yes! God used noise, light, and panic to demolish an army without a single Jewish blade drawn.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'jonah-journey',
    title: 'Jonah: The Reluctant Maverick',
    subtitle: 'Trying to outrun your calling and learning that mercy is bigger than your prejudice',
    heroName: 'Jonah',
    characterTitle: 'The Reluctant Prophet',
    testament: 'Old Testament',
    historicalPeriod: 'c. 760 BC — Mediterranean Sea & Nineveh',
    estimatedMinutes: 7,
    themeColor: 'from-cyan-800 to-stone-900',
    badgeName: 'Deep Water Anchor',
    starterTrack: 'Burnout & Pressure',
    relicReward: {
      id: 'jonah-anchor',
      name: 'The Sea Anchor',
      iconName: 'anchor',
      description: 'The iron anchor cast into the raging Mediterranean gale.',
      lesson: 'Surrendering to God’s assignment beats running yourself into a shipwreck every time.'
    },
    summary: 'A raw, psychological study of running from purpose, surviving rock bottom, and having the courage to forgive your worst enemies.',
    acts: [
      {
        id: 'jonah-act-1',
        actNumber: 1,
        actTitle: 'Sleeping in the Gale',
        visualTheme: 'sea_storm',
        sceneAtmosphere: 'The creaking cargo hold of a Phoenician merchant ship in a Category 5 Mediterranean squall. Mountainous black waves crashing over the deck.',
        historicalContext: 'Nineveh was the capital of the brutal Assyrian Empire. Commanded to warn his hated national enemies, Jonah boarded a ship heading 2,500 miles in the exact opposite direction to Tarshish.',
        narrativeParagraphs: [
          'When God gave Jonah a direct assignment: "Go to Nineveh and preach against it," Jonah did the math. Nineveh was the terrorist superpower of the ancient world, famous for skinning captives alive. Jonah hated them with patriotic passion.',
          'Instead of heading east, Jonah paid the fare for a ship heading west to Tarshish (modern-day Spain)—literally the edge of the known earth. But you can never outrun an omnipresent God.',
          'A violent hurricane struck the sea. The ship was breaking apart. Experienced pagan sailors were screaming in terror and hurling cargo overboard. Where was Jonah? Asleep in the bottom of the hold, completely numb.',
          'When the captain woke him shouting: "How can you sleep? Call on your God!", they cast lots to find out who brought this curse. The lot fell on Jonah. He confessed: "I am a Hebrew. Throw me into the sea and it will calm down. I know this storm is because of me."'
        ],
        perspectivePrompt: 'You are running away from an uncomfortable responsibility or tough conversation. How do you handle the turbulence?',
        choices: [
          {
            id: 'choice-jon-1',
            text: 'Keep sleeping, numb yourself with distractions, and pretend nothing is wrong.',
            reaction: 'Numbness is a symptom of spiritual evasion. The storm doesn’t stop just because you close your eyes.',
            historicalPivot: 'Jonah’s apathy endangered everyone on board. Your unaddressed disobedience always creates collateral damage for innocent people around you.'
          },
          {
            id: 'choice-jon-2',
            text: 'Own your failure, take responsibility, and stop dragging others down with you.',
            reaction: 'The turning point. Owning your mess is the first step toward genuine redemption.',
            historicalPivot: 'Jonah owned his guilt and allowed himself to be cast into the raging waters, sparing the sailors’ lives.'
          }
        ],
        unlockedScripture: {
          reference: 'Jonah 1:9',
          translation: 'WEB',
          text: 'He said to them, "I am a Hebrew, and I fear the Lord, the God of heaven, who made the sea and the dry land."',
          deepDive: 'Notice the contradiction in Jonah\'s mouth: He claimed to worship the God who made the sea, while simultaneously trying to use the sea to hide from Him.'
        },
        glossary: [
          {
            term: 'Tarshish',
            ancientMeaning: 'A mining port in southern Spain, considered the westernmost boundary of the Mediterranean world.',
            modernAnalogy: 'Buying a one-way ticket to the farthest corner of the globe to escape an awkward calling.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Procrastinating or dodging an uncomfortable assignment, apology, or life change.',
          practicalLesson: 'Running from God is the most expensive trip you will ever take. You pay your own fare, and you end up in the storm.',
          dailyAction: 'Stop running from that difficult task or conversation. Turn around and face it today.'
        },
        wisdomQuiz: {
          question: 'What did the pagan sailors do when Jonah told them to throw him into the raging sea?',
          options: [
            {
              text: 'They threw him overboard immediately without hesitation.',
              isCorrect: false,
              explanation: 'They actually tried hard to row back to shore to save his life first.'
            },
            {
              text: 'They tried desperately to row back to land, but the storm grew even fiercer before they finally surrendered.',
              isCorrect: true,
              explanation: 'Exactly right! Even pagan sailors showed more moral empathy than Jonah initially did.'
            }
          ]
        }
      },
      {
        id: 'jonah-act-2',
        actNumber: 2,
        actTitle: 'The Deep Water Abyss & The Reset',
        visualTheme: 'cave_refuge',
        sceneAtmosphere: 'Submerged in pitch blackness inside the belly of the great fish. Seaweed wrapped around the head, digestive acids, oxygen running thin.',
        historicalContext: 'Near-drowning in the open sea was the ancient world’s ultimate symbol of Sheol (the realm of the dead).',
        narrativeParagraphs: [
          'Sinking into the oceanic abyss. Water choking his throat, seaweed tangled around his neck, sinking to the roots of the underwater mountains. Death was seconds away.',
          'Then, in the darkness, a massive supernatural aquatic beast swallowed him whole. Inside the dark, acidic belly of the fish for three days and three nights, Jonah reached absolute rock bottom.',
          'No cell phone, no escape, no pride left. In that digestive chamber, Jonah prayed: "When my life was fainting away, I remembered the Lord, and my prayer came to you. Those who cling to worthless idols forfeit the grace that could be theirs. Salvation belongs to the Lord!"',
          'God spoke to the fish, and it vomited Jonah onto dry sand. Reeking of fish bile, bleached by gastric juices, but alive. Then the word of the Lord came to Jonah a second time: "Get up, go to Nineveh."'
        ],
        perspectivePrompt: 'You hit rock bottom after making terrible choices. How do you respond in the dark?',
        choices: [
          {
            id: 'choice-jon-3',
            text: 'Wallow in self-pity and assume your life is over.',
            reaction: 'Rock bottom can be your grave or your launching pad; self-pity makes it your grave.',
            historicalPivot: 'Jonah didn’t make excuses in the fish. He thanked God for saving him from drowning and surrendered his will.'
          },
          {
            id: 'choice-jon-4',
            text: 'Acknowledge your brokenness, surrender your ego, and accept a second chance.',
            reaction: 'The grace reset. God is the God of the second chance.',
            historicalPivot: 'When Jonah surrendered in the dark, God delivered him onto dry ground with a fresh mandate.'
          }
        ],
        unlockedScripture: {
          reference: 'Jonah 2:7',
          translation: 'WEB',
          text: 'When my life was fainting away, I remembered the Lord, and my prayer came to you, into your holy temple.',
          deepDive: 'Rock bottom is the solid foundation upon which God rebuilds a genuine leader. When you run out of human options, you finally discover God.'
        },
        glossary: [
          {
            term: 'Belly of Sheol',
            ancientMeaning: 'The underworld grave; poetic Hebrew for the suffocating sensation of drowning in deep water.',
            modernAnalogy: 'Total burnout, depression, or career rock bottom where there is zero light visible.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Feeling disqualified by massive personal or financial failure.',
          practicalLesson: 'God’s calling does not expire when you mess up. Your rock bottom is God’s classroom for grace.',
          dailyAction: 'Thank God for His second chances today and take one tangible step back toward your purpose.'
        },
        wisdomQuiz: {
          question: 'What happened to Jonah immediately after he finished his prayer of thanksgiving inside the fish?',
          options: [
            {
              text: 'He died and was resurrected 3 days later.',
              isCorrect: false,
              explanation: 'He was preserved alive throughout.'
            },
            {
              text: 'The Lord commanded the fish, and it vomited Jonah onto dry land.',
              isCorrect: true,
              explanation: 'Yes! As soon as Jonah aligned his heart with gratitude, the prison door opened.'
            }
          ]
        }
      },
      {
        id: 'jonah-act-3',
        actNumber: 3,
        actTitle: 'The Scorching Plant & The Bitter Heart',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'A desolate hillside east of Nineveh. A blistering east wind and scorching desert sun beating down on a wilted leafy shelter.',
        historicalContext: 'Nineveh responded to Jonah’s 8-word sermon with complete repentance: from the emperor to the cattle, the whole city put on sackcloth.',
        narrativeParagraphs: [
          'Jonah walked through Nineveh shouting: "Forty days and Nineveh will be overthrown!" To his utter horror, it worked. The King of Assyria stepped down from his throne, threw on sackcloth, and called an empire-wide fast. God relented and spared the city.',
          'Was Jonah thrilled at the greatest revival in history? No—he was furious! He stomped out of the city, built a little stick hut on the hill, and pouted: "I knew you were a gracious and compassionate God! That’s why I fled! Just kill me now!"',
          'God caused a leafy vine to grow over Jonah’s head to shade him from the sun, and Jonah was very happy about the plant. But at dawn the next day, God sent a worm that chewed the plant so it withered. Then a scorching desert wind blew, and Jonah nearly fainted with rage over the dead plant.',
          'God closed the book with an unforgettable moral question: "You care about this plant, which you didn’t plant or grow, which appeared overnight and died overnight. Should I not care about Nineveh, that great city with more than 120,000 people who cannot tell their right hand from their left?"'
        ],
        perspectivePrompt: 'Someone you dislike or consider your enemy experiences undeserved success, grace, or forgiveness. How does your heart react?',
        choices: [
          {
            id: 'choice-jon-5',
            text: 'Resent their blessing and wish bad luck on them.',
            reaction: 'The Jonah trap. Caring more about our personal comfort or grudges than human souls.',
            historicalPivot: 'Jonah cared more about a leafy plant shading his neck than 120,000 people dying in darkness.'
          },
          {
            id: 'choice-jon-6',
            text: 'Check your petty bitterness and rejoice in God\'s radical generosity.',
            reaction: 'Kingdom maturity. When you realize how much mercy YOU received, you stop rationing it to others.',
            historicalPivot: 'The story ends with an unanswered question, challenging every reader to examine their own prejudice.'
          }
        ],
        unlockedScripture: {
          reference: 'Jonah 4:2',
          translation: 'WEB',
          text: 'I knew that you are a gracious and compassionate God, slow to anger and abounding in love, a God who relents from sending calamity.',
          deepDive: 'The most tragic irony in scripture: Jonah used God’s most beautiful attributes as an accusation against Him because he wanted revenge.'
        },
        glossary: [
          {
            term: 'Sirocco (Scorching East Wind)',
            ancientMeaning: 'A dry, suffocating dust-laden desert gale from the Arabian desert that drove men to delirium.',
            modernAnalogy: 'Intense external pressure stripping away your comfort to reveal your true motives.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Harboring secret resentment when rivals, bad bosses, or exes receive mercy or success.',
          practicalLesson: 'Never hoard God’s grace. If you received mercy at rock bottom, you have zero right to demand judgment for others.',
          dailyAction: 'Pray a sincere prayer of blessing over someone who hurt you or someone whose success makes you jealous.'
        },
        wisdomQuiz: {
          question: 'How does the Book of Jonah uniquely end compared to other prophetic books?',
          options: [
            {
              text: 'With Jonah receiving a medal from the King of Nineveh.',
              isCorrect: false,
              explanation: 'Jonah was sulking on a hill outside the city.'
            },
            {
              text: 'With an open-ended question from God asking Jonah why he cares more about a plant than human lives.',
              isCorrect: true,
              explanation: 'Yes! It leaves the reader looking directly in the mirror.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'ruth-journey',
    title: 'Ruth: The Outlaw Covenant',
    subtitle: 'From penniless foreign refugee to the royal ancestor of King David through fierce loyalty',
    heroName: 'Ruth',
    characterTitle: 'The Loyal Gleaner',
    testament: 'Old Testament',
    historicalPeriod: 'c. 1100 BC — Moab & Bethlehem, Judah',
    estimatedMinutes: 7,
    themeColor: 'from-amber-700 to-yellow-950',
    badgeName: 'Covenant Kin',
    starterTrack: 'Restoration & Brotherhood',
    relicReward: {
      id: 'ruth-sheaf',
      name: 'The Sheaf of Golden Barley',
      iconName: 'sheaf',
      description: 'The gleanings gathered from the fields of Boaz outside Bethlehem.',
      lesson: 'Quiet diligence and fierce loyalty in hard seasons produce generational royalty.'
    },
    summary: 'A breathtaking story of loyalty, dignity in poverty, and how quiet faithfulness in the dirt positions you for divine destiny.',
    acts: [
      {
        id: 'ruth-act-1',
        actNumber: 1,
        actTitle: 'The Blood Oath to Naomi',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'The dusty road between Moab and Judah. Naomi weeping, kissing her daughters-in-law goodbye, urging them to return to their pagan families.',
        historicalContext: 'Famine forced Elimelech’s family to Moab. In ten years, the father and both sons died, leaving Naomi, Orpah, and Ruth as three destitute widows.',
        narrativeParagraphs: [
          'In the ancient world, a foreign widow with no husband and no sons was at the absolute bottom of the social hierarchy: zero income, zero legal protection, guaranteed poverty.',
          'Naomi had lost her husband and both sons in the foreign soil of Moab. Bitter and broken, she packed her bags to return to Bethlehem, telling her Moabite daughters-in-law: "Turn back, my daughters. I have nothing to offer you. The Lord’s hand has turned against me."',
          'Orpah wept, kissed Naomi, and walked back to the security of her family and idols. But Ruth clung to her with fierce, unshakeable loyalty.',
          'Ruth spoke the words that have echoed across three millennia: "Do not urge me to leave you. Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God. Where you die I will die, and there I will be buried." She walked away from her homeland into guaranteed poverty.'
        ],
        perspectivePrompt: 'A loved one or close partner enters a bitter, dark season of loss. Do you walk away to protect yourself, or do you stay locked in?',
        choices: [
          {
            id: 'choice-ruth-1',
            text: 'Walk away politely. You have your own future and security to look after.',
            reaction: 'Completely understandable by the world’s standards. Orpah did this and vanished from history.',
            historicalPivot: 'Ruth chose covenant over comfort. She traded personal security for radical sacrificial loyalty.'
          },
          {
            id: 'choice-ruth-2',
            text: 'Lock arms with them through the dark valley, no matter what it costs.',
            reaction: 'Heroic covenant loyalty (Hesed). This is the kind of loyalty that alters history.',
            historicalPivot: 'Ruth’s unselfish dedication to bitter Naomi became the talk of the entire town of Bethlehem.'
          }
        ],
        unlockedScripture: {
          reference: 'Ruth 1:16',
          translation: 'WEB',
          text: 'Ruth replied, "Don\'t urge me to leave you or to turn back from you. Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God."',
          deepDive: 'The Hebrew word is "Hesed"—covenant loyalty that never quits even when there is zero practical benefit to the giver.'
        },
        glossary: [
          {
            term: 'Moabite Outsider',
            ancientMeaning: 'Descendants of Lot with a historic blood feud against Israel; barred from entering the assembly of the Lord for ten generations.',
            modernAnalogy: 'A stigmatized immigrant from a hostile country entering an insular small town.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Deciding whether to stick by someone walking through a bitter, ugly season of depression or loss.',
          practicalLesson: 'True brotherhood and loyalty are proven in the mud, not at the celebration party.',
          dailyAction: 'Reach out to a friend or family member who is currently in a dark season. Let them know you aren’t going anywhere.'
        },
        wisdomQuiz: {
          question: 'What did Naomi ask the women of Bethlehem to call her when she returned home empty-handed?',
          options: [
            {
              text: 'Queen Mother.',
              isCorrect: false,
              explanation: 'She felt completely stripped of status.'
            },
            {
              text: 'Mara (meaning "Bitter"), because the Almighty had brought calamity upon her.',
              isCorrect: true,
              explanation: 'Spot on. She called herself Mara, unaware that God was already setting up her generational restoration.'
            }
          ]
        }
      },
      {
        id: 'ruth-act-2',
        actNumber: 2,
        actTitle: 'Gleaning in the Danger Fields',
        visualTheme: 'valley_battlefield',
        sceneAtmosphere: 'The barley harvest fields outside Bethlehem under the morning sun. Foreign women following behind reapers, picking up dropped stalks in the dust.',
        historicalContext: 'Gleaning was ancient Israel\'s social safety net: landowners left field corners and dropped grain for the poor, but foreign women risked harassment.',
        narrativeParagraphs: [
          'They arrived in Bethlehem penniless at the start of the barley harvest. Ruth didn’t sit around complaining about her trauma or waiting for handouts. She told Naomi: "Let me go to the fields and pick up the leftover grain behind anyone in whose eyes I find favor."',
          'As it happened, she ended up working in the field of Boaz, a wealthy, honorable relative of Naomi’s deceased husband. Gleaning was grueling, dangerous work: bent over for twelve hours in the blistering heat, exposed to rough field hands.',
          'When Boaz arrived from Bethlehem, he noticed Ruth immediately and asked his foreman: "Whose young woman is that?" The foreman replied: "She is the Moabite who came back with Naomi. She has worked steadily from morning till now, except for a short rest in the shelter."',
          'Boaz stepped straight up to Ruth: "My daughter, do not glean in another field. I have told the men not to lay a hand on you. Whenever you are thirsty, drink from the water jars my men have filled." Ruth fell on her face: "Why have I found such favor that you notice me, a foreigner?"'
        ],
        perspectivePrompt: 'You have to start at the bottom doing thankless, grueling entry-level work. How is your work ethic?',
        choices: [
          {
            id: 'choice-ruth-3',
            text: 'Do the bare minimum and complain about how unfair life has been.',
            reaction: 'Entitlement repels mentors and keeps you trapped in the dirt.',
            historicalPivot: 'Ruth worked with relentless, quiet excellence. Her reputation preceded her before Boaz even spoke to her.'
          },
          {
            id: 'choice-ruth-4',
            text: 'Work with steady diligence and dignity, letting your output speak for itself.',
            reaction: 'Magnetic character. Honorable leaders notice people who work hard without complaining.',
            historicalPivot: 'Boaz protected her, fed her roasted grain, and commanded his workers to deliberately drop extra stalks for her.'
          }
        ],
        unlockedScripture: {
          reference: 'Ruth 2:12',
          translation: 'WEB',
          text: 'May the Lord repay you for what you have done. May you be richly rewarded by the Lord, the God of Israel, under whose wings you have come to take refuge.',
          deepDive: 'Boaz prayed that God would protect Ruth under His wings—and then Boaz became the very answer to his own prayer.'
        },
        glossary: [
          {
            term: 'Gleaning Laws',
            ancientMeaning: 'Levitical welfare laws (Lev 19:9) commanding harvesters not to reap to the edges of the field so the poor could work for their food.',
            modernAnalogy: 'Scrappy entry-level hustle where you gather every scrap of experience and opportunity available.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Feeling humiliated by having to take a low-paying or entry-level role after a major setback.',
          practicalLesson: 'Never despise the day of small beginnings. Faithful work in the barley field leads to authority in the house.',
          dailyAction: 'Execute your most tedious, unglamorous task today with excellence and zero complaints.'
        },
        wisdomQuiz: {
          question: 'What special order did Boaz give his harvesters regarding Ruth?',
          options: [
            {
              text: 'To charge her for water.',
              isCorrect: false,
              explanation: 'He gave her free water.'
            },
            {
              text: 'To pull out some stalks of grain from the bundles and leave them on purpose for her to gather.',
              isCorrect: true,
              explanation: 'Yes! Generosity disguised as coincidence. Boaz made sure she was abundantly provided for.'
            }
          ]
        }
      },
      {
        id: 'ruth-act-3',
        actNumber: 3,
        actTitle: 'The Threshing Floor Redemption',
        visualTheme: 'courtyard_fire',
        sceneAtmosphere: 'The midnight threshing floor under the stars. Winnowed grain piles, a gentle night breeze, the sound of sheep bells in the distance.',
        historicalContext: 'The Kinsman-Redeemer (Go’el) was a legal relative with the obligation to buy back lost family land and marry a childless widow to preserve the family name.',
        narrativeParagraphs: [
          'Naomi knew that time was running out. She gave Ruth bold, tactical instructions: Wash, perfume yourself, put on your best cloak, and go down to the threshing floor where Boaz is winnowing barley. Wait until he falls asleep, uncover his feet, and lie down.',
          'At midnight, Boaz was startled and rolled over: "Who are you?" In the darkness, Ruth didn’t whisper sweet nothings; she spoke a direct, courageous proposal: "I am your servant Ruth. Spread the corner of your garment over me, for you are a kinsman-redeemer."',
          'In ancient Hebrew culture, spreading your cloak over a woman was a formal proposal of marriage and covenant protection. Boaz was deeply moved: "The Lord bless you, my daughter! You have not run after younger men, whether rich or poor. All the people of my town know that you are a woman of noble character."',
          'Boaz went to the city gate the next morning, legally bought back Elimelech’s ancestral property, and married Ruth. She gave birth to Obed, who fathered Jesse, who fathered King David—placing a destitute foreign widow straight into the royal lineage of Jesus Christ.'
        ],
        perspectivePrompt: 'You have done the hard work, but stepping into your full future requires bold initiative. Do you make your move?',
        choices: [
          {
            id: 'choice-ruth-5',
            text: 'Wait passively for someone else to make decisions for your life.',
            reaction: 'Passivity forfeits destiny. God honors bold, honorable initiative.',
            historicalPivot: 'Ruth had the courage to step onto the threshing floor and ask for covenant protection.'
          },
          {
            id: 'choice-ruth-6',
            text: 'Step forward with bold, honorable clarity and claim the covenant.',
            reaction: 'Audacious faith. Combining purity with bold initiative unlocks generational destiny.',
            historicalPivot: 'Boaz resolved the legal roadblocks that very morning and redeemed her family line forever.'
          }
        ],
        unlockedScripture: {
          reference: 'Ruth 3:9',
          translation: 'WEB',
          text: '"Who are you?" he asked. "I am your servant Ruth," she said. "Spread the corner of your covering over me, for you are a family redeemer."',
          deepDive: 'Ruth asked Boaz to spread his "wing" (garment) over her—the exact Hebrew word Boaz had used earlier when praying God would shelter her under His wings.'
        },
        glossary: [
          {
            term: 'Kinsman-Redeemer (Go\'el)',
            ancientMeaning: 'A close male relative empowered under Mosaic law to buy back family land from debt and protect vulnerable relatives.',
            modernAnalogy: 'A powerful sponsor or benefactor who steps in to clear your debts and secure your future.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Fear of taking the final bold step to initiate a partnership, marriage, or major career move.',
          practicalLesson: 'When God opens the door, step forward with bold, honorable clarity. Your faithfulness in the dark will be rewarded in the light.',
          dailyAction: 'Take bold, respectful initiative on an important relationship or career opportunity you have been hesitating to pursue.'
        },
        wisdomQuiz: {
          question: 'Who was the famous great-grandson of Ruth and Boaz?',
          options: [
            {
              text: 'King Saul.',
              isCorrect: false,
              explanation: 'Saul was from the tribe of Benjamin.'
            },
            {
              text: 'King David of Israel.',
              isCorrect: true,
              explanation: 'Yes! Ruth’s faithfulness produced Obed, who fathered Jesse, who fathered King David.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'joshua-journey',
    title: 'Joshua: The Jericho Breach',
    subtitle: 'Stepping into leadership after a legend dies and breaking through fortified walls',
    heroName: 'Joshua',
    characterTitle: 'The Battlefield Commander',
    testament: 'Old Testament',
    historicalPeriod: 'c. 1400 BC — Plains of Jericho, Canaan',
    estimatedMinutes: 8,
    themeColor: 'from-amber-600 to-stone-900',
    badgeName: 'Wall Breacher',
    starterTrack: 'Underdog & Courage',
    relicReward: {
      id: 'joshua-trumpet',
      name: 'The Jericho Shofar',
      iconName: 'trumpet',
      description: 'The curved ram\'s horn blasted on the seventh lap around the fortress of Jericho.',
      lesson: 'Audacious obedience to God’s battle plan will shatter obstacles that no human battering ram could ever breach.'
    },
    summary: 'A masterclass in stepping out of a mentor’s shadow, managing high-stakes military logistics, and executing counter-intuitive breakthroughs.',
    acts: [
      {
        id: 'joshua-act-1',
        actNumber: 1,
        actTitle: 'The Red Cord in the Wall',
        visualTheme: 'valley_battlefield',
        sceneAtmosphere: 'The high mud-brick ramparts of Jericho. Two undercover scouts slipping through the gates into the rooftop of an inn on the city wall.',
        historicalContext: 'Jericho was a double-walled fortress guarding the gateway to Canaan, with internal food and water supplies capable of withstanding years of siege.',
        narrativeParagraphs: [
          'Moses, the towering founding father of Israel, was dead. Joshua had spent forty years in his shadow as his military aide. Now God spoke to him: "Moses my servant is dead. Now then, you and all these people, get ready to cross the Jordan River into the land I am giving you."',
          'Joshua knew the first target: Jericho, the impenetrable gateway fortress. He dispatched two elite reconnaissance scouts in secret. They entered the home of Rahab, an innkeeper built directly into the exterior stone rampart.',
          'When the King of Jericho’s secret police raided the house, Rahab hid the spies under stalks of flax drying on her flat roof. She told the king’s officers they had already fled. Why would a Canaanite risk her life for foreign spies?',
          'Rahab whispered to the trembling scouts: "I know that the Lord has given you this land. A dread of you has fallen on us; everyone’s heart has melted because of what your God did at the Red Sea." She secured a sworn oath: in exchange for saving their lives, her household would be spared by tying a scarlet cord in her window.'
        ],
        perspectivePrompt: 'You step into leadership after a legendary predecessor. How do you handle the intimidation of the first massive obstacle?',
        choices: [
          {
            id: 'choice-josh-1',
            text: 'Try to imitate your predecessor\'s personality and style.',
            reaction: 'You can\'t lead in someone else\'s armor. Imitating a legend guarantees you look like a cheap copy.',
            historicalPivot: 'Joshua didn’t try to be Moses. He operated with his authentic strengths: tactical reconnaissance and direct military discipline.'
          },
          {
            id: 'choice-josh-2',
            text: 'Own your own assignment, gather ground intel, and move with bold conviction.',
            reaction: 'The mark of a true commander. You honor the past while executing the new day’s objective.',
            historicalPivot: 'Joshua’s scouts brought back intelligence that the enemy was already morally broken and terrified.'
          }
        ],
        unlockedScripture: {
          reference: 'Joshua 2:18',
          translation: 'WEB',
          text: 'Unless, when we enter the land, you tie this scarlet cord in the window through which you let us down, and gather your father and mother, your brothers, and all your family into your house.',
          deepDive: 'The scarlet cord hanging from the wall is a stunning foretaste of the blood of Christ: an outsider saved by placing her faith behind a scarlet boundary of grace.'
        },
        glossary: [
          {
            term: 'Double Walls of Jericho',
            ancientMeaning: 'Massive stone retaining walls with a lower 15-foot wall and an upper brick wall standing over 30 feet tall.',
            modernAnalogy: 'A heavily fortified, seemingly impenetrable corporate monopoly or institutional stronghold.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Stepping into a leadership role after a charismatic predecessor and facing an intimidating first objective.',
          practicalLesson: 'Never let the shadow of a mentor paralyze you. God’s promise to your mentor was never about them—it was about God. That same God is with you.',
          dailyAction: 'Stop comparing yourself to people who came before you. Focus entirely on executing today’s mission.'
        },
        wisdomQuiz: {
          question: 'What did Rahab hang in her window so the Israelite army would spare her household?',
          options: [
            {
              text: 'A white surrender flag.',
              isCorrect: false,
              explanation: 'She hung a specific colored cord.'
            },
            {
              text: 'A scarlet cord.',
              isCorrect: true,
              explanation: 'Yes! The scarlet cord was her covenant signal of protection amidst total destruction.'
            }
          ]
        }
      },
      {
        id: 'joshua-act-2',
        actNumber: 2,
        actTitle: 'The Unseen Commander',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'The scrub plains outside Jericho at dusk. A mysterious warrior standing with a drawn sword glinting in the twilight.',
        historicalContext: 'Before launching the assault on Jericho, Joshua went out alone to reconnoiter the fortress and encountered a divine theophany.',
        narrativeParagraphs: [
          'The Jordan River had miraculously dried up as the priests carried the Ark into the floodwaters. Israel was now camped on enemy soil. The siege was imminent.',
          'Joshua walked out near Jericho alone at dusk, studying the stone ramparts. Suddenly, he looked up and saw a man standing in front of him with a drawn sword in his hand.',
          'Joshua marched straight up to him with soldier instincts: "Are you for us or for our enemies?"',
          'The warrior’s reply shattered Joshua’s paradigm: "Neither," he said, "but as commander of the army of the Lord I have now come." Joshua fell face down to the ground in reverence: "What message does my Lord have for his servant?" The Commander replied: "Take off your sandals, for the place where you are standing is holy."'
        ],
        perspectivePrompt: 'When entering a major conflict or business battle, do you assume God is your personal mascot, or do you submit to His agenda?',
        choices: [
          {
            id: 'choice-josh-3',
            text: 'Assume God exists to bless whatever strategy you came up with.',
            reaction: 'The dangerous trap of religious pride. God is not your hired consultant.',
            historicalPivot: 'The Commander said "Neither!" God does not take sides in our petty agendas; He calls us to join His side.'
          },
          {
            id: 'choice-josh-4',
            text: 'Fall on your face, drop your sandals, and surrender your strategy to the True Commander.',
            reaction: 'Supreme humility. When you kneel before God, you can stand before any fortress.',
            historicalPivot: 'Joshua surrendered his military ego and received a supernatural, counter-intuitive battle plan.'
          }
        ],
        unlockedScripture: {
          reference: 'Joshua 5:14',
          translation: 'WEB',
          text: '"Neither," he replied, "but as commander of the army of the Lord I have now come." Then Joshua fell facedown to the ground in reverence, and asked him, "What does my Lord say to his servant?"',
          deepDive: 'Stop praying for God to bless your clever ideas. Pray for the humility to align with His master blueprint.'
        },
        glossary: [
          {
            term: 'Commander of the Lord\'s Army',
            ancientMeaning: 'A pre-incarnate appearance of Jesus Christ (theophany) leading the invisible angelic legions of heaven.',
            modernAnalogy: 'Realizing that the CEO of the universe is already on the field managing the battle.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Treating God like a lucky charm to rubber-stamp your personal plans instead of seeking His orders.',
          practicalLesson: 'The question is never: "Is God on my side?" The question is: "Am I on God’s side?"',
          dailyAction: 'Drop your agenda before starting work today. Ask: "Commander, what are your orders for me today?"'
        },
        wisdomQuiz: {
          question: 'What did the Commander of the Lord\'s Army tell Joshua to do with his footwear?',
          options: [
            {
              text: 'Strap on his combat boots for war.',
              isCorrect: false,
              explanation: 'He was told to take them off.'
            },
            {
              text: 'Take off his sandals, because the ground where he was standing was holy.',
              isCorrect: true,
              explanation: 'Exact echo of Moses at the burning bush! Holiness precedes battlefield victory.'
            }
          ]
        }
      },
      {
        id: 'joshua-act-3',
        actNumber: 3,
        actTitle: 'The Seventh Lap at Jericho',
        visualTheme: 'valley_battlefield',
        sceneAtmosphere: 'The seventh day at dawn. Hundreds of thousands of soldiers marching around Jericho in eerie, dead silence, accompanied only by the droning blast of ram’s horns.',
        historicalContext: 'Ancient sieges took months of starvation and battering rams. God ordered a psychological and spiritual procession that looked insane to military tacticians.',
        narrativeParagraphs: [
          'The battle plan was unlike anything taught in military academies: March around the city once a day for six days with the Ark of the Covenant and seven priests blowing ram\'s horns. The soldiers were under strict orders: Not a single word, not a whisper from your lips until the day Joshua commands you to shout.',
          'For six straight days, the fortress guards looked down from the battlements in confusion. Thousands of armed soldiers marching in dead silence around their walls, blowing horns, and walking back to camp.',
          'On the seventh day, they got up at daybreak and marched around the city seven times. On the seventh lap, the priests blew a long, sustained blast on the trumpets. Joshua shouted: "Shout! For the Lord has given you the city!"',
          'A roar from hundreds of thousands of voices ripped through the valley. The ground convulsed. The massive stone walls collapsed flat outward into the ditch, and the army charged straight ahead, breaching the fortress in a single hour.'
        ],
        perspectivePrompt: 'God gives you a strategy that makes zero sense to the world\'s experts. Do you have the guts to obey repeatedly?',
        choices: [
          {
            id: 'choice-josh-5',
            text: 'Stop after day 3 because you see zero physical cracks in the wall.',
            reaction: 'Impatience aborts breakthroughs. Most people quit on lap 5 right before the wall falls.',
            historicalPivot: 'The walls didn\'t crack on day 1, 2, or 6. Complete obedience required completing all seven laps.'
          },
          {
            id: 'choice-josh-6',
            text: 'Keep marching in silent discipline until the seventh lap, then shout with complete faith.',
            reaction: 'Relentless persistence. When your obedience is complete, the breakthrough is supernatural.',
            historicalPivot: 'The walls collapsed outward, creating natural ramps for the soldiers to storm the city.'
          }
        ],
        unlockedScripture: {
          reference: 'Joshua 6:20',
          translation: 'WEB',
          text: 'So the people shouted, and the trumpets were blown. As soon as the people heard the sound of the trumpet, the people shouted a great shout, and the wall fell down flat.',
          deepDive: 'The shout came BEFORE the wall fell. Faith shouts while the stone is still standing, confident that God’s word is already accomplished.'
        },
        glossary: [
          {
            term: 'Fell Down Flat',
            ancientMeaning: 'Archaeological evidence at Tel es-Sultan confirms Jericho\'s mud-brick walls collapsed outward, forming a ramp up into the city.',
            modernAnalogy: 'An impossible obstacle suddenly collapsing and becoming the very ramp that elevates you.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Quitting on a habit, marriage, or project because you have worked for weeks and see no visible results.',
          practicalLesson: 'You are on lap 4 or lap 5. The wall doesn\'t crack gradually; it falls suddenly after complete obedience.',
          dailyAction: 'Keep marching. Do your daily discipline today even if you see zero external evidence yet.'
        },
        wisdomQuiz: {
          question: 'How many times did the army march around Jericho on the seventh day?',
          options: [
            {
              text: 'Once.',
              isCorrect: false,
              explanation: 'Once was for the first six days.'
            },
            {
              text: 'Seven times.',
              isCorrect: true,
              explanation: 'Yes! Seven laps on the seventh day, followed by the blast and the shout.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'john-baptist-journey',
    title: 'John the Baptist: Voice in the Wild',
    subtitle: 'An uncompromising desert rebel who dismantled religious hypocrisy and mastered radical humility',
    heroName: 'John the Baptist',
    characterTitle: 'The Frontier Herald',
    testament: 'New Testament',
    historicalPeriod: 'c. 26–29 AD — Judean Wilderness & Jordan River',
    estimatedMinutes: 7,
    themeColor: 'from-amber-800 to-stone-900',
    badgeName: 'Wild Voice',
    starterTrack: 'Burnout & Pressure',
    relicReward: {
      id: 'john-belt',
      name: 'The Leather Belt & Locust Honey',
      iconName: 'belt',
      description: 'The rugged camel hair garment and leather belt worn on the banks of the Jordan.',
      lesson: 'True authority comes from radical humility: "He must increase, but I must decrease."'
    },
    summary: 'A fierce look at what happens when a leader operates with zero career ambition, zero hunger for approval, and total dedication to truth.',
    acts: [
      {
        id: 'john-act-1',
        actNumber: 1,
        actTitle: 'The Jordan River Revolution',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'The muddy brown waters of the Jordan River in the scorching Judean desert. Crowds pouring out from Jerusalem standing shoulder to shoulder in the dust.',
        historicalContext: 'After 400 years of prophetic silence, an unkempt prophet dressed in camel skin appeared shouting repentance, shaking both corrupt priests and Roman soldiers.',
        narrativeParagraphs: [
          'John didn’t set up shop in the royal palace or the temple courtyard. He operated out in the barren, limestone canyon of the Jordan wilderness. His diet was wild locusts and honey; his wardrobe was raw camel’s hair bound by a leather belt.',
          'Yet the entire city of Jerusalem and all Judea emptied out to hear him. Why? Because the world was starving for unvarnished truth. The religious establishment was full of polished hypocrisy and comfortable politics; John spoke with raw spiritual voltage.',
          'When powerful Pharisees and Sadducees walked down to the water expecting VIP treatment, John didn’t flatter them: "You brood of vipers! Who warned you to flee from the coming wrath? Produce fruit in keeping with repentance!"',
          'He looked at soldiers: "Don’t extort money." He looked at tax collectors: "Don’t collect more than required." He looked at crowds: "If you have two shirts, give one to the man who has none." He cut through religious pretension with boots-on-the-ground moral clarity.'
        ],
        perspectivePrompt: 'You have a platform to speak. Do you flatter powerful people to climb the ladder, or do you speak unvarnished truth?',
        choices: [
          {
            id: 'choice-john-1',
            text: 'Soften your message and tell influential people what they want to hear.',
            reaction: 'The careerist trap. You get invites to fancy dinners, but you lose your spiritual authority.',
            historicalPivot: 'John had zero appetite for praise. He feared God so deeply that he feared no human face.'
          },
          {
            id: 'choice-john-2',
            text: 'Speak truth with courage, refusing to water down reality for comfortable hypocrites.',
            reaction: 'Revolutionary authority. Authenticity cuts through noise like a double-edged sword.',
            historicalPivot: 'Crowds flocked to John because they knew he could not be bought or intimidated.'
          }
        ],
        unlockedScripture: {
          reference: 'Matthew 3:3',
          translation: 'WEB',
          text: 'He is a voice of one calling in the wilderness: "Prepare the way for the Lord; make his paths straight!"',
          deepDive: 'Notice John called himself just "a voice." Not a celebrity, not a brand. When your identity is centered on the message rather than your image, you become fearless.'
        },
        glossary: [
          {
            term: 'Camel Hair & Leather Belt',
            ancientMeaning: 'The iconic uniform of the ancient prophet Elijah (2 Kings 1:8), signifying rejection of luxury and identification with the poor.',
            modernAnalogy: 'Living simply and refusing status symbols so your message has zero conflict of interest.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Worrying too much about what influential people or social media think of your convictions.',
          practicalLesson: 'The fear of man is a snare. When you live solely for God’s approval, you become impossible to intimidate or manipulate.',
          dailyAction: 'Say what is true and right today in a difficult situation without softening it out of cowardice.'
        },
        wisdomQuiz: {
          question: 'What did John the Baptist call the religious elites who came to watch his baptisms without intending to change their lives?',
          options: [
            {
              text: 'Esteemed teachers of Israel.',
              isCorrect: false,
              explanation: 'He had zero flattery for hypocrites.'
            },
            {
              text: 'A "brood of vipers" needing to produce real fruit.',
              isCorrect: true,
              explanation: 'Yes! He exposed their toxic poison and demanded genuine behavioral change over religious titles.'
            }
          ]
        }
      },
      {
        id: 'john-act-2',
        actNumber: 2,
        actTitle: '"He Must Increase, I Must Decrease"',
        visualTheme: 'desert_canyon',
        sceneAtmosphere: 'The banks of Aenon near Salim. John’s disciples whispering anxiously as crowds begin leaving John’s camp to follow Jesus across the river.',
        historicalContext: 'John was at the zenith of national fame when Jesus began His public ministry; disciples of both leaders started feeling territorial jealousy.',
        narrativeParagraphs: [
          'John’s disciples were alarmed. They ran to him: "Rabbi, that man who was with you on the other side of the Jordan—the one you testified about—look, he is baptizing, and everyone is going to him!"',
          'In modern corporate culture, this is when founders launch PR campaigns to protect their market share. You worked forty years in the desert, and a younger leader is taking your crowds.',
          'John smiled. He looked at his insecure followers and said: "A person can receive only what is given them from heaven. You yourselves can testify that I said, \'I am not the Messiah but am sent ahead of him.\' The bride belongs to the bridegroom. The friend who attends the bridegroom waits and listens for him, and is full of joy when he hears the bridegroom\'s voice. That joy is mine, and it is now complete."',
          'Then he dropped the ultimate anchor of egoless leadership: "He must become greater; I must become less." He celebrated passing the baton with zero resentment.'
        ],
        perspectivePrompt: 'A colleague, junior teammate, or competitor is promoted past you or gets the spotlight you worked for. How do you respond?',
        choices: [
          {
            id: 'choice-john-3',
            text: 'Feel bitter, undercut their reputation, and hoard your influence.',
            reaction: 'The ego disease. Jealousy poisons your own well-being and reveals you were working for your own glory all along.',
            historicalPivot: 'John knew his entire life was designed to point to Jesus. True success is knowing your role and finishing it with joy.'
          },
          {
            id: 'choice-john-4',
            text: 'Rejoice in their rise, cheer their success, and embrace your role with contentment.',
            reaction: 'The rarest form of greatness on earth: joyful, secure humility.',
            historicalPivot: 'Jesus called John the Baptist the greatest man born of women precisely because of his radical humility.'
          }
        ],
        unlockedScripture: {
          reference: 'John 3:30',
          translation: 'WEB',
          text: 'He must increase, but I must decrease.',
          deepDive: 'The six most liberating words in human history. When your life is about elevating Christ rather than promoting yourself, insecurity vanishes.'
        },
        glossary: [
          {
            term: 'Friend of the Bridegroom',
            ancientMeaning: 'The best man responsible for arranging the wedding details; his greatest joy was seeing the bride safely united with the groom.',
            modernAnalogy: 'A servant leader who thrives seeing their team succeed without needing to take the spotlight.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Overcoming petty jealousy when someone else gets the credit, promotion, or spotlight.',
          practicalLesson: 'Your worth is not tied to your audience size or title. When you are secure in your calling, someone else’s rise doesn’t threaten you.',
          dailyAction: 'Celebrate a teammate’s win publicly today. Give them 100% of the credit.'
        },
        wisdomQuiz: {
          question: 'What did Jesus say about John the Baptist after John was imprisoned?',
          options: [
            {
              text: 'That John was too extreme and should have stayed quiet.',
              isCorrect: false,
              explanation: 'Jesus deeply honored John.'
            },
            {
              text: 'Truly I tell you, among those born of women there has not risen anyone greater than John the Baptist.',
              isCorrect: true,
              explanation: 'The highest compliment ever recorded in human history, given by God Himself to the man who was content to be nothing.'
            }
          ]
        }
      },
      {
        id: 'john-act-3',
        actNumber: 3,
        actTitle: 'The Machaerus Fortress Stand',
        visualTheme: 'prison_cell',
        sceneAtmosphere: 'The subterranean dungeon of the clifftop fortress of Machaerus overlooking the Dead Sea. Torchlight flickering on damp basalt walls.',
        historicalContext: 'King Herod Antipas had unlawfully divorced his wife to marry Herodias, his brother Philip’s wife; John publicly confronted the royal scandal.',
        narrativeParagraphs: [
          'King Herod Antipas was a brutal client-tyrant backed by Rome. Everyone in the kingdom looked the other way when he seized his brother’s wife Herodias. Everyone except John the Baptist.',
          'John looked the ruler of Galilee in the eye and said: "It is not lawful for you to have your brother\'s wife." Herod had John arrested and chained in the remote clifftop fortress of Machaerus.',
          'Herod was terrified of John, knowing he was a righteous and holy man, and liked to listen to him even though his words disturbed his conscience. But Herodias waited for her chance. At Herod’s drunken birthday banquet, her daughter danced, and Herod foolishly swore to give her whatever she asked.',
          'Prompted by her mother, she demanded: "The head of John the Baptist on a platter." Grieving but trapped by his pride in front of his dinner guests, Herod sent the executioner into the dungeon. John gave his neck without flinching, sealing his fearless testimony with his blood.'
        ],
        perspectivePrompt: 'Doing the right thing and speaking truth costs you your safety, comfort, or position. Do you stay faithful to the end?',
        choices: [
          {
            id: 'choice-john-5',
            text: 'Apologize to the corrupt leader and retract your words to save your skin.',
            reaction: 'You save your physical comfort for a few years, but you forfeit your eternal crown.',
            historicalPivot: 'John never backtracked. He knew that physical death is nothing compared to compromising truth.'
          },
          {
            id: 'choice-john-6',
            text: 'Stand firm in the truth, knowing your life is in God’s hands and not a tyrant\'s platter.',
            reaction: 'Unshakeable eternity. Tyrants die and turn to dust; the righteous shine like stars forever.',
            historicalPivot: 'John finished his race having never compromised once. His legacy ignited the gospel revolution.'
          }
        ],
        unlockedScripture: {
          reference: 'Mark 6:18',
          translation: 'WEB',
          text: 'For John had been saying to Herod, "It is not lawful for you to have your brother\'s wife."',
          deepDive: 'Truth does not bend for royal titles, billionaire status, or corporate executives. John held rulers to the exact same moral standard as peasants.'
        },
        glossary: [
          {
            term: 'Fortress of Machaerus',
            ancientMeaning: 'A desolate hilltop palace-prison built by Herod the Great on a high cliff east of the Dead Sea in modern-day Jordan.',
            modernAnalogy: 'A high-security black-site prison where political dissenters are silenced.'
          }
        ],
        realTalkTakeaway: {
          coreChallenge: 'Facing severe backlash or cancellation for refusing to endorse a corrupt practice.',
          practicalLesson: 'Finish strong. What matters at the end of life is not how many applause lines you gathered, but whether you were faithful to the truth.',
          dailyAction: 'Refuse to compromise your principles today, even if it makes you unpopular in the room.'
        },
        wisdomQuiz: {
          question: 'Why did King Herod Antipas protect John the Baptist in prison for so long before his drunken banquet?',
          options: [
            {
              text: 'He was hoping John would teach him magic tricks.',
              isCorrect: false,
              explanation: 'Herod was troubled by John\'s holiness.'
            },
            {
              text: 'He feared John, knowing that he was a righteous and holy man, and was fascinated by his words.',
              isCorrect: true,
              explanation: 'Exactly right! Even corrupt worldly rulers are secretly mesmerized by genuine, uncorrupt holiness.'
            }
          ]
        }
      }
    ]
  }
];
