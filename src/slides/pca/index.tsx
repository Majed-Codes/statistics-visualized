/** Section F (end) · Statistics + Linear Algebra Connection — slide 51. */
import { PcaScene } from '../../components/mathematics/PcaScene';
import { useSlide } from '../../components/presentation/SlideContext';
import { Note } from '../../components/ui/Panel';
import { Badge } from '../../components/ui/Badge';

export function S51() {
  const { step } = useSlide();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.95em]">
        <span>
          Covariance matrix → <b className="text-yellow">eigen decomposition</b> → <b className="text-yellow">principal components</b> → <b className="text-yellow">dimensionality reduction</b>
        </span>
        <span className="font-semibold">Statistics + Linear Algebra = PCA</span>
      </div>
      <PcaScene stage={step} />
      {step >= 7 && (
        <Note kind="correction" title="Notebook correction">
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge kind="correction" />
            The notebook calls <code>np.linalg.eig</code>, which does not sort eigenvalues; for a symmetric matrix use <code>np.linalg.eigh</code>. It also includes the
            species code as a feature. Slide 52 and the Python Lab show the corrected 4-feature PCA (PC1 keeps 92.5% of the variance).
          </span>
        </Note>
      )}
    </div>
  );
}
