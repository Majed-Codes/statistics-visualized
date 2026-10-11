/**
 * Interactive population (400 members, 4 regions, 20 blocks) and the four
 * sampling methods of slide 11. Selected members turn cyan (cyan = sample).
 * Every draw is reproducible from its seed; the sample mean x̄ of each draw is
 * recorded so students see how much each method's estimate varies around μ.
 */
import { useEffect, useMemo, useState } from 'react';
import { drawSample, makePopulation, REGION_NAMES, type SamplingMethod } from '../../lib/sampling';
import { mean } from '../../lib/statistics';
import { fmt } from '../../lib/format';
import { linearScale } from '../../lib/scale';
import { useMeasure } from '../../hooks/useMeasure';
import { useSlide } from '../presentation/SlideContext';
import { Button, Segmented } from '../ui/Button';
import { Scrub } from '../ui/Scrub';
import { Badge } from '../ui/Badge';
import { C, HALO, Svg } from './primitives';

const POP = makePopulation();

export const METHOD_LABEL: Record<SamplingMethod, string> = {
  random: 'Random',
  stratified: 'Stratified',
  cluster: 'Cluster',
  systematic: 'Systematic',
};

interface Props {
  /** Small, fixed-method version used on the group-discussion slide. */
  compact?: boolean;
  method?: SamplingMethod;
}

