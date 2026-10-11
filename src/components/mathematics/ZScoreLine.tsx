/**
 * Distance from the mean, measured in standard deviations.
 *
 * Histogram of a real feature, a ruler marked every σ from μ, and one
 * observation x. The bracket from μ to x is cut into σ-long pieces, so z is
 * literally "how many σ-rulers fit between μ and x". The optional normal curve
 * uses the same μ and σ; comparing it with the bars shows when the
 * 68–95–99.7 rule does and does not apply.
 */
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { binCounts } from './Histogram';
import { linearScale } from '../../lib/scale';
import { fmt } from '../../lib/format';
import { C, HALO, Svg } from './primitives';

interface Props {
  values: number[];
  mu: number;
  sigma: number;
  x: number;
  showNormal: boolean;
  unit: string;
  label: string;
}

const normalPdf = (x: number, mu: number, s: number) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

export function ZScoreLine({ values, mu, sigma, x: obs, showNormal, unit, label }: Props) {
  const [ref, w] = useMeasure<HTMLDivElement>(640);
  const lo = Math.min(mu - 3.6 * sigma, Math.min(...values));
  const hi = Math.max(mu + 3.6 * sigma, Math.max(...values));
  const bins = 30;
  const bw = (hi - lo) / bins;
  const dens = binCounts(values, lo, hi, bins).map((c) => c / (values.length * bw));
  const maxD = Math.max(...dens, normalPdf(mu, mu, sigma));
  const h = w < 480 ? 290 : 320;
  const pad = 20;
  const X = linearScale([lo, hi], [pad, w - pad]);
  const histBase = h - 132;
  const Y = linearScale([0, maxD * 1.05], [histBase, 18]);
  const rulerY = h - 92;
  const bracketY = h - 46;
  const z = (obs - mu) / sigma;

  const [ox, mx] = useTween([X(obs), X(mu)], 250);
  const curve = Array.from({ length: 161 }, (_, i) => {
    const xv = lo + ((hi - lo) * i) / 160;
    return `${i ? 'L' : 'M'}${X(xv)},${Y(normalPdf(xv, mu, sigma))}`;
  }).join('');

  const whole = Math.floor(Math.abs(z));
  const dir = z >= 0 ? 1 : -1;

  return (
    <div ref={ref} className="w-full min-w-0" data-testid="zscore-line">
      <Svg width={w} height={h} label={label}>
        {/* bands at ±1σ, ±2σ, ±3σ */}
        {[3, 2, 1].map((k) => (
          <rect key={k} x={X(mu - k * sigma)} y={14} width={X(mu + k * sigma) - X(mu - k * sigma)} height={histBase - 14} fill={C.yellow} fillOpacity={0.035 * (4 - k)} />
        ))}
        {dens.map((d, i) =>
          d > 0 ? <rect key={i} x={X(lo + i * bw) + 0.5} y={Y(d)} width={Math.max(0, X(lo + (i + 1) * bw) - X(lo + i * bw) - 1)} height={histBase - Y(d)} fill={C.blue} fillOpacity={0.7} /> : null,
        )}
        {showNormal && <path d={curve} fill="none" stroke={C.yellow} strokeWidth={2} strokeDasharray="6 4" />}
        <line x1={pad} x2={w - pad} y1={histBase} y2={histBase} stroke={C.muted} />

        {/* σ ruler */}
        <line x1={pad} x2={w - pad} y1={rulerY} y2={rulerY} stroke={C.muted} strokeWidth={1.2} />
        {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={X(mu + k * sigma)} x2={X(mu + k * sigma)} y1={rulerY - 6} y2={rulerY + 6} stroke={k === 0 ? C.yellow : C.muted} strokeWidth={k === 0 ? 3 : 1.5} />
            <text x={X(mu + k * sigma)} y={rulerY + 20} textAnchor="middle" fontSize={11.5} fill={k === 0 ? C.yellow : C.muted}>
              {k === 0 ? 'μ' : `${k > 0 ? '+' : '−'}${Math.abs(k)}σ`}
            </text>
            <text x={X(mu + k * sigma)} y={rulerY - 10} textAnchor="middle" fontSize={10.5} fill={C.dim}>
              {fmt(mu + k * sigma, 2)}
            </text>
          </g>
        ))}

        {/* bracket from μ to x in σ-sized pieces */}
        {Array.from({ length: whole }, (_, i) => (
          <rect key={i} x={Math.min(X(mu + dir * i * sigma), X(mu + dir * (i + 1) * sigma))} y={bracketY - 7} width={Math.abs(X(sigma) - X(0))} height={14} fill={i % 2 ? C.yellow : C.blue} fillOpacity={0.45} stroke={C.canvas} />
        ))}
        <rect
          x={Math.min(X(mu + dir * whole * sigma), ox)}
          y={bracketY - 7}
          width={Math.abs(ox - X(mu + dir * whole * sigma))}
          height={14}
          fill={whole % 2 ? C.yellow : C.blue}
          fillOpacity={0.2}
          stroke={C.canvas}
        />
        <text x={(mx + ox) / 2} y={bracketY + 26} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink} {...HALO}>
          distance = {fmt(obs - mu, 2)} {unit} = {fmt(z, 2)} × σ
        </text>

        {/* the observation */}
        <line x1={ox} x2={ox} y1={14} y2={bracketY + 8} stroke={C.yellow} strokeWidth={2.5} />
        <circle cx={ox} cy={rulerY} r={7} fill={C.yellow} stroke={C.canvas} strokeWidth={2} />
        <text x={ox} y={12} textAnchor={ox > w - 90 ? 'end' : ox < 90 ? 'start' : 'middle'} fontSize={13} fontWeight={700} fill={C.yellow} {...HALO}>
          x = {fmt(obs, 2)} → z = {fmt(z, 2)}
        </text>
      </Svg>
    </div>
  );
}
