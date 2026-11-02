import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  cancelOfflineDownload,
  getOfflineDownloadStatus,
  loadOfflineState,
  startOfflineDownload,
  subscribeOfflineDownloadStatus,
  type OfflineStep,
} from '../offlineDownload'
import { languagePack } from '../../languages'

/** What the panel says while a step runs: the lessons, or a course's runtime. */
function stepLabel(step: OfflineStep): string {
  return step === 'lessons' ? 'Downloading quests…' : (languagePack(step)?.offlineStepLabel ?? 'Downloading…')
}

interface OfflinePanelProps {
  baseUrl: string
  courses: { id: string; title: string }[]
  /** The course the learner is on; its code runner is ticked by default. */
  activeCourseId: string | null
}

function formatMegabytes(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / (1024 * 1024)))} MB`
}

function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

/** Settings tab: download all lessons and code runners so CodeQuest works without internet. */
export function OfflinePanel({ baseUrl, courses, activeCourseId }: OfflinePanelProps) {
  // Courses whose code runs in the browser, so their runtime can be downloaded.
  const runtimeCourses = courses.filter((c) => languagePack(c.id) !== null)
  const online = useOnline()
  const [selected, setSelected] = useState<string[]>(() => {
    const preferred = languagePack(activeCourseId)?.id ?? runtimeCourses[0]?.id
    return preferred ? [preferred] : []
  })
  const status = useSyncExternalStore(
    subscribeOfflineDownloadStatus,
    getOfflineDownloadStatus,
    getOfflineDownloadStatus,
  )
  // Re-read after each download, which saves a new "last downloaded" date.
  const lastState = useMemo(() => (status.kind === 'working' ? null : loadOfflineState()), [status])
  const working = status.kind === 'working'

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleDownload = () => startOfflineDownload({ baseUrl, runtimeCourses: selected })

  return (
    <section className="cq-panel cq-offline-panel">
      <h2 className="cq-subtitle">Use CodeQuest offline</h2>
      <p className="cq-muted">
        Stages you have opened already work offline. Download everything now to keep learning without internet.
      </p>
      {runtimeCourses.length > 0 ? (
        <fieldset className="cq-offline-courses" disabled={working}>
          <legend className="cq-label">Include the code runner for</legend>
          {runtimeCourses.map((course) => (
            <label key={course.id} className="cq-offline-course">
              <input
                type="checkbox"
                checked={selected.includes(course.id)}
                onChange={() => toggle(course.id)}
              />
              {course.title}
            </label>
          ))}
        </fieldset>
      ) : null}
      <p className="cq-muted">The code runners are a large download (tens of megabytes), so Wi-Fi is best.</p>
      <div className="cq-row">
        <button
          type="button"
          className="cq-btn cq-btn--primary"
          onClick={handleDownload}
          disabled={working || !online}
        >
          {working ? 'Downloading…' : 'Download for offline'}
        </button>
        {working ? (
          <button type="button" className="cq-btn" onClick={cancelOfflineDownload}>
            Cancel
          </button>
        ) : null}
      </div>
      <p className={status.kind === 'error' ? 'cq-error' : 'cq-muted'} role="status" aria-live="polite">
        {!online && !working
          ? 'You are offline. Connect to the internet to download.'
          : status.kind === 'working'
            ? stepLabel(status.step)
            : status.kind === 'done'
              ? `Ready to use offline.${status.usedBytes ? ` CodeQuest now uses about ${formatMegabytes(status.usedBytes)} on this device.` : ''}`
              : status.kind === 'error'
                ? status.message
                : status.kind === 'cancelled'
                  ? 'Download cancelled. Anything already downloaded stays on this device.'
                : lastState
                  ? `Last downloaded ${new Date(lastState.downloadedAt).toLocaleDateString()}.`
                  : ''}
      </p>
    </section>
  )
}
