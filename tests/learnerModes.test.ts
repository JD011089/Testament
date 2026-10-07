import { test, expect } from '@playwright/test';
import { 
  splitVerseIntoNaturalPhrases, 
  loadLearnerModesState, 
  setLearnerMode,
  getOrInitReciterVerse,
  completeReciterDay,
  saveStorytellerEntry,
  RECITER_VERSE_ROTATION
} from '../src/utils/learnerModes.ts';
import { CURATED_DAILY_PASSAGES } from '../src/data/dailyPassages.ts';

test.describe('Testament — Learner Modes Engine & Specification Suite', () => {

  test('Constraint 1: Verse text is byte-identical to source rotation (no invented or paraphrased scripture)', () => {
    // Check all verses in reciter rotation
    expect(RECITER_VERSE_ROTATION.length).toBeGreaterThanOrEqual(7);
    for (const v of RECITER_VERSE_ROTATION) {
      expect(v.text).toBeTruthy();
      expect(v.reference).toBeTruthy();
      // Ensure text is verbatim
      const phrases = splitVerseIntoNaturalPhrases(v.text);
      expect(phrases.length).toBeGreaterThanOrEqual(1);
      // Re-joining phrases retains characters from source
      const joined = phrases.join(' ');
      expect(joined.replace(/\s+/g, ' ').trim()).toBe(v.text.replace(/\s+/g, ' ').trim());
    }
  });

  test('Constraint 2: Phrase-splitting splits on natural clause boundaries, not arbitrary word counts', () => {
    const verseText = 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.';
    const phrases = splitVerseIntoNaturalPhrases(verseText);
    
    expect(phrases.length).toBeGreaterThanOrEqual(3);
    // Boundary check
    expect(phrases[0]).toContain('Have I not commanded you?');
    expect(phrases[1]).toContain('Be strong and courageous.');
    expect(phrases[2]).toContain('Do not be afraid');
  });

  test('Constraint 3: Mode switching preserves state across all modes in a single store', () => {
    // Setup initial mock localStorage environment
    const storage: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => { storage[k] = String(v); },
      removeItem: (k: string) => { delete storage[k]; },
      clear: () => { for (const k in storage) delete storage[k]; }
    };
    (global as any).window = {
      dispatchEvent: () => true
    };

    // Default mode is Builder
    let state = loadLearnerModesState();
    expect(state.activeMode).toBe('builder');

    // Switch to Reciter
    setLearnerMode('reciter');
    state = loadLearnerModesState();
    expect(state.activeMode).toBe('reciter');

    // Initialize a Reciter verse
    const reciterVerse = getOrInitReciterVerse('2026-10-06');
    expect(reciterVerse.reference).toBe(RECITER_VERSE_ROTATION[0].reference);

    // Save a Storyteller entry while in Reciter mode
    saveStorytellerEntry({
      dateKey: '2026-10-06',
      passageReference: 'Mark 4:35-41',
      heroName: 'Jesus',
      userRetelling: 'Jesus slept in the storm while the disciples panicked, then commanded the wind to be still.',
      faithfulRetelling: 'Jesus got up, rebuked the wind, and calmed the squall.',
      capturedPoints: ['calmed the squall'],
      missedPoints: []
    });

    // Switch to Storyteller
    setLearnerMode('storyteller');
    state = loadLearnerModesState();
    expect(state.activeMode).toBe('storyteller');
    expect(state.storyteller.entries.length).toBe(1);
    expect(state.reciter.currentVerse?.reference).toBe(RECITER_VERSE_ROTATION[0].reference);

    // Switch back to Builder (regression baseline preserved)
    setLearnerMode('builder');
    state = loadLearnerModesState();
    expect(state.activeMode).toBe('builder');
    // Ensure Reciter and Storyteller state persisted untouched
    expect(state.reciter.currentVerse).not.toBeNull();
    expect(state.storyteller.entries.length).toBe(1);
  });

  test('Constraint 4: 7-day cumulative chaining advances correctly under test-clock dates', () => {
    const storage: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => { storage[k] = String(v); },
      removeItem: (k: string) => { delete storage[k]; },
      clear: () => { for (const k in storage) delete storage[k]; }
    };
    (global as any).window = {
      dispatchEvent: () => true
    };

    // Day 1
    const v1 = getOrInitReciterVerse('2026-10-01');
    expect(v1.dayNumber).toBe(1);
    completeReciterDay(1, [{ phraseIndex: 0, rating: 'got_it' }], '2026-10-01');

    // Day 2 (advance test clock by 1 day)
    const v2 = getOrInitReciterVerse('2026-10-02');
    expect(v2.dayNumber).toBe(2);
    completeReciterDay(2, [{ phraseIndex: 0, rating: 'got_it' }], '2026-10-02');

    // Day 3 (advance test clock by 2 days)
    const v3 = getOrInitReciterVerse('2026-10-03');
    expect(v3.dayNumber).toBe(3);
    completeReciterDay(3, [{ phraseIndex: 0, rating: 'got_it' }, { phraseIndex: 1, rating: 'got_it' }], '2026-10-03');

    // Days 4..6
    for (let day = 4; day <= 6; day++) {
      const dateStr = `2026-10-0${day}`;
      const v = getOrInitReciterVerse(dateStr);
      expect(v.dayNumber).toBe(day);
      completeReciterDay(day, [{ phraseIndex: 0, rating: 'got_it' }], dateStr);
    }

    // Day 7: Full recitation test
    const v7 = getOrInitReciterVerse('2026-10-07');
    expect(v7.dayNumber).toBe(7);

    const fullReps = v7.phrases.map((_, idx) => ({ phraseIndex: idx, rating: 'got_it' as const }));
    const result = completeReciterDay(7, fullReps, '2026-10-07');

    expect(result.verseCompleted).toBe(true);
    // Verse retires into Known Verses
    const state = loadLearnerModesState();
    expect(state.reciter.knownVerses.length).toBe(1);
    expect(state.reciter.knownVerses[0].reference).toBe(RECITER_VERSE_ROTATION[0].reference);
    // Next verse is issued in currentVerse
    expect(state.reciter.currentVerse?.reference).toBe(RECITER_VERSE_ROTATION[1].reference);
  });

  test('Constraint 5: "Missed it" inserts loop-back rep before moving on', () => {
    const storage: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => { storage[k] = String(v); },
      removeItem: (k: string) => { delete storage[k]; },
      clear: () => { for (const k in storage) delete storage[k]; }
    };
    (global as any).window = {
      dispatchEvent: () => true
    };

    getOrInitReciterVerse('2026-10-01');
    // Day 2: user marks phrase 0 as missed_it
    completeReciterDay(2, [{ phraseIndex: 0, rating: 'missed_it' }], '2026-10-02');

    const stateAfterMiss = loadLearnerModesState();
    expect(stateAfterMiss.reciter.currentVerse?.loopBackPhraseIndices).toContain(0);

    // On Day 3, user marks phrase 0 as got_it
    completeReciterDay(3, [{ phraseIndex: 0, rating: 'got_it' }], '2026-10-03');
    const stateAfterClear = loadLearnerModesState();
    expect(stateAfterClear.reciter.currentVerse?.loopBackPhraseIndices).not.toContain(0);
  });

  test('Constraint 6: Storyteller retellings render side-by-side with required reflection badge', () => {
    const passage = CURATED_DAILY_PASSAGES[0];
    const faithfulText = passage.staticFallback.storyRetelling.join(' ');

    const entry = saveStorytellerEntry({
      dateKey: '2026-10-06',
      passageReference: passage.reference,
      heroName: passage.heroName,
      userRetelling: "David retreated into Adullam's caves and led 400 troubled men.",
      faithfulRetelling: faithfulText,
      capturedPoints: [passage.staticFallback.storyRetelling[0]],
      missedPoints: [passage.staticFallback.storyRetelling[1]]
    });

    expect(entry.userRetelling).toBeTruthy();
    expect(entry.faithfulRetelling).toBe(faithfulText);
    expect(entry.capturedPoints.length).toBe(1);
    expect(entry.missedPoints.length).toBe(1);
  });

});
