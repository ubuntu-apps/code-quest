import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import {
  allowProgressFile,
  chooseProgressFile,
  getProgressFileState,
  initProgressFile,
  resolveProgressFile,
  subscribeProgressFile,
} from '../features/curriculum/progressFile'

const stages = (n: number) => `${n} ${n === 1 ? 'stage' : 'stages'}`

/**
 * Speaks up only when the progress file needs the learner: to allow saving again after
 * a browser restart, to restore progress this browser lost, or after a failed save.
 */
export function ProgressFileBanner() {
  const file = useSyncExternalStore(subscribeProgressFile, getProgressFileState, getProgressFileState)
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void initProgressFile()
  }, [])

  const { status, fileName } = file
  if (status !== 'needs-permission' && status !== 'file-has-more' && status !== 'error') return null
  if (dismissed === status) return null

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  let title: string
  let hint: string
  let actions: ReactNode
  if (status === 'needs-permission') {
    title = `Keep saving your progress to ${fileName}?`
    hint = 'Your browser asks again after it restarts. Choose "Allow on every visit" to skip this next time.'
    actions = (
      <button type="button" className="cq-btn cq-btn--primary" disabled={busy} onClick={() => void run(allowProgressFile)}>
        Allow
      </button>
    )
  } else if (status === 'file-has-more') {
    title = `${fileName} has more progress than this browser.`
    hint = `The file has ${stages(file.fileLevels)}; this browser has ${stages(file.localLevels)}. Saving is paused until you choose.`
    actions = (
      <>
        <button
          type="button"
          className="cq-btn cq-btn--primary"
          disabled={busy}
          onClick={() => void run(() => resolveProgressFile('restore'))}
        >
          Restore from the file
        </button>
        <button type="button" className="cq-btn" disabled={busy} onClick={() => void run(() => resolveProgressFile('keep-browser'))}>
          Keep this browser&apos;s
        </button>
      </>
    )
  } else {
    title = `Could not save your progress to ${fileName}.`
    hint = 'The file may have been moved, renamed or deleted. Your progress is still in this browser.'
    actions = (
      <button type="button" className="cq-btn cq-btn--primary" disabled={busy} onClick={() => void run(chooseProgressFile)}>
        Choose the file again
      </button>
    )
  }

  return (
    <section className="cq-install-banner cq-update-banner" aria-labelledby="cq-file-banner-title">
      <div className="cq-install-banner__content">
        <h2 id="cq-file-banner-title" className="cq-install-banner__title">
          {title}
        </h2>
        {actions}
        <p className="cq-install-banner__hint">{hint}</p>
      </div>
      <button
        type="button"
        className="cq-install-banner__close"
        onClick={() => setDismissed(status)}
        aria-label="Not now"
      >
        x
      </button>
    </section>
  )
}
