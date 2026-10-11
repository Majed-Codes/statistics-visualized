import { useState, type ReactNode } from 'react';
import { useSlide } from '../presentation/SlideContext';
import { Button } from './Button';

/**
 * Content that stays hidden until the instructor reaches reveal step `at`
 * (→ key, the Reveal button in the bottom bar, or clicking the placeholder).
 * Hidden content is not rendered at all, so answers cannot leak through
 * screen readers or text selection.
 */
export function Step({ at, children, placeholder, inline = false }: { at: number; children: ReactNode; placeholder?: ReactNode; inline?: boolean }) {
  const { step, setStep } = useSlide();
  if (step >= at) return inline ? <>{children}</> : <div className="step-in">{children}</div>;
  if (placeholder === null) return null;
  const Tag = inline ? 'span' : 'div';
  return (
    <Tag
      data-hidden-step={at}
      className={`${inline ? 'inline-flex' : 'flex'} min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-line px-3.5 py-2 font-mono text-[0.78em] text-muted hover:border-ac hover:text-ac`}
      onClick={() => setStep(at)}
      role="button"
      tabIndex={0}
      aria-label={`Reveal step ${at}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          setStep(at);
        }
      }}
    >
      {placeholder ?? <>step {at} · press → or tap to reveal</>}
    </Tag>
  );
}

/** A local reveal not tied to the slide's step counter (e.g. one group's reference answer). */
export function RevealBox({ label, children, testId }: { label: string; children: ReactNode; testId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid={testId}>
      {open ? (
        <div className="space-y-2">
          {children}
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Hide again
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          {label}
        </Button>
      )}
    </div>
  );
}
