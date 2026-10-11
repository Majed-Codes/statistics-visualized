/**
 * Client for the in-browser Python runtime (one shared kernel per page).
 *
 * Status is observable with `usePython()`. Code runs only after the user
 * presses Run or Start — nothing downloads until then.
 */
import { useSyncExternalStore } from 'react';

export const PYODIDE_VERSION = '314.0.7';
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export type PyStatus = 'idle' | 'loading' | 'ready' | 'busy' | 'error';

export interface PyState {
  status: PyStatus;
  message: string;
  versions: Record<string, string>;
  /** Jupyter-style execution counter. */
  count: number;
  source: 'local' | 'cdn' | null;
}

export interface PyResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  result: string | null;
  figures: string[];
  ms: number;
  count: number;
}

let state: PyState = { status: 'idle', message: '', versions: {}, count: 0, source: null };
const listeners = new Set<() => void>();
let worker: Worker | null = null;
let starting: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (r: PyResult) => void; reject: (e: Error) => void }>();
let queue: Promise<unknown> = Promise.resolve();

function set(p: Partial<PyState>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

export function usePython(): PyState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

/** Prefer a vendored copy (public/pyodide, for offline classrooms), else the official CDN. */
async function resolveBase(): Promise<{ base: string; source: 'local' | 'cdn' }> {
  const local = new URL('pyodide/', document.baseURI).href;
  try {
    const r = await fetch(`${local}pyodide.mjs`, { method: 'HEAD', cache: 'no-store' });
    if (r.ok && (r.headers.get('content-type') ?? '').includes('javascript')) return { base: local, source: 'local' };
  } catch {
    /* not vendored */
  }
  return { base: CDN, source: 'cdn' };
}

export function startPython(): Promise<void> {
  if (starting) return starting;
  if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
    set({ status: 'error', message: 'This browser cannot run Python (no Web Workers or WebAssembly). The saved outputs are still shown.' });
    return Promise.reject(new Error('unsupported'));
  }
  set({ status: 'loading', message: 'Starting Python…' });
  starting = new Promise<void>((resolve, reject) => {
    resolveBase().then(({ base, source }) => {
      set({ source });
      worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e: MessageEvent) => {
        const m = e.data;
        if (m.type === 'status') set({ message: m.text });
        else if (m.type === 'ready') {
          set({ status: 'ready', message: `Python ${m.versions.python} is ready`, versions: m.versions });
          resolve();
        } else if (m.type === 'result') {
          const p = pending.get(m.id);
          pending.delete(m.id);
          const count = state.count + 1;
          set({ status: 'ready', message: m.ok ? `Finished in ${Math.round(m.ms)} ms` : 'Finished with an error', versions: m.versions, count });
          p?.resolve({ ok: m.ok, stdout: m.stdout, stderr: m.stderr, result: m.result, figures: m.figures, ms: m.ms, count });
        } else if (m.type === 'error') {
          const msg = /fetch|network|load|import/i.test(m.message)
            ? `Could not download Python packages (${m.message}). Check the internet connection — the saved outputs are still shown.`
            : m.message;
          if (m.id && pending.has(m.id)) {
            pending.get(m.id)!.reject(new Error(msg));
            pending.delete(m.id);
            set({ status: 'ready', message: msg });
          } else {
            set({ status: 'error', message: msg });
            starting = null;
            reject(new Error(msg));
          }
        }
      };
      worker.onerror = (e) => {
        set({ status: 'error', message: `The Python worker failed: ${e.message || 'unknown error'}` });
        starting = null;
        reject(new Error(e.message));
      };
      worker.postMessage({ type: 'init', base });
    });
  });
  return starting;
}

/** Run one cell. Cells run one at a time, in the order they were requested. */
export function runPython(code: string): Promise<PyResult> {
  const job = queue.then(async () => {
    await startPython();
    set({ status: 'busy', message: 'Running…' });
    const id = nextId++;
    return new Promise<PyResult>((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker!.postMessage({ type: 'run', id, code });
    });
  });
  queue = job.catch(() => undefined);
  return job;
}

/** Clear every variable (like "Restart kernel" without re-downloading). */
export function resetPython(): Promise<void> {
  if (!worker) return Promise.resolve();
  return new Promise((resolve) => {
    const w = worker!;
    const done = (e: MessageEvent) => {
      if (e.data?.type === 'reset-done') {
        w.removeEventListener('message', done);
        set({ count: 0, message: 'Variables cleared' });
        resolve();
      }
    };
    w.addEventListener('message', done);
    w.postMessage({ type: 'reset' });
  });
}

/** Hard stop (e.g. an infinite loop): terminates the worker. */
export function stopPython() {
  worker?.terminate();
  worker = null;
  starting = null;
  pending.forEach((p) => p.reject(new Error('Python was stopped')));
  pending.clear();
  queue = Promise.resolve();
  set({ status: 'idle', message: 'Python stopped. Press Run to start again.', count: 0 });
}
