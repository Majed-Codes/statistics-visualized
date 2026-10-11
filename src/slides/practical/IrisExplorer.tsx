/**
 * Iris Dataset Explorer — all 150 real observations, bundled locally.
 * Choose the axes, filter species, toggle histograms, and see the summary
 * statistics, correlation, covariance/correlation matrices and a PCA
 * projection, all recomputed live for the current selection.
 */
import { useEffect, useMemo, useState } from 'react';
import { CovMatrixView } from '../../components/mathematics/CovMatrixView';
import { Histogram } from '../../components/mathematics/Histogram';
import { RelationshipScatter } from '../../components/mathematics/RelationshipScatter';
import { C } from '../../components/mathematics/primitives';
import { navigate, slideHash } from '../../app/router';
import { Badge } from '../../components/ui/Badge';
import { Button, Segmented } from '../../components/ui/Button';
import { Note, Panel } from '../../components/ui/Panel';
import { IconPrev } from '../../components/ui/Icons';
import { FEATURES, FEATURE_LABEL, IRIS, SPECIES, type Feature } from '../../data/iris';
import { pca, pcaTransform } from '../../lib/linear-algebra';
import { fmt, pct } from '../../lib/format';
import { boxplotSummary, covariance, describe, linearFit, mean, pearson, std, SAMPLE } from '../../lib/statistics';

const SHORT: Record<Feature, string> = { sepal_length: 'sepal L', sepal_width: 'sepal W', petal_length: 'petal L', petal_width: 'petal W' };

