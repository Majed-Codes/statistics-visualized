/**
 * Python Lab: the supplied notebook, cell by cell. Every cell can be RUN with
 * real Python in the browser (Pyodide) and edited. Next to it: the output
 * saved in the original .ipynb, a plain explanation, the interpretation, the
 * concept and the slides that teach it. Cells with a problem also show the
 * corrected cell (also runnable) and a TypeScript cross-check.
 */
import { useEffect, useRef } from 'react';
import { PythonBar, RunnableCell } from '../../components/code/RunnableCell';
import { navigate, slideHash } from '../../app/router';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/ui/Panel';
import { IconPrev } from '../../components/ui/Icons';
import { LAB, correctedCell, originalCell } from '../../data/notebook';
import { SLIDES } from '../../data/lecture-content';
import { runPython, type PyResult } from '../../lib/python/runtime';
import { liveCheck } from './LiveCheck';

function SavedOutput({ text, label }: { text: string[]; label: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border-2 border-line bg-panel/60">
      <div className="flex items-center gap-2 border-b-2 border-line px-3 py-1.5">
        <span className="lab">{label}</span>
        <Badge kind="precomputed">saved in the .ipynb</Badge>
      </div>
      {text.length ? (
        <pre className="scrollbar-thin max-h-[420px] overflow-auto px-3 py-2 font-mono text-[0.74em] leading-snug text-ink/90" data-interactive="true">
          {text.join('\n').replace(/\n+$/, '')}
        </pre>
      ) : (
        <p className="px-3 py-2 font-mono text-[0.74em] text-muted">(no output)</p>
      )}
    </div>
  );
}

type Runner = () => Promise<PyResult | null>;

const SCRATCH = `# Try it: plot one feature (uses df from "Load the Iris dataset")
import matplotlib.pyplot as plt

column = "petal length (cm)"
df[column].plot.hist(bins=20, edgecolor="black")
plt.xlabel(column)
plt.title("Petal length has two clusters")
plt.tight_layout()`;

