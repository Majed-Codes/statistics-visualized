import { Button } from '../ui/Button';
import { IconClose } from '../ui/Icons';

const KEYS: [string, string][] = [
  ['→  Space  PageDown', 'Next reveal step, then next slide'],
  ['←  PageUp', 'Previous step, then previous slide'],
  ['Shift + → / ←', 'Next / previous slide, skipping steps'],
  ['Home  End', 'First / last slide'],
  ['digits + Enter', 'Go to slide number (e.g. 2 4 Enter)'],
  ['O', 'Slide overview'],
  ['N', 'Presenter notes on this screen'],
  ['P', 'Open the presenter window'],
  ['T', 'Start / pause the 90-minute timer'],
  ['R', 'Reset the current slide'],
  ['F', 'Fullscreen'],
  ['L', 'Laser pointer'],
  ['B', 'Black screen (any key returns)'],
  ['?', 'This help'],
  ['Esc', 'Close overlays'],
];

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/85 p-4" role="dialog" aria-modal="true" aria-label="Keyboard and touch controls" onClick={onClose}>
      <div className="cd max-h-[90dvh] w-full max-w-xl overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[1.6em] font-extrabold tracking-tight">Controls</h2>
          <Button size="sm" variant="ghost" onClick={onClose} icon={<IconClose />} aria-label="Close help" />
        </div>
        <p className="mb-3 text-[0.85em] text-muted">
          Every action also has a button. Bottom right: timer, ← and →; bottom left: Reveal and reset. Top right: Tools opens all slides, notes, the presenter window, the Python Lab, the Iris Explorer, fullscreen, laser and black screen. Dashed coloured numbers inside sentences can be dragged. On touch screens, swipe left or right on the slide text.
        </p>
        <table className="w-full text-[0.85em]">
          <tbody>
            {KEYS.map(([k, v]) => (
              <tr key={k} className="border-t border-line">
                <td className="py-1.5 pr-3 font-mono whitespace-nowrap text-ac">{k}</td>
                <td className="py-1.5 text-ink/90">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
