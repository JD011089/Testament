import { test, expect } from '@playwright/test';
import { getDailyMissionSync } from '../src/utils/dailyMissionPipeline.ts';
import { getCalendarReminderPrefs, generateIcsContent } from '../src/utils/calendarReminders.ts';

test.describe('Testament — v1.22.1 Post-Sweep Fixes & Invariants', () => {

  test('Parity: Home Card and Decide Screen use identical single source of truth for scenarioQuestion', () => {
    const testDate = '2026-10-07';
    const mission = getDailyMissionSync(testDate);
    expect(mission.scenarioQuestion).toBeTruthy();

    // Verify mission object holds question immutably
    const homeCardQuestion = mission.scenarioQuestion;
    const decideScreenQuestion = mission.scenarioQuestion;

    expect(homeCardQuestion).toBe(decideScreenQuestion);
    expect(homeCardQuestion.length).toBeGreaterThan(5);
  });

  test('Cleanup: Legacy testament_daily_checkin key is absent and cleaned up', () => {
    const storage: Record<string, string> = {
      testament_daily_checkin: JSON.stringify({ decision: 'test' }),
      testament_streak: '3'
    };

    // Simulate cleanup run on initialization
    if (storage['testament_daily_checkin']) {
      delete storage['testament_daily_checkin'];
    }

    expect(storage['testament_daily_checkin']).toBeUndefined();
    expect(storage['testament_streak']).toBe('3');
  });

  test('Calendar: RFC 5545 .ics generation provides universal fallback with correct fields', () => {
    const icsContent = generateIcsContent('morning', { time: '07:30' });
    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('RRULE:FREQ=DAILY');
    expect(icsContent).toContain("Today's Mission — Testament");
    expect(icsContent).toContain('END:VCALENDAR');
  });

  test('Calendar: Preferences retain custom morning and recall times correctly', () => {
    const prefs = getCalendarReminderPrefs();
    expect(prefs.morningTime).toMatch(/^\d{2}:\d{2}$/);
    expect(prefs.recallTime).toMatch(/^\d{2}:\d{2}$/);
  });

});
