/** Section F · Covariance, correlation — slides 46–50. */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CovMatrixView } from '../../components/mathematics/CovMatrixView';
import { RelationshipScatter } from '../../components/mathematics/RelationshipScatter';
import { Tex } from '../../components/mathematics/Tex';
import { C, HALO, Svg } from '../../components/mathematics/primitives';
import { useSlide } from '../../components/presentation/SlideContext';
import { navigate } from '../../app/router';
import { Badge } from '../../components/ui/Badge';
import { Button, Segmented } from '../../components/ui/Button';
import { Checkpoint } from '../../components/ui/Checkpoint';
import { Note, Panel } from '../../components/ui/Panel';
import { Scrub } from '../../components/ui/Scrub';
import { COLUMNS, FEATURE_LABEL, FEATURES, IRIS, SPECIES_CODES } from '../../data/iris';
import { useMeasure } from '../../hooks/useMeasure';
import { eigenSymmetric2x2, pca } from '../../lib/linear-algebra';
import { fmt, pct } from '../../lib/format';
import { correlatedPairs, mulberry32, normalSampler } from '../../lib/random';
import { linearScale } from '../../lib/scale';
import { boxplotSummary, correlationMatrix, covariance, covarianceMatrix, describe, linearFit, mean, pearson, POPULATION, SAMPLE, variance } from '../../lib/statistics';
import { Bullets, Cols, Formula, Say, Source } from '../common';

const IRIS_COLS = FEATURES.map((f) => COLUMNS[f]);
const SHORT = ['sepal L', 'sepal W', 'petal L', 'petal W'];
const SPECIES_COLOR = SPECIES_CODES.map((s) => C.species[s]);

// ─────────────────────────────────────────────────────────────── 46 Covariance
function useLinearCloud(rho: number, seed: number, n = 48) {
  return useMemo(() => {
    const p = correlatedPairs(n, rho, seed);
    return { xs: p.map((q) => 20 + 4 * q.x), ys: p.map((q) => 50 + 10 * q.y) };
  }, [rho, seed, n]);
}

