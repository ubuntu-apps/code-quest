// Runtime polyfills for very old browsers (e.g. iOS 12 / Safari 12 on iPhone 6).
// Syntax down-leveling is handled by Vite's `build.target`; this file covers the
// runtime APIs esbuild cannot transform.

// Resolve the global object without relying on `globalThis`, which only shipped
// in Safari 12.1.
const globalObject: typeof globalThis =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? (self as unknown as typeof globalThis)
      : (window as unknown as typeof globalThis)

// `structuredClone` shipped in Safari 15.4; the curriculum editor relies on it.
if (typeof globalObject.structuredClone !== 'function') {
  globalObject.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

export {}
