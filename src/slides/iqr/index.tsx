/** Section D · IQR and outliers — slides 34–44. */
import { useEffect, useState } from 'react';
import { BoxplotBuilder } from '../../components/mathematics/BoxplotBuilder';
import { DotPlot } from '../../components/mathematics/DotPlot';
import { Tex } from '../../components/mathematics/Tex';
import { C } from '../../components/mathematics/primitives';
import { useSlide } from '../../components/presentation/SlideContext';
import { Badge } from '../../components/ui/Badge';
import { Segmented } from '../../components/ui/Button';
import { Note, Panel } from '../../components/ui/Panel';
import { Step } from '../../components/ui/Reveal';
import { Scrub } from '../../components/ui/Scrub';
import { fmt } from '../../lib/format';
import { boxplotSummary, iqr, mean, median, quartiles, range, std, type QuartileMethod } from '../../lib/statistics';
import { Bullets, Cols, Formula, Kicker, Say, Source, TaskList, WorkLine } from '../common';

const EX = [5, 10, 15, 20, 25, 30, 100];
const ACT = [2, 4, 6, 8, 10, 12, 50];

// ─────────────────────────────────────────────────────────── 34 Interquartile Range
export function S34() {
  const { resetKey } = useSlide();
  const [method, setMethod] = useState<QuartileMethod>('tukey');
  useEffect(() => setMethod('tukey'), [resetKey]);
  return (
    <div className="space-y-4">
      <Cols ratio="wide-right">
        <div className="space-y-3">
          <Formula tex={'IQR = Q_3 - Q_1'} />
          <Bullets items={['Measures middle 50%', 'Robust to outliers']} />
          <p className="text-[0.9em] text-muted">Quartiles cut the sorted data into four groups with equal counts; Q2 is the median.</p>
        </div>
        <Panel title="The middle 50% of the lecture example">
          <BoxplotBuilder values={EX} stage={5} method={method} domain={[0, 105]} label="Quartiles and IQR of 5, 10, 15, 20, 25, 30, 100" />
          <div className="mt-2">
            <Segmented
              label="Quartile convention"
              value={method}
              onChange={setMethod}
              options={[
                { value: 'tukey', label: 'Lecture: median of halves' },
                { value: 'linear', label: 'NumPy / pandas default' },
              ]}
            />
          </div>
        </Panel>
      </Cols>
      <Panel title="Two conventions, two answers" badge={<Badge kind="added" />}>
        <div className="overflow-x-auto">
          <table className="tabular w-full min-w-[520px] text-[0.88em]">
            <thead className="text-muted">
              <tr>
                <th className="py-1 text-left font-medium">Dataset</th>
                <th className="text-left font-medium">Method</th>
                <th className="text-right font-medium">Q1</th>
                <th className="text-right font-medium">Q3</th>
                <th className="text-right font-medium">IQR</th>
              </tr>
            </thead>
            <tbody>
              {[EX, ACT].flatMap((d) =>
                (['tukey', 'linear'] as const).map((m) => {
                  const q = quartiles(d, m);
                  return (
                    <tr key={`${d[0]}${m}`} className="border-t border-line">
                      <td className="py-1">{d.join(', ')}</td>
                      <td>{m === 'tukey' ? 'median of each half (lecture)' : 'linear interpolation, np.percentile'}</td>
                      <td className="text-right">{fmt(q.q1, 2)}</td>
                      <td className="text-right">{fmt(q.q3, 2)}</td>
                      <td className="text-right font-semibold">{fmt(q.q3 - q.q1, 2)}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[0.85em] text-muted">
          Both are legitimate. The lecture's hand method excludes the median from both halves when n is odd. NumPy places quartile p at position p·(n − 1) of the sorted data and interpolates. On large datasets the difference becomes negligible; on 7 values it does not. Always state the convention.
        </p>
      </Panel>
      <Source href="https://www.geeksforgeeks.org/maths/interquartile-range/" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────── 35–36 Example
export function S35() {
  const { step } = useSlide();
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Kicker>Dataset: 5, 10, 15, 20, 25, 30, 100</Kicker>
        <Step at={1}>
          <WorkLine label="Step 1 · Order">(Already ordered)</WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Step 2 · Q2">Median = <b className="text-cyan">20</b> <span className="text-muted">(4th of 7 values)</span></WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Step 3 · Q1" tone="answer">
            Lower half: 5, 10, 15 → Q1 = <b className="text-yellow">10</b>
          </WorkLine>
        </Step>
      </div>
      <Panel title="Sorted observations">
        <BoxplotBuilder values={EX} stage={step} domain={[0, 105]} label="Finding the median and Q1" />
      </Panel>
    </Cols>
  );
}

export function S36() {
  const { step } = useSlide();
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Kicker>Continuing: Q1 = 10, Q2 = 20</Kicker>
        <Step at={1}>
          <WorkLine label="Step 4 · Q3">Upper half: 25, 30, 100 → Q3 = <b className="text-yellow">30</b></WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Step 5 · IQR" tone="answer">
            <Tex>{'IQR = 30 - 10 = 20'}</Tex>
          </WorkLine>
        </Step>
      </div>
      <Panel title="Upper half and the box">
        <BoxplotBuilder values={EX} stage={[3, 4, 5][step]} domain={[0, 105]} label="Finding Q3 and the IQR" />
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────── 37 Important Observation
export function S37() {
  const { resetKey } = useSlide();
  const [top, setTop] = useState(100);
  useEffect(() => setTop(100), [resetKey]);
  const data = [5, 10, 15, 20, 25, 30, top];
  const r = range(data);
  const q = iqr(data);
  const maxR = 995;
  return (
    <div className="space-y-4">
      <Cols>
        <div className="space-y-3">
          <p className="text-[1.05em]">
            Even though <b className="text-neg">100</b> is a large outlier, the IQR remains relatively stable.
          </p>
          <div className="tabular space-y-1">
            <div>Compare:</div>
            <div>Range = {top} − 5 = <b>{r}</b></div>
            <div>IQR = <b className="text-yellow">{q}</b></div>
          </div>
          <p className="font-semibold">IQR is much more robust to outliers.</p>
        </div>
        <Panel title="Stretch the largest value">
          <Say className="!text-[clamp(18px,min(1.9vw,3.4vh),28px)]">
            Make the largest value <Scrub value={top} min={30} max={1000} step={5} perPx={3} onChange={setTop} label="Largest value" className="text-neg" testId="s37-top" />.
          </Say>
          <div className="mt-3 space-y-2 text-[0.9em]">
            {[
              ['Range', r, C.neg],
              ['IQR', q, C.yellow],
            ].map(([name, v, col]) => (
              <div key={name as string} className="grid grid-cols-[4em_minmax(0,1fr)_4em] items-center gap-2">
                <span>{name}</span>
                <div className="h-7 overflow-hidden rounded-lg border-2 border-bd bg-panel-2">
                  <div className="h-full transition-[width] duration-300" style={{ width: `${Math.max(0.6, ((v as number) / maxR) * 100)}%`, background: col as string }} />
                </div>
                <span className="tabular text-right font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.8em] text-muted">Bars share one scale (0 – {maxR}).</p>
        </Panel>
      </Cols>
      <BoxplotBuilder values={data} stage={5} label="The box does not move while the largest value grows" />
    </div>
  );
}

// ──────────────────────────────────────────────── 38 Why is IQR Important in ML?
export function S38() {
  const { resetKey } = useSlide();
  const [scaler, setScaler] = useState<'standard' | 'robust'>('standard');
  useEffect(() => setScaler('standard'), [resetKey]);
  const mu = mean(ACT);
  const sd = std(ACT);
  const med = median(ACT);
  const q = iqr(ACT);
  const scaled = ACT.map((v) => (scaler === 'standard' ? (v - mu) / sd : (v - med) / q));
  const normal = scaled.slice(0, 6);
  return (
    <div className="space-y-4">
      <Cols>
        <div>
          <Kicker>We use IQR for</Kicker>
          <Bullets items={['Detecting outliers', 'Data cleaning', 'Boxplots', 'Robust scaling']} />
        </div>
        <Panel title="Anatomy of a boxplot">
          <BoxplotBuilder values={ACT} stage={8} label="Complete boxplot of 2, 4, 6, 8, 10, 12, 50" />
          <p className="text-[0.8em] text-muted">Box = Q1 to Q3 · line = median · whiskers reach the most extreme values inside the fences · orange = flagged.</p>
        </Panel>
      </Cols>
      <Panel title="Robust scaling vs standardisation" badge={<Badge kind="added" />}>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Segmented
            label="Scaler"
            value={scaler}
            onChange={setScaler}
            options={[
              { value: 'standard', label: 'Standard: (x − μ) / σ' },
              { value: 'robust', label: 'Robust: (x − median) / IQR' },
            ]}
          />
          <span className="text-[0.8em] text-muted">scikit-learn: StandardScaler vs RobustScaler</span>
        </div>
        <DotPlot
          rows={[{ values: scaled, colors: ACT.map((v) => (v === 50 ? C.neg : undefined)) }]}
          domain={[-1.5, 6]}
          format={(v) => fmt(v, 2)}
          label="Scaled values of 2, 4, 6, 8, 10, 12, 50"
        />
        <p className="tabular text-[0.88em]">
          The six ordinary values now span <b className="text-yellow">{fmt(Math.max(...normal) - Math.min(...normal), 2)}</b> units.{' '}
          {scaler === 'standard'
            ? 'The outlier inflates σ, so the ordinary values are squeezed together.'
            : 'Median and IQR ignore the outlier, so the ordinary values keep their spread.'}
        </p>
      </Panel>
    </div>
  );
}

// ────────────────────────────────────────────────────── 39 Outlier Detection Rule
export function S39() {
  const { resetKey } = useSlide();
  const [ds, setDs] = useState<'ex' | 'act'>('ex');
  const [top, setTop] = useState(100);
  const [k, setK] = useState<'1.5' | '3'>('1.5');
  useEffect(() => {
    setDs('ex');
    setTop(100);
    setK('1.5');
  }, [resetKey]);
  const base = ds === 'ex' ? EX : ACT;
  const data = [...base.slice(0, -1), top];
  const b = boxplotSummary(data, 'tukey', Number(k));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Formula label="Lower Bound" tex={'Q_1 - 1.5 \\times IQR'} />
        <Formula label="Upper Bound" tex={'Q_3 + 1.5 \\times IQR'} />
      </div>
      <p>Any value outside this range is considered an outlier.</p>
      <Panel title="Interactive boxplot">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Segmented
            label="Dataset"
            value={ds}
            onChange={(v) => {
              setDs(v);
              setTop(v === 'ex' ? 100 : 50);
            }}
            options={[
              { value: 'ex', label: '5, 10, …, 30, 100' },
              { value: 'act', label: '2, 4, …, 12, 50' },
            ]}
          />
          <Segmented
            label="Fence multiplier"
            value={k}
            onChange={setK}
            options={[
              { value: '1.5', label: 'k = 1.5 (lecture)' },
              { value: '3', label: 'k = 3 (“far out”)' },
            ]}
          />
        </div>
        <Say className="mb-1 !text-[clamp(17px,min(1.8vw,3.2vh),26px)]">
          The extreme value is <Scrub value={top} min={base[base.length - 2]} max={ds === 'ex' ? 150 : 75} perPx={0.4} onChange={setTop} label="Extreme value" className="text-neg" testId="s39-top" />. Drag it across the dashed fence.
        </Say>
        <BoxplotBuilder values={data} stage={8} k={Number(k)} domain={ds === 'ex' ? [-25, 160] : [-12, 80]} label="Boxplot with outlier fences" />
        <p className="tabular mt-1 text-[0.88em]">
          Q1 = {fmt(b.q1)}, Q3 = {fmt(b.q3)}, IQR = {fmt(b.iqr)} → fences [{fmt(b.fences.lower)}, {fmt(b.fences.upper)}]. {top} is{' '}
          {b.outliers.includes(top) ? <b className="text-neg">flagged</b> : <b className="text-pos">not flagged</b>}.
        </p>
      </Panel>
      <Note title="Added · a flag is not a verdict">
        The rule flags values that are unusual relative to the middle of the data. A flagged value may be a typing error, a sensor fault — or a genuine rare case such as a fraud transaction, which is exactly what a model might need to learn. Investigate before deleting.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── 40 IQR Activity
export function S40() {
  return (
    <Cols>
      <div className="space-y-3">
        <Kicker>Dataset: 2, 4, 6, 8, 10, 12, 50</Kicker>
        <TaskList
          tasks={[
            'Find the Median (Q2).',
            'Find Q1.',
            'Find Q3.',
            'Calculate the Interquartile Range (IQR).',
            'Using the 1.5 × IQR rule, determine the lower bound and the upper bound.',
            'Is 50 an outlier? Explain why.',
          ]}
        />
      </div>
      <Panel title="The data">
        <BoxplotBuilder values={ACT} stage={0} domain={[-12, 56]} label="Activity dataset" />
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────────── 41–44 Solutions
function ActivityPlot({ stage }: { stage: number }) {
  return (
    <Panel title="Building the boxplot">
      <BoxplotBuilder values={ACT} stage={stage} domain={[-12, 56]} label="Activity dataset boxplot" />
    </Panel>
  );
}

export function S41() {
  const { step } = useSlide();
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Step 1 · Order">(Already ordered)</WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Step 2 · Q2" tone="answer">Median = <b className="text-cyan">8</b></WorkLine>
        </Step>
      </div>
      <ActivityPlot stage={step} />
    </Cols>
  );
}

export function S42() {
  const { step } = useSlide();
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Step 3 · Q1">Lower half: 2, 4, 6 → Q1 = <b className="text-yellow">4</b></WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Step 4 · Q3">Upper half: 10, 12, 50 → Q3 = <b className="text-yellow">12</b></WorkLine>
        </Step>
      </div>
      <ActivityPlot stage={[2, 3, 4][step]} />
    </Cols>
  );
}

export function S43() {
  const { step } = useSlide();
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Step 5 · IQR" tone="answer">
            <Tex>{'IQR = Q_3 - Q_1'}</Tex>
            <div className="mt-1">
              <Tex>{'IQR = 12 - 4 = 8'}</Tex>
            </div>
          </WorkLine>
        </Step>
      </div>
      <ActivityPlot stage={[4, 5][step]} />
    </Cols>
  );
}

export function S44() {
  const { step, resetKey } = useSlide();
  const [top, setTop] = useState(50);
  useEffect(() => setTop(50), [resetKey]);
  const data = [2, 4, 6, 8, 10, 12, top];
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Step 6 · Lower">
            <Tex>{'Q_1 - 1.5 \\times IQR = 4 - 1.5 \\times 8'}</Tex>
            <div className="mt-1">
              <Tex>{'4 - 12 = -8'}</Tex>
            </div>
          </WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Step 6 · Upper">
            <Tex>{'Q_3 + 1.5 \\times IQR = 12 + 12 = 24'}</Tex>
          </WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Step 7 · Check 50" tone="answer">
            Since <Tex>{'50 > 24'}</Tex>, <b className="text-neg">50 is an outlier</b>.
          </WorkLine>
        </Step>
      </div>
      <Panel title="Building the boxplot">
        <BoxplotBuilder values={data} stage={[5, 6, 7, 8][step]} domain={[-12, 56]} label="Activity dataset boxplot with fences" />
        {step >= 3 && (
          <div className="mt-2">
            <Say className="!text-[clamp(17px,min(1.8vw,3.2vh),26px)]">
              Test the rule: the last value is <Scrub value={top} min={12} max={55} perPx={0.2} onChange={setTop} label="Last value" className="text-neg" testId="s44-top" />.
            </Say>
            <p className="text-[0.85em] text-muted">Q1, Q3 and the fences do not change while this value stays the largest; it is flagged only above 24.</p>
          </div>
        )}
      </Panel>
    </Cols>
  );
}
