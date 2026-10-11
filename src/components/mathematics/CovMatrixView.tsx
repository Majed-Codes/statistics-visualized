/**
 * A covariance (or correlation) matrix as a colour-coded grid.
 * Off-diagonal: green = positive, orange = negative, intensity = magnitude.
 * Diagonal: blue = variance. Selecting a cell outlines it and its mirror
 * image (symmetry) and draws the scatterplot of that pair, or the histogram of
 * the feature for a diagonal cell.
 */
import { useEffect, useState } from 'react';
import { covarianceMatrix, correlationMatrix, linearFit, mean, std, SAMPLE } from '../../lib/statistics';
import { fmt } from '../../lib/format';
import { useSlide } from '../presentation/SlideContext';
import { Histogram } from './Histogram';
import { RelationshipScatter } from './RelationshipScatter';
import { C } from './primitives';

interface Props {
  columns: number[][];
  names: string[];
  kind?: 'cov' | 'corr';
  colors?: string[];
  initial?: [number, number];
  digits?: number;
  showFit?: boolean;
}

function cellColor(v: number, maxAbs: number, diagonal: boolean, kind: 'cov' | 'corr'): string {
  if (diagonal) return kind === 'corr' ? 'rgba(93,169,233,0.25)' : `rgba(93,169,233,${0.15 + 0.6 * Math.min(1, v / maxAbs)})`;
  const a = 0.1 + 0.65 * Math.min(1, Math.abs(v) / maxAbs);
  return v >= 0 ? `rgba(111,207,142,${a})` : `rgba(242,121,91,${a})`;
}

export function CovMatrixView({ columns, names, kind = 'cov', colors, initial = [2, 3], digits = 3, showFit = false }: Props) {
  const { resetKey } = useSlide();
  const [sel, setSel] = useState<[number, number]>(initial);
  useEffect(() => setSel(initial), [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const M = kind === 'cov' ? covarianceMatrix(columns, SAMPLE) : correlationMatrix(columns);
  const k = M.length;
  const offMax = Math.max(1e-9, ...M.flatMap((row, i) => row.filter((_, j) => j !== i).map(Math.abs)));
  const diagMax = Math.max(...M.map((r, i) => r[i]));
  const [i, j] = sel;
  const isMirror = (a: number, b: number) => (a === i && b === j) || (a === j && b === i);

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[auto_minmax(0,1fr)]" data-testid={`matrix-${kind}`}>
      <div className="min-w-0">
        <div className="overflow-x-auto">
          <table className="tabular mx-auto border-separate border-spacing-1 text-[0.85em]" role="grid" aria-label={kind === 'cov' ? 'Covariance matrix' : 'Correlation matrix'}>
            <thead>
              <tr>
                <th />
                {names.map((n, c) => (
                  <th key={n} className={`px-1 pb-1 text-center font-medium ${c === i || c === j ? 'text-yellow' : 'text-muted'}`} style={{ maxWidth: 90 }}>
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {M.map((row, r) => (
                <tr key={r}>
                  <th className={`pr-2 text-right font-medium ${r === i || r === j ? 'text-yellow' : 'text-muted'}`}>{names[r]}</th>
                  {row.map((v, c) => (
                    <td key={c} className="p-0">
                      <button
                        type="button"
                        onClick={() => setSel([r, c])}
                        aria-pressed={isMirror(r, c)}
                        data-testid={`cell-${r}-${c}`}
                        className={`min-h-12 w-full min-w-[4.2em] rounded-md px-1.5 py-2 text-center font-semibold ${isMirror(r, c) ? 'ring-2 ring-yellow' : ''}`}
                        style={{ background: cellColor(v, kind === 'cov' && r === c ? diagMax : offMax, r === c, kind), color: C.ink }}
                        title={`${kind === 'cov' ? (r === c ? 'Var' : 'Cov') : 'r'}(${names[r]}, ${names[c]}) = ${fmt(v, 6)}`}
                      >
                        {fmt(v, digits)}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-center text-[0.82em] text-muted">
          {i === j ? (
            <>
              Diagonal: {kind === 'cov' ? <>Cov(X, X) = Var(X) = <b className="text-blue">{fmt(M[i][i], 4)}</b></> : <>r(X, X) = 1 always</>}
            </>
          ) : (
            <>
              Symmetric: entry ({i + 1},{j + 1}) = entry ({j + 1},{i + 1}) = <b className={M[i][j] >= 0 ? 'text-pos' : 'text-neg'}>{fmt(M[i][j], 4)}</b>
            </>
          )}
        </p>
        <p className="mt-1 text-center text-[0.75em] text-dim">{k} × {k} · sample {kind === 'cov' ? 'covariance (÷ n − 1, as pandas .cov())' : 'Pearson correlation (pandas .corr())'}</p>
      </div>
      <div className="min-w-0">
        {i === j ? (
          <div>
            <div className="mb-1 text-[0.85em] text-muted">
              {names[i]}: mean {fmt(mean(columns[i]), 3)}, SD {fmt(std(columns[i], SAMPLE), 3)}, variance {fmt(std(columns[i], SAMPLE) ** 2, 3)}
            </div>
            <Histogram
              series={[{ values: columns[i], color: C.blue, label: names[i] }]}
              bins={22}
              height={240}
              markers={[{ value: mean(columns[i]), color: C.yellow, label: 'μ' }]}
              label={`Histogram of ${names[i]}`}
            />
          </div>
        ) : (
          <RelationshipScatter
            xs={columns[j]}
            ys={columns[i]}
            xLabel={names[j]}
            yLabel={names[i]}
            colors={colors}
            rectangles={false}
            fit={showFit ? linearFit(columns[j], columns[i]) : undefined}
            label={`Scatterplot of ${names[i]} against ${names[j]}`}
          />
        )}
      </div>
    </div>
  );
}
