import { SELECTED_LANGUAGE_STORAGE_KEY } from './constants'

export function saveSelectedLanguage(languageId: string): void {
  localStorage.setItem(SELECTED_LANGUAGE_STORAGE_KEY, languageId)
}

export function loadSelectedLanguage(): string | null {
  try {
    const raw = localStorage.getItem(SELECTED_LANGUAGE_STORAGE_KEY)
    return raw?.trim() ? raw : null
  } catch {
    return null
  }
}

export function clearSelectedLanguage(): void {
  localStorage.removeItem(SELECTED_LANGUAGE_STORAGE_KEY)
}
