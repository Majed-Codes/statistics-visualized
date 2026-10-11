import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { SLIDES, TOTAL_SLIDES, plannedStartMinute, sectionOf, SECTIONS } from '../../data/lecture-content';
import { SLIDE_REGISTRY } from '../../slides';
import { ErrorBoundary } from '../../app/ErrorBoundary';
import { navigate, slideHash } from '../../app/router';
import { useSessionTimer, formatClock } from '../../hooks/useSessionTimer';
import { useLectureChannel, type LectureMessage } from '../../hooks/useLectureChannel';
import { useSwipe } from '../../hooks/useSwipe';
import { useFullscreen } from '../../hooks/useFullscreen';
import { THEMES, type ThemeId } from '../../styles/themes';
import { SlideContext } from './SlideContext';
import { LectureStateContext } from './LectureState';
import { SlideFrame } from './SlideFrame';
import { Progress } from './Progress';
import { Overview } from './Overview';
import { HelpOverlay } from './HelpOverlay';
import { NotesBody } from './NotesPanel';
import { ThemeScope } from './ThemeScope';
import { Button } from '../ui/Button';
import { IconClose, IconCode, IconExpand, IconGrid, IconHelp, IconMenu, IconNotes, IconPause, IconPlay, IconReset, IconScatter, IconWindow } from '../ui/Icons';

/** Title slides use the orange field; every other slide takes its section's colour. */
export function themeForSlide(n: number): ThemeId {
  return n === 1 || n === 2 || n === TOTAL_SLIDES ? 'title' : sectionOf(n).id;
}

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
}

function reducedMotion() {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Logo: a tiny scatter with its mean. */
function Mark() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" rx="5" fill="var(--color-ink)" />
      <circle cx="6" cy="13" r="1.7" fill="var(--color-canvas)" />
      <circle cx="9" cy="10" r="1.7" fill="var(--color-canvas)" />
      <circle cx="14" cy="6" r="1.7" fill="var(--color-canvas)" />
      <circle cx="10" cy="10" r="2.6" fill="var(--color-ac)" />
    </svg>
  );
}

