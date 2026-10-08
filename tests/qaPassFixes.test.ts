import { test, expect } from '@playwright/test';
import { formatSpaced, truncateAtWordBoundary, sanitizeGrammarArticles } from '../src/utils/textUtils';
import { saveUserFreeTextJournalEntry, deleteDecisionJournalEntry, getDecisionJournalEntries, clearDecisionJournal } from '../src/utils/decisionJournal';
import { translations } from '../src/context/LanguageContext';

test.describe('Testament — First QA Pass (Oct 8) Fixes & Regression Suite', () => {

  test('Fix 1 & 2: formatSpaced separates tokens cleanly with no concatenation', () => {
    const formatted1 = formatSpaced(["TODAY'S MISSION", "•", "PAUL (ACTS 16:22-31)"]);
    expect(formatted1).toBe("TODAY'S MISSION • PAUL (ACTS 16:22-31)");

    const formatted2 = formatSpaced(["Tomorrow", "•", "JESUS"]);
    expect(formatted2).toBe("Tomorrow • JESUS");

    const formatted3 = formatSpaced(["Moment", 1, "of", 11]);
    expect(formatted3).toBe("Moment 1 of 11");

    const formatted4 = formatSpaced(["Volume", "#01", "of", 66]);
    expect(formatted4).toBe("Volume #01 of 66");
  });

  test('Fix 5: sanitizeGrammarArticles replaces "A angry" with "An angry"', () => {
    const badText = "A angry crowd attacked Paul and Silas in the square.";
    const cleanText = sanitizeGrammarArticles(badText);
    expect(cleanText).toBe("An angry crowd attacked Paul and Silas in the square.");

    const lowerText = "they met a angry mob.";
    expect(sanitizeGrammarArticles(lowerText)).toBe("they met an angry mob.");
  });

  test('Fix 6: truncateAtWordBoundary cleanly truncates at space before maxLength with ellipsis', () => {
    const longText = "Curse the injustice and swear vengeance against the magistrates.";
    const truncated = truncateAtWordBoundary(longText, 45, '…');
    expect(truncated.endsWith('…')).toBe(true);
    expect(truncated.length).toBeLessThanOrEqual(46); // 45 chars max + ellipsis
    // Must NOT cut mid-word into "magistr…" or "again…"
    expect(truncated).not.toContain('again…');
    expect(truncated).not.toContain('magist…');
  });

  test('Fix 7: Decision Journal free-text composer and entry deletion work seamlessly', () => {
    // Setup mock localStorage environment in Node test runner
    const storage: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => { storage[k] = String(v); },
      removeItem: (k: string) => { delete storage[k]; },
      clear: () => { for (const k in storage) delete storage[k]; }
    };

    // Clear test store
    clearDecisionJournal();

    // Create free text reflection
    const entry = saveUserFreeTextJournalEntry("Reflecting on patience in the storm today.");
    expect(entry).not.toBeNull();
    expect(entry?.chosenText).toBe("Reflecting on patience in the storm today.");
    expect(entry?.entryType).toBe('free_reflection');

    // Retrieve and verify
    const entries = getDecisionJournalEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].id).toBe(entry?.id);

    // Delete entry
    deleteDecisionJournalEntry(entry!.id);
    const updatedEntries = getDecisionJournalEntries();
    expect(updatedEntries.length).toBe(0);
  });

  test('Fix 9: Localization dictionary contains complete journal and drive mode translations across EN, ES, FR', () => {
    const requiredKeys = [
      'journal.title',
      'journal.subtitle',
      'journal.privacyPromise',
      'journal.writePrompt',
      'journal.saveReflection',
      'journal.deleteEntry',
      'journal.clear',
      'drive.close',
      'drive.title',
      'drive.play',
      'drive.pause'
    ];

    for (const lang of ['en', 'es', 'fr'] as const) {
      for (const k of requiredKeys) {
        expect(translations[lang][k], `Missing translation key "${k}" in language "${lang}"`).toBeDefined();
        expect(translations[lang][k].length).toBeGreaterThan(0);
      }
    }
  });

});
