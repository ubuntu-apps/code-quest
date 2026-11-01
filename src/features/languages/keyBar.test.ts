import { describe, expect, it } from 'vitest'
import { BASE_KEYS, composeKeys, keyId } from './keyBar'
import { LANGUAGE_PACKS, languagePack } from './index'

const labels = (keys: readonly { label: string }[]) => keys.map((key) => key.label)

describe('the phone key bar', () => {
  it('starts every language from the base set', () => {
    for (const pack of LANGUAGE_PACKS) {
      const own = new Set(labels(pack.keys))
      // Every language keeps the indent keys, brackets and the operators.
      for (const label of ['⇥', '⇤', '( )', '" "', '=', '.', ',', '+', '-', '*', '/', '<', '>']) {
        expect(own.has(label), `${pack.id} has ${label}`).toBe(true)
      }
    }
  })

  it('puts the indent keys first, then the language’s own keys', () => {
    expect(labels(languagePack('python')!.keys).slice(0, 4)).toEqual(['⇥', '⇤', ':', '#'])
    expect(labels(languagePack('sql')!.keys).slice(0, 5)).toEqual(['⇥', '⇤', ';', '%', '||'])
    expect(labels(languagePack('r')!.keys).slice(0, 4)).toEqual(['⇥', '⇤', '<-', '$'])
  })

  it('leaves out the keys a language removes', () => {
    expect(labels(languagePack('sql')!.keys)).not.toContain('[ ]')
    expect(labels(languagePack('sql')!.keys)).not.toContain('{ }')
    expect(labels(languagePack('r')!.keys)).not.toContain("' '")
  })

  it('has no key twice', () => {
    for (const pack of [...LANGUAGE_PACKS.map((p) => p.keys), BASE_KEYS]) {
      expect(new Set(labels(pack)).size).toBe(pack.length)
    }
  })

  it('moves a base key the language adds, instead of showing it twice', () => {
    const keys = composeKeys('test', { add: [{ text: '=', aria: 'Assign' }] })
    expect(labels(keys).filter((label) => label === '=')).toHaveLength(1)
    expect(keys[2]).toEqual({ label: '=', aria: 'Assign', kind: 'text', text: '=' })
  })

  it('refuses to remove a key the base set does not have', () => {
    expect(() => composeKeys('test', { remove: ['@'] })).toThrow(/test: keys.remove/)
  })

  it('names keys by what they type', () => {
    expect([keyId('='), keyId({ text: '<-' }), keyId({ pair: ['[', ']'] }), keyId({ special: 'indent' })]).toEqual(['=', '<-', '[]', 'indent'])
  })
})
