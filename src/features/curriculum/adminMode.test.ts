import { afterEach, describe, expect, it } from 'vitest'
import { ADMIN_PIN, isAdminMode, setAdminMode, subscribeAdminMode, tryEnterAdminMode } from './adminMode'

afterEach(() => setAdminMode(false))

describe('admin mode', () => {
  it('stays off with a wrong PIN', () => {
    expect(tryEnterAdminMode('1234')).toBe(false)
    expect(isAdminMode()).toBe(false)
  })

  it('turns on with the PIN, is remembered, and turns off again', () => {
    expect(tryEnterAdminMode(` ${ADMIN_PIN} `)).toBe(true)
    expect(isAdminMode()).toBe(true)
    expect(localStorage.getItem('codequest:admin')).toBe('1')
    setAdminMode(false)
    expect(isAdminMode()).toBe(false)
    expect(localStorage.getItem('codequest:admin')).toBeNull()
  })

  it('tells subscribers when it changes', () => {
    let calls = 0
    const unsubscribe = subscribeAdminMode(() => calls++)
    setAdminMode(true)
    setAdminMode(false)
    unsubscribe()
    setAdminMode(true)
    expect(calls).toBe(2)
  })
})
