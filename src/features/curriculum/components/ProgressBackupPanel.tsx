import { useEffect, useRef, useState } from 'react'
import { useEditorConfirm } from '../../editor'
import {
  backupFileName,
  countLevels,
  createProgressBackup,
  parseProgressBackup,
  restoreProgressBackup,
} from '../progressBackup'
import { getStoragePersistence, type StoragePersistence } from '../storagePersistence'

function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const PERSISTENCE_NOTE: Record<StoragePersistence, string | null> = {
  persisted: 'This browser will keep your progress unless you clear its site data.',
  'not-persisted':
    'This browser may clear saved data when space runs low or after a long break, so a backup is a good idea.',
  unsupported: null,
}

/** Download / restore a file with the learner's progress, so it survives cleared storage or a new device. */
export function ProgressBackupPanel() {
  const { requestConfirm } = useEditorConfirm()
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

  const handleDownload = () => {
    const backup = createProgressBackup()
    const levels = countLevels(backup.entries)
    if (levels === 0) {
      setNotice({ text: 'Nothing to back up yet. Complete a challenge or quiz first.' })
      return
    }
    downloadText(backupFileName(), `${JSON.stringify(backup, null, 2)}\n`)
    setNotice({ text: `Backup downloaded (${levels} ${levels === 1 ? 'topic' : 'topics'}).` })
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const backup = parseProgressBackup(await file.text())
      const levels = countLevels(backup.entries)
      const ok = await requestConfirm(
        `Replace the progress on this device with the backup (${levels} ${levels === 1 ? 'topic' : 'topics'})? Your current progress here will be overwritten.`,
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
        Progress is saved in this browser only. Download a backup to keep it safe or move it to another device.
      </p>
      {note ? <p className="cq-muted">{note}</p> : null}
      <div className="cq-row">
        <button type="button" className="cq-btn" onClick={handleDownload}>
          Download backup
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
    </section>
  )
}
