/**
 * The geometry of variance.
 *
 * stage 0 — the observations on a number line
 * stage 1 — the mean μ
 * stage 2 — each deviation xᵢ − μ as a signed segment
 * stage 3 — each squared deviation as a literal square of side |xᵢ − μ|
 * stage 4 — the squares laid side by side: their total area is Σ(xᵢ − μ)²
 * stage 5 — that total area cut into N (or n − 1) equal squares: each has area σ² (or s²)
 * stage 6 — the side length of one such square is σ (or s), shown as μ ± σ on the line
 *
 * One pixel scale is used for both axes, so the squares are geometrically true.
 */
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { mean, sumOfSquares, type Ddof } from '../../lib/statistics';
import { linearScale } from '../../lib/scale';
import { fmt } from '../../lib/format';
import { C, Svg, XAxis } from './primitives';

interface VarianceSquaresProps {
  values: number[];
  stage: number;
  ddof: Ddof;
  label: string;
  /** Fix the number-line domain so two datasets can be compared on the same scale. */
  domain?: [number, number];
  maxHeight?: number;
}

export function VarianceSquares({ values, stage, ddof, label, domain, maxHeight = 300 }: VarianceSquaresProps) {
  const [ref, w] = useMeasure<HTMLDivElement>(640);
  const n = values.length;
  const mu = mean(values);
  const devs = values.map((v) => v - mu);
  const ss = sumOfSquares(values);
  const k = n - ddof; // number of equal squares the total area is cut into
  const v = ss / k;
  const sd = Math.sqrt(v);
  const maxDev = Math.max(...devs.map(Math.abs), 1e-9);
  const lo = domain?.[0] ?? Math.min(...values) - maxDev * 0.35;
  const hi = domain?.[1] ?? Math.max(...values) + maxDev * 0.35;
  const sides = devs.map(Math.abs);
  const rowUnits = Math.max(sides.reduce((a, b) => a + b, 0), k * sd);
  const tallest = Math.max(maxDev, sd);

  // One unit → `unit` px horizontally AND vertically.
  const unit = Math.min((w - 48) / Math.max(hi - lo, rowUnits * 1.08), (maxHeight - 96) / tallest);
  const h = Math.round(Math.max(170, tallest * unit + 100));
  const span = (w - 48) / unit;
  const mid = (lo + hi) / 2;
  const x = linearScale([mid - span / 2, mid + span / 2], [24, w - 24]);
  const axisY = h - 44;
  const base = axisY - 6;
  const mx = x(mu);

  // Target layout for every rectangle: [x, y, width, height, opacity].
  const totalW = sides.reduce((a, b) => a + b, 0) * unit;
  let cursor = mx - totalW / 2;
  const rowX = sides.map((s) => {
    const at = cursor;
    cursor += s * unit;
    return at;
  });
  const eqSide = sd * unit;
  const eqStart = mx - (k * eqSide) / 2;
  const target: number[] = [];
  values.forEach((val, i) => {
    const s = sides[i] * unit;
    const inPlaceX = devs[i] < 0 ? x(val) : mx;
    const px = stage >= 4 ? rowX[i] : inPlaceX;
    // Before stage 3 the square is collapsed onto its deviation segment.
    const size = stage >= 3 ? s : 0;
    target.push(px, base - size, s, size, stage >= 3 && stage < 5 ? 1 : 0);
  });
  for (let j = 0; j < k; j++) {
    const size = stage >= 5 ? eqSide : 0;
    target.push(eqStart + j * eqSide, base - size, eqSide, size, stage >= 5 ? 1 : 0);
  }
  const t = useTween(target, 650);
  const rect = (i: number) => ({ x: t[5 * i], y: t[5 * i + 1], width: Math.max(0, t[5 * i + 2]), height: Math.max(0, t[5 * i + 3]), opacity: t[5 * i + 4] });

  return (
    <div ref={ref} className="w-full min-w-0" data-testid="variance-squares" data-stage={stage}>
      <Svg width={w} height={h} label={label}>
        <XAxis scale={x} y={axisY} tickCount={w < 480 ? 4 : 8} />

        {/* squared deviations */}
        {values.map((_, i) => {
          const r = rect(i);
          return (
            <g key={`sq${i}`} opacity={r.opacity}>
              <rect x={r.x} y={r.y} width={r.width} height={r.height} fill={C.blue} fillOpacity={0.16} stroke={C.blue} strokeWidth={1.5} />
              {r.width > 26 && r.height > 18 && (
                <text x={r.x + r.width / 2} y={r.y + r.height / 2} textAnchor="middle" dy="0.35em" fontSize={12} fill={C.ink}>
                  {fmt(devs[i] ** 2)}
                </text>
              )}
            </g>
          );
        })}
        {stage === 4 && (
          <text x={mx} y={base - maxDev * unit - 10} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.ink}>
            total area Σ(x − μ)² = {fmt(ss)}
          </text>
        )}

        {/* equal squares: the average square */}
        {Array.from({ length: k }, (_, j) => {
          const r = rect(n + j);
          return (
            <rect
              key={`eq${j}`}
              data-testid="equal-square"
              x={r.x}
              y={r.y}
              width={r.width}
              height={r.height}
              opacity={r.opacity}
              fill={C.yellow}
              fillOpacity={j === 0 ? 0.3 : 0.13}
              stroke={C.yellow}
              strokeWidth={1.5}
            />
          );
        })}
        {stage >= 5 && (
          <text x={mx} y={base - eqSide - 10} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.yellow}>
            {k} equal squares · each area {ddof === 0 ? 'σ²' : 's²'} = {fmt(ss)} ÷ {k} = {fmt(v)}
          </text>
        )}
        {stage >= 6 && (
          <g>
            <line x1={eqStart} x2={eqStart} y1={base - eqSide} y2={base} stroke={C.yellow} strokeWidth={3.5} />
            <text x={eqStart - 6} y={base - eqSide / 2} textAnchor="end" dy="0.35em" fontSize={13} fontWeight={700} fill={C.yellow}>
              {ddof === 0 ? 'σ' : 's'} = {fmt(sd)}
            </text>
            <line x1={x(mu - sd)} x2={x(mu + sd)} y1={axisY + 1} y2={axisY + 1} stroke={C.yellow} strokeWidth={5} opacity={0.7} />
            <text x={x(mu + sd)} y={axisY + 36} textAnchor="middle" fontSize={11.5} fill={C.yellow}>
              μ + {ddof === 0 ? 'σ' : 's'}
            </text>
            <text x={x(mu - sd)} y={axisY + 36} textAnchor="middle" fontSize={11.5} fill={C.yellow}>
              μ − {ddof === 0 ? 'σ' : 's'}
            </text>
          </g>
        )}

        {/* deviation segments */}
        {stage >= 2 &&
          stage < 4 &&
          values.map((val, i) => (
            <g key={`dev${i}`}>
              <line x1={mx} x2={x(val)} y1={axisY - 2} y2={axisY - 2} stroke={devs[i] < 0 ? C.cyan : C.blue} strokeWidth={4} />
              {stage === 2 && Math.abs(devs[i]) > 0 && (
                <text x={(mx + x(val)) / 2} y={axisY - 12} textAnchor="middle" fontSize={12} fill={C.ink}>
                  {fmt(devs[i])}
                </text>
              )}
            </g>
          ))}

        {/* observations */}
        {values.map((val, i) => (
          <g key={`pt${i}`}>
            <circle cx={x(val)} cy={axisY} r={7} fill={C.blue} stroke={C.canvas} strokeWidth={2} />
            {stage < 2 && (
              <text x={x(val)} y={axisY - 14} textAnchor="middle" fontSize={12.5} fill={C.ink}>
                {fmt(val)}
              </text>
            )}
          </g>
        ))}

        {/* the mean */}
        {stage >= 1 && (
          <g>
            <line x1={mx} x2={mx} y1={axisY + 8} y2={stage >= 3 ? base - tallest * unit : axisY - 30} stroke={C.yellow} strokeWidth={1.5} strokeDasharray="4 4" />
            {stage < 6 && (
              <text x={mx} y={axisY + 36} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={C.yellow}>
                μ = {fmt(mu)}
              </text>
            )}
          </g>
        )}
      </Svg>
    </div>
  );
}
