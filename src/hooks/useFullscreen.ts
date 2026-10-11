import { useCallback, useEffect, useState } from 'react';

type FsDocument = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

/** Fullscreen API with the WebKit prefix. iPhone Safari has no element fullscreen: `supported` is false there. */
export function useFullscreen() {
  const doc = document as FsDocument;
  const root = document.documentElement as FsElement;
  const supported = Boolean(root.requestFullscreen || root.webkitRequestFullscreen);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const on = () => setActive(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, [doc]);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
    } else {
      (root.requestFullscreen ?? root.webkitRequestFullscreen)?.call(root);
    }
  }, [doc, root, supported]);

  return { supported, active, toggle };
}