export function Deck({ n }: { n: number }) {
  const meta = SLIDES[n - 1];
  const entry = SLIDE_REGISTRY[n];
  const [steps, setSteps] = useState<Record<number, number>>({});
  const [resetKeys, setResetKeys] = useState<Record<number, number>>({});
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);
  const [notes, setNotes] = useState(false);
  const [menu, setMenu] = useState(false);
  const [laser, setLaser] = useState(false);
  const [black, setBlack] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Record<string, 'feature' | 'target' | undefined>>({});
  const digits = useRef('');
  const mainRef = useRef<HTMLElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const timer = useSessionTimer();
  const fs = useFullscreen();
  const themeId = themeForSlide(n);
  const prevTheme = useRef(themeId);
  const prevN = useRef(n);

  const step = Math.min(steps[n] ?? 0, meta.steps);
  const setStep = useCallback((s: number) => setSteps((m) => ({ ...m, [n]: Math.max(0, Math.min(meta.steps, s)) })), [n, meta.steps]);

  const goto = useCallback((k: number) => {
    navigate(slideHash(Math.max(1, Math.min(TOTAL_SLIDES, k))), true);
  }, []);
  const next = useCallback(() => {
    if (step < meta.steps) setStep(step + 1);
    else if (n < TOTAL_SLIDES) goto(n + 1);
  }, [step, meta.steps, n, setStep, goto]);
  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else if (n > 1) goto(n - 1);
  }, [step, n, setStep, goto]);
  const resetSlide = useCallback(() => {
    setSteps((m) => ({ ...m, [n]: 0 }));
    setResetKeys((m) => ({ ...m, [n]: (m[n] ?? 0) + 1 }));
  }, [n]);

  // New slide: back to the top; start the session timer on first move.
  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 });
    document.title = `${n}/53 · ${meta.sourceTitle} · Statistics Visualized`;
  }, [n, meta.sourceTitle]);

  // Direction of travel (slides glide in from that side).
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');

  // Section change: the old colour field closes like an iris onto the arrow
  // that was pressed (→ bottom right, ← bottom left), uncovering the new one.
  // Removed by a timer, never by an animation event, so it cannot get stuck.
  useEffect(() => {
    const el = wipeRef.current;
    const from = prevTheme.current;
    const forward = n >= prevN.current;
    setDir(forward ? 'fwd' : 'back');
    prevTheme.current = themeId;
    prevN.current = n;
    if (!el || from === themeId || reducedMotion() || typeof el.animate !== 'function') return;
    el.style.background = THEMES[from].bg;
    el.style.display = 'block';
    const at = forward ? '94% 94%' : '6% 94%';
    el.animate([{ clipPath: `circle(150% at ${at})` }, { clipPath: `circle(0% at ${at})` }], { duration: 640, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    const t = window.setTimeout(() => {
      el.style.display = 'none';
    }, 680);
    return () => window.clearTimeout(t);
  }, [themeId, n]);

  // Presenter-window synchronisation.
  const post = useLectureChannel((m: LectureMessage) => {
    if (m.type === 'goto') {
      goto(m.n);
      if (m.step !== undefined) setSteps((s) => ({ ...s, [m.n]: m.step! }));
    } else if (m.type === 'command') {
      if (m.command === 'next') next();
      else if (m.command === 'prev') prev();
      else resetSlide();
    } else if (m.type === 'hello') {
      post({ type: 'state', n, step });
    }
  });
  useEffect(() => {
    post({ type: 'state', n, step });
  }, [n, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPresenter = useCallback(() => {
    window.open(`${window.location.pathname}${window.location.search}#/presenter`, 'statistics-visualized-presenter', 'width=980,height=760');
  }, []);

  // Laser pointer follows the mouse.
  useEffect(() => {
    if (!laser) return;
    document.body.classList.add('laser-on');
    const move = (e: PointerEvent) => {
      if (laserRef.current) laserRef.current.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
    };
    window.addEventListener('pointermove', move);
    return () => {
      document.body.classList.remove('laser-on');
      window.removeEventListener('pointermove', move);
    };
  }, [laser]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (black) {
        setBlack(false);
        e.preventDefault();
        return;
      }
      if (k === 'Escape') {
        setOverview(false);
        setHelp(false);
        setMenu(false);
        setLaser(false);
        return;
      }
      if (overview || help) return;
      if (/^[0-9]$/.test(k)) {
        digits.current = (digits.current + k).slice(-2);
        return;
      }
      if (k === 'Enter' && digits.current) {
        goto(Number(digits.current));
        digits.current = '';
        e.preventDefault();
        return;
      }
      digits.current = '';
      const role = (e.target as HTMLElement | null)?.getAttribute?.('role');
      const onButton = (e.target as HTMLElement | null)?.tagName === 'BUTTON' || role === 'button' || role === 'radio';
      if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !onButton)) {
        e.preventDefault();
        if (e.shiftKey) goto(n + 1);
        else next();
      } else if (k === 'ArrowLeft' || k === 'PageUp') {
        e.preventDefault();
        if (e.shiftKey) goto(n - 1);
        else prev();
      } else if (k === 'Home') goto(1);
      else if (k === 'End') goto(TOTAL_SLIDES);
      else if (k === 'o' || k === 'O') setOverview(true);
      else if (k === 'n' || k === 'N') setNotes((v) => !v);
      else if (k === 'p' || k === 'P') openPresenter();
      else if (k === 't' || k === 'T') timer.toggle();
      else if (k === 'r' || k === 'R') resetSlide();
      else if (k === 'f' || k === 'F') fs.toggle();
      else if (k === 'l' || k === 'L') setLaser((v) => !v);
      else if (k === 'b' || k === 'B') setBlack(true);
      else if (k === '?' || k === 'h' || k === 'H') setHelp(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n, next, prev, goto, overview, help, black, openPresenter, timer, resetSlide, fs]);

  useSwipe(mainRef, next, prev);

  const slideState = useMemo(() => ({ n, step, steps: meta.steps, setStep, resetKey: resetKeys[n] ?? 0 }), [n, step, meta.steps, setStep, resetKeys]);
  const lectureState = useMemo(
    () => ({
      votes,
      setVote: (key: string, value: string) => setVotes((v) => ({ ...v, [key]: value })),
      roles,
      setRole: (key: string, value: 'feature' | 'target' | undefined) => setRoles((r) => ({ ...r, [key]: value })),
    }),
    [votes, roles],
  );

  const section = sectionOf(n);
  const pace = timer.elapsedMs / 60000 - plannedStartMinute(n);
  const Slide = entry.Component;
  const closeMenu = () => setMenu(false);

  const tools: { label: string; key: string; icon: ReactElement; onClick: () => void; testId?: string; disabled?: boolean; title?: string; on?: boolean }[] = [
    { label: 'All slides', key: 'O', icon: <IconGrid />, onClick: () => setOverview(true), testId: 'btn-overview' },
    { label: notes ? 'Hide notes' : 'Notes here', key: 'N', icon: <IconNotes />, onClick: () => setNotes((v) => !v), testId: 'btn-notes', on: notes },
    { label: 'Presenter window', key: 'P', icon: <IconWindow />, onClick: openPresenter },
    { label: 'Python Lab', key: '', icon: <IconCode />, onClick: () => navigate('#/lab') },
    { label: 'Iris Explorer', key: '', icon: <IconScatter />, onClick: () => navigate('#/explorer') },
    {
      label: fs.active ? 'Exit fullscreen' : 'Fullscreen',
      key: 'F',
      icon: <IconExpand />,
      onClick: fs.toggle,
      disabled: !fs.supported,
      title: fs.supported ? undefined : 'Not available in iPhone Safari. Use Share → Add to Home Screen.',
    },
    { label: laser ? 'Laser off' : 'Laser pointer', key: 'L', icon: <span className="inline-block h-3 w-3 rounded-full bg-[#ff2a1a]" />, onClick: () => setLaser((v) => !v), on: laser },
    { label: 'Black screen', key: 'B', icon: <span className="inline-block h-3 w-3 rounded-sm bg-black" />, onClick: () => setBlack(true) },
    { label: 'Help', key: '?', icon: <IconHelp />, onClick: () => setHelp(true), testId: 'btn-help' },
  ];

  return (
    <SlideContext.Provider value={slideState}>
      <LectureStateContext.Provider value={lectureState}>
        <ThemeScope theme={themeId}>
          <div className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden" style={{ height: '100dvh' }}>
            {/* ── top corners ── */}
            <header className="no-print flex items-center gap-3 px-4 pt-3 pb-1 sm:px-[5vw] sm:pt-5">
              <button type="button" onClick={() => goto(1)} className="flex items-center gap-2 font-bold tracking-tight text-ink" title="Back to the title slide">
                <Mark />
                <span className="hidden whitespace-nowrap text-[0.95em] md:inline">Statistics Visualized</span>
              </button>
              <div className="flex min-w-0 flex-1 justify-center">
                <label className="sr-only" htmlFor="section-select">Section</label>
                <select
                  id="section-select"
                  value={section.id}
                  onChange={(e) => goto(SECTIONS.find((s) => s.id === e.target.value)!.from)}
                  className="min-h-9 min-w-0 max-w-[52vw] cursor-pointer truncate rounded-full border-2 border-line bg-transparent px-3 font-mono text-[0.72em] text-ink pointer-coarse:min-h-11"
                  data-testid="section-select"
                >
                  {SECTIONS.map((s, i) => (
                    <option key={s.id} value={s.id} style={{ color: '#121826', background: '#ECEFF3' }}>
                      {String(i + 1).padStart(2, '0')} · {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <span className="tabular whitespace-nowrap font-mono text-[0.8em] text-muted" data-testid="slide-counter">
                <b className="font-medium text-ink">{String(n).padStart(2, '0')}</b> / {TOTAL_SLIDES}
              </span>
              <Button size="sm" onClick={() => setMenu((v) => !v)} icon={menu ? <IconClose /> : <IconMenu />} aria-label="Tools" aria-expanded={menu} data-testid="btn-menu">
                <span className="hidden sm:inline">Tools</span>
              </Button>
            </header>

            {menu && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeMenu} aria-hidden="true" />
                <div className="cd no-print fixed right-3 top-16 z-50 grid w-[min(340px,calc(100vw-24px))] gap-1.5 p-3 sm:right-[5vw]" role="menu" data-testid="mobile-menu">
                  {tools.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      role="menuitem"
                      disabled={t.disabled}
                      title={t.title}
                      data-testid={t.testId}
                      onClick={() => {
                        t.onClick();
                        closeMenu();
                      }}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left font-semibold disabled:opacity-40 ${t.on ? 'bg-ac text-onac' : 'hover:bg-panel-2'}`}
                    >
                      <span className="flex w-5 justify-center">{t.icon}</span>
                      <span className="flex-1">{t.label}</span>
                      {t.key && <kbd className="rounded border-[1.5px] border-line px-1.5 font-mono text-[0.72em] text-muted">{t.key}</kbd>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── slide + notes ── */}
            <div className="flex min-h-0">
              <main ref={mainRef} className="scrollbar-thin min-w-0 flex-1 overflow-y-auto overflow-x-hidden" id="slide-main">
                <ErrorBoundary where={`Slide ${n}`} resetOn={n}>
                  <SlideFrame meta={meta} subtitle={entry.subtitle} bare={entry.bare} dir={dir}>
                    <Slide key={`${n}-${resetKeys[n] ?? 0}`} />
                  </SlideFrame>
                </ErrorBoundary>
              </main>
              {notes && (
                <aside
                  className="cd no-print fixed inset-x-3 bottom-20 z-30 max-h-[55dvh] overflow-y-auto p-4 md:static md:m-3 md:mr-[5vw] md:max-h-none md:w-[min(420px,34vw)]"
                  data-testid="notes-drawer"
                  aria-label="Presenter notes"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-ac px-2 py-0.5 font-mono text-[0.7em] font-medium uppercase tracking-wide text-onac">Notes visible on this screen</span>
                    <Button size="sm" variant="ghost" onClick={() => setNotes(false)} icon={<IconClose />} aria-label="Hide notes" />
                  </div>
                  <NotesBody meta={meta} />
                </aside>
              )}
            </div>

            {/* ── bottom corners ── */}
            <footer className="no-print relative px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-2 sm:px-[5vw] sm:pb-5">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {meta.steps > 0 ? (
                    <>
                      {step < meta.steps ? (
                        <Button variant="primary" className="shrink-0" onClick={() => setStep(step + 1)} data-testid="btn-reveal" title="Reveal the next step (→)">
                          Reveal <span className="tabular font-mono text-[0.85em]">{step}/{meta.steps}</span>
                        </Button>
                      ) : (
                        <Button variant="ghost" disabled data-testid="btn-reveal" className="shrink-0 !px-2 !opacity-100">
                          ✓<span className="hidden sm:inline"> revealed</span> <span className="tabular font-mono text-[0.85em]">{step}/{meta.steps}</span>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="max-sm:!hidden" onClick={() => setStep(meta.steps)} disabled={step >= meta.steps} data-testid="btn-reveal-all">
                        all
                      </Button>
                    </>
                  ) : (
                    <span className="hidden truncate font-mono text-[0.75em] text-muted sm:inline">
                      {String(SECTIONS.indexOf(section) + 1).padStart(2, '0')} · {section.title}
                    </span>
                  )}
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={resetSlide} icon={<IconReset />} title="Reset this slide: hide answers and restore the demos (R)" data-testid="btn-reset">
                    <span className="hidden md:inline">reset</span>
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={timer.toggle}
                  title={`${timer.running ? 'Pause' : 'Start'} the 90-minute timer (T). Plan for this slide: minute ${plannedStartMinute(n).toFixed(1)}.`}
                  className={`tabular inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-1.5 font-mono text-[0.78em] pointer-coarse:min-h-11 ${
                    timer.remainingMs < 0 ? 'text-neg' : timer.remainingMs < 10 * 60000 ? 'text-ac' : 'text-muted hover:text-ink'
                  }`}
                  data-testid="timer"
                >
                  {timer.running ? <IconPause /> : <IconPlay />}
                  <span>{formatClock(timer.remainingMs)}</span>
                  {timer.elapsedMs > 0 && Math.abs(pace) >= 1 && (
                    <span className={`hidden lg:inline ${pace > 0 ? 'text-neg' : 'text-pos'}`}>{pace > 0 ? `+${pace.toFixed(0)}′` : `−${(-pace).toFixed(0)}′`}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={prev}
                  disabled={n === 1 && step === 0}
                  aria-label="Previous"
                  data-testid="btn-prev"
                  className="tb flex h-11 w-11 items-center justify-center rounded-full font-mono text-[1.05em] disabled:opacity-35 sm:h-10 sm:w-10"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={n === TOTAL_SLIDES && step >= meta.steps}
                  aria-label={step < meta.steps ? 'Next step' : 'Next'}
                  data-testid="btn-next"
                  className="tb is-on flex h-11 w-11 items-center justify-center rounded-full font-mono text-[1.05em] disabled:opacity-35 sm:h-10 sm:w-10"
                >
                  →
                </button>
              </div>
            </footer>
            <Progress n={n} onJump={goto} />
          </div>

          <div ref={wipeRef} className="pointer-events-none fixed inset-0 z-[35] hidden" aria-hidden="true" />
          {laser && <div ref={laserRef} className="pointer-events-none fixed left-0 top-0 z-[70] h-4 w-4 rounded-full bg-[#ff2a1a] shadow-[0_0_0_4px_rgba(255,42,26,0.28)]" aria-hidden="true" />}
          {black && <div className="fixed inset-0 z-[80] bg-black" onClick={() => setBlack(false)} aria-label="Black screen — press any key" />}
          {overview && <Overview current={n} onPick={(k) => { goto(k); setOverview(false); }} onClose={() => setOverview(false)} />}
          {help && <HelpOverlay onClose={() => setHelp(false)} />}
        </ThemeScope>
      </LectureStateContext.Provider>
    </SlideContext.Provider>
  );
}
