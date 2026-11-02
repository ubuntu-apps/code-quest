import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { LearnView, LevelStep, TabId } from '../constants'
import {
  learnHomePath,
  learnLanguagePath,
  learnLevelPath,
  learnSectionPath,
  parseAppPath,
  tabPath,
} from '../learnPaths'
import { loadSelectedLanguage, saveSelectedLanguage } from '../progress/selectedLanguageStorage'

function learnViewFromPath(parsed: ReturnType<typeof parseAppPath>): LearnView {
  if (parsed.tab !== 'learn') return 'languages'
  if (!parsed.langId) return 'languages'
  if (!parsed.sectionId) return 'sections'
  if (!parsed.levelId) return 'levels'
  return 'level'
}

export function useLearnRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  // Picking a course on Home saves it without changing the address; this re-reads it.
  const [, setCourseVersion] = useState(0)

  const parsed = useMemo(() => parseAppPath(location.pathname), [location.pathname])
  const tab = parsed.tab
  const learnView = learnViewFromPath(parsed)
  const languageId = parsed.langId
  const sectionId = parsed.sectionId
  const levelId = parsed.levelId
  const levelStep = parsed.step
  const activeLanguageId = languageId ?? loadSelectedLanguage()

  return {
    tab,
    learnView,
    languageId,
    activeLanguageId,
    sectionId,
    levelId,
    levelStep,
    navigate,
    goToTab: (nextTab: TabId) => navigate(tabPath(nextTab, activeLanguageId)),
    goToLanguages: () => navigate(learnHomePath()),
    goToLanguage: (langId: string) => {
      saveSelectedLanguage(langId)
      navigate(learnLanguagePath(langId))
    },
    /** Makes a course the one being learned (Home then shows its progress), staying put. */
    selectCourse: (langId: string) => {
      saveSelectedLanguage(langId)
      setCourseVersion((v) => v + 1)
    },
    goToSection: (langId: string, secId: string) => navigate(learnSectionPath(langId, secId)),
    goToLevel: (langId: string, secId: string, lvlId: string, step: LevelStep = 'intro') =>
      navigate(learnLevelPath(langId, secId, lvlId, step)),
    goToLevelStep: (step: LevelStep) => {
      if (!languageId || !sectionId || !levelId) return
      navigate(learnLevelPath(languageId, sectionId, levelId, step))
    },
    backFromLearn: () => {
      if (learnView === 'level' && languageId && sectionId) {
        navigate(learnSectionPath(languageId, sectionId))
        return
      }
      if (learnView === 'levels' && languageId) {
        navigate(learnLanguagePath(languageId))
        return
      }
      if (learnView === 'sections') {
        navigate(learnHomePath())
      }
    },
  }
}
