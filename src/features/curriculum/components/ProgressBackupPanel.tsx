import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useConfirmDialog } from '../../../components/useConfirmDialog'
import {
  backupFileName,
  countLevels,
  createProgressBackup,
  parseProgressBackup,
  restoreProgressBackup,
} from '../progress/progressBackup'
import {
  allowProgressFile,
  chooseProgressFile,
  getProgressFileState,
  isProgressFileSupported,
  resolveProgressFile,
  stopProgressFile,
  subscribeProgressFile,
} from '../progress/progressFile'
import { getStoragePersistence, type StoragePersistence } from '../progress/storagePersistence'
import { saveFile, savedMessage } from '../../../lib/saveFile'

const BACKUP_TYPE = { description: 'CodeQuest progress backup', mimeType: 'application/json', extension: '.json' }

const PERSISTENCE_NOTE: Record<StoragePersistence, string | null> = {
  persisted: 'This browser will keep your progress unless you clear its site data.',
  'not-persisted':
    'This browser may clear saved data when space runs low or after a long break, so a backup is a good idea.',
  unsupported: null,
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

/** Keeping progress in a file that is saved as you go (Chrome and Edge on computers). */
function ProgressFileControls() {
  const file = useSyncExternalStore(subscribeProgressFile, getProgressFileState, getProgressFileState)
  const [busy, setBusy] = useState(false)
  if (!isProgressFileSupported()) return null

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }
  const name = <strong>{file.fileName}</strong>

  let text: ReactNode
  let buttons: ReactNode
  switch (file.status) {
    case 'on':
      text = (
        <>
          Saving your progress to {name} as you go
          {file.lastSavedAt ? ` (last saved ${timeFormat.format(file.lastSavedAt)})` : ''}. If this browser&apos;s
          data is ever cleared, use <em>Restore from file</em> with that file.
        </>
      )
      buttons = (
        <>
          <button type="button" className="cq-btn" disabled={busy} onClick={() => void run(chooseProgressFile)}>
            Use another file
          </button>
          <button type="button" className="cq-btn" disabled={busy} onClick={() => void run(stopProgressFile)}>
            Stop saving to the file
          </button>
        </>
      )
      break
    case 'needs-permission':
      text = <>Your browser needs your OK to keep saving to {name}.</>
      buttons = (
        <button type="button" className="cq-btn cq-btn--primary" disabled={busy} onClick={() => void run(allowProgressFile)}>
          Allow saving
        </button>
      )
      break
    case 'file-has-more':
      text = (
        <>
          {name} has progress in more stages ({file.fileLevels}) than this browser ({file.localLevels}). Saving is
          paused until you choose.
        </>
      )
      buttons = (
        <>
          <button
            type="button"
            className="cq-btn cq-btn--primary"
            disabled={busy}
            onClick={() => void run(() => resolveProgressFile('restore'))}
          >
            Restore from the file
          </button>
          <button
            type="button"
            className="cq-btn"
            disabled={busy}
            onClick={() => void run(() => resolveProgressFile('keep-browser'))}
          >
            Keep this browser&apos;s
          </button>
        </>
      )
      break
    case 'error':
      text = <>Could not save to {name}. It may have been moved, renamed or deleted.</>
      buttons = (
        <button type="button" className="cq-btn cq-btn--primary" disabled={busy} onClick={() => void run(chooseProgressFile)}>
          Choose the file again
        </button>
      )
      break
    default:
      text = (
        <>
          Choose a file once, and this browser keeps it up to date as you learn. If the browser&apos;s data is ever
          cleared, restore from that file.
        </>
      )
      buttons = (
        <button type="button" className="cq-btn cq-btn--primary" disabled={busy} onClick={() => void run(chooseProgressFile)}>
          Keep progress in a file
        </button>
      )
  }

  return (
    <div className="cq-backup-file">
      <p className="cq-muted" role="status" aria-live="polite">
        {text}
      </p>
      <div className="cq-row">{buttons}</div>
    </div>
  )
}

/** Download / restore a file with the learner's progress, so it survives cleared storage or a new device. */
export function ProgressBackupPanel() {
  const { confirmState, requestConfirm, closeConfirm } = useConfirmDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null)
  const [persistence, setPersistence] = useState<StoragePersistence>('unsupported')

  useEffect(() => {
    let cancelled = false
    void getStoragePersistence().then((state) => {
      if (!cancelled) setPersistence(state)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDownload = async () => {
    const backup = createProgressBackup()
    const levels = countLevels(backup.entries)
    if (levels === 0) {
      setNotice({ text: 'Nothing to back up yet. Complete a challenge or gate first.' })
      return
    }
    setNotice(null)
    try {
      // Asks where to save where the browser can; otherwise it goes to Downloads.
      const result = await saveFile(backupFileName().replace(/\.json$/, ''), [BACKUP_TYPE], () =>
        new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: 'application/json' }),
      )
      const where = savedMessage(result)
      if (where) setNotice({ text: `${where} It has your progress in ${levels} ${levels === 1 ? 'stage' : 'stages'}.` })
    } catch {
      setNotice({ text: 'Could not save the backup. Please try again.', error: true })
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const backup = parseProgressBackup(await file.text())
      const levels = countLevels(backup.entries)
      const ok = await requestConfirm(
        `Replace the progress on this device with the backup (${levels} ${levels === 1 ? 'stage' : 'stages'})? Your current progress here will be overwritten.`,
        { title: 'Restore progress', confirmLabel: 'Yes, restore' },
      )
      if (!ok) return
      restoreProgressBackup(backup)
      setNotice({ text: 'Progress restored.' })
    } catch (error: unknown) {
      setNotice({ text: error instanceof Error ? error.message : 'Could not read that file.', error: true })
    }
  }

  const note = PERSISTENCE_NOTE[persistence]

  return (
    <section className="cq-panel cq-backup-panel">
      <h2 className="cq-subtitle">Back up your progress</h2>
      <p className="cq-muted">
        Progress is saved in this browser. Keep a copy in a file so it is safe if the browser&apos;s data is cleared,
        or to move it to another device.
      </p>
      {note ? <p className="cq-muted">{note}</p> : null}
      <ProgressFileControls />
      <div className="cq-row">
        <button type="button" className="cq-btn" onClick={() => void handleDownload()}>
          Save a backup
        </button>
        <button type="button" className="cq-btn" onClick={() => fileInputRef.current?.click()}>
          Restore from file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            void handleFile(file)
          }}
        />
      </div>
      {notice ? (
        <p className={notice.error ? 'cq-error' : 'cq-muted'} role="status" aria-live="polite">
          {notice.text}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmState !== null}
        message={confirmState?.message ?? ''}
        {...confirmState?.options}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </section>
  )
}
