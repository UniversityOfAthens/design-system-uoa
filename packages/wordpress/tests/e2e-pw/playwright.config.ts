import { defineConfig, devices } from '@playwright/test';

/**
 * UOA theme + UOA Blocks end-to-end and accessibility tests.
 *
 *   bun run test:e2e
 *
 * Expects the wp-env site (bun run start) — it is started if not reachable.
 * scripts/seed.sh gives it a front page, a page with every block and a deep page.
 *
 * Specs are plain JS (with JSDoc types): when Playwright runs under Bun, its
 * TypeScript transform is bypassed for test files. Shared helpers can be TS.
 */
const baseURL = process.env.WP_BASE_URL ?? 'http://localhost:8888';

export default defineConfig( {
	testDir: './specs',
	fullyParallel: true,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [
		[ 'list' ],
		[ 'html', { open: 'never', outputFolder: 'playwright-report' } ],
	],
	outputDir: 'test-results',
	globalSetup: './global-setup.ts',
	use: {
		baseURL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
		{
			name: 'mobile',
			use: { ...devices[ 'Pixel 7' ] },
		},
	],
	webServer: {
		command: 'bun run start',
		url: baseURL,
		reuseExistingServer: true,
		timeout: 300_000,
	},
} );
