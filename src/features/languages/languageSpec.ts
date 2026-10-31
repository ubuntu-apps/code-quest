import { z } from 'zod'

/**
 * What a language's `language.json` holds: everything about the language that is data rather
 * than code. Labels, flags, the phone key bar, sandbox samples, messages, its words, the
 * patterns that colour its code, and the rules for which lesson blocks get "Try it".
 * The LanguagePack subclass adds only what has to be code: running it.
 */

/** A regular expression, as its source (and flags, if any). */
const patternSchema = z.union([z.string(), z.object({ pattern: z.string(), flags: z.string().optional() })])

/** A phone key: text it types (`"="`, or with a spoken name), a pair it wraps the selection in, or indent. */
const keySchema = z.union([
  z.string(),
  z.object({ text: z.string(), aria: z.string().optional() }),
  z.object({ pair: z.tuple([z.string(), z.string()]), aria: z.string().optional(), label: z.string().optional() }),
  z.object({ special: z.enum(['indent', 'unindent']) }),
])

const tokenKindSchema = z.enum(['keyword', 'builtin', 'constant', 'string', 'number', 'comment', 'name', 'decorator', 'plain'])

/**
 * How a name is coloured: the first rule that fits wins, else it stays plain. A rule can ask
 * for the name to be in a word list, to come right after one of some names (`def greet`),
 * and to be called (followed by `(`).
 */
const nameRuleSchema = z.object({
  kind: tokenKindSchema,
  words: z.string().optional(),
  after: z.array(z.string()).optional(),
  call: z.boolean().optional(),
})

export const languageSpecSchema = z
  .object({
    /** Course id: the folder under public/content, and the key of saved progress. */
    id: z.string(),
    /** The language's name, as shown to learners. */
    label: z.string(),
    /** The validation mode of its challenges in the lesson JSON. */
    testMode: z.templateLiteral([z.string(), '_tests']),
    features: z.object({
      /** Challenges have a Run button that shows the output without checking. */
      runChallenges: z.boolean(),
      /** The sandbox offers an Input box when the code reads input (see sandbox.input). */
      readsInput: z.boolean(),
      /** Output is shown as a table, so it keeps its columns. */
      tableOutput: z.boolean(),
      /** Lessons come with a database: the tables note, and table and column suggestions. */
      database: z.boolean(),
      /** Challenges have setup code that runs before the learner's. */
      setupCode: z.boolean(),
    }),
    /** Named word lists, used by the colouring rules and the editor's suggestions. */
    words: z.record(z.string(), z.array(z.string())),
    highlight: z.object({
      /** Compare names with the word lists ignoring case (SQL). */
      caseInsensitive: z.boolean().optional(),
      /** The kinds of token, tried in order at each position. A pattern must not need its own capture groups. */
      tokens: z.array(z.object({ kind: tokenKindSchema, pattern: z.string() })),
      names: z.array(nameRuleSchema),
    }),
    /** Which lesson blocks are code that can be tried, rather than sample output or a sketch. */
    tryIt: z.object({
      /** Lines starting with this are comments and don't count. */
      commentPrefix: z.string(),
      /** Code if the first counted line matches this… */
      firstLine: patternSchema.optional(),
      /** …or else if any line matches one of these, and none matches a notCodeLine. */
      codeLines: z.array(patternSchema).optional(),
      notCodeLines: z.array(patternSchema).optional(),
      /** "Try it" also loads the earlier blocks, because the sandbox starts empty. */
      buildsOnEarlierBlocks: z.boolean().optional(),
      /** A block that shows an error on purpose matches this, and is left out of the earlier blocks. */
      errorDemo: z.string().optional(),
    }),
    editor: z.object({
      /** Spaces per indent. */
      indentSize: z.number().int().positive(),
      /** The word lists offered as keywords and as functions while typing. */
      suggestKeywords: z.array(z.string()),
      suggestFunctions: z.array(z.string()),
    }),
    /** The phone key bar, slowest-to-reach first. */
    keys: z.array(keySchema),
    sandbox: z.object({
      defaultCode: z.string(),
      samples: z.array(z.object({ id: z.string(), label: z.string(), code: z.string() })),
      /** For languages that read input: how to spot a call that reads it, and its name. */
      input: z.object({ detect: z.string(), call: z.string() }).optional(),
    }),
    messages: z.object({
      /** The status line when a run starts, if it isn't the runtime's "running" status. */
      start: z.string().optional(),
      /** The runtime's statuses (`loading`, `running`, …), as this language words them. */
      status: z.record(z.string(), z.string()).optional(),
      /** Shown when "Download for offline" can't fetch the runtime. */
      runtimeLoadFailed: z.string().optional(),
    }),
    offline: z.object({ stepLabel: z.string() }),
  })
  .superRefine((spec, ctx) => {
    const lists = [
      ...spec.highlight.names.flatMap((rule) => (rule.words ? [rule.words] : [])),
      ...spec.editor.suggestKeywords,
      ...spec.editor.suggestFunctions,
    ]
    for (const list of lists) {
      if (!spec.words[list]) ctx.addIssue({ code: 'custom', message: `${spec.id}: no word list "${list}"` })
    }
  })

export type LanguageSpec = z.infer<typeof languageSpecSchema>
export type PatternSpec = z.infer<typeof patternSchema>
export type KeySpec = z.infer<typeof keySchema>

/** Checks a language.json, so a mistake in it shows up straight away rather than as odd behaviour. */
export function parseLanguageSpec(json: unknown): LanguageSpec {
  return languageSpecSchema.parse(json)
}

/** A pattern from the JSON as a RegExp. */
export function toRegExp(pattern: PatternSpec): RegExp {
  return typeof pattern === 'string' ? new RegExp(pattern) : new RegExp(pattern.pattern, pattern.flags)
}
