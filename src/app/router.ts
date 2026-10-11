import { useEffect, useState } from 'react';
import { TOTAL_SLIDES } from '../data/lecture-content';

/**
 * Hash routes (work on any static host, including GitHub Pages sub-paths):
 *   #/slide/12     the deck at slide 12
 *   #/presenter    presenter view (second window: notes, timer, next slide)
 *   #/lab[/cell-8] the Python Lab
 *   #/explorer     the Iris dataset explorer
 */
export type Route =
  | { view: 'deck'; n: number }
  | { view: 'presenter' }
  | { view: 'lab'; cell?: string }
  | { view: 'explorer' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'presenter') return { view: 'presenter' };
  if (parts[0] === 'lab') return { view: 'lab', cell: parts[1] };
  if (parts[0] === 'explorer') return { view: 'explorer' };
  const n = parts[0] === 'slide' ? Number(parts[1]) : 1;
  return { view: 'deck', n: Number.isFinite(n) ? Math.min(TOTAL_SLIDES, Math.max(1, Math.round(n))) : 1 };
}

export function slideHash(n: number): string {
  return `#/slide/${n}`;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function navigate(hash: string, replace = false) {
  if (replace) window.history.replaceState(null, '', hash);
  else window.history.pushState(null, '', hash);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
