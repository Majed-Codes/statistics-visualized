/**
 * Seeded pseudo-random numbers so every simulated dataset is reproducible:
 * the same seed always draws the same cloud, on every device and every reload.
 */

/** mulberry32: a small, fast 32-bit PRNG with good statistical quality for teaching demos. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal draws via the Box–Muller transform. */
export function normalSampler(rand: () => number): () => number {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    while (u === 0) u = rand();
    const v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(xs: readonly T[], rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Draw n standard-normal pairs whose *population* correlation is rho:
 *   x = z₁,  y = ρ·z₁ + √(1 − ρ²)·z₂.
 * The sample correlation of the drawn points will differ slightly from rho;
 * the visualisations always display the correlation actually computed from
 * the points, never the target value.
 */
export function correlatedPairs(n: number, rho: number, seed: number): Point[] {
  const z = normalSampler(mulberry32(seed));
  const r = Math.max(-1, Math.min(1, rho));
  const k = Math.sqrt(1 - r * r);
  return Array.from({ length: n }, () => {
    const z1 = z();
    const z2 = z();
    return { x: z1, y: r * z1 + k * z2 };
  });
}
