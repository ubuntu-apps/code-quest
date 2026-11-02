import { STORES } from '../../../lib/stores'

export function saveSelectedLanguage(languageId: string): void {
  STORES.selectedLanguage.set(languageId)
}

export function loadSelectedLanguage(): string | null {
  return STORES.selectedLanguage.get().trim() || null
}

export function clearSelectedLanguage(): void {
  STORES.selectedLanguage.clear()
}
