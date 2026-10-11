import { useEffect, useRef, useState } from 'react';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function reduced(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Tween an array of numbers towards `target` with requestAnimationFrame.
 * The result is written straight into plain SVG attributes (x, y, width,
 * height, opacity), which every browser paints identically — no CSS
 * transforms on SVG, no unit-suffixed attributes.
 */
export function useTween(target: readonly number[], duration = 600): number[] {
  const [value, setValue] = useState<number[]>(() => [...target]);
  const current = useRef<number[]>([...target]);
  const key = target.map((v) => v.toFixed(3)).join(',');

  useEffect(() => {
    const from = current.current;
    if (from.length !== target.length || reduced() || duration <= 0) {
      current.current = [...target];
      setValue([...target]);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOut(t);
      const next = target.map((v, i) => from[i] + (v - from[i]) * e);
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Safety net: if animation frames are paused (hidden tab, power saving),
    // jump to the final state so the visual is never stuck half-way.
    const fallback = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      current.current = [...target];
      setValue([...target]);
    }, duration + 200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration]);

  // When the number of animated values changes (a marker or square appears),
  // the stored array is stale for this render: use the target directly so no
  // attribute ever receives `undefined`/NaN.
  return value.length === target.length ? value : [...target];
}