export default function PythonLab({ cell }: { cell?: string }) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const originals = useRef(new Map<string, Runner>());
  const corrected = useRef(new Map<string, Runner>());

  useEffect(() => {
    document.title = 'Python Lab · Statistics Visualized';
    if (cell && refs.current[cell]) refs.current[cell]!.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [cell]);

  const register = (map: Map<string, Runner>, id: string) => (run: Runner) => {
    map.set(id, run);
    return () => map.delete(id);
  };
  const runAll = async (map: Map<string, Runner>, order: string[]) => {
    for (const id of order) {
      const r = map.get(id);
      if (r) await r();
    }
  };
  const origOrder = LAB.map((e) => e.id);
  const corrOrder = LAB.map((e) => e.correctedId ?? e.id);

  return (
    <div className="min-h-dvh text-ink" data-testid="python-lab">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b-2 border-line bg-canvas px-4 py-2.5 sm:px-[5vw]">
        <Button size="sm" variant="ghost" icon={<IconPrev />} onClick={() => navigate(slideHash(52))}>
          Back to lecture
        </Button>
        <span className="font-mono text-[0.78em] text-muted">Session5_Statistics_DEMO.ipynb</span>
        <div className="flex-1" />
        <Button size="sm" onClick={() => navigate('#/explorer')}>
          Iris Explorer
        </Button>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 pt-6 sm:px-[5vw]">
        <div className="flex flex-wrap items-end gap-6">
          <span className="font-extrabold leading-[0.8] tracking-[-0.06em] text-ac" style={{ fontSize: 'clamp(64px, 9vw, 140px)' }} aria-hidden="true">
            py
          </span>
          <div>
            <div className="lab">The practical section</div>
            <h1 className="font-extrabold leading-[0.95] tracking-[-0.04em]" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              Python Lab
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-[62ch] text-[1.1em] font-medium">
          Every cell of the notebook, runnable right here. Press <b>Run</b> on a cell, or run the whole notebook from the top. You can edit any cell and run it again —
          variables carry over from cell to cell, just like Jupyter.
        </p>
        <div className="z-10 mt-5 lg:sticky lg:top-[58px]">
          <PythonBar />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => runAll(originals.current, origOrder)} data-testid="run-original">
            Run the original notebook
          </Button>
          <Button variant="primary" onClick={() => runAll(corrected.current, corrOrder)} data-testid="run-corrected">
            Run the corrected notebook
          </Button>
          <a className="tb inline-flex min-h-11 items-center rounded-full px-4 text-[0.92em] font-semibold" href="notebooks/Session5_Statistics_DEMO_original.ipynb" download>
            Download original .ipynb
          </a>
          <a className="tb inline-flex min-h-11 items-center rounded-full px-4 text-[0.92em] font-semibold" href="notebooks/Session5_Statistics_DEMO_corrected.ipynb" download>
            Download corrected .ipynb
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-6 sm:px-[5vw] lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="min-w-0 lg:sticky lg:top-[150px] lg:self-start" aria-label="Notebook cells">
          <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {LAB.map((e, i) => (
              <li key={e.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`#/lab/${e.id}`, true)}
                  className={`w-full rounded-lg border-2 px-2.5 py-1.5 text-left text-[0.84em] font-semibold ${cell === e.id ? 'border-bd bg-ac text-onac' : 'border-line hover:border-bd'}`}
                >
                  <span className="font-mono opacity-70">{i + 1}.</span> {e.title}
                  {e.issue && <span className="ml-1 text-neg" title="Has a documented correction">●</span>}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <main className="min-w-0 space-y-12">
          <Note title="What is real here">
            <b>Run</b> executes genuine Python 3 with NumPy, pandas and scikit-learn, compiled to WebAssembly (Pyodide) — the same libraries as Jupyter, so results match;
            library versions are newer than the original run, so text formatting can differ slightly. The grey panels are the outputs <b>saved in the .ipynb file</b>.
            The green “computed live” tables are an independent TypeScript check. <span className="text-neg">●</span> marks a cell with a documented correction; the
            original notebook is unchanged.
          </Note>
          {LAB.map((e, i) => {
            const orig = originalCell(e.id);
            const corr = e.correctedId ? correctedCell(e.correctedId) : undefined;
            const live = liveCheck(e.id);
            return (
              <article key={e.id} ref={(el) => { refs.current[e.id] = el; }} className="scroll-mt-40 space-y-4" data-testid={`lab-${e.id}`}>
                <header className="flex flex-wrap items-end gap-x-4 gap-y-2 border-t-2 border-line pt-6">
                  <span className="font-mono text-[0.85em] text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="text-[clamp(24px,2.6vw,38px)] font-extrabold leading-none tracking-[-0.03em]">{e.title}</h2>
                  <span className="rounded-full border-2 border-bd px-2.5 py-0.5 text-[0.78em] font-semibold">{e.concept}</span>
                  <span className="flex flex-wrap gap-1">
                    {e.slides.map((n) => (
                      <button key={n} type="button" onClick={() => navigate(slideHash(n))} className="rounded-md border-[1.5px] border-line px-1.5 font-mono text-[0.72em] text-muted hover:border-bd hover:text-ink" title={SLIDES[n - 1].sourceTitle}>
                        slide {n}
                      </button>
                    ))}
                  </span>
                </header>
                <p className="max-w-[72ch] text-[1.02em]">{e.explanation}</p>
                <div className="grid gap-4 xl:grid-cols-2">
                  {orig && (
                    <RunnableCell
                      code={orig.source}
                      title={`${e.id} · original`}
                      badge={<Badge kind="source">notebook</Badge>}
                      annotations={e.annotations}
                      onRegister={register(originals.current, e.id)}
                      testId={`run-${e.id}`}
                    />
                  )}
                  {orig && <SavedOutput text={orig.outputs} label="Saved output" />}
                </div>
                <p className="max-w-[72ch]">
                  <b className="text-ac">Interpretation.</b> {e.interpretation}
                </p>
                {e.issue && (
                  <div className="space-y-3 rounded-2xl border-2 border-neg p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge kind="correction" />
                      <span className="text-[0.92em] font-medium">{e.issue}</span>
                    </div>
                    {corr && (
                      <div className="grid gap-4 xl:grid-cols-2">
                        <RunnableCell code={corr.source} title={`${e.correctedId} · corrected`} onRegister={register(corrected.current, corr.id)} testId={`run-${corr.id}-fixed`} />
                        <SavedOutput text={corr.outputs} label="Saved output of the corrected notebook" />
                      </div>
                    )}
                  </div>
                )}
                {!e.issue && corr && <RegisterOnly code={corr.source} id={corr.id} register={register(corrected.current, corr.id)} />}
                {live && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[0.8em] text-muted">
                      <Badge kind="live">Computed live · TypeScript</Badge> four measurements only
                    </div>
                    {live}
                  </div>
                )}
              </article>
            );
          })}
          <article className="space-y-4 border-t-2 border-line pt-6" data-testid="lab-scratch">
            <header className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="font-mono text-[0.85em] text-muted">+</span>
              <h2 className="text-[clamp(24px,2.6vw,38px)] font-extrabold leading-none tracking-[-0.03em]">Your turn</h2>
              <Badge kind="added" />
            </header>
            <p className="max-w-[72ch]">
              A free cell. It uses <code>df</code> from the cells above (run “Load the Iris dataset” first). Change the column, the bins or the title and run it again —
              figures appear below the cell.
            </p>
            <RunnableCell code={SCRATCH} title="scratch" testId="run-scratch" />
          </article>
        </main>
      </div>
    </div>
  );
}

/**
 * Cells identical in both notebooks (the imports) still have to run when
 * "Run the corrected notebook" is pressed; this registers them invisibly.
 */
function RegisterOnly({ code, register }: { code: string; id: string; register: (run: Runner) => () => void }) {
  useEffect(() => {
    return register(() => runPython(code));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

