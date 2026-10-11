/**
 * Histogram of one or more series on shared bins. With `density`, bar heights
 * are proportions, so a 200-value sample and a 2,000-value population can be
 * compared on the same axis.
 */
import { useMeasure } from '../../hooks/useMeasure';
import { linearScale, padExtent } from '../../lib/scale';
import { fmt } from '../../lib/format';
import { C, HALO, Svg, XAxis } from './primitives';

export interface HistSeries {
  values: number[];
  color: string;
  label: string;
  /** Draw as an outline instead of filled bars. */
  outline?: boolean;
}

export interface HistMarker {
  value: number;
  color: string;
  label: string;
}

interface HistogramProps {
  series: HistSeries[];
  bins?: number;
  domain?: [number, number];
  density?: boolean;
  markers?: HistMarker[];
  height?: number;
  label: string;
  format?: (v: number) => string;
  /** Optional overlay curve in data units (x, density). */
  curve?: (x: number) => number;
  curveColor?: string;
  testId?: string;
}

export function binCounts(values: readonly number[], lo: number, hi: number, bins: number): number[] {
  const counts = new Array<number>(bins).fill(0);
  const width = (hi - lo) / bins;
  for (const v of values) {
    let b = Math.floor((v - lo) / width);
    if (b === bins && v === hi) b = bins - 1;
    if (b >= 0 && b < bins) counts[b]++;
  }
  return counts;
}

export function Histogram({ series, bins = 20, domain, density = false, markers = [], height = 190, label, format = (v) => fmt(v, 1), curve, curveColor = C.yellow, testId }: HistogramProps) {
  const [ref, w] = useMeasure<HTMLDivElement>(560);
  const all = series.flatMap((s) => s.values);
  const [lo, hi] = domain ?? padExtent(all, 0.02);
  const bw = (hi - lo) / bins;
  const heights = series.map((s) => {
    const c = binCounts(s.values, lo, hi, bins);
    return density ? c.map((k) => k / (s.values.length * bw)) : c;
  });
  let maxH = Math.max(1e-9, ...heights.flat());
  if (curve) for (let i = 0; i <= 60; i++) maxH = Math.max(maxH, curve(lo + ((hi - lo) * i) / 60));
  const pad = { l: 12, r: 12, t: 22, b: 30 };
  const x = linearScale([lo, hi], [pad.l, w - pad.r]);
  const y = linearScale([0, maxH * 1.08], [height - pad.b, pad.t]);
  const curvePath = curve
    ? Array.from({ length: 121 }, (_, i) => {
        const xv = lo + ((hi - lo) * i) / 120;
        return `${i ? 'L' : 'M'}${x(xv)},${y(curve(xv))}`;
      }).join('')
    : '';

  return (
    <div ref={ref} className="w-full min-w-0" data-testid={testId ?? 'histogram'}>
      <Svg width={w} height={height} label={label}>
        {heights.map((hs, si) => {
          const s = series[si];
          return (
            <g key={si}>
              {hs.map((v, b) =>
                v > 0 ? (
                  <rect
                    key={b}
                    x={x(lo + b * bw) + 0.5}
                    y={y(v)}
                    width={Math.max(0, x(lo + (b + 1) * bw) - x(lo + b * bw) - 1)}
                    height={Math.max(0, y(0) - y(v))}
                    fill={s.outline ? 'none' : s.color}
                    fillOpacity={s.outline ? 0 : series.length > 1 ? 0.55 : 0.75}
                    stroke={s.outline ? s.color : 'none'}
                    strokeWidth={s.outline ? 1.6 : 0}
                  />
                ) : null,
              )}
            </g>
          );
        })}
        {curve && <path d={curvePath} fill="none" stroke={curveColor} strokeWidth={2} strokeDasharray="5 4" />}
        <XAxis scale={x} y={height - pad.b} format={format} tickCount={w < 480 ? 4 : 8} />
        {markers.map((m, i) => (
          <g key={i}>
            <line x1={x(m.value)} x2={x(m.value)} y1={pad.t - 4} y2={height - pad.b} stroke={m.color} strokeWidth={2.2} />
            <text x={x(m.value)} y={pad.t - 8 + (i % 2) * 0} dx={i % 2 ? 4 : -4} textAnchor={i % 2 ? 'start' : 'end'} fontSize={12} fontWeight={700} fill={m.color} {...HALO}>
              {m.label}
            </text>
          </g>
        ))}
      </Svg>
    </div>
  );
}
