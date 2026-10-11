/**
 * Mean vs median as physics.
 *
 * Observations are equal weights sitting on a beam (the number line).
 * The fulcrum can be placed at the mean or at the median. The beam tilts by
 * the net torque Σ(xᵢ − pivot): it is exactly zero — the beam is level — only
 * when the pivot is the mean, because deviations from the mean sum to zero.
 * The median is the middle weight (cyan ring).
 */
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { mean, median } from '../../lib/statistics';
import { linearScale, padExtent } from '../../lib/scale';
import { C, stackRows, Svg, XAxis } from './primitives';

export type Pivot = 'mean' | 'median';

interface BalanceBeamProps {
  values: number[];
  format: (v: number) => string;
  showMean?: boolean;
  showMedian?: boolean;
  showDeviations?: boolean;
  pivot?: Pivot;
  domain?: [number, number];
  /** Index of the value currently controlled by a slider (drawn with a dashed ring). */
  activeIndex?: number;
  label: string;
}

export function BalanceBeam({ values, format, showMean = true, showMedian = true, showDeviations = false, pivot = 'mean', domain, activeIndex, label }: BalanceBeamProps) {
  const [ref, w] = useMeasure<HTMLDivElement>(640);
  const n = values.length;
  const mu = mean(values);
  const med = median(values);
  const order = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const middleIdx = n % 2 === 1 ? [order[(n - 1) / 2].i] : [order[n / 2 - 1].i, order[n / 2].i];
  const dom = domain ?? padExtent(values, 0.1);

  const pivotValue = pivot === 'mean' ? mu : med;
  const torque = values.reduce((s, v) => s + (v - pivotValue), 0);
  const spread = Math.max(1e-9, Math.max(...values) - Math.min(...values));
  const level = Math.abs(torque) < 1e-9 * spread * n;
  // Tilt (degrees) proportional to the net torque, capped so the scene stays readable.
  const tiltTarget = showMean ? Math.max(-11, Math.min(11, (torque / (n * spread)) * 40)) : 0;

  const devBlock = showDeviations ? 34 + n * 9 : 0;
  const h = 222 + devBlock;
  const margin = w < 480 ? 22 : 40;
  const x = linearScale(dom, [margin, w - margin]);
  const beamY = h - 120;
  const axisY = beamY + 46;
  const r = w < 480 ? 7 : 9;

  const target = [...values.map((v) => x(v)), x(mu), x(med), x(pivotValue), tiltTarget];
  const t = useTween(target, 420);
  const pxs = t.slice(0, n);
  const [muX, medX, pivotX, tilt] = t.slice(n);
  const rows = stackRows(pxs, w < 480 ? 46 : 58);
  const labelsClose = Math.abs(muX - medX) < 120;
  const left = values.filter((v) => v < mu).reduce((s, v) => s + v - mu, 0);
  const right = values.filter((v) => v > mu).reduce((s, v) => s + v - mu, 0);

  return (
    <div ref={ref} className="w-full min-w-0" data-testid="balance-beam">
      <Svg width={w} height={h} label={label}>
        {showDeviations && (
          <g>
            <text x={margin - 10} y={14} fontSize={12} fill={C.muted}>
              deviations xᵢ − μ · left Σ = {format(left)} · right Σ = +{format(right)}
            </text>
            {values.map((v, i) => (
              <line key={`d${i}`} x1={muX} x2={pxs[i]} y1={28 + i * 9} y2={28 + i * 9} stroke={v < mu ? C.cyan : C.blue} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
            ))}
          </g>
        )}

        {/* Beam and weights, rotated about the pivot by the net torque. */}
        <g transform={`rotate(${tilt} ${pivotX} ${beamY})`}>
          <line x1={margin - 10} x2={w - margin + 10} y1={beamY} y2={beamY} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
          {values.map((_, i) => {
            const isMid = showMedian && middleIdx.includes(i);
            return (
              <g key={i}>
                <circle cx={pxs[i]} cy={beamY - r - 1.5} r={r} fill={C.blue} stroke={isMid ? C.cyan : C.canvas} strokeWidth={isMid ? 3 : 1.5} />
                {activeIndex === i && <circle cx={pxs[i]} cy={beamY - r - 1.5} r={r + 5} fill="none" stroke={C.yellow} strokeDasharray="3 3" />}
              </g>
            );
          })}
        </g>

        {values.map((v, i) => (
          <text key={`l${i}`} x={pxs[i]} y={beamY - 2 * r - 12 - rows[i] * 16} textAnchor="middle" fontSize={12} fill={C.ink} opacity={0.9}>
            {format(v)}
          </text>
        ))}

        {showMean && <path d={`M${pivotX} ${beamY + 2} l-13 22 l26 0 Z`} fill={pivot === 'mean' ? C.yellow : C.cyan} />}

        <XAxis scale={x} y={axisY} format={format} tickCount={w < 480 ? 3 : 6} />

        {showMean && (
          <g>
            <line x1={muX} x2={muX} y1={axisY - 8} y2={axisY + 8} stroke={C.yellow} strokeWidth={3} />
            <text x={muX} y={axisY + 40} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={C.yellow}>
              mean μ = {format(mu)}
            </text>
          </g>
        )}
        {showMedian && (
          <g>
            <line x1={medX} x2={medX} y1={axisY - 8} y2={axisY + 8} stroke={C.cyan} strokeWidth={3} />
            <text x={medX} y={axisY + (showMean && labelsClose ? 57 : 40)} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={C.cyan}>
              median = {format(med)}
            </text>
          </g>
        )}
      </Svg>
      {showMean && (
        <p className={`mt-1 text-[0.8em] ${level ? 'text-pos' : 'text-neg'}`} data-testid="beam-status">
          Fulcrum at the {pivot}: {level ? 'the beam is level, because Σ(x − μ) = 0.' : `the beam tips — net torque Σ(x − pivot) = ${format(torque)}.`}
        </p>
      )}
    </div>
  );
}
