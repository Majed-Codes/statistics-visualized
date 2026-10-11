/** Section C · Measures of variation — slides 24–33. */
import { useEffect, useState } from 'react';
import { DotPlot } from '../../components/mathematics/DotPlot';
import { Tex } from '../../components/mathematics/Tex';
import { VarianceSquares } from '../../components/mathematics/VarianceSquares';
import { C, Chart } from '../../components/mathematics/primitives';
import { useSlide } from '../../components/presentation/SlideContext';
import { Badge } from '../../components/ui/Badge';
import { Button, Segmented } from '../../components/ui/Button';
import { Checkpoint } from '../../components/ui/Checkpoint';
import { Note, Panel } from '../../components/ui/Panel';
import { Step } from '../../components/ui/Reveal';
import { fmt, tex } from '../../lib/format';
import { linearScale } from '../../lib/scale';
import { covariance, deviations, linearFit, mean, meanSquaredError, range, std, sumOfSquares, variance, POPULATION, SAMPLE, type Ddof } from '../../lib/statistics';
import { Bullets, Cols, Formula, Kicker, Say, TaskList, WorkLine } from '../common';
import { Scrub } from '../../components/ui/Scrub';

const A1 = [10, 12, 14];
const B1 = [5, 10, 21];
const A2 = [8, 10, 12];
const B2 = [2, 10, 18];

const Y = (s: string) => `\\textcolor{${C.yellow}}{${s}}`;
const B = (s: string) => `\\textcolor{${C.blue}}{${s}}`;

