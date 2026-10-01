/**
 * Biblical Knowledge Graph ("The Tactical Nexus")
 * Interconnects Story Quests, Field Medic Psalms, Proverbs, Character Dossiers,
 * and Modern Dilemmas into a rich relational matrix.
 */

export interface NexusNode {
  id: string;
  title: string;
  type: 'quest' | 'psalm' | 'proverb' | 'dilemma' | 'dossier';
  label: string;
  description: string;
  scriptureRef?: string;
}

export interface NexusConnection {
  sourceId: string;
  targetId: string;
  relationship: 'written_during' | 'theological_precedent' | 'wisdom_principle' | 'modern_parallel' | 'antagonist_profile';
  badgeLabel: string;
  contextNote: string;
}

export const NEXUS_NODES: Record<string, NexusNode> = {
  // Quests
  'david-journey': {
    id: 'david-journey',
    title: 'David: The Outlaw & The Giant',
    type: 'quest',
    label: 'Story Quest',
    description: 'David pursued by King Saul in the caves of En-gedi and Adullam.'
  },
  'joseph-journey': {
    id: 'joseph-journey',
    title: 'Joseph: The Forge of Egypt',
    type: 'quest',
    label: 'Story Quest',
    description: 'Betrayed by brothers, forgotten in prison, elevated to Prime Minister.'
  },
  'peter-journey': {
    id: 'peter-journey',
    title: 'Peter: Courtyard & Commission',
    type: 'quest',
    label: 'Story Quest',
    description: 'From catastrophic denial by the fire to fearless apostle of Pentecost.'
  },
  'elijah-journey': {
    id: 'elijah-journey',
    title: 'Elijah: Fire & Desert Silence',
    type: 'quest',
    label: 'Story Quest',
    description: 'Confronting Mount Carmel, crashing into burnout under the broom tree.'
  },

  // Psalms (Field Medic Prescriptions)
  'psalm-27-light': {
    id: 'psalm-27-light',
    title: 'The Fortress in the Ambush • Psalm 27',
    type: 'psalm',
    label: 'Historical Prayer',
    scriptureRef: 'Psalm 27:1-3',
    description: 'Composed while David was cornered against the sheer limestone drops of En-gedi.'
  },
  'psalm-55-companion': {
    id: 'psalm-55-companion',
    title: 'Knife in the Back • Psalm 55',
    type: 'psalm',
    label: 'Betrayal Prayer',
    scriptureRef: 'Psalm 55:12-14',
    description: 'David agonizing when his most trusted advisor Ahithophel defected to the enemy.'
  },
  'psalm-51-clean-heart': {
    id: 'psalm-51-clean-heart',
    title: 'Heart Restoration • Psalm 51',
    type: 'psalm',
    label: 'Heart Restoration',
    scriptureRef: 'Psalm 51:10-12',
    description: 'The agonizing cry for a clean heart after Nathan confronted David on his moral crash.'
  },
  'psalm-42-soul-check': {
    id: 'psalm-42-soul-check',
    title: 'Insomnia & Soul Thirst • Psalm 42',
    type: 'psalm',
    label: 'Fortress Anthem',
    scriptureRef: 'Psalm 42:5, 11',
    description: 'The tactical anthem for dark nights: "Why are you cast down, O my soul?"'
  },

  // Proverbs Scenarios
  'proverb-gentle-answer': {
    id: 'proverb-gentle-answer',
    title: 'Proverbs 15:1 • The Gentle Answer',
    type: 'proverb',
    label: 'Tactical Proverb',
    scriptureRef: 'Proverbs 15:1',
    description: 'A gentle answer turns away wrath, but a harsh word stirs up anger.'
  },
  'proverb-pride-ruin': {
    id: 'proverb-pride-ruin',
    title: 'Proverbs 16:18 • Pride Before Destruction',
    type: 'proverb',
    label: 'Warning Principle',
    scriptureRef: 'Proverbs 16:18',
    description: 'Pride goes before destruction, a haughty spirit before a fall.'
  },
  'proverb-debt-slave': {
    id: 'proverb-debt-slave',
    title: 'Proverbs 22:7 • The Borrower Is Servant',
    type: 'proverb',
    label: 'Economic Principle',
    scriptureRef: 'Proverbs 22:7',
    description: 'The rich rule over the poor, and the borrower is slave to the lender.'
  },

  // Dilemmas
  'dilemma-credit-thief': {
    id: 'dilemma-credit-thief',
    title: 'The Workplace Credit Thief',
    type: 'dilemma',
    label: 'Real-Life Scenario',
    description: 'A peer takes credit for your 60-hour presentation in the executive meeting.'
  },
  'dilemma-burnout': {
    id: 'dilemma-burnout',
    title: 'Executive Burnout & The Desert',
    type: 'dilemma',
    label: 'Real-Life Scenario',
    description: 'Exhausted from prolonged crisis and feeling completely depleted.'
  },

  // Character Dossiers
  'david': {
    id: 'david',
    title: 'David • Profile & Background',
    type: 'dossier',
    label: 'Character Dossier',
    description: 'The underdog shepherd, wilderness fugitive, and relentless worshipper.'
  },
  'joseph': {
    id: 'joseph',
    title: 'Joseph • Profile & Background',
    type: 'dossier',
    label: 'Character Dossier',
    description: 'Sold by family, framed in Egypt, forged into master statesman.'
  },
  'peter': {
    id: 'peter',
    title: 'Peter • Profile & Background',
    type: 'dossier',
    label: 'Character Dossier',
    description: 'From impulsive fisherman to pillar of the early church.'
  },
  'elijah': {
    id: 'elijah',
    title: 'Elijah • Profile & Background',
    type: 'dossier',
    label: 'Character Dossier',
    description: 'The uncompromising prophet who called down fire and battled burnout.'
  }
};

