import { describe, expect, it } from 'vitest';
import ref from './reference-values.json';
import iris from '../../src/data/iris.json';
import * as S from '../../src/lib/statistics';

const cols = [0, 1, 2, 3].map((j) => iris.rows.map((r) => r[j]));
const L = ref.lecture;
const close = (a: number, b: number, digits = 10) => expect(a).toBeCloseTo(b, digits);

describe('lecture examples (slides 17–44) against NumPy', () => {
  it('slide 18: scores 75…95 → mean 85, median 85, no mode', () => {
    const d = [75, 80, 85, 90, 95];
    close(S.mean(d), L.scores.mean);
    expect(S.mean(d)).toBe(85);
    expect(S.median(d)).toBe(85);
    expect(S.modes(d)).toEqual([]);
  });
  it('slide 20: salaries → mean 23,800, median 5,000', () => {
    const d = [4000, 4500, 5000, 5500, 100000];
    expect(S.mean(d)).toBe(23800);
    expect(S.median(d)).toBe(5000);
    expect(S.modes(d)).toEqual([]);
  });
  it('slide 22: categorical languages → mode Python', () => {
    expect(S.modes(['Python', 'Python', 'Java', 'Python', 'C++', 'Java'])).toEqual(['Python']);
    expect(S.frequencies(['Python', 'Python', 'Java', 'Python', 'C++', 'Java'])).toEqual([
      { value: 'Python', count: 3 },
      { value: 'Java', count: 2 },
      { value: 'C++', count: 1 },
    ]);
  });
  it('slides 26–27: population variance and SD (÷N)', () => {
    for (const [k, d] of [['A1', [10, 12, 14]], ['B1', [5, 10, 21]]] as const) {
      const r = L[k];
      close(S.variance([...d], S.POPULATION), r.varPop);
      close(S.std([...d], S.POPULATION), r.stdPop);
      close(S.variance([...d], S.SAMPLE), r.varSample);
      close(S.std([...d], S.SAMPLE), r.stdSample);
    }
    expect(S.range([10, 12, 14])).toBe(4);
    expect(S.range([5, 10, 21])).toBe(16);
    expect(S.sumOfSquares([5, 10, 21])).toBe(134);
    expect(S.variance([10, 12, 14]).toFixed(2)).toBe('2.67');
    expect(S.std([5, 10, 21]).toFixed(2)).toBe('6.68');
  });
  it('slides 31–33: same mean 10, different spread', () => {
    expect(S.mean([8, 10, 12])).toBe(10);
    expect(S.mean([2, 10, 18])).toBe(10);
    close(S.std([2, 10, 18]), L.B2.stdPop);
    expect(S.std([2, 10, 18])).toBeGreaterThan(S.std([8, 10, 12]));
  });
  it('slides 35–37: Tukey quartiles 10 / 20 / 30, IQR 20, range 95', () => {
    const d = [5, 10, 15, 20, 25, 30, 100];
    const q = S.quartiles(d, 'tukey');
    expect([q.q1, q.q2, q.q3]).toEqual([10, 20, 30]);
    expect(q.lowerHalf).toEqual([5, 10, 15]);
    expect(q.upperHalf).toEqual([25, 30, 100]);
    expect(S.iqr(d)).toBe(20);
    expect(S.range(d)).toBe(95);
  });
  it('linear (NumPy default) quartiles differ from the lecture convention', () => {
    for (const k of ['iqr1', 'iqr2'] as const) {
      const d = k === 'iqr1' ? [5, 10, 15, 20, 25, 30, 100] : [2, 4, 6, 8, 10, 12, 50];
      const q = S.quartiles(d, 'linear');
      L[k].numpyQuartiles.forEach((v, i) => close([q.q1, q.q2, q.q3][i], v));
    }
  });
  it('slides 41–44: Q2 8, Q1 4, Q3 12, IQR 8, fences −8 / 24, 50 is flagged', () => {
    const d = [2, 4, 6, 8, 10, 12, 50];
    const b = S.boxplotSummary(d);
    expect([b.q1, b.q2, b.q3, b.iqr]).toEqual([4, 8, 12, 8]);
    expect(b.fences.lower).toBe(-8);
    expect(b.fences.upper).toBe(24);
    expect(b.outliers).toEqual([50]);
    expect(b.whiskerHigh).toBe(12);
  });
  it('even-length median and Tukey halves', () => {
    expect(S.median([1, 2, 3, 4])).toBe(2.5);
    const q = S.quartiles([1, 2, 3, 4, 5, 6]);
    expect([q.q1, q.q2, q.q3]).toEqual([2, 3.5, 5]);
  });
});

