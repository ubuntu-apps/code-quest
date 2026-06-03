const PREFIX = 'codequest:progress:'

export interface LevelProgress {
  challengesCompleted: string[]
  testPassed: boolean
  challengeAnswers?: Record<string, string>
}

export function progressKey(languageId: string, levelId: string): string {
  return `${PREFIX}${languageId}:${levelId}`
}

export function loadProgress(languageId: string, levelId: string): LevelProgress {
  try {
    const raw = localStorage.getItem(progressKey(languageId, levelId))
    if (!raw) return { challengesCompleted: [], testPassed: false, challengeAnswers: {} }
    const parsed = JSON.parse(raw) as LevelProgress
    return {
      challengesCompleted: Array.isArray(parsed.challengesCompleted)
        ? parsed.challengesCompleted
        : [],
      testPassed: Boolean(parsed.testPassed),
      challengeAnswers:
        parsed.challengeAnswers && typeof parsed.challengeAnswers === 'object'
          ? parsed.challengeAnswers
          : {},
    }
  } catch {
    return { challengesCompleted: [], testPassed: false, challengeAnswers: {} }
  }
}

export function saveProgress(languageId: string, levelId: string, p: LevelProgress): void {
  localStorage.setItem(progressKey(languageId, levelId), JSON.stringify(p))
  notifyProgressChanged()
}

let progressVersion = 0
const progressListeners = new Set<() => void>()

export function subscribeProgress(listener: () => void): () => void {
  progressListeners.add(listener)
  return () => progressListeners.delete(listener)
}

export function getProgressSnapshot(): number {
  return progressVersion
}

function notifyProgressChanged(): void {
  progressVersion += 1
  for (const listener of progressListeners) listener()
}
