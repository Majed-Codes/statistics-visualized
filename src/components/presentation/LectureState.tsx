import { createContext, useContext } from 'react';

/** State shared between slides, e.g. the class vote recorded on slide 6 and checked on slide 7. */
export interface LectureState {
  votes: Record<string, string>;
  setVote: (key: string, value: string) => void;
  roles: Record<string, 'feature' | 'target' | undefined>;
  setRole: (key: string, value: 'feature' | 'target' | undefined) => void;
}

export const LectureStateContext = createContext<LectureState>({ votes: {}, setVote: () => {}, roles: {}, setRole: () => {} });

export const useLectureState = () => useContext(LectureStateContext);
