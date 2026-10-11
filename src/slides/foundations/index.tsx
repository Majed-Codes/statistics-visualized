/** Section A · Foundations — slides 1–14. */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Histogram } from '../../components/mathematics/Histogram';
import { METHOD_LABEL, PopulationSampler } from '../../components/mathematics/PopulationSampler';
import { C, HALO, Svg } from '../../components/mathematics/primitives';
import { Tex } from '../../components/mathematics/Tex';
import { useLectureState } from '../../components/presentation/LectureState';
import { useSlide } from '../../components/presentation/SlideContext';
import { navigate, slideHash } from '../../app/router';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Note, Panel } from '../../components/ui/Panel';
import { RevealBox, Step } from '../../components/ui/Reveal';
import { IconPause, IconPlay, IconReset } from '../../components/ui/Icons';
import { COLUMNS, IRIS } from '../../data/iris';
import { SECTIONS } from '../../data/lecture-content';
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { fmt } from '../../lib/format';
import { mulberry32, normalSampler } from '../../lib/random';
import { linearScale } from '../../lib/scale';
import { boxplotSummary, linearFit, mean, pearson } from '../../lib/statistics';
import type { SamplingMethod } from '../../lib/sampling';
import { Bullets, Cols, Kicker, Source, TaskList, WorkLine } from '../common';

const goSlide = (n: number) => navigate(slideHash(n), true);

function SlideLink({ n, children }: { n: number; children?: ReactNode }) {
  return (
    <button type="button" onClick={() => goSlide(n)} className="tabular rounded border border-line px-1.5 text-[0.78em] text-muted hover:border-blue/60 hover:text-ink">
      {children ?? `slide ${n}`}
    </button>
  );
}

// ───────────────────────────────────────────────────────────────── 1 Title
const TITLE_ROWS = [0, 50, 100, 120].map((i) => IRIS[i]);

function RowsToPoints() {
  const { resetKey } = useSlide();
  const [asPoints, setAsPoints] = useState(false);
  useEffect(() => setAsPoints(false), [resetKey]);
  const [ref, w] = useMeasure<HTMLDivElement>(560, 280);
  const h = 230;
  const tableX = 16;
  const x = linearScale([0, 7.5], [w * 0.42, w - 16]);
  const y = linearScale([0, 2.6], [h - 30, 16]);
  const target = TITLE_ROWS.flatMap((r, i) => (asPoints ? [x(r.petal_length), y(r.petal_width)] : [tableX + 4, 52 + i * 36]));
  const t = useTween(target, 900);
  return (
    <div ref={ref} className="min-w-0">
      <Svg width={w} height={h} label="Four table rows becoming four points">
        <text x={tableX} y={24} fontSize={12} fill={C.muted}>petal length, petal width (cm)</text>
        {/* axes */}
        <g opacity={asPoints ? 1 : 0.25}>
          <line x1={x(0)} x2={x(7.5)} y1={y(0)} y2={y(0)} stroke={C.muted} />
          <line x1={x(0)} x2={x(0)} y1={y(0)} y2={y(2.6)} stroke={C.muted} />
          {[0, 2, 4, 6].map((v) => (
            <text key={v} x={x(v)} y={y(0) + 16} fontSize={11} textAnchor="middle" fill={C.dim}>{v}</text>
          ))}
          {[1, 2].map((v) => (
            <text key={v} x={x(0) - 6} y={y(v)} dy="0.32em" fontSize={11} textAnchor="end" fill={C.dim}>{v}</text>
          ))}
        </g>
        {TITLE_ROWS.map((r, i) => {
          const px = t[2 * i];
          const py = t[2 * i + 1];
          return (
            <g key={i}>
              {asPoints && <circle cx={px} cy={py} r={7} fill={C.blue} />}
              <text x={asPoints ? px + 11 : px} y={asPoints ? py - 9 : py} fontSize={asPoints ? 12 : 15} fill={C.ink} fontFamily="var(--font-mono)" {...HALO}>
                ({r.petal_length.toFixed(1)}, {r.petal_width.toFixed(1)})
              </text>
            </g>
          );
        })}
      </Svg>
      <Button size="sm" variant="primary" onClick={() => setAsPoints((v) => !v)} data-testid="rows-to-points">
        {asPoints ? 'Points → rows' : 'Rows → points'}
      </Button>
    </div>
  );
}

