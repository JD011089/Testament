import { defineConfig } from '@playwright/test';

/**
 * Default config for `npm test`: fast Node-level unit tests only.
 * Browser end-to-end specs live in `tests/e2e` and run via
 * `npm run test:e2e` (see playwright.e2e.config.ts).
 */
export default defineConfig({
  testDir: '.',
  testIgnore: ['**/tests/e2e/**', '**/node_modules/**', '**/dist/**'],
  testMatch: ['**/*.test.ts', '**/scripts/verify-verses.ts'],
  reporter: [['list']]
});