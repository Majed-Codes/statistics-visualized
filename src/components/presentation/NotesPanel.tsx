import type { SlideMeta } from '../../data/lecture-content';
import { NOTES_AR } from '../../data/notes-ar';
import type { NotesLang } from '../../hooks/useNotesLang';

const LABELS = {
  en: { objective: 'Objective', say: 'Say', visual: 'Drive the visual', misconception: 'Common misconception', question: 'Ask the class', min: 'min', added: 'Added', correction: 'Correction', meta: '' },
  ar: { objective: 'الهدف', say: 'قل', visual: 'كيف تشغّل العرض', misconception: 'الخطأ الشائع', question: 'اسأل الطلاب', min: 'دقيقة', added: 'إضافة', correction: 'تصحيح', meta: 'ملاحظات المحتوى (بالإنجليزية)' },
};

/** Presenter notes for one slide, in Arabic (right-to-left) or English. */
export function NotesBody({ meta, lang = 'en' }: { meta: SlideMeta; lang?: NotesLang }) {
  const L = LABELS[lang];
  const n = lang === 'ar' ? { ...meta.notes, ...NOTES_AR[meta.n] } : meta.notes;
  const rtl = lang === 'ar';
  return (
    <div className={`space-y-3 leading-snug ${rtl ? 'text-[0.98em]' : 'text-[0.9em]'}`} dir={rtl ? 'rtl' : 'ltr'} lang={lang} data-testid="notes-body">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="lab text-ink">{L.objective}</span>
        <span className="tabular rounded-full border-[1.5px] border-line px-2 font-mono text-[0.75em] text-muted">
          ≈ {meta.notes.minutes} {L.min}
        </span>
      </div>
      <p className="font-medium">{n.objective}</p>
      <div>
        <div className="lab">{L.say}</div>
        <ul className={`mt-1 list-disc space-y-1.5 ${rtl ? 'pr-5' : 'pl-5'}`}>
          {n.say.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="lab">{L.visual}</div>
        <p className="mt-1">{n.visual}</p>
      </div>
      <div>
        <div className="lab text-neg">{L.misconception}</div>
        <p className="mt-1">{n.misconception}</p>
      </div>
      <div>
        <div className="lab text-pos">{L.question}</div>
        <p className="mt-1">{n.question}</p>
      </div>
      {(meta.supplemental?.length || meta.corrections?.length) && (
        <div className="border-t border-line pt-2 text-[0.85em] text-muted">
          {rtl && <div className="lab mb-1">{L.meta}</div>}
          <div dir="ltr" lang="en" className={rtl ? 'text-left' : ''}>
            {meta.supplemental?.map((s, i) => <p key={`s${i}`}>Added: {s}</p>)}
            {meta.corrections?.map((s, i) => <p key={`c${i}`} className="text-neg/90">Correction: {s}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

/** EN / عربي switch for the notes. */
export function LangSwitch({ lang, onChange }: { lang: NotesLang; onChange: (l: NotesLang) => void }) {
  return (
    <div role="radiogroup" aria-label="Notes language" className="inline-flex rounded-full border-2 border-line p-0.5" data-testid="notes-lang">
      {(['ar', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          onClick={() => onChange(l)}
          className={`min-h-8 rounded-full px-3 text-[0.8em] font-semibold ${lang === l ? 'bg-ac text-onac' : 'text-muted hover:text-ink'}`}
        >
          {l === 'ar' ? 'عربي' : 'EN'}
        </button>
      ))}
    </div>
  );
}
