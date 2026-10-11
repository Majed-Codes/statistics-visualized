/** Number formatting for on-screen mathematics. */

/** Fixed decimals, dropping a trailing ".0…" only when the value is an integer. */
export function fmt(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'undefined' : x > 0 ? '∞' : '−∞';
  const r = Number(x.toFixed(digits));
  const s = Number.isInteger(r) ? r.toString() : r.toFixed(digits);
  return s.replace('-', '−');
}

/** Thousands separators for salary-sized values. */
export function fmtInt(x: number): string {
  return Math.round(x).toLocaleString('en-US').replace('-', '−');
}

/** For KaTeX strings: a plain ASCII minus is required inside TeX. */
export function tex(x: number, digits = 2): string {
  return fmt(x, digits).replace('−', '-');
}

export function pct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}
