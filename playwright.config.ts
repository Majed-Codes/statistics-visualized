import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the PRODUCTION bundle (`vite build` +
 * `vite preview`), not the dev server, in Chromium and WebKit (Safari's
 * engine), on desktop and on emulated iPhone portrait/landscape and Android.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-report.json' }]],
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'], viewport: { width: 1366, height: 800 } } },
    { name: 'iphone-portrait', use: { ...devices['iPhone 14'] } },
    { name: 'iphone-landscape', use: { ...devices['iPhone 14 landscape'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
  ],
});
