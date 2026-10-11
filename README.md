# Statistics Visualized

An interactive, 53-slide version of **Unit 2 · Part 5 — Statistics Foundations + Real Dataset**
(Tuwaiq Academy), built on the same explorable, colour-field idea as the Health Cluster deck, with its own colours and motion. It also has a **Python Lab** where
every notebook cell runs real Python in the browser, and an **Iris Explorer** with all 150 flowers.

- The 53 slides follow the PDF's order exactly, and every exercise and answer from the PDF is kept.
- Every number on screen is computed from the data and tested against NumPy. Nothing is hard-coded.
- Additions are badged **Added**, and fixes to the source are badged **Correction** (see [docs/CORRECTIONS.md](docs/CORRECTIONS.md)).
- Presenter notes cover every slide. The planned times add up to 90 minutes, and the notes are hidden from students by default.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

Production build and local preview of the built bundle:

```bash
npm run build          # type-check + build into dist/
npm run preview        # http://localhost:4173
```

Optional: make the Python Lab work with **no internet**, for example on classroom Wi-Fi.
This copies Pyodide and NumPy, pandas, scikit-learn and Matplotlib (about 48 MB) into `public/pyodide`.
Without it, they download from the official Pyodide CDN the first time someone presses Run.

```bash
npm run vendor:python
npm run build
```

## Teaching with it

| Action | Keys | Button |
|---|---|---|
| Next reveal step, then next slide | → Space PageDown | → (bottom right) |
| Previous | ← PageUp | ← |
| Skip reveal steps | Shift + → / ← | |
| Reveal the next answer | → | **Reveal n/m** (bottom left) |
| Go to slide | type the number, then Enter | section menu (top centre) |
| All slides | O | Tools → All slides |
| Notes on this screen | N | Tools → Notes here |
| Presenter window (notes, timer, next slide) | P | Tools → Presenter window |
| 90-minute timer | T | timer (bottom right) |
| Reset the slide's answers and demos | R | reset |
| Laser pointer / black screen | L / B | Tools |
| Fullscreen | F | Tools (not available in iPhone Safari) |

On phones and tablets, swipe left or right on the slide text. Numbers drawn with a dashed underline
sit inside sentences and can be dragged sideways. They can also be focused and changed with the
arrow keys, Home and End.

For two screens, open the presenter window with P and drag it to the laptop screen. The projector
then shows only the slides.

## The Python Lab (`#/lab`)

Each notebook cell shows:
- the original code, which you can **run** and **edit**;
- the output saved in the `.ipynb`;
- a plain-language explanation and the interpretation;
- the statistical concept and links to the slides that teach it.

Cells with a problem also show the corrected cell (runnable too) and an independent TypeScript
cross-check.

Python is real. Pyodide is CPython compiled to WebAssembly, and it runs in a Web Worker so the page
never freezes. Variables persist across cells, as in Jupyter, and Matplotlib figures appear under the
cell. "Run the corrected notebook" reproduces the saved corrected outputs exactly. For example, the
PCA eigenvalues come out as 4.22824171, 0.24267075, 0.0782095 and 0.02383509.

Slides 45 and 52 also have small self-contained cells that can run during the lecture.

## Tests

```bash
npm test               # 49 unit tests: statistics + linear algebra vs NumPy, content, components
npm run test:e2e       # Playwright on the production build: Chrome, Safari (WebKit), iPhone portrait/landscape, Android
```

Current results:
- **Unit tests:** 49 / 49 pass.
- **End-to-end tests:** 88 pass and 12 are skipped on purpose; some tests only apply to certain devices, such as keyboard on desktop and swipe on touch screens.

The end-to-end suite checks that:
- every one of the 53 slides renders with all reveal steps shown, without errors, sideways scroll or clipped panels;
- navigation, swipe, reveals, resets, the draggable numbers, the boxplot fences, the z-score and correlation behave correctly;
- the presenter window stays in sync with the deck;
- real Python runs the notebook in Chrome, Safari and iPhone WebKit.

