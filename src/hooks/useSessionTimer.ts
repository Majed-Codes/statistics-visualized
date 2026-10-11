import { useCallback, useEffect, useState } from 'react';

export const SESSION_MINUTES = 90;
const KEY = 'sv-session-timer';

interface TimerState {
  running: boolean;
  /** ms timestamp when the current run started. */
  startedAt: number;
  /** ms accumulated in previous runs. */
  accumulated: number;
}

const INITIAL: TimerState = { running: false, startedAt: 0, accumulated: 0 };

function load(): TimerState {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (s && typeof s.accumulated === 'number') return s as TimerState;
  } catch {
    /* storage unavailable (private mode) — timer still works in memory */
  }
  return INITIAL;
}

function save(s: TimerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/**
 * The 90-minute session timer. Persisted in localStorage so it survives a
 * reload and is shared with the presenter window (via the storage event).
 */
export function useSessionTimer() {
  const [state, setState] = useState<TimerState>(load);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(load());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const update = useCallback((s: TimerState) => {
    save(s);
    setState(s);
    setNow(Date.now());
  }, []);

  const elapsedMs = state.accumulated + (state.running ? now - state.startedAt : 0);

  return {
    running: state.running,
    elapsedMs,
    remainingMs: SESSION_MINUTES * 60_000 - elapsedMs,
    toggle: () =>
      state.running
        ? update({ running: false, startedAt: 0, accumulated: elapsedMs })
        : update({ running: true, startedAt: Date.now(), accumulated: state.accumulated }),
    reset: () => update(INITIAL),
  };
}

export function formatClock(ms: number): string {
  const neg = ms < 0;
  const t = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${neg ? '−' : ''}${m}:${s.toString().padStart(2, '0')}`;
}
