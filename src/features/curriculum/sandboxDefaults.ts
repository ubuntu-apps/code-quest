import { DEFAULT_SANDBOX_CODE } from './constants'

export function defaultSandboxForLanguage(languageId: string): string {
  return DEFAULT_SANDBOX_CODE[languageId] ?? DEFAULT_SANDBOX_CODE.python
}
