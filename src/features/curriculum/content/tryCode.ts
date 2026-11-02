import { languagePack, type FenceBlock } from '../../languages'

export type { FenceBlock } from '../../languages'

/** Whether a block gets a "Try it" button in a lesson for this language (see LanguagePack.canTry). */
export function canTryCode(language: string | null | undefined, block: FenceBlock): boolean {
  return languagePack(language)?.canTry(block) ?? false
}

/** The code "Try it" loads for block `index` (see LanguagePack.codeToTry). */
export function codeToTry(language: string | null | undefined, blocks: FenceBlock[], index: number): string {
  return languagePack(language)?.codeToTry(blocks, index) ?? blocks[index].content
}
