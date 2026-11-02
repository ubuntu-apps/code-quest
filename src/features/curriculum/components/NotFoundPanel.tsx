/** A course, quest or stage the address names that doesn't exist (or can't be opened yet). */
export function NotFoundPanel({ what, onHome }: { what: 'course' | 'quest' | 'stage'; onHome: () => void }) {
  return (
    <div className="cq-panel cq-load-error" role="alert">
      <p className="cq-error">
        {what === 'course'
          ? "This course isn't available. It may not be out yet, or the link may be wrong."
          : `This ${what} wasn't found. The link may be out of date.`}
      </p>
      <button type="button" className="cq-btn cq-btn--primary" onClick={onHome}>
        Go to Home
      </button>
    </div>
  )
}
