import { lazy, Suspense } from 'react';
import { useRoute } from './router';
import { ErrorBoundary } from './ErrorBoundary';
import { Deck } from '../components/presentation/Deck';
import { PresenterView } from '../components/presentation/PresenterView';
import { ThemeScope } from '../components/presentation/ThemeScope';

const PythonLab = lazy(() => import('../slides/practical/PythonLab'));
const IrisExplorer = lazy(() => import('../slides/practical/IrisExplorer'));

function Loading() {
  return <div className="p-6 text-muted">Loading…</div>;
}

export function App() {
  const route = useRoute();
  return (
    <ErrorBoundary where="The lecture" resetOn={JSON.stringify(route)}>
      {route.view === 'deck' && <Deck n={route.n} />}
      {route.view === 'presenter' && (
        <ThemeScope theme="base">
          <PresenterView />
        </ThemeScope>
      )}
      {route.view === 'lab' && (
        <ThemeScope theme="base">
          <Suspense fallback={<Loading />}>
            <PythonLab cell={route.cell} />
          </Suspense>
        </ThemeScope>
      )}
      {route.view === 'explorer' && (
        <ThemeScope theme="base">
          <Suspense fallback={<Loading />}>
            <IrisExplorer />
          </Suspense>
        </ThemeScope>
      )}
    </ErrorBoundary>
  );
}
