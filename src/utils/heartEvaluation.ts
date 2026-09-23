import type { RealLifeDilemma } from '../data/dilemmas';

export interface HeartEvaluationResult {
  stanceTitle: string;
  stanceType: 'avenger' | 'escapist' | 'pacifier' | 'strategist' | 'raw_human';
  badgeColor: string;
  coreMotive: string;
  // Specific word & strategy analysis of user's answer (Requirement 4)
  userWordsAnalysis: {
    userQuoteSummary: string;
    detectedKeywords: string[];
    primaryTactic: string;
    detectedTone: string;
  };
  directAnswerToUser: string;
  tacticalProsCons: {
    strength: string;
    vulnerability: string;
  };
  humanValidation: string;
  theFleshTrap: string;
  biblicalPlayRedirect: string;
  scriptureReference: string;
  scriptureText: string;
  scriptureStreetMeaning: string;
  tacticalMoves: string[];
  socraticChallenge: string;
  temperamentProfile?: TemperamentProfile;
}

export interface TemperamentProfile {
  graceScore: number; // 0 - 100
  truthScore: number; // 0 - 100
  prudenceScore: number; // 0 - 100
  courageScore: number; // 0 - 100
  archetype: string;
  archetypeTitle: string;
  archetypeDescription: string;
}