export function S46() {
  const { resetKey } = useSlide();
  const [rho, setRho] = useState(0.85);
  const [seed, setSeed] = useState(4);
  useEffect(() => {
    setRho(0.85);
    setSeed(4);
  }, [resetKey]);
  const { xs, ys } = useLinearCloud(rho, seed);
  const mx = mean(xs);
  const my = mean(ys);
  const prods = xs.map((x, i) => (x - mx) * (ys[i] - my));
  const posSum = prods.filter((p) => p > 0).reduce((a, b) => a + b, 0);
  const negSum = prods.filter((p) => p < 0).reduce((a, b) => a + b, 0);
  const cov = covariance(xs, ys, POPULATION);
  return (
    <div className="space-y-4">
      <Cols ratio="wide-right">
        <div className="space-y-3">
          <p>Measures how two variables vary together.</p>
          <Bullets
            items={[
              <><b className="text-pos">Positive</b> → move together</>,
              <><b className="text-neg">Negative</b> → move opposite</>,
              <><b>Zero</b> → no linear relationship</>,
            ]}
          />
          <Formula label={<>Formula <Badge kind="added" /></>} tex={'\\operatorname{Cov}(X,Y) = \\frac{1}{N}\\sum (x-\\mu_x)(y-\\mu_y)'} />
          <p className="text-[0.82em] text-muted">For a sample, divide by n − 1 (pandas <code>.cov()</code>, <code>np.cov</code>).</p>
          <div className="tabular rounded-xl border border-line bg-panel p-3 text-[0.9em]" data-testid="cov-readout">
            <div>
              green area Σ = <b className="text-pos">+{fmt(posSum, 1)}</b>, orange area Σ = <b className="text-neg">{fmt(negSum, 1)}</b>
            </div>
            <div className="mt-1">
              Cov = ({fmt(posSum, 1)} {negSum < 0 ? '−' : '+'} {fmt(Math.abs(negSum), 1)}) / {xs.length} = <b className="text-[1.15em] text-yellow">{fmt(cov, 2)}</b>
            </div>
          </div>
        </div>
        <Panel title="Covariance = average signed rectangle" badge={<><Badge kind="added" /><Badge kind="illustrative" /></>}>
          <RelationshipScatter xs={xs} ys={ys} rectangles xLabel="X" yLabel="Y" label="Scatterplot with signed co-deviation rectangles" domainX={[4, 36]} domainY={[10, 90]} />
          <Say className="mt-2 !text-[clamp(17px,min(1.8vw,3.2vh),26px)]">
            Draw 48 points with relationship ρ ={' '}
            <Scrub value={rho} min={-1} max={1} step={0.05} perPx={0.01} onChange={setRho} format={(v) => v.toFixed(2)} label="Relationship" className={rho >= 0 ? 'text-pos' : 'text-neg'} testId="s46-rho" />
            : {cov >= 0 ? 'green' : 'orange'} area wins and Cov = <b className="text-yellow">{fmt(cov, 1)}</b>.
          </Say>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <Button size="sm" onClick={() => setRho(-0.95)}>Large negative</Button>
            <Button size="sm" onClick={() => setRho(0)}>Near zero</Button>
            <Button size="sm" onClick={() => setRho(0.95)}>Large positive</Button>
            <Button size="sm" variant="ghost" onClick={() => setSeed((s) => s + 1)}>New points</Button>
          </div>
        </Panel>
      </Cols>
      <Source href="https://unacademy.com/content/covariance-formula/" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────── 47 Covariance Matrix
export function S47() {
  return (
    <div className="space-y-4">
      <Cols ratio="wide-right">
        <div className="space-y-3">
          <div>Properties:</div>
          <Bullets items={['Symmetric', 'Diagonal = variances']} />
          <Formula tex={'\\Sigma = \\begin{bmatrix} Var(X) & Cov(X,Y) \\\\ Cov(Y,X) & Var(Y) \\end{bmatrix}'} />
          <Note>
            Symmetric because <Tex>{'(x-\\mu_x)(y-\\mu_y) = (y-\\mu_y)(x-\\mu_x)'}</Tex>. Diagonal because <Tex>{'Cov(X,X) = Var(X)'}</Tex>.
          </Note>
          <Note kind="correction" title="Notebook correction">
            The notebook's matrix is 5 × 5 because it includes the categorical <code>species</code> code. Here only the four measurements are used.
          </Note>
        </div>
        <Panel title="Iris: 4 × 4 covariance matrix — select any cell" badge={<Badge kind="live">computed from 150 flowers</Badge>}>
          <CovMatrixView columns={IRIS_COLS} names={SHORT} kind="cov" colors={SPECIES_COLOR} initial={[2, 3]} />
          <SpeciesLegend />
        </Panel>
      </Cols>
    </div>
  );
}

function SpeciesLegend() {
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-[0.8em] text-muted">
      {['setosa', 'versicolor', 'virginica'].map((s, i) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: C.species[i] }} /> {s}
        </span>
      ))}
      <span>· colour shows species only; the statistics use the measurements</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────── 48 Correlation
type Preset = 'pos' | 'neg' | 'weak' | 'zero' | 'curve' | 'outlier' | 'custom';

function makeCloud(preset: Preset, rho: number, seed: number) {
  const n = 60;
  if (preset === 'curve') {
    const z = normalSampler(mulberry32(seed));
    const xs = Array.from({ length: n }, () => z());
    return { xs: xs.map((x) => 20 + 4 * x), ys: xs.map((x) => 30 + 10 * x * x + 3 * z()) };
  }
  const r = { pos: 0.95, neg: -0.95, weak: 0.3, zero: 0, outlier: 0, custom: rho }[preset];
  const p = correlatedPairs(preset === 'outlier' ? n - 1 : n, r, seed);
  const xs = p.map((q) => 20 + 4 * q.x);
  const ys = p.map((q) => 50 + 10 * q.y);
  if (preset === 'outlier') {
    xs.push(44);
    ys.push(110);
  }
  return { xs, ys };
}

