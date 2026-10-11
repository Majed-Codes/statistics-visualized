import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smoothly follows `target` (exponential approach, ~250 ms) using
 * requestAnimationFrame. Used for values written into SVG attributes, such as
 * a rotation angle about a pivot, where CSS transform origins behave
 * differently across browsers. Jumps immediately when reduced motion is on.
 */
export function useAnimatedNumber(target: number, timeConstantMs = 90): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !Number.isFinite(target)) {
      valueRef.current = target;
      setValue(target);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const k = 1 - Math.exp(-dt / timeConstantMs);
      const next = valueRef.current + (target - valueRef.current) * k;
      const done = Math.abs(target - next) < 1e-3 * Math.max(1, Math.abs(target));
      valueRef.current = done ? target : next;
      setValue(valueRef.current);
      if (!done) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    // Safety net when animation frames are paused: snap to the target.
    const fallback = window.setTimeout(() => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      valueRef.current = target;
      setValue(target);
    }, timeConstantMs * 8 + 200);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.clearTimeout(fallback);
    };
  }, [target, timeConstantMs]);

  return value;
}
