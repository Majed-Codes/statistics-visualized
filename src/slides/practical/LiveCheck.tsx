/**
 * For each corrected notebook cell, the key numbers recomputed in the browser
 * from the bundled Iris data with the TypeScript library — a cross-check that
 * the lecture's own formulas reproduce the pandas/NumPy output.
 */
import type { ReactNode } from 'react';
import { COLUMNS, FEATURES, FEATURE_LABEL } from '../../data/iris';
import { pca } from '../../lib/linear-algebra';
import { fmt } from '../../lib/format';
import { boxplotSummary, correlationMatrix, covarianceMatrix, mean, median, quartiles, std, variance, zScores, POPULATION, SAMPLE } from '../../lib/statistics';

const COLS = FEATURES.map((f) => COLUMNS[f]);
const NAMES = FEATURES.map((f) => FEATURE_LABEL[f]);

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="tabular w-full min-w-[420px] font-mono text-[0.78em]">
        <thead className="text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} className={`px-2 py-1 font-medium ${i ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((v, j) => (
                <td key={j} className={`px-2 py-0.5 ${j ? 'text-right' : 'text-left'}`}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const f6 = (v: number) => v.toFixed(6);

export function liveCheck(id: string): ReactNode | null {
  switch (id) {
    case 'cell-2':
      return (
        <Table
          head={['', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']}
          rows={COLS.map((c, i) => {
            const q = quartiles(c, 'linear');
            return [NAMES[i], c.length, f6(mean(c)), f6(std(c, SAMPLE)), Math.min(...c).toFixed(1), fmt(q.q1, 3), fmt(q.q2, 3), fmt(q.q3, 3), Math.max(...c).toFixed(1)];
          })}
        />
      );
    case 'cell-4':
      return <Table head={['', 'mean', 'median']} rows={COLS.map((c, i) => [NAMES[i], f6(mean(c)), fmt(median(c), 2)])} />;
    case 'cell-6':
      return <Table head={['', 'var (n−1)', 'std (n−1)', 'var (÷N)']} rows={COLS.map((c, i) => [NAMES[i], f6(variance(c, SAMPLE)), f6(std(c, SAMPLE)), f6(variance(c, POPULATION))])} />;
    case 'cell-8':
      return (
        <Table
          head={['', 'Q1', 'Q3', 'IQR', 'flagged']}
          rows={COLS.map((c, i) => {
            const b = boxplotSummary(c, 'linear');
            return [NAMES[i], fmt(b.q1, 3), fmt(b.q3, 3), fmt(b.iqr, 3), b.outliers.length];
          })}
        />
      );
    case 'cell-10': {
      const z = COLS.map((c) => zScores(c, SAMPLE));
      return <Table head={['row', ...NAMES]} rows={[0, 1, 2, 3, 4].map((r) => [r, ...z.map((col) => f6(col[r]))])} />;
    }
    case 'cell-12': {
      const M = covarianceMatrix(COLS, SAMPLE);
      return <Table head={['', ...NAMES]} rows={M.map((row, i) => [NAMES[i], ...row.map(f6)])} />;
    }
    case 'cell-14': {
      const M = correlationMatrix(COLS);
      return <Table head={['', ...NAMES]} rows={M.map((row, i) => [NAMES[i], ...row.map(f6)])} />;
    }
    case 'cell-16': {
      const r = pca(COLS);
      return (
        <Table
          head={['component', 'eigenvalue λ', 'explained', 'eigenvector (sign arbitrary)']}
          rows={r.components.map((c, i) => [`PC${i + 1}`, f6(c.value), `${(r.explainedVarianceRatio[i] * 100).toFixed(2)}%`, `(${c.vector.map((v) => v.toFixed(4)).join(', ')})`])}
        />
      );
    }
    default:
      return null;
  }
}
