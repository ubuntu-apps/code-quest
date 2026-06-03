import { useCallback, useState } from 'react'
import { getFreePythonAiHelp, type PythonAiHelp } from '../freeAiHelp'
import type { FriendlyPythonError } from '../pythonSandbox'

function aiHelpErrorMessage(err: unknown): PythonAiHelp {
  const message = err instanceof Error ? err.message : 'AI Help failed. Please try again.'
  return { explanation: message, fix: '', nextStep: '', text: message }
}

export function usePythonAiHelp(context: 'sandbox' | 'challenge') {
  const [aiHelp, setAiHelp] = useState<PythonAiHelp | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixCopied, setFixCopied] = useState(false)

  const reset = useCallback(() => {
    setAiHelp(null)
    setLoading(false)
    setFixCopied(false)
  }, [])

  const request = useCallback(
    async (userCode: string, error: FriendlyPythonError) => {
      if (loading) return
      setLoading(true)
      setFixCopied(false)
      try {
        const help = await getFreePythonAiHelp({ userCode, error, context })
        setAiHelp(help)
      } catch (err: unknown) {
        setAiHelp(aiHelpErrorMessage(err))
      } finally {
        setLoading(false)
      }
    },
    [context, loading],
  )

  return { aiHelp, loading, fixCopied, setFixCopied, request, reset }
}
