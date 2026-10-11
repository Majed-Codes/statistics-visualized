import { useEffect, useState } from 'react';
import { SLIDES, TOTAL_SLIDES, plannedStartMinute, sectionOf } from '../../data/lecture-content';
import { useLectureChannel } from '../../hooks/useLectureChannel';
import { formatClock, useSessionTimer, SESSION_MINUTES } from '../../hooks/useSessionTimer';
import { NotesBody } from './NotesPanel';
import { Button } from '../ui/Button';
import { IconNext, IconPause, IconPlay, IconPrev, IconReset } from '../ui/Icons';

/**
 * Presenter window (open with P or the Presenter button, then drag it to the
 * laptop screen while the audience window is on the projector). It mirrors
 * the deck through a BroadcastChannel and never appears on the audience screen.
 */
export function PresenterView() {
  const [state, setState] = useState<{ n: number; step: number } | null>(null);
  const timer = useSessionTimer();
  const post = useLectureChannel((m) => {
    if (m.type === 'state') setState({ n: m.n, step: m.step });
  });
  useEffect(() => {
    document.title = 'Presenter · Statistics Visualized';
    post({ type: 'hello' });
    const id = window.setInterval(() => post({ type: 'hello' }), 2000);
    return () => window.clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') post({ type: 'command', command: 'next' });
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') post({ type: 'command', command: 'prev' });
      if (e.key === 't' || e.key === 'T') timer.toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post, timer]);

  if (!state) {
    return (
      <div className="p-6 text-ink" data-testid="presenter-waiting">
        <h1 className="text-[1.2em] font-semibold">Presenter view</h1>
        <p className="mt-2 text-muted">
          Waiting for the lecture window… Keep the main deck open in another window or tab of this browser. If nothing appears,
          your browser does not support BroadcastChannel; use the Notes button in the main window instead.
        </p>
      </div>
    );
  }

  const meta = SLIDES[state.n - 1];
  const nextMeta = SLIDES[state.n] as (typeof SLIDES)[number] | undefined;
  const pace = timer.elapsedMs / 60000 - plannedStartMinute(state.n);

  return (
    <div className="grid min-h-dvh gap-4 p-4 text-ink lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" data-testid="presenter-view">
      <section className="min-w-0">
        <div className="text-[0.75em] font-semibold uppercase tracking-wider text-muted">
          {sectionOf(state.n).id} · {sectionOf(state.n).title} · slide {state.n} / {TOTAL_SLIDES}
          {meta.steps > 0 && <> · reveal step {state.step} / {meta.steps}</>}
        </div>
        <h1 className="mt-1 text-[1.4em] font-semibold" dir="auto">{meta.sourceTitle}</h1>
        <div className="mt-3 rounded-xl border border-line bg-panel p-4">
          <NotesBody meta={meta} />
        </div>
      </section>
      <aside className="min-w-0 space-y-3">
        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="text-[0.8em] text-muted">Session timer · {SESSION_MINUTES} minutes</div>
          <div className={`tabular text-[2.4em] font-semibold ${timer.remainingMs < 0 ? 'text-neg' : timer.remainingMs < 600000 ? 'text-yellow' : ''}`}>
            {formatClock(timer.remainingMs)}
          </div>
          <div className="tabular text-[0.85em] text-muted">
            elapsed {formatClock(timer.elapsedMs)} · plan for this slide: minute {plannedStartMinute(state.n).toFixed(1)}
            {timer.elapsedMs > 0 && <span className={pace > 1 ? 'text-neg' : 'text-pos'}> · {pace > 0 ? `${pace.toFixed(1)} min behind` : `${(-pace).toFixed(1)} min ahead`}</span>}
          </div>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={timer.toggle} icon={timer.running ? <IconPause /> : <IconPlay />}>{timer.running ? 'Pause' : 'Start'}</Button>
            <Button size="sm" variant="ghost" onClick={timer.reset} icon={<IconReset />}>Reset timer</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => post({ type: 'command', command: 'prev' })} icon={<IconPrev />}>Back</Button>
          <Button variant="ghost" onClick={() => post({ type: 'command', command: 'reset' })} icon={<IconReset />}>Reset</Button>
          <Button variant="primary" onClick={() => post({ type: 'command', command: 'next' })} icon={<IconNext />}>Next</Button>
        </div>
        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="text-[0.8em] text-muted">Next slide</div>
          {nextMeta ? (
            <>
              <div className="mt-1 font-semibold" dir="auto">{nextMeta.n}. {nextMeta.sourceTitle}</div>
              <p className="mt-1 text-[0.85em] text-muted">{nextMeta.notes.objective}</p>
            </>
          ) : (
            <div className="mt-1 text-muted">End of lecture</div>
          )}
        </div>
        <label className="block text-[0.85em] text-muted">
          Jump to slide
          <select
            className="mt-1 min-h-10 w-full rounded-lg border border-line bg-panel px-2 text-ink"
            value={state.n}
            onChange={(e) => post({ type: 'goto', n: Number(e.target.value) })}
          >
            {SLIDES.map((s) => (
              <option key={s.n} value={s.n}>{s.n}. {s.sourceTitle}</option>
            ))}
          </select>
        </label>
      </aside>
    </div>
  );
}
