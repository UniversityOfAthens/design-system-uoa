// axe on every docs page, in light and dark mode. Component examples are checked too:
// axe runs inside the example iframes.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { pages } from './pages';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(scheme, () => {
    test.use({ colorScheme: scheme });

    for (const path of pages) {
      test(path, async ({ page }) => {
        await page.goto(path);
        // Example iframes are filled from srcdoc after load.
        await page.waitForLoadState('networkidle');

        const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        const report = violations.map((v) => ({
          rule: v.id,
          impact: v.impact,
          help: v.help,
          targets: v.nodes.map((n) => n.target.join(' ')),
        }));
        expect(report, `axe violations on ${path} (${scheme})`).toEqual([]);
      });
    }
  });
}
