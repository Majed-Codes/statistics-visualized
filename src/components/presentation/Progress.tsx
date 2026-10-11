import { SECTIONS, TOTAL_SLIDES } from '../../data/lecture-content';

/** Thin progress line along the top edge, one segment per section (each segment jumps there). */
export function Progress({ n, onJump }: { n: number; onJump: (n: number) => void }) {
  return (
    <div className="no-print fixed inset-x-0 top-0 z-30 flex h-[4px] gap-[3px]" aria-label={`Lecture progress: slide ${n} of ${TOTAL_SLIDES}`} role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_SLIDES} aria-valuenow={n}>
      {SECTIONS.map((s) => {
        const count = s.to - s.from + 1;
        const done = Math.max(0, Math.min(count, n - s.from + 1));
        return (
          <button key={s.id} type="button" tabIndex={-1} title={`${s.title} (slides ${s.from}–${s.to})`} onClick={() => onJump(s.from)} className="relative h-full overflow-hidden bg-line" style={{ flex: count }}>
            <span className="absolute inset-y-0 left-0 bg-ac transition-[width] duration-500" style={{ width: `${(done / count) * 100}%` }} />
          </button>
        );
      })}
    </div>
  );
}
