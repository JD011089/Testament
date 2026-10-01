import type { StoryQuest, StoryAct } from '../types';

export interface QuestCustomEvaluation {
  stanceType: 'wrath_combat' | 'escape_fear' | 'borrowed_armor' | 'diplomatic_pacify' | 'steadfast_faith' | 'raw_instinct';
  stanceTitle: string;
  stanceBadge: string;
  humanInstinct: string;
  historicalPivot: string;
  practicalLesson: string;
  userSummary: string;
}

const stripAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Fast client-side semantic rule analyzer for a user's authentic response to a Quest crossroads prompt.
 * Evaluates human psychological motive vs historical biblical response.
 */
export function evaluateQuestCustomResponse(
  userInput: string,
  _act: StoryAct,
  quest: StoryQuest
): QuestCustomEvaluation {
  const cleanInput = userInput.trim();
  const text = cleanInput.toLowerCase();
  const textNorm = stripAccents(text);

  const containsAny = (keywords: string[]) => {
    return keywords.some(k => text.includes(k) || textNorm.includes(stripAccents(k)));
  };

  // Wrath, attack, brute strength, confrontation
  const wrathKeywords = [
    'fight', 'kill', 'attack', 'sword', 'charge', 'smash', 'punch', 'strike', 'destroy',
    'hit', 'blade', 'weapons', 'confront', 'retaliate', 'avenge', 'cut off', 'crush',
    'frapper', 'tuer', 'attaquer', 'épée', 'détruire', 'battre', 'affronter', 'lutter'
  ];

  // Fear, running away, silence, hiding, staying back
  const fearKeywords = [
    'run', 'hide', 'stay back', 'head down', 'flee', 'leave', 'escape', 'ignore', 'silence',
    'quiet', 'keep quiet', 'avoid', 'not my problem', 'scared', 'afraid', 'terrified',
    'wait it out', 'surrender', 'give up', 'fuir', 'cacher', 'peur', 'abandonner', 'éviter'
  ];

  // Borrowed armor, conformity, asking Saul, getting armor, doing what elders/bosses say
  const armorKeywords = [
    'armor', 'armour', 'saul', 'helmet', 'shield', 'equipment', 'borrow', 'fit in', 'copy',
    'ask permission', 'listen to brothers', 'follow orders', 'protocol', 'rules', 'suit up',
    'armure', 'casque', 'protocole', 'équipement', 'emprunter'
  ];

  // Diplomacy, compromise, negotiation, talking them down, bribe
  const diplomacyKeywords = [
    'talk', 'negotiate', 'compromise', 'peace', 'treaty', 'reason', 'bribe', 'pay',
    'bargain', 'mediate', 'discuss', 'deal', 'négocier', 'paix', 'compromis', 'discuter'
  ];

  // Faith, prayer, trust God, sling, name of the Lord, calling on God
  const faithKeywords = [
    'god', 'lord', 'pray', 'prayer', 'faith', 'trust', 'worship', 'sling', 'stone',
    'covenant', 'glory', 'name of jesus', 'almighty', 'dieu', 'seigneur', 'prière', 'foi', 'confiance'
  ];

  // Detect dominant stance
  if (containsAny(faithKeywords)) {
    return {
      stanceType: 'steadfast_faith',
      stanceTitle: 'Covenant Boldness & Divine Perspective',
      stanceBadge: '⚡ Faith-Driven Action',
      userSummary: `You chose to anchor yourself in higher authority rather than human intimidation: "${cleanInput.slice(0, 80)}${cleanInput.length > 80 ? '...' : ''}"`,
      humanInstinct: "Most people view courage as absence of fear, but your instinct aligns with divine purpose—recognizing that the battle is spiritual and psychological before it is physical.",
      historicalPivot: `${quest.heroName} refused to let earthly scales dictate reality. Like your response, Scripture records that ${quest.heroName} moved forward with precision and confidence in the Living God, ignoring critics and conventional odds.`,
      practicalLesson: "When you face towering problems at work or in family life, don't enter the arena on the adversary's terms. Stand firm on your authentic spiritual calling."
    };
  }

  if (containsAny(wrathKeywords)) {
    return {
      stanceType: 'wrath_combat',
      stanceTitle: 'Direct Force & Human Combat',
      stanceBadge: '⚔️ Flesh Combat',
      userSummary: `Your gut reaction was to meet hostility with direct aggression: "${cleanInput.slice(0, 80)}${cleanInput.length > 80 ? '...' : ''}"`,
      humanInstinct: "When cornered or insulted, human adrenaline screams to fight fire with fire. We instinctively want to pick up the heaviest weapon and crush whatever stands in our way.",
      historicalPivot: `King Saul and the soldiers tried to measure Goliath's bronze spear with their own iron blades and were paralyzed for 40 days. ${quest.heroName} knew that human rage and heavy artillery could not solve this battle—spiritual clarity and lethal speed won the day.`,
      practicalLesson: "Fighting a toxic situation with matching toxicity only drags you into the mud. Winning requires spiritual discipline, tactical poise, and clean boundaries—not reckless retaliation."
    };
  }

  if (containsAny(fearKeywords)) {
    return {
      stanceType: 'escape_fear',
      stanceTitle: 'Self-Preservation & Conflict Avoidance',
      stanceBadge: '🛡️ Self-Preservation',
      userSummary: `Your instinct was to avoid the crossfire and protect your peace: "${cleanInput.slice(0, 80)}${cleanInput.length > 80 ? '...' : ''}"`,
      humanInstinct: "That is the textbook survival reflex that 95% of ordinary men and women experience. When someone powerful is threatening harm, staying silent feels like the safest gamble.",
      historicalPivot: `The entire Israelite army stood frozen on the limestone ridge for forty straight mornings doing exactly this. But evil never ceases its demands just because you stay quiet. ${quest.heroName} saw that tolerating intimidation only guarantees your eventual enslavement.`,
      practicalLesson: "Avoiding a confrontation doesn't eliminate the danger; it merely postpones it while eroding your integrity. Identify what you have been avoiding and take the first courageous step."
    };
  }

  if (containsAny(armorKeywords)) {
    return {
      stanceType: 'borrowed_armor',
      stanceTitle: 'Borrowed Authority & Conformity',
      stanceBadge: '🪖 Borrowed Protection',
      userSummary: `You looked to existing institutions, official armor, or conventional wisdom: "${cleanInput.slice(0, 80)}${cleanInput.length > 80 ? '...' : ''}"`,
      humanInstinct: "When facing a crisis out of our league, we instinctively look to authority figures, corporate titles, or someone else's playbook to shield us from personal accountability.",
      historicalPivot: `Saul actually tried to strap his bronze helmet and royal coat onto young David! But David took three clumsy steps, stripped them off, and said: 'I cannot fight in these, for I have not tested them.' He fought with what he knew: his shepherd sling.`,
      practicalLesson: "Never fight life's pivotal battles in someone else's borrowed armor. You do not need to fake an executive persona or copy someone else's style to overcome the giant before you."
    };
  }

  if (containsAny(diplomacyKeywords)) {
    return {
      stanceType: 'diplomatic_pacify',
      stanceTitle: 'Diplomatic De-escalation & Reason',
      stanceBadge: '🤝 Diplomatic Reason',
      userSummary: `You attempted to find common ground or negotiate a resolution: "${cleanInput.slice(0, 80)}${cleanInput.length > 80 ? '...' : ''}"`,
      humanInstinct: "Rational people naturally seek conversation and compromise before bloodshed. In business and civil life, de-escalation is often a mark of mature leadership.",
      historicalPivot: `Some adversaries are not looking for a contract; they are looking for total surrender. Goliath's terms were clear: 'If I kill him, you shall be our slaves.' ${quest.heroName} recognized when evil is unyielding, spiritual boldness must replace wishful thinking.`,
      practicalLesson: "Be gentle as doves, but shrewd as serpents. Recognize when someone in your life is not negotiating in good faith, and establish unshakeable, godly boundaries."
    };
  }

  // Default raw human reaction
  return {
    stanceType: 'raw_instinct',
    stanceTitle: 'Personal Prudence & Direct Assessment',
    stanceBadge: '🧭 Raw Gut Reaction',
    userSummary: `You articulated your own personal play: "${cleanInput.slice(0, 80)}${cleanInput.length > 80 ? '...' : ''}"`,
    humanInstinct: "Your reaction reflects honest human calculation when confronted with sudden adversity and immense pressure.",
    historicalPivot: `In this act, ${quest.heroName} was confronted with noise, doubt from family, and physical intimidation. Rather than following public opinion, ${quest.heroName} filtered the crisis through unwavering trust in God's promises.`,
    practicalLesson: "Notice how quickly human circumstances feel absolute until you measure them against eternity. Filter your toughest decisions through prayer and biblical conviction."
  };
}
