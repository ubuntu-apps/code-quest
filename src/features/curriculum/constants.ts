export type TabId = 'learn' | 'progress' | 'about'
export type LearnView = 'languages' | 'sections' | 'levels' | 'level'
export type LevelStep = 'intro' | 'challenges' | 'test'

export const PASS_DEFAULT = 70
export const DEFAULT_SANDBOX_CODE = 'print("Hello from CodeQuest!")'
export const STREAK_STORAGE_KEY = 'codequest:streak'
export const LAST_LEVEL_STORAGE_KEY = 'codequest:lastLevel'
export const CHALLENGE_XP = 10
export const TEST_XP = 50

export const SANDBOX_SNIPPETS: { id: string; label: string; code: string }[] = [
  { id: 'hello', label: 'Hello', code: 'print("Hello, Python!")' },
  {
    id: 'variables',
    label: 'Variables',
    code: 'name = "Alex"\nscore = 7\nprint(name)\nprint(score)',
  },
  { id: 'loop', label: 'Loop', code: 'for i in range(3):\n    print("Step", i)' },
  { id: 'function', label: 'Function', code: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))' },
]
