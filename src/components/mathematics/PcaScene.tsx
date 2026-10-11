/**
 * PCA, built step by step on a real 2D cloud. Every number on screen comes
 * from `pca()` (Jacobi eigen decomposition of the sample covariance matrix).
 *
 * stage 0 raw cloud · 1 centred · 2 sweep a direction, see the projected variance
 * 3 covariance matrix · 4 eigenvectors · 5 eigenvalues = variance along them
 * 6 project onto PC1 · 7 variance retained vs lost
 *
 * Axes use one scale for x and y so that perpendicular directions look
 * perpendicular and the variance ellipse has its true shape.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { pca, varianceAlong } from '../../lib/linear-algebra';
import { linearScale, niceTicks } from '../../lib/scale';
import { fmt, pct, tex } from '../../lib/format';
import { correlatedPairs } from '../../lib/random';
import { COLUMNS, FEATURE_LABEL, type Feature } from '../../data/iris';
import { Button, Segmented } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { Badge } from '../ui/Badge';
import { Tex } from './Tex';
import { C, Chart, HALO, Swatch } from './primitives';
import { useSlide } from '../presentation/SlideContext';

type DatasetId = 'petal' | 'sepal' | 'synthetic';

const PAIRS: Record<Exclude<DatasetId, 'synthetic'>, [Feature, Feature]> = {
  petal: ['petal_length', 'petal_width'],
  sepal: ['sepal_length', 'sepal_width'],
};

function syntheticCloud(elongation: number, angleDeg: number): [number[], number[]] {
  const pts = correlatedPairs(120, 0, 2024);
  const a = (angleDeg * Math.PI) / 180;
  const xs = pts.map((p) => 4 + elongation * p.x * Math.cos(a) - 0.6 * p.y * Math.sin(a));
  const ys = pts.map((p) => 2.5 + elongation * p.x * Math.sin(a) + 0.6 * p.y * Math.cos(a));
  return [xs, ys];
}

const deg = (r: number) => (r * 180) / Math.PI;
const toHalfTurn = (d: number) => ((d % 180) + 180) % 180;

export function PcaScene({ stage }: { stage: number }) {
  const { resetKey } = useSlide();
  const [dataset, setDataset] = useState<DatasetId>('petal');
  const [elong, setElong] = useState(2.2);
  const [genAngle, setGenAngle] = useState(30);
  const [theta, setTheta] = useState(0);
  const sweepRef = useRef<number | null>(null);

  useEffect(() => {
    setDataset('petal');
    setElong(2.2);
    setGenAngle(30);
    setTheta(0);
  }, [resetKey]);

  const [xs, ys, xLabel, yLabel] = useMemo(() => {
    if (dataset === 'synthetic') {
      const [a, b] = syntheticCloud(elong, genAngle);
      return [a, b, 'x₁', 'x₂'];
    }
    const [f1, f2] = PAIRS[dataset];
    return [COLUMNS[f1], COLUMNS[f2], `${FEATURE_LABEL[f1]} (cm)`, `${FEATURE_LABEL[f2]} (cm)`];
  }, [dataset, elong, genAngle]);

  const result = useMemo(() => pca([xs, ys]), [xs, ys]);
  const [mx, my] = result.means;
  const S = result.covariance;
  const [pc1, pc2] = result.components;
  const theta1 = toHalfTurn(deg(Math.atan2(pc1.vector[1], pc1.vector[0])));
  const theta2 = toHalfTurn(theta1 + 90);

  // At stage ≥ 6 the projection line is locked onto PC1.
  const thetaShown = stage >= 6 ? theta1 : theta;
  const thetaAnim = useAnimatedNumber(thetaShown, 70);
  const u = [Math.cos((thetaAnim * Math.PI) / 180), Math.sin((thetaAnim * Math.PI) / 180)];
  const varU = varianceAlong(S, u);

  const centerT = useAnimatedNumber(stage >= 1 ? 1 : 0, 120);
  const projT = useAnimatedNumber(stage >= 6 ? 1 : 0, 140);

  const sweep = () => {
    if (sweepRef.current !== null) cancelAnimationFrame(sweepRef.current);
    const start = performance.now();
    const run = (now: number) => {
      const t = Math.min(1, (now - start) / 3500);
      setTheta(Math.round(t * 179));
      if (t < 1) sweepRef.current = requestAnimationFrame(run);
    };
    sweepRef.current = requestAnimationFrame(run);
  };
  useEffect(() => () => { if (sweepRef.current !== null) cancelAnimationFrame(sweepRef.current); }, []);

  // World extent that holds both the raw cloud (with the origin) and the centred cloud.
  const extent = useMemo(() => {
    const cx = xs.map((v) => v - mx);
    const cy = ys.map((v) => v - my);
    const r = 2.2 * Math.sqrt(pc1.value);
    const raw = { x0: Math.min(0, ...xs), x1: Math.max(...xs), y0: Math.min(0, ...ys), y1: Math.max(...ys) };
    const cen = { x0: Math.min(...cx, -r), x1: Math.max(...cx, r), y0: Math.min(...cy, -r * 0.6), y1: Math.max(...cy, r * 0.6) };
    return { raw, cen };
  }, [xs, ys, mx, my, pc1.value]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const vx0 = lerp(extent.raw.x0, extent.cen.x0, centerT);
  const vx1 = lerp(extent.raw.x1, extent.cen.x1, centerT);
  const vy0 = lerp(extent.raw.y0, extent.cen.y0, centerT);
  const vy1 = lerp(extent.raw.y1, extent.cen.y1, centerT);

  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    for (let d = 0; d <= 180; d += 2) {
      const a = (d * Math.PI) / 180;
      pts.push([d, varianceAlong(S, [Math.cos(a), Math.sin(a)])]);
    }
    return pts;
  }, [S]);

  const retained = result.explainedVarianceRatio[0];
  const svar = (i: number, j: number) => tex(S[i][j], 3);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Dataset"
            value={dataset}
            onChange={setDataset}
            options={[
              { value: 'petal', label: 'Iris petals' },
              { value: 'sepal', label: 'Iris sepals' },
              { value: 'synthetic', label: 'Synthetic' },
            ]}
          />
          {dataset !== 'synthetic' ? <Badge kind="live">Iris · 150 flowers</Badge> : <Badge kind="illustrative" />}
        </div>
        {dataset === 'synthetic' && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Slider label="Elongation" value={elong} min={0.6} max={3.5} step={0.1} onChange={setElong} format={(v) => v.toFixed(1)} />
            <Slider label="Generating angle" value={genAngle} min={0} max={180} onChange={setGenAngle} format={(v) => `${v}°`} />
          </div>
        )}
        <Chart
          label="Principal component analysis scatterplot"
          testId="pca-scene"
          height={(w) => Math.round(Math.max(250, Math.min(440, w * 0.62)))}
        >
          {(w, h) => {
            const pad = 34;
            const unit = Math.min((w - 2 * pad) / (vx1 - vx0), (h - 2 * pad) / (vy1 - vy0));
            const cxw = (vx0 + vx1) / 2;
            const cyw = (vy0 + vy1) / 2;
            const X = linearScale([cxw - (w - 2 * pad) / unit / 2, cxw + (w - 2 * pad) / unit / 2], [pad, w - pad]);
            const Y = linearScale([cyw - (h - 2 * pad) / unit / 2, cyw + (h - 2 * pad) / unit / 2], [h - pad, pad]);
            const offX = mx * centerT;
            const offY = my * centerT;
            const ticksX = niceTicks(X.domain[0], X.domain[1], w < 500 ? 5 : 9);
            const ticksY = niceTicks(Y.domain[0], Y.domain[1], 5);
            const L = 3 * Math.sqrt(pc1.value) + 0.5 * (vx1 - vx0);
            const lineEnd = (t: number) => [X(u[0] * t), Y(u[1] * t)];
            const [ax, ay] = lineEnd(-L);
            const [bx, by] = lineEnd(L);
            return (
              <g>
                <defs>
                  <clipPath id="pca-clip">
                    <rect x={pad - 6} y={pad - 6} width={w - 2 * pad + 12} height={h - 2 * pad + 12} />
                  </clipPath>
                </defs>
                {/* grid + axes through the world origin */}
                <g stroke={C.lineSoft}>
                  {ticksX.map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1={pad} y2={h - pad} />)}
                  {ticksY.map((t) => <line key={`gy${t}`} y1={Y(t)} y2={Y(t)} x1={pad} x2={w - pad} />)}
                </g>
                <line x1={pad} x2={w - pad} y1={Y(0)} y2={Y(0)} stroke={C.muted} strokeWidth={1.2} />
                <line y1={pad} y2={h - pad} x1={X(0)} x2={X(0)} stroke={C.muted} strokeWidth={1.2} />
                {ticksX.map((t) => (
                  <text key={`tx${t}`} x={X(t)} y={Math.min(h - pad + 16, Math.max(pad, Y(0) + 16))} fontSize={11} fill={C.dim} textAnchor="middle">{fmt(t, 1)}</text>
                ))}
                {ticksY.filter((t) => t !== 0).map((t) => (
                  <text key={`ty${t}`} x={Math.max(pad + 2, X(0) - 6)} y={Y(t)} dy="0.32em" fontSize={11} fill={C.dim} textAnchor="end">{fmt(t, 1)}</text>
                ))}
                <text x={w - pad} y={Y(0) - 8} textAnchor="end" fontSize={12} fill={C.muted}>{stage >= 1 ? `${xLabel} − μ` : xLabel}</text>
                <text x={X(0) + 8} y={pad + 4} fontSize={12} fill={C.muted}>{stage >= 1 ? `${yLabel} − μ` : yLabel}</text>

                {/* variance ellipse: semi-axes 2√λ along the eigenvectors */}
                {stage >= 5 && (
                  <ellipse
                    cx={X(mx - offX)}
                    cy={Y(my - offY)}
                    rx={2 * Math.sqrt(pc1.value) * unit}
                    ry={2 * Math.sqrt(pc2.value) * unit}
                    transform={`rotate(${-theta1} ${X(mx - offX)} ${Y(my - offY)})`}
                    fill={C.yellow}
                    fillOpacity={0.05}
                    stroke={C.yellow}
                    strokeOpacity={0.5}
                    strokeDasharray="5 5"
                  />
                )}

                {/* direction line and projections */}
                <g clipPath="url(#pca-clip)">
                {stage >= 2 && (
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={stage >= 6 ? C.yellow : C.cyan} strokeWidth={2} opacity={0.9} />
                )}
                {stage >= 2 &&
                  xs.map((xv, i) => {
                    const px = xv - offX;
                    const py = ys[i] - offY;
                    const t = px * u[0] + py * u[1];
                    const fx = t * u[0];
                    const fy = t * u[1];
                    return (
                      <line
                        key={`r${i}`}
                        x1={X(px + (fx - px) * projT)}
                        y1={Y(py + (fy - py) * projT)}
                        x2={X(fx)}
                        y2={Y(fy)}
                        stroke={stage >= 6 ? C.neg : C.cyan}
                        strokeOpacity={stage >= 6 ? 0.5 : 0.22}
                        strokeDasharray={stage >= 6 ? '2 3' : undefined}
                      />
                    );
                  })}

                </g>
                {/* observations: raw → centred → projected */}
                {xs.map((xv, i) => {
                  const px = xv - offX;
                  const py = ys[i] - offY;
                  let qx = px;
                  let qy = py;
                  if (stage >= 6) {
                    const t = px * u[0] + py * u[1];
                    qx = px + (t * u[0] - px) * projT;
                    qy = py + (t * u[1] - py) * projT;
                  }
                  return <circle key={i} cx={X(qx)} cy={Y(qy)} r={w < 500 ? 3 : 3.6} fill={C.blue} fillOpacity={0.75} />;
                })}
                {stage >= 2 && stage < 6 &&
                  xs.map((xv, i) => {
                    const t = (xv - offX) * u[0] + (ys[i] - offY) * u[1];
                    return <circle key={`f${i}`} cx={X(t * u[0])} cy={Y(t * u[1])} r={2} fill={C.cyan} />;
                  })}

                {/* the mean */}
                <g transform={`translate(${X(mx - offX)},${Y(my - offY)})`}>
                  <line x1={-7} x2={7} stroke={C.yellow} strokeWidth={2.5} />
                  <line y1={-7} y2={7} stroke={C.yellow} strokeWidth={2.5} />
                  {stage === 0 && <text x={10} y={-10} fontSize={12} fontWeight={600} fill={C.yellow} {...HALO}>μ = ({fmt(mx)}, {fmt(my)})</text>}
                </g>

                {/* eigenvectors drawn with length 2√λ */}
                {stage >= 4 &&
                  [pc1, pc2].map((pc, k) => {
                    const len = 2 * Math.sqrt(pc.value);
                    const ex = X(pc.vector[0] * len);
                    const ey = Y(pc.vector[1] * len);
                    const col = k === 0 ? C.yellow : C.mode;
                    return (
                      <g key={`pc${k}`}>
                        <defs>
                          <marker id={`ah${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0 L10 5 L0 10 z" fill={col} />
                          </marker>
                        </defs>
                        <line x1={X(0)} y1={Y(0)} x2={ex} y2={ey} stroke={col} strokeWidth={3.5} markerEnd={`url(#ah${k})`} />
                        <text x={ex > w - 150 ? ex - 6 : ex + 6} y={ey - 8} textAnchor={ex > w - 150 ? 'end' : 'start'} fontSize={13} fontWeight={700} fill={col} {...HALO}>
                          {k === 0 ? 'v₁' : 'v₂'}
                          {stage >= 5 ? `  λ${k === 0 ? '₁' : '₂'} = ${fmt(pc.value, 3)}` : ''}
                        </text>
                      </g>
                    );
                  })}
              </g>
            );
          }}
        </Chart>
        {stage >= 2 && stage < 6 && (
          <div className="flex flex-wrap items-end gap-2">
            <Slider className="min-w-[200px] flex-1" label="Direction θ" value={theta} min={0} max={179} onChange={setTheta} format={(v) => `${v}°`} testId="pca-theta" />
            <Button size="sm" onClick={sweep}>Sweep 0°→180°</Button>
            {stage >= 4 && (
              <Button size="sm" variant="primary" onClick={() => setTheta(Math.round(theta1))}>
                Snap to v₁
              </Button>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Swatch color={C.blue}>observation</Swatch>
          <Swatch color={C.yellow} shape="line">mean, PC1</Swatch>
          <Swatch color={C.mode} shape="line">PC2</Swatch>
          {stage >= 2 && <Swatch color={C.cyan}>projection</Swatch>}
          {stage >= 6 && <Swatch color={C.neg} shape="line">information lost</Swatch>}
        </div>
      </div>

      {/* Side panel: evolving mathematics */}
      <div className="min-w-0 space-y-3 text-[0.9em]" data-testid="pca-panel">
        <StageText stage={stage} />
        {stage >= 2 && (
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-muted">Variance along the direction</span>
              <span className="tabular font-semibold text-cyan" data-testid="pca-var-u">uᵀΣu = {fmt(varU, 3)}</span>
            </div>
            <Chart label="Projected variance as a function of direction" height={150} minWidth={220}>
              {(w, h) => {
                const pad = { l: 36, r: 10, t: 12, b: 26 };
                const X = linearScale([0, 180], [pad.l, w - pad.r]);
                const Y = linearScale([0, pc1.value * 1.12], [h - pad.b, pad.t]);
                const d = curve.map(([a, v], i) => `${i ? 'L' : 'M'}${X(a)},${Y(v)}`).join('');
                return (
                  <g>
                    <line x1={pad.l} x2={w - pad.r} y1={h - pad.b} y2={h - pad.b} stroke={C.muted} />
                    {[0, 45, 90, 135, 180].map((a) => (
                      <text key={a} x={X(a)} y={h - 8} fontSize={10.5} textAnchor="middle" fill={C.dim}>{a}°</text>
                    ))}
                    <text x={pad.l - 4} y={Y(0)} fontSize={10.5} textAnchor="end" fill={C.dim}>0</text>
                    <path d={d} fill="none" stroke={C.cyan} strokeWidth={2} />
                    {stage >= 3 && (
                      <g fontSize={10.5}>
                        <circle cx={X(0)} cy={Y(S[0][0])} r={3.5} fill={C.blue} />
                        <circle cx={X(90)} cy={Y(S[1][1])} r={3.5} fill={C.blue} />
                        <text x={X(90) + 6} y={Y(S[1][1]) - 6} fill={C.blue}>Var(x₂)</text>
                        <text x={X(0) + 6} y={Y(S[0][0]) - 6} fill={C.blue}>Var(x₁)</text>
                      </g>
                    )}
                    {stage >= 5 && (
                      <g fontSize={10.5} fontWeight={700}>
                        <circle cx={X(theta1)} cy={Y(pc1.value)} r={4.5} fill={C.yellow} />
                        <text x={X(theta1)} y={Y(pc1.value) - 6} textAnchor="middle" fill={C.yellow}>max = λ₁</text>
                        <circle cx={X(theta2)} cy={Y(pc2.value)} r={4.5} fill={C.mode} />
                        <text x={X(theta2)} y={Y(pc2.value) - 7} textAnchor="middle" fill={C.mode}>min = λ₂</text>
                      </g>
                    )}
                    <line x1={X(toHalfTurn(thetaAnim))} x2={X(toHalfTurn(thetaAnim))} y1={pad.t} y2={h - pad.b} stroke={C.ink} strokeDasharray="3 3" opacity={0.6} />
                    <circle cx={X(toHalfTurn(thetaAnim))} cy={Y(varU)} r={4} fill={C.ink} />
                  </g>
                );
              }}
            </Chart>
          </div>
        )}
        {stage >= 3 && (
          <div className="rounded-xl border border-line bg-panel px-3 py-2">
            <Tex display>{`\\Sigma = \\begin{bmatrix} ${svar(0, 0)} & ${svar(0, 1)} \\\\ ${svar(1, 0)} & ${svar(1, 1)} \\end{bmatrix}`}</Tex>
            <p className="text-[0.85em] text-muted">Sample covariance (÷ n − 1, as NumPy's np.cov), n = {xs.length}.</p>
          </div>
        )}
        {stage >= 4 && (
          <div className="rounded-xl border border-line bg-panel px-3 py-2">
            <Tex display>{`\\Sigma\\,\\mathbf v = \\lambda\\,\\mathbf v`}</Tex>
            <div className="grid gap-1 tabular text-[0.9em]">
              <span>
                <span className="font-semibold text-yellow">v₁</span> = ({fmt(pc1.vector[0], 3)}, {fmt(pc1.vector[1], 3)}) · θ = {fmt(theta1, 1)}°
                {stage >= 5 && <> · <span className="text-yellow">λ₁ = {fmt(pc1.value, 4)}</span></>}
              </span>
              <span>
                <span className="font-semibold text-mode">v₂</span> = ({fmt(pc2.vector[0], 3)}, {fmt(pc2.vector[1], 3)}) · θ = {fmt(theta2, 1)}°
                {stage >= 5 && <> · <span className="text-mode">λ₂ = {fmt(pc2.value, 4)}</span></>}
              </span>
              {stage >= 5 && (
                <span className="text-muted">
                  λ₁ + λ₂ = {fmt(pc1.value + pc2.value, 4)} = Var(x₁) + Var(x₂) (trace of Σ)
                </span>
              )}
            </div>
          </div>
        )}
        {stage >= 7 && (
          <div className="rounded-xl border border-yellow/40 bg-panel p-3" data-testid="pca-retained">
            <div className="mb-2 font-semibold">2 numbers per flower → 1 number per flower</div>
            <div className="flex h-7 w-full overflow-hidden rounded-md border border-line">
              <div className="flex items-center justify-center bg-yellow/70 text-[0.8em] font-semibold text-canvas" style={{ width: `${retained * 100}%` }}>
                {retained > 0.12 ? `kept ${pct(retained)}` : ''}
              </div>
              <div className="flex flex-1 items-center justify-center bg-neg/40 text-[0.8em] text-ink">{1 - retained > 0.12 ? `lost ${pct(1 - retained)}` : ''}</div>
            </div>
            <p className="mt-2 text-[0.88em] text-ink/90">
              Kept: λ₁ / (λ₁ + λ₂) = {fmt(pc1.value, 3)} / {fmt(pc1.value + pc2.value, 3)} = <b className="text-yellow">{pct(retained)}</b>.
              Lost: the variance of the orange residuals, which is exactly λ₂ = {fmt(pc2.value, 3)}.
            </p>
            {dataset === 'synthetic' && (
              <p className="mt-1 text-[0.8em] text-muted">Generating angle {genAngle}°; PCA recovered {fmt(theta1, 1)}° from the sample alone.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StageText({ stage }: { stage: number }) {
  const lines: [string, string][] = [
    ['Raw data', 'Each flower is one point. The yellow cross is the mean μ.'],
    ['1 · Centre the cloud', 'Subtract the mean from every point: x̃ = x − μ. The cloud now sits at the origin; its shape is unchanged.'],
    ['2 · Directions of variation', 'Project every point onto a line through the origin (unit vector u). The spread of the cyan feet is the variance along u. Sweep θ: the variance depends on direction.'],
    ['3 · The covariance matrix', 'The variance along any direction u is uᵀΣu. At θ = 0° it equals Var(x₁); at 90°, Var(x₂). Σ encodes the whole curve.'],
    ['4 · Eigenvectors are directions', 'The eigenvectors of Σ point exactly at the maximum and the minimum of the curve. They are perpendicular because Σ is symmetric.'],
    ['5 · Eigenvalues are variances', 'λ is the variance of the data along its eigenvector: λ₁ is the peak of the curve, λ₂ the valley. The dashed ellipse has semi-axes 2√λ.'],
    ['6 · Project onto PC1', 'Each point is replaced by its shadow on v₁: one coordinate instead of two. The orange segments are what the projection discards.'],
    ['7 · Retained and lost', 'The fraction of total variance kept is λ₁ / (λ₁ + λ₂).'],
  ];
  const [title, body] = lines[Math.min(stage, 7)];
  return (
    <div className="rounded-xl border border-line bg-panel-2/60 p-3" aria-live="polite">
      <div className="font-semibold text-yellow">{title}</div>
      <p className="mt-1 leading-snug text-ink/90">{body}</p>
    </div>
  );
}
