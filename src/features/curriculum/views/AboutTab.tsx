import { APP_VERSION } from '../../../version'
import { AddItemButton, EditableText, ListEditorActions } from '../../editor'

interface AboutTabProps {
  aboutLead: string
  installIntro: string
  installSteps: string[]
  isEditMode: boolean
  installResetNotice: string | null
  onUpdateLead: (text: string) => void
  onUpdateInstallIntro: (text: string) => void
  onUpdateInstallStep: (index: number, text: string) => void
  onMoveInstallStep: (index: number, direction: -1 | 1) => void
  onRemoveInstallStep: (index: number) => void
  onAddInstallStep: () => void
  onResetInstallPrompt: () => void
}

export function AboutTab({
  aboutLead,
  installIntro,
  installSteps,
  isEditMode,
  installResetNotice,
  onUpdateLead,
  onUpdateInstallIntro,
  onUpdateInstallStep,
  onMoveInstallStep,
  onRemoveInstallStep,
  onAddInstallStep,
  onResetInstallPrompt,
}: AboutTabProps) {
  return (
    <div className="cq-stack cq-about">
      <h1 className="cq-title">About</h1>
      <EditableText as="p" className="cq-lead" value={aboutLead} onChange={onUpdateLead} />
      <section>
        <h2 className="cq-subtitle">Install on your phone</h2>
        <EditableText
          as="p"
          className="cq-muted cq-install-intro"
          value={installIntro}
          onChange={onUpdateInstallIntro}
        />
        <ol className="cq-install-steps">
          {installSteps.map((step, i) => (
            <li key={`${i}-${step.slice(0, 20)}`} className="cq-install-step-row">
              <div className="cq-card-row">
                {isEditMode ? (
                  <EditableText
                    value={step.replace(/^\d+\.\s*/, '')}
                    onChange={(text) => onUpdateInstallStep(i, text)}
                  />
                ) : (
                  step.replace(/^\d+\.\s*/, '')
                )}
                <ListEditorActions
                  canMoveUp={i > 0}
                  canMoveDown={i < installSteps.length - 1}
                  onMoveUp={() => onMoveInstallStep(i, -1)}
                  onMoveDown={() => onMoveInstallStep(i, 1)}
                  confirmMessage="Delete this install step?"
                  onDelete={() => onRemoveInstallStep(i)}
                />
              </div>
            </li>
          ))}
        </ol>
        <AddItemButton label="Add install step" onClick={onAddInstallStep} />
        <div className="cq-row cq-about-actions">
          <button type="button" className="cq-btn" onClick={onResetInstallPrompt}>
            Reset install prompt
          </button>
          {installResetNotice ? <span className="cq-muted">{installResetNotice}</span> : null}
        </div>
      </section>
      <p className="cq-muted">Version {APP_VERSION}</p>
    </div>
  )
}