export function evaluateUserPlay(
  userInput: string,
  selectedFeeling: string | null,
  dilemma: RealLifeDilemma
): HeartEvaluationResult {
  const cleanInput = userInput.trim();
  const text = cleanInput.toLowerCase();
  
  // Tactical action dictionaries
  const wrathKeywords = [
    'punch', 'beat', 'fight', 'smash', 'hit', 'kill', 'destroy', 'yell', 'scream', 
    'curse', 'cuss', 'expose', 'ruin', 'humiliate', 'call out', 'revenge', 'payback', 
    'retaliate', 'get even', 'blast', 'fire back', 'screw', 'rip', 'confront publicly',
    'sue', 'destroy him', 'destroy her', 'throat', 'slap', 'confront', 'argue', 'lash out',
    'threaten', 'expose them'
  ];

  const escapeKeywords = [
    'quit', 'walk out', 'leave', 'ghost', 'ignore', 'shut down', 'give up', 'hide', 
    'drink', 'drunk', 'smoke', 'bottle', 'isolate', 'pack my bags', 'run away', 
    'never talk', 'disappear', 'numb', 'sleep', 'bed', 'cancel', 'block them', 'resign',
    'avoid', 'drop out', 'forget it'
  ];

  const pacifyKeywords = [
    'say nothing', 'let it slide', 'apologize', 'take the blame', 'swallow', 'pretend', 
    'suck it up', 'do nothing', 'be nice', 'keep peace', 'let them have it', 'let them win',
    'stay quiet', 'give in', 'give them the money', 'just pay', 'comply', 'nod along',
    'compromise', 'avoid conflict'
  ];

  const documentationKeywords = [
    'receipt', 'receipts', 'email', 'emails', 'document', 'proof', 'paper trail',
    'timestamp', 'timestamps', 'screenshot', 'screenshots', 'notes', 'records',
    'cc', 'bcc', 'audit', 'file', 'forward'
  ];

  const escalationKeywords = [
    'hr', 'boss', 'manager', 'vp', 'executive', 'director', 'ceo', 'board',
    'lawyer', 'legal', 'police', 'mediator', 'authority', 'supervisor'
  ];

  const communicationKeywords = [
    'private', '1 on 1', 'one on one', 'lunch', 'coffee', 'calmly', 'talk',
    'discuss', 'clarify', 'ask', 'listen', 'boundary', 'boundaries', 'honest',
    'truth', 'conversation', 'explain', 'meet'
  ];

  const prayerKeywords = [
    'pray', 'prayer', 'god', 'scripture', 'fast', 'pastor', 'mentor', 'counsel',
    'breathe', 'pause', 'wait', 'step back', 'wisdom', 'forgive', 'sleep on it'
  ];

  // Collect all detected keywords
  const detectedKeywords: string[] = [];
  const checkKeywords = (list: string[]) => {
    list.forEach(k => {
      if (text.includes(k) && !detectedKeywords.includes(k)) {
        detectedKeywords.push(k);
      }
    });
  };

  checkKeywords(wrathKeywords);
  checkKeywords(escapeKeywords);
  checkKeywords(pacifyKeywords);
  checkKeywords(documentationKeywords);
  checkKeywords(escalationKeywords);
  checkKeywords(communicationKeywords);
  checkKeywords(prayerKeywords);

  // Scoring
  let avengerScore = 0;
  let escapistScore = 0;
  let pacifierScore = 0;
  let strategistScore = 0;

  wrathKeywords.forEach(k => { if (text.includes(k)) avengerScore += 2; });
  escapeKeywords.forEach(k => { if (text.includes(k)) escapistScore += 2; });
  pacifyKeywords.forEach(k => { if (text.includes(k)) pacifierScore += 2; });
  documentationKeywords.forEach(k => { if (text.includes(k)) strategistScore += 3; });
  communicationKeywords.forEach(k => { if (text.includes(k)) strategistScore += 2; });
  prayerKeywords.forEach(k => { if (text.includes(k)) strategistScore += 2; });
  escalationKeywords.forEach(k => { if (text.includes(k)) strategistScore += 1; });

  // Emotional badges weighting
  if (selectedFeeling === 'Furious / Want Payback') avengerScore += 3;
  if (selectedFeeling === 'Walk Away / Ghost') escapistScore += 3;
  if (selectedFeeling === 'Shut Down / Bottle It') pacifierScore += 3;
  if (selectedFeeling === 'Panicking / Tempted') {
    escapistScore += 1;
    pacifierScore += 1;
  }
  if (selectedFeeling === 'Calm & Strategic') strategistScore += 3;

  // Determine Tactic & Tone based on actual user input
  let primaryTactic = 'Direct Action & Gut Instinct';
  let detectedTone = 'Authentic & Unfiltered';

  if (documentationKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Building an Irrefutable Paper Trail';
    detectedTone = 'Calculated, Methodical & Evidence-Focused';
  } else if (escalationKeywords.some(k => text.includes(k)) && wrathKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Aggressive Institutional Escalation';
    detectedTone = 'Indignant, Demanding Accountability';
  } else if (escalationKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Formal Hierarchy Escalation (HR / Leadership)';
    detectedTone = 'Procedural & Seeking Institutional Intervention';
  } else if (communicationKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Direct Closed-Door Clarification';
    detectedTone = 'Constructive, Measured & Assertive';
  } else if (wrathKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Direct Confrontation & Retaliation';
    detectedTone = 'Fierce, Reactive & Emotionally Charged';
  } else if (escapeKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Total Disengagement & Tactical Withdrawal';
    detectedTone = 'Exhausted, Boundary-Drawing & Self-Preserving';
  } else if (pacifyKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Conflict De-escalation through Concession';
    detectedTone = 'Peace-Keeping, Yielding & Protective of Calm';
  } else if (prayerKeywords.some(k => text.includes(k))) {
    primaryTactic = 'Spiritual Pause & Seeking Divine Counsel';
    detectedTone = 'Reflective, Grounded & Discerning';
  }

  // Generate dynamic excerpt summary
  const userQuoteSummary = cleanInput.length > 0 
    ? (cleanInput.length > 120 ? `"${cleanInput.slice(0, 117)}..."` : `"${cleanInput}"`)
    : (selectedFeeling ? `Reaction: ${selectedFeeling}` : `"Raw Gut Reaction"`);

  // Stance classification & dynamic bespoke answers
  if (strategistScore >= 2 && strategistScore >= avengerScore && strategistScore >= escapistScore) {
    const hasDocumentation = documentationKeywords.some(k => text.includes(k));
    const hasEscalation = escalationKeywords.some(k => text.includes(k));
    const hasPrayer = prayerKeywords.some(k => text.includes(k));

    let directAnswer = `You approached this situation with composure. `;
    if (hasDocumentation) {
      directAnswer += `Specifically focusing on concrete receipts and records (${detectedKeywords.filter(k => documentationKeywords.includes(k)).join(', ')}) grounds the situation in undeniable reality rather than volatile emotion. `;
    }
    if (hasEscalation) {
      directAnswer += `Looping in authority or formal channels keeps the problem from becoming an unrecorded street fight. `;
    }
    if (hasPrayer) {
      directAnswer += `Pausing to pray or seek counsel safeguards your perspective so you respond from authority rather than anxiety. `;
    }
    directAnswer += `In "${dilemma.title}", this play prevents your adversary from dictating the rules of engagement.`;

    return {
      stanceTitle: 'The Strategist (Restrained Power)',
      stanceType: 'strategist',
      badgeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-400',
      coreMotive: 'Wisdom, emotional mastery, and decisive positioning.',
      userWordsAnalysis: {
        userQuoteSummary,
        detectedKeywords: detectedKeywords.slice(0, 5),
        primaryTactic,
        detectedTone
      },
      directAnswerToUser: directAnswer,
      tacticalProsCons: {
        strength: 'Keeps you completely in control of your emotional sovereignty and leaves an unassailable factual trail.',
        vulnerability: 'Beware of becoming cynical or plotting solely in human cleverness without trusting God’s timing.'
      },
      humanValidation: `You have the instinct of David in the Cave of Adullam or Abigail halting a slaughter. You recognize that reacting in heat gives away your sovereignty, while pause and receipts protect your calling.`,
      theFleshTrap: `The subtle trap for the strategist is pride or becoming cold and cynical. Make sure your restraint comes from trusting God's justice, not just playing political chess.`,
      biblicalPlayRedirect: `Double down on the biblical play: ${dilemma.anchorScripture.streetMeaning} Stay locked in on excellence and let God handle the scoreboard.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps,
      socraticChallenge: `You chose a disciplined, tactical play. But Matthew 18:15 calls for an honest private 1-on-1 before institutional escalation. If you sit across from them one-on-one first, what exact boundary will you state, and how will you prevent them from manipulating the narrative?`
    };
  }

  if (avengerScore >= escapistScore && avengerScore >= pacifierScore && avengerScore > 0) {
    const directAnswer = `Your instinct was to confront forcefully and strike back against the injustice. Using words like "${detectedKeywords.slice(0, 3).join('", "') || 'fight back'}" highlights that your sense of fairness is deeply provoked by "${dilemma.title}". However, an emotional attack in this moment risks handing your opponent the moral high ground and turning you into the problem in the room.`;

    return {
      stanceTitle: 'The Avenger (Wrath & Retribution)',
      stanceType: 'avenger',
      badgeColor: 'border-red-500 bg-red-950/40 text-red-400',
      coreMotive: 'Raw righteous indignation, injured pride, and the urge to settle the score immediately.',
      userWordsAnalysis: {
        userQuoteSummary,
        detectedKeywords: detectedKeywords.slice(0, 5),
        primaryTactic,
        detectedTone
      },
      directAnswerToUser: directAnswer,
      tacticalProsCons: {
        strength: 'You refuse to be a passive victim and possess the guts to confront wickedness directly.',
        vulnerability: 'Firing in the hot zone gives away your tactical surprise, burns bridges, and damages your long-term credibility.'
      },
      humanValidation: `Your gut reaction is 100% human. In fact, David felt this exact rage when Nabal mocked his men—David strapped on his sword and marched 400 armed men to slaughter every male in Nabal's house until Abigail stopped him. Even Peter drew a blade in Gethsemane and cut off a soldier's ear.`,
      theFleshTrap: `Retaliation in the heat of the moment feels good for 10 seconds, but it always backfires. You become the villain in the room, handing your enemy the moral high ground and sacrificing your long-term reputation over a temporary rush of adrenaline.`,
      biblicalPlayRedirect: `The biblical play is NOT to be a doormat—it is to wield RESTRAINED strength. Keep your mouth shut in the hot zone, gather your proof in silence, and let excellence and divine justice disarm the trap.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps,
      socraticChallenge: `You're ready for direct confrontation. Proverbs 15:1 warns that harsh words stir up wrath while a gentle answer turns it away. If you confront them directly, how will you ensure your motive is reconciliation and truth rather than venting wounded pride?`
    };
  }

  if (escapistScore >= pacifierScore && escapistScore > 0) {
    const directAnswer = `Your proposal centers around walking away or stepping back entirely. Words indicating disengagement ("${detectedKeywords.slice(0, 3).join('", "') || 'walk away'}") signal that your emotional reserves are drained by this dilemma. While stepping back to preserve sanity is healthy, abruptly quitting or ghosting in "${dilemma.title}" leaves your flank exposed and abandons territory you spent months building.`;

    return {
      stanceTitle: 'The Escapist (Avoidance & Burnout)',
      stanceType: 'escapist',
      badgeColor: 'border-amber-500 bg-amber-950/40 text-amber-400',
      coreMotive: 'Emotional depletion, overwhelming dread, and the desire to make the pain vanish immediately.',
      userWordsAnalysis: {
        userQuoteSummary,
        detectedKeywords: detectedKeywords.slice(0, 5),
        primaryTactic,
        detectedTone
      },
      directAnswerToUser: directAnswer,
      tacticalProsCons: {
        strength: 'Recognizes toxic friction early and avoids prolonging foolish arguments with unreasonable people.',
        vulnerability: 'Unplanned exits surrender hard-earned progress, forfeit leverage, and allow deceitful peers to win by default.'
      },
      humanValidation: `You are exhausted. When Jezebel threatened Elijah after his biggest victory, Elijah didn't fight back; he fled 100 miles into the desert, sat under a broom tree, and said, "Lord, I have had enough. Take my life." You are feeling the weight of a depleted battery.`,
      theFleshTrap: `Walking away or numbing out feels like relief, but it leaves the real battle unresolved. Running away without a strategic plan cedes ground to your adversaries and carries the unfinished stress right into your next chapter.`,
      biblicalPlayRedirect: `God did not lecture exhausted Elijah; He fed him, gave him water, and let him sleep before giving him his next mission. Take 24 hours to rest and recharge your physical battery before you make any permanent life decisions.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps,
      socraticChallenge: `You want to withdraw or walk away to stop the pain. But running surrenders the territory you labored to build. If God is using this crucible to forge resilience in you, what is one courageous boundary you can hold instead of fleeing?`
    };
  }

  if (pacifierScore > 0) {
    const directAnswer = `You leaned toward keeping the peace, staying quiet, or absorbing the blow ("${detectedKeywords.slice(0, 3).join('", "') || 'stay quiet'}"). In "${dilemma.title}", choosing not to make waves can feel noble, but swallowing truth often gives toxic behavior implicit permission to repeat itself. Real peace is not the absence of conflict—it is the presence of righteous order.`;

    return {
      stanceTitle: 'The Pacifier (People-Pleasing & Suppression)',
      stanceType: 'pacifier',
      badgeColor: 'border-blue-500 bg-blue-950/40 text-blue-400',
      coreMotive: 'Fear of conflict, guilt-manipulation, and burying true feelings to keep false peace.',
      userWordsAnalysis: {
        userQuoteSummary,
        detectedKeywords: detectedKeywords.slice(0, 5),
        primaryTactic,
        detectedTone
      },
      directAnswerToUser: directAnswer,
      tacticalProsCons: {
        strength: 'Gentle spirit and high patience that de-escalates explosive tempers in the room.',
        vulnerability: 'Allows predatory people to walk over you and generates quiet internal bitterness that corrodes your health.'
      },
      humanValidation: `Many believers mistake being a biblical peacemaker for being a passive doormat. But Jesus was never passive—He flipped tables in the temple when truth was defiled. Even Moses stepped in when an Egyptian was beating a Hebrew slave.`,
      theFleshTrap: `Swallowing your voice and letting people walk all over you does not create peace; it breeds quiet resentment, ulcers, and gives toxic behavior permission to multiply.`,
      biblicalPlayRedirect: `True biblical peace requires truth spoken in love with steel-reinforced boundaries. You can be gentle without being weak. State the facts plainly, refuse to be manipulated, and hold the line.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps,
      socraticChallenge: `You chose to stay quiet or absorb the loss. But biblical peace is not conflict avoidance. Proverbs 27:6 says faithful are the wounds of a friend. What truth do you need to speak out loud to them, even if it feels uncomfortable in the moment?`
    };
  }

  // Default / Raw Human Response
  const directAnswer = cleanInput.length > 0 
    ? `You articulated a genuine, candid human response: "${cleanInput}". In high-stakes moments like "${dilemma.title}", having the courage to name how you truly feel without filtering for church politeness is the first step toward wise tactical execution.`
    : `Facing "${dilemma.title}" provokes real anxiety and tension. In moments where what's at stake is "${dilemma.whatIsAtStake}", rushing to a quick move before anchoring your mind can cost you dearly.`;

  return {
    stanceTitle: 'The Honest Battler (Real-World Vulnerability)',
    stanceType: 'raw_human',
    badgeColor: 'border-amber-400 bg-amber-950/40 text-amber-300',
    coreMotive: 'Wrestling with high-stakes tension between flesh instinct and higher wisdom.',
    userWordsAnalysis: {
      userQuoteSummary,
      detectedKeywords: detectedKeywords.slice(0, 5),
      primaryTactic,
      detectedTone
    },
    directAnswerToUser: directAnswer,
    tacticalProsCons: {
      strength: 'Zero hypocrisy—you speak what you actually feel rather than hiding behind religious clichés.',
      vulnerability: 'Unprocessed vulnerability without a concrete tactical gameplan can leave you indecisive in the crucible.'
    },
    humanValidation: `Your honesty is exactly what God works with. The Psalms are filled with raw, unfiltered honesty from David telling God how scared, angry, and tired he felt. God can redeem honesty; He cannot heal pretending.`,
    theFleshTrap: `The danger in this moment is making a reactive move out of fatigue or panic before you seek clarity and alignment with God's Word.`,
    biblicalPlayRedirect: `Pause the game clock. Anchor your mind in this truth: ${dilemma.anchorScripture.streetMeaning} God has walked men through this exact fire before and brought them out unscathed.`,
    scriptureReference: dilemma.anchorScripture.reference,
    scriptureText: dilemma.anchorScripture.text,
    scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
    tacticalMoves: dilemma.tacticalActionSteps,
    socraticChallenge: `You named your real, unfiltered reaction. Looking ahead to tomorrow morning: what is the single next concrete action step you can take that honors God and protects your integrity?`
  };
}

