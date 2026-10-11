/**
 * Small, dependency-free linear algebra for the covariance and PCA scenes.
 *
 * The eigen decomposition is the cyclic Jacobi method for real symmetric
 * matrices — exactly the case of a covariance matrix. It is numerically
 * stable, always yields real eigenvalues and orthonormal eigenvectors, and is
 * tested against `numpy.linalg.eigh` on the Iris covariance matrix.
 */
import { covarianceMatrix, mean, type Ddof, SAMPLE } from './statistics';

export type Vector = number[];
export type Matrix = number[][];

export function zeros(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

export function identity(n: number): Matrix {
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
}

export function transpose(a: readonly (readonly number[])[]): Matrix {
  if (a.length === 0) return [];
  return a[0].map((_, j) => a.map((row) => row[j]));
}

export function matMul(a: readonly (readonly number[])[], b: readonly (readonly number[])[]): Matrix {
  const n = a.length;
  const m = b[0].length;
  const k = b.length;
  if (a[0].length !== k) throw new RangeError('matMul: inner dimensions differ');
  const out = zeros(n, m);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      let s = 0;
      for (let t = 0; t < k; t++) s += a[i][t] * b[t][j];
      out[i][j] = s;
    }
  return out;
}

export function matVec(a: readonly (readonly number[])[], v: readonly number[]): Vector {
  return a.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
}

export function dot(a: readonly number[], b: readonly number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

export function norm(v: readonly number[]): number {
  return Math.sqrt(dot(v, v));
}

export function isSymmetric(a: readonly (readonly number[])[], tol = 1e-12): boolean {
  return a.every((row, i) => row.every((x, j) => Math.abs(x - a[j][i]) <= tol * Math.max(1, Math.abs(x))));
}

export interface EigenPair {
  value: number;
  /** Unit-length eigenvector. */
  vector: Vector;
}

/**
 * Deterministic sign convention: flip each eigenvector so its largest-magnitude
 * component is positive. Eigenvectors are only defined up to sign; fixing one
 * keeps the on-screen arrows from jumping when data change slightly.
 */
function canonicalSign(v: Vector): Vector {
  let k = 0;
  for (let i = 1; i < v.length; i++) if (Math.abs(v[i]) > Math.abs(v[k])) k = i;
  return v[k] < 0 ? v.map((x) => -x) : v;
}

/** Eigen decomposition of a real symmetric matrix, sorted by eigenvalue (largest first). */
export function eigenSymmetric(input: readonly (readonly number[])[], maxSweeps = 100): EigenPair[] {
  const n = input.length;
  if (!isSymmetric(input, 1e-9)) throw new RangeError('eigenSymmetric: matrix is not symmetric');
  const a = input.map((row) => [...row]);
  const v = identity(n);

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] ** 2;
    if (off < 1e-30) break;

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        // Rotation angle that zeroes a[p][q] (Golub & Van Loan, Algorithm 8.4.2).
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }

  return a
    .map((row, i) => ({ value: row[i], vector: canonicalSign(v.map((r) => r[i])) }))
    .sort((x, y) => y.value - x.value);
}

/** Closed-form eigen decomposition of a symmetric 2×2 matrix [[a, b], [b, d]]. Used to cross-check Jacobi. */
export function eigenSymmetric2x2(a: number, b: number, d: number): EigenPair[] {
  const tr = a + d;
  const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b);
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const vecFor = (l: number): Vector => {
    // (A − λI)v = 0 → v ∝ (b, λ − a) or (λ − d, b); pick the better conditioned one.
    const v1: Vector = [b, l - a];
    const v2: Vector = [l - d, b];
    const v = norm(v1) >= norm(v2) ? v1 : v2;
    const len = norm(v);
    return len === 0 ? (l === l1 ? [1, 0] : [0, 1]) : canonicalSign(v.map((x) => x / len));
  };
  if (disc === 0) return [{ value: l1, vector: [1, 0] }, { value: l2, vector: [0, 1] }];
  return [{ value: l1, vector: vecFor(l1) }, { value: l2, vector: vecFor(l2) }];
}

// ------------------------------------------------------------------- PCA

export interface PcaResult {
  /** Column means that were subtracted (the centre of the cloud). */
  means: Vector;
  covariance: Matrix;
  components: EigenPair[];
  explainedVarianceRatio: number[];
  totalVariance: number;
}

/** Columns-in: each inner array is one variable. Rows-out helpers below. */
export function pca(columns: readonly (readonly number[])[], ddof: Ddof = SAMPLE): PcaResult {
  const means = columns.map((c) => mean(c));
  const covariance = covarianceMatrix(columns, ddof);
  const components = eigenSymmetric(covariance);
  // Rounding can make the smallest eigenvalue −1e-17; variance cannot be negative.
  for (const c of components) if (c.value < 0 && c.value > -1e-12) c.value = 0;
  const totalVariance = covariance.reduce((s, row, i) => s + row[i], 0); // trace = Σ λ
  return {
    means,
    covariance,
    components,
    explainedVarianceRatio: components.map((c) => c.value / totalVariance),
    totalVariance,
  };
}

/** Coordinates of every observation along the first k principal axes: (x − μ)·vₖ. */
export function pcaTransform(result: PcaResult, columns: readonly (readonly number[])[], k: number): number[][] {
  const n = columns[0].length;
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const centred = columns.map((c, j) => c[i] - result.means[j]);
    out.push(result.components.slice(0, k).map((pc) => dot(centred, pc.vector)));
  }
  return out;
}

/** Map k-dimensional scores back to the original space: μ + Σ scoreₖ·vₖ. */
export function pcaReconstruct(result: PcaResult, scores: readonly (readonly number[])[]): number[][] {
  return scores.map((row) =>
    result.means.map((m, j) => m + row.reduce((s, z, k) => s + z * result.components[k].vector[j], 0)),
  );
}

/** Variance of the data projected onto a unit direction u: uᵀ Σ u. */
export function varianceAlong(cov: readonly (readonly number[])[], u: readonly number[]): number {
  return dot(u, matVec(cov, u));
}
