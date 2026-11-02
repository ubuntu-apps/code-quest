/**
 * The service worker keeps the runtimes' files forever (see vite.config.ts). Some of them
 * load as "opaque" responses (Pyodide's main script, webR's worker), whose status can't be
 * seen, so a failed download could be kept too and break that runtime on this device. After
 * a runtime fails to load, this drops its opaque files, so the next try downloads them again.
 * Readable files (the big packages) are kept.
 */
export async function forgetOpaqueRuntimeFiles(cacheName: string): Promise<void> {
  try {
    if (typeof caches === 'undefined' || !(await caches.has(cacheName))) return
    const cache = await caches.open(cacheName)
    for (const request of await cache.keys()) {
      const response = await cache.match(request)
      if (response?.type === 'opaque') await cache.delete(request)
    }
  } catch {
    // No cache access (private window, old browser): nothing was kept, so nothing to drop.
  }
}
