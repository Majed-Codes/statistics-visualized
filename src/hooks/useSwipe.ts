import { useEffect, type RefObject } from 'react';

/**
 * Horizontal swipe navigation using Pointer Events (touch and pen only, so a
 * mouse drag never changes slides). Swipes that start on an interactive
 * element — sliders, buttons, charts, code — are ignored so they keep working.
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, onLeft: () => void, onRight: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number; t: number; id: number } | null = null;

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const target = e.target as Element | null;
      if (target?.closest('input, select, textarea, button, a, [data-interactive], pre, [role="slider"]')) return;
      start = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const dt = performance.now() - start.t;
      start = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy) && dt < 900) {
        if (dx < 0) onLeft();
        else onRight();
      }
    };
    const cancel = () => {
      start = null;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
    };
  }, [ref, onLeft, onRight]);
}
