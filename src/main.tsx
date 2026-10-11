import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { App } from './app/App';

const root = document.getElementById('root');
if (root) {
  try {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    // Last-resort message: never leave a blank page.
    root.innerHTML = `<div style="padding:24px;font-family:system-ui;color:#F5F7FA"><b style="color:#F2795B">The lecture failed to start.</b><p>${String(
      (err as Error)?.message ?? err,
    )}</p><p>Try reloading, or open the page in a current version of Safari or Chrome.</p></div>`;
  }
}

window.addEventListener('error', (e) => console.error('[runtime]', e.message));
