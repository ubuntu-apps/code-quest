/** What JavaScript stage files import. The builders themselves are in ../builders.mjs. */
import { JavaScriptBuilders, jsstr } from '../builders.mjs'

export const builders = new JavaScriptBuilders()
export const {
  makeTopic, makeProject, snippet, mc, qShort, qPattern, code, output, task,
  prints, uses, avoids, matches, is, near, same, logsWhen,
} = builders.exports()
export { jsstr }

/** A page of MDN's JavaScript guide or reference, which most stages point to. */
export const MDN = (path, label) => ({
  label,
  url: `https://developer.mozilla.org/en-US/docs/${path}`,
  source: 'MDN Web Docs',
})
