import { useState } from 'react'
import { detectPlatform, INSTALL_GUIDES, type InstallGuide } from '../../../platform'
import { EditableText, useEditorMode } from '../../editor'
import { OfflinePanel } from '../components/OfflinePanel'
import { VersionPanel } from '../components/VersionPanel'
import { AdminPanel } from '../components/AdminPanel'
import { useAdminMode } from '../adminMode'
import { ProgressBackupPanel } from '../components/ProgressBackupPanel'
import { AppearancePanel } from '../components/AppearancePanel'
import { SoundPanel } from '../../sound/SoundPanel'
import { SupportPanel } from '../../support/SupportPanel'
import { FeedbackPanel } from '../../feedback/FeedbackPanel'

interface AboutTabProps {
  aboutLead: string
  installResetNotice: string | null
  onUpdateLead: (text: string) => void
  onResetInstallPrompt: () => void
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

/** Running as the installed app (home-screen or desktop app), not in a browser tab. */
function isInstalledApp(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
}

export function AboutTab({
  aboutLead,
  installResetNotice,
  onUpdateLead,
  onResetInstallPrompt,
  baseUrl,
  courses,
  activeCourseId,
}: AboutTabProps) {
  const { isEditingLocal } = useEditorMode()
  const currentPlatform = detectPlatform()
  const currentGuide = INSTALL_GUIDES.find((g) => g.platform === currentPlatform)
  const [installed] = useState(isInstalledApp)
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
        {!isEditingLocal ? (
          <div className="cq-row cq-about-actions">
            <button type="button" className="cq-btn" onClick={onResetInstallPrompt}>
              Reset install prompt
            </button>
            {installResetNotice ? <span className="cq-muted">{installResetNotice}</span> : null}
          </div>
        ) : null}
      </section>
      <FeedbackPanel installed={installed} />
      <SupportPanel baseUrl={baseUrl} />
      <AppearancePanel />
      <SoundPanel />
      <OfflinePanel baseUrl={baseUrl} courses={courses} activeCourseId={activeCourseId} />
      <ProgressBackupPanel />
      {isAdmin || adminRevealed ? <AdminPanel /> : null}
      <VersionPanel onRevealAdmin={() => setAdminRevealed(true)} />
    </div>
  )
}
