/**
 * Two-variable scatterplot used for covariance (slide 46) and correlation
 * (slide 48).
 *
 * With `rectangles`, every point spans a rectangle with the mean point
 * (μx, μy). Its signed area is (x − μx)(y − μy): green when positive
 * (quadrants I and III), orange when negative (II and IV). Covariance is the
 * average signed area — the picture *is* the formula.
 */
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { linearScale, niceTicks, padExtent } from '../../lib/scale';
import { fmt } from '../../lib/format';
import { mean } from '../../lib/statistics';
import { C, HALO, Svg } from './primitives';

interface Props {
  xs: number[];
  ys: number[];
  rectangles?: boolean;
  xLabel: string;
  yLabel: string;
  label: string;
  highlight?: number;
  /** Optional per-point colours (e.g. species). */
  colors?: string[];
  height?: number;
  fit?: { slope: number; intercept: number };
  domainX?: [number, number];
  domainY?: [number, number];
}

export function RelationshipScatter({ xs, ys, rectangles = false, xLabel, yLabel, label, colors, height, fit, domainX, domainY }: Props) {
  const [ref, w] = useMeasure<HTMLDivElement>(520);
  const h = height ?? Math.round(Math.max(240, Math.min(380, w * 0.68)));
  const pad = { l: 46, r: 14, t: 14, b: 40 };
  const dx = domainX ?? padExtent(xs, 0.08);
  const dy = domainY ?? padExtent(ys, 0.08);
  const X = linearScale(dx, [pad.l, w - pad.r]);
  const Y = linearScale(dy, [h - pad.b, pad.t]);
  const mx = mean(xs);
  const my = mean(ys);
  const t = useTween([...xs.map((v) => X(v)), ...ys.map((v) => Y(v)), X(mx), Y(my)], 450);
  const n = xs.length;
  const px = t.slice(0, n);
  const py = t.slice(n, 2 * n);
  const [mxp, myp] = t.slice(2 * n);
  const tx = niceTicks(dx[0], dx[1], w < 480 ? 4 : 6);
  const ty = niceTicks(dy[0], dy[1], 5);

  return (
    <div ref={ref} className="w-full min-w-0" data-testid="relationship-scatter">
      <Svg width={w} height={h} label={label}>
        <g stroke={C.lineSoft}>
          {tx.map((v) => <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={pad.t} y2={h - pad.b} />)}
          {ty.map((v) => <line key={`gy${v}`} y1={Y(v)} y2={Y(v)} x1={pad.l} x2={w - pad.r} />)}
        </g>
        {tx.map((v) => (
          <text key={`tx${v}`} x={X(v)} y={h - pad.b + 16} fontSize={11} textAnchor="middle" fill={C.dim}>{fmt(v, 2)}</text>
        ))}
        {ty.map((v) => (
          <text key={`ty${v}`} x={pad.l - 6} y={Y(v)} dy="0.32em" fontSize={11} textAnchor="end" fill={C.dim}>{fmt(v, 2)}</text>
        ))}
        <text x={(pad.l + w - pad.r) / 2} y={h - 6} textAnchor="middle" fontSize={12} fill={C.muted}>{xLabel}</text>
        <text transform={`translate(12,${(pad.t + h - pad.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize={12} fill={C.muted}>{yLabel}</text>

        {rectangles &&
          px.map((x, i) => {
            const pos = (xs[i] - mx) * (ys[i] - my) >= 0;
            return (
              <rect
                key={`r${i}`}
                x={Math.min(x, mxp)}
                y={Math.min(py[i], myp)}
                width={Math.abs(x - mxp)}
                height={Math.abs(py[i] - myp)}
                fill={pos ? C.pos : C.neg}
                fillOpacity={0.09}
                stroke={pos ? C.pos : C.neg}
                strokeOpacity={0.35}
              />
            );
          })}

        {fit && (
          <line x1={X(dx[0])} y1={Y(fit.intercept + fit.slope * dx[0])} x2={X(dx[1])} y2={Y(fit.intercept + fit.slope * dx[1])} stroke={C.yellow} strokeWidth={2.2} />
        )}

        {/* the mean cross */}
        <line x1={mxp} x2={mxp} y1={pad.t} y2={h - pad.b} stroke={C.yellow} strokeDasharray="4 4" strokeOpacity={0.8} />
        <line y1={myp} y2={myp} x1={pad.l} x2={w - pad.r} stroke={C.yellow} strokeDasharray="4 4" strokeOpacity={0.8} />
        {rectangles && (
          <g fontSize={12} fontWeight={700}>
            <text x={w - pad.r - 6} y={pad.t + 14} textAnchor="end" fill={C.pos} {...HALO}>I: (+)(+) &gt; 0</text>
            <text x={pad.l + 6} y={pad.t + 14} fill={C.neg} {...HALO}>II: (−)(+) &lt; 0</text>
            <text x={pad.l + 6} y={h - pad.b - 8} fill={C.pos} {...HALO}>III: (−)(−) &gt; 0</text>
            <text x={w - pad.r - 6} y={h - pad.b - 8} textAnchor="end" fill={C.neg} {...HALO}>IV: (+)(−) &lt; 0</text>
          </g>
        )}
        {px.map((x, i) => (
          <circle key={i} cx={x} cy={py[i]} r={w < 480 ? 3.5 : 4.5} fill={colors?.[i] ?? C.blue} fillOpacity={0.85} stroke={C.canvas} strokeWidth={1} />
        ))}
        <text x={mxp + 6} y={pad.t + 12} fontSize={11.5} fill={C.yellow} {...HALO}>μx</text>
        <text x={pad.l + 4} y={myp - 6} fontSize={11.5} fill={C.yellow} {...HALO}>μy</text>
      </Svg>
    </div>
  );
}
