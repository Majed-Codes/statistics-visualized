import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { SlideContext } from '../../src/components/presentation/SlideContext';
import { Step } from '../../src/components/ui/Reveal';
import { Checkpoint } from '../../src/components/ui/Checkpoint';
import { tokenizePython } from '../../src/components/code/highlight';
import { parseHash } from '../../src/app/router';

afterEach(cleanup);

function Harness({ steps = 2 }: { steps?: number }) {
  const [step, setStep] = useState(0);
  return (
    <SlideContext.Provider value={{ n: 1, step, steps, setStep, resetKey: 0 }}>
      <Step at={1}>
        <p>ANSWER ONE</p>
      </Step>
      <Step at={2}>
        <p>ANSWER TWO</p>
      </Step>
      <button onClick={() => setStep(step + 1)}>next</button>
    </SlideContext.Provider>
  );
}

describe('instructor-controlled reveals', () => {
  it('does not render hidden answers until their step', () => {
    render(<Harness />);
    expect(screen.queryByText('ANSWER ONE')).toBeNull();
    expect(screen.queryByText('ANSWER TWO')).toBeNull();
    fireEvent.click(screen.getByText('next'));
    expect(screen.getByText('ANSWER ONE')).toBeTruthy();
    expect(screen.queryByText('ANSWER TWO')).toBeNull();
    fireEvent.click(screen.getByText('next'));
    expect(screen.getByText('ANSWER TWO')).toBeTruthy();
  });

  it('a hidden step placeholder reveals on click', () => {
    render(<Harness />);
    fireEvent.click(screen.getByLabelText('Reveal step 2'));
    expect(screen.getByText('ANSWER TWO')).toBeTruthy();
  });

  it('checkpoint answer appears only after "Reveal answer"', () => {
    render(<Checkpoint question="Q?" options={['a', 'b']} correct={1} explanation="BECAUSE" />);
    expect(screen.queryByText('BECAUSE')).toBeNull();
    fireEvent.click(screen.getByText('Reveal answer'));
    expect(screen.getByText('BECAUSE')).toBeTruthy();
  });
});

describe('utilities', () => {
  it('tokenizes Python keywords, strings, numbers and comments', () => {
    const t = tokenizePython('import numpy as np\nx = np.cov(X.T)  # covariance\nprint("hi", 1.5)');
    const kinds = (text: string) => t.find((k) => k.text === text)?.kind;
    expect(kinds('import')).toBe('keyword');
    expect(kinds('cov')).toBe('call');
    expect(kinds('"hi"')).toBe('string');
    expect(kinds('1.5')).toBe('number');
    expect(kinds('# covariance')).toBe('comment');
    expect(kinds('print')).toBe('builtin');
    expect(t.map((k) => k.text).join('')).toBe('import numpy as np\nx = np.cov(X.T)  # covariance\nprint("hi", 1.5)');
  });

  it('parses hash routes and clamps slide numbers', () => {
    expect(parseHash('#/slide/24')).toEqual({ view: 'deck', n: 24 });
    expect(parseHash('#/slide/999')).toEqual({ view: 'deck', n: 53 });
    expect(parseHash('')).toEqual({ view: 'deck', n: 1 });
    expect(parseHash('#/lab/cell-8')).toEqual({ view: 'lab', cell: 'cell-8' });
    expect(parseHash('#/explorer')).toEqual({ view: 'explorer' });
    expect(parseHash('#/presenter')).toEqual({ view: 'presenter' });
  });
});
