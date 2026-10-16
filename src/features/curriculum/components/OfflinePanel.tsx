import { useEffect, useState } from 'react'
import {
  downloadForOffline,
  loadOfflineState,
  storageUsedBytes,
  type OfflineState,
  type OfflineStep,
} from '../offlineDownload'

/** Courses whose code runs in the browser and can be downloaded. */
const RUNTIME_COURSES = new Set(['python', 'r'])

const STEP_LABEL: Record<OfflineStep, string> = {
  lessons: 'Downloading lessons…',
  python: 'Downloading Python and the packages lessons use…',
  r: 'Downloading R…',
}

type Status =
  | { kind: 'idle' }
  | { kind: 'working'; step: OfflineStep }
  | { kind: 'done'; usedBytes: number | null }
  | { kind: 'error'; message: string }

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

/** About tab: download all lessons and code runners so CodeQuest works without internet. */
export function OfflinePanel({ baseUrl, courses, activeCourseId }: OfflinePanelProps) {
  const runtimeCourses = courses.filter((c) => RUNTIME_COURSES.has(c.id))
  const online = useOnline()
  const [selected, setSelected] = useState<string[]>(() => {
    const preferred = activeCourseId && RUNTIME_COURSES.has(activeCourseId) ? activeCourseId : 'python'
    return [preferred]
  })
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [lastState, setLastState] = useState<OfflineState | null>(() => loadOfflineState())
  const working = status.kind === 'working'

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleDownload = async () => {
    try {
      const state = await downloadForOffline({
        baseUrl,
        runtimeCourses: selected,
        onStep: (step) => setStatus({ kind: 'working', step }),
      })
      setLastState(state)
      setStatus({ kind: 'done', usedBytes: await storageUsedBytes() })
    } catch (error: unknown) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The download failed. Try again.',
      })
    }
  }

  return (
    <section className="cq-panel cq-offline-panel">
      <h2 className="cq-subtitle">Use CodeQuest offline</h2>
      <p className="cq-muted">
        Lessons you have opened already work offline. Download everything now to keep learning without internet.
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
          onClick={() => void handleDownload()}
          disabled={working || !online}
        >
          {working ? 'Downloading…' : 'Download for offline'}
        </button>
      </div>
      <p className={status.kind === 'error' ? 'cq-error' : 'cq-muted'} role="status" aria-live="polite">
        {!online && !working
          ? 'You are offline. Connect to the internet to download.'
          : status.kind === 'working'
            ? STEP_LABEL[status.step]
            : status.kind === 'done'
              ? `Ready to use offline.${status.usedBytes ? ` CodeQuest now uses about ${formatMegabytes(status.usedBytes)} on this device.` : ''}`
              : status.kind === 'error'
                ? status.message
                : lastState
                  ? `Last downloaded ${new Date(lastState.downloadedAt).toLocaleDateString()}.`
                  : ''}
      </p>
    </section>
  )
}
