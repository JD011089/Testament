import { STORY_QUESTS } from '../data/stories';
import { REAL_LIFE_DILEMMAS } from '../data/dilemmas';
import { BATTLEFIELD_OPTIONS } from '../components/BattlefieldCheckInModal';
import {
  getTodayDailyCampaign,
  getCampaignDateKey,
  getDailyCampaignProgress,
  type DailyCampaign,
  type DailyCampaignStep,
} from '../data/dailyCampaigns';
import { getConnectedNexusItems } from '../data/nexusGraph';
import { getStoryVerseForQuest, getVerseById } from './verseRegistry';
import { getDueFSRSCards } from './fsrsEngine';
import { getQuestAttributes } from './narrativeMomentum';
import type { StoryQuest, StoryAct } from '../types';

export interface ComposedDailyMission extends DailyCampaign {
  reason: string;
  battlefieldId: string | null;
  cadence: '3min' | '10min' | 'deep';
}

const HERO_ICONS: Record<string, string> = {
  David: '🪨',
  Moses: '🪵',
  Elijah: '🧥',
  Joseph: '💍',
  Peter: '🔥',
  Paul: '⛓️',
  Daniel: '💍',
  Esther: '🪄',
  Nehemiah: '🔨',
  Gideon: '🏺',
  Jonah: '⚓',
  Ruth: '🌾',
  Joshua: '📯',
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function readBattlefieldId(): string | null {
  try {
    return localStorage.getItem('testament_todays_battlefield');
  } catch {
    return null;
  }
}

function readCadence(): ComposedDailyMission['cadence'] {
  try {
    const raw = localStorage.getItem('testament_daily_cadence');
    if (raw === '3min' || raw === 'deep') return raw;
  } catch {
    // ignore
  }
  return '10min';
}

function readCompletedActs(): string[] {
  return readJson<string[]>('testament_completed_acts') || [];
}

function readRecommendedQuestId(): string | null {
  const profile = readJson<{ recommendedQuestId?: string }>('testament_user_profile');
  return profile?.recommendedQuestId || null;
}

function resolveDilemmaId(id: string | undefined | null): string | null {
  if (!id) return null;
  if (REAL_LIFE_DILEMMAS.some(d => d.id === id)) return id;
  if (id === 'dilemma-burnout' && REAL_LIFE_DILEMMAS.some(d => d.id === 'dilemma-burnout-home')) {
    return 'dilemma-burnout-home';
  }
  return null;
}

function nextIncompleteAct(quest: StoryQuest, completed: string[]): StoryAct | null {
  return quest.acts.find(act => !completed.includes(act.id)) || null;
}

function pickQuest(completed: string[], preferredId: string | null): { quest: StoryQuest; act: StoryAct } {
  const orderedIds = [
    preferredId,
    readRecommendedQuestId(),
    'david-journey',
  ].filter((id): id is string => Boolean(id));

  const seen = new Set<string>();
  for (const id of orderedIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const quest = STORY_QUESTS.find(q => q.id === id);
    if (!quest) continue;
    const act = nextIncompleteAct(quest, completed);
    if (act) return { quest, act };
  }

  for (const quest of STORY_QUESTS) {
    const act = nextIncompleteAct(quest, completed);
    if (act) return { quest, act };
  }

  const fallback = STORY_QUESTS[0];
  return { quest: fallback, act: fallback.acts[0] };
}

function pickDilemmaId(questId: string, battlefieldDilemma: string | null): string {
  const fromBattlefield = resolveDilemmaId(battlefieldDilemma);
  if (fromBattlefield) return fromBattlefield;

  const linked = getConnectedNexusItems(questId).find(item => item.target.type === 'dilemma');
  const fromNexus = resolveDilemmaId(linked?.target.id);
  if (fromNexus) return fromNexus;

  const attrs = getQuestAttributes(questId);
  const ranked = (Object.entries(attrs) as [string, number][]).sort((a, b) => b[1] - a[1]);
  if (ranked[0] && ranked[0][1] > 0) {
    if (ranked[0][0] === 'patience') {
      const burnout = resolveDilemmaId('dilemma-burnout-home');
      if (burnout) return burnout;
    }
    if (ranked[0][0] === 'boldness') {
      const credit = resolveDilemmaId('dilemma-credit-thief');
      if (credit) return credit;
    }
  }

  const calendar = getTodayDailyCampaign().steps.find(step => step.type === 'dilemma');
  return resolveDilemmaId(calendar?.targetId) || 'dilemma-credit-thief';
}

function buildMission(): ComposedDailyMission {
  const dateKey = getCampaignDateKey();
  const cadence = readCadence();
  const battlefieldId = readBattlefieldId();
  const battlefield = BATTLEFIELD_OPTIONS.find(option => option.id === battlefieldId) || null;
  const completed = readCompletedActs();
  const { quest, act } = pickQuest(completed, battlefield?.suggestedQuestId || null);
  const dilemmaId = pickDilemmaId(quest.id, battlefield?.suggestedDilemmaId || null);
  const dilemma = REAL_LIFE_DILEMMAS.find(item => item.id === dilemmaId) || REAL_LIFE_DILEMMAS[0];

  const dueCard = getDueFSRSCards()[0];
  const dueVerse = dueCard ? getVerseById(dueCard.verseId) : null;
  const storyVerse = getStoryVerseForQuest(quest.id);
  const forgeVerse = dueVerse || storyVerse;

  const links = getConnectedNexusItems(quest.id);
  const proverb = links.find(item => item.target.type === 'proverb');
  const psalm = links.find(item => item.target.type === 'psalm');

  const reasons: string[] = [];
  if (battlefield) reasons.push(`Checked in: ${battlefield.title}`);
  if (dueVerse) reasons.push(`${dueVerse.reference} is due for review`);
  if (!battlefield && !dueVerse) reasons.push(`Continuing ${quest.heroName}`);
  if (cadence === '3min') reasons.push('Short session for a 3-minute day');

  const questStep: DailyCampaignStep = {
    stepNumber: 1,
    type: 'quest',
    title: `Step 1: Decide in ${quest.heroName}'s story`,
    badge: 'Story Quest',
    subtitle: `Act ${act.actNumber}: ${act.actTitle}`,
    targetId: quest.id,
    targetSecondaryId: act.id,
    actionLabel: 'Make the call',
    icon: '⚔️',
    intel: act.sceneAtmosphere,
  };

  const dilemmaStep: DailyCampaignStep = {
    stepNumber: 2,
    type: 'dilemma',
    title: `Step 2: What's the play?`,
    badge: 'Real-Life Dilemma',
    subtitle: dilemma.title,
    targetId: dilemma.id,
    actionLabel: 'Run the sim',
    icon: '🛡️',
    intel: dilemma.situationSetup.slice(0, 180),
  };

  const forgeStep: DailyCampaignStep = {
    stepNumber: 3,
    type: 'wordforge',
    title: dueVerse ? 'Step 3: Review a due verse' : 'Step 3: Lock the story verse',
    badge: dueVerse ? 'FSRS Review' : 'Scripture Memory',
    subtitle: forgeVerse ? forgeVerse.reference : quest.heroName,
    targetId: forgeVerse?.id || `story-${quest.id}`,
    actionLabel: dueVerse ? 'Review now' : 'Forge the verse',
    icon: '🧠',
    intel: dueVerse
      ? 'This verse is due. A short retrieval keeps it from fading.'
      : 'Cement the verse that belongs to this story.',
  };

  let applyStep: DailyCampaignStep;
  if (proverb) {
    applyStep = {
      stepNumber: 4,
      type: 'proverb',
      title: 'Step 4: Apply the proverb',
      badge: 'Proverbs',
      subtitle: proverb.target.title,
      targetId: proverb.target.id,
      actionLabel: 'Open Proverbs',
      icon: '📜',
      intel: proverb.connection.contextNote,
    };
  } else if (psalm) {
    applyStep = {
      stepNumber: 4,
      type: 'psalm',
      title: 'Step 4: Pray the psalm',
      badge: 'Psalms',
      subtitle: psalm.target.title,
      targetId: psalm.target.id,
      actionLabel: 'Open Psalms',
      icon: '🙏',
      intel: psalm.connection.contextNote,
    };
  } else {
    applyStep = {
      stepNumber: 4,
      type: 'canon',
      title: 'Step 4: Open the library',
      badge: 'Field Library',
      subtitle: 'One chapter, then close the loop',
      targetId: 'library',
      actionLabel: 'Open Library',
      icon: '📖',
      intel: 'Read one short passage that belongs to today’s story.',
    };
  }

  const steps = cadence === '3min'
    ? [
        questStep,
        { ...forgeStep, stepNumber: 2 as const, title: forgeStep.title.replace('Step 3', 'Step 2') },
        { ...dilemmaStep, stepNumber: 3 as const, title: dilemmaStep.title.replace('Step 2', 'Step 3') },
      ]
    : [questStep, dilemmaStep, forgeStep, applyStep];

  return {
    id: `adaptive-${dateKey}`,
    title: `${quest.heroName}: Today's Mission`,
    virtueTheme: battlefield?.title || quest.starterTrack || 'Active learning',
    heroName: quest.heroName,
    heroIcon: HERO_ICONS[quest.heroName] || '⚔️',
    heroSubtitle: quest.subtitle,
    summary: act.sceneAtmosphere,
    bonusXP: cadence === '3min' ? 80 : 150,
    steps,
    reason: reasons.join(' · '),
    battlefieldId,
    cadence,
  };
}

/**
 * Today's mission, snapshotted for the date.
 * Recomputes when battlefield or cadence changes only if no steps are done yet.
 */
export const getComposedDailyMission = (): ComposedDailyMission => {
  const dateKey = getCampaignDateKey();
  const snapshotKey = `testament_composed_mission_${dateKey}`;
  const battlefieldId = readBattlefieldId();
  const cadence = readCadence();
  const progress = getDailyCampaignProgress(`adaptive-${dateKey}`, dateKey);
  const started = progress.completedSteps.length > 0;

  try {
    const stored = localStorage.getItem(snapshotKey);
    if (stored) {
      const snap = JSON.parse(stored) as ComposedDailyMission;
      const sameSignals = snap.battlefieldId === battlefieldId && snap.cadence === cadence;
      if (started || sameSignals) return snap;
    }
  } catch {
    // recompute below
  }

  const mission = buildMission();
  try {
    localStorage.setItem(snapshotKey, JSON.stringify(mission));
  } catch {
    // ignore
  }
  return mission;
};
