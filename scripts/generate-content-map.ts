/**
 * Writes docs/CONTENT_MAP.md from src/data/lecture-content.ts (the single
 * source of truth), so the map can never drift from the app.
 * Run: node scripts/generate-content-map.ts
 */
import { writeFileSync } from 'node:fs';
import { SECTIONS, SLIDES, PLANNED_MINUTES } from '../src/data/lecture-content.ts';

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const lines: string[] = [
  '# Content map — 53 slides',
  '',
  'Generated from `src/data/lecture-content.ts` by `node scripts/generate-content-map.ts`. Do not edit by hand.',
  '',
  `Source: \`Unit2_Part5.pdf\` (page n = slide n). Planned speaking time: ${PLANNED_MINUTES} minutes.`,
  '',
];
for (const sec of SECTIONS) {
  lines.push(`## ${String(SECTIONS.indexOf(sec) + 1).padStart(2, '0')} · ${sec.title} (slides ${sec.from}–${sec.to})`, '');
  lines.push('| # | Title in the PDF | Learning objective | Visual approach in the app | Exercise | Notebook | Reveal steps | Min |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const s of SLIDES.filter((x) => x.section === sec.id)) {
    lines.push(
      `| ${s.n} | ${esc(s.sourceTitle)} | ${esc(s.notes.objective)} | ${esc(s.visual)} | ${esc(s.exercise ?? '—')} | ${s.notebook?.join(', ') ?? '—'} | ${s.steps || '—'} | ${s.notes.minutes} |`,
    );
  }
  lines.push('');
  const extras = SLIDES.filter((x) => x.section === sec.id && (x.supplemental || x.corrections));
  if (extras.length) {
    lines.push('Additions (badged “Added” in the app) and corrections:', '');
    for (const s of extras) {
      for (const a of s.supplemental ?? []) lines.push(`- Slide ${s.n} · added: ${a}`);
      for (const c of s.corrections ?? []) lines.push(`- Slide ${s.n} · **correction**: ${c}`);
    }
    lines.push('');
  }
}
writeFileSync('docs/CONTENT_MAP.md', lines.join('\n'));
console.log(`docs/CONTENT_MAP.md: ${SLIDES.length} slides`);
