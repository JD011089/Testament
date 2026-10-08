import { test, expect } from '@playwright/test';
import { 
  WEEKLY_SERIES, 
  getWeeklySeriesById, 
  getAllWeeklySeries 
} from '../src/data/weeklySeries.ts';
import { 
  startWeeklySeries, 
  getActiveSeriesState, 
  clearActiveSeries, 
  getSeriesDayNumber, 
  getActiveSeriesMoment, 
  markSeriesMomentCompleted,
  getSeriesPickerList 
} from '../src/utils/weeklySeriesEngine.ts';
import { getDailyCuratedPassage } from '../src/data/dailyPassages.ts';
import { getWeeklyRecap } from '../src/utils/weeklyRecap.ts';
import { saveDecisionJournalEntry } from '../src/utils/decisionJournal.ts';

test.describe('Testament — Weekly Series Specification & Guardrail Suite', () => {

  test.beforeEach(() => {
    // Clean mock environment for on-device persistence
    const storage: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => { storage[k] = String(v); },
      removeItem: (k: string) => { delete storage[k]; },
      clear: () => { for (const k in storage) delete storage[k]; }
    };
    (global as any).window = {
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  });

  test('Constraint 1: Seed set contains all 6 verified character arcs with exactly 7 moments each', () => {
    expect(WEEKLY_SERIES.length).toBe(6);
    const expectedHeroes = ['David', 'Peter', 'Esther', 'Paul', 'Jesus', 'Mary'];

    for (const hero of expectedHeroes) {
      const match = WEEKLY_SERIES.find(s => s.heroName === hero);
      expect(match).toBeDefined();
      expect(match!.moments.length).toBe(7);
      expect(match!.hook).toBeTruthy();
      expect(match!.tagline).toBeTruthy();
      expect(match!.avatarIcon).toBeTruthy();

      // Check each day 1 through 7 sequence
      for (let day = 1; day <= 7; day++) {
        const moment = match!.moments.find(m => m.dayNumber === day);
        expect(moment).toBeDefined();
        expect(moment!.momentTitle).toBeTruthy();
        expect(moment!.reference).toBeTruthy();
        expect(moment!.keyVerseText).toBeTruthy();
        expect(moment!.keyVerseReference).toBeTruthy();
        expect(moment!.staticFallback.scenarioQuestion).toBeTruthy();
        expect(moment!.staticFallback.presetChoices.length).toBe(4);
        expect(moment!.staticFallback.actionLine).toBeTruthy();
        expect(moment!.staticFallback.storyRetelling.length).toBeGreaterThan(0);
        expect(moment!.backstory.content).toBeTruthy();
      }
    }
  });

  test('Constraint 2: No active series returns regular daily rotation with zero regression', () => {
    clearActiveSeries();
    expect(getActiveSeriesState()).toBeNull();

    const passage = getDailyCuratedPassage(0);
    expect(passage).toBeDefined();
    // Default passage should exist from curated list
    expect(passage.reference).toBeTruthy();
  });

  test('Constraint 3: Selecting David series sets Day 1 today and themes daily mission', () => {
    clearActiveSeries();
    const state = startWeeklySeries('series-david');
    expect(state).not.toBeNull();
    expect(state!.seriesId).toBe('series-david');

    // Active series moment for day 0 (today) should be David Day 1
    const moment = getActiveSeriesMoment(0);
    expect(moment).not.toBeNull();
    expect(moment!.seriesId).toBe('series-david');
    expect(moment!.dayNumber).toBe(1);
    expect(moment!.heroName).toBe('David');
    expect(moment!.momentTitle).toBe('The Overlooked Shepherd');

    // getDailyCuratedPassage themes to David Day 1
    const passage = getDailyCuratedPassage(0);
    expect(passage.heroName).toBe('David');
    expect(passage.id).toBe('series-david-day-1');
  });

  test('Constraint 4: Switching to Esther mid-week restarts Esther at Day 1 cleanly', () => {
    // Start David
    startWeeklySeries('series-david');
    let active = getActiveSeriesMoment(0);
    expect(active!.heroName).toBe('David');
    expect(active!.dayNumber).toBe(1);

    // Switch mid-week to Esther
    startWeeklySeries('series-esther');
    active = getActiveSeriesMoment(0);
    expect(active!.heroName).toBe('Esther');
    expect(active!.dayNumber).toBe(1);
    expect(active!.momentTitle).toBe('The Crown and Silence');
  });

  test('Constraint 5: Series picker list reports accurate progress and hooks', () => {
    startWeeklySeries('series-david');
    markSeriesMomentCompleted('series-david-day-1');

    const pickerList = getSeriesPickerList();
    expect(pickerList.length).toBe(6);

    const davidItem = pickerList.find(i => i.series.id === 'series-david');
    expect(davidItem).toBeDefined();
    expect(davidItem!.isActive).toBe(true);
    expect(davidItem!.completedCount).toBe(1);
    expect(davidItem!.currentDay).toBe(1);

    const estherItem = pickerList.find(i => i.series.id === 'series-esther');
    expect(estherItem).toBeDefined();
    expect(estherItem!.isActive).toBe(false);
    expect(estherItem!.completedCount).toBe(0);
  });

  test('Constraint 6: Weekly recap integrates series name and choices without guilt language', () => {
    startWeeklySeries('series-david');

    // Simulate user completing Day 1 decision
    saveDecisionJournalEntry({
      dateKey: '2026-10-08',
      passageReference: '1 Samuel 16:11-13',
      heroName: 'David',
      scenarioQuestion: 'Everyone around you overlooks your contribution. What is your move?',
      chosenText: 'Stay faithful in your private work and let God promote in His time.',
      actionLine: 'Do one faithful task today with excellence.'
    });

    const recap = getWeeklyRecap();
    expect(recap.seriesHeroName).toBe('David');
    expect(recap.narrativeThread).toContain('Your week with David');

    // Check that there is no guilt language in summary lines or narrative thread
    const fullText = JSON.stringify(recap).toLowerCase();
    expect(fullText).not.toContain('guilt');
    expect(fullText).not.toContain('failed');
    expect(fullText).not.toContain('shame');
    expect(fullText).not.toContain('missed');
    expect(fullText).not.toContain('lazy');
  });

  test('Constraint 7: ADHD Safeguard — every moment has high tension, distinct dilemma, and standalone hook', () => {
    for (const series of WEEKLY_SERIES) {
      for (const moment of series.moments) {
        // No "Part 4" or filler titles
        expect(moment.momentTitle.toLowerCase()).not.toContain('part ');
        expect(moment.staticFallback.scenarioQuestion.length).toBeGreaterThan(15);
        expect(moment.staticFallback.scenarioQuestion.endsWith('?')).toBe(true);
        // Story retelling concise and bounded
        const wordCount = moment.staticFallback.storyRetelling.join(' ').split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(160);
      }
    }
  });

});
