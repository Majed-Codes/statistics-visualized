import type { ReactNode } from 'react';
import { SECTIONS, sectionOf, type SlideMeta } from '../../data/lecture-content';
import { Badge } from '../ui/Badge';

interface SlideFrameProps {
  meta: SlideMeta;
  subtitle?: ReactNode;
  bare?: boolean;
  /** Direction of travel: content glides in from that side. */
  dir?: 'fwd' | 'back';
  children: ReactNode;
}

/**
 * Common slide layout. The first slide of each section opens with the
 * section's big outlined numeral, without adding slides.
 */
export function SlideFrame({ meta, subtitle, bare, dir = 'fwd', children }: SlideFrameProps) {
  const section = sectionOf(meta.n);
  const index = SECTIONS.indexOf(section) + 1;
  const opener = meta.n === section.from && !bare;
  return (
    <article
      key={meta.n}
      data-testid="slide"
      data-slide={meta.n}
      data-dir={dir}
      className="slide-enter mx-auto w-full max-w-[1320px] px-4 py-3 sm:px-[5vw] sm:py-5 2xl:px-0"
      aria-roledescription="slide"
      aria-label={`Slide ${meta.n}: ${meta.sourceTitle}`}
    >
      {!bare && (
        <header className={opener ? 'mb-5 flex items-end gap-5 sm:mb-7 sm:gap-8' : 'mb-4 sm:mb-6'}>
          {opener && (
            <span
              className="numeral tabular shrink-0 font-extrabold leading-[0.8] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(72px, min(11vw, 18vh), 180px)' }}
              aria-hidden="true"
            >
              {String(index).padStart(2, '0')}
            </span>
          )}
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="lab">{opener ? `Part ${String(index).padStart(2, '0')} · ${section.title}` : section.title}</span>
              {meta.corrections && <Badge kind="correction">Includes a correction</Badge>}
            </div>
            <h2 className="font-[750] leading-[1] tracking-[-0.032em] text-ink" style={{ fontSize: 'var(--fs-title)' }} dir="auto">
              {meta.sourceTitle}
            </h2>
            {subtitle && <p className="mt-2 text-[1.02em] font-medium text-muted">{subtitle}</p>}
          </div>
        </header>
      )}
      <div>{children}</div>
    </article>
  );
}
