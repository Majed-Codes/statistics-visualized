import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, expectNothingClipped, gotoSlide, watchErrors } from './helpers';
import { SLIDES } from '../../src/data/lecture-content';

/**
 * Guards against the "blank slide" failure: every one of the 53 slides must
 * render visible content, with every reveal step shown, without runtime
 * errors or sideways scrolling — on every browser/device project.
 */
test('all 53 slides render real content, fully revealed, without errors', async ({ page }) => {
  const errors = watchErrors(page);
  await gotoSlide(page, 1);
  for (const meta of SLIDES) {
    await page.evaluate((n) => { window.location.hash = `#/slide/${n}`; }, meta.n);
    const slide = page.locator(`[data-testid="slide"][data-slide="${meta.n}"]`);
    await expect(slide, `slide ${meta.n}`).toBeVisible();
    await expect(page.locator('[data-testid="error-state"]'), `error state on slide ${meta.n}`).toHaveCount(0);
    await expect(page.locator('[data-stub]')).toHaveCount(0);

    const text = (await slide.innerText()).replace(/\s+/g, ' ').trim();
    expect(text.length, `slide ${meta.n} text`).toBeGreaterThan(30);
    const box = await slide.boundingBox();
    expect(box && box.height > 150 && box.width > 200, `slide ${meta.n} has a real size`).toBeTruthy();

    // Every SVG chart must have a non-zero size (the mobile blank-chart failure).
    const svgs = await slide.locator('svg[role="img"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => [r.width, r.height]));
    for (const [w, h] of svgs) expect(w > 0 && h > 0, `zero-size chart on slide ${meta.n}`).toBe(true);

    if (meta.steps > 0) {
      const all = page.getByTestId('btn-reveal');
      for (let i = 0; i < meta.steps; i++) await all.click();
      await expect(all).toHaveText(new RegExp(`${meta.steps}/${meta.steps}`));
      await expect(page.locator('[data-testid="error-state"]')).toHaveCount(0);
      await expect(slide.locator('[data-hidden-step]')).toHaveCount(0);
    }
    await expectNoHorizontalOverflow(page, `slide ${meta.n}`);
    await expectNothingClipped(page, `slide ${meta.n}`);
  }
  expect(errors, errors.join('\n')).toEqual([]);
});

test('lab and explorer render without errors or overflow', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./#/lab');
  await expect(page.getByTestId('python-lab')).toBeVisible();
  await expect(page.locator('[data-testid^="lab-cell-"]')).toHaveCount(10);
  await expectNoHorizontalOverflow(page, 'lab');
  await page.goto('./#/explorer');
  await expect(page.getByTestId('iris-explorer')).toBeVisible();
  await expect(page.getByTestId('summary-table')).toBeVisible();
  await expectNoHorizontalOverflow(page, 'explorer');
  expect(errors, errors.join('\n')).toEqual([]);
});
