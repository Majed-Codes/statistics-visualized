import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Width of an element in CSS pixels, kept up to date on resize and on
 * orientation change.
 *
 * Guards against the classic "blank chart on mobile" failure: before layout,
 * or in browsers without ResizeObserver, the measured width can be 0. We
 * never report less than `fallback`'s minimum, so charts always render.
 */
export function useMeasure<T extends HTMLElement = HTMLDivElement>(fallback = 640, min = 260) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);

  const read = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) setWidth((prev) => (Math.abs(prev - w) > 0.5 ? Math.max(min, w) : prev));
  }, [min]);

  useLayoutEffect(() => {
    read();
    const el = ref.current;
    let ro: ResizeObserver | undefined;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => read());
      ro.observe(el);
    }
    window.addEventListener('resize', read);
    window.addEventListener('orientationchange', read);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', read);
      window.removeEventListener('orientationchange', read);
    };
  }, [read]);

  return [ref, width] as const;
}