describe('Iris (4 numeric features) against pandas/NumPy', () => {
  it('means, medians, sample variance and SD (pandas ddof=1)', () => {
    cols.forEach((c, j) => {
      close(S.mean(c), ref.iris.mean[j]);
      close(S.median(c), ref.iris.median[j]);
      close(S.variance(c, S.SAMPLE), ref.iris.varSample[j]);
      close(S.std(c, S.SAMPLE), ref.iris.stdSample[j]);
      close(S.variance(c, S.POPULATION), ref.iris.varPop[j]);
    });
  });
  it('linear quartiles match pandas .quantile', () => {
    cols.forEach((c, j) => {
      const q = S.quartiles(c, 'linear');
      close(q.q1, ref.iris.q1[j]);
      close(q.q3, ref.iris.q3[j]);
    });
  });
  it('z-scores of row 0 match the notebook formula (ddof=1)', () => {
    cols.forEach((c, j) => close(S.zScores(c, S.SAMPLE)[0], ref.iris.zFirstRow[j]));
    const z = S.zScores(cols[0], S.SAMPLE);
    close(S.mean(z), 0);
    close(S.std(z, S.SAMPLE), 1);
  });
  it('covariance and correlation matrices match np.cov / np.corrcoef', () => {
    const C = S.covarianceMatrix(cols, S.SAMPLE);
    const R = S.correlationMatrix(cols);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        close(C[i][j], ref.iris.cov[i][j]);
        close(R[i][j], ref.iris.corr[i][j]);
        expect(C[i][j]).toBe(C[j][i]);
      }
  });
  it('correlation is scale independent, covariance is not', () => {
    const mm = cols[2].map((v) => v * 10);
    close(S.pearson(mm, cols[3]), S.pearson(cols[2], cols[3]));
    close(S.covariance(mm, cols[3]), 10 * S.covariance(cols[2], cols[3]));
  });
  it('least-squares slope = Cov/Var and MSE is non-negative', () => {
    const { slope, intercept } = S.linearFit(cols[2], cols[3]);
    close(slope, ref.iris.cov[2][3] / ref.iris.cov[2][2]);
    const pred = cols[2].map((x) => intercept + slope * x);
    expect(S.meanSquaredError(cols[3], pred)).toBeGreaterThan(0);
    close(S.mean(cols[3].map((y, i) => y - pred[i])), 0);
  });
  it('describe() reproduces the notebook df.describe() row for sepal length', () => {
    const d = S.describe(cols[0]);
    expect(d.count).toBe(150);
    expect(d.mean.toFixed(6)).toBe('5.843333');
    expect(d.std.toFixed(6)).toBe('0.828066');
    expect([d.min, d.q1, d.median, d.q3, d.max]).toEqual([4.3, 5.1, 5.8, 6.4, 7.9]);
  });
});

describe('edge cases', () => {
  it('rejects empty input and undefined sample variance', () => {
    expect(() => S.mean([])).toThrow();
    expect(() => S.variance([3], S.SAMPLE)).toThrow();
    expect(() => S.zScore(1, 1, 0)).toThrow();
  });
  it('returns several modes when tied', () => {
    expect(S.modes([1, 1, 2, 2, 3])).toEqual([1, 2]);
  });
});
