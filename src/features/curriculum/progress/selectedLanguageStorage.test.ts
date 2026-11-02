import { beforeEach, describe, expect, it } from 'vitest'
import { STORES } from '../../../lib/stores'
import {
  clearSelectedLanguage,
  loadSelectedLanguage,
  saveSelectedLanguage,
} from './selectedLanguageStorage'

describe('selectedLanguageStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads the selected language', () => {
    saveSelectedLanguage('python')
    expect(loadSelectedLanguage()).toBe('python')
    expect(localStorage.getItem(STORES.selectedLanguage.key)).toBe('python')
  })

  it('clears the selected language', () => {
    saveSelectedLanguage('python')
    clearSelectedLanguage()
    expect(loadSelectedLanguage()).toBeNull()
  })
})
