import { z } from 'zod'
import base from './keys.json'
import { keySchema, type KeySpec, type KeysSpec } from './languageSpec'

/** A key of the phone key bar. */
export type CodeKey =
  | { label: string; aria: string; kind: 'tab' | 'untab' }
  | { label: string; aria?: string; kind: 'pair'; open: string; close: string }
  | { label: string; aria?: string; kind: 'text'; text: string }

/** What a key types, which is how a language.json names it in `remove`: `"="`, `"[]"`, `"indent"`. */
export function keyId(key: KeySpec): string {
  if (typeof key === 'string') return key
  if ('special' in key) return key.special
  if ('pair' in key) return key.pair.join('')
  return key.text
}

function toCodeKey(key: KeySpec): CodeKey {
  if (typeof key === 'string') return { label: key, kind: 'text', text: key }
  if ('special' in key) {
    return key.special === 'indent'
      ? { label: '⇥', aria: 'Indent', kind: 'tab' }
      : { label: '⇤', aria: 'Remove indent', kind: 'untab' }
  }
  if ('pair' in key) {
    const [open, close] = key.pair
    return { label: key.label ?? `${open} ${close}`, aria: key.aria, kind: 'pair', open, close }
  }
  return { label: key.text, aria: key.aria, kind: 'text', text: key.text }
}

/** The keys every language starts from (keys.json). */
const BASE_SPECS: readonly KeySpec[] = z.array(keySchema).parse(base.keys)
const BASE_IDS = new Set(BASE_SPECS.map(keyId))

/** The key bar for code that has no language of its own. */
export const BASE_KEYS: readonly CodeKey[] = BASE_SPECS.map(toCodeKey)

/**
 * A language's key bar: the base keys without the ones it removes, with its own keys right
 * after the indent keys (where they are quickest to reach). A key it adds that the base set
 * already has moves up to that place, with the language's spoken name.
 */
export function composeKeys(languageId: string, { add = [], remove = [] }: KeysSpec): CodeKey[] {
  const unknown = remove.filter((id) => !BASE_IDS.has(id))
  if (unknown.length) throw new Error(`${languageId}: keys.remove names keys the base set doesn't have: ${unknown.join(', ')}`)
  const dropped = new Set([...remove, ...add.map(keyId)])
  const kept = BASE_SPECS.filter((key) => !dropped.has(keyId(key)))
  const isIndent = (key: KeySpec) => typeof key === 'object' && 'special' in key
  const indent = kept.filter(isIndent)
  const rest = kept.filter((key) => !isIndent(key))
  return [...indent, ...add, ...rest].map(toCodeKey)
}
