import katex from 'katex';
import { memo, useMemo } from 'react';

interface TexProps {
  children: string;
  display?: boolean;
  className?: string;
}

/**
 * KaTeX renderer. Rendered to an HTML string (no foreignObject, no runtime DOM
 * measurement), so it works identically in Safari and Chrome. A malformed
 * expression shows its source in red instead of throwing and blanking the slide.
 */
export const Tex = memo(function Tex({ children, display = false, className }: TexProps) {
  const html = useMemo(
    () =>
      // Inline maths uses display style so fractions stay legible on a projector.
      katex.renderToString(display ? children : `\\displaystyle ${children}`, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        output: 'htmlAndMathml',
      }),
    [children, display],
  );
  const Tag = display ? 'div' : 'span';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});
