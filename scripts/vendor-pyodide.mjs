/**
 * Optional: copy the Python runtime into public/pyodide so the Python Lab
 * works with no internet (e.g. on classroom Wi-Fi). About 48 MB.
 *
 *   npm run vendor:python      then   npm run build
 *
 * Without it, the app downloads the same files from the official Pyodide CDN
 * (cdn.jsdelivr.net) the first time someone presses Run.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const VERSION = '314.0.7';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
const OUT = 'public/pyodide/';
const CORE = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];
const WANT = ['numpy', 'pandas', 'scikit-learn', 'matplotlib'];

async function get(name) {
  if (existsSync(OUT + name)) return;
  const r = await fetch(BASE + name);
  if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  await writeFile(OUT + name, Buffer.from(await r.arrayBuffer()));
  console.log('  ', name);
}

await mkdir(OUT, { recursive: true });
for (const f of CORE) await get(f);
const lock = JSON.parse(await (await fetch(BASE + 'pyodide-lock.json')).text()).packages;
const need = new Set();
const visit = (n) => {
  if (need.has(n)) return;
  need.add(n);
  for (const d of lock[n].depends ?? []) visit(d);
};
WANT.forEach(visit);
for (const n of need) await get(lock[n].file_name);
console.log(`Pyodide ${VERSION} + ${need.size} packages in ${OUT}`);
