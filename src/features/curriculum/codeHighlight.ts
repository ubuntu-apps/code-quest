import { languagePack, type LanguagePack } from '../languages'

/**
 * Colouring and "Try it" detection for lesson code, by language. The rules are data, in each
 * language's language.json (see src/features/languages); these are shortcuts to them.
 */
export type { Token, TokenKind } from '../languages'

const pack = (id: string): LanguagePack => languagePack(id)!

export const highlightPython = (code: string) => pack('python').highlight(code)
export const highlightSql = (code: string) => pack('sql').highlight(code)
export const highlightR = (code: string) => pack('r').highlight(code)

/** Python code that can be run, rather than sample output, a folder layout or shell commands. */
export const looksLikePython = (code: string) => pack('python').looksLikeCode(code)
/** SQL that can be run (not a result table or a sketch). */
export const looksLikeSql = (code: string) => pack('sql').looksLikeCode(code)
/** R code worth trying: an assignment, a function call or a calculation, not sample output. */
export const looksLikeR = (code: string) => pack('r').looksLikeCode(code)
