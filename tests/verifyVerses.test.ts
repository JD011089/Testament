import { test, expect } from '@playwright/test';
import { collectBundledScripture, verifyBundledVerses } from '../src/utils/verifyVerses';

// Runs as part of `npm test`, so CI fails on any translation mismatch.
test('translation integrity: every bundled verse matches its verified source', () => {
  const lines = collectBundledScripture();
  expect(lines.length).toBeGreaterThan(0);
  const issues = verifyBundledVerses(lines);
  expect(issues.map((issue) => `${issue.where}: ${issue.problem}`)).toEqual([]);
});

test('no bundled verse claims an unlicensed modern translation', () => {
  const labels = new Set(collectBundledScripture().map((line) => line.translation));
  for (const label of ['NIV', 'ESV', 'CSB', 'BSB']) {
    expect(labels.has(label)).toBe(false);
  }
});