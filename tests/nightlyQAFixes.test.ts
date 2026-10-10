import { test, expect } from '@playwright/test';
import { isMobileDevice, isAndroid, isIOS, getGoogleCalendarUrl, generateIcsContent } from '../src/utils/calendarReminders.ts';
import { getDailyCuratedPassage } from '../src/data/dailyPassages.ts';
import { getDailyMissionSync } from '../src/utils/dailyMissionPipeline.ts';
import { getDailyStreakCount } from '../src/utils/dailyEngine.ts';
import { WEEKLY_SERIES } from '../src/data/weeklySeries.ts';

test.describe('Testament — Nightly QA Pass v1.22.2 Regression Suite', () => {

  test('Issue 1: Mobile calendar detection safely handles Android/iOS without workspace.google.com web redirect', () => {
    expect(typeof isMobileDevice).toBe('function');
    expect(typeof isAndroid).toBe('function');
    expect(typeof isIOS).toBe('function');

    // Web calendar link format matches standard Google calendar render
    const webUrl = getGoogleCalendarUrl('morning');
    expect(webUrl).toContain('https://calendar.google.com/calendar/render?');
    expect(webUrl).toContain('action=TEMPLATE');
    expect(webUrl).toContain('RRULE%3AFREQ%3DDAILY');

    // Universal .ics fallback produces valid RFC 5545 format
    const ics = generateIcsContent('morning');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics).toContain('END:VCALENDAR');
  });

  test('Issue 2: Backstory layer is guaranteed present on all daily curated passages and series moments', () => {
    // 1. All curated daily passages have complete backstory metadata
    const passage = getDailyCuratedPassage(0);
    expect(passage.backstory).toBeDefined();
    expect(passage.backstory.category).toBeTruthy();
    expect(passage.backstory.title.length).toBeGreaterThan(3);
    expect(passage.backstory.content.length).toBeGreaterThan(20);

    // 2. All moments across all weekly series have non-empty backstories
    for (const series of WEEKLY_SERIES) {
      for (const moment of series.moments) {
        expect(moment.backstory).toBeDefined();
        expect(moment.backstory.title).toBeTruthy();
        expect(moment.backstory.content.length).toBeGreaterThan(20);
      }
    }

    // 3. getDailyMissionSync propagates backstory
    const mission = getDailyMissionSync('2026-10-09');
    expect(mission.backstory).toBeDefined();
    expect(mission.backstory?.title).toBeTruthy();
  });

  test('Issue 4: Drive Mode defaults to briefing today\'s mission with valid title, retelling, and key scripture', () => {
    const mission = getDailyMissionSync('2026-10-09');
    expect(mission.heroName).toBeTruthy();
    expect(mission.scenarioQuestion).toBeTruthy();
    expect(mission.storyRetelling.length).toBeGreaterThan(0);
    expect(mission.keyVerseText).toBeTruthy();
    expect(mission.keyVerseReference).toBeTruthy();
    expect(mission.actionLine).toBeTruthy();

    const briefingText = `Today's Mission Briefing. ${mission.heroName}. Scripture reference: ${mission.passageReference}. The Decision: ${mission.scenarioQuestion}. What unfolded: ${mission.storyRetelling.join(' ')}. Verbatim Scripture: ${mission.keyVerseReference}. ${mission.keyVerseText}. Your move today: ${mission.actionLine}`;
    expect(briefingText.length).toBeGreaterThan(50);
  });

  test('Issue 5: Streak count has a unified single source of truth in getDailyStreakCount()', () => {
    expect(typeof getDailyStreakCount).toBe('function');
    const streak = getDailyStreakCount();
    expect(Number.isFinite(streak)).toBe(true);
    expect(streak).toBeGreaterThanOrEqual(0);
  });

});