export const NEXUS_CONNECTIONS: NexusConnection[] = [
  // David Quest Connections
  {
    sourceId: 'david-journey',
    targetId: 'psalm-27-light',
    relationship: 'written_during',
    badgeLabel: 'Composed In This Crisis',
    contextNote: 'David prayed this psalm in real-time while Saul’s royal squads staked out his location in the cliffs.'
  },
  {
    sourceId: 'david-journey',
    targetId: 'david',
    relationship: 'theological_precedent',
    badgeLabel: 'Protagonist Dossier',
    contextNote: 'Examine David’s combat stats, temperament flaws, and divine calling.'
  },
  {
    sourceId: 'david-journey',
    targetId: 'proverb-gentle-answer',
    relationship: 'wisdom_principle',
    badgeLabel: 'Tactical Doctrine',
    contextNote: 'De-escalating Saul’s psychotic rage required unmatched poise and restrained speech.'
  },
  {
    sourceId: 'david-journey',
    targetId: 'dilemma-credit-thief',
    relationship: 'modern_parallel',
    badgeLabel: 'Modern Workplace Precedent',
    contextNote: 'How to handle superiors or colleagues who feel threatened by your competence.'
  },

  // Joseph Quest Connections
  {
    sourceId: 'joseph-journey',
    targetId: 'joseph',
    relationship: 'theological_precedent',
    badgeLabel: 'Protagonist Dossier',
    contextNote: 'Study Joseph’s administrative genius, emotional resilience, and integrity under pressure.'
  },
  {
    sourceId: 'joseph-journey',
    targetId: 'dilemma-credit-thief',
    relationship: 'modern_parallel',
    badgeLabel: 'Direct Modern Parallel',
    contextNote: 'Joseph was forgotten by the Chief Cupbearer yet never became toxic or cynical.'
  },
  {
    sourceId: 'joseph-journey',
    targetId: 'proverb-debt-slave',
    relationship: 'wisdom_principle',
    badgeLabel: 'Economic Stewardship',
    contextNote: 'Joseph stored grain during the seven abundant years to preserve nations in famine.'
  },

  // Elijah Quest Connections
  {
    sourceId: 'elijah-journey',
    targetId: 'elijah',
    relationship: 'theological_precedent',
    badgeLabel: 'Protagonist Dossier',
    contextNote: 'Inspect Elijah’s supernatural boldness on Carmel contrasted with his vulnerability under the broom tree.'
  },
  {
    sourceId: 'elijah-journey',
    targetId: 'dilemma-burnout',
    relationship: 'modern_parallel',
    badgeLabel: 'Burnout Recovery Play',
    contextNote: 'God prescribes physical rest, nutrition, and quiet before giving the next mission.'
  },
  {
    sourceId: 'elijah-journey',
    targetId: 'psalm-42-soul-check',
    relationship: 'written_during',
    badgeLabel: 'Fortress Anthem',
    contextNote: 'The antidote to mental depletion: "Why are you cast down, O my soul?"'
  },

  // Peter Quest Connections
  {
    sourceId: 'peter-journey',
    targetId: 'peter',
    relationship: 'theological_precedent',
    badgeLabel: 'Protagonist Dossier',
    contextNote: 'Examine Peter’s restoration after public failure by the fire.'
  },
  {
    sourceId: 'peter-journey',
    targetId: 'proverb-pride-ruin',
    relationship: 'wisdom_principle',
    badgeLabel: 'Warning Doctrine',
    contextNote: '"Even if all fall away, I never will"—how spiritual overconfidence precedes a fall.'
  },

  // Dilemma reverse links
  {
    sourceId: 'dilemma-credit-thief',
    targetId: 'david-journey',
    relationship: 'theological_precedent',
    badgeLabel: 'Historical Precedent',
    contextNote: 'David served Saul with distinction even while Saul hurled spears at his head.'
  },
  {
    sourceId: 'dilemma-credit-thief',
    targetId: 'psalm-27-light',
    relationship: 'written_during',
    badgeLabel: 'Battlefield Psalm',
    contextNote: 'Pray Psalm 27 when facing office politics, toxic bosses, and deceitful peers.'
  },
  {
    sourceId: 'dilemma-burnout',
    targetId: 'elijah-journey',
    relationship: 'theological_precedent',
    badgeLabel: 'Historical Recovery',
    contextNote: 'How Elijah recovered after running into the desert and wanting to die.'
  }
];

export interface ConnectedNexusItem {
  connection: NexusConnection;
  target: NexusNode;
}

export const getConnectedNexusItems = (entityId: string): ConnectedNexusItem[] => {
  return NEXUS_CONNECTIONS
    .filter(c => c.sourceId === entityId)
    .map(connection => ({
      connection,
      target: NEXUS_NODES[connection.targetId]
    }))
    .filter(item => Boolean(item.target));
};
