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
export const keySchema = z.union([
  z.string(),
  z.object({ text: z.string(), aria: z.string().optional() }),
  z.object({ pair: z.tuple([z.string(), z.string()]), aria: z.string().optional(), label: z.string().optional() }),
  z.object({ special: z.enum(['indent', 'unindent']) }),
])

/** A language's changes to the base key bar (keys.json): keys to add, and keys to remove by what they type. */
const keysSchema = z.object({ add: z.array(keySchema).optional(), remove: z.array(z.string()).optional() })

/** A message about a run that went wrong: what to call it, what happened, and what to try. */
const runMessageSchema = z.object({ title: z.string(), detail: z.string().optional(), tip: z.string().optional() })

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
      /** How a comment is written, for the editor's "comment out" shortcut (Ctrl+/). */
      comments: z
        .object({ line: z.string().optional(), block: z.object({ open: z.string(), close: z.string() }).optional() })
        .optional(),
    }),
    /** The phone key bar: the base keys (keys.json), changed for this language. */
    keys: keysSchema,
    sandbox: z.object({
      defaultCode: z.string(),
      samples: z.array(z.object({ id: z.string(), label: z.string(), code: z.string() })),
      /** For languages that read input: how to spot a call that reads it, and its name. */
      input: z.object({ detect: z.string(), call: z.string() }).optional(),
    }),
    /** How long learner code may run before it is stopped (an endless loop). */
    limits: z.object({ runSeconds: z.number().positive() }),
    messages: z.object({
      /** The status line when a run starts, if it isn't the runtime's "running" status. */
      start: z.string().optional(),
      /** The runtime's statuses (`loading`, `running`, …), as this language words them. */
      status: z.record(z.string(), z.string()).optional(),
      /** Shown when "Download for offline" can't fetch the runtime. */
      runtimeLoadFailed: z.string().optional(),
      /**
       * Runs that went wrong, in this language's words: code that ran past `limits.runSeconds`,
       * a Stop (its tip), and packages that took too long to download or failed to.
       */
      errors: z.object({
        tooLong: runMessageSchema,
        stopped: runMessageSchema.partial().optional(),
        packageTimeout: runMessageSchema.optional(),
        packageError: runMessageSchema.optional(),
      }),
    }),
    offline: z.object({ stepLabel: z.string() }),
    /**
     * How the course generator (scripts/course-kit/CourseGenerator.mjs) writes this
     * language's course. The app doesn't use it.
     */
    course: z
      .object({
        /** What the generator's log calls a lesson: "lessons", "stages", "topics". */
        unit: z.string().optional(),
        /** Shuffle each multiple-choice question's options (in a fixed order per prompt). */
        shuffleChoices: z.boolean().optional(),
        /** Every quiz question must say why its answer is right (default true). */
        explanationRequired: z.boolean().optional(),
        /** Lesson fields copied into the published level, after the quiz (SQL's `database`). */
        levelFields: z.array(z.string()).optional(),
        /** Question fields only the checker uses, left out of the published lessons (R's `check`). */
        omitFromQuestions: z.array(z.string()).optional(),
      })
      .optional(),
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
export type KeysSpec = z.infer<typeof keysSchema>
export type RunMessageSpec = z.infer<typeof runMessageSchema>

/** Checks a language.json, so a mistake in it shows up straight away rather than as odd behaviour. */
export function parseLanguageSpec(json: unknown): LanguageSpec {
  return languageSpecSchema.parse(json)
}

/** A pattern from the JSON as a RegExp. */
export function toRegExp(pattern: PatternSpec): RegExp {
  return typeof pattern === 'string' ? new RegExp(pattern) : new RegExp(pattern.pattern, pattern.flags)
}