export function S48() {
  const { resetKey } = useSlide();
  const [preset, setPreset] = useState<Preset>('pos');
  const [rho, setRho] = useState(0.6);
  const [mm, setMm] = useState(false);
  const [seed, setSeed] = useState(8);
  useEffect(() => {
    setPreset('pos');
    setRho(0.6);
    setMm(false);
    setSeed(8);
  }, [resetKey]);
  const cloud = useMemo(() => makeCloud(preset, rho, seed), [preset, rho, seed]);
  const xs = mm ? cloud.xs.map((v) => v * 10) : cloud.xs;
  const r = pearson(xs, cloud.ys);
  const cov = covariance(xs, cloud.ys, SAMPLE);
  return (
    <div className="space-y-4">
      <Cols ratio="wide-right">
        <div className="space-y-3">
          <p>Normalized covariance:</p>
          <Formula tex={'\\rho = \\frac{Cov(X,Y)}{\\sigma_X \\sigma_Y}'} />
          <Bullets items={['Between -1 and 1', 'Scale independent']} />
          <div className="tabular grid grid-cols-2 gap-2 text-center" data-testid="corr-readout">
            <div className="rounded-lg border border-yellow/50 p-2">
              <div className="text-[0.75em] text-muted">Pearson r</div>
              <div className="text-[1.5em] font-semibold text-yellow">{fmt(r, 3)}</div>
            </div>
            <div className="rounded-lg border border-line p-2">
              <div className="text-[0.75em] text-muted">Cov(X, Y)</div>
              <div className="text-[1.5em] font-semibold">{fmt(cov, 1)}</div>
            </div>
          </div>
          <Button size="sm" active={mm} onClick={() => setMm((v) => !v)} data-testid="unit-switch">
            Measure X in {mm ? 'centimetres' : 'millimetres'} instead
          </Button>
          <p className="text-[0.82em] text-muted">
            Changing units multiplies X — and Cov — by 10. r does not move: σ<sub>X</sub> grows by the same factor.
          </p>
        </div>
        <Panel title="Change the relationship" badge={<Badge kind="illustrative" />}>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Segmented
              label="Relationship preset"
              value={preset}
              onChange={setPreset}
              options={[
                { value: 'pos', label: 'Strong +' },
                { value: 'neg', label: 'Strong −' },
                { value: 'weak', label: 'Weak' },
                { value: 'zero', label: '≈ 0' },
                { value: 'curve', label: 'Curved' },
                { value: 'outlier', label: 'One outlier' },
                { value: 'custom', label: 'Slider' },
              ]}
            />
          </div>
          {preset === 'custom' && (
            <Say className="mb-1 !text-[clamp(17px,min(1.8vw,3.2vh),26px)]">
              Draw the points with ρ = <Scrub value={rho} min={-1} max={1} step={0.05} perPx={0.01} onChange={setRho} format={(v) => v.toFixed(2)} label="Relationship" testId="s48-rho" />; the sample gives r = <b className="text-yellow">{fmt(r, 3)}</b>.
            </Say>
          )}
          <RelationshipScatter xs={xs} ys={cloud.ys} xLabel={`X (${mm ? 'mm' : 'cm'})`} yLabel="Y" label="Scatterplot with live Pearson correlation" />
          <div className="mt-1 flex items-center justify-between gap-2 text-[0.82em] text-muted">
            <span>
              {preset === 'curve' && 'Y depends strongly on X, yet r ≈ 0: correlation only detects linear association.'}
              {preset === 'outlier' && 'Without the single far point the cloud has r ≈ 0; one value creates a “correlation”.'}
              {preset === 'weak' && 'A weak linear trend: points loosely follow a line.'}
              {preset === 'zero' && 'No linear trend: knowing X does not help predict Y linearly.'}
              {(preset === 'pos' || preset === 'neg') && 'Points lie close to a straight line.'}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setSeed((s) => s + 1)}>New points</Button>
          </div>
        </Panel>
      </Cols>
      <Checkpoint
        question="Across Saudi cities, monthly air-conditioner sales and hospital visits for heat exhaustion have r = 0.9. What can we conclude?"
        options={['AC sales cause heat exhaustion', 'Heat exhaustion causes AC sales', 'Both rise with a third variable — temperature; r alone does not show causation', 'r = 0.9 proves a causal link in one direction']}
        correct={2}
        explanation="Correlation measures linear association, not causation. A confounder (summer temperature) drives both. Causal claims need experiments or causal analysis."
      />
    </div>
  );
}

