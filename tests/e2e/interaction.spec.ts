import { expect, test } from '@playwright/test';
import { gotoSlide, watchErrors } from './helpers';

const isMobile = (name: string) => name.startsWith('iphone') || name === 'android';

test.describe('navigation', () => {
  test('buttons: next reveals steps first, then moves on; back returns', async ({ page }) => {
    await gotoSlide(page, 17);
    await page.getByTestId('btn-next').click();
    await expect(page.locator('[data-slide="18"]')).toBeVisible();
    await expect(page.getByTestId('slide-counter')).toContainText('18');
    // slide 18 has 4 steps: next reveals them before leaving
    for (let i = 1; i <= 4; i++) {
      await page.getByTestId('btn-next').click();
      await expect(page.getByTestId('btn-reveal')).toContainText(`${i}/4`);
    }
    await page.getByTestId('btn-next').click();
    await expect(page.locator('[data-slide="19"]')).toBeVisible();
    await page.getByTestId('btn-prev').click();
    await expect(page.locator('[data-slide="18"]')).toBeVisible();
  });

  test('keyboard: arrows, shift+arrow, home/end, digits+enter', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'keyboard shortcuts are a desktop feature');
    await gotoSlide(page, 24);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('btn-reveal')).toContainText('1/6');
    await page.keyboard.press('Shift+ArrowRight');
    await expect(page.locator('[data-slide="25"]')).toBeVisible();
    await page.keyboard.press('End');
    await expect(page.locator('[data-slide="53"]')).toBeVisible();
    await page.keyboard.press('Home');
    await expect(page.locator('[data-slide="1"]')).toBeVisible();
    await page.keyboard.type('45');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-slide="45"]')).toBeVisible();
  });

  test('overview and section navigation', async ({ page }, info) => {
    await gotoSlide(page, 1);
    expect(info.project.name).toBeTruthy();
    await page.getByTestId('btn-menu').click();
    await page.getByTestId('btn-overview').click();
    await expect(page.getByTestId('overview')).toBeVisible();
    await page.getByTestId('overview').getByRole('button', { name: /Covariance Matrix/ }).first().click();
    await expect(page.locator('[data-slide="47"]')).toBeVisible();
    await page.getByTestId('section-select').selectOption('D');
    await expect(page.locator('[data-slide="34"]')).toBeVisible();
  });

  test('touch swipe changes slides', async ({ page }, info) => {
    test.skip(!isMobile(info.project.name), 'touch devices only');
    await gotoSlide(page, 5);
    const swipe = async (dx: number) => {
      await page.evaluate((d) => {
        const el = document.querySelector('#slide-main h2') as HTMLElement;
        const r = el.getBoundingClientRect();
        const y = r.top + r.height / 2;
        const x0 = window.innerWidth / 2 - d / 2;
        const opts = (x: number) => ({ bubbles: true, pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, isPrimary: true });
        el.dispatchEvent(new PointerEvent('pointerdown', opts(x0)));
        el.dispatchEvent(new PointerEvent('pointerup', opts(x0 + d)));
      }, dx);
    };
    await swipe(-160);
    await expect(page.locator('[data-slide="6"]')).toBeVisible();
    await swipe(160);
    await expect(page.locator('[data-slide="5"]')).toBeVisible();
  });
});

