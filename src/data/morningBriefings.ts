export interface MorningBriefing {
  id: string;
  hero: string;
  title: string;
  themeTag: string;
  moment: string;
  scriptureReference: string;
  scriptureText: string;
  dailyCall: string;
  associatedVerseId: string;
  narrationScript: string;
}

export const MORNING_BRIEFINGS: MorningBriefing[] = [
  // Sunday: Rest, Alignment & Reflection
  {
    id: 'briefing-elijah-whisper',
    hero: 'Elijah at Mount Horeb',
    title: 'The Gentle Whisper in the Burnout',
    themeTag: 'Restoration & Quiet Strength',
    moment: 'Elijah was running on empty, hiding under a broom bush and begging to quit. God did not meet him in the hurricane, the earthquake, or the fire. He met him in a gentle, low whisper.',
    scriptureReference: '1 Kings 19:12',
    scriptureText: 'After the earthquake came a fire, but the Lord was not in the fire. And after the fire came a gentle whisper.',
    dailyCall: 'Shut down the noise today. Step away from endless notifications and frantic to-do lists for 15 minutes of uninterrupted silence. Hear before you run.',
    associatedVerseId: 'verse-2',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. Elijah was exhausted and burned out, running from death threats. God didn't lecture him; He fed him, let him rest, and spoke not in the earthquake or the fire, but in a gentle, low whisper. Act 2: Truth for the Pocket. 1 Kings 19:12: After the fire came a gentle whisper. Act 3: Your Call Today. Turn off the background noise and news feed. Spend 15 minutes in absolute silence, and let your soul reset before the week begins."
  },

  // Monday: Facing the Week / Courage
  {
    id: 'briefing-joshua-crossing',
    hero: 'Joshua at the Jordan Crossing',
    title: 'Stepping Into Uncharted Territory',
    themeTag: 'Courage & Facing Giants',
    moment: 'Moses was dead. Two million people were looking at Joshua to lead them into fortified enemy territory. The command was simple: Do not be terrified. Do not be discouraged. Move forward.',
    scriptureReference: 'Joshua 1:9',
    scriptureText: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    dailyCall: 'Walk into this Monday with your spine straight. Whatever hard meeting, payroll decision, or difficult phone call you dread—you do not enter that room alone.',
    associatedVerseId: 'verse-1',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. Joshua had to fill the shoes of Moses and lead a nation into fortified land. God gave him a direct order: Be strong and courageous. Act 2: Truth for the Pocket. Joshua 1:9: Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. Act 3: Your Call Today. Step into this Monday with your shoulders back. Whatever confrontation or challenge you face today, walk in knowing God is already in the room."
  },

  // Tuesday: Brotherhood & Sharpening Edge
  {
    id: 'briefing-david-brothers',
    hero: 'David in the Cave of Adullam',
    title: 'The Brotherhood of the Cave',
    themeTag: 'Endurance & Brotherhood',
    moment: 'When David was hunted like a wild animal, 400 distressed, indebted, and discontented men gathered to him in a dark cave. Instead of tearing each other down, they forged each other into Israel’s mightiest warriors.',
    scriptureReference: 'Proverbs 27:17',
    scriptureText: 'Iron sharpens iron, and one man sharpens another.',
    dailyCall: 'Call or text one brother today who tells you the unvarnished truth. Don\'t fight your battles in silent isolation; pride thrives in secret.',
    associatedVerseId: 'verse-5',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. In the cold Cave of Adullam, David was surrounded by men who had lost everything. In the pressure cooker of adversity, they sharpened one another until they became legendary warriors. Act 2: Truth for the Pocket. Proverbs 27:17: Iron sharpens iron, and one man sharpens another. Act 3: Your Call Today. Check in with a brother today. Share the real score, drop the mask, and let someone sharpen your blade."
  },

  // Wednesday: Pressure & Crisis Leadership
  {
    id: 'briefing-moses-redsea',
    hero: 'Moses at the Red Sea',
    title: 'Stand Firm Under the Charge',
    themeTag: 'Pressure & Anxiety',
    moment: 'Trapped between impenetrable water and 600 Egyptian war chariots charging at full gallop, the people panicked. Moses held no sword—only a staff and the discipline to be still.',
    scriptureReference: 'Exodus 14:14',
    scriptureText: 'The Lord will fight for you; you need only to be still.',
    dailyCall: 'When an unexpected crisis, bad news, or hostile email lands today, do not fire back with impulsive panic. Take three deep breaths, stand firm, and lead with quiet composure.',
    associatedVerseId: 'verse-6',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. Moses stood at the water's edge with six hundred iron chariots bearing down on them. The crowd screamed in terror, but Moses told them: Stand firm. The Lord will fight for you. Act 2: Truth for the Pocket. Exodus 14:14: The Lord will fight for you; you need only to be still. Act 3: Your Call Today. When an unexpected emergency hits your desk today, don't hit the panic button. Breathe, stand still, and execute with calm discipline."
  },

  // Thursday: Self-Control & Emotional Mastery
  {
    id: 'briefing-david-saul-cave',
    hero: 'David in the Cave of En Gedi',
    title: 'Conquering the Urge to Strike Back',
    themeTag: 'Anger & Self-Control',
    moment: 'King Saul stepped into a dark cave alone—the very cave where David was hiding. David’s men whispered: "Kill him now. End this." David had the blade drawn, but refused to take vengeance into his own hands.',
    scriptureReference: 'Proverbs 16:32',
    scriptureText: 'Better a patient person than a warrior, one with self-control than one who takes a city.',
    dailyCall: 'When someone provokes your pride today or cuts you off in traffic, don\'t retaliate. Master your temper; keeping your edge sheathed takes ten times more guts than swinging wildly.',
    associatedVerseId: 'verse-3',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. David had his mortal enemy within arm's reach in the dark of En Gedi. His men urged him to strike, but David mastered his impulses and chose honor over easy revenge. Act 2: Truth for the Pocket. Proverbs 16:32: Better a patient person than a warrior, one with self-control than one who takes a city. Act 3: Your Call Today. When provoked or disrespected today, show true strength. Keep your temper governed and let integrity win the day."
  },

  // Friday: Long-Term Faith & Unfair Seasons
  {
    id: 'briefing-joseph-integrity',
    hero: 'Joseph in Potiphar’s Household',
    title: 'Integrity When Nobody Is Watching',
    themeTag: 'Restoration After Failure',
    moment: 'Sold as a slave by his own flesh and blood, Joseph refused to compromise his standards in private. Years later, every injustice became the exact staircase God used to save a civilization.',
    scriptureReference: 'Genesis 50:20',
    scriptureText: 'You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives.',
    dailyCall: 'Whatever unfair treatment or delayed recognition you are enduring right now, do not cut corners. Do your job with undeniable excellence. Time will prove your worth.',
    associatedVerseId: 'verse-4',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. Joseph was betrayed by his brothers, sold into slavery, and falsely accused. Yet he never threw in the towel or compromised his honor. God turned every pit into a stepping stone to the palace. Act 2: Truth for the Pocket. Genesis 50:20: You intended to harm me, but God intended it for good. Act 3: Your Call Today. If you feel unappreciated or unfairly treated this week, keep doing top-tier work. God wastes none of your pain."
  },

  // Saturday: Grace After Failure & Mission
  {
    id: 'briefing-peter-charcoal',
    hero: 'Peter at the Sea of Tiberias',
    title: 'Grace Transforms Failure Into Mission',
    themeTag: 'Restoration & Rebuilding',
    moment: 'Peter had denied Jesus three times over a charcoal fire on the night of the trial. Weeks later, Jesus built another charcoal fire on the beach, looked Peter in the eye, and asked: "Do you love me? Feed my sheep."',
    scriptureReference: 'Luke 22:32',
    scriptureText: 'I have prayed for you, Simon, that your faith may not fail. And when you have turned back, strengthen your brothers.',
    dailyCall: 'Refuse to live under the weight of past regrets or mistakes this weekend. Your worst chapter does not disqualify you; it qualifies you to help others walk through the dark.',
    associatedVerseId: 'verse-7',
    narrationScript: "Today's 3-Minute Morning Briefing. Act 1: The Real Moment. Peter thought he had ruined his life forever after denying his Lord. But on the shores of Galilee, Jesus restored him completely and gave him the keys to lead. Act 2: Truth for the Pocket. Luke 22:32: When you have turned back, strengthen your brothers. Act 3: Your Call Today. Lay down the guilt of your past mistakes. You are not defined by where you fell, but by Who picked you up. Go strengthen someone around you today."
  }
];
