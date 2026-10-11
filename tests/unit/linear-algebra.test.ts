import { describe, expect, it } from 'vitest';
import ref from './reference-values.json';
import iris from '../../src/data/iris.json';
import * as LA from '../../src/lib/linear-algebra';
import { covarianceMatrix, variance, SAMPLE } from '../../src/lib/statistics';

const cols = [0, 1, 2, 3].map((j) => iris.rows.map((r) => r[j]));

describe('symmetric eigen decomposition', () => {
  const C = covarianceMatrix(cols, SAMPLE);
  const eig = LA.eigenSymmetric(C);

  it('eigenvalues match numpy.linalg.eigh on the Iris covariance matrix', () => {
    eig.forEach((e, i) => expect(e.value).toBeCloseTo(ref.iris.eigenvalues[i], 10));
  });
  it('eigenvectors match NumPy up to sign', () => {
    eig.forEach((e, k) => {
      const np = ref.iris.eigenvectors.map((row) => row[k]);
      expect(Math.abs(LA.dot(e.vector, np))).toBeCloseTo(1, 10);
    });
  });
  it('satisfies Σv = λv and the eigenvectors are orthonormal', () => {
    for (const e of eig) {
      const Av = LA.matVec(C, e.vector);
      Av.forEach((x, i) => expect(x).toBeCloseTo(e.value * e.vector[i], 10));
      expect(LA.norm(e.vector)).toBeCloseTo(1, 12);
    }
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(LA.dot(eig[i].vector, eig[j].vector)).toBeCloseTo(0, 10);
  });
  it('sum of eigenvalues equals the trace (total variance)', () => {
    const trace = C.reduce((s, r, i) => s + r[i], 0);
    expect(eig.reduce((s, e) => s + e.value, 0)).toBeCloseTo(trace, 10);
  });
  it('closed-form 2×2 agrees with Jacobi', () => {
    const a = C[2][2], b = C[2][3], d = C[3][3];
    const j = LA.eigenSymmetric([[a, b], [b, d]]);
    const c = LA.eigenSymmetric2x2(a, b, d);
    j.forEach((e, i) => {
      expect(c[i].value).toBeCloseTo(e.value, 12);
      expect(Math.abs(LA.dot(c[i].vector, e.vector))).toBeCloseTo(1, 12);
    });
  });
  it('handles diagonal and degenerate matrices', () => {
    const e = LA.eigenSymmetric([[2, 0], [0, 5]]);
    expect(e.map((x) => x.value)).toEqual([5, 2]);
    const iso = LA.eigenSymmetric2x2(1, 0, 1);
    expect(iso.map((x) => x.value)).toEqual([1, 1]);
  });
  it('rejects non-symmetric input', () => {
    expect(() => LA.eigenSymmetric([[1, 2], [3, 4]])).toThrow();
  });
});

describe('PCA', () => {
  const result = LA.pca(cols);
  it('explained variance ratio matches NumPy (PC1 ≈ 92.46%)', () => {
    result.explainedVarianceRatio.forEach((r, i) => expect(r).toBeCloseTo(ref.iris.explainedRatio[i], 10));
    expect(result.explainedVarianceRatio[0]).toBeGreaterThan(0.92);
  });
  it('projections match NumPy up to the sign of each component', () => {
    const scores = LA.pcaTransform(result, cols, 2);
    for (let k = 0; k < 2; k++) {
      const sign = Math.sign(scores[0][k]) * Math.sign(ref.iris.projectionFirst5[0][k]);
      for (let i = 0; i < 5; i++) expect(scores[i][k] * sign).toBeCloseTo(ref.iris.projectionFirst5[i][k], 10);
    }
  });
  it('variance of PC scores equals the eigenvalue; uᵀΣu is maximised by PC1', () => {
    const scores = LA.pcaTransform(result, cols, 4);
    for (let k = 0; k < 4; k++) expect(variance(scores.map((s) => s[k]), SAMPLE)).toBeCloseTo(result.components[k].value, 10);
    const pc1 = result.components[0].vector;
    expect(LA.varianceAlong(result.covariance, pc1)).toBeCloseTo(result.components[0].value, 10);
    const other = LA.varianceAlong(result.covariance, [0.5, 0.5, 0.5, 0.5]);
    expect(other).toBeLessThan(result.components[0].value);
  });
  it('reconstruction from all components is exact; from k < d loses exactly Σ remaining λ', () => {
    const full = LA.pcaReconstruct(result, LA.pcaTransform(result, cols, 4));
    full.forEach((row, i) => row.forEach((v, j) => expect(v).toBeCloseTo(cols[j][i], 10)));
    const one = LA.pcaReconstruct(result, LA.pcaTransform(result, cols, 1));
    const n = cols[0].length;
    let sse = 0;
    one.forEach((row, i) => row.forEach((v, j) => (sse += (v - cols[j][i]) ** 2)));
    const lost = result.components.slice(1).reduce((s, c) => s + c.value, 0);
    expect(sse / (n - 1)).toBeCloseTo(lost, 10);
  });
  it('reproduces the original notebook eigenvalues when species is (incorrectly) included', () => {
    const withSpecies = [...cols, iris.rows.map((r) => r[4])];
    const e = LA.eigenSymmetric(covarianceMatrix(withSpecies, SAMPLE));
    e.forEach((x, i) => expect(x.value).toBeCloseTo(ref.iris.eigenvaluesWithSpecies[i], 8));
  });
});
