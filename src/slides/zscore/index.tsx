/** Section E · Z-score — slide 45. */
import { useEffect, useState } from 'react';
import { CodePanel } from '../../components/code/CodePanel';
import { RunnableCell } from '../../components/code/RunnableCell';
import { ZScoreLine } from '../../components/mathematics/ZScoreLine';
import { useSlide } from '../../components/presentation/SlideContext';
import { Badge } from '../../components/ui/Badge';
import { Button, Segmented } from '../../components/ui/Button';
import { Note, Panel } from '../../components/ui/Panel';
import { Scrub } from '../../components/ui/Scrub';
import { COLUMNS, FEATURE_LABEL, FEATURES, type Feature } from '../../data/iris';
import { LAB, originalCell } from '../../data/notebook';
import { fmt, pct } from '../../lib/format';
import { fractionWithin, mean, std, SAMPLE } from '../../lib/statistics';
import { Bullets, Cols, Formula, Say, Source } from '../common';

const NORMAL = [0.6827, 0.9545, 0.9973];

const Z_LIVE = `import pandas as pd
from sklearn.datasets import load_iris

iris = load_iris()
features = pd.DataFrame(iris.data, columns=iris.feature_names)  # no species

z = (features - features.mean()) / features.std()
z.head()`;

export function S45() {
  const { resetKey } = useSlide();
  const [feature, setFeature] = useState<Feature>('sepal_width');
  const [x, setX] = useState(4.4);
  const [normal, setNormal] = useState(false);
  useEffect(() => {
    setFeature('sepal_width');
    setX(4.4);
    setNormal(false);
  }, [resetKey]);
  const values = COLUMNS[feature];
  const mu = mean(values);
  const sigma = std(values, SAMPLE);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const z = (x - mu) / sigma;
  const cell = originalCell('cell-10');
  const lab = LAB.find((l) => l.id === 'cell-10')!;

  const pick = (f: Feature) => {
    setFeature(f);
    const v = COLUMNS[f];
    setX(Math.max(...v));
  };

  return (
    <div className="space-y-4">
      <Cols ratio="wide-right">
        <div className="space-y-3">
          <Bullets items={['Measures distance from mean', 'Used to detect outliers']} />
          <Formula tex={'z = \\frac{X - \\mu}{\\sigma}'} />
          <div className="tabular rounded-xl border border-line bg-panel p-3 text-[0.9em]" data-testid="z-readout">
            <div>
              z = ({fmt(x, 2)} − {fmt(mu, 3)}) / {fmt(sigma, 3)} = <b className="text-[1.2em] text-yellow">{fmt(z, 2)}</b>
            </div>
            <p className="mt-1 text-ink/90">
              {Math.abs(z) < 1
                ? 'Within one standard deviation of the mean: typical.'
                : Math.abs(z) < 2
                  ? `${z > 0 ? 'Above' : 'Below'} average by more than one σ: not unusual.`
                  : Math.abs(z) < 3
                    ? `${z > 0 ? 'Above' : 'Below'} the mean by more than 2σ: uncommon.`
                    : `More than 3σ ${z > 0 ? 'above' : 'below'} the mean: flagged by the common |z| > 3 rule — investigate.`}
            </p>
          </div>
        </div>
        <Panel title="Distance from the mean in σ units" badge={<Badge kind="live">Iris · 150 flowers</Badge>}>
          <div className="mb-2 flex flex-wrap gap-2">
            <Segmented label="Feature" value={feature} onChange={pick} options={FEATURES.map((f) => ({ value: f, label: FEATURE_LABEL[f] }))} />
          </div>
          <Say className="mb-2 !text-[clamp(17px,min(1.8vw,3.2vh),26px)]">
            A flower with {FEATURE_LABEL[feature].toLowerCase()}{' '}
            <Scrub value={x} min={Math.floor((lo - 0.5) * 10) / 10} max={Math.ceil((hi + 0.5) * 10) / 10} step={0.05} perPx={0.01} onChange={setX} format={(v) => `${v.toFixed(2)} cm`} label="Observation x" className="text-yellow" testId="z-slider" />{' '}
            sits <b className="text-yellow">{fmt(Math.abs(z), 2)}</b> standard deviations {z >= 0 ? 'above' : 'below'} the mean.
          </Say>
          <ZScoreLine values={values} mu={mu} sigma={sigma} x={x} showNormal={normal} unit="cm" label={`Z-score of ${FEATURE_LABEL[feature]}`} />
          <div className="mt-1 flex flex-wrap items-end gap-3">
            <Button size="sm" active={normal} onClick={() => setNormal((v) => !v)}>
              Normal curve (68–95–99.7)
            </Button>
          </div>
        </Panel>
      </Cols>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Does the 68–95–99.7 rule hold here?" badge={<Badge kind="added" />}>
          <table className="tabular w-full text-[0.9em]">
            <thead className="text-muted">
              <tr>
                <th className="py-1 text-left font-medium">within</th>
                <th className="text-right font-medium">this feature (actual)</th>
                <th className="text-right font-medium">normal distribution</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((k, i) => {
                const f = fractionWithin(values, k, SAMPLE);
                const off = Math.abs(f - NORMAL[i]) > 0.04;
                return (
                  <tr key={k} className="border-t border-line">
                    <td className="py-1">μ ± {k}σ</td>
                    <td className={`text-right font-semibold ${off ? 'text-neg' : 'text-pos'}`}>{pct(f)}</td>
                    <td className="text-right text-muted">{pct(NORMAL[i], 2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[0.85em] text-ink/90">
            The percentages in the lecture's figure are true only for normally distributed data. Switch to <b>petal length</b>: it has two clusters, so only{' '}
            {pct(fractionWithin(COLUMNS.petal_length, 1, SAMPLE))} of flowers lie within one σ, not 68%. A z-score is always defined; its probability interpretation is not.
          </p>
        </Panel>
        <div className="space-y-2">
          {cell && (
            <CodePanel
              code={cell.source}
              title="Notebook · Z-score (original cell)"
              badge={<Badge kind="source">notebook</Badge>}
              annotations={lab.annotations}
            />
          )}
          <RunnableCell
            code={Z_LIVE}
            title="run it now · z-scores of the 4 measurements"
            badge={<Badge kind="added">self-contained</Badge>}
            testId="s45-run"
          />
          <Note kind="correction" title="Notebook correction">
            <code>select_dtypes(include=np.number)</code> keeps the <code>species</code> labels, so they get “standardised” too. Use only the four measurements:{' '}
            <code>numeric_df = df.drop(columns="species")</code>. pandas’ <code>.std()</code> divides by n − 1; the formula above uses σ — with n = 150 the difference is 0.3%.
          </Note>
        </div>
      </div>
      <Source href="https://www.geeksforgeeks.org/data-science/z-score-in-statistics/" />
    </div>
  );
}
