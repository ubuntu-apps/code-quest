import { useSyncExternalStore } from 'react'

/**
 * Saved settings and progress, in the browser's localStorage. Storage can be missing, full or
 * blocked (private windows, some old browsers), so every access here is safe: a read gives
 * the fallback and a write is skipped. Every key the app saves is declared once, in
 * ./stores.ts, which also says which ones go into a progress backup.
 */

/** Turns a stored string into a value and back. */
export interface Codec<T> {
  decode: (raw: string) => T
  encode: (value: T) => string
  /** Stored as plain text rather than JSON (a backup checks JSON entries before restoring them). */
  plainText?: boolean
}

/** Plain text, as stored. */
export const text: Codec<string> = { decode: (raw) => raw, encode: (value) => value, plainText: true }

/** On or off, stored as "1" (off is no entry at all, see LocalStore.set). */
export const flag: Codec<boolean> = { decode: (raw) => raw === '1', encode: (on) => (on ? '1' : ''), plainText: true }

/** JSON kept as text: the module that owns it parses and checks it. */
export const jsonText: Codec<string> = { decode: (raw) => raw, encode: (value) => value }

/** Any JSON value; one that doesn't parse reads as null. */
export function json<T>(): Codec<T | null> {
  return {
    decode: (raw) => {
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    encode: (value) => JSON.stringify(value),
  }
}

// ---- Safe access to localStorage ----

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function readRaw(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

/** Writes a value; false if storage refused it (full or blocked). */
export function writeRaw(key: string, value: string): boolean {
  try {
    const s = storage()
    if (!s) return false
    s.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeRaw(key: string): void {
  try {
    storage()?.removeItem(key)
  } catch {
    // Nothing to remove.
  }
}

/** Every key in storage. */
export function allKeys(): string[] {
  const s = storage()
  if (!s) return []
  const keys: string[] = []
  try {
    for (let i = 0; i < s.length; i += 1) {
      const key = s.key(i)
      if (key !== null) keys.push(key)
    }
  } catch {
    // Storage went away while reading.
  }
  return keys
}

// ---- Change notices ----

/** One event for every change, naming the key (or "*" after a restore), plus other tabs' changes. */
const CHANGED_EVENT = 'codequest:storage-changed'

/** Tells open screens that `key` changed ("*": everything, e.g. after restoring a backup). */
export function notifyStorageChanged(key: string): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: key }))
}

/** Calls `listener` when a key that `matches` changes, here or in another tab. */
function subscribeTo(matches: (key: string) => boolean, listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const onChange = (event: Event) => {
    const key = (event as CustomEvent<string>).detail
    if (key === '*' || matches(key)) listener()
  }
  const onOtherTab = (event: StorageEvent) => {
    if (event.key === null || matches(event.key)) listener()
  }
  window.addEventListener(CHANGED_EVENT, onChange)
  window.addEventListener('storage', onOtherTab)
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onOtherTab)
  }
}

// ---- Stores ----

interface StoreOptions<T> {
  codec: Codec<T>
  /** What a read gives when nothing is saved (or storage is unavailable). */
  fallback: T
  /** Goes into a progress backup (learner data, not device settings). */
  backup?: boolean
  /** A restored backup leaves this entry as it is on the device (supporter status). */
  keepOnRestore?: boolean
}

/** What both kinds of store share. */
abstract class StoreBase<T> {
  readonly codec: Codec<T>
  readonly fallback: T
  readonly backup: boolean
  readonly keepOnRestore: boolean
  /** The last string read for each key, and what it decoded to, so reads stay the same object. */
  private readonly cache = new Map<string, { raw: string | null; value: T }>()
  /** Values storage refused to save: they last until the page closes. */
  private readonly unsaved = new Map<string, T>()

  constructor({ codec, fallback, backup = false, keepOnRestore = false }: StoreOptions<T>) {
    this.codec = codec
    this.fallback = fallback
    this.backup = backup
    this.keepOnRestore = keepOnRestore
  }

  /** Whether this store saves `key`. */
  abstract owns(key: string): boolean

  protected readKey(key: string): T {
    if (this.unsaved.has(key)) return this.unsaved.get(key) as T
    const raw = readRaw(key)
    const cached = this.cache.get(key)
    if (cached && cached.raw === raw) return cached.value
    const value = raw === null ? this.fallback : this.codec.decode(raw)
    this.cache.set(key, { raw, value })
    return value
  }

  /** Saves a value (the fallback, or an empty encoding, removes the entry) and tells open screens. */
  protected writeKey(key: string, value: T): boolean {
    const encoded = this.codec.encode(value)
    let ok = true
    if (value === this.fallback || encoded === '') removeRaw(key)
    else ok = writeRaw(key, encoded)
    if (ok) this.unsaved.delete(key)
    else this.unsaved.set(key, value)
    notifyStorageChanged(key)
    return ok
  }

  protected removeKey(key: string): void {
    removeRaw(key)
    this.unsaved.delete(key)
    notifyStorageChanged(key)
  }

  /** Calls `listener` when anything this store saves changes. */
  subscribe = (listener: () => void): (() => void) => subscribeTo((key) => this.owns(key), listener)
}

/** One saved value under one key, such as the sound setting. */
export class LocalStore<T> extends StoreBase<T> {
  readonly key: string

  constructor(key: string, options: StoreOptions<T>) {
    super(options)
    this.key = key
  }

  owns(key: string): boolean {
    return key === this.key
  }

  get = (): T => this.readKey(this.key)

  /** Saves the value; false if storage refused it. */
  set(value: T): boolean {
    return this.writeKey(this.key, value)
  }

  update(change: (previous: T) => T): boolean {
    return this.set(change(this.get()))
  }

  clear(): void {
    this.removeKey(this.key)
  }
}

/** One saved value per id under a shared prefix, such as each lesson's progress. */
export class LocalStoreFamily<T> extends StoreBase<T> {
  readonly prefix: string

  constructor(prefix: string, options: StoreOptions<T>) {
    super(options)
    this.prefix = prefix
  }

  owns(key: string): boolean {
    return key.startsWith(this.prefix)
  }

  keyFor(id: string): string {
    return this.prefix + id
  }

  get(id: string): T {
    return this.readKey(this.keyFor(id))
  }

  has(id: string): boolean {
    return readRaw(this.keyFor(id)) !== null
  }

  set(id: string, value: T): boolean {
    return this.writeKey(this.keyFor(id), value)
  }

  update(id: string, change: (previous: T) => T): boolean {
    return this.set(id, change(this.get(id)))
  }

  remove(id: string): void {
    this.removeKey(this.keyFor(id))
  }

  /** The ids saved now. */
  ids(): string[] {
    return allKeys()
      .filter((key) => this.owns(key))
      .map((key) => key.slice(this.prefix.length))
  }
}

/** A store's value in a component, updated when it changes (here or in another tab). */
export function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback)
}

/** One id's value from a family in a component (the fallback for no id), updated when it changes. */
export function useStoreEntry<T>(family: LocalStoreFamily<T>, id: string | null): T {
  return useSyncExternalStore(
    family.subscribe,
    () => (id === null ? family.fallback : family.get(id)),
    () => family.fallback,
  )
}
