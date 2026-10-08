import type { CuratedPassage } from './dailyPassages';

export interface SeriesMoment extends CuratedPassage {
  seriesId: string;
  dayNumber: number; // 1 to 7
  momentTitle: string;
  narrativeBridge: string; // How this moment advances the overarching week
}

export interface WeeklySeries {
  id: string;
  characterId: string;
  title: string;
  heroName: string;
  tagline: string;
  hook: string; // One-line hook for Library & Home
  avatarIcon: string;
  weekTheme: string;
  moments: SeriesMoment[];
}

export const WEEKLY_SERIES: WeeklySeries[] = [
  // =========================================================================
  // 1. DAVID — Seven Decisions That Made a King
  // =========================================================================
  {
    id: 'series-david',
    characterId: 'david',
    title: 'David: Seven Decisions That Made a King',
    heroName: 'David',
    tagline: 'Seven decisions that transformed a forgotten shepherd into a king',
    hook: 'From overlooked boy to hunted fugitive to king — trace the seven choices that forged David.',
    avatarIcon: '👑',
    weekTheme: 'Leadership, pressure, and finding strength in God',
    moments: [
      {
        id: 'series-david-day-1',
        seriesId: 'series-david',
        dayNumber: 1,
        momentTitle: 'The Overlooked Shepherd',
        narrativeBridge: 'Day 1 frames David’s journey: before crowns and battlefields, he was forgotten in the fields.',
        heroName: 'David',
        reference: '1 Samuel 16:11-13',
        book: '1 Samuel',
        chapter: 16,
        verseRange: '11-13',
        theme: 'Identity & Worth',
        passageText: `Samuel asked Jesse, "Are these all the sons you have?" "There is still the youngest," Jesse answered. "He is tending the sheep." Samuel said, "Send for him; we will not sit down until he arrives." So he sent for him and had him brought in. He was glowing with health and had a fine appearance and handsome features. Then the Lord said, "Rise and anoint him; this is the one." So Samuel took the horn of oil and anointed him in the presence of his brothers, and from that day on the Spirit of the Lord came powerfully upon David.`,
        keyVerseReference: '1 Samuel 16:7',
        keyVerseText: 'The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.',
        kjvKeyVerseText: 'For the Lord seeth not as man seeth; for man looketh on the outward appearance, but the Lord looketh on the heart. — 1 Samuel 16:7 (KJV)',
        teaserHook: 'Tomorrow: The giant taunts the whole army, and an armed soldier laughs at a shepherd boy stepping up.',
        backstory: {
          category: 'Culture',
          title: 'The Youngest Son in Bethlehem',
          content: 'In bronze-age tribal culture, the youngest son was assigned the dirtiest chores and had the lowest inheritance rights. Jesse did not even bother inviting David inside when the nation’s prophet visited. God bypassed all seven older brothers to pick the forgotten boy out in the pasture.'
        },
        staticFallback: {
          scenarioQuestion: 'Everyone around you overlooks your contribution or doubts your potential. What is your move?',
          presetChoices: [
            { id: 'david1-prove', text: 'Work twice as hard to force them to notice you.', stance: 'prove_self' },
            { id: 'david1-withdraw', text: 'Step back quietly and stop caring about the outcome.', stance: 'withdraw' },
            { id: 'david1-resent', text: 'Resent the people who took the spotlight instead.', stance: 'resent' },
            { id: 'david1-faithful', text: 'Stay faithful in your private work and let God promote in His time.', stance: 'stay_faithful' }
          ],
          storyRetelling: [
            "The prophet Samuel came to Bethlehem to anoint Israel's next king. Jesse lined up his seven oldest sons—tall, strong, and military-ready.",
            "God rejected every single one. Jesse hadn't even invited his youngest, leaving David out in the sheep pastures as an afterthought.",
            "When David was brought in, God spoke: 'Rise and anoint him; this is the one.' God saw a faithful heart forged in private solitude."
          ],
          actionLine: 'Do one faithful task today with excellence that nobody else will ever see.',
          mirrorBackRules: {
            'david1-prove': 'You felt the urge to force recognition — David never begged for attention, he let his faithfulness speak.',
            'david1-withdraw': 'You felt like checking out — David stayed at his post in the pasture until summoned.',
            'david1-resent': 'You noticed the sting of comparison — God bypassed the impressive brothers to choose the humble heart.',
            'david1-faithful': 'You chose private faithfulness — that quiet discipline is exactly where God prepared David to lead.'
          },
          defaultMirrorBack: 'Here is what happened when God bypassed every expectation in Bethlehem.'
        }
      },
      {
        id: 'series-david-day-2',
        seriesId: 'series-david',
        dayNumber: 2,
        momentTitle: 'Five Smooth Stones',
        narrativeBridge: 'Day 2 tests David’s courage against Goliath, rejecting heavy borrowed armor for true faith.',
        heroName: 'David',
        reference: '1 Samuel 17:32-37',
        book: '1 Samuel',
        chapter: 17,
        verseRange: '32-37',
        theme: 'Courage Under Fire',
        passageText: `David said to Saul, "Let no one lose heart on account of this Philistine; your servant will go and fight him." Saul replied, "You are not able to go out against this Philistine and fight him; you are only a young man, and he has been a warrior from his youth." But David said to Saul, "Your servant has been keeping his father's sheep. When a lion or a bear came and carried off a sheep from the flock, I went after it, struck it and rescued the sheep from its mouth... The Lord who rescued me from the paw of the lion and the paw of the bear will rescue me from the hand of this Philistine." Saul said to David, "Go, and the Lord be with you."`,
        keyVerseReference: '1 Samuel 17:45',
        keyVerseText: 'You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty.',
        kjvKeyVerseText: 'Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the Lord of hosts. — 1 Samuel 17:45 (KJV)',
        teaserHook: 'Tomorrow: The king turns jealous, and the national hero is forced to sleep on cave dirt with four hundred outlaws.',
        backstory: {
          category: 'Author',
          title: 'The Valley of Elah',
          content: 'The Philistines held one ridge and Israel held the other, paralyzed by fear for forty days. King Saul tried dressing David in his own bronze armor, but David could not even walk in it. He took off the king’s armor and faced the giant with just a sling and five river stones.'
        },
        staticFallback: {
          scenarioQuestion: 'A giant problem is intimidating everyone around you. How do you confront it?',
          presetChoices: [
            { id: 'david2-armor', text: 'Borrow someone else’s methods and pretend you are in control.', stance: 'borrow_armor' },
            { id: 'david2-freeze', text: 'Wait for someone more experienced to solve it first.', stance: 'freeze' },
            { id: 'david2-panic', text: 'Focus on how outmatched and under-resourced you are.', stance: 'panic' },
            { id: 'david2-stand', text: 'Step forward using the simple skills God has already given you.', stance: 'stand_in_truth' }
          ],
          storyRetelling: [
            "Goliath stood nine feet tall in the Valley of Elah, mocking Israel’s army twice a day. Even King Saul shook in his royal tent.",
            "When young David stepped up, Saul tried to weigh him down with heavy bronze royal armor. David took it off: 'I cannot go in these.'",
            "With five smooth stones and an unshakeable confidence in God, David charged the front lines. The giant fell on his face to the earth."
          ],
          actionLine: 'Drop the urge to copy someone else’s playbook today; show up as yourself with God.',
          mirrorBackRules: {
            'david2-armor': 'You thought about using borrowed armor — David took Saul’s armor off because it did not fit who God made him.',
            'david2-freeze': 'You hesitated to step up — the entire army of Israel froze for 40 days until one boy trusted God.',
            'david2-panic': 'You measured the size of the threat — David measured the size of his God against the giant.',
            'david2-stand': 'You stepped forward in truth — that exact authenticity is how David conquered Goliath.'
          },
          defaultMirrorBack: 'Here is how David stood before Goliath without borrowed armor.'
        }
      },
      {
        id: 'series-david-day-3',
        seriesId: 'series-david',
        dayNumber: 3,
        momentTitle: 'The Cave of Adullam',
        narrativeBridge: 'Day 3 lands in David’s deepest isolation: stripped of fame, hiding in a cave with 400 desperate outlaws.',
        heroName: 'David',
        reference: '1 Samuel 22:1-4',
        book: '1 Samuel',
        chapter: 22,
        verseRange: '1-4',
        theme: 'Leading in Crisis',
        passageText: `David left Gath and escaped to the cave of Adullam. When his brothers and his father's household heard about it, they went down to him there. All those who were in distress or in debt or discontented gathered to him, and he became their commander. About four hundred men were with him. From there David went to Mizpah in Moab and said to the king of Moab, "Would you let my father and mother come and stay with you until I learn what God will do for me?"`,
        keyVerseReference: '1 Samuel 22:2',
        keyVerseText: 'All those who were in distress or in debt or discontented gathered to him, and he became their commander. About four hundred men were with him.',
        kjvKeyVerseText: 'And every one that was in distress, and every one that was in debt, and every one that was discontented, gathered themselves unto him; and he became a captain over them. — 1 Samuel 22:2 (KJV)',
        teaserHook: 'Tomorrow: The man hunting your life falls asleep inside your hiding spot within arm’s reach of your sword.',
        backstory: {
          category: 'People',
          title: 'The Outcasts of Adullam',
          content: 'David went from the palace to an outlaw refuge. The men who gathered to him were bankrupt, broken, and hunted by Saul’s debt collectors. In any other hands, they would have become bandits. David forged them into a disciplined, noble brotherhood called the Mighty Men.'
        },
        staticFallback: {
          scenarioQuestion: 'Your life feels like a cave right now and you are surrounded by chaos. What do you do?',
          presetChoices: [
            { id: 'david3-shut', text: 'Shut the doors and isolate completely until things improve.', stance: 'shut_down' },
            { id: 'david3-blame', text: 'Blame the people whose poor decisions got you into this mess.', stance: 'blame' },
            { id: 'david3-flee', text: 'Run away and abandon your responsibilities.', stance: 'flee' },
            { id: 'david3-build', text: 'Turn to the struggling people around you and build brotherhood.', stance: 'build_brotherhood' }
          ],
          storyRetelling: [
            "David lost everything: his royal post, his home, and his best friend Jonathan. He ran into the dark limestone caves of Adullam.",
            "Soon four hundred desperate men in debt, grief, and discontent tracked him down. They didn't need a hero; they needed a shepherd.",
            "David chose not to become bitter. In that damp cave, he taught them to worship, honor God, and protect each other."
          ],
          actionLine: 'Reach out to someone who is struggling today instead of suffering in your cave alone.',
          mirrorBackRules: {
            'david3-shut': 'You wanted to retreat into silence — David felt that pain, but allowed God to open his hands to others.',
            'david3-blame': 'You felt like assigning blame — David chose to turn outlaws into mighty men rather than complain.',
            'david3-flee': 'You thought about running — running never solves the calling; presence in the cave does.',
            'david3-build': 'You chose to build brotherhood — that exact spirit transformed Adullam from a prison into a throne room.'
          },
          defaultMirrorBack: 'Here is what David did when surrounded by distress in the Cave of Adullam.'
        }
      },
      {
        id: 'series-david-day-4',
        seriesId: 'series-david',
        dayNumber: 4,
        momentTitle: 'Spared at En-gedi',
        narrativeBridge: 'Day 4 brings the ultimate shortcut temptation: killing Saul and seizing the throne today.',
        heroName: 'David',
        reference: '1 Samuel 24:3-10',
        book: '1 Samuel',
        chapter: 24,
        verseRange: '3-10',
        theme: 'Integrity Over Shortcuts',
        passageText: `Saul came to the sheep pens along the way; a cave was there, and Saul went in to relieve himself. David and his men were far back in the cave. The men said, "This is the day the Lord spoke of when he said to you, 'I will give your enemy into your hands for you to deal with as you wish.'" Then David crept up unnoticed and cut off a corner of Saul's robe. Afterward, David was conscience-stricken for having cut off a corner of his robe. He said to his men, "The Lord forbid that I should do such a thing to my master, the Lord's anointed."`,
        keyVerseReference: '1 Samuel 24:6',
        keyVerseText: 'The Lord forbid that I should do such a thing to my master, the Lord’s anointed, or lay my hand on him; for he is the anointed of the Lord.',
        kjvKeyVerseText: 'The Lord forbid that I should do this thing unto my master, the Lord’s anointed, to stretch forth mine hand against him, seeing he is the anointed of the Lord. — 1 Samuel 24:6 (KJV)',
        teaserHook: 'Tomorrow: Returning home from patrol, David finds his city burned to ash and his own loyal men picking up stones to kill him.',
        backstory: {
          category: 'Culture',
          title: 'The Robe of Royalty',
          content: 'In the ancient Near East, the hem of a king’s robe represented his royal authority and dynasty. By cutting the corner of Saul’s robe, David proved he had the power to kill him, but even nicking the fabric grieved his tender conscience.'
        },
        staticFallback: {
          scenarioQuestion: 'You have a clean opportunity to take revenge or take a dishonest shortcut. Do you take it?',
          presetChoices: [
            { id: 'david4-strike', text: 'Strike back immediately; they had it coming.', stance: 'strike' },
            { id: 'david4-humiliate', text: 'Take a cheap shot and publicly expose their weakness.', stance: 'humiliate' },
            { id: 'david4-justify', text: 'Rationalize that the ends justify the means.', stance: 'justify' },
            { id: 'david4-honor', text: 'Hold your fire, protect your integrity, and let God judge.', stance: 'honor' }
          ],
          storyRetelling: [
            "King Saul hunted David with 3,000 elite troops among the Crags of the Wild Goats. Saul stepped into a cave alone to relieve himself.",
            "David and his warriors were hiding deep in the shadows. His men whispered: 'God gave him to you! Put your sword through him!'",
            "David only cut a sliver of Saul's hem—and his heart broke with conviction. He spared Saul's life, refusing to touch God's anointed."
          ],
          actionLine: 'Refuse to take a shortcut or retaliate against someone who wronged you today.',
          mirrorBackRules: {
            'david4-strike': 'You thought about retaliation — David had the sword in hand, but chose honor over revenge.',
            'david4-humiliate': 'You wanted to expose them — David even felt remorse for snipping the hem of Saul’s robe.',
            'david4-justify': 'You weighed the shortcut — David knew a crown seized by murder would be cursed from day one.',
            'david4-honor': 'You chose integrity — keeping your hands clean under pressure is the mark of true royalty.'
          },
          defaultMirrorBack: 'Here is what happened in the dark cave of En-gedi.'
        }
      },
      {
        id: 'series-david-day-5',
        seriesId: 'series-david',
        dayNumber: 5,
        momentTitle: 'The Ashes of Ziklag',
        narrativeBridge: 'Day 5 hits rock bottom: total loss, grief, and David finding strength in the Lord alone.',
        heroName: 'David',
        reference: '1 Samuel 30:1-8',
        book: '1 Samuel',
        chapter: 30,
        verseRange: '1-8',
        theme: 'Finding Strength in Grief',
        passageText: `David and his men reached Ziklag on the third day. Now the Amalekites had raided the Negev and Ziklag. They had attacked Ziklag and burned it, and had taken captive the women and everyone else in it... David and his men wept aloud until they had no strength left to weep. David was greatly distressed because the men were talking of stoning him; each one was bitter in spirit because of his sons and daughters. But David found strength in the Lord his God. Then David said to Abiathar the priest, "Bring me the ephod."`,
        keyVerseReference: '1 Samuel 30:6',
        keyVerseText: 'David was greatly distressed because the men were talking of stoning him; but David found strength in the Lord his God.',
        kjvKeyVerseText: 'And David was greatly distressed; for the people spake of stoning him... but David encouraged himself in the Lord his God. — 1 Samuel 30:6 (KJV)',
        teaserHook: 'Tomorrow: The prophet Nathan walks into the royal court with a story about a poor man’s lamb.',
        backstory: {
          category: 'People',
          title: 'The Burning of Ziklag',
          content: 'Ziklag was the frontier town where David’s four hundred warriors left their families while out on patrol. Returning to find ash heaps and empty homes broke even hardened veterans. Their grief turned into mutinous rage toward David before he turned to God.'
        },
        staticFallback: {
          scenarioQuestion: 'Everything you built feels ruined and everyone is turning against you. Where do you turn?',
          presetChoices: [
            { id: 'david5-spiral', text: 'Collapse into total hopelessness and quit.', stance: 'spiral' },
            { id: 'david5-fight', text: 'Turn against your allies and argue about who is at fault.', stance: 'argue' },
            { id: 'david5-distract', text: 'Numb the pain and pretend you don’t care anymore.', stance: 'distract' },
            { id: 'david5-strengthen', text: 'Step aside into quiet, strengthen your heart in God, and ask what is next.', stance: 'strengthen_in_god' }
          ],
          storyRetelling: [
            "David and his men returned to their border outpost at Ziklag and found it incinerated. Their wives and children were taken captive.",
            "Six hundred seasoned warriors wept until they had no tears left. Then their grief turned to fury—they talked of stoning David.",
            "David was cornered. But instead of fighting back or panicking, he strengthened himself in the Lord, called for the priest, and asked God: 'Shall I pursue?'"
          ],
          actionLine: 'Take 5 minutes of stillness today to strengthen your heart before making any big decision.',
          mirrorBackRules: {
            'david5-spiral': 'You felt the weight of exhaustion — David wept until he had no tears left, then looked up.',
            'david5-fight': 'You felt like lashing out at critics — David did not argue with angry men; he prayed.',
            'david5-distract': 'You thought about numbing the pain — David faced the ash heap directly and sought God.',
            'david5-strengthen': 'You chose to strengthen yourself in God — that decision rescued every family taken from Ziklag.'
          },
          defaultMirrorBack: 'Here is what David did among the smoking ruins of Ziklag.'
        }
      },
      {
        id: 'series-david-day-6',
        seriesId: 'series-david',
        dayNumber: 6,
        momentTitle: 'Nathan’s Mirror',
        narrativeBridge: 'Day 6 exposes David’s greatest moral failure and his willingness to repent without excuses.',
        heroName: 'David',
        reference: '2 Samuel 12:1-13',
        book: '2 Samuel',
        chapter: 12,
        verseRange: '1-13',
        theme: 'Repentance & Honesty',
        passageText: `The Lord sent Nathan to David. When he came to him, he said, "There were two men in a certain town, one rich and the other poor. The rich man had a very large number of sheep and cattle, but the poor man had nothing except one little ewe lamb he had bought..." David burned with anger against the man and said to Nathan, "As surely as the Lord lives, the man who did this must die!" Then Nathan said to David, "You are the man!"... Then David said to Nathan, "I have sinned against the Lord." Nathan replied, "The Lord has taken away your sin. You are not going to die."`,
        keyVerseReference: '2 Samuel 12:13',
        keyVerseText: 'Then David said to Nathan, "I have sinned against the Lord." Nathan replied, "The Lord has taken away your sin."',
        kjvKeyVerseText: 'And David said unto Nathan, I have sinned against the Lord. And Nathan said unto David, The Lord also hath put away thy sin; thou shalt not die. — 2 Samuel 12:13 (KJV)',
        teaserHook: 'Tomorrow: The aged king looks back on his triumphs and tears, penning the song that has carried generations.',
        backstory: {
          category: 'Author',
          title: 'The Parable of the Ewe Lamb',
          content: 'David had committed adultery with Bathsheba and arranged the murder of Uriah to cover it up. For nearly a year he lived in denial. Nathan risked execution by confronting the monarch with a story that pierced David’s blindness.'
        },
        staticFallback: {
          scenarioQuestion: 'You made a severe mistake and someone points it out. How do you respond?',
          presetChoices: [
            { id: 'david6-deny', text: 'Deny it and make excuses to protect your reputation.', stance: 'deny' },
            { id: 'david6-attack', text: 'Attack the messenger and bring up their past flaws.', stance: 'attack' },
            { id: 'david6-hide', text: 'Bury it deeper and hope nobody else ever finds out.', stance: 'hide' },
            { id: 'david6-confess', text: 'Own it completely without spin: "I was wrong, and I will make it right."', stance: 'confess' }
          ],
          storyRetelling: [
            "King David thought his dark secrets were buried safely in the past. But Nathan the prophet entered the throne room with a story.",
            "Nathan told of a rich man who stole a poor man's only beloved lamb. David raged with righteous anger: 'That man deserves death!'",
            "Nathan looked the king in the eyes: 'You are the man.' David broke. No spin, no legal excuses: 'I have sinned against the Lord.'"
          ],
          actionLine: 'Own a past mistake today without offering a single excuse or shifting blame.',
          mirrorBackRules: {
            'david6-deny': 'You felt the protective instinct of pride — David hid his sin for months until it nearly poisoned him.',
            'david6-attack': 'You thought about attacking the messenger — David had the power to kill Nathan, but chose humility instead.',
            'david6-hide': 'You thought about burying it — David learned that hidden sin festers, while confession brings healing.',
            'david6-confess': 'You chose full ownership — that transparency made David a man after God’s own heart.'
          },
          defaultMirrorBack: 'Here is what happened when Nathan confronted the king.'
        }
      },
      {
        id: 'series-david-day-7',
        seriesId: 'series-david',
        dayNumber: 7,
        momentTitle: 'The Shepherd’s Anthem',
        narrativeBridge: 'Day 7 lands the series: the aged king reflects on the sheepfolds, caves, and throne.',
        heroName: 'David',
        reference: 'Psalm 23:1-6',
        book: 'Psalms',
        chapter: 23,
        verseRange: '1-6',
        theme: 'Trust & Eternal Peace',
        passageText: `The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name's sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows. Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.`,
        keyVerseReference: 'Psalm 23:1',
        keyVerseText: 'The Lord is my shepherd, I lack nothing.',
        kjvKeyVerseText: 'The Lord is my shepherd; I shall not want. — Psalm 23:1 (KJV)',
        teaserHook: 'Your week with David is complete. Next week: A new hero takes the field.',
        backstory: {
          category: 'Culture',
          title: 'The Valley of the Shadow of Death',
          content: 'The wadis of Judea were treacherous ravines where flash floods and predators hid in deep shadow. David had walked through them as an outcast, an exile, and a king. Looking back over a lifetime of battles, he concluded that God had walked beside him through every single shadow.'
        },
        staticFallback: {
          scenarioQuestion: 'Looking ahead to the unknown future, what anchors your confidence?',
          presetChoices: [
            { id: 'david7-control', text: 'My own ability to predict and control circumstances.', stance: 'control' },
            { id: 'david7-wealth', text: 'Financial safety and external stability.', stance: 'wealth' },
            { id: 'david7-worry', text: 'Nothing yet; anxiety still dominates my thoughts.', stance: 'worry' },
            { id: 'david7-shepherd', text: 'Knowing God is my shepherd and He walks with me through every valley.', stance: 'shepherd' }
          ],
          storyRetelling: [
            "David had worn shepherd's rags, warrior's armor, and royal robes. He had been hailed by crowds and betrayed by sons.",
            "In the end, his greatest title was not King of Israel, but sheep of the Good Shepherd.",
            "'Even though I walk through the darkest valley, I will fear no evil, for you are with me.' Seven decisions led him back to the shepherd's field."
          ],
          actionLine: 'Memorize Psalm 23:1 today: "The Lord is my shepherd, I lack nothing."',
          mirrorBackRules: {
            'david7-control': 'You leaned on control — David learned that no army or palace could guarantee peace like God could.',
            'david7-wealth': 'You looked to external security — David had kingdoms, but valued God’s presence above all treasure.',
            'david7-worry': 'You felt the weight of tomorrow — David faced death squads and valleys, yet trusted his Shepherd.',
            'david7-shepherd': 'You anchored your heart in God — that eternal trust is the enduring crown of David’s life.'
          },
          defaultMirrorBack: 'Here is the song David wrote looking back over his life.'
        }
      }
    ]
  },

  // =========================================================================
  // 2. PETER — The Bravado, The Collapse, and The Rock
  // =========================================================================
  {
    id: 'series-peter',
    characterId: 'peter',
    title: 'Peter: The Bravado, The Collapse, and The Rock',
    heroName: 'Peter',
    tagline: 'From impulsive fisherman to fallen friend to an unbreakable pillar',
    hook: 'Trace Peter’s journey through seven pivotal tests of courage, failure, and grace.',
    avatarIcon: '⚓',
    weekTheme: 'Raw honesty, bouncing back from failure, and courage',
    moments: [
      {
        id: 'series-peter-day-1',
        seriesId: 'series-peter',
        dayNumber: 1,
        momentTitle: 'Leaving the Nets',
        narrativeBridge: 'Day 1: Peter faces his own exhaustion and feels completely unqualified for God’s call.',
        heroName: 'Peter',
        reference: 'Luke 5:4-11',
        book: 'Luke',
        chapter: 5,
        verseRange: '4-11',
        theme: 'Calling & Surrender',
        passageText: `When Jesus had finished speaking, he said to Simon, "Put out into deep water, and let down the nets for a catch." Simon answered, "Master, we've worked hard all night and haven't caught anything. But because you say so, I will let down the nets." When they had done so, they caught such a large number of fish that their nets began to break... When Simon Peter saw this, he fell at Jesus' knees and said, "Go away from me, Lord; I am a sinful man!"... Then Jesus said to Simon, "Don't be afraid; from now on you will fish for people."`,
        keyVerseReference: 'Luke 5:5',
        keyVerseText: 'Master, we’ve worked hard all night and haven’t caught anything. But because you say so, I will let down the nets.',
        kjvKeyVerseText: 'Master, we have toiled all the night, and have taken nothing: nevertheless at thy word I will let down the net. — Luke 5:5 (KJV)',
        teaserHook: 'Tomorrow: In the dead of night at 3am, a wild storm hits the sea and a voice calls Peter out of the boat.',
        backstory: {
          category: 'People',
          title: 'Commercial Fishermen of Galilee',
          content: 'Commercial fishing was heavy, exhausting manual labor taxed heavily by Rome. Peter and Andrew had toiled through the night without a single fish to show for it. When an itinerant carpenter told an expert fisherman to cast again, Peter’s pride was on the line.'
        },
        staticFallback: {
          scenarioQuestion: 'You worked hard all week and have nothing to show for it. God asks you to try again. What is your move?',
          presetChoices: [
            { id: 'peter1-refuse', text: 'Refuse; you are tired and know better than everyone else.', stance: 'refuse' },
            { id: 'peter1-complain', text: 'Do it with a cynical attitude to prove it will not work.', stance: 'complain' },
            { id: 'peter1-unworthy', text: 'Declare yourself too broken to be of any real use.', stance: 'unworthy' },
            { id: 'peter1-obey', text: 'Drop your skepticism, trust His word, and cast into the deep.', stance: 'trust_and_cast' }
          ],
          storyRetelling: [
            "Peter cleaned wet nets at sunrise after an entire night of catching zero fish. His arms ached and his pockets were empty.",
            "Jesus climbed into his boat and said: 'Put out into deep water and drop your nets.' It made no professional fishing sense.",
            "Peter sighed: 'We worked all night and caught nothing. But because you say so, I will.' The nets tore with an overwhelming harvest."
          ],
          actionLine: 'Take one step of obedience today in an area where you felt like giving up.',
          mirrorBackRules: {
            'peter1-refuse': 'You felt like quitting — Peter was exhausted, but one phrase changed his life: "Because you say so."',
            'peter1-complain': 'You felt cynical — cynicism protects your pride, but faith opens the net.',
            'peter1-unworthy': 'You felt unworthy — Peter begged Jesus to leave his boat, but Jesus called him anyway.',
            'peter1-obey': 'You trusted against exhaustion — that willingness to try one more time is where miracles start.'
          },
          defaultMirrorBack: 'Here is what happened when Peter let down his nets one more time.'
        }
      },
      {
        id: 'series-peter-day-2',
        seriesId: 'series-peter',
        dayNumber: 2,
        momentTitle: 'Walking on Waves',
        narrativeBridge: 'Day 2 tests Peter’s bold initiative against the chaos of the wind.',
        heroName: 'Peter',
        reference: 'Matthew 14:26-31',
        book: 'Matthew',
        chapter: 14,
        verseRange: '26-31',
        theme: 'Faith vs Fear',
        passageText: `When the disciples saw him walking on the lake, they were terrified. "It's a ghost," they said, and cried out in fear. But Jesus immediately said to them: "Take courage! It is I. Don't be afraid." "Lord, if it's you," Peter replied, "tell me to come to you on the water." "Come," he said. Then Peter got down out of the boat, walked on the water and came toward Jesus. But when he saw the wind, he was afraid and, beginning to sink, cried out, "Lord, save me!" Immediately Jesus reached out his hand and caught him.`,
        keyVerseReference: 'Matthew 14:29-30',
        keyVerseText: 'Peter got down out of the boat, walked on the water and came toward Jesus. But when he saw the wind, he was afraid and, beginning to sink, cried out, "Lord, save me!"',
        kjvKeyVerseText: 'And when Peter was come down out of the ship, he walked on the water, to go to Jesus. But when he saw the wind boisterous, he was afraid. — Matthew 14:29-30 (KJV)',
        teaserHook: 'Tomorrow: The crowds all have opinions about who Jesus is, but Peter stands alone to make his confession.',
        backstory: {
          category: 'Culture',
          title: 'The Fourth Watch of the Night',
          content: 'The fourth watch was Roman military terminology for the deepest darkness between 3:00 AM and 6:00 AM. Storms on the Sea of Galilee were sudden and deadly. While eleven disciples stayed frozen in the wooden gunwales, Peter swung his legs over the side.'
        },
        staticFallback: {
          scenarioQuestion: 'You step out in faith, but the wind picks up and you start sinking. What do you do?',
          presetChoices: [
            { id: 'peter2-freeze', text: 'Freeze in terror and let embarrassment drown you.', stance: 'freeze' },
            { id: 'peter2-paddle', text: 'Try to swim back to the boat by your own strength.', stance: 'self_effort' },
            { id: 'peter2-blame', text: 'Blame the people who encouraged you to take the risk.', stance: 'blame' },
            { id: 'peter2-cryout', text: 'Cry out honestly: "Lord, save me!" and grab His hand.', stance: 'cry_out' }
          ],
          storyRetelling: [
            "At 3am in a black storm, Jesus walked toward the disciples on the waves. Only Peter dared call out: 'Lord, tell me to come.'",
            "He swung his legs over the hull and took real steps on liquid water. But the howling wind caught his eye, panic struck, and he sank.",
            "Before the water closed over his head, he yelled three words: 'Lord, save me!' Instantly, Jesus gripped his wrist."
          ],
          actionLine: 'When you feel overwhelmed today, stop measuring the waves and ask for help.',
          mirrorBackRules: {
            'peter2-freeze': 'You hesitated — even sinking Peter was braver than the eleven who never left the boat.',
            'peter2-paddle': 'You tried self-reliance — water cannot hold self-effort; only grace can.',
            'peter2-blame': 'You thought about blame — Peter kept his focus on Jesus, even when drowning.',
            'peter2-cryout': 'You cried out for help — that three-word prayer is the fastest path back to solid ground.'
          },
          defaultMirrorBack: 'Here is what happened when Peter stepped onto the Galilee waves.'
        }
      },
      {
        id: 'series-peter-day-3',
        seriesId: 'series-peter',
        dayNumber: 3,
        momentTitle: 'The Great Confession',
        narrativeBridge: 'Day 3 marks Peter standing apart from public opinion to declare Jesus as Messiah.',
        heroName: 'Peter',
        reference: 'Matthew 16:13-17',
        book: 'Matthew',
        chapter: 16,
        verseRange: '13-17',
        theme: 'Conviction & Truth',
        passageText: `When Jesus came to the region of Caesarea Philippi, he asked his disciples, "Who do people say the Son of Man is?" They replied, "Some say John the Baptist; others say Elijah; and still others, Jeremiah or one of the prophets." "But what about you?" he asked. "Who do you say I am?" Simon Peter answered, "You are the Messiah, the Son of the living God." Jesus replied, "Blessed are you, Simon son of Jonah, for this was not revealed to you by flesh and blood, but by my Father in heaven."`,
        keyVerseReference: 'Matthew 16:16',
        keyVerseText: 'Simon Peter answered, "You are the Messiah, the Son of the living God."',
        kjvKeyVerseText: 'And Simon Peter answered and said, Thou art the Christ, the Son of the living God. — Matthew 16:16 (KJV)',
        teaserHook: 'Tomorrow: At the Last Supper, the Teacher ties a towel around His waist and approaches Peter’s dusty feet.',
        backstory: {
          category: 'Culture',
          title: 'Caesarea Philippi',
          content: 'Caesarea Philippi was a center of pagan Roman temples dedicated to the god Pan and Emperor Augustus. Standing among idols of imperial power, Jesus asked who He was. Peter had the courage to declare a humble Galilean as the true King of the universe.'
        },
        staticFallback: {
          scenarioQuestion: 'Everyone around you has a shallow, popular opinion. Will you stand up for what you know is true?',
          presetChoices: [
            { id: 'peter3-blend', text: 'Blend in with the crowd and echo whatever is trending.', stance: 'blend' },
            { id: 'peter3-stayquiet', text: 'Stay quiet and keep your convictions completely private.', stance: 'stay_quiet' },
            { id: 'peter3-argue', text: 'Start an angry argument with everyone who disagrees.', stance: 'argue' },
            { id: 'peter3-confess', text: 'Speak the truth clearly and without shame.', stance: 'speak_truth' }
          ],
          storyRetelling: [
            "In Caesarea Philippi, Jesus asked His circle what the culture was saying about Him. The answers were safe: 'Elijah, Jeremiah, a prophet.'",
            "Then the question turned personal: 'Who do YOU say I am?' The other disciples hesitated.",
            "Peter stepped forward with total clarity: 'You are the Messiah, the Son of the living God.' Jesus named him the rock."
          ],
          actionLine: 'Stand firm on one core value today, even if nobody else in the room agrees.',
          mirrorBackRules: {
            'peter3-blend': 'You felt the pull of the crowd — the easiest road is echoing what everyone else says.',
            'peter3-stayquiet': 'You stayed silent — quiet conviction has its place, but bold faith speaks up.',
            'peter3-argue': 'You wanted to debate — Peter did not argue with critics; he confessed who Jesus was.',
            'peter3-confess': 'You spoke the truth — standing firm when asked directly is how character is built.'
          },
          defaultMirrorBack: 'Here is what Peter confessed at Caesarea Philippi.'
        }
      },
      {
        id: 'series-peter-day-4',
        seriesId: 'series-peter',
        dayNumber: 4,
        momentTitle: 'The Basin and Towel',
        narrativeBridge: 'Day 4 challenges Peter’s stubborn pride when Jesus washes his dusty feet.',
        heroName: 'Peter',
        reference: 'John 13:5-10',
        book: 'John',
        chapter: 13,
        verseRange: '5-10',
        theme: 'Humility & Receiving Grace',
        passageText: `Jesus poured water into a basin and began to wash his disciples' feet, drying them with the towel that was wrapped around him. He came to Simon Peter, who said to him, "Lord, are you going to wash my feet?" Jesus replied, "You do not realize now what I am doing, but later you will understand." "No," said Peter, "you shall never wash my feet." Jesus answered, "Unless I wash you, you have no part with me." "Then, Lord," Simon Peter replied, "not just my feet but my hands and my head as well!"`,
        keyVerseReference: 'John 13:8',
        keyVerseText: 'Unless I wash you, you have no part with me.',
        kjvKeyVerseText: 'Peter saith unto him, Thou shalt never wash my feet. Jesus answered him, If I wash thee not, thou hast no part with me. — John 13:8 (KJV)',
        teaserHook: 'Tomorrow: Around a charcoal fire in the high priest’s courtyard, a servant girl asks Peter if he knows Jesus.',
        backstory: {
          category: 'Culture',
          title: 'Footwashing in the Ancient World',
          content: 'Walking in open sandals along dirt roads left feet coated in animal waste and mud. Washing feet was considered so demeaning that even Jewish slaves were legally exempt from being forced to perform it. Jesus did it willingly for His followers.'
        },
        staticFallback: {
          scenarioQuestion: 'Someone offers you unearned help or grace. Your pride recoils. How do you respond?',
          presetChoices: [
            { id: 'peter4-reject', text: 'Refuse stubbornly; you must handle everything yourself.', stance: 'refuse' },
            { id: 'peter4-debt', text: 'Accept grudgingly, feeling burdened by debt to repay them.', stance: 'feel_debt' },
            { id: 'peter4-overdo', text: 'Overcompensate and demand the spotlight on yourself.', stance: 'overcompensate' },
            { id: 'peter4-receive', text: 'Drop your pride, accept the grace, and allow yourself to be served.', stance: 'receive_grace' }
          ],
          storyRetelling: [
            "At the Last Supper, Jesus wrapped a rough towel around His waist, poured water, and knelt before His disciples.",
            "Peter was horrified. He recoiled: 'You shall NEVER wash my feet!' It sounded humble, but it was fierce pride refusing help.",
            "Jesus replied: 'Unless I wash you, you have no part with me.' Peter saw his error: 'Lord, not just my feet, but my hands and head!'"
          ],
          actionLine: 'Accept help from someone today without making an excuse or trying to immediately pay them back.',
          mirrorBackRules: {
            'peter4-reject': 'You resisted help — Peter fought it too, until he learned that pride refuses grace.',
            'peter4-debt': 'You felt indebted — grace is a gift, never a commercial transaction.',
            'peter4-overdo': 'You overcompensated — Peter swung to the other extreme, wanting a full bath.',
            'peter4-receive': 'You received grace — letting God wash your feet is the foundation of genuine service.'
          },
          defaultMirrorBack: 'Here is what happened when Jesus knelt before Peter with a basin.'
        }
      },
      {
        id: 'series-peter-day-5',
        seriesId: 'series-peter',
        dayNumber: 5,
        momentTitle: 'The Courtyard Fire',
        narrativeBridge: 'Day 5 records Peter’s lowest moment: promising loyalty, then denying Jesus three times under fear.',
        heroName: 'Peter',
        reference: 'Luke 22:54-62',
        book: 'Luke',
        chapter: 22,
        verseRange: '54-62',
        theme: 'Failure & Grief',
        passageText: `Then seizing him, they led him away and took him into the house of the high priest. Peter followed at a distance. And when some there had kindled a fire in the middle of the courtyard and had sat down together, Peter sat down with them. A servant girl saw him seated there in the firelight. She looked closely at him and said, "This man was with him." But he denied it. "Woman, I don't know him," he said... A third time he denied it, and immediately the rooster crowed. The Lord turned and looked straight at Peter. Then Peter remembered... and he went outside and wept bitterly.`,
        keyVerseReference: 'Luke 22:61-62',
        keyVerseText: 'The Lord turned and looked straight at Peter. Then Peter remembered... And he went outside and wept bitterly.',
        kjvKeyVerseText: 'And the Lord turned, and looked upon Peter. And Peter remembered the word of the Lord... And Peter went out, and wept bitterly. — Luke 22:61-62 (KJV)',
        teaserHook: 'Tomorrow: The smell of another charcoal fire on the shore of Galilee, and Jesus makes breakfast.',
        backstory: {
          category: 'Author',
          title: 'The Charcoal Fire in the High Priest’s Courtyard',
          content: 'Peter had boasted hours earlier: "Even if all fall away, I will never fall away!" Now warming his hands among guards and servants, a young gatekeeper’s question cracked his armor. The crow of the rooster shattered Peter’s self-made bravado.'
        },
        staticFallback: {
          scenarioQuestion: 'You just failed completely at something you swore you would never do. What do you do with the guilt?',
          presetChoices: [
            { id: 'peter5-numb', text: 'Numb the pain and pretend you never cared about it anyway.', stance: 'numb' },
            { id: 'peter5-defend', text: 'Make excuses and blame the stressful environment.', stance: 'defend' },
            { id: 'peter5-giveup', text: 'Decide you are a fraud and quit your journey forever.', stance: 'give_up' },
            { id: 'peter5-weep', text: 'Face your failure with honest tears, knowing failure is not the end.', stance: 'honest_repentance' }
          ],
          storyRetelling: [
            "Hours after swearing he would die for Jesus, Peter warmed his hands over the high priest's courtyard fire.",
            "A servant girl recognized his northern accent. Panicking for his life, Peter cursed and swore: 'I do not know the man!'",
            "In that instant, the rooster crowed. Jesus turned from across the courtyard and looked straight at Peter. Peter walked into the night and wept."
          ],
          actionLine: 'Acknowledge your biggest regret today before God without spinning an excuse.',
          mirrorBackRules: {
            'peter5-numb': 'You felt like shutting down — Peter wept bitterly instead of hardening his heart.',
            'peter5-defend': 'You made excuses — Peter offered zero spin; he met the gaze of Jesus in sorrow.',
            'peter5-giveup': 'You felt like quitting — Peter fell to rock bottom, but his story was far from over.',
            'peter5-weep': 'You faced your brokenness — that raw honesty is what made Peter restorable.'
          },
          defaultMirrorBack: 'Here is what happened by the courtyard fire in Jerusalem.'
        }
      },
      {
        id: 'series-peter-day-6',
        seriesId: 'series-peter',
        dayNumber: 6,
        momentTitle: 'Breakfast on the Shore',
        narrativeBridge: 'Day 6 brings restoration: three questions by a charcoal fire to heal three denials.',
        heroName: 'Peter',
        reference: 'John 21:12-17',
        book: 'John',
        chapter: 21,
        verseRange: '12-17',
        theme: 'Restoration & Grace',
        passageText: `Jesus said to them, "Come and have breakfast." None of the disciples dared ask him, "Who are you?" They knew it was the Lord... When they had finished eating, Jesus said to Simon Peter, "Simon son of Jonah, do you love me more than these?" "Yes, Lord," he said, "you know that I love you." Jesus said, "Feed my lambs." Again Jesus said, "Simon son of Jonah, do you love me?" He answered, "Yes, Lord, you know that I love you." Jesus said, "Take care of my sheep." The third time he said to him, "Simon son of Jonah, do you love me?" Peter was hurt because Jesus asked him the third time... He said, "Lord, you know all things; you know that I love you." Jesus said, "Feed my sheep."`,
        keyVerseReference: 'John 21:17',
        keyVerseText: 'Lord, you know all things; you know that I love you. Jesus said, "Feed my sheep."',
        kjvKeyVerseText: 'Lord, thou knowest all things; thou knowest that I love thee. Jesus saith unto him, Feed my sheep. — John 21:17 (KJV)',
        teaserHook: 'Tomorrow: The broken fisherman stands before thousands on Pentecost as an unbreakable pillar.',
        backstory: {
          category: 'Culture',
          title: 'The Second Charcoal Fire',
          content: 'The Greek word for "charcoal fire" (anthrakia) appears only twice in the entire New Testament: once when Peter denied Jesus, and once on the beach where Jesus made breakfast. Jesus took Peter back to the exact setting of his failure to give him three chances to reaffirm his love.'
        },
        staticFallback: {
          scenarioQuestion: 'God offers you a fresh start after a deep failure. Can you accept His forgiveness?',
          presetChoices: [
            { id: 'peter6-doubt', text: 'Doubt it; assume He will hold your past against you forever.', stance: 'doubt' },
            { id: 'peter6-bargain', text: 'Try to prove your worthiness through frantic overachievement.', stance: 'bargain' },
            { id: 'peter6-dodge', text: 'Dodge the conversation and change the subject.', stance: 'dodge' },
            { id: 'peter6-affirm', text: 'Answer simply with love and step back into your purpose.', stance: 'reaffirm_love' }
          ],
          storyRetelling: [
            "After the resurrection, Peter retreated to his old fishing boats on Galilee. A stranger on the shore called out and cooked breakfast.",
            "By a crackling charcoal fire, Jesus looked at Peter and asked three times: 'Simon, do you love me?'",
            "For each of Peter's three denials, Jesus gave him one assignment: 'Feed my sheep.' His past was erased; his calling was restored."
          ],
          actionLine: 'Forgive yourself today for a past mistake that God has already forgiven.',
          mirrorBackRules: {
            'peter6-doubt': 'You doubted forgiveness — Jesus cooked breakfast for the friend who betrayed Him.',
            'peter6-bargain': 'You tried to earn your way back — Jesus asked for love, not a checklist of good deeds.',
            'peter6-dodge': 'You wanted to dodge the pain — Jesus addressed the wound directly to heal it permanently.',
            'peter6-affirm': 'You reaffirmed love — that simple honesty is how Peter was rebuilt into a leader.'
          },
          defaultMirrorBack: 'Here is what Jesus said to Peter on the shore of Galilee.'
        }
      },
      {
        id: 'series-peter-day-7',
        seriesId: 'series-peter',
        dayNumber: 7,
        momentTitle: 'The Rock at Pentecost',
        narrativeBridge: 'Day 7 lands Peter’s transformation: preaching boldly to thousands with zero fear of Rome.',
        heroName: 'Peter',
        reference: 'Acts 2:14-24',
        book: 'Acts',
        chapter: 2,
        verseRange: '14-24',
        theme: 'Courage & Destiny',
        passageText: `Then Peter stood up with the Eleven, raised his voice and addressed the crowd: "Fellow Jews and all of you who live in Jerusalem, let me explain this to you; listen carefully to what I say... Jesus of Nazareth was a man accredited by God to you by miracles, wonders and signs... This man was handed over to you by God's deliberate plan and foreknowledge; and you, with the help of wicked men, put him to death by nailing him to the cross. But God raised him from the dead, freeing him from the agony of death!"`,
        keyVerseReference: 'Acts 2:24',
        keyVerseText: 'God raised him from the dead, freeing him from the agony of death, because it was impossible for death to keep its hold on him.',
        kjvKeyVerseText: 'Whom God hath raised up, having loosed the pains of death: because it was not possible that he should be holden of it. — Acts 2:24 (KJV)',
        teaserHook: 'Your week with Peter is complete. Seven days from sinking waves to an unbreakable rock.',
        backstory: {
          category: 'People',
          title: 'Pentecost in Jerusalem',
          content: 'Just fifty days earlier, Peter hid behind locked doors terrified of being arrested. On the feast of Pentecost, filled with the Holy Spirit, he stepped into the public square before thousands of travelers and accused the city rulers without flinching.'
        },
        staticFallback: {
          scenarioQuestion: 'Looking back over your week, how will you stand firm in your faith going forward?',
          presetChoices: [
            { id: 'peter7-retreat', text: 'Retreat back to comfortable, quiet routines where nobody notices.', stance: 'retreat' },
            { id: 'peter7-rely', text: 'Rely on your own willpower and hope you do not fail again.', stance: 'rely_self' },
            { id: 'peter7-hesitate', text: 'Wait until life feels perfectly safe and predictable.', stance: 'hesitate' },
            { id: 'peter7-stand', text: 'Stand up with courage, empowered by God’s Spirit, and live out your purpose.', stance: 'stand_firm' }
          ],
          storyRetelling: [
            "Fifty days after cowering before a servant girl, Peter stepped onto the streets of Jerusalem during Pentecost.",
            "With the Eleven standing beside him, he raised his voice with fearless conviction, declaring Jesus risen from the dead.",
            "Three thousand lives were transformed that day. The fisherman who promised too much had finally become the rock Jesus envisioned."
          ],
          actionLine: 'Take one bold action today that reflects your true faith and values.',
          mirrorBackRules: {
            'peter7-retreat': 'You felt like retreating — Peter spent years hiding until the Spirit gave him courage.',
            'peter7-rely': 'You relied on self-will — self-will cracked at the courtyard fire; the Spirit stood firm at Pentecost.',
            'peter7-hesitate': 'You waited for safety — courage is not the absence of fear, but faith in action.',
            'peter7-stand': 'You chose to stand firm — that is the enduring legacy of Peter’s restored life.'
          },
          defaultMirrorBack: 'Here is how Peter stood up before Jerusalem on Pentecost.'
        }
      }
    ]
  },

  // =========================================================================
  // 3. ESTHER — Courage in the Palace of Shadows
  // =========================================================================
  {
    id: 'series-esther',
    characterId: 'esther',
    title: 'Esther: Courage in the Palace of Shadows',
    heroName: 'Esther',
    tagline: 'An orphan queen who risked her life to reverse an empire’s death edict',
    hook: 'Seven decisions in the palace of Susa: timing, fasting, and standing when silence is deadly.',
    avatarIcon: '👑',
    weekTheme: 'Courage under pressure, divine timing, and speaking truth',
    moments: [
      {
        id: 'series-esther-day-1',
        seriesId: 'series-esther',
        dayNumber: 1,
        momentTitle: 'The Crown and Silence',
        narrativeBridge: 'Day 1: Esther navigates survival in the Persian harem without revealing her Jewish roots.',
        heroName: 'Esther',
        reference: 'Esther 2:15-20',
        book: 'Esther',
        chapter: 2,
        verseRange: '15-20',
        theme: 'Identity & Wisdom',
        passageText: `Now Esther had won the favor of everyone who saw her... The king was attracted to Esther more than to any of the other women, and she won his favor and approval more than any of the other virgins. So he set a royal crown on her head and made her queen instead of Vashti... But Esther had kept secret her family background and nationality just as Mordecai had told her to do, for she continued to follow Mordecai's instructions as she had done when he was bringing her up.`,
        keyVerseReference: 'Esther 2:20',
        keyVerseText: 'Esther had kept secret her family background and nationality just as Mordecai had told her to do.',
        kjvKeyVerseText: 'Esther had not yet shewed her kindred nor her people; as Mordecai had charged her. — Esther 2:20 (KJV)',
        teaserHook: 'Tomorrow: The prime minister pays the emperor ten thousand silver talents to sign a decree of total destruction.',
        backstory: {
          category: 'Culture',
          title: 'The Citadel of Susa',
          content: 'Esther was an exiled Jewish orphan raised by her cousin Mordecai in the Persian capital of Susa. When Queen Vashti was deposed for refusing to parade her beauty, young women across 127 provinces were rounded up. In a lavish yet perilous pagan palace, discretion was a matter of life or death.'
        },
        staticFallback: {
          scenarioQuestion: 'You are placed in a foreign, high-pressure environment. How do you guard your integrity?',
          presetChoices: [
            { id: 'esther1-compromise', text: 'Blend in completely and abandon your moral heritage.', stance: 'compromise' },
            { id: 'esther1-rebel', text: 'Fight every battle aggressively from day one without tact.', stance: 'rebel' },
            { id: 'esther1-panic', text: 'Panic and assume God has abandoned you in this secular place.', stance: 'panic' },
            { id: 'esther1-wisdom', text: 'Listen to wise counsel, master the environment, and bide your time.', stance: 'wise_discretion' }
          ],
          storyRetelling: [
            "An orphan Jewish exile named Hadassah was taken into the royal citadel of King Xerxes in Susa.",
            "Her cousin Mordecai warned her: 'Do not reveal your people or your family.' In a cutthroat palace, wisdom meant knowing when to keep quiet.",
            "Esther won the favor of everyone she met with grace, restraint, and modesty. The king set the royal crown upon her head."
          ],
          actionLine: 'Practice thoughtful discretion today: think twice before speaking in a tense room.',
          mirrorBackRules: {
            'esther1-compromise': 'You felt like blending in — Esther adapted her dress, but kept her sacred allegiance to God intact.',
            'esther1-rebel': 'You felt like fighting everything — Esther knew that winning influence takes patience before courage.',
            'esther1-panic': 'You feared God was absent — God’s name is never mentioned in Esther, yet His invisible hand is everywhere.',
            'esther1-wisdom': 'You chose wise discretion — timing and self-control are the foundation of true leadership.'
          },
          defaultMirrorBack: 'Here is how Esther carried herself with quiet dignity in the Persian court.'
        }
      },
      {
        id: 'series-esther-day-2',
        seriesId: 'series-esther',
        dayNumber: 2,
        momentTitle: 'The Edict of Annihilation',
        narrativeBridge: 'Day 2: Haman’s pride crafts a decree to wipe out an entire people, testing Esther’s security.',
        heroName: 'Esther',
        reference: 'Esther 3:8-13',
        book: 'Esther',
        chapter: 3,
        verseRange: '8-13',
        theme: 'Confronting Injustice',
        passageText: `Then Haman said to King Xerxes, "There is a certain people dispersed among the peoples in all the provinces of your kingdom who keep themselves separate. Their customs are different from those of all other people, and they do not obey the king's laws; it is not in the king's best interest to tolerate them. If it pleases the king, let a decree be issued to destroy them, and I will give ten thousand talents of silver into the royal treasury for the men who carry out this business." So the king took his signet ring from his finger and gave it to Haman... Dispatches were sent by couriers to all the king's provinces with the order to destroy, kill and annihilate all the Jews.`,
        keyVerseReference: 'Esther 3:13',
        keyVerseText: 'Dispatches were sent by couriers to all the king’s provinces with the order to destroy, kill and annihilate all the Jews.',
        kjvKeyVerseText: 'And the letters were sent by posts into all the king’s provinces, to destroy, to kill, and to cause to perish, all Jews. — Esther 3:13 (KJV)',
        teaserHook: 'Tomorrow: Mordecai sends a message across the palace gates: "Who knows whether you have come to the kingdom for such a time as this?"',
        backstory: {
          category: 'People',
          title: 'Haman the Agagite',
          content: 'Haman was a descendant of Agag, the Amalekite king whom Saul had spared centuries earlier. His personal grievance against Mordecai for refusing to bow turned into genocidal fury against an entire ethnic population.'
        },
        staticFallback: {
          scenarioQuestion: 'A systemic injustice or cruel policy threatens innocent people. How do you respond?',
          presetChoices: [
            { id: 'esther2-ignore', text: 'Pretend it does not concern you because you are personally safe.', stance: 'ignore' },
            { id: 'esther2-despair', text: 'Give up in cynical despair; the powerful always win.', stance: 'despair' },
            { id: 'esther2-comply', text: 'Quietly comply with whatever authority dictates.', stance: 'comply' },
            { id: 'esther2-awake', text: 'Recognize the threat, feel the grief, and prepare to act.', stance: 'awake' }
          ],
          storyRetelling: [
            "Haman the prime minister cast lots (Pur) to choose a date for exterminating every Jewish man, woman, and child across Persia.",
            "He offered the king ten thousand talents of silver to seal the deal. Xerxes slipped his signet ring to Haman without even reading the decree.",
            "Fast couriers rode out to all 127 provinces. While the city of Susa was bewildered with grief, the palace carried on business as usual."
          ],
          actionLine: 'Pay attention to someone being mistreated or excluded today and stand up for them.',
          mirrorBackRules: {
            'esther2-ignore': 'You felt like looking away — palace walls can make you forget the pain outside the gates.',
            'esther2-despair': 'You felt powerless — evil seems invincible until ordinary people find their voice.',
            'esther2-comply': 'You considered complying — compliance with injustice always costs your soul in the end.',
            'esther2-awake': 'You woke up to reality — seeing truth clearly is the required first step toward courage.'
          },
          defaultMirrorBack: 'Here is what happened when Haman’s decree was posted across Susa.'
        }
      },
      {
        id: 'series-esther-day-3',
        seriesId: 'series-esther',
        dayNumber: 3,
        momentTitle: 'For Such a Time as This',
        narrativeBridge: 'Day 3 marks the turning point: choosing between personal safety and risking everything.',
        heroName: 'Esther',
        reference: 'Esther 4:10-16',
        book: 'Esther',
        chapter: 4,
        verseRange: '10-16',
        theme: 'Destiny & Courage',
        passageText: `Esther sent word to Mordecai: "All the king's officials and the people of the royal provinces know that for any man or woman who approaches the king in the inner court without being summoned the king has but one law: that they be put to death unless the king extends the gold scepter." When Esther's words were reported to Mordecai, he sent back this answer: "Do not think that because you are in the king's house you alone of all the Jews will escape... And who knows but that you have come to your royal position for such a time as this?" Then Esther sent this reply to Mordecai: "Go, gather together all the Jews who are in Susa, and fast for me... If I perish, I perish."`,
        keyVerseReference: 'Esther 4:14',
        keyVerseText: 'And who knows but that you have come to your royal position for such a time as this?',
        kjvKeyVerseText: 'And who knoweth whether thou art come to the kingdom for such a time as this? — Esther 4:14 (KJV)',
        teaserHook: 'Tomorrow: Dressed in royal robes, Esther walks across the stone courtyard uninvited toward the king’s raised golden scepter.',
        backstory: {
          category: 'Culture',
          title: 'The Uninvited Approach to the Throne',
          content: 'In Persian law, approaching the king’s throne without a direct summons was punishable by immediate execution. Guards with battleaxes stood ready to strike down intruders unless the king lowered his golden scepter.'
        },
        staticFallback: {
          scenarioQuestion: 'Speaking up could cost your status, your comfort, or your career. Do you take the risk?',
          presetChoices: [
            { id: 'esther3-safe', text: 'Stay quiet and protect your own position at all costs.', stance: 'safe' },
            { id: 'esther3-delay', text: 'Wait indefinitely for an easier, risk-free opportunity.', stance: 'delay' },
            { id: 'esther3-pass', text: 'Tell yourself that someone else is better qualified to fix this.', stance: 'pass_buck' },
            { id: 'esther3-perish', text: 'Fast, pray, and step forward: "If I perish, I perish."', stance: 'courage_step' }
          ],
          storyRetelling: [
            "Mordecai warned Esther: 'Do not think your royal crown will protect you when the slaughter begins.'",
            "He challenged her soul: 'Who knows whether you have come to the kingdom for such a time as this?'",
            "Esther stopped trembling. She asked every Jew in Susa to fast with her for three days. Her answer was absolute: 'If I perish, I perish.'"
          ],
          actionLine: 'Identify one hard conversation you have been avoiding and commit to having it with grace.',
          mirrorBackRules: {
            'esther3-safe': 'You chose self-protection — Esther learned that keeping quiet in crisis destroys your calling.',
            'esther3-delay': 'You wanted to delay — dangerous moments rarely offer comfortable second chances.',
            'esther3-pass': 'You looked for an excuse — God put you in this exact position for a reason.',
            'esther3-perish': 'You chose radical courage — that resolve is what bends history toward justice.'
          },
          defaultMirrorBack: 'Here is what Esther declared before stepping into the king’s court.'
        }
      },
      {
        id: 'series-esther-day-4',
        seriesId: 'series-esther',
        dayNumber: 4,
        momentTitle: 'The Scepter and the Feast',
        narrativeBridge: 'Day 4 shows strategic patience: winning favor before making the ultimate accusation.',
        heroName: 'Esther',
        reference: 'Esther 5:1-8',
        book: 'Esther',
        chapter: 5,
        verseRange: '1-8',
        theme: 'Patience & Timing',
        passageText: `On the third day Esther put on her royal robes and stood in the inner court of the palace, in front of the king's hall... When he saw Queen Esther standing in the court, he was pleased with her and held out to her the gold scepter that was in his hand. So Esther approached and touched the tip of the scepter. Then the king asked, "What is it, Queen Esther? What is your request? Even up to half the kingdom, it will be given you." "If it pleases the king," replied Esther, "let the king, together with Haman, come today to a banquet I have prepared for him."`,
        keyVerseReference: 'Esther 5:2',
        keyVerseText: 'When he saw Queen Esther standing in the court, he was pleased with her and held out to her the gold scepter that was in his hand.',
        kjvKeyVerseText: 'When the king saw Esther the queen standing in the court... she obtained favour in his sight: and the king held out to Esther the golden sceptre. — Esther 5:2 (KJV)',
        teaserHook: 'Tomorrow: Over wine at the second banquet, Esther points directly across the table at the prime minister.',
        backstory: {
          category: 'Author',
          title: 'The Art of Timing',
          content: 'Esther could have blurted out her accusation the second Xerxes extended the scepter. Instead, she showed incredible emotional intelligence: she invited the king and Haman to an intimate banquet, building suspense and curiosity before delivering the blow.'
        },
        staticFallback: {
          scenarioQuestion: 'You have someone’s attention, but dropping all your demands right now might backfire. What do you do?',
          presetChoices: [
            { id: 'esther4-blur', text: 'Blur out everything in a flood of raw emotion immediately.', stance: 'blurt' },
            { id: 'esther4-freeze', text: 'Freeze up and ask for nothing at all out of nervousness.', stance: 'freeze' },
            { id: 'esther4-manipulate', text: 'Use flattery and manipulative games to get your way.', stance: 'manipulate' },
            { id: 'esther4-host', text: 'Create hospitable space, build trust, and wait for the right moment to speak.', stance: 'strategic_timing' }
          ],
          storyRetelling: [
            "After three days of fasting, Esther dressed in royal garments and stood in the court. Xerxes saw her and held out the golden scepter.",
            "She stepped forward and touched the tip. The king asked: 'What is your request? Up to half the kingdom!'",
            "Instead of demanding justice on the spot, Esther invited the king and Haman to a private dinner. She controlled the atmosphere with patience."
          ],
          actionLine: 'Before bringing up a delicate issue today, set the right time and environment to be heard.',
          mirrorBackRules: {
            'esther4-blur': 'You felt like blurting it out — raw timing often ruins righteous causes; patience preserves them.',
            'esther4-freeze': 'You hesitated — touching the scepter took bravery, but speaking took wisdom.',
            'esther4-manipulate': 'You thought about manipulation — Esther used genuine hospitality, not deceit.',
            'esther4-host': 'You chose strategic timing — emotional intelligence turns a dangerous confrontation into victory.'
          },
          defaultMirrorBack: 'Here is what happened when Esther touched the golden scepter.'
        }
      },
      {
        id: 'series-esther-day-5',
        seriesId: 'series-esther',
        dayNumber: 5,
        momentTitle: 'Exposing the Adversary',
        narrativeBridge: 'Day 5 delivers the climax: unmasking Haman in front of the emperor.',
        heroName: 'Esther',
        reference: 'Esther 7:1-6',
        book: 'Esther',
        chapter: 7,
        verseRange: '1-6',
        theme: 'Speaking Truth to Power',
        passageText: `So the king and Haman went to Queen Esther's banquet, and as they were drinking wine on the second day, the king again asked, "Queen Esther, what is your petition? It will be given you. What is your request? Even up to half the kingdom, it will be granted." Then Queen Esther answered, "If I have found favor with you, Your Majesty, and if it pleases you, grant me my life—this is my petition. And spare my people—this is my request. For I and my people have been sold to be destroyed, killed and annihilated..." King Xerxes asked Queen Esther, "Who is he? Where is he—the man who has dared to do such a thing?" Esther said, "An adversary and enemy! This vile Haman!"`,
        keyVerseReference: 'Esther 7:6',
        keyVerseText: 'Esther said, "An adversary and enemy! This vile Haman!" Then Haman was terrified before the king and queen.',
        kjvKeyVerseText: 'And Esther said, The adversary and enemy is this wicked Haman. Then Haman was afraid before the king and the queen. — Esther 7:6 (KJV)',
        teaserHook: 'Tomorrow: The decree written in the king’s name cannot be revoked—how can an unchangeable death law be stopped?',
        backstory: {
          category: 'People',
          title: 'The Banquet of Wine',
          content: 'Under Persian law, a royal decree sealed with the king’s signet ring could never be repealed. By revealing her Jewish identity at the banquet, Esther forced Xerxes to choose between his loyal queen and his corrupt prime minister.'
        },
        staticFallback: {
          scenarioQuestion: 'The moment has arrived to call out corruption or betrayal directly. Do you speak up?',
          presetChoices: [
            { id: 'esther5-soften', text: 'Soften the truth so nobody gets their feelings hurt.', stance: 'soften' },
            { id: 'esther5-backdown', text: 'Back down at the last second and let the injustice continue.', stance: 'back_down' },
            { id: 'esther5-gossip', text: 'Talk behind their back to friends instead of confronting the source.', stance: 'gossip' },
            { id: 'esther5-unmask', text: 'Look them in the eye and name the truth with total clarity.', stance: 'unmask_truth' }
          ],
          storyRetelling: [
            "At the second banquet, Xerxes asked Esther again: 'What is your request?'",
            "She looked at her husband and king: 'Grant me my life, and spare my people! For we have been sold to be destroyed.'",
            "Xerxes raged: 'Who dared to do this?' Esther pointed across the table: 'This vile Haman!' The prime minister turned pale with terror."
          ],
          actionLine: 'Speak with uncompromising clarity today in a situation that needs the honest truth.',
          mirrorBackRules: {
            'esther5-soften': 'You felt like softening the blow — compromise protects evil; truth liberates.',
            'esther5-backdown': 'You hesitated — backing down under pressure gives the enemy permanent control.',
            'esther5-gossip': 'You thought about venting privately — gossip never cures injustice; direct confrontation does.',
            'esther5-unmask': 'You spoke direct truth — pointing to the real issue without flinching saves lives.'
          },
          defaultMirrorBack: 'Here is what Esther said when she unmasked Haman.'
        }
      },
      {
        id: 'series-esther-day-6',
        seriesId: 'series-esther',
        dayNumber: 6,
        momentTitle: 'Reversing the Irreversible',
        narrativeBridge: 'Day 6 tackles systemic hurdles: finding a legal way to defend life against an unchangeable law.',
        heroName: 'Esther',
        reference: 'Esther 8:3-11',
        book: 'Esther',
        chapter: 8,
        verseRange: '3-11',
        theme: 'Wisdom & Persistence',
        passageText: `Esther again pleaded with the king, falling at his feet and weeping. She begged him to put an end to the evil plan of Haman... Then the king extended the gold scepter to Esther and she arose and stood before him... Xerxes replied to Queen Esther and to Mordecai the Jew, "Because Haman attacked the Jews, I have given his estate to Esther... Now write another decree in the king's name in behalf of the Jews as seems best to you, and seal it with the king's signet ring—for no document written in the king's name and sealed with his ring can be revoked." The king's edict granted the Jews in every city the right to assemble and protect themselves.`,
        keyVerseReference: 'Esther 8:11',
        keyVerseText: 'The king’s edict granted the Jews in every city the right to assemble and protect themselves.',
        kjvKeyVerseText: 'Wherein the king granted the Jews which were in every city to gather themselves together, and to stand for their life. — Esther 8:11 (KJV)',
        teaserHook: 'Tomorrow: How a generation of exiles turned national terror into an annual feast of perpetual celebration.',
        backstory: {
          category: 'Culture',
          title: 'The Law of the Medes and Persians',
          content: 'Because an emperor’s word was considered infallible, Persian edicts could never be canceled once signed. Instead of giving up, Mordecai and Esther crafted a counter-edict authorizing every Jewish community across the empire to arm, assemble, and fight back with the full sanction of the crown.'
        },
        staticFallback: {
          scenarioQuestion: 'A policy or situation seems permanent and impossible to change. How do you tackle it?',
          presetChoices: [
            { id: 'esther6-quit', text: 'Give up; the system is rigged and change is impossible.', stance: 'quit' },
            { id: 'esther6-rage', text: 'Rage blindly against the rules without a constructive plan.', stance: 'rage' },
            { id: 'esther6-settle', text: 'Settle for partial survival and accept defeat.', stance: 'settle' },
            { id: 'esther6-innovate', text: 'Find a creative, legal, and redemptive way forward within the constraints.', stance: 'innovate_redemption' }
          ],
          storyRetelling: [
            "Haman was gone, but his irreversible death edict was still speeding to every province under royal seal.",
            "Esther fell at the king's feet in tears once more. She didn't celebrate halfway; she asked for a counter-decree.",
            "Mordecai drafted an edict giving all Jews legal authority to assemble and defend their families. Despair turned into courage."
          ],
          actionLine: 'Do not settle for a half-solution today; see your commitment through to the end.',
          mirrorBackRules: {
            'esther6-quit': 'You felt like giving up — bureaucracy seems impossible until wisdom finds an opening.',
            'esther6-rage': 'You felt anger — anger without a strategy burns bridges; wisdom drafts a counter-decree.',
            'esther6-settle': 'You thought of settling — Esther kept fighting until her people were fully safe.',
            'esther6-innovate': 'You found creative redemption — that persistence rewrites irreversible situations.'
          },
          defaultMirrorBack: 'Here is what happened when Esther and Mordecai issued the counter-decree.'
        }
      },
      {
        id: 'series-esther-day-7',
        seriesId: 'series-esther',
        dayNumber: 7,
        momentTitle: 'The Feast of Purim',
        narrativeBridge: 'Day 7 lands Esther’s legacy: institutionalizing remembrance so future generations remember God’s deliverance.',
        heroName: 'Esther',
        reference: 'Esther 9:20-28',
        book: 'Esther',
        chapter: 9,
        verseRange: '20-28',
        theme: 'Remembrance & Joy',
        passageText: `Mordecai recorded these events, and he sent letters to all the Jews throughout the provinces of King Xerxes, near and far, to have them celebrate annually the fourteenth and fifteenth days of the month of Adar as the time when the Jews got relief from their enemies, and as the month when their sorrow was turned into joy and their mourning into a day of celebration. He wrote them to observe the days as days of feasting and joy and giving presents of food to one another and gifts to the poor... These days should be remembered and observed in every generation.`,
        keyVerseReference: 'Esther 9:22',
        keyVerseText: 'Observe the days as days of feasting and joy and giving presents of food to one another and gifts to the poor.',
        kjvKeyVerseText: 'As the days wherein the Jews rested from their enemies... that they should make them days of feasting and joy, and of sending portions one to another, and gifts to the poor. — Esther 9:22 (KJV)',
        teaserHook: 'Your week with Esther is complete. Seven days of courage that preserved an entire nation.',
        backstory: {
          category: 'Culture',
          title: 'The Celebration of Purim',
          content: 'Purim comes from the word Pur, meaning "the lot." Haman cast lots to destroy God’s people, but God overturned the lot into deliverance. To this day, Jewish communities celebrate Purim by reading the scroll of Esther, sending food to neighbors, and giving gifts to the poor.'
        },
        staticFallback: {
          scenarioQuestion: 'After surviving a season of high tension, how do you mark the victory?',
          presetChoices: [
            { id: 'esther7-forget', text: 'Move on immediately and forget how close you came to disaster.', stance: 'forget' },
            { id: 'esther7-gloat', text: 'Gloat over the defeat of the people who tried to harm you.', stance: 'gloat' },
            { id: 'esther7-fear', text: 'Stay trapped in fear waiting for the next catastrophe.', stance: 'fear' },
            { id: 'esther7-celebrate', text: 'Celebrate with gratitude, share your joy with others, and bless the needy.', stance: 'generous_celebration' }
          ],
          storyRetelling: [
            "The day chosen for destruction became the day of greatest deliverance. Mourning turned into dancing across Persia.",
            "Queen Esther and Mordecai established the Feast of Purim: not just to remember a battle, but to feast and care for the poor.",
            "An orphan girl who entered the palace in fearful silence left a legacy of courage celebrated thousands of years later."
          ],
          actionLine: 'Share something generous with someone in need today to celebrate God’s goodness in your life.',
          mirrorBackRules: {
            'esther7-forget': 'You felt like moving on — remembering where God carried you from builds enduring faith.',
            'esther7-gloat': 'You thought about gloating — Esther celebrated by feeding the poor, not by exulting in cruelty.',
            'esther7-fear': 'You felt anxious about tomorrow — peace comes from knowing God holds the final outcome.',
            'esther7-celebrate': 'You chose generous celebration — joy shared with others is the highest fruit of deliverance.'
          },
          defaultMirrorBack: 'Here is how Esther established the Feast of Purim.'
        }
      }
    ]
  },

  // =========================================================================
  // 4. PAUL — From Inquisitor to Ambassador
  // =========================================================================
  {
    id: 'series-paul',
    characterId: 'paul',
    title: 'Paul: From Inquisitor to Ambassador',
    heroName: 'Paul',
    tagline: 'The intellectual persecutor who met Christ and turned the Roman empire upside down',
    hook: 'Trace Paul across seven crises: blindness, midnight escapes, prison songs, and shipwreck.',
    avatarIcon: '⚔️',
    weekTheme: 'Transformation, resilience, and missionary courage',
    moments: [
      {
        id: 'series-paul-day-1',
        seriesId: 'series-paul',
        dayNumber: 1,
        momentTitle: 'The Damascus Road',
        narrativeBridge: 'Day 1: Saul’s self-righteous zeal is struck blind by the blazing light of Jesus.',
        heroName: 'Paul',
        reference: 'Acts 9:1-9',
        book: 'Acts',
        chapter: 9,
        verseRange: '1-9',
        theme: 'Humility & Transformation',
        passageText: `Meanwhile, Saul was still breathing out murderous threats against the Lord's disciples. He went to the high priest and asked him for letters to the synagogues in Damascus... As he neared Damascus on his journey, suddenly a light from heaven flashed around him. He fell to the ground and heard a voice say to him, "Saul, Saul, why do you persecute me?" "Who are you, Lord?" Saul asked. "I am Jesus, whom you are persecuting," he replied. "Now get up and go into the city, and you will be told what you must do."`,
        keyVerseReference: 'Acts 9:4-5',
        keyVerseText: 'He fell to the ground and heard a voice say to him, "Saul, Saul, why do you persecute me?" "Who are you, Lord?" Saul asked.',
        kjvKeyVerseText: 'And he fell to the earth, and heard a voice saying unto him, Saul, Saul, why persecutest thou me? And he said, Who art thou, Lord? — Acts 9:4-5 (KJV)',
        teaserHook: 'Tomorrow: Blind and helpless on Straight Street, Saul waits in the dark for an enemy to lay hands on his eyes.',
        backstory: {
          category: 'People',
          title: 'Saul of Tarsus',
          content: 'Saul was a brilliant Pharisee trained under the elite rabbi Gamaliel. He viewed the Jesus movement as a blasphemous heresy that threatened Israel’s covenant with God. Armed with warrants from the Sanhedrin, he was prepared to drag women and children in chains to Jerusalem.'
        },
        staticFallback: {
          scenarioQuestion: 'You discover that something you were intensely certain about was totally wrong. How do you respond?',
          presetChoices: [
            { id: 'paul1-double', text: 'Double down aggressively to defend your ego.', stance: 'double_down' },
            { id: 'paul1-blame', text: 'Blame the people who taught you that viewpoint.', stance: 'blame' },
            { id: 'paul1-hide', text: 'Pretend you never held that opinion in the first place.', stance: 'hide' },
            { id: 'paul1-surrender', text: 'Fall to your knees, drop your certainty, and ask: "Lord, what do you want me to do?"', stance: 'humble_surrender' }
          ],
          storyRetelling: [
            "Saul rode toward Damascus breathing threats, utterly convinced he was defending God by hunting Christians.",
            "At noon, a blinding light knocked him off his mount. A voice shattered his theology: 'Saul, why do you persecute me?'",
            "The brilliant intellectual was led by the hand into Damascus—blind, helpless, and stripped of his arrogance."
          ],
          actionLine: 'Be willing to admit you were wrong in an ongoing debate today and listen humbly.',
          mirrorBackRules: {
            'paul1-double': 'You felt like doubling down — Saul thought zeal was righteousness until Jesus opened his eyes.',
            'paul1-blame': 'You looked to blame mentors — Saul owned his encounter directly without blaming the Pharisees.',
            'paul1-hide': 'You thought about hiding — admitting error publicly is the only way to genuine rebirth.',
            'paul1-surrender': 'You surrendered your certainty — asking "Who are you, Lord?" is where wisdom begins.'
          },
          defaultMirrorBack: 'Here is what happened on the dusty road to Damascus.'
        }
      },
      {
        id: 'series-paul-day-2',
        seriesId: 'series-paul',
        dayNumber: 2,
        momentTitle: 'Straight Street',
        narrativeBridge: 'Day 2: Three days of blind fasting in the house of Judas, learning dependency.',
        heroName: 'Paul',
        reference: 'Acts 9:10-19',
        book: 'Acts',
        chapter: 9,
        verseRange: '10-19',
        theme: 'Surrender & Healing',
        passageText: `In Damascus there was a disciple named Ananias. The Lord called to him in a vision, "Ananias!" "Yes, Lord," he answered. The Lord told him, "Go to the house of Judas on Straight Street and ask for a man from Tarsus named Saul, for he is praying... He is my chosen instrument to proclaim my name to the Gentiles."... Then Ananias went to the house and entered it. Placing his hands on Saul, he said, "Brother Saul, the Lord—Jesus, who appeared to you on the road as you were coming here—has sent me so that you may see again and be filled with the Holy Spirit." Immediately, something like scales fell from Saul's eyes, and he could see again.`,
        keyVerseReference: 'Acts 9:17',
        keyVerseText: 'Placing his hands on Saul, he said, "Brother Saul, the Lord—Jesus... has sent me so that you may see again and be filled with the Holy Spirit."',
        kjvKeyVerseText: 'Brother Saul, the Lord, even Jesus, that appeared unto thee in the way as thou camest, hath sent me, that thou mightest receive thy sight. — Acts 9:17 (KJV)',
        teaserHook: 'Tomorrow: Former allies become assassins, and Saul has to be lowered over the stone city walls in a woven basket.',
        backstory: {
          category: 'Culture',
          title: 'Straight Street in Damascus',
          content: 'Straight Street (Via Recta) was the grand Roman colonnaded boulevard running east-west across ancient Damascus. For three days, Saul ate nothing and drank nothing, processing the collapse of his identity until a fearful Christian named Ananias walked in and called him "Brother."'
        },
        staticFallback: {
          scenarioQuestion: 'You are in a season of waiting where you feel completely blind to what is coming next. What do you do?',
          presetChoices: [
            { id: 'paul2-rush', text: 'Force an outcome immediately out of impatience.', stance: 'rush' },
            { id: 'paul2-bitter', text: 'Grow bitter about the loss of your past status.', stance: 'bitter' },
            { id: 'paul2-reject', text: 'Reject anyone who tries to offer you spiritual guidance.', stance: 'reject' },
            { id: 'paul2-wait', text: 'Wait in prayer, allow the scales to fall from your eyes, and receive healing.', stance: 'wait_prayer' }
          ],
          storyRetelling: [
            "For three days, Saul sat in total darkness in Damascus. He didn't eat or drink; the persecutor was praying.",
            "God sent Ananias—a man Saul came to arrest—to lay hands on him and say two words: 'Brother Saul.'",
            "Scales fell from Saul's eyes like crust. He arose, was baptized, and broke his fast with a completely new vision for life."
          ],
          actionLine: 'Extend grace to someone today you previously considered an adversary.',
          mirrorBackRules: {
            'paul2-rush': 'You wanted to rush — Saul sat in darkness for three full days until God spoke.',
            'paul2-bitter': 'You felt bitter — letting go of an old identity is painful, but essential for growth.',
            'paul2-reject': 'You resisted outside help — Saul had to let a humble believer minister to his brokenness.',
            'paul2-wait': 'You chose patient prayer — waiting on God is where old scales fall away.'
          },
          defaultMirrorBack: 'Here is what happened on Straight Street in Damascus.'
        }
      },
      {
        id: 'series-paul-day-3',
        seriesId: 'series-paul',
        dayNumber: 3,
        momentTitle: 'The Midnight Basket',
        narrativeBridge: 'Day 3: Preaching boldly, escaping assassination over the city walls in a basket.',
        heroName: 'Paul',
        reference: 'Acts 9:20-25',
        book: 'Acts',
        chapter: 9,
        verseRange: '20-25',
        theme: 'Courage & Ingenuity',
        passageText: `At once he began to preach in the synagogues that Jesus is the Son of God. All those who heard him were astonished and asked, "Isn't he the man who raised havoc in Jerusalem among those who call on this name?"... Yet Saul grew more and more powerful and baffled the Jews living in Damascus by proving that Jesus is the Messiah. After many days had gone by, there was a conspiracy among the Jews to kill him, but Saul learned of their plan. Day and night they kept close watch on the city gates in order to kill him. But his followers took him by night and lowered him in a basket through an opening in the wall.`,
        keyVerseReference: 'Acts 9:22',
        keyVerseText: 'Saul grew more and more powerful and baffled the Jews living in Damascus by proving that Jesus is the Messiah.',
        kjvKeyVerseText: 'But Saul increased the more in strength, and confounded the Jews which dwelt at Damascus, proving that this is very Christ. — Acts 9:22 (KJV)',
        teaserHook: 'Tomorrow: Beaten with wooden rods and locked in heavy iron stocks, Paul and Silas start singing at midnight.',
        backstory: {
          category: 'Culture',
          title: 'The Walls of Damascus',
          content: 'Roman Damascus was surrounded by massive stone fortifications with guarded gates. Escaping through a window in the wall inside a large woven grain basket was not glamorous, but it proved Paul’s willingness to look foolish for the sake of his mission.'
        },
        staticFallback: {
          scenarioQuestion: 'Opposition mounts against your work and doors are closing fast. How do you navigate it?',
          presetChoices: [
            { id: 'paul3-quit', text: 'Throw up your hands and conclude your mission was a mistake.', stance: 'quit' },
            { id: 'paul3-reckless', text: 'Act recklessly just to prove how fearless you are.', stance: 'reckless' },
            { id: 'paul3-compromise', text: 'Water down your message so nobody is offended.', stance: 'compromise' },
            { id: 'paul3-basket', text: 'Stay faithful to your message, but use practical wisdom to escape harm.', stance: 'practical_wisdom' }
          ],
          storyRetelling: [
            "Saul immediately entered the Damascus synagogues and declared Jesus as the Messiah. The city was baffled by the turncoat.",
            "Soon his former allies plotted an ambush at every city gate. Saul didn't panic or seek martyrdom prematurely.",
            "In the dead of night, his disciples put him into a woven laundry basket and lowered him down the stone city wall to safety."
          ],
          actionLine: 'Pair your courage with practical common sense today when dealing with difficult people.',
          mirrorBackRules: {
            'paul3-quit': 'You thought about quitting — persecution meant Saul’s message was striking a real nerve.',
            'paul3-reckless': 'You wanted to be reckless — courage is not reckless; it knows when to slip out in a basket.',
            'paul3-compromise': 'You thought of watering down truth — Saul never compromised his message, only his exit strategy.',
            'paul3-basket': 'You chose practical wisdom — using ingenuity to live and preach another day is true tactical leadership.'
          },
          defaultMirrorBack: 'Here is how Saul escaped the gates of Damascus.'
        }
      },
      {
        id: 'series-paul-day-4',
        seriesId: 'series-paul',
        dayNumber: 4,
        momentTitle: 'Midnight in Philippi',
        narrativeBridge: 'Day 4 shows unstoppable praise: singing hymns in dungeon chains until an earthquake hits.',
        heroName: 'Paul',
        reference: 'Acts 16:22-31',
        book: 'Acts',
        chapter: 16,
        verseRange: '22-31',
        theme: 'Joy Under Persecution',
        passageText: `The crowd joined in the attack against Paul and Silas, and the magistrates ordered them to be stripped and beaten with rods. After they had been severely flogged, they were thrown into prison, and the jailer was told to guard them carefully... About midnight Paul and Silas were praying and singing hymns to God, and the other prisoners were listening to them. Suddenly there was such a violent earthquake that the foundations of the prison were shaken. At once all the prison doors flew open, and everyone's chains came loose... The jailer woke up... and asked, "Sirs, what must I do to be saved?"`,
        keyVerseReference: 'Acts 16:25',
        keyVerseText: 'About midnight Paul and Silas were praying and singing hymns to God, and the other prisoners were listening to them.',
        kjvKeyVerseText: 'And at midnight Paul and Silas prayed, and sang praises unto God: and the prisoners heard them. — Acts 16:25 (KJV)',
        teaserHook: 'Tomorrow: Walking among the statues of Athens, Paul notices an altar inscribed: "To an Unknown God."',
        backstory: {
          category: 'Author',
          title: 'The Inner Dungeon of Philippi',
          content: 'The inner prison was an airless underground cistern without light or sanitation. Paul and Silas had their legs clamped in wooden stocks, causing excruciating muscle cramps after a brutal beating with Roman lictor rods.'
        },
        staticFallback: {
          scenarioQuestion: 'You are locked in a miserable, unfair circumstance. What comes out of your mouth at midnight?',
          presetChoices: [
            { id: 'paul4-curse', text: 'Curse your bad luck and resent everyone responsible.', stance: 'curse' },
            { id: 'paul4-sulk', text: 'Sulk in silence and make sure everyone knows how miserable you are.', stance: 'sulk' },
            { id: 'paul4-despair', text: 'Assume God has forgotten you in this dungeon.', stance: 'despair' },
            { id: 'paul4-praise', text: 'Praise God through the pain and let your joy disarm the room.', stance: 'midnight_praise' }
          ],
          storyRetelling: [
            "Flogged with wooden rods and bleeding from their backs, Paul and Silas were shoved into the deepest dungeon in Philippi.",
            "Their feet were locked in stocks. But at midnight, instead of groaning or complaining, they sang hymns of praise to God.",
            "An earthquake tore the cell doors open and snapped their chains. But they stayed to save the suicidal jailer's life and household."
          ],
          actionLine: 'Choose gratitude today in the middle of a frustrating situation that feels completely unfair.',
          mirrorBackRules: {
            'paul4-curse': 'You felt like complaining — complaints keep you locked in chains; praise shakes the foundations.',
            'paul4-sulk': 'You felt like sulking — the other prisoners in Philippi were listening to Paul’s hymns in the dark.',
            'paul4-despair': 'You feared God forgot you — God answered at midnight with an earthquake and a transformed family.',
            'paul4-praise': 'You chose praise in pain — worshiping God in the dungeon is the strongest power on earth.'
          },
          defaultMirrorBack: 'Here is what Paul and Silas did at midnight in Philippi.'
        }
      },
      {
        id: 'series-paul-day-5',
        seriesId: 'series-paul',
        dayNumber: 5,
        momentTitle: 'The Unknown God in Athens',
        narrativeBridge: 'Day 5 engages skeptical intellectuals: speaking with philosophical elegance on Mars Hill.',
        heroName: 'Paul',
        reference: 'Acts 17:22-31',
        book: 'Acts',
        chapter: 17,
        verseRange: '22-31',
        theme: 'Intellect & Cultural Bridge',
        passageText: `Paul then stood up in the meeting of the Areopagus and said: "People of Athens! I see that in every way you are very religious. For as I walked around and looked carefully at your objects of worship, I even found an altar with this inscription: TO AN UNKNOWN GOD. So you are ignorant of the very thing you worship—and this is what I am going to proclaim to you. The God who made the world and everything in it is the Lord of heaven and earth and does not live in temples built by human hands... In him we live and move and have our being."`,
        keyVerseReference: 'Acts 17:28',
        keyVerseText: 'For in him we live and move and have our being. As some of your own poets have said, "We are his offspring."',
        kjvKeyVerseText: 'For in him we live, and move, and have our being; as certain also of your own poets have said, For we are also his offspring. — Acts 17:28 (KJV)',
        teaserHook: 'Tomorrow: A fierce Euroclydon storm batters their grain freighter for fourteen days with no sun or stars in sight.',
        backstory: {
          category: 'Culture',
          title: 'The Areopagus (Mars Hill)',
          content: 'The Areopagus was the supreme philosophical and judicial council of Athens overlooking the Acropolis. Epicureans and Stoics gathered there to debate ideas. Rather than insulting their pagan idols, Paul cited their own Greek poets (Aratus and Epimenides) to introduce the Creator.'
        },
        staticFallback: {
          scenarioQuestion: 'You are engaging people who hold completely different beliefs from you. How do you bridge the divide?',
          presetChoices: [
            { id: 'paul5-mock', text: 'Mock their views and aggressively point out their flaws.', stance: 'mock' },
            { id: 'paul5-shrink', text: 'Shrink back and assume intellectuals will never understand faith.', stance: 'shrink' },
            { id: 'paul5-jargon', text: 'Use religious jargon that makes no sense to an outsider.', stance: 'jargon' },
            { id: 'paul5-bridge', text: 'Find common ground in their culture and point them gently toward the Creator.', stance: 'cultural_bridge' }
          ],
          storyRetelling: [
            "In Athens, surrounded by marble idols of Greek gods, Paul walked the marketplace listening to philosophers.",
            "They summoned him to the Areopagus: 'What does this babbler have to say?' Paul stood tall among the statues.",
            "He started with their own art: 'I saw your altar TO AN UNKNOWN GOD.' He quoted their poets to reveal the God who gives life and breath to all."
          ],
          actionLine: 'Find one point of genuine common ground with someone you usually disagree with today.',
          mirrorBackRules: {
            'paul5-mock': 'You felt like attacking — mockery builds walls; Paul built bridges to hearts.',
            'paul5-shrink': 'You felt intimidated — faith has intellectual substance capable of engaging the sharpest minds.',
            'paul5-jargon': 'You leaned on jargon — speaking clearly in the listener’s language is an act of love.',
            'paul5-bridge': 'You built common ground — finding shared humanity is how the gospel crosses cultures.'
          },
          defaultMirrorBack: 'Here is what Paul proclaimed on Mars Hill in Athens.'
        }
      },
      {
        id: 'series-paul-day-6',
        seriesId: 'series-paul',
        dayNumber: 6,
        momentTitle: 'Shipwreck at Malta',
        narrativeBridge: 'Day 6 demonstrates leadership in disaster: breaking bread while sailors panic in a hurricane.',
        heroName: 'Paul',
        reference: 'Acts 27:21-26, 33-36',
        book: 'Acts',
        chapter: 27,
        verseRange: '21-26, 33-36',
        theme: 'Calm Leadership in Crisis',
        passageText: `After they had gone a long time without food, Paul stood up before them and said: "Men, you should have taken my advice not to sail from Crete... But now I urge you to keep up your courage, because not one of you will be lost; only the ship will be destroyed. Last night an angel of the God to whom I belong and whom I serve stood beside me and said, 'Do not be afraid, Paul; you must stand trial before Caesar; and God has graciously given you the lives of all who sail with you.'... Just before dawn Paul urged them all to eat... He took some bread and gave thanks to God in front of them all. Then he broke it and began to eat. They were all encouraged."`,
        keyVerseReference: 'Acts 27:25',
        keyVerseText: 'So keep up your courage, men, for I have faith in God that it will happen just as he told me.',
        kjvKeyVerseText: 'Wherefore, sirs, be of good cheer: for I believe God, that it shall be even as it was told me. — Acts 27:25 (KJV)',
        teaserHook: 'Tomorrow: Chained to a Roman Praetorian guard in a cold cell, the aged apostle writes his final letter.',
        backstory: {
          category: 'People',
          title: 'The Grain Ship of Alexandria',
          content: 'Paul was aboard a massive Roman grain freighter carrying 276 passengers when a northeaster gale (Euroclydon) struck. For fourteen days the crew jettisoned cargo, threw tackling overboard, and gave up all hope. A prisoner in chains ended up taking command of the ship.'
        },
        staticFallback: {
          scenarioQuestion: 'Everyone around you is panicking in a brewing storm. How do you lead?',
          presetChoices: [
            { id: 'paul6-panic', text: 'Join the panic and scream that the ship is going down.', stance: 'panic' },
            { id: 'paul6-toldyou', text: 'Say "I told you so" and rub their bad judgment in their faces.', stance: 'told_you_so' },
            { id: 'paul6-boat', text: 'Try to sneak into a lifeboat and save yourself alone.', stance: 'save_self' },
            { id: 'paul6-anchor', text: 'Stay calm, break bread, and anchor the room with steady faith.', stance: 'steady_anchor' }
          ],
          storyRetelling: [
            "For two weeks in the Mediterranean, no sun or stars appeared. The 276 soldiers and sailors gave up on surviving.",
            "Paul stood on the heaving deck: 'Take courage! An angel of the God I serve told me not one life will be lost.'",
            "At dawn, while waves slammed the hull, Paul took bread, gave thanks, and broke it. His peace calmed an entire ship into safety."
          ],
          actionLine: 'Be the calmest person in the room today when stress begins to spread.',
          mirrorBackRules: {
            'paul6-panic': 'You felt anxious — panic is contagious, but so is steady faith.',
            'paul6-toldyou': 'You wanted to say "I told you so" — Paul warned them, but focused on rescue instead of blame.',
            'paul6-boat': 'You thought about saving yourself — true leaders make sure everyone makes it to shore.',
            'paul6-anchor': 'You became the steady anchor — breaking bread under pressure is the hallmark of spiritual authority.'
          },
          defaultMirrorBack: 'Here is how Paul took command on the stormy deck of the Alexandrian ship.'
        }
      },
      {
        id: 'series-paul-day-7',
        seriesId: 'series-paul',
        dayNumber: 7,
        momentTitle: 'I Have Finished the Race',
        narrativeBridge: 'Day 7 lands Paul’s journey: facing execution with unshakeable peace and passing the torch.',
        heroName: 'Paul',
        reference: '2 Timothy 4:6-8',
        book: '2 Timothy',
        chapter: 4,
        verseRange: '6-8',
        theme: 'Endurance & Eternal Crown',
        passageText: `For I am already being poured out like a drink offering, and the time for my departure is near. I have fought the good fight, I have finished the race, I have kept the faith. Now there is in store for me the crown of righteousness, which the Lord, the righteous Judge, will award to me on that day—and not only to me, but also to all who have longed for his appearing.`,
        keyVerseReference: '2 Timothy 4:7',
        keyVerseText: 'I have fought the good fight, I have finished the race, I have kept the faith.',
        kjvKeyVerseText: 'I have fought a good fight, I have finished my course, I have kept the faith. — 2 Timothy 4:7 (KJV)',
        teaserHook: 'Your week with Paul is complete. From breathing murderous threats to finishing the race with glory.',
        backstory: {
          category: 'Author',
          title: 'The Mamertine Prison in Rome',
          content: 'Paul wrote his final letter to young Timothy from a subterranean Roman dungeon under Emperor Nero. Unlike his earlier house arrest, he was now in chains like a criminal, facing beheading on the Ostian Way. He looked into eternity with complete serenity.'
        },
        staticFallback: {
          scenarioQuestion: 'Looking at your long-term race, what do you want your life to stand for when it counts?',
          presetChoices: [
            { id: 'paul7-applause', text: 'Popular applause and external accolades.', stance: 'applause' },
            { id: 'paul7-comfort', text: 'Avoiding all friction and living in comfortable obscurity.', stance: 'comfort' },
            { id: 'paul7-cynicism', text: 'Cynical indifference toward the world’s problems.', stance: 'cynicism' },
            { id: 'paul7-finish', text: 'Fighting the good fight, keeping the faith, and finishing the course.', stance: 'finish_race' }
          ],
          storyRetelling: [
            "In a cold, dark Roman dungeon awaiting execution, Paul picked up the pen for his beloved spiritual son Timothy.",
            "He didn't complain about Nero, his chains, or his scars: 'I am being poured out like an offering, and the time has come.'",
            "'I have fought the good fight, I have finished the race, I have kept the faith.' The inquisitor died an ambassador of Christ."
          ],
          actionLine: 'Recommit today to the most important race in your life: faithfulness over convenience.',
          mirrorBackRules: {
            'paul7-applause': 'You looked to human approval — Paul died a prisoner in Rome, yet won an eternal crown.',
            'paul7-comfort': 'You preferred comfort — comfort leaves no legacy; sacrifice changes generations.',
            'paul7-cynicism': 'You felt cynical — cynicism is easy; keeping the faith to the finish line is heroic.',
            'paul7-finish': 'You committed to finishing the race — that perseverance is the crown of Paul’s whole life.'
          },
          defaultMirrorBack: 'Here are the final words Paul penned from Rome.'
        }
      }
    ]
  },

  // =========================================================================
  // 5. JESUS — The Road to the Cross & Kingdom
  // =========================================================================
  {
    id: 'series-jesus',
    characterId: 'jesus',
    title: 'Jesus: The Road to the Cross & Kingdom',
    heroName: 'Jesus',
    tagline: 'Seven decisive moments that revealed the heart and authority of the Son of God',
    hook: 'Walk with Jesus from the wilderness temptation to Gethsemane, the cross, and the empty tomb.',
    avatarIcon: '✨',
    weekTheme: 'Sacrifice, love, authority, and resurrection',
    moments: [
      {
        id: 'series-jesus-day-1',
        seriesId: 'series-jesus',
        dayNumber: 1,
        momentTitle: 'The Wilderness Test',
        narrativeBridge: 'Day 1: Facing hunger, shortcuts to power, and temptation in the Judean desert.',
        heroName: 'Jesus',
        reference: 'Matthew 4:1-11',
        book: 'Matthew',
        chapter: 4,
        verseRange: '1-11',
        theme: 'Identity & Truth',
        passageText: `Then Jesus was led by the Spirit into the wilderness to be tempted by the devil. After fasting forty days and forty nights, he was hungry. The tempter came to him and said, "If you are the Son of God, tell these stones to become bread." Jesus answered, "It is written: 'Man shall not live on bread alone, but on every word that comes from the mouth of God.'" Then the devil took him to the holy city... and again Jesus answered, "It is also written: 'Do not put the Lord your God to the test.'" Finally the devil took him to a very high mountain and showed him all the kingdoms of the world... Jesus said to him, "Away from me, Satan! For it is written: 'Worship the Lord your God, and serve him only.'"`,
        keyVerseReference: 'Matthew 4:4',
        keyVerseText: 'Man shall not live on bread alone, but on every word that comes from the mouth of God.',
        kjvKeyVerseText: 'Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God. — Matthew 4:4 (KJV)',
        teaserHook: 'Tomorrow: A sudden storm threatens to capsize the boat, and the disciples find Jesus fast asleep on a cushion.',
        backstory: {
          category: 'Culture',
          title: 'The Wilderness of Judea',
          content: 'The barren limestone hills of the Judean wilderness drop steeply toward the Dead Sea. For forty days Jesus endured blistering heat and freezing desert nights without food before launching His public ministry.'
        },
        staticFallback: {
          scenarioQuestion: 'You are exhausted and a tempting shortcut promises immediate relief. What do you do?',
          presetChoices: [
            { id: 'jesus1-take', text: 'Take the shortcut; who cares about principles when you are starving?', stance: 'take_shortcut' },
            { id: 'jesus1-doubt', text: 'Doubt God’s love because you are going through hard times.', stance: 'doubt_love' },
            { id: 'jesus1-bargain', text: 'Bargain with your morals just this once.', stance: 'bargain' },
            { id: 'jesus1-stand', text: 'Stand on the truth of Scripture and refuse to compromise your identity.', stance: 'stand_on_truth' }
          ],
          storyRetelling: [
            "After forty days of fasting in the Judean desert, Jesus was physically starved. The tempter whispered: 'Turn stones to bread.'",
            "Satan offered instant food, spectacular popularity, and political dominion over every kingdom on earth.",
            "Jesus countered every assault with Scripture: 'Man shall not live on bread alone.' He refused the shortcut to win the cross."
          ],
          actionLine: 'Resist one impulse for an easy shortcut today and choose the honest path.',
          mirrorBackRules: {
            'jesus1-take': 'You felt tempted by relief — shortcuts always demand your soul in exchange.',
            'jesus1-doubt': 'You doubted God’s care — desert seasons are not signs of abandonment, but schoolrooms of faith.',
            'jesus1-bargain': 'You thought about compromising — compromising once opens the gate to full defeat.',
            'jesus1-stand': 'You stood on truth — anchoring your heart in God’s Word overcomes every temptation.'
          },
          defaultMirrorBack: 'Here is how Jesus answered in the wilderness.'
        }
      },
      {
        id: 'series-jesus-day-2',
        seriesId: 'series-jesus',
        dayNumber: 2,
        momentTitle: 'Peace in the Gale',
        narrativeBridge: 'Day 2 tests faith in the storm: sleeping through the tempest, commanding the waves.',
        heroName: 'Jesus',
        reference: 'Mark 4:35-41',
        book: 'Mark',
        chapter: 4,
        verseRange: '35-41',
        theme: 'Peace Under Pressure',
        passageText: `That day when evening came, he said to his disciples, "Let us go over to the other side." Leaving the crowd behind, they took him along, just as he was, in the boat... A furious squall came up, and the waves broke over the boat, so that it was nearly swamped. Jesus was in the stern, sleeping on a cushion. The disciples woke him and said to him, "Teacher, don't you care if we drown?" He got up, rebuked the wind and said to the waves, "Quiet! Be still!" Then the wind died down and it was completely calm. He said to his disciples, "Why are you so afraid? Do you still have no faith?"`,
        keyVerseReference: 'Mark 4:39',
        keyVerseText: 'He got up, rebuked the wind and said to the waves, "Quiet! Be still!" Then the wind died down and it was completely calm.',
        kjvKeyVerseText: 'And he arose, and rebuked the wind, and said unto the sea, Peace, be still. And the wind ceased, and there was a great calm. — Mark 4:39 (KJV)',
        teaserHook: 'Tomorrow: Five thousand hungry men in the desert grass, and only five barley loaves and two small fish.',
        backstory: {
          category: 'Author',
          title: 'The Storms of Galilee',
          content: 'Lying 700 feet below sea level surrounded by steep ravines, cool air rushing from Mount Hermon frequently collides with the warm lake atmosphere, generating violent whirlpools and sudden waves in minutes.'
        },
        staticFallback: {
          scenarioQuestion: 'The storms of life are raging and you feel like God is asleep. What do you do?',
          presetChoices: [
            { id: 'jesus2-accuse', text: 'Accuse God: "Don’t you care that I am drowning?"', stance: 'accuse' },
            { id: 'jesus2-panic', text: 'Bail water in panic until you collapse from exhaustion.', stance: 'panic' },
            { id: 'jesus2-jump', text: 'Jump out of the boat into the chaos.', stance: 'jump' },
            { id: 'jesus2-rest', text: 'Trust that the Creator in your boat is greater than the storm outside it.', stance: 'rest_in_peace' }
          ],
          storyRetelling: [
            "A violent gale struck the Sea of Galilee, swamping the wooden boat with crashing water. Seasoned fishermen panicked.",
            "Jesus was in the stern, peacefully sleeping on a cushion. They shook Him awake: 'Teacher, don't you care if we drown?'",
            "He stood up into the gale: 'Quiet! Be still!' The roaring wind collapsed into glass-like calm. They trembled in holy awe."
          ],
          actionLine: 'Speak peace over your anxious thoughts today: "Quiet! Be still."',
          mirrorBackRules: {
            'jesus2-accuse': 'You felt like accusing God — the disciples cried out too, yet Jesus never lost control.',
            'jesus2-panic': 'You tried frantic bailing — human effort cannot calm a divine storm; only Jesus can.',
            'jesus2-jump': 'You felt like jumping ship — staying in the boat with Christ is the only safe place.',
            'jesus2-rest': 'You chose peace — when Christ is in your boat, no storm can pull you under.'
          },
          defaultMirrorBack: 'Here is what happened on the stormy Sea of Galilee.'
        }
      },
      {
        id: 'series-jesus-day-3',
        seriesId: 'series-jesus',
        dayNumber: 3,
        momentTitle: 'Loaves in the Wilderness',
        narrativeBridge: 'Day 3 demonstrates divine multiplication: blessing meager scraps to satisfy thousands.',
        heroName: 'Jesus',
        reference: 'John 6:5-14',
        book: 'John',
        chapter: 6,
        verseRange: '5-14',
        theme: 'Generosity & Provision',
        passageText: `When Jesus looked up and saw a great crowd coming toward him, he said to Philip, "Where shall we buy bread for these people to eat?" He asked this only to test him, for he already had in mind what he was going to do. Philip answered him, "It would take more than half a year's wages to buy enough bread for each one to have a bite!" Another of his disciples, Andrew, Simon Peter's brother, spoke up, "Here is a boy with five small barley loaves and two small fish, but how far will they go among so many?" Jesus said, "Have the people sit down..." Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted.`,
        keyVerseReference: 'John 6:11',
        keyVerseText: 'Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted.',
        kjvKeyVerseText: 'And Jesus took the loaves; and when he had given thanks, he distributed to the disciples... and likewise of the fishes as much as they would. — John 6:11 (KJV)',
        teaserHook: 'Tomorrow: Standing outside the tomb of His close friend, Jesus breaks into tears before calling life from death.',
        backstory: {
          category: 'People',
          title: 'The Five Barley Loaves',
          content: 'Barley bread was the food of the poorest peasants in Galilee, coarse and heavy compared to wheat. A young boy surrendered his personal lunch, and Jesus turned meager peasant food into a feast with twelve baskets of leftovers.'
        },
        staticFallback: {
          scenarioQuestion: 'The need around you is massive and your resources feel hopelessly inadequate. What is your move?',
          presetChoices: [
            { id: 'jesus3-hide', text: 'Hide what little you have so you do not run out yourself.', stance: 'hide' },
            { id: 'jesus3-sendaway', text: 'Send people away and say it is not your problem.', stance: 'send_away' },
            { id: 'jesus3-despair', text: 'Calculate the impossible costs and give up immediately.', stance: 'despair' },
            { id: 'jesus3-offer', text: 'Offer your five loaves and two fish into God’s hands with thanksgiving.', stance: 'offer_scraps' }
          ],
          storyRetelling: [
            "Five thousand men plus women and children followed Jesus to a remote hill. Evening came, and they had nothing to eat.",
            "Philip did the math: 'Eight months' wages wouldn't give everyone a single bite!' Andrew found a boy with five barley loaves and two fish.",
            "Jesus took the boy's lunch, thanked the Father, and broke the bread. Everyone ate until satisfied, filling twelve baskets with leftovers."
          ],
          actionLine: 'Give whatever small resource you have today to someone in need without waiting until you have "enough."',
          mirrorBackRules: {
            'jesus3-hide': 'You felt like hoarding — holding onto scarcity keeps you empty; giving invites multiplication.',
            'jesus3-sendaway': 'You thought about passing the buck — Jesus told His disciples: "You give them something to eat."',
            'jesus3-despair': 'You focused on the deficit — math looks impossible until God enters the equation.',
            'jesus3-offer': 'You offered your small scraps — God never asks for what you don’t have, only what you surrender.'
          },
          defaultMirrorBack: 'Here is what happened on the green hillside above Galilee.'
        }
      },
      {
        id: 'series-jesus-day-4',
        seriesId: 'series-jesus',
        dayNumber: 4,
        momentTitle: 'Tears at the Tomb',
        narrativeBridge: 'Day 4 reveals compassionate humanity: weeping with mourners before defeating death.',
        heroName: 'Jesus',
        reference: 'John 11:32-44',
        book: 'John',
        chapter: 11,
        verseRange: '32-44',
        theme: 'Grief & Compassion',
        passageText: `When Mary reached the place where Jesus was and saw him, she fell at his feet and said, "Lord, if you had been here, my brother would not have died." When Jesus saw her weeping, and the Jews who had come along with her also weeping, he was deeply moved in spirit and troubled. "Where have you laid him?" he asked. "Come and see, Lord," they replied. Jesus wept. Then the Jews said, "See how he loved him!"... Jesus called in a loud voice, "Lazarus, come out!" The dead man came out, his hands and feet wrapped with strips of linen.`,
        keyVerseReference: 'John 11:35',
        keyVerseText: 'Jesus wept.',
        kjvKeyVerseText: 'Jesus wept. — John 11:35 (KJV)',
        teaserHook: 'Tomorrow: In the dark olive groves of Gethsemane, sweat falls like drops of blood as Jesus prays.',
        backstory: {
          category: 'Culture',
          title: 'The Four Days in the Tomb',
          content: 'In first-century Jewish belief, a person’s spirit was thought to linger near the body for three days. By arriving on the fourth day, Jesus eliminated any possibility of a mistaken coma or revival. Before flexing His divine authority, He stood in the cemetery and wept.'
        },
        staticFallback: {
          scenarioQuestion: 'Someone you care about is grieving a deep loss. How do you comfort them?',
          presetChoices: [
            { id: 'jesus4-cliche', text: 'Offer hollow clichés and tell them everything happens for a reason.', stance: 'cliche' },
            { id: 'jesus4-avoid', text: 'Avoid them because dealing with sorrow feels uncomfortable.', stance: 'avoid' },
            { id: 'jesus4-fix', text: 'Try to aggressively fix their emotional state immediately.', stance: 'fix' },
            { id: 'jesus4-weep', text: 'Weep with them, enter their pain, and remind them that death does not have the final word.', stance: 'weep_with_them' }
          ],
          storyRetelling: [
            "Lazarus was dead four days in a stone tomb at Bethany. His sister Mary fell at Jesus' feet crying: 'If you had been here!'",
            "Jesus knew He was about to raise Lazarus from the dead within five minutes. Yet looking at Mary's broken heart, Jesus wept.",
            "He walked to the sealed cave, commanded the stone rolled away, and shouted: 'Lazarus, come out!' The grave gave up its dead."
          ],
          actionLine: 'Sit with someone who is hurting today without trying to fix or explain their pain.',
          mirrorBackRules: {
            'jesus4-cliche': 'You thought about using clichés — clichés sting; tears heal.',
            'jesus4-avoid': 'You felt awkward around grief — Jesus walked straight into the cemetery to be with His friends.',
            'jesus4-fix': 'You wanted to fix the emotion — before solving the problem, Jesus entered their sorrow.',
            'jesus4-weep': 'You chose compassionate tears — "Jesus wept" proves that God feels every ounce of your pain.'
          },
          defaultMirrorBack: 'Here is what happened outside the tomb of Lazarus.'
        }
      },
      {
        id: 'series-jesus-day-5',
        seriesId: 'series-jesus',
        dayNumber: 5,
        momentTitle: 'Gethsemane',
        narrativeBridge: 'Day 5 faces the bitter cup: wrestling in agony and surrendering to the Father’s will.',
        heroName: 'Jesus',
        reference: 'Matthew 26:36-46',
        book: 'Matthew',
        chapter: 26,
        verseRange: '36-46',
        theme: 'Surrender & Obedience',
        passageText: `Then Jesus went with his disciples to a place called Gethsemane, and he said to them, "Sit here while I go over there and pray." He took Peter and the two sons of Zebedee along with him, and he began to be sorrowful and troubled. Then he said to them, "My soul is overwhelmed with sorrow to the point of death. Stay here and keep watch with me." Going a little farther, he fell with his face to the ground and prayed, "My Father, if it is possible, may this cup be taken from me. Yet not as I will, but as you will."`,
        keyVerseReference: 'Matthew 26:39',
        keyVerseText: 'My Father, if it is possible, may this cup be taken from me. Yet not as I will, but as you will.',
        kjvKeyVerseText: 'O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt. — Matthew 26:39 (KJV)',
        teaserHook: 'Tomorrow: Nailed between two criminals on the hill of the skull, Jesus looks at His executioners and speaks.',
        backstory: {
          category: 'Culture',
          title: 'The Olive Press (Gethsemane)',
          content: 'Gethsemane means "oil press" (gat shemanim). Ancient stone presses crushed olives under massive weight to extract virgin oil. In this exact garden at the foot of the Mount of Olives, Jesus was crushed under the weight of human sin and the cross.'
        },
        staticFallback: {
          scenarioQuestion: 'You are facing a painful duty that you desperately want to escape. How do you pray?',
          presetChoices: [
            { id: 'jesus5-rebel', text: 'Rebel and run away from your calling.', stance: 'rebel' },
            { id: 'jesus5-pretend', text: 'Pretend it does not hurt and act stoic.', stance: 'stoic' },
            { id: 'jesus5-blame', text: 'Blame God for asking something difficult of you.', stance: 'blame' },
            { id: 'jesus5-surrender', text: 'Express your honest anguish, then surrender: "Not my will, but yours be done."', stance: 'surrender_will' }
          ],
          storyRetelling: [
            "In the dark olive grove of Gethsemane, Jesus fell face-down into the dirt. His disciples fell asleep under the trees.",
            "Facing the agony of bearing the world's sin, He prayed: 'Father, if it is possible, let this cup pass from me.'",
            "Yet He did not flinch: 'Yet not as I will, but as you will.' He arose with majestic peace to meet the betrayal kiss."
          ],
          actionLine: 'Surrender one situation you have been white-knuckling into God’s hands today.',
          mirrorBackRules: {
            'jesus5-rebel': 'You felt like running — running from the cross forfeits the resurrection.',
            'jesus5-pretend': 'You acted stoic — Jesus wept and sweated blood; true surrender is deeply honest.',
            'jesus5-blame': 'You blamed God — Jesus trusted the Father’s heart even while drinking the bitter cup.',
            'jesus5-surrender': 'You surrendered your will — "Not my will, but yours" is the highest prayer a human soul can utter.'
          },
          defaultMirrorBack: 'Here is what Jesus prayed in the garden of Gethsemane.'
        }
      },
      {
        id: 'series-jesus-day-6',
        seriesId: 'series-jesus',
        dayNumber: 6,
        momentTitle: 'The Cross of Calvary',
        narrativeBridge: 'Day 6 demonstrates love beyond comprehension: forgiving executioners while dying for them.',
        heroName: 'Jesus',
        reference: 'Luke 23:33-46',
        book: 'Luke',
        chapter: 23,
        verseRange: '33-46',
        theme: 'Forgiveness & Redemption',
        passageText: `When they came to the place called the Skull, they crucified him there, along with the criminals—one on his right, the other on his left. Jesus said, "Father, forgive them, for they do not know what they do." And they divided up his clothes by casting lots... One of the criminals who hung there hurled insults at him... But the other criminal rebuked him... "Jesus, remember me when you come into your kingdom." Jesus answered him, "Truly I tell you, today you will be with me in paradise."... Jesus called out with a loud voice, "Father, into your hands I commit my spirit." When he had said this, he breathed his last.`,
        keyVerseReference: 'Luke 23:34',
        keyVerseText: 'Jesus said, "Father, forgive them, for they do not know what they are doing."',
        kjvKeyVerseText: 'Then said Jesus, Father, forgive them; for they know not what they do. — Luke 23:34 (KJV)',
        teaserHook: 'Tomorrow: At sunrise on the first day of the week, women carry spices to the tomb and find the massive stone rolled away.',
        backstory: {
          category: 'Author',
          title: 'The Place of the Skull (Golgotha)',
          content: 'Roman crucifixion was designed as the most gruesome, humiliating public execution ever devised, reserved for rebels and runaway slaves. Suspended between heaven and earth, Jesus used His dying breaths not to curse Rome, but to offer forgiveness to His executioners.'
        },
        staticFallback: {
          scenarioQuestion: 'Someone has betrayed, mocked, or wounded you deeply. What is your response?',
          presetChoices: [
            { id: 'jesus6-vengeance', text: 'Demand vengeance and plot their destruction.', stance: 'vengeance' },
            { id: 'jesus6-bitter', text: 'Hold onto bitterness for the rest of your life.', stance: 'bitter' },
            { id: 'jesus6-hate', text: 'Hate them in secret while smiling in public.', stance: 'hate' },
            { id: 'jesus6-forgive', text: 'Release the debt to God: "Father, forgive them, for they do not know what they do."', stance: 'radical_forgiveness' }
          ],
          storyRetelling: [
            "On a windswept hill outside Jerusalem, Roman soldiers drove iron spikes through the hands and feet of Jesus.",
            "Religious rulers sneered and soldiers gambled for His tunic. In agony, Jesus prayed: 'Father, forgive them, for they do not know what they do.'",
            "To the repentant thief dying beside Him, He promised paradise. He bowed His head: 'It is finished.' Love conquered the world."
          ],
          actionLine: 'Release one grudge today that you have been clutching against someone who hurt you.',
          mirrorBackRules: {
            'jesus6-vengeance': 'You wanted vengeance — vengeance poisons the wounded; forgiveness breaks the cycle.',
            'jesus6-bitter': 'You clung to bitterness — holding a grudge drinking poison expecting the other person to die.',
            'jesus6-hate': 'You harbored secret hate — hate binds you to your abuser; grace frees your soul.',
            'jesus6-forgive': 'You chose forgiveness — that radical love is the beating heart of the cross of Christ.'
          },
          defaultMirrorBack: 'Here is what Jesus spoke from the cross on Calvary.'
        }
      },
      {
        id: 'series-jesus-day-7',
        seriesId: 'series-jesus',
        dayNumber: 7,
        momentTitle: 'The Living King',
        narrativeBridge: 'Day 7 proclaims the resurrection: death is swallowed up in victory, and Jesus is alive forever.',
        heroName: 'Jesus',
        reference: 'Luke 24:1-12',
        book: 'Luke',
        chapter: 24,
        verseRange: '1-12',
        theme: 'Resurrection & Hope',
        passageText: `On the first day of the week, very early in the morning, the women took the spices they had prepared and went to the tomb. They found the stone rolled away from the tomb, but when they entered, they did not find the body of the Lord Jesus. While they were wondering about this, suddenly two men in clothes that gleamed like lightning stood beside them. In their fright the women bowed down with their faces to the ground, but the men said to them, "Why do you look for the living among the dead? He is not here; he has risen!"`,
        keyVerseReference: 'Luke 24:5-6',
        keyVerseText: 'Why do you look for the living among the dead? He is not here; he has risen!',
        kjvKeyVerseText: 'Why seek ye the living among the dead? He is not here, but is risen. — Luke 24:5-6 (KJV)',
        teaserHook: 'Your week with Jesus is complete. Seven days that conquered the grave and transformed eternity.',
        backstory: {
          category: 'Culture',
          title: 'The Rolling Stone and Roman Guard',
          content: 'A heavy circular stone weighing over a ton sealed the rock-cut tomb of Joseph of Arimathea, guarded by armed Roman sentries and secured with an imperial seal. On Sunday morning, the tomb was burst open—not to let Jesus out, but to let the witnesses in.'
        },
        staticFallback: {
          scenarioQuestion: 'In a world marked by death, cynicism, and decay, where do you place your ultimate hope?',
          presetChoices: [
            { id: 'jesus7-cynic', text: 'Nowhere; assume death and entropy have the final say.', stance: 'cynic' },
            { id: 'jesus7-secular', text: 'In temporary political victories and earthly comfort.', stance: 'secular' },
            { id: 'jesus7-nostalgia', text: 'In memories of the past, wishing things were different.', stance: 'nostalgia' },
            { id: 'jesus7-risen', text: 'In the risen Christ: because He lives, I will live also.', stance: 'risen_hope' }
          ],
          storyRetelling: [
            "At dawn on Sunday, Mary Magdalene and the women arrived at the garden tomb bearing burial spices in tears.",
            "The two-ton stone was rolled away. Two messengers in lightning-bright clothes asked: 'Why do you look for the living among the dead?'",
            "'He is not here; He has risen!' The tomb was empty, the grave clothes folded, and death was defeated forever."
          ],
          actionLine: 'Live today with the confidence of someone whose Savior has conquered the grave.',
          mirrorBackRules: {
            'jesus7-cynic': 'You felt cynical — the empty tomb proves that cynicism does not have the final word.',
            'jesus7-secular': 'You looked to earthly power — empires fall and rulers perish, but the risen King reigns forever.',
            'jesus7-nostalgia': 'You looked backward — the resurrection looks forward to eternal life and renewal.',
            'jesus7-risen': 'You put your hope in the risen Lord — that triumphant faith transforms every tomorrow.'
          },
          defaultMirrorBack: 'Here is what happened at the garden tomb at sunrise.'
        }
      }
    ]
  },

  // =========================================================================
  // 6. MARY — The Trust That Changed History
  // =========================================================================
  {
    id: 'series-mary',
    characterId: 'mary',
    title: 'Mary: The Trust That Changed History',
    heroName: 'Mary',
    tagline: 'A humble teenage girl who surrendered her future, her honor, and her heart to God',
    hook: 'Trace Mary from the angel’s greeting to the stable, the temple sword, and the foot of the cross.',
    avatarIcon: '🕊️',
    weekTheme: 'Surrender, mother’s devotion, and steadfast trust',
    moments: [
      {
        id: 'series-mary-day-1',
        seriesId: 'series-mary',
        dayNumber: 1,
        momentTitle: 'The Annunciation',
        narrativeBridge: 'Day 1: Mary risks scandal, divorce, and social disgrace to say yes to God’s call.',
        heroName: 'Mary',
        reference: 'Luke 1:26-38',
        book: 'Luke',
        chapter: 1,
        verseRange: '26-38',
        theme: 'Surrender & Faith',
        passageText: `In the sixth month of Elizabeth's pregnancy, God sent the angel Gabriel to Nazareth, a town in Galilee, to a virgin pledged to be married to a man named Joseph... The angel went to her and said, "Greetings, you who are highly favored! The Lord is with you." Mary was greatly troubled at his words and wondered what kind of greeting this might be. But the angel said to her, "Do not be afraid, Mary; you have found favor with God. You will conceive and give birth to a son, and you are to call him Jesus..." "I am the Lord's servant," Mary answered. "May your word to me be fulfilled."`,
        keyVerseReference: 'Luke 1:38',
        keyVerseText: 'I am the Lord’s servant, Mary answered. May your word to me be fulfilled.',
        kjvKeyVerseText: 'And Mary said, Behold the handmaid of the Lord; be it unto me according to thy word. — Luke 1:38 (KJV)',
        teaserHook: 'Tomorrow: Walking into Elizabeth’s hill country home, Mary bursts into a revolutionary song of praise.',
        backstory: {
          category: 'Culture',
          title: 'Betrothal in First-Century Nazareth',
          content: 'In Jewish law, betrothal was a binding legal covenant broken only by formal divorce. An unwed pregnancy in a tiny rural village of 400 people invited social shunning and potential death by stoning. Mary’s simple "yes" risked everything she had.'
        },
        staticFallback: {
          scenarioQuestion: 'God calls you to a path that threatens your reputation and comfort. How do you respond?',
          presetChoices: [
            { id: 'mary1-refuse', text: 'Refuse; you value social approval too much to risk it.', stance: 'refuse' },
            { id: 'mary1-argue', text: 'Argue that the cost is too unfair and demanding.', stance: 'argue' },
            { id: 'mary1-delay', text: 'Delay and ask for a safer assignment.', stance: 'delay' },
            { id: 'mary1-yes', text: 'Bow your head and surrender: "I am your servant; may your word be fulfilled."', stance: 'surrender_servant' }
          ],
          storyRetelling: [
            "In an obscure Galilean village, the angel Gabriel appeared to a poor teenage girl betrothed to a carpenter.",
            "Gabriel brought astonishing news: she would bear the Messiah by the Holy Spirit. It meant public scandal and shame.",
            "Mary didn't panic or bargain: 'I am the Lord's servant. May your word to me be fulfilled.' Her trust opened the door to Christ."
          ],
          actionLine: 'Say "yes" to one sacrificial act of service today without worrying what onlookers think.',
          mirrorBackRules: {
            'mary1-refuse': 'You valued comfort — Mary traded her reputation for God’s eternal plan.',
            'mary1-argue': 'You felt it was unfair — surrender does not mean you understand everything, but that you trust the Caller.',
            'mary1-delay': 'You wanted to delay — God moves through immediate, unhesitating obedience.',
            'mary1-yes': 'You said yes to God — that humble surrender is the starting point of every great work of grace.'
          },
          defaultMirrorBack: 'Here is what Mary said to Gabriel in Nazareth.'
        }
      },
      {
        id: 'series-mary-day-2',
        seriesId: 'series-mary',
        dayNumber: 2,
        momentTitle: 'The Magnificat',
        narrativeBridge: 'Day 2: Singing the revolutionary song of praise in the hill country of Judea.',
        heroName: 'Mary',
        reference: 'Luke 1:46-55',
        book: 'Luke',
        chapter: 1,
        verseRange: '46-55',
        theme: 'Worship & Justice',
        passageText: `And Mary said: "My soul glorifies the Lord and my spirit rejoices in God my Savior, for he has been mindful of the humble state of his servant. From now on all generations will call me blessed, for the Mighty One has done great things for me—holy is his name... He has brought down rulers from their thrones but has lifted up the humble. He has filled the hungry with good things but has sent the rich away empty. He has helped his servant Israel, remembering to be merciful."`,
        keyVerseReference: 'Luke 1:46-47',
        keyVerseText: 'My soul glorifies the Lord and my spirit rejoices in God my Savior.',
        kjvKeyVerseText: 'My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour. — Luke 1:46-47 (KJV)',
        teaserHook: 'Tomorrow: Giving birth in a crowded animal stall in Bethlehem because there was no room in the inn.',
        backstory: {
          category: 'Author',
          title: 'The Song of Mary (The Magnificat)',
          content: 'Traveling 80 miles south to the Judean hills to stay with Elizabeth, Mary erupted into one of the most powerful theological poems in Scripture. Echoing Hannah’s song from 1 Samuel, she declared that God overturns proud empires and lifts up the peasant poor.'
        },
        staticFallback: {
          scenarioQuestion: 'When good things or high callings happen in your life, who gets the glory?',
          presetChoices: [
            { id: 'mary2-ego', text: 'Your own brilliance and hard work.', stance: 'ego' },
            { id: 'mary2-downplay', text: 'You downplay it with false humility so nobody expects anything.', stance: 'false_humility' },
            { id: 'mary2-anxious', text: 'You stay anxious about losing your blessing.', stance: 'anxious' },
            { id: 'mary2-magnify', text: 'Your soul magnifies the Lord: "The Mighty One has done great things for me."', stance: 'magnify_god' }
          ],
          storyRetelling: [
            "Mary traveled south into the hills to visit her older relative Elizabeth. At the greeting, the baby in Elizabeth's womb leaped.",
            "Elizabeth cried out: 'Blessed are you among women!' Mary did not boast in her selection.",
            "She sang: 'My soul glorifies the Lord! He has lifted up the humble and filled the hungry with good things.' A teenage girl sang of revolution."
          ],
          actionLine: 'Give specific verbal praise to God today for one blessing you did nothing to earn.',
          mirrorBackRules: {
            'mary2-ego': 'You looked to yourself — true greatness reflects glory back to God.',
            'mary2-downplay': 'You used false humility — Mary acknowledged her blessedness while pointing entirely to God.',
            'mary2-anxious': 'You felt anxious — Mary celebrated God’s faithfulness before her baby was even born.',
            'mary2-magnify': 'You magnified the Lord — giving God the praise keeps your heart humble and joyous.'
          },
          defaultMirrorBack: 'Here is what Mary sang in the hills of Judea.'
        }
      },
      {
        id: 'series-mary-day-3',
        seriesId: 'series-mary',
        dayNumber: 3,
        momentTitle: 'The Bethlehem Manger',
        narrativeBridge: 'Day 3: Giving birth far from home in a shelter for livestock, treasuring all things in her heart.',
        heroName: 'Mary',
        reference: 'Luke 2:1-7, 16-19',
        book: 'Luke',
        chapter: 2,
        verseRange: '1-7, 16-19',
        theme: 'Patience & Humility',
        passageText: `In those days Caesar Augustus issued a decree that a census should be taken of the entire Roman world... And Joseph also went up from the town of Nazareth in Galilee to Judea, to Bethlehem the town of David, because he belonged to the house and line of David. He went there to register with Mary, who was pledged to be married to him and was expecting a child. While they were there, the time came for the baby to be born, and she gave birth to her firstborn, a son. She wrapped him in cloths and placed him in a manger, because there was no guest room available for them... But Mary treasured up all these things and pondered them in her heart.`,
        keyVerseReference: 'Luke 2:19',
        keyVerseText: 'Mary treasured up all these things and pondered them in her heart.',
        kjvKeyVerseText: 'But Mary kept all these things, and pondered them in her heart. — Luke 2:19 (KJV)',
        teaserHook: 'Tomorrow: An old prophet in the Jerusalem temple looks into Mary’s eyes: "A sword will pierce your own soul too."',
        backstory: {
          category: 'Culture',
          title: 'The Katalyma (Guest Room)',
          content: 'The Greek word "katalyma" refers to a family guest room, not a commercial hotel. Because Bethlehem was packed with relatives for the Roman census, every guest room was full. Mary gave birth in the lower family space where domestic animals were sheltered at night.'
        },
        staticFallback: {
          scenarioQuestion: 'Your plans didn’t work out the way you pictured and conditions are rough. How do you react?',
          presetChoices: [
            { id: 'mary3-complain', text: 'Complain bitterly about the lack of comfort.', stance: 'complain' },
            { id: 'mary3-blame', text: 'Blame the people who failed to make proper arrangements.', stance: 'blame' },
            { id: 'mary3-despair', text: 'Assume God must not be in this because it feels messy.', stance: 'despair' },
            { id: 'mary3-treasure', text: 'Treasure God’s presence in the mess and ponder His goodness in your heart.', stance: 'treasure_heart' }
          ],
          storyRetelling: [
            "Exhausted after an 80-mile trek from Nazareth, Mary went into labor in a crowded Bethlehem home.",
            "There was no room in the upper guest quarters. She delivered her firstborn son, wrapped Him in cloth, and laid Him in a livestock feeding trough.",
            "When rough shepherds rushed in telling of angels singing in the sky, Mary didn't boast. She quietly treasured every detail in her heart."
          ],
          actionLine: 'Find beauty and gratitude today in a situation that is messy and imperfect.',
          mirrorBackRules: {
            'mary3-complain': 'You felt like complaining — Christ was born in a feed trough, yet brought heaven to earth.',
            'mary3-blame': 'You looked to blame circumstances — messy stables often hold the greatest miracles.',
            'mary3-despair': 'You thought God was absent — God’s glory often shines brightest in the least glamorous places.',
            'mary3-treasure': 'You treasured God’s presence — quiet reflection turns difficult seasons into sacred memories.'
          },
          defaultMirrorBack: 'Here is what happened in the stable of Bethlehem.'
        }
      },
      {
        id: 'series-mary-day-4',
        seriesId: 'series-mary',
        dayNumber: 4,
        momentTitle: 'Simeon’s Sword',
        narrativeBridge: 'Day 4 brings prophetic forewarning: the painful cost of being the mother of the Savior.',
        heroName: 'Mary',
        reference: 'Luke 2:25-35',
        book: 'Luke',
        chapter: 2,
        verseRange: '25-35',
        theme: 'Endurance & Prophetic Warning',
        passageText: `Now there was a man in Jerusalem called Simeon, who was righteous and devout. He was waiting for the consolation of Israel, and the Holy Spirit was on him... When the parents brought in the child Jesus to do for him what the custom of the Law required, Simeon took him in his arms and praised God... Then Simeon blessed them and said to Mary, his mother: "This child is destined to cause the falling and rising of many in Israel, and to be a sign that will be spoken against, so that the thoughts of many hearts will be revealed. And a sword will pierce your own soul too."`,
        keyVerseReference: 'Luke 2:34-35',
        keyVerseText: 'This child is destined to cause the falling and rising of many in Israel... And a sword will pierce your own soul too.',
        kjvKeyVerseText: 'Yea, a sword shall pierce through thy own soul also, that the thoughts of many hearts may be revealed. — Luke 2:35 (KJV)',
        teaserHook: 'Tomorrow: Three days of frantic searching in Jerusalem when twelve-year-old Jesus goes missing from the caravan.',
        backstory: {
          category: 'People',
          title: 'Simeon in the Court of the Women',
          content: 'Mary and Joseph brought the offering of the poor (a pair of doves, Leviticus 12:8) to dedicate their forty-day-old infant. Simeon had received a divine promise that he would not die before seeing the Messiah. He blessed the baby, but gently prepared the mother for the sorrow of Calvary.'
        },
        staticFallback: {
          scenarioQuestion: 'You learn that loving and leading faithfully will involve real heartache. Do you stay committed?',
          presetChoices: [
            { id: 'mary4-bail', text: 'Bail out; you only signed up for comfort and praise.', stance: 'bail' },
            { id: 'mary4-numb', text: 'Numb your emotions and disconnect your heart.', stance: 'numb' },
            { id: 'mary4-fear', text: 'Live in constant dread of what bad thing might happen.', stance: 'dread' },
            { id: 'mary4-embrace', text: 'Embrace the journey with an open heart, trusting God through the sorrow.', stance: 'open_hearted_trust' }
          ],
          storyRetelling: [
            "Mary brought forty-day-old Jesus into the temple courts in Jerusalem. An elderly man named Simeon took the child into his arms with joy.",
            "He declared the infant to be God's salvation for all nations. Then Simeon looked into young Mary's eyes.",
            "He spoke with tender sorrow: 'A sword will pierce your own soul too.' Mary held her baby tight, accepting the cost of redemption."
          ],
          actionLine: 'Accept the reality that deep love sometimes brings sorrow, and love courageously anyway.',
          mirrorBackRules: {
            'mary4-bail': 'You wanted to avoid pain — profound love always carries the vulnerability of heartbreak.',
            'mary4-numb': 'You thought about numbing your heart — closing your heart protects against pain, but kills joy.',
            'mary4-fear': 'You lived in dread — Mary did not live in terror; she trusted God one day at a time.',
            'mary4-embrace': 'You chose open-hearted trust — enduring love that embraces both joy and tears is divine.'
          },
          defaultMirrorBack: 'Here is what Simeon told Mary in the temple courts.'
        }
      },
      {
        id: 'series-mary-day-5',
        seriesId: 'series-mary',
        dayNumber: 5,
        momentTitle: 'Searching Jerusalem',
        narrativeBridge: 'Day 5 shows parental panic: searching three days for twelve-year-old Jesus in the city.',
        heroName: 'Mary',
        reference: 'Luke 2:41-51',
        book: 'Luke',
        chapter: 2,
        verseRange: '41-51',
        theme: 'Parental Love & Growth',
        passageText: `Every year Jesus' parents went to Jerusalem for the Festival of the Passover. When he was twelve years old, they went up according to the custom. After the festival was over, while his parents were returning home, the boy Jesus stayed behind in Jerusalem, but they were unaware of it... Thinking he was in their company, they traveled on for a day. Then they began looking for him among their relatives and friends. When they did not find him, they went back to Jerusalem to look for him. After three days they found him in the temple courts, sitting among the teachers... His mother said to him, "Son, why have you treated us like this? Your father and I have been anxiously searching for you."`,
        keyVerseReference: 'Luke 2:48',
        keyVerseText: 'Son, why have you treated us like this? Your father and I have been anxiously searching for you.',
        kjvKeyVerseText: 'Son, why hast thou thus dealt with us? behold, thy father and I have sought thee sorrowing. — Luke 2:48 (KJV)',
        teaserHook: 'Tomorrow: The wine runs out at a village wedding, and Mary turns to Jesus to nudge His very first sign.',
        backstory: {
          category: 'Culture',
          title: 'The Passover Caravans',
          content: 'Pilgrims traveled in large communal village caravans for safety from bandits. Women and children typically traveled at the front while men followed behind. Joseph and Mary each assumed Jesus was with the other group until evening roll call.'
        },
        staticFallback: {
          scenarioQuestion: 'You feel like you have lost touch with God or your spiritual direction. What do you do?',
          presetChoices: [
            { id: 'mary5-shame', text: 'Hide in shame and pretend you never lost your way.', stance: 'shame' },
            { id: 'mary5-blame', text: 'Blame others for distracting you from your priorities.', stance: 'blame' },
            { id: 'mary5-wander', text: 'Keep wandering further down the wrong path.', stance: 'wander' },
            { id: 'mary5-return', text: 'Turn around immediately and retrace your steps back to where you last met God.', stance: 'retrace_steps' }
          ],
          storyRetelling: [
            "After Passover in Jerusalem, the Nazareth caravan walked a full day's journey north before Mary and Joseph realized Jesus was missing.",
            "They sprinted back to Jerusalem, searching frantically through the crowded alleys for three terrifying days.",
            "They finally found twelve-year-old Jesus in the temple courts discussing theology with rabbis. Mary brought Him home, keeping every memory close."
          ],
          actionLine: 'Pause today and retrace your steps in any habit where you have drifted from your values.',
          mirrorBackRules: {
            'mary5-shame': 'You felt ashamed — even the mother of Jesus lost track of Him in the bustle of life.',
            'mary5-blame': 'You wanted to blame others — Mary and Joseph owned their search together.',
            'mary5-wander': 'You thought about continuing forward — moving ahead without God only makes the distance greater.',
            'mary5-return': 'You retraced your steps — returning to the Father’s house is where peace is always recovered.'
          },
          defaultMirrorBack: 'Here is what Mary did when searching for Jesus in Jerusalem.'
        }
      },
      {
        id: 'series-mary-day-6',
        seriesId: 'series-mary',
        dayNumber: 6,
        momentTitle: 'The Jars of Cana',
        narrativeBridge: 'Day 6 shows active faith: nudging Jesus’s first miracle with one timeless instruction.',
        heroName: 'Mary',
        reference: 'John 2:1-11',
        book: 'John',
        chapter: 2,
        verseRange: '1-11',
        theme: 'Intercession & Confidence',
        passageText: `On the third day a wedding took place at Cana in Galilee. Jesus' mother was there, and Jesus and his disciples had also been invited to the wedding. When the wine was gone, Jesus' mother said to him, "They have no more wine." "Woman, why do you involve me?" Jesus replied. "My hour has not yet come." His mother said to the servants, "Do whatever he tells you." Nearby stood six stone water jars... Jesus said to the servants, "Fill the jars with water"... and it became wine.`,
        keyVerseReference: 'John 2:5',
        keyVerseText: 'His mother said to the servants, "Do whatever he tells you."',
        kjvKeyVerseText: 'His mother saith unto the servants, Whatsoever he saith unto you, do it. — John 2:5 (KJV)',
        teaserHook: 'Tomorrow: Standing at the foot of the Roman cross, the mother watches her son finish His work.',
        backstory: {
          category: 'Culture',
          title: 'The Seven-Day Village Wedding',
          content: 'A Jewish wedding feast lasted up to a full week. Running out of wine was a catastrophic social disgrace for a young peasant couple, opening them to lawsuits from guests. Mary cared deeply for the family’s honor and knew exactly where to bring the crisis.'
        },
        staticFallback: {
          scenarioQuestion: 'A crisis arises and nobody knows what to do. What is your counsel?',
          presetChoices: [
            { id: 'mary6-panic', text: 'Spread panic and criticize the host for poor planning.', stance: 'panic' },
            { id: 'mary6-gossip', text: 'Gossip about the failure to everyone at the party.', stance: 'gossip' },
            { id: 'mary6-fake', text: 'Try to cover it up with a cheap, superficial fix.', stance: 'fake' },
            { id: 'mary6-whatever', text: 'Point directly to Christ: "Do whatever He tells you."', stance: 'do_whatever_he_says' }
          ],
          storyRetelling: [
            "At a joyful village wedding in Cana, the wine ran out. The young newlyweds faced public humiliation.",
            "Mary noticed the problem. She walked up to Jesus: 'They have no more wine.' Even when He hesitated, her trust was unshakable.",
            "She turned to the confused servants with one line: 'Do whatever He tells you.' Six stone water jars were filled with the finest wine."
          ],
          actionLine: 'Follow Mary’s timeless advice today in any dilemma: "Do whatever He tells you."',
          mirrorBackRules: {
            'mary6-panic': 'You felt like panicking — Mary stepped in quietly to solve the problem with grace.',
            'mary6-gossip': 'You thought about gossiping — Mary protected the host’s dignity instead of mocking them.',
            'mary6-fake': 'You looked for a cheap fix — surface fixes run dry; Christ provides real abundance.',
            'mary6-whatever': 'You pointed to obedience — "Do whatever He tells you" is the master key to every miracle.'
          },
          defaultMirrorBack: 'Here is what Mary said to the servants at Cana.'
        }
      },
      {
        id: 'series-mary-day-7',
        seriesId: 'series-mary',
        dayNumber: 7,
        momentTitle: 'Standing by the Cross',
        narrativeBridge: 'Day 7 lands Mary’s journey: steadfast presence at the cross, enduring heartbreak with unbroken faith.',
        heroName: 'Mary',
        reference: 'John 19:25-27',
        book: 'John',
        chapter: 19,
        verseRange: '25-27',
        theme: 'Steadfast Love & Legacy',
        passageText: `Near the cross of Jesus stood his mother, his mother's sister, Mary the wife of Clopas, and Mary Magdalene. When Jesus saw his mother there, and the disciple whom he loved standing nearby, he said to her, "Woman, here is your son," and to the disciple, "Here is your mother." From that hour, this disciple took her into his home.`,
        keyVerseReference: 'John 19:25-26',
        keyVerseText: 'Near the cross of Jesus stood his mother... When Jesus saw his mother there, he said to her, "Woman, here is your son."',
        kjvKeyVerseText: 'Now there stood by the cross of Jesus his mother... When Jesus therefore saw his mother, and the disciple standing by, whom he loved, he saith unto his mother, Woman, behold thy son! — John 19:25-26 (KJV)',
        teaserHook: 'Your week with Mary is complete. From a teenage girl’s "yes" in Nazareth to steadfast presence at the cross.',
        backstory: {
          category: 'Author',
          title: 'The Stabat Mater at Golgotha',
          content: 'While most of the male disciples fled in fear of being arrested as co-conspirators, Mary stood within feet of the Roman cross. Thirty-three years after Simeon’s prophecy, the sword pierced her soul. Even in His final agony, Jesus honored His mother by entrusting her care to John.'
        },
        staticFallback: {
          scenarioQuestion: 'When someone you love is suffering and you cannot take away the pain, what do you do?',
          presetChoices: [
            { id: 'mary7-flee', text: 'Flee the room because watching pain is too unbearable.', stance: 'flee' },
            { id: 'mary7-deny', text: 'Deny the reality and refuse to accept what is happening.', stance: 'deny' },
            { id: 'mary7-bitter', text: 'Grow permanently bitter against God for allowing this suffering.', stance: 'bitter' },
            { id: 'mary7-stand', text: 'Stand faithfully beside them to the end, offering the quiet gift of loving presence.', stance: 'steadfast_presence' }
          ],
          storyRetelling: [
            "On the hill of execution outside Jerusalem, almost every disciple had abandoned Jesus and scattered.",
            "Mary stood at the foot of the Roman cross. The sword Simeon prophesied had pierced her soul to the marrow.",
            "In His final gasps, Jesus looked down at His weeping mother and gave her into the care of John. Her steadfast love never wavered."
          ],
          actionLine: 'Offer the gift of your quiet, steadfast presence today to someone carrying a heavy burden.',
          mirrorBackRules: {
            'mary7-flee': 'You felt like running — running spares your feelings, but standing with sufferers is sacred.',
            'mary7-deny': 'You wanted to deny reality — Mary met the full sorrow of the cross with open eyes.',
            'mary7-bitter': 'You felt bitter — Mary held no bitterness; she trusted the God who was redeeming the world.',
            'mary7-stand': 'You chose steadfast presence — standing beside those who suffer is the purest reflection of love.'
          },
          defaultMirrorBack: 'Here is what Mary did at the foot of the cross.'
        }
      }
    ]
  }
];

export function getWeeklySeriesById(id: string): WeeklySeries | undefined {
  return WEEKLY_SERIES.find(s => s.id === id);
}

export function getAllWeeklySeries(): WeeklySeries[] {
  return WEEKLY_SERIES;
}
