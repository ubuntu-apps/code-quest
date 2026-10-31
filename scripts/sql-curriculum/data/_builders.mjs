/** What SQL lesson files import. The builders themselves are in ../builders.mjs. */
import { SqlBuilders } from '../builders.mjs'

export const builders = new SqlBuilders()
export const { makeTopic, makeProject, snippet, mc, qShort, qPattern, code, output, query } = builders.exports()

/** Tag for SQL: backslashes stay exactly as written. */
export const sql = String.raw