test.describe('teaching controls', () => {
  test('answers stay hidden until revealed; reset hides them again', async ({ page }) => {
    await gotoSlide(page, 18);
    const slide = page.locator('[data-slide="18"]');
    await expect(slide).not.toContainText('425');
    await page.getByTestId('btn-reveal').click();
    await expect(slide).toContainText('425');
    await page.getByTestId('btn-reset').click();
    await expect(slide).not.toContainText('425');
  });

  test('checkpoint answer is revealed only on demand', async ({ page }) => {
    await gotoSlide(page, 19);
    const cp = page.getByTestId('checkpoint');
    await expect(cp).not.toContainText('23,800');
    await cp.getByTestId('checkpoint-reveal').click();
    await expect(cp).toContainText('23,800');
  });

  test('salary slider updates the mean live and Reset restores the lecture data', async ({ page }) => {
    await gotoSlide(page, 20);
    await page.getByTestId('btn-reveal').click();
    const slide = page.locator('[data-slide="20"]');
    await expect(slide).toContainText('23,800');
    await page.getByTestId('s20-extreme').focus();
    await page.keyboard.press('End'); // drag-number: End jumps to its maximum, 200,000
    await expect(slide).toContainText('43,800');
    await expect(slide).toContainText('Dataset modified');
    await page.getByTestId('btn-reset').click();
    await page.getByTestId('btn-reveal').click();
    await expect(slide).toContainText('23,800');
    await expect(slide).not.toContainText('Dataset modified');
  });

  test('boxplot fences flag 50 and stop flagging below 24', async ({ page }) => {
    await gotoSlide(page, 44);
    for (let i = 0; i < 3; i++) await page.getByTestId('btn-reveal').click();
    const plot = page.getByTestId('boxplot-builder').first();
    await expect(plot.locator('[data-outlier="true"]')).toHaveCount(1);
    await page.getByTestId('s44-top').focus();
    await page.keyboard.press('Home'); // last value → 12, inside the fences
    await expect(plot.locator('[data-outlier="true"]')).toHaveCount(0);
    for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowRight'); // → 24: still inside (24 is the fence)
    await expect(plot.locator('[data-outlier="true"]')).toHaveCount(0);
    await page.keyboard.press('ArrowRight'); // → 25: flagged
    await expect(plot.locator('[data-outlier="true"]')).toHaveCount(1);
  });

  test('z-score readout follows the observation', async ({ page }) => {
    await gotoSlide(page, 45);
    await expect(page.getByTestId('z-readout')).toContainText('3.08');
    await page.getByTestId('z-slider').focus();
    await page.keyboard.press('Home'); // x = 1.50 cm
    await expect(page.getByTestId('z-readout')).toContainText('−3.57');
  });

  test('correlation is unchanged by a unit switch while covariance scales by 10', async ({ page }) => {
    await gotoSlide(page, 48);
    const read = async () => (await page.getByTestId('corr-readout').innerText()).replace(/\s+/g, ' ');
    const before = await read();
    await page.getByTestId('unit-switch').click();
    const after = await read();
    const r = (s: string) => s.match(/Pearson r ([−\d.]+)/)?.[1];
    const cov = (s: string) => Number(s.match(/Cov\(X, Y\) ([−\d.]+)/)?.[1].replace('−', '-'));
    expect(r(after)).toBe(r(before));
    expect(cov(after) / cov(before)).toBeCloseTo(10, 1);
  });

  test('PCA reaches the retained-variance step with real eigenvalues', async ({ page }) => {
    await gotoSlide(page, 51);
    for (let i = 0; i < 7; i++) await page.getByTestId('btn-reveal').click();
    await expect(page.getByTestId('pca-retained')).toContainText('99.0%');
    await expect(page.getByTestId('pca-panel')).toContainText('3.6612');
  });

  test('covariance matrix: selecting a cell highlights its mirror', async ({ page }) => {
    await gotoSlide(page, 47);
    await page.getByTestId('cell-0-2').click();
    await expect(page.getByTestId('cell-2-0')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('matrix-cov')).toContainText('1.2743');
    await page.getByTestId('cell-1-1').click();
    await expect(page.getByTestId('matrix-cov')).toContainText('0.19');
  });
});

