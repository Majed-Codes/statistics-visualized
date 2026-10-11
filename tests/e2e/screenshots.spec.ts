import { test } from '@playwright/test';
import { gotoSlide } from './helpers';

/** Representative screenshots for the delivery report (docs/screenshots). */
const SHOTS: [number, number][] = [
  [1, 0], [2, 0], [5, 0], [11, 0], [16, 0], [20, 4], [24, 6], [34, 0], [39, 0], [44, 3], [45, 0], [46, 0], [47, 0], [48, 0], [51, 2], [51, 7], [52, 0], [53, 0],
];

test('capture representative slides', async ({ page }, info) => {
  test.skip(!['desktop-chrome', 'iphone-portrait', 'desktop-safari'].includes(info.project.name), 'screenshots on three profiles');
  for (const [n, steps] of SHOTS) {
    await gotoSlide(page, n);
    await page.getByTestId('btn-reset').click();
    for (let i = 0; i < steps; i++) await page.getByTestId('btn-reveal').click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `docs/screenshots/${info.project.name}/slide-${String(n).padStart(2, '0')}${steps ? `-step${steps}` : ''}.png`, fullPage: false });
  }
  await page.goto('./#/lab/cell-16');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}/python-lab.png` });
  await page.goto('./#/explorer');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}/iris-explorer.png` });
});
