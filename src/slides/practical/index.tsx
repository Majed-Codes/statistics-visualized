/** Section G · Practical Python — slides 52–53. */
import { navigate, slideHash } from '../../app/router';
import { PythonBar, RunnableCell } from '../../components/code/RunnableCell';
import { Tex } from '../../components/mathematics/Tex';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { IconCode, IconScatter } from '../../components/ui/Icons';
import { COLUMNS, FEATURES } from '../../data/iris';
import { LAB } from '../../data/notebook';
import { pca } from '../../lib/linear-algebra';
import { fmt, pct } from '../../lib/format';

// ───────────────────────────────────────────────────────────── 52 Practical section
const PCA_LIVE = `import numpy as np
from sklearn.datasets import load_iris

X = load_iris().data                      # the 4 measurements, no species
eigvals, eigvecs = np.linalg.eigh(np.cov(X.T))
eigvals = eigvals[::-1]                   # largest first
print("eigenvalues:", eigvals.round(4))
eigvals / eigvals.sum()                   # share of variance per component`;
export function S52() {
  const res = pca(FEATURES.map((f) => COLUMNS[f]));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[1.15em]">● Code</span>
        <Button variant="primary" icon={<IconCode />} onClick={() => navigate('#/lab')} data-testid="open-lab">
          Open Python Lab
        </Button>
        <Button icon={<IconScatter />} onClick={() => navigate('#/explorer')} data-testid="open-explorer">
          Open Iris Explorer
        </Button>
      </div>
      <div className="space-y-3">
        <PythonBar />
        <RunnableCell code={PCA_LIVE} title="run it now · PCA in five lines of NumPy" badge={<Badge kind="added">self-contained</Badge>} testId="s52-run" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="The notebook, mapped to the lecture">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[0.86em]">
              <thead className="text-muted">
                <tr>
                  <th className="py-1 text-left font-medium">#</th>
                  <th className="text-left font-medium">Cell</th>
                  <th className="text-left font-medium">Concept</th>
                  <th className="text-left font-medium">Slides</th>
                </tr>
              </thead>
              <tbody>
                {LAB.map((e, i) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="tabular py-1.5 text-muted">{i + 1}</td>
                    <td>
                      <button type="button" className="text-left hover:text-yellow" onClick={() => navigate(`#/lab/${e.id}`)}>
                        {e.title} {e.issue && <span className="text-neg" title="Corrected in the Lab">●</span>}
                      </button>
                    </td>
                    <td className="text-muted">{e.concept}</td>
                    <td className="tabular">
                      {e.slides.map((n) => (
                        <button key={n} type="button" className="mr-1 rounded border border-line px-1 text-[0.85em] text-muted hover:text-ink" onClick={() => navigate(slideHash(n), true)}>
                          {n}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-3">
          <Panel title="Corrections applied in the Lab" tone="warn">
            <ul className="list-disc space-y-1.5 pl-5 text-[0.88em]">
              <li><code>species</code> (0/1/2) is a nominal label: excluded from means, variances, z-scores, covariance, correlation and PCA.</li>
              <li>pandas <code>.var()</code>/<code>.std()</code> divide by n − 1; the lecture formulas divide by N.</li>
              <li>pandas quartiles interpolate; the lecture's hand method uses the median of each half.</li>
              <li><code>np.linalg.eigh</code> (sorted, symmetric) replaces <code>np.linalg.eig</code>.</li>
            </ul>
          </Panel>
          <Panel title="PCA on the 4 measurements" badge={<Badge kind="live">TypeScript</Badge>}>
            <p className="tabular text-[0.88em]">λ = {res.components.map((c) => fmt(c.value, 3)).join(', ')}</p>
            <p className="mt-1 text-[0.88em]">
              PC1 keeps <b className="text-yellow">{pct(res.explainedVarianceRatio[0])}</b> of the variance; PC1 + PC2 keep {pct(res.explainedVarianceRatio[0] + res.explainedVarianceRatio[1])}.
            </p>
            <p className="mt-1 text-[0.78em] text-muted">The original notebook (with species) reports 4.838 as the first eigenvalue — a different, invalid analysis.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── 53 Thank you
const SUMMARY: [string, string][] = [
  ['Mean', '\\mu = \\frac{1}{N}\\sum x'],
  ['Variance', '\\sigma^2 = \\frac{1}{N}\\sum (x-\\mu)^2'],
  ['Sample variance', 's^2 = \\frac{1}{n-1}\\sum (x-\\bar x)^2'],
  ['Standard deviation', '\\sigma = \\sqrt{\\sigma^2}'],
  ['IQR & fences', 'Q_3 - Q_1,\\;\\; Q_1 - 1.5\\,IQR,\\;\\; Q_3 + 1.5\\,IQR'],
  ['Z-score', 'z = \\frac{x-\\mu}{\\sigma}'],
  ['Covariance', '\\operatorname{Cov}(X,Y) = \\frac{1}{N}\\sum (x-\\mu_x)(y-\\mu_y)'],
  ['Correlation', '\\rho = \\frac{\\operatorname{Cov}(X,Y)}{\\sigma_X\\sigma_Y}'],
  ['PCA', '\\Sigma\\mathbf v = \\lambda \\mathbf v,\\;\\; \\text{kept} = \\frac{\\lambda_1}{\\sum \\lambda}'],
];

export function S53() {
  return (
    <div className="grid min-h-[72dvh] items-center gap-8 py-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="text-center lg:text-left">
        <p lang="ar" dir="rtl" className="font-semibold leading-tight text-yellow" style={{ fontSize: 'clamp(40px, 5vw, 84px)' }} data-testid="thanks-ar">
          شــــــكــــرًا لكــــــم
        </p>
        <p className="mt-3 font-semibold tracking-[0.25em]" style={{ fontSize: 'clamp(24px, 2.6vw, 44px)' }}>
          THANK YOU
        </p>
        <p className="mt-4 text-[0.9em] text-muted">Unit 2 · Part 5 — Statistics Foundations + Real Dataset</p>
      </div>
      <div className="rounded-xl border border-line bg-panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-semibold">Today on one screen</span>
          <Badge kind="added" />
        </div>
        <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_minmax(0,1fr)]">
          {SUMMARY.map(([k, t]) => (
            <div key={k} className="contents">
              <dt className="pt-2 text-[0.8em] text-muted">{k}</dt>
              <dd className="min-w-0 overflow-x-auto">
                <Tex>{t}</Tex>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