// ──────────────────────────────────────────────────── 49 Why Covariance Matrix Matters
function EllipsePlot({ xs, ys, color }: { xs: number[]; ys: number[]; color: string }) {
  const [ref, w] = useMeasure<HTMLDivElement>(260, 200);
  const h = 170;
  const S = covarianceMatrix([xs, ys], SAMPLE);
  const [e1, e2] = eigenSymmetric2x2(S[0][0], S[0][1], S[1][1]);
  const mx = mean(xs);
  const my = mean(ys);
  const X = linearScale([2.8, 5.4], [10, w - 10]);
  const unit = (w - 20) / 2.6;
  const Y = (v: number) => h / 2 - (v - my) * unit;
  const ang = (Math.atan2(e1.vector[1], e1.vector[0]) * 180) / Math.PI;
  return (
    <div ref={ref}>
      <Svg width={w} height={h} label="Gaussian ellipses drawn from the covariance matrix">
        {[1, 2].map((k) => (
          <ellipse key={k} cx={X(mx)} cy={Y(my)} rx={k * Math.sqrt(e1.value) * unit} ry={k * Math.sqrt(e2.value) * unit} transform={`rotate(${-ang} ${X(mx)} ${Y(my)})`} fill={C.yellow} fillOpacity={0.06} stroke={C.yellow} strokeOpacity={0.7} strokeDasharray={k === 2 ? '4 4' : undefined} />
        ))}
        {xs.map((x, i) => <circle key={i} cx={X(x)} cy={Y(ys[i])} r={3} fill={color} />)}
        <text x={10} y={h - 6} fontSize={11} fill={C.muted} {...HALO}>1σ and 2σ contours of N(μ, Σ)</text>
      </Svg>
    </div>
  );
}

