import type { ReactNode } from 'react';

interface PanelProps {
  title?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'focus' | 'warn';
}

/** A card: ink border, hard offset shadow. */
export function Panel({ title, badge, children, className = '', tone = 'default' }: PanelProps) {
  const accent = tone === 'focus' ? 'border-t-[6px] border-t-ac' : tone === 'warn' ? 'border-t-[6px] border-t-neg' : '';
  return (
    <section className={`cd min-w-0 p-3.5 sm:p-5 ${accent} ${className}`}>
      {(title || badge) && (
        <header className="mb-3 flex flex-wrap items-center gap-2">
          {title && <h3 className="text-[1em] font-bold tracking-tight text-ink">{title}</h3>}
          {badge}
        </header>
      )}
      {children}
    </section>
  );
}

/** Short aside — an explanation, a warning, or a documented correction. */
export function Note({ kind = 'info', title, children }: { kind?: 'info' | 'warn' | 'correction'; title?: ReactNode; children: ReactNode }) {
  const bar = kind === 'info' ? 'bg-ac' : kind === 'warn' ? 'bg-yellow' : 'bg-neg';
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-line bg-panel/70 py-2.5 pl-5 pr-3.5 text-[0.88em] leading-snug text-ink">
      <span className={`absolute inset-y-0 left-0 w-[5px] ${bar}`} aria-hidden="true" />
      {title && <div className="mb-0.5 font-bold">{title}</div>}
      {children}
    </div>
  );
}
