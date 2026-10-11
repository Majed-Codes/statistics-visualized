/// <reference lib="webworker" />
/**
 * Real Python (CPython compiled to WebAssembly by Pyodide) running in a Web
 * Worker, so long computations never freeze the slides.
 *
 * Packages are fetched on demand from each cell's imports
 * (loadPackagesFromImports): numpy, pandas, scikit-learn, matplotlib…
 * All cells share one namespace, exactly like a Jupyter kernel.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

const HELPER = String.raw`
import ast, io, sys, base64, traceback, contextlib, os
os.environ["MPLBACKEND"] = "AGG"
NS = {"__name__": "__main__"}

def _clean_tb(exc):
    lines = traceback.format_exception(exc)
    keep, seen = [lines[0]], False
    for l in lines[1:]:
        if '"<cell>"' in l:
            seen = True
        if seen:
            keep.append(l)
    return "".join(keep if seen else lines[-1:])

_PD_READY = False

def _jupyter_display():
    # Match Jupyter's text output: show all columns, wrapping wide frames at 80 chars.
    global _PD_READY
    pd = sys.modules.get("pandas")
    if pd is not None and not _PD_READY:
        pd.set_option("display.max_columns", 20)
        pd.set_option("display.width", 80)
        _PD_READY = True

def __run(src):
    out, err = io.StringIO(), io.StringIO()
    result, ok = None, True
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            tree = ast.parse(src, "<cell>")
            last = tree.body[-1] if tree.body and isinstance(tree.body[-1], ast.Expr) else None
            if last is not None:
                tree.body = tree.body[:-1]
            exec(compile(tree, "<cell>", "exec"), NS)
            _jupyter_display()
            if last is not None:
                value = eval(compile(ast.Expression(last.value), "<cell>", "eval"), NS)
                if value is not None:
                    result = repr(value)
        except BaseException as exc:
            ok = False
            err.write(_clean_tb(exc))
    figures = []
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is not None:
        for num in plt.get_fignums():
            buf = io.BytesIO()
            plt.figure(num).savefig(buf, format="png", dpi=110, bbox_inches="tight")
            figures.append(base64.b64encode(buf.getvalue()).decode())
        plt.close("all")
    return {"ok": ok, "stdout": out.getvalue(), "stderr": err.getvalue(), "result": result, "figures": figures}

def __reset():
    NS.clear()
    NS["__name__"] = "__main__"
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is not None:
        plt.close("all")

def __versions():
    v = {"python": sys.version.split()[0]}
    for name in ("numpy", "pandas", "sklearn", "matplotlib"):
        m = sys.modules.get(name)
        if m is not None:
            v[name] = m.__version__
    return v
`;

let pyodide: any = null;
let ready: Promise<void> | null = null;

const post = (m: unknown) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m);
const versions = () => pyodide.globals.get('__versions')().toJs({ dict_converter: Object.fromEntries });

async function init(base: string) {
  post({ type: 'status', text: 'Downloading the Python runtime (≈ 12 MB, cached after the first time)…' });
  const mod = await import(/* @vite-ignore */ `${base}pyodide.mjs`);
  pyodide = await mod.loadPyodide({ indexURL: base });
  pyodide.runPython(HELPER);
  post({ type: 'ready', versions: versions() });
}

self.onmessage = async (e: MessageEvent) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      ready ??= init(m.base);
      await ready;
    } else if (m.type === 'run') {
      if (!ready) throw new Error('Python is not started');
      await ready;
      const t0 = performance.now();
      await pyodide.loadPackagesFromImports(m.code, {
        messageCallback: (text: string) => post({ type: 'status', text }),
        errorCallback: (text: string) => post({ type: 'status', text }),
      });
      const res = pyodide.globals.get('__run')(m.code).toJs({ dict_converter: Object.fromEntries });
      post({ type: 'result', id: m.id, ms: performance.now() - t0, versions: versions(), ...res });
    } else if (m.type === 'reset') {
      if (ready) {
        await ready;
        pyodide.globals.get('__reset')();
      }
      post({ type: 'reset-done' });
    }
  } catch (err) {
    post({ type: 'error', id: m.id, message: (err as Error)?.message ?? String(err) });
  }
};
