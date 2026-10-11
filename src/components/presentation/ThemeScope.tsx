import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { applyTheme } from '../mathematics/primitives';
import { THEMES, themeVars, type ThemeId } from '../../styles/themes';

/**
 * Applies a section theme to everything inside: Tailwind colour utilities
 * (via CSS variables) and the SVG chart palette (via applyTheme, run during
 * render so children draw with the right shades on the first paint).
 */
export function ThemeScope({ theme, children, className = '' }: { theme: ThemeId; children: ReactNode; className?: string }) {
  const t = THEMES[theme];
  applyTheme(t);
  useEffect(() => {
    document.body.style.background = t.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg);
  }, [t.bg]);
  return (
    <div
      data-theme={t.name}
      data-dark={t.dark ? 'true' : 'false'}
      className={`theme-scope ${className}`}
      style={{ ...(themeVars(t) as CSSProperties), background: t.bg, color: t.fg, colorScheme: t.dark ? 'dark' : 'light' }}
    >
      {children}
    </div>
  );
}
