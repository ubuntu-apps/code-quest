import { Component, type ReactNode } from 'react'
import { learnHomePath } from '../features/curriculum/learnPaths'

/**
 * The last line of defence: if a screen crashes while drawing, show a way out instead of a
 * blank page. Saved progress isn't touched, so reloading (or going Home) is safe.
 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  componentDidCatch(error: unknown): void {
    console.error('CodeQuest crashed while drawing the page', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const home = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${learnHomePath()}`
    return (
      <main className="cq-main">
        <div className="cq-panel cq-load-error" role="alert">
          <h1 className="cq-title">Something went wrong</h1>
          <p className="cq-error">
            This page couldn&apos;t be shown. Your progress is safe: it is saved on this device.
          </p>
          <div className="cq-row">
            <button type="button" className="cq-btn cq-btn--primary" onClick={() => window.location.reload()}>
              Reload
            </button>
            <a className="cq-btn" href={home}>
              Go to Home
            </a>
          </div>
        </div>
      </main>
    )
  }
}
