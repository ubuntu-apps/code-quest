import { useState } from 'react'
import { detectPlatform, INSTALL_GUIDES, type InstallGuide } from '../../../platform'
import { EditableText } from '../../editor'
import { OfflinePanel } from '../components/OfflinePanel'
import { VersionPanel } from '../components/VersionPanel'
import { AdminPanel } from '../components/AdminPanel'
import { useAdminMode } from '../adminMode'
import { ProgressBackupPanel } from '../components/ProgressBackupPanel'
import { PrivacyPanel } from '../components/PrivacyPanel'
import { AppearancePanel } from '../components/AppearancePanel'
import { SoundPanel } from '../../sound/SoundPanel'
import { SupportPanel } from '../../support/SupportPanel'
import { promptInstall, useInstallState } from '../../../lib/installPrompt'
import { FeedbackPanel } from '../../feedback/FeedbackPanel'

interface AboutTabProps {
  aboutLead: string
  onUpdateLead: (text: string) => void
  baseUrl: string
  courses: { id: string; title: string }[]
  activeCourseId: string | null
}

function InstallGuideSteps({ guide, current = false }: { guide: InstallGuide; current?: boolean }) {
  return (
    <div className={`cq-install-guide${current ? ' cq-install-guide--current' : ''}`}>
      <h3 className="cq-install-guide-title">{guide.title}</h3>
      <ol className="cq-install-steps">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  )
}

export function AboutTab({
  aboutLead,
  onUpdateLead,
  baseUrl,
  courses,
  activeCourseId,
}: AboutTabProps) {
  const currentPlatform = detectPlatform()
  const currentGuide = INSTALL_GUIDES.find((g) => g.platform === currentPlatform)
  const { canInstall, installed } = useInstallState()
  const [installNote, setInstallNote] = useState<string | null>(null)
  const isAdmin = useAdminMode()
  // Admin mode is for testing the course, so its panel stays hidden from learners
  // until the version heading is tapped several times (see VersionPanel).
  const [adminRevealed, setAdminRevealed] = useState(false)

  return (
    <div className="cq-stack cq-about">
      <h1 className="cq-title">About</h1>
      <EditableText as="p" className="cq-lead" value={aboutLead} onChange={onUpdateLead} />
      <section>
        <h2 className="cq-subtitle">Install CodeQuest</h2>
        {installed ? (
          <p className="cq-muted cq-install-intro">{"You're using the installed app."}</p>
        ) : (
          <>
            <p className="cq-muted cq-install-intro">
              Add CodeQuest to your device for quick access and an app-like experience.
            </p>
            {canInstall ? (
              <div className="cq-row cq-about-actions">
                <button
                  type="button"
                  className="cq-btn cq-btn--primary"
                  onClick={() =>
                    void promptInstall().then((outcome) =>
                      setInstallNote(
                        outcome === 'dismissed' ? 'No problem. To install it later, follow the steps below.' : null,
                      ),
                    )
                  }
                >
                  Install app
                </button>
              </div>
            ) : null}
            {installNote ? (
              <p className="cq-muted" role="status">
                {installNote}
              </p>
            ) : null}
            {currentGuide ? <InstallGuideSteps guide={currentGuide} current /> : null}
          </>
        )}
        {/* The other devices' steps are folded away; most people only need their own. */}
        <details className="cq-install-others">
          <summary>{installed || !currentGuide ? 'How to install' : 'Other devices'}</summary>
          {INSTALL_GUIDES.filter((g) => installed || g !== currentGuide).map((guide) => (
            <InstallGuideSteps key={guide.platform} guide={guide} />
          ))}
        </details>
      </section>
      <FeedbackPanel installed={installed} />
      <SupportPanel baseUrl={baseUrl} />
      <AppearancePanel />
      <SoundPanel />
      <OfflinePanel baseUrl={baseUrl} courses={courses} activeCourseId={activeCourseId} />
      <ProgressBackupPanel />
      <PrivacyPanel />
      {isAdmin || adminRevealed ? <AdminPanel /> : null}
      <VersionPanel onRevealAdmin={() => setAdminRevealed(true)} />
    </div>
  )
}
