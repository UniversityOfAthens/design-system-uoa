// Visual regression: one screenshot per component example, from the Greek pages (English pages
// render the same examples). Run in the Playwright Docker image: `bun run test:visual`.
// Update after an intended change: `bun run test:visual:update`, then review and commit the PNGs.
import { expect, test } from '@playwright/test';
import { pages } from './pages';

const examplePages = pages.filter((path) => /^\/(components|examples)\//.test(path));

test.beforeEach(async ({ page }) => {
  // Katsoulidis is only present on machines with the licensed files; CI uses the fallback.
  // Block it everywhere so screenshots are the same on every machine.
  await page.route('**/katsoulidis/**', (route) => route.abort());
});

for (const path of examplePages) {
  test(path, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);

    const frames = page.locator('.uoa-example__frame');
    const count = await frames.count();
    expect(count, `no examples on ${path}`).toBeGreaterThan(0);

    const name = path.replace(/^\/|\/$/g, '').replaceAll('/', '-');
    for (let i = 0; i < count; i++) {
      const frame = frames.nth(i);
      await frame.scrollIntoViewIfNeeded();
      // Example.astro sets an inline height once the iframe has been sized to its content.
      await expect(frame).toHaveAttribute('style', /height/);
      await expect(frame).toHaveScreenshot(`${name}-${i + 1}.png`);
    }
  });
}
