/**
 * A notebook cell you can edit and run with real Python (Pyodide).
 * Output shows exactly what Python printed: stdout, the value of the last
 * expression (like Jupyter), errors, and any Matplotlib figures.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CodePanel, type CodeAnnotation } from './CodePanel';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IconPlay, IconReset } from '../ui/Icons';
import { resetPython, runPython, startPython, stopPython, usePython, type PyResult } from '../../lib/python/runtime';

interface Props {
  code: string;
  title: string;
  annotations?: CodeAnnotation[];
  badge?: ReactNode;
  testId?: string;
  /** Register this cell so "Run all" can run it. */
  onRegister?: (run: () => Promise<PyResult | null>) => () => void;
}

export function RunnableCell({ code: initial, title, annotations, badge, testId, onRegister }: Props) {
  const py = usePython();
  const [code, setCode] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<PyResult | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const codeRef = useRef(code);
  codeRef.current = code;

  const run = async (): Promise<PyResult | null> => {
    setRunning(true);
    setFailure(null);
    try {
      const r = await runPython(codeRef.current);
      setResult(r);
      return r;
    } catch (e) {
      setFailure((e as Error).message);
      return null;
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => onRegister?.(run), []); // eslint-disable-line react-hooks/exhaustive-deps

  const edited = code !== initial;
  const lines = code.split('\n').length;

  return (
    <div className="min-w-0 space-y-2" data-testid={testId}>
      {editing ? (
        <div className="overflow-hidden rounded-[22px] border-2 border-[#121826] bg-[#0F131B] shadow-[0_6px_0_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 font-mono text-[0.78em] text-[#9AA0AB]">
            {title} · editing <span className="text-[#7FD6D1]">Shift + Enter runs</span>
          </div>
          <textarea
            value={code}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            data-interactive="true"
            aria-label={`Edit ${title}`}
            rows={Math.max(3, lines + 1)}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                run();
              } else if (e.key === 'Tab') {
                e.preventDefault();
                const t = e.currentTarget;
                const s = t.selectionStart;
                setCode(code.slice(0, s) + '    ' + code.slice(t.selectionEnd));
                requestAnimationFrame(() => t.setSelectionRange(s + 4, s + 4));
              }
            }}
            className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[0.8em] leading-[1.65] text-[#EDEFF2] outline-none"
          />
        </div>
      ) : (
        <CodePanel code={code} title={title} badge={badge} annotations={edited ? [] : annotations} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="primary" icon={<IconPlay />} onClick={run} disabled={running} data-testid="run-cell">
          {running ? 'Running…' : result ? 'Run again' : 'Run'}
        </Button>
        <Button size="sm" active={editing} onClick={() => setEditing((v) => !v)} data-testid="edit-cell">
          {editing ? 'Done editing' : 'Edit code'}
        </Button>
        {edited && (
          <Button size="sm" variant="ghost" icon={<IconReset />} onClick={() => setCode(initial)}>
            Original code
          </Button>
        )}
        {result && <span className="font-mono text-[0.75em] text-muted">[{result.count}] · {Math.round(result.ms)} ms</span>}
        {running && py.status !== 'busy' && <span className="font-mono text-[0.75em] text-muted">{py.message}</span>}
      </div>

      {failure && (
        <div role="alert" className="rounded-xl border-2 border-neg bg-neg/10 px-3 py-2 text-[0.85em] text-ink">
          {failure}
        </div>
      )}
      {result && (
        <div className="min-w-0 overflow-hidden rounded-2xl border-2 border-bd bg-panel" data-testid="live-output">
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-line px-3 py-1.5">
            <span className="lab">Out [{result.count}]</span>
            <Badge kind="live">Ran in your browser</Badge>
            <span className="font-mono text-[0.7em] text-muted">
              Python {py.versions.python}
              {py.versions.pandas && ` · pandas ${py.versions.pandas}`}
              {py.versions.numpy && ` · NumPy ${py.versions.numpy}`}
              {py.versions.sklearn && ` · scikit-learn ${py.versions.sklearn}`}
            </span>
          </div>
          <div className="scrollbar-thin max-h-[420px] overflow-auto px-3 py-2" data-interactive="true">
            {result.stdout && <pre className="whitespace-pre font-mono text-[0.74em] leading-snug text-ink">{result.stdout.replace(/\n+$/, '')}</pre>}
            {result.result && <pre className="whitespace-pre font-mono text-[0.74em] leading-snug text-ink">{result.result}</pre>}
            {result.stderr && <pre className="whitespace-pre-wrap font-mono text-[0.74em] leading-snug text-neg" data-testid="live-error">{result.stderr.replace(/\n+$/, '')}</pre>}
            {result.figures.map((f, i) => (
              <img key={i} src={`data:image/png;base64,${f}`} alt={`Figure ${i + 1} produced by the cell`} className="mt-2 max-w-full rounded-lg bg-white" />
            ))}
            {!result.stdout && !result.result && !result.stderr && result.figures.length === 0 && <p className="font-mono text-[0.74em] text-muted">(no output)</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/** Runtime status, start / clear / stop controls, and the honest fine print. */
export function PythonBar({ onRunAll, runAllLabel = 'Run all cells' }: { onRunAll?: () => void; runAllLabel?: string }) {
  const py = usePython();
  const dot = { idle: 'bg-dim', loading: 'bg-yellow animate-pulse', ready: 'bg-pos', busy: 'bg-ac animate-pulse', error: 'bg-neg' }[py.status];
  return (
    <div className="cd flex flex-wrap items-center gap-3 px-4 py-3" data-testid="python-bar">
      <span className="flex items-center gap-2 font-bold">
        <span className={`inline-block h-3 w-3 rounded-full border-2 border-bd ${dot}`} />
        Python {py.status === 'idle' ? 'not started' : py.status === 'loading' ? 'starting' : py.status === 'busy' ? 'running' : py.status === 'error' ? 'unavailable' : 'ready'}
      </span>
      <span className="order-last min-w-0 basis-full text-[0.82em] text-muted sm:order-none sm:basis-0 sm:flex-1" aria-live="polite" data-testid="python-status">
        {py.status === 'idle'
          ? 'Real Python runs in this browser tab (Pyodide). The first start downloads about 12 MB, plus each library the first time it is imported (pandas, scikit-learn…, ≈ 40 MB in all); the browser caches them.'
          : py.message}
        {py.source === 'local' && ' · served from this site'}
      </span>
      {py.status === 'idle' || py.status === 'error' ? (
        <Button size="sm" variant="primary" icon={<IconPlay />} onClick={() => startPython().catch(() => undefined)} data-testid="start-python">
          Start Python
        </Button>
      ) : (
        <>
          {onRunAll && (
            <Button size="sm" variant="primary" icon={<IconPlay />} onClick={onRunAll} disabled={py.status !== 'ready'} data-testid="run-all">
              {runAllLabel}
            </Button>
          )}
          <Button size="sm" onClick={() => resetPython()} disabled={py.status !== 'ready'} title="Forget all variables, like restarting the kernel">
            Clear variables
          </Button>
          <Button size="sm" variant="ghost" onClick={stopPython} title="Stop Python immediately (e.g. an endless loop)">
            Stop
          </Button>
        </>
      )}
    </div>
  );
}
