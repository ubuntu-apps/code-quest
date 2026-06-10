import { z } from 'zod'
import type {
  LanguageBundle,
  LanguageIndex,
  RootIndex,
  SectionFile,
} from './types'

const runtimeAssertionTestSchema = z.object({
  id: z.string(),
  label: z.string(),
  assertion: z.string(),
})

const validationSchema = z.object({
  mode: z.enum(['regex', 'includesAll', 'equalsNormalized', 'python_tests', 'r_tests']),
  pattern: z.string().optional(),
  needles: z.array(z.string()).optional(),
  expected: z.string().optional(),
  setupCode: z.string().optional(),
  tests: z.array(runtimeAssertionTestSchema).optional(),
})

const mcqChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
})

const mcqQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('mcq'),
  prompt: z.string(),
  choices: z.array(mcqChoiceSchema),
  correctChoiceId: z.string(),
})

const shortTextQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('shortText'),
  prompt: z.string(),
  validation: validationSchema,
})

const testQuestionSchema = z.discriminatedUnion('type', [
  mcqQuestionSchema,
  shortTextQuestionSchema,
])

const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  promptMarkdown: z.string(),
  starterCode: z.string().optional(),
  hints: z.array(z.string()).optional(),
  validation: validationSchema,
})

const levelIntroSchema = z.object({
  title: z.string().optional(),
  bodyMarkdown: z.string(),
  sandboxCode: z.string().optional(),
  readMore: z
    .object({
      label: z.string().optional(),
      url: z.string(),
      source: z.string(),
    })
    .optional(),
})

const sandboxSnippetSchema = z.object({
  id: z.string(),
  label: z.string(),
  code: z.string(),
})

const levelSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['topic', 'project']).optional(),
  projectDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  sandboxSnippets: z.array(sandboxSnippetSchema).optional(),
  intro: levelIntroSchema,
  challenges: z.array(challengeSchema),
  test: z.object({
    passingScorePercent: z.number().optional(),
    questions: z.array(testQuestionSchema),
  }),
})

export const sectionFileSchema = z.object({
  sectionId: z.string(),
  title: z.string().optional(),
  levels: z.array(levelSchema),
})

const sectionRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
})

export const languageIndexSchema = z.object({
  id: z.string(),
  title: z.string(),
  sections: z.array(sectionRefSchema),
})

export const rootIndexSchema = z.object({
  languages: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      path: z.string(),
    }),
  ),
})

const loadedSectionSchema = z.object({
  sectionRef: sectionRefSchema,
  file: sectionFileSchema,
})

export const languageBundleSchema = z.object({
  index: languageIndexSchema,
  sections: z.array(loadedSectionSchema),
})

function formatZodIssues(source: string, error: z.ZodError): string {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
      return `${path}: ${issue.message}`
    })
    .join('; ')
  return `Invalid curriculum JSON (${source}): ${details}`
}

function parseWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  source: string,
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(formatZodIssues(source, result.error))
  }
  return result.data
}

export function parseRootIndex(data: unknown, source: string): RootIndex {
  return parseWithSchema(rootIndexSchema, data, source)
}

export function parseLanguageIndex(data: unknown, source: string): LanguageIndex {
  return parseWithSchema(languageIndexSchema, data, source)
}

export function parseSectionFile(data: unknown, source: string): SectionFile {
  return parseWithSchema(sectionFileSchema, data, source)
}

export function parseLanguageBundle(data: unknown, source: string): LanguageBundle {
  return parseWithSchema(languageBundleSchema, data, source)
}

export function safeParseRootIndex(data: unknown, source: string): RootIndex | null {
  const result = rootIndexSchema.safeParse(data)
  if (!result.success) {
    console.warn(formatZodIssues(source, result.error))
    return null
  }
  return result.data
}

export function safeParseLanguageBundle(data: unknown, source: string): LanguageBundle | null {
  const result = languageBundleSchema.safeParse(data)
  if (!result.success) {
    console.warn(formatZodIssues(source, result.error))
    return null
  }
  return result.data
}

export function safeParseHomeLead(data: unknown, source: string): string | null {
  const result = z.string().safeParse(data)
  if (!result.success) {
    console.warn(formatZodIssues(source, result.error))
    return null
  }
  return result.data
}
