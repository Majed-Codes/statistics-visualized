/**
 * Builds a boxplot from sorted observations, one idea at a time.
 *
 * stage 0  observations on a line          5  IQR box (middle 50%)
 * stage 1  order shown (rank labels)        6  lower fence Q1 − 1.5·IQR
 * stage 2  the median Q2                    7  upper fence Q3 + 1.5·IQR
 * stage 3  lower half → Q1                  8  outliers flagged + whiskers
 * stage 4  upper half → Q3
 *
 * Quartiles default to the lecture's convention (median of each half,
 * excluding the median for odd n); 'linear' reproduces NumPy/pandas.
 */
import { useMeasure } from '../../hooks/useMeasure';
import { useTween } from '../../hooks/useTween';
import { boxplotSummary, type QuartileMethod } from '../../lib/statistics';
import { linearScale, padExtent } from '../../lib/scale';
import { fmt } from '../../lib/format';
import { C, HALO, stackRows, Svg, XAxis } from './primitives';

interface Props {
  values: number[];
  stage: number;
  method?: QuartileMethod;
  k?: number;
  domain?: [number, number];
  label: string;
}

export function BoxplotBuilder({ values, stage, method = 'tukey', k = 1.5, domain, label }: Props) {
  const [ref, w] = useMeasure<HTMLDivElement>(640);
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const b = boxplotSummary(s, method, k);
  const dom = domain ?? padExtent([...s, ...(stage >= 6 ? [b.fences.lower] : []), ...(stage >= 7 ? [b.fences.upper] : [])], 0.06);
  const x = linearScale(dom, [24, w - 24]);
  const h = 236;
  const boxY = 34;
  const boxH = 42;
  const ptY = 142;
  const axisY = h - 40;

  const half = Math.floor(n / 2);
  const lowerIdx = s.map((_, i) => i).filter((i) => i < half);
  const upperIdx = s.map((_, i) => i).filter((i) => (n % 2 ? i > half : i >= half));
  const midIdx = n % 2 ? [half] : [half - 1, half];
  const tukey = method === 'tukey';

  const target = [...s.map((v) => x(v)), x(b.q1), x(b.q2), x(b.q3), x(b.fences.lower), x(b.fences.upper), x(b.whiskerLow), x(b.whiskerHigh)];
  const t = useTween(target, 400);
  const pxs = t.slice(0, n);
  const [q1x, q2x, q3x, lfx, ufx, wlx, whx] = t.slice(n);
  const labelRows = stackRows(pxs, w < 480 ? 28 : 34);

  const isOut = (v: number) => v < b.fences.lower || v > b.fences.upper;
  const dimmed = (i: number) => (tukey && stage === 3 && !lowerIdx.includes(i)) || (tukey && stage === 4 && !upperIdx.includes(i));

  const marker = (px: number, text: string, color: string, show: boolean, row = 0) =>
    show ? (
      <g>
        <line x1={px} x2={px} y1={boxY - 6} y2={ptY + 10} stroke={color} strokeWidth={2.5} />
        <text x={px} y={boxY - 12 - row * 14} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={color} {...HALO}>
          {text}
        </text>
      </g>
    ) : null;

  return (
    <div ref={ref} className="w-full min-w-0" data-testid="boxplot-builder" data-stage={stage}>
      <Svg width={w} height={h} label={label}>
        {/* the box: middle 50% */}
        {stage >= 5 && (
          <g>
            <rect x={q1x} y={boxY} width={Math.max(0, q3x - q1x)} height={boxH} fill={C.blue} fillOpacity={0.16} stroke={C.blue} strokeWidth={2} rx={3} />
            <rect x={q1x} y={ptY - 22} width={Math.max(0, q3x - q1x)} height={34} fill={C.blue} fillOpacity={0.08} />
            <text x={(q1x + q3x) / 2} y={boxY + boxH + 16} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={C.ink} {...HALO}>
              IQR = {fmt(b.q3)} − {fmt(b.q1)} = {fmt(b.iqr)}
            </text>
          </g>
        )}
        {/* whiskers */}
        {stage >= 8 && (
          <g stroke={C.ink} strokeWidth={1.8}>
            <line x1={wlx} x2={q1x} y1={boxY + boxH / 2} y2={boxY + boxH / 2} />
            <line x1={q3x} x2={whx} y1={boxY + boxH / 2} y2={boxY + boxH / 2} />
            <line x1={wlx} x2={wlx} y1={boxY + 10} y2={boxY + boxH - 10} />
            <line x1={whx} x2={whx} y1={boxY + 10} y2={boxY + boxH - 10} />
          </g>
        )}
        {/* fences */}
        {stage >= 6 && (
          <g>
            <line x1={lfx} x2={lfx} y1={boxY - 4} y2={axisY} stroke={C.neg} strokeWidth={2} strokeDasharray="6 4" />
            <text x={lfx + 4} y={ptY + 40} fontSize={12} fill={C.neg} fontWeight={600} {...HALO}>
              lower {fmt(b.fences.lower)}
            </text>
          </g>
        )}
        {stage >= 7 && (
          <g>
            <line x1={ufx} x2={ufx} y1={boxY - 4} y2={axisY} stroke={C.neg} strokeWidth={2} strokeDasharray="6 4" />
            <text x={ufx - 4} y={ptY + 40} textAnchor="end" fontSize={12} fill={C.neg} fontWeight={600} {...HALO}>
              upper {fmt(b.fences.upper)}
            </text>
          </g>
        )}

        {/* halves */}
        {tukey && stage === 3 && lowerIdx.length > 0 && (
          <rect x={pxs[lowerIdx[0]] - 12} y={ptY - 20} width={pxs[lowerIdx[lowerIdx.length - 1]] - pxs[lowerIdx[0]] + 24} height={32} rx={16} fill="none" stroke={C.cyan} strokeDasharray="4 3" />
        )}
        {tukey && stage === 4 && upperIdx.length > 0 && (
          <rect x={pxs[upperIdx[0]] - 12} y={ptY - 20} width={pxs[upperIdx[upperIdx.length - 1]] - pxs[upperIdx[0]] + 24} height={32} rx={16} fill="none" stroke={C.cyan} strokeDasharray="4 3" />
        )}

        {marker(q2x, `Q2 = ${fmt(b.q2)}`, C.cyan, stage >= 2, 0)}
        {marker(q1x, `Q1 = ${fmt(b.q1)}`, C.yellow, stage >= 3, Math.abs(q1x - q2x) < 70 ? 1 : 0)}
        {marker(q3x, `Q3 = ${fmt(b.q3)}`, C.yellow, stage >= 4, Math.abs(q3x - q2x) < 70 ? 1 : 0)}

        {/* observations */}
        <line x1={24} x2={w - 24} y1={ptY} y2={ptY} stroke={C.line} strokeWidth={1.5} />
        {s.map((v, i) => {
          const out = stage >= 8 && isOut(v);
          const mid = stage >= 2 && midIdx.includes(i) && tukey;
          return (
            <g key={i} opacity={dimmed(i) ? 0.25 : 1} data-outlier={out ? 'true' : undefined}>
              <circle cx={pxs[i]} cy={ptY - 4} r={out ? 9 : 7} fill={out ? C.neg : C.blue} stroke={mid ? C.cyan : C.canvas} strokeWidth={mid ? 3 : 1.5} />
              <text x={pxs[i]} y={ptY + 22 + labelRows[i] * 13} textAnchor="middle" fontSize={11.5} fill={out ? C.neg : C.ink}>
                {fmt(v)}
              </text>
              {stage >= 1 && stage < 5 && (
                <text x={pxs[i]} y={ptY - 18} textAnchor="middle" fontSize={10} fill={C.dim}>
                  #{i + 1}
                </text>
              )}
            </g>
          );
        })}
        <XAxis scale={x} y={axisY} tickCount={w < 480 ? 4 : 8} />
        {stage >= 8 && (
          <text x={w - 24} y={h - 4} textAnchor="end" fontSize={12} fill={b.outliers.length ? C.neg : C.pos}>
            {b.outliers.length ? `flagged: ${b.outliers.map((v) => fmt(v)).join(', ')}` : 'no values flagged'}
          </text>
        )}
      </Svg>
    </div>
  );
}
