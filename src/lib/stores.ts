import { flag, jsonText, LocalStore, LocalStoreFamily, text, type Codec } from './localStore'

/**
 * Everything CodeQuest saves on the device, in one place. `backup: true` marks learner data:
 * it goes into a progress backup and a restore replaces it (progressBackup.ts). The rest are
 * this device's settings. Text stores read as '' when nothing is saved.
 */

/** Sound is on unless turned off; "on" isn't stored. */
const soundCodec: Codec<boolean> = { decode: (raw) => raw !== 'off', encode: (on) => (on ? 'on' : 'off'), plainText: true }

export const STORES = {
  // ---- Learner data (in backups) ----
  /** Each lesson's progress: `codequest:progress:<course>:<lesson>` (progressStorage.ts). */
  progress: new LocalStoreFamily('codequest:progress:', { codec: jsonText, fallback: '', backup: true }),
  /** That a course's progress has challenge fingerprints (progressFingerprint.ts). */
  progressFormat: new LocalStoreFamily('codequest:progress-format:', { codec: text, fallback: '', backup: true }),
  /** Quests skipped ahead with "Already know this?": `<course>:<quest>` (testOut.ts). */
  testOut: new LocalStoreFamily('codequest:testout:', { codec: jsonText, fallback: '', backup: true }),
  /** Spaced review per course (reviewStorage.ts). */
  review: new LocalStoreFamily('codequest:review:', { codec: jsonText, fallback: '', backup: true }),
  /** When each certificate was earned (certificateStorage.ts). */
  certificateEarned: new LocalStoreFamily('codequest:certificate-earned:', { codec: text, fallback: '', backup: true }),
  streak: new LocalStore('codequest:streak', { codec: jsonText, fallback: '', backup: true }),
  /** The lesson Continue opens (lastLevel.ts). */
  lastLevel: new LocalStore('codequest:lastLevel', { codec: jsonText, fallback: '', backup: true }),
  selectedLanguage: new LocalStore('codequest:selectedLanguage', { codec: text, fallback: '', backup: true }),
  certificateName: new LocalStore('codequest:certificate-name', { codec: text, fallback: '', backup: true }),
  badges: new LocalStore('codequest:badges', { codec: jsonText, fallback: '', backup: true }),
  /** Supporter status moves with a backup, but an older backup never takes it away. */
  supporter: new LocalStore('codequest:supporter', { codec: jsonText, fallback: '', backup: true, keepOnRestore: true }),

  // ---- This device's settings ----
  sound: new LocalStore('codequest:sound', { codec: soundCodec, fallback: true }),
  /** "light" or "dark"; '' follows the system (theme.ts). */
  theme: new LocalStore('codequest:theme', { codec: text, fallback: '' }),
  admin: new LocalStore('codequest:admin', { codec: flag, fallback: false }),
  installBannerDismissed: new LocalStore('codequest:install-banner-dismissed', { codec: flag, fallback: false }),
  analyticsOff: new LocalStore('codequest:analytics-off', { codec: flag, fallback: false }),
  /** Events counted once per device (analytics.ts). */
  counted: new LocalStoreFamily('codequest:counted:', { codec: flag, fallback: false }),
  /** "Download for offline": what was downloaded, and when (offlineDownload.ts). */
  offline: new LocalStore('codequest:offline', { codec: jsonText, fallback: '' }),
  /** The time a reminder is set for ("19:00"). */
  reminderTime: new LocalStore('codequest:reminder-time', { codec: text, fallback: '' }),
  /** How many finished quests the support prompt has been shown for, per course. */
  supportNudge: new LocalStoreFamily('codequest:support-nudge:', { codec: text, fallback: '' }),
}

/** The stores whose entries go into a progress backup. */
export const BACKUP_STORES = Object.values(STORES).filter((store) => store.backup)
