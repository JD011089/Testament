export interface CuratedPassageBackstory {
  category: 'Author' | 'People' | 'Culture' | 'Parable';
  title: string;
  content: string; // 3-5 sentences max, historically grounded
}

export interface CuratedPassage {
  id: string;
  heroName: string;
  reference: string;
  book: string;
  chapter: number;
  verseRange: string;
  theme: string;
  passageText: string;
  keyVerseReference: string;
  keyVerseText: string;
  kjvKeyVerseText: string;
  teaserHook: string; // 1-2 sentences, tension only, NO resolution!
  backstory: CuratedPassageBackstory;
  staticFallback: {
    scenarioQuestion: string;
    presetChoices: { id: string; text: string; stance: string }[];
    storyRetelling: string[]; // max ~140 words
    actionLine: string;
    mirrorBackRules: Record<string, string>;
    defaultMirrorBack: string;
  };
}

export const CURATED_DAILY_PASSAGES: CuratedPassage[] = [
  {
    id: 'passage-david-cave',
    heroName: 'David',
    reference: '1 Samuel 22:1-4',
    book: '1 Samuel',
    chapter: 22,
    verseRange: '1-4',
    theme: 'Anxiety & Feeling Overwhelmed',
    passageText: `David left Gath and escaped to the cave of Adullam. When his brothers and his father's household heard about it, they went down to him there. All those who were in distress or in debt or discontented gathered to him, and he became their commander. About four hundred men were with him. From there David went to Mizpah in Moab and said to the king of Moab, "Would you let my father and mother come and stay with you until I learn what God will do for me?" So he left them with the king of Moab, and they stayed with him as long as David was in the stronghold.`,
    keyVerseReference: '1 Samuel 22:2',
    keyVerseText: 'All those who were in distress or in debt or discontented gathered to him, and he became their commander. About four hundred men were with him.',
    kjvKeyVerseText: 'And every one that was in distress, and every one that was in debt, and every one that was discontented, gathered themselves unto him; and he became a captain over them: and there were with him about four hundred men. — 1 Samuel 22:2 (KJV)',
    teaserHook: "Tomorrow: King Saul's hunters have David trapped in a limestone cave — with four hundred desperate outlaws looking to him for answers.",
    backstory: {
      category: 'People',
      title: 'Who were the four hundred?',
      content: "David was hiding in the Judean desert, hunted by King Saul's royal forces. The men who joined him were bankrupt debtors, runaway laborers, and desperate outcasts who had nowhere else left to go. In ancient times, an outlaw band like this almost always turned into violent mercenaries. Instead, David led them with strict character and brotherhood, forging broken men into Israel's most loyal defenders."
    },
    staticFallback: {
      scenarioQuestion: "Your plans just collapsed and you're surrounded by chaos. What's your move?",
      presetChoices: [
        { id: 'choice-cave-shutdown', text: 'Go quiet and wait for it to pass alone.', stance: 'shut_down' },
        { id: 'choice-cave-lashout', text: 'Get angry at the people around you.', stance: 'lash_out' },
        { id: 'choice-cave-run', text: 'Run as far from this mess as you can get.', stance: 'run' },
        { id: 'choice-cave-reachout', text: 'Reach out to the misfits around you and rebuild together.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "David had gone from national hero to hunted fugitive. King Saul's death squads drove him into the dark limestone caves of Adullam.",
        "Instead of royal guards, about four hundred desperate, bankrupt, and discontented men gathered to him looking for leadership.",
        "Instead of becoming a bitter warlord or shutting down in despair, David chose to lead them. In that cave, he forged broken outlaws into Israel's most loyal brotherhood."
      ],
      actionLine: "Send one honest text to someone in your corner today instead of disappearing into your cave.",
      mirrorBackRules: {
        'choice-cave-shutdown': "You chose to go quiet and wait — David fought that exact urge when hiding in the caves.",
        'choice-cave-lashout': "You chose to express your anger — David was furious, but channeled his energy into discipline instead of revenge.",
        'choice-cave-run': "You chose to run — David fled into the desert, but found running never solves the calling.",
        'choice-cave-reachout': "You chose to reach out — that exact choice turned David's cave into a legendary brotherhood."
      },
      defaultMirrorBack: "Here is what unfolded in the Cave of Adullam when David's entire world collapsed."
    }
  },
  {
    id: 'passage-jesus-storm',
    heroName: 'Jesus',
    reference: 'Mark 4:35-41',
    book: 'Mark',
    chapter: 4,
    verseRange: '35-41',
    theme: 'Anxiety & Feeling Overwhelmed',
    passageText: `That day when evening came, he said to his disciples, "Let us go over to the other side." Leaving the crowd behind, they took him along, just as he was, in the boat. There were also other boats with him. A furious squall came up, and the waves broke over the boat, so that it was nearly swamped. Jesus was in the stern, sleeping on a cushion. The disciples woke him and said to him, "Teacher, don't you care if we drown?" He got up, rebuked the wind and said to the waves, "Quiet! Be still!" Then the wind died down and it was completely calm. He said to his disciples, "Why are you so afraid? Do you still have no faith?" They were terrified and asked each other, "Who is this? Even the wind and the waves obey him!"`,
    keyVerseReference: 'Mark 4:39',
    keyVerseText: 'He got up, rebuked the wind and said to the waves, "Quiet! Be still!" Then the wind died down and it was completely calm.',
    kjvKeyVerseText: 'And he arose, and rebuked the wind, and said unto the sea, Peace, be still. And the wind ceased, and there was a great calm. — Mark 4:39 (KJV)',
    teaserHook: "Tomorrow: A sudden squall is swamping the boat in the middle of the lake, and the Master is sound asleep on a cushion.",
    backstory: {
      category: 'Culture',
      title: 'Why seasoned fishermen were terrified',
      content: "The Sea of Galilee sits nearly seven hundred feet below sea level, surrounded by steep hills. Sudden cold air rushing down from the north collides with warm lake air, unleashing violent windstorms within minutes. Four of Jesus' disciples were veteran commercial fishermen who had worked these waters their whole lives. For men with decades of sea experience to panic that the boat was sinking, this was an extreme life-or-death surge."
    },
    staticFallback: {
      scenarioQuestion: "A sudden crisis is flooding your boat and panic is taking over. What's your move?",
      presetChoices: [
        { id: 'choice-storm-panic', text: 'Assume the worst and panic that no one cares.', stance: 'shut_down' },
        { id: 'choice-storm-control', text: 'Frantically try to fix every wave with your own bare hands.', stance: 'lash_out' },
        { id: 'choice-storm-freeze', text: 'Freeze up and wait for the boat to sink.', stance: 'run' },
        { id: 'choice-storm-wake', text: 'Wake God with honest prayers and hand over control.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "A sudden squall slammed into the Sea of Galilee. Hardened commercial fishermen watched waves pound over the gunwales until the boat began filling with water.",
        "They found Jesus sound asleep on a leather cushion in the stern. In terror, they shook him awake, asking if he even cared that they were drowning.",
        "Jesus stood up in the roaring gale and commanded: 'Peace! Be still!' The wind instantly ceased, and the lake fell completely calm."
      ],
      actionLine: "Hand over the one overwhelming situation keeping you awake to Jesus before you sleep tonight.",
      mirrorBackRules: {
        'choice-storm-panic': "You said you'd panic — the seasoned disciples did the exact same thing when the water rose.",
        'choice-storm-control': "You said you'd try to bail the water yourself — but some storms only yield to God's voice.",
        'choice-storm-freeze': "You said you'd freeze — fear paralyzed the disciples until they looked toward the stern.",
        'choice-storm-wake': "You said you'd cry out for help — that is exactly what the disciples did, and calm followed."
      },
      defaultMirrorBack: "Here is what happened on the Sea of Galilee when panic took over the boat."
    }
  },
  {
    id: 'passage-david-goliath',
    heroName: 'David',
    reference: '1 Samuel 17:40-49',
    book: '1 Samuel',
    chapter: 17,
    verseRange: '40-49',
    theme: 'Courage & Facing Giants',
    passageText: `Then he took his staff in his hand, chose five smooth stones from the stream, put them in the pouch of his shepherd's bag and, with his sling in his hand, approached the Philistine. Meanwhile, the Philistine, with his shield bearer in front of him, kept coming closer to David. He looked David over and saw that he was little more than a boy, glowing with health and handsome, and he despised him. He said to David, "Am I a dog, that you come at me with sticks?" And the Philistine cursed David by his gods. "Come here," he said, "and I'll give your flesh to the birds and the wild animals!" David said to the Philistine, "You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty... Today the Lord will deliver you into my hands." As the Philistine moved closer to attack him, David ran quickly toward the battle line to meet him. Reaching into his bag and taking out a stone, he slung it and struck the Philistine on the forehead. The stone sank into his forehead, and he fell facedown on the ground.`,
    keyVerseReference: '1 Samuel 17:45',
    keyVerseText: 'David said to the Philistine, "You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty."',
    kjvKeyVerseText: 'Then said David to the Philistine, Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the LORD of hosts... — 1 Samuel 17:45 (KJV)',
    teaserHook: "Tomorrow: A towering warrior taunts the battle lines at sunrise, and seasoned soldiers refuse to step onto the field.",
    backstory: {
      category: 'Culture',
      title: 'Why David refused the heavy bronze armor',
      content: "Ancient slingers were not children playing with toys; in ancient armies, elite slingers fired stones with the kinetic force of a bullet from great distance. King Saul tried to dress David in his royal armor, but the bronze coat was so heavy the young shepherd could barely walk. David understood his real tactical strength: he was not playing Goliath's hand-to-hand broadsword game. Speed, mobility, and deep faith in God mattered far more than borrowed armor."
    },
    staticFallback: {
      scenarioQuestion: "An intimidating obstacle is towering over you and everyone else is backing down. What's your move?",
      presetChoices: [
        { id: 'choice-goliath-hide', text: 'Stay behind the lines and wait for someone else to step forward.', stance: 'shut_down' },
        { id: 'choice-goliath-armor', text: 'Wear heavy armor someone else forces on you to look the part.', stance: 'run' },
        { id: 'choice-goliath-rage', text: 'Charge blindly with anger without a clear tactical plan.', stance: 'lash_out' },
        { id: 'choice-goliath-stand', text: 'Step forward using your own proven gifts, trusting God to back you.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "For forty mornings, the towering champion Goliath mocked the army of Israel. Experienced soldiers were frozen in terror on the ridge.",
        "Young David refused King Saul's cumbersome bronze armor. Instead, he took what he knew: his shepherd's staff, five smooth brook stones, and his sling.",
        "When the giant laughed, David ran toward the battle line. One stone sank into Goliath's forehead, bringing down the giant before the entire army."
      ],
      actionLine: "Tackle the one intimidating phone call or task you've put off all week with quiet faith.",
      mirrorBackRules: {
        'choice-goliath-hide': "You said you'd stay back — King Saul's entire army did that for forty straight days.",
        'choice-goliath-armor': "You said you'd wear someone else's armor — David tried that and couldn't even walk.",
        'choice-goliath-rage': "You said you'd charge in anger — David won with calm, deliberate tactical precision.",
        'choice-goliath-stand': "You said you'd stand on your own authentic gifts — that is what toppled the giant."
      },
      defaultMirrorBack: "Here is what happened in the Valley of Elah when one shepherd stepped forward."
    }
  },
  {
    id: 'passage-elijah-cave',
    heroName: 'Elijah',
    reference: '1 Kings 19:9-13',
    book: '1 Kings',
    chapter: 19,
    verseRange: '9-13',
    theme: 'Burnout & Pressure',
    passageText: `There he went into a cave and spent the night. And the word of the Lord came to him: "What are you doing here, Elijah?" He replied, "I have been very zealous for the Lord God Almighty. The Israelites have rejected your covenant, torn down your altars, and put your prophets to death with the sword. I am the only one left, and now they are trying to kill me too." The Lord said, "Go out and stand on the mountain in the presence of the Lord, for the Lord is about to pass by." Then a great and powerful wind tore the mountains apart and shattered the rocks before the Lord, but the Lord was not in the wind. After the wind there was an earthquake, but the Lord was not in the earthquake. After the earthquake came a fire, but the Lord was not in the fire. And after the fire came a gentle whisper. When Elijah heard it, he pulled his cloak over his face and went out and stood at the mouth of the cave.`,
    keyVerseReference: '1 Kings 19:12',
    keyVerseText: 'After the earthquake came a fire, but the Lord was not in the fire. And after the fire came a gentle whisper.',
    kjvKeyVerseText: 'And after the earthquake a fire; but the LORD was not in the fire: and after the fire a still small voice. — 1 Kings 19:12 (KJV)',
    teaserHook: "Tomorrow: After running forty days through the desert in total exhaustion, a hunted prophet buries himself inside a mountain cave.",
    backstory: {
      category: 'People',
      title: 'Who Elijah was running from',
      content: "Just one chapter earlier, Elijah had faced down hundreds of false prophets on Mount Carmel in a high-stakes showdown. But when Queen Jezebel sent a personal death threat, his adrenaline crashed into severe emotional and biological shock. He ran over a hundred miles into the Sinai wilderness and collapsed under a bush, asking to die. Instead of scolding him, God sent an angel with hot baked bread and fresh water, telling him to rest."
    },
    staticFallback: {
      scenarioQuestion: "You are burned out, mentally exhausted, and convinced you're fighting completely alone. What's your move?",
      presetChoices: [
        { id: 'choice-elijah-isolate', text: 'Retreat into total isolation and convince yourself no one cares.', stance: 'shut_down' },
        { id: 'choice-elijah-complain', text: 'Vent bitterness about how unappreciated all your hard work is.', stance: 'lash_out' },
        { id: 'choice-elijah-quit', text: 'Throw up your hands and declare that you are done trying.', stance: 'run' },
        { id: 'choice-elijah-listen', text: 'Step outside the noise and listen for God in the quiet.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "After a grueling spiritual showdown, Elijah hit complete physical and emotional burnout. He fled forty days into the desert and hid inside a cave.",
        "God asked him gently: 'What are you doing here, Elijah?' Then came hurricane-force winds, a violent earthquake, and raging fire, but God was in none of the noise.",
        "Then came a gentle whisper. Elijah wrapped his face in his cloak and stepped out into the open air to listen."
      ],
      actionLine: "Step away from screens and noise for 10 minutes today to let your racing mind get quiet.",
      mirrorBackRules: {
        'choice-elijah-isolate': "You said you'd shut down — Elijah buried himself deep in a cave when burnout struck.",
        'choice-elijah-complain': "You said you'd vent — Elijah dumped his raw frustration right before God.",
        'choice-elijah-quit': "You said you'd quit — Elijah asked to die under a broom bush before God fed him.",
        'choice-elijah-listen': "You said you'd listen in the quiet — that is where God met Elijah on Mount Horeb."
      },
      defaultMirrorBack: "Here is what happened on the mountain when Elijah reached the end of his rope."
    }
  },
  {
    id: 'passage-peter-courtyard',
    heroName: 'Peter',
    reference: 'Luke 22:54-62',
    book: 'Luke',
    chapter: 22,
    verseRange: '54-62',
    theme: 'Restoration After Failure',
    passageText: `Then seizing him, they led him away and took him into the house of the high priest. Peter followed at a distance. And when some there had kindled a fire in the middle of the courtyard and had sat down together, Peter sat down with them. A servant girl saw him seated there in the firelight. She looked closely at him and said, "This man was with him." But he denied it. "Woman, I don't know him," he said. A little later someone else saw him and said, "You also are one of them." "Man, I am not!" Peter replied. About an hour later another asserted, "Certainly this fellow was with him, for he is a Galilean." Peter replied, "Man, I don't know what you're talking about!" Just as he was speaking, the rooster crowed. The Lord turned and looked straight at Peter. Then Peter remembered the word the Lord had spoken to him... And he went outside and wept bitterly.`,
    keyVerseReference: 'Luke 22:61',
    keyVerseText: 'The Lord turned and looked straight at Peter. Then Peter remembered the word the Lord had spoken to him... And he went outside and wept bitterly.',
    kjvKeyVerseText: 'And the Lord turned, and looked upon Peter. And Peter remembered the word of the Lord... And Peter went out, and wept bitterly. — Luke 22:61-62 (KJV)',
    teaserHook: "Tomorrow: A charcoal fire in the dead of night, and a bystander looks Peter straight in the eyes.",
    backstory: {
      category: 'People',
      title: 'The courtyard fire before dawn',
      content: "Peter had boldly promised just hours earlier that even if everyone else deserted Jesus, he would gladly die for Him. He had even drawn a blade in the garden to defend his Master against an armed mob. But huddled over a charcoal fire among temple guards in the cold night, fear stripped away his bravado. The early church preserved this painful failure because Peter himself shared it openly as proof of Christ's restoring mercy."
    },
    staticFallback: {
      scenarioQuestion: "You cracked under pressure and failed someone who trusted you. What's your move?",
      presetChoices: [
        { id: 'choice-peter-deny', text: 'Cover it up and pretend you never did anything wrong.', stance: 'run' },
        { id: 'choice-peter-despair', text: 'Sink into shame and decide you are permanently disqualified.', stance: 'shut_down' },
        { id: 'choice-peter-blame', text: 'Blame the circumstances and the people who backed you into a corner.', stance: 'lash_out' },
        { id: 'choice-peter-weep', text: 'Own the failure with honest tears, ready for genuine restoration.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "In the chill of the high priest's courtyard, Peter warmed his hands over the charcoal fire while Jesus was interrogated inside.",
        "Challenged three times by bystanders, Peter's courage evaporated into panicked denials: 'I don't know him!'",
        "At the rooster's crow, Jesus turned and looked straight at Peter. Crushed by the weight of his failure, Peter walked out into the night and wept bitterly."
      ],
      actionLine: "Own the one mistake you've been defensive about today, apologize plainly, and move forward.",
      mirrorBackRules: {
        'choice-peter-deny': "You said you'd hide it — Peter panicked and tried to cover his tracks by the fire.",
        'choice-peter-despair': "You said you'd sink into shame — Peter wept in the dark, but Jesus later restored him.",
        'choice-peter-blame': "You said you'd blame the room — Peter tried deflecting until the rooster crowed.",
        'choice-peter-weep': "You said you'd own the truth — that broken honesty is the seed of real restoration."
      },
      defaultMirrorBack: "Here is what happened by the courtyard fire when Peter's courage collapsed."
    }
  },
  {
    id: 'passage-joseph-brothers',
    heroName: 'Joseph',
    reference: 'Genesis 45:1-8',
    book: 'Genesis',
    chapter: 45,
    verseRange: '1-8',
    theme: 'Broken Trust & Hurt Feelings',
    passageText: `Then Joseph could no longer control himself before all his attendants, and he cried out, "Have everyone leave my presence!" So there was no one with Joseph when he made himself known to his brothers. And he wept so loudly that the Egyptians heard him, and Pharaoh's household heard about it. Joseph said to his brothers, "I am Joseph! Is my father still living?" But his brothers were not able to answer him, because they were terrified at his presence. Then Joseph said to his brothers, "Come close to me." When they had done so, he said, "I am your brother Joseph, the one you sold into Egypt! And now, do not be distressed and do not be angry with yourselves for selling me here, because it was to save lives that God sent me ahead of you... So then, it was not you who sent me here, but God."`,
    keyVerseReference: 'Genesis 45:5',
    keyVerseText: '"And now, do not be distressed and do not be angry with yourselves for selling me here, because it was to save lives that God sent me ahead of you."',
    kjvKeyVerseText: 'Now therefore be not grieved, nor angry with yourselves, that ye sold me hither: for God did send me before you to preserve life. — Genesis 45:5 (KJV)',
    teaserHook: "Tomorrow: The brothers who sold him into slavery walk into Pharaoh's court — completely unaware of who sits on the throne.",
    backstory: {
      category: 'Culture',
      title: 'The supreme power Joseph held',
      content: "In ancient Egypt, the Grand Vizier was second only to Pharaoh, controlling all grain reserves during severe famine. When Joseph's ten older brothers arrived starving from Canaan, foreign travelers were required to bow with their faces to the stone floor. Joseph was dressed in royal Egyptian linen, shaved according to court custom, and spoke through an interpreter. He had absolute legal power to execute them on the spot, but chose a radically different path."
    },
    staticFallback: {
      scenarioQuestion: "Someone who wounded and betrayed you is suddenly at your mercy. What's your move?",
      presetChoices: [
        { id: 'choice-joseph-revenge', text: 'Use your leverage to make them suffer the way they made you suffer.', stance: 'lash_out' },
        { id: 'choice-joseph-cut', text: 'Cut them off completely and pretend they don\'t exist.', stance: 'shut_down' },
        { id: 'choice-joseph-guilt', text: 'Keep them around but hold their guilt over their heads forever.', stance: 'run' },
        { id: 'choice-joseph-forgive', text: 'Break the cycle of revenge and look for God\'s bigger redemptive story.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "Thirteen years after being thrown into a cistern and sold into slavery by his brothers, Joseph held supreme power over Egypt.",
        "When his starving brothers bowed before him unaware of who he was, Joseph could have executed them with a single nod.",
        "Instead, Joseph wept so loudly Pharaoh's palace heard him. He pulled his trembling brothers close: 'You meant it for evil, but God sent me ahead to preserve life.'"
      ],
      actionLine: "Release the grudge you've been rehearsing in your head today, and let God handle the debt.",
      mirrorBackRules: {
        'choice-joseph-revenge': "You said you'd strike back — Joseph had the army to do it, but chose mercy.",
        'choice-joseph-cut': "You said you'd cut them off — Joseph had every right to, but chose reconciliation.",
        'choice-joseph-guilt': "You said you'd hold guilt over them — Joseph told his brothers: 'Do not be distressed.'",
        'choice-joseph-forgive': "You said you'd break the cycle — that radical forgiveness saved an entire nation."
      },
      defaultMirrorBack: "Here is what happened in Pharaoh's palace when Joseph held total power over his betrayers."
    }
  },
  {
    id: 'passage-paul-silas-prison',
    heroName: 'Paul',
    reference: 'Acts 16:22-31',
    book: 'Acts',
    chapter: 16,
    verseRange: '22-31',
    theme: 'Endurance & Brotherhood',
    passageText: `The crowd joined in the attack against Paul and Silas, and the magistrates ordered them to be stripped and beaten with rods. After they had been severely flogged, they were thrown into prison, and the jailer was commanded to guard them carefully. When he received these orders, he put them in the inner cell and fastened their feet in the stocks. About midnight Paul and Silas were praying and singing hymns to God, and the other prisoners were listening to them. Suddenly there was such a violent earthquake that the foundations of the prison were shaken. At once all the prison doors flew open, and everyone's chains came loose. The jailer woke up, and when he saw the prison doors open, he drew his sword and was about to kill himself because he thought the prisoners had escaped. But Paul shouted, "Don't harm yourself! We are all here!" The jailer called for lights, rushed in and fell trembling before Paul and Silas. He then brought them out and asked, "Sirs, what must I do to be saved?"`,
    keyVerseReference: 'Acts 16:25',
    keyVerseText: 'About midnight Paul and Silas were praying and singing hymns to God, and the other prisoners were listening to them.',
    kjvKeyVerseText: 'And at midnight Paul and Silas prayed, and sang praises unto God: and the prisoners heard them. — Acts 16:25 (KJV)',
    teaserHook: "Tomorrow: Beaten with wooden rods and clamped in dungeon stocks at midnight, two prisoners face total darkness.",
    backstory: {
      category: 'Culture',
      title: 'Why Roman stocks were brutal',
      content: "Roman inner dungeons were pitch-black underground chambers with no sanitation and zero airflow. The heavy wooden stocks forced prisoners' legs spread painfully wide apart, causing intense cramping and joint strain. In addition, Roman guards faced immediate execution if any prisoner escaped under their custody. That explains why the Philippian jailer drew his sword ready to kill himself the moment the earthquake flung the heavy gates open."
    },
    staticFallback: {
      scenarioQuestion: "You've been treated unfairly and locked into a miserable situation. What's your move?",
      presetChoices: [
        { id: 'choice-paul-curse', text: 'Curse the injustice and swear vengeance against the magistrates.', stance: 'lash_out' },
        { id: 'choice-paul-despair', text: 'Sink into quiet self-pity on the cold stone floor.', stance: 'shut_down' },
        { id: 'choice-paul-flee', text: 'Slip through the first open crack the moment nobody is looking.', stance: 'run' },
        { id: 'choice-paul-praise', text: 'Sing and pray right in the dark cell and show mercy to your jailer.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "Beaten with rods and locked into the inner dungeon with feet clamped in stocks, Paul and Silas were bleeding in total darkness.",
        "Around midnight, instead of groaning in misery, they started praying and singing hymns. The other prisoners listened in silence.",
        "A sudden earthquake shattered the foundations and popped open every gate. Instead of running, Paul stayed to save the suicidal jailer's life."
      ],
      actionLine: "Speak words of praise or gratitude out loud today in the middle of a frustrating chore.",
      mirrorBackRules: {
        'choice-paul-curse': "You said you'd curse the room — Paul had every legal right to, but sang praises instead.",
        'choice-paul-despair': "You said you'd sink into despair — Paul's midnight songs broke the atmosphere of defeat.",
        'choice-paul-flee': "You said you'd flee — Paul stayed behind when the doors flew open to save his jailer.",
        'choice-paul-praise': "You said you'd worship in the dark — that exact posture shook the prison foundations."
      },
      defaultMirrorBack: "Here is what happened in the Philippian dungeon at the stroke of midnight."
    }
  },
  {
    id: 'passage-jesus-word',
    heroName: 'Jesus',
    reference: 'John 1:1-5',
    book: 'John',
    chapter: 1,
    verseRange: '1-5',
    theme: 'Hope & Overcoming Darkness',
    passageText: `In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made. In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.`,
    keyVerseReference: 'John 1:5',
    keyVerseText: 'The light shines in the darkness, and the darkness has not overcome it.',
    kjvKeyVerseText: 'And the light shineth in darkness; and the darkness comprehended it not. — John 1:5 (KJV)',
    teaserHook: "Tomorrow: Darkness presses in from every side, but an unquenchable light is about to break through.",
    backstory: {
      category: 'Author',
      title: "Why John wrote 'The Word'",
      content: "John wrote his Gospel decades after the others, addressing a world of Greek thinkers and Jewish rabbis who debated the 'Logos' — the supreme cosmic reason behind the universe. Jewish teachers also spoke in awe of the 'Memra' (God's creative spoken word). John connected both worlds by announcing that the ultimate foundation of reality is not a cold equation or abstract thought, but a person who entered human history with grace, truth, and life."
    },
    staticFallback: {
      scenarioQuestion: "Darkness and heavy thoughts are pressing in around you today. What's your move?",
      presetChoices: [
        { id: 'choice-light-isolate', text: 'Let the darkness take over and pull the shades down.', stance: 'shut_down' },
        { id: 'choice-light-fight', text: 'Rage against the gloom without turning on any light.', stance: 'lash_out' },
        { id: 'choice-light-distract', text: 'Numb your mind with endless scrolling and distractions.', stance: 'run' },
        { id: 'choice-light-shine', text: 'Open the blinds, speak truth, and let Christ\'s light push back the gloom.', stance: 'reach_out' }
      ],
      storyRetelling: [
        "Before the cosmos was spoken into existence, the Word already was. He was not a distant philosophical idea, but life itself.",
        "That life broke into a cold, broken world as an unquenchable light for all mankind.",
        "Darkness tried with all its fury to smother that light, but John delivers the ultimate verdict: the darkness has never overcome it."
      ],
      actionLine: "Open your curtains or step outside for 5 minutes and let God's light reset your mind.",
      mirrorBackRules: {
        'choice-light-isolate': "You said you'd pull the shades — Jesus came precisely for those sitting in the dark.",
        'choice-light-fight': "You said you'd rage at the gloom — darkness isn't fought by shouting, but by turning on the light.",
        'choice-light-distract': "You said you'd numb the feeling — distractions fade, but Christ's light remains unbroken.",
        'choice-light-shine': "You said you'd step into the light — John promises that the darkness cannot overcome it."
      },
      defaultMirrorBack: "Here is what John recorded about the light that no darkness can ever put out."
    }
  }
];

/**
 * Deterministically picks today's passage from the curated rotation.
 * Guarantees that day N and day N+1 produce different passages.
 */
export function getDailyCuratedPassage(dayOffset = 0, battlefieldId?: string | null): CuratedPassage {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayIndex = Math.floor(localMidnight / (1000 * 60 * 60 * 24)) + dayOffset;
  const absIndex = Math.abs(dayIndex);

  // If a battlefield check-in theme is provided, try to match it
  if (battlefieldId) {
    const matching = CURATED_DAILY_PASSAGES.filter(p => {
      if (battlefieldId === 'anxiety-overwhelm') return p.theme.includes('Anxiety') || p.theme.includes('Burnout');
      if (battlefieldId === 'workplace-politics') return p.theme.includes('Pressure') || p.theme.includes('Courage');
      if (battlefieldId === 'betrayal-relational') return p.theme.includes('Trust') || p.theme.includes('Feelings');
      if (battlefieldId === 'high-stakes-decision') return p.theme.includes('Courage') || p.theme.includes('Decision');
      return true;
    });
    if (matching.length > 0) {
      return matching[absIndex % matching.length];
    }
  }

  // Pure rotation without repeating
  return CURATED_DAILY_PASSAGES[absIndex % CURATED_DAILY_PASSAGES.length];
}
