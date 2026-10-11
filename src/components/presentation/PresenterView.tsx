import { useEffect, useState } from 'react';
import { SLIDES, TOTAL_SLIDES, plannedStartMinute, sectionOf, SECTIONS, type SectionId } from '../../data/lecture-content';
import { NOTES_AR } from '../../data/notes-ar';
import { useLectureChannel } from '../../hooks/useLectureChannel';
import { formatClock, useSessionTimer, SESSION_MINUTES } from '../../hooks/useSessionTimer';
import { useNotesLang, type NotesLang } from '../../hooks/useNotesLang';
import { LangSwitch, NotesBody } from './NotesPanel';
import { Button } from '../ui/Button';
import { IconPause, IconPlay, IconReset } from '../ui/Icons';

const SECTION_AR: Record<SectionId, string> = {
  A: 'الأساسيات',
  B: 'الإحصاء الوصفي',
  C: 'مقاييس التشتت',
  D: 'المدى الربيعي والقيم الشاذة',
  E: 'الدرجة المعيارية',
  F: 'التغاير والارتباط و PCA',
  G: 'التطبيق العملي بـ Python',
};

const T = {
  ar: {
    waitingTitle: 'نافذة المقدّم',
    waiting:
      'بانتظار نافذة المحاضرة… أبقِ العرض الرئيسي مفتوحاً في نافذة أو تبويب آخر في المتصفح نفسه. إذا لم يظهر شيء فالمتصفح لا يدعم المزامنة بين النوافذ؛ استخدم زر الملاحظات في النافذة الرئيسية بدلاً من ذلك.',
    slide: (n: number) => `الشريحة ${n} من ${TOTAL_SLIDES}`,
    step: (s: number, of: number) => `خطوة الكشف ${s} من ${of}`,
    timer: `مؤقت الجلسة · ${SESSION_MINUTES} دقيقة`,
    elapsed: 'المنقضي',
    plan: (m: string) => `خطة هذه الشريحة: الدقيقة ${m}`,
    behind: (m: string) => `متأخر ${m} دقيقة`,
    ahead: (m: string) => `متقدم ${m} دقيقة`,
    start: 'تشغيل',
    pause: 'إيقاف مؤقت',
    resetTimer: 'إعادة ضبط المؤقت',
    back: 'السابق',
    reset: 'إعادة الشريحة',
    next: 'التالي',
    nextSlide: 'الشريحة التالية',
    end: 'نهاية المحاضرة',
    jump: 'انتقل إلى شريحة',
    section: (id: SectionId) => SECTION_AR[id],
  },
  en: {
    waitingTitle: 'Presenter view',
    waiting:
      'Waiting for the lecture window… Keep the main deck open in another window or tab of this browser. If nothing appears, your browser does not support BroadcastChannel; use the Notes button in the main window instead.',
    slide: (n: number) => `slide ${n} / ${TOTAL_SLIDES}`,
    step: (s: number, of: number) => `reveal step ${s} / ${of}`,
    timer: `Session timer · ${SESSION_MINUTES} minutes`,
    elapsed: 'elapsed',
    plan: (m: string) => `plan for this slide: minute ${m}`,
    behind: (m: string) => `${m} min behind`,
    ahead: (m: string) => `${m} min ahead`,
    start: 'Start',
    pause: 'Pause',
    resetTimer: 'Reset timer',
    back: 'Back',
    reset: 'Reset',
    next: 'Next',
    nextSlide: 'Next slide',
    end: 'End of lecture',
    jump: 'Jump to slide',
    section: (id: SectionId) => SECTIONS.find((s) => s.id === id)!.title,
  },
};

/**
 * Presenter window (open with P or Tools → Presenter window, then drag it to
 * the laptop screen while the audience window is on the projector). It mirrors
 * the deck through a BroadcastChannel and never appears on the audience screen.
 * Arabic by default; slide titles stay in English to match the projector.
 */
