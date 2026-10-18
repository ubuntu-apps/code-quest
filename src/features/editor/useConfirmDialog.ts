import { useCallback, useState } from 'react'

/**
 * A yes/no question in the app's own dialog: `requestConfirm` resolves to the answer.
 * The provider renders ConfirmDialog from `confirmState` and answers with `closeConfirm`.
 */
export function useConfirmDialog() {
  const [confirmState, setConfirmState] = useState<{
    message: string
    resolve: (value: boolean) => void
  } | null>(null)

  const requestConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve })
    })
  }, [])

  const closeConfirm = useCallback((result: boolean) => {
    setConfirmState((prev) => {
      prev?.resolve(result)
      return null
    })
  }, [])

  return { confirmState, requestConfirm, closeConfirm }
}
