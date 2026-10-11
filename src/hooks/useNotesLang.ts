import { useCallback, useEffect, useState } from 'react';

export type NotesLang = 'ar' | 'en';
const KEY = 'sv-notes-lang';

function read(): NotesLang {
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

/**
 * Language of the presenter notes and presenter window: Arabic by default.
 * Stored in localStorage and kept in sync between the deck and the presenter
 * window through the storage event. The slides themselves stay in English.
 */
export function useNotesLang() {
  const [lang, setLang] = useState<NotesLang>(read);
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === KEY) setLang(read());
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);
  const set = useCallback((l: NotesLang) => {
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* private mode: still switches for this window */
    }
    setLang(l);
  }, []);
  return [lang, set] as const;
}
