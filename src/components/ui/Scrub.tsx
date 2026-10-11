import { useRef, useState } from 'react';

interface ScrubProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  /** Units per pixel of horizontal drag (default: range / 300). */
  perPx?: number;
  label: string;
  className?: string;
  testId?: string;
}

/**
 * An explorable number: it sits inside a sentence and you drag it sideways
 * (mouse, touch or pen) — or focus it and use the arrow keys. Colour it with
 * a semantic class (e.g. text-neg) to tie it to the chart part it controls.
 */
export function Scrub({ value, min, max, step = 1, onChange, format = String, perPx, label, className = '', testId }: ScrubProps) {
  const start = useRef<{ x: number; v: number; id: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const rate = perPx ?? (max - min) / 300;
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));

  return (
    <span
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={format(value)}
      data-testid={testId}
      data-interactive="true"
      className={`scrub ${dragging ? 'dragging' : ''} ${className}`}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, v: value, id: e.pointerId };
        setDragging(true);
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (!start.current || e.pointerId !== start.current.id) return;
        onChange(clamp(start.current.v + (e.clientX - start.current.x) * rate));
      }}
      onPointerUp={() => {
        start.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        start.current = null;
        setDragging(false);
      }}
      onKeyDown={(e) => {
        const big = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(clamp(value + step * big));
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(clamp(value - step * big));
        else if (e.key === 'Home') onChange(min);
        else if (e.key === 'End') onChange(max);
        else return;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {format(value)}
    </span>
  );
}
