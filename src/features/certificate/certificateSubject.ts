import type { LoadedSection } from '../curriculum/types'
import { loadProgress } from '../curriculum/progressStorage'
import { hasTestedOut } from '../curriculum/testOut'
import { computeLevelXp } from '../curriculum/helpers'
import type { CourseCompletion } from './courseCompletion'

/** What a certificate is for: a whole course, or one section of it. */
export interface CertificateSubject {
  /** Key for the saved day it was earned: the course id, or "course/section". */
  earnedKey: string
  courseTitle: string
  /** Set for a section certificate. */
  section: { title: string; number: number } | null
  /** The small line under the achievement, e.g. "5 lessons · 120 XP". */
  stats: string
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

export function courseSubject(languageId: string, courseTitle: string, completion: CourseCompletion): CertificateSubject {
  return {
    earnedKey: languageId,
    courseTitle,
    section: null,
    stats: `${plural(completion.sectionsTotal, 'quest')} · ${plural(completion.lessonsTotal, 'stage')} · ${completion.xp} XP`,
  }
}

/** `number` is the section's place in the course, from 1. */
export function sectionSubject(
  languageId: string,
  courseTitle: string,
  section: LoadedSection,
  number: number,
): CertificateSubject {
  const levels = section.file.levels
  const passed = levels.filter((lvl) => loadProgress(languageId, lvl.id).testPassed).length
  const xp = levels.reduce((sum, lvl) => sum + computeLevelXp(languageId, lvl), 0)
  const skippedAhead = passed < levels.length && hasTestedOut(languageId, section.sectionRef.id)
  return {
    earnedKey: `${languageId}/${section.sectionRef.id}`,
    courseTitle,
    section: { title: section.sectionRef.title, number },
    stats: [plural(levels.length, 'lesson'), skippedAhead ? 'skip-ahead gate cleared' : '', xp > 0 ? `${xp} XP` : '']
      .filter(Boolean)
      .join(' · '),
  }
}

/** The course title, or the section title for a section certificate. */
export function subjectTitle(subject: CertificateSubject): string {
  return subject.section ? subject.section.title : subject.courseTitle
}
