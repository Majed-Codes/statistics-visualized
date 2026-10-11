import { createContext, useContext } from 'react';

export interface SlideState {
  n: number;
  /** Current reveal step, 0 … steps. */
  step: number;
  steps: number;
  setStep: (s: number) => void;
  /** Incremented by "Reset slide" so interactive demos can return to their initial state. */
  resetKey: number;
}

export const SlideContext = createContext<SlideState>({ n: 0, step: 0, steps: 0, setStep: () => {}, resetKey: 0 });

export function useSlide(): SlideState {
  return useContext(SlideContext);
}
