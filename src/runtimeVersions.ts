// Code runtimes loaded from CDNs. The versions are pinned, and the service worker
// keeps these files cached forever (see vite.config.ts), so to update a runtime,
// bump its version here.

export const PYODIDE_VERSION = '0.27.2'
export const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

export const WEBR_VERSION = 'v0.4.2'
export const WEBR_CDN_BASE = `https://webr.r-wasm.org/${WEBR_VERSION}/`

/** The service worker's caches for the runtimes' files (see vite.config.ts and lib/runtimeCache.ts). */
export const PYODIDE_CACHE = 'codequest-pyodide'
export const WEBR_CACHE = 'codequest-webr'
