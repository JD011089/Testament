/**
 * CI guard: fails when any bundled Scripture line is missing, mislabeled, or
 * does not match its verified source. Run with:
 *   npx playwright test scripts/verify-verses.ts
 * or via `npm run verify:verses`.
 */

import { test, expect } from '@playwright/test';
import { collectBundledScripture, verifyBundledVerses } from '../src/utils/verifyVerses';

test('bundled verses match their verified source and label', () => {
  const lines = collectBundledScripture();
  expect(lines.length).toBeGreaterThan(0);
  const issues = verifyBundledVerses(lines);
  expect(issues.map((issue) => `${issue.where}: ${issue.problem}`)).toEqual([]);
});