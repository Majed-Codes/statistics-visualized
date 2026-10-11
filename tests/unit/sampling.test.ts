import { describe, expect, it } from 'vitest';
import { drawSample, makePopulation, REGION_NAMES } from '../../src/lib/sampling';
import { correlatedPairs, mulberry32 } from '../../src/lib/random';
import { pearson } from '../../src/lib/statistics';

const pop = makePopulation();

describe('population and sampling methods', () => {
  it('builds a reproducible 400-member population with 4 regions and 20 clusters', () => {
    expect(pop.members).toHaveLength(400);
    expect(new Set(pop.members.map((m) => m.cluster)).size).toBe(20);
    expect(new Set(pop.members.map((m) => m.region)).size).toBe(REGION_NAMES.length);
    expect(makePopulation().members[17].value).toBe(pop.members[17].value);
  });
  it('random and systematic samples have exactly n members', () => {
    expect(drawSample(pop, 'random', 40, 1).ids.size).toBe(40);
    expect(drawSample(pop, 'systematic', 40, 1).ids.size).toBe(40);
  });
  it('stratified sampling allocates proportionally and sums to n', () => {
    const s = drawSample(pop, 'stratified', 40, 3);
    expect(s.ids.size).toBe(40);
    for (const r of [0, 1, 2, 3]) {
      const share = pop.members.filter((m) => m.region === r).length / 400;
      const got = pop.members.filter((m) => m.region === r && s.ids.has(m.id)).length;
      expect(Math.abs(got - share * 40)).toBeLessThanOrEqual(1);
    }
  });
  it('cluster sampling keeps whole clusters', () => {
    const s = drawSample(pop, 'cluster', 40, 5);
    const clusters = new Set(pop.members.filter((m) => s.ids.has(m.id)).map((m) => m.cluster));
    for (const c of clusters) expect(pop.members.filter((m) => m.cluster === c).every((m) => s.ids.has(m.id))).toBe(true);
    expect(s.ids.size).toBe(40);
  });
  it('systematic sampling uses a constant interval', () => {
    const s = [...drawSample(pop, 'systematic', 40, 9).ids].sort((a, b) => a - b);
    const gaps = new Set(s.slice(1).map((v, i) => v - s[i]));
    expect([...gaps]).toEqual([10]);
  });
});

describe('seeded random generators', () => {
  it('mulberry32 is deterministic', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 5; i++) expect(a()).toBe(b());
  });
  it('correlatedPairs produces approximately the requested correlation', () => {
    for (const rho of [-0.9, 0, 0.6]) {
      const p = correlatedPairs(2000, rho, 11);
      expect(pearson(p.map((q) => q.x), p.map((q) => q.y))).toBeCloseTo(rho, 1);
    }
  });
});
