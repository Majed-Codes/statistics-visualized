import { useId, type ReactNode } from 'react';

interface SliderProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  className?: string;
  testId?: string;
}

/** Labelled range input showing its current value. Native input = keyboard, touch and screen-reader support. */
export function Slider({ label, value, min, max, step = 1, onChange, format, className = '', testId }: SliderProps) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="lab normal-case tracking-normal">
          {label}
        </label>
        <output htmlFor={id} className="tabular font-mono text-[0.85em] font-medium text-ink">
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        data-testid={testId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
