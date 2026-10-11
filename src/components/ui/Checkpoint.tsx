import { useEffect, useState, type ReactNode } from 'react';
import { useSlide } from '../presentation/SlideContext';
import { Badge } from './Badge';
import { Button } from './Button';

interface CheckpointProps {
  question: ReactNode;
  options: ReactNode[];
  correct: number;
  explanation: ReactNode;
  added?: boolean;
}

/**
 * Multiple-choice checkpoint. The instructor may record the class's choice;
 * correctness is only shown after "Reveal answer" is pressed.
 */
export function Checkpoint({ question, options, correct, explanation, added = true }: CheckpointProps) {
  const { resetKey } = useSlide();
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    setChosen(null);
    setRevealed(false);
  }, [resetKey]);
  return (
    <div className="cd p-4 sm:p-5" data-testid="checkpoint">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="lab text-ac">Checkpoint</span>
        {added && <Badge kind="added" />}
      </div>
      <p className="mb-3 text-[1.08em] font-semibold leading-snug">{question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o, i) => {
          const isCorrect = revealed && i === correct;
          const isWrongPick = revealed && chosen === i && i !== correct;
          return (
            <button
              type="button"
              key={i}
              onClick={() => !revealed && setChosen(i)}
              aria-pressed={chosen === i}
              className={`tb min-h-12 rounded-xl px-3.5 py-2 text-left text-[0.92em] font-medium ${
                isCorrect ? '!bg-pos !text-canvas' : isWrongPick ? '!bg-neg !text-canvas' : chosen === i ? 'is-on' : ''
              }`}
            >
              <span className="mr-2 font-mono font-medium opacity-70">{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!revealed ? (
          <Button variant="primary" size="sm" onClick={() => setRevealed(true)} data-testid="checkpoint-reveal">
            Reveal answer
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => { setRevealed(false); setChosen(null); }}>
            Reset question
          </Button>
        )}
        {chosen !== null && !revealed && <span className="text-[0.8em] text-muted">Class answer recorded: {String.fromCharCode(65 + chosen)}</span>}
      </div>
      {revealed && <div className="mt-3 border-t-2 border-line pt-3 text-[0.95em] text-ink">{explanation}</div>}
    </div>
  );
}
