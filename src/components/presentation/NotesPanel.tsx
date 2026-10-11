import type { SlideMeta } from '../../data/lecture-content';

/** Presenter notes for one slide. Rendered only in the presenter window or the explicit notes drawer. */
export function NotesBody({ meta }: { meta: SlideMeta }) {
  const n = meta.notes;
  return (
    <div className="space-y-3 text-[0.9em] leading-snug" data-testid="notes-body">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="lab text-ink">Objective</span>
        <span className="tabular rounded-full border-[1.5px] border-line px-2 font-mono text-[0.75em] text-muted">≈ {n.minutes} min</span>
      </div>
      <p>{n.objective}</p>
      <div>
        <div className="lab">Say</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {n.say.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="lab">Drive the visual</div>
        <p className="mt-1">{n.visual}</p>
      </div>
      <div>
        <div className="lab text-neg">Common misconception</div>
        <p className="mt-1">{n.misconception}</p>
      </div>
      <div>
        <div className="lab text-pos">Ask the class</div>
        <p className="mt-1">{n.question}</p>
      </div>
      {(meta.supplemental?.length || meta.corrections?.length) && (
        <div className="border-t border-line pt-2 text-[0.88em] text-muted">
          {meta.supplemental?.map((s, i) => <p key={`s${i}`}>Added: {s}</p>)}
          {meta.corrections?.map((s, i) => <p key={`c${i}`} className="text-neg/90">Correction: {s}</p>)}
        </div>
      )}
    </div>
  );
}
