import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  active?: boolean;
}

/**
 * Key-cap button: ink border and a shadow underneath; it presses straight
 * down when clicked. "Active" and "primary" fill with the section's accent colour.
 * At least 40px tall (44px on touch screens).
 */
export function Button({ variant = 'default', size = 'md', icon, active, className = '', children, ...rest }: ButtonProps) {
  const sz = size === 'sm' ? 'min-h-9 px-3.5 text-[0.84em] gap-1.5 rounded-full' : 'min-h-11 px-5 text-[0.92em] gap-2 rounded-full';
  const look =
    variant === 'ghost' && !active
      ? 'tb-ghost'
      : `tb ${active || variant === 'primary' ? 'is-on' : ''} ${variant === 'danger' ? 'text-neg' : ''}`;
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={active === undefined ? rest['aria-pressed'] : active}
      className={`inline-flex select-none items-center justify-center whitespace-nowrap font-semibold disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:min-h-11 ${sz} ${look} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  label: string;
  size?: 'sm' | 'md';
}

/** Mutually exclusive options (a radio group of tactile buttons). */
export function Segmented<T extends string>({ value, options, onChange, label, size = 'sm' }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button key={o.value} role="radio" aria-checked={o.value === value} title={o.title} size={size} active={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}