export function S01() {
  return (
    <div className="grid min-h-[70dvh] items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <div className="lab text-ink">Tuwaiq Academy · Data Science &amp; AI</div>
        <h1 className="mt-4 font-extrabold leading-[0.9] tracking-[-0.045em]" style={{ fontSize: 'clamp(46px, min(7.2vw, 13vh), 132px)' }} data-testid="title">
          Unit 2: Linear Algebra <span className="text-ac">&amp;</span> Statistics
        </h1>
        <p className="mt-6 max-w-[40ch] text-[1.2em] font-medium leading-snug">
          A dataset is two things at once: a <b className="text-ink">matrix</b> of numbers, and a <b className="text-ink">cloud of points</b> whose centre, spread
          and shape we can measure.
        </p>
      </div>
      <Panel title="Every row is a point" badge={<Badge kind="added" />}>
        <RowsToPoints />
      </Panel>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── 2 Part 5
export function S02() {
  return (
    <div className="flex min-h-[70dvh] flex-col justify-center gap-8">
      <div>
        <div className="font-extrabold leading-[0.8] tracking-[-0.06em] text-ac" style={{ fontSize: 'clamp(70px, min(12vw, 20vh), 200px)' }}>Part5</div>
        <h1 className="mt-4 font-extrabold leading-[0.92] tracking-[-0.04em]" style={{ fontSize: 'clamp(36px, min(5.6vw, 10vh), 100px)' }}>
          Statistics Foundations + Real Dataset
        </h1>
      </div>
      <nav aria-label="Lecture route" className="relative">
        <div className="absolute left-0 right-0 top-[21px] hidden h-[3px] bg-line lg:block" aria-hidden="true" />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <button type="button" onClick={() => goSlide(s.from)} className="group relative flex w-full flex-col items-start gap-1 text-left">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-bd bg-canvas font-mono font-medium text-ink shadow-[0_3px_0_var(--color-sh)] group-hover:bg-ac group-hover:text-onac">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold leading-snug">{s.title}</span>
                <span className="tabular text-[0.8em] text-muted">
                  slides {s.from}
                  {s.to !== s.from ? `–${s.to}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <p className="text-[0.85em] text-muted">Select a stop to jump to it. The practical part continues in the Python Lab and the Iris Explorer.</p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── 3 Objectives
const OBJECTIVES: [string, number[]][] = [
  ['Understand types of variables', [5, 6, 7]],
  ['Compute descriptive statistics', [15, 17, 18]],
  ['Understand measures of central tendency', [16, 20, 23]],
  ['Understand measures of variation', [24, 34, 45]],
  ['Understand covariance & correlation', [46, 48]],
  ['Compute covariance matrix', [47, 49]],
  ['Connect covariance matrix to PCA', [51]],
  ['Apply statistics to a real dataset', [50, 52]],
];

export function S03() {
  return (
    <ol className="grid gap-2 md:grid-cols-2">
      {OBJECTIVES.map(([o, links], i) => (
        <li key={o} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2.5">
          <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue/60 text-[0.85em] text-blue">{i + 1}</span>
          <span className="min-w-0 flex-1 font-medium">{o}</span>
          <span className="flex shrink-0 flex-wrap justify-end gap-1">
            {links.map((n) => (
              <SlideLink key={n} n={n} />
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

// ───────────────────────────────────────────────────────── 4 Why Statistics Matters in ML
function MiniScatter() {
  const xs = COLUMNS.petal_length;
  const ys = COLUMNS.petal_width;
  const f = linearFit(xs, ys);
  const [ref, w] = useMeasure<HTMLDivElement>(220, 160);
  const h = 110;
  const x = linearScale([0.5, 7.2], [6, w - 6]);
  const y = linearScale([0, 2.7], [h - 6, 6]);
  return (
    <div ref={ref}>
      <Svg width={w} height={h} label="Petal length against petal width with a fitted line">
        {xs.map((v, i) => <circle key={i} cx={x(v)} cy={y(ys[i])} r={2.2} fill={C.blue} opacity={0.7} />)}
        <line x1={x(0.5)} y1={y(f.intercept + f.slope * 0.5)} x2={x(7.2)} y2={y(f.intercept + f.slope * 7.2)} stroke={C.yellow} strokeWidth={2} />
      </Svg>
    </div>
  );
}

function MiniOutliers() {
  const v = COLUMNS.sepal_width;
  const b = boxplotSummary(v, 'linear');
  const [ref, w] = useMeasure<HTMLDivElement>(220, 160);
  const x = linearScale([1.8, 4.6], [8, w - 8]);
  return (
    <div ref={ref}>
      <Svg width={w} height={110} label="Sepal width values with outlier fences">
        <rect x={x(b.q1)} y={40} width={x(b.q3) - x(b.q1)} height={30} fill={C.blue} fillOpacity={0.15} stroke={C.blue} />
        <line x1={x(b.fences.lower)} x2={x(b.fences.lower)} y1={25} y2={85} stroke={C.neg} strokeDasharray="3 3" />
        <line x1={x(b.fences.upper)} x2={x(b.fences.upper)} y1={25} y2={85} stroke={C.neg} strokeDasharray="3 3" />
        {v.map((val, i) => {
          const out = val < b.fences.lower || val > b.fences.upper;
          return <circle key={i} cx={x(val)} cy={55 + ((i * 37) % 21) - 10} r={out ? 4 : 2} fill={out ? C.neg : C.blue} opacity={out ? 1 : 0.5} />;
        })}
        <text x={8} y={104} fontSize={11} fill={C.neg}>{b.outliers.length} flagged by the 1.5 × IQR rule</text>
      </Svg>
    </div>
  );
}

function MiniScaling() {
  const rows: [string, number[]][] = [
    ['sepal length', COLUMNS.sepal_length],
    ['petal width', COLUMNS.petal_width],
  ];
  return (
    <div className="space-y-1.5 text-[0.75em]">
      {rows.map(([name, v]) => {
        const lo = Math.min(...v);
        const hi = Math.max(...v);
        return (
          <div key={name}>
            <div className="text-muted">{name}: {lo.toFixed(1)} – {hi.toFixed(1)} cm</div>
            <div className="relative h-2.5 rounded bg-panel-2">
              <div className="absolute inset-y-0 rounded bg-blue/70" style={{ left: `${(lo / 8) * 100}%`, width: `${((hi - lo) / 8) * 100}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-muted">After z-scoring both have mean 0 and SD 1.</p>
    </div>
  );
}

export function S04() {
  const tiles: [string, ReactNode, number, string][] = [
    ['Understand data distribution', <Histogram key="h" series={[{ values: COLUMNS.petal_length, color: C.blue, label: 'petal length' }]} bins={24} height={110} label="Histogram of Iris petal length" />, 45, 'Iris petal length has two peaks: no single “typical” value.'],
    ['Detect outliers', <MiniOutliers key="o" />, 39, 'Values beyond the IQR fences are flagged for inspection.'],
    ['Choose correct models', <MiniScatter key="s" />, 48, `Petal length vs width: r = ${fmt(pearson(COLUMNS.petal_length, COLUMNS.petal_width), 2)}, a straight line fits.`],
    ['Prepare data for ML', <MiniScaling key="p" />, 45, 'Features on different scales are standardised before many models.'],
  ];
  return (
    <div className="space-y-4">
      <Cols>
        <div>
          <Kicker>Machine Learning is built on</Kicker>
          <div className="grid grid-cols-3 gap-2 text-center">
            {['Probability', 'Statistics', 'Linear Algebra'].map((p) => (
              <div key={p} className={`rounded-lg border px-2 py-4 font-semibold ${p === 'Statistics' ? 'border-yellow/70 text-yellow' : 'border-line'}`}>
                {p}
              </div>
            ))}
          </div>
          <div className="mt-1 rounded-lg border border-line bg-panel-2 py-2 text-center text-[0.9em] text-muted">Machine Learning</div>
        </div>
        <div>
          <Kicker>Statistics helps us</Kicker>
          <Bullets items={['Understand data distribution', 'Detect outliers', 'Choose correct models', 'Prepare data for ML']} />
        </div>
      </Cols>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(([title, vis, n, cap]) => (
          <Panel key={title} title={title} badge={<Badge kind="live">Iris</Badge>}>
            {vis}
            <p className="mt-2 text-[0.8em] text-muted">{cap}</p>
            <div className="mt-1">
              <SlideLink n={n}>taught on slide {n}</SlideLink>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── 5 Types of Variables
function LeafPicture({ kind }: { kind: 'nominal' | 'ordinal' | 'discrete' | 'continuous' }) {
  const w = 150;
  const h = 40;
  return (
    <Svg width={w} height={h} label={`${kind} values`}>
      {kind === 'nominal' && ['#5DA9E9', '#B9A3F5', '#7DD3FC', '#8BD3E6'].map((c, i) => <circle key={i} cx={20 + i * 36 + (i % 2) * 6} cy={i % 2 ? 14 : 26} r={9} fill={c} />)}
      {kind === 'ordinal' && (
        <g>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={10 + i * 34} y={30 - i * 7} width={26} height={8 + i * 7} fill={C.blue} opacity={0.4 + i * 0.18} rx={2} />)}
          <path d="M8 36 L140 8" stroke={C.yellow} strokeWidth={1.5} markerEnd="" />
        </g>
      )}
      {kind === 'discrete' && (
        <g>
          <line x1={6} x2={144} y1={30} y2={30} stroke={C.line} />
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={12 + i * 25} cy={30} r={5} fill={C.blue} />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <text key={`t${i}`} x={12 + i * 25} y={16} fontSize={10} textAnchor="middle" fill={C.muted}>{i}</text>)}
        </g>
      )}
      {kind === 'continuous' && (
        <g>
          <line x1={6} x2={144} y1={30} y2={30} stroke={C.blue} strokeWidth={5} strokeLinecap="round" />
          <text x={75} y={16} fontSize={10} textAnchor="middle" fill={C.muted}>any value in an interval</text>
        </g>
      )}
    </Svg>
  );
}

export function S05() {
  const leaves: [string, string, 'nominal' | 'ordinal' | 'discrete' | 'continuous', string][] = [
    ['Qualitative (Categorical)', 'Nominal (no order)', 'nominal', 'blood type, city, payment channel'],
    ['Qualitative (Categorical)', 'Ordinal (ordered categories)', 'ordinal', 'T-shirt size S < M < L, education level'],
    ['Quantitative (Numeric)', 'Discrete', 'discrete', 'website visits per day, defects per batch'],
    ['Quantitative (Numeric)', 'Continuous', 'continuous', 'temperature, sepal length in cm'],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {['Qualitative (Categorical)', 'Quantitative (Numeric)'].map((g, gi) => (
          <div key={g} className="rounded-xl border border-line bg-panel p-3">
            <div className={`mb-2 font-semibold ${gi === 0 ? 'text-mode' : 'text-blue'}`}>{g}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {leaves
                .filter((l) => l[0] === g)
                .map(([, name, kind, ex]) => (
                  <div key={name} className="rounded-lg border border-line bg-panel-2/60 p-2.5">
                    <div className="font-medium">{name}</div>
                    <LeafPicture kind={kind} />
                    <div className="text-[0.78em] text-muted">
                      e.g. {ex} <Badge kind="added">Added example</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <Note kind="warn" title="A number is not always a measurement">
        Digits can be labels. A satisfaction rating 1–5 is ordinal; a postcode or the Iris <code>species</code> code 0/1/2 is nominal. Averaging them produces a number with no meaning.
      </Note>
      <Source href="https://technologyadvice.com/blog/information-technology/qualitative-vs-quantitative/" />
    </div>
  );
}

// ───────────────────────────────────────────────────────── 6–7 Quick Challenge + Solution
const CHALLENGE: [string, 'Categorical' | 'Numeric', Subtype][] = [
  ['GPA', 'Numeric', 'Continuous'],
  ['Car Color', 'Categorical', 'Nominal'],
  ['Number of Children', 'Numeric', 'Discrete'],
  ['Customer Satisfaction (1–5)', 'Categorical', 'Ordinal'],
  ['House Price', 'Numeric', 'Continuous'],
  ['Disease Type', 'Categorical', 'Nominal'],
];
type Subtype = 'Nominal' | 'Ordinal' | 'Discrete' | 'Continuous';
const SUBTYPES: Subtype[] = ['Nominal', 'Ordinal', 'Discrete', 'Continuous'];

export function S06() {
  const { votes, setVote } = useLectureState();
  return (
    <div className="space-y-3">
      <Cols>
        <div>
          <p>For each variable below, determine its correct type:</p>
          <TaskList tasks={['Categorical or Numeric?', 'Nominal, Ordinal, Discrete, or Continuous?']} />
        </div>
        <Note>
          Record the class's majority answer by tapping a subtype on each card. The answers are compared on the next slide. <Badge kind="added" />
        </Note>
      </Cols>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {CHALLENGE.map(([name]) => (
          <div key={name} className="rounded-xl border border-line bg-panel p-3" data-testid="challenge-card">
            <div className="mb-2 font-semibold">{name}</div>
            <div className="grid grid-cols-2 gap-1.5">
              {SUBTYPES.map((s) => (
                <Button key={s} size="sm" active={votes[name] === s} onClick={() => setVote(name, s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function S07() {
  const { votes } = useLectureState();
  const { step } = useSlide();
  const anyVotes = Object.keys(votes).length > 0;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[520px] text-left">
          <thead className="bg-panel-2 text-[0.85em] text-muted">
            <tr>
              <th className="px-3 py-2">Variable</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Subtype</th>
              {anyVotes && <th className="px-3 py-2">Class vote</th>}
            </tr>
          </thead>
          <tbody>
            {CHALLENGE.map(([name, type, sub], i) => {
              const shown = step > i;
              const vote = votes[name];
              return (
                <tr key={name} className="border-t border-line">
                  <td className="px-3 py-2 font-medium">{name}</td>
                  <td className="px-3 py-2">{shown ? <span className={type === 'Numeric' ? 'text-blue' : 'text-mode'}>{type}</span> : <span className="text-dim">·····</span>}</td>
                  <td className="px-3 py-2">{shown ? <b>{sub}</b> : <span className="text-dim">·····</span>}</td>
                  {anyVotes && (
                    <td className="px-3 py-2 text-[0.9em]">
                      {vote ? (shown ? <span className={vote === sub ? 'text-pos' : 'text-neg'}>{vote} {vote === sub ? '✓' : '✗'}</span> : <span className="text-muted">{vote}</span>) : <span className="text-dim">—</span>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Step at={6} placeholder={null}>
        <Note title="Why these two trip people up">
          <b>GPA</b> can take any value in an interval, so it is continuous even when printed with two decimals. <b>Satisfaction (1–5)</b> uses digits as ordered labels: the
          distance from 1 to 2 need not equal 4 to 5, so it is ordinal. The Iris <code>species</code> column (0, 1, 2) is the same kind of trap — it is nominal.
        </Note>
      </Step>
    </div>
  );
}

// ───────────────────────────────────────────────────────── 8 Independent vs Dependent
export function S08() {
  return (
    <div className="space-y-4">
      <Cols>
        <div className="space-y-3">
          <Bullets items={[<>Independent variable → <b>input / cause</b></>, <>Dependent variable → <b>output / effect</b></>]} />
          <div>
            <Kicker>In ML</Kicker>
            <Bullets items={[<><b className="text-blue">Features</b> = independent variables</>, <><b className="text-yellow">Target</b> = dependent variable</>]} />
          </div>
        </div>
        <Panel title="A model maps features to a target">
          <div className="overflow-x-auto">
            <table className="tabular w-full min-w-[380px] text-[0.85em]">
              <thead>
                <tr>
                  {['area (m²)', 'rooms', 'age (yrs)'].map((c) => (
                    <th key={c} className="border-b-2 border-blue px-2 py-1 text-left font-semibold text-blue">{c}</th>
                  ))}
                  <th className="px-2 text-muted">→</th>
                  <th className="border-b-2 border-yellow px-2 py-1 text-left font-semibold text-yellow">price (SAR)</th>
                </tr>
              </thead>
              <tbody>
                {[[180, 4, 6, '1,150,000'], [120, 3, 15, '690,000'], [240, 5, 2, '1,720,000']].map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-2 py-1">{r[0]}</td><td className="px-2">{r[1]}</td><td className="px-2">{r[2]}</td><td className="px-2 text-muted">f</td><td className="px-2">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Tex>{'\\hat y = f(x_1, x_2, x_3)'}</Tex>
            <Badge kind="illustrative" />
          </div>
        </Panel>
      </Cols>
      <Note title="Added · a role, not a property">
        “Independent” names the role of the variable in the model. It does not mean features are statistically independent of each other — area and rooms are strongly correlated. We measure that with the covariance matrix on slide 47.
      </Note>
      <Source href="https://www.wikihow.com/Identify-Dependent-and-Independent-Variables" />
    </div>
  );
}

// ───────────────────────────────────────────────────────── 9–10 Quick Question + Solution
const PASS_COLS = ['Study Hours', 'Attendance', 'Sleep Hours', 'Pass / Fail'];

export function S09() {
  const { roles, setRole } = useLectureState();
  return (
    <div className="space-y-4">
      <Cols>
        <div className="space-y-2">
          <p>In the following example:</p>
          <p className="text-[1.05em]">
            We want to predict whether a student will <b>pass or fail</b> based on:
          </p>
          <Bullets items={['Study Hours', 'Attendance', 'Sleep Hours']} />
          <p className="pt-2 font-medium">What are the independent variables? What is the dependent variable?</p>
        </div>
        <Panel title="Assign each column a role (class answer)">
          <div className="grid grid-cols-2 gap-2">
            {PASS_COLS.map((c) => {
              const r = roles[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setRole(c, r === undefined ? 'feature' : r === 'feature' ? 'target' : undefined)}
                  className={`min-h-16 rounded-lg border-2 px-3 py-2 text-left ${r === 'feature' ? 'border-blue bg-blue/10' : r === 'target' ? 'border-yellow bg-yellow/10' : 'border-line bg-panel-2'}`}
                >
                  <div className="font-semibold">{c}</div>
                  <div className="text-[0.8em] text-muted">{r === 'feature' ? 'feature (independent)' : r === 'target' ? 'target (dependent)' : 'tap to assign'}</div>
                </button>
              );
            })}
          </div>
        </Panel>
      </Cols>
    </div>
  );
}

export function S10() {
  const rows = [
    [6.5, '92%', 7, 'Pass'],
    [1.0, '60%', 5, 'Fail'],
    [4.0, '85%', 8, 'Pass'],
  ];
  return (
    <Cols>
      <div className="space-y-3">
        <Step at={1}>
          <WorkLine label={<span className="text-blue">Independent variables</span>}>
            <Bullets items={['Study Hours', 'Attendance', 'Sleep Hours']} />
          </WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label={<span className="text-yellow">Dependent variable</span>} tone="answer">
            Pass / Fail
          </WorkLine>
          <Note title="Added">Pass/Fail is a categorical target with two classes, so this is a binary classification problem.</Note>
        </Step>
      </div>
      <Panel title="What the data look like" badge={<Badge kind="illustrative">Made-up rows</Badge>}>
        <div className="overflow-x-auto">
          <table className="tabular w-full min-w-[360px] text-[0.88em]">
            <thead>
              <tr>
                {PASS_COLS.map((c, i) => (
                  <th key={c} className={`border-b-2 px-2 py-1 text-left ${i < 3 ? 'border-blue text-blue' : 'border-yellow text-yellow'}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  {r.map((v, j) => <td key={j} className="px-2 py-1">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────────────── 11 Population vs Sample
export function S11() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Bullets
          items={[
            <>Population → <b>entire dataset</b> <span className="text-muted">(parameter: μ)</span></>,
            <>Sample → <b>subset</b> <span className="text-muted">(statistic: x̄)</span></>,
            <>Sampling methods: Random · Stratified · Cluster · Systematic</>,
            <>Important for <b className="text-yellow">inference</b>.</>,
          ]}
        />
        <Note>
          Compare the methods: each selects a different subset (cyan). Press “New sample” several times and watch how far x̄ moves from μ — some methods are far less stable than others.
        </Note>
      </div>
      <PopulationSampler />
      <Source href="https://www.geeksforgeeks.org/machine-learning/population-and-sample-statistics/" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── 12 Quick Question
export function S12() {
  return (
    <Cols>
      <div className="space-y-3">
        <p className="text-[1.05em]">
          We trained a model using data from <b className="text-cyan">10,000 users</b>.
        </p>
        <p className="text-[1.05em]">
          The company actually has <b className="text-yellow">2 million users</b>.
        </p>
        <TaskList tasks={['What represents the population?', 'What represents the sample?', 'Why must the sample be representative?']} />
      </div>
      <Panel title="To scale: 1 cell = 10,000 users">
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }} aria-label="200 cells, one highlighted">
          {Array.from({ length: 200 }, (_, i) => (
            <div key={i} className={`aspect-square rounded-[2px] ${i === 87 ? 'bg-cyan' : 'bg-line'}`} />
          ))}
        </div>
        <p className="tabular mt-2 text-[0.88em] text-muted">10,000 / 2,000,000 = 0.5% — one cell in 200.</p>
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────────────── 13 Solution
function makeUsers() {
  const z = normalSampler(mulberry32(99));
  // Weekly sessions per user: right-skewed (log-normal), illustrative.
  return Array.from({ length: 2000 }, () => Math.exp(1.6 + 0.55 * z()));
}
const USERS = makeUsers();

function BiasSimulator() {
  const { resetKey } = useSlide();
  const [mode, setMode] = useState<'random' | 'active'>('random');
  const [seed, setSeed] = useState(3);
  useEffect(() => {
    setMode('random');
    setSeed(3);
  }, [resetKey]);
  const sample = useMemo(() => {
    const rand = mulberry32(seed);
    if (mode === 'random') return Array.from({ length: 200 }, () => USERS[Math.floor(rand() * USERS.length)]);
    const top = [...USERS].sort((a, b) => b - a).slice(0, 400);
    return Array.from({ length: 200 }, () => top[Math.floor(rand() * top.length)]);
  }, [mode, seed]);
  const mu = mean(USERS);
  const xbar = mean(sample);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" active={mode === 'random'} onClick={() => setMode('random')}>Representative (random)</Button>
        <Button size="sm" active={mode === 'active'} onClick={() => setMode('active')}>Only most-active users</Button>
        <Button size="sm" variant="ghost" onClick={() => setSeed((s) => s + 1)}>Redraw</Button>
        <Badge kind="illustrative" />
      </div>
      <Histogram
        series={[
          { values: USERS, color: C.muted, label: 'population', outline: true },
          { values: sample, color: C.cyan, label: 'sample' },
        ]}
        bins={28}
        domain={[0, 22]}
        density
        markers={[{ value: mu, color: C.yellow, label: `μ ${fmt(mu, 1)}` }, { value: xbar, color: C.cyan, label: `x̄ ${fmt(xbar, 1)}` }]}
        label="Population and sample distributions of weekly sessions"
        format={(v) => fmt(v, 0)}
      />
      <p className="text-[0.85em] text-muted">
        Weekly sessions per user. Outline = population of 2,000 simulated users; cyan = a sample of 200.{' '}
        {mode === 'active' ? <span className="text-neg">The biased sample sits to the right: a model trained on it learns the wrong world.</span> : 'The sample has the same shape as the population.'}
      </p>
    </div>
  );
}

export function S13() {
  return (
    <Cols ratio="wide-right">
      <div className="space-y-2">
        <Step at={1}>
          <WorkLine label="Population">2 million users</WorkLine>
        </Step>
        <Step at={2}>
          <WorkLine label="Sample">10,000 users</WorkLine>
        </Step>
        <Step at={3}>
          <WorkLine label="Why" tone="answer">
            Representative sample ensures good generalization.
          </WorkLine>
        </Step>
      </div>
      <Panel title="What “not representative” looks like" badge={<Badge kind="added" />}>
        <BiasSimulator />
      </Panel>
    </Cols>
  );
}

// ───────────────────────────────────────────────────────── 14 Group Discussion
const GROUPS: { method: SamplingMethod; what: string; example: string; ml: string }[] = [
  {
    method: 'random',
    what: 'Every member of the population has the same chance of being chosen.',
    example: 'Draw 300 employee IDs at random for a workplace survey.',
    ml: 'Shuffled train/test split when the rows are independent and identically distributed.',
  },
  {
    method: 'stratified',
    what: 'Split the population into groups (strata) and sample inside every group, in proportion to its size.',
    example: 'Survey each college of a university in proportion to its number of students.',
    ml: 'Stratified train/test split or StratifiedKFold for imbalanced classes, e.g. 1% fraud cases.',
  },
  {
    method: 'cluster',
    what: 'Split the population into natural groups (clusters), choose some whole clusters at random, and include everyone in them.',
    example: 'Pick 5 schools at random and test every student in those schools.',
    ml: 'Collecting labels from a few hospitals or stores; GroupKFold keeps a group out of both train and test to avoid leakage.',
  },
  {
    method: 'systematic',
    what: 'Pick a random start, then take every k-th member of an ordered list.',
    example: 'Inspect every 50th product on a production line.',
    ml: 'Down-sampling long logs or time series — beware if the list has a period that matches k.',
  },
];

function DiscussionTimer() {
  const { resetKey } = useSlide();
  const [minutes, setMinutes] = useState(5);
  const [left, setLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    setMinutes(5);
    setLeft(300);
    setRunning(false);
  }, [resetKey]);
  useEffect(() => {
    if (!running) return;
    const end = Date.now() + left * 1000;
    const id = window.setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) setRunning(false);
    }, 250);
    return () => window.clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="discussion-timer">
      <span className={`tabular text-[1.6em] font-semibold ${left === 0 ? 'text-neg' : left < 60 ? 'text-yellow' : ''}`}>
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
      </span>
      <Button size="sm" variant="primary" onClick={() => setRunning((r) => !r)} icon={running ? <IconPause /> : <IconPlay />}>{running ? 'Pause' : 'Start'}</Button>
      <Button size="sm" variant="ghost" onClick={() => { setRunning(false); setLeft(minutes * 60); }} icon={<IconReset />}>Reset</Button>
      <label className="flex items-center gap-1 text-[0.8em] text-muted">
        minutes
        <select
          className="min-h-9 rounded border border-line bg-panel px-1 text-ink"
          value={minutes}
          onChange={(e) => { const m = Number(e.target.value); setMinutes(m); setLeft(m * 60); setRunning(false); }}
        >
          {[2, 3, 4, 5, 6, 8, 10].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
    </div>
  );
}

export function S14() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p>Divide into 4 groups. Each group will explain one sampling method.</p>
          <p className="mt-1 text-[0.9em] text-muted">What each group must explain: <b className="text-ink">What is it?</b> (definition in simple words) · <b className="text-ink">A simple real-life example</b> · <b className="text-ink">When would you use it in Machine Learning?</b></p>
        </div>
        <DiscussionTimer />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {GROUPS.map((g, i) => (
          <Panel key={g.method} title={`Group ${i + 1} → ${METHOD_LABEL[g.method]} Sampling`}>
            <PopulationSampler compact method={g.method} />
            <div className="mt-3">
              <RevealBox label="Instructor reference answer" testId={`group-answer-${i + 1}`}>
                <div className="space-y-1.5 text-[0.85em]">
                  <Badge kind="added" />
                  <p><b>What:</b> {g.what}</p>
                  <p><b>Example:</b> {g.example}</p>
                  <p><b>In ML:</b> {g.ml}</p>
                </div>
              </RevealBox>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
