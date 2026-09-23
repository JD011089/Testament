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
    title: 'David: The Wilderness Fugitive',
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

  // Psalms (Field Medic)
  'psalm-59': {
    id: 'psalm-59',
    title: 'Psalm 59 • When Saul Sent Men to Watch David\'s House',
    type: 'psalm',
    label: 'Historical Prayer',
    scriptureRef: 'Psalm 59:1-3, 16-17',
    description: 'Composed when Saul dispatched execution squads to surround David’s home.'
  },
  'psalm-57': {
    id: 'psalm-57',
    title: 'Psalm 57 • When David Fled into the Cave',
    type: 'psalm',
    label: 'Cave Sanctuary',
    scriptureRef: 'Psalm 57:1-3',
    description: 'Written in dark limestone while Saul\'s army passed outside the cave entrance.'
  },
  'psalm-51': {
    id: 'psalm-51',
    title: 'Psalm 51 • David\'s Broken Heart & Renewal',
    type: 'psalm',
    label: 'Heart Restoration',
    scriptureRef: 'Psalm 51:10-12',
    description: 'The agonizing cry for a clean heart after Nathan’s confrontation.'
  },
  'psalm-46': {
    id: 'psalm-46',
    title: 'Psalm 46 • God Is Our Refuge & Strength',
    type: 'psalm',
    label: 'Fortress in Calamity',
    scriptureRef: 'Psalm 46:1-3, 10',
    description: 'The ancient fortress hymn: "Be still, and know that I am God."'
  },

  // Proverbs
  'proverb-15-1': {
    id: 'proverb-15-1',
    title: 'Proverbs 15:1 • The Gentle Answer',
    type: 'proverb',
    label: 'Tactical Proverb',
    scriptureRef: 'Proverbs 15:1',
    description: 'A gentle answer turns away wrath, but a harsh word stirs up anger.'
  },
  'proverb-22-29': {
    id: 'proverb-22-29',
    title: 'Proverbs 22:29 • Mastery Before Kings',
    type: 'proverb',
    label: 'Workplace Principle',
    scriptureRef: 'Proverbs 22:29',
    description: 'Do you see someone skilled in their work? They will stand before kings.'
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

  // Dossiers
  'dossier-saul': {
    id: 'dossier-saul',
    title: 'King Saul • Psychological Profile',
    type: 'dossier',
    label: 'Field Dossier',
    description: 'Paranoia, insecure authority, and tragic rejection of divine counsel.'
  },
  'dossier-jezebel': {
    id: 'dossier-jezebel',
    title: 'Queen Jezebel • Ruthless Manipulation',
    type: 'dossier',
    label: 'Field Dossier',
    description: 'State terror, psychological intimidation, and counterfeit authority.'
  }
};

export const NEXUS_CONNECTIONS: NexusConnection[] = [
  // David Connections
  {
    sourceId: 'david-journey',
    targetId: 'psalm-59',
    relationship: 'written_during',
    badgeLabel: 'Written During This Crisis',
    contextNote: 'David prayed this psalm in real-time while Saul’s strike team staked out his bedroom.'
  },
  {
    sourceId: 'david-journey',
    targetId: 'psalm-57',
    relationship: 'written_during',
    badgeLabel: 'Composed In The Cave',
    contextNote: 'Composed in the shadows of En-gedi while Saul relieved himself at the cave entrance.'
  },
  {
    sourceId: 'david-journey',
    targetId: 'dossier-saul',
    relationship: 'antagonist_profile',
    badgeLabel: 'Adversary Intelligence',
    contextNote: 'Saul’s insecurity made him lash out at anyone displaying anointed competence.'
  },
  {
    sourceId: 'david-journey',
    targetId: 'dilemma-credit-thief',
    relationship: 'modern_parallel',
    badgeLabel: 'Modern Workplace Precedent',
    contextNote: 'How to handle superiors or colleagues who feel threatened by your excellence.'
  },

  // Joseph Connections
  {
    sourceId: 'joseph-journey',
    targetId: 'proverb-22-29',
    relationship: 'wisdom_principle',
    badgeLabel: 'Guiding Doctrine',
    contextNote: 'Joseph’s technical competence in administration made him indispensable across Egypt.'
  },
  {
    sourceId: 'joseph-journey',
    targetId: 'dilemma-credit-thief',
    relationship: 'modern_parallel',
    badgeLabel: 'Direct Modern Parallel',
    contextNote: 'Joseph was forgotten by the Chief Cupbearer yet never became toxic or bitter.'
  },

  // Elijah Connections
  {
    sourceId: 'elijah-journey',
    targetId: 'psalm-46',
    relationship: 'written_during',
    badgeLabel: 'Fortress Anthem',
    contextNote: 'The antidote to panic: God is an ever-present help in trouble.'
  },
  {
    sourceId: 'elijah-journey',
    targetId: 'dossier-jezebel',
    relationship: 'antagonist_profile',
    badgeLabel: 'Adversary Intelligence',
    contextNote: 'Jezebel weaponized fear and death threats to induce psychological paralysis.'
  },
  {
    sourceId: 'elijah-journey',
    targetId: 'dilemma-burnout',
    relationship: 'modern_parallel',
    badgeLabel: 'Burnout Recovery Play',
    contextNote: 'God prescribes physical rest, nutrition, and quiet before giving the next mission.'
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
    targetId: 'psalm-59',
    relationship: 'written_during',
    badgeLabel: 'Battlefield Psalm',
    contextNote: 'Pray Psalm 59 when facing office politics and deceitful colleagues.'
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
