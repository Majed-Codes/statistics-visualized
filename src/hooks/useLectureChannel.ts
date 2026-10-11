import { useEffect, useRef } from 'react';

/** Messages exchanged between the audience deck and the presenter window. */
export type LectureMessage =
  | { type: 'state'; n: number; step: number }
  | { type: 'goto'; n: number; step?: number }
  | { type: 'command'; command: 'next' | 'prev' | 'reset' }
  | { type: 'hello' };

const NAME = 'statistics-visualized';

/** BroadcastChannel between windows of this app, with a no-op fallback. */
export function useLectureChannel(onMessage: (m: LectureMessage) => void) {
  const ref = useRef<BroadcastChannel | null>(null);
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(NAME);
    ch.onmessage = (e: MessageEvent<LectureMessage>) => handler.current(e.data);
    ref.current = ch;
    return () => ch.close();
  }, []);

  return (m: LectureMessage) => ref.current?.postMessage(m);
}
