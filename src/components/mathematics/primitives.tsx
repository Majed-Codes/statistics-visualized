/**
 * Shared SVG building blocks. All charts are plain SVG with a viewBox equal
 * to their measured pixel size, so text stays at a readable pixel size on a
 * phone and on a projector (no global scaling that shrinks labels to nothing).
 */
import type { ReactNode } from 'react';
import { useMeasure } from '../../hooks/useMeasure';
import { THEMES, type Theme } from '../../styles/themes';
import type { LinearScale } from '../../lib/scale';

/**
 * Chart palette. Mutable: `applyTheme()` rewrites it for the section being
 * rendered, so every chart picks up the section's shades while each colour
 * keeps its mathematical meaning (see src/styles/themes.ts).
 */
export const C = {
  blue: THEMES.base.data,
  cyan: THEMES.base.median,
  yellow: THEMES.base.focus,
  ink: THEMES.base.fg,
  muted: THEMES.base.mut,
  dim: THEMES.base.dim,
  line: THEMES.base.line,
  lineSoft: THEMES.base.lineSoft,
  panel: THEMES.base.card,
  canvas: THEMES.base.bg,
  pos: THEMES.base.pos,
  neg: THEMES.base.neg,
  mode: THEMES.base.mode,
  ac: THEMES.base.ac,
  bd: THEMES.base.bd,
  species: [...THEMES.base.species] as string[],
};

/** Dark/light outline behind SVG text so labels stay legible on top of data points. */
export const HALO = { paintOrder: 'stroke' as const, stroke: THEMES.base.bg, strokeWidth: 4, strokeLinejoin: 'round' as const };

export function applyTheme(t: Theme) {
  Object.assign(C, {
    blue: t.data, cyan: t.median, yellow: t.focus, ink: t.fg, muted: t.mut, dim: t.dim, line: t.line, lineSoft: t.lineSoft,
    panel: t.card, canvas: t.bg, pos: t.pos, neg: t.neg, mode: t.mode, ac: t.ac, bd: t.bd, species: [...t.species],
  });
  HALO.stroke = t.bg;
}

interface ChartProps {
  height: number | ((width: number) => number);
  children: (width: number, height: number) => ReactNode;
  label: string;
  className?: string;
  testId?: string;
  minWidth?: number;
}

/** Measures its container and renders an SVG of exactly that size. */
export function Chart({ height, children, label, className = '', testId, minWidth = 260 }: ChartProps) {
  const [ref, width] = useMeasure<HTMLDivElement>(640, minWidth);
  const h = typeof height === 'function' ? height(width) : height;
  return (
    <div ref={ref} className={`w-full min-w-0 ${className}`} data-testid={testId}>
      <svg
        width={width}
        height={h}
        viewBox={`0 0 ${width} ${h}`}
        role="img"
        aria-label={label}
        className="block overflow-visible"
        style={{ touchAction: 'pan-y' }}
        data-interactive="true"
      >
        {children(width, h)}
      </svg>
    </div>
  );
}

/** Bare SVG with the shared attributes, for components that measure their own width. */
export function Svg({ width, height, label, children }: { width: number; height: number; label: string; children: ReactNode }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="block overflow-visible" style={{ touchAction: 'pan-y' }} data-interactive="true">
      {children}
    </svg>
  );
}

interface AxisProps {
  scale: LinearScale;
  y: number;
  ticks?: number[];
  format?: (v: number) => string;
  label?: string;
  tickCount?: number;
}

export function XAxis({ scale, y, ticks, format = String, label, tickCount = 6 }: AxisProps) {
  const t = ticks ?? scale.ticks(tickCount);
  const [r0, r1] = scale.range;
  return (
    <g>
      <line x1={r0} x2={r1} y1={y} y2={y} stroke={C.muted} strokeWidth={1.25} />
      {t.map((v) => (
        <g key={v} transform={`translate(${scale(v)},${y})`}>
          <line y2={5} stroke={C.muted} />
          <text y={19} textAnchor="middle" fontSize={12} fill={C.muted}>
            {format(v)}
          </text>
        </g>
      ))}
      {label && (
        <text x={(r0 + r1) / 2} y={y + 38} textAnchor="middle" fontSize={12.5} fill={C.muted}>
          {label}
        </text>
      )}
    </g>
  );
}

interface YAxisProps {
  scale: LinearScale;
  x: number;
  ticks?: number[];
  format?: (v: number) => string;
  label?: string;
  tickCount?: number;
}

export function YAxis({ scale, x, ticks, format = String, label, tickCount = 5 }: YAxisProps) {
  const t = ticks ?? scale.ticks(tickCount);
  const [r0, r1] = scale.range;
  return (
    <g>
      <line x1={x} x2={x} y1={r0} y2={r1} stroke={C.muted} strokeWidth={1.25} />
      {t.map((v) => (
        <g key={v} transform={`translate(${x},${scale(v)})`}>
          <line x2={-5} stroke={C.muted} />
          <text x={-8} dy="0.32em" textAnchor="end" fontSize={12} fill={C.muted}>
            {format(v)}
          </text>
        </g>
      ))}
      {label && (
        <text transform={`translate(${x - 40},${(r0 + r1) / 2}) rotate(-90)`} textAnchor="middle" fontSize={12.5} fill={C.muted}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Light grid lines behind a 2D plot. */
export function Grid({ xs, ys, x, y }: { xs: number[]; ys: number[]; x: LinearScale; y: LinearScale }) {
  return (
    <g stroke={C.lineSoft} strokeWidth={1}>
      {xs.map((v) => (
        <line key={`x${v}`} x1={x(v)} x2={x(v)} y1={y.range[0]} y2={y.range[1]} />
      ))}
      {ys.map((v) => (
        <line key={`y${v}`} y1={y(v)} y2={y(v)} x1={x.range[0]} x2={x.range[1]} />
      ))}
    </g>
  );
}

/**
 * Assign each label a row so labels in the same row are at least `gap` px
 * apart. Used to keep crowded value labels (e.g. four salaries near 5,000)
 * legible instead of overprinting.
 */
export function stackRows(pxs: readonly number[], gap: number): number[] {
  const order = pxs.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const lastInRow: number[] = [];
  const rows = new Array<number>(pxs.length).fill(0);
  for (const { p, i } of order) {
    let r = 0;
    while (lastInRow[r] !== undefined && p - lastInRow[r] < gap) r++;
    lastInRow[r] = p;
    rows[i] = r;
  }
  return rows;
}

/** Legend chip. */
export function Swatch({ color, children, shape = 'dot' }: { color: string; children: ReactNode; shape?: 'dot' | 'line' | 'square' }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.8em] text-muted">
      {shape === 'dot' && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {shape === 'square' && <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />}
      {shape === 'line' && <span className="inline-block h-0.5 w-4" style={{ background: color }} />}
      {children}
    </span>
  );
}
