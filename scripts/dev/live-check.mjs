import { chromium, webkit, devices } from '@playwright/test';
const URL = process.argv[2];
for (const [name, engine, opts] of [['chrome', chromium, { viewport: { width: 1440, height: 900 } }], ['iphone', webkit, devices['iPhone 14']]]) {
  const b = await engine.launch();
  const p = await b.newPage(opts);
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  let ok = 0;
  for (const n of [1, 20, 24, 45, 51, 53]) {
    await p.goto(`${URL}#/slide/${n}`);
    await p.waitForSelector(`[data-slide="${n}"]`, { timeout: 20000 });
    ok++;
  }
  await p.goto(`${URL}#/lab`);
  await p.getByTestId('start-python').click();
  await p.getByTestId('python-bar').getByText('Python ready').waitFor({ timeout: 120000 });
  const src = await p.getByTestId('python-status').innerText();
  await p.getByTestId('run-corrected').click();
  await p.getByTestId('run-cell-18-fixed').getByTestId('live-output').getByText('4.22824171').waitFor({ timeout: 180000 });
  console.log(`${name}: ${ok}/6 slides ok · Python ran the corrected notebook (${src.includes('served from this site') ? 'served from the site' : 'from CDN'}) · errors: ${errs.length ? errs.join(' | ') : 'none'}`);
  await b.close();
}
