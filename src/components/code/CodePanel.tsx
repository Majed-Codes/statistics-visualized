import { useState, type ReactNode } from 'react';
import { tokenLines, type TokenKind } from './highlight';
import { IconCheck, IconCopy } from '../ui/Icons';
import { CODE_THEME, themeVars } from '../../styles/themes';
import type { CSSProperties } from 'react';

const COLOR: Record<TokenKind, string> = {
  comment: 'text-dim italic',
  string: 'text-pos',
  number: 'text-yellow',
  keyword: 'text-mode',
  builtin: 'text-cyan',
  call: 'text-blue',
  attr: 'text-ink',
  op: 'text-muted',
  text: 'text-ink/90',
};

export interface CodeAnnotation {
  /** 1-based line numbers. */
  lines: number[];
  label: ReactNode;
}

interface CodePanelProps {
  code: string;
  title?: ReactNode;
  badge?: ReactNode;
  annotations?: CodeAnnotation[];
  /** Lines highlighted from the start (1-based). */
  highlight?: number[];
  testId?: string;
}

/**
 * Syntax-highlighted Python with line numbers, clickable annotations that
 * highlight the lines implementing each idea, and a copy button.
 * This only displays code — nothing is executed.
 */
export function CodePanel({ code, title, badge, annotations = [], highlight = [], testId }: CodePanelProps) {
  const [active, setActive] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const lines = tokenLines(code.replace(/\n+$/, ''));
  const lit = new Set(active !== null ? annotations[active].lines : highlight);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard API unavailable (http, old Safari): fall back to a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-[22px] border-2 border-[#121826] shadow-[0_6px_0_rgba(0,0,0,0.8)]" style={{ ...(themeVars(CODE_THEME) as CSSProperties), background: CODE_THEME.bg, color: CODE_THEME.fg }} data-testid={testId ?? 'code-panel'}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-1.5">
        <span className="font-mono text-[0.78em] text-muted">{title ?? 'Python'}</span>
        {badge}
        <div className="flex-1" />
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-line px-2 text-[0.75em] text-muted hover:text-ink pointer-coarse:min-h-10"
          aria-label="Copy code"
          data-testid="copy-code"
        >
          {copied ? <IconCheck /> : <IconCopy />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="scrollbar-thin overflow-x-auto py-2 font-mono text-[0.8em] leading-[1.65]" data-interactive="true">
        <code>
          {lines.map((toks, i) => (
            <div key={i} className={`flex pr-4 ${lit.has(i + 1) ? 'bg-yellow/10 shadow-[inset_3px_0_0_#FFD23F]' : ''}`}>
              <span className="w-9 shrink-0 select-none pr-3 text-right text-dim">{i + 1}</span>
              <span className="whitespace-pre">
                {toks.length === 0 ? ' ' : toks.map((t, j) => <span key={j} className={COLOR[t.kind]}>{t.text}</span>)}
              </span>
            </div>
          ))}
        </code>
      </pre>
      {annotations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2">
          {annotations.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(active === i ? null : i)}
              aria-pressed={active === i}
              className={`min-h-8 rounded-md border px-2 py-0.5 text-left text-[0.75em] pointer-coarse:min-h-10 ${active === i ? 'border-yellow bg-yellow/10 text-yellow' : 'border-line text-muted hover:text-ink'}`}
            >
              <span className="font-mono">L{a.lines.join(',')}</span> · {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
