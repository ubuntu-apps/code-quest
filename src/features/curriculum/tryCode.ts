import { looksLikePython, looksLikeR, looksLikeSql } from './codeHighlight'

/** A fenced code block from lesson markdown, with its info string (```text …) if it has one. */
export interface FenceBlock {
  content: string
  lang?: string
}

/** Fences marked as sample output never get a "Try it" button. */
const OUTPUT_LANGS = new Set(['text', 'output'])

/** A block that shows an error on purpose says so in a comment, such as `# Run it and read the error`. */
const showsError = (code: string) => /#.*\berror\b/i.test(code)

/** Whether a block gets a "Try it" button in a lesson for this language. */
export function canTryCode(language: string | null | undefined, block: FenceBlock): boolean {
  if (block.lang && OUTPUT_LANGS.has(block.lang)) return false
  if (language === 'python') return looksLikePython(block.content)
  if (language === 'sql') return looksLikeSql(block.content)
  if (language === 'r') return looksLikeR(block.content)
  return false
}

/**
 * The code "Try it" loads for block `index`. An R lesson builds up step by step (the data in one
 * block, then code that uses it), and the R sandbox starts empty, so R gets every earlier block that
 * could be tried, except ones that show an error on purpose, followed by this one. Python and SQL
 * blocks stand alone (SQL has its database already), so they get just their own code.
 */
export function codeToTry(language: string | null | undefined, blocks: FenceBlock[], index: number): string {
  const block = blocks[index]
  if (language !== 'r') return block.content
  const earlier = blocks
    .slice(0, index)
    .filter((b) => canTryCode(language, b) && !showsError(b.content))
    .map((b) => b.content)
  return [...earlier, block.content].join('\n\n')
}
