/** Inline stroke icons (no icon dependency). */
import type { SVGProps } from 'react';

function I({ d, ...p }: { d: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d={d} />
    </svg>
  );
}

export const IconPrev = () => <I d="M15 18l-6-6 6-6" />;
export const IconNext = () => <I d="M9 18l6-6-6-6" />;
export const IconGrid = () => <I d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />;
export const IconNotes = () => <I d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h4" />;
export const IconExpand = () => <I d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />;
export const IconTimer = () => <I d="M12 8v5l3 2M9 2h6M12 22a8 8 0 100-16 8 8 0 000 16z" />;
export const IconHelp = () => <I d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4.5M12 18h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />;
export const IconReset = () => <I d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8M3 3v5h5" />;
export const IconWindow = () => <I d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />;
export const IconCode = () => <I d="M8 6l-6 6 6 6M16 6l6 6-6 6" />;
export const IconScatter = () => <I d="M4 20h16M4 20V4M8 15h.01M11 11h.01M15 13h.01M17 7h.01M13 8h.01" />;
export const IconCopy = () => <I d="M8 8h11v12H8zM5 16H4V4h12v1" />;
export const IconCheck = () => <I d="M4 12l5 5L20 6" />;
export const IconMenu = () => <I d="M4 6h16M4 12h16M4 18h16" />;
export const IconClose = () => <I d="M6 6l12 12M18 6L6 18" />;
export const IconPlay = () => <I d="M7 5l12 7-12 7z" />;
export const IconPause = () => <I d="M8 5v14M16 5v14" />;
