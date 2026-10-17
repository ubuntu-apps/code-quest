import { useState } from 'react'
import { setAdminMode, tryEnterAdminMode, useAdminMode } from '../adminMode'

/** About tab: switch admin mode (everything unlocked, for testing) on with a PIN, and off again. */
export function AdminPanel() {
  const admin = useAdminMode()
  const [asking, setAsking] = useState(false)
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = () => {
    if (tryEnterAdminMode(pin)) {
      setAsking(false)
      setPin('')
      setWrong(false)
    } else {
      setWrong(true)
    }
  }

  return (
    <section className="cq-panel cq-admin-panel">
      <h2 className="cq-subtitle">Admin mode</h2>
      <p className="cq-muted">
        {admin
          ? 'On: every section and lesson is unlocked, and challenge answers can be opened without losing XP.'
          : 'For testing: unlocks every section and lesson.'}
      </p>
      {admin ? (
        <div className="cq-row">
          <button type="button" className="cq-btn" onClick={() => setAdminMode(false)}>
            Exit admin mode
          </button>
        </div>
      ) : asking ? (
        <form
          className="cq-row cq-admin-pin"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            className="cq-code-input cq-admin-pin-input"
            aria-label="Admin PIN"
            placeholder="PIN"
            value={pin}
            autoFocus
            onChange={(e) => {
              setPin(e.target.value)
              setWrong(false)
            }}
          />
          <button type="submit" className="cq-btn cq-btn--primary">
            Enter
          </button>
          <button type="button" className="cq-btn" onClick={() => setAsking(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="cq-row">
          <button type="button" className="cq-btn" onClick={() => setAsking(true)}>
            Enter admin mode
          </button>
        </div>
      )}
      {wrong ? (
        <p className="cq-error" role="alert">
          Wrong PIN.
        </p>
      ) : null}
    </section>
  )
}