/**
 * Multi-Turn Socratic AI Response Evaluator (Turn 2)
 * Evaluates how the user answers the incisive counter-question and computes their
 * Biblical Tactical Temperament Profile across Grace, Truth, Prudence, and Courage.
 */
export function evaluateSocraticTurn2(
  turn1Answer: string,
  turn2Answer: string,
  dilemma: RealLifeDilemma
): { followUpFeedback: string; temperament: TemperamentProfile } {
  const combined = `${turn1Answer} ${turn2Answer}`.toLowerCase();
  
  // Calculate virtue scores (0-100)
  let graceScore = 45;
  let truthScore = 50;
  let prudenceScore = 50;
  let courageScore = 50;

  // Grace markers
  if (['forgive', 'mercy', 'listen', 'patience', 'reconcil', 'private', 'quiet', 'grace', 'heal', 'gentle', 'love'].some(w => combined.includes(w))) {
    graceScore += 25;
  }
  // Truth markers
  if (['truth', 'fact', 'receipt', 'honest', 'confront', 'clear', 'clarity', 'expose', 'call out', 'standard', 'real'].some(w => combined.includes(w))) {
    truthScore += 25;
  }
  // Prudence markers
  if (['plan', 'pause', 'wait', 'document', 'email', 'counsel', 'pray', 'think', 'advice', 'timing', 'measure'].some(w => combined.includes(w))) {
    prudenceScore += 25;
  }
  // Courage markers
  if (['stand', 'face', 'bold', 'speak', 'refuse', 'boundary', 'boundaries', 'direct', 'action', 'address'].some(w => combined.includes(w))) {
    courageScore += 25;
  }

  // Bound between 15 and 95
  graceScore = Math.min(95, Math.max(15, graceScore));
  truthScore = Math.min(95, Math.max(15, truthScore));
  prudenceScore = Math.min(95, Math.max(15, prudenceScore));
  courageScore = Math.min(95, Math.max(15, courageScore));

  // Determine Archetype
  let archetype = 'The Solomon';
  let archetypeTitle = 'The Solomon: Discerning Arbiter';
  let archetypeDescription = 'You demonstrate a balanced, measured temperament. You weigh motives, downstream consequences, and human emotion before executing.';

  if (truthScore >= 70 && courageScore >= 70) {
    archetype = 'The Nathan';
    archetypeTitle = 'The Nathan: Bold Truth-Teller';
    archetypeDescription = 'Like the prophet Nathan confronting King David, you have the holy fire to speak truth straight to authority when lines are crossed.';
  } else if (prudenceScore >= 70 && truthScore >= 70) {
    archetype = 'The Nehemiah';
    archetypeTitle = 'The Nehemiah: Disciplined Architect';
    archetypeDescription = 'Like Nehemiah rebuilding Jerusalem with a trowel in one hand and a sword in the other, you anchor your boldness in meticulous strategy and records.';
  } else if (graceScore >= 70 && prudenceScore >= 70) {
    archetype = 'The Abigail';
    archetypeTitle = 'The Abigail: Strategic Diplomat';
    archetypeDescription = 'Like Abigail intercepting David before bloodshed, you use emotional intelligence and wisdom to disarm hostility before it destroys relationships.';
  } else if (graceScore >= 70 && courageScore >= 70) {
    archetype = 'The Barnabas';
    archetypeTitle = 'The Barnabas: Relational Peacemaker';
    archetypeDescription = 'Like Barnabas advocating for Paul when others were terrified, your courage is dedicated to redeeming people and bridging divided camps.';
  } else if (courageScore >= 75) {
    archetype = 'The Caleb';
    archetypeTitle = 'The Caleb: Fearless Pioneer';
    archetypeDescription = 'Like Caleb declaring "Give me this mountain", you charge headfirst into challenging territory without retreating before giants.';
  }

  const temperament: TemperamentProfile = {
    graceScore,
    truthScore,
    prudenceScore,
    courageScore,
    archetype,
    archetypeTitle,
    archetypeDescription
  };

  try {
    localStorage.setItem('testament_temperament_profile', JSON.stringify(temperament));
  } catch {
    // ignore
  }

  const followUpFeedback = `You refined your tactical plan: "${turn2Answer.trim()}". Integrating both moves demonstrates genuine discipleship discipline. You confronted the hard counter-question rather than evading it, demonstrating growth toward biblical mastery in "${dilemma.title}".`;

  return { followUpFeedback, temperament };
}

