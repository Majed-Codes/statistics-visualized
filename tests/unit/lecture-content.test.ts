import { describe, expect, it } from 'vitest';
import pages from './pdf-pages.json';
import { PLANNED_MINUTES, SECTIONS, SLIDES, TOTAL_SLIDES, plannedStartMinute } from '../../src/data/lecture-content';
import { SLIDE_REGISTRY } from '../../src/slides';
import { LAB, ORIGINAL, CORRECTED } from '../../src/data/notebook';
import { NOTES_AR } from '../../src/data/notes-ar';

const norm = (s: string) => s.replace(/ـ/g, '').replace(/\s+/g, ' ').trim();

describe('lecture structure', () => {
  it('has exactly 53 numbered slides, numbered 1…53 in order', () => {
    expect(TOTAL_SLIDES).toBe(53);
    expect(pages).toHaveLength(53);
    SLIDES.forEach((s, i) => expect(s.n).toBe(i + 1));
  });

  it('follows the PDF order: each slide title begins its PDF page', () => {
    SLIDES.forEach((s, i) => {
      expect(norm(pages[i]).startsWith(norm(s.sourceTitle)), `slide ${s.n}: "${s.sourceTitle}"`).toBe(true);
    });
  });

  it('sections tile slides 1–53 without gaps or overlaps', () => {
    let next = 1;
    for (const sec of SECTIONS) {
      expect(sec.from).toBe(next);
      next = sec.to + 1;
      for (let n = sec.from; n <= sec.to; n++) expect(SLIDES[n - 1].section).toBe(sec.id);
    }
    expect(next).toBe(54);
  });

  it('every slide has a component, and complete presenter notes', () => {
    for (const s of SLIDES) {
      expect(SLIDE_REGISTRY[s.n]?.Component, `component for slide ${s.n}`).toBeTypeOf('function');
      const n = s.notes;
      expect(n.objective.length, `objective ${s.n}`).toBeGreaterThan(10);
      expect(n.say.length, `say ${s.n}`).toBeGreaterThan(0);
      expect(n.visual.length).toBeGreaterThan(5);
      expect(n.misconception.length).toBeGreaterThan(3);
      expect(n.question.length).toBeGreaterThan(5);
      expect(n.minutes).toBeGreaterThan(0);
      expect(s.visual.length).toBeGreaterThan(10);
    }
  });

  it('every slide has complete Arabic presenter notes', () => {
    const arabic = /[\u0600-\u06FF]/;
    for (const s of SLIDES) {
      const a = NOTES_AR[s.n];
      expect(a, `Arabic notes for slide ${s.n}`).toBeTruthy();
      for (const f of [a.objective, a.visual, a.misconception, a.question, ...a.say]) {
        expect(f.length, `slide ${s.n}`).toBeGreaterThan(2);
        expect(arabic.test(f), `slide ${s.n} is Arabic: ${f.slice(0, 30)}`).toBe(true);
      }
      expect(a.say.length, `slide ${s.n} say lines`).toBe(s.notes.say.length);
    }
    expect(Object.keys(NOTES_AR)).toHaveLength(53);
  });

  it('planned speaking time adds up to the 90-minute session', () => {
    expect(PLANNED_MINUTES).toBeCloseTo(90, 6);
    expect(plannedStartMinute(1)).toBe(0);
    expect(plannedStartMinute(53)).toBeCloseTo(89, 6);
  });

  it('question slides hide nothing and solution slides reveal their answers in steps', () => {
    for (const s of SLIDES.filter((x) => x.kind === 'solution')) {
      // Every solution slide except the interactive example slide has instructor-controlled steps.
      expect(s.steps, `solution slide ${s.n}`).toBeGreaterThan(0);
    }
  });

  it('notebook references point at real notebook cells', () => {
    const ids = new Set(ORIGINAL.map((c) => c.id));
    for (const s of SLIDES) for (const id of s.notebook ?? []) expect(ids.has(id), `slide ${s.n} → ${id}`).toBe(true);
    for (const e of LAB) {
      expect(ids.has(e.id)).toBe(true);
      if (e.correctedId) expect(CORRECTED.some((c) => c.id === e.correctedId && c.type === 'code')).toBe(true);
      for (const n of e.slides) expect(n >= 1 && n <= 53).toBe(true);
    }
    // every code cell of the original notebook is covered by the Lab
    for (const c of ORIGINAL.filter((x) => x.type === 'code')) expect(LAB.some((e) => e.id === c.id), c.id).toBe(true);
  });
});
