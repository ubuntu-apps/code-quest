import { beforeEach, describe, expect, it } from 'vitest'
import { SELECTED_LANGUAGE_STORAGE_KEY } from './constants'
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
    expect(localStorage.getItem(SELECTED_LANGUAGE_STORAGE_KEY)).toBe('python')
  })

  it('clears the selected language', () => {
    saveSelectedLanguage('python')
    clearSelectedLanguage()
    expect(loadSelectedLanguage()).toBeNull()
  })
})
