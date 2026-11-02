import { SETTINGS_LEAD } from '../appText'
import { AppearancePanel } from '../components/AppearancePanel'
import { OfflinePanel } from '../components/OfflinePanel'
import { PrivacyPanel } from '../components/PrivacyPanel'
import { ProgressBackupPanel } from '../components/ProgressBackupPanel'
import { SoundPanel } from '../../sound/SoundPanel'

interface SettingsTabProps {
  baseUrl: string
  /** The courses that can be kept for offline use. */
  courses: { id: string; title: string }[]
  activeCourseId: string | null
}

/** This device's settings: look, sound, offline courses, the progress backup, privacy. */
export function SettingsTab({ baseUrl, courses, activeCourseId }: SettingsTabProps) {
  return (
    <div className="cq-stack cq-about">
      <h1 className="cq-title">Settings</h1>
      <p className="cq-lead">{SETTINGS_LEAD}</p>
      <AppearancePanel />
      <SoundPanel />
      <OfflinePanel baseUrl={baseUrl} courses={courses} activeCourseId={activeCourseId} />
      <ProgressBackupPanel />
      <PrivacyPanel />
    </div>
  )
}
