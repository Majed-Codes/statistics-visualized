import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Shown in the error message, e.g. "Slide 24". */
  where: string;
  /** Changing this value clears the error (e.g. navigating to another slide). */
  resetOn?: unknown;
}

interface State {
  error: Error | null;
}

/**
 * Turns a rendering failure into a readable message instead of a blank screen.
 * Each slide has its own boundary, so one failing visualisation never takes
 * down the rest of the lecture.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.where}] render failed:`, error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetOn !== this.props.resetOn && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="m-4 rounded-xl border border-neg/60 bg-panel p-5 text-ink" data-testid="error-state">
        <p className="font-semibold text-neg">{this.props.where} could not be displayed.</p>
        <p className="mt-1 text-[0.9em] text-muted">
          The rest of the lecture still works. Use the arrows to continue, or try again.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-canvas p-2 text-[0.75em] text-muted">{this.state.error.message}</pre>
        <button
          type="button"
          className="mt-3 min-h-10 rounded-lg border border-line bg-panel-2 px-3"
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
      </div>
    );
  }
}