export default function IrisExplorer() {
  const [xf, setXf] = useState<Feature>('petal_length');
  const [yf, setYf] = useState<Feature>('petal_width');
  const [species, setSpecies] = useState<boolean[]>([true, true, true]);
  const [hist, setHist] = useState(true);
  const [view, setView] = useState<'scatter' | 'pca'>('scatter');
  const [standardise, setStandardise] = useState(false);
  const [matrix, setMatrix] = useState<'cov' | 'corr'>('corr');
  const [fit, setFit] = useState(false);
  useEffect(() => {
    document.title = 'Iris Explorer · Statistics Visualized';
    window.scrollTo(0, 0);
  }, []);

  const rows = useMemo(() => IRIS.filter((r) => species[r.species]), [species]);
  const cols = FEATURES.map((f) => rows.map((r) => r[f]));
  const colors = rows.map((r) => C.species[r.species]);
  const enough = rows.length >= 3;
  const xs = rows.map((r) => r[xf]);
  const ys = rows.map((r) => r[yf]);

  const pcaRes = useMemo(() => {
    if (!enough) return null;
    const input = standardise ? cols.map((c) => { const m = mean(c); const s = std(c, SAMPLE) || 1; return c.map((v) => (v - m) / s); }) : cols;
    const res = pca(input);
    return { res, scores: pcaTransform(res, input, 2) };
  }, [rows, standardise]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-dvh text-ink" data-testid="iris-explorer">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b-2 border-line bg-canvas px-4 py-2">
        <Button size="sm" variant="ghost" icon={<IconPrev />} onClick={() => navigate(slideHash(52))}>Back to lecture</Button>
        <h1 className="font-semibold">Iris Dataset Explorer <span className="text-muted">· {rows.length} of 150 flowers</span></h1>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={() => navigate('#/lab')}>Python Lab</Button>
      </header>
      <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-[0.85em] text-muted">
            X axis
            <select data-testid="x-select" className="mt-1 block min-h-10 rounded-lg border border-line bg-panel px-2 text-ink" value={xf} onChange={(e) => setXf(e.target.value as Feature)} disabled={view === 'pca'}>
              {FEATURES.map((f) => <option key={f} value={f}>{FEATURE_LABEL[f]} (cm)</option>)}
            </select>
          </label>
          <label className="text-[0.85em] text-muted">
            Y axis
            <select data-testid="y-select" className="mt-1 block min-h-10 rounded-lg border border-line bg-panel px-2 text-ink" value={yf} onChange={(e) => setYf(e.target.value as Feature)} disabled={view === 'pca'}>
              {FEATURES.map((f) => <option key={f} value={f}>{FEATURE_LABEL[f]} (cm)</option>)}
            </select>
          </label>
          <fieldset className="text-[0.85em]">
            <legend className="text-muted">Species (colour = label, never a feature)</legend>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {SPECIES.map((s, i) => (
                <Button key={s} size="sm" active={species[i]} onClick={() => setSpecies((v) => v.map((b, j) => (j === i ? !b : b)))}>
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: C.species[i] }} /> {s}
                </Button>
              ))}
            </div>
          </fieldset>
          <Segmented label="View" value={view} onChange={setView} options={[{ value: 'scatter', label: 'Scatterplot' }, { value: 'pca', label: 'PCA projection' }]} />
          <Button size="sm" active={hist} onClick={() => setHist((h) => !h)}>Histograms</Button>
          {view === 'scatter' && <Button size="sm" active={fit} onClick={() => setFit((f) => !f)}>Least-squares line</Button>}
        </div>

        {!enough ? (
          <Note kind="warn">Select at least one species to see statistics.</Note>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Panel
              title={view === 'scatter' ? `${FEATURE_LABEL[yf]} vs ${FEATURE_LABEL[xf]}` : `PC2 vs PC1 (${standardise ? 'standardised' : 'covariance'} PCA)`}
              badge={<Badge kind="live" />}
            >
              {view === 'scatter' ? (
                <RelationshipScatter xs={xs} ys={ys} colors={colors} xLabel={`${FEATURE_LABEL[xf]} (cm)`} yLabel={`${FEATURE_LABEL[yf]} (cm)`} fit={fit ? linearFit(xs, ys) : undefined} label="Iris scatterplot" />
              ) : (
                pcaRes && (
                  <RelationshipScatter xs={pcaRes.scores.map((s) => s[0])} ys={pcaRes.scores.map((s) => s[1])} colors={colors} xLabel={`PC1 (${pct(pcaRes.res.explainedVarianceRatio[0])} of variance)`} yLabel={`PC2 (${pct(pcaRes.res.explainedVarianceRatio[1])})`} label="Iris PCA projection" />
                )
              )}
              {view === 'scatter' ? (
                <p className="tabular mt-2 text-[0.9em]" data-testid="pair-stats">
                  r = <b className="text-yellow">{fmt(pearson(xs, ys), 3)}</b> · Cov = {fmt(covariance(xs, ys, SAMPLE), 4)} (÷ n − 1)
                  {fit && <> · slope = {fmt(linearFit(xs, ys).slope, 3)}</>}
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.85em]">
                  <Button size="sm" active={standardise} onClick={() => setStandardise((s) => !s)}>Standardise features first</Button>
                  <span className="text-muted">Without standardising, PCA is dominated by petal length (largest variance).</span>
                </div>
              )}
              {hist && view === 'scatter' && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[xf, yf].map((f) => (
                    <div key={f}>
                      <div className="text-[0.8em] text-muted">{FEATURE_LABEL[f]}</div>
                      <Histogram
                        series={SPECIES.map((_, i) => ({ values: rows.filter((r) => r.species === i).map((r) => r[f]), color: C.species[i], label: SPECIES[i] })).filter((s) => s.values.length)}
                        bins={18}
                        height={140}
                        markers={[{ value: mean(rows.map((r) => r[f])), color: C.yellow, label: 'μ' }]}
                        label={`Histogram of ${FEATURE_LABEL[f]} by species`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Panel>
            <div className="min-w-0 space-y-4">
              <Panel title="Summary statistics" badge={<Badge kind="live">pandas conventions</Badge>}>
                <div className="overflow-x-auto">
                  <table className="tabular w-full min-w-[460px] text-[0.82em]" data-testid="summary-table">
                    <thead className="text-muted">
                      <tr>
                        {['', 'mean', 'median', 'std', 'min', 'Q1', 'Q3', 'max', 'IQR', 'flagged'].map((h) => <th key={h} className="px-1 py-1 text-right font-medium first:text-left">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURES.map((f, i) => {
                        const d = describe(cols[i]);
                        const b = boxplotSummary(cols[i], 'linear');
                        return (
                          <tr key={f} className={`border-t border-line ${f === xf || f === yf ? 'text-ink' : 'text-ink/75'}`}>
                            <td className="px-1 py-1 text-left">{SHORT[f]}</td>
                            <td className="px-1 text-right">{fmt(d.mean, 3)}</td>
                            <td className="px-1 text-right">{fmt(d.median, 2)}</td>
                            <td className="px-1 text-right">{fmt(d.std, 3)}</td>
                            <td className="px-1 text-right">{fmt(d.min, 1)}</td>
                            <td className="px-1 text-right">{fmt(d.q1, 2)}</td>
                            <td className="px-1 text-right">{fmt(d.q3, 2)}</td>
                            <td className="px-1 text-right">{fmt(d.max, 1)}</td>
                            <td className="px-1 text-right">{fmt(b.iqr, 2)}</td>
                            <td className={`px-1 text-right ${b.outliers.length ? 'text-neg' : ''}`}>{b.outliers.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1 text-[0.75em] text-muted">std uses n − 1 and quartiles use linear interpolation, like pandas. “flagged” = outside the 1.5 × IQR fences.</p>
              </Panel>
              {pcaRes && (
                <Panel title={`Principal components (${standardise ? 'correlation' : 'covariance'} matrix)`} badge={<Badge kind="live">eigen decomposition</Badge>}>
                  <div className="space-y-1.5">
                    {pcaRes.res.components.map((_, k) => (
                      <div key={k} className="grid grid-cols-[3em_minmax(0,1fr)_4.5em] items-center gap-2 text-[0.85em]">
                        <span className="text-muted">PC{k + 1}</span>
                        <div className="h-4 rounded bg-panel-2">
                          <div className="h-4 rounded" style={{ width: `${pcaRes.res.explainedVarianceRatio[k] * 100}%`, background: k === 0 ? C.yellow : k === 1 ? C.mode : C.blue }} />
                        </div>
                        <span className="tabular text-right">{pct(pcaRes.res.explainedVarianceRatio[k])}</span>
                      </div>
                    ))}
                  </div>
                  <p className="tabular mt-2 text-[0.78em] text-muted">
                    λ = {pcaRes.res.components.map((c) => fmt(c.value, 4)).join(', ')} · PC1 = ({pcaRes.res.components[0].vector.map((v) => fmt(v, 3)).join(', ')})
                  </p>
                </Panel>
              )}
            </div>
          </div>
        )}

        {enough && (
          <Panel title="Matrices — select a cell" badge={<Badge kind="live" />}>
            <div className="mb-3">
              <Segmented label="Matrix" value={matrix} onChange={setMatrix} options={[{ value: 'corr', label: 'Correlation' }, { value: 'cov', label: 'Covariance' }]} />
            </div>
            <CovMatrixView key={matrix + rows.length} columns={cols} names={FEATURES.map((f) => SHORT[f])} kind={matrix} colors={colors} initial={[2, 3]} showFit />
          </Panel>
        )}
        <Note>
          Try selecting one species at a time: petal length vs petal width has r ≈ 0.96 over all flowers but only about 0.33 within setosa and 0.32 within virginica (0.79 within versicolor). Much of the overall correlation comes from differences <i>between</i> species.
        </Note>
      </main>
    </div>
  );
}
