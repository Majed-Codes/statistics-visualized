import { useEffect, useRef } from 'react';
import { SECTIONS, SLIDES } from '../../data/lecture-content';
import { Button } from '../ui/Button';
import { IconClose } from '../ui/Icons';

/** Slide overview: all 53 slides grouped by section. */
export function Overview({ current, onPick, onClose }: { current: number; onPick: (n: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-current="true"]')?.scrollIntoView({ block: 'center' });
    ref.current?.focus();
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas" role="dialog" aria-modal="true" aria-label="Slide overview" data-testid="overview">
      <div className="flex items-center justify-between gap-2 px-4 py-4 sm:px-[5vw]">
        <h2 className="text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.03em]">All 53 slides</h2>
        <Button size="sm" variant="ghost" onClick={onClose} icon={<IconClose />} aria-label="Close overview">
          Close
        </Button>
      </div>
      <div ref={ref} tabIndex={-1} className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-10 outline-none sm:px-[5vw]">
        {SECTIONS.map((s) => (
          <section key={s.id} className="mt-4">
            <h3 className="lab mb-2.5">
              {s.id} · {s.title} <span className="text-dim">· slides {s.from}–{s.to}</span>
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
              {SLIDES.filter((m) => m.section === s.id).map((m) => (
                <button
                  key={m.n}
                  type="button"
                  data-current={m.n === current}
                  onClick={() => onPick(m.n)}
                  className={`flex min-h-20 flex-col items-start rounded-xl border-2 p-3 text-left transition-colors ${
                    m.n === current ? 'border-bd bg-ac text-onac shadow-[0_4px_0_var(--color-sh)]' : 'border-line bg-panel hover:border-bd'
                  }`}
                >
                  <span className="tabular font-mono text-[0.7em] opacity-70">
                    {m.n} · {m.kind}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[0.9em] font-bold leading-snug" dir="auto">
                    {m.sourceTitle}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