export function PresenterView() {
  const [state, setState] = useState<{ n: number; step: number } | null>(null);
  const [lang, setLang] = useNotesLang();
  const timer = useSessionTimer();
  const t = T[lang];
  const rtl = lang === 'ar';
  const post = useLectureChannel((m) => {
    if (m.type === 'state') setState({ n: m.n, step: m.step });
  });
  useEffect(() => {
    document.title = rtl ? 'نافذة المقدّم · Statistics Visualized' : 'Presenter · Statistics Visualized';
    document.documentElement.lang = lang;
  }, [lang, rtl]);
  useEffect(() => {
    post({ type: 'hello' });
    const id = window.setInterval(() => post({ type: 'hello' }), 2000);
    return () => window.clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') post({ type: 'command', command: 'next' });
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') post({ type: 'command', command: 'prev' });
      if (e.key === 't' || e.key === 'T') timer.toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post, timer]);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <span className="lab">{t.waitingTitle}</span>
      <LangSwitch lang={lang} onChange={(l: NotesLang) => setLang(l)} />
    </div>
  );

  if (!state) {
    return (
      <div className="space-y-3 p-6 text-ink" dir={rtl ? 'rtl' : 'ltr'} lang={lang} data-testid="presenter-waiting">
        {header}
        <p className="max-w-[60ch] text-muted">{t.waiting}</p>
      </div>
    );
  }

  const meta = SLIDES[state.n - 1];
  const nextMeta = SLIDES[state.n] as (typeof SLIDES)[number] | undefined;
  const pace = timer.elapsedMs / 60000 - plannedStartMinute(state.n);
  const sec = sectionOf(state.n);

  return (
    <div className="min-h-dvh p-4 text-ink sm:p-6" dir={rtl ? 'rtl' : 'ltr'} lang={lang} data-testid="presenter-view">
      <div className="mb-4">{header}</div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="lab" data-testid="presenter-position">
            {t.section(sec.id)} · {t.slide(state.n)}
            {meta.steps > 0 && <> · {t.step(state.step, meta.steps)}</>}
          </div>
          <h1 className="mt-1.5 text-[1.6em] font-extrabold leading-tight tracking-tight" dir="ltr" lang="en" style={{ textAlign: rtl ? 'right' : 'left' }}>
            {meta.sourceTitle}
          </h1>
          <div className="cd mt-4 p-5">
            <NotesBody meta={meta} lang={lang} />
          </div>
        </section>
        <aside className="min-w-0 space-y-4">
          <div className="cd p-5">
            <div className="lab">{t.timer}</div>
            <div
              className={`tabular font-mono text-[2.6em] font-medium leading-none ${timer.remainingMs < 0 ? 'text-neg' : timer.remainingMs < 600000 ? 'text-ac' : ''}`}
              dir="ltr"
              style={{ textAlign: rtl ? 'right' : 'left' }}
              data-testid="presenter-clock"
            >
              {formatClock(timer.remainingMs)}
            </div>
            <div className="tabular mt-2 text-[0.88em] text-muted">
              {t.elapsed} <span dir="ltr">{formatClock(timer.elapsedMs)}</span> · {t.plan(plannedStartMinute(state.n).toFixed(1))}
              {timer.elapsedMs > 0 && (
                <span className={pace > 1 ? 'text-neg' : 'text-pos'}> · {pace > 0 ? t.behind(pace.toFixed(1)) : t.ahead((-pace).toFixed(1))}</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={timer.toggle} icon={timer.running ? <IconPause /> : <IconPlay />}>
                {timer.running ? t.pause : t.start}
              </Button>
              <Button size="sm" variant="ghost" onClick={timer.reset} icon={<IconReset />}>
                {t.resetTimer}
              </Button>
            </div>
          </div>
          {/* Same left-to-right order as the deck's ← → so the buttons match the projector. */}
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            <Button onClick={() => post({ type: 'command', command: 'prev' })}>
              <span className="font-mono" aria-hidden="true">←</span> {t.back}
            </Button>
            <Button variant="ghost" onClick={() => post({ type: 'command', command: 'reset' })} icon={<IconReset />}>
              {t.reset}
            </Button>
            <Button variant="primary" onClick={() => post({ type: 'command', command: 'next' })} data-testid="presenter-next">
              {t.next} <span className="font-mono" aria-hidden="true">→</span>
            </Button>
          </div>
          <div className="cd p-5">
            <div className="lab">{t.nextSlide}</div>
            {nextMeta ? (
              <>
                <div className="mt-1 font-bold" dir="ltr" lang="en" style={{ textAlign: rtl ? 'right' : 'left' }}>
                  {nextMeta.n}. {nextMeta.sourceTitle}
                </div>
                <p className="mt-1 text-[0.9em] text-muted">{rtl ? NOTES_AR[nextMeta.n].objective : nextMeta.notes.objective}</p>
              </>
            ) : (
              <div className="mt-1 text-muted">{t.end}</div>
            )}
          </div>
          <label className="block text-[0.88em] text-muted">
            {t.jump}
            <select
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-line bg-panel px-2 text-ink"
              dir="ltr"
              value={state.n}
              onChange={(e) => post({ type: 'goto', n: Number(e.target.value) })}
            >
              {SLIDES.map((s) => (
                <option key={s.n} value={s.n}>
                  {s.n}. {s.sourceTitle}
                </option>
              ))}
            </select>
          </label>
        </aside>
      </div>
    </div>
  );
}
