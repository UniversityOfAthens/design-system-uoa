import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site (`bun run build` first), served by `astro preview`.
// - a11y:   axe on every page, Greek and English, light and dark. Runs anywhere.
// - visual: screenshots of every component example. Run it in the Playwright Docker image
//           (`bun run test:visual`) so local and CI renders match.
const PORT = 4329;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  projects: [
    { name: 'a11y', testMatch: 'a11y.spec.ts' },
    { name: 'visual', testMatch: 'visual.spec.ts' },
  ],
  webServer: {
    command: `npx astro preview --port ${PORT} --host 127.0.0.1`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
