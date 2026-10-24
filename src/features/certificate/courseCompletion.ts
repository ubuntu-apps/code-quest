import type { LanguageBundle, Level } from '../curriculum/types'
import { loadProgress } from '../curriculum/progressStorage'
import { hasTestedOut } from '../curriculum/testOut'
import { computeLevelXp } from '../curriculum/helpers'

export interface CourseCompletion {
  sectionsTotal: number
  sectionsFinished: number
  lessonsTotal: number
  lessonsPassed: number
  xp: number
  /** Every section finished: the certificate is earned. */
  complete: boolean
  /** The last finished section in course order, for "You finished …". */
  lastFinishedTitle: string | null
}

/** A section is finished when every lesson's quiz is passed, or the learner tested out of it. */
export function isSectionFinished(languageId: string, sectionId: string, levels: Level[]): boolean {
  if (hasTestedOut(languageId, sectionId)) return true
  return levels.length > 0 && levels.every((lvl) => loadProgress(languageId, lvl.id).testPassed)
}

export function courseCompletion(languageId: string, bundle: LanguageBundle): CourseCompletion {
  let sectionsFinished = 0
  let lessonsTotal = 0
  let lessonsPassed = 0
  let xp = 0
  let lastFinishedTitle: string | null = null
  for (const { sectionRef, file } of bundle.sections) {
    const levels = file.levels
    lessonsTotal += levels.length
    for (const lvl of levels) {
      if (loadProgress(languageId, lvl.id).testPassed) lessonsPassed += 1
      xp += computeLevelXp(languageId, lvl)
    }
    if (isSectionFinished(languageId, sectionRef.id, levels)) {
      sectionsFinished += 1
      lastFinishedTitle = sectionRef.title
    }
  }
  // Sections still being written count too, so the course certificate waits for the whole course.
  const sectionsTotal = bundle.sections.length + (bundle.index.upcoming?.length ?? 0)
  return {
    sectionsTotal,
    sectionsFinished,
    lessonsTotal,
    lessonsPassed,
    xp,
    complete: sectionsTotal > 0 && sectionsFinished === sectionsTotal,
    lastFinishedTitle,
  }
}