test.describe('presenter', () => {
  test('notes are hidden by default and only shown on request', async ({ page }, info) => {
    await gotoSlide(page, 11);
    await expect(page.getByTestId('notes-drawer')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('Common misconception');
    await page.getByTestId('btn-menu').click();
    await page.getByTestId('btn-notes').click();
    await expect(page.getByTestId('notes-drawer')).toBeVisible();
    await expect(page.getByTestId('notes-warning')).toHaveText('الملاحظات ظاهرة على هذه الشاشة');
    await expect(page.getByTestId('notes-body')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('notes-lang').getByRole('radio', { name: 'EN' }).click();
    await expect(page.getByTestId('notes-warning')).toHaveText('Notes visible on this screen');
    await expect(page.getByTestId('notes-body')).toHaveAttribute('dir', 'ltr');
    expect(info.project.name).toBeTruthy();
  });

  test('presenter window mirrors the deck and can drive it', async ({ page, context }, info) => {
    test.skip(isMobile(info.project.name), 'presenter window is a desktop feature');
    const errors = watchErrors(page);
    await gotoSlide(page, 20);
    const presenter = await context.newPage();
    await presenter.goto('./#/presenter');
    await expect(presenter.getByTestId('presenter-view')).toBeVisible();
    // Arabic by default, right to left
    await expect(presenter.getByTestId('presenter-view')).toHaveAttribute('dir', 'rtl');
    await expect(presenter.getByTestId('presenter-position')).toContainText('الشريحة 20 من 53');
    await expect(presenter.getByTestId('notes-body')).toContainText('الوسط ينجذب نحو القيمة الشاذة');
    // English on request
    await presenter.getByTestId('notes-lang').getByRole('radio', { name: 'EN' }).click();
    await expect(presenter.getByTestId('presenter-position')).toContainText('slide 20 / 53');
    await expect(presenter.getByTestId('notes-body')).toContainText('The mean is pulled towards an outlier');
    await presenter.getByTestId('presenter-next').click();
    await expect(page.getByTestId('btn-reveal')).toContainText('1/4');
    await presenter.locator('select').selectOption('24');
    await expect(page.locator('[data-slide="24"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test('python lab: code copy button and annotations', async ({ page, context }, info) => {
  if (info.project.name.startsWith('desktop-chrome')) await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./#/lab/cell-16');
  const cell = page.getByTestId('lab-cell-16');
  await expect(cell).toContainText('np.linalg.eig');
  await expect(cell).toContainText('Saved output');
  await cell.getByTestId('copy-code').first().click();
  await expect(cell.getByTestId('copy-code').first()).toContainText('Copied');
});

test('iris explorer: changing axes updates the correlation', async ({ page }) => {
  await page.goto('./#/explorer');
  await expect(page.getByTestId('pair-stats')).toContainText('0.963');
  await page.getByTestId('x-select').selectOption('sepal_length');
  await page.getByTestId('y-select').selectOption('sepal_width');
  await expect(page.getByTestId('pair-stats')).toContainText('−0.118');
});

test.describe('real Python in the browser (Pyodide)', () => {
  test('runs the notebook cells and reproduces the saved outputs', async ({ page }, info) => {
    test.skip(!['desktop-chrome', 'desktop-safari', 'iphone-portrait'].includes(info.project.name), 'heavy: three profiles');
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await page.goto('./#/lab');
    await page.getByTestId('start-python').click();
    await expect(page.getByTestId('python-bar')).toContainText('Python ready', { timeout: 180_000 });

    // The original load cell → the same first rows as the saved output.
    const load = page.getByTestId('run-cell-1');
    await load.getByTestId('run-cell').click();
    await expect(load.getByTestId('live-output')).toContainText('sepal length (cm)', { timeout: 180_000 });
    await expect(load.getByTestId('live-output')).toContainText('5.1');

    // The whole corrected notebook → the corrected PCA eigenvalues.
    await page.getByTestId('run-corrected').click();
    const pca = page.getByTestId('run-cell-18-fixed');
    await expect(pca.getByTestId('live-output')).toContainText('4.22824171', { timeout: 240_000 });
    await expect(pca.getByTestId('live-output')).toContainText('0.92461872');

    // Editing a cell: errors are shown as Python tracebacks, not swallowed.
    const scratch = page.getByTestId('run-scratch');
    await scratch.getByTestId('edit-cell').click();
    await scratch.locator('textarea').fill('1 / 0');
    await scratch.getByTestId('run-cell').click();
    await expect(scratch.getByTestId('live-error')).toContainText('ZeroDivisionError');

    // Matplotlib figures are rendered as images.
    await scratch.locator('textarea').fill('import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [1, 4, 9])\nplt.tight_layout()');
    await scratch.getByTestId('run-cell').click();
    await expect(scratch.getByTestId('live-output').locator('img')).toHaveCount(1, { timeout: 120_000 });
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
