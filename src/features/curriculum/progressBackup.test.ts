import { beforeEach, describe, expect, it } from 'vitest'
import {
  backupFileName,
  createProgressBackup,
  isBackupKey,
  parseProgressBackup,
  restoreProgressBackup,
} from './progressBackup'
import { loadProgress, progressKey, saveProgress } from './progressStorage'

describe('progress backup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('only includes learner data', () => {
    expect(isBackupKey(progressKey('python', 'variables'))).toBe(true)
    expect(isBackupKey('codequest:streak')).toBe(true)
    expect(isBackupKey('codequest:selectedLanguage')).toBe(true)
    expect(isBackupKey('codequest:editor:rootIndex')).toBe(false)
    expect(isBackupKey('codequest:install-banner-dismissed')).toBe(false)
    expect(isBackupKey('other-app:key')).toBe(false)
  })

  it('round-trips progress through a backup file', () => {
    saveProgress('python', 'variables', { challengesCompleted: ['c1'], testPassed: true })
    localStorage.setItem('codequest:streak', JSON.stringify({ lastDate: '2026-10-16', count: 3 }))
    localStorage.setItem('codequest:selectedLanguage', 'python')
    localStorage.setItem('codequest:editor:rootIndex', '{}')

    const text = JSON.stringify(createProgressBackup(localStorage, new Date(2026, 9, 16)))
    localStorage.clear()

    const restored = restoreProgressBackup(parseProgressBackup(text))
    expect(restored).toBe(1)
    expect(loadProgress('python', 'variables').testPassed).toBe(true)
    expect(localStorage.getItem('codequest:selectedLanguage')).toBe('python')
    expect(localStorage.getItem('codequest:editor:rootIndex')).toBeNull()
  })

  it('replaces existing progress instead of merging', () => {
    saveProgress('python', 'old', { challengesCompleted: [], testPassed: true })
    const backup = parseProgressBackup(
      JSON.stringify({ app: 'codequest', kind: 'progress-backup', version: 1, exportedAt: '', entries: {} }),
    )
    restoreProgressBackup(backup)
    expect(localStorage.getItem(progressKey('python', 'old'))).toBeNull()
  })

  it('rejects files that are not backups', () => {
    expect(() => parseProgressBackup('not json')).toThrow(/not valid JSON/)
    expect(() => parseProgressBackup('{"app":"other"}')).toThrow(/not a CodeQuest progress backup/)
    expect(() =>
      parseProgressBackup('{"app":"codequest","kind":"progress-backup","version":2,"entries":{}}'),
    ).toThrow(/newer version/)
  })

  it('drops unknown keys and damaged entries', () => {
    const backup = parseProgressBackup(
      JSON.stringify({
        app: 'codequest',
        kind: 'progress-backup',
        version: 1,
        entries: {
          'codequest:progress:python:a': '{"challengesCompleted":[],"testPassed":true}',
          'codequest:progress:python:b': '{broken',
          'codequest:editor:rootIndex': '{}',
        },
      }),
    )
    expect(Object.keys(backup.entries)).toEqual(['codequest:progress:python:a'])
  })

  it('names files by local date', () => {
    expect(backupFileName(new Date(2026, 9, 6))).toBe('codequest-progress-2026-10-06.json')
  })
})
