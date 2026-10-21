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
import { saveFile, savedMessage } from '../../../lib/saveFile'

const BACKUP_TYPE = { description: 'CodeQuest progress backup', mimeType: 'application/json', extension: '.json' }

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

  const handleDownload = async () => {
    const backup = createProgressBackup()
    const levels = countLevels(backup.entries)
    if (levels === 0) {
      setNotice({ text: 'Nothing to back up yet. Complete a challenge or quiz first.' })
      return
    }
    setNotice(null)
    try {
      // Asks where to save where the browser can; otherwise it goes to Downloads.
      const result = await saveFile(backupFileName().replace(/\.json$/, ''), [BACKUP_TYPE], () =>
        new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: 'application/json' }),
      )
      const where = savedMessage(result)
      if (where) setNotice({ text: `${where} It has your progress in ${levels} ${levels === 1 ? 'topic' : 'topics'}.` })
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
        `Replace the progress on this device with the backup (${levels} ${levels === 1 ? 'topic' : 'topics'})? Your current progress here will be overwritten.`,
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
        Progress is saved in this browser only. Download a backup to keep it safe or move it to another device.
      </p>
      {note ? <p className="cq-muted">{note}</p> : null}
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
    </section>
  )
}
