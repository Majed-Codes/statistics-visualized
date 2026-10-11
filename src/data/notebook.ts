/**
 * Teaching metadata for the notebook cells. The code and outputs themselves
 * are copied verbatim from the .ipynb files (src/data/notebook.json, generated
 * by scripts/export_notebook.py) and are never retyped here.
 */
import nb from './notebook.json';

export interface NotebookCell {
  id: string;
  index: number;
  type: string;
  source: string;
  outputs: string[];
}

export const ORIGINAL: NotebookCell[] = nb.original;
export const CORRECTED: NotebookCell[] = nb.corrected;

export interface LabEntry {
  /** Cell id in the original notebook. */
  id: string;
  title: string;
  concept: string;
  slides: number[];
  explanation: string;
  interpretation: string;
  /** Line annotations for the original code (1-based lines). */
  annotations: { lines: number[]; label: string }[];
  /** Problem in the original cell, if any. */
  issue?: string;
  /** Matching cell id in the corrected notebook. */
  correctedId?: string;
}

export const LAB: LabEntry[] = [
  {
    id: 'cell-0',
    title: 'Imports',
    concept: 'Tooling',
    slides: [52],
    explanation: 'NumPy holds arrays and does linear algebra, pandas holds labelled tables (DataFrames), Matplotlib draws plots.',
    interpretation: 'No output — these lines only make the libraries available.',
    annotations: [
      { lines: [1], label: 'arrays + linear algebra' },
      { lines: [2], label: 'tables' },
    ],
    correctedId: 'cell-1',
  },
  {
    id: 'cell-1',
    title: 'Load the Iris dataset',
    concept: 'Population vs sample · features vs target',
    slides: [8, 11, 50],
    explanation:
      'load_iris() returns 150 flowers. Each row is one observation; the four measurement columns are the features (independent variables). The species column is the target (dependent variable).',
    interpretation:
      'df.head() shows the first five rows. All five are species 0 (setosa) because the dataset is sorted by species — another reason to shuffle before splitting into train and test sets.',
    annotations: [
      { lines: [2, 4], label: 'load the 150 observations' },
      { lines: [6], label: '4 continuous features' },
      { lines: [7], label: 'categorical target coded 0/1/2' },
      { lines: [9], label: 'first 5 rows' },
    ],
    issue: 'species is stored as integers 0/1/2 but is a nominal category. Nothing marks it as categorical, so later cells treat it as a number.',
    correctedId: 'cell-2',
  },
  {
    id: 'cell-2',
    title: 'Inspect variables and summary statistics',
    concept: 'Types of variables · descriptive statistics',
    slides: [5, 15, 50],
    explanation:
      'df.info() lists each column with its data type and count of non-missing values. df.describe() computes count, mean, standard deviation, minimum, quartiles and maximum for every numeric column.',
    interpretation:
      'No missing values. The species row of describe() (mean 1.0, std 0.82) is meaningless: those are statistics of arbitrary labels. Note std uses n − 1 and the quartiles use linear interpolation.',
    annotations: [
      { lines: [1], label: 'dtypes: species shows as int64' },
      { lines: [2], label: 'count, mean, std, min, quartiles, max' },
    ],
    issue: 'describe() includes species as if it were a measurement.',
    correctedId: 'cell-4',
  },
  {
    id: 'cell-4',
    title: 'Mean and median',
    concept: 'Measures of central tendency',
    slides: [16, 20, 23],
    explanation: 'mean() adds each column and divides by n. median() sorts each column and takes the middle value.',
    interpretation:
      'Petal length: mean 3.758 but median 4.35. The 50 setosa flowers all have petals under 2 cm and pull the mean down; petal length is bimodal, so no single number describes a "typical" flower well. Sepal length (5.843 vs 5.80) is nearly symmetric.',
    annotations: [
      { lines: [1], label: 'μ = Σx / N per column' },
      { lines: [2], label: 'middle value per column' },
      { lines: [4, 5], label: 'print both' },
    ],
    issue: 'numeric_only=True keeps species, so a "mean species" of 1.0 is reported.',
    correctedId: 'cell-6',
  },
  {
    id: 'cell-6',
    title: 'Variance and standard deviation',
    concept: 'Measures of variation',
    slides: [24, 26, 27],
    explanation: 'var() averages squared deviations from the mean; std() is its square root. pandas divides by n − 1 by default (sample variance).',
    interpretation:
      'Petal length varies most (variance 3.12, SD 1.77 cm); sepal width least (SD 0.44 cm). The lecture divides by N: with n = 150 the two differ by a factor of 150/149, under 1%.',
    annotations: [
      { lines: [1], label: 's² = Σ(x − x̄)² / (n − 1)' },
      { lines: [2], label: 's = √s²' },
    ],
    issue: 'Includes species; and the ÷(n − 1) convention differs silently from the lecture formula ÷N.',
    correctedId: 'cell-8',
  },
  {
    id: 'cell-8',
    title: 'Interquartile range',
    concept: 'IQR and outliers',
    slides: [34, 39],
    explanation: 'quantile(0.25) and quantile(0.75) give Q1 and Q3 for each column; their difference is the IQR, the width of the middle 50%.',
    interpretation:
      'Petal length has the widest middle half (3.5 cm). The corrected cell also applies the 1.5 × IQR fences: only sepal width has flagged values (4 flowers).',
    annotations: [
      { lines: [1], label: 'Q1' },
      { lines: [2], label: 'Q3' },
      { lines: [3], label: 'IQR = Q3 − Q1' },
    ],
    issue: 'pandas interpolates quartiles linearly; hand calculations in the lecture use the median of each half, which can give different values on small data.',
    correctedId: 'cell-10',
  },
  {
    id: 'cell-10',
    title: 'Z-score standardisation',
    concept: 'Z-score',
    slides: [28, 45],
    explanation: 'Subtract each column’s mean and divide by its standard deviation: every column then has mean 0 and standard deviation 1.',
    interpretation:
      'Flower 0 has sepal width z = +1.02: about one standard deviation wider than average. Its petal length z = −1.34: well below average.',
    annotations: [
      { lines: [1], label: 'select numeric columns (includes species!)' },
      { lines: [3], label: 'z = (x − μ) / σ' },
    ],
    issue: 'select_dtypes(include=np.number) keeps species, so the labels 0/1/2 get standardised.',
    correctedId: 'cell-12',
  },
  {
    id: 'cell-12',
    title: 'Covariance matrix',
    concept: 'Covariance matrix',
    slides: [46, 47, 49],
    explanation: 'cov() computes Cov(X, Y) for every pair of columns (÷ n − 1). The result is symmetric with the variances on the diagonal.',
    interpretation:
      'Petal length–petal width covariance is 1.30 and positive. Sepal width has negative covariance with the other three. Magnitudes are not comparable across pairs because each depends on the variables’ scales — that is what correlation fixes.',
    annotations: [{ lines: [1], label: 'Σ, one entry per pair' }],
    issue: 'The original matrix is 5 × 5: it includes covariances with the species codes, which depend on the arbitrary order 0, 1, 2.',
    correctedId: 'cell-14',
  },
  {
    id: 'cell-14',
    title: 'Correlation matrix',
    concept: 'Correlation',
    slides: [48, 49],
    explanation: 'corr() divides each covariance by both standard deviations, giving Pearson’s r between −1 and 1 for every pair.',
    interpretation:
      'Petal length and petal width: r = 0.963, nearly redundant. Sepal length and sepal width: r = −0.118, almost no linear relationship across the whole dataset.',
    annotations: [{ lines: [1], label: 'ρ = Cov / (σx σy)' }],
    issue: 'The species row (r ≈ 0.95 with petals) is not a valid Pearson correlation: re-coding species as 2/0/1 would change it.',
    correctedId: 'cell-16',
  },
  {
    id: 'cell-16',
    title: 'PCA connection',
    concept: 'Eigen decomposition · PCA',
    slides: [51, 52],
    explanation:
      'Centre the data, compute the covariance matrix, and decompose it. Eigenvectors are the principal directions; eigenvalues are the variances along them.',
    interpretation:
      'With the four measurements only, the first eigenvalue is 4.228 of a total 4.573: PC1 alone keeps 92.5% of the variance, so the four measurements are close to one-dimensional.',
    annotations: [
      { lines: [2], label: 'centre: x − μ' },
      { lines: [5], label: 'Σ = cov of centred data' },
      { lines: [8], label: 'eigen decomposition Σv = λv' },
    ],
    issue: 'Uses 5 columns including species (eigenvalues 4.838, …). np.linalg.eig does not sort eigenvalues; np.linalg.eigh is the routine for symmetric matrices.',
    correctedId: 'cell-18',
  },
];

export function originalCell(id: string): NotebookCell | undefined {
  return ORIGINAL.find((c) => c.id === id);
}

export function correctedCell(id: string): NotebookCell | undefined {
  return CORRECTED.find((c) => c.id === id);
}
