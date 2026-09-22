import type { RealLifeDilemma } from '../data/dilemmas';

export interface HeartEvaluationResult {
  stanceTitle: string;
  stanceType: 'avenger' | 'escapist' | 'pacifier' | 'strategist' | 'raw_human';
  badgeColor: string;
  coreMotive: string;
  humanValidation: string;
  theFleshTrap: string;
  biblicalPlayRedirect: string;
  scriptureReference: string;
  scriptureText: string;
  scriptureStreetMeaning: string;
  tacticalMoves: string[];
}

export function evaluateUserPlay(
  userInput: string,
  selectedFeeling: string | null,
  dilemma: RealLifeDilemma
): HeartEvaluationResult {
  const text = userInput.toLowerCase();
  
  // Keyword pattern matches
  const wrathKeywords = [
    'punch', 'beat', 'fight', 'smash', 'hit', 'kill', 'destroy', 'yell', 'scream', 
    'curse', 'cuss', 'expose', 'ruin', 'humiliate', 'call out', 'revenge', 'payback', 
    'retaliate', 'get even', 'blast', 'fire back', 'screw', 'rip', 'confront publicly',
    'sue', 'destroy him', 'destroy her', 'throat', 'slap'
  ];

  const escapeKeywords = [
    'quit', 'walk out', 'leave', 'ghost', 'ignore', 'shut down', 'give up', 'hide', 
    'drink', 'drunk', 'smoke', 'bottle', 'isolate', 'pack my bags', 'run away', 
    'never talk', 'disappear', 'numb', 'sleep', 'bed', 'cancel', 'block them'
  ];

  const pacifyKeywords = [
    'say nothing', 'let it slide', 'apologize', 'take the blame', 'swallow', 'pretend', 
    'suck it up', 'do nothing', 'be nice', 'keep peace', 'let them have it', 'let them win',
    'stay quiet', 'give in', 'give them the money', 'just pay'
  ];

  const wisdomKeywords = [
    'calm', 'pause', 'wait', 'pray', 'breathe', 'receipt', 'document', 'proof', 
    'private', 'one on one', '1 on 1', 'boundary', 'professional', 'honest', 'truth',
    'listen', 'clarify', 'step back', 'think', 'counsel', 'mentor', 'forgive', 'sleep on it'
  ];

  const temptationKeywords = [
    'look', 'watch', 'take it', 'give in', 'cheat', 'cut corners', 'fudge', 'lie',
    'easy money', 'nobody knows', 'sign', 'loan', 'tempted', 'weak', 'fail'
  ];

  let avengerScore = 0;
  let escapistScore = 0;
  let pacifierScore = 0;
  let strategistScore = 0;
  let temptationScore = 0;

  wrathKeywords.forEach(k => { if (text.includes(k)) avengerScore += 2; });
  escapeKeywords.forEach(k => { if (text.includes(k)) escapistScore += 2; });
  pacifyKeywords.forEach(k => { if (text.includes(k)) pacifierScore += 2; });
  wisdomKeywords.forEach(k => { if (text.includes(k)) strategistScore += 2; });
  temptationKeywords.forEach(k => { if (text.includes(k)) temptationScore += 2; });

  // Factor in selected quick feeling badge if present
  if (selectedFeeling === 'Furious / Want Payback') avengerScore += 3;
  if (selectedFeeling === 'Walk Away / Ghost') escapistScore += 3;
  if (selectedFeeling === 'Shut Down / Bottle It') pacifierScore += 3;
  if (selectedFeeling === 'Panicking / Tempted') temptationScore += 3;
  if (selectedFeeling === 'Calm & Strategic') strategistScore += 3;

  // Stance Determination
  if (strategistScore >= 2 && strategistScore >= avengerScore && strategistScore >= escapistScore) {
    return {
      stanceTitle: 'The Strategist (Restrained Power)',
      stanceType: 'strategist',
      badgeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-400',
      coreMotive: 'Wisdom, discernment, and emotional mastery under pressure.',
      humanValidation: `You have the instinct of David in the Cave of Adullam or Abigail halting a slaughter. You recognize that reacting in heat gives away your sovereignty, while pause and receipts protect your calling.`,
      theFleshTrap: `The subtle trap for the strategist is pride or becoming cold and cynical. Make sure your restraint comes from trusting God's justice, not just playing political chess.`,
      biblicalPlayRedirect: `Double down on the biblical play: ${dilemma.anchorScripture.streetMeaning} Stay locked in on excellence and let God handle the scoreboard.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps
    };
  }

  if (avengerScore >= escapistScore && avengerScore >= pacifierScore && avengerScore > 0) {
    return {
      stanceTitle: 'The Avenger (Wrath & Retribution)',
      stanceType: 'avenger',
      badgeColor: 'border-red-500 bg-red-950/40 text-red-400',
      coreMotive: 'Raw righteous indignation, injured pride, and the urge to settle the score right now.',
      humanValidation: `Your gut reaction is 100% human. In fact, David felt this exact rage when Nabal mocked his men—David strapped on his sword and marched 400 armed men to slaughter every male in Nabal's house until Abigail stopped him. Even Peter drew a blade in Gethsemane and cut off a soldier's ear.`,
      theFleshTrap: `Retaliation in the heat of the moment feels good for 10 seconds, but it always backfires. You become the villain in the room, handing your enemy the moral high ground and sacrificing your long-term reputation over a temporary rush of adrenaline.`,
      biblicalPlayRedirect: `The biblical play is NOT to be a doormat—it is to wield RESTRAINED strength. Keep your mouth shut in the hot zone, gather your proof in silence, and let excellence and divine justice disarm the trap.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps
    };
  }

  if (escapistScore >= pacifierScore && escapistScore > 0) {
    return {
      stanceTitle: 'The Escapist (Avoidance & Burnout)',
      stanceType: 'escapist',
      badgeColor: 'border-amber-500 bg-amber-950/40 text-amber-400',
      coreMotive: 'Emotional depletion, overwhelming dread, and the desire to make the pain vanish immediately.',
      humanValidation: `You are exhausted. When Jezebel threatened Elijah after his biggest victory, Elijah didn't fight back; he fled 100 miles into the desert, sat under a broom tree, and said, "Lord, I have had enough. Take my life." You are feeling the weight of a depleted battery.`,
      theFleshTrap: `Walking away or numbing out feels like relief, but it leaves the real battle unresolved. Running away without a strategic plan cedes ground to your adversaries and carries the unfinished stress right into your next chapter.`,
      biblicalPlayRedirect: `God did not lecture exhausted Elijah; He fed him, gave him water, and let him sleep before giving him his next mission. Take 24 hours to rest and recharge your physical battery before you make any permanent life decisions.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps
    };
  }

  if (pacifierScore > 0) {
    return {
      stanceTitle: 'The Pacifier (People-Pleasing & Suppression)',
      stanceType: 'pacifier',
      badgeColor: 'border-blue-500 bg-blue-950/40 text-blue-400',
      coreMotive: 'Fear of conflict, guilt-manipulation, and burying true feelings to keep false peace.',
      humanValidation: `Many believers mistake being a biblical peacemaker for being a passive doormat. But Jesus was never passive—He flipped tables in the temple when truth was defiled. Even Moses stepped in when an Egyptian was beating a Hebrew slave.`,
      theFleshTrap: `Swallowing your voice and letting people walk all over you does not create peace; it breeds quiet resentment, ulcers, and gives toxic behavior permission to multiply.`,
      biblicalPlayRedirect: `True biblical peace requires truth spoken in love with steel-reinforced boundaries. You can be gentle without being weak. State the facts plainly, refuse to be manipulated, and hold the line.`,
      scriptureReference: dilemma.anchorScripture.reference,
      scriptureText: dilemma.anchorScripture.text,
      scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
      tacticalMoves: dilemma.tacticalActionSteps
    };
  }

  // Default / Raw Human Response
  return {
    stanceTitle: 'The Honest Battler (Real-World Vulnerability)',
    stanceType: 'raw_human',
    badgeColor: 'border-amber-400 bg-amber-950/40 text-amber-300',
    coreMotive: 'Wrestling with high-stakes tension between flesh instinct and higher wisdom.',
    humanValidation: `Your honesty is exactly what God works with. The Psalms are filled with raw, unfiltered honesty from David telling God how scared, angry, and tired he felt. God can redeem honesty; He cannot heal pretending.`,
    theFleshTrap: `The danger in this moment is making a reactive move out of fatigue or panic before you seek clarity and alignment with God's Word.`,
    biblicalPlayRedirect: `Pause the game clock. Anchor your mind in this truth: ${dilemma.anchorScripture.streetMeaning} God has walked men through this exact fire before and brought them out unscathed.`,
    scriptureReference: dilemma.anchorScripture.reference,
    scriptureText: dilemma.anchorScripture.text,
    scriptureStreetMeaning: dilemma.anchorScripture.streetMeaning,
    tacticalMoves: dilemma.tacticalActionSteps
  };
}
