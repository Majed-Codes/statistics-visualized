# Corrections and conventions

Nothing in the source was changed silently. Each item below is also badged in the app.

## Lecture PDF (Unit2_Part5.pdf)

| Slide | Source says | Issue | What the app does |
|---|---|---|---|
| 14 | "Minute Group Discussion – Sampling Methods" | The number of minutes seems to be missing. | Title kept as printed; a discussion timer defaults to 5 minutes and can be changed. |
| 31 | "8 + 10 + 12 ÷ 3 = 30 ÷ 3 = 10" | By order of operations 8 + 10 + 12 ÷ 3 = 22. | Shows (8 + 10 + 12) ÷ 3, with a correction badge. |
| 32 | "2 + 10 + 18 ÷ 3 = 30 ÷ 3 = 10" | Same missing parentheses (the expression equals 18). | Shows (2 + 10 + 18) ÷ 3, with a correction badge. |
| 35–44 | Quartiles by "median of each half" | Correct, but one of several conventions. NumPy/pandas interpolate and give Q1 = 12.5, Q3 = 27.5 (slide 35) and Q1 = 5, Q3 = 11 (slide 40). | Keeps the lecture's answers; slide 34 compares both conventions side by side. |
| 24–27 | Variance divides by N | Correct for a population. pandas `.var()` divides by n − 1. | Lecture formula kept; a ÷N / ÷(n − 1) switch and the sample values are shown as additions. |
| 45 | 68–95–99.7 figure | True only for normal data. | Shows the actual coverage of each Iris feature next to the normal one (petal length: far from 68%). |

All other numerical answers in the PDF were checked against NumPy and are correct
(see `tests/unit/statistics.test.ts`).

## Notebook (Session5_Statistics_DEMO.ipynb)

The original is kept unchanged in `notebook/original/`. The corrected copy is
`notebook/Session5_Statistics_DEMO_corrected.ipynb` (executed with real Python;
its outputs are the ones shown as "saved output of the corrected notebook").

| Cell | Issue | Correction |
|---|---|---|
| cell-1 / cell-2 | `species` (0/1/2) is a nominal label but is stored as `int64` and included in `describe()`. | `features = df.drop(columns="species")`; species cast to `category`. |
| cell-4, cell-6, cell-8 | `numeric_only=True` keeps species, so a "mean species" etc. is reported. | Statistics computed on the four measurements only. |
| cell-6 | pandas divides by n − 1, the lecture by N — not stated. | Comment added; population variance (`ddof=0`) printed too. |
| cell-8 | pandas quartiles interpolate; lecture uses median of halves. | Note added; the 1.5 × IQR fences are applied (4 sepal-width values flagged). |
| cell-10 | `select_dtypes(include=np.number)` standardises the species codes. | Uses the four measurements. |
| cell-12, cell-14 | 5 × 5 covariance/correlation includes species; a "correlation" with arbitrary codes is not meaningful. | 4 × 4 matrices. |
| cell-16 | PCA includes species (first eigenvalue 4.838). `np.linalg.eig` does not sort eigenvalues. | `np.linalg.eigh` on the 4 measurements, sorted: 4.228, 0.243, 0.078, 0.024; PC1 keeps 92.46% of the variance. |

## Data

`src/data/iris.json` is exported from scikit-learn's `load_iris()` (the same 150
rows the notebook loads) by `scripts/export_reference.py`. scikit-learn's copy
differs from some UCI copies in two values (rows 35 and 38); the notebook's saved
outputs confirm it is the version used.
