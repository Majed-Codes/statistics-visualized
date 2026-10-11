/** Section B · Descriptive statistics — slides 15–23. */
import { useEffect, useMemo, useState } from 'react';
import { BalanceBeam, type Pivot } from '../../components/mathematics/BalanceBeam';
import { DotPlot } from '../../components/mathematics/DotPlot';
import { Tex } from '../../components/mathematics/Tex';
import { C } from '../../components/mathematics/primitives';
import { useSlide } from '../../components/presentation/SlideContext';
import { Badge } from '../../components/ui/Badge';
import { Button, Segmented } from '../../components/ui/Button';
import { Checkpoint } from '../../components/ui/Checkpoint';
import { Note, Panel } from '../../components/ui/Panel';
import { Step } from '../../components/ui/Reveal';
import { Scrub } from '../../components/ui/Scrub';
import { COLUMNS } from '../../data/iris';
import { fmt, fmtInt } from '../../lib/format';
import { frequencies, mean, median, modes, quartiles, sorted, std, SAMPLE, sum } from '../../lib/statistics';
import { Bullets, Cols, Formula, Kicker, Lead, Say, Source, TaskList, WorkLine } from '../common';

// ────────────────────────────────────────────────────────── 15 Descriptive Analysis
export function S15() {
  // The first eight flowers of the real Iris dataset (sepal length, cm).
  const data = COLUMNS.sepal_length.slice(0, 8);
  const q = quartiles(data, 'linear');
  return (
    <div className="space-y-4">
      <Cols ratio="wide-right">
        <div className="space-y-3">
          <Lead>
            Descriptive analysis answers: <b className="text-yellow">“What happened?”</b>
          </Lead>
          <Bullets items={['Tables', 'Plots', 'Summary statistics']} />
          <Note>
            The same eight measurements — the first eight flowers of the Iris dataset, sepal length in cm — shown in all three forms.
          </Note>
        </div>
        <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)]">
          <Panel title="Table">
            <table className="tabular w-full text-[0.85em]">
              <thead>
                <tr className="text-muted">
                  <th className="pr-3 text-left font-medium">flower</th>
                  <th className="text-right font-medium">sepal length</th>
                </tr>
              </thead>
              <tbody>
                {data.map((v, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="pr-3">{i}</td>
                    <td className="text-right text-blue">{v.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <div className="min-w-0 space-y-3">
            <Panel title="Plot">
              <DotPlot rows={[{ values: data }]} domain={[4.3, 5.5]} label="Dot plot of eight sepal lengths" format={(v) => v.toFixed(1)} rowHeight={88} />
            </Panel>
            <Panel title="Summary statistics" badge={<Badge kind="live" />}>
              <div className="tabular grid grid-cols-3 gap-2 text-center text-[0.9em] sm:grid-cols-6">
                {[
                  ['n', String(data.length)],
                  ['mean', fmt(mean(data), 3)],
                  ['median', fmt(median(data), 2)],
                  ['std', fmt(std(data, SAMPLE), 3)],
                  ['min', fmt(Math.min(...data), 1)],
                  ['max', fmt(Math.max(...data), 1)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-line px-1 py-1.5">
                    <div className="text-[0.75em] text-muted">{k}</div>
                    <div className="font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[0.75em] text-muted">Q1 = {fmt(q.q1, 3)}, Q3 = {fmt(q.q3, 3)} (pandas convention); std uses n − 1 like pandas.</p>
            </Panel>
          </div>
        </div>
      </Cols>
      <Panel title="Where descriptive analysis sits" badge={<Badge kind="added" />}>
        <div className="grid gap-2 text-[0.88em] sm:grid-cols-3">
          <div className="rounded-lg border border-yellow/50 p-2">
            <b className="text-yellow">Descriptive</b> — what happened in this data? <span className="text-muted">(today)</span>
          </div>
          <div className="rounded-lg border border-line p-2">
            <b>Inferential</b> — what can we conclude about the population from a sample?
          </div>
          <div className="rounded-lg border border-line p-2">
            <b>Predictive</b> — what will happen for new cases? <span className="text-muted">(the ML models of later units)</span>
          </div>
        </div>
      </Panel>
      <Source href="https://www.geeksforgeeks.org/data-science/descriptive-statistic/" />
    </div>
  );
}

// ─────────────────────────────────────────────── 16 Measures of Central Tendency
export function S16() {
  const { resetKey } = useSlide();
  const [last, setLast] = useState(14);
  useEffect(() => setLast(14), [resetKey]);
  const data = [1, 4, 4, 5, 6, 8, last];
  const md = modes(data);
  const counts = frequencies(sorted(data));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Formula label={<span className="text-yellow">Mean</span>} tex={'\\mu = \\frac{\\sum x}{N}'} />
        <div className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="text-[0.78em] font-semibold uppercase tracking-wider text-cyan">Median</div>
          <p className="mt-1">Middle value</p>
        </div>
        <div className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="text-[0.78em] font-semibold uppercase tracking-wider text-mode">Mode</div>
          <p className="mt-1">Most frequent value</p>
        </div>
      </div>
      <Cols ratio="wide-left">
        <Panel title="Three pictures of “the centre”" badge={<><Badge kind="added" /><Badge kind="illustrative" /></>}>
          <Say className="mb-3 !text-[clamp(18px,min(1.9vw,3.4vh),28px)]">
            Six values sit still. The largest is <Scrub value={last} min={8} max={40} onChange={setLast} label="Largest value" testId="s16-scrub" />. The beam balances at{' '}
            <b className="text-yellow">{fmt(mean(data), 2)}</b>; the middle weight stays at <b className="text-cyan">{fmt(median(data), 1)}</b>.
          </Say>
          <BalanceBeam values={data} format={(v) => fmt(v, 1)} domain={[0, 42]} activeIndex={6} label="Balance beam: mean as balance point, median as middle weight" />
          <div className="mt-3">
            <div className="mb-1 text-[0.8em] text-muted">Mode: the tallest stack</div>
            <div className="flex h-24 items-end gap-1.5" aria-label="Frequency of each value">
              {counts.map((c) => (
                <div key={c.value} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-10 rounded-t"
                    style={{ height: `${c.count * 22}px`, background: md.includes(c.value) ? C.mode : C.line }}
                  />
                  <span className="tabular text-[0.75em] text-muted">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <div className="space-y-3 text-[0.95em]">
          <WorkLine label={<span className="text-yellow">mean</span>}>
            <Tex>{`\\mu = \\frac{${data.join('+')}}{${data.length}} = \\frac{${sum(data)}}{${data.length}} = ${fmt(mean(data), 2)}`}</Tex>
            <p className="mt-1 text-[0.85em] text-muted">The beam balances here: the deviations on each side cancel, Σ(x − μ) = 0.</p>
          </WorkLine>
          <WorkLine label={<span className="text-cyan">median</span>}>
            Sorted, the 4th of 7 values: <b className="text-cyan">{fmt(median(data), 1)}</b>
            <p className="mt-1 text-[0.85em] text-muted">Even count? Average the two middle values.</p>
          </WorkLine>
          <WorkLine label={<span className="text-mode">mode</span>}>
            Most frequent: <b className="text-mode">{md.length ? md.join(', ') : 'none'}</b>
          </WorkLine>
          <Note title="Added · notation">
            With a sample of size n we write <Tex>{'\\bar x = \\tfrac{1}{n}\\sum_{i=1}^{n} x_i'}</Tex>; the lecture's <Tex>{'\\mu'}</Tex> and N refer to a whole population. The arithmetic is identical.
          </Note>
          <Note kind="warn">Drag the largest value: the mean moves with it, the median does not — the median only cares about order.</Note>
        </div>
      </Cols>
    </div>
  );
}

// ───────────────────────────────────────────────────── 17 Question 1 – Balanced Data
const SCORES = [75, 80, 85, 90, 95];

export function S17() {
  return (
    <Cols>
      <div className="space-y-3">
        <Kicker>Dataset: Students' Scores</Kicker>
        <p className="tabular text-[1.4em] font-semibold text-blue">75, 80, 85, 90, 95</p>
        <TaskList
          tasks={[
            'Calculate the Mean.',
            'Find the Median.',
            'Determine the Mode.',
            'Are the Mean and Median close to each other? What does that indicate about the distribution?',
          ]}
        />
      </div>
      <Panel title="The data">
        <DotPlot rows={[{ values: SCORES }]} domain={[70, 100]} label="Five student scores" />
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────────────── 18 Solution
export function S18() {
  const { step } = useSlide();
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Mean">
            <Tex>{`\\frac{75+80+85+90+95}{5} = \\frac{${sum(SCORES)}}{5} = ${mean(SCORES)}`}</Tex>
          </WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Median">Already sorted; the 3rd of 5 values: <b className="text-cyan">{median(SCORES)}</b></WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Mode">None — no value repeats.</WorkLine>
        </Step>
        <Step at={4}>
          <WorkLine label="Meaning" tone="answer">
            Mean ≈ Median → data is balanced, no outliers.
          </WorkLine>
        </Step>
      </div>
      <Panel title="Mean = balance point · median = middle value">
        <BalanceBeam values={SCORES} format={(v) => String(v)} domain={[70, 100]} showMean={step >= 1} showMedian={step >= 2} label="Scores on a balance beam" />
        {step >= 4 && <p className="mt-2 text-[0.88em] text-ink/90">The fulcrum and the middle weight coincide at 85: the deviations −10, −5, 0, +5, +10 are mirror images.</p>}
      </Panel>
    </Cols>
  );
}

// ─────────────────────────────────────────────────── 19 Question 2 – Data with Outlier
const SALARIES = [4000, 4500, 5000, 5500, 100000];

export function S19() {
  return (
    <div className="space-y-4">
      <Cols>
        <div className="space-y-3">
          <Kicker>Dataset: Monthly Salaries</Kicker>
          <p className="tabular text-[1.3em] font-semibold text-blue">4000, 4500, 5000, 5500, 100000</p>
          <TaskList tasks={['Calculate the Mean.', 'Find the Median.', 'Determine the Mode.', 'Which measure best represents the typical salary? Why?']} />
        </div>
        <Panel title="The data">
          <DotPlot rows={[{ values: SALARIES, colors: [undefined, undefined, undefined, undefined, C.neg] }]} domain={[0, 105000]} format={(v) => fmtInt(v)} label="Five monthly salaries" />
        </Panel>
      </Cols>
      <Checkpoint
        question="Before calculating: where will the mean land?"
        options={['Near 5,000, inside the cluster', 'Between 5,500 and 100,000 — pulled towards the outlier', 'At 100,000', 'It cannot be computed']}
        correct={1}
        explanation={<>The mean balances all five values, so the single large salary drags it far right of the cluster — to 23,800. The next slide shows why.</>}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── 20 Solution
export function S20() {
  const { step, resetKey } = useSlide();
  const [extreme, setExtreme] = useState(100000);
  const [pivot, setPivot] = useState<Pivot>('mean');
  const [devs, setDevs] = useState(false);
  useEffect(() => {
    setExtreme(100000);
    setPivot('mean');
    setDevs(false);
  }, [resetKey]);
  const data = useMemo(() => [4000, 4500, 5000, 5500, extreme], [extreme]);
  const mu = mean(data);
  const md = median(data);
  const below = data.filter((v) => v < mu).length;
  const modified = extreme !== 100000;
  return (
    <Cols ratio="wide-left">
      <div className="min-w-0 space-y-3">
        <Say>
          The fifth person earns <Scrub value={extreme} min={6000} max={200000} step={500} onChange={setExtreme} format={fmtInt} perPx={500} label="Fifth salary" className="text-neg" testId="s20-extreme" /> a month.
          {step >= 1 && <> The mean is <b className="text-yellow">{fmtInt(mu)}</b></>}
          {step >= 2 && <>, the median <b className="text-cyan">{fmtInt(md)}</b></>}
          {step >= 1 && '.'}
        </Say>
        <Panel title="Mean versus median">
          <BalanceBeam
            values={data}
            format={(v) => fmtInt(v)}
            domain={[0, Math.max(105000, extreme * 1.05)]}
            showMean={step >= 1}
            showMedian={step >= 2}
            showDeviations={devs && step >= 1}
            pivot={pivot}
            activeIndex={4}
            label="Salaries on a balance beam with mean and median"
          />
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Segmented
                label="Fulcrum position"
                value={pivot}
                onChange={setPivot}
                options={[
                  { value: 'mean', label: 'Fulcrum at mean' },
                  { value: 'median', label: 'Fulcrum at median' },
                ]}
              />
              <Button size="sm" active={devs} onClick={() => setDevs((d) => !d)} disabled={step < 1}>
                Show deviations
              </Button>
            </div>
          </div>
          {step >= 1 && pivot === 'median' && (
            <p className="mt-2 text-[0.85em] text-neg">Placed at the median the beam tips right: the median is not the balance point when the data are skewed.</p>
          )}
        </Panel>
        {modified && (
          <Note kind="warn">
            Dataset modified: the fifth salary is {fmtInt(extreme)}. With the lecture's 100,000 the mean is 23,800. Press Reset slide to restore.
          </Note>
        )}
      </div>
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Mean">
            <Tex>{`\\textstyle\\sum x = ${data.map((v) => fmtInt(v).replace(/,/g, '{,}')).join(' + ')} = ${fmtInt(sum(data)).replace(/,/g, '{,}')}`}</Tex>
            <div className="mt-1.5">
              <Tex>{`\\mu = \\frac{${fmtInt(sum(data)).replace(/,/g, '{,}')}}{5} = ${fmtInt(mu).replace(/,/g, '{,}')}`}</Tex>
            </div>
          </WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Median">
            Middle of the sorted values: <b className="text-cyan">{fmtInt(md)}</b>
          </WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Mode">None — no value repeats.</WorkLine>
        </Step>
        <Step at={4}>
          <WorkLine label="Meaning" tone="answer">
            <ul className="space-y-1">
              <li>Mean affected by outlier.</li>
              <li>
                Median better represents typical value: {below} of 5 people earn less than the mean.
              </li>
              <li>Data is skewed (a long right tail).</li>
            </ul>
          </WorkLine>
          <Note title="Added · why the median is robust">
            Drag the salary: the mean changes by Δ/5 for every Δ added to the top salary; the median does not change at all while that salary stays the largest.
          </Note>
        </Step>
      </div>
    </Cols>
  );
}

// ────────────────────────────────────────────────── 21 Question 3 – Categorical Data
const LANGS = ['Python', 'Python', 'Java', 'Python', 'C++', 'Java'];

function LangChips({ highlight }: { highlight?: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Survey answers">
      {LANGS.map((l, i) => (
        <span
          key={i}
          className={`rounded-full border px-3 py-1 font-mono text-[0.9em] ${highlight === l ? 'border-mode bg-mode/15 text-mode' : 'border-line bg-panel text-ink'}`}
          style={{ transform: `translateY(${[0, 6, -4, 3, -6, 2][i]}px)` }}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

export function S21() {
  return (
    <Cols>
      <div className="space-y-3">
        <Kicker>Dataset: Favorite Programming Language</Kicker>
        <p className="text-[1.15em] font-semibold text-blue">Python, Python, Java, Python, C++, Java</p>
        <TaskList
          tasks={['Can we calculate the Mean? Why or why not?', 'Can we calculate the Median?', 'Determine the Mode.', 'Which measure is most appropriate for this type of data?']}
        />
      </div>
      <Panel title="Six survey answers">
        <div className="py-6">
          <LangChips />
        </div>
        <p className="text-[0.85em] text-muted">No number line: there is nothing to add and no natural order to sort by.</p>
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────────────── 22 Solution
export function S22() {
  const { step, resetKey } = useSlide();
  const [coding, setCoding] = useState<'none' | 'a' | 'b'>('none');
  useEffect(() => setCoding('none'), [resetKey]);
  const freq = frequencies(LANGS);
  const md = modes(LANGS)[0];
  const codes: Record<'a' | 'b', Record<string, number>> = {
    a: { Python: 1, Java: 2, 'C++': 3 },
    b: { Python: 3, Java: 1, 'C++': 2 },
  };
  return (
    <Cols>
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Mean">Not applicable — categories cannot be added or divided.</WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Median">Not applicable — these categories have no order.</WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Mode" tone="answer">
            <b className="text-mode">{md}</b> (appears {freq[0].count} times)
          </WorkLine>
          <p className="mt-2">Mode is appropriate for categorical data.</p>
        </Step>
      </div>
      <div className="space-y-3">
        <Panel title="Frequencies">
          <div className="space-y-2">
            {freq.map((f) => (
              <div key={f.value} className="grid grid-cols-[4.5em_minmax(0,1fr)_2em] items-center gap-2">
                <span className="font-mono text-[0.9em]">{f.value}</span>
                <div className="h-6 rounded" style={{ width: `${(f.count / 3) * 100}%`, background: step >= 3 && f.value === md ? C.mode : C.line }} />
                <span className="tabular text-muted">{f.count}</span>
              </div>
            ))}
          </div>
        </Panel>
        {step >= 3 && (
          <Panel title="The encoded-label trap" badge={<Badge kind="added" />}>
            <Segmented
              label="Encoding"
              value={coding}
              onChange={setCoding}
              options={[
                { value: 'none', label: 'Labels' },
                { value: 'a', label: 'Python=1, Java=2, C++=3' },
                { value: 'b', label: 'Python=3, Java=1, C++=2' },
              ]}
            />
            {coding !== 'none' && (
              <p className="tabular mt-2 text-[0.9em]">
                Codes: {LANGS.map((l) => codes[coding][l]).join(', ')} → “mean” ={' '}
                <b className="text-yellow">{fmt(mean(LANGS.map((l) => codes[coding][l])), 2)}</b>. A different, equally valid encoding gives a different
                “mean”, so the number means nothing. The original notebook makes this mistake by averaging the species codes 0/1/2.
              </p>
            )}
          </Panel>
        )}
      </div>
    </Cols>
  );
}

// ──────────────────────────────────────────── 23 When to Use Mean, Median, and Mode
const TABLE: [string, string, string, string][] = [
  ['Mean', 'When data is symmetric and balanced', 'Yes', 'No'],
  ['Median', 'When data has outliers or is skewed', 'No (less sensitive)', 'No'],
  ['Mode', 'When data is categorical or to find the most frequent value', 'No', 'Yes'],
];

export function S23() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-left text-[0.92em]">
          <thead className="bg-panel-2 text-[0.85em] text-muted">
            <tr>
              <th className="px-3 py-2">Measure</th>
              <th className="px-3 py-2">When to Use</th>
              <th className="px-3 py-2">Sensitive to Outliers?</th>
              <th className="px-3 py-2">Works with Categorical Data?</th>
            </tr>
          </thead>
          <tbody>
            {TABLE.map(([m, w, s, c], i) => (
              <tr key={m} className="border-t border-line">
                <td className="px-3 py-2 font-semibold" style={{ color: [C.yellow, C.cyan, C.mode][i] }}>{m}</td>
                <td className="px-3 py-2">{w}</td>
                <td className="px-3 py-2">{s}</td>
                <td className="px-3 py-2">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Checkpoint
          question="Riyadh apartment prices are strongly right-skewed by a few luxury units. Which measure should a market report use for the “typical” price?"
          options={['Mean', 'Median', 'Mode', 'Range']}
          correct={1}
          explanation="Median: luxury outliers pull the mean upwards, exactly as the 100,000 salary did."
        />
        <Checkpoint
          question="A fraud model's input column records the payment channel (card, wallet, bank transfer). Which summary is meaningful?"
          options={['Mean channel', 'Median channel', 'Most frequent channel (mode)', 'Standard deviation of channel']}
          correct={2}
          explanation="The mode. Payment channel is nominal, so only counts and the most frequent category make sense."
        />
      </div>
      <Note>
        The table's “No” for the median with categorical data refers to nominal categories. For ordinal data, such as satisfaction 1–5, a median is defined because the categories are ordered.
      </Note>
    </div>
  );
}
