// The interactive sandboxes run full language runtimes compiled to WebAssembly
// (Pyodide for Python, WebR for R). Pyodide requires Safari 16.4+ / recent
// Chrome/Firefox, and WebR is similar. On very old browsers (e.g. iOS 12 on an
// iPhone 6, which maxes out at Safari 12) the runtime cannot start, so we detect
// that up front and show a friendly note instead of a cryptic load failure.

export const CODE_RUNTIME_UNSUPPORTED_MESSAGE =
  "This browser is too old to run code here. The interactive sandbox needs a " +
  'newer browser (Safari 16.4+, or a recent Chrome or Firefox). You can still ' +
  'read the lessons and take the quizzes.'

let cached: boolean | null = null

export function isCodeRuntimeSupported(): boolean {
  if (cached !== null) return cached

  if (typeof window === 'undefined') {
    cached = false
    return cached
  }

  const hasWasm =
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.instantiate === 'function'

  // `Array.prototype.at` and `Object.hasOwn` both shipped in Safari 15.4. They
  // are a reliable proxy for ruling out the very old browsers (Safari 12 and
  // earlier) where the WASM runtimes fail to load.
  const hasModernApis =
    typeof Array.prototype.at === 'function' &&
    typeof Object.hasOwn === 'function'

  cached = hasWasm && hasModernApis
  return cached
}
