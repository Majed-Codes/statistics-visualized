/**
 * A simulated population and the four sampling methods from slide 11.
 * The population is illustrative (clearly labelled as such on screen); the
 * sampling algorithms are the real textbook procedures.
 */
import { mulberry32, normalSampler, shuffle } from './random';

export type Region = 0 | 1 | 2 | 3;
export const REGION_NAMES = ['Riyadh', 'Jeddah', 'Dammam', 'Abha'] as const;

export interface Member {
  id: number;
  /** Stratum (used by stratified sampling). */
  region: Region;
  /** Cluster (a block of nearby members, used by cluster sampling). */
  cluster: number;
  /** Grid position for drawing. */
  col: number;
  row: number;
  /** The quantity we want to estimate, e.g. monthly app usage in hours. */
  value: number;
}

export interface Population {
  members: Member[];
  cols: number;
  rows: number;
  clusterCols: number;
  clusterRows: number;
}

/**
 * 400 members on a 20 × 20 grid, four regions in the four quadrants with
 * deliberately unequal sizes and different means, so that a careless sample
 * visibly misrepresents the whole.
 */
export function makePopulation(seed = 7): Population {
  const cols = 20;
  const rows = 20;
  const rand = mulberry32(seed);
  const z = normalSampler(rand);
  // Region boundaries: columns < 12 / rows < 8 → unequal region sizes.
  const regionOf = (c: number, r: number): Region => (c < 12 ? (r < 8 ? 0 : 1) : r < 8 ? 2 : 3);
  const regionMean = [42, 30, 22, 12];
  const members: Member[] = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const region = regionOf(c, r);
      members.push({
        id: id++,
        region,
        cluster: Math.floor(r / 5) * 5 + Math.floor(c / 4), // 5 × 4 cells per cluster → 20 clusters
        col: c,
        row: r,
        value: Math.max(0, regionMean[region] + 6 * z()),
      });
    }
  }
  return { members, cols, rows, clusterCols: 5, clusterRows: 4 };
}

export type SamplingMethod = 'random' | 'stratified' | 'cluster' | 'systematic';

export interface SampleResult {
  ids: Set<number>;
  /** Plain-language description of what the algorithm just did, shown on screen. */
  explanation: string;
}

/** Simple random sampling: every subset of size n is equally likely. */
export function simpleRandomSample(pop: Population, n: number, seed: number): SampleResult {
  const picked = shuffle(pop.members, mulberry32(seed)).slice(0, n);
  return {
    ids: new Set(picked.map((m) => m.id)),
    explanation: `Shuffled all ${pop.members.length} members and kept the first ${n}. Every member had the same chance.`,
  };
}

/** Proportional stratified sampling: a random sample inside each region, sized by region share. */
export function stratifiedSample(pop: Population, n: number, seed: number): SampleResult {
  const rand = mulberry32(seed);
  const N = pop.members.length;
  const strata = [0, 1, 2, 3].map((r) => pop.members.filter((m) => m.region === r));
  // Largest-remainder allocation so the stratum sizes add up to exactly n.
  const exact = strata.map((s) => (s.length / N) * n);
  const alloc = exact.map(Math.floor);
  let left = n - alloc.reduce((a, b) => a + b, 0);
  exact
    .map((e, i) => ({ i, rem: e - Math.floor(e) }))
    .sort((a, b) => b.rem - a.rem)
    .forEach(({ i }) => {
      if (left > 0) {
        alloc[i]++;
        left--;
      }
    });
  const ids = new Set<number>();
  strata.forEach((s, i) => shuffle(s, rand).slice(0, alloc[i]).forEach((m) => ids.add(m.id)));
  return {
    ids,
    explanation: `Split into 4 regions, then sampled each region in proportion to its size: ${alloc.join(' + ')} = ${n}.`,
  };
}

/** Cluster sampling: choose whole clusters at random and keep every member inside them. */
export function clusterSample(pop: Population, n: number, seed: number): SampleResult {
  const rand = mulberry32(seed);
  const clusterIds = [...new Set(pop.members.map((m) => m.cluster))];
  const perCluster = pop.members.length / clusterIds.length;
  const k = Math.max(1, Math.round(n / perCluster));
  const chosen = new Set(shuffle(clusterIds, rand).slice(0, k));
  const ids = new Set(pop.members.filter((m) => chosen.has(m.cluster)).map((m) => m.id));
  return {
    ids,
    explanation: `Picked ${k} of ${clusterIds.length} blocks at random and surveyed everyone inside them (${ids.size} members).`,
  };
}

/** Systematic sampling: random start, then every k-th member of the ordered list. */
export function systematicSample(pop: Population, n: number, seed: number): SampleResult {
  const N = pop.members.length;
  const k = Math.max(1, Math.floor(N / n));
  const start = Math.floor(mulberry32(seed)() * k);
  const ids = new Set<number>();
  for (let i = start; i < N && ids.size < n; i += k) ids.add(pop.members[i].id);
  return {
    ids,
    explanation: `Interval k = ⌊${N} / ${n}⌋ = ${k}. Random start at #${start + 1}, then every ${k}th member in list order.`,
  };
}

export function drawSample(pop: Population, method: SamplingMethod, n: number, seed: number): SampleResult {
  switch (method) {
    case 'random':
      return simpleRandomSample(pop, n, seed);
    case 'stratified':
      return stratifiedSample(pop, n, seed);
    case 'cluster':
      return clusterSample(pop, n, seed);
    case 'systematic':
      return systematicSample(pop, n, seed);
  }
}