export function S49() {
  const pl = COLUMNS.petal_length;
  const pw = COLUMNS.petal_width;
  const res = pca([pl, pw]);
  const fit = linearFit(pl, pw);
  const vers = IRIS.filter((r) => r.species === 1);
  const R = correlationMatrix(IRIS_COLS);
  const tiles: [string, ReactNode, string][] = [
    [
      'PCA',
      <RelationshipScatter key="pca" xs={pl} ys={pw} colors={SPECIES_COLOR} xLabel="petal length" yLabel="petal width" height={190} label="Petal measurements" fit={{ slope: res.components[0].vector[1] / res.components[0].vector[0], intercept: res.means[1] - (res.components[0].vector[1] / res.components[0].vector[0]) * res.means[0] }} />,
      `Eigenvectors of Σ give the principal axes. Here PC1 keeps ${pct(res.explainedVarianceRatio[0])} of the petal variance.`,
    ],
    [
      'Multivariate Gaussian',
      <EllipsePlot key="g" xs={vers.map((r) => r.petal_length)} ys={vers.map((r) => r.petal_width)} color={C.species[1]} />,
      'Σ sets the shape and tilt of the probability contours (shown for versicolor petals).',
    ],
    [
      'Feature redundancy detection',
      <div key="red" className="tabular space-y-1 py-2 text-[0.85em]">
        {[[2, 3], [0, 2], [0, 3], [0, 1]].map(([a, b]) => (
          <div key={`${a}${b}`} className="grid grid-cols-[minmax(0,1fr)_3.5em] items-center gap-2">
            <span className="text-muted">{SHORT[a]} ↔ {SHORT[b]}</span>
            <span className={`text-right font-semibold ${Math.abs(R[a][b]) > 0.9 ? 'text-yellow' : ''}`}>{fmt(R[a][b], 3)}</span>
          </div>
        ))}
      </div>,
      'Petal length and width: r ≈ 0.96 — nearly the same information twice.',
    ],
    [
      'Linear regression',
      <RelationshipScatter key="lr" xs={pl} ys={pw} xLabel="petal length" yLabel="petal width" height={190} fit={fit} label="Least-squares line" />,
      `Slope = Cov(X, Y) / Var(X) = ${fmt(covariance(pl, pw), 3)} / ${fmt(variance(pl), 3)} = ${fmt(fit.slope, 3)}.`,
    ],
  ];
  return (
    <div className="space-y-3">
      <p>Used in:</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {tiles.map(([t, vis, cap]) => (
          <Panel key={t} title={t} badge={<Badge kind="live">Iris</Badge>}>
            {vis}
            <p className="mt-1 text-[0.8em] text-ink/85">{cap}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── 50 Real Dataset Workflow
export function S50() {
  const { resetKey } = useSlide();
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [resetKey]);
  const flagged = FEATURES.map((f) => boxplotSummary(COLUMNS[f], 'linear').outliers.length);
  const C4 = covarianceMatrix(IRIS_COLS, SAMPLE);
  const steps: [string, string, ReactNode][] = [
    ['Load dataset', 'cell-1', <p key="0">150 rows (flowers) × 4 measurement columns + 1 label column, from <code>sklearn.datasets.load_iris()</code>.</p>],
    [
      'Inspect variables',
      'cell-2',
      <div key="1" className="space-y-1">
        <p>4 continuous features (float64, cm) and <code>species</code> (int64).</p>
        <p className="text-neg">species is stored as an integer but is a nominal category: exclude it from numeric statistics.</p>
      </div>,
    ],
    [
      'Compute summary statistics',
      'cell-4',
      <table key="2" className="tabular w-full text-[0.85em]">
        <thead className="text-muted">
          <tr><th className="text-left font-medium">feature</th><th className="text-right font-medium">mean</th><th className="text-right font-medium">median</th><th className="text-right font-medium">std</th></tr>
        </thead>
        <tbody>
          {FEATURES.map((f) => {
            const d = describe(COLUMNS[f]);
            return <tr key={f} className="border-t border-line"><td>{FEATURE_LABEL[f]}</td><td className="text-right">{fmt(d.mean, 3)}</td><td className="text-right">{fmt(d.median, 2)}</td><td className="text-right">{fmt(d.std, 3)}</td></tr>;
          })}
        </tbody>
      </table>,
    ],
    [
      'Detect outliers',
      'cell-8',
      <div key="3">
        <p>1.5 × IQR rule (pandas quartiles):</p>
        <ul className="tabular mt-1 text-[0.9em]">
          {FEATURES.map((f, i) => <li key={f}>{FEATURE_LABEL[f]}: <b className={flagged[i] ? 'text-neg' : ''}>{flagged[i]}</b> flagged</li>)}
        </ul>
      </div>,
    ],
    [
      'Compute covariance matrix',
      'cell-12',
      <Tex key="4" display>{`\\Sigma = \\begin{bmatrix}${C4.map((r) => r.map((v) => fmt(v, 3).replace('−', '-')).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`}</Tex>,
    ],
    [
      'Interpret results',
      'cell-16',
      <Bullets key="5" className="text-[0.9em]" items={[`Petal length and width are almost redundant (r = ${fmt(pearson(COLUMNS.petal_length, COLUMNS.petal_width), 3)}).`, 'Sepal width moves weakly opposite to the others.', `PC1 of the 4 measurements keeps ${pct(pca(IRIS_COLS).explainedVarianceRatio[0])} of the variance.`]} />,
    ],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ol className="space-y-1.5">
        {steps.map(([t], i) => (
          <li key={t}>
            <button type="button" onClick={() => setActive(i)} className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left ${active === i ? 'border-yellow bg-yellow/10' : 'border-line bg-panel hover:border-blue/60'}`}>
              <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[0.8em]">{i + 1}</span>
              <span className="font-medium">{t}</span>
            </button>
          </li>
        ))}
      </ol>
      <Panel title={steps[active][0]} badge={<Badge kind="live">Iris</Badge>}>
        <div className="min-h-40">{steps[active][2]}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => navigate(`#/lab/${steps[active][1]}`)}>
            Open in Python Lab ({steps[active][1]})
          </Button>
        </div>
      </Panel>
    </div>
  );
}
