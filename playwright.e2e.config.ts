import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end config for the Story Swipes daily loop.
 * Run with: npm run test:e2e
 * Kept separate from the default `npm test` (Node-level unit tests) so the
 * unit suite stays fast and does not require a browser or dev server.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'off'
  },
  projects: [
    {
      name: 'phone-390x844',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } }
    },
    {
      name: 'tablet-820x1180',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } }
    }
  ],
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    timeout: 120_000,
    reuseExistingServer: true
  }
});