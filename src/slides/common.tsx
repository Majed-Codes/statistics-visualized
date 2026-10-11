/** Small layout helpers shared by the slides. */
import type { ReactNode } from 'react';
import { Tex } from '../components/mathematics/Tex';

export function Cols({ children, className = '', ratio = 'even' }: { children: ReactNode; className?: string; ratio?: 'even' | 'wide-left' | 'wide-right' }) {
  const cols =
    ratio === 'wide-left'
      ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'
      : ratio === 'wide-right'
        ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]'
        : 'lg:grid-cols-2';
  return <div className={`grid min-w-0 gap-5 lg:gap-8 ${cols} ${className}`}>{children}</div>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="max-w-[46ch] text-[1.2em] font-medium leading-snug text-ink">{children}</p>;
}

/** A sentence with explorable numbers in it. */
export function Say({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`say max-w-[34ch] text-ink ${className}`}>{children}</p>;
}

/** Bullet list in the lecture's own words. */
export function Bullets({ items, className = '' }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[0.55em] h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] bg-ac" aria-hidden="true" />
          <span className="min-w-0 font-medium">{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Formula({ tex, label, className = '' }: { tex: string; label?: ReactNode; className?: string }) {
  return (
    <div className={`cd min-w-0 px-4 py-2.5 ${className}`}>
      {label && <div className="lab">{label}</div>}
      <Tex display>{tex}</Tex>
    </div>
  );
}

/** One line of a worked solution: label on the left, mathematics on the right. */
export function WorkLine({ label, children, tone = 'default' }: { label: ReactNode; children: ReactNode; tone?: 'default' | 'answer' }) {
  return (
    <div
      className={`grid gap-1 rounded-xl border-2 px-3.5 py-2.5 sm:grid-cols-[8.5em_minmax(0,1fr)] sm:items-baseline ${
        tone === 'answer' ? 'border-bd bg-ac/15 shadow-[0_4px_0_var(--color-sh)]' : 'border-line bg-panel'
      }`}
    >
      <div className="lab">{label}</div>
      <div className="min-w-0 overflow-x-auto font-medium">{children}</div>
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="lab mb-1.5 text-ac">{children}</div>;
}

export function TaskList({ tasks }: { tasks: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {tasks.map((t, i) => (
        <li key={i} className="flex gap-3">
          <span className="tabular mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-bd font-mono text-[0.72em] font-medium">{i + 1}</span>
          <span className="min-w-0 font-medium">{t}</span>
        </li>
      ))}
    </ol>
  );
}

export function Source({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <p className="mt-3 font-mono text-[0.68em] text-dim">
      Figure reference in the original slide:{' '}
      <a className="underline decoration-dotted underline-offset-2 hover:text-muted" href={href} target="_blank" rel="noreferrer noopener">
        {children ?? href.replace(/^https?:\/\//, '')}
      </a>
    </p>
  );
}
