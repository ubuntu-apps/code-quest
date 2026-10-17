/** A lesson-loading error with a way to try again. */
export function LoadErrorPanel({ message }: { message: string }) {
  return (
    <div className="cq-panel cq-load-error" role="alert">
      <p className="cq-error">{message}</p>
      <button type="button" className="cq-btn cq-btn--primary" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  )
}
