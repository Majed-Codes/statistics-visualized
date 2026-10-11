/**
 * One or more datasets as dots on a shared number line. Repeated values stack
 * vertically. Optional markers (mean, median, quartiles…) and bands (μ ± σ,
 * the IQR…) are drawn per row in their semantic colours. Positions tween
 * smoothly when the data change.
 */
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { linearScale, padExtent } from '../../lib/scale';
import { fmt } from '../../lib/format';
import { C, HALO, stackRows, Svg, XAxis } from './primitives';

export interface DotRow {
  label?: string;
  values: number[];
  color?: string;
  /** Per-value colour override, e.g. orange for flagged outliers. */
  colors?: (string | undefined)[];
  /** Indices to draw dimmed (e.g. the half not being used). */
  dim?: number[];
  /** Indices to ring (e.g. the middle value). */
  ring?: number[];
}

export interface Marker {
  value: number;
  label: string;
  color: string;
  row?: number;
  /** Dashed line, label below the row. */
  below?: boolean;
}

export interface Band {
  from: number;
  to: number;
  color: string;
  row?: number;
  label?: string;
}

interface DotPlotProps {
  rows: DotRow[];
  markers?: Marker[];
  bands?: Band[];
  domain?: [number, number];
  showValues?: boolean;
  format?: (v: number) => string;
  label: string;
  rowHeight?: number;
  testId?: string;
}

export function DotPlot({ rows, markers = [], bands = [], domain, showValues = true, format = (v) => fmt(v), label, rowHeight, testId }: DotPlotProps) {
  const [ref, w] = useMeasure<HTMLDivElement>(640);
  const all = rows.flatMap((r) => r.values);
  const dom = domain ?? padExtent(all, 0.08);
  const rh = rowHeight ?? (w < 480 ? 96 : 108);
  const h = rows.length * rh + 34;
  const hasLabels = rows.some((r) => r.label);
  const left = hasLabels ? (w < 480 ? 30 : 64) : 20;
  const x = linearScale(dom, [left, w - 20]);

  // Everything that moves, as one tweened array: dots, then markers, then bands (x, width).
  const target = [
    ...rows.flatMap((r) => r.values.map((v) => x(v))),
    ...markers.map((m) => x(m.value)),
    ...bands.flatMap((b) => [x(Math.min(b.from, b.to)), Math.abs(x(b.to) - x(b.from))]),
  ];
  const t = useTween(target, 450);
  let cursor = 0;

  return (
    <div ref={ref} className="w-full min-w-0" data-testid={testId ?? 'dot-plot'}>
      <Svg width={w} height={h} label={label}>
        {rows.map((row, ri) => {
          const base = ri * rh + rh - 34;
          const counts = new Map<number, number>();
          const stackIdx = row.values.map((v) => {
            const k = counts.get(v) ?? 0;
            counts.set(v, k + 1);
            return k;
          });
          const pxs = row.values.map(() => t[cursor++]);
          const labelRows = stackRows(pxs, w < 480 ? 30 : 38);
          return (
            <g key={ri}>
              {row.label && (
                <text x={4} y={base - 4} fontSize={14} fontWeight={700} fill={row.color ?? C.blue}>
                  {row.label}
                </text>
              )}
              <line x1={left} x2={w - 20} y1={base} y2={base} stroke={C.line} strokeWidth={1.5} />
              {row.values.map((v, i) => {
                const color = row.colors?.[i] ?? row.color ?? C.blue;
                const dimmed = row.dim?.includes(i);
                const ringed = row.ring?.includes(i);
                return (
                  <g key={i}>
                    <circle cx={pxs[i]} cy={base - 9 - stackIdx[i] * 15} r={7} fill={color} opacity={dimmed ? 0.25 : 1} stroke={ringed ? C.cyan : C.canvas} strokeWidth={ringed ? 3 : 1.5} />
                    {showValues && stackIdx[i] === 0 && (
                      <text x={pxs[i]} y={base + 17 + labelRows[i] * 13} textAnchor="middle" fontSize={11.5} fill={dimmed ? C.dim : C.ink}>
                        {format(v)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {markers.map((m, i) => {
          const px = t[cursor++];
          const base = (m.row ?? 0) * rh + rh - 34;
          return (
            <g key={`m${i}`}>
              <line x1={px} x2={px} y1={base - 50} y2={base + 4} stroke={m.color} strokeWidth={2.5} strokeDasharray={m.below ? '4 3' : undefined} />
              <text x={px} y={m.below ? base + 46 : base - 56} textAnchor="middle" fontSize={12} fontWeight={700} fill={m.color}>
                {m.label}
              </text>
            </g>
          );
        })}
        {bands.map((b, i) => {
          const bx = t[cursor++];
          const bw = Math.max(0, t[cursor++]);
          const base = (b.row ?? 0) * rh + rh - 34;
          return (
            <g key={`b${i}`}>
              <rect x={bx} y={base - 40} width={bw} height={40} fill={b.color} fillOpacity={0.12} stroke={b.color} strokeOpacity={0.6} rx={4} />
              {b.label && (
                <text x={bx + bw - 6} y={base - 28} textAnchor="end" fontSize={11.5} fill={b.color} fontWeight={700} {...HALO}>
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
        <XAxis scale={x} y={rows.length * rh + 4} format={format} tickCount={w < 480 ? 4 : 8} />
      </Svg>
    </div>
  );
}
