import { LANGUAGE_PACKS } from '../languages'
import type { ValidationMode } from './types'

/** Modes that check a typed answer as text, in any course. */
export const TEXT_VALIDATION_MODES: readonly ValidationMode[] = ['equalsNormalized', 'includesAll', 'regex']

/** Every mode a challenge can use: the text ones, then each language's tests. */
export function validationModes(): ValidationMode[] {
  return [...TEXT_VALIDATION_MODES, ...LANGUAGE_PACKS.map((pack) => pack.testMode)]
}

export function isValidationMode(mode: string): mode is ValidationMode {
  return validationModes().includes(mode as ValidationMode)
}
