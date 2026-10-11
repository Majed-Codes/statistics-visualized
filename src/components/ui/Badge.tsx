import type { ReactNode } from 'react';

type Kind = 'added' | 'correction' | 'precomputed' | 'live' | 'illustrative' | 'source';

const STYLE: Record<Kind, { cls: string; text: string; title: string }> = {
  added: { cls: 'text-mode', text: 'Added', title: 'Not in the original PDF: added to support understanding.' },
  correction: { cls: 'text-neg', text: 'Correction', title: 'A documented correction to the source material.' },
  precomputed: { cls: 'text-muted', text: 'Precomputed output', title: 'Saved output from a real notebook run. Nothing is executing.' },
  live: { cls: 'text-pos', text: 'Computed live', title: 'Computed in your browser from the bundled data.' },
  illustrative: { cls: 'text-cyan', text: 'Illustrative data', title: 'Simulated or made-up values used only to illustrate the idea.' },
  source: { cls: 'text-blue', text: 'From the lecture', title: 'Content from the original lecture slides.' },
};

export function Badge({ kind, children }: { kind: Kind; children?: ReactNode }) {
  const s = STYLE[kind];
  return (
    <span
      title={s.title}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-[1.5px] border-current px-2 py-[1px] font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] ${s.cls}`}
    >
      {children ?? s.text}
    </span>
  );
}