/** The variance formula, growing with the stage of the squares picture. */
function EvolvingFormula({ values, stage, ddof }: { values: number[]; stage: number; ddof: Ddof }) {
  const mu = mean(values);
  const devs = deviations(values);
  const ss = sumOfSquares(values);
  const N = values.length;
  const k = N - ddof;
  const v = ss / k;
  const sym = ddof === 0 ? '\\sigma' : 's';
  const lines: { show: boolean; tex: string; note: string }[] = [
    { show: stage >= 1, tex: `${Y('\\mu')} = \\frac{1}{N}\\sum x = \\frac{${values.join('+')}}{${N}} = ${Y(tex(mu))}`, note: 'the centre' },
    { show: stage >= 2, tex: `x - \\mu:\\quad ${devs.map((d) => tex(d)).join(',\\; ')}`, note: 'signed distances — they always sum to 0' },
    { show: stage >= 3, tex: `${B('(x - \\mu)^2')}:\\quad ${devs.map((d) => tex(d * d)).join(',\\; ')}`, note: 'areas of the squares' },
    { show: stage >= 4, tex: `\\sum ${B('(x-\\mu)^2')} = ${devs.map((d) => tex(d * d)).join('+')} = ${tex(ss)}`, note: 'total area' },
    {
      show: stage >= 5,
      tex: `${Y(`${sym}^2`)} = \\frac{1}{${ddof === 0 ? 'N' : 'n-1'}}\\sum (x-\\mu)^2 = \\frac{${tex(ss)}}{${k}} = ${Y(tex(v))}`,
      note: ddof === 0 ? 'average square (population variance)' : 'sample variance (Bessel-corrected)',
    },
    { show: stage >= 6, tex: `${Y(sym)} = \\sqrt{${sym}^2} = \\sqrt{${tex(v)}} = ${Y(tex(Math.sqrt(v)))}`, note: 'side of the average square, in the data’s units' },
  ];
  return (
    <div className="space-y-1.5" data-testid="evolving-formula">
      {lines.map((l, i) =>
        l.show ? (
          <div key={i} className="rounded-xl border-2 border-line bg-panel px-3 py-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.7em] text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <Tex display>{l.tex}</Tex>
              </div>
            </div>
            <div className="-mt-1 pb-0.5 pl-6 text-[0.72em] text-muted">{l.note}</div>
          </div>
        ) : null,
      )}
      {stage === 0 && <p className="text-[0.9em] text-muted">Press → to build the variance one step at a time.</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────── 24 Measures of Variation
export function S24() {
  const { step, resetKey } = useSlide();
  const [ds, setDs] = useState<'A' | 'B'>('B');
  const [ddof, setDdof] = useState<Ddof>(POPULATION);
  const [last, setLast] = useState(21);
  useEffect(() => {
    setDs('B');
    setDdof(POPULATION);
    setLast(21);
  }, [resetKey]);
  const base = ds === 'A' ? A1 : B1;
  const values = [base[0], base[1], last];
  const modified = last !== base[2];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="cd px-4 py-2.5">
          <div className="lab">Range</div>
          <p className="mt-1 font-medium">max − min <span className="text-muted">= {Math.max(...values)} − {Math.min(...values)} = {range(values)}</span></p>
        </div>
        <Formula label="Variance" tex={'\\sigma^2 = \\frac{1}{N}\\sum (x-\\mu)^2'} />
        <Formula label="Standard Deviation" tex={'\\sigma = \\sqrt{\\sigma^2}'} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Dataset"
          value={ds}
          onChange={(v) => {
            setDs(v);
            setLast(v === 'A' ? 14 : 21);
          }}
          options={[
            { value: 'A', label: 'A: 10, 12, 14' },
            { value: 'B', label: 'B: 5, 10, 21' },
          ]}
        />
        <Segmented
          label="Denominator"
          value={String(ddof) as '0' | '1'}
          onChange={(v) => setDdof(Number(v) as Ddof)}
          options={[
            { value: '0', label: '÷ N  (population)', title: 'The lecture formula' },
            { value: '1', label: '÷ (n − 1)  (sample)', title: 'Sample variance, as pandas .var()' },
          ]}
        />
      </div>
      <Cols ratio="wide-left">
        <Panel title="The geometry of variance">
          <Say className="mb-2 !text-[clamp(17px,min(1.7vw,3vh),26px)]">
            Dataset {ds}: {values[0]}, {values[1]}, <Scrub value={last} min={0} max={26} onChange={setLast} label="Last value" className="text-blue" testId="s24-last" />
            {modified && <span className="text-muted"> (lecture: {base[2]})</span>}. Drag it: its square grows with the square of its distance from μ.
          </Say>
          <VarianceSquares values={values} stage={step} ddof={ddof} domain={[0, 26]} label="Squared deviations drawn as squares" />
        </Panel>
        <EvolvingFormula values={values} stage={step} ddof={ddof} />
      </Cols>
      {ddof === 1 && (
        <Note title="Added · why divide by n − 1 for a sample?">
          With a sample we measure deviations from the sample mean x̄, which is by construction the point closest to the data (it minimises
          Σ(x − c)²). So Σ(x − x̄)² is systematically a little smaller than Σ(x − μ)² would be, and dividing by n − 1 instead of n
          exactly removes that bias on average. pandas' <code>.var()</code> and <code>.std()</code> divide by n − 1 by default; NumPy's{' '}
          <code>np.var</code> divides by N unless <code>ddof=1</code>.
        </Note>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────── 25 Activity – Measures of Variation
export function S25() {
  return (
    <div className="space-y-4">
      <Cols>
        <div className="space-y-3">
          <div className="tabular grid grid-cols-2 gap-3 text-[1.1em]">
            <div>
              <Kicker>Dataset A</Kicker>
              <b className="text-blue">10, 12, 14</b>
            </div>
            <div>
              <Kicker>Dataset B</Kicker>
              <b className="text-cyan">5, 10, 21</b>
            </div>
          </div>
          <div className="text-[0.8em] font-semibold uppercase tracking-wider text-muted">Task for Students</div>
          <TaskList
            tasks={['Calculate the Range for each dataset.', 'Calculate the Mean for each dataset.', 'Compute the Variance.', 'Compute the Standard Deviation.', 'Which dataset is more spread out?']}
          />
        </div>
        <Panel title="Both datasets on one scale">
          <DotPlot rows={[{ label: 'A', values: A1 }, { label: 'B', values: B1, color: C.cyan }]} domain={[0, 25]} label="Datasets A and B" />
        </Panel>
      </Cols>
      <Checkpoint
        question="Predict first: which dataset has the larger standard deviation?"
        options={['A', 'B', 'They are equal — same mean', 'Cannot tell without computing']}
        correct={1}
        explanation="B: its values are much further from the shared mean of 12. A shared mean says nothing about spread."
      />
    </div>
  );
}

function WorkedVariance({ values, name }: { values: number[]; name: string }) {
  const { step } = useSlide();
  const mu = mean(values);
  const devs = deviations(values);
  const ss = sumOfSquares(values);
  const v = variance(values, POPULATION);
  const stage = [0, 1, 2, 4, 6][step];
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Kicker>
          {name}: {values.join(', ')}
        </Kicker>
        <Step at={1}>
          <WorkLine label="Mean">
            <Tex>{`\\frac{${values.join(' + ')}}{3} = \\frac{${values.reduce((a, b) => a + b, 0)}}{3} = ${tex(mu)}`}</Tex>
          </WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Range">
            {Math.max(...values)} − {Math.min(...values)} = <b>{range(values)}</b>
          </WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Variance">
            <div className="space-y-0.5">
              {values.map((x, i) => (
                <div key={i}>
                  <Tex>{`(${x} - ${tex(mu)})^2 = ${tex(devs[i] ** 2)}`}</Tex>
                </div>
              ))}
              <Tex>{`\\frac{${devs.map((d) => tex(d * d)).join(' + ')}}{3} = \\frac{${tex(ss)}}{3} \\approx ${v.toFixed(2)}`}</Tex>
            </div>
          </WorkLine>
        </Step>
        <Step at={4}>
          <WorkLine label="Std. deviation" tone="answer">
            <Tex>{`\\sqrt{${v.toFixed(2)}} \\approx ${Math.sqrt(v).toFixed(2)}`}</Tex>
          </WorkLine>
          <p className="mt-2 text-[0.8em] text-muted">
            <Badge kind="added" /> If these 3 values were a sample: s² = {fmt(ss)} ÷ 2 = {fmt(variance(values, SAMPLE))}, s ≈ {std(values, SAMPLE).toFixed(2)}.
          </p>
        </Step>
      </div>
      <Panel title="The same calculation, drawn">
        <VarianceSquares values={values} stage={stage} ddof={POPULATION} domain={[0, 26]} label={`Variance squares for ${name}`} />
      </Panel>
    </Cols>
  );
}

export const S26 = () => <WorkedVariance values={A1} name="Dataset A" />;
export const S27 = () => <WorkedVariance values={B1} name="Dataset B" />;

// ─────────────────────────────── 28 Why variance and standard deviation matter in ML
const RES_X = [1, 2, 3, 4, 5, 6];
const RES_Y = [2.1, 2.9, 4.6, 4.4, 6.1, 6.4];

function ResidualSquares() {
  const { resetKey } = useSlide();
  const fit = linearFit(RES_X, RES_Y);
  const [slope, setSlope] = useState(0.3);
  useEffect(() => setSlope(0.3), [resetKey]);
  const mx = mean(RES_X);
  const my = mean(RES_Y);
  const pred = RES_X.map((x) => my + slope * (x - mx));
  const mse = meanSquaredError(RES_Y, pred);
  return (
    <div className="space-y-2">
      <Chart label="Regression residuals drawn as squares" height={(w) => Math.min(260, Math.max(200, w * 0.55))}>
        {(w, h) => {
          const unit = Math.min((w - 40) / 7.5, (h - 30) / 7.5);
          const x = linearScale([0, (w - 40) / unit], [30, w - 10]);
          const y = linearScale([0, (h - 30) / unit], [h - 20, 10]);
          return (
            <g>
              <line x1={30} x2={w - 10} y1={y(0)} y2={y(0)} stroke={C.muted} />
              <line x1={x(0)} x2={x(0)} y1={10} y2={h - 20} stroke={C.muted} />
              {RES_X.map((xv, i) => {
                const r = RES_Y[i] - pred[i];
                const s = Math.abs(r) * unit;
                const top = Math.max(RES_Y[i], pred[i]);
                return <rect key={i} x={x(xv)} y={y(top)} width={s} height={s} fill={C.neg} fillOpacity={0.18} stroke={C.neg} strokeOpacity={0.7} />;
              })}
              <line x1={x(0)} y1={y(my - slope * mx)} x2={x(7.2)} y2={y(my + slope * (7.2 - mx))} stroke={C.yellow} strokeWidth={2.5} />
              {RES_X.map((xv, i) => (
                <g key={`p${i}`}>
                  <line x1={x(xv)} x2={x(xv)} y1={y(RES_Y[i])} y2={y(pred[i])} stroke={C.neg} strokeWidth={1.5} />
                  <circle cx={x(xv)} cy={y(RES_Y[i])} r={5.5} fill={C.blue} stroke={C.canvas} strokeWidth={1.5} />
                </g>
              ))}
            </g>
          );
        }}
      </Chart>
      <div className="flex flex-wrap items-end gap-2">
        <span className="flex-1 font-medium">
          Predict with a line of slope <Scrub value={slope} min={-0.5} max={1.6} step={0.01} onChange={setSlope} format={(v) => v.toFixed(2)} label="Slope" />
        </span>
        <Button size="sm" onClick={() => setSlope(Number(fit.slope.toFixed(2)))}>Least squares</Button>
        <Button size="sm" variant="ghost" onClick={() => setSlope(0)}>Predict the mean</Button>
      </div>
      <p className="tabular text-[0.9em]">
        MSE = mean area of the orange squares = <b className="text-neg">{fmt(mse, 3)}</b>
        {Math.abs(slope) < 1e-9 && <span className="text-muted"> = population variance of y ({fmt(variance(RES_Y), 3)})</span>}
        {Math.abs(slope - fit.slope) < 0.006 && <span className="text-pos"> · minimum (slope = Cov/Var = {fmt(covariance(RES_X, RES_Y) / variance(RES_X), 3)})</span>}
      </p>
    </div>
  );
}

export function S28() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Panel title="Data preprocessing" tone="focus">
          <p className="text-[0.9em]">Normalization / standardization (z-score)</p>
          <Tex display>{'z = \\frac{x-\\mu}{\\sigma}'}</Tex>
          <p className="text-[0.82em] text-muted">Puts features in different units on one scale — needed by gradient descent, k-NN, SVMs, PCA.</p>
        </Panel>
        <Panel title="Mean squared error (MSE)" tone="focus">
          <Tex display>{'\\text{MSE} = \\frac{1}{n}\\sum (y_i - \\hat y_i)^2'}</Tex>
          <p className="text-[0.82em] text-muted">The same averaged squares as variance — measured around the predictions instead of around the mean.</p>
        </Panel>
        <Panel title="Outliers detection" tone="focus">
          <p className="text-[0.9em]">How many σ is a value from μ?</p>
          <Tex display>{'|z| > 3 \\;\\Rightarrow\\; \\text{unusual}'}</Tex>
          <p className="text-[0.82em] text-muted">A flag to investigate, not proof of an error (slide 45).</p>
        </Panel>
      </div>
      <Panel title="MSE is variance around a model" badge={<><Badge kind="added" /><Badge kind="illustrative" /></>}>
        <Cols ratio="wide-left">
          <ResidualSquares />
          <Bullets
            className="text-[0.9em]"
            items={[
              'Each orange square has side = residual y − ŷ. MSE is their average area.',
              'Predict the mean for everyone (slope 0): MSE equals the variance of y. That is the baseline every model must beat.',
              'Least squares tilts the line to make the total area as small as possible.',
            ]}
          />
        </Cols>
      </Panel>
    </div>
  );
}

// ───────────────────────────────────────────── 29 Why Standard Deviation Matters in ML
export function S29() {
  const { step } = useSlide();
  const sa = std(A1);
  const sb = std(B1);
  return (
    <Cols ratio="wide-left">
      <Panel title="Datasets A and B from the activity">
        <DotPlot
          rows={[{ label: 'A', values: A1 }, { label: 'B', values: B1, color: C.cyan }]}
          domain={[0, 25]}
          markers={[{ value: 12, label: 'μ = 12', color: C.yellow, row: 0 }, { value: 12, label: 'μ = 12', color: C.yellow, row: 1 }]}
          bands={
            step >= 1
              ? [
                  { from: 12 - sa, to: 12 + sa, color: C.yellow, row: 0, label: `±σ = ±${sa.toFixed(2)}` },
                  { from: 12 - sb, to: 12 + sb, color: C.yellow, row: 1, label: `±σ = ±${sb.toFixed(2)}` },
                ]
              : []
          }
          label="Datasets A and B with plus-minus one standard deviation"
        />
      </Panel>
      <div className="space-y-3">
        <p className="text-[1.1em]">
          If you were building a model, <b>which dataset is more predictable?</b>
        </p>
        <Step at={1}>
          <WorkLine label="Answer" tone="answer">
            <b className="text-[1.15em] text-yellow">Dataset A</b>
          </WorkLine>
          <Note title="Added · the precise reason">
            Predict the mean (12) for every value. The root-mean-square error of that guess is exactly σ: {sa.toFixed(2)} for A versus {sb.toFixed(2)} for B.
            Smaller σ — smaller typical error.
          </Note>
        </Step>
      </div>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────────────── 30 Example
export function S30() {
  return (
    <Cols>
      <div className="space-y-3">
        <div className="tabular grid grid-cols-2 gap-3 text-[1.1em]">
          <div>
            <Kicker>Dataset A</Kicker>
            <b className="text-blue">8, 10, 12</b>
          </div>
          <div>
            <Kicker>Dataset B</Kicker>
            <b className="text-cyan">2, 10, 18</b>
          </div>
        </div>
        <TaskList tasks={['Calculate the Mean for both datasets.', 'Calculate the Range.', 'Which dataset is more spread out? Why?']} />
      </div>
      <Panel title="The data">
        <DotPlot rows={[{ label: 'A', values: A2 }, { label: 'B', values: B2, color: C.cyan }]} domain={[0, 20]} label="Datasets A and B" />
      </Panel>
    </Cols>
  );
}

function RangeSolution({ values, name, color, spread }: { values: number[]; name: string; color: string; spread: string }) {
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Kicker>
          {name}: {values.join(', ')}
        </Kicker>
        <Step at={1}>
          <WorkLine label="Mean">
            <Tex>{`\\frac{(${values.join(' + ')})}{3} = \\frac{30}{3} = 10`}</Tex>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.8em] text-muted">
              <Badge kind="correction" />
              The PDF writes “{values.join(' + ')} ÷ 3”. By order of operations that equals {values[0] + values[1] + values[2] / 3}; parentheses are required.
            </div>
          </WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Range">
            {Math.max(...values)} − {Math.min(...values)} = <b>{range(values)}</b>
          </WorkLine>
          <p className="mt-2">{spread}</p>
        </Step>
      </div>
      <Panel title="Distance from the mean">
        <DotPlot rows={[{ values, color }]} domain={[0, 20]} markers={[{ value: 10, label: 'μ = 10', color: C.yellow }]} label={`${name} with its mean`} />
      </Panel>
    </Cols>
  );
}

export const S31 = () => (
  <RangeSolution values={A2} name="Dataset A" color={C.blue} spread="The values are close to the mean, so the data is tightly clustered." />
);
export const S32 = () => (
  <div className="space-y-2">
    <RangeSolution values={B2} name="Dataset B" color={C.cyan} spread="The mean is the same as Dataset A. The values are far from the mean, so the data is more spread out." />
  </div>
);

// ───────────────────────────────────────────────────────────────── 33 Conclusion
export function S33() {
  const sa = std(A2);
  const sb = std(B2);
  return (
    <Cols ratio="wide-right">
      <Bullets
        items={[
          'Both datasets have the same mean (10).',
          'Dataset B has a much larger spread.',
          'Therefore, Dataset B has a larger standard deviation.',
          <>
            The mean tells us the <b className="text-yellow">center</b>, but the standard deviation tells us <b className="text-yellow">how spread out</b> the data is.
          </>,
        ]}
      />
      <Panel title="Same centre, different spread" badge={<Badge kind="live">σ computed live (÷N)</Badge>}>
        <DotPlot
          rows={[{ label: 'A', values: A2 }, { label: 'B', values: B2, color: C.cyan }]}
          domain={[0, 20]}
          markers={[{ value: 10, label: 'μ = 10', color: C.yellow, row: 0 }, { value: 10, label: 'μ = 10', color: C.yellow, row: 1 }]}
          bands={[
            { from: 10 - sa, to: 10 + sa, color: C.yellow, row: 0, label: `σ(A) ≈ ${sa.toFixed(2)}` },
            { from: 10 - sb, to: 10 + sb, color: C.yellow, row: 1, label: `σ(B) ≈ ${sb.toFixed(2)}` },
          ]}
          label="Both datasets with their standard deviations"
        />
        <p className="tabular mt-2 text-[0.85em] text-muted">
          A: σ² = (4 + 0 + 4)/3 = {fmt(variance(A2), 2)} · B: σ² = (64 + 0 + 64)/3 = {fmt(variance(B2), 2)}
        </p>
      </Panel>
    </Cols>
  );
}
