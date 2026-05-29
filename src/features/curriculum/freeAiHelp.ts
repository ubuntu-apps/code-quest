import type { FriendlyPythonError } from './pythonErrorHelper'

type FreeAiHelpInput = {
  userCode: string
  error: FriendlyPythonError
  context: 'sandbox' | 'challenge'
}

export type PythonAiHelp = {
  explanation: string
  fix: string
  nextStep: string
  text: string
}

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL ?? 'deepseek-coder:6.7b'

function buildPrompt(input: FreeAiHelpInput): string {
  return [
    'You are a beginner-friendly Python tutor.',
    'Given code and traceback, explain the error in simple words.',
    'Return STRICT JSON with keys: explanation, fix, nextStep.',
    'Keep each value short (1-2 sentences).',
    '',
    `Context: ${input.context}`,
    `Error title: ${input.error.title}`,
    `Error type: ${input.error.errorType ?? 'Unknown'}`,
    `Friendly tip: ${input.error.tip ?? 'N/A'}`,
    `Runtime detail: ${input.error.detail}`,
    '',
    'User code:',
    '```python',
    input.userCode || '# (empty code)',
    '```',
  ].join('\n')
}

function parseJsonHelp(raw: string): { explanation: string; fix: string; nextStep: string } | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Record<'explanation' | 'fix' | 'nextStep', string>>
    if (!parsed.explanation || !parsed.fix || !parsed.nextStep) return null
    return {
      explanation: parsed.explanation,
      fix: parsed.fix,
      nextStep: parsed.nextStep,
    }
  } catch {
    return null
  }
}

function toHelpText(help: Omit<PythonAiHelp, 'text'>): string {
  return `What happened: ${help.explanation}\nHow to fix: ${help.fix}\nNext step: ${help.nextStep}`
}

function fallbackHelp(text: string): PythonAiHelp {
  return {
    explanation: text,
    fix: '',
    nextStep: '',
    text,
  }
}

export async function getFreePythonAiHelp(input: FreeAiHelpInput): Promise<PythonAiHelp> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: buildPrompt(input),
      stream: false,
      format: 'json',
      options: {
        temperature: 0.2,
        num_predict: 250,
      },
    }),
  }).catch(() => null)

  if (!response) {
    return fallbackHelp(
      `AI Help could not reach Ollama at ${OLLAMA_BASE_URL}. Start Ollama and run: \`ollama pull ${OLLAMA_MODEL}\`.`,
    )
  }

  if (!response.ok) {
    const detail = await response.text()
    return fallbackHelp(`AI Help request failed (${response.status}). ${detail || 'Try again in a moment.'}`)
  }

  const data = (await response.json()) as { response?: string }
  const rawText = data.response?.trim()
  if (!rawText) {
    return fallbackHelp('AI Help did not return any text. Please try again.')
  }

  const parsed = parseJsonHelp(rawText)
  if (!parsed) return fallbackHelp(rawText)

  return {
    explanation: parsed.explanation,
    fix: parsed.fix,
    nextStep: parsed.nextStep,
    text: toHelpText(parsed),
  }
}
