import { useId, useRef, useState } from 'react'
import { CalendarPlus, Download, X } from 'lucide-react'
import { downloadBlob } from '../../lib/saveFile'
import { Sheet } from '../../components/Sheet'
import { STORES } from '../../lib/stores'
import { googleCalendarUrl, reminderIcs } from './reminderCalendar'

function loadTime(): string {
  const saved = STORES.reminderTime.get()
  return /^\d{2}:\d{2}$/.test(saved) ? saved : '19:00'
}

/** Sets up a daily study reminder in the learner's calendar app. */
export function ReminderSheet({ appUrl, onClose }: { appUrl: string; onClose: () => void }) {
  const titleId = useId()
  const timeId = useId()
  const timeRef = useRef<HTMLInputElement>(null)
  const [time, setTime] = useState(loadTime)
  const [done, setDone] = useState(false)

  const changeTime = (value: string) => {
    setTime(value)
    setDone(false)
    STORES.reminderTime.set(value)
  }

  const downloadIcs = () => {
    downloadBlob(new Blob([reminderIcs(time, appUrl)], { type: 'text/calendar' }), 'codequest-daily-reminder.ics')
    setDone(true)
  }

  return (
    <Sheet className="cq-share-sheet cq-reminder-sheet" labelledBy={titleId} initialFocus={timeRef} onClose={onClose}>
      <div className="cq-share-sheet-header">
        <h2 id={titleId} className="cq-share-sheet-title">
          Daily reminder
        </h2>
        <button type="button" className="cq-icon-btn" aria-label="Close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <p className="cq-muted cq-share-sheet-lead">
        Add a repeating event to your calendar, and it will remind you each day to keep your streak
        going.
      </p>
      <label className="cq-label" htmlFor={timeId}>
        Remind me at
      </label>
      <input
        ref={timeRef}
        id={timeId}
        type="time"
        className="cq-text-input cq-reminder-time"
        value={time}
        onChange={(e) => changeTime(e.target.value)}
      />
      <div className="cq-reminder-actions">
        <a
          className="cq-btn cq-btn--primary"
          href={googleCalendarUrl(time, appUrl)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDone(true)}
        >
          <CalendarPlus size={16} aria-hidden />
          Google Calendar
        </a>
        <button type="button" className="cq-btn" onClick={downloadIcs}>
          <Download size={16} aria-hidden />
          Other calendar (.ics)
        </button>
      </div>
      <p className="cq-muted cq-reminder-note" role="status">
        {done
          ? 'Save the event in your calendar to finish. To stop the reminders, delete the event there.'
          : 'The .ics file works with Apple Calendar, Outlook and most calendar apps.'}
      </p>
    </Sheet>
  )
}
