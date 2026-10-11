import { chromium } from '@playwright/test';
const [,, out, w = '1440', h = '900'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
for (let n = 1; n <= 53; n++) {
  await page.goto(`http://localhost:5174/#/slide/${n}`);
  await page.waitForSelector(`[data-slide="${n}"]`);
  const all = page.getByTestId('btn-reveal-all');
  if (await all.count() && await all.isVisible() && await all.isEnabled()) await all.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${String(n).padStart(2, '0')}.png` });
}
await browser.close();