export function PopulationSampler({ compact = false, method: fixedMethod }: Props) {
  const { resetKey } = useSlide();
  const [method, setMethod] = useState<SamplingMethod>(fixedMethod ?? 'random');
  const [n, setN] = useState(40);
  const [seed, setSeed] = useState(1);
  const [history, setHistory] = useState<Record<SamplingMethod, number[]>>({ random: [], stratified: [], cluster: [], systematic: [] });
  const [ref, w] = useMeasure<HTMLDivElement>(compact ? 240 : 420, compact ? 160 : 260);

  useEffect(() => {
    setMethod(fixedMethod ?? 'random');
    setN(40);
    setSeed(1);
    setHistory({ random: [], stratified: [], cluster: [], systematic: [] });
  }, [resetKey, fixedMethod]);

  const sample = useMemo(() => drawSample(POP, method, n, seed), [method, n, seed]);
  const members = POP.members;
  const mu = mean(members.map((m) => m.value));
  const chosen = members.filter((m) => sample.ids.has(m.id));
  const xbar = mean(chosen.map((m) => m.value));

  useEffect(() => {
    if (compact) return;
    setHistory((h) => ({ ...h, [method]: [...h[method], xbar].slice(-40) }));
  }, [sample]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = Math.min(w, compact ? 260 : 460);
  const cell = size / POP.cols;
  const popShare = [0, 1, 2, 3].map((r) => members.filter((m) => m.region === r).length / members.length);
  const sampleShare = [0, 1, 2, 3].map((r) => chosen.filter((m) => m.region === r).length / Math.max(1, chosen.length));

  const REGION_TINT = [C.species[0], C.species[1], C.species[2], C.yellow];
  const grid = (
    <Svg width={size} height={size} label={`Population of ${members.length} members, ${chosen.length} sampled by ${METHOD_LABEL[method]} sampling`}>
      {/* region tints */}
      {[0, 1, 2, 3].map((r) => {
        const cells = members.filter((m) => m.region === r);
        const c0 = Math.min(...cells.map((m) => m.col));
        const c1 = Math.max(...cells.map((m) => m.col));
        const r0 = Math.min(...cells.map((m) => m.row));
        const r1 = Math.max(...cells.map((m) => m.row));
        return (
          <g key={r}>
            <rect x={c0 * cell} y={r0 * cell} width={(c1 - c0 + 1) * cell} height={(r1 - r0 + 1) * cell} fill={REGION_TINT[r]} fillOpacity={0.08} stroke={REGION_TINT[r]} strokeOpacity={0.6} strokeWidth={1.5} />
            {!compact && (
              <text x={c0 * cell + 4} y={r0 * cell + 12} fontSize={11} fontWeight={700} fill={REGION_TINT[r]} {...HALO}>
                {REGION_NAMES[r]}
              </text>
            )}
          </g>
        );
      })}
      {/* cluster blocks (outlined only for cluster sampling) */}
      {method === 'cluster' &&
        Array.from({ length: 20 }, (_, k) => {
          const bx = (k % 5) * 4 * cell;
          const by = Math.floor(k / 5) * 5 * cell;
          const any = chosen.some((m) => m.cluster === k);
          return <rect key={`c${k}`} x={bx + 1} y={by + 1} width={4 * cell - 2} height={5 * cell - 2} fill="none" stroke={any ? C.cyan : C.line} strokeDasharray={any ? undefined : '3 3'} strokeWidth={any ? 2 : 1} rx={3} />;
        })}
      {members.map((m) => {
        const on = sample.ids.has(m.id);
        return <circle key={m.id} cx={(m.col + 0.5) * cell} cy={(m.row + 0.5) * cell} r={on ? cell * 0.36 : cell * 0.2} fill={on ? C.cyan : C.dim} opacity={on ? 1 : 0.55} />;
      })}
    </Svg>
  );

  if (compact) {
    return (
      <div ref={ref} className="w-full min-w-0" data-testid="sampler-compact">
        {grid}
        <Button size="sm" className="mt-2" onClick={() => setSeed((s) => s + 1)}>
          New {METHOD_LABEL[method].toLowerCase()} sample
        </Button>
      </div>
    );
  }

  const hist = history[method];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" data-testid="population-sampler">
      <div ref={ref} className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge kind="illustrative">Simulated population</Badge>
          <span className="text-[0.8em] text-muted">value = monthly app usage (hours), seed-reproducible</span>
        </div>
        {grid}
      </div>
      <div className="min-w-0 space-y-3">
        <Segmented
          label="Sampling method"
          value={method}
          onChange={setMethod}
          options={(Object.keys(METHOD_LABEL) as SamplingMethod[]).map((k) => ({ value: k, label: METHOD_LABEL[k] }))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-[1.1em] font-medium">
            Survey <Scrub value={n} min={20} max={100} step={20} perPx={0.25} onChange={setN} label="Sample size" className="text-cyan" testId="sampler-n" /> of the {members.length} people.
          </p>
          <Button variant="primary" onClick={() => setSeed((s) => s + 1)} data-testid="sampler-new">
            New sample
          </Button>
        </div>
        <p className="min-h-[3em] text-[0.88em] text-ink/90" aria-live="polite">
          {sample.explanation}
        </p>
        <div className="tabular grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border-2 border-bd bg-panel p-2">
            <div className="text-[0.75em] text-muted">population μ</div>
            <div className="font-semibold text-yellow">{fmt(mu, 1)}</div>
          </div>
          <div className="rounded-xl border-2 border-bd bg-panel p-2">
            <div className="text-[0.75em] text-muted">sample x̄</div>
            <div className="font-semibold text-cyan" data-testid="sampler-xbar">{fmt(xbar, 1)}</div>
          </div>
          <div className="rounded-xl border-2 border-bd bg-panel p-2">
            <div className="text-[0.75em] text-muted">error x̄ − μ</div>
            <div className={`font-semibold ${Math.abs(xbar - mu) > 3 ? 'text-neg' : 'text-ink'}`}>{fmt(xbar - mu, 1)}</div>
          </div>
        </div>
        <div>
          <div className="mb-1 text-[0.8em] text-muted">Region shares — population (outline) vs sample (fill)</div>
          <div className="space-y-1">
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="grid grid-cols-[4.5em_minmax(0,1fr)_3.5em] items-center gap-2 text-[0.8em]">
                <span style={{ color: REGION_TINT[r] }}>{REGION_NAMES[r]}</span>
                <div className="relative h-4 rounded bg-panel-2">
                  <div className="absolute inset-y-0 left-0 rounded bg-cyan/60" style={{ width: `${sampleShare[r] * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 rounded border-2 border-yellow/70" style={{ width: `${popShare[r] * 100}%` }} />
                </div>
                <span className="tabular text-right text-muted">{Math.round(sampleShare[r] * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <MeansStrip values={hist} mu={mu} label={`x̄ of the last ${hist.length} ${METHOD_LABEL[method].toLowerCase()} samples`} />
      </div>
    </div>
  );
}

function MeansStrip({ values, mu, label }: { values: number[]; mu: number; label: string }) {
  const [ref, w] = useMeasure<HTMLDivElement>(360, 220);
  const x = linearScale([10, 45], [10, w - 10]);
  return (
    <div ref={ref} className="min-w-0">
      <div className="mb-1 text-[0.8em] text-muted">{label} — press “New sample” repeatedly</div>
      <Svg width={w} height={46} label={label}>
        <line x1={10} x2={w - 10} y1={30} y2={30} stroke={C.line} />
        {[10, 20, 30, 40].map((t) => (
          <text key={t} x={x(t)} y={44} fontSize={10} textAnchor="middle" fill={C.dim}>
            {t}
          </text>
        ))}
        <line x1={x(mu)} x2={x(mu)} y1={6} y2={34} stroke={C.yellow} strokeWidth={2} />
        {values.map((v, i) => (
          <circle key={i} cx={x(v)} cy={22 - (i % 3) * 5} r={3.5} fill={C.cyan} opacity={0.35 + (0.65 * (i + 1)) / values.length} />
        ))}
      </Svg>
    </div>
  );
}
