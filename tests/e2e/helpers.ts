import { expect, type Page } from '@playwright/test';

/** Collect console errors and uncaught exceptions for the whole test. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  return errors;
}

export async function gotoSlide(page: Page, n: number) {
  await page.goto(`./#/slide/${n}`);
  await expect(page.locator(`[data-testid="slide"][data-slide="${n}"]`)).toBeVisible();
}

/** The page must never scroll sideways. */
export async function expectNoHorizontalOverflow(page: Page, where: string) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, `horizontal overflow on ${where}: scrollWidth ${sw} > innerWidth ${iw}`).toBeLessThanOrEqual(iw + 1);
}

/**
 * The slide area hides sideways overflow, so a too-wide panel is CLIPPED
 * rather than scrollable. Catch that: no card, chart or button may extend
 * past the viewport, unless it lives inside a deliberately scrollable box.
 */
export async function expectNothingClipped(page: Page, where: string) {
  // Slides glide in sideways; measure the settled layout, not a mid-animation frame.
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
  const offenders = await page.evaluate(() => {
    const vw = window.innerWidth;
    const inScroller = (el: Element) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if ((o === 'auto' || o === 'scroll') && p.id !== 'slide-main') return true;
      }
      return false;
    };
    return [...document.querySelectorAll('#slide-main .cd, #slide-main svg[role="img"], #slide-main button, #slide-main p')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.right > vw + 2 && !inScroller(el);
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ').slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)} vw=${vw}`);
  });
  expect(offenders, `clipped content on ${where}:\n${offenders.join('\n')}`).toEqual([]);
}
