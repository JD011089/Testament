export interface TestamentFeatureFlags {
  /** Feature 1: "What does this mean?" passage Q&A on story steps */
  passageQA: boolean;
  /** Feature 2: Personal prayer after each act completion */
  actPrayer: boolean;
  /** Feature 3: "Say it simpler" verse paraphrase on tapping any verse */
  simplerVerse: boolean;
  /** Feature 4: Adaptive Socratic follow-up in dilemmas */
  socraticFollowUp: boolean;
  /** Feature 5: Age-aware dilemma variants adapting scenarios by life stage */
  ageAwareDilemmas: boolean;
}

const DEFAULT_FLAGS: TestamentFeatureFlags = {
  passageQA: true,
  actPrayer: true,
  simplerVerse: true,
  socraticFollowUp: true,
  ageAwareDilemmas: true,
};

export function isFeatureEnabled(flag: keyof TestamentFeatureFlags): boolean {
  if (typeof localStorage === 'undefined') return DEFAULT_FLAGS[flag];
  try {
    const override = localStorage.getItem(`testament_flag_${flag}`);
    if (override !== null) {
      return override === 'true';
    }
  } catch {
    // ignore
  }
  return DEFAULT_FLAGS[flag];
}

export function setFeatureFlag(flag: keyof TestamentFeatureFlags, enabled: boolean): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`testament_flag_${flag}`, enabled ? 'true' : 'false');
    }
  } catch {
    // ignore
  }
}
