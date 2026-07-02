import { APP_VERSION } from '../../../version'
import { detectPlatform, INSTALL_GUIDES } from '../../../platform'
import { EditableText, useEditorMode } from '../../editor'

interface AboutTabProps {
  aboutLead: string
  installResetNotice: string | null
  onUpdateLead: (text: string) => void
  onResetInstallPrompt: () => void
}

export function AboutTab({
  aboutLead,
  installResetNotice,
  onUpdateLead,
  onResetInstallPrompt,
}: AboutTabProps) {
  const { isEditingLocal } = useEditorMode()
  const currentPlatform = detectPlatform()

  return (
    <div className="cq-stack cq-about">
      <h1 className="cq-title">About</h1>
      <EditableText as="p" className="cq-lead" value={aboutLead} onChange={onUpdateLead} />
      <section>
        <h2 className="cq-subtitle">Install CodeQuest</h2>
        <p className="cq-muted cq-install-intro">
          Add CodeQuest to your device for quick access and an app-like experience.
        </p>
        {INSTALL_GUIDES.map((guide) => (
          <div
            key={guide.platform}
            className={`cq-install-guide${guide.platform === currentPlatform ? ' cq-install-guide--current' : ''}`}
          >
            <h3 className="cq-install-guide-title">{guide.title}</h3>
            <ol className="cq-install-steps">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
        {!isEditingLocal ? (
          <div className="cq-row cq-about-actions">
            <button type="button" className="cq-btn" onClick={onResetInstallPrompt}>
              Reset install prompt
            </button>
            {installResetNotice ? <span className="cq-muted">{installResetNotice}</span> : null}
          </div>
        ) : null}
      </section>
      <p className="cq-muted">Version {APP_VERSION}</p>
    </div>
  )
}
