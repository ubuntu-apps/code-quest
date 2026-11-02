import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flag, json, LocalStore, LocalStoreFamily, text } from './localStore'
import { BACKUP_STORES, STORES } from './stores'

describe('LocalStore', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('reads the fallback until something is saved, and round-trips a value', () => {
    const store = new LocalStore('test:name', { codec: text, fallback: '' })
    expect(store.get()).toBe('')
    store.set('Ada')
    expect(store.get()).toBe('Ada')
    expect(localStorage.getItem('test:name')).toBe('Ada')
  })

  it('removes the entry when set back to the fallback', () => {
    const store = new LocalStore('test:on', { codec: flag, fallback: false })
    store.set(true)
    expect(localStorage.getItem('test:on')).toBe('1')
    store.set(false)
    expect(localStorage.getItem('test:on')).toBeNull()
  })

  it('gives the same object for the same stored text (for useSyncExternalStore)', () => {
    const store = new LocalStore('test:json', { codec: json<{ n: number }>(), fallback: null })
    store.set({ n: 1 })
    expect(store.get()).toBe(store.get())
  })

  it('keeps a value for the session when storage refuses it', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const store = new LocalStore('test:full', { codec: text, fallback: '' })
    expect(store.set('kept')).toBe(false)
    expect(store.get()).toBe('kept')
  })

  it('lets storage win over a value kept for the session once storage changes (a restore, another tab)', () => {
    const store = new LocalStore('test:full', { codec: text, fallback: '' })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    store.set('kept')
    setItem.mockRestore()
    localStorage.setItem('test:full', 'restored')
    expect(store.get()).toBe('restored')
  })

  it('saves quietly when asked, without telling subscribers', () => {
    const store = new LocalStore('test:draft', { codec: text, fallback: '' })
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.set('typing', { quiet: true })
    expect(store.get()).toBe('typing')
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('tells subscribers when it changes, and not when another key does', () => {
    const store = new LocalStore('test:a', { codec: text, fallback: '' })
    const other = new LocalStore('test:b', { codec: text, fallback: '' })
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    other.set('x')
    expect(listener).not.toHaveBeenCalled()
    store.set('y')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })
})

describe('LocalStoreFamily', () => {
  beforeEach(() => localStorage.clear())

  it('keeps one value per id under its prefix', () => {
    const family = new LocalStoreFamily('test:progress:', { codec: text, fallback: '' })
    family.set('python:a', 'one')
    family.set('sql:b', 'two')
    expect(family.get('python:a')).toBe('one')
    expect(family.ids().sort()).toEqual(['python:a', 'sql:b'])
    expect(family.owns('test:progress:python:a')).toBe(true)
    family.remove('sql:b')
    expect(family.has('sql:b')).toBe(false)
  })
})

describe('the stores', () => {
  it('back up learner data and not device settings', () => {
    const backedUp = (key: string) => BACKUP_STORES.some((store) => store.owns(key))
    expect(backedUp(STORES.progress.keyFor('python:first_program'))).toBe(true)
    expect(backedUp(STORES.review.keyFor('python'))).toBe(true)
    expect(backedUp(STORES.supporter.key)).toBe(true)
    expect(backedUp(STORES.sound.key)).toBe(false)
    expect(backedUp(STORES.theme.key)).toBe(false)
    expect(backedUp(STORES.admin.key)).toBe(false)
  })

  it('use different keys and prefixes', () => {
    const names = Object.values(STORES).map((store) => ('key' in store ? store.key : store.prefix))
    expect(new Set(names).size).toBe(names.length)
  })

  it('never own another store\'s entries (no key starts with another store\'s prefix)', () => {
    const stores = Object.values(STORES)
    for (const store of stores) {
      const name = 'key' in store ? store.key : store.prefix
      const owners = stores.filter((other) => other.owns(name + ('prefix' in store ? 'x' : '')))
      expect(owners).toEqual([store])
    }
  })
})