The tests also write screenshots to `docs/screenshots/`.

## Hosting

The build output is a static site that uses hash URLs (`#/slide/24`), so it works from any folder or sub-path.

- **Netlify:** `netlify.toml` is included. It builds with the offline Python runtime and publishes `dist/`.
- **GitHub Pages:** `.github/workflows/deploy-pages.yml` builds, runs the unit tests and deploys. Set Settings → Pages → Source to "GitHub Actions".

## Project layout

```
src/
  app/                 App shell, hash router, error boundaries
  components/
    presentation/      Deck, slide frame, overview, presenter window, themes, timer
    mathematics/       BalanceBeam, VarianceSquares, BoxplotBuilder, ZScoreLine,
                       RelationshipScatter, CovMatrixView, PcaScene, PopulationSampler…
    code/              CodePanel (highlighting, copy), RunnableCell (Python)
    ui/                Buttons, cards, badges, draggable numbers, reveals, checkpoints
  slides/              One folder per section; practical/ holds the Lab and the Explorer
  data/                iris.json, lecture-content.ts (titles, steps, notes), notebook data
  lib/                 statistics.ts, linear-algebra.ts (Jacobi eigen, PCA), sampling, python/
  styles/              themes.ts (section colours), index.css
tests/unit, tests/e2e
scripts/               reference values, notebook export, content map, Python vendoring
notebook/              original (unchanged) and corrected notebooks
docs/                  CONTENT_MAP.md (53 rows), CORRECTIONS.md, screenshots/ (the source PDF stays local)
```

Regenerate the derived files with:
- `python3 scripts/export_reference.py` for the Iris JSON and the NumPy reference values;
- `python3 scripts/export_notebook.py` for the notebook data;
- `node scripts/generate-content-map.ts` for the content map.

## Design

The deck uses the same idea as the Health Cluster deck, with its own colours and motion:
- **Colour fields.** Each section has its own bold field: cobalt for the title slides, then graph paper, ink blue, lilac, charcoal, lime and deep teal. Lime and sky blue are the accents.
- **Section change.** The old colour closes like an iris onto the arrow you pressed, uncovering the next section.
- **Slide motion.** Slides glide in from the side you are moving towards. Revealed answers drop into place.
- **Parts you touch.** Buttons are pill-shaped key caps that press straight down. Draggable numbers are tinted chips that open ‹ › arrows on hover.
- **Section openers.** The first slide of each part opens with a big outlined numeral.
- **Fonts.** Headings use Bricolage Grotesque and labels use IBM Plex Mono, both bundled so they work offline.

Mathematical colours keep their meaning in every section:

| Colour | Meaning |
|---|---|
| Blue | Data |
| Amber | Mean, or the answer |
| Purple | Median, or the sample |
| Teal | Mode, or PC2 |
| Green | Positive |
| Red-orange | Negative, or an outlier |

## Known limitations

- **Devices.** It has been tested in Playwright's Chromium and WebKit with emulated iPhone 14 and Pixel 7 screens. It has not been tested on a physical iPhone or Android phone.
- **Python download.** Without `vendor:python`, the first Run needs internet and downloads about 48 MB, which is heavy on mobile data. On older phones, loading scikit-learn and SciPy in the browser may be slow or run out of memory.
- **Library versions.** The browser runs Python 3.14 and pandas 3.0, which are newer than the notebook's original run. Numbers match, but some text output differs slightly, for example the `df.info()` layout.
- **Stopping Python.** A running cell can't be interrupted. **Stop** shuts Python down, and the next Run restarts it.
- **Presenter window.** It must be opened in the same browser as the deck. Class votes on slides 6 and 9 reset after leaving the deck.
- **No 3D and no Motion library.** Every scene is 2D SVG, and animations use `requestAnimationFrame` with a timer fallback. This avoids the "blank slide when animations are paused" failure.
