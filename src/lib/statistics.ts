/**
 * Descriptive statistics used throughout the lecture.
 *
 * Every visualisation computes its numbers from these functions at render time;
 * nothing shown on screen is a hard-coded result. Each function is tested in
 * tests/unit/statistics.test.ts against NumPy / pandas reference values.
 */

export type Ddof = 0 | 1;

/** ddof = 0 → population (divide by N); ddof = 1 → sample (divide by n − 1). */
export const POPULATION: Ddof = 0;
export const SAMPLE: Ddof = 1;

function assertNonEmpty(xs: readonly number[], fn: string): void {
  if (xs.length === 0) throw new RangeError(`${fn}: needs at least one value`);
}

export function sum(xs: readonly number[]): number {
  // Kahan summation keeps long sums (e.g. 150 Iris values) faithful to NumPy.
  let s = 0;
  let c = 0;
  for (const x of xs) {
    const y = x - c;
    const t = s + y;
    c = t - s - y;
    s = t;
  }
  return s;
}

export function mean(xs: readonly number[]): number {
  assertNonEmpty(xs, 'mean');
  return sum(xs) / xs.length;
}

export function sorted(xs: readonly number[]): number[] {
  return [...xs].sort((a, b) => a - b);
}

/** Middle value of the sorted data; the average of the two middle values when n is even. */
export function median(xs: readonly number[]): number {
  assertNonEmpty(xs, 'median');
  const s = sorted(xs);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface FrequencyEntry<T> {
  value: T;
  count: number;
}

/** Frequency table in order of first appearance. */
export function frequencies<T>(xs: readonly T[]): FrequencyEntry<T>[] {
  const map = new Map<T, number>();
  for (const x of xs) map.set(x, (map.get(x) ?? 0) + 1);
  return [...map.entries()].map(([value, count]) => ({ value, count }));
}

/**
 * Mode(s). Follows the lecture's convention: when every value occurs exactly
 * once there is no mode, and an empty array is returned ("Mode = None").
 * Several values tied for the highest count are all returned (multimodal).
 */
export function modes<T>(xs: readonly T[]): T[] {
  if (xs.length === 0) return [];
  const freq = frequencies(xs);
  const max = Math.max(...freq.map((f) => f.count));
  if (max === 1) return [];
  return freq.filter((f) => f.count === max).map((f) => f.value);
}

export function range(xs: readonly number[]): number {
  assertNonEmpty(xs, 'range');
  return Math.max(...xs) - Math.min(...xs);
}

export function deviations(xs: readonly number[], center = mean(xs)): number[] {
  return xs.map((x) => x - center);
}

export function sumOfSquares(xs: readonly number[], center = mean(xs)): number {
  return sum(xs.map((x) => (x - center) ** 2));
}

/** Variance with N − ddof in the denominator. */
export function variance(xs: readonly number[], ddof: Ddof = POPULATION): number {
  assertNonEmpty(xs, 'variance');
  const denom = xs.length - ddof;
  if (denom <= 0) throw new RangeError('variance: sample variance needs at least two values');
  return sumOfSquares(xs) / denom;
}

export function std(xs: readonly number[], ddof: Ddof = POPULATION): number {
  return Math.sqrt(variance(xs, ddof));
}

// ---------------------------------------------------------------- quantiles

/**
 * Quartile conventions. They genuinely give different answers on small data,
 * which is why the lecture slides state their method explicitly.
 *
 * - 'tukey'  — the method used in the lecture: find the median, then take the
 *              median of the lower half and of the upper half. For odd n the
 *              median itself is excluded from both halves.
 * - 'linear' — NumPy's default (`np.percentile`, `pandas.quantile`): linear
 *              interpolation at position p·(n − 1) of the sorted data
 *              (Hyndman & Fan type 7).
 */
export type QuartileMethod = 'tukey' | 'linear';

export function quantileLinear(xs: readonly number[], p: number): number {
  assertNonEmpty(xs, 'quantile');
  if (p < 0 || p > 1) throw new RangeError('quantile: p must lie in [0, 1]');
  const s = sorted(xs);
  const pos = p * (s.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export interface Quartiles {
  q1: number;
  q2: number;
  q3: number;
  /** The halves used by the Tukey method (empty for 'linear'). */
  lowerHalf: number[];
  upperHalf: number[];
}

export function quartiles(xs: readonly number[], method: QuartileMethod = 'tukey'): Quartiles {
  assertNonEmpty(xs, 'quartiles');
  const s = sorted(xs);
  if (method === 'linear') {
    return {
      q1: quantileLinear(s, 0.25),
      q2: quantileLinear(s, 0.5),
      q3: quantileLinear(s, 0.75),
      lowerHalf: [],
      upperHalf: [],
    };
  }
  if (s.length === 1) return { q1: s[0], q2: s[0], q3: s[0], lowerHalf: [s[0]], upperHalf: [s[0]] };
  const half = Math.floor(s.length / 2);
  const lowerHalf = s.slice(0, half);
  const upperHalf = s.slice(s.length % 2 === 1 ? half + 1 : half);
  return { q1: median(lowerHalf), q2: median(s), q3: median(upperHalf), lowerHalf, upperHalf };
}

export function iqr(xs: readonly number[], method: QuartileMethod = 'tukey'): number {
  const { q1, q3 } = quartiles(xs, method);
  return q3 - q1;
}

export interface Fences {
  lower: number;
  upper: number;
  iqr: number;
}

/** Tukey fences: Q1 − k·IQR and Q3 + k·IQR (k = 1.5 in the lecture). */
export function fences(q1: number, q3: number, k = 1.5): Fences {
  const spread = q3 - q1;
  return { lower: q1 - k * spread, upper: q3 + k * spread, iqr: spread };
}

export interface BoxplotSummary extends Quartiles {
  iqr: number;
  fences: Fences;
  /** Whiskers reach the most extreme observations still inside the fences. */
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
  min: number;
  max: number;
}

export function boxplotSummary(
  xs: readonly number[],
  method: QuartileMethod = 'tukey',
  k = 1.5,
): BoxplotSummary {
  const qs = quartiles(xs, method);
  const f = fences(qs.q1, qs.q3, k);
  const s = sorted(xs);
  const inside = s.filter((x) => x >= f.lower && x <= f.upper);
  return {
    ...qs,
    iqr: f.iqr,
    fences: f,
    whiskerLow: inside.length ? inside[0] : qs.q1,
    whiskerHigh: inside.length ? inside[inside.length - 1] : qs.q3,
    outliers: s.filter((x) => x < f.lower || x > f.upper),
    min: s[0],
    max: s[s.length - 1],
  };
}

// --------------------------------------------------------------- z-scores

export function zScore(x: number, mu: number, sigma: number): number {
  if (sigma === 0) throw new RangeError('zScore: standard deviation is zero');
  return (x - mu) / sigma;
}

/** Standardise a column. pandas' `(df - df.mean()) / df.std()` uses ddof = 1. */
export function zScores(xs: readonly number[], ddof: Ddof = POPULATION): number[] {
  const mu = mean(xs);
  const sigma = std(xs, ddof);
  return xs.map((x) => zScore(x, mu, sigma));
}

/** Fraction of observations whose |z| ≤ k — compared on screen with the normal-curve figure. */
export function fractionWithin(xs: readonly number[], k: number, ddof: Ddof = POPULATION): number {
  const z = zScores(xs, ddof);
  return z.filter((v) => Math.abs(v) <= k).length / z.length;
}

// ------------------------------------------------- covariance & correlation

export function covariance(xs: readonly number[], ys: readonly number[], ddof: Ddof = POPULATION): number {
  if (xs.length !== ys.length) throw new RangeError('covariance: x and y must have equal length');
  assertNonEmpty(xs, 'covariance');
  const mx = mean(xs);
  const my = mean(ys);
  const denom = xs.length - ddof;
  if (denom <= 0) throw new RangeError('covariance: sample covariance needs at least two pairs');
  return sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / denom;
}

/** Pearson's r. The ddof cancels between numerator and denominator. */
export function pearson(xs: readonly number[], ys: readonly number[]): number {
  const sx = std(xs);
  const sy = std(ys);
  if (sx === 0 || sy === 0) return Number.NaN;
  return covariance(xs, ys) / (sx * sy);
}

/** Covariance matrix of columns (each inner array is one variable). */
export function covarianceMatrix(columns: readonly (readonly number[])[], ddof: Ddof = SAMPLE): number[][] {
  const k = columns.length;
  const m: number[][] = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      // Σ is symmetric by construction: Cov(X, Y) = Cov(Y, X).
      m[i][j] = m[j][i] = covariance(columns[i], columns[j], ddof);
    }
  }
  return m;
}

export function correlationMatrix(columns: readonly (readonly number[])[]): number[][] {
  return columns.map((a, i) => columns.map((b, j) => (i === j ? 1 : pearson(a, b))));
}

/** Least-squares line y = intercept + slope·x, with slope = Cov(X, Y) / Var(X). */
export function linearFit(xs: readonly number[], ys: readonly number[]): { slope: number; intercept: number } {
  const slope = covariance(xs, ys) / variance(xs);
  return { slope, intercept: mean(ys) - slope * mean(xs) };
}

export function meanSquaredError(actual: readonly number[], predicted: readonly number[]): number {
  if (actual.length !== predicted.length) throw new RangeError('meanSquaredError: length mismatch');
  return mean(actual.map((a, i) => (a - predicted[i]) ** 2));
}

export interface SummaryRow {
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

/** Equivalent of a pandas `describe()` column (sample std, linear quartiles). */
export function describe(xs: readonly number[]): SummaryRow {
  const q = quartiles(xs, 'linear');
  return {
    count: xs.length,
    mean: mean(xs),
    std: std(xs, SAMPLE),
    min: Math.min(...xs),
    q1: q.q1,
    median: q.q2,
    q3: q.q3,
    max: Math.max(...xs),
  };
}
