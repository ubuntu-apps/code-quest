/**
 * A daily study reminder as a repeating calendar event. CodeQuest has no server to send
 * notifications, so the learner's own calendar app does the reminding.
 */

const TITLE = 'CodeQuest: keep your streak going'
const DESCRIPTION = 'One challenge or gate keeps your daily streak alive.'
const DURATION_MINUTES = 15

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** "20261018T190000": local (floating) time, so the reminder follows the learner's time zone. */
function localStamp(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`
}

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** The first reminder: today at `time` ("19:00"), or tomorrow if that time has passed. */
export function firstReminder(time: string, now = new Date()): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 0, minutes || 0)
  if (start <= now) start.setDate(start.getDate() + 1)
  return start
}

/** ICS text escaping: backslash, comma, semicolon and line breaks. */
function icsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

/** A calendar file (.ics) for Apple Calendar, Outlook and most other calendar apps. */
export function reminderIcs(time: string, appUrl: string, now = new Date()): string {
  const start = firstReminder(time, now)
  const end = new Date(start.getTime() + DURATION_MINUTES * 60_000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CodeQuest//Daily reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:codequest-daily-${utcStamp(now)}@codequest`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${localStamp(start)}`,
    `DTEND:${localStamp(end)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${icsText(TITLE)}`,
    `DESCRIPTION:${icsText(`${DESCRIPTION}\n${appUrl}`)}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(TITLE)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  // The format wants CRLF line endings.
  return `${lines.join('\r\n')}\r\n`
}

/** Opens Google Calendar's "new event" page with the daily reminder filled in. */
export function googleCalendarUrl(time: string, appUrl: string, now = new Date()): string {
  const start = firstReminder(time, now)
  const end = new Date(start.getTime() + DURATION_MINUTES * 60_000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: TITLE,
    details: `${DESCRIPTION}\n${appUrl}`,
    dates: `${localStamp(start)}/${localStamp(end)}`,
    recur: 'RRULE:FREQ=DAILY',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
