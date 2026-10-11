import { chromium } from '@playwright/test';
const [,, out, list, w = '1440', h = '900'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
for (const item of list.split(',')) {
  const [n, steps = '0'] = item.split(':');
  await page.goto(`http://localhost:5174/#/slide/${n}`);
  await page.waitForSelector(`[data-slide="${n}"]`);
  for (let i = 0; i < +steps; i++) await page.getByTestId('btn-reveal').click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${out}/s${n.padStart(2, '0')}-${steps}.png` });
}
console.log('errors:', errs.length ? errs.slice(0, 5) : 'none');
await browser.close();
