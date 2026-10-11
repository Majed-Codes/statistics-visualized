import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
const deck = await ctx.newPage();
await deck.goto('http://localhost:5174/#/slide/20');
await deck.waitForSelector('[data-slide="20"]');
const p = await ctx.newPage();
await p.goto('http://localhost:5174/#/presenter');
await p.getByTestId('presenter-view').waitFor();
console.log(await p.evaluate(() => {
  const next = document.querySelector('[data-testid=presenter-next]');
  const grid = next.parentElement;
  return { gridDir: getComputedStyle(grid).direction, gridAttr: grid.getAttribute('dir'), kids: [...grid.children].map((c) => c.textContent.trim() + '@' + Math.round(c.getBoundingClientRect().left)) };
}));
await b.close();
