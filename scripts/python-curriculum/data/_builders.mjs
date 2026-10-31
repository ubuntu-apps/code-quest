/**
 * What Python lesson files import. The builders themselves are in ../builders.mjs.
 * Quiz explanations live in data/explanations/, one per question in order.
 */
import { PythonBuilders } from '../builders.mjs'

export const builders = new PythonBuilders()
export const { makeTopic, makeProject, snippet, mc, qShort, qPattern, code, output, task, typedInput } = builders.exports()

/** Tag for Python code: backslashes stay exactly as written (String.raw). */
export const py = String.raw
